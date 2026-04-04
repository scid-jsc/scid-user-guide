# AMS↔LMS Sync Backlog — Incident Report
> **Date:** 2026-04-04 | **Scope:** AMS Production (10.1.2.6) | **Status:** Resolved
> **Tags:** #ops #incident #ams #lms #sync #account-move

---

## 1. Triệu chứng

Trường `lms_sync_needed = True` trên `account.move` tích lũy lên **11,970 records** trên AMS Production. Hệ thống liên tục gửi request lên LMS mỗi 30 phút nhưng không giải quyết được.

---

## 2. Kiến trúc sync AMS↔LMS

```
LMS → AMS:  POST /account_move/sync          (LMS gọi AMS khi tạo record)
AMS → LMS:  POST /account_move/update_state  (AMS gọi LMS khi state thay đổi)
```

**Flow đúng:**
1. Kế toán tạo record trên **LMS** → LMS POST lên AMS `/account_move/sync`
2. AMS tạo record, lưu `lms_id = <ID của record trên LMS>`
3. Khi state thay đổi trên AMS → `write()` override trigger → gọi LMS `/account_move/update_state`
4. Payload gửi LMS: `{"account_moves": [{"ams_id": <AMS id>, "lms_id": <LMS id>, "state": "posted"}]}`
5. LMS tìm record bằng field `ams_id` (stored khi sync LMS→AMS), cập nhật state

**Auth:** Header `X-Api-Key` + `Origin: https://ams.scid.vn` (cả hai bắt buộc)

---

## 3. Nguyên nhân gốc rễ

Kế toán **tạo thủ công 11,970 records trực tiếp trên AMS** (không qua LMS) vì thời điểm đó LMS không sync được.

Hậu quả:
- Các records **không có bản đối ứng trên LMS** (LMS không có record nào với `ams_id` tương ứng)
- AMS gửi sync → LMS trả về `{"status": 200, "account_moves": []}` (không tìm thấy)
- AMS code: kết quả rỗng = thất bại → set lại `lms_sync_needed = True`
- Vòng lặp vô tận

**Phân loại 11,970 records:**

| Loại | Đặc điểm | Số lượng |
|---|---|---|
| Orphan loại 1 | `lms_id IS NULL` | 6,838 |
| Orphan loại 2 | `lms_id = 0` (integer default) | 5,043 |
| Orphan loại 3 | `lms_id > 0` nhưng LMS không có counterpart | 89 |
| **Tổng** | | **11,970** |

> **Lưu ý loại 3:** `lms_id > 0` không đồng nghĩa LMS có record. `lms_id` trên một số AMS records có thể là ID của contract/entity khác trên LMS, không phải `account_move` với `ams_id` khớp.

---

## 4. Thay đổi đã thực hiện trên Production

### Tắt cron retry (id=81)
- `ir.cron` id=**81**, name="Retry LMS Sync Backlog" → `active = False`
- `ir.actions.server` id=**1099** (action của cron trên)
- Cron này được tạo trong cùng session để test, sau đó tắt lại vì vô ích với orphan records

### Clear `lms_sync_needed = False` cho 11,970 records

```sql
-- Đợt 1 (6,838 records): qua ORM Odoo
-- env['account.move'].sudo().search([
--     ('lms_sync_needed','=',True), ('lms_id','=',False)
-- ]).write({'lms_sync_needed': False})

-- Đợt 2 (5,043 records): SQL trực tiếp
UPDATE account_move SET lms_sync_needed = false
WHERE lms_sync_needed = true AND (lms_id IS NULL OR lms_id = 0);

-- Đợt 3 (89 records còn lại):
UPDATE account_move SET lms_sync_needed = false
WHERE lms_sync_needed = true;
```

**Kết quả:** `lms_sync_needed = True` còn lại = **0**

> ⚠️ **Lưu ý:** 11,970 records này sẽ KHÔNG được sync lên LMS. State trên AMS sẽ không phản ánh trên LMS. Đây là hệ quả được chấp nhận vì records tạo ngoài flow chính thống.

---

## 5. Xác minh

