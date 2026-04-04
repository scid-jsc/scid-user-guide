# Tài liệu Hệ thống — LMS (Leasing Management System)

!!! info "Đối tượng tài liệu"
    Tài liệu này mô tả kiến trúc kỹ thuật, cấu trúc dữ liệu và luồng nghiệp vụ của hệ thống LMS dành cho đội vận hành, IT và developer. Hướng dẫn thao tác người dùng xem tại [Vận hành Cho thuê](van-hanh-lms.md).

---

## 1. Tổng quan

| Thông tin | Chi tiết |
|-----------|---------|
| **Tên hệ thống** | Leasing Management System (LMS) |
| **URL** | https://lms.scid.vn |
| **Nền tảng** | Odoo 17 Community |
| **Custom module** | `scid_leasing`, `scid_invoicing` |
| **Tích hợp ngoài** | AMS (Asset Management System) |
| **Đơn vị vận hành** | Công ty TNHH MTV TM DV Sense Cái Bè |
| **Mall đang quản lý** | SenseMarket Cái Bè (SMCB1), Đồng Tháp |

---

## 2. Cấu trúc Module

```
LMS
├── Mall (scid_leasing)           — Quản lý vật lý khu thương mại
├── Cho thuê (scid_leasing)       — Quản lý hợp đồng và khách thuê
├── Lên hóa đơn (account)         — Hóa đơn, thanh toán (Odoo chuẩn + custom)
├── Liên hệ (res.partner)         — Danh mục khách hàng/bên thuê
├── Thảo luận (discuss)           — Nhắn tin nội bộ (Odoo chuẩn)
├── Job Queue (queue_job OCA)     — Background jobs
├── Trang tổng quan (board)       — Dashboard tổng hợp
└── Thiết lập (Settings)          — Người dùng, công ty
```

---

## 3. Module Mall

### 3.1 Cấu trúc menu

| Menu | Action | Model |
|------|--------|-------|
| Mall / Mall | 313 | `mall.mall` |
| Mall / Tầng | 314 | `mall.floor` |
| Mall / Vị trí | 315 | `mall.location` |
| Mall / Thiết lập / Loại hình Mall | 316 | `mall.category` |
| Mall / Thiết lập / Loại phí | 317 | `leasing.fee.type` |
| Mall / Thiết lập / Loại vị trí | 318 | `mall.location.type` |
| Mall / Thiết lập / Ngành hàng | 291 | `leasing.business.category` |

### 3.2 Model: `mall.mall`

Đại diện cho một khu trung tâm thương mại.

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

**Dữ liệu hiện tại:** 1 bản ghi — SenseMarket Cái Bè (SMCB1), GFA 5,235 m², NLA 3,526.67 m², 5 tầng, 40 vị trí.

### 3.3 Model: `mall.floor`

Đại diện cho một khối/tầng trong mall.

| Field | Tên hiển thị | Kiểu |
|-------|-------------|------|
| `code` | Số hiệu | char |
| `mall_id` | Mall | many2one → `mall.mall` |
| `area_nla` | Diện tích NLA | float |
| `area_non_nla` | Diện tích Non-NLA | float |
| `location_ids` | Vị trí | one2many → `mall.location` |
| `booked_location_ratio` | Tỉ lệ lấp đầy (%) | float |
| `layout_image` | Sơ đồ mặt bằng | binary |
| `layout_data` | Layout Data (JSON) | text |
| `tooltip_data` | Tooltip Data (JSON) | text |
| `ams_id` | AMS ID | integer |
| `last_ams_sync_at` | Đồng bộ AMS lần cuối | datetime |

**Dữ liệu hiện tại — 5 tầng SMCB1:**

| Tầng | NLA (m²) | Số vị trí | Vị trí trống | Lấp đầy |
|------|----------|-----------|-------------|---------|
| Khối Cố Định - Tầng 1 | 1,956.88 | 8 | 3 | 8.57% |
| Khối Cố Định - Tầng 2 | 876.95 | 7 | 1 | 65.22% |
| Khối Ending - Tầng 1 | 152.59 | 1 | 0 | 100% |
| Khối Ending - Tầng 2 | 177.79 | 1 | 1 | 0% |
| Khối Mở | 362.46 | 23 | 17 | 41.11% |

### 3.4 Model: `mall.location`

Đại diện cho một vị trí/ki-ốt cho thuê.

