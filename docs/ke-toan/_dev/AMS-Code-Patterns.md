# AMS Code Patterns & Implementation Patterns

## 1. Field Dependencies & Computed Values

### Pattern: Cascading Computed Fields

**File:** `ams_invoicing/models/account_move.py`

```python
@api.depends("journal_id")
def _compute_mall_id(self):
    malls = self.env["mall.mall"].search([])
    for record in self:
        if record.move_type in ["out_invoice", "out_refund"]:
            record.mall_id = malls.filtered(lambda r: r.profit_center_id == record.journal_id)[:1]
        elif record.move_type == "entry":
            record.mall_id = malls.filtered(lambda r: record.journal_id in r.journal_ids)[:1]
        else:
            record.mall_id = False

@api.depends('mall_id', 'mall_id.accountant_id')
def _compute_accountant_id(self):
    for move in self:
        move.accountant_id = move.mall_id.accountant_id.id

@api.depends('accountant_id')
def _compute_mobile_and_email(self):
    for move in self:
        move.mobile = move.accountant_id.mobile
        move.email = move.accountant_id.email
```

**Pattern:** 
- Dependencies form a chain: journal → mall → accountant → mobile/email
- Each depends on previous level
- Avoids circular dependencies through ordering
- Auto-recalculates when any dependency changes

**Benefits:**
- No manual propagation needed
- Data always in sync
- Single source of truth at each level

---

### Pattern: Computed with Inverse

```python
accountant_id = fields.Many2one(
    'res.partner', string='Kế toán', store=True,
    compute="_compute_accountant_id", inverse="_inverse_accountant_id")

@api.depends('mall_id', 'mall_id.accountant_id')
def _compute_accountant_id(self):
    for move in self:
        move.accountant_id = move.mall_id.accountant_id.id

def _inverse_accountant_id(self):
    return True  # Allow manual override
```

**Pattern:**
- Read-only computed value (from mall)
- But allows manual override (inverse returns True)
- Stored to database

**Use Case:** Default from mall, but user can change per invoice

---

### Pattern: Domain Filtering in Dependent Fields

```python
available_vendor_bank_ids = fields.Many2many(
    comodel_name='res.partner.bank',
    compute='_compute_vendor_bank_id',
)
vendor_bank_id = fields.Many2one('res.partner.bank', string="Tài khoản ngân hàng của nhà cung cấp",
    readonly=False, store=True,
    compute='_compute_vendor_bank_id',
    domain="[('id', 'in', available_vendor_bank_ids)]")

@api.depends('payment_type_code', 'journal_type', 'invoice_line_ids.partner_id')
def _compute_vendor_bank_id(self):
    for move in self:
        available_vendor_bank_ids = []
        if move.payment_type_code != 'inbound' \
            and move.journal_type in ('bank', 'cash') \
            and move.invoice_line_ids:
            
            debit_invoice_lines = move.invoice_line_ids.filtered(lambda line: line.debit) \
                               or move.invoice_line_ids[0]
            vendor_ids = debit_invoice_lines.mapped('partner_id')
            available_vendor_bank_ids = vendor_ids.mapped('bank_ids')\
                .filtered(lambda x: x.company_id.id in (False, move.company_id.id))._origin
        
        move.vendor_bank_id = available_vendor_bank_ids[:1]
        move.available_vendor_bank_ids = available_vendor_bank_ids
```

**Pattern:**
- Compute `available_*` list dynamically
- Filter choices in dependent field's domain
- Prevent invalid selections

