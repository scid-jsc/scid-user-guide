# Hướng dẫn Vận hành — Phân hệ Nhân sự (HRMS)

!!! info
    Tài liệu này hướng dẫn bộ phận Nhân sự thao tác trên Odoo: quản lý hồ sơ nhân viên, hợp đồng, bảng lương, nghỉ phép, chấm công và thi đua khen thưởng.

---

## Phần 1 — Hồ sơ Nhân viên

### 1.1 Tạo nhân viên mới

Mở: **Nhân viên (Employees) → Mới**

1. Điền thông tin cơ bản: Họ tên, Chức danh, Phòng ban, Quản lý trực tiếp

   ![Screenshot](assets/SCID_HRMS_image19.png)

2. Bổ sung thông tin cá nhân tại các tab: Thông tin làm việc, Thông tin cá nhân, Cài đặt HR

   ![Screenshot](assets/SCID_HRMS_image20.png)

   ![Screenshot](assets/SCID_HRMS_image21.png)

3. Bấm biểu tượng **đám mây** để lưu

   ![Screenshot](assets/SCID_HRMS_image22.png)

!!! tip "Mẹo"
    Trường có **gạch chân đậm** là bắt buộc nhập. Hãy điền đầy đủ trước khi lưu.

### 1.2 Đăng ký thông tin người thân / người phụ thuộc

Mở hồ sơ nhân viên → bấm smart button **Gia đình**

1. Bấm **New** để mở form đăng ký

   ![Screenshot](assets/SCID_HRMS_image1.png)

2. Điền đầy đủ thông tin người thân

   ![Screenshot](assets/SCID_HRMS_image2.png)

   ![Screenshot](assets/SCID_HRMS_image3.png)

3. **Nếu là người phụ thuộc:** tick chọn **Người phụ thuộc** → hệ thống hiện thêm 3 trường:
   - **Ngày Bắt đầu** (bắt buộc), Ngày Kết thúc, Ghi chú

   ![Screenshot](assets/SCID_HRMS_image4.png)

   ![Screenshot](assets/SCID_HRMS_image5.png)

   ![Screenshot](assets/SCID_HRMS_image6.png)

4. Bấm biểu tượng **đám mây** để lưu

   ![Screenshot](assets/SCID_HRMS_image7.png)

   ![Screenshot](assets/SCID_HRMS_image8.png)

   ![Screenshot](assets/SCID_HRMS_image9.png)

   ![Screenshot](assets/SCID_HRMS_image10.png)

   ![Screenshot](assets/SCID_HRMS_image11.png)

!!! info
    Số lượng người thân trong hồ sơ nhân viên sẽ tự tăng thêm 1 sau khi lưu.

---

## Phần 2 — Hợp đồng Lao động

### 2.1 Tạo hợp đồng mới

Mở: **Nhân viên → Hợp đồng → Mới**

1. Chọn nhân viên, điền Loại hợp đồng, Ngày bắt đầu

   ![Screenshot](assets/SCID_HRMS_image12.png)

   ![Screenshot](assets/SCID_HRMS_image13.png)

2. Vào tab **Thông tin lương**: điền Cơ cấu lương, Bảng lương, Lương cơ bản

   ![Screenshot](assets/SCID_HRMS_image14.png)

   ![Screenshot](assets/SCID_HRMS_image15.png)

   ![Screenshot](assets/SCID_HRMS_image16.png)

3. Bấm biểu tượng **đám mây** để lưu

   ![Screenshot](assets/SCID_HRMS_image17.png)

4. Bấm **Đang chạy** để kích hoạt hợp đồng

   ![Screenshot](assets/SCID_HRMS_image18.png)

### 2.2 Tạo Phụ lục hợp đồng

Mở hợp đồng đang chạy → bấm **Tạo Phụ lục (Create Promotion Appendix)**

1. Điền số phụ lục, thông tin quyết định

   ![Screenshot](assets/SCID_HRMS_image46.png)

