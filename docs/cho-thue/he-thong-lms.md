# Tổng hợp toàn bộ LMS (lms.scid.vn)

## Thông tin hệ thống

- **Tên**: Leasing Management System (LMS) — hệ thống quản lý cho thuê mặt bằng
- **Nền tảng**: Odoo 16 với 5 custom module + 5 OCA module
- **Domain**: lms.scid.vn
- **Server**: Ubuntu 22.04.3 LTS, hostname `lms-1-odoo`, IP nội bộ `10.1.2.5`, 15 GB RAM
- **Tích hợp**: AMS (Asset Management System) — đồng bộ tự động qua cron mỗi 1 giờ
- **User**: 12 người (scid-jsc.com + sensemarket.vn + portcities.net/tư vấn triển khai)

---

## Backend / Kiến trúc kỹ thuật

### Cấu hình Odoo (`/etc/odoo-server.conf`)
- **DB**: `LMS_Production` (PostgreSQL 14)
- **Port**: 8069 (HTTP), 8072 (gevent/longpolling)
- **Workers**: 9 worker processes + gevent, max_cron_threads = 2
- **server_wide_modules**: `base, web, queue_job`
- **Addons path**: `/opt/odoo/odoo-server/addons`, `/opt/odoo/custom/custom`, `/opt/odoo/custom/oca`

### Custom Modules (`/opt/odoo/custom/custom/`)

| Module | Version | Mô tả |
|--------|---------|-------|
| `scid_leasing` | 16.0.2.0.0 | Core module: Mall, Cho thuê (Deal→LAF→OL→Contract→Appendix/Termination) |
| `scid_invoicing` | 1.0 | Hóa đơn: invoicing.mec, invoicing.tos, invoicing.utility, tạo HĐ hàng loạt |
| `scid_ams_sync` | 16.0.1.0.0 | REST API + cron đồng bộ LMS↔AMS |
| `scid_leasing_mail_workflow` | 16.0.1.0.0 | 26 email template thông báo workflow cho thuê |
| `scid_mail_notification_mixin` | — | Mixin chung cho mail notification |

### OCA Modules (`/opt/odoo/custom/oca/`)
`queue_job`, `web_chatter_position`, `web_environment_ribbon`, `web_responsive`, `web_widget_open_tab`

### AMS Integration (`scid_ams_sync`)

**REST API endpoints** (auth: `api_key`):

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/account_move/update_state` | POST JSON | AMS → LMS: cập nhật trạng thái hóa đơn |
| `/deposit_entry/post` | POST JSON | AMS → LMS: xác nhận ghi nhận tiền cọc |
| `/deposit_category/...` | POST JSON | Đồng bộ danh mục cọc |
| `/income_type/...` | POST JSON | Đồng bộ loại thu nhập |
| `/invoicing_mec/...` | POST JSON | Đồng bộ kỳ hóa đơn MEC |

**Cron jobs** (LMS → AMS, mỗi 1 giờ):
- Sync Partner → `res.partner.cron_sync_partners()`
- Sync Account Move → `account.move.cron_sync_account_moves()`
- Sync Mall → `mall.mall.cron_sync_malls()`
- Sync Floor → `mall.floor.cron_sync_floors()`
- Sync Payment → `account.payment.cron_sync_payments()`
- Sync Contract — hiện **disabled** (`active=False`)

**Cron invoicing** (mỗi 3 giờ):
- `account.move.trigger_to_generate_invoices_for_contracts()` — tự động tạo hóa đơn hàng loạt

### Email Templates (`scid_leasing_mail_workflow`)
26 templates thông báo qua từng bước workflow (subject: `[Cho thuê] {mall} - {brand} - ...`):

| Đối tượng | Templates |
|-----------|-----------|
| LAF (Phiếu duyệt thuê) | Mới, Yêu cầu phê duyệt, Bị từ chối, Đã được duyệt |
| OL (Thư chào thuê) | Yêu cầu xác nhận, Đã được xác nhận |
| Hợp đồng | Yêu cầu phê duyệt, Bị từ chối, Đã duyệt, Yêu cầu xác nhận, Đã xác nhận, Bàn giao mặt bằng, Đã hủy, Đã hiệu lực, Sắp hết hạn |
| Phụ lục | Yêu cầu phê duyệt, Bị từ chối, Đã duyệt, Yêu cầu xác nhận, Đã xác nhận |
| Thanh lý | Yêu cầu phê duyệt, Bị từ chối, Đã duyệt, Yêu cầu xác nhận, Yêu cầu bàn giao, Đã hoàn thành |

### Số liệu DB thực tế (`LMS_Production`)

| Bảng | Tổng bản ghi | Ghi chú |
|------|-------------|---------|
| `leasing_deal` | 45 | 10 đang thuê, 16 đã thanh lý, 11 hủy... |
| `leasing_contract` | 93 | Bao gồm lịch sử/phụ lục |
| `mall_location` | 63 | 36 trống, 20 đang thuê, 2 thỏa thuận |
| `invoicing_mec` | 20 | Kỳ hóa đơn |
| `mall_mall` | 1 | SMCB1 |

---

## 1. Mall Module

### Menu structure
```
Mall (ID 222)
├── Mall (action 313) → model: mall.mall
├── Tầng (action 314) → model: mall.floor
├── Vị trí (action 315) → model: mall.location
└── Thiết lập
    ├── Loại hình Mall (action 316) → model: mall.category
    ├── Loại phí (action 317) → model: leasing.fee.type
    ├── Loại vị trí (action 318) → model: mall.location.type (?)
    └── Ngành hàng (action 291) → shared với Cho thuê
