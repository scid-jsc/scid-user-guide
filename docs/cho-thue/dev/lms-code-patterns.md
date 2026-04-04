# LMS Code Patterns & Best Practices

---

## 1. Computed Fields with Dependencies

### Pattern: State Computation from Related Records
```python
# leasing/deal.py
@api.depends('laf_ids', 'laf_ids.state', 'ol_ids', 'ol_ids.state',
             'contract_ids', 'contract_ids.state', 'contract_ids.is_effective',
             'contract_ids.handover_attachment',
             'appendix_ids', 'appendix_ids.state',
             'termination_ids', 'termination_ids.state')
def _compute_deal_state(self):
    for deal in self:
        deal.state = deal.get_deal_status()

def get_deal_status(self):
    """Encapsulate complex state machine logic"""
    self.ensure_one()
    deal = self
    
    # Filter substates from related records
    draft_lafs = deal.laf_ids.filtered(lambda r: r.state == 'draft')
    waiting_lafs = deal.laf_ids.filtered(lambda r: r.state == 'waiting')
    approved_lafs = deal.laf_ids.filtered(lambda r: r.state == 'approved')
    
    # Multi-level state determination
    state = 'draft'
    if draft_lafs and (not waiting_lafs or not approved_lafs):
        state = 'in_deal'
    if waiting_lafs or waiting_contracts or confirm_waiting_contracts:
        state = 'wait_approval'
    # ... more conditions ...
    
    return state
```

**Benefits:**
- Dependencies tracked explicitly
- Complex logic in separate method (readable)
- Stored for fast queries
- Auto-recalculates on related record changes

---

## 2. Dynamic Multi-Level State Machines

### Pattern: Summary State vs. Detailed State
```python
# leasing/contract.py
state = fields.Selection([
    ('draft', 'Mới'),
    ('waiting', 'Chờ duyệt'),
    ('confirm_waiting', 'Chờ xác nhận'),
    ('confirmed', 'Đã xác nhận'),
    ('rejected', 'Từ chối duyệt'),
    ('cancelled', 'Huỷ')
], default='draft', copy=False, string='Tình trạng duyệt')

contract_summary_state = fields.Selection(
    [(...list of all possible states across deal + contract...)],
    compute='_compute_contract_summary_state', store=True
)

@api.depends('state', 'deal_id.state')
def _compute_contract_summary_state(self):
    for record in self:
        state = False
        if record.state != 'confirmed':
            state = record.state
        else:
            state = record.deal_id.state  # Show deal state when confirmed
        record.contract_summary_state = state
```

**Benefits:**
- Preserves contract-level approval state
- Reflects deal-level business state once confirmed
- Searchable via contract_summary_state
- UI shows current relevant state

**Usage:** Reports and views filter on contract_summary_state to show current effective state.

---

## 3. Related Fields with Store=True for Denormalization

### Pattern: Cache Parent State
```python
# leasing/contract.py
deal_state = fields.Selection(related='deal_id.state', store=True)
active_contract_state = fields.Selection(related='active_contract_id.state', store=True)
contract_creation_date = fields.Date(related='deal_id.contract_creation_date', store=True)
```

**Benefits:**
- Enables filtering without joins (e.g., search by deal_state)
- Denormalized for report performance
- Auto-updates when parent changes
- No need for custom triggers

**Caution:** Denormalization increases storage; use sparingly.

---

## 4. Write Overrides for State Transitions

### Pattern: Approval-Triggered Auto-Transition
```python
# leasing/contract.py (via leasing.base)
def action_approve_contract(self):
    """Move to next state in workflow"""
    for contract in self:
        if contract.approval_state == 'approved':
            contract.state = 'confirm_waiting'

def action_confirm_finish(self):
    """Confirm & copy o2m lines to parent deal"""
    self.write({'state': 'confirmed'})
    for contract in self:
        deal_vals = contract._prepare_leasing_base_vals()
        
        # Copy one2many lines
        o2m_lines = {}
        for field in ('rental_income_ids', 'share_income_ids', 'deposit_ids'):
            lines = [
                rec.copy_data({'res_model': 'leasing.deal', 'res_id': contract.deal_id.id})[0]
                for rec in contract[field].sorted(key='id')
            ]
            o2m_lines[field] = [Command.create(line) for line in lines if line]
        
        # Copy approval chain
        approval_vals = [(5, 0)]  # Clear existing
        for approval in self.approval_ids:
            approval_vals.append((0, 0, {
                'sequence': approval.sequence,
                'leasing_ref': 'leasing.deal,%s' % self.deal_id.id,
                'function': approval.function,
                'approver_id': approval.approver_id.id,
                # ... other approval fields ...
            }))
        
        deal_vals['approval_ids'] = approval_vals
        deal_vals.update(o2m_lines)
        contract.deal_id.write(deal_vals)
```

