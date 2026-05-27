/**
 * Capture screenshots từ scid.vn/helpdesk.
 * V4: Simple — scroll element to top, take viewport screenshot, crop later if needed.
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// Screenshots are committed to ../huong-dan/_assets/ (used by both markdown + build.js)
const OUT_DIR = path.resolve(__dirname, '..', 'huong-dan', '_assets');
const URL = process.env.HELPDESK_URL || 'https://scid.vn/helpdesk';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: 1000, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1.5 });

  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2500);

  /* ─── Take viewport screenshot after scrolling element to top of viewport ─── */
  async function shotEl(name, selector, opts = {}) {
    const filename = path.join(OUT_DIR, name);
    // Scroll element to top with some padding
    const success = await page.evaluate((sel, offset) => {
      const e = document.querySelector(sel);
      if (!e) return false;
      const top = e.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
      return true;
    }, selector, opts.offset ?? 40);
    if (!success) {
      console.warn(`  ✗ Selector not found: ${selector}`);
      return null;
    }
    await sleep(500);
    // If viewport height override
    if (opts.height) {
      await page.setViewport({ width: 1000, height: opts.height, deviceScaleFactor: 1.5 });
      await sleep(300);
    }
    await page.screenshot({ path: filename, fullPage: false });
    const sizeKB = (fs.statSync(filename).size / 1024).toFixed(1);
    console.log(`  ✓ ${name} (${sizeKB} KB)`);
    // Reset viewport
    if (opts.height) {
      await page.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1.5 });
      await sleep(200);
    }
    return filename;
  }

  /* ═══════════ 1. Hero ═══════════ */
  console.log('\n[1] Hero greeting...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await shotEl('01-hero.png', '.fm-hero', { height: 500 });

  /* ═══════════ 2. Step 1 empty ═══════════ */
  console.log('\n[2] Step 1 empty...');
  await shotEl('02-step1-empty.png', '#fm-card-1', { height: 420 });

  /* ═══════════ 3. Step 1 filled ═══════════ */
  console.log('\n[3] Step 1 filled...');
  await page.type('#hd-name', 'Hồ Kim Yến', { delay: 20 });
  await page.type('#hd-email', 'yenhk@scid-jsc.com', { delay: 20 });
  await page.type('#hd-dept', 'Ban CNTT & CĐS', { delay: 20 });
  await page.select('#hd-unit', 'sense_cantho');
  await sleep(500);
  await shotEl('03-step1-filled.png', '#fm-card-1', { height: 420 });

  // Advance to step 2
  await page.click('#scid-hd-submit-btn');
  await sleep(1200);

  /* ═══════════ 4. Step 2 empty ═══════════ */
  console.log('\n[4] Step 2 — trigger button...');
  await shotEl('04-step2-empty.png', '#fm-card-2', { height: 340 });

  /* ═══════════ 5. Modal L1 ═══════════ */
  console.log('\n[5] Modal L1 — group cards...');
  await page.click('.hd-cat-trigger');
  await sleep(900);
  // Take full viewport (modal is overlay)
  await page.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1.5 });
  await sleep(200);
  await page.screenshot({ path: path.join(OUT_DIR, '05-modal-L1-groups.png') });
  console.log(`  ✓ 05-modal-L1-groups.png`);

  /* ═══════════ 6. Modal L2 ═══════════ */
  console.log('\n[6] Modal L2 — VTD services...');
  await page.evaluate(() => document.querySelectorAll('.hd-cat-gcard')[0]?.click());
  await sleep(800);
  await page.screenshot({ path: path.join(OUT_DIR, '06-modal-L2-VTD.png') });
  console.log(`  ✓ 06-modal-L2-VTD.png`);

  /* ═══════════ 7. Modal L3 ═══════════ */
  console.log('\n[7] Modal L3 — CTKM functions...');
  await page.evaluate(() => {
    const opts = document.querySelectorAll('.hd-cat-opt.has-children');
    if (opts[0]) opts[0].click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUT_DIR, '07-modal-L3-CTKM.png') });
  console.log(`  ✓ 07-modal-L3-CTKM.png`);

  /* ═══════════ 8. Step 2 + booth ═══════════ */
  console.log('\n[8] Step 2 with booth fields...');
  await page.evaluate(() => {
    const opts = document.querySelectorAll('.hd-cat-opt:not(.has-children)');
    if (opts[0]) opts[0].click();
  });
  await sleep(1500);
  await shotEl('08-step2-with-booth.png', '#fm-card-2', { height: 600 });

  /* ═══════════ 9. Step 3 full ═══════════ */
  console.log('\n[9] Step 3 — full content...');
  await page.type('#hd-booth-name', 'Gian hàng A1, Quầy thực phẩm', { delay: 20 });
  await page.type('#hd-booth-code', 'GH-A1', { delay: 20 });
  await page.click('#scid-hd-submit-btn');
  await sleep(1200);

  await page.type('#hd-desc',
    'Cần phát hành 100 phiếu mua hàng (PMH) trị giá 50.000đ cho gian hàng A1 (Quầy thực phẩm) tại Sense Cần Thơ.\n\n' +
    'Thời gian hiệu lực: từ 01/06 đến 30/06/2026\n' +
    'Điều kiện áp dụng: hóa đơn từ 500.000đ trở lên\n' +
    'Đã chuẩn bị file Excel danh sách khách hàng đính kèm bên dưới.',
    { delay: 4 });
  await page.evaluate(() => document.querySelector('#hd-p2')?.click());
  await sleep(500);
  await shotEl('09-step3-full.png', '#fm-card-3', { height: 900 });

  /* ═══════════ 10. Priority radio close-up ═══════════ */
  console.log('\n[10] Priority radio close-up...');
  await shotEl('10-priority-radio.png', '.hd-priority-wrap', { height: 280, offset: 60 });

  /* ═══════════ 11. File upload area ═══════════ */
  console.log('\n[11] File upload area...');
  await shotEl('11-file-upload.png', '#hd-upload-area', { height: 280, offset: 60 });

  /* ═══════════ 12. Sticky submit bar ═══════════ */
  console.log('\n[12] Sticky submit bar...');
  // Sticky is fixed at bottom — scroll to end of page to see it
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await sleep(500);
  await page.screenshot({ path: path.join(OUT_DIR, '12-sticky-bar.png') });
  console.log(`  ✓ 12-sticky-bar.png`);

  await browser.close();
  console.log('\n=== Done ===');
})().catch(err => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});
