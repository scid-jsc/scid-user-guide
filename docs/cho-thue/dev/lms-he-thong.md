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

Đồng bộ 2 chiều giữa **LMS** (Odoo) và **AMS** (Asset Management System):

```
LMS ---- cron 1h ----> AMS   (LMS chủ động đẩy dữ liệu sang)
LMS <--- REST API ---- AMS   (AMS gọi vào LMS khi cần cập nhật)
```

---

#### AMS gọi vào LMS (REST API — auth: `api_key`)

**Hóa đơn & Tiền cọc**

| Endpoint | Request body | Mô tả |
|----------|-------------|-------|
| `POST /account_move/update_state` | `{account_moves: [{lms_id, ams_id, state}]}` | AMS cập nhật trạng thái hóa đơn về LMS. `state` nhận: `draft` / `posted` / `cancel` |
| `POST /deposit_entry/post` | `{account_moves: [{lms_id, ams_id, amount}]}` | AMS xác nhận bút toán tiền cọc. Nếu `amount` < `suggested_deposit_amount` thì LMS tự tạo thêm bút toán chênh lệch |
| `POST /deposit_entry/get_deposit_contract` | `{account_moves: [{ams_id}]}` | AMS lấy mã hợp đồng liên kết với bút toán cọc. Response: `{ams_id, deposit_contract_code}` |

**Danh mục tra cứu** (AMS đẩy sang LMS khi có thay đổi master data)

| Endpoint | Request body | Mô tả |
|----------|-------------|-------|
| `POST /deposit_category/sync` | `{deposit_categories: [{code, name}]}` | Đồng bộ danh mục cọc → `leasing.deposit.category` |
| `POST /income_type/sync` | `{income_types: [{code, name, category, uom, invoice_description, credit_note_description, income_tax_id}]}` | Đồng bộ loại thu nhập → `mall.income`. `category`: `revenue_rent/basic_rent/service/marketing/cleaning/utility/other`. `uom`: `area/kwh/vnd/area_vnd/vnd_month/vnd_m3/vnd_kg` |
| `POST /invoicing_mec/sync` | `{mecs: [{code, invoice_period_monthly, invoice_period_annual, invoice_closing_date, invoice_proforma_date, state}]}` | Đồng bộ kỳ hóa đơn MEC → `invoicing.mec`. `state`: `draft/active/closed/cancelled` |

---

#### LMS đẩy sang AMS (Cron — mỗi 1 giờ)

| Cron | Model | Ghi chú |
|------|-------|---------|
| Sync Mall | `mall.mall` | Thông tin khu thương mại |
| Sync Floor | `mall.floor` | Thông tin tầng |
| Sync Partner | `res.partner` | Thông tin khách thuê |
| Sync Account Move | `account.move` | Hóa đơn |
| Sync Payment | `account.payment` | Thanh toán |
| ~~Sync Contract~~ | `leasing.contract` | **Disabled** (`active=False`) |

> Trường đồng bộ: `ams_id` (ID bên AMS), `last_ams_sync_at` (thời điểm sync cuối), `ams_sync_needed` (flag cần sync lại)

---

#### Cron tạo hóa đơn tự động (mỗi 3 giờ)

`account.move.trigger_to_generate_invoices_for_contracts()` — quét tất cả hợp đồng đang hiệu lực, tự động tạo hóa đơn định kỳ theo kỳ MEC

### Email Templates (`scid_leasing_mail_workflow`)

26 email template tự động thông báo theo từng bước workflow.

#### Cơ chế trigger

Email được gửi qua `_compute_approval_state` (computed field trên `leasing.base`):

```
approval_state --> 'waiting'   --> gửi "Yêu cầu phê duyệt" đến nhóm scid_leasing_team
approval_state --> 'approved'  --> gửi "Đã được duyệt"
approval_state --> 'rejected'  --> gửi "Bị từ chối"
write(signed_attachment)     --> gửi "Đã ký / tải tài liệu"
write(handover_attachment)   --> gửi "Bàn giao mặt bằng"  (hợp đồng)
action_confirm_finish()      --> gửi "Đã xác nhận / hiệu lực"
action_cancel()              --> gửi "Đã hủy"
```

#### Logic người nhận