**Benefits:**
- Complex transition logic isolated in method
- Multi-step operations bundled atomically
- Lines copied with proper foreign key updates
- Approval chain migrated to parent

**Pattern:** Use `Command.create()` for one2many operations to handle ORM properly.

---

## 5. Context Bypass Flags for Sync Prevention

### Pattern: Prevent Circular Sync
```python
# scid_ams_sync/controllers/account_move.py
account_move.with_user(SUPERUSER_ID).with_context(bypass_sync=True).write(account_move_vals)

# Then in leasing_contract.py (create hook)
@api.model_create_multi
def create(self, vals_list):
    contracts = super().create(vals_list)
    # Only sync if not coming from AMS
    if not self.env.context.get('bypass_sync'):
        contracts._action_sync_to_ams()
    return contracts
```

**Benefits:**
- Prevents infinite loops when AMS pushes updates back
- Allows emergency manual updates without triggering sync
- Clear intent in code

**Usage Pattern:**
1. AMS POSTs to LMS `/account_move/update_state`
2. Controller calls `.with_context(bypass_sync=True).write()`
3. Model's create/write hook checks context and skips AMS push

---

## 6. Batch Queue Processing with Async Jobs

### Pattern: Chunked Queue Job Dispatch
```python
# scid_ams_sync/models/leasing_contract.py
def _action_sync_to_ams(self):
    self.write({'ams_sync_needed': False})
    batch_queue = int(self.env['ir.config_parameter'].sudo().get_param('batch.queue', 50))
    
    def divide_chunks():
        for i in range(0, len(self), batch_queue):
            yield self[i:i + batch_queue]
    
    for chunk_contracts in divide_chunks():
        chunk_contracts.with_delay()._sync_contracts()

@api.model_create_multi
def create(self, vals_list):
    contracts = super().create(vals_list)
    contracts._action_sync_to_ams()  # Auto-queued
    return contracts

@api.model
def cron_sync_contracts(self):
    """Periodic job to catch missed syncs"""
    contracts = self.sudo().search([
        '|',
        ('last_ams_sync_at', '=', False),
        ('ams_sync_needed', '=', True)
    ])
    
    if not contracts:
        return
    
    contracts._action_sync_to_ams()
    return True
```

**Benefits:**
- Async processing via `with_delay()`
- Batches to prevent queue explosion
- Cron fallback for missed records
- Configurable batch size

**Configuration:** `batch.queue` parameter in settings (default 50)

---

## 7. Schema Validation for API Requests

### Pattern: JSON Schema Validation
```python
# scid_ams_sync/schemas/schemas.py
class SchemaHelper:
    @staticmethod
    def account_move_status_schema():
        return {
            'type': 'object',
            'properties': {
                'account_moves': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'ams_id': {'type': 'integer'},
                            'state': {'type': 'string'},
                            'amount_total': {'type': 'number'},
                            # ... more fields ...
                        },
                        'required': ['ams_id', 'state']
                    }
                }
            },
            'required': ['account_moves']
        }

# scid_ams_sync/controllers/account_move.py
@http.route(['/account_move/update_state'], type='json', auth="api_key", methods=['POST'])
def sync_account_move_state(self):
    try:
        post_data = json.loads(request.httprequest.data)
        SchemaHelper.account_move_status_schema().validate(post_data)
        # ... process validated data ...
    except Exception as e:
        res = {
            'status': 500,
            'error': str(e)
        }
        _logger.error('Error: %s' % e)
    return res
```

**Benefits:**
- Fail-fast validation
- Clear error messages
- Prevents type confusion
- API contract documentation

---

## 8. REST API with API Key Authentication

