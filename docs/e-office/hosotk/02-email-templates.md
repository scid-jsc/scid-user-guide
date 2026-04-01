# Hướng dẫn 02: Tạo 7 Email Templates trong Odoo

## Tổng quan

| # | Tên Template | Trigger | Người nhận |
|---|---|---|---|
| 1 | `[HOSOTK] Nhắc nhẹ 3 ngày` | Automation: 3 ngày trước deadline | Người phụ trách |
| 2 | `[HOSOTK] Nhắc nhở 1 ngày` | Automation: 1 ngày trước deadline | Người phụ trách |
| 3 | `[HOSOTK] Đến hạn hôm nay` | Automation: deadline = hôm nay | Người phụ trách |
| 4 | `[HOSOTK] Escalation Quản lý` | Automation: trễ 1 ngày | Quản lý trực tiếp |
| 5 | `[HOSOTK] Escalation Phó Tổng` | Automation: trễ 3 ngày | Phó Tổng Giám đốc |
| 6 | `[HOSOTK] Cập nhật Thư ký` | Automation: vào stage "Gửi Thư ký..." | Thư ký |
| 7 | `[HOSOTK] Tạo hồ sơ mới` | Automation: task mới được tạo | Người phụ trách |

---

## Cách truy cập Email Templates trong Odoo 18

1. Vào **Settings > Technical > Email > Templates**
   - (Cần bật Developer Mode: Settings > Activate Developer Mode)
2. Nhấp **New** để tạo template mới

---

## Quan trọng — Properties Fields

!!! danger "Quan trọng — Properties Fields"
    Properties fields trong Odoo 18 (`task_properties`) là danh sách dict. Để truy cập trong template, **thêm đoạn này vào đầu phần Body HTML của mỗi template**:

    ```jinja2
    {% set props = {} %}
    {% for p in object.task_properties or [] %}{% if p.get('value') is not none %}{% set _ = props.update({p['name']: p['value']}) %}{% endif %}{% endfor %}
    ```

    Sau đó dùng: `{{ props.get('loai_giay_to', '') }}`, `{{ props.get('trich_yeu', '') }}`, v.v.

---

## Template 1: Nhắc nhẹ 3 ngày

**Model:** `project.task`

**Subject:**
```
Nhắc nhẹ: {{ object.name }} còn 3 ngày đến hạn
```

**Body HTML:**
```html
{% set props = {} %}
{% for p in object.task_properties or [] %}{% if p.get('value') is not none %}{% set _ = props.update({p['name']: p['value']}) %}{% endif %}{% endfor %}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 16px;background-color:#f3f4f6;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border:1px solid #d0d7de;border-radius:6px;overflow:hidden;">
<tr><td style="background-color:#24292f;padding:24px 32px;text-align:center;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px;">SCID JSC</div>
<div style="font-size:16px;font-weight:600;color:#ffffff;">Hệ thống theo dõi Hồ sơ Trình ký</div>
</td></tr>
<tr><td style="background-color:#ffffff;padding:28px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
<tr>
<td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="padding-left:14px;font-size:15px;color:#1f2328;line-height:1.5;">
Kính gửi <strong style="color:#0969da;">{{ object.user_ids[0].name if object.user_ids else 'Anh/Chị' }}</strong>,
</td>
</tr></table>
<p style="font-size:14px;line-height:1.75;color:#1f2328;margin:0 0 20px;">
Hệ thống xin thông báo: Hồ sơ <strong>{{ object.name }}</strong> còn <strong style="color:#0969da;">3 ngày</strong> đến hạn xử lý.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr>
<td width="3" style="background-color:#0969da;border-radius:2px;"></td>
<td style="background-color:#f6f8fa;padding:16px 18px;border:1px solid #d0d7de;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#656d76;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Thông tin hồ sơ</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Loại giấy tờ</td><td style="font-weight:600;">{{ props.get('loai_giay_to', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Trích yếu</td><td style="font-weight:600;">{{ props.get('trich_yeu', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đối tác</td><td style="font-weight:600;">{{ object.partner_id.name if object.partner_id else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Dịch vụ</td><td style="font-weight:600;">{{ props.get('dich_vu_su_dung', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đơn vị trình</td><td style="font-weight:600;">{{ props.get('don_vi', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Số tiền</td><td style="font-weight:600;">{{ '{:,.0f}'.format(props.get('so_tien', 0) or 0) }} VNĐ</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Stage hiện tại</td><td style="font-weight:600;color:#0969da;">{{ object.stage_id.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Hạn xử lý</td><td style="font-weight:600;">{{ object.date_deadline.strftime('%d-%m-%Y') if object.date_deadline else '' }}</td></tr>
</table>
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#656d76;margin:0 0 24px;">
Kính mong Anh/Chị sắp xếp thời gian xử lý hồ sơ trước thời hạn. Trân trọng cảm ơn.
</p>
</td></tr>
<tr><td style="background-color:#f6f8fa;padding:16px 32px;border-top:1px solid #d0d7de;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align:center;">
<div style="font-size:12px;font-weight:600;color:#1f2328;margin-bottom:3px;">SCID — Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="font-size:11px;color:#656d76;margin-bottom:8px;">Thông báo tự động — không cần trả lời email này</div>
<div style="font-size:10px;color:#8b949e;">Email nội bộ · Cấm chuyển tiếp · Gửi tự động từ Odoo</div>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
```

