# Cài đặt hệ thống Odoo tại SCID JSC

Hướng dẫn chi tiết cài đặt và cấu hình 4 module chính của hệ thống Odoo 18 Enterprise tại SCID JSC: Kế toán (AMS), Cho thuê (LMS), E-Office (EO), và Nhân sự (HRMS).

!!! info "Thông tin hệ thống"
    - Phiên bản: Odoo 18 Enterprise
    - Máy chủ staging: 10.1.2.39
    - Cấu hình: Không sử dụng code tùy biến, tất cả cấu hình qua Odoo Admin UI

## 1. Kế toán (AMS - Accounting Management System)

Module Kế toán quản lý các hoạt động kế toán, hóa đơn, và báo cáo tài chính của công ty.

### Cài đặt module

1. Đăng nhập vào Odoo Admin (người dùng có quyền Admin)
2. Truy cập: **Ứng dụng** → Tìm kiếm `Accounting` hoặc `Invoicing`
3. Nhấn nút **Cài đặt** để kích hoạt module
4. Chờ quá trình cài đặt hoàn tất (thường mất 1-2 phút)

!!! tip "Tip"
    Nếu cần thanh toán bằng hóa đơn điện tử, hãy cài đặt module **Electronic Invoice** thêm.

### Cấu hình cơ bản

#### 1.1 Cấu hình công ty

| Bước | Hành động |
|------|----------|
| 1 | Truy cập: **Cài đặt** → **Công ty** |
| 2 | Chọn công ty cần cấu hình |
| 3 | Điền thông tin: Tên, Địa chỉ, MST, Logo |
| 4 | Lưu lại |

#### 1.2 Cấu hình đồng tiền

1. Truy cập: **Cài đặt** → **Đồng tiền**
2. Chọn đồng tiền mặc định (thường là VND - Đồng Việt Nam)
3. Cấu hình tỷ giá ngoại tệ nếu cần (ví dụ: USD, EUR)
4. Lưu lại

#### 1.3 Cấu hình thuế

1. Truy cập: **Cài đặt** → **Thuế**
2. Tạo các loại thuế cần sử dụng:
   - Thuế GTGT (10%, 5%, 0%)
   - Thuế thu nhập cá nhân (PIT)
   - Các loại thuế khác theo luật Việt Nam
3. Cho mỗi loại thuế, cấu hình tỷ lệ và tài khoản kế toán tương ứng

!!! warning "Lưu ý"
    Cấu hình thuế phải tuân thủ luật thuế Việt Nam hiện hành. Nên tham khảo bộ phận Kế toán trước khi cấu hình.

#### 1.4 Cấu hình tài khoản ngân hàng

1. Truy cập: **Cài đặt** → **Tài khoản ngân hàng**
2. Thêm mới tài khoản:
   - Số hiệu tài khoản
   - Ngân hàng
   - Người đại diện
   - Mã SWIFT (nếu có)
3. Kích hoạt các tài khoản đang sử dụng

### Kích hoạt hóa đơn điện tử

1. Truy cập: **Cài đặt** → **Hóa đơn điện tử**
2. Bật tính năng: `Kích hoạt hóa đơn điện tử`
3. Cấu hình thông tin kết nối với hệ thống hóa đơn điện tử (nếu có)
4. Cấu hình mẫu hóa đơn:
   - Định dạng số hóa đơn
   - Kỳ hóa đơn
   - Ký số (nếu sử dụng)

!!! info "Quy trình hóa đơn điện tử"
    Hóa đơn sẽ được tự động gửi sau khi xác nhận. Cần cấu hình email SMTP để gửi hóa đơn đến khách hàng.

## 2. Cho thuê (LMS - Lease Management System)

Module Cho thuê quản lý các hợp đồng cho thuê mặt bằng, cơ sở vật chất, và thu tiền thuê.

### Cài đặt module

1. Đăng nhập vào Odoo Admin
2. Truy cập: **Ứng dụng** → Tìm kiếm `Rental` hoặc `Real Estate`
3. Nhấn nút **Cài đặt** để kích hoạt module
4. Chờ quá trình cài đặt hoàn tất

### Cấu hình cơ bản

#### 2.1 Cấu hình loại mặt bằng