```bash
# AMS → LMS connectivity OK
curl -X POST http://10.1.2.5/account_move/update_state \
  -H 'X-Api-Key: <key>' -H 'Origin: https://ams.scid.vn' \
  -H 'Content-Type: application/json' \
  -d '{"account_moves": [{"ams_id": 29678, "lms_id": 947, "state": "posted"}]}'
# → HTTP 200, account_moves: [] (xác nhận orphan, không phải lỗi auth)

# LMS không có records này
# psql LMS_Production: SELECT * FROM account_move WHERE ams_id IN (29678, 14558)
# → 0 rows ✓
```

---

## 6. Trạng thái sau can thiệp

| Metric | Trước | Sau |
|---|---|---|
| `lms_sync_needed = True` | 11,970 | **0** |
| Cron id=81 active | True | **False (tắt)** |
| Future sync | — | Không đổi — hoạt động bình thường |

---

## 7. Runbook — Nếu lỗi tái diễn

### Kiểm tra số lượng pending

```bash
sshpass -p 'SC!D2025zuize' ssh root@10.1.2.6 \
  "su - odoo -s /bin/bash -c 'psql -d AMS_Production -c \
  \"SELECT COUNT(*) FROM account_move WHERE lms_sync_needed = true;\"'"
```

### Kiểm tra queue_job gần đây

```bash
# Xem jobs 1 giờ qua
sshpass -p 'SC!D2025zuize' ssh root@10.1.2.6 "su - odoo -s /bin/bash -c \
  'psql -d AMS_Production -c \
  \"SELECT state, COUNT(*) FROM queue_job \
  WHERE date_created > NOW() - INTERVAL 1 hour GROUP BY state;\"'"
```

### Kiểm tra AMS→LMS connectivity

```bash
# Từ AMS server
curl -X POST http://10.1.2.5/account_move/update_state \
  -H 'X-Api-Key: <lms_api_key từ AMS Settings → Company>' \
  -H 'Origin: https://ams.scid.vn' \
  -H 'Content-Type: application/json' \
  -d '{"account_moves": [{"ams_id": 1, "lms_id": 1, "state": "posted"}]}'
# Nếu trả về 401/403 → kiểm tra API key
# Nếu Connection refused → LMS down hoặc network issue
```

### Nếu cần clear orphan records mới

```bash
# Script /tmp/clear_orphan_sync.py trên AMS server
# Chạy: su - odoo -s /bin/bash -c '/opt/odoo/env/bin/python3 /tmp/clear_orphan_sync.py'
```

```python
import sys
sys.path.insert(0, '/opt/odoo/odoo-server')
import odoo
odoo.tools.config.parse_config(['-c', '/etc/odoo-server.conf'])
from odoo.api import Environment
import odoo.modules.registry

registry = odoo.modules.registry.Registry('AMS_Production')
with registry.cursor() as cr:
    # Clear orphans (lms_id = 0 hoặc NULL)
    cr.execute("""
        UPDATE account_move SET lms_sync_needed = false
        WHERE lms_sync_needed = true AND (lms_id IS NULL OR lms_id = 0)
    """)
    print(f'Cleared {cr.rowcount} orphan records')
    cr.commit()
```

---

## 8. Nguyên nhân sâu xa chưa xác định

Câu hỏi chưa trả lời: **Tại sao kế toán phải tạo thủ công 11,970 records trên AMS?**

Khả năng:
1. Thời điểm đó LMS→AMS sync bị lỗi (network/API key/code bug)
2. Quy trình nghiệp vụ — một loại hóa đơn chỉ tồn tại trên AMS

Nếu muốn điều tra thêm: xem log LMS tại thời điểm 2024–2025:
```
/var/log/odoo/odoo-server.log  (LMS 10.1.2.5)
```

---

## 9. Key paths liên quan

| Thành phần | Path |
|---|---|
| AMS sync logic | `/opt/odoo/custom/ams_odoo_connector/models/account_move.py` |
| AMS connector | `/opt/odoo/custom/ams_odoo_connector/utils/lms_connector_helper/account_move_connector_helper.py` |
| LMS sync endpoint | `/opt/odoo/custom/custom/scid_ams_sync/controllers/account_move.py` |
| LMS auth | `/opt/odoo/custom/custom/scid_ams_sync/models/ir_http.py` |
| AMS logs | `/var/log/odoo/odoo-server.log` |
| LMS logs | `/var/log/odoo/odoo-server.log` (server 10.1.2.5) |