| Field | Tên hiển thị | Kiểu |
|-------|-------------|------|
| `code` | Số hiệu | char |
| `mall_id` | Mall | many2one → `mall.mall` |
| `floor_id` | Tầng | many2one → `mall.floor` |
| `date_start` | Hiệu lực từ ngày | date |
| `date_end` | Hiệu lực đến ngày | date |
| `area` | Diện tích (m²) | float |
| `state` | Trạng thái | selection |
| `category_id` | Loại vị trí | many2one |
| `business_category_id` | Ngành hàng | many2one |
| `deal_ids` | Danh sách Deal | one2many → `leasing.deal` |
| `current_deal_id` | Thỏa thuận hiện tại | many2one → `leasing.deal` |
| `contract_id` | Hợp đồng | many2one → `leasing.contract` |
| `brand_id` | Thương hiệu | many2one |
| `rental_end_date` | Ngày hết hạn HĐ | date |
| `construction_state` | Trạng thái nhập/tách | selection |
| `parent_ids` | Vị trí cha (nhập) | many2many |
| `child_ids` | Vị trí con (tách) | many2many |
| `location_type` | Phân loại | selection |
| `layout_data` | Layout Data (JSON) | text |
| `tooltip_data` | Tooltip Data (JSON) | text |

**Trạng thái vị trí (`state`):** Khởi tạo · Trống · Thỏa thuận · Chờ bàn giao · Chờ thi công · Đang cho thuê

**Dữ liệu hiện tại:** 40 vị trí, mã theo khối A (Cố Định), B (Ending), C (Mở).

### 3.5 Danh mục thiết lập Mall

**Loại hình Mall** (`mall.category`):

| Code | Tên |
|------|-----|
| PL | Plaza |
| SM | Market |
| FE | Festi |
| GA | Gallery |
| CT | City |

**Loại phí** (`leasing.fee.type`) — 13 loại:

| Loại phí | Phân loại | Đơn vị |
|----------|-----------|--------|
| Tiền Thuê Cơ Bản | Phí tiền thuê cơ bản | vnd/m²/tháng |
| Tiền Thuê Cơ Bản Diện Tích Bên Ngoài | Phí tiền thuê cơ bản | vnd/tháng |
| Phí Dịch Vụ | Phí dịch vụ | vnd/m²/tháng |
| Phí Dịch Vụ Diện Tích Bên Ngoài | Phí dịch vụ | vnd/tháng |
| Phí Vệ Sinh | Phí vệ sinh | vnd/m²/tháng |
| Phí Vệ Sinh Diện Tích Bên Ngoài | Phí vệ sinh | vnd/tháng |
| Phí QC&KM | Phí quảng cáo | vnd/m²/tháng |
| Phí QC&KM Diện Tích Bên Ngoài | Phí quảng cáo | vnd/tháng |
| Tiền Chia Sẻ Doanh Thu | Phí % doanh thu | vnd/tháng |
| Tiền Chia Sẻ Doanh Thu Diện Tích Bên Ngoài | Phí % doanh thu | vnd/tháng |
| Tiền Điện | Phí điện, nước, ga | vnd/kwh |
| Tiền Gas | Phí điện, nước, ga | vnd/kg |
| Tiền Nước | Phí điện, nước, ga | vnd/m³ |

---

## 4. Module Cho thuê

### 4.1 Cấu trúc menu

| Menu | Action | Model |
|------|--------|-------|
| Cho thuê / Hợp đồng / Thỏa thuận | 304 | `leasing.deal` |
| Cho thuê / Hợp đồng / Phiếu duyệt thuê (LAF) | 305 | `leasing.laf` |
| Cho thuê / Hợp đồng / Thư chào thuê (OL) | 306 | `leasing.ol` |
| Cho thuê / Hợp đồng / Hợp đồng | 307 | `leasing.contract` |
| Cho thuê / Hợp đồng / Phụ lục hợp đồng | 308 | `leasing.appendix` |
| Cho thuê / Hợp đồng / Phiếu thanh lý | 309 | `leasing.termination` |
| Cho thuê / Hoạt động khác / Báo cáo điện nước gas | — | `invoicing.utility` |
| Cho thuê / Hoạt động khác / Báo cáo doanh thu | — | `invoicing.tos` |
| Cho thuê / Hoạt động khác / Đề nghị thanh toán cọc | — | `account.move` |
| Cho thuê / Báo cáo / Tình trạng cho thuê | 297 | `leasing.report.wizard` |
| Cho thuê / Báo cáo / Tình trạng tháng/quý | 299 | `leasing.report.month.wizard` |
| Cho thuê / Thiết lập / Loại đặt cọc | 311 | — |
| Cho thuê / Thiết lập / Ngành hàng | 291 | `leasing.business.category` |
| Cho thuê / Thiết lập / Thương hiệu | 303 | — |
| Cho thuê / Thiết lập / Quy chuẩn thi công | 310 | — |
| Cho thuê / Thiết lập / Thẻ trạng thái vị trí | 296 | — |
| Cho thuê / Thiết lập / Phân quyền phê duyệt | 312 | `leasing.approval.template` |

### 4.2 Luồng nghiệp vụ

