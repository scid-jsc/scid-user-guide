# Hướng dẫn 03: Tạo 7 Automation Rules trong Odoo

## Điều kiện tiên quyết

- Đã tạo xong Project + 11 Stages (Hướng dẫn 01)
- Đã tạo xong 7 Email Templates (Hướng dẫn 02)
- Developer Mode đang bật

## Truy cập Automation Rules

**Settings > Technical > Automation > Automated Actions**

---

## Tổng quan 7 Rules

| # | Tên Rule | Trigger | Filter chính | Template |
|---|---|---|---|---|
| 1 | `[HOSOTK] Nhắc nhẹ 3 ngày` | Timed: deadline − 3 ngày | Chưa hoàn thành | Nhắc nhẹ 3 ngày |
| 2 | `[HOSOTK] Nhắc nhở 1 ngày` | Timed: deadline − 1 ngày | Chưa hoàn thành | Nhắc nhở 1 ngày |
| 3 | `[HOSOTK] Đến hạn hôm nay` | Timed: deadline + 0 ngày | Chưa hoàn thành | Đến hạn hôm nay |
| 4 | `[HOSOTK] Escalation Quản lý` | Timed: deadline + 1 ngày | Chưa hoàn thành | Escalation Quản lý |
| 5 | `[HOSOTK] Escalation Phó Tổng` | Timed: deadline + 3 ngày | Chưa hoàn thành | Escalation Phó Tổng |
| 6 | `[HOSOTK] Cập nhật Thư ký` | Stage changed → Gửi Thư ký | Project = HOSOTK | Cập nhật Thư ký |
| 7 | `[HOSOTK] Tạo hồ sơ mới` | Record Created | Project = HOSOTK | Tạo hồ sơ mới |

---

## Filter dùng chung cho Rules 1–5 (Time-based)

Domain filter (dán vào ô **Filter** / **Extra Conditions**):

```
[
  ("project_id.name", "=", "Hồ sơ trình ký Ban TGĐ"),
  ("stage_id.name", "not in", ["Hoàn thành", "TGĐ đã duyệt", "Đã thanh toán"])
]
```

> **Lý do**: Chỉ nhắc các task thuộc đúng project, không gửi email cho hồ sơ đã xong.

---

## Rule 1: Nhắc nhẹ 3 ngày trước deadline

**Nhấp New, điền:**

| Trường | Giá trị |
|--------|---------|
| **Name** | `[HOSOTK] Nhắc nhẹ 3 ngày` |
| **Model** | `Project Task` (project.task) |
| **Trigger** | `Based on a timed condition` |
| **When** | `Deadline` → **`-3`** days |
| **Filter** | *(dán domain chung ở trên)* |
| **Action** | `Send an email` |
| **Email Template** | `[HOSOTK] Nhắc nhẹ 3 ngày` |
| **Active** | ✅ |

**Nhấp Save.**

---

## Rule 2: Nhắc nhở 1 ngày trước deadline

| Trường | Giá trị |
|--------|---------|
| **Name** | `[HOSOTK] Nhắc nhở 1 ngày` |
| **Model** | `Project Task` |
| **Trigger** | `Based on a timed condition` |
| **When** | `Deadline` → **`-1`** days |
| **Filter** | *(dán domain chung)* |
| **Action** | `Send an email` |
| **Email Template** | `[HOSOTK] Nhắc nhở 1 ngày` |
| **Active** | ✅ |

---

## Rule 3: Đến hạn hôm nay

| Trường | Giá trị |
|--------|---------|
| **Name** | `[HOSOTK] Đến hạn hôm nay` |
| **Model** | `Project Task` |
| **Trigger** | `Based on a timed condition` |
| **When** | `Deadline` → **`0`** days |
| **Filter** | *(dán domain chung)* |
| **Action** | `Send an email` |
| **Email Template** | `[HOSOTK] Đến hạn hôm nay` |
| **Active** | ✅ |

---

## Rule 4: Escalation Quản lý (trễ 1 ngày)

| Trường | Giá trị |
|--------|---------|
| **Name** | `[HOSOTK] Escalation Quản lý` |
| **Model** | `Project Task` |
| **Trigger** | `Based on a timed condition` |
| **When** | `Deadline` → **`+1`** days |
| **Filter** | *(dán domain chung)* |
| **Action** | `Send an email` |
| **Email Template** | `[HOSOTK] Escalation Quản lý` |
| **Active** | ✅ |

!!! warning "Quan trọng"
    Template 4 gửi tới `object.user_ids[0].parent_id.work_email` (quản lý trực tiếp). Đảm bảo HR đã cấu hình **Manager** cho từng nhân viên.

---

## Rule 5: Escalation Phó Tổng (trễ 3 ngày)

| Trường | Giá trị |
|--------|---------|
| **Name** | `[HOSOTK] Escalation Phó Tổng` |
| **Model** | `Project Task` |
| **Trigger** | `Based on a timed condition` |
| **When** | `Deadline` → **`+3`** days |
| **Filter** | *(dán domain chung)* |
| **Action** | `Send an email` |
| **Email Template** | `[HOSOTK] Escalation Phó Tổng` |
| **Active** | ✅ |

!!! warning "Quan trọng"
    Template 5 gửi tới email Phó TGĐ (cố định). Cập nhật email trong template trước khi activate rule này.

---

## Rule 6: Cập nhật Thư ký (Stage Changed)

Rule này kích hoạt khi task chuyển vào stage "Gửi Thư ký Phó Tổng" **hoặc** "Gửi Thư ký TGĐ".

| Trường | Giá trị |
|--------|---------|
| **Name** | `[HOSOTK] Cập nhật Thư ký` |
| **Model** | `Project Task` |
| **Trigger** | `Stage is set to` |
| **Stage** | Chọn **cả 2**: `Gửi Thư ký Phó Tổng` và `Gửi Thư ký TGĐ` *(nếu Odoo cho chọn nhiều)*  |
| **Filter** | `[("project_id.name", "=", "Hồ sơ trình ký Ban TGĐ")]` |
| **Action** | `Send an email` |
| **Email Template** | `[HOSOTK] Cập nhật Thư ký` |
| **Active** | ✅ |

> **Nếu Odoo chỉ cho chọn 1 stage**: Tạo thêm Rule 6b với cấu hình y hệt nhưng Stage = `Gửi Thư ký TGĐ`.

**Cách tạo nếu dùng "Record Updated" thay vì "Stage is set to":**

| Trường | Giá trị |
|--------|---------|
| **Trigger** | `Record Updated` |
| **When Updated** | `Stage` |
| **Filter** | `[("project_id.name", "=", "Hồ sơ trình ký Ban TGĐ"), ("stage_id.name", "in", ["Gửi Thư ký Phó Tổng", "Gửi Thư ký TGĐ"])]` |

---

## Rule 7: Tạo hồ sơ mới (Record Created)

| Trường | Giá trị |
|--------|---------|
| **Name** | `[HOSOTK] Tạo hồ sơ mới` |
| **Model** | `Project Task` |
| **Trigger** | `Record Created` |
| **Filter** | `[("project_id.name", "=", "Hồ sơ trình ký Ban TGĐ")]` |
| **Action** | `Send an email` |
| **Email Template** | `[HOSOTK] Tạo hồ sơ mới` |
| **Active** | ✅ |

---

!!! info "Kiểm tra"
    Xem [Hướng dẫn 04 — Phân quyền & Test](04-phan-quyen-test.md) để test đầy đủ các rules.
