# Hướng dẫn cài đặt môi trường phát triển

Trang này hướng dẫn cách thiết lập môi trường phát triển để làm việc với trang tài liệu SCID.

## Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã có:

- **Python** phiên bản 3.9 trở lên
- **pip** (trình quản lý gói Python)
- **Git** để quản lý phiên bản mã nguồn
- **Terminal** hoặc Command Prompt để chạy các lệnh

Để kiểm tra phiên bản Python đã cài đặt, chạy lệnh:

```bash
python --version
```

## Clone repository

Đầu tiên, clone repository từ GitHub về máy tính của bạn:

```bash
git clone git@github.com:scid-jsc/scid-user-guide.git
cd scid-user-guide
```

!!! info
    Repository này sử dụng khoá SSH. Hãy đảm bảo bạn đã cấu hình SSH key trên GitHub. Nếu chưa, bạn có thể sử dụng HTTPS thay thế:
    ```bash
    git clone https://github.com/scid-jsc/scid-user-guide.git
    ```

## Cài đặt dependencies

Cài đặt MkDocs Material theme và các dependencies khác bằng pip:

```bash
pip install mkdocs-material
```

Lệnh trên sẽ tự động cài đặt MkDocs cùng với Material theme. Nếu bạn muốn cài đặt phiên bản cụ thể hoặc cài đặt từ file `requirements.txt`, chạy:

```bash
pip install -r requirements.txt
```

!!! tip
    Khuyến khích sử dụng virtual environment để tách biệt dependencies của dự án. Cách tạo và kích hoạt virtual environment:
    
    **macOS/Linux:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
    
    **Windows:**
    ```bash
    python -m venv venv
    venv\Scripts\activate
    ```
    
    Sau đó cài đặt dependencies như bình thường.

## Chạy local development server

Để xem trang tài liệu trên máy tính của bạn, chạy:

```bash
mkdocs serve
```

Sau khi chạy lệnh, mở trình duyệt web và truy cập:

```
http://127.0.0.1:8000
```

Server sẽ tự động reload khi bạn chỉnh sửa các file Markdown. Bạn có thể nhấn **Ctrl+C** để dừng server.

## Build trang tĩnh

Để xây dựng phiên bản production của trang tài liệu (tập hợp các file HTML tĩnh), chạy:

```bash
mkdocs build
```

Lệnh này sẽ tạo thư mục `site/` chứa tất cả các file HTML, CSS, JavaScript đã được biên dịch. Thư mục này có thể được triển khai trên bất kỳ web server tĩnh nào.

!!! warning
    Thư mục `site/` được tạo bởi lệnh `mkdocs build` thường không cần commit vào Git. Nó thường được thêm vào file `.gitignore`.

## Triển khai lên GitHub Pages

Trang tài liệu được triển khai tự động thông qua GitHub Actions. Các bước triển khai:

1. **Commit các thay đổi** của bạn:
   ```bash
   git add .
   git commit -m "Thêm/chỉnh sửa tài liệu"
   ```

2. **Push lên branch main**:
   ```bash
   git push origin main
   ```

3. **GitHub Actions sẽ tự động chạy workflow**:
   - Xây dựng trang tài liệu
   - Triển khai lên GitHub Pages

Trang tài liệu sẽ được cập nhật tự động trên: **https://document.scid.vn**

!!! info
    Quá trình triển khai thường mất từ 30 giây đến 2 phút. Bạn có thể theo dõi tiến độ trong tab "Actions" của repository trên GitHub.

## Cấu trúc thư mục

Dự án MkDocs có cấu trúc như sau:

```
scid-user-guide/
├── docs/                    # Thư mục chứa tất cả các tài liệu Markdown
│   ├── index.md            # Trang chính
│   ├── setup/              # Mục hướng dẫn cài đặt
│   │   └── moi-truong.md   # Trang này
│   ├── e-office/           # Các hướng dẫn e-office
│   └── ...
├── mkdocs.yml              # File cấu hình chính của MkDocs
├── overrides/              # Thư mục ghi đè template (nếu có)
│   └── ...
├── docs/stylesheets/       # Stylesheet tùy chỉnh
│   └── extra.css
├── site/                   # Thư mục chứa trang build (được tạo tự động)
├── .gitignore              # File liệt kê các file không commit
└── README.md               # File mô tả dự án
```

### Mô tả từng phần:

| Thư mục/File | Mục đích |
|---|---|
| `docs/` | Chứa toàn bộ nội dung tài liệu Markdown |
| `mkdocs.yml` | File cấu hình của MkDocs (title, theme, navigation, v.v.) |
| `overrides/` | Thư mục ghi đè HTML template của Material theme |
| `docs/stylesheets/` | Chứa các file CSS tùy chỉnh |
| `site/` | Thư mục tạo bởi `mkdocs build`, chứa HTML được biên dịch |

## Các lệnh MkDocs hữu ích

| Lệnh | Mô tả |
|---|---|
| `mkdocs serve` | Chạy server development và xem tài liệu tại http://127.0.0.1:8000 |
| `mkdocs build` | Xây dựng trang tĩnh vào thư mục `site/` |
| `mkdocs --version` | Kiểm tra phiên bản MkDocs |
| `mkdocs gh-deploy` | Triển khai trực tiếp lên GitHub Pages (không cần nếu dùng GitHub Actions) |

## Khắc phục sự cố thường gặp

### Lỗi: "mkdocs: command not found"

**Nguyên nhân:** MkDocs chưa được cài đặt hoặc virtual environment chưa được kích hoạt.

**Giải pháp:**
```bash
# Kích hoạt virtual environment nếu đang sử dụng
source venv/bin/activate  # macOS/Linux
# hoặc
venv\Scripts\activate  # Windows

# Cài đặt MkDocs
pip install mkdocs-material
```

### Lỗi: "Port 8000 is already in use"

**Nguyên nhân:** Có chương trình khác đang sử dụng port 8000.

**Giải pháp:** Chỉ định port khác:
```bash
mkdocs serve -a 127.0.0.1:8001
```

### Trang không hiển thị đúng định dạng

**Nguyên nhân:** Cache trình duyệt cũ hoặc server development chưa reload.

**Giải pháp:**
1. Dừng server (`Ctrl+C`)
2. Xoá thư mục `site/` (nếu có)
3. Chạy lại `mkdocs serve`
4. Làm mới trang web (Ctrl+R hoặc Cmd+R)

## Tiếp theo

Sau khi thiết lập môi trường thành công:

- Tìm hiểu thêm về [cấu trúc của tài liệu](../structure.md) (nếu có)
- Xem hướng dẫn viết [Markdown cho MkDocs](https://squidfunk.github.io/mkdocs-material/)
- Bắt đầu viết hoặc chỉnh sửa tài liệu trong thư mục `docs/`

Nếu gặp bất kỳ vấn đề nào, vui lòng liên hệ với đội ngũ phát triển SCID.
