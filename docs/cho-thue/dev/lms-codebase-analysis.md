# LMS Server Codebase Analysis
**Server:** 10.1.2.5 (Ubuntu)  
**System:** Odoo 16.0 Community Edition  
**Database:** LMS_Production  
**Custom Modules Path:** `/opt/odoo/custom/custom/`  
**Total Python Files:** 165

---

## Module Overview

| Module | Version | Purpose | Key Dependencies |
|--------|---------|---------|------------------|
| **scid_leasing** | 16.0.2.0.0 | Core leasing domain model: deals, contracts, locations, malls, approvals, terminations | base, base_vat, web_plan_layout, contacts, product, vn_address, account, queue_job, web_widget_open_tab |
| **scid_ams_sync** | 16.0.1.0.0 | Bidirectional sync with AMS server (accounting, contracts, partners, banks) via REST API with API Key auth | scid_leasing, scid_invoicing, queue_job |
| **scid_invoicing** | 1.0 | Invoice generation (MEC - Monthly Equivalent Cycles), income types, TOS, utility calculations | scid_leasing |
| **scid_leasing_mail_workflow** | 16.0.1.0.0 | Email notifications for leasing deal state changes (approval, rejection, termination) | scid_leasing, scid_mail_notification_mixin |
| **scid_mail_notification_mixin** | 16.0.1.0.0 | Reusable mixin for mail notification patterns | mail |
| **vn_address** | 1.0 | Vietnamese hierarchical address: country > state > region > district > ward | base |
| **web_plan_layout** | 16.0.1.0.0 | Custom web UI layout for plan display (Kanban-like views) | base_setup, web |

---

## Core Domain Models (scid_leasing)

### Leasing Deal (`leasing.deal`)
**Purpose:** Central entity representing a potential or active lease agreement  
**Inherits:** `leasing.base`, `mail.thread`, `mail.activity.mixin`  
**Key Fields:**
- `code` (Char) — Unique deal identifier
- `state` (Selection) — Workflow states:
  - draft, in_deal, wait_approval, on_agreement, wait_transfer, construction, leasing
  - appendix_approval, termination_waiting, termination_to_approval, termination_to_confirm, termination_done, cancelled
- `laf_ids` (One2many) → `leasing.laf` — Leasing Approval Forms (LAF)
- `ol_ids` (One2many) → `leasing.ol` — Operational Leases
- `contract_ids` (One2many) → `leasing.contract` — Active contracts
- `appendix_ids` (One2many) → `leasing.appendix` — Contract amendments
- `termination_ids` (One2many) → `leasing.termination` — End-of-lease agreements
- `active_contract_id` (Many2one) — Currently effective contract (computed)
- `approval_ids` (Many2many) → `leasing.approval` — Approval workflow chain
- `approval_state` (Selection) — waiting | approved | rejected | none
- `user_id` (Many2one) → `res.users` — Sales agent responsible
- `partner_id` (Many2one) → `res.partner` — Tenant (business customer)

**Key Computed Fields:**
- `_compute_deal_state()` — State logic based on LAF/OL/Contract/Appendix/Termination substates
- `_compute_active_contract()` — Filters contracts with `is_effective=True` AND `state='confirmed'`
- `_compute_current_laf()` — Next LAF by rental_start_date

**Key Methods:**
- `get_deal_status()` — Comprehensive state machine logic (60+ lines)
  - Checks draft/waiting/approved LAF counts
  - Checks contract confirmations and handover docs
  - Checks appendix and termination states
  - Returns single authoritative state string

---

### Leasing Contract (`leasing.contract`)
**Purpose:** Signed agreement for a lease between SCID and tenant  
**Inherits:** `leasing.base`  
**Key Fields:**
- `code` (Char) — Contract code, required
- `deal_id` (Many2one) → `leasing.deal` — Parent deal
- `laf_id`, `ol_id` (Many2one) — Related approval/operational lease
- `state` (Selection) — draft | waiting | confirm_waiting | confirmed | rejected | cancelled
- `effective_date` (Date) — Contract activation date, required
- `is_effective` (Boolean) — Whether contract is currently active
- `appendix_ids`, `termination_ids` (One2many) — Amendments and terminations
- `signed_attachment` (Binary) — Signed contract PDF (enforced for confirmation)
- `rental_start_date`, `rental_end_date` (Date) — Lease period