```

### model: mall.mall
Đại diện cho 1 khu thương mại. Hiện có **1 bản ghi**:

| Field | Value |
|-------|-------|
| Tên | SenseMarket Cái Bè |
| Số hiệu | SMCB1 |
| Loại hình | Market |
| Địa chỉ | Huyện Cái Bè, Đồng Tháp |
| Đơn vị quản lý | Công ty TNHH MTV TM DV Sense Cái Bè |
| Ngày bắt đầu | 30/12/2023 |
| GFA | 5,235 m² |
| NLA | 3,526.67 m² (tỷ lệ hữu dụng 67.37%) |
| Bãi xe | 1,000 m² |
| Số tầng | 5 |
| Tổng vị trí | 40 |

**Định nghĩa fields** (`mall.mall`):

| Field | Tên hiển thị | Kiểu | Bắt buộc |
|-------|-------------|------|----------|
| `name` | Mall | char | ✓ |
| `code` | Số hiệu | char | ✓ |
| `mall_category_id` | Loại hình | many2one → `mall.category` | ✓ |
| `manager_id` | Đơn vị quản lý | many2one → `res.partner` | ✓ |
| `responsible_partner_id` | Người đại diện | many2one → `res.partner` | ✓ |
| `date_start` | Ngày bắt đầu hoạt động | date | ✓ |
| `area_gfa` | Diện tích GFA (m²) | float | ✓ |
| `area_nla` | Diện tích NLA (m²) | float | |
| `area_non_nla` | Diện tích Non-NLA (m²) | float | |
| `usable_rate` | Tỷ lệ hữu dụng (%) | float | |
| `parking_area` | Diện tích bãi xe (m²) | float | |
| `bike_slot` | Sức chứa xe máy | integer | |
| `car_slot` | Sức chứa ô tô | integer | |
| `floor_ids` | Danh sách tầng | one2many → `mall.floor` | |
| `location_ids` | Danh sách vị trí | one2many → `mall.location` | |
| `mall_income_ids` | Tiện ích/Income | one2many | |
| `bank_ids` | Tài khoản ngân hàng | one2many | |
| `contact_ids` | Liên hệ | one2many | |
| `mall_image_ids` | Hình ảnh | one2many | |
| `profit_center_id` | Profit Center | many2one | |
| `cost_center_id` | Cost Center | many2one | |
| `last_ams_sync_at` | Đồng bộ AMS lần cuối | datetime | |
| `ams_sync_needed` | Đang chờ đồng bộ | boolean | |

### model: mall.floor (Tầng)
**5 tầng** tại SMCB1:

| Tầng | NLA (m²) | Vị trí | Trống | Lấp đầy |
|------|----------|--------|-------|---------|
| Khối Cố Định - Tầng 1 | 1,956.88 | 8 | 3 | 8.57% |
| Khối Cố Định - Tầng 2 | 876.95 | 7 | 1 | 65.22% |
| Khối Ending - Tầng 1 | 152.59 | 1 | 0 | 100% |
| Khối Ending - Tầng 2 | 177.79 | 1 | 1 | 0% |
| Khối Mở | 362.46 | 23 | 17 | 41.11% |

**Định nghĩa fields** (`mall.floor`):

| Field | Tên hiển thị | Kiểu | Bắt buộc |
|-------|-------------|------|----------|
| `code` | Số hiệu | char | ✓ |
| `mall_id` | Mall | many2one → `mall.mall` | ✓ |
| `area_nla` | Diện tích NLA (m²) | float | |
| `area_non_nla` | Diện tích Non-NLA (m²) | float | |
| `location_ids` | Danh sách vị trí | one2many → `mall.location` | |
| `booked_location_ratio` | Tỉ lệ lấp đầy (%) | float | |
| `layout_image` | Sơ đồ mặt bằng | binary | |
| `layout_data` | Layout Data (JSON) | text | |
| `tooltip_data` | Tooltip Data (JSON) | text | |
| `ams_id` | AMS ID | integer | |
| `last_ams_sync_at` | Đồng bộ AMS lần cuối | datetime | |

> Có `layout_image` (Sơ đồ mặt bằng) và `layout_data`/`tooltip_data` — dùng cho interactive floor map

### model: mall.location (Vị trí)
**40 vị trí** với đầy đủ thông tin:
- Code: A1.01, A1.02..., B1, B2, C1.01... (theo khối)
- Trạng thái: `Trống`, `Đang cho thuê`, `Thỏa thuận`, `Khởi tạo`
- Trạng thái nhập/tách: các vị trí có thể gộp/tách (e.g. "A1.02, A1.03")
- Hiệu lực từ/đến ngày — hầu hết từ 30/12/2023 đến 30/12/2073 (50 năm)
- Liên kết với `contract_id`, `current_deal_id`, `brand_id`

**Định nghĩa fields** (`mall.location`):

| Field | Tên hiển thị | Kiểu | Bắt buộc |
|-------|-------------|------|----------|
| `code` | Số hiệu | char | ✓ |
| `mall_id` | Mall | many2one → `mall.mall` | ✓ |
| `floor_id` | Tầng | many2one → `mall.floor` | ✓ |
| `date_start` | Hiệu lực từ ngày | date | |
| `date_end` | Hiệu lực đến ngày | date | |
| `area` | Diện tích (m²) | float | |
| `state` | Trạng thái | selection | |
| `category_id` | Loại vị trí | many2one → `mall.location.type` | |
| `business_category_id` | Ngành hàng | many2one → `leasing.business.category` | |
| `deal_ids` | Danh sách Deal | one2many → `leasing.deal` | |
| `current_deal_id` | Thỏa thuận hiện tại | many2one → `leasing.deal` | |
| `contract_id` | Hợp đồng | many2one → `leasing.contract` | |
| `brand_id` | Thương hiệu | many2one | |
| `rental_end_date` | Ngày hết hạn HĐ | date | |
| `construction_state` | Trạng thái nhập/tách | selection | |
| `parent_ids` | Vị trí cha (nhập) | many2many → `mall.location` | |
| `child_ids` | Vị trí con (tách) | many2many → `mall.location` | |
| `location_type` | Phân loại | selection (NLA/Non-NLA) | |
| `layout_data` | Layout Data (JSON) | text | |
| `tooltip_data` | Tooltip Data (JSON) | text | |
| `ams_id` | AMS ID | integer | |

### Thiết lập Mall

**Loại hình Mall** (mall.category): 5 loại
- Plaza (PL), Market (SM), Festi (FE), Gallery (GA), City (CT)

**Loại phí** (leasing.fee.type): 13 loại phí
- Tiền Thuê Cơ Bản (vnd/m²/tháng)
- Tiền Thuê Cơ Bản Diện Tích Bên Ngoài (vnd/tháng)
- Phí Dịch Vụ (vnd/m²/tháng)
- Phí Dịch Vụ Diện Tích Bên Ngoài (vnd/tháng)
- Phí Vệ Sinh (vnd/m²/tháng)
- Phí Vệ Sinh Diện Tích Bên Ngoài (vnd/tháng)
- Phí QC&KM (vnd/m²/tháng)
- Phí QC&KM Diện Tích Bên Ngoài (vnd/tháng)
- Tiền Chia Sẻ Doanh Thu (vnd/tháng)
- Tiền Chia Sẻ Doanh Thu Diện Tích Bên Ngoài (vnd/tháng)
- Tiền Điện (vnd/kwh)
- Tiền Gas (vnd/kg)
- Tiền Nước (vnd/m³)

**Loại vị trí**: 2 loại — Boutique (NLA), Kiosk (NLA)

---

## 2. Cho thuê Module (scid_leasing)

```
Cho thuê (ID 204)
├── Hợp đồng
│   ├── Thỏa thuận (action 304) → leasing.deal
│   ├── Phiếu duyệt thuê/LAF (action 305) → leasing.laf
│   ├── Thư chào thuê/OL (action 306) → leasing.ol
│   ├── Hợp đồng (action 307) → leasing.contract
│   ├── Phụ lục hợp đồng (action 308) → leasing.appendix
│   └── Phiếu thanh lý (action 309) → leasing.termination
├── Hoạt động khác
│   ├── Báo cáo điện nước gas (→ invoicing.utility)
│   ├── Báo cáo doanh thu khách thuê (→ invoicing.tos)
│   └── Đề nghị thanh toán cọc (→ account.move)
├── Báo cáo
│   ├── Tình trạng cho thuê (action 297) → wizard: leasing.report.wizard
│   └── Tình trạng theo tháng/quý (action 299) → wizard: leasing.report.month.wizard
└── Thiết lập
    ├── Loại đặt cọc (action 311)
    ├── Ngành hàng (action 291) → shared với Mall
    ├── Thương hiệu (action 303)
    ├── Quy chuẩn thi công (action 310)
    ├── Thẻ trạng thái vị trí (action 296)
    └── Phân quyền phê duyệt (action 312)