### Pattern: Custom Auth Method
```python
# scid_ams_sync/models/auth_api_key.py
class AuthApiKey(models.Model):
    _name = "auth.api.key"
    name = fields.Char('Description', required=True)
    origin = fields.Char('Origin', required=True)  # CORS origin
    key = fields.Char('API Key')
    _sql_constraints = [("key_unique", "unique(key)", "Api Key must be unique.")]
    
    @api.model
    def _retrieve_api_key(self, origin, key):
        if not key:
            return False
        api_key = self.search([
            ('origin', '=', origin),
            ('key', '=', key)
        ], limit=1)
        return api_key
    
    def generate_api_key(self):
        self.ensure_one()
        generated_key = secrets.token_urlsafe(16)
        self.write({'key': generated_key})
        return True

# scid_ams_sync/models/ir_http.py (Override Odoo's auth)
class IrHttp(models.AbstractModel):
    _inherit = "ir.http"
    
    @classmethod
    def _auth_method_api_key(cls):
        headers = request.httprequest.headers
        origin = headers.get('Origin')
        api_key = headers.get("X-Api-Key")
        
        if api_key:
            auth_api_key = request.env["auth.api.key"]._retrieve_api_key(origin, api_key)
            if auth_api_key:
                request.auth_api_key = api_key
                request.auth_api_key_id = auth_api_key.id
                return True
        
        _logger.error("Wrong X-Api-Key, access denied")
        raise AccessDenied('API Key không hợp lệ')

# Usage in controller
@http.route(['/account_move/update_state'], type='json', auth="api_key", methods=['POST'])
def sync_account_move_state(self):
    # Auth already validated by _auth_method_api_key
    # request.auth_api_key_id available if needed
    ...
```

**Benefits:**
- Serviceable authentication (no user login needed)
- Origin-based CORS control
- Crypto-secure key generation (secrets.token_urlsafe)
- Explicit error logging

**Headers Expected:**
- `Origin: http://10.1.2.6:8069` (AMS domain)
- `X-Api-Key: <generated_key>`
- `Content-Type: application/json`

---

## 9. Data Transformation Helpers

### Pattern: Dataclass-Based Transform
```python
# scid_ams_sync/utils/ams_sync_helper/base_sync_helper.py
from dataclasses import dataclass
from odoo.api import Environment

@dataclass
class AMSSyncHelper:
    model_env: Environment
    
    def _retrieve_record(self, **kw):
        """Generic record lookup by field values"""
        domain = []
        for key, val in kw.items():
            domain.append((key, '=', val))
        return self.model_env.sudo().search(domain, limit=1)

# scid_ams_sync/utils/ams_sync_helper/account_move_sync_helper.py
class AccountMoveDataTransform(AMSSyncHelper):
    """Transform AMS account_move data to LMS format"""
    
    def __call__(self, ams_data):
        """Make callable: transformer(data) returns transformed list"""
        result = []
        for move_data in ams_data:
            transformed = {
                'ams_id': move_data['id'],
                'state': self._map_state(move_data['status']),
                'amount_total': float(move_data['amount']),
                'partner_id': self._get_partner_id(move_data.get('partner_ams_id')),
                # ... more mappings ...
            }
            result.append(transformed)
        return result
    
    def _map_state(self, ams_state):
        """Enum mapping from AMS to LMS"""
        mapping = {
            'draft': 'draft',
            'posted': 'posted',
            'cancelled': 'cancelled'
        }
        return mapping.get(ams_state, 'draft')
    
    def _get_partner_id(self, partner_ams_id):
        """Lookup local partner by ams_id"""
        partner = self._retrieve_record(ams_id=partner_ams_id)
        return partner.id if partner else False
```

**Benefits:**
- Dataclass provides clean initialization
- `__call__` makes it callable like function
- Inheritance chains helpers
- Separation of concerns (mapping, lookup, transformation)

---

## 10. Connector Helper Pattern