```
[Vị trí trống]
      │
      ▼
Thỏa thuận (leasing.deal)
 → trạng thái: Đang thỏa thuận
      │  tạo LAF
      ▼
Phiếu duyệt thuê — LAF (leasing.laf)
 → workflow phê duyệt qua email (nhiều cấp)
      │  sau khi được duyệt → tạo OL
      ▼
Thư chào thuê — OL (leasing.ol)
 → ký bản cứng PDF
 → "Tạo đề nghị thanh toán" (tiền cọc)
 → "Tạo lại hợp đồng"
      │
      ▼
Hợp đồng (leasing.contract)
 → trạng thái: Đang thuê
 → tự động tạo hóa đơn hàng tháng
      │
      ├── Phụ lục hợp đồng (leasing.appendix)
      │    → Lý do làm phụ lục
      │    → Workflow phê duyệt
      │
      └── Phiếu thanh lý (leasing.termination)
           → Kết thúc hợp đồng
           → Workflow phê duyệt
```

### 4.3 Dữ liệu hiện tại

| Đối tượng | Số lượng | Ghi chú |
|-----------|---------|---------|
| Thỏa thuận | 33 | Đang thuê / Chờ duyệt phụ lục / Đã thanh lý / Chờ thanh lý / Đang thỏa thuận |
| LAF | 12 | |
| OL | 11 | |
| Hợp đồng | 33 | |
| Phụ lục | 63 | |
| Thanh lý | 20 | |
| Điện/nước/gas | 501 | Theo tháng × hợp đồng |
| Doanh thu khách thuê | 54 | Theo tháng × hợp đồng |

### 4.4 Phân quyền phê duyệt

5 quy tắc phê duyệt theo cấp bậc quản lý:

| Đối tượng | Ghi chú |
|-----------|---------|
| Hợp đồng | Duyệt theo cấp |
| Thư chào thuê (OL) | Duyệt theo cấp |
| Phụ lục | Duyệt theo cấp |
| Thanh lý | Duyệt theo cấp |
| Phiếu duyệt thuê (LAF) | Duyệt theo cấp |

### 4.5 Thiết lập Cho thuê

**Loại đặt cọc** (4 loại):

| Mã | Tên |
|----|-----|
| DC001 | Phí Trả Trước |
| DC002 | Phí Giữ Chỗ |
| DC003 | Tiền Đặt Cọc |
| DC004 | Tiền Đặt Cọc Thi Công |

**Ngành hàng** — 20 danh mục phân cấp:
GIẢI TRÍ · ẨM THỰC · MUA SẮM · GIÁO DỤC · DỊCH VỤ & TIỆN ÍCH

**Thương hiệu** — 42 thương hiệu (Jollibee, FAHASA, PNJ, SAKOS, BABAMAMA, ...)

**Quy chuẩn thi công** — 7 quy tắc theo phân loại (F&B/Non-F&B, Kiosk/Boutique, diện tích) → thời gian thi công

**Thẻ trạng thái vị trí** — 6 trạng thái có màu sắc:
Khởi tạo · Trống · Thỏa thuận · Chờ bàn giao · Chờ thi công · Đang cho thuê

### 4.6 Báo cáo

**Báo cáo tình trạng cho thuê** (action 297)

- Model: `leasing.report.wizard`
- Input: Từ ngày / Đến ngày
- Output: File Excel, tất cả 39 vị trí với chi tiết tài chính từng vị trí

**Báo cáo tình trạng tháng/quý** (action 299)

- Model: `leasing.report.month.wizard`
- Fields:

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `report_month` | integer | Tháng (1–12) |
| `report_quarter` | integer | Quý (1–4) |
| `report_year` | integer | Năm |
| `report_type` | selection | `month` / `quarter` |
| `position_type` | selection | `nla` / `non_nla` |
| `file_data` | binary | File Excel đầu ra |
| `file_name` | char | Tên file |

---

## 5. Module Lên hóa đơn

### 5.1 Cấu trúc menu

| Menu | Action | Ghi chú |
|------|--------|---------|
| Customers / Invoices | 243 | Hóa đơn khách hàng (account.move) |
| Customers / Tạo hóa đơn thủ công | 325 | **SCID custom wizard** |
| Customers / Credit Notes | 244 | Ghi có |
| Customers / Payments | 220 | Thanh toán từ khách |
| Customers / Products | 265 | Sản phẩm/dịch vụ |
| Customers / Customers | 273 | Danh mục khách |
| Vendors / Bills | 245 | Hóa đơn nhà cung cấp |
| Vendors / Refunds | 246 | Hoàn trả |
| Vendors / Payments | 221 | Thanh toán cho NCC |
| Configuration / Settings | 271 | Cấu hình kế toán |

### 5.2 Dữ liệu hóa đơn