---

## Template 2: Nhắc nhở 1 ngày

**Model:** `project.task`

**Subject:**
```
Nhắc nhở: {{ object.name }} còn 1 ngày đến hạn
```

**Body HTML:**
```html
{% set props = {} %}
{% for p in object.task_properties or [] %}{% if p.get('value') is not none %}{% set _ = props.update({p['name']: p['value']}) %}{% endif %}{% endfor %}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 16px;background-color:#f3f4f6;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border:1px solid #d0d7de;border-radius:6px;overflow:hidden;">
<tr><td style="background-color:#24292f;padding:24px 32px;text-align:center;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px;">SCID JSC</div>
<div style="font-size:16px;font-weight:600;color:#ffffff;">Hệ thống theo dõi Hồ sơ Trình ký</div>
</td></tr>
<tr><td style="background-color:#ffffff;padding:28px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="padding-left:14px;font-size:15px;color:#1f2328;line-height:1.5;">
Kính gửi <strong style="color:#0969da;">{{ object.user_ids[0].name if object.user_ids else 'Anh/Chị' }}</strong>,
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#1f2328;margin:0 0 20px;">
<span style="display:inline-block;background-color:#fff8c5;color:#6a5300;padding:2px 8px;border-radius:20px;font-weight:600;font-size:12px;border:1px solid #d4a72c40;">Nhắc nhở</span>
<span style="margin-left:4px;">Hệ thống xin nhắc nhở: Hồ sơ <strong>{{ object.name }}</strong> còn <strong style="color:#bf8700;">1 ngày</strong> đến hạn xử lý.</span>
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr><td width="3" style="background-color:#bf8700;border-radius:2px;"></td>
<td style="background-color:#fff8c5;padding:16px 18px;border:1px solid #d4a72c40;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#6a5300;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Thông tin hồ sơ</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Loại giấy tờ</td><td style="font-weight:600;">{{ props.get('loai_giay_to', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Trích yếu</td><td style="font-weight:600;">{{ props.get('trich_yeu', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đối tác</td><td style="font-weight:600;">{{ object.partner_id.name if object.partner_id else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đơn vị trình</td><td style="font-weight:600;">{{ props.get('don_vi', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Số tiền</td><td style="font-weight:600;">{{ '{:,.0f}'.format(props.get('so_tien', 0) or 0) }} VNĐ</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Stage hiện tại</td><td style="font-weight:600;color:#bf8700;">{{ object.stage_id.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Hạn xử lý</td><td style="font-weight:700;color:#bf8700;">{{ object.date_deadline.strftime('%d-%m-%Y') if object.date_deadline else '' }} (Ngày mai)</td></tr>
</table>
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#6a5300;font-weight:600;margin:0 0 24px;">
Kính mong Anh/Chị ưu tiên xử lý hồ sơ này trước thời hạn. Xin trân trọng cảm ơn.
</p>
</td></tr>
<tr><td style="background-color:#f6f8fa;padding:16px 32px;border-top:1px solid #d0d7de;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align:center;">
<div style="font-size:12px;font-weight:600;color:#1f2328;margin-bottom:3px;">SCID — Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="font-size:11px;color:#656d76;margin-bottom:8px;">Thông báo tự động — không cần trả lời email này</div>
<div style="font-size:10px;color:#8b949e;">Email nội bộ · Cấm chuyển tiếp · Gửi tự động từ Odoo</div>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
```