2. Bấm **Xác nhận** → hệ thống tạo form phụ lục

   ![Screenshot](assets/SCID_HRMS_image47.png)

3. Kiểm tra thông tin phụ lục vừa tạo trong tab **Phụ lục**

   ![Screenshot](assets/SCID_HRMS_image48.png)

   ![Screenshot](assets/SCID_HRMS_image49.png)

### 2.3 Nhân viên kiêm nhiệm (Chức danh phụ)

Mở: **Nhân viên**

![Screenshot](assets/SCID_HRMS_image37.png)

Mở hồ sơ nhân viên chính → bấm **Tạo chức danh phụ**

![Screenshot](assets/SCID_HRMS_image38.png)

- Hệ thống sinh ra nhân viên kiêm nhiệm liên kết với nhân viên chính

   ![Screenshot](assets/SCID_HRMS_image39.png)

- Vào tab **Thông tin cá nhân** để bổ sung thông tin kiêm nhiệm

   ![Screenshot](assets/SCID_HRMS_image40.png)

- Mở sub-employee → bấm **Tạo phụ lục** để tạo hợp đồng kiêm nhiệm

   ![Screenshot](assets/SCID_HRMS_image41.png)

   ![Screenshot](assets/SCID_HRMS_image42.png)

   ![Screenshot](assets/SCID_HRMS_image43.png)

   ![Screenshot](assets/SCID_HRMS_image44.png)

   ![Screenshot](assets/SCID_HRMS_image45.png)

---

## Phần 3 — Phụ cấp

### 3.1 Khai báo loại phụ cấp

Mở: **Bảng lương → Cấu hình → Loại khoản mục khác → Mới**

Điền tên phụ cấp, loại, phương thức tính → bấm **Lưu**.

![Screenshot](assets/SCID_HRMS_image23.png)

![Screenshot](assets/SCID_HRMS_image24.png)

![Screenshot](assets/SCID_HRMS_image25.png)

![Screenshot](assets/SCID_HRMS_image26.png)

### 3.2 Gán phụ cấp vào hợp đồng

Mở hợp đồng nhân viên → tab **Thông tin lương** → phần **Phụ cấp**

- Bấm **Thêm một dòng** → chọn loại phụ cấp đã khai báo

![Screenshot](assets/SCID_HRMS_image27.png)

![Screenshot](assets/SCID_HRMS_image28.png)

![Screenshot](assets/SCID_HRMS_image29.png)

### 3.3 Trạng thái phụ cấp tự động

| Trạng thái HĐ | Trạng thái phụ cấp |
|--------------|------------------|
| Đang chạy | Hệ thống tạo record phụ cấp |
| Đã hết hạn | Chuyển thành **Đã hoàn thành**, cập nhật Ngày kết thúc |
| Đã hủy | Chuyển thành **Đã hủy** |

![Screenshot](assets/SCID_HRMS_image30.png)

![Screenshot](assets/SCID_HRMS_image31.png)

![Screenshot](assets/SCID_HRMS_image32.png)

![Screenshot](assets/SCID_HRMS_image33.png)

---

## Phần 4 — Bảng lương

### 4.1 Tạo phiếu lương

Mở: **Bảng lương → Phiếu lương → Cần thanh toán → Mới**

![Screenshot](assets/SCID_HRMS_image34.png)

1. Nhập tên nhân viên và **Giai đoạn phiếu lương**

   ![Screenshot](assets/SCID_HRMS_image50.png)

   ![Screenshot](assets/SCID_HRMS_image51.png)

2. Các trường khác tự động điền từ hợp đồng

   ![Screenshot](assets/SCID_HRMS_image52.png)

3. Bấm **Bảng tính lương** → hệ thống tính tự động

   ![Screenshot](assets/SCID_HRMS_image53.png)

   ![Screenshot](assets/SCID_HRMS_image54.png)