### Pattern: REST Client Wrapper
```python
# scid_ams_sync/utils/ams_connector_helper/base_connector_helper.py
import requests
import logging
_logger = logging.getLogger(__name__)

class BaseConnector:
    """Base class for AMS connectors"""
    
    def __init__(self, origin, host, port, api_key):
        self.origin = origin
        self.host = host
        self.port = port
        self.api_key = api_key
        self.base_url = f'http://{host}:{port}'
        self.headers = {
            'Origin': origin,
            'X-Api-Key': api_key,
            'Content-Type': 'application/json'
        }
    
    def post(self, endpoint, data):
        """POST to AMS endpoint with retry"""
        url = f'{self.base_url}{endpoint}'
        try:
            response = requests.post(url, json=data, headers=self.headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            _logger.error(f'AMS connector error: {e}')
            return {'status': 500, 'error': str(e)}

# scid_ams_sync/utils/ams_connector_helper/contract_connector_helper.py
class ContractConnector(BaseConnector):
    def sync_contracts(self, contracts):
        """POST contracts to AMS"""
        def _sync():
            data = {
                'contracts': [
                    {
                        'code': c.code,
                        'deal_code': c.deal_id.code,
                        'contract_date': str(c.create_date.date()),
                        'party_id': c.partner_id.id,
                        # ... more fields ...
                    }
                    for c in contracts
                ]
            }
            return self.post('/contracts/sync', data)
        return _sync  # Return callable for queue_job
```

**Benefits:**
- Centralized HTTP logic
- Header management (Origin, X-Api-Key)
- Error logging and retry strategy
- Closure pattern enables queue_job delay

---

## 11. Approval Chain Pattern

### Pattern: Sequential Approvers
```python
# leasing/approval.py & base.py
approval_ids = fields.Many2many('leasing.approval', ...)
approval_state = fields.Selection(
    [('waiting', 'Chờ duyệt'), ('approved', 'Đã duyệt'), 
     ('rejected', 'Từ chối'), ('none', 'Không')],
    compute='_compute_approval_state', store=True
)
next_approver_id = fields.Many2one('res.users', compute='_compute_next_approver', store=True)

@api.depends('approval_ids', 'approval_ids.state')
def _compute_next_approver(self):
    for record in self:
        # Find first unapproved approval
        waiting = record.approval_ids.filtered(lambda a: a.state == 'waiting')
        if waiting:
            # Sort by sequence to get next in chain
            sorted_waiting = waiting.sorted(key=lambda a: a.sequence)
            record.next_approver_id = sorted_waiting[0].approver_id.id
        else:
            record.next_approver_id = False

@api.depends('approval_ids.state')
def _compute_approval_state(self):
    for record in self:
        rejected = record.approval_ids.filtered(lambda a: a.state == 'rejected')
        if rejected:
            record.approval_state = 'rejected'
        elif all(a.state == 'approved' for a in record.approval_ids):
            record.approval_state = 'approved'
        elif any(a.state == 'waiting' for a in record.approval_ids):
            record.approval_state = 'waiting'
        else:
            record.approval_state = 'none'
```

**Benefits:**
- Transparent approval visibility
- Next approver auto-identified
- Chain can be any length
- Rejection stops chain

**UI Integration:** Buttons show conditionally:
```python
show_button_approve = fields.Boolean(compute='_compute_show_button')

@api.depends('approval_ids', 'approval_state')
def _compute_show_button(self):
    for record in self:
        # Show if current user is next approver
        record.show_button_approve = (
            record.next_approver_id.id == self.env.user.id
            and record.approval_state == 'waiting'
        )
```

---

## 12. Invoice Generation with MEC

### Pattern: Time-Based Invoice Scheduling
```python
# scid_invoicing/models/invoicing_mec.py
class InvoicingMEC(models.Model):
    invoice_period_monthly = fields.Selection(MONTH_SELECTION)
    invoice_period_annual = fields.Selection(...)
    state = fields.Selection([('draft', ...), ('active', ...), ('closed', ...), ('cancelled', ...)])
    period_start_time = fields.Date(compute='_compute_period_time', store=True)
    period_end_time = fields.Date(compute='_compute_period_time', store=True)
    
    @api.depends('invoice_period_monthly', 'invoice_period_annual')
    def _compute_period_time(self):
        for record in self:
            month_int = int(record.invoice_period_monthly)
            year_int = int(record.invoice_period_annual)
            num_days = calendar.monthrange(year_int, month_int)[1]
            start_date = date(year_int, month_int, 1)
            end_date = date(year_int, month_int, num_days)
            record.period_start_time = start_date
            record.period_end_time = end_date
    
    def action_active(self):
        """Activate this MEC, only one can be active"""
        check_unique_active_invoice = self.search_count([("state", "=", "active")], limit=1)
        if check_unique_active_invoice:
            raise UserError("Không thể kích hoạt 2 kỳ hóa đơn cùng 1 lúc")
        # Deactivate all proforma
        proforma_invoices = self.env["account.move"].search([("is_proforma_invoice", "=", True)])
        for record in proforma_invoices:
            record.is_proforma_invoice = False
        self.write({"state": "active"})
    
    def get_data_mec(self, mec_type):
        """Return period dates for invoice generation"""
        if mec_type == "current_mec":
            return self.period_start_time, self.period_end_time, ...
        elif mec_type == "next_mec":
            date_on_next_month = self.period_end_time + relativedelta(days=1)
            period_start = date_utils.start_of(date_on_next_month, "month")
            period_end = date_utils.end_of(date_on_next_month, "month")
            return period_start, period_end, ...
```