**AMS Sync Fields (inherited from scid_ams_sync):**
- `ams_sync_needed` (Boolean) — Flag if sync to AMS pending
- `last_ams_sync_at` (Datetime) — Last successful sync timestamp

**Key Methods:**
- `action_waiting_for_approval()` — State → 'waiting'
- `action_approve_contract()` — Auto-transition to 'confirm_waiting' if approved
- `action_confirm_finish()` — Critical: Transitions to 'confirmed', copies o2m lines and approvals to deal
- `action_edit()` — Creates new draft copy, marks original as cancelled
- `button_request_contract_approval()` — Initiates approval workflow
- `_check_confirm_signed_available()` — Validates signed_attachment exists

---

### Leasing Base (`leasing.base` - AbstractModel)
**Purpose:** Common fields for all leasing transaction types (deal, contract, appendix, termination)  
**Inherits:** `vn.address.mixin`, `mail.thread`, `mail.activity.mixin`

**Core Fields (200+ fields):**
- **Location/Mall:** mall_id, floor_id, location_id, brand_id, area
- **Partner:** partner_id, partner_code, partner_vat (with issue date/ward/district/state/zip tracking), partner_category_id
- **Pricing Model:** rental_fee_model (5 models: base rental, percentage revenue share, hybrid, tiered revenue)
- **Financials:**
  - `deposit_ids` (One2many) → `leasing.deposit` — Security deposits by category
  - `deposit_amount`, `deposit_received_amount` (Monetary - computed)
  - `rental_income_ids` (One2many) → `leasing.income.rental` — Monthly/quarterly/annual rental fees
  - `share_income_ids` (One2many) → `leasing.income.share` — Revenue share percentages
  - `bank_id`, `bank_account_no`, `bank_branch`, `bank_account_name` — Payment info
  - `currency_id` — Default to company currency

- **Timeline:**
  - `rental_start_date`, `rental_end_date`, `proposed_term_year/month/day`
  - `construct_start_date`, `construct_end_date`
  - `space_issued_date` (computed)
  - `invoice_cycle` (monthly|quarterly|yearly), `invoice_day`

- **Approvals:**
  - `approval_ids` (Many2many) → `leasing.approval`
  - `approval_state` (waiting|approved|rejected|none)
  - `next_approver_id`, `show_button_approve`, `show_button_reject`

- **Documents:** signed_attachment, signed_attachment_fname, handover_attachment (with fname)

**Key Computed Fields:**
- `_compute_approval_state()` — Checks related approvals
- `_compute_legal_representative()` — From partner legal info
- `_compute_construction_standards()` — Linked construction requirements
- `_compute_business_category_id()` — From brand

---

### Leasing Approval (`leasing.approval`)
**Purpose:** Track approval workflows with multiple approvers and timestamps  
**Key Fields:**
- `sequence` (Integer) — Order in approval chain
- `leasing_ref` (Reference field) — Dynamic link to deal/contract/appendix
- `function` (Char) — Role (e.g., "Manager", "Director")
- `approver_id` (Many2one) → `res.users` — Assigned approver
- `approved_user_id`, `rejected_user_id` (Many2one) — Who actually approved/rejected
- `state` (Selection) — waiting | approved | rejected
- `approval_time` (Datetime) — When action taken
- `reason` (Text) — Rejection reason

---

### Leasing Appendix (`leasing.appendix`)
**Purpose:** Contract amendments/modifications after initial signing  
**Key Fields:**
- `code`, `state` (draft|waiting|confirm_waiting|confirmed|rejected|cancelled)
- `contract_id`, `deal_id` (Many2one)
- `approved_by` (res.users)
- Various amendment detail fields

**State Logic:** Appendix can only be created if no pending appendix/termination exists

---