Mỗi template định nghĩa danh sách **groups** nhận mail. Hệ thống:
1. Lấy tất cả user thuộc các groups được chỉ định
2. **Loại bỏ** luôn: `group_lms_administrator` (admin không nhận notification)
3. **Thêm vào**: `user_id` (salesperson phụ trách), và khi cần: `next_approver_id`

| Template | Người nhận chính |
|----------|-----------------|
| Yêu cầu phê duyệt | `scid_leasing_team` + `next_approver_id` |
| Đã được duyệt / Bị từ chối | `mall_leasing_team` + `user_id` |
| Đã xác nhận hợp đồng | `mall_manager` + `scid_leasing_team` + `mall_leasing_team` + kế toán (`account.group_account_manager`) |
| Đã hủy hợp đồng | `mall_manager` + `scid_leasing_team` |
| Bàn giao mặt bằng | `mall_manager` + `scid_leasing_team` + `mall_leasing_team` + kế toán |
| Sắp hết hạn hợp đồng | `user_id` của từng hợp đồng (email gộp nhiều HĐ/user) |

#### Danh sách 26 templates

| Đối tượng | Templates |
|-----------|-----------|
| LAF (Phiếu duyệt thuê) | Mới, Yêu cầu phê duyệt, Bị từ chối, Đã được duyệt |
| OL (Thư chào thuê) | Yêu cầu xác nhận, Đã được xác nhận |
| Hợp đồng | Yêu cầu phê duyệt, Bị từ chối, Đã duyệt, Yêu cầu xác nhận, Đã xác nhận, Bàn giao mặt bằng, Đã hủy, Đã hiệu lực, Sắp hết hạn |
| Phụ lục | Yêu cầu phê duyệt, Bị từ chối, Đã duyệt, Yêu cầu xác nhận, Đã xác nhận |
| Thanh lý | Yêu cầu phê duyệt, Bị từ chối, Đã duyệt, Yêu cầu xác nhận, Yêu cầu bàn giao, Đã hoàn thành |

**Format subject**: `[Cho thuê] {tên mall} - {thương hiệu} - {trạng thái}`

#### Cron nhắc nhở (5 job)

| Cron | Tần suất | Hành động |
|------|----------|-----------|
| Nhắc phê duyệt LAF | Mỗi 2 ngày | Gửi lại email "Yêu cầu phê duyệt" cho các LAF đang chờ |
| Nhắc phê duyệt Contract | Mỗi 2 ngày | Tương tự cho Hợp đồng đang chờ |
| Nhắc phê duyệt Appendix | Mỗi 2 ngày | Tương tự cho Phụ lục đang chờ |
| Nhắc phê duyệt Termination | Mỗi 2 ngày | Tương tự cho Thanh lý đang chờ |
| Nhắc hết hạn hợp đồng | Mỗi 1 tháng | Gửi email cảnh báo cho các HĐ hết hạn trong **6 tháng tới** (chỉ gửi 1 lần, flag `is_reminder_sent=True`) |

---

### Phân quyền (`scid_leasing`)

#### Nhóm người dùng (4 cấp)

Kế thừa theo chuỗi — nhóm cao hơn tự động có toàn bộ quyền của nhóm thấp hơn:

```
group_lms_administrator        <-- cao nhất (ERP Manager)
  +- group_scid_leasing_team   <-- SCID (xem tất cả mall)                
       +- group_mall_manager   <-- Quản lý mall                          
            +- group_mall_leasing_team  <-- Nhân viên leasing mall (base)
```

| Nhóm | Mô tả | Đặc quyền |
|------|-------|-----------|
| `group_mall_leasing_team` | Nhân viên leasing tại mall | Chỉ xem dữ liệu mall của mình |
| `group_mall_manager` | Quản lý mall | Xem + quản lý toàn bộ dữ liệu mall mình |
| `group_scid_leasing_team` | Đội SCID (HQ) | Xem + quản lý **tất cả** mall, full CRUD |
| `group_lms_administrator` | Admin hệ thống | Toàn quyền + ERP Manager; **không nhận** email notification |

> `group_lms_administrator` được gán tự động cho `user_root` và `user_admin`

#### Record-level Security (Row-level)

Tất cả dữ liệu nghiệp vụ bị giới hạn theo **mall được gán cho user** (`user.mall_ids`):