**Benefits:**
- UI constraint (users can't select invalid options)
- Cascading selection lists

---

## 2. Write Methods with Tracking

### Pattern: Manual Message Posting on Write

**File:** `ams_leasing/models/mall_income_config.py`

```python
def write(self, values):
    income_config_initial_values = defaultdict(dict)
    tracked_fields = self._track_get_fields()
    ref_fields = self.fields_get(tracked_fields)
    
    # Store initial values for tracking
    for record in self:
        for field in ref_fields:
            income_config_initial_values[record][field] = record[field]
    
    # Perform write
    result = super(MallIncomeConfig, self).write(values)
    
    # Post tracking message to parent
    for income_config, initial_values in income_config_initial_values.items():
        dummy, tracking_value_ids = income_config._mail_track(
            ref_fields, initial_values)
        if income_config.mall_id and tracking_value_ids:
            income_config.mall_id.sudo().message_post(
                body=_('Thay đổi loại phí:'),
                tracking_value_ids=tracking_value_ids)
    
    return result
```

**Pattern:**
- Capture initial state before write
- Call `_mail_track()` to generate tracking value records
- Post message to parent (mall) with changes
- Improves parent visibility into child changes

**Benefits:**
- Parent record sees all child modifications
- Change history linked to parent
- Non-intrusive (child just posts message to parent)

---

### Pattern: Unlink with Notification

```python
def unlink(self):
    for rec in self:
        if rec.mall_id:
            rec.mall_id.sudo().message_post(
                body=_('Loại phí %s thuộc tầng %s đã bị xóa bỏ.') % 
                     (rec.income_type_id.name, rec.floor_id.code))
    return super(MallIncomeConfig, self).unlink()
```

**Pattern:**
- Post message before deletion
- Parent (mall) gets deletion notification
- Reference deleted data in message

---

## 3. Action Methods with Override

### Pattern: Action with Conditional Confirmation

**File:** `ams_invoicing/models/account_move.py`

```python
def action_post(self):
    for record in self:
        if self.env.context.get('check_late_interest_value', False):
            if record.payment_start_date and record.new_payment_start_date != record.payment_start_date or \
                record.contract_id.deffered_interest and record.deffered_interest != record.contract_id.deffered_interest:
                record._get_confirm_message_wizard(
                    confirm_message='Ngày bắt đầu thanh toán hoặc Mức lãi suất trả chậm đang khác so với thông tin trên hợp đồng. Bạn có chắc chắn xác nhận hóa đơn không?',
                    method_name="action_post"
                )

        if record.is_proforma_invoice:
            raise UserError(_("Không được phép xác nhận hóa đơn báo trước!"))
    
    res = super(AccountMove, self).action_post()

    # Auto send invoice email after posting
    if not self.env.context.get('skip_auto_send_invoice_email'):
        self._action_send_invoice_email_after_post()

    return res

def _get_confirm_message_wizard(self, confirm_message, method_name):
    return {
        'name': "Xác nhận",
        'view_mode': 'form',
        'view_id': self.env.ref('ams_invoicing.confirm_message_wizard_view_form').id,
        'view_type': 'form',
        'res_model': 'confirm.message.wizard',
        'type': 'ir.actions.act_window',
        'target': 'new',
        'context': {
            'default_confirm_message': confirm_message,
            'default_res_id': self.id,
            'default_model': self._name,
            'default_method_name': method_name,
            'check_late_interest_value': False
        }
    }
```

**Pattern:**
- Check for data inconsistencies before posting
- Open confirmation wizard if issues found
- Wizard context stores method name to retry after confirmation
- Additional post-action logic (email sending)
- Context flags to bypass customization

**Benefits:**
- User-friendly warning dialog
- Allows override with confirmation
- Clean separation of validation & execution

---

## 4. Helper Classes for Complex Calculations

### Pattern: Helper Class with Dataclass

**File:** `ams_odoo_connector/utils/ams_sync_helper/base_sync_helper.py`

```python
from dataclasses import dataclass
from odoo.api import Environment

@dataclass
class AMSSyncHelper:
    model_env: Environment

    def _retrieve_record(self, **kw):
        domain = []
        for key, val in kw.items():
            domain.append((key, '=', val))
        return self.model_env.sudo().search(domain, limit=1)
```

**Pattern:**
- Use dataclass for configuration
- Encapsulate model-specific logic
- Pass environment for database access

**Usage:**

```python
from ..utils.ams_sync_helper.account_move_sync_helper import AccountMoveDataTransform

account_move_data_transformer = AccountMoveDataTransform(
    model_env=request.env['account.move'],
    contract_model_env=request.env['leasing.contract'],
    mall_model_env=request.env['mall.mall'],
    currency_model_env=request.env['res.currency'],
    partner_model_env=request.env['res.partner'],
    income_type_model_env=request.env['income.type'],
    deposit_category_model_env=request.env['deposit.category'],
    account_move_line_model_env=request.env['account.move.line']
)
data_create, data_write = account_move_data_transformer(post_data['account_moves'])
```

**Benefits:**
- Clean separation of concerns
- Reusable across controllers
- Easy to test
- Injection of dependencies

---

## 5. REST API Controller Patterns

### Pattern: API Endpoint with Schema Validation

**File:** `ams_odoo_connector/controllers/account_move.py`

```python
@http.route(['/account_move/sync'], type='json', auth="api_key", methods=['POST'])
def sync_invoices(self):
    try:
        post_data = json.loads(request.httprequest.data)
        
        # Validate JSON schema
        SchemaHelper.account_move_schema().validate(post_data)
        
        # Transform data
        account_move_data_transformer = AccountMoveDataTransform(...)
        data_create, data_write = account_move_data_transformer(post_data['account_moves'])

        # Create/update records
        account_moves = request.env['account.move'].with_user(SUPERUSER_ID).create(data_create)
        for account_move_vals in data_write:
            account_move = self.get_account_move(field='lms_id', value=account_move_vals['lms_id'])
            account_move.with_user(SUPERUSER_ID).write(account_move_vals)
            account_moves |= account_move

        # Build response with IDs
        res = {
            'status': 200,
            'account_moves': []
        }
        for account_move in account_moves:
            vals = {
                'lms_id': account_move.lms_id,
                'ams_id': account_move.id,
                'last_sync_at': account_move.write_date,
                'account_move_lines': [
                    {'lms_id': line.lms_id, 'ams_id': line.id}
                    for line in account_move.invoice_line_ids
                ]
            }
            res['account_moves'].append(vals)

    except Exception as e:
        res = {
            'status': 500,
            'error': str(e)
        }
        _logger.error('Error when trying to sync invoice: %s' % e)

    return res
```

**Pattern:**
- Type: `json` for JSON request/response
- Auth: `api_key` for API authentication
- Validate incoming data with schema
- Transform with helper class
- Use `SUPERUSER_ID` for sync operations
- Return structured response with IDs & timestamps
- Error handling with logging

**Benefits:**
- Schema validation prevents invalid data
- ID mapping for two-way sync
- Exception safety
- Audit trail via logging

---

## 6. Sync Patterns with Conditional Logic

### Pattern: Create vs. Update Decision

**File:** `ams_odoo_connector/controllers/account_move.py`

```python
# In controller
data_create, data_write = account_move_data_transformer(post_data['account_moves'])

# Create new records
account_moves = request.env['account.move'].with_user(SUPERUSER_ID).create(data_create)

# Update existing records
for account_move_vals in data_write:
    account_move = self.get_account_move(field='lms_id', value=account_move_vals['lms_id'])
    account_move.with_user(SUPERUSER_ID).write(account_move_vals)
    account_moves |= account_move
```

**Pattern:**
- Data transformer returns `(create_list, update_list)`
- Create list: new records (no lms_id match)
- Update list: existing records (lms_id matches)
- Separate logic paths for each
- Combine results for response

**Example Transformer Logic:**

```python
# In AccountMoveDataTransform.__call__()
data_create = []
data_write = []

for invoice_data in post_data:
    invoice = model_env.search([('lms_id', '=', invoice_data['lms_id'])], limit=1)
    
    prepared_vals = self._prepare_values(invoice_data)
    
    if invoice:
        prepared_vals['lms_id'] = invoice.lms_id
        data_write.append(prepared_vals)
    else:
        data_create.append(prepared_vals)

return data_create, data_write
```

---

## 7. Mail Template & Notification Patterns

### Pattern: Mail Notification to Multiple Groups

**File:** `scid_leasing_mail_workflow/models/leasing_contract.py`

```python
def _action_send_mail_contract_confirmed(self):
    self.ensure_one()
    mail_template = self.env.ref('scid_leasing_mail_workflow.leasing_contract_confirmed_mail_template')
    
    groups = self.get_groups_by_xml_ids([
        'scid_leasing.group_mall_manager',
        'scid_leasing.group_scid_leasing_team',
        'scid_leasing.group_mall_leasing_team',
        'account.group_account_manager'
    ])
    excluded_groups = self.env.ref('scid_leasing.group_lms_administrator')
    
    self._send_email_notification(
        groups=groups, 
        excluded_groups=excluded_groups, 
        template_id=mail_template, 
        added_users=self.user_id
    )
```

**Pattern:**
- Get groups by XML ID
- Specify excluded groups
- Pass additional individual users
- Delegate to mixin method `_send_email_notification()`

**Mixin Implementation:**

```python
# In ScidMailNotificationMixin
def _send_email_notification(self, groups=None, template_id=None, 
                            excluded_groups=None, added_users=None, multi=False):
    # Build recipient list from groups
    # Exclude specified groups
    # Add individual users
    # Send template to each recipient
    pass

def get_groups_by_xml_ids(self, xml_ids=[]):
    groups = self.env['ir.model.groups']
    for xml_id in xml_ids:
        groups |= self.env.ref(xml_id)
    return groups
```

**Benefits:**
- Reusable mixin across all leasing models
- Flexible group inclusion/exclusion
- Single method for all notification scenarios

---

## 8. Query Patterns for Reports

### Pattern: Complex SQL with CTEs

**File:** `ams_invoicing/models/account_move.py`

```python
@api.model
def get_deposit_amount(self, partner_id=None, mall_id=None, date_to=None, contract_id=None):
    date_to_str = date_to.strftime(DEFAULT_SERVER_DATE_FORMAT)

    def _deposit_account():
        """Get all accounts used for deposits"""
        return f"""
            SELECT account.id AS id
            FROM account_account AS account
            JOIN account_move_line AS aml ON aml.account_id = account.id
            JOIN account_move AS move ON move.id = aml.move_id
            WHERE move.is_deposit_entry IS TRUE
            AND aml.date <= '{date_to_str}'
            AND move.state != 'cancel'
            AND aml.credit > 0
            AND aml.partner_id = {partner_id}
            AND move.mall_id = {mall_id}
            GROUP BY account.id
        """

    def _deposit_aml():
        """Get deposit credits and usages"""
        where_cls = f"""
            aml.date <= '{date_to_str}'
            AND aml.partner_id = {partner_id}
            AND move.mall_id = {mall_id}
        """
        if contract_id:
            contract = self.env['leasing.contract'].browse(contract_id)
            where_cls += f"AND move.deposit_contract_code = '{contract.code}'"

        return f"""
            WITH deposit_account AS ({_deposit_account()})
            SELECT
                aml.partner_id AS partner_id,
                move.mall_id AS mall_id,
                SUM(CASE WHEN move.state != 'cancel' AND move.is_deposit_entry IS TRUE 
                         THEN aml.credit ELSE 0 END) AS credit_amount,
                SUM(CASE WHEN move.state = 'posted' AND aml.debit > 0 
                         THEN aml.debit ELSE 0 END) AS debit_amount
            FROM account_move_line AS aml
            JOIN account_move AS move ON move.id = aml.move_id
            JOIN deposit_account AS deposit_account ON deposit_account.id = aml.account_id
            WHERE {where_cls}
            GROUP BY aml.partner_id, move.mall_id
        """
    
    query = f"""
        SELECT
            deposit_aml.partner_id AS partner_id,
            deposit_aml.mall_id AS mall_id,
            COALESCE(SUM(deposit_aml.credit_amount), 0) - 
            COALESCE(SUM(deposit_aml.debit_amount), 0) AS deposit_amount
        FROM ({_deposit_aml()}) AS deposit_aml
        GROUP BY deposit_aml.partner_id, deposit_aml.mall_id
    """
    
    self._cr.execute(query)
    data = self._cr.dictfetchone()
    return data and data['deposit_amount'] or 0
```

**Pattern:**
- Use CTEs (WITH clause) for reusable subqueries
- Nested Python functions for composability
- Parameterized queries (f-strings, but better: use parameterization!)
- CASE statements for conditional aggregation
- Safe fallback with COALESCE

**⚠️ SECURITY NOTE:** This code uses f-strings which are vulnerable to SQL injection. Should use parameterized queries:

```python
self._cr.execute("""
    SELECT ... WHERE partner_id = %s AND mall_id = %s
""", (partner_id, mall_id))
```

---

## 9. Cron Job & Scheduled Tasks

### Pattern: Cron Task for Batch Operations

**File:** `scid_leasing_mail_workflow/models/leasing_contract.py`

```python
def _run_reminder(self, days=0, months=6):
    contracts = self.sudo()._get_rental_end_date_contracts(days=days, months=months)
    mail_template = self.env.ref('scid_leasing_mail_workflow.leasing_contract_reminder_mail_template')
    groups = self.get_groups_by_xml_ids([
        'scid_leasing.group_mall_manager',
        'scid_leasing.group_scid_leasing_team'
    ])
    
    # Group contracts by user to send multi-recipient emails
    for user, group in groupby(sorted(contracts, key=lambda r: r.user_id.id), 
                               key=lambda r: r.user_id):
        grouped_records = self.browse().concat(*group)
        grouped_records.sudo().with_context(
            days=days, 
            months=months
        )._send_email_notification(
            groups=groups, 
            template_id=mail_template, 
            multi=True, 
            added_users=user
        )

def _get_rental_end_date_contracts(self, mall_id=None, days=0, months=6, 
                                   email_retreived=False, user_id=None):
    today = fields.Date.today()
    domain = [
        ('rental_end_date', '>=', today),
        ('rental_end_date', '<=', today + relativedelta(days=days, months=months)),
        ('deal_state', 'not in', ['termination_done']),
        ('state', 'not in', ['rejected', 'cancelled']),
        ('is_reminder_sent', '=', False)
    ]
    if mall_id:
        domain += [('mall_id', '=', mall_id)]
    if user_id:
        domain += [('user_id', '=', user_id)]
    
    contracts = self.sudo().search(domain)
    if email_retreived:
        contracts.action_set_is_reminder_sent()
    return contracts
```

**Data XML for Cron:**

```xml
<!-- data/cron_view.xml -->
<data>
    <record id="leasing_contract_reminder_cron" model="ir.cron">
        <field name="name">Leasing Contract Renewal Reminder</field>
        <field name="model_id" ref="model_leasing_contract"/>
        <field name="state">code</field>
        <field name="code">
            model._run_reminder(months=6)
        </field>
        <field name="interval_number">1</field>
        <field name="interval_type">months</field>
        <field name="nextcall">2026-04-05 02:00:00</field>
    </record>
</data>
```

**Pattern:**
- Find records matching domain
- Group by user for batch notification
- Use `itertools.groupby()` for grouping
- Call cron method via ir.cron XML record
- Mark as processed to prevent duplicates (is_reminder_sent)

**Benefits:**
- Runs in background
- Prevents duplicate emails
- Batch processing for efficiency

---

## 10. Context Flags for Conditional Behavior

### Pattern: Context-Based Feature Toggle

**File:** `ams_invoicing/models/account_move.py`

```python
@api.depends('needed_terms')
def _compute_invoice_date_due(self):
    if self.env.context.get('bypass_customization', False):
        # Use default Odoo logic
        super(AccountMove, self)._compute_invoice_date_due()
    else:
        # Use custom logic
        for move in self:
            move.invoice_date_due = move.needed_terms and max(
                (k['date_maturity'] for k in move.needed_terms.keys() if k),
                default=False,
            ) or move.invoice_date_due

def action_post(self):
    for record in self:
        if self.env.context.get('check_late_interest_value', False):
            # Validation logic
            ...
    
    res = super(AccountMove, self).action_post()

    if not self.env.context.get('skip_auto_send_invoice_email'):
        self._action_send_invoice_email_after_post()

    return res
```

**Usage:**

```python
# Skip custom behavior
account_move.with_context(bypass_customization=True).action_post()

# Skip email
account_move.with_context(skip_auto_send_invoice_email=True).action_post()

# Enable validation
account_move.with_context(check_late_interest_value=True).action_post()
```

**Pattern:**
- Use `self.env.context.get(flag, default)` to check
- Pass context via `with_context(key=value)`
- Allows flexibility without code duplication

**Benefits:**
- Conditional behavior without subclassing
- Clean API for callers
- Safe defaults (False)

---

## 11. Constraints & Validation

### Pattern: SQL Constraint with @api.constrains

**File:** `ams_leasing/models/mall_mall.py`

```python
_sql_constraints = [
    ('mall_name_uniq', 'unique(name)', 'Mall đã tồn tại !'),
    ('mall_code_uniq', 'unique(code)', 'Code đã tồn tại !'),
]

@api.constrains('code')
def constrains_mall_code(self):
    for mall in self:
        if len(mall.code) != 5:
            raise UserError('Mã mall cần có 5 ký tự!')
```

**Pattern:**
- SQL constraints in `_sql_constraints`
- API constraints via `@api.constrains()` decorator
- Raise `UserError` for user-facing messages
- One constraint per line (tuple)

**Constraint Types:**
- **Unique:** `unique(field1, field2, ...)`
- **Check:** `check(condition)`
- **Foreign Key:** Implicit via Many2one

---

## 12. Inverse Operations (Two-Way Fields)

**File:** `ams_invoicing/models/account_move.py`

```python
mobile = fields.Char(
    'Số điện thoại', 
    compute="_compute_mobile_and_email",
    inverse="_inverse_mobile_and_email", 
    store=True
)
email = fields.Char(
    'Email', 
    compute="_compute_mobile_and_email",
    inverse="_inverse_mobile_and_email", 
    store=True
)

@api.depends('accountant_id')
def _compute_mobile_and_email(self):
    for move in self:
        move.mobile = move.accountant_id.mobile
        move.email = move.accountant_id.email

def _inverse_mobile_and_email(self):
    return True  # Allow manual edit
```

**Pattern:**
- Computed from parent (accountant)
- Inverse returns True to allow override
- Stored for backward compatibility
- User can edit without affecting accountant

**Use Case:**
- Read-only defaults that can be overridden
- Avoid circular updates

---

## Summary of Key Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| Cascading Computed | account_move.py | Auto-fill related data |
| Write Tracking | mall_income_config.py | Notify parent on changes |
| Action Override | account_move.py | Add validation/side effects |
| Helper Classes | ams_sync_helper/ | Encapsulate business logic |
| API Endpoints | controllers/ | REST API with schema validation |
| Create vs Update | account_move_sync_helper.py | Conditional sync logic |
| Mail Notifications | leasing_contract.py | Email with group routing |
| SQL Queries | account_move.py | Complex reporting |
| Cron Jobs | data/cron_view.xml | Scheduled batch operations |
| Context Flags | action_post() | Feature toggles |
| Constraints | mall_mall.py | Data validation |
| Inverse Fields | account_move.py | Two-way computed fields |

---

## Code Quality Observations

### Strengths
1. ✅ Heavy use of computed fields reduces manual work
2. ✅ Consistent naming conventions (camel case for Python, underscores for fields)
3. ✅ Good separation of concerns (helpers, controllers, models)
4. ✅ Extensive tracking & audit trail via mail.thread
5. ✅ Type hints in some places (dataclass)

### Areas for Improvement
1. ⚠️ SQL injection risk in `get_deposit_amount()` — use parameterized queries
2. ⚠️ No input validation before SQL queries
3. ⚠️ Large methods (action_post 100+ lines) — consider breaking up
4. ⚠️ Limited error handling in controllers (generic try/except)
5. ⚠️ No type hints in most methods
6. ⚠️ Some methods are 200+ lines (low cohesion)
7. ⚠️ Hardcoded XML IDs in code (brittle references)

### Recommendations
1. Use `parameterized queries` for all SQL
2. Add `type hints` throughout
3. Break large methods into smaller, focused functions
4. Add docstrings explaining complex business logic
5. Use `logging` more extensively for debugging
6. Consider `async webhooks` for LMS sync instead of cron
7. Add `API versioning` for backward compatibility
8. Implement `rate limiting` on REST endpoints
