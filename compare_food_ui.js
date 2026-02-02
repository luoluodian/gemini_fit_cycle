import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 390, height: 844 });

  console.log('Capturing Food UI prototype...');
  try {
    await page.goto('http://127.0.0.1:5500/html/food.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshot_food_prototype.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
    console.log('Prototype screenshot saved.');
  } catch (e) {
    console.error('Error capturing prototype:', e.message);
  }

  console.log('Capturing Frontend implementation...');
  try {
    // Use 127.0.0.1
    await page.goto('http://127.0.0.1:10086/#/pages/food/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); 
    await page.screenshot({ path: 'screenshot_food_implementation.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
    console.log('Implementation screenshot saved.');
  } catch (e) {
    console.error('Error capturing implementation:', e.message);
  }

  await browser.close();
  console.log('Screenshots capture finished.');
})();