| Model | Rule |
|-------|------|
| `mall.mall` | Chỉ xem mall trong `user.mall_ids` |
| `mall.floor`, `mall.location` | Chỉ xem floor/location thuộc mall của user |
| `leasing.deal`, `leasing.laf`, `leasing.ol` | Chỉ xem deal/laf/ol thuộc mall của user |
| `leasing.contract`, `leasing.appendix`, `leasing.termination` | Chỉ xem HĐ/phụ lục/thanh lý thuộc mall của user |
| `res.partner` | Internal user: chỉ đọc partner có `is_customer=True`; `scid_leasing_team`: full CRUD |

> **Ngoại lệ**: `group_scid_leasing_team` có `domain_force=[(1,'=',1)]` — bỏ qua filter mall, xem toàn bộ dữ liệu

#### Ma trận CRUD

| Model | mall_leasing_team | mall_manager | scid_leasing_team | lms_administrator |
|-------|:-----------------:|:------------:|:-----------------:|:-----------------:|
| mall.mall | R | R | CRUD | CRUD |
| mall.floor / location | R | R | CRUD | CRUD |
| leasing.deal / laf / ol | R | CRUD | CRUD | CRUD |
| leasing.contract | R | CRUD | CRUD | CRUD |
| leasing.appendix / termination | R | CRUD | CRUD | CRUD |
| account.move (hóa đơn) | R | R | CRUD | CRUD |
| res.partner | R (customer only) | R | CRUD | CRUD |

### Dữ liệu nền (Master Data)

#### Ngành hàng (`business_category`) — 20 ngành đang dùng

Phân loại ngành kinh doanh của tenant, dùng khi tạo Deal/LAF:

| Ngành hàng |
|-----------|
| Nhà hàng |
| Thức uống và tráng miệng |
| Thời trang |
| Giày, dép, túi xách |
| Phụ kiện thời trang (trừ giày, dép, túi xách) |
| Đồ dùng gia đình, Nội thất |
| Công nghệ & Điện tử |
| Mỹ phẩm, nước hoa |
| Mẹ và bé |
| Thể thao |
| Du lịch |
| Siêu thị |
| Nhà sách, Cửa hàng tổng hợp |
| Phong cách sống |
| Đặc sản địa phương |
| Sản phẩm Tự doanh |
| Rạp phim |
| Khu vui chơi |
| Giáo dục |
| Máy rút tiền / Dịch vụ tiện ích |

#### Loại đặt cọc (`leasing_deposit_category`) — 4 loại

| Mã | Tên |
|----|-----|
| DC001 | Phí Trả Trước |
| DC002 | Phí Giữ Chỗ |
| DC003 | Tiền Đặt Cọc |
| DC004 | Tiền Đặt Cọc Thi Công |

#### Loại thu nhập / Loại phí (`mall_income`) — 13 loại active

Định nghĩa tất cả các khoản thu trong hợp đồng:

| Mã | Tên | Nhóm | Đơn vị tính |
|----|-----|------|-------------|
| LP001 | Tiền Thuê Cơ Bản | basic_rent | /m²/tháng |
| LP020 | Tiền Thuê Cơ Bản DT Bên Ngoài | basic_rent | vnd/tháng |
| LP002 | Phí Dịch Vụ | service | /m²/tháng |
| LP019 | Phí Dịch Vụ DT Bên Ngoài | service | vnd/tháng |
| LP003 | Phí QC&KM | marketing | /m²/tháng |
| LP021 | Phí QC&KM DT Bên Ngoài | marketing | vnd/tháng |
| LP004 | Phí Vệ Sinh | cleaning | /m²/tháng |
| LP022 | Phí Vệ Sinh DT Bên Ngoài | cleaning | vnd/tháng |
| LP005 | Tiền Chia Sẻ Doanh Thu | revenue_rent | vnd/tháng |
| LP024 | Tiền CSDT DT Bên Ngoài | revenue_rent | vnd/tháng |
| LP006 | Tiền Điện | utility | vnd/kWh |
| LP007 | Tiền Ga | utility | vnd/kg |
| LP008 | Tiền Nước | utility | vnd/m³ |

> Phân loại "DT Bên Ngoài" — dành cho vị trí không có diện tích tính theo m², phí tính cố định vnd/tháng

#### Kỳ hóa đơn MEC (`invoicing_mec`) — 22 kỳ

Mỗi tháng tạo 1 kỳ MEC. Toàn bộ hóa đơn trong tháng được gắn với 1 kỳ MEC:

