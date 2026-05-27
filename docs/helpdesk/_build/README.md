# Helpdesk Guide — Build Tooling

Tự động regenerate tài liệu Word `Huong-dan-su-dung-Helpdesk-SCID-v1.0.docx` khi
form `https://scid.vn/helpdesk` thay đổi (thêm category, đổi label, fix bug…).

## Scripts

| File | Mục đích |
|------|----------|
| `capture.js` | Puppeteer mở scid.vn/helpdesk, click qua từng bước, chụp 12 screenshots vào `../huong-dan/_assets/` |
| `build.js` | docx-js generate file Word từ template + 12 screenshots, output ra `../dist/` |
| `fix-image-ids.js` | Standalone helper — fix duplicate `<wp:docPr id>` trong file docx có sẵn (thường không cần dùng vì `build.js` đã tự fix) |

## Yêu cầu

- Node.js ≥ 18
- Google Chrome cài tại `/Applications/Google Chrome.app/` (macOS) hoặc set `CHROME_PATH=...`
- `docx` package cài global (`npm install -g docx`)

## Cách chạy

```bash
cd docs/helpdesk/_build/
npm install                 # cài puppeteer-core
node capture.js             # chụp screenshots → ../huong-dan/_assets/
node build.js               # build docx → ../dist/Huong-dan-su-dung-Helpdesk-SCID-v1.0.docx
```

## Biến môi trường

| Var | Default | Mô tả |
|-----|---------|-------|
| `CHROME_PATH` | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` | Đường dẫn binary Chrome |
| `HELPDESK_URL` | `https://scid.vn/helpdesk` | URL form helpdesk |

## Output paths

```
docs/helpdesk/
├── huong-dan/
│   └── _assets/        ← capture.js ghi screenshots vào đây
└── dist/
    └── Huong-dan-su-dung-Helpdesk-SCID-v1.0.docx  ← build.js xuất file Word
```

## Khi nào cần chạy lại?

- Thêm/bớt category trong dropdown "Loại dịch vụ"
- Đổi label, placeholder, hoặc copy text trên form
- Đổi layout/màu sắc, có thay đổi UX
- Fix bug ảnh hưởng đến screenshot

Sau khi rebuild:
1. Verify file mới ở `docs/helpdesk/dist/`
2. Update phiên bản trong `build.js` (search `v1.0`) nếu là phát hành mới
3. Update bảng lịch sử ban hành ở section 13.2 của `build.js`
4. Commit cả docx + screenshots cập nhật vào git

## Known issues

- **docx-js v9.6 bug**: tất cả `ImageRun` được gán cùng `docPr id="1"` → Word render 0 ảnh.
  `build.js` đã có hàm `fixImageIds()` tự động fix khi pack output. Không cần chạy `fix-image-ids.js` riêng.