```

### Workflow nghiệp vụ
```
Thỏa thuận (Deal) 
  → LAF (Phiếu duyệt thuê, approval workflow)
    → OL (Thư chào thuê)  
      → Hợp đồng 
        ├── Phụ lục hợp đồng (sửa đổi)
        └── Phiếu thanh lý (kết thúc)
```

### Dữ liệu hiện tại
- 33 Thỏa thuận (Đang thuê, Chờ duyệt phụ lục, Đã thanh lý, Chờ thanh lý, Đang thỏa thuận)
- 12 LAF, 11 OL, 33 Hợp đồng, 63 Phụ lục, 20 Thanh lý
- 501 bản ghi điện/nước/gas, 54 báo cáo doanh thu

### Báo cáo
**Báo cáo tình trạng cho thuê** (action 297 — `leasing.report.wizard`):
- Input: Từ ngày / Đến ngày
- Output: Excel với 39 vị trí, phân tích chi tiết từng vị trí

**Báo cáo tháng/quý** (action 299 — `leasing.report.month.wizard`):
- Fields: `report_month`, `report_year`, `report_type` (month/quarter), `position_type` (nla/non_nla)
- Output: `file_data` (binary Excel)

---

## 3. Lên hóa đơn (Invoicing Module — Odoo Standard)

```
Invoicing (ID 136)
├── Customers
│   ├── Invoices (action 243) → account.move (831 hóa đơn)
│   ├── Tạo hóa đơn thủ công (action 325) — SCID custom wizard
│   ├── Credit Notes (action 244)
│   ├── Payments (action 220)
│   ├── Products (action 265)
│   └── Customers (action 273)
├── Vendors
│   ├── Bills (action 245)
│   ├── Refunds (action 246)
│   ├── Payments (action 221)
│   ├── Products (action 266)
│   └── Vendors (action 274)
├── Reporting
│   └── Management (không có action)
└── Configuration
    ├── Settings (action 271)
    ├── Invoicing, Banks, Accounting, Payments, Management...