---

## Template 3: Đến hạn hôm nay

**Model:** `project.task`

**Subject:**
```
{{ object.name }} — ĐẾN HẠN HÔM NAY
```

**Body HTML:**
```html
{% set props = {} %}
{% for p in object.task_properties or [] %}{% if p.get('value') is not none %}{% set _ = props.update({p['name']: p['value']}) %}{% endif %}{% endfor %}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 16px;background-color:#f3f4f6;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border:1px solid #d0d7de;border-radius:6px;overflow:hidden;">
<tr><td style="background-color:#24292f;padding:24px 32px;text-align:center;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px;">SCID JSC</div>
<div style="font-size:16px;font-weight:600;color:#ffffff;">Hệ thống theo dõi Hồ sơ Trình ký</div>
</td></tr>
<tr><td style="background-color:#ffffff;padding:28px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="padding-left:14px;font-size:15px;color:#1f2328;line-height:1.5;">
Kính gửi <strong style="color:#0969da;">{{ object.user_ids[0].name if object.user_ids else 'Anh/Chị' }}</strong>,
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#1f2328;margin:0 0 20px;">
<span style="display:inline-block;background-color:#ffebe9;color:#82071e;padding:2px 8px;border-radius:20px;font-weight:600;font-size:12px;border:1px solid #cf222e40;">Đến hạn hôm nay</span>
<span style="margin-left:4px;">Hệ thống xin thông báo: Hồ sơ <strong>{{ object.name }}</strong> <strong style="color:#cf222e;">đến hạn xử lý hôm nay</strong>.</span>
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr><td width="3" style="background-color:#cf222e;border-radius:2px;"></td>
<td style="background-color:#ffebe9;padding:16px 18px;border:1px solid #cf222e40;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#82071e;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Thông tin hồ sơ</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Loại giấy tờ</td><td style="font-weight:600;">{{ props.get('loai_giay_to', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Trích yếu</td><td style="font-weight:600;">{{ props.get('trich_yeu', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đối tác</td><td style="font-weight:600;">{{ object.partner_id.name if object.partner_id else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đơn vị trình</td><td style="font-weight:600;">{{ props.get('don_vi', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Số tiền</td><td style="font-weight:600;">{{ '{:,.0f}'.format(props.get('so_tien', 0) or 0) }} VNĐ</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Stage hiện tại</td><td style="font-weight:600;color:#cf222e;">{{ object.stage_id.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Hạn xử lý</td><td style="font-weight:700;color:#cf222e;">{{ object.date_deadline.strftime('%d-%m-%Y') if object.date_deadline else '' }} (HÔM NAY)</td></tr>
</table>
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#82071e;font-weight:600;margin:0 0 24px;">
Kính đề nghị Anh/Chị hoàn tất xử lý hồ sơ trong ngày hôm nay. Nếu có vướng mắc, xin vui lòng phản hồi để hệ thống ghi nhận.
</p>
</td></tr>
<tr><td style="background-color:#f6f8fa;padding:16px 32px;border-top:1px solid #d0d7de;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align:center;">
<div style="font-size:12px;font-weight:600;color:#1f2328;margin-bottom:3px;">SCID — Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="font-size:11px;color:#656d76;margin-bottom:8px;">Thông báo tự động — không cần trả lời email này</div>
<div style="font-size:10px;color:#8b949e;">Email nội bộ · Cấm chuyển tiếp · Gửi tự động từ Odoo</div>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
```

---

## Template 4: Escalation Quản lý (trễ 1 ngày)

**Model:** `project.task`

**Subject:**
```
HỒ SƠ TRỄ HẠN — {{ object.name }} — Trễ 1 ngày
```

!!! warning "Quan trọng — Cấu hình Email To"
    Template này gửi tới **Quản lý trực tiếp** của người phụ trách. Trong Automation Rule, set **Email To** = `{{ object.user_ids[0].parent_id.work_email if object.user_ids and object.user_ids[0].parent_id else '' }}`