| Trạng thái | Số kỳ | Ghi chú |
|-----------|-------|---------|
| `closed` | 21 kỳ | Dec 2023 → Jun 2025 |
| `active` | 1 kỳ | MEC000022 (Jul 2025) — **kỳ hiện tại** |

Quy ước mỗi kỳ: `invoice_closing_date` = ngày chốt HĐ (thường ngày 31 tháng đó), `invoice_proforma_date` = ngày 25 (tạo proforma trước 6 ngày)

#### Quy chuẩn thi công (`leasing_construction_standards`) — 7 bộ quy chuẩn

Thời gian thi công tối đa theo loại vị trí + loại kinh doanh + diện tích:

| Loại vị trí | Loại KD | Diện tích (m²) | Thời gian thi công |
|------------|---------|----------------|-------------------|
| Kiosk (2) | Non-F&B | ≥ 200 | 1.5 tháng |
| Kiosk (2) | Non-F&B | < 200 | 1 tháng |
| Kiosk (2) | Non-F&B | ≥ 30 | 2 tuần |
| Kiosk (2) | Non-F&B | < 30 | 1 tuần |
| Boutique (1) | F&B | ≥ 100 | 1.5 tháng |
| Kiosk (2) | F&B | < 100 | 1 tháng |
| Kiosk (2) | F&B | (tất cả) | 1–2 tuần |

#### Cấu hình phê duyệt (`leasing_approval_template`) — 5 template

Mỗi loại đối tượng (LAF/OL/Contract/Appendix/Termination) có 1 template phê duyệt riêng. Người phê duyệt hiện tại:

| Đối tượng | Người phê duyệt | Thứ tự |
|-----------|----------------|--------|
| LAF | my-phh → duy-pt | Tuần tự (seq 0 → 1) |
| OL | my-phh → duy-pt | Tuần tự |
| Hợp đồng | my-phh → duy-pt | Tuần tự |
| Phụ lục | my-phh + duy-pt | Song song (cùng seq 0) |
| Thanh lý | my-phh + duy-pt | Song song |

> **Tuần tự**: duy-pt chỉ nhận yêu cầu sau khi my-phh đã duyệt  
> **Song song**: cả hai cùng nhận yêu cầu và đều phải duyệt

---

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
+-- Mall (action 313) --> model: mall.mall                        
+-- Tầng (action 314) --> model: mall.floor                       
+-- Vị trí (action 315) --> model: mall.location                  
+-- Thiết lập                                                     
    +-- Loại hình Mall (action 316) --> model: mall.category      
    +-- Loại phí (action 317) --> model: leasing.fee.type         
    +-- Loại vị trí (action 318) --> model: mall.location.type (?)
    +-- Ngành hàng (action 291) --> shared với Cho thuê           
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
+-- Hợp đồng                                                                          
|   +-- Thỏa thuận (action 304) --> leasing.deal                                      
|   +-- Phiếu duyệt thuê/LAF (action 305) --> leasing.laf                             
|   +-- Thư chào thuê/OL (action 306) --> leasing.ol                                  
|   +-- Hợp đồng (action 307) --> leasing.contract                                    
|   +-- Phụ lục hợp đồng (action 308) --> leasing.appendix                            
|   +-- Phiếu thanh lý (action 309) --> leasing.termination                           
+-- Hoạt động khác                                                                    
|   +-- Báo cáo điện nước gas (--> invoicing.utility)                                 
|   +-- Báo cáo doanh thu khách thuê (--> invoicing.tos)                              
|   +-- Đề nghị thanh toán cọc (--> account.move)                                     
+-- Báo cáo                                                                           
|   +-- Tình trạng cho thuê (action 297) --> wizard: leasing.report.wizard            
|   +-- Tình trạng theo tháng/quý (action 299) --> wizard: leasing.report.month.wizard
+-- Thiết lập                                                                         
    +-- Loại đặt cọc (action 311)                                                     
    +-- Ngành hàng (action 291) --> shared với Mall                                   
    +-- Thương hiệu (action 303)                                                      
    +-- Quy chuẩn thi công (action 310)                                               
    +-- Thẻ trạng thái vị trí (action 296)                                            
    +-- Phân quyền phê duyệt (action 312)                                             
