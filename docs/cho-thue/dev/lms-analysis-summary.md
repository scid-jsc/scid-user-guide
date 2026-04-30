# LMS Server Analysis - Executive Summary

**Generated:** 2026-04-04  
**Server:** 10.1.2.5 (Odoo 16 Community)  
**Database:** LMS_Production  
**Analysis Scope:** 7 custom modules, 165 Python files

---

## What is LMS?

LMS (Learning/Leasing Management System) is a **specialized Odoo 16 application** managing:
- **Shopping mall/retail space leasing** (deals, contracts, amendments, terminations)
- **Invoice generation** by monthly billing periods (MEC - Monthly Equivalent Cycles)
- **Accounting integration** with AMS server (Asset Management System) via REST API
- **Approval workflows** for contracts and amendments
- **Vietnamese address hierarchy** (province > district > ward)

---

## 7 Custom Modules

### 1. **scid_leasing** (16.0.2.0.0) — 80+ model classes
Core domain: Deals → Contracts → Appendixes/Terminations with complex approval chains.

**Key Models:**
- `leasing.deal` — Central entity with 13-state workflow
- `leasing.contract` — Signed lease agreement (5-state workflow)
- `leasing.approval` — Sequential approval chain with 3+ approvers
- `mall.mall`, `mall.floor`, `mall.location` — Property structure
- `leasing.deposit`, `leasing.income.rental`, `leasing.income.share` — Financial details

**Complexity:** 
- Multi-level state machines (deal state depends on contract state, appendix state, termination state)
- 200+ fields per leasing.base (shared base class)
- Complex computed fields with 10+ dependencies

### 2. **scid_ams_sync** (16.0.1.0.0) — REST API + async sync
Bidirectional integration with AMS (10.1.2.6) using API Keys and batch queue jobs.

**Endpoints:**
- `POST /account_move/update_state` — AMS pushes accounting status updates
- `POST /deposit_entry/post` — AMS records deposit confirmations
- `POST /deposit_entry/get_deposit_contract` — Query endpoint

**Architecture:**
- API Key auth (`X-Api-Key` + `Origin` headers)
- Schema validation for requests
- Data transformation helpers (connector + sync patterns)
- Async batch processing (default 50 records/job)
- Cron fallback for missed syncs

### 3. **scid_invoicing** (1.0) — Invoice generation
Monthly invoice scheduling and generation linked to contracts.

**Models:**
- `invoicing.mec` — Period management (only 1 active at a time)
- `invoicing_mec.state` — draft → active → closed → cancelled
- Auto-generates `account.move` entries for leasing contracts

### 4. **scid_leasing_mail_workflow** (16.0.1.0.0)
Email notifications on deal state changes (approval, rejection, termination).

### 5. **scid_mail_notification_mixin** (16.0.1.0.0)
Base mixin for reusable email notification patterns.

### 6. **vn_address** (1.0)
Vietnamese address hierarchy: Country → State → Region → District → Ward

### 7. **web_plan_layout** (16.0.1.0.0)
Custom Kanban-like "plan" view for visual workflow display.

---

## Key Architectural Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Computed State** | Derive state from related records | `leasing.deal.state` from `contract_ids`, `appendix_ids`, `termination_ids` |
| **Stored Computed** | Cache computed value for fast queries | 15+ fields with `store=True` |
| **Multi-level States** | Preserve detail while showing summary | `contract.state` (approval) vs `contract.contract_summary_state` (deal) |
| **Context Bypass** | Prevent circular sync | `bypass_sync=True` context flag when AMS pushes updates |
| **Batch Queue** | Async bulk operations | `with_delay()._sync_contracts()` (50 per batch) |
| **Approval Chain** | Sequential approvers | Each approver has own `leasing.approval` record |
| **Data Transform** | ETL pattern | Dataclass-based `AccountMoveDataTransform` helper |
| **API Key Auth** | Service-to-service auth | `ir.http._auth_method_api_key()` override |

