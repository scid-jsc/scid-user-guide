# Hướng dẫn 04: Phân Quyền + Test Checklist

## Điều kiện tiên quyết

- Đã hoàn thành Hướng dẫn 01 (Project + 11 Stages + Properties)
- Đã hoàn thành Hướng dẫn 02 (7 Email Templates)
- Đã hoàn thành Hướng dẫn 03 (7 Automation Rules)
- Developer Mode đang bật

---

## Phần 1: Tổng quan phân quyền

### Các nhóm người dùng trong HOSOTK

| Nhóm | Vai trò | Quyền hạn |
|------|---------|-----------|
| **Nhân viên** | Người tạo hồ sơ | Tạo + xem hồ sơ của mình |
| **Thư ký** | Thư ký Phó TGĐ / TGĐ | Xem + xử lý tất cả hồ sơ |
| **Ban TGĐ** | Phó TGĐ, TGĐ | Xem + phê duyệt tất cả hồ sơ |
| **IT Admin / PM** | Quản trị hệ thống | Full access |

### Chiến lược phân quyền (Zero-code)

Odoo 18 Project đã có cơ chế kiểm soát truy cập built-in. **Không cần tạo Record Rules phức tạp** cho Phase 1:

1. **Project Visibility** — Kiểm soát ai thấy project
2. **Project Members** — Kiểm soát ai có quyền gì trong project
3. **Task Assignee** — Nhân viên luôn thấy task được assign cho mình
4. **Task Followers** — Nhận thông báo email tự động

---

## Phần 2: Cấu hình Project Access

### 2.1 Mở Project Settings

1. Vào **Project > [Hồ sơ trình ký Ban TGĐ]**
2. Nhấn dấu **⋮** (3 chấm) > **Settings**
3. Hoặc: **Project > Configuration > Projects** > Chọn project > Edit

### 2.2 Cấu hình Visibility

| Trường | Giá trị | Lý do |
|--------|---------|-------|
| **Visibility** | `Invited internal users` | Chỉ members được mời mới thấy project |
| **Customer ratings** | Tắt | Không dùng |

> **Lưu ý**: Nếu chọn `All internal users` — mọi nhân viên đều thấy project nhưng không thấy nội dung tasks của người khác (vẫn còn kiểm soát ở task level).

### 2.3 Thêm Project Members

Vào tab **Members** (nếu có) hoặc **Settings > Members**:

| Người dùng | Role trong Project | Ghi chú |
|-----------|-------------------|---------|
| IT Admin / PM | **Administrator** | Full access mọi task |
| Thư ký Phó TGĐ | **Administrator** | Cần edit + chuyển stage |
| Thư ký TGĐ | **Administrator** | Cần edit + chuyển stage |
| Phó TGĐ | **Administrator** | Phê duyệt |
| TGĐ | **Administrator** | Phê duyệt |
| Tất cả nhân viên | **User** | Tạo + xem task của mình |

> **Cách thêm nhiều nhân viên**: Thêm từng người, hoặc tạo một Odoo User Group chứa tất cả nhân viên liên quan rồi add group đó vào project members.

---

## Phần 3: Cấu hình Task-level Access

### 3.1 Nguyên tắc hoạt động

Odoo 18 Project (chế độ `Invited internal users`):
- Assignee của task luôn thấy task của mình
- Followers của task nhận email notification
- Administrator của project thấy tất cả tasks
- User thường chỉ thấy tasks mình được assign hoặc follow

### 3.2 Cấu hình khi tạo hồ sơ mới

Khi nhân viên tạo task (hồ sơ), cần:

1. **Assign to**: Chọn nhân viên phụ trách (bắt buộc)
2. **Followers**: Tự động thêm người tạo + assignee

Hệ thống sẽ tự động notify đúng người qua các Automation Rules đã tạo.

---

## Phần 4: Record Rules (Tùy chọn — Phase 2)

??? note "Phần 4: Record Rules (Tùy chọn — Phase 2)"

    Phần này chỉ cần thiết nếu cần kiểm soát visibility ở mức row-level chi tiết hơn built-in.

    ### 4.1 Rule: Nhân viên chỉ thấy task của mình

    **Đường dẫn:** Settings > Technical > Security > Record Rules

    | Trường | Giá trị |
    |--------|---------|
    | **Name** | `HOSOTK: Nhân viên - chỉ task của mình` |
    | **Model** | `Project Task` (project.task) |
    | **Groups** | *(Nhóm Nhân viên - xem mục 4.3)* |
    | **Access** | Read, Write |

    **Domain Filter:**
    ```
    ['|', ('user_ids', 'in', [user.id]), ('create_uid', '=', user.id)]
    ```

    ### 4.2 Rule: Hạn chế trong project HOSOTK

    Nếu muốn đảm bảo rule chỉ áp dụng cho project này:

    ```
    [
      '&',
      ('project_id.name', '=', 'Hồ sơ trình ký Ban TGĐ'),
      '|',
      ('user_ids', 'in', [user.id]),
      ('create_uid', '=', user.id)
    ]
    ```

    ### 4.3 Tạo Group "Nhân viên HOSOTK"

    Nếu dùng Record Rules, cần tạo group:

    1. Vào **Settings > Users & Companies > Groups**
    2. Nhấn **New**

    | Trường | Giá trị |
    |--------|---------|
    | **Category** | `Project` |
    | **Name** | `HOSOTK Nhân viên` |
    | **Users** | Thêm tất cả nhân viên liên quan |
    | **Implied** | `Project / User` |

    > **Lưu ý Phase 1**: Record Rules là optional. Với team nhỏ và project đặc thù (Ban TGĐ nội bộ), dùng Project Members + Visibility đã đủ. Cân nhắc Record Rules ở Phase 2.