4. Xem chi tiết:
   - Tab **Ngày làm việc & Khoản mục** — thông tin công và phụ cấp
   - Tab **Tính toán lương** — bảng lương chi tiết

   ![Screenshot](assets/SCID_HRMS_image35.png)

   ![Screenshot](assets/SCID_HRMS_image36.png)

   ![Screenshot](assets/SCID_HRMS_image55.png)

   ![Screenshot](assets/SCID_HRMS_image56.png)

### 4.2 Cấu hình thuế TNCN lũy tiến

Mở hồ sơ nhân viên → smart button **Hợp đồng** → chọn hợp đồng hiệu lực

- Tab **Thông tin lương** → trường **Quy cách tính thuế** → chọn **Thuế lũy tiến**

   ![Screenshot](assets/SCID_HRMS_image57.png)

   ![Screenshot](assets/SCID_HRMS_image58.png)

   ![Screenshot](assets/SCID_HRMS_image59.png)

   ![Screenshot](assets/SCID_HRMS_image60.png)

   ![Screenshot](assets/SCID_HRMS_image61.png)

!!! info
    Sau khi cấu hình, mục thuế TNCN lũy tiến trung bình sẽ hiển thị trên phiếu lương của nhân viên.

---

## Phần 5 — Nghỉ phép

### 5.1 Thiết lập luồng phê duyệt nghỉ phép (Admin)

Mở: **Phê duyệt → Cấu hình → Loại Phê duyệt → Mới**

1. Nhập tên, tick chọn **Nghỉ phép**

   ![Screenshot](assets/SCID_HRMS_image62.png)

   ![Screenshot](assets/SCID_HRMS_image63.png)

2. Tab **Approval Options** → bấm **Thêm một dòng** để tạo điều kiện:
   - Description, Condition (loại nghỉ, phòng ban, số ngày)

   ![Screenshot](assets/SCID_HRMS_image64.png)

   ![Screenshot](assets/SCID_HRMS_image65.png)

3. Tab **Approvers** → thêm người duyệt:
   - Tick **By Employee's Approver** / **By Department Manager** — tự thêm quản lý trực tiếp và trưởng phòng
   - Tick **Bắt buộc** nếu cần
   - Cấu hình **Minimum Approval** (số người duyệt tối thiểu)
   - Cấu hình **Approver Sequence** (thứ tự duyệt từ trên xuống)

   ![Screenshot](assets/SCID_HRMS_image66.png)

   ![Screenshot](assets/SCID_HRMS_image67.png)

   ![Screenshot](assets/SCID_HRMS_image68.png)

4. Bấm **Lưu**

   ![Screenshot](assets/SCID_HRMS_image69.png)

   ![Screenshot](assets/SCID_HRMS_image70.png)

   ![Screenshot](assets/SCID_HRMS_image71.png)

   ![Screenshot](assets/SCID_HRMS_image72.png)

   ![Screenshot](assets/SCID_HRMS_image73.png)

!!! warning "Lưu ý"
    Chỉ chạy **1 luồng phê duyệt** tại một thời điểm. Thứ tự mặc định: Quản lý trực tiếp → Trưởng phòng → Danh sách Approvers.

### 5.2 Nhân viên nộp đơn xin phép

Mở: **Nghỉ phép → Mới** (hoặc kéo trực tiếp trên lịch)

1. Điền ngày nghỉ, loại nghỉ phép

   ![Screenshot](assets/SCID_HRMS_image74.png)

   ![Screenshot](assets/SCID_HRMS_image75.png)

2. Bấm **Lưu** để gửi yêu cầu phê duyệt

   ![Screenshot](assets/SCID_HRMS_image76.png)

Theo dõi trạng thái:

- **Phê duyệt → Phê duyệt của tôi → Yêu cầu của tôi**
- Hoặc vào đơn xin phép → bấm smart button **Phê duyệt**

   ![Screenshot](assets/SCID_HRMS_image77.png)

   ![Screenshot](assets/SCID_HRMS_image78.png)

   ![Screenshot](assets/SCID_HRMS_image79.png)

   ![Screenshot](assets/SCID_HRMS_image80.png)

### 5.3 Người duyệt xử lý đơn nghỉ phép

Mở: **Phê duyệt → Phê duyệt nghỉ phép → Cần xem lại**

- **Phê duyệt** → chuyển tiếp cho người duyệt tiếp theo; khi tất cả duyệt → **Đã phê duyệt**

   ![Screenshot](assets/SCID_HRMS_image81.png)

   ![Screenshot](assets/SCID_HRMS_image82.png)

   ![Screenshot](assets/SCID_HRMS_image83.png)

- **Từ chối** → ngay lập tức toàn bộ luồng **Bị từ chối** (nhân viên có thể hủy và nộp lại)

   ![Screenshot](assets/SCID_HRMS_image84.png)

   ![Screenshot](assets/SCID_HRMS_image85.png)

   ![Screenshot](assets/SCID_HRMS_image86.png)

### 5.4 Kế hoạch tích lũy phép

Mở: **Nghỉ phép → Cấu hình → Kế hoạch tích lũy → Mới**

1. Đặt tên kế hoạch; tick **Dựa trên thời gian làm việc** nếu cần

   ![Screenshot](assets/SCID_HRMS_image95.png)

   ![Screenshot](assets/SCID_HRMS_image96.png)

2. Thiết lập **Thời điểm đạt tích lũy** (đầu kỳ / cuối kỳ)

   ![Screenshot](assets/SCID_HRMS_image97.png)

3. Chọn **Thời gian chuyển** phép sang năm mới

   ![Screenshot](assets/SCID_HRMS_image98.png)

   ![Screenshot](assets/SCID_HRMS_image99.png)

4. Bấm **Mốc mới** để thêm quy tắc tích lũy:
   - Số ngày tích lũy/chu kỳ, Tần suất, Giới hạn tối đa, Cách xử lý phép dư

   ![Screenshot](assets/SCID_HRMS_image100.png)

   ![Screenshot](assets/SCID_HRMS_image101.png)

   ![Screenshot](assets/SCID_HRMS_image102.png)

5. Bấm **Lưu & đóng** → lưu kế hoạch

   ![Screenshot](assets/SCID_HRMS_image103.png)

   ![Screenshot](assets/SCID_HRMS_image104.png)

6. Gán kế hoạch: **Quản lý → Phân bổ → Mới** → chọn **Phân bổ tích lũy** + kế hoạch đã tạo

   ![Screenshot](assets/SCID_HRMS_image105.png)

   ![Screenshot](assets/SCID_HRMS_image106.png)

   ![Screenshot](assets/SCID_HRMS_image107.png)

   ![Screenshot](assets/SCID_HRMS_image108.png)

---

## Phần 6 — Chấm công

### 6.1 Duyệt công

Mở: **Chấm công → Danh sách**

1. Chọn các record cần duyệt

   ![Screenshot](assets/SCID_HRMS_image87.png)

   ![Screenshot](assets/SCID_HRMS_image88.png)

2. Bấm **Phê duyệt** → cột **Được duyệt bởi** hiển thị tên người duyệt

   ![Screenshot](assets/SCID_HRMS_image89.png)

   ![Screenshot](assets/SCID_HRMS_image90.png)

### 6.2 Xuất dữ liệu công

1. Tại Danh sách → chọn các record cần xuất

   ![Screenshot](assets/SCID_HRMS_image91.png)

   ![Screenshot](assets/SCID_HRMS_image92.png)

2. Vào **Tác vụ → Xuất**

   ![Screenshot](assets/SCID_HRMS_image93.png)

3. Chọn các trường mong muốn → chọn định dạng `.xlsx` hoặc `.csv`