| Bước | Hành động |
|------|----------|
| 1 | Truy cập: **Cài đặt** → **Loại mặt bằng** |
| 2 | Thêm loại mặt bằng: Văn phòng, Kho, Căn hộ, v.v. |
| 3 | Cho mỗi loại, cấu hình thuộc tính: Diện tích, Giá thuê/m2 |
| 4 | Lưu lại |

#### 2.2 Cấu hình đơn vị tính

1. Truy cập: **Cài đặt** → **Đơn vị tính**
2. Tạo các đơn vị sử dụng cho thuê:
   - Mét vuông (m2)
   - Chiếc, cái (nếu có tài sản khác)
3. Lưu lại

#### 2.3 Cấu hình phương thức thanh toán

1. Truy cập: **Cài đặt** → **Phương thức thanh toán**
2. Thêm các phương thức:
   - Chuyển khoản ngân hàng
   - Tiền mặt
   - Séc
3. Cho mỗi phương thức, cấu hình thời hạn thanh toán (ví dụ: 30 ngày)

### Thiết lập hợp đồng mẫu

1. Truy cập: **Cài đặt** → **Mẫu hợp đồng**
2. Tạo mẫu hợp đồng cho thuê:
   - Đặt tên: "Mẫu hợp đồng cho thuê văn phòng"
   - Nhập nội dung mẫu (điều khoản, quyền lợi, nghĩa vụ)
   - Tạo các trường động (Bên cho thuê, Bên thuê, Thời gian, Giá)
3. Kích hoạt mẫu để sử dụng

!!! tip "Tip"
    Có thể tạo nhiều mẫu hợp đồng cho các loại mặt bằng khác nhau. Mỗi mẫu sẽ tự động điền thông tin khi tạo hợp đồng mới.

## 3. E-Office (EO - Electronic Office)

Hệ thống E-Office quản lý các công việc, phê duyệt, lịch làm việc, công văn, và vật tư văn phòng.

### Cài đặt module

1. Đăng nhập vào Odoo Admin
2. Cài đặt các module cần thiết theo thứ tự sau:

| Thứ tự | Module | Tìm kiếm |
|--------|--------|----------|
| 1 | Project | `Project` |
| 2 | Approvals | `Approvals` |
| 3 | Calendar | `Calendar` |
| 4 | Helpdesk | `Helpdesk` |
| 5 | Sales / Purchase | `Sales` hoặc `Purchase` |

3. Nhấn nút **Cài đặt** cho mỗi module theo thứ tự
4. Chờ quá trình cài đặt hoàn tất

### Cấu hình Phê duyệt (Approvals)

#### 3.1 Thiết lập loại phê duyệt

1. Truy cập: **E-Office** → **Phê duyệt** → **Loại phê duyệt**
2. Tạo loại phê duyệt mới:
   - **Tên**: "Phê duyệt công văn đi"
   - **Mô tả**: Mô tả chi tiết loại phê duyệt
   - **Số bước**: Số lượng bước phê duyệt cần thiết
3. Lưu lại

#### 3.2 Gán người duyệt

1. Truy cập: **E-Office** → **Phê duyệt** → **Loại phê duyệt**
2. Chọn loại phê duyệt vừa tạo
3. Tab **Người duyệt**:
   - Bước 1: Chọn người duyệt cấp 1 (ví dụ: Trưởng phòng)
   - Bước 2: Chọn người duyệt cấp 2 (ví dụ: Giám đốc)
   - Bước 3: Chọn người duyệt cấp 3 (nếu cần)
4. Lưu lại

!!! info "Mẹo phân quyền"
    Có thể dùng "Quy tắc" để tự động gán người duyệt dựa trên phòng ban hoặc chức vụ của người tạo yêu cầu.

### Cấu hình Helpdesk (Công văn)

#### 3.3 Thiết lập Team công văn

1. Truy cập: **Helpdesk** → **Cài đặt** → **Team công văn**
2. Tạo team mới:
   - **Tên**: "Team công văn đi"
   - **Quản lý**: Chọn người quản lý team
   - **Thành viên**: Thêm các thành viên xử lý công văn
3. Lưu lại

#### 3.4 Cấu hình giai đoạn xử lý

1. Truy cập: **Helpdesk** → **Cài đặt** → **Giai đoạn xử lý**
2. Tạo các giai đoạn:
   - Nhập kế
   - Xử lý
   - Hoàn thành
   - Hủy bỏ (nếu cần)
