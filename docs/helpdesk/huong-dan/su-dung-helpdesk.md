# Hướng dẫn sử dụng Hệ thống Helpdesk SCID

!!! info "Ban hành cho các đơn vị Sense"
    Tài liệu này hướng dẫn cán bộ, nhân viên các đơn vị Sense (Sense Cần Thơ, Sense Cà Mau, Sense Phạm Văn Đồng, Sense Bến Tre, Sense Cái Bè) sử dụng Hệ thống Helpdesk tại địa chỉ **[scid.vn/helpdesk](https://scid.vn/helpdesk)** để gửi yêu cầu hỗ trợ về Công nghệ thông tin.

[:material-file-word: **Tải file Word bản đầy đủ**](../dist/Huong-dan-su-dung-Helpdesk-SCID-v1.0.docx){ .md-button .md-button--primary }

---

## Tổng quan

Hệ thống Helpdesk tiếp nhận yêu cầu hỗ trợ về:

- **Hệ thống VTD** — CTKM, PMH, Coupon, Voucher, Sản phẩm, Barcode, Tài khoản ESSXanh/ESSCAM, Kiosk tra cứu
- **Hệ thống Odoo** — HRMS, eOffice, báo cáo, module
- **Thiết bị** — Laptop, máy in, POS, ngoại vi
- **Mạng** — Wi-Fi, Internet, VPN
- **Microsoft 365** — Email Outlook, Teams, OneDrive
- **Phần mềm** — Windows/macOS, cài đặt, bản quyền
- **Bảo mật & Tài khoản** — Quên mật khẩu, MFA, phishing, virus, backup

## Truy cập

| Mục | Thông tin |
|-----|-----------|
| URL | [https://scid.vn/helpdesk](https://scid.vn/helpdesk) |
| Yêu cầu | Trình duyệt + email công ty (không cần đăng nhập) |
| Giờ làm việc | Thứ Hai – Thứ Sáu, 8h00 – 17h00 |
| Cam kết phản hồi | 30 phút (Cao) — 2 giờ (Trung bình) — 1 ngày (Thấp) |

## Form 3 bước

Form yêu cầu được chia thành 3 bước. Hoàn tất bước trước mới mở được bước sau.

### Bước 1 — Thông tin liên hệ

Điền 4 trường bắt buộc:

1. **Họ và tên** — VD: Hồ Kim Yến
2. **Email công ty** — VD: tenban@scid-jsc.com
3. **Phòng/Ban** — VD: Kế toán, Vận hành, Nhân sự
4. **Đơn vị** — Chọn từ danh sách (SCID hoặc 1 trong 5 đơn vị Sense)

![Bước 1 — Form trống](_assets/02-step1-empty.png)

Sau khi điền đầy đủ, Bước 1 sẽ tự kích hoạt Bước 2:

![Bước 1 — Đã điền mẫu](_assets/03-step1-filled.png)

!!! warning "Email công ty"
    Phải dùng email công ty (`@scid-jsc.com` hoặc tên miền nội bộ). Email cá nhân (Gmail, Yahoo…) sẽ **không nhận được thông báo** từ hệ thống.

### Bước 2 — Yêu cầu hỗ trợ

Bấm vào nút **Chọn loại dịch vụ** để mở cửa sổ chọn:

![Bước 2 — Nút chọn loại dịch vụ](_assets/04-step2-empty.png)

Cửa sổ chọn hiển thị **8 nhóm chính**:

![Modal cấp 1 — 8 nhóm dịch vụ](_assets/05-modal-L1-groups.png)

Chọn một nhóm (VD: **Hệ thống VTD**), danh sách dịch vụ con sẽ hiện. Mục có mũi tên `›` bên phải nghĩa là còn cấp con:

![Modal cấp 2 — 8 dịch vụ VTD](_assets/06-modal-L2-VTD.png)

Tiếp tục chọn dịch vụ có cấp 3 (VD: **Khuyến mãi**) để xem 11 chức năng cụ thể:

![Modal cấp 3 — 11 chức năng Khuyến mãi](_assets/07-modal-L3-CTKM.png)

#### Khi nào hiện Tên gian hàng + Mã gian hàng?

Hai trường này **chỉ hiển thị** khi:

- Loại dịch vụ là **Hệ thống VTD > Khuyến mãi** (CTKM/PMH/Coupon/Voucher); hoặc
- Loại dịch vụ là **Hệ thống VTD > Sản phẩm & Barcode**

Các trường hợp khác sẽ không hiện 2 ô này.

![Bước 2 — Hiện 2 trường gian hàng](_assets/08-step2-with-booth.png)

### Bước 3 — Mô tả, ưu tiên, đính kèm

![Bước 3 — Toàn bộ form mô tả](_assets/09-step3-full.png)

**a) Mô tả vấn đề** — Tối thiểu 10 ký tự, tối đa 2.000 ký tự. Trả lời 4 câu:

1. Vấn đề xảy ra khi nào / ở đâu?
2. Thông báo lỗi cụ thể? (có ảnh chụp càng tốt)
3. Các bước đã thực hiện?
4. Ảnh hưởng đến công việc?

**b) Mức độ ưu tiên** — Chọn 1 trong 3:

![Ba mức ưu tiên](_assets/10-priority-radio.png)

| Mức | Ý nghĩa | Khi nào dùng |
|-----|---------|--------------|
| **Thấp** | Không ảnh hưởng ngay | Yêu cầu hướng dẫn, đề xuất, lỗi nhỏ |
| **Trung bình** | Ảnh hưởng một phần | Một thiết bị/chức năng không hoạt động, có cách workaround. **Mặc định.** |
| **Cao** | Không thể làm việc | Sự cố diện rộng: mất POS toàn quầy, mất Internet, rò rỉ bảo mật |

!!! danger "Chỉ chọn Cao khi thực sự cấp bách"
    Lạm dụng mức **Cao** sẽ làm chậm xử lý các yêu cầu khẩn cấp thật sự.

**c) Đính kèm file/ảnh** (tùy chọn):

![Khu vực đính kèm file](_assets/11-file-upload.png)

- Loại file: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP
- Tối đa 5 file/yêu cầu, mỗi file ≤ 10 MB
- Tổng dung lượng ≤ 50 MB

## Cam kết phản hồi (SLA)

| Mức ưu tiên | Phản hồi đầu tiên | Cam kết xử lý |
|-------------|-------------------|---------------|
| **Cao** | Trong 30 phút (giờ hành chính) | Trong 4 giờ làm việc |
| **Trung bình** | Trong 2 giờ làm việc | Trong 1 ngày làm việc |
| **Thấp** | Trong 1 ngày làm việc | Trong 3 ngày làm việc |

!!! note "Thời gian áp dụng trong giờ làm việc"
    8h00 – 17h00, Thứ Hai – Thứ Sáu. Yêu cầu gửi ngoài giờ sẽ tính từ đầu giờ làm việc tiếp theo.

## Sau khi gửi

1. Nhận email xác nhận với mã ticket (VD: `HD-2026-05-1234`)
2. Theo dõi cập nhật qua email công ty
3. Khi Ban CNTT giải quyết xong, nhận email kết thúc — trả lời `OK` để xác nhận hoặc `Chưa xong` kèm chi tiết để mở lại ticket
4. Sau 3 ngày không phản hồi, ticket tự đóng

## Trường hợp khẩn cấp

Đối với các sự cố nghiêm trọng — mất POS/VTD toàn quầy, mất Internet, nghi tấn công mạng, lộ dữ liệu — Anh/Chị:

1. Gửi yêu cầu qua [scid.vn/helpdesk](https://scid.vn/helpdesk) với mức ưu tiên **Cao** (vẫn bắt buộc để có ticket truy vết)
2. Đồng thời gọi điện trực tiếp đến đầu mối phụ trách CNTT đơn vị
3. Nếu sự cố bảo mật: **NGẮT mạng/tắt máy ngay** rồi báo (tránh lây lan)

!!! danger "Tấn công mạng / Virus"
    - **KHÔNG** cố tự xử lý
    - **KHÔNG** tắt máy đột ngột nếu chưa được hướng dẫn
    - **KHÔNG** mở thêm file/link đáng ngờ
    - Chụp ảnh màn hình lỗi và báo Ban CNTT ngay

---

## Tài nguyên

- :material-file-word: [**Tải tài liệu Word đầy đủ**](../dist/Huong-dan-su-dung-Helpdesk-SCID-v1.0.docx) — bản chính thức, có trang bìa, mục lục, đầy đủ phụ lục tra cứu nhanh
- :material-web: [**Truy cập Helpdesk**](https://scid.vn/helpdesk) — gửi yêu cầu ngay