### Leasing Termination (`leasing.termination`)
**Purpose:** End-of-lease cleanup and final accounting  
**Key Fields:**
- `contract_id` (Many2one) — Which contract being terminated
- `code`, `state` (waiting|waiting_to_confirm|termination_confirmed|termination_done|cancelled)
- `deposit_ids` (One2many) — Deposit refund records
- Termination date, final accounting

---

### Leasing LAF & OL
- **LAF** (`leasing.laf`) — Leasing Approval Form, initial approval
- **OL** (`leasing.ol`) — Operational Lease form, alternative structure

Both share base fields and follow similar state machines.

---

### Mall & Location Models
**Mall** (`mall.mall`) — Shopping center/property project  
- name, code, address (Vietnamese address hierarchy)
- mall_ids (nested malls)
- floor_ids, location_ids, income_ids

**Mall Floor** (`mall.floor`) — Level within mall  
- floor_code, floor_name, mall_id
- **Sync to AMS:** ams_id, ams_sync_needed, last_ams_sync_at

**Mall Location** (`mall.location`) — Individual retail space  
- code, area, floor_id, category_id
- location_state (Kanban-like tracking)
- location_tracking_ids (history)

**Mall Location Category** — Type classification (shop, kiosk, food court, etc.)

---

## Invoicing System (scid_invoicing)

### Invoicing MEC (`invoicing.mec`)
**Purpose:** Monthly billing period management  
**Key Fields:**
- `invoice_period_monthly`, `invoice_period_annual` (Selection)
- `period_start_time`, `period_end_time` (Date - computed)
- `invoice_proforma_date`, `invoice_closing_date` (Date)
- `state` (draft|active|closed|cancelled) — Only ONE can be 'active'
- `code` (Unique constraint)

**Key Methods:**
- `action_active()` — Activates MEC, deactivates all proforma invoices
- `get_data_mec(type)` — Returns period dates for current/next/other MEC

### Invoice Models
- **Invoicing TOS** — Terms of service for invoicing
- **Invoicing Utility** — Helper model for invoice calculations
- **Account Move Integration:**
  - Custom `account.move` fields: ams_id, ams_sync_needed, is_proforma_invoice, is_deposit_difference_entry
  - Links to deal/contract/deposit for context
  - Special deposit entry generation logic

---

## AMS Sync Integration (scid_ams_sync)

### Purpose
**Bidirectional sync with AMS (Asset Management System) server** at 10.1.2.6 using REST API with API Key authentication and batch queue processing.

### Authentication
**Model:** `auth.api.key`
- `name` (Description)
- `origin` (Origin header value for CORS)
- `key` (Unique API key, generated via `generate_api_key()`)

**Controller Override:** `ir.http._auth_method_api_key()`
- Validates `X-Api-Key` header + `Origin` header combination
- Raises `AccessDenied` if not found
- Sets `request.auth_api_key`, `request.auth_api_key_id` on success

### REST API Endpoints (All require `auth="api_key"`)

#### 1. Account Move (Accounting Entries)
- **POST `/account_move/update_state`** — AMS → LMS
  - Updates status of accounting entries
  - Creates/updates records with `ams_id`
  - Response includes lms_id, ams_id, last_sync_at

- **POST `/deposit_entry/post`** — AMS → LMS
  - Records deposit postings
  - Auto-generates difference entries if posted < suggested amount
  - Special field: `is_deposit_difference_entry`

- **POST `/deposit_entry/get_deposit_contract`** — AMS → LMS (Query)
  - Given ams_id, returns deposit_contract_code from contract

#### 2. Deposit Category (Partial)
- Sync deposit type categories from AMS

#### 3. Income Type
- Sync income classification types

#### 4. Invoicing MEC
- Sync MEC period definitions

### Connector Pattern (Utilities)

**Base Connector** (`base_connector_helper.py`)
- REST HTTP client for AMS API calls
- Methods: GET, POST with retry logic
- Uses `requests` library

**Connectors (one per entity):**
- `contract_connector_helper.py` — POST /contracts/sync
- `partner_connector_helper.py` — POST /partners/sync
- `bank_connector_helper.py` — POST /banks/sync
- `account_move_connector_helper.py` — POST /entries/sync
- Etc.

