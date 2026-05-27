/**
 * SCID Helpdesk User Guide — DOCX Generator
 *
 * Tạo tài liệu Word chính thức hướng dẫn sử dụng hệ thống scid.vn/helpdesk
 * cho các đơn vị Sense.
 *
 * Tác giả: Ban CNTT & Chuyển đổi số — SCID
 * Phiên bản: 1.0 — 27/05/2026
 */

// Load docx từ global npm install (homebrew node)
const docxPath = '/opt/homebrew/lib/node_modules/docx';
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat,
  ExternalHyperlink, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, TabStopType, TabStopPosition,
  ImageRun
} = require(docxPath);
const fs = require('fs');
const path = require('path');

/* ─────────────── Image helpers ─────────────── */

// Screenshots committed to ../huong-dan/_assets/ (shared between docx + markdown)
const SHOT_DIR = path.resolve(__dirname, '..', 'huong-dan', '_assets');
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const MAX_IMG_WIDTH = 560; // pixels, target width for embedded images

// Read PNG width/height from IHDR chunk
function pngSize(filepath) {
  const buf = fs.readFileSync(filepath);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// Create an ImageRun-bearing paragraph sized to fit page (maintain aspect ratio)
function shot(filename, caption) {
  const fullPath = path.join(SHOT_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ✗ Screenshot missing: ${filename}`);
    return [new Paragraph({ children: [new TextRun({ text: `[Missing screenshot: ${filename}]`, italics: true, color: "C00000" })] })];
  }
  const { width: ow, height: oh } = pngSize(fullPath);
  const w = MAX_IMG_WIDTH;
  const h = Math.round((oh / ow) * w);
  const result = [
    new Paragraph({
      children: [new ImageRun({
        type: "png",
        data: fs.readFileSync(fullPath),
        transformation: { width: w, height: h },
        altText: { title: caption || filename, description: caption || filename, name: filename }
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: caption ? 20 : 80 }
    })
  ];
  if (caption) {
    result.push(new Paragraph({
      children: [new TextRun({ text: caption, font: "Arial", size: 18, italics: true, color: "595959" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 }
    }));
  }
  return result;
}

/* ─────────────── Helpers ─────────────── */

const BLUE = "1F4E79";       // SCID brand-ish blue
const LIGHT_BLUE = "D9E2F3"; // Section header bg
const GREEN = "548235";      // Success / SLA
const RED = "C00000";        // Warning
const GREY = "595959";       // Body grey
const LIGHT_GREY = "F2F2F2"; // Alternate row

const FONT = "Arial";

// Convert mm to DXA (1 inch = 1440 DXA, 1 inch = 25.4 mm)
const mm = (n) => Math.round((n / 25.4) * 1440);

// A4 page: 210mm × 297mm
const A4_WIDTH = mm(210);   // 11906
const A4_HEIGHT = mm(297);  // 16838
const MARGIN = mm(15);      // 15mm margin (tighter — was 20mm)
const CONTENT_WIDTH = A4_WIDTH - (MARGIN * 2); // ~9921 DXA

/* ─────────────── Paragraph helpers ─────────────── */

const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, font: FONT, size: 22, ...opts.run })],
  spacing: { after: 60, ...opts.spacing },
  alignment: opts.alignment,
  ...opts
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: FONT, size: 30, bold: true, color: BLUE })],
  spacing: { before: 180, after: 80 },
  pageBreakBefore: false
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: BLUE })],
  spacing: { before: 140, after: 60 }
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: "000000" })],
  spacing: { before: 100, after: 40 }
});

const bullet = (text, opts = {}) => new Paragraph({
  numbering: { reference: "bullets", level: opts.level || 0 },
  children: [new TextRun({ text, font: FONT, size: 22, ...opts.run })],
  spacing: { after: 40 }
});

const bulletRich = (runs, opts = {}) => new Paragraph({
  numbering: { reference: "bullets", level: opts.level || 0 },
  children: runs,
  spacing: { after: 40 }
});

const numbered = (text, opts = {}) => new Paragraph({
  numbering: { reference: "numbers", level: opts.level || 0 },
  children: [new TextRun({ text, font: FONT, size: 22, ...opts.run })],
  spacing: { after: 40 }
});

const note = (label, text) => new Paragraph({
  children: [
    new TextRun({ text: label + " ", font: FONT, size: 22, bold: true, color: BLUE }),
    new TextRun({ text, font: FONT, size: 22 })
  ],
  spacing: { before: 60, after: 80 },
  border: {
    left: { style: BorderStyle.SINGLE, size: 24, color: BLUE, space: 6 }
  },
  indent: { left: 200 }
});

const warning = (text) => new Paragraph({
  children: [
    new TextRun({ text: "⚠ Lưu ý: ", font: FONT, size: 22, bold: true, color: RED }),
    new TextRun({ text, font: FONT, size: 22 })
  ],
  spacing: { before: 60, after: 80 },
  border: {
    left: { style: BorderStyle.SINGLE, size: 24, color: RED, space: 6 }
  },
  indent: { left: 200 }
});

const blank = () => new Paragraph({ children: [new TextRun({ text: "", font: FONT, size: 22 })] });

/* ─────────────── Table helpers ─────────────── */

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

const tableCell = (text, opts = {}) => new TableCell({
  borders: cellBorders,
  width: { size: opts.width, type: WidthType.DXA },
  shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  verticalAlign: VerticalAlign.CENTER,
  children: [new Paragraph({
    children: [new TextRun({
      text,
      font: FONT,
      size: opts.size || 22,
      bold: opts.bold,
      color: opts.color
    })],
    alignment: opts.align
  })]
});

const headerCell = (text, width) => tableCell(text, {
  width, shade: BLUE, bold: true, color: "FFFFFF", align: AlignmentType.CENTER
});

/* ─────────────── Content data ─────────────── */

const VTD_CATEGORIES = [
  ["vtd_ctkm", "Khuyến mãi (CTKM / PMH / Coupon / Voucher)",
   "Tạo CTKM mới; giảm giá đích danh, theo %, theo điều kiện, hóa đơn tích lũy; combo đồng giá; mua A tặng B; nhân đôi điểm thưởng; phát hành PMH; cấp/gia hạn Coupon, Voucher"],
  ["vtd_product", "Sản phẩm & Barcode",
   "Điều chỉnh giá bán; thêm barcode cho SP có sẵn; tạo mã Shop (chung/riêng); tạo mã hàng & nhập giá vốn"],
  ["vtd_account", "Tài khoản & phân quyền",
   "Phân quyền người dùng; cấp tài khoản ESSXanh / ESSCAM"],
  ["vtd_kiosk", "Kiosk tra cứu & gian hàng",
   "Cập nhật biểu mẫu gian hàng trên Kiosk tra cứu"],
  ["vtd_report", "Báo cáo & dữ liệu",
   "Yêu cầu trích xuất, phân tích, đối soát dữ liệu VTD"],
  ["vtd_incident", "Sự cố hệ thống",
   "VTD không truy cập được, lỗi đăng nhập, treo, chậm"],
  ["vtd_training", "Hướng dẫn sử dụng",
   "Yêu cầu hướng dẫn thao tác trên VTD"],
  ["vtd_other", "Yêu cầu khác",
   "Các yêu cầu liên quan VTD chưa có trong danh mục"]
];

const ODOO_CATEGORIES = [
  ["erp_user", "Tài khoản người dùng", "Tạo mới, khôi phục, cập nhật thông tin tài khoản Odoo"],
  ["erp_access", "Phân quyền & vai trò", "Gán/gỡ quyền truy cập module, thay đổi role"],
  ["erp_report", "Báo cáo & dữ liệu", "Yêu cầu báo cáo, dashboard, trích xuất dữ liệu Odoo"],
  ["erp_module", "Lỗi chức năng / Module", "Lỗi nghiệp vụ trong module HRMS, eOffice, Accounting..."],
  ["erp_training", "Hướng dẫn sử dụng", "Hướng dẫn thao tác Odoo"],
  ["erp_other", "Yêu cầu khác", "Yêu cầu liên quan Odoo chưa có trong danh mục"]
];

const HW_CATEGORIES = [
  ["hw_laptop", "Laptop / Máy tính bàn", "Cài đặt, sửa chữa, thay thế PC/laptop"],
  ["hw_printer", "Máy in & máy scan", "Sự cố in ấn, kẹt giấy, mực, driver máy in/scan"],
  ["hw_phone", "Điện thoại bàn", "Lỗi điện thoại bàn cố định trong văn phòng"],
  ["hw_peripheral", "Ngoại vi (chuột, bàn phím, màn hình)", "Thay thế, sửa chữa thiết bị ngoại vi"],
  ["hw_pos", "Thiết bị POS (máy quét, máy in bill, két tiền)", "Sự cố POS tại quầy"],
  ["hw_other", "Yêu cầu khác", "Thiết bị khác chưa có trong danh mục"]
];

const NET_CATEGORIES = [
  ["net_wifi", "Wi-Fi", "Không vào được Wi-Fi, sóng yếu, không ổn định"],
  ["net_internet", "Đường truyền Internet", "Mất Internet, chậm, gián đoạn"],
  ["net_vpn", "VPN & truy cập từ xa", "Cấp/khôi phục VPN, không kết nối được từ xa"]
];

const M365_CATEGORIES = [
  ["net_email", "Email & lịch (Outlook)", "Cấp/khôi phục email công ty, lỗi gửi/nhận, lỗi lịch"],
  ["ms365_teams", "Microsoft Teams (chat & họp)", "Lỗi đăng nhập Teams, lỗi họp online, chia sẻ màn hình"],
  ["ms365_files", "OneDrive & SharePoint (file)", "Lỗi đồng bộ, không truy cập được tài liệu chia sẻ"]
];

const SW_CATEGORIES = [
  ["sw_os", "Hệ điều hành (Windows / macOS)", "Lỗi Windows/macOS, blue screen, không khởi động"],
  ["sw_install", "Cài đặt & cập nhật phần mềm", "Yêu cầu cài đặt, cập nhật phần mềm được phê duyệt"],
  ["sw_license", "Bản quyền & License", "Cấp, gia hạn bản quyền phần mềm"],
  ["sw_other", "Yêu cầu khác", "Phần mềm khác chưa có trong danh mục"]
];

const SEC_CATEGORIES = [
  ["sec_password", "Quên mật khẩu / Khóa tài khoản (mọi hệ thống)", "Reset mật khẩu, mở khóa tài khoản đăng nhập"],
  ["sec_mfa", "MFA / 2FA / OTP (xác thực 2 yếu tố)", "Cấu hình lại, mất thiết bị MFA, không nhận OTP"],
  ["sec_phishing", "Phishing / Email lừa đảo", "Báo cáo email nghi ngờ lừa đảo, lừa click link"],
  ["sec_virus", "Virus & phần mềm độc hại", "Máy nghi nhiễm virus, ransomware, mã độc"],
  ["data_backup", "Backup & Restore dữ liệu", "Yêu cầu khôi phục dữ liệu đã xóa hoặc backup"],
  ["account_offboard", "Thu hồi tài khoản (nhân viên nghỉ)", "Khi nhân viên nghỉ việc, thu hồi toàn bộ tài khoản"],
  ["sec_other", "Sự cố bảo mật khác", "Sự cố bảo mật khác chưa có trong danh mục"]
];

/* ─────────────── Build document ─────────────── */

const children = [
  /* ═══════════ TRANG BÌA ═══════════ */
  new Paragraph({
    children: [new TextRun({ text: "BAN CÔNG NGHỆ THÔNG TIN & CHUYỂN ĐỔI SỐ", font: FONT, size: 22, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 720, after: 60 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "CÔNG TY CỔ PHẦN ĐẦU TƯ PHÁT TRIỂN SAIGON CO.OP (SCID)", font: FONT, size: 22, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 720 }
  }),

  new Paragraph({
    children: [new TextRun({ text: "TÀI LIỆU HƯỚNG DẪN", font: FONT, size: 44, bold: true, color: BLUE })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "SỬ DỤNG HỆ THỐNG HELPDESK SCID", font: FONT, size: 36, bold: true, color: BLUE })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 320 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "scid.vn/helpdesk", font: FONT, size: 28, color: GREEN, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 720 }
  }),

  new Paragraph({
    children: [new TextRun({ text: "Ban hành cho các đơn vị Sense", font: FONT, size: 26, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "(SCID — Sense Cần Thơ — Sense Cà Mau — Sense PVD — Sense Bến Tre — Sense Cái Bè)", font: FONT, size: 22, color: GREY })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 720 }
  }),

  /* Bảng thông tin ban hành */
  new Table({
    width: { size: mm(120), type: WidthType.DXA },
    columnWidths: [mm(50), mm(70)],
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({ children: [
        tableCell("Phiên bản", { width: mm(50), shade: LIGHT_BLUE, bold: true }),
        tableCell("1.0", { width: mm(70) })
      ]}),
      new TableRow({ children: [
        tableCell("Ngày ban hành", { width: mm(50), shade: LIGHT_BLUE, bold: true }),
        tableCell("27/05/2026", { width: mm(70) })
      ]}),
      new TableRow({ children: [
        tableCell("Đơn vị phát hành", { width: mm(50), shade: LIGHT_BLUE, bold: true }),
        tableCell("Ban CNTT & CĐS — SCID", { width: mm(70) })
      ]}),
      new TableRow({ children: [
        tableCell("Liên hệ hỗ trợ", { width: mm(50), shade: LIGHT_BLUE, bold: true }),
        tableCell("scid.vn/helpdesk", { width: mm(70) })
      ]})
    ]
  }),

  new Paragraph({ children: [new PageBreak()] }),

  /* ═══════════ MỤC LỤC (manual) ═══════════ */
  h1("MỤC LỤC"),
  p("1. Mục đích và phạm vi áp dụng"),
  p("2. Tổng quan hệ thống"),
  p("3. Hướng dẫn gửi yêu cầu hỗ trợ"),
  p("4. Danh mục dịch vụ hỗ trợ"),
  p("5. Hướng dẫn chi tiết — Hệ thống VTD"),
  p("6. Cách viết mô tả vấn đề hiệu quả"),
  p("7. Cách chọn mức độ ưu tiên"),
  p("8. Đính kèm file"),
  p("9. Cam kết phản hồi (SLA)"),
  p("10. Sau khi gửi yêu cầu"),
  p("11. Hỗ trợ khẩn cấp"),
  p("12. Câu hỏi thường gặp (FAQ)"),
  p("13. Phụ lục — Bảng tra cứu nhanh"),

  new Paragraph({ children: [new PageBreak()] }),

  /* ═══════════ 1. MỤC ĐÍCH ═══════════ */
  h1("1. MỤC ĐÍCH VÀ PHẠM VI ÁP DỤNG"),

  h2("1.1. Mục đích"),
  p("Tài liệu này hướng dẫn cán bộ, nhân viên các đơn vị Sense thuộc SCID cách sử dụng Hệ thống Helpdesk tại địa chỉ scid.vn/helpdesk để gửi yêu cầu hỗ trợ về Công nghệ thông tin một cách nhanh chóng, chính xác và đầy đủ thông tin."),

  h2("1.2. Phạm vi áp dụng"),
  p("Tài liệu này áp dụng cho:"),
  bullet("Toàn bộ cán bộ, nhân viên tại SCID và các đơn vị Sense (Sense Cần Thơ, Sense Cà Mau, Sense Phạm Văn Đồng, Sense Bến Tre, Sense Cái Bè);"),
  bullet("Tất cả các yêu cầu hỗ trợ liên quan đến hệ thống VTD, Odoo (HRMS, eOffice), thiết bị CNTT, mạng, Microsoft 365, phần mềm và các vấn đề bảo mật;"),
  bullet("Các yêu cầu cấp phát/khôi phục tài khoản, đặt lại mật khẩu, phân quyền hệ thống."),

  h2("1.3. Đối tượng sử dụng"),
  p("Mọi nhân viên có tài khoản email công ty đều có thể truy cập và gửi yêu cầu qua Hệ thống Helpdesk."),

  h2("1.4. Đầu mối phụ trách"),
  p("Ban Công nghệ thông tin & Chuyển đổi số (Ban CNTT & CĐS) — SCID."),

  /* ═══════════ 2. TỔNG QUAN ═══════════ */
  h1("2. TỔNG QUAN HỆ THỐNG"),

  h2("2.1. Địa chỉ truy cập"),
  new Paragraph({
    children: [
      new TextRun({ text: "Truy cập trực tiếp tại: ", font: FONT, size: 22 }),
      new ExternalHyperlink({
        children: [new TextRun({ text: "https://scid.vn/helpdesk", font: FONT, size: 22, color: BLUE, underline: {} })],
        link: "https://scid.vn/helpdesk"
      })
    ],
    spacing: { after: 120 }
  }),
  p("Trang chủ hiển thị lời chào và mô tả ngắn gọn về thời gian phản hồi:"),
  ...shot('01-hero.png', 'Hình 1 — Hero hiển thị tại trang chủ scid.vn/helpdesk'),

  h2("2.2. Yêu cầu thiết bị"),
  bullet("Máy tính, máy tính bảng hoặc điện thoại có kết nối Internet;"),
  bullet("Trình duyệt cập nhật: Google Chrome, Microsoft Edge, Firefox hoặc Safari (phiên bản mới nhất khuyến nghị);"),
  bullet("Không cần cài đặt phần mềm. Không cần đăng nhập tài khoản — chỉ cần email công ty để nhận thông báo."),

  h2("2.3. Giờ làm việc của Ban CNTT & CĐS"),
  bullet("Thứ Hai – Thứ Sáu: 8h00 – 17h00."),
  bullet("Thứ Bảy – Chủ Nhật và các ngày nghỉ lễ: Không trực hệ thống. Sự cố khẩn cấp sẽ được xử lý theo quy trình ứng cứu riêng."),

  note("Lưu ý:", "Hệ thống Helpdesk hoạt động 24/7. Anh/Chị có thể gửi yêu cầu bất cứ lúc nào, nhưng các yêu cầu ngoài giờ làm việc sẽ được xử lý vào đầu ngày làm việc tiếp theo (trừ trường hợp sự cố hệ thống diện rộng)."),

  /* ═══════════ 3. HƯỚNG DẪN GỬI YÊU CẦU ═══════════ */
  h1("3. HƯỚNG DẪN GỬI YÊU CẦU HỖ TRỢ"),

  p("Form gửi yêu cầu được chia thành 3 bước. Anh/Chị thực hiện theo trình tự, hoàn tất bước trước mới mở được bước sau."),

  h2("Bước 1 — Thông tin liên hệ"),
  p("Điền 4 trường thông tin bắt buộc:"),
  numbered("Họ và tên — VD: Hồ Kim Yến (ghi đầy đủ họ tên có dấu)."),
  numbered("Email công ty — VD: tenban@scid-jsc.com (dùng để nhận xác nhận và cập nhật tiến độ)."),
  numbered("Phòng/Ban — VD: Kế toán, Vận hành, Nhân sự…"),
  numbered("Đơn vị — Chọn từ danh sách: SCID, Sense Cần Thơ, Sense Cà Mau, Sense Phạm Văn Đồng, Sense Bến Tre, Sense Cái Bè."),
  ...shot('02-step1-empty.png', 'Hình 2 — Bước 1 ở trạng thái chưa điền'),
  p("Sau khi điền đủ 4 trường, Bước 1 sẽ tự kích hoạt Bước 2 (Bước 2 chuyển từ trạng thái mờ sang sẵn sàng):"),
  ...shot('03-step1-filled.png', 'Hình 3 — Bước 1 đã điền đầy đủ thông tin mẫu'),
  warning("Email công ty phải đúng định dạng @scid-jsc.com hoặc tên miền nội bộ. Email cá nhân (Gmail, Yahoo…) sẽ không nhận được thông báo từ hệ thống."),

  h2("Bước 2 — Yêu cầu hỗ trợ"),
  p("Bao gồm 2 phần:"),
  p("a) Loại dịch vụ — Bắt buộc chọn từ danh sách có sẵn (8 nhóm chính, xem mục 4). Bấm vào ô để mở cửa sổ chọn:"),
  ...shot('04-step2-empty.png', 'Hình 4 — Bước 2: nút chọn Loại dịch vụ'),
  p("Khi bấm, cửa sổ chọn (modal) sẽ hiện ra với 8 nhóm chính được phân thành các thẻ:"),
  ...shot('05-modal-L1-groups.png', 'Hình 5 — Modal cấp 1: 8 nhóm dịch vụ chính'),
  p("Khi chọn một nhóm (VD: Hệ thống VTD), danh sách dịch vụ con (cấp 2) sẽ hiện. Một số mục có thêm cấp 3 (mũi tên \"›\" bên phải báo hiệu):"),
  ...shot('06-modal-L2-VTD.png', 'Hình 6 — Modal cấp 2: 8 dịch vụ trong nhóm Hệ thống VTD'),
  p("Tiếp tục chọn một dịch vụ có cấp 3 (VD: Khuyến mãi) sẽ mở danh sách chức năng cụ thể:"),
  ...shot('07-modal-L3-CTKM.png', 'Hình 7 — Modal cấp 3: 11 chức năng trong nhóm Khuyến mãi'),
  p("b) Chức năng VTD — Chỉ hiện khi Anh/Chị chọn một loại dịch vụ thuộc nhóm Hệ thống VTD."),
  p("c) Tên gian hàng + Mã gian hàng — Chỉ yêu cầu khi:"),
  bullet("Loại dịch vụ là Hệ thống VTD > Khuyến mãi (CTKM/PMH/Coupon/Voucher); hoặc"),
  bullet("Loại dịch vụ là Hệ thống VTD > Sản phẩm & Barcode."),
  p("Các trường hợp khác sẽ không hiện 2 ô này. Khi điều kiện đúng, Bước 2 sẽ hiện thêm 2 trường gian hàng:"),
  ...shot('08-step2-with-booth.png', 'Hình 8 — Bước 2 hiện 2 trường gian hàng khi chọn VTD > Khuyến mãi/Sản phẩm'),
  note("Mẹo:", "Khi chọn Chức năng VTD, hệ thống sẽ tự sinh tiêu đề ticket theo cấu trúc 'CTKM › Cấp CTKM' hoặc 'Mã SP › Điều chỉnh giá bán' để Ban CNTT dễ phân loại."),

  h2("Bước 3 — Mô tả vấn đề và mức độ ưu tiên"),
  p("Gồm 3 phần:"),
  p("a) Mô tả vấn đề — Bắt buộc. Tối thiểu 10 ký tự, tối đa 2.000 ký tự. Xem cách viết mô tả hiệu quả tại mục 6."),
  p("b) Mức độ ưu tiên — Chọn 1 trong 3 mức: Thấp / Trung bình / Cao. Mặc định là Trung bình. Xem hướng dẫn tại mục 7."),
  p("c) Đính kèm file/ảnh — Tùy chọn. Tối đa 5 file, dung lượng mỗi file không quá 10 MB. Xem chi tiết tại mục 8."),
  ...shot('09-step3-full.png', 'Hình 9 — Bước 3 đầy đủ: mô tả vấn đề, mức ưu tiên, đính kèm file, nút Gửi yêu cầu'),

  h2("Gửi yêu cầu"),
  p("Sau khi điền đủ thông tin bắt buộc:"),
  numbered("Kiểm tra lại Tóm tắt yêu cầu hiển thị ở cuối trang."),
  numbered("Bấm nút Gửi yêu cầu màu xanh."),
  numbered("Hệ thống hiện popup Thành công và gửi email xác nhận đến địa chỉ đã đăng ký."),

  /* ═══════════ 4. DANH MỤC DỊCH VỤ ═══════════ */
  h1("4. DANH MỤC DỊCH VỤ HỖ TRỢ"),
  p("Hệ thống cung cấp 8 nhóm dịch vụ chính. Anh/Chị chọn nhóm và mục con phù hợp nhất với yêu cầu."),

  h2("4.1. Hệ thống VTD"),
  buildCategoryTable(VTD_CATEGORIES),

  h2("4.2. Hệ thống Odoo"),
  buildCategoryTable(ODOO_CATEGORIES),

  h2("4.3. Thiết bị"),
  buildCategoryTable(HW_CATEGORIES),

  h2("4.4. Mạng"),
  buildCategoryTable(NET_CATEGORIES),

  h2("4.5. Microsoft 365"),
  buildCategoryTable(M365_CATEGORIES),

  h2("4.6. Phần mềm"),
  buildCategoryTable(SW_CATEGORIES),

  h2("4.7. Bảo mật & Tài khoản"),
  buildCategoryTable(SEC_CATEGORIES),

  h2("4.8. Yêu cầu khác"),
  p("Chọn nhóm này khi yêu cầu của Anh/Chị KHÔNG thuộc 7 nhóm trên. Ban CNTT sẽ tiếp nhận và chuyển bộ phận phù hợp."),

  /* ═══════════ 5. HỆ THỐNG VTD CHI TIẾT ═══════════ */
  h1("5. HƯỚNG DẪN CHI TIẾT — HỆ THỐNG VTD"),
  p("Hệ thống VTD là nhóm dịch vụ đặc thù được sử dụng nhiều nhất bởi các Sense. Form yêu cầu được thiết kế 3 cấp drill-down để phân loại chính xác."),

  h2("5.1. Khuyến mãi (CTKM / PMH / Coupon / Voucher)"),
  p("Khi chọn nhóm này, Anh/Chị tiếp tục chọn 1 trong 11 chức năng cụ thể:"),
  bullet("Tạo mới chương trình khuyến mãi"),
  bullet("Giảm giá khách hàng đích danh"),
  bullet("Giảm giá theo % (phần trăm)"),
  bullet("Combo đồng giá nhiều sản phẩm"),
  bullet("Giảm giá theo điều kiện"),
  bullet("Mua A tặng B (kèm sản phẩm khác)"),
  bullet("Giảm giá theo hóa đơn tích lũy"),
  bullet("Nhân đôi điểm thưởng (khách thành viên)"),
  bullet("Phát hành phiếu mua hàng (PMH)"),
  bullet("Cấp mới & gia hạn Coupon"),
  bullet("Cấp mới & gia hạn Voucher"),

  h2("5.2. Sản phẩm & Barcode"),
  p("4 chức năng:"),
  bullet("Điều chỉnh giá bán"),
  bullet("Thêm barcode cho sản phẩm có sẵn"),
  bullet("Tạo mã Shop (chung / riêng)"),
  bullet("Tạo mã hàng & nhập giá vốn"),

  h2("5.3. Tài khoản"),
  p("2 chức năng:"),
  bullet("Phân quyền người dùng"),
  bullet("Cấp tài khoản ESSXanh / ESSCAM"),

  h2("5.4. Kiosk & Khác"),
  p("2 chức năng:"),
  bullet("Cập nhật biểu mẫu gian hàng trên Kiosk tra cứu"),
  bullet("Yêu cầu khác từ Sense City"),

  h2("5.5. Khi nào cần điền Tên gian hàng + Mã gian hàng?"),
  p("Hai trường này CHỈ hiển thị khi chức năng VTD thuộc 1 trong 2 nhóm sau:"),
  numbered("Khuyến mãi (CTKM / PMH / Coupon / Voucher) — vì khuyến mãi thường gắn với 1 gian hàng cụ thể."),
  numbered("Sản phẩm & Barcode — vì điều chỉnh giá bán/barcode thường áp dụng cho 1 gian hàng cụ thể."),
  p("Các nhóm còn lại (Tài khoản, Kiosk & Khác, Sự cố hệ thống, Báo cáo…) sẽ KHÔNG hiện 2 trường này."),
  note("VD:", "Khi chọn 'Khuyến mãi > Phát hành phiếu mua hàng (PMH)', Anh/Chị điền 'VD: Gian hàng A1, Quầy thực phẩm' và mã 'VD: GH-A1, SC-001'."),

  /* ═══════════ 6. MÔ TẢ VẤN ĐỀ ═══════════ */
  h1("6. CÁCH VIẾT MÔ TẢ VẤN ĐỀ HIỆU QUẢ"),
  p("Mô tả tốt giúp Ban CNTT xử lý nhanh hơn 2–3 lần. Hệ thống đã gợi ý sẵn 4 câu hỏi để Anh/Chị trả lời:"),

  h2("6.1. Khung 4 câu hỏi"),
  numbered("Vấn đề xảy ra khi nào / ở đâu? — VD: Sáng nay lúc 9h, tại quầy thu ngân số 3, Sense Cần Thơ."),
  numbered("Thông báo lỗi cụ thể? — VD: 'Connection timeout' hoặc 'Lỗi 500 — Internal Server Error'. Chụp ảnh nếu được."),
  numbered("Các bước đã thực hiện? — VD: Đã khởi động lại máy 2 lần, đã kiểm tra mạng (Internet vẫn vào được)."),
  numbered("Ảnh hưởng đến công việc? — VD: Không thể tính tiền cho khách, đang ùn 5 khách tại quầy."),

  h2("6.2. So sánh — Mô tả TỐT và CHƯA TỐT"),

  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [Math.floor(CONTENT_WIDTH * 0.5), Math.floor(CONTENT_WIDTH * 0.5)],
    rows: [
      new TableRow({ tableHeader: true, children: [
        headerCell("❌ Mô tả CHƯA TỐT", Math.floor(CONTENT_WIDTH * 0.5)),
        headerCell("✅ Mô tả TỐT", Math.floor(CONTENT_WIDTH * 0.5))
      ]}),
      new TableRow({ children: [
        tableCell("Máy in không in được", { width: Math.floor(CONTENT_WIDTH * 0.5), shade: "FCEAEA" }),
        tableCell("Máy in HP LaserJet tại quầy 3 Sense Cần Thơ không in được hóa đơn từ 10h sáng nay. Đèn báo đỏ nháy 2 lần, không có thông báo lỗi trên màn hình. Đã thay giấy và mực, restart máy 1 lần, vẫn không in được. Hiện đang ảnh hưởng 2 quầy thu ngân.",
          { width: Math.floor(CONTENT_WIDTH * 0.5), shade: "EAF4E2" })
      ]}),
      new TableRow({ children: [
        tableCell("VTD bị lỗi", { width: Math.floor(CONTENT_WIDTH * 0.5), shade: "FCEAEA" }),
        tableCell("Không đăng nhập được vào VTD tại Sense Bến Tre, từ 14h ngày 27/05. Hiện 'Sai mật khẩu' khi nhập đúng (đã thử 2 tài khoản admin khác nhau). Mạng vẫn truy cập được các trang khác. Không ảnh hưởng quầy POS, chỉ không vào được backoffice.",
          { width: Math.floor(CONTENT_WIDTH * 0.5), shade: "EAF4E2" })
      ]}),
      new TableRow({ children: [
        tableCell("Cần cấp tài khoản", { width: Math.floor(CONTENT_WIDTH * 0.5), shade: "FCEAEA" }),
        tableCell("Cấp tài khoản ESSXanh cho nhân viên mới Nguyễn Văn A, MSNV 12345, phòng Kế toán Sense Cà Mau, ngày vào làm 28/05/2026. Vai trò: Kế toán viên (xem báo cáo, không xuất file).",
          { width: Math.floor(CONTENT_WIDTH * 0.5), shade: "EAF4E2" })
      ]})
    ]
  }),

  note("Nguyên tắc:", "Càng cụ thể (thời gian, địa điểm, mã thiết bị, thông báo lỗi, ảnh chụp), Ban CNTT càng xử lý nhanh. Không cần dài dòng — chỉ cần đủ thông tin."),

  /* ═══════════ 7. MỨC ĐỘ ƯU TIÊN ═══════════ */
  h1("7. CÁCH CHỌN MỨC ĐỘ ƯU TIÊN"),

  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [mm(30), mm(60), mm(80)],
    rows: [
      new TableRow({ tableHeader: true, children: [
        headerCell("Mức", mm(30)),
        headerCell("Ý nghĩa", mm(60)),
        headerCell("Khi nào dùng", mm(80))
      ]}),
      new TableRow({ children: [
        tableCell("THẤP", { width: mm(30), bold: true, color: GREEN, align: AlignmentType.CENTER }),
        tableCell("Không ảnh hưởng ngay đến công việc", { width: mm(60) }),
        tableCell("Yêu cầu hướng dẫn, đề xuất cải tiến, lỗi nhỏ không ảnh hưởng tác nghiệp.", { width: mm(80) })
      ]}),
      new TableRow({ children: [
        tableCell("TRUNG BÌNH", { width: mm(30), bold: true, color: "ED7D31", align: AlignmentType.CENTER }),
        tableCell("Ảnh hưởng một phần công việc", { width: mm(60) }),
        tableCell("Một thiết bị/chức năng không hoạt động nhưng vẫn có giải pháp tạm thời. Đây là mức mặc định.", { width: mm(80) })
      ]}),
      new TableRow({ children: [
        tableCell("CAO", { width: mm(30), bold: true, color: RED, align: AlignmentType.CENTER }),
        tableCell("Không thể làm việc", { width: mm(60) }),
        tableCell("Sự cố diện rộng: mất hệ thống VTD/POS toàn quầy, mất Internet, rò rỉ bảo mật, ảnh hưởng nhiều người.", { width: mm(80) })
      ]})
    ]
  }),
  p("Giao diện chọn mức ưu tiên trên form:"),
  ...shot('10-priority-radio.png', 'Hình 10 — Ba mức ưu tiên hiển thị trên form (Cao đang được chọn)'),
  warning("Chỉ chọn mức CAO khi thực sự cấp bách. Lạm dụng mức CAO sẽ làm chậm xử lý các yêu cầu khẩn cấp thật sự."),

  /* ═══════════ 8. ĐÍNH KÈM FILE ═══════════ */
  h1("8. ĐÍNH KÈM FILE"),
  h2("8.1. Loại file cho phép"),
  bullet("Ảnh: JPG, JPEG, PNG, GIF (chụp màn hình lỗi, ảnh thiết bị, ảnh hóa đơn…);"),
  bullet("Tài liệu: PDF, DOC, DOCX, XLS, XLSX, TXT;"),
  bullet("Nén: ZIP (khi cần gửi nhiều file logs hoặc tài liệu cùng lúc)."),
  ...shot('11-file-upload.png', 'Hình 11 — Khu vực đính kèm file: bấm chữ "chọn file" hoặc kéo thả vào ô'),

  h2("8.2. Giới hạn"),
  bullet("Tối đa 5 file/yêu cầu;"),
  bullet("Mỗi file không quá 10 MB;"),
  bullet("Tổng dung lượng không quá 50 MB."),

  h2("8.3. Mẹo đính kèm"),
  bullet("Chụp ảnh màn hình bằng phím Print Screen (Windows) hoặc Cmd+Shift+4 (macOS);"),
  bullet("Cắt gọn ảnh trước khi gửi để giảm dung lượng;"),
  bullet("Khi gửi nhiều ảnh, nén vào 1 file ZIP để gọn gàng."),

  /* ═══════════ 9. SLA ═══════════ */
  h1("9. CAM KẾT PHẢN HỒI (SLA)"),
  p("Thời gian phản hồi của Ban CNTT & CĐS tùy theo mức độ ưu tiên:"),

  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [mm(40), mm(60), mm(70)],
    rows: [
      new TableRow({ tableHeader: true, children: [
        headerCell("Mức ưu tiên", mm(40)),
        headerCell("Phản hồi đầu tiên", mm(60)),
        headerCell("Cam kết xử lý", mm(70))
      ]}),
      new TableRow({ children: [
        tableCell("Cao", { width: mm(40), bold: true, color: RED, align: AlignmentType.CENTER }),
        tableCell("Trong 30 phút (giờ hành chính)", { width: mm(60) }),
        tableCell("Trong 4 giờ làm việc hoặc theo thỏa thuận", { width: mm(70) })
      ]}),
      new TableRow({ children: [
        tableCell("Trung bình", { width: mm(40), bold: true, color: "ED7D31", align: AlignmentType.CENTER }),
        tableCell("Trong 2 giờ làm việc", { width: mm(60) }),
        tableCell("Trong 1 ngày làm việc", { width: mm(70) })
      ]}),
      new TableRow({ children: [
        tableCell("Thấp", { width: mm(40), bold: true, color: GREEN, align: AlignmentType.CENTER }),
        tableCell("Trong 1 ngày làm việc", { width: mm(60) }),
        tableCell("Trong 3 ngày làm việc", { width: mm(70) })
      ]})
    ]
  }),
  note("Lưu ý:", "Thời gian trên áp dụng trong giờ làm việc (8h–17h, Thứ Hai – Thứ Sáu). Yêu cầu gửi ngoài giờ sẽ tính từ đầu giờ làm việc tiếp theo."),

  /* ═══════════ 10. SAU KHI GỬI ═══════════ */
  h1("10. SAU KHI GỬI YÊU CẦU"),

  h2("10.1. Email xác nhận"),
  p("Ngay sau khi gửi, Anh/Chị nhận được email xác nhận từ Ban CNTT với:"),
  bullet("Mã ticket — VD: HD-2026-05-1234;"),
  bullet("Tóm tắt nội dung yêu cầu;"),
  bullet("Mức độ ưu tiên và thời gian dự kiến xử lý."),

  h2("10.2. Theo dõi tiến độ"),
  p("Mọi cập nhật về ticket (tiếp nhận, đang xử lý, đã giải quyết) đều được gửi qua email công ty đã đăng ký. Anh/Chị không cần đăng nhập vào hệ thống để xem trạng thái."),

  h2("10.3. Khi đã được xử lý"),
  bullet("Ban CNTT gửi email thông báo đã giải quyết kèm mô tả giải pháp;"),
  bullet("Nếu vấn đề chưa được giải quyết hoàn toàn, Anh/Chị trả lời email với từ khóa 'Chưa xong' kèm chi tiết để mở lại ticket;"),
  bullet("Sau 3 ngày làm việc không phản hồi, ticket tự động đóng."),

  /* ═══════════ 11. KHẨN CẤP ═══════════ */
  h1("11. HỖ TRỢ KHẨN CẤP"),

  h2("11.1. Trường hợp khẩn cấp"),
  bullet("Mất hệ thống POS/VTD toàn quầy khiến không bán hàng được;"),
  bullet("Mất Internet toàn đơn vị;"),
  bullet("Nghi ngờ bị tấn công mạng, ransomware, mã độc;"),
  bullet("Email công ty bị chiếm quyền, gửi thư rác;"),
  bullet("Lộ dữ liệu khách hàng/nhân sự."),

  h2("11.2. Cách xử lý khẩn cấp"),
  numbered("Gửi yêu cầu qua scid.vn/helpdesk với mức ưu tiên CAO (vẫn bắt buộc để có ticket truy vết);"),
  numbered("Đồng thời gọi điện trực tiếp đến đầu mối phụ trách CNTT đơn vị;"),
  numbered("Nếu sự cố bảo mật, NGẮT mạng/tắt máy ngay rồi mới báo (tránh lây lan)."),

  warning("Khi nghi ngờ tấn công mạng hoặc virus: KHÔNG cố tự xử lý, KHÔNG tắt máy đột ngột nếu chưa được hướng dẫn, KHÔNG mở các file/link đáng ngờ thêm lần nữa. Chụp ảnh màn hình lỗi rồi báo Ban CNTT."),

  /* ═══════════ 12. FAQ ═══════════ */
  h1("12. CÂU HỎI THƯỜNG GẶP (FAQ)"),

  h2("Q1. Em quên mật khẩu VTD, làm sao?"),
  p("Vào scid.vn/helpdesk → Loại dịch vụ: 'Bảo mật & Tài khoản' → 'Quên mật khẩu / Khóa tài khoản'. Ghi rõ tài khoản nào (VTD/ESSXanh/Email…), không ghi mật khẩu cũ."),

  h2("Q2. Em không nhận được email xác nhận?"),
  bullet("Kiểm tra hộp Thư rác (Spam/Junk);"),
  bullet("Kiểm tra email đã nhập có đúng không;"),
  bullet("Nếu vẫn không có sau 10 phút, gửi lại yêu cầu, ghi chú 'Lần 2 — Không nhận được email lần 1'."),

  h2("Q3. Em có thể gửi yêu cầu thay cho đồng nghiệp không?"),
  p("Có thể, nhưng nên gửi từ chính email của người có vấn đề để mọi cập nhật gửi đúng người. Trường hợp người đó không truy cập được email, Anh/Chị ghi rõ trong mô tả: 'Gửi thay cho [Tên — MSNV — Email] vì lý do…'."),

  h2("Q4. Bao lâu sau khi gửi thì Ban CNTT bắt đầu xử lý?"),
  p("Tùy mức độ ưu tiên — xem mục 9. Trong giờ làm việc, hầu hết yêu cầu được tiếp nhận trong vòng 30 phút."),

  h2("Q5. Em có thể chỉnh sửa yêu cầu sau khi gửi không?"),
  p("Không thể chỉnh sửa trực tiếp. Anh/Chị trả lời email xác nhận với bổ sung thông tin, Ban CNTT sẽ cập nhật vào ticket."),

  h2("Q6. Sau khi vấn đề được giải quyết, em có cần làm gì?"),
  p("Trả lời email kết thúc với 'OK, cảm ơn' để xác nhận. Nếu chưa giải quyết hoàn toàn, trả lời 'Chưa xong' kèm chi tiết để mở lại ticket."),

  h2("Q7. Tên gian hàng và Mã gian hàng là gì, lấy ở đâu?"),
  p("Tên gian hàng là tên niêm yết tại quầy (VD: 'Gian hàng A1', 'Quầy thực phẩm tươi sống'). Mã gian hàng là mã nội bộ in trên bảng quầy hoặc trong hệ thống quản lý gian hàng (VD: 'GH-A1', 'SC-001'). Nếu không rõ mã, để trống — Ban CNTT sẽ tra cứu."),

  /* ═══════════ 13. PHỤ LỤC ═══════════ */
  h1("13. PHỤ LỤC — BẢNG TRA CỨU NHANH"),

  h2("13.1. Tôi nên chọn loại dịch vụ nào?"),

  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [Math.floor(CONTENT_WIDTH * 0.55), Math.floor(CONTENT_WIDTH * 0.45)],
    rows: [
      new TableRow({ tableHeader: true, children: [
        headerCell("Vấn đề của tôi là…", Math.floor(CONTENT_WIDTH * 0.55)),
        headerCell("Chọn", Math.floor(CONTENT_WIDTH * 0.45))
      ]}),
      ...[
        ["Tạo chương trình khuyến mãi mới, phát hành PMH/Coupon", "VTD > Khuyến mãi > [chức năng cụ thể]"],
        ["Điều chỉnh giá bán, thêm barcode sản phẩm", "VTD > Sản phẩm & Barcode > [chức năng cụ thể]"],
        ["Cấp tài khoản ESSXanh/ESSCAM cho nhân viên mới", "VTD > Tài khoản > Cấp tài khoản ESSXanh / ESSCAM"],
        ["Phân quyền sử dụng VTD", "VTD > Tài khoản > Phân quyền người dùng"],
        ["VTD không vào được, treo, chậm", "VTD > Sự cố hệ thống"],
        ["Hỏi cách dùng VTD/Odoo", "VTD/Odoo > Hướng dẫn sử dụng"],
        ["Quên mật khẩu / Tài khoản bị khóa", "Bảo mật & Tài khoản > Quên mật khẩu / Khóa tài khoản"],
        ["Máy in không in được, giấy kẹt", "Thiết bị > Máy in & máy scan"],
        ["Wi-Fi/Internet chậm hoặc mất", "Mạng > Wi-Fi hoặc Đường truyền Internet"],
        ["Outlook lỗi, không gửi/nhận email được", "Microsoft 365 > Email & lịch (Outlook)"],
        ["Teams không vào họp được, lỗi chia sẻ màn hình", "Microsoft 365 > Microsoft Teams"],
        ["Cần cài đặt phần mềm mới", "Phần mềm > Cài đặt & cập nhật phần mềm"],
        ["Nghi ngờ email lừa đảo, click nhầm link", "Bảo mật & Tài khoản > Phishing / Email lừa đảo"],
        ["Nhân viên nghỉ việc, cần thu hồi tài khoản", "Bảo mật & Tài khoản > Thu hồi tài khoản"],
        ["Báo cáo Odoo/VTD bị lỗi hoặc cần báo cáo mới", "VTD/Odoo > Báo cáo & dữ liệu"]
      ].map(([problem, choice], i) => new TableRow({ children: [
        tableCell(problem, { width: Math.floor(CONTENT_WIDTH * 0.55), shade: i % 2 === 0 ? LIGHT_GREY : undefined }),
        tableCell(choice, { width: Math.floor(CONTENT_WIDTH * 0.45), shade: i % 2 === 0 ? LIGHT_GREY : undefined, bold: true })
      ]}))
    ]
  }),

  h2("13.2. Lịch sử ban hành"),

  new Table({
    width: { size: mm(160), type: WidthType.DXA },
    columnWidths: [mm(30), mm(35), mm(95)],
    rows: [
      new TableRow({ tableHeader: true, children: [
        headerCell("Phiên bản", mm(30)),
        headerCell("Ngày", mm(35)),
        headerCell("Mô tả", mm(95))
      ]}),
      new TableRow({ children: [
        tableCell("1.0", { width: mm(30), align: AlignmentType.CENTER, bold: true }),
        tableCell("27/05/2026", { width: mm(35), align: AlignmentType.CENTER }),
        tableCell("Phát hành lần đầu cho các đơn vị Sense.", { width: mm(95) })
      ]})
    ]
  }),

  new Paragraph({
    children: [new TextRun({ text: "— HẾT —", font: FONT, size: 22, italics: true, color: GREY })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 240 }
  }),
  new Paragraph({
    children: [new TextRun({ text: "Mọi góp ý về tài liệu, vui lòng gửi về Ban CNTT & CĐS qua scid.vn/helpdesk.", font: FONT, size: 20, italics: true, color: GREY })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120 }
  })
];

/* ─────────────── Helper: build category table ─────────────── */

function buildCategoryTable(rows) {
  const w0 = Math.floor(CONTENT_WIDTH * 0.35);
  const w1 = CONTENT_WIDTH - w0;
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [w0, w1],
    rows: [
      new TableRow({ tableHeader: true, children: [
        headerCell("Mục dịch vụ", w0),
        headerCell("Phạm vi áp dụng", w1)
      ]}),
      ...rows.map(([_key, name, desc], i) => new TableRow({ children: [
        tableCell(name, { width: w0, bold: true, shade: i % 2 === 0 ? LIGHT_GREY : undefined }),
        tableCell(desc, { width: w1, shade: i % 2 === 0 ? LIGHT_GREY : undefined })
      ]}))
    ]
  });
}

/* ─────────────── Build document ─────────────── */

const doc = new Document({
  creator: "Ban CNTT & CĐS — SCID",
  title: "Hướng dẫn sử dụng Hệ thống Helpdesk SCID",
  description: "Tài liệu ban hành cho các đơn vị Sense",
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 30, bold: true, color: BLUE },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 24, bold: true, color: BLUE },
        paragraph: { spacing: { before: 140, after: 60 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 22, bold: true },
        paragraph: { spacing: { before: 100, after: 40 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: A4_WIDTH, height: A4_HEIGHT },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Hướng dẫn sử dụng Hệ thống Helpdesk SCID", font: FONT, size: 18, color: GREY }),
            new TextRun({ text: "\t" }),
            new TextRun({ text: "v1.0 — 27/05/2026", font: FONT, size: 18, color: GREY })
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } }
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Ban CNTT & CĐS — SCID", font: FONT, size: 18, color: GREY }),
            new TextRun({ text: "\t" }),
            new TextRun({ text: "Trang ", font: FONT, size: 18, color: GREY }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: GREY }),
            new TextRun({ text: " / ", font: FONT, size: 18, color: GREY }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: GREY })
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } }
        })]
      })
    },
    children
  }]
});

/**
 * POST-PROCESS: Fix duplicate docPr/cNvPr IDs (docx-js v9.6 bug).
 * Without this fix, Word renders 0 images even though all PNG files are embedded.
 * Uses JSZip bundled with docx (no extra dependency).
 */
const JSZip = require(path.join(docxPath, 'node_modules', 'jszip'));

async function fixImageIds(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  let xml = await zip.file('word/document.xml').async('string');
  let i1 = 1, i2 = 1;
  const before = (xml.match(/<wp:docPr id="\d+"/g) || []).length;
  xml = xml.replace(/<wp:docPr id="\d+"/g, () => `<wp:docPr id="${i1++}"`);
  xml = xml.replace(/<pic:cNvPr id="\d+"/g, () => `<pic:cNvPr id="${i2++}"`);
  zip.file('word/document.xml', xml);
  console.log(`  Fixed ${before} duplicate docPr IDs → unique 1..${i1 - 1}`);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

Packer.toBuffer(doc).then(async (buffer) => {
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  const outPath = path.join(DIST_DIR, 'Huong-dan-su-dung-Helpdesk-SCID-v1.0.docx');
  const fixed = await fixImageIds(buffer);
  fs.writeFileSync(outPath, fixed);
  console.log("✓ Created:", outPath);
  console.log("  Size:", (fixed.length / 1024).toFixed(1), "KB");
}).catch(err => {
  console.error("✗ Error:", err.message);
  process.exit(1);
});
