const puppeteer = require('puppeteer');

const routes = [
  '/',
  '/dashboard',
  '/my-farm',
  '/market-prices',
  '/schemes',
  '/crops',
  '/weather',
  '/community',
  '/soil-analysis'
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  for (const route of routes) {
    console.log(`\nTesting ${route}...`);
    const page = await browser.newPage();
    
    // Capture console errors
    page.on('pageerror', err => {
      console.log(`[ERROR on ${route}]: ${err.toString()}`);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[CONSOLE ERROR on ${route}]: ${msg.text()}`);
      }
    });

    try {
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0', timeout: 10000 });
      // Small delay to let any React effects run
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`[SUCCESS] ${route} loaded`);
    } catch (e) {
      console.log(`[TIMEOUT/FAIL on ${route}]: ${e.message}`);
    }
    
    await page.close();
  }
  
  await browser.close();
  console.log('\nTesting complete.');
})();