```

### Workflow nghiệp vụ
```
Thỏa thuận (Deal) 
  --> LAF (Phiếu duyệt thuê, approval workflow)
    --> OL (Thư chào thuê)  
      --> Hợp đồng 
        +-- Phụ lục hợp đồng (sửa đổi)
        +-- Phiếu thanh lý (kết thúc) 
```

### Dữ liệu hiện tại
- 33 Thỏa thuận (Đang thuê, Chờ duyệt phụ lục, Đã thanh lý, Chờ thanh lý, Đang thỏa thuận)
- 12 LAF, 11 OL, 33 Hợp đồng, 63 Phụ lục, 20 Thanh lý
- 501 bản ghi điện/nước/gas, 54 báo cáo doanh thu

### Báo cáo

Hệ thống có **4 loại báo cáo** chính, tất cả đều dựa trên bảng `location_tracking` (32,062 bản ghi lưu snapshot trạng thái từng vị trí mỗi ngày từ 30/12/2023 đến nay).

---

#### 1. Báo cáo tình trạng cho thuê (action 297)

**Model**: `leasing.report.wizard` → kết quả hiển thị trên `leasing.report.template`

**Cách dùng**: Chọn _Từ ngày_ / _Đến ngày_ → nhấn **Tạo báo cáo** → xem trực tiếp trong Odoo (tree + form)

**Dữ liệu hiển thị** (mỗi dòng = 1 vị trí):

| Nhóm | Cột |
|------|-----|
| Vị trí | Tầng, Mã vị trí, Loại (Boutique/Kiosk), Trạng thái |
| Tenant | Thương hiệu, Ngành hàng, Khách thuê, Mã HĐ, Trạng thái HĐ |
| Thời hạn | Ngày bắt đầu Deal, Ngày hết hạn, Mô hình thuê |
| Diện tích | m² |
| Tài chính | Tiền cọc, Tiền thuê CB, Phí DV, Phí QC&KM, Phí VS, Doanh thu KH, CSDT |

**Cơ chế**: Lấy snapshot ngày gần nhất trong khoảng `[date_from, date_to]` từ `location_tracking` → tổng hợp tiền thuê theo từng kỳ trong khoảng.

> Báo cáo hiện có **39 vị trí** (bao gồm cả trống và đang thuê)

---

#### 2. Báo cáo theo tháng / quý (action 299)

**Model**: `leasing.report.month.wizard`

**Cách dùng**: Chọn Tháng + Năm (hoặc Quý), Phân loại vị trí (NLA/Non-NLA) → **Tải xuống Excel**

**Input fields**:

| Field | Giá trị |
|-------|---------|
| Loại báo cáo | `month` (Tháng) / `quarter` (Quý) |
| Phân loại vị trí | `nla` / `non_nla` |
| Tháng / Năm | Số tháng + năm |

**Cấu trúc Excel**: Phân tổ theo **Vùng → Mall → Tầng → Ngành hàng**, mỗi dòng có **4 nhóm cột**:

| Nhóm cột | Mô tả |
|----------|-------|
| Kỳ hiện tại | DT, DT đã thuê, lấp đầy, vị trí trống, vị trí thỏa thuận, lấp đầy dự kiến, giá thuê TB, 5 loại tiền |
| Kỳ trước (previous) | Tất cả chỉ số tương tự |
| Cùng kỳ quý (quarter) | Tất cả chỉ số tương tự |
| % thay đổi so kỳ trước | Tăng/giảm % từng chỉ số |
| % thay đổi so cùng kỳ quý | Tăng/giảm % từng chỉ số |

Tổng cộng ~50 cột. Output: file `.xlsx` tải về trình duyệt.

---

#### 3. Báo cáo điện / nước / gas (`invoicing.utility`)

**Menu**: Cho thuê → Hoạt động khác → Báo cáo điện nước gas

**Model**: `invoicing.utility` (501 bản ghi)

Mỗi bản ghi là 1 tờ báo cáo tiêu thụ điện/nước/gas của 1 hợp đồng trong 1 kỳ MEC:

| Field | Mô tả |
|-------|-------|
| `contract_id` | Hợp đồng liên quan |
| `invoicing_mec_id` | Kỳ xuất hóa đơn |
| `mall_income_id` | Loại tiện ích (Điện/Nước/Gas) |
| `state` | Trạng thái |
| `price_total` | Tổng tiền |
| `signed_attachment_fname` | File đính kèm chữ ký |

---

#### 4. Báo cáo doanh thu khách thuê (`invoicing.tos`)

**Menu**: Cho thuê → Hoạt động khác → Báo cáo doanh thu khách thuê

**Model**: `invoicing.tos` (54 bản ghi)

Dùng cho mô hình thuê **Chia sẻ doanh thu** — khách thuê nộp báo cáo doanh thu hàng tháng:

| Field | Mô tả |
|-------|-------|
| `contract_id` | Hợp đồng |
| `invoicing_mec_id` | Kỳ MEC |
| `price_total` | Tổng doanh thu kỳ đó |
| `state` | Trạng thái |

Dữ liệu này được dùng trong Báo cáo tình trạng cho thuê (cột `revenue_customer_amount`).

---

## 3. Lên hóa đơn (Invoicing Module — Odoo Standard)

```
Invoicing (ID 136)
+-- Customers                                                 
|   +-- Invoices (action 243) --> account.move (831 hóa đơn)  
|   +-- Tạo hóa đơn thủ công (action 325) — SCID custom wizard
|   +-- Credit Notes (action 244)                             
|   +-- Payments (action 220)                                 
|   +-- Products (action 265)                                 
|   +-- Customers (action 273)                                
+-- Vendors                                                   
|   +-- Bills (action 245)                                    
|   +-- Refunds (action 246)                                  
|   +-- Payments (action 221)                                 
|   +-- Products (action 266)                                 
|   +-- Vendors (action 274)                                  
+-- Reporting                                                 
|   +-- Management (không có action)                          
+-- Configuration                                             
    +-- Settings (action 271)                                 
    +-- Invoicing, Banks, Accounting, Payments, Management... 
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
+-- Khách hàng (action 300) --> res.partner (42 khách hàng)
+-- Liên hệ nội bộ (action 301)                            
+-- Configuration                                          
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
+-- Queue                              
    +-- Jobs (action 175) --> queue.job
    +-- Channels (action 176)          
    +-- Job Functions (action 177)     