**Sync Helpers** (Transform data)
- `base_sync_helper.py` — `_retrieve_record(**kw)` utility (search by fields)
- `account_move_sync_helper.py` — `AccountMoveDataTransform` (validates, maps schema)
- Similar for each entity

### Configuration
**Settings** (`res_config_settings.py` via res.company)
- `ams_host` (IP/hostname)
- `ams_port` (Port number)
- `ams_api_key` (API key)

**Scheduled Jobs (via `ir_cron_data.xml`):**
- `cron_sync_contracts()` — Syncs contracts with pending flag or never-synced
- Similar crons for other entities
- Batch queue processing via `queue_job` for parallel execution

### Models Enhanced with AMS Fields

| Model | AMS Fields | Sync Direction |
|-------|-----------|-----------------|
| leasing.contract | ams_sync_needed, last_ams_sync_at | LMS → AMS on create |
| res.partner | ams_id, ams_sync_needed, ams_partner_code | Bidirectional |
| account.move | ams_id, ams_sync_needed, is_proforma_invoice, suggested_deposit_amount | Bidirectional |
| account.payment | ams_id, ams_sync_needed | LMS → AMS |
| mall.mall | ams_id, ams_sync_needed | LMS → AMS |
| mall.floor | ams_id, ams_sync_needed | LMS → AMS |
| res.bank | ams_id, ams_sync_needed | Bidirectional |
| leasing.contract | ams_sync_needed (set True on create) | Auto-sync via cron |

---

## Data Flow & Workflow

### Deal Lifecycle
```
1. DRAFT (new deal created)
   v
2. IN_DEAL (LAF created, still drafting)
   v
3. WAIT_APPROVAL (LAF submitted, pending approval)
   v
4. ON_AGREEMENT (LAF approved, contract negotiation)
   v
5. Contract created --> WAIT_TRANSFER (handover pending)
   v
6. CONSTRUCTION (handover doc uploaded, before rental start)
   v
7. LEASING (rental_start_date reached, active lease)
   v (optional amendment)
8. APPENDIX_APPROVAL (amendment pending)
   v
9. TERMINATION_WAITING --> TERMINATION_TO_APPROVAL --> 
   TERMINATION_TO_CONFIRM --> TERMINATION_DONE (end lease)
```

### Approval Workflow
- Deal/Contract/Appendix has approval_ids chain
- Each approval has approver_id, state, approval_time
- Computed field next_approver_id shows next in chain
- Button visibility controlled by show_button_approve/reject

### Invoicing Cycle
```
MEC active period defined --> contracts in that period
--> Auto-generate invoices monthly/quarterly/yearly
--> on invoice_day of month
--> Link to contract rental_income_ids (base fee) + share_income_ids (%)
--> Post to account.move (accounting entry)
--> (Optional) Sync to AMS account.move
```

### AMS Sync Flow
```
1. LMS User creates leasing.contract
   --> create() hook calls _action_sync_to_ams()
   --> Sets ams_sync_needed = False
   --> Queues batch_queue (50 contracts) --> _sync_contracts()
   --> Calls AMS POST /contracts/sync
   
2. If ams_sync_needed = True or last_ams_sync_at = NULL
   --> cron_sync_contracts() finds records
   --> Calls _action_sync_to_ams()
   --> Same batch queue flow

3. AMS can POST to LMS endpoints:
   --> /account_move/update_state (record posted)
   --> /deposit_entry/post (deposit confirmed)
   --> /deposit_entry/get_deposit_contract (query)
```

---

## Custom Fields & Extensions

### Vietnamese Address Mixin (`vn.address.mixin`)
Extends models with:
- `street` → broken into `street`, `house_number`
- Address hierarchy: state → region → district → ward
- Computed address display

### Mail Notification Mixin (`scid_mail_notification_mixin`)
Base class for models that send emails on state changes

### Documents & Attachments
- Binary fields: signed_attachment, handover_attachment, handover_attachment_fname
- Upload wizard: `upload_documents_wizard`
- Document preview wizard: `document_preview_wizard`

---

## Deployment & Operations

