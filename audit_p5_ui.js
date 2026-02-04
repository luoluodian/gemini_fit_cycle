
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:10086/#/pages/plan/index';
const OUTPUT_DIR = 'docs/pj_docs/AUDIT_LOGS/P-5_Audit';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
  console.log('🚀 Starting P-5 UI Audit...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Console logging
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[Browser Error] ${err.message}`));

  // Mobile viewport (iPhone 12 Pro)
  await page.setViewportSize({ width: 390, height: 844 });

  try {
    // 1. Initial Load & Mock Setup
    console.log('📍 Navigating to Plan List Page...');
    
    // Mock API
    await page.route('**/diet-plans*', async route => {
      console.log('Intercepted diet-plans request');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: [
            {
              id: 1,
              name: 'UI审计测试计划',
              type: 'fat-loss',
              status: 'active',
              startDate: '2026-02-01',
              endDate: '2026-02-28',
              progress: 50,
              calories: 1800,
              protein: 120,
              fat: 50,
              carbs: 180
            },
            {
              id: 2,
              name: '已完成的历史计划',
              type: 'muscle-gain',
              status: 'completed',
              startDate: '2026-01-01',
              endDate: '2026-01-31',
              progress: 100
            }
          ],
          msg: 'success'
        })
      });
    });

    // Inject Fake Auth to bypass client-side checks
    await page.goto('http://localhost:10086/#/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'mock_token');
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); 
    
    // Check Status
    const url = page.url();
    console.log(`ℹ️ Current URL: ${url}`);
    const storage = await page.evaluate(() => JSON.stringify(localStorage));
    console.log(`ℹ️ LocalStorage: ${storage}`);
    
    // Check key elements
    const tabs = await page.$$('.nut-tab-pane'); // Adjust selector based on NutUI
    console.log(`ℹ️ Page loaded. Checking layout...`);
    
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_active_list.png') });
    console.log('📸 Screenshot saved: 01_active_list.png');

    // 2. Tab Switching
    console.log('📍 Switching to "Completed" Tab...');
    
    // Debug: Print page content if selector fails
    try {
      await page.waitForSelector('text=已完成', { state: 'visible', timeout: 5000 });
      await page.click('text=已完成');
    } catch (e) {
      console.log('⚠️ Selector text="已完成" failed. Dumping HTML...');
      // Print first 2000 chars of body
      const content = await page.content();
      console.log(content.substring(0, 2000));
      throw e;
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_completed_list.png') });
    console.log('📸 Screenshot saved: 02_completed_list.png');

    // 3. Open Create Modal
    console.log('📍 Testing Create Button...');
    const createBtn = await page.$('.floating-btn');
    if (createBtn) {
      await createBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03_create_modal.png') });
      console.log('📸 Screenshot saved: 03_create_modal.png');
      
      // Verify Modal Content
      const modalTitle = await page.textContent('.nut-popup .title'); // Adjust selector
      console.log(`ℹ️ Modal Title detected: "${modalTitle || 'Unknown'}"`);
    } else {
      console.error('❌ Create Button (.floating-btn) not found!');
    }

  } catch (error) {
    console.error('❌ Audit Failed:', error);
  } finally {
    await browser.close();
    console.log('🏁 Audit Complete.');
  }
})();