4. Bấm **Xuất** để tải về

   ![Screenshot](assets/SCID_HRMS_image94.png)

---

## Phần 7 — Phụ cấp & Phép Thâm niên

### 7.1 Thiết lập Khung lương

Mở: **Nhân viên → Cấu hình → Khung lương → Mới**

![Screenshot](assets/SCID_HRMS_image128.png)

1. Điền tên khung lương, chức vụ áp dụng

   ![Screenshot](assets/SCID_HRMS_image129.png)

   ![Screenshot](assets/SCID_HRMS_image130.png)

2. Điền thông tin các Bậc lương (đặc biệt Bậc 1 — dùng làm cơ sở tính thâm niên)

   ![Screenshot](assets/SCID_HRMS_image131.png)

3. Cập nhật Bậc lương trên hợp đồng lao động hiện tại (thủ công)

   ![Screenshot](assets/SCID_HRMS_image132.png)

   ![Screenshot](assets/SCID_HRMS_image133.png)

### 7.2 Xét thâm niên

Mở: **Nhân viên**

![Screenshot](assets/SCID_HRMS_image134.png)

Vào **Nhân viên → Danh sách xét thâm niên → Xét thâm niên**

![Screenshot](assets/SCID_HRMS_image135.png)

Chọn mốc xét:

- **Đợt 1** — đến ngày 31/12 năm trước
- **Đợt 2** — đến ngày 30/06 năm hiện tại

   ![Screenshot](assets/SCID_HRMS_image136.png)

   ![Screenshot](assets/SCID_HRMS_image137.png)

Hệ thống tự tính:

| Thông tin | Nguồn |
|-----------|-------|
| Ngày bắt đầu thâm niên | HĐ "Quay lại làm" hoặc HĐ "Chính thức" cũ nhất |
| Mức PC thâm niên (Bậc 1) | Chức vụ trên HĐ/Phụ lục tương ứng |
| Công thức | `Σ(Mức Bậc 1 × Số ngày) / Tổng ngày 5 năm` |

Sau khi kiểm tra: bấm **Xác nhận đã chi** để đánh dấu trạng thái chi trả.

   ![Screenshot](assets/SCID_HRMS_image138.png)

   ![Screenshot](assets/SCID_HRMS_image139.png)

   ![Screenshot](assets/SCID_HRMS_image140.png)

### 7.3 Phép thâm niên

Mở: **Nghỉ phép → Cấu hình → Loại nghỉ phép**

![Screenshot](assets/SCID_HRMS_image141.png)

- Chọn **Nghỉ phép thâm niên**

   ![Screenshot](assets/SCID_HRMS_image142.png)

   ![Screenshot](assets/SCID_HRMS_image143.png)

- Tick **Dựa trên thâm niên** → hệ thống tự phân bổ khi chạy Xét thâm niên
- Mỗi 5 năm thâm niên → cộng thêm **+1 ngày nghỉ phép** (không giới hạn hết hạn)

   ![Screenshot](assets/SCID_HRMS_image144.png)

   ![Screenshot](assets/SCID_HRMS_image145.png)

   ![Screenshot](assets/SCID_HRMS_image146.png)

---

## Phần 8 — Thi đua Khen thưởng & Sáng kiến

### 8.1 Thiết lập Danh hiệu thi đua

Mở: **Nhân viên → Cấu hình → Danh hiệu thi đua → Mới**

Điền: Tên danh hiệu (bắt buộc), Loại (Cá nhân/Tập thể), Tiêu chí xét duyệt → lưu.

![Screenshot](assets/SCID_HRMS_image109.png)

![Screenshot](assets/SCID_HRMS_image110.png)

![Screenshot](assets/SCID_HRMS_image111.png)

![Screenshot](assets/SCID_HRMS_image112.png)

### 8.2 Tạo hồ sơ Khen thưởng

Mở: **Nhân viên → Thi đua khen thưởng → Mới**

![Screenshot](assets/SCID_HRMS_image113.png)