### Cronjobs (via `data/cron_view.xml`)
1. Contract sync (AMS) — Periodic batch sync
2. Invoice generation — MEC period monitoring
3. Approval notifications — Email reminders
4. State machine checks — Cascade updates

### Security
- User-based access control (user_id field on deals)
- Record rules (ir_rules.xml) — Department/location based
- Group-based menu access (res_groups.xml)
- API Key auth for AMS endpoints (no normal user needed)

### Queue Jobs
- `queue_job` module used for async batch processing
- Batch size configurable via `batch.queue` param (default 50)
- Each contract sync queued separately for parallel execution

---

## Code Organization

**Directory Structure:**
```
scid_leasing/
  +-- models/                                                                   
  |   +-- base/          (res.partner, res.user extensions)                     
  |   +-- leasing/       (deal, contract, appendix, termination, approval, etc.)
  |   +-- mall/          (mall, floor, location, income models)                 
  |   +-- accounting/    (account.move, account.payment extensions)             
  +-- wizards/           (12 wizard classes for UI actions)                     
  +-- views/             (XML view definitions)                                 
  +-- security/          (access rules, groups)                                 
  +-- report/            (PDF reports)                                          
  +-- static/            (JS, SCSS, XML assets)                                 

scid_ams_sync/
  +-- models/            (Model overrides with ams_* fields)
  +-- controllers/       (REST API endpoints)               
  +-- schemas/           (Request validation)               
  +-- utils/                                                
  |   +-- ams_connector_helper/     (REST client wrappers)  
  |   +-- ams_sync_helper/          (Data transformation)   
  +-- views/             (Config settings views)            

scid_invoicing/
  +-- models/                                                      
  |   +-- invoicing_mec.py                                         
  |   +-- invoicing_tos.py                                         
  |   +-- invoicing_utility.py                                     
  |   +-- account_move.py           (Invoice generation logic)     
  |   +-- leasing_contract.py        (Invoice schedule integration)
  +-- wizard/            (Manual invoice creation)                 
  +-- views/                                                       

scid_leasing_mail_workflow/
  +-- models/            (State change email templates)

vn_address/
  +-- models/            (District, Ward, Region hierarchies)

web_plan_layout/
  +-- static/src/        (Kanban-like plan display)
```

---

## Key Patterns & Conventions

### 1. **Computed Fields with Store=True**
```python
state = fields.Selection(compute='_compute_deal_state', store=True)
# Enables searching/filtering by computed value, auto-updated on dependencies
```

### 2. **Related Fields**
```python
deal_state = fields.Selection(related='deal_id.state', store=True)
# Denormalized for quick access and filtering
```

### 3. **Dynamic References**
```python
leasing_ref = fields.Reference(selection='_get_leasing_refs')
# Links to deal/contract/appendix dynamically
```

### 4. **Tracking=True**
```python
state = fields.Selection(..., tracking=True)
# Enables message tracking in mail.thread
```

### 5. **Context Bypass for Sync**
```python
record.with_context(bypass_sync=True).write({...})
# Prevents infinite loops when AMS pushes back changes
```

### 6. **Batch Queue Processing**
```python
chunk_contracts.with_delay()._sync_contracts()
# Async job queuing via queue_job
```

### 7. **Approval Chain Pattern**
```python
next_approver_id = fields.Many2one(compute='_compute_next_approver')
# Auto-advance workflow based on approval sequence
```

### 8. **Multi-level State Machines**
- Deal has main state (draft, leasing, etc.)
- Contract has substate (waiting, confirmed, etc.)
- Contract_summary_state reflects current state in deal context
- Enables complex workflows without losing granularity

---

## Potential Issues & Observations

1. **Circular Sync Prevention:** `bypass_sync=True` context flag prevents loops when AMS pushes changes
2. **Batch Queue Risk:** Large batches (50 contracts) may timeout on slow AMS server
3. **API Key Storage:** Keys stored plain in database (consider encryption in production)
4. **State Complexity:** 13+ leasing deal states + 5 contract states = hard to reason about
5. **Document Upload:** Binary attachment fields can cause memory issues on large files (see 5MB limit note)
6. **Approval Inheritance:** Complex copy logic when contract confirmed (copies approvals to deal)