**Cron Usage:**
```xml
<!-- data/ir_cron_generate_invoices_for_contracts.xml -->
<record id="cron_generate_invoices_for_contracts" model="ir.cron">
    <field name="name">Generate Invoices for Contracts</field>
    <field name="model_id" ref="model_leasing_contract"/>
    <field name="state">code</field>
    <field name="code">
        mec = env['invoicing.mec'].search([('state', '=', 'active')], limit=1)
        if mec:
            env['account.move'].generate_invoices_for_mec(mec)
    </field>
    <field name="interval_number">1</field>
    <field name="interval_type">days</field>
    <field name="nextcall">2024-01-01 00:00:00</field>
</record>
```

**Benefits:**
- Single active MEC ensures no period overlap
- Computed dates enable automatic period detection
- Cron invokes invoice generation daily
- Handles proforma → final transition

---

## 13. Document Upload & Preview Wizards

### Pattern: Binary Field in Wizard
```python
# scid_leasing/wizards/upload_documents_wizard.py
class UploadDocumentsWizard(models.TransientModel):
    _name = 'upload.documents.wizard'
    
    res_model = fields.Char('Model')
    res_id = fields.Integer('Record ID')
    document_type = fields.Selection([
        ('signed_attachment', 'Bản cứng đã ký'),
        ('handover_attachment', 'Biên bản bàn giao'),
    ])
    attachment = fields.Binary(string='Tài liệu', store=True)
    attachment_fname = fields.Char(string='Tên file')
    
    def action_save(self):
        self.ensure_one()
        if self.res_model == 'leasing.contract':
            record = self.env['leasing.contract'].browse(self.res_id)
        elif self.res_model == 'leasing.deal':
            record = self.env['leasing.deal'].browse(self.res_id)
        
        # Update the target record
        record.write({
            self.document_type: self.attachment,
            f'{self.document_type}_fname': self.attachment_fname
        })
        return {'type': 'ir.actions.act_window_close'}

# scid_leasing/wizards/document_preview_wizard.py
class DocumentPreviewWizard(models.TransientModel):
    _name = 'document.preview.wizard'
    
    res_model = fields.Char('Model')
    res_id = fields.Integer('Record ID')
    document_type = fields.Selection([...])
    document_preview = fields.Binary(
        string='Preview',
        related=f'...',  # Computed from parent
        readonly=True
    )
```

**Benefits:**
- Non-persistent wizard (TransientModel)
- Binary field for upload
- Save to parent with correct field name
- Preview via related field

---

## 14. Vietnamese Address Hierarchy

### Pattern: Cascading Selection
```python
# vn_address/models/res_partner.py
class ResPartner(models.Model):
    _inherit = 'res.partner'
    
    state_id = fields.Many2one('res.country.state', 'Tỉnh/TP')
    region_id = fields.Many2one('res.country.region', 'Vùng')
    district_id = fields.Many2one('res.country.district', 'Quận/Huyện')
    ward_id = fields.Many2one('res.country.ward', 'Xã/Phường')
    
    @api.onchange('state_id')
    def _onchange_state_id(self):
        self.region_id = False
        self.district_id = False
        self.ward_id = False
    
    @api.onchange('district_id')
    def _onchange_district_id(self):
        self.ward_id = False

# Views use dynamic domain:
# <field name="region_id" domain="[('state_id', '=', state_id)]"/>
# <field name="district_id" domain="[('region_id', '=', region_id)]"/>
# <field name="ward_id" domain="[('district_id', '=', district_id)]"/>
```

