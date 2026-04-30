# Theo dõi Hồ sơ Trình ký Ban TGĐ

!!! info "Phạm vi"
    Tài liệu này dành cho **IT Admin** cấu hình hệ thống theo dõi hồ sơ trình ký trên Odoo 18 (module Project). Không cần viết code.

## Tổng quan hệ thống

Hệ thống **HOSOTK** (Hồ sơ Trình ký) theo dõi quy trình phê duyệt hồ sơ qua Ban TGĐ, tự động gửi email nhắc nhở và escalation.

| Thành phần | Số lượng | Mô tả |
|------------|----------|-------|
| Stages | 11 | Quy trình từ New → Hoàn thành |
| Properties | 10 | Trường tùy chỉnh (loại giấy tờ, trích yếu, v.v.) |
| Email Templates | 7 | Nhắc nhở, escalation, thông báo |
| Automation Rules | 7 | Tự động gửi email theo deadline và stage |

## Luồng quy trình

```
New --> Gửi Thư ký PTổng --> Đợi Phó Tổng --> Phó Tổng trả --> Gửi Thư ký TGĐ --> Đợi TGĐ --> TGĐ duyệt --> Chờ TT --> Đang TT --> Đã TT --> Hoàn thành
```

## Hướng dẫn cài đặt

Thực hiện theo thứ tự:

1. [Hướng dẫn 01 — Project, Stages & Properties](01-project-stages.md)
2. [Hướng dẫn 02 — 7 Email Templates](02-email-templates.md)
3. [Hướng dẫn 03 — 7 Automation Rules](03-automation-rules.md)
4. [Hướng dẫn 04 — Phân quyền & Test Checklist](04-phan-quyen-test.md)

## Yêu cầu tiên quyết

- Odoo 18 đã cài module **Project**
- **Developer Mode** đã bật (Settings → Activate Developer Mode)
- Quyền **Administrator** trên Odoo
- SMTP outgoing đã cấu hình và test gửi được email
