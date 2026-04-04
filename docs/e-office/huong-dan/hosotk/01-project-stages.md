# Hướng dẫn 01: Tạo Project + Stages + Properties

## Phần 1: Tạo Project

### Bước 1: Truy cập ứng dụng Project
- Mở menu chính Odoo
- Chọn **Project** từ danh sách ứng dụng

### Bước 2: Tạo Project mới
- Nhấp nút **+ New** (nút tạo mới)
- Điền thông tin:
  - **Project Name** (Tên Dự án): `Hồ sơ trình ký Ban TGĐ`
  - Các trường khác giữ mặc định nếu chưa cần cấu hình
- Nhấp **Save** để lưu

---

## Phần 2: Tạo 11 Stages (Giai đoạn)

### Bước 1: Vào cấu hình Stages
- Từ Project vừa tạo, nhấp **Settings** (hoặc vào **Project > Configuration > Stages**)
- Chọn tab **Stages**

### Bước 2: Tạo các Stage theo thứ tự sau

Nhấp **+ Add a line** hoặc **New** để thêm từng Stage. Điền tên chính xác:

| Thứ tự | Tên Stage | Ghi chú |
|--------|-----------|---------|
| 1 | New | Giai đoạn mới |
| 2 | Gửi Thư ký Phó Tổng | |
| 3 | Đợi Phó Tổng phản hồi | |
| 4 | Phó Tổng trả hồ sơ | |
| 5 | Gửi Thư ký TGĐ | |
| 6 | Đợi TGĐ phản hồi | |
| 7 | TGĐ đã duyệt | |
| 8 | Chờ thanh toán | |
| 9 | Đang thanh toán | |
| 10 | Đã thanh toán | |
| 11 | Hoàn thành | Đánh dấu **Fold in kanban** |

### Bước 3: Cấu hình Stage cuối cùng

Với Stage **"Hoàn thành"**, hãy:

!!! tip "Quan trọng"
    - Tích chọn **Fold in kanban** (Gập trong kanban) để ẩn nó trong view kanban mặc định
    - Nhấp **Save**

---

## Phần 3: Thêm Properties Fields (Trường thuộc tính tùy chỉnh)

### Bước 1: Vào Settings Properties
- Từ Project, nhấp **Settings**
- Chọn tab **Task Properties** hoặc **Properties**

### Bước 2: Thêm 10 Fields theo thứ tự

Nhấp **+ Add a line** hoặc **+ New Field** để thêm từng field với cấu hình sau:

#### Field 1: Cấp duyệt
- **Field Name** (Tên trường): `cap_duyet`
- **Display Name** (Tên hiển thị): `Cấp duyệt`
- **Field Type** (Loại trường): **Selection**
- **Selection Options** (Các tùy chọn):
  - Chỉ PT
  - Chỉ TGĐ
  - Cả hai

#### Field 2: Có thanh toán
- **Field Name**: `co_thanh_toan`
- **Display Name**: `Có thanh toán`
- **Field Type**: **Checkbox**

#### Field 3: Hạn thanh toán
- **Field Name**: `han_thanh_toan`
- **Display Name**: `Hạn thanh toán`
- **Field Type**: **Date**

#### Field 4: Số tiền
- **Field Name**: `so_tien`
- **Display Name**: `Số tiền`
- **Field Type**: **Number** hoặc **Monetary**
- (Nếu **Monetary**, chọn **Currency** là VND)

#### Field 5: Phân loại
- **Field Name**: `phan_loai`
- **Display Name**: `Phân loại`
- **Field Type**: **Selection**
- **Selection Options**:
  - Nội bộ
  - Mật
  - Tối mật

#### Field 6: Loại giấy tờ
- **Field Name**: `loai_giay_to`
- **Display Name**: `Loại giấy tờ`
- **Field Type**: **Selection**
- **Selection Options**:
  - HĐ (Hợp đồng)
  - Tờ trình
  - CV (Công văn)
  - QĐ (Quyết định)

#### Field 7: Ngày ký
- **Field Name**: `ngay_ky`
- **Display Name**: `Ngày ký`
- **Field Type**: **Date**

#### Field 8: Dịch vụ sử dụng
- **Field Name**: `dich_vu_su_dung`
- **Display Name**: `Dịch vụ sử dụng`
- **Field Type**: **Text** hoặc **Text (long)**

#### Field 9: Đơn vị
- **Field Name**: `don_vi`
- **Display Name**: `Đơn vị`
- **Field Type**: **Selection**
- **Selection Options** (nhập danh sách phòng ban của công ty, ví dụ):
  - Phòng Tài chính
  - Phòng Nhân sự
  - Phòng IT
  - Phòng Kinh doanh
  - (Thêm các phòng ban khác theo nhu cầu)

#### Field 10: Trích yếu nội dung
- **Field Name**: `trich_yeu`
- **Display Name**: `Trích yếu`
- **Field Type**: **Text**
- **Ghi chú**: Mô tả ngắn gọn nội dung hồ sơ, ví dụ: "HĐ cung cấp dịch vụ Cloud Server năm 2026"

### Bước 3: Lưu cấu hình
- Nhấp **Save** để lưu tất cả Properties

---

## Phần 4: Tạo Tags (Nhãn)

### Bước 1: Vào quản lý Tags
- Vào **Project > Configuration > Tags**
- Hoặc từ Project Settings, chọn tab **Tags**

### Bước 2: Tạo Tags
- Nhấp **+ New** để tạo tag mới
- Điền **Tag Name** (Tên nhãn)
- Chọn **Color** (Màu) để dễ phân biệt
- Nhấp **Save**

!!! tip "Gợi ý Tags"
    Bạn có thể tạo các tags sau (tùy nhu cầu):
    
    - Urgent (Khẩn cấp)
    - Follow-up (Cần theo dõi)
    - Signed (Đã ký)
    - Pending (Đang chờ)
    - Approved (Đã duyệt)

---

## Hoàn tất

Sau khi hoàn thành 4 phần trên, Project **"Hồ sơ trình ký Ban TGĐ"** sẽ có:
- ✅ Cấu trúc 11 stages quy trình
- ✅ 10 trường thuộc tính tùy chỉnh
- ✅ Hệ thống tags để phân loại task

Bây giờ bạn có thể bắt đầu tạo Tasks trong Project và sử dụng các stages + properties để quản lý quy trình hồ sơ trình ký Ban TGĐ.