- **831 hóa đơn** khách hàng (tính đến 04/2026)
- Định dạng số: `HD/2025/XXXXX`
- Trạng thái: `Dự thảo` → `Đã vào sổ`
- Thanh toán: phần lớn `Chưa trả`
- Cột chính: Số · Mã hợp đồng · Khách hàng · Ngày HĐ · Ngày phải trả · Chưa kèm thuế · Tổng · Tình trạng thanh toán

### 5.3 Tạo hóa đơn thủ công (SCID Custom — action 325)

Wizard tạo hàng loạt hóa đơn theo kỳ:

| Tùy chọn | Mô tả |
|----------|-------|
| Kỳ hóa đơn hiện tại | Tháng hiện tại |
| Kỳ hóa đơn tiếp theo | Tháng tiếp (hóa đơn báo trước) |
| Trong khoảng thời gian | Tùy chọn từ ngày–đến ngày |

Filter thêm: **Mall** và **Mã hợp đồng** để tạo chọn lọc.

---

## 6. Module Liên hệ

**42 khách hàng (bên thuê)** với cấu trúc mã:
- `DN000001...` — Doanh nghiệp (Công ty CP, TNHH, Hộ Kinh Doanh)
- `CN000001...` — Cá nhân

Thông tin lưu trữ: Mã KH · Tên · Tỉnh/thành · Loại KH · Liên hệ chính · SĐT · Thương hiệu

Một số tenant lớn:

| Mã | Tên | Thương hiệu |
|----|-----|-------------|
| DN000001 | CÔNG TY TNHH JOLLIBEE VIỆT NAM | Jollibee |
| DN000003 | Công ty CP Phát hành Sách TP.HCM | FAHASA |
| DN000006 | Công ty CP Vàng Bạc Đá Quý Phú Nhuận | PNJ |
| DN000004 | Công ty Cổ Phần Sakos | SAKOS |
| DN000013 | CÔNG TY TNHH THƯƠNG MẠI GIÓ ĐÔNG | BABAMAMA |
| DN000007 | Cty TNHH MTV DV TM Giải Trí Tiến Tiến Đạt | Game Center |

---

## 7. Tích hợp AMS

Ba model `mall.mall`, `mall.floor`, `mall.location` đều có fields:

| Field | Mô tả |
|-------|-------|
| `ams_id` | ID đối tượng trong AMS |
| `last_ams_sync_at` | Thời điểm đồng bộ gần nhất |
| `ams_sync_needed` | Cờ đánh dấu cần đồng bộ lại |

Cron job định kỳ đồng bộ dữ liệu vật lý (tầng, vị trí, sơ đồ) từ AMS sang LMS.

---

## 8. Danh sách Users

| Tên | Email | Đơn vị |
|-----|-------|--------|
| Hồ Kim Yến | yen-hk@scid-jsc.com | SCID |
| Nguyễn Thùy Dung | dung-nt@scid-jsc.com | SCID |
| Phan Hồ Hoàng My | my-phh@scid-jsc.com | SCID |
| Phan Thành Duy | duy-pt@scid-jsc.com | SCID |
| Trần Cao Khôi Nguyên | nguyen-tck@scid-jsc.com | SCID |
| Đinh Hồng Phúc | phu-dh@scid-jsc.com | SCID |
| Đỗ Thị Phương | phuong-dt@scid-jsc.com | SCID |
| Nguyễn Cao Huân | huan-nc@sensemarket.vn | Sense Cái Bè |
| Nguyễn Thị Cẩm Uyên | ketoan@sensemarket.vn | Sense Cái Bè |
| Nguyễn Tất Liêm | liem-nt@sensemarket.vn | Sense Cái Bè |
| Phạm Quốc Hưng | vanhanh@sensemarket.vn | Sense Cái Bè |
| Đặng Nguyễn (PCV) | dang@portcities.net | PortCities (tư vấn) |

---

## 9. Sơ đồ quan hệ Model

```
mall.mall (1)
│
├── mall.floor (5 tầng)
│     └── mall.location (40 vị trí)
│           ├── leasing.deal (Thỏa thuận)
│           │     └── leasing.laf (Phiếu duyệt thuê)
│           │           └── leasing.ol (Thư chào thuê)
│           │                 └── leasing.contract (Hợp đồng)
│           │                       ├── leasing.appendix (Phụ lục)
│           │                       ├── leasing.termination (Thanh lý)
│           │                       └── account.move (Hóa đơn tháng)
│           └── [trạng thái vị trí cập nhật theo hợp đồng]
│
└── [AMS sync: ams_id, last_ams_sync_at, ams_sync_needed]

invoicing.utility  → Điện/nước/gas theo hợp đồng × tháng
invoicing.tos      → Doanh thu khách thuê theo hợp đồng × tháng
```

---

!!! note "Cập nhật"
    Tài liệu được tổng hợp qua khảo sát trực tiếp hệ thống lms.scid.vn tháng 04/2026.