---

## Data Flow: Deal Lifecycle

```
DRAFT (new deal)
  v
IN_DEAL (LAF form created)
  v
WAIT_APPROVAL (LAF submitted, awaiting approvals)
  v
ON_AGREEMENT (LAF approved, contract negotiation begins)
  v [Contract created, must be approved and confirmed]
WAIT_TRANSFER (contract signed, waiting for space handover)
  v
CONSTRUCTION (handover done, waiting for rental start)
  v
LEASING (rental_start_date reached, active lease)
  v [optional] APPENDIX_APPROVAL (contract amendment)
  v [or] TERMINATION_WAITING --> ... --> TERMINATION_DONE
```

**State Determinism:** Computed by `leasing.deal.get_deal_status()` based on:
- Draft/waiting/approved LAF counts
- Contract confirmations + handover doc presence
- Appendix pending statuses
- Termination stage

---

## AMS Sync Flow

```
LMS Creates Contract
  v
create() hook triggers _action_sync_to_ams()
  v
Sets ams_sync_needed=False, marks last_ams_sync_at
  v
Batches into 50-record chunks
  v
with_delay()._sync_contracts() (async job)
  v
POST to AMS /contracts/sync with contract data
  v
AMS responds with sync status

[Fallback] cron_sync_contracts() runs daily
  v
Finds contracts with last_ams_sync_at=NULL or ams_sync_needed=True
  v
Re-queues via _action_sync_to_ams()
```

**Reverse Flow:** AMS POSTs to LMS endpoints
```
AMS POST /account_move/update_state
  v
LMS validates schema
  v
Transforms to LMS format via AccountMoveDataTransform
  v
Updates with .with_context(bypass_sync=True)
  v [prevents re-syncing back to AMS]
```

---

## Invoice Generation

```
User activates MEC (billing period) via action_active()
  v
Only ONE MEC can be 'active' at a time
  v
period_start_time, period_end_time computed
  v
Cron job: find all contracts active in [start, end]
  v
For each contract:
  - Base rental_income_ids --> amount per month
  - share_income_ids --> percentage of revenue
  - Create account.move with correct amount
  - Mark as is_proforma_invoice or posted
  v
Account entries synced to AMS via scid_ams_sync
```

---

## Important Fields to Know

### Leasing Deal
- `state` — workflow state (computed, stored)
- `code` — deal identifier
- `partner_id` — tenant company
- `location_id` — retail space
- `contract_ids` — active contracts (O2M)
- `active_contract_id` — currently effective (computed)
- `approval_ids` — approval chain (M2M)

### Leasing Contract
- `code`, `deal_id`, `state`
- `effective_date` — when contract becomes active
- `is_effective` — boolean flag
- `signed_attachment` — uploaded PDF (required for confirmation)
- `rental_start_date`, `rental_end_date`
- `ams_sync_needed`, `last_ams_sync_at` — AMS integration flags

### Account Move (Enhanced)
- `ams_id` — External AMS reference
- `is_proforma_invoice` — Draft invoice (one active per MEC)
- `is_deposit_difference_entry` — Auto-generated difference adjustment
- `suggested_deposit_amount` — AMS recommended security deposit
- Links to deal/contract/deposit for context

### Auth API Key
- `name`, `origin` (e.g., "10.1.2.6:8069"), `key`
- Unique constraint on `key`
- Generated via `generate_api_key()` (secrets.token_urlsafe)

---

## Critical Validation Rules

1. **Only ONE active MEC** — UI enforces via `action_active()`
2. **Contract confirmation requires signed_attachment** — Validated in `_check_confirm_signed_available()`
3. **No pending appendix/termination before creating new** — Checked in `_check_valid_to_create_appendix()`
4. **API Key must match both Origin + X-Api-Key** — Enforced in `_auth_method_api_key()`
5. **ams_sync_needed=False when last_ams_sync_at set** — Managed by sync helpers

---

## Security Notes

