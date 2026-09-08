---
title: Có gì mới — Bán lẻ (SMS)
sidebar_label: Có gì mới
sidebar_position: 1
---

# Có gì mới trên hệ thống bán lẻ

Trang này ghi lại những thay đổi **bạn nhìn thấy được** khi làm việc trên POS và
trên các báo cáo. Mới nhất ở trên cùng.

:::info[Dành cho ai]

Thu ngân 4 Sense (Cần Thơ · Bến Tre · Cà Mau · Phú Vinh Đông), kế toán cửa hàng
và kế toán trưởng. Có gì không đúng như mô tả ở đây, báo Ban CNTT&CĐS.

:::

---

## 08/09/2026 — Báo cáo tồn kho

**Dành cho:** kế toán, quản lý cửa hàng · **Thu ngân không cần làm gì**

Hai báo cáo mới, thay cho bộ "VTD TỒN KHO – TỰ DOANH" trên hệ thống cũ:

| Báo cáo | Trả lời câu hỏi |
|---|---|
| **Cân đối tồn kho** | Mỗi mặt hàng ở mỗi Sense: đầu kỳ bao nhiêu, nhập bao nhiêu, xuất bao nhiêu, cuối kỳ còn bao nhiêu — cả số lượng lẫn giá trị |
| **Tổng hợp nhập-xuất-tồn** | Sổ chi tiết từng chứng từ: kho nào, gian hàng nào, ngày nào, nghiệp vụ gì |

**Mở ở đâu:** Tồn kho → Báo cáo

Cả hai xuất ra Excel. Cột **Số chứng từ** cho biết dòng đó đến từ phiếu nào —
ví dụ `BTR/POS/00188` là một đơn bán tại Bến Tre, `CMA/IN/00004` là một phiếu
nhập kho Cà Mau.

---

## 07/09/2026 — Tra cứu đơn hàng ngay trên POS

**Dành cho:** thu ngân, kế toán

Khách cầm biên lai quay lại quầy mà không nhớ mua hôm nào — trước đây phải lật
từng trang danh sách đơn. Giờ tìm được bằng **5 cách**:

- **Mã đơn** in trên biên lai (ô tìm mặc định)
- **Số tiền** đã trả — gõ kiểu Việt Nam cũng được: `983.000`
- **Số điện thoại** khách
- **Sản phẩm hoặc mã vạch** món khách đã mua
- **Số thẻ / mã giao dịch** nếu khách trả thẻ

Cần ghép nhiều điều kiện cùng lúc (ví dụ: số tiền *và* số điện thoại) thì bấm
nút **Tra cứu** để mở ô tìm nhiều tiêu chí.

**Màn hình danh sách đơn giờ có thêm:** cột Điện thoại, Mã KH, Mã đơn, và nhãn
màu cho biết đơn đã hoàn tiền hay chưa — **Đơn hoàn**, **Đã hoàn**, **Hoàn 1 phần**.

:::tip

Hoàn tiền và in lại biên lai vẫn dùng đúng nút cũ, không có gì thay đổi. Phần
thêm chỉ là *tìm cho ra đơn*.

:::

**Kế toán không vào POS:** cùng chức năng đó có ở màn hình quản trị —
Điểm bán hàng → **Tra cứu đơn hàng POS**, lọc sẵn theo đơn hoàn tiền.

---

## 07/09/2026 — Phiếu in mới

**Dành cho:** thu ngân · Khách hàng nhìn thấy trực tiếp

Phiếu tính tiền được sắp xếp lại cho gọn và dễ đọc hơn:

- **Mỗi món in 2 dòng:** dòng trên là `mã vạch - tên sản phẩm` để đối chiếu
  hàng; dòng dưới là `Mô tả (SL x Đơn giá) | Chiết khấu | Thành tiền`.
- **Chiết khấu chia về từng món.** Trước đây giảm giá chỉ hiện một cục ở cuối
  đơn, khách hỏi "món này giảm bao nhiêu" thì không trả lời được. Giờ mỗi dòng
  có phần chiết khấu của nó, cộng lại đúng bằng tổng.
- **Khối tổng tách rõ ba dòng:** Tổng tiền hàng → Chiết khấu (có dòng con
  *Voucher* / *Coupon*) → **THANH TOÁN** đóng khung, số to.
- **E-Voucher in kèm mã** ở khối khách thanh toán, cùng số tiền được trừ.
- **Bỏ số 602** và số biên lai cũ. Trước đây trên phiếu có hai con số dễ nhầm
  nhau, giờ chỉ còn **một Mã đơn duy nhất** — đọc mã này để tra cứu.
- **In lại phiếu sẽ có dòng chữ "BẢN IN LẠI"** — để không nhầm với bản gốc.
- **Có tên Thu ngân** ở khối đầu phiếu (thay cho tên máy POS trùng tên cửa hàng).
- Khổ giấy chuẩn 80mm, hết khoảng trắng thừa ở đầu tờ; in nhanh hơn trước.

Dòng **Thẻ quà tặng** vẫn in đầy đủ trên hóa đơn giấy.

:::caution[Phiếu không còn mã QR]

Bản đầu có in mã QR để quét ra đơn. Từ 08/09 mã QR đã được **bỏ** — vì đã có
công cụ tra cứu ngay trên POS (xem mục bên trên), gõ **Mã đơn** là ra, và bỏ QR
giúp POS tải nhanh hơn.

:::

---

## Các lỗi đã sửa xong

| Lỗi | Trạng thái |
|---|---|
| Quét mã vạch phải quét 2–3 lần mới ăn | Đã sửa — đã kiểm tra thực tế tại Bến Tre |
| Bàn phím số bị đơ khi nhập giá | Đã sửa |
| POS báo lỗi rồi treo khi đơn có voucher cũ | Đã sửa |
| Phiếu in bị lem dòng URL của trình duyệt ở cuối | Đã sửa |

---

:::note[Dành cho IT — phiên bản đang chạy trên máy chủ]

Kiểm ngày 08/09/2026 trên `SCIDSMS_Live`:
`scid_pos_receipt` 18.0.1.2.12 (đĩa 1.2.13, chờ nâng cấp) · `scid_pos_order_lookup` 18.0.1.4.1 ·
`scid_stock_report` 18.0.1.0.0 · `scid_pos_loyalty_guard` 18.0.1.0.0

:::
