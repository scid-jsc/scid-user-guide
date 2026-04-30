# Hướng dẫn đóng góp tài liệu

Trang này hướng dẫn cách đóng góp và cập nhật nội dung cho trang tài liệu SCID. Chúng tôi sử dụng MkDocs Material để xây dựng và quản lý tài liệu.

## Chuẩn bị ban đầu

Trước khi bắt đầu, bạn cần:

1. Clone repository: `git clone https://github.com/scid-jsc/scid-user-guide.git`
2. Cài đặt MkDocs: `pip install mkdocs mkdocs-material`
3. Chạy server cục bộ: `mkdocs serve` (truy cập http://localhost:8000)

!!! tip "Mẹo"
    Khi chạy `mkdocs serve`, các thay đổi trong file markdown sẽ tự động cập nhật trên trình duyệt.

## Cấu trúc thư mục

Repository tài liệu được tổ chức theo các phân hệ (module) như sau:

```
scid-user-guide/
+-- docs/                                              
|   +-- setup/           # Hướng dẫn cài đặt           
|   +-- ke-toan/         # Phân hệ Kế toán             
|   |   +-- assets/      # Hình ảnh cho phân hệ Kế toán
|   +-- cho-thue/        # Phân hệ Cho thuê            
|   |   +-- assets/                                    
|   +-- e-office/        # Phân hệ Văn phòng điện tử   
|   |   +-- assets/                                    
|   +-- hrms/            # Phân hệ Quản lý nhân sự     
|   |   +-- assets/                                    
|   +-- index.md         # Trang chủ                   
+-- mkdocs.yml           # Cấu hình MkDocs             
+-- README.md                                          
```

### Quy ước tên file

- **File markdown**: Dùng tên file ngắn, không dấu, ví dụ: `huong-dan-tao-hoa-don.md`, `cai-dat-phong-ban.md`
- **File hình ảnh**: Đặt tên theo mẫu `SCID_<PHÂN_HỆ>_image{n}.png`
  - Ví dụ: `SCID_HRMS_image1.png`, `SCID_KETOAN_image2.png`, `SCID_CHOTHUE_image1.png`

!!! warning "Lưu ý"
    Tất cả tên file phải viết thường (lowercase) và không chứa khoảng trắng hoặc ký tự đặc biệt.

## Thêm trang tài liệu mới

### Bước 1: Tạo file markdown

Tạo file `.md` mới trong thư mục của phân hệ tương ứng:

```bash
# Ví dụ: Tạo trang hướng dẫn trong phân hệ HRMS
touch docs/hrms/huong-dan-tao-nhan-vien.md
```

### Bước 2: Thêm vào cấu hình mkdocs.yml

Mở file `mkdocs.yml` và thêm trang mới vào phần `nav:` của phân hệ tương ứng:

```yaml
nav:
  - Trang chủ: index.md
  - Kế toán:
    - Tạo hóa đơn: ke-toan/tao-hoa-don.md
    - Quản lý công nợ: ke-toan/quan-ly-cong-no.md
  - HRMS:
    - Tạo nhân viên: hrms/huong-dan-tao-nhan-vien.md
    - Quản lý lương: hrms/quan-ly-luong.md
```

!!! info "Thông tin"
    Thứ tự trong `nav:` sẽ quyết định thứ tự hiển thị trong menu bên trái của trang web.

### Bước 3: Viết nội dung

Dùng cấu trúc tiêu đề phân cấp và theo dõi các quy ước viết nội dung (xem phần bên dưới).

## Thêm hình ảnh

### Bước 1: Đặt file hình ảnh

1. Đặt file PNG vào thư mục `docs/<phân_hệ>/assets/`
2. Đặt tên file theo mẫu: `SCID_<PHÂN_HỆ>_image{n}.png`

Ví dụ:
```
docs/hrms/assets/SCID_HRMS_image1.png
docs/hrms/assets/SCID_HRMS_image2.png
docs/ke-toan/assets/SCID_KETOAN_image1.png
```

### Bước 2: Chèn hình ảnh vào markdown

Dùng cú pháp markdown tiêu chuẩn với đường dẫn tương đối:

```markdown
![Ảnh chụp màn hình tạo nhân viên](assets/SCID_HRMS_image1.png)

![Giao diện nhập lương](assets/SCID_HRMS_image2.png)
```

!!! tip "Mẹo"
    Đặt mô tả ảnh rõ ràng trong dấu ngoặc vuông để giúp người dùng hiểu nội dung khi ảnh không tải được.

### Bước 3: Extract ảnh từ file Word DOCX (tùy chọn)

Nếu tài liệu gốc là file Word DOCX, bạn có thể tự động extract hình ảnh bằng Python:

```python
from docx import Document
from docx.opc.constants import RELATIONSHIP_TARGET_MODE
import os

# Mở file Word
doc = Document('tai-lieu-goc.docx')
output_dir = 'docs/hrms/assets'

# Tạo thư mục nếu chưa tồn tại
os.makedirs(output_dir, exist_ok=True)

# Extract tất cả hình ảnh
image_count = 1
for rel in doc.part.rels.values():
    if "image" in rel.target_ref:
        image = rel.target_part.blob
        image_name = f'SCID_HRMS_image{image_count}.png'
        with open(os.path.join(output_dir, image_name), 'wb') as f:
            f.write(image)
        print(f'Saved: {image_name}')
        image_count += 1
```

Chạy script này để tự động extract và đặt tên tất cả hình ảnh từ file Word.

## Quy ước viết nội dung

### Cấu trúc tiêu đề

- Dùng `##` cho các tiêu đề phần chính
- Dùng `###` cho tiêu đề mục con
- Tránh dùng `#` (dành cho tiêu đề trang, tự động generate)

```markdown
## Tạo hóa đơn mới

### Bước 1: Mở module Kế toán

Nội dung...

### Bước 2: Nhấp vào "Hóa đơn mới"

Nội dung...
```

### Dùng Admonitions (gợi ý, cảnh báo, thông tin)

MkDocs Material hỗ trợ các loại hộp thông tin sau:

```markdown
!!! info "Thông tin"
    Đây là thông tin bổ sung, không bắt buộc.

!!! tip "Mẹo"
    Mẹo giúp người dùng làm việc hiệu quả hơn.

!!! warning "Cảnh báo"
    Hành động này có thể gây ảnh hưởng tới dữ liệu.

!!! danger "Nguy hiểm"
    Hành động này không thể hoàn tác.

!!! success "Thành công"
    Quá trình hoàn thành thành công.
```

### Code blocks với syntax highlighting

Dùng ba dấu backtick kèm ngôn ngữ:

````markdown
```python
from docx import Document
doc = Document('file.docx')
print(doc.core_properties.title)
```

```sql
SELECT * FROM sale_order WHERE state = 'draft';
```

```bash
git add docs/hrms/
git commit -m "Thêm hướng dẫn tạo nhân viên"
git push origin main
```
````

### Bảng hướng dẫn nhanh

Đặt bảng tham chiếu ở cuối mỗi trang để giúp người dùng tìm thông tin nhanh:

```markdown
## Tham chiếu nhanh

| Trường | Bắt buộc | Mô tả                                   |
|--------|----------|-------                                  |
| Tên nhân viên | Có | Họ tên đầy đủ của nhân viên            |
| Mã nhân viên | Có | Mã duy nhất, không trùng lặp            |
| Phòng ban | Có | Phòng ban nhân viên đang công tác          |
| Hệ số lương cơ bản | Không | Mặc định là 1.0 nếu không nhập |
```

### Link tài liệu liên quan

Ở cuối mỗi trang, thêm phần "Tài liệu liên quan" để dễ điều hướng:

```markdown
## Tài liệu liên quan

- [Quản lý lương](quan-ly-luong.md) - Hướng dẫn quản lý bảng lương
- [Quản lý phòng ban](quan-ly-phong-ban.md) - Cấu hình phòng ban
- [Quy trình tuyển dụng](quy-trinh-tuyen-dung.md) - Các bước tuyển dụng nhân viên
```

## Ví dụ trang hoàn chỉnh

Dưới đây là ví dụ một trang tài liệu hoàn chỉnh:

```markdown
# Tạo nhân viên mới

Hướng dẫn này giúp bạn tạo hồ sơ nhân viên mới trong hệ thống SCID.

## Điều kiện tiên quyết

- Bạn phải có quyền "Quản lý nhân viên" (Manager)
- Phòng ban của nhân viên đã được tạo trong hệ thống

!!! info "Thông tin"
    Nếu bạn chưa tạo phòng ban, vui lòng xem hướng dẫn [Quản lý phòng ban](quan-ly-phong-ban.md).

## Các bước thực hiện

### Bước 1: Mở module HRMS

1. Đăng nhập vào hệ thống SCID
2. Nhấp vào menu **HRMS** ở thanh điều hướng bên trái

![Menu HRMS](assets/SCID_HRMS_image1.png)

### Bước 2: Chọn "Tạo nhân viên"

1. Trong module HRMS, nhấp vào **Nhân viên**
2. Nhấp nút **Tạo** để tạo nhân viên mới

![Nút tạo nhân viên](assets/SCID_HRMS_image2.png)

### Bước 3: Nhập thông tin cơ bản

Điền các trường bắt buộc:

| Trường | Mô tả                           |
|--------|-------                          |
| Tên nhân viên | Họ tên đầy đủ            |
| Mã nhân viên | Mã duy nhất, ví dụ: NV001 |
| Phòng ban | Chọn phòng ban từ danh sách  |
| Chức vụ | Vị trí công việc               |

![Form nhập thông tin](assets/SCID_HRMS_image3.png)

!!! warning "Cảnh báo"
    Mã nhân viên không thể thay đổi sau khi lưu. Vui lòng kiểm tra kỹ trước khi lưu.

### Bước 4: Lưu và xác nhận

Nhấp nút **Lưu** để lưu hồ sơ nhân viên. Hệ thống sẽ gán ID duy nhất cho nhân viên.

!!! success "Thành công"
    Hồ sơ nhân viên đã được tạo thành công và sẵn sàng để bổ sung thông tin chi tiết.

## Tham chiếu nhanh

| Trường | Bắt buộc | Ghi chú                         |
|--------|----------|--------                         |
| Tên nhân viên | Có | Không dấu hoặc có dấu đều được |
| Mã nhân viên | Có | Phải là duy nhất trong hệ thống |
| Phòng ban | Có | Phải tồn tại trước đó              |
| Hệ số lương | Không | Mặc định: 1.0                 |
| Email | Không | Dùng để gửi thông báo               |

## Tài liệu liên quan

- [Quản lý phòng ban](quan-ly-phong-ban.md) - Tạo và quản lý phòng ban
- [Quản lý lương](quan-ly-luong.md) - Thiết lập bảng lương
- [Quy trình tuyển dụng](quy-trinh-tuyen-dung.md) - Huy động và tuyển dụng
```

## Push và deploy

### Bước 1: Commit thay đổi

Sau khi hoàn thành, commit tất cả thay đổi:

```bash
# Thêm tất cả file mới
git add docs/

# Commit với thông điệp rõ ràng
git commit -m "Thêm hướng dẫn tạo nhân viên mới"

# Push lên GitHub
git push origin main
```

### Bước 2: GitHub Actions tự động build và deploy

Khi bạn push lên `main`, GitHub Actions sẽ tự động:

1. Build trang web từ markdown
2. Deploy lên server tài liệu
3. Cập nhật trang chủ

!!! tip "Mẹo"
    Kiểm tra tab "Actions" trên GitHub để xem trạng thái build. Thường mất 1-2 phút để hoàn thành.

Sau khi CI/CD hoàn thành, tài liệu sẽ được cập nhật ngay trên trang web chính thức.

## Kiểm tra trước khi push

Trước khi push, luôn kiểm tra lại:

```bash
# Chạy server cục bộ
mkdocs serve

# Truy cập http://localhost:8000 và duyệt trang web
# Kiểm tra:
# - Tất cả hình ảnh hiển thị đúng
# - Tất cả link hoạt động
# - Định dạng markdown chính xác
# - Không có lỗi typo
```

!!! warning "Cảnh báo"
    Luôn test nội dung cục bộ trước khi push lên GitHub. Tránh push các file lỗi hoặc hình ảnh hỏng.

## Câu hỏi thường gặp

**Q: Tôi có thể dùng hình ảnh từ internet không?**  
A: Không nên. Luôn dùng hình ảnh chụp từ hệ thống SCID của bạn để đảm bảo độ chính xác và bảo vệ quyền tác giả.

**Q: Có thể chỉnh sửa lại một trang đã publish không?**  
A: Có. Chỉnh sửa file markdown, commit, và push. GitHub Actions sẽ tự động cập nhật.

**Q: Làm cách nào để xóa một trang?**  
A: Xóa file markdown và dòng tương ứng trong `mkdocs.yml`, rồi commit và push.

**Q: Tôi có thể dùng HTML trực tiếp trong markdown không?**  
A: Có, nhưng tránh nếu có thể. MkDocs Material hỗ trợ hầu hết các định dạng qua markdown.

## Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:

1. Kiểm tra [MkDocs Material documentation](https://squidfunk.github.io/mkdocs-material/)
2. Liên hệ với team quản lý tài liệu
3. Tạo issue trên repository GitHub: [scid-jsc/scid-user-guide](https://github.com/scid-jsc/scid-user-guide)