```

**831 hóa đơn** khách hàng:
- Trạng thái: `Dự thảo`, `Đã vào sổ`
- Thanh toán: hầu hết `Chưa trả`
- Số hóa đơn: HD/2025/XXXXX
- Columns: Số, Mã hợp đồng, Khách hàng, Ngày hóa đơn, Ngày phải trả, Chưa kèm thuế, Tổng, Tình trạng thanh toán, Trạng thái

**Tạo hóa đơn thủ công** (action 325) — SCID custom:
- Wizard chọn: Kỳ xuất hóa đơn (hiện tại/tiếp theo/khoảng thời gian), Mall, Mã hợp đồng
- Tự động tạo hóa đơn hàng loạt theo hợp đồng

---

## 4. Liên hệ (Contacts Module)

```
Contacts (ID 105)
├── Khách hàng (action 300) → res.partner (42 khách hàng)
├── Liên hệ nội bộ (action 301)
└── Configuration
```

**42 khách hàng** (bên thuê) với:
- Mã: DN000001... (Doanh nghiệp), CN000001... (Cá nhân)
- Loại: Cty Cổ phần, Cty TNHH MTV, Hộ Kinh Doanh, Cá Nhân
- Thương hiệu liên kết
- Liên hệ chính + SĐT

Tenant tiêu biểu: JOLLIBEE (DN000001), FAHASA (DN000003), PNJ (DN000006), SAKOS (DN000004), BABAMAMA (DN000013)

---

## 5. Thảo luận (Discuss Module — Odoo Standard)

Module ID 80, không có submenu — là module nhắn tin nội bộ Odoo chuẩn (chat, channels, DM).

---

## 6. Job Queue Module

```
Job Queue (ID 122)
└── Queue
    ├── Jobs (action 175) → queue.job
    ├── Channels (action 176)
    └── Job Functions (action 177)