**Body HTML:**
```html
{% set props = {} %}
{% for p in object.task_properties or [] %}{% if p.get('value') is not none %}{% set _ = props.update({p['name']: p['value']}) %}{% endif %}{% endfor %}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 16px;background-color:#f3f4f6;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border:1px solid #d0d7de;border-radius:6px;overflow:hidden;">
<tr><td style="background-color:#82071e;padding:24px 32px;text-align:center;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px;">SCID JSC</div>
<div style="font-size:16px;font-weight:600;color:rgba(255,255,255,0.9);">Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.15);">
<div style="font-size:14px;font-weight:600;color:#ffffff;letter-spacing:0.3px;">HỒ SƠ TRỄ HẠN</div>
<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px;">{{ object.name }}</div>
</div>
</td></tr>
<tr><td style="background-color:#ffffff;padding:28px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="padding-left:14px;font-size:15px;color:#1f2328;line-height:1.5;">
Kính gửi <strong style="color:#0969da;">{{ object.user_ids[0].parent_id.name if object.user_ids and object.user_ids[0].parent_id else 'Anh/Chị' }}</strong>,
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#1f2328;margin:0 0 20px;">
Hệ thống xin báo cáo: Hồ sơ dưới đây đã <strong style="color:#cf222e;">trễ hạn xử lý 1 ngày</strong>. Kính đề nghị Anh/Chị xem xét và chỉ đạo xử lý.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
<tr><td width="3" style="background-color:#0969da;border-radius:2px;"></td>
<td style="background-color:#f6f8fa;padding:16px 18px;border:1px solid #d0d7de;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#656d76;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Thông tin hồ sơ</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;width:100%;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Loại giấy tờ</td><td style="font-weight:600;">{{ props.get('loai_giay_to', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Trích yếu</td><td style="font-weight:600;">{{ props.get('trich_yeu', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đối tác</td><td style="font-weight:600;">{{ object.partner_id.name if object.partner_id else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Dịch vụ</td><td style="font-weight:600;">{{ props.get('dich_vu_su_dung', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đơn vị trình</td><td style="font-weight:600;">{{ props.get('don_vi', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Số tiền</td><td style="font-weight:600;">{{ '{:,.0f}'.format(props.get('so_tien', 0) or 0) }} VNĐ</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Hạn xử lý</td><td style="font-weight:700;color:#cf222e;">{{ object.date_deadline.strftime('%d-%m-%Y') if object.date_deadline else '' }} (trễ 1 ngày)</td></tr>
</table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
<tr><td width="3" style="background-color:#cf222e;border-radius:2px;"></td>
<td style="background-color:#ffebe9;padding:16px 18px;border:1px solid #cf222e30;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#82071e;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Bottleneck</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;width:100%;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Stage hiện tại</td><td style="font-weight:600;">{{ object.stage_id.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Người phụ trách</td><td style="font-weight:600;">{{ object.user_ids[0].name if object.user_ids else '' }}</td></tr>
</table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
<tr><td width="3" style="background-color:#bf8700;border-radius:2px;"></td>
<td style="background-color:#fff8c5;padding:16px 18px;border:1px solid #d4a72c30;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#6a5300;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Ảnh hưởng</div>
<p style="font-size:13px;color:#1f2328;line-height:1.65;margin:0;">Chậm xử lý hồ sơ <strong>{{ props.get('loai_giay_to', '') }}</strong> — có thể ảnh hưởng đến tiến độ và cam kết với đối tác <strong>{{ object.partner_id.name if object.partner_id else '' }}</strong>.</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="background-color:#dafbe1;padding:16px 18px;border:1px solid #1a7f3730;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#0e4429;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Đề xuất</div>
<p style="font-size:13px;color:#1f2328;line-height:1.65;margin:0;">Kính đề nghị Anh/Chị xem xét và chỉ đạo xử lý trong <strong>24 giờ</strong> tới. Hệ thống sẽ tiếp tục theo dõi và cập nhật.</p>
</td></tr></table>
</td></tr>
<tr><td style="background-color:#f6f8fa;padding:16px 32px;border-top:1px solid #d0d7de;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align:center;">
<div style="font-size:12px;font-weight:600;color:#1f2328;margin-bottom:3px;">SCID — Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="font-size:11px;color:#656d76;margin-bottom:8px;">Thông báo tự động — không cần trả lời email này</div>
<div style="font-size:10px;color:#8b949e;">Email nội bộ · Cấm chuyển tiếp · Gửi tự động từ Odoo</div>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
```

---

## Template 5: Escalation Phó Tổng (trễ 3 ngày)

**Model:** `project.task`

**Subject:**
```
HỒ SƠ TRỄ HẠN NGHIÊM TRỌNG — {{ object.name }} — Trễ 3 ngày
```

