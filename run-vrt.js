const { chromium } = require('playwright');
const { percySnapshot } = require('@percy/playwright');

(async () => {
  const siteUrl = process.env.SITE_URL.trim();
  const rawPages = process.env.PAGES || '';

  console.log('Site URL:', siteUrl);
  console.log('Raw Pages Input:', JSON.stringify(rawPages));

  // Support both real new lines and literal \n sequences
  const normalizedPages = rawPages.replace(/\\n/g, '\n');

  const pages = normalizedPages
    .split(/\r?\n/)
    .map(p => p.trim())
    .filter(Boolean);

  console.log('Parsed Pages:', pages);

  const browser = await chromium.launch({ headless: true });
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
    console.log('Capturing snapshot:', snapshotName);

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await percySnapshot(page, snapshotName);
  }

  await browser.close();

  console.log('All snapshots uploaded successfully.');
})();