**Benefits:**
- Hierarchical data integrity
- Cascading clearance on parent change
- Dynamic domain in views
- No orphaned references

---

## 15. Custom Web Plan Layout

### Pattern: Kanban-like Display
```javascript
// web_plan_layout/static/src/views/
// Custom KanbanView or BoardView rendering for "plan" display

// Usage in leasing/deal views:
// <kanban default_group_by="state">
//   <field name="code"/>
//   <field name="partner_id"/>
//   <field name="location_id"/>
//   <templates>
//     <t t-name="kanban-box">
//       <div class="oe_kanban_global_click">
//         <h4><field name="code"/></h4>
//         <p><field name="partner_id"/></p>
//       </div>
//     </t>
//   </templates>
// </kanban>
```

**Benefits:**
- Visual pipeline overview
- Drag-drop state changes
- Group by state/user/location
- Real-time updates via mail.thread

---

## Summary of Key Patterns

| Pattern | Use Case | Key File(s) |
|---------|----------|-----------|
| Computed + Store | Complex state from relations | `leasing/deal.py` |
| Related + Store | Denormalization | `leasing/contract.py` |
| Context Bypass | Prevent circular sync | `scid_ams_sync/` |
| Batch Queue | Async bulk operations | `scid_ams_sync/models/leasing_contract.py` |
| Schema Validation | API request validation | `scid_ams_sync/schemas/schemas.py` |
| API Key Auth | Service-to-service auth | `scid_ams_sync/models/` |
| Data Transform | ETL helpers | `scid_ams_sync/utils/` |
| Connector Wrapper | REST client abstraction | `scid_ams_sync/utils/ams_connector_helper/` |
| Approval Chain | Multi-step workflows | `leasing/approval.py`, `leasing/base.py` |
| Time-based Scheduling | Invoice periods | `scid_invoicing/models/invoicing_mec.py` |
| Wizard Pattern | Transient multi-step UI | `scid_leasing/wizards/` |
| Cascading Selection | Hierarchical data entry | `vn_address/models/` |
| Custom View | Domain-specific rendering | `web_plan_layout/` |

---

## Performance Considerations

1. **Batch Queue Size:** Default 50 contracts per async job
   - Trade-off: Smaller = more jobs, larger = timeout risk
   - Configurable: `batch.queue` system parameter

2. **Computed Field Storage:** All state fields have `store=True`
   - Enables fast filtering
   - Trades storage for query speed
   - Recalculated on each dependency change

3. **Denormalized Fields:** `deal_state`, `active_contract_state` stored
   - Faster reporting
   - Extra storage
   - Manual sync risk if parent not updated

4. **API Response Batching:**
   - AMS requests include multiple records in array
   - Single transaction per batch
   - Atomic: all succeed or all fail

5. **Cron Fallback:**
   - `cron_sync_contracts()` catches missed queue jobs
   - Periodic resync every 24h recommended
   - Handles `ams_sync_needed=True` flag

---

## Testing Patterns (from test files)

```python
# scid_leasing/tests/test_leasing_deal.py
class TestLeasingDeal(TransactionCase):
    def test_deal_state_progression(self):
        deal = self.env['leasing.deal'].create({...})
        self.assertEqual(deal.state, 'draft')
        
        # Create and approve LAF
        laf = self.env['leasing.laf'].create({'deal_id': deal.id, ...})
        laf.action_approve()
        
        # Deal state should advance
        deal.refresh()
        self.assertIn(deal.state, ['in_deal', 'wait_approval', ...])

    def test_contract_confirmation_copies_approval_chain(self):
        contract = self.env['leasing.contract'].create({...})
        # Add approvals
        self.env['leasing.approval'].create({
            'leasing_ref': f'leasing.contract,{contract.id}',
            'approver_id': ...,
        })
        
        contract.action_approve_contract()
        contract.action_confirm_finish()
        
        # Approvals should be copied to deal
        self.assertEqual(contract.deal_id.approval_ids, contract.approval_ids)
```

**Testing Focus:**
- State transitions (positive & negative cases)
- Multi-step workflows (approval chains)
- Data copying (contract → deal)
- Sync flags (ams_sync_needed behavior)
- Approval visibility (next_approver logic)