---

## Phần 5: Test Checklist

### 5.1 Pre-test Setup

- [ ] Tạo 4 tài khoản test:
  - `test_nhanvien@scid-jsc.com` — nhân viên thường
  - `test_thukyphoto@scid-jsc.com` — thư ký (Administrator role)
  - `test_bantgd@scid-jsc.com` — Ban TGĐ (Administrator role)
  - `test_itadmin@scid-jsc.com` — IT Admin
- [ ] Thêm tất cả vào project **Hồ sơ trình ký Ban TGĐ** với đúng role
- [ ] Tạo 2 task test với deadline rõ ràng

---

### 5.2 Test Automation Rules (Time-based)

**Test A: Nhắc nhẹ 3 ngày (Rule 1)**

- [ ] Tạo Task test, set Deadline = ngày mai + 3 ngày
- [ ] Vào Settings > Technical > Automation > Automated Actions
- [ ] Mở rule `[HOSOTK] Nhắc nhẹ 3 ngày`
- [ ] Nhấn **Run Manually**
- [ ] Kiểm tra chatter của task → thấy email log ✓
- [ ] Kiểm tra hộp thư của assignee → nhận email ✓

**Test B: Nhắc nhở 1 ngày (Rule 2)**

- [ ] Tạo Task test, set Deadline = ngày mai + 1 ngày
- [ ] Run Manually rule `[HOSOTK] Nhắc nhở 1 ngày`
- [ ] Chatter có email log ✓

**Test C: Đến hạn hôm nay (Rule 3)**

- [ ] Tạo Task test, set Deadline = hôm nay
- [ ] Run Manually rule `[HOSOTK] Đến hạn hôm nay`
- [ ] Chatter có email log ✓

**Test D: Escalation Quản lý (Rule 4)**

- [ ] Tạo Task test, set Deadline = hôm nay − 1 ngày
- [ ] Đảm bảo assignee có Manager trong HR
- [ ] Run Manually rule `[HOSOTK] Escalation Quản lý`
- [ ] Email gửi tới quản lý của assignee ✓

**Test E: Escalation Phó Tổng (Rule 5)**

- [ ] Tạo Task test, set Deadline = hôm nay − 3 ngày
- [ ] Run Manually rule `[HOSOTK] Escalation Phó Tổng`
- [ ] Email gửi tới địa chỉ Phó TGĐ đã cấu hình ✓

---

### 5.3 Test Automation Rules (Stage Change)

**Test F: Cập nhật Thư ký (Rule 6)**

- [ ] Mở Task test
- [ ] Chuyển stage → **Gửi Thư ký Phó Tổng**
- [ ] Ngay lập tức kiểm tra chatter → thấy email log ✓
- [ ] Email đến thư ký đúng địa chỉ ✓
- [ ] Chuyển stage → **Gửi Thư ký TGĐ**
- [ ] Chatter có email log thứ 2 ✓

---

### 5.4 Test Automation Rules (Record Created)

**Test G: Tạo hồ sơ mới (Rule 7)**

- [ ] Tạo Task mới trong project **Hồ sơ trình ký Ban TGĐ**
- [ ] Điền đầy đủ: Name, Assignee, Deadline, Properties fields
- [ ] Nhấn **Save**
- [ ] Chatter của task mới → thấy email log ngay ✓
- [ ] Assignee nhận email xác nhận tạo hồ sơ ✓

---

### 5.5 Test Filter — Tasks ngoài project KHÔNG bị ảnh hưởng

**Test H: Domain Filter hoạt động đúng**

- [ ] Tạo Task test trong project **khác** (không phải HOSOTK)
- [ ] Set Deadline = hôm nay
- [ ] Run Manually rule `[HOSOTK] Đến hạn hôm nay`
- [ ] Task này KHÔNG có email log trong chatter ✓ (domain filter hoạt động)

---

### 5.6 Test Stages đã hoàn thành không nhận nhắc

**Test I: Filter Hoàn thành**

- [ ] Tạo Task test trong HOSOTK, Deadline = hôm nay, chuyển sang stage **Hoàn thành**
- [ ] Run Manually rule `[HOSOTK] Đến hạn hôm nay`
- [ ] Task này KHÔNG có email log ✓ (filter `stage_id.name not in [...]`)
- [ ] Thử tương tự với stage **TGĐ đã duyệt** và **Đã thanh toán** ✓

