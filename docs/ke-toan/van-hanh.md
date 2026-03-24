# Hướng dẫn Vận hành Kế toán — Dành cho Người dùng

!!! tip "Mẹo"
    Tài liệu này hướng dẫn từng bước các thao tác kế toán hàng ngày trên hệ thống Odoo. Nếu bạn cần thiết lập hệ thống (tạo tài khoản, cấu hình sổ nhật ký, kết nối S-Invoice...), vui lòng liên hệ quản trị viên hoặc xem HD-Thiet-Lap-He-Thong.

---

## Phần A — Nhập báo cáo hàng tháng

Mỗi tháng, Quản lý Mall cần nhập 2 loại báo cáo vào hệ thống trước khi kế toán xuất hóa đơn.

### A1. Báo cáo Điện / Nước / Gas

Mở: **Cho thuê → Hoạt động khác → Báo cáo điện, nước, gas**

#### Cách tạo 1 báo cáo

1. Bấm **Mới**
2. Chọn **Loại tiện ích** (Điện, Nước, hoặc Gas)
3. Chọn **Mã hợp đồng** — các thông tin Mall, Vị trí, Khách thuê, Thương hiệu sẽ tự động hiện ra
4. Ở phần **Chi tiết**, bấm "Thêm một dòng" rồi nhập:
   - Ngày bắt đầu, Ngày kết thúc
   - Chỉ số đầu, Chỉ số cuối (hệ thống tự tính Mức tiêu thụ)
   - Hệ số nhân (thường để 1, trừ khi có hệ số đặc biệt)
   - Đơn giá
   - Thuế (đã có sẵn mặc định, có thể đổi nếu cần)
5. Bấm **Tải lên tập tin của bạn** để upload bản scan/ảnh chụp báo cáo gốc
6. Bấm **Xác nhận** — hệ thống sẽ ghi nhận kỳ hóa đơn hiện tại

!!! warning "Lưu ý quan trọng"
    Bạn **phải** upload file trước khi Xác nhận. Nếu quên, hệ thống sẽ báo lỗi.

#### Cách tải file cho nhiều báo cáo cùng lúc

1. Ở danh sách, tick chọn nhiều báo cáo đang ở trạng thái Mới
2. Bấm **Thực hiện → Tải bản cứng đã ký**
3. Upload file → Bấm **Lưu bản cứng** — file sẽ được gắn vào tất cả báo cáo đã chọn

#### Cách import nhiều báo cáo từ Excel

1. Chuẩn bị file Excel theo biểu mẫu (liên hệ kế toán để lấy mẫu)
2. Ở danh sách báo cáo, bấm **Yêu thích → Import dữ liệu**
3. **Tải tệp lên** → Bấm **Kiểm thử** để kiểm tra dữ liệu
4. Nếu hợp lệ → Bấm **Nhập** để đưa dữ liệu lên hệ thống

#### Cách xác nhận nhiều báo cáo cùng lúc

1. Tick chọn nhiều báo cáo → Bấm **Thực hiện → Xác nhận báo cáo**

---

### A2. Báo cáo Doanh thu Khách thuê

Mở: **Cho thuê → Hoạt động khác → Báo cáo doanh thu khách thuê**

Thao tác giống hệt Báo cáo Điện/Nước/Gas. Khác ở phần Chi tiết:
- Nhập **Ngày bắt đầu, Ngày kết thúc, Doanh thu** (số tiền)
- Hệ thống tự cộng **Tổng doanh thu**

---

## Phần B — Xuất hóa đơn từ LMS

### B1. Xuất hóa đơn tự động (theo hợp đồng)

Mở: **Lên hóa đơn → Khách hàng → Tạo hóa đơn thủ công**

Một cửa sổ hiện ra cho phép bạn chọn:

| Lựa chọn | Khi nào dùng |
|-----------|-------------|
| **Kỳ hóa đơn hiện tại** | Xuất hóa đơn cho kỳ đang hoạt động |
| **Kỳ hóa đơn tiếp theo** | Xuất hóa đơn báo trước |
| **Trong khoảng thời gian** | Chọn ngày bắt đầu → kết thúc cụ thể |

Bạn có thể lọc thêm theo **Mall** hoặc **Mã hợp đồng** cụ thể, hoặc để trống để xuất tất cả.

Bấm **Tạo hóa đơn** → hệ thống sẽ tạo hóa đơn trên cả LMS và AMS.

### B2. Tạo hóa đơn thủ công

Mở: **Lên hóa đơn → Khách hàng → Hóa đơn → Mới**

1. Chọn **Khách hàng** và **Mã hợp đồng**
2. Nhập Ngày hóa đơn, Ngày phải trả
3. Ở phần Chi tiết, bấm "Thêm một dòng":
   - Chọn **Loại phí** → Nhãn tự động điền
   - Nhập Từ ngày, Đến ngày, Số lượng, Giá, Thuế
4. Bấm **Lưu** → hóa đơn sẽ tự động tạo trên AMS