1. **API Keys:** Stored plain in database (consider encryption in production)
2. **CORS Origin Check:** Both Origin header and X-Api-Key must match auth.api.key record
3. **SUPERUSER Context:** AMS syncs use `SUPERUSER_ID` to bypass access rules
4. **bypass_sync Flag:** Prevents RCE via circular updates from malicious AMS

---

## Common Issues & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Contract state not advancing | Dependent records in wrong state | Check LAF approval, appendix, termination states |
| Sync not completing | Queue job failed, ams_sync_needed still True | Check cron_sync_contracts() or AMS connectivity |
| Invoice not generated | MEC not 'active' or contract outside period | Activate correct MEC, verify rental_start/end dates |
| Document upload fails | 5MB limit in wizard (base64 double-load) | Split file or increase Nginx client_max_body_size |
| Approval chain stuck | Next approver has no permissions | Check res.users, approval record state |

---

## Testing Checklist

- [ ] Deal state transitions through full lifecycle
- [ ] Contract confirmation copies approvals to deal correctly
- [ ] AMS sync batches correctly (chunks of 50)
- [ ] bypass_sync=True prevents re-sync to AMS
- [ ] API Key validation rejects missing Origin header
- [ ] Invoice generation respects MEC period dates
- [ ] Only one MEC can be active (enforced)
- [ ] Approval chain advances to next approver
- [ ] Vietnamese address hierarchy cascades correctly
- [ ] Computed fields recalculate on dependency change

---

## File Locations

**Analysis Documents:**
- `/tmp/LMS_CODEBASE_ANALYSIS.md` — Detailed module-by-module breakdown (505 lines)
- `/tmp/LMS_CODE_PATTERNS.md` — Code patterns & best practices (821 lines)
- `/tmp/LMS_ANALYSIS_SUMMARY.md` — This file

**LMS Modules (on server 10.1.2.5):**
- `/opt/odoo/custom/custom/scid_leasing/` (14 subdirectories, 75+ model files)
- `/opt/odoo/custom/custom/scid_ams_sync/` (38 Python files, REST API)
- `/opt/odoo/custom/custom/scid_invoicing/` (11 Python files, invoice generation)
- `/opt/odoo/custom/custom/scid_leasing_mail_workflow/` (email templates)
- `/opt/odoo/custom/custom/scid_mail_notification_mixin/` (base mixin)
- `/opt/odoo/custom/custom/vn_address/` (hierarchical address system)
- `/opt/odoo/custom/custom/web_plan_layout/` (custom views)

---

## Comparison: LMS vs AMS

| Aspect | LMS (10.1.2.5) | AMS (10.1.2.6) |
|--------|---|---|
| **Primary Entity** | Leasing Deal / Contract | Asset / Financial Record |
| **State Machine** | 13 states (deal) + 5 (contract) | Fewer states |
| **Data Flow** | LMS → AMS (contract creation) | AMS → LMS (accounting updates) |
| **API Direction** | Primarily outbound (LMS syncs to AMS) | Inbound endpoints (AMS pushes to LMS) |
| **Module Design** | Domain-driven (leasing concepts) | Financial accounting |

---

## Next Steps (For Developers)

1. **To add new sync field:**
   - Add field to model (e.g., leasing_contract.py)
   - Add to sync schema (scid_ams_sync/schemas/schemas.py)
   - Update connector helper (scid_ams_sync/utils/ams_connector_helper/*.py)
   - Add data transform logic (scid_ams_sync/utils/ams_sync_helper/*.py)
   - Test with cron_sync_contracts()

2. **To modify state machine:**
   - Update deal/contract state selections
   - Modify get_deal_status() logic in leasing.deal
   - Update email templates in scid_leasing_mail_workflow
   - Test state transitions via test cases

3. **To add new invoice type:**
   - Create model inheriting invoicing.base
   - Add to invoice generation cron logic
   - Link to account.move via foreign keys
   - Sync to AMS via scid_ams_sync controller

