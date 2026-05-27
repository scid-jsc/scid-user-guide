# SCID User Guide

Tài liệu hệ thống ERP của SCID JSC — bao gồm hướng dẫn sử dụng cho end-user và tài liệu kỹ thuật nội bộ.

Site công khai: [document.scid.vn](https://document.scid.vn)

Built with [Docusaurus](https://docusaurus.io/) · Deployed on [Vercel](https://vercel.com).

---

## Cấu trúc repo

```
docs/
├── ke-toan/        Kế toán — AMS (Odoo 16, ams.scid.vn)
├── cho-thue/       Cho thuê — LMS (Odoo 16, lms.scid.vn)
├── e-office/       Văn phòng điện tử — eOffice (Odoo 18, hrmseoffice.scid.vn)
├── hrms/           Nhân sự — HRMS (Odoo 18, hrmseoffice.scid.vn)
└── helpdesk/       Helpdesk — gửi yêu cầu hỗ trợ IT (scid.vn/helpdesk)

src/
├── components/     React components (ModuleCards landing grid)
└── css/custom.css  Theme override — SCID navy + Be Vietnam Pro

docusaurus.config.ts   Site config (i18n vi, navbar, footer, search-local)
sidebars.ts            Sidebar nav structure
vercel.json            Vercel deploy config (framework preset + cache headers)
```

Mỗi module có thể có subfolder không publish — `dev/` (codebase analysis, code patterns), `ops/` (incident reports, runbooks). Các folder này được exclude khỏi build qua `docusaurus.config.ts`.

---

## Hệ thống

| Hệ thống | Server | DB | Framework |
|----------|--------|----|-----------|
| AMS — Accounting | 10.1.2.6 | AMS_Production | Odoo 16 Enterprise |
| LMS — Leasing | 10.1.2.5 | LMS_Production | Odoo 16 Community |
| HRMS + eOffice | 10.1.2.7 | SCIDHREO_Live | Odoo 18 Enterprise |

---

## Local development

```bash
npm install
npm start              # Dev server tại http://localhost:3000
npm run build          # Production build → build/
npm run serve          # Serve build folder để test trước khi deploy
```

## Đóng góp

1. Clone repo, tạo branch mới từ `main`
2. Viết/chỉnh file markdown trong `docs/`
3. Chạy local `npm start` để xem thay đổi
4. Tạo PR vào `main`

PR merge vào `main` → Vercel auto-deploy production.

## Cú pháp Docusaurus / MDX

- Admonitions: `:::tip[Title]` … `:::` (types: `note`, `tip`, `info`, `warning`, `danger`)
- Cross-page link: dùng relative path đầy đủ — VD `[Link](../../ke-toan/huong-dan/van-hanh.md)`
- Images: bỏ trong `<module>/assets/`, tham chiếu relative `../assets/foo.png`
