const { chromium } = require('playwright');
const percySnapshot = require('@percy/playwright');

(async () => {
  const siteUrl = process.env.SITE_URL;
  const pages = process.env.PAGES.split('\n').filter(Boolean);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const path of pages) {
    const url = new URL(path, siteUrl).toString();
    await page.goto(url, { waitUntil: 'networkidle' });
    await percySnapshot(page, path.replace(/\W+/g, '-') || 'home');
  }

  await browser.close();
})();