!!! warning "Quan trọng — Email Phó Tổng cố định"
    Gửi tới **email Phó Tổng Giám đốc** (cố định). Trong Automation Rule, set **Email To** = địa chỉ email cố định của Phó TGĐ (ví dụ: `pho-tong@scid-jsc.com`).

**Body HTML:**
```html
{% set props = {} %}
{% for p in object.task_properties or [] %}{% if p.get('value') is not none %}{% set _ = props.update({p['name']: p['value']}) %}{% endif %}{% endfor %}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 16px;background-color:#f3f4f6;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border:1px solid #d0d7de;border-radius:6px;overflow:hidden;">
<tr><td style="background-color:#82071e;padding:24px 32px;text-align:center;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px;">SCID JSC</div>
<div style="font-size:16px;font-weight:600;color:rgba(255,255,255,0.9);">Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.15);">
<div style="font-size:14px;font-weight:600;color:#ffffff;letter-spacing:0.3px;">HỒ SƠ TRỄ HẠN NGHIÊM TRỌNG</div>
<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px;">{{ object.name }}</div>
</div>
</td></tr>
<tr><td style="background-color:#ffffff;padding:28px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="padding-left:14px;font-size:15px;color:#1f2328;line-height:1.5;">
Kính gửi <strong style="color:#0969da;">Quý cấp trên</strong>,
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#82071e;font-weight:600;margin:0 0 20px;">
Hệ thống xin báo cáo: Hồ sơ dưới đây đã <strong style="color:#cf222e;">trễ hạn xử lý 3 ngày</strong>. Đây là mức escalation nghiêm trọng. Kính đề nghị Quý cấp trên chỉ đạo xử lý khẩn cấp.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
<tr><td width="3" style="background-color:#0969da;border-radius:2px;"></td>
<td style="background-color:#f6f8fa;padding:16px 18px;border:1px solid #d0d7de;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#656d76;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Thông tin hồ sơ</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;width:100%;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Loại giấy tờ</td><td style="font-weight:600;">{{ props.get('loai_giay_to', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Trích yếu</td><td style="font-weight:600;">{{ props.get('trich_yeu', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đối tác</td><td style="font-weight:600;">{{ object.partner_id.name if object.partner_id else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Dịch vụ</td><td style="font-weight:600;">{{ props.get('dich_vu_su_dung', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đơn vị trình</td><td style="font-weight:600;">{{ props.get('don_vi', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Số tiền</td><td style="font-weight:600;">{{ '{:,.0f}'.format(props.get('so_tien', 0) or 0) }} VNĐ</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Hạn xử lý</td><td style="font-weight:700;color:#cf222e;">{{ object.date_deadline.strftime('%d-%m-%Y') if object.date_deadline else '' }} (trễ 3 ngày)</td></tr>
</table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
<tr><td width="3" style="background-color:#cf222e;border-radius:2px;"></td>
<td style="background-color:#ffebe9;padding:16px 18px;border:1px solid #cf222e30;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#82071e;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Bottleneck</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;width:100%;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Stage hiện tại</td><td style="font-weight:600;">{{ object.stage_id.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Người phụ trách</td><td style="font-weight:600;">{{ object.user_ids[0].name if object.user_ids else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Quản lý trực tiếp</td><td style="font-weight:600;">{{ object.user_ids[0].parent_id.name if object.user_ids and object.user_ids[0].parent_id else '' }}</td></tr>
</table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">
<tr><td width="3" style="background-color:#bf8700;border-radius:2px;"></td>
<td style="background-color:#fff8c5;padding:16px 18px;border:1px solid #d4a72c30;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#6a5300;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Ảnh hưởng</div>
<p style="font-size:13px;color:#1f2328;line-height:1.65;margin:0;"><strong>Chậm xử lý nghiêm trọng</strong> — ảnh hưởng đến cam kết với đối tác <strong>{{ object.partner_id.name if object.partner_id else '' }}</strong> và uy tín công ty.</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="background-color:#dafbe1;padding:16px 18px;border:1px solid #1a7f3730;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#0e4429;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Hành động khẩn cấp</div>
<p style="font-size:13px;color:#1f2328;line-height:1.85;margin:0;">
<strong>1.</strong> Kính đề nghị chỉ đạo xử lý khẩn cấp trong <strong>24 giờ</strong> tới<br>
<strong>2.</strong> Kính mong chỉ đạo quản lý trực tiếp phối hợp xử lý<br>
<strong>3.</strong> Cập nhật tiến độ vào hệ thống — hệ thống sẽ tự động ghi nhận
</p>
</td></tr></table>
</td></tr>
<tr><td style="background-color:#f6f8fa;padding:16px 32px;border-top:1px solid #d0d7de;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align:center;">
<div style="font-size:12px;font-weight:600;color:#1f2328;margin-bottom:3px;">SCID — Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="font-size:11px;color:#656d76;margin-bottom:8px;">Thông báo tự động — không cần trả lời email này</div>
<div style="font-size:10px;color:#8b949e;">Email nội bộ · Cấm chuyển tiếp · Gửi tự động từ Odoo</div>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
```