1. Chọn **Danh hiệu**, nhập Số quyết định, Ngày hiệu lực

   ![Screenshot](assets/SCID_HRMS_image114.png)

   ![Screenshot](assets/SCID_HRMS_image115.png)

2. Chọn Đơn vị, Phòng ban/Tổ nhóm (nếu là tập thể)

   ![Screenshot](assets/SCID_HRMS_image116.png)

   ![Screenshot](assets/SCID_HRMS_image117.png)

3. Nhập Mức chi thưởng, Phương thức thanh toán

   ![Screenshot](assets/SCID_HRMS_image118.png)

4. Tab **Thông tin nhân viên**: chọn nhân viên được khen thưởng

   ![Screenshot](assets/SCID_HRMS_image119.png)

5. Bấm **Gửi duyệt** → người có thẩm quyền **Phê duyệt / Từ chối / Hủy**

   ![Screenshot](assets/SCID_HRMS_image120.png)

### 8.3 Tạo hồ sơ Sáng kiến

Mở: **Nhân viên → Quản lý sáng kiến → Mới**

![Screenshot](assets/SCID_HRMS_image121.png)

1. Điền: Tên sáng kiến, Loại (Giải pháp/Sáng kiến/Cải tiến), Cấp công nhận, Lĩnh vực

   ![Screenshot](assets/SCID_HRMS_image122.png)

   ![Screenshot](assets/SCID_HRMS_image123.png)

2. Nhập Số quyết định, Ngày hiệu lực, Đơn vị

   ![Screenshot](assets/SCID_HRMS_image124.png)

   ![Screenshot](assets/SCID_HRMS_image125.png)

3. Tab **Thông tin nhân viên**: chọn tác giả + tỷ lệ đóng góp (%)

   ![Screenshot](assets/SCID_HRMS_image126.png)

4. Bấm **Gửi duyệt** → xử lý phê duyệt tương tự khen thưởng

   ![Screenshot](assets/SCID_HRMS_image127.png)

---

## Phần 9 — Hồ sơ Nghỉ việc

Mở: **Nhân viên**

![Screenshot](assets/SCID_HRMS_image147.png)

Mở hồ sơ nhân viên → bấm **Offboarding**

1. Chọn **Loại hồ sơ** nghỉ việc

   ![Screenshot](assets/SCID_HRMS_image148.png)

   ![Screenshot](assets/SCID_HRMS_image149.png)

2. Nhập **Ngày nghỉ** và **Lý do**

   ![Screenshot](assets/SCID_HRMS_image150.png)

3. Bấm **Print** để tải biểu mẫu:
   - Thông báo chấm dứt Hợp đồng lao động
   - Quyết định nghỉ việc

   ![Screenshot](assets/SCID_HRMS_image151.png)

4. Kiểm tra file → in ra để ký sống

   ![Screenshot](assets/SCID_HRMS_image152.png)

---

## Mẹo sử dụng

| Mẹo | Cách làm |
|-----|---------|
| Tìm kiếm nhanh | Bấm phím **Cách** ở trang chủ Odoo |
| Quay lại trang trước | Bấm **breadcrumb** phía trên (không dùng Back trình duyệt) |
| Xem hợp đồng nhân viên | Từ hồ sơ nhân viên → smart button **Hợp đồng** |
| Xem phụ cấp hiện tại | Từ hợp đồng → smart button **Khấu trừ lương** |

---

## Tài liệu liên quan

- [Hướng dẫn Vận hành Kế toán (AMS)](../ke-toan/van-hanh.md) — Hóa đơn, thanh toán, bút toán
- [Hướng dẫn Vận hành E-Office (EO)](../e-office/van-hanh-eo.md) — Phê duyệt, lịch họp, công văn
- [Hướng dẫn Vận hành Cho thuê (LMS)](../cho-thue/van-hanh-lms.md) — Hợp đồng thuê, khách thuê