---

## Phần C — Nghiệp vụ Kế toán hàng ngày trên AMS

### C1. Hóa đơn bán hàng (Công nợ phải thu)

Mở: **Kế toán → Khách hàng → Hóa đơn**

#### Hóa đơn tự động từ hợp đồng thuê

Hệ thống **tự động tạo** hóa đơn khi đến kỳ thanh toán của hợp đồng. Bạn chỉ cần:
1. Mở hóa đơn, kiểm tra thông tin
2. Bấm **Xác nhận** để vào sổ

Hóa đơn gồm: tiền thuê cơ bản + chi phí dịch vụ + doanh thu chia sẻ. Tiền điện/nước/gas được tách riêng.

#### Hóa đơn báo trước

Là hóa đơn của **kỳ tiếp theo**, hệ thống tự tạo khi đến ngày thiết lập. Nhận biết bằng nhãn hồng **"HÓA ĐƠN BÁO TRƯỚC"**.

Hóa đơn báo trước **chưa thể xác nhận** — khi sang kỳ mới, nó tự chuyển thành hóa đơn bình thường.

#### Tạo hóa đơn thủ công trên AMS

1. Bấm **Mới**
2. Chọn Khách hàng, Ngày, Sổ nhật ký, Mã hợp đồng (nếu có)
3. Thêm dòng chi tiết: Sản phẩm, Nhãn, Từ ngày, Đến ngày, Số lượng, Giá, Thuế
4. Nếu cần tính lãi trả chậm → vào **Tab Thông tin khác** → nhập Ngày bắt đầu thanh toán và Mức lãi suất
5. Bấm **Xác nhận**

#### Giảm công nợ bán hàng

Mở: **Kế toán → Khách hàng → Giấy báo có → Mới**

Nhập Khách hàng, Sản phẩm, Số lượng, Giá → Bấm **Xác nhận**.

#### In Đề nghị thanh toán

Mở hóa đơn → Bấm biểu tượng **In** → Chọn **"Bảng in"** → file PDF sẽ tải về máy.

---

### C2. Hóa đơn mua hàng (Công nợ phải trả)

Mở: **Kế toán → Nhà cung cấp → Hóa đơn → Mới**

1. Chọn **Nhà cung cấp**
2. Nhập Mã hóa đơn (số HĐ của NCC), Ngày, TK ngân hàng người nhận
3. Thêm chi tiết: Sản phẩm, Nhãn, TK kế toán, Số lượng, Giá, Thuế
4. Kiểm tra tab **Chi tiết bút toán** → Bấm **Xác nhận**

**Giảm công nợ mua hàng:** Mở hóa đơn gốc → Bấm **Thêm giấy báo có** → Nhập lý do → **Đảo ngược**.

---

### C3. Ghi nhận thanh toán

#### Thanh toán cho 1 hóa đơn cụ thể

1. Mở hóa đơn đã xác nhận
2. Bấm **Ghi nhận thanh toán**
3. Chọn: Sổ nhật ký, Phương thức thanh toán, Số tiền, Ngày
4. Bấm **Tạo thanh toán**

Hệ thống sẽ tự động đánh dấu hóa đơn là "Đang thanh toán" hoặc "Đã thanh toán".

#### Tạo thanh toán khi chưa biết rõ hóa đơn

Mở: **Kế toán → Khách hàng → Thanh toán → Tạo**

Nhập: Loại (Nhận/Gửi), Khách hàng, Số tiền, Ngày, Sổ nhật ký → **Xác nhận**.

Sau đó, bạn có thể liên kết khoản thanh toán này với hóa đơn tương ứng (xem phần Liên kết thanh toán bên dưới).

#### Liên kết thanh toán với hóa đơn

Mở hóa đơn đã xác nhận → Kéo xuống phần **Dư nợ còn lại** → Bấm **Thêm** → Chọn khoản thanh toán chưa phân bổ.

#### Trường hợp khách trả thiếu

1. Bấm **Ghi nhận thanh toán** → Nhập số tiền thực nhận (thấp hơn công nợ)
2. Hệ thống hiện phần **Thanh toán chênh lệch**
3. Chọn **"Đánh dấu đã trả đủ"** → Chọn tài khoản ghi nhận phần thiếu (VD: Chi phí khác)
4. Bấm **Tạo thanh toán**

#### Hủy liên kết thanh toán

Mở hóa đơn → Phần tóm tắt → Bấm **Xem chi tiết** → Bấm **Chưa đối soát**.

#### Đối soát ngân hàng (Bank Statement)

Mở: **Kế toán → Bảng thông tin → [Chọn sổ ngân hàng]**

1. Bấm **Mới**
2. Nhập: Ngày, Nhãn (mã phiếu thu), Đối tác (tên KH), Tổng tiền
3. Bấm **Lưu và đóng**
4. Bấm **Xác nhận** → **Thiết lập đã kiểm tra** → Trạng thái chuyển thành "Matched"

