import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to simulate a mobile device (iPhone 12 Pro)
  await page.setViewportSize({ width: 390, height: 844 });

  console.log('Capturing UI prototype...');
  try {
    await page.goto('http://127.0.0.1:5500/html/profile.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    // Use clip to ensure same dimensions regardless of page content height
    await page.screenshot({ path: 'screenshot_prototype.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
    console.log('Prototype screenshot saved.');
  } catch (e) {
    console.error('Error capturing prototype:', e.message);
  }

  console.log('Capturing Frontend implementation...');
  try {
    await page.goto('http://localhost:10086/#/pages/profile/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); 
    await page.screenshot({ path: 'screenshot_implementation.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
    console.log('Implementation screenshot saved.');
  } catch (e) {
    console.error('Error capturing implementation:', e.message);
  }

  await browser.close();
  console.log('Screenshots saved.');
})();