3. Cấu hình cho mỗi giai đoạn:
   - Trạng thái
   - Có gửi thông báo hay không
   - Template email (nếu cần)
4. Lưu lại

!!! warning "Lưu ý về email"
    Mỗi giai đoạn có thể gửi email thông báo tự động. Cần cấu hình template email phù hợp trước khi kích hoạt tính năng này.

### Cấu hình Project (Việc cần làm)

1. Truy cập: **Project** → **Cài đặt** → **Project**
2. Tạo project mới:
   - **Tên**: Tên dự án/công việc
   - **Mô tả**: Mô tả chi tiết
   - **Quản lý**: Chọn người quản lý dự án
3. Cấu hình trạng thái công việc:
   - Mới
   - Đang thực hiện
   - Hoàn thành
   - Đóng
4. Lưu lại

### Cấu hình Vật tư văn phòng (Sales/Purchase)

1. Truy cập: **Bán hàng** hoặc **Mua hàng**
2. Tạo danh mục sản phẩm:
   - Bút, giấy, thư mục
   - Máy tính, thiết bị
   - Khác
3. Cấu hình nhà cung cấp chính cho mỗi loại VPP
4. Thiết lập kho quản lý VPP

## 4. Nhân sự (HRMS - Human Resource Management System)

Module Nhân sự quản lý nhân viên, lương, nghỉ phép, chấm công, và tuyển dụng.

### Cài đặt module

1. Đăng nhập vào Odoo Admin
2. Cài đặt các module theo thứ tự sau:

| Thứ tự | Module | Tìm kiếm |
|--------|--------|----------|
| 1 | Employees | `Employees` |
| 2 | Payroll | `Payroll` |
| 3 | Time Off | `Time Off` |
| 4 | Attendances | `Attendances` |
| 5 | Recruitment | `Recruitment` |

3. Nhấn nút **Cài đặt** cho mỗi module theo thứ tự
4. Chờ quá trình cài đặt hoàn tất

### Cấu hình cơ bản

#### 4.1 Cấu hình phòng ban

1. Truy cập: **Nhân sự** → **Cài đặt** → **Phòng ban**
2. Tạo danh sách phòng ban công ty:
   - Hành chính
   - Kế toán
   - Bán hàng
   - Kỹ thuật
   - Khác
3. Cho mỗi phòng ban, cấu hình:
   - **Tên phòng ban**
   - **Quản lý phòng**: Chọn trưởng phòng
   - **Công ty**: Chọn công ty quản lý
4. Lưu lại

#### 4.2 Cấu hình chức vụ

1. Truy cập: **Nhân sự** → **Cài đặt** → **Chức vụ**
2. Tạo danh sách chức vụ:
   - Nhân viên
   - Trưởng nhóm
   - Trưởng phòng
   - Phó giám đốc
   - Giám đốc
3. Cho mỗi chức vụ, cấu hình:
   - **Tên chức vụ**
   - **Mức lương tối thiểu** (tùy chọn)
   - **Mô tả công việc**
4. Lưu lại

#### 4.3 Cấu hình cấu trúc lương

1. Truy cập: **Nhân sự** → **Lương** → **Cài đặt lương**
2. Tạo các thành phần lương:
   - **Lương cơ bản**
   - **Phụ cấp** (phụ cấp chức vụ, phụ cấp kỹ năng, v.v.)
   - **Bảo hiểm** (BHXH, BHYT, BHTN)
   - **Khấu trừ** (Thuế, nợ, v.v.)
3. Cho mỗi thành phần, cấu hình:
   - **Tên thành phần**
   - **Loại**: Thu nhập / Khấu trừ
   - **Công thức tính** (nếu cần)
4. Lưu lại

!!! warning "Lưu ý về lương"
    Cấu trúc lương phải tuân thủ luật lao động Việt Nam. Nên tham khảo bộ phận Nhân sự và Kế toán trước khi cấu hình.

#### 4.4 Cấu hình loại nghỉ phép

1. Truy cập: **Nhân sự** → **Nghỉ phép** → **Loại nghỉ phép**
2. Tạo danh sách loại nghỉ phép:
   - Nghỉ phép năm
   - Nghỉ ốm
   - Nghỉ không lương
   - Nghỉ hưởng chế độ (tang, việc nhân đạo, v.v.)
