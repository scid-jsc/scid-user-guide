# AMS Custom Modules - Comprehensive Code Analysis

**Date:** 2026-04-04  
**Server:** 10.1.2.6 (AMS Odoo 16 Enterprise)  
**Location:** `/opt/odoo/custom/`

---

## Table of Contents
1. [Module Overview](#module-overview)
2. [AMS Leasing Module](#ams-leasing-module)
3. [AMS Invoicing Module](#ams-invoicing-module)
4. [AMS Odoo Connector Module](#ams-odoo-connector-module)
5. [AMS Partner Module](#ams-partner-module)
6. [PCV S-Invoice Module](#pcv-sinvoice-module)
7. [SCID Leasing Mail Workflow Module](#scid-leasing-mail-workflow-module)
8. [SCID Mail Notification Mixin Module](#scid-mail-notification-mixin-module)
9. [Journal Restrict Module](#journal-restrict-module)
10. [BIZ Accounting Module](#biz-accounting-module)
11. [Key Architecture Patterns](#key-architecture-patterns)
12. [Model Relationships](#model-relationships)
13. [Data Flow & Sync Strategy](#data-flow--sync-strategy)

---

## Module Overview

| Module | Version | Purpose | Dependencies |
|--------|---------|---------|--------------|
| **ams_leasing** | 16.0.1.0.0 | Core leasing contracts, malls, floors, income types | account, contacts, vn_address |
| **ams_invoicing** | 1.0 | Invoicing, debt reporting, late payments, deposits | ams_leasing, account, account_asset |
| **ams_odoo_connector** | 16.0.1.0.0 | REST API sync AMS ↔ LMS (two-way), queue_job | ams_leasing, ams_invoicing, queue_job |
| **ams_partner** | 16.0.1.0.0 | Partner extensions (ID card, business license, VAT) | contacts, vn_address, base_vat |
| **pcv_sinvoice** | 1.0 | S-Invoice integration (e-invoicing) | account, web_widget_* |
| **scid_leasing_mail_workflow** | 16.0.1.0.0 | Mail notifications for leasing state changes | scid_leasing, scid_mail_notification_mixin |
| **scid_mail_notification_mixin** | 16.0.1.0.0 | Mixin for mail notifications with group routing | mail |
| **journal_restrict** | 1.0 | Journal access control by user | - |
| **biz_accounting** | N/A | Collection of 14+ accounting report modules | - |

---

## AMS Leasing Module

**Purpose:** Core domain model for property leasing business.

### Models

#### 1. **mall.mall** (`mall_mall.py`)
Central entity representing a shopping mall/property complex.

**Fields:**
- `name` (Char, required) — Mall name, unique
- `code` (Char, required, 5 chars) — Mall code, unique, must be exactly 5 characters
- `active` (Boolean) — Is mall active
- `manager_id` (Many2one → res.partner) — Property manager
- `profit_center_id` (Many2one → account.journal) — Profit center journal
- `cost_center_id` (Many2one → account.journal) — Cost center journal
- `accountant_id` (Many2one → res.partner) — Accountant for invoices
- `journal_ids` (One2many → account.journal) — All journals linked to mall
- `mall_income_config_ids` (One2many → mall.income.config) — Income type configs per floor
- `account_journal_report` (Many2one → account.journal, computed) — Bank journal for proforma invoices

**Key Methods:**
- `default_get()` — Pre-populate profit/cost centers with default sale/purchase journals
- `constrains_mall_code()` — Validate code is exactly 5 characters
- `_compute_account_journal_report()` — Auto-select first bank journal
- `get_mall_journal_by_type(journal_type)` — Get journal by type (sale, bank, etc.) for reporting

**Constraints:**
- Unique: name, code

---

#### 2. **mall.floor** (`mall_floor.py`)
Floors/units within a mall.

**Fields:**
- `mall_id` (Many2one → mall.mall, required) — Parent mall
- `code` (Char, required) — Floor identifier

---

#### 3. **leasing.contract** (`leasing_contract.py`)
Leasing contracts between mall and tenants.

**Fields:**
- `code` (Char, required) — Contract identifier
- `floor_id` (Many2one → mall.floor, required) — Leased floor
- `mall_id` (Many2one → mall.mall, readonly, related from floor)
- `location` (Char) — Specific location within floor
- `deal_code` (Char) — Related deal code
- `brand` (Char, required) — Tenant brand name
- `business_category` (Char) — Tenant business type
- `partner_id` (Many2one → res.partner) — Tenant
- `deffered_interest` (Float) — Late payment interest rate
- `lms_url` (Char) — Link to LMS record
- `proposed_term_year/month/day` (Integer) — Lease duration
- `rental_start_date` (Date) — Start of rental period
- `rental_end_date` (Date, computed) — Auto-calculated end date based on duration

**Key Methods:**
- `_compute_rental_date()` — Calculate end date: `start_date + (years*365 + months*30 + days)`
- `action_open_lms_url()` — Open LMS contract in new window

---

#### 4. **income.type** (`income_type.py`)
Types of income/fees charged to tenants.

**Fields:**
- `name` (Char, required) — Fee name
- `code` (Char, unique) — Auto-generated code via sequence
- `category` (Selection, required) — Classification:
  - `revenue_rent` — Percentage of revenue rent
  - `basic_rent` — Fixed base rent
  - `service` — Service fee
  - `marketing` — Marketing fee
  - `cleaning` — Cleaning fee
  - `utility` — Utilities (water, electricity, gas)
  - `other` — Other fees
- `uom` (Selection, required) — Unit of measurement:
  - `area` — VND/m²/month
  - `kwh` — VND/kWh
  - `vnd` — Fixed amount VND
  - `area_vnd` — VND/m²
  - `vnd_month` — VND/month
  - `vnd_m3` — VND/m³
  - `vnd_kg` — VND/kg
- `invoice_description` (Char) — Description on invoices
- `credit_note_description` (Char) — Description on credit notes
- `account_id` (Many2one → account.account) — Revenue account
- `income_tax_id` (Many2one → account.tax) — Tax to apply
- `product_id` (Many2one → product.product) — Service product

**Key Methods:**
- `create(vals_list)` — Auto-generate code from sequence 'income.type'

**Constraints:**
- Unique: code, product_id

---

#### 5. **mall.income.config** (`mall_income_config.py`)
Mapping of income types to specific floors with computed fields.

**Fields:**
- `sequence` (Integer) — Display order
- `mall_id` (Many2one → mall.mall, required)
- `floor_id` (Many2one → mall.floor, required) — Filtered by mall
- `income_type_id` (Many2one → income.type, required)
- `available_income_type_ids` (Many2many → income.type, computed) — Types not used on this floor
- `account_id` (Many2one → account.account, computed/stored) — From income_type
- `tax_id` (Many2one → account.tax, computed/stored) — From income_type

**Key Methods:**
- `_compute_account()` — Copy account from selected income_type
- `_compute_tax()` — Copy tax from selected income_type
- `_compute_available_income_types()` — Show only unused income types on floor
- `write()` — Auto post tracking messages to parent mall when config changes
- `unlink()` — Auto post deletion notification to mall

---

#### 6. **deposit.category** (`deposit_category.py`)
Classification of deposits/security money.

**Fields:**
- `name` (Char, required)
- `code` (Char, unique) — Auto-generated
- `sequence` (Integer)
- `deposit_account_id` (Many2one → account.account) — Account for deposits

**Key Methods:**
- `create(vals_list)` — Auto-generate code

---

#### 7. **account.journal Extension** (`account_journal.py`)
Adds mall reference to journals.

**Fields:**
- `mall_id` (Many2one → mall.mall) — Links journal to mall

---

### Views
- `mall_mall_views.xml` — List/form views for malls with tree visualization
- `mall_floor_views.xml` — Floor management
- `income_type_views.xml` — Fee types
- `leasing_contract_views.xml` — Contracts
- `deposit_category_views.xml` — Deposits

### Data
- `ir_sequence_data.xml` — Sequences for code generation:
  - `income.type` — Income type codes
  - `deposit.category` — Deposit category codes

---

## AMS Invoicing Module

**Purpose:** Invoicing, debt aging reports, late payment interest, and deposit tracking.

### Models

#### 1. **account.move Extension** (`account_move.py`)
**31 custom fields + 29 methods** — Heavily extended accounting entry for invoicing.

**Key Custom Fields:**
- `scid_invoice_type` (Selection) — Rent & expenses vs. Utility invoice
- `contract_id` (Many2one → leasing.contract)
- `floor_id`, `mall_id` (Related from contract)
- `location`, `brand`, `deal_code` (Related from contract)
- `deffered_interest` (Late payment rate)
- `payment_start_date`, `new_payment_start_date` (Tracked separately)
- `rental_start_date`, `rental_end_date` (From contract)
- `is_proforma_invoice` (Boolean) — Can't post proforma invoices
- `is_deposit_entry` (Boolean) — Marks deposit journal entries
- `deposit_category_id` (Many2one → deposit.category)
- `accountant_id` (Computed from mall)
- `mobile`, `email` (Computed from accountant)
- `payment_type_code` (Selection) — inbound/outbound/banking
- `account_code` (Char, computed) — Auto-generated receipt number (Phiếu Thu/Chi)
- `available_vendor_bank_ids`, `vendor_bank_id` (For payment routing)
- `late_payment_original_move_id`, `late_payment_created_move_ids` — Links for late fee entries
- `is_storno` (Boolean) — Direct deduction entry

**Key Methods:**

- `_compute_invoice_date_due()` — Override: find max maturity date from payment terms
- `_compute_mall_id()` — Link to mall based on journal type (profit center for invoices, journals for entries)
- `_onchange_contract()` — Auto-fill deal_code from contract
- `get_late_payment_invoice(mec_id)` — Generator: yield (move, late_fees) for unpaid invoices in period
  - Calculates late fees for paid portion (via payment register)
  - Calculates late fees for unpaid residual
- `_compute_mobile_and_email()` — From accountant_id
- `_compute_vendor_bank_id()` — Get vendor banks from invoice lines
- `calculate_sum_price_foreach_tax()` — Sum line amounts by tax rate
- `_compute_accountant_id()` — From mall.accountant_id
- `_compute_suitable_journal_ids()` — Different journal selection logic based on move type
- `_compute_new_payment_start_date()` — Default to payment_start_date if not set
- `_compute_account_code()` — Generate receipt number based on sequence & date
- `_onchange_journal_date()` — Auto-clear journal if setting to non-bank for banking payments
- `action_post()` — Override: 
  - Warn if payment dates/rates differ from contract
  - Prevent posting proforma invoices
  - Auto-send invoice email (if template exists)
- `button_open_late_journal_entry_interest()` — Open first late fee entry
- `_get_sinvoice_payment_journal()` — Map S-Invoice payment method to Odoo journal
- `_prepare_sinvoice_payment_data()` — Prepare payment register data from S-Invoice
- `generate_sinvoice_payment()` — Create payment entry for S-Invoice
- `action_open_contract_lms_url()` — Open LMS contract
- `button_draft()` — Reset payment_reference when drafting
- `action_register_payment()` — Override: determine inbound/outbound based on residual
- `print_invoice_template_report_name()` — Generate filename: `ĐNTT_[code]_[date]` or `HĐ_[code]_[date]`
- `_get_confirm_message_wizard()` — Return action to open confirmation dialog
- `_get_is_inbound_payment_type()` — Determine payment direction for reports
- `get_deposit_amount(partner_id, mall_id, date_to, contract_id)` — **Complex SQL query** to calculate:
  - Sum of deposits (credit) minus usage (debit) per partner/mall up to date
  - Used in reports
- `_get_invoice_computed_reference()` — Generate reference text with dates if rental dates present

---

#### 2. **account.debt.report** (`account_debt_report.py`)
Aged debt analysis (BĐCCN — Bảng Đối Chiếu Công Nợ).

**Fields:**
- `name` (Char, computed) — Display as "BĐCCN [partner] từ [from_date] đến [to_date]"
- `partner_id`, `mall_id`, `contract_id` (Filters)
- `from_date`, `to_date` (Date range)
- `account_ids` (Many2many → account.account) — Receivable accounts
- `debt_line_ids` (One2many → account.debt.report.line)

**Key Methods:**
- `_compute_name()` — Format report title
- `onchange_contract_id()` — Auto-fill partner & mall from contract
- `_compute_account_ids()` — Default to partner's receivable account
- `format_date()` — Format date for display
- `action_export_pdf()` — Generate PDF report
- `get_debt_data_lst()` — Fetch debt details
- `_query_debt_report_data()` — **SQL query** building complex debt aging analysis

---

#### 3. **account.move.line Extension** (`account_move_line.py`)
**9 fields** added for detailed invoice line tracking.

**Fields:**
- `contract_id`, `mall_id` (Many2one) — Related from parent move
- `income_type_id` (Many2one → income.type)
- `rental_from_date`, `rental_to_date` (Date) — Rental period for line
- `product_id` (Many2one → product.product)
- `multiplier` (Float) — Calculation multiplier
- `original_late_move_line_id` (Many2one → self)
- `total_vat` (Monetary, computed)

**Key Methods:**
- `_compute_total_vat()` — Calculate VAT amount
- `_compute_tax_ids()` — Auto-set tax from income_type
- `_compute_account_id()` — Auto-set account from income_type
- `_compute_product()` — Auto-set product from income_type

---

#### 4. **account.payment Extension** (`account_payment.py`)
**7 fields** for payment-specific data.

**Fields:**
- `contract_id`, `deposit` (Char) — Payment classification
- `payment_start_date`, `payment_end_date` (Date)
- `payment_type` (Selection)
- `note` (Text)
- `analytic_line_id` (Many2one → account.analytic.line)

**Key Methods:**
- `default_get()` — Set defaults from context
- `_compute_available_journal_ids()` — Filter by payment type
- `action_post()` — Override posting logic
- `get_late_payment_amount()` — Calculate late fees for paid amount using helper

---

#### 5. **invoicing.mec** (`invoicing_mec.py`)
**Invoicing Milestone/Execution Period** — Defines billing periods.

**Fields:**
- `code` (Char, required) — Period identifier
- `state` (Selection) — active / closed / cancelled
- `invoice_period_monthly`, `invoice_period_annual` (Selection) — Month/quarter selection
- `invoice_proforma_date`, `invoice_closing_date` (Date)
- `period_start_time`, `period_end_time` (Computed)
- `period_time_display` (Char, computed)
- `invoice_period_display` (Char, computed)

**Key Methods:**
- `_compute_period_time()` — Calculate actual dates from monthly/annual selection
- `_get_number_of_days_in_month()` — Helper for date calculations
- `_get_invoice_date_in_mec()` — Get invoice date within MEC period
- `action_active()`, `action_closed()`, `action_cancel()` — State transitions
- `create(vals_list)` — Assign code from sequence

---

#### 6. **res.company Extension** (`res_company.py`)
**4 fields** for company-level accounting configuration.

**Fields:**
- `analytic_account_id` (Many2one → account.analytic.account)
- `deposit_account_id` (Many2one → account.account)
- `late_payment_debit_account_id`, `late_payment_credit_account_id` (Many2one)

---

#### 7. **account.partial.reconcile Extension** (`account_partial_reconcile.py`)
Tracks partial reconciliation details for reporting.

**Fields:**
- `amount` (Float)
- `reconcile_date` (Date)
- `debit_move_id`, `credit_move_id` (Many2one → account.move)
- `partial_reconcile_id` (Many2one → self)

---

#### 8. **res.partner Extension** (`res_partner.py`)
**1 field** for partner-level deposit account override.

- `deposit_account_id` (Many2one)

**Key Methods:**
- `get_full_partner_address(country_required=True)` — Format address for reports

---

### Wizards

#### 1. **confirm.message.wizard** (`confirm_message_wizard.py`)
Dialog to confirm actions with user message.

#### 2. **calculate_late_payment_wizard** (`calculate_late_payment_wizard.py`)
Batch calculate late fees for period.

#### 3. **account.payment.register Extension** (`account_payment_register.py`)
Override to support late payment fee workflow.

---

### Utilities

#### `utils/helper.py`
- **CalculateLatePaymentInterestHelper** — Helper class to calculate late fees:
  - Takes: payment_start_date, deffered_interest rate, payment_end_date
  - Calculates: daily interest amount, total fee for period
  - Methods: `_get_account_move_unpaid_interest()` — Creates move line for unpaid fee
  
- **GetSequenceAccountHelper** — Helper to generate receipt numbers:
  - Takes: create_date, payment_type, journal
  - Checks if sequence changed in year
  - Returns: formatted receipt code (Phiếu Thu/Chi code)

---

### Views
- `account_move_views.xml` — Extended invoice form with custom fields
- `account_debt_report.xml` — Debt report form
- `account_payment_views.xml` — Payment form
- `invoicing_mec_views.xml` — Billing period management

---

### Reports
- `report_invoice_receipt_templates.xml` — Receipt (Phiếu Thu/Chi) template
- `account_move_report.xml`, `account_payment_report.xml` — Reports

---

## AMS Odoo Connector Module

**Purpose:** Two-way REST API sync between AMS (Odoo 16) and LMS (another system).

### Architecture
- **Controllers** (HTTP routes) — REST API endpoints for LMS → AMS sync
- **Models** — Extended models with `lms_id` and `lms_sync_needed` fields
- **Utils/Sync Helpers** — Data transformation & connector logic
- **Schemas** — JSON schema validation
- **Queue Jobs** — Async sync via OCA queue_job

### Controllers

#### 1. **account_move.py** (`AccountMoveController`)
Routes:
- `POST /account_move/sync` (auth: api_key) — Sync invoices from LMS
  - Schema: Validates incoming data
  - Transform: AccountMoveDataTransform handles create/update
  - Response: Returns AMS IDs, LMS IDs, and account line IDs
  
- `POST /account_move/cancel` (auth: api_key) — Cancel invoices synced from LMS
  - Uses: CancelAccountMoveDataTransform
  - Action: Calls `button_cancel()` with bypass context

#### 2. **partner.py** (`PartnerController`)
Route: `POST /partner/sync` — Partner sync

#### 3. **contract.py** (`ContractController`)
Route: `POST /contract/sync` — Leasing contract sync

#### 4. **mall_mall.py** (`MallController`)
Route: `POST /mall/sync` — Mall/property sync

#### 5. **mall_floor.py** (`FloorController`)
Route: `POST /floor/sync` — Floor sync

#### 6. **bank.py** (`BankController`)
Route: `POST /bank/sync` — Bank master data sync

#### 7. **bank_account.py** (`BankController`)
Route: `POST /bank_account/sync` — Bank account sync

#### 8. **account_payment.py** (`AccountPaymentController`)
Route: `POST /account_payment/sync` — Payment sync

---

### Models Extended with LMS Sync

#### 1. **mall.floor** — `lms_id` (Integer)
#### 2. **account.move** — `lms_id`, `lms_sync_needed`, `last_lms_sync_at`
**Key Methods:**
- `_get_lms_connector()` — Instantiate LMS API client
- `_sync_account_move_state()` — Push move state to LMS
- `_sync_posted_deposit_entry()` — Push deposit entry when posted
- `_action_sync_state_to_lms()` — Public action to manually sync
- `_action_post_deposit_entry_to_lms()` — Post deposit to LMS after creating
- `write()` — Auto-trigger sync if lms_sync_needed set
- `cron_update_deposit_contract()` — Scheduled job to update contracts from deposit entries

#### 3. **income.type** — `lms_id`, `lms_sync_needed`, `last_lms_sync_at`
**Key Methods:**
- `_sync_fields()` — Map fields to LMS format
- `_sync_income_types()` — Batch sync to LMS
- `cron_sync_income_types()` — Scheduled cron job
- `write()` → triggers sync

#### 4. **deposit.category** — Similar to income.type
- `cron_sync_deposit_categories()`

#### 5. **invoicing.mec** — Similar structure
- `cron_sync_invoicing_mecs()`

#### 6. **account.move.line** — `lms_id`

#### 7. **account.payment** — `lms_id`

#### 8. **res.partner** — `lms_id`

#### 9. **res.company Extension** (`res_config_settings.py`)
**Fields:**
- `lms_host` (Char) — LMS server hostname
- `lms_port` (Char) — Port number
- `lms_api_key` (Char) — API key for authentication

---

### Authentication
#### **auth_api_key.py** (`AuthApiKey` model)
API key storage for LMS connections.

**Fields:**
- `name` (Char)
- `key` (Char, auto-generated)
- `origin` (Char)

**Key Methods:**
- `generate_api_key()` — Create random key
- `_retrieve_api_key(origin)` — Look up key

---

### Authentication Method
#### **ir_http.py** (`IrHttp` override)
- `_auth_method_api_key(cls)` — Custom auth handler for `@http.route(..., auth='api_key')`
  - Reads API key from request header
  - Validates against AuthApiKey records
  - Returns authenticated user context

---

### Sync Utilities

Base class: **`ams_sync_helper/base_sync_helper.py`** (`AMSSyncHelper`)
- `_retrieve_record(**kw)` — Search by field=value

Specialized helpers:
- **`account_move_sync_helper.py`** — `AccountMoveDataTransform`, `CancelAccountMoveDataTransform`
  - Transforms LMS invoice JSON → Odoo move data
  - Handles create vs. update logic
  - Maps LMS IDs to AMS records

- **`partner_sync_helper.py`** — Partner sync
- **`contract_sync_helper.py`** — Contract sync
- **`mall_sync_helper.py`** — Mall sync
- **`floor_sync_helper.py`** — Floor sync
- **`bank_sync_helper.py`** — Bank sync
- **`bank_account_sync_helper.py`** — Bank account sync

### Schema Validation

**`schemas/schemas.py`** (`SchemaHelper`)
- Static methods for each entity's schema
- E.g., `account_move_schema()` — Returns JSON schema for invoice sync payload

---

### Queue Jobs Configuration
**`data/queue_job_config_data.xml`** — Configure OCA queue_job for async sync

### Cron Jobs
**`data/ir_cron_data.xml`** — Scheduled sync tasks:
- `cron_sync_income_types`
- `cron_sync_deposit_categories`
- `cron_sync_invoicing_mecs`
- `cron_update_deposit_contract`

---

## AMS Partner Module

**Purpose:** Extend partner/contact records with Vietnamese business details.

### Models

#### 1. **res.partner Extension** (`res_partner.py`)
**19 custom fields** for business/identity verification.

**Fields:**
- **Contact Classification:**
  - `scid_contact_type` (Selection) — person / business / bank / supplier / investor
  - `is_customer` (Boolean)
  - `is_contact_point` (Boolean)
  - `partner_category` (Char)

- **Identity:**
  - `id_card_no` (Char) — ID card number
  - `id_card_issued_date` (Date)
  - `id_card_issued_place` (Char)

- **Business License:**
  - `business_license` (Binary) — File upload
  - `business_license_fname` (Char) — Filename

- **Authority/Authorization:**
  - `authority_no` (Char)
  - `authority_start_date`, `authority_end_date` (Date)
  - `authority_attach` (Binary)
  - `authority_attach_filename` (Char)

- **Contact Details:**
  - `fax` (Char)

**Key Methods:**
- `onchange_scid_contact_type()` — Update field visibility based on type
- `_commercial_fields()` — Specify which fields are commercial (not propagated to address contacts)
- `check_vat()` — Validate Vietnamese tax code format

---

#### 2. **res.bank Extension** (`res_bank.py`)
**1 field** for bank branches.

**Fields:**
- `branch` (Char) — Branch name/code

**Key Methods:**
- `get_full_bank_address()` — Format bank address for reports

---

### Views
- `res_partner_views.xml` — Extended partner form
- `res_bank_views.xml` — Bank form with branch field

---

## PCV S-Invoice Module

**Purpose:** Integration with PC S-Invoice e-invoicing system.

### Models

#### 1. **account.move Extension** (`account_move.py`)
**6 fields + 22 methods** for S-Invoice workflow.

**Fields:**
- `sinvoice_account_id` (Many2one → sinvoice.account)
- `sinvoice_no` (Char) — S-Invoice number issued
- `sinvoice_state` (Selection) — issued / cancelled / payment_confirmed
- `sinvoice_payment_state` (Selection) — unpaid / partial / paid
- `sinvoice_email` (Char) — Email to send S-Invoice to
- `transaction_uuid` (Char) — Transaction ID for tracking

**Key Methods:**
- `get_sinvoice_template_code_selection(domain=None)` — Get available S-Invoice templates
- `_get_view_exported_sinvoice_endpoint()` — S-Invoice API endpoint
- `_action_send_sinvoice_email(sinvoice_account)` — Send S-Invoice via API
- `update_sinvoice_data(sinvoice_state)` — Update from S-Invoice response
- `button_open_sinvoice_wizard()` — Open S-Invoice action wizard
- `_prepare_data_to_get_sinvoice()` — Prepare API payload to issue S-Invoice
- `_prepare_data_to_send_email_sinvoice()` — Prepare email payload
- `_prepare_data_to_update_payment_status_sinvoice()` — Prepare payment status update
- `view_exported_sinvoice()` — Open S-Invoice in PC viewer
- `action_send_sinvoice_email()` — Public action
- `action_send_sinvoice_emails()` — Batch send for multiple invoices
- `generate_sinvoice_payment()` — Create payment register entry from S-Invoice
- ... (22 total)

---

#### 2. **sinvoice.account** (`sinvoice_account.py`)
S-Invoice provider account (PC credentials).

**Fields:**
- `name` (Char, required)
- `username` (Char) — PC username
- `password` (Char) — PC password
- `serial_number` (Char) — Invoice serial/batch number
- `production_host` (Char) — PC API host
- `status` (Selection, computed) — connected / disconnected
- `toggle_status` (Boolean, inverse) — Toggle connection
- `partner_id` (Many2one → res.partner)

**Key Methods:**
- `_compute_get_status()` — Test connection to PC API
- `_inverse_set_status()` — Toggle connection on/off
- `test_sinvoice_connection()` — Validate credentials
- `disconnect()` — Close connection
- `reconnect()` — Reopen connection
- `action_update_sinvoice_template()` — Sync templates from PC
- `action_view_sinvoice_template()` — List templates
- `_update_sinvoice_template(data)` — Update local templates from PC response

---

#### 3. **sinvoice.template** (`sinvoice_template.py`)
S-Invoice templates (invoice formats).

**Fields:**
- `name` (Char)
- `code` (Char) — Template code from PC
- `active` (Boolean)
- `sinvoice_account_id` (Many2one → sinvoice.account)
- `sinvoice_type` (Selection) — 01 (Normal) / 03 (Replacement) / 07 (Adjustment)
- `invoice_series` (Char) — Invoice series code
- `payment_method` (Selection) — TM (cash) / CK (transfer) / DTCN / etc.
- `sinvoice_tax_template` (Selection) — Standard / Simple accounting
- `journal_ids` (Many2many → account.journal) — Links to journals
- `currency_id` (Many2one → res.currency)

---

#### 4. **sinvoice.base Mixin** (`sinvoice_base.py`)
Abstract base for S-Invoice fields shared across models.

**Fields:**
- `sinvoice_template_id`, `sinvoice_template_code` (Many2one, Char)
- `sinvoice_issued_date` (Datetime)
- `sinvoice_note` (Char)
- `sinvoice_template_payment_method` (Selection)
- `original_sinvoice_template_id`, `original_sinvoice_no`, `original_sinvoice_issued_date`

---

#### 5. **account.journal Extension** (`account_journal.py`)
- `sinvoice_account_id` (Many2one → sinvoice.account)

---

#### 6. **res.config.settings Extension** (`res_config_settings.py`)
- `sinvoice_host_url` (Char) — S-Invoice API URL

---

### Wizards
**sinvoice_action_wizard** — Dialog to select action (issue, send, view, update payment)

### Cron Jobs
- `ir_cron_update_payment_state_sinvoice` — Scheduled update of payment states from PC

---

## SCID Leasing Mail Workflow Module

**Purpose:** Email notifications triggered by leasing document state changes.

### Models
All extend from parent leasing models and implement mail notification patterns.

#### 1. **leasing.contract Extension** (`leasing_contract.py`)
**1 field + 11 methods**

**Field:**
- `is_reminder_sent` (Boolean) — Tracks if renewal reminder emailed

**Key Methods:**
- `action_confirm_finish()` → `_action_send_mail_contract_confirmed()`
- `action_cancel()` → `_action_send_mail_contract_cancelled()`
- `_action_send_mail_contract_handover_attachment_uploaded()` — When handover docs uploaded
- `_action_send_mail_contract_upload_handover()` — Request handover upload
- `_action_send_mail_contract_in_leasing()` — Notify lease active
- `_run_reminder(days=0, months=6)` — Send renewal reminders for contracts expiring in 6 months
  - Groups emails by user
  - Uses `_send_email_notification()` with multi-recipient
- `_get_rental_end_date_contracts(mall_id, days, months, user_id)` — Find contracts near expiry
- `write()` — Auto-send handover upload email when field updated

#### 2. **leasing.termination** (`leasing_termination.py`)
**4 methods**
- `action_termination_done()` → `_action_send_mail_termination_done()`
- `_action_send_mail_termination_upload_agreement()` — Request termination agreement

#### 3. **leasing.deal** (`leasing_deal.py`)
- `get_deal_status()` — Helper method

#### 4. **leasing.laf** (`leasing_laf.py`)
- `create()` → `_action_send_mail_created()` — Send on creation

#### 5. **leasing.ol** (`leasing_ol.py`)
- `action_confirm_signed()` → `_action_send_mail_ol_confirm_signed()`

#### 6. **leasing.appendix** (`leasing_appendix.py`)
- `button_appendix_confirm()` → `_action_send_mail_appendix_confirmed()`

#### 7. **leasing.base** (`leasing_base.py`) — AbstractModel
**Core mail notification logic**

**Key Methods:**
- `_compute_approval_state()` — Computed field
- `_action_send_mail_approval_request(groups=None)` — Send approval request to groups
- `_action_send_mail_rejected()` — Approval rejected
- `_action_send_mail_approved()` — Approved
- `_action_send_mail_signed_uploaded()` — Signed docs uploaded
- `_run_reminder_send_approval_request()` — Scheduled reminder
- `write()` — Hook to auto-send mails on field changes

All mail methods delegate to **`ScidMailNotificationMixin._send_email_notification()`**

---

### Mail Templates
**`data/mail_template_data.xml`**
- `leasing_contract_confirmed_mail_template`
- `leasing_contract_cancelled_mail_template`
- `leasing_contract_handover_uploaded_mail_template`
- `leasing_contract_handover_attachment_uploaded_mail_template`
- `leasing_contract_in_leasing_mail_template`
- `leasing_contract_reminder_mail_template`
- ... (7+ templates total)

### Cron Jobs
**`data/cron_view.xml`**
- Scheduled task to run `_run_reminder()` monthly

---

## SCID Mail Notification Mixin Module

**Purpose:** Reusable mixin for sending email notifications to groups.

### Models

#### 1. **ScidMailNotificationMixin** (`scid_mail_notification_mixin.py`)
AbstractModel providing email utility methods.

**Key Methods:**
- `_send_email_notification(groups=None, template_id=None, excluded_groups=None, added_users=None, multi=False)`
  - Groups: IR groups to notify
  - Template: Mail template to use
  - excluded_groups: Groups to exclude
  - added_users: Additional individual users
  - multi: Whether to send to multiple recipients
  - Logic: Build recipient list, send mail via template
  
- `get_groups_by_xml_ids(xml_ids=[])` — Convert XML IDs to group records
- `get_odoo_url(action)` — Generate deeplink to record in Odoo
  - Uses format: `{server_url}/web#id={id}&model={model}&action={action}`

#### 2. **mail.mail Extension** (`mail_mail.py`)
- `create(values_list)` — Hook to track email creation (logging/notifications)

---

### Security
- `ir.model.access.csv` — Access control for mixin

---

## Journal Restrict Module

**Purpose:** Role-based access control for accounting journals.

### Models

#### 1. **account.journal Extension** (`account.py`)
**1 field + 3 methods**

**Field:**
- `user_ids` (Many2many → res.users) — Users allowed to access

**Key Methods:**
- `search()` — Override to filter by current user's allowed journals
- `default_get()` — Pre-populate user_ids in form
- `_name_search()` — Filter search results

#### 2. **res.users Extension** (`account.py`)
**1 field + 1 method**

**Field:**
- `journal_ids` (Many2many → account.journal) — Allowed journals

**Key Method:**
- `default_get()` — Set default journals

#### 3. **res.company Extension** (`res_config_settings.py`)
**2 fields** for global config
- `journal_ids`, `user_ids` (Many2many)

#### 4. **res.config.settings** (`res_config_settings.py`)
**2 fields** for settings
- `journal_ids`, `user_ids`

---

### Views
- `account_views.xml` — Journal form with user field
- `res_config_settings.xml` — Settings form

---

## BIZ Accounting Module

**Purpose:** Collection of 14+ accounting report modules in **`develop/`** subdirectory.

### Sub-modules (Brief Overview)

1. **biz_account_counterpart** — Account counterpart reporting
2. **biz_account_public_diary** — Public diary/ledger
3. **biz_account_report_filter_account** — Report filtering
4. **biz_accounting_balance_sheet** — Balance sheet (BCTC)
5. **biz_advance_cashflow** — Cash flow analysis
6. **biz_ams_report_handler** — AMS-specific report handling
7. **biz_balance_sheet_according_to_circular_no_200** — Compliance reporting
8. **biz_bank_deposit_book** — Bank reconciliation
9. **biz_cash_book_money** — Cash book
10. **biz_cash_flows_report** — Cash flow statements
11. **biz_details_of_account_books** — Account details
12. **biz_ledger_according_to_circular_no_200** — Ledger (circular compliance)
13. **biz_profit_loss_statement** — P&L statement
14. **biz_purchase_invoices_list** — Purchase invoice list
15. **biz_sales_invoice_list** — Sales invoice list
16. **biz_theme_responsive** — UI theme
17. **report_xlsx** — XLSX report export

Each provides Vietnamese accounting reports per VN circular 200 standards.

---

## Key Architecture Patterns

### 1. **Inheritance & Extension**
- Models heavily extend core Odoo models rather than replacing them
- Use `_inherit = "target.model"` pattern
- Example: `account.move` has 30+ custom fields across modules

### 2. **Computed Fields with Dependencies**
```python
@api.depends('contract_id', 'contract_id.mall_id')
def _compute_mall_id(self):
    self.mall_id = self.contract_id.mall_id
```
- Heavy use of `@api.depends()` to auto-update fields
- Reduces manual data entry errors
- Used for copying related data

### 3. **onchange Handlers**
```python
@api.onchange('contract_id')
def _onchange_contract(self):
    self.deal_code = self.contract_id.deal_code
```
- UI-level field updates (no save required)

### 4. **Tracking & Notifications**
```python
name = fields.Char(..., tracking=True)
```
- Mail.thread messages posted on field changes
- Used in `mall_income_config.write()` to notify mall on updates

### 5. **Action Methods**
```python
def action_post(self):
    # Custom logic before/after posting
    res = super().action_post()
    self._action_send_invoice_email()
    return res
```
- Override standard actions with custom business logic
- Examples: `action_post()`, `action_confirm_finish()`, `button_draft()`

### 6. **API Key Authentication**
```python
@http.route('/path', auth='api_key', methods=['POST'])
def endpoint(self):
    # Custom auth handler in IrHttp
```
- Custom `api_key` authentication for LMS integration
- API key stored in `auth.api.key` model

### 7. **Queue Jobs for Async Sync**
- OCA `queue_job` module used for background sync tasks
- Cron jobs trigger sync in batches
- Prevents blocking user operations

### 8. **SQL Queries for Complex Reports**
```python
self._cr.execute(query)
data = self._cr.dictfetchone()
```
- Raw SQL for complex aging reports
- Example: `account.move.get_deposit_amount()` with CTEs

### 9. **Mixin Classes for Reusability**
- `ScidMailNotificationMixin` — Shared email logic
- `SInvoiceBase` — Shared S-Invoice fields
- Abstract models inherit by multiple concrete models

### 10. **Context Flags for Conditional Logic**
```python
if self.env.context.get('bypass_sync_to_lms'):
    # Skip sync
```
- Control behavior via context dict
- Used in: `bypass_customization`, `skip_auto_send_invoice_email`, `generate_sinvoice_payment`

---

## Model Relationships

### Core Domain

```
mall.mall (1)
+- mall.floor (n) — floors in mall                      
|  +- leasing.contract (n) — contracts on floor         
|     +- res.partner (1) — tenant                       
|     +- account.move (n) — invoices for contract       
|        +- account.move.line (n)                       
|        +- account.payment (n) — partial payments      
|        +- account.move (late fees) — late payment fees
+- mall.income.config (n) — income types per floor      
|  +- income.type (1) — fee type                        
|     +- account.account (1) — revenue account          
|     +- account.tax (1) — tax to apply                 
+- deposit.category (n) — deposit types                 
+- account.journal (n) — profit/cost/bank journals      
+- res.partner (1) — accountant                         

account.move (Invoice/Entry)
+- leasing.contract (1) — related contract                              
+- mall.mall (1) — via journal/contract                                 
+- account.move.line (n)                                                
|  +- income.type (1) — fee type for line                               
+- account.payment (n) — partial payments                               
+- account.move (late_payment_original_move_id) --> late fees (One2many)

res.partner (Contact)
+- leasing.contract (n) — as tenant    
+- account.move (n) — customer/vendor  
+- res.partner.bank (n) — bank accounts
+- auth.api.key (n) — API keys (LMS)   

invoicing.mec (Billing Period)
+- account.move (n) — invoices in period (via date range)

sinvoice.account (e-Invoice Provider)
+- sinvoice.template (n) — invoice templates       
   +- account.journal (n) — journals using template
```

---

## Data Flow & Sync Strategy

### AMS → LMS Sync (Outbound)

```
User creates/modifies in AMS
    v
Model's write() method sets lms_sync_needed = True
    v
Queue Job picks up (or Cron runs)
    v
Sync Helper formats data for LMS API
    v
POST to LMS REST endpoint (/account_move/sync, /partner/sync, etc.)
    v
LMS returns AMS ID <-> LMS ID mapping
    v
Store lms_id in AMS record, last_lms_sync_at = now
```

**Sync Trigger Points:**
- `income.type.write()` / `create()` → sync via cron
- `deposit.category.write()` / `create()` → sync via cron
- `invoicing.mec.write()` / `create()` / state changes → sync via cron
- `account.move.write()` if lms_sync_needed → immediate or queued
- Deposit entries on `account.move.action_post()` → sync deposit detail

### LMS → AMS Sync (Inbound)

```
LMS initiates POST to AMS endpoint
    v
Controller validates API key (IrHttp._auth_method_api_key)
    v
Controller validates JSON schema (SchemaHelper)
    v
Data Transformer maps LMS fields --> Odoo fields
    v
Create new records (if lms_id not found)
    OR
Update existing records (if lms_id found)
    v
Return mapping of {lms_id: ams_id, line_ids: [...]}
```

**Supported LMS → AMS Endpoints:**
- `/account_move/sync` — Invoices
- `/account_move/cancel` — Cancel invoices
- `/partner/sync` — Partners
- `/contract/sync` — Leasing contracts
- `/mall/sync` — Malls
- `/floor/sync` — Floors
- `/bank/sync` — Banks
- `/bank_account/sync` — Bank accounts
- `/account_payment/sync` — Payments

### E-Invoice (S-Invoice) Flow

```
User selects S-Invoice template on account.move
    v
User clicks "Send S-Invoice"
    v
action_send_sinvoice_email()
    v
API call to PC S-Invoice system
  - Pass: invoice data, customer email, serial number
  - Get: S-Invoice number, issued date, UUID
    v
Update move with:
  sinvoice_no, sinvoice_state, transaction_uuid
    v
Send email to customer with S-Invoice link
    v
Cron job periodically checks payment status at PC API
    v
Update sinvoice_payment_state when paid
```

### Late Payment Fee Calculation

```
InvoicingMEC created (e.g., for period 2026-01-01 to 2026-01-31)
    v
User triggers: get_late_payment_invoice(mec_id)
    v
Query invoices due in period with deffered_interest > 0
    v
For each unpaid invoice:
  1. Find all payments made during MEC period
  2. Calculate interest on paid amount (days × rate × amount)
  3. Calculate interest on unpaid residual
  4. Create journal entry with calculated fees
    v
Store late_payment_created_move_ids link for tracking
```

### Lease Renewal Reminder Flow

```
Cron job runs monthly: _run_reminder()
    v
Find contracts expiring in 6 months with is_reminder_sent = False
    v
Group by assignee (user_id)
    v
For each group:
  Send mail template to:
  - scid_leasing.group_mall_manager
  - scid_leasing.group_scid_leasing_team
  - Exclude: scid_leasing.group_lms_administrator
    v
Set is_reminder_sent = True to prevent duplicate
```

---

## Summary

**AMS** is a comprehensive leasing & invoicing management system built on Odoo 16 Enterprise with:

1. **Core Domain Models** — Malls, floors, leasing contracts, tenants, income types
2. **Advanced Invoicing** — Multi-type invoices, proforma, deposits, late fees, debt aging
3. **Sync Integration** — Two-way REST API with LMS system (queue_job async)
4. **E-Invoicing** — S-Invoice (PC) integration for Vietnamese e-invoices
5. **Email Workflows** — Automated notifications on lease milestones
6. **Multi-module Architecture** — 9 custom modules + 14 accounting report modules
7. **Vietnamese Compliance** — VAT, address formats, circular 200 reporting

**Key Technologies:**
- Odoo 16 Enterprise (models, controllers, wizards)
- OCA queue_job (async sync)
- REST API (JSON schema validation)
- Custom authentication (API keys)
- SQL queries (complex reports)
- Mail templates & groups
- Computed fields & dependencies

---

**Total Lines of Code:** ~15,000+ across all modules
**Models Extended:** 30+
**Controllers:** 8
**Wizards:** 4
**Reports:** 17+
**Cron Jobs:** 5+