---

### 5.7 Test Email Content

**Test J: Kiểm tra nội dung email**

- [ ] Mở email nhận được trong hộp thư
- [ ] Kiểm tra **Subject**: Có tên hồ sơ (object.name) ✓
- [ ] Kiểm tra **Tên người nhận**: Hiển thị đúng tên assignee ✓
- [ ] Kiểm tra **Deadline**: Định dạng dd-mm-yyyy ✓
- [ ] Kiểm tra **Properties fields**: Loại giấy tờ, Trích yếu, Đơn vị hiển thị đúng ✓
- [ ] Không có nút CTA "Xem hồ sơ" (đã loại bỏ theo thiết kế) ✓
- [ ] Footer có thông tin SCID JSC ✓

---

### 5.8 Test Scheduler (Cron)

**Test K: Xác nhận cron schedule**

- [ ] Vào **Settings > Technical > Automation > Scheduled Actions**
- [ ] Tìm action `ir.automation.base` hoặc `Base Automation`
- [ ] Xác nhận **Next Execution Date** là ngày mai
- [ ] Xác nhận **Interval** = 1 ngày (hoặc theo cấu hình của staging)

---

### 5.9 Test Phân quyền

**Test L: Nhân viên tạo hồ sơ**

- [ ] Login `test_nhanvien`
- [ ] Vào **Project > Hồ sơ trình ký Ban TGĐ**
- [ ] Tạo Task mới → thành công ✓
- [ ] Thấy Task vừa tạo trong list ✓

**Test M: Thư ký xử lý hồ sơ**

- [ ] Login `test_thukyphoto`
- [ ] Thấy tất cả Tasks trong project ✓
- [ ] Có thể chuyển stage ✓
- [ ] Có thể thêm Followers ✓

**Test N: Ban TGĐ xem + approve**

- [ ] Login `test_bantgd`
- [ ] Thấy tất cả Tasks ✓
- [ ] Có thể chuyển stage từ **Chờ Phó TGĐ duyệt** → **Phó TGĐ đã duyệt** ✓

---

## Phần 6: Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| Email không gửi khi Run Manually | Task không khớp domain filter | Kiểm tra stage, project name, deadline |
| Properties fields trống trong email | Key name sai trong Jinja2 | Vào Task → Developer Mode → xem field technical name |
| Rule 4 gửi email rỗng (quản lý) | HR chưa cấu hình Manager | Vào HR > Employee > cấu hình Manager cho assignee |
| Rule 7 không trigger khi tạo task | Active = False | Kiểm tra Active checkbox trong automation rule |
| Nhân viên không thấy project | Chưa add vào project members | Settings > Technical > Projects > Members |
| Email đến Spam | SMTP chưa cấu hình SPF/DKIM | Liên hệ IT kiểm tra DNS records |

---

## Phần 7: Checklist Bàn giao IT Admin

Trước khi bàn giao cho IT Admin vận hành:

- [ ] **Guide 01**: Project "Hồ sơ trình ký Ban TGĐ" đã tạo với 11 stages ✓
- [ ] **Guide 01**: Properties fields đã tạo: Loại giấy tờ, Trích yếu, Đơn vị, Dịch vụ sử dụng ✓
- [ ] **Guide 02**: 7 Email Templates đã tạo và đặt tên đúng format `[HOSOTK] ...` ✓
- [ ] **Guide 03**: 7 Automation Rules đã tạo, Active = ✅ ✓
- [ ] **Guide 04**: Project Members đã cấu hình đúng role ✓
- [ ] **Test A–E**: Time-based rules gửi email đúng ✓
- [ ] **Test F**: Stage change rule trigger đúng ✓
- [ ] **Test G**: Record created rule trigger đúng ✓
- [ ] **Test H–I**: Domain filter chạy đúng (không nhắc task ngoài scope) ✓
- [ ] **Test J**: Nội dung email đầy đủ, Properties hiển thị ✓
- [ ] **Email server**: SMTP outgoing đã cấu hình và test ✓
- [ ] **HR**: Manager đã cấu hình cho các nhân viên liên quan (cho Rule 4) ✓
- [ ] **Template 5**: Email Phó TGĐ trong template `[HOSOTK] Escalation Phó Tổng` đã cập nhật ✓

---

## Phần 8: Lưu ý vận hành

- **Time-based rules** chạy theo Odoo scheduler — mặc định 1 lần/ngày. Để test nhanh dùng **Run Manually**.
- Rules 1–5 gửi email **mỗi ngày** khi điều kiện còn đúng (task chưa hoàn thành, còn trong deadline window). Đây là hành vi Phase 1 chấp nhận được.
- Nếu cần **chỉ gửi 1 lần**, cần thêm logic phức tạp hơn — cân nhắc Phase 2.
- Khi thêm nhân viên mới, nhớ add vào project members để họ có thể tạo hồ sơ.
- Khi đổi tên stage hoặc tên project, phải cập nhật domain filter trong tất cả 7 automation rules.