---

## Template 6: Cập nhật Thư ký

**Model:** `project.task`

**Subject:**
```
Hồ sơ cập nhật: {{ object.name }}
```

**Ghi chú:** Gửi tới **Thư ký** (email cố định). Trong Automation Rule, set **Email To** = email Thư ký PT hoặc TGĐ tùy stage.

**Body HTML:**
```html
{% set props = {} %}
{% for p in object.task_properties or [] %}{% if p.get('value') is not none %}{% set _ = props.update({p['name']: p['value']}) %}{% endif %}{% endfor %}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 16px;background-color:#f3f4f6;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border:1px solid #d0d7de;border-radius:6px;overflow:hidden;">
<tr><td style="background-color:#24292f;padding:24px 32px;text-align:center;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px;">SCID JSC</div>
<div style="font-size:16px;font-weight:600;color:#ffffff;">Hệ thống theo dõi Hồ sơ Trình ký</div>
</td></tr>
<tr><td style="background-color:#ffffff;padding:28px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="padding-left:14px;font-size:15px;color:#1f2328;line-height:1.5;">
Kính gửi <strong style="color:#0969da;">Thư ký</strong>,
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#1f2328;margin:0 0 20px;">
Hệ thống xin thông báo: Hồ sơ <strong>{{ object.name }}</strong> đã được cập nhật trạng thái sang <strong style="color:#0969da;">{{ object.stage_id.name }}</strong>.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr><td width="3" style="background-color:#0969da;border-radius:2px;"></td>
<td style="background-color:#f6f8fa;padding:16px 18px;border:1px solid #d0d7de;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#656d76;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Thông tin hồ sơ</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;width:100%;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Tên hồ sơ</td><td style="font-weight:600;">{{ object.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Loại giấy tờ</td><td style="font-weight:600;">{{ props.get('loai_giay_to', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Trích yếu</td><td style="font-weight:600;">{{ props.get('trich_yeu', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đối tác</td><td style="font-weight:600;">{{ object.partner_id.name if object.partner_id else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đơn vị trình</td><td style="font-weight:600;">{{ props.get('don_vi', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Người phụ trách</td><td style="font-weight:600;">{{ object.user_ids[0].name if object.user_ids else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Stage hiện tại</td><td style="font-weight:700;color:#0969da;">{{ object.stage_id.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Hạn xử lý</td><td style="font-weight:600;">{{ object.date_deadline.strftime('%d-%m-%Y') if object.date_deadline else '' }}</td></tr>
</table>
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#656d76;margin:0 0 24px;">
Kính mong Anh/Chị kiểm tra và cập nhật thông tin trên hệ thống. Trân trọng.
</p>
</td></tr>
<tr><td style="background-color:#f6f8fa;padding:16px 32px;border-top:1px solid #d0d7de;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align:center;">
<div style="font-size:12px;font-weight:600;color:#1f2328;margin-bottom:3px;">SCID — Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="font-size:11px;color:#656d76;margin-bottom:8px;">Thông báo tự động — không cần trả lời email này</div>
<div style="font-size:10px;color:#8b949e;">Email nội bộ · Cấm chuyển tiếp · Gửi tự động từ Odoo</div>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
```

---

## Template 7: Tạo hồ sơ mới (Welcome)

**Model:** `project.task`

**Subject:**
```
Hồ sơ đã tạo: {{ object.name }}
```

