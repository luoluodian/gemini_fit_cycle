import { chromium } from 'playwright';

(async () => {
  // Use a persistent context to try and avoid some issues, and launch headless for speed/stability
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, // Simulate retina display often used on mobile
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  console.log('Capturing UI prototype...');
  try {
    // Attempt to access 127.0.0.1 directly to bypass potential localhost resolution issues
    await page.goto('http://127.0.0.1:5500/html/profile.html', { waitUntil: 'networkidle', timeout: 60000 });
    // Wait explicitly for a bit to ensure animations settle
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshot_prototype.png', fullPage: true });
    console.log('Prototype screenshot saved.');
  } catch (e) {
    console.error('Error capturing prototype:', e.message);
    // Fallback: try capturing whatever loaded if timeout occurred
    try {
        await page.screenshot({ path: 'screenshot_prototype_fallback.png', fullPage: true });
        console.log('Fallback prototype screenshot saved.');
    } catch (fallbackError) {
        console.error('Even fallback screenshot failed:', fallbackError.message);
    }
  }

  console.log('Capturing Frontend implementation...');
  try {
    // Accessing the H5 dev server
    await page.goto('http://127.0.0.1:10086/#/pages/profile/index', { waitUntil: 'networkidle', timeout: 60000 });
    // Important: Wait for client-side hydration and any potential transitions
    await page.waitForTimeout(5000); 
    await page.screenshot({ path: 'screenshot_implementation.png', fullPage: true });
    console.log('Implementation screenshot saved.');
  } catch (e) {
    console.error('Error capturing implementation:', e.message);
     try {
        await page.screenshot({ path: 'screenshot_implementation_fallback.png', fullPage: true });
        console.log('Fallback implementation screenshot saved.');
    } catch (fallbackError) {
        console.error('Even fallback screenshot failed:', fallbackError.message);
    }
  }

  await browser.close();
  console.log('Screenshots capture process finished.');
})();