---

### C4. Bút toán phát sinh

Mở: **Kế toán → Kế toán → Bút toán phát sinh → Mới**

1. Nhập Mã phiếu, Ngày kế toán, Sổ nhật ký
2. Bấm **Thêm dòng** cho mỗi tài khoản:
   - Chọn Tài khoản, Đối tác, Nhập Nhãn (ghi chú)
   - Nhập số tiền vào cột **Nợ** hoặc **Có**
3. Đảm bảo tổng Nợ = tổng Có
4. Bấm **Vào sổ**

#### Bút toán tiền cọc (tự động)

Khi bên Leasing tạo Đề nghị thanh toán cho khoản cọc → hệ thống **tự động tạo** bút toán trên AMS với mã `DATCOC/[Mã Deal]`.

Bạn chỉ cần kiểm tra sổ nhật ký và tài khoản, điều chỉnh nếu cần → Bấm **Vào sổ**.

#### Bút toán âm (chỉ dành cho Quản trị viên thanh toán)

1. Tạo bút toán mới
2. Tick chọn **"Bút toán giảm trực tiếp"**
3. Bây giờ bạn có thể nhập **số âm** ở cột Nợ hoặc Có

---

### C5. Quản lý Ngân sách

Mở: **Kế toán → Kế toán → Ngân sách → Mới**

1. Nhập tên ngân sách, người phụ trách, thời gian
2. Bấm **Thêm dòng**: chọn Dự thảo ngân sách, Tài khoản phân tích, Ngày, Giá trị kế hoạch
3. Bấm **Xác nhận**

Hệ thống sẽ so sánh giá trị thực tế với kế hoạch để theo dõi tiến độ chi tiêu.

---

## Phần D — Xuất hóa đơn điện tử (S-Invoice)

### D1. Phát hành hóa đơn điện tử

1. Mở hóa đơn đã **Xác nhận** (trạng thái "Đã vào sổ")
2. Bấm nút **S-Invoice**
3. Chọn: Mẫu hóa đơn, Ký hiệu hóa đơn, Hình thức thanh toán
4. Bấm **Xem trước** để kiểm tra nội dung
5. Bấm **Lập hóa đơn** để phát hành chính thức

Sau khi phát hành thành công, hệ thống sẽ nhận mã cơ quan thuế và lưu thông tin HĐĐT.

### D2. Điều chỉnh hóa đơn điện tử

Dùng khi cần điều chỉnh **tăng hoặc giảm** giá trị hóa đơn đã phát hành.

1. Tạo hóa đơn điều chỉnh trên Odoo → Xác nhận
2. Bấm **S-Invoice** → Chọn **"Điều chỉnh HĐ"**
3. Chọn **Hóa đơn gốc** từ danh sách (hoặc nhập thủ công nếu HĐ gốc nằm ngoài hệ thống)
4. Bấm **Lập hóa đơn**

!!! warning "Lưu ý quan trọng"
    Mẫu và Ký hiệu của hóa đơn gốc và hóa đơn điều chỉnh **phải trùng nhau**. Nếu không, hệ thống sẽ báo lỗi.

### D3. Thay thế hóa đơn điện tử

Thao tác giống Điều chỉnh, nhưng chọn **"Thay thế HĐ"** thay vì "Điều chỉnh HĐ".

### D4. Hủy hóa đơn điện tử

1. Mở hóa đơn đã phát hành HĐĐT
2. Bấm **Hủy** → Nhập lý do hủy
3. Hệ thống gửi yêu cầu hủy lên S-Invoice

Nếu muốn đưa hóa đơn về Dự thảo:
- Chưa phát hành HĐĐT → Đưa về dự thảo bình thường
- Đã phát hành HĐĐT → **Phải hủy HĐĐT trước** rồi mới đưa về dự thảo

### D5. Gửi HĐĐT cho khách hàng

**Gửi 1 hóa đơn:** Mở hóa đơn → Bấm **Gửi**

**Gửi nhiều hóa đơn:** Ở danh sách, tick chọn nhiều HĐ → Bấm **Thực hiện → Gửi HĐĐT**

---

## Mẹo sử dụng Odoo

| Mẹo | Cách làm |
|-----|---------|
| Tìm kiếm nhanh | Bấm phím **Cách** ở trang chủ → gõ tên cần tìm |
| Quay lại trang trước | Bấm vào **đường dẫn phía trên bên trái** (KHÔNG dùng nút Back của trình duyệt) |
| Nhận biết trường bắt buộc | Trường có **gạch chân đậm** là bắt buộc phải nhập |

---

## Tài liệu liên quan

- [Huong-Dan-Bao-Cao-TT200](../ke-toan/bao-cao-tt200.md) — Hướng dẫn xuất báo cáo kế toán theo Thông tư 200
- [Hướng dẫn Vận hành Cho thuê (LMS)](../cho-thue/van-hanh-lms.md) — Tạo Deal, LAF, OL, Hợp đồng, Thanh lý
