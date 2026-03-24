---
tags: [user-guide, reports, TT200, VAS, SCID, odoo-16, PCV, bizapps]
created: 2026-03-23
updated: 2026-03-23
source: "[[SCID Hướng dẫn báo cáo Kế toán TT200.docx]]"
status: Phase 1
date: 2024-02-05
platform: Odoo 16
---

# Hướng dẫn Xuất Báo cáo Kế toán theo Thông tư 200

> Tài liệu này hướng dẫn cách xem và xuất **11 loại báo cáo kế toán** trên Odoo 16 theo Thông tư 200/2014/TT-BTC. Tất cả báo cáo đều xuất được **Excel** và **PDF**.

---

## Tổng quan — Các báo cáo có sẵn

### Nhóm 1: Sổ kế toán

| Báo cáo | Mẫu số | Cách mở |
|---------|--------|---------|
| Sổ chi tiết tài khoản | S38-DN | Kế toán → Báo cáo → Sổ chi tiết các tài khoản BTC |
| Sổ nhật ký chung | S03a-DN | Kế toán → Báo cáo → Sổ nhật ký chung |
| Sổ cái | S03b-DN | Kế toán → Báo cáo → Sổ cái |
| Sổ quỹ tiền mặt | S07-DN | Kế toán → Báo cáo → Sổ quỹ tiền mặt |
| Sổ tiền gửi ngân hàng | S08-DN | Kế toán → Báo cáo → Sổ tiền gửi ngân hàng |

### Nhóm 2: Bảng kê hóa đơn

| Báo cáo | Cách mở |
|---------|---------|
| Bảng kê hóa đơn mua vào | Kế toán → Báo cáo → In bảng kê hóa đơn mua vào |
| Bảng kê hóa đơn bán ra | Kế toán → Báo cáo → In bảng kê hóa đơn bán ra |

### Nhóm 3: Báo cáo tài chính

| Báo cáo | Mẫu số | Cách mở |
|---------|--------|---------|
| Bảng Cân đối Kế toán | B01-DN | Kế toán → Kế toán Việt Nam → Báo cáo → Bảng cân đối kế toán |
| Kết quả hoạt động kinh doanh | B02-DN | Kế toán → Kế toán Việt Nam → Báo cáo → Kết quả HĐKD |
| Lưu chuyển tiền tệ | B03-DN | Kế toán → Kế toán Việt Nam → Báo cáo → Báo cáo lưu chuyển tiền tệ |
| Bảng cân đối số phát sinh | S06-DN | Kế toán → Báo cáo → Bảng cân đối thử |

---

## Nhóm 1 — Sổ kế toán

### 1. Sổ chi tiết tài khoản (S38-DN)

**Cách xem:**
1. Mở **Kế toán → Báo cáo → Sổ chi tiết các tài khoản BTC**
2. Chọn **tài khoản** cần xem
3. Chọn **khoảng thời gian** ở bộ lọc
4. Bấm **XLSX** để xuất Excel hoặc **PDF** để xuất file PDF

**Nội dung báo cáo:** Ngày ghi sổ, Chứng từ, Diễn giải, TK đối ứng, Nợ, Có, Số dư.

> **Lưu ý quan trọng:**
> - Nếu cột TK đối ứng bị trống → vào hóa đơn tương ứng → bấm nút **"Tạo liên kết đối ứng"**
> - Không nên hạch toán bút toán có **nhiều dòng Nợ đồng thời nhiều dòng Có** — hệ thống không tự xác định được TK đối ứng trong trường hợp này

---

### 2. Sổ nhật ký chung (S03a-DN)

**Cách xem:**
1. Mở **Kế toán → Báo cáo → Sổ nhật ký chung**
2. Chọn **Từ ngày** và **Đến ngày**
3. Bấm **S03A-DN (XLSX)** hoặc **S03A-DN (PDF)**

**Nội dung báo cáo:** Ngày ghi sổ, Số hiệu chứng từ, Ngày chứng từ, Diễn giải, Số hiệu TK, Nợ, Có, Số trang trước chuyển sang, Cộng chuyển sang trang sau.