```

Module OCA `queue_job` — quản lý async background jobs. Hiện không có job nào đang chờ.
Dùng cho các tác vụ nặng chạy nền (xuất báo cáo, đồng bộ AMS, tạo hóa đơn hàng loạt).

---

## 7. Trang tổng quan (Dashboards)

```
Dashboards (ID 127)
├── Dashboards (action client 183) — dashboard view
└── Configuration
```

Dashboard Finance/Invoicing hiển thị:
- Đã xuất hóa đơn (unpaid count)
- Average Invoice
- DSO (Days Sales Outstanding)
- Bộ lọc: 7/30/90/180/365 ngày, 3 năm qua

---

## 8. Ứng dụng (Apps — Odoo Standard)

Module quản lý cài đặt app Odoo. Không có submenu tùy chỉnh.

---

## 9. Thiết lập (Settings)

```
Settings (ID 4)
├── General Settings (action 90)
└── Users & Companies
    ├── Users (action 70) → res.users (12 users)
    └── Companies (action 53)
```

**12 users**:
- scid-jsc.com: yen-hk, dung-nt, my-phh, duy-pt, nguyen-tck, phu-dh, phuong-dt
- sensemarket.vn: huan-nc, ketoan, liem-nt, vanhanh
- portcities.net: dang (tư vấn triển khai PCV)

---

## Kiến trúc tổng thể

```
Custom Modules:
  scid_leasing   → Mall, Cho thuê (Deal→LAF→OL→Contract→Appendix/Termination)
  scid_invoicing → invoicing.utility, invoicing.tos, leasing.report.*.wizard, Tạo HĐ thủ công

Standard Odoo:
  account         → Invoicing (Customers/Vendors)
  res.partner     → Contacts
  discuss         → Thảo luận
  queue_job (OCA) → Job Queue
  board           → Dashboards

Integration:
  AMS (Asset Management System) → sync mall, floor, location data
  Trường: ams_id, last_ams_sync_at, ams_sync_needed trên mall.mall, mall.floor, mall.location
```

---

## Mối liên hệ giữa các model chính

```
mall.mall (1)
  └── mall.floor (5) 
        └── mall.location (40)
              └── leasing.deal (33) [current_deal_id, deal_ids]
                    └── leasing.laf (12)
                          └── leasing.ol (11)
                                └── leasing.contract (33)
                                      ├── leasing.appendix (63)
                                      └── leasing.termination (20)

leasing.contract → account.move (hóa đơn tháng)
invoicing.utility → điện/nước/gas per hợp đồng/tháng
invoicing.tos → doanh thu khách thuê per hợp đồng/tháng
```

DONE — đã khám phá toàn bộ 9 module frontend + backend server (custom modules, AMS sync, cron jobs, DB schema).
