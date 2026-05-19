const { chromium } = require('playwright');
const { percySnapshot } = require('@percy/playwright');

(async () => {
  const siteUrl = process.env.SITE_URL.trim();

  // Split safely for both Windows and Linux line endings
  const pages = process.env.PAGES
    .split(/\r?\n/)
    .map(p => p.trim())
    .filter(Boolean);

  console.log('Site URL:', siteUrl);
  console.log('Pages:', pages);

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1280,
      height: 720
    }
  });

  for (const path of pages) {
    const url = new URL(path, siteUrl).toString();

    const snapshotName =
      path === '/'
        ? 'home'
        : path.replace(/^\/|\/$/g, '').replace(/[^\w-]+/g, '-');

    console.log('Opening:', url);

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log('Capturing snapshot:', snapshotName);

    await percySnapshot(page, snapshotName);
  }

  await browser.close();

  console.log('All snapshots uploaded successfully.');
})();