3. Cho mỗi loại, cấu hình:
   - **Tên loại nghỉ**
   - **Số ngày mặc định** (ví dụ: 12 ngày nghỉ phép năm)
   - **Tính vào khoảng thời gian**: Theo năm / Theo tháng / Theo ngày
   - **Loại**: Đã tính / Chưa tính
4. Lưu lại

### Kích hoạt chấm công

#### 4.5 Thiết lập chấm công

1. Truy cập: **Nhân sự** → **Chấm công** → **Cài đặt**
2. Bật tính năng: `Kích hoạt chấm công`
3. Lựa chọn phương thức chấm công:

| Phương thức | Mô tả | Cấu hình |
|-------------|-------|----------|
| Thiết bị chấm công | Máy chấm vân tay / khuôn mặt | IP, cổng kết nối |
| Mobile app | Ứng dụng di động Odoo | Cài đặt trên điện thoại |
| Web portal | Trang web chấm công | URL truy cập |

4. Chọn 1 hoặc kết hợp nhiều phương thức

#### 4.6 Cấu hình thiết bị chấm công (nếu sử dụng)

1. Truy cập: **Nhân sự** → **Chấm công** → **Thiết bị chấm công**
2. Thêm thiết bị mới:
   - **Tên thiết bị**: Tên thiết bị (ví dụ: "Máy chấm vân tay tầng 1")
   - **Địa chỉ IP**: IP của thiết bị
   - **Cổng**: Cổng kết nối (thường là 4370 cho máy ZK)
   - **Khu vực**: Chọn khu vực (văn phòng, nhà xưởng, v.v.)
3. Lưu lại
4. Kiểm tra kết nối: Nhấn nút **Kiểm tra kết nối**

!!! info "Kích hoạt Mobile app"
    Nếu chọn phương thức di động, cần cài đặt ứng dụng Odoo trên điện thoại của nhân viên. Các nhân viên sẽ chấm công bằng cách đăng nhập vào ứng dụng và nhấn nút "Chấm công".

### Cấu hình Tuyển dụng

1. Truy cập: **Nhân sự** → **Tuyển dụng** → **Vị trí tuyển dụng**
2. Tạo vị trí tuyển dụng mới:
   - **Tên vị trí**: Tên công việc cần tuyển (ví dụ: "Kỹ sư phần mềm")
   - **Phòng ban**: Chọn phòng ban cần tuyển
   - **Số lượng cần tuyển**: Số lượng vị trí
   - **Mức lương dự kiến**: Khoảng lương (tùy chọn)
3. Lưu lại

---

## Tóm tắt module và tính năng chính

| Module | Tên tiếng Anh | Chức năng chính | Link hướng dẫn |
|--------|---------------|-----------------|----------------|
| **Kế toán** | Accounting / Invoicing | Quản lý hóa đơn, báo cáo kế toán, thuế, ngân hàng | [Hướng dẫn vận hành Kế toán](/ke-toan/huong-dan-van-hanh) |
| **Cho thuê** | Rental / Real Estate | Quản lý hợp đồng cho thuê, mặt bằng, thanh toán tiền thuê | [Hướng dẫn vận hành Cho thuê](/cho-thue/huong-dan-van-hanh) |
| **E-Office** | Project / Approvals / Helpdesk / Sales | Quản lý công việc, phê duyệt, công văn, vật tư văn phòng | [Hướng dẫn vận hành E-Office](/e-office/huong-dan-van-hanh) |
| **Nhân sự** | Employees / Payroll / Attendances / Time Off | Quản lý nhân viên, lương, chấm công, nghỉ phép, tuyển dụng | [Hướng dẫn vận hành Nhân sự](/nhan-su/huong-dan-van-hanh) |

!!! tip "Bước tiếp theo"
    Sau khi hoàn thành cài đặt cơ bản, hãy tham khảo các hướng dẫn vận hành chi tiết cho từng module để tìm hiểu thêm về các tính năng nâng cao và quy trình sử dụng.

!!! warning "Hỗ trợ"
    Nếu gặp vấn đề trong quá trình cài đặt, vui lòng liên hệ với bộ phận IT hoặc quản trị viên hệ thống Odoo.