**Body HTML:**
```html
{% set props = {} %}
{% for p in object.task_properties or [] %}{% if p.get('value') is not none %}{% set _ = props.update({p['name']: p['value']}) %}{% endif %}{% endfor %}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:20px 16px;background-color:#f3f4f6;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border:1px solid #d0d7de;border-radius:6px;overflow:hidden;">
<tr><td style="background-color:#24292f;padding:24px 32px;text-align:center;">
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px;">SCID JSC</div>
<div style="font-size:16px;font-weight:600;color:#ffffff;">Hệ thống theo dõi Hồ sơ Trình ký</div>
</td></tr>
<tr><td style="background-color:#ffffff;padding:28px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="padding-left:14px;font-size:15px;color:#1f2328;line-height:1.5;">
Kính gửi <strong style="color:#0969da;">{{ object.user_ids[0].name if object.user_ids else 'Anh/Chị' }}</strong>,
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#1f2328;margin:0 0 20px;">
Hệ thống xin thông báo: Hồ sơ <strong>{{ object.name }}</strong> đã được tạo thành công và bắt đầu được theo dõi tự động.
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
<tr><td width="3" style="background-color:#1a7f37;border-radius:2px;"></td>
<td style="background-color:#dafbe1;padding:16px 18px;border:1px solid #1a7f3730;border-left:none;border-radius:0 6px 6px 0;">
<div style="font-size:12px;font-weight:600;color:#0e4429;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Thông tin hồ sơ</div>
<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:#1f2328;line-height:2.1;width:100%;">
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Tên hồ sơ</td><td style="font-weight:600;">{{ object.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Loại giấy tờ</td><td style="font-weight:600;">{{ props.get('loai_giay_to', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Trích yếu</td><td style="font-weight:600;">{{ props.get('trich_yeu', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đối tác</td><td style="font-weight:600;">{{ object.partner_id.name if object.partner_id else '' }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Đơn vị trình</td><td style="font-weight:600;">{{ props.get('don_vi', '') }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Số tiền</td><td style="font-weight:600;">{{ '{:,.0f}'.format(props.get('so_tien', 0) or 0) }} VNĐ</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Stage</td><td style="font-weight:700;color:#1a7f37;">{{ object.stage_id.name }}</td></tr>
<tr><td style="color:#656d76;padding-right:16px;white-space:nowrap;">Hạn xử lý</td><td style="font-weight:600;">{{ object.date_deadline.strftime('%d-%m-%Y') if object.date_deadline else '' }}</td></tr>
</table>
</td></tr></table>
<p style="font-size:14px;line-height:1.75;color:#656d76;margin:0 0 24px;">
Hệ thống sẽ tự động theo dõi tiến độ và gửi thông báo theo từng giai đoạn. Kính mong Anh/Chị cập nhật thông tin cần thiết và đính kèm tài liệu liên quan. Trân trọng.
</p>
</td></tr>
<tr><td style="background-color:#f6f8fa;padding:16px 32px;border-top:1px solid #d0d7de;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="text-align:center;">
<div style="font-size:12px;font-weight:600;color:#1f2328;margin-bottom:3px;">SCID — Hệ thống theo dõi Hồ sơ Trình ký</div>
<div style="font-size:11px;color:#656d76;margin-bottom:8px;">Thông báo tự động — không cần trả lời email này</div>
<div style="font-size:10px;color:#8b949e;">Email nội bộ · Cấm chuyển tiếp · Gửi tự động từ Odoo</div>
</td></tr></table>
</td></tr>
</table>
</td></tr></table>
```

---

## Cách dán HTML vào Odoo

1. Vào **Settings > Technical > Email > Templates** (cần Developer Mode)
2. Nhấp **New**
3. Điền:
   - **Name**: tên template (ví dụ: `[HOSOTK] Nhắc nhẹ 3 ngày`)
   - **Applies To** (Model): `Project Task` (`project.task`)
   - **Subject**: dán subject Jinja2 ở trên
4. Tab **Content**: Chuyển sang chế độ **HTML** (nút `</>` góc phải)
5. Dán toàn bộ HTML body vào
6. Nhấp **Save**

---

## Kiểm tra sau khi tạo

Sau khi tạo xong một template, test bằng cách:

1. Mở một Task trong project **Hồ sơ trình ký Ban TGĐ**
2. Nhấp **Send message > Email**
3. Chọn template vừa tạo
4. Xem preview để kiểm tra các field Jinja2 đã render đúng chưa

!!! info "Kiểm tra Properties Fields"
    Nếu `props.get(...)` trả về rỗng: Kiểm tra lại tên field trong Properties (phải khớp chính xác với `cap_duyet`, `trich_yeu`, `loai_giay_to`, etc. đã tạo ở Hướng dẫn 01).