---

### 3. Sổ cái (S03b-DN)

**Cách xem:**
1. Mở **Kế toán → Báo cáo → Sổ cái**
2. Hệ thống hiển thị số dư tất cả tài khoản trong tháng hiện tại
3. Dùng bộ lọc để thay đổi: thời gian, sổ nhật ký, tài khoản cụ thể
4. Tick vào tài khoản cần in → Bấm **S03B-DN (XLSX)** hoặc **S03B-DN (PDF)**

**Bộ lọc có sẵn:**
- Hiển thị bút toán chưa vào sổ
- Mở tất cả chi tiết tài khoản
- Phương thức kế toán theo dòng tiền

**Nội dung báo cáo:** Ngày ghi sổ, Chứng từ (số hiệu + ngày), Diễn giải, TK đối ứng, Nợ, Có, Cộng phát sinh tháng, Số dư cuối tháng, Cộng lũy kế từ đầu quý.

---

### 4. Sổ quỹ tiền mặt (S07-DN)

**Cách xem:**
1. Mở **Kế toán → Báo cáo → Sổ quỹ tiền mặt**
2. Chọn tài khoản tiền mặt cần xem
3. Bấm **XLSX** hoặc **PDF**

**Nội dung báo cáo:** Ngày, Chứng từ Thu/Chi, Diễn giải, Thu, Chi, Còn lại.

**Cách đọc:**
- **Số dư đầu kỳ** = tổng phát sinh trước ngày bắt đầu
- **Số dư cuối kỳ** = Số dư đầu kỳ + Tổng Thu − Tổng Chi

---

### 5. Sổ tiền gửi ngân hàng (S08-DN)

**Cách xem:**
1. Mở **Kế toán → Báo cáo → Sổ tiền gửi ngân hàng**
2. Cửa sổ hiện ra → Chọn **Từ ngày, Đến ngày, Sổ ngân hàng**
3. Bấm **Xuất XLSX** hoặc **Xuất PDF**

Thao tác giống Sổ quỹ tiền mặt, nhưng chỉ hiển thị sổ nhật ký loại **Ngân hàng**.

---

## Nhóm 2 — Bảng kê hóa đơn

### 6. Bảng kê hóa đơn mua vào (đầu vào)

**Cách xem:**
1. Mở **Kế toán → Báo cáo → In bảng kê hóa đơn mua vào**
2. Chọn khoảng thời gian
3. Bấm **IN** → Hệ thống xuất bảng kê

**Hệ thống tự động phân loại:**
- **Mục 1:** Hàng hóa dịch vụ dùng **riêng** cho sản xuất kinh doanh chịu thuế GTGT
- **Mục 2:** Hàng hóa dịch vụ dùng **chung** cho cả chịu thuế và không chịu thuế

> Để phân loại chính xác, sản phẩm cần được đánh dấu "Là HHDV dùng chung" trong phần cấu hình sản phẩm. Liên hệ quản trị viên nếu cần điều chỉnh.

---

### 7. Bảng kê hóa đơn bán ra (đầu ra)

**Cách xem:**
1. Mở **Kế toán → Báo cáo → In bảng kê hóa đơn bán ra**
2. Chọn khoảng thời gian
3. Bấm **IN**

**Hệ thống tự động phân loại theo thuế suất:**
- **Mục 1:** Hàng hóa dịch vụ **không chịu thuế** GTGT
- **Mục 2:** Thuế suất GTGT **0%**
- **Mục 3:** Thuế suất GTGT **5%**
- **Mục 4:** Thuế suất GTGT **10%**
- **Mục 5:** Hàng hóa bán ra **không tính thuế** (sản phẩm chịu thuế nhưng không chọn thuế trên hóa đơn)

---

## Nhóm 3 — Báo cáo tài chính

### 8. Bảng Cân đối Kế toán (B01-DN)

