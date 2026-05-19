const { chromium } = require('playwright');
const { percySnapshot } = require('@percy/playwright');

(async () => {
  // Normalize site URL (remove trailing slash)
  const siteUrl = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');

  // Read pages input and support both literal \n and real line breaks
  const rawPages = process.env.PAGES || '';
  const normalizedPages = rawPages.replace(/\\n/g, '\n');

  const pages = normalizedPages
    .split(/\r?\n/)
    .map(p => p.trim())
    .filter(Boolean);

  console.log('Site URL:', siteUrl);
  console.log('Parsed Pages:', pages);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: {
      width: 1280,
      height: 720
    }
  });

  for (const path of pages) {
    // Ensure page path starts with /
    const cleanPath = path.startsWith('/') ? path : '/' + path;

    // Build full URL manually
    const fullUrl = siteUrl + cleanPath;

    // Create snapshot name
    const snapshotName =
      cleanPath === '/'
        ? 'home'
        : cleanPath
            .replace(/^\/|\/$/g, '')
            .replace(/[^\w-]+/g, '-');

    console.log('Opening:', fullUrl);
    console.log('Capturing snapshot:', snapshotName);

    await page.goto(fullUrl, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await percySnapshot(page, snapshotName);
  }

  await browser.close();

  console.log('All snapshots uploaded successfully.');
})();