```

Module OCA `queue_job` — quản lý async background jobs. Hiện không có job nào đang chờ.
Dùng cho các tác vụ nặng chạy nền (xuất báo cáo, đồng bộ AMS, tạo hóa đơn hàng loạt).

---

## 7. Trang tổng quan (Dashboards)

```
Dashboards (ID 127)
+-- Dashboards (action client 183) — dashboard view
+-- Configuration                                  
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
+-- General Settings (action 90)                  
+-- Users & Companies                             
    +-- Users (action 70) --> res.users (12 users)
    +-- Companies (action 53)                     
```

**12 users**:
- scid-jsc.com: yen-hk, dung-nt, my-phh, duy-pt, nguyen-tck, phu-dh, phuong-dt
- sensemarket.vn: huan-nc, ketoan, liem-nt, vanhanh
- portcities.net: dang (tư vấn triển khai PCV)

---

## Kiến trúc tổng thể

```
Custom Modules:
  scid_leasing   --> Mall, Cho thuê (Deal-->LAF-->OL-->Contract-->Appendix/Termination)
  scid_invoicing --> invoicing.utility, invoicing.tos, leasing.report.*.wizard, Tạo HĐ thủ công

Standard Odoo:
  account         --> Invoicing (Customers/Vendors)
  res.partner     --> Contacts
  discuss         --> Thảo luận
  queue_job (OCA) --> Job Queue
  board           --> Dashboards

Integration:
  AMS (Asset Management System) --> sync mall, floor, location data
  Trường: ams_id, last_ams_sync_at, ams_sync_needed trên mall.mall, mall.floor, mall.location
```

---

## Mối liên hệ giữa các model chính

```
mall.mall (1)
  +-- mall.floor (5)                                              
        +-- mall.location (40)                                    
              +-- leasing.deal (33) [current_deal_id, deal_ids]   
                    +-- leasing.laf (12)                          
                          +-- leasing.ol (11)                     
                                +-- leasing.contract (33)         
                                      +-- leasing.appendix (63)   
                                      +-- leasing.termination (20)

leasing.contract --> account.move (hóa đơn tháng)
invoicing.utility --> điện/nước/gas per hợp đồng/tháng
invoicing.tos --> doanh thu khách thuê per hợp đồng/tháng
```

DONE — đã khám phá toàn bộ 9 module frontend + backend server (custom modules, AMS sync, cron jobs, DB schema).