**Cách tạo báo cáo:**
1. Mở **Kế toán → Kế toán Việt Nam → Báo cáo → Bảng cân đối kế toán**
2. Bấm **Mới**
3. Chọn **Kỳ trước** (nếu muốn so sánh), **Từ ngày, Đến ngày**, và **Mẫu báo cáo**
4. Bấm **Tính toán** — hệ thống sẽ tính toán từng chỉ tiêu
5. Kết quả hiển thị: **Số cuối năm** (kỳ hiện tại) và **Số đầu năm** (kỳ trước)

**Sau khi tính xong:**
- Bấm **Xem chi tiết** bên cạnh mỗi chỉ tiêu để kiểm tra bút toán phát sinh
- Bấm **Chốt sổ** để khóa kết quả (trạng thái: Dự thảo → Đã chốt)
- Bấm **In → Báo cáo cân đối kế toán (Excel/PDF)** để xuất file

> Nếu có chỉ tiêu chưa tính đúng (do phụ thuộc chỉ tiêu khác), bấm **Tính toán** thêm lần nữa.

---

### 9. Kết quả Hoạt động Kinh doanh (B02-DN)

**Cách tạo báo cáo:**
1. Mở **Kế toán → Kế toán Việt Nam → Báo cáo → Kết quả hoạt động kinh doanh**
2. Bấm **Mới** → Chọn Kỳ trước (nếu có), Từ ngày, Đến ngày
3. Bấm **Tính toán**
4. Kết quả hiển thị: **Năm nay** và **Năm trước**
5. Xuất file: Bấm **In → Báo cáo kết quả HĐKD** hoặc **Xuất file Excel**

---

### 10. Lưu chuyển Tiền tệ (B03-DN)

**Phương pháp:** Trực tiếp theo Thông tư 200.

**Cách tạo báo cáo:**
1. Mở **Kế toán → Kế toán Việt Nam → Báo cáo → Báo cáo lưu chuyển tiền tệ**
2. Bấm **Mới** → Chọn Kỳ trước, Từ ngày, Đến ngày, Mẫu
3. Bấm **Tính toán**
4. Xuất Excel hoặc PDF

> Báo cáo này có tính năng đặc biệt: phân biệt bút toán **có liên kết hóa đơn** và **không liên kết hóa đơn** — cùng tài khoản nhưng vào chỉ tiêu khác nhau. Nếu số liệu không đúng, liên hệ quản trị viên kiểm tra cấu hình "Liên kết với hóa đơn" trên từng chỉ tiêu.

---

### 11. Bảng Cân đối Số phát sinh (S06-DN)

**Cách xem:**
1. Mở **Kế toán → Báo cáo → Bảng cân đối thử**
2. Chọn khoảng thời gian
3. Tùy chọn: bao gồm bút toán chưa vào sổ, mở chi tiết, phương thức dòng tiền
4. Bấm **S06-DN (XLSX)** hoặc **S06-DN (PDF)**

---

## Lưu ý chung khi xuất báo cáo

1. **TK đối ứng bị trống?** → Mở hóa đơn liên quan → Bấm **"Tạo liên kết đối ứng"** → Xuất lại báo cáo
2. **Tránh hạch toán nhiều Nợ - nhiều Có** trong cùng 1 bút toán — hệ thống không tự nhận diện TK đối ứng. Nên hạch toán kiểu: 1 Nợ nhiều Có, hoặc 1 Có nhiều Nợ
3. **Chốt sổ:** Sau khi chốt, báo cáo bị khóa. Cần bấm **Mở sổ** để mở lại và tính toán lại nếu muốn thay đổi
4. **Một số báo cáo cần cài thêm module** (S38-DN, S08-DN, Bảng kê HĐ). Nếu không thấy menu, liên hệ quản trị viên

---

## Tài liệu liên quan
- [[HD-Van-Hanh-Ke-Toan]] — Hướng dẫn vận hành kế toán hàng ngày
- [[Cash-Flow-Report]] — Tài liệu kỹ thuật: logic "Liên kết với hóa đơn" trên B03-DN
- [[Tai-Khoan-Ke-Toan]] — Hệ thống tài khoản kế toán

## File gốc
- ![[SCID Hướng dẫn báo cáo Kế toán TT200.docx]]
