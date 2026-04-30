# SCID User Guide

Tài liệu hệ thống ERP của SCID JSC — bao gồm hướng dẫn sử dụng cho end-user và tài liệu kỹ thuật nội bộ.

**Site công khai:** [document.scid.vn](https://document.scid.vn)

---

## Cấu trúc repo

```
docs/
+-- ke-toan/        Kế toán — AMS (Odoo 16, ams.scid.vn)                      
+-- cho-thue/       Cho thuê — LMS (Odoo 16, lms.scid.vn)                     
+-- e-office/       Văn phòng điện tử — eOffice (Odoo 18, hrmseoffice.scid.vn)
+-- hrms/           Nhân sự — HRMS (Odoo 18, hrmseoffice.scid.vn)             
```

Mỗi folder có 2 subfolder không publish:

| Folder | Nội dung |
|--------|----------|
| `_dev/` | Codebase analysis, code patterns — dành cho developer |
| `_ops/` | Incident reports, runbooks — dành cho vận hành |

---

## Phân loại tài liệu

### Publish ra document.scid.vn
Các file markdown trong `docs/` **không có prefix `_`** — được MkDocs build và public.

### Không publish (chỉ xem trên GitHub)
Các file trong `_dev/` và `_ops/` **không có trong `nav:` của `mkdocs.yml`** nên không xuất hiện trên site công khai.

---

## Hệ thống

| Hệ thống | Server | DB | Framework |
|----------|--------|----|-----------|
| AMS — Accounting | 10.1.2.6 | AMS_Production | Odoo 16 Enterprise |
| LMS — Leasing | 10.1.2.5 | LMS_Production | Odoo 16 Community |
| HRMS + eOffice | 10.1.2.7 | SCIDHREO_Live | Odoo 18 Enterprise |

---

## Đóng góp

1. Clone repo, tạo branch mới
2. Viết/chỉnh file markdown trong `docs/`
3. Chạy local: `pip install mkdocs-material && mkdocs serve`
4. Tạo PR vào `main`
