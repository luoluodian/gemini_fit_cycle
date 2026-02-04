import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const OUTPUT_DIR = 'docs/pj_docs/AUDIT_LOGS/UI_Compare_Food';
const PROTOTYPE_URL = 'http://127.0.0.1:5500/html/plan.html';
const IMPLEMENTATION_BASE = 'http://localhost:10086';
const IMPLEMENTATION_URL = `${IMPLEMENTATION_BASE}/#/pages/plan/index`;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Mock Data matching prototype
const MOCK_PLANS = {
  code: 200,
  data: [
    {
      id: "plan1",
      name: "6周减脂计划",
      type: "fat-loss",
      status: "active",
      startDate: "2026-01-16", // Adjusted to make "18 days left" relative to Feb 3
      endDate: "2026-02-21",
      calories: 1800,
      protein: 120,
      fat: 50,
      carbs: 180,
      progress: 40
    },
    {
      id: "plan2",
      name: "增肌训练计划",
      type: "muscle-gain",
      status: "paused",
      startDate: "2026-01-09",
      endDate: "2026-02-28", // Adjusted to make "25 days left" relative to Feb 3
      calories: 2200,
      protein: 150,
      fat: 60,
      carbs: 250,
      progress: 30
    },
    {
      id: "plan3",
      name: "21天轻断食",
      type: "fat-loss",
      status: "completed",
      startDate: "2024-10-25",
      endDate: "2024-11-15",
      progress: 100,
      createdAt: "2024-11-15" // For archived display if needed
    }
  ],
  msg: "success"
};

const MOCK_RECOMMENDED = {
  code: 200,
  data: [
    // Recommended plans are usually hardcoded in frontend component for now, 
    // but mocking just in case
  ],
  msg: "success"
};

(async () => {
  console.log('🚀 Starting P-5 Visual Comparison...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // iPhone 12 Pro Viewport
  await page.setViewportSize({ width: 390, height: 844 });

  try {
    // 1. Capture Prototype
    console.log('📸 Capturing Prototype UI...');
    await page.goto(PROTOTYPE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'prototype_plan.png') });
    console.log('✅ Prototype captured.');

    // 2. Capture Implementation
    console.log('📸 Capturing Implementation UI...');
    
    // Mock APIs
    await page.route('**/diet-plans?*', async route => {
      console.log('Intercepted GET plans');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PLANS)
      });
    });

    await page.route('**/diet-plans/recommended*', async route => {
       await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RECOMMENDED)
      });
    });

    // Inject Auth
    await page.goto(`${IMPLEMENTATION_BASE}/#/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4ODAwLCJleHAiOjE3NzA2OTM2MDB9.qkXf3Em3S8Ukb0452W1qgpy6ML7qH_65OEjYXmtDC8');
      localStorage.setItem('user_info', JSON.stringify({ id: 1, nickname: 'Tester' }));
    });

    // Mock ALL APIs to prevent any 401 or errors
    await page.route('**/api/**', async route => {
      const url = route.request().url();
      if (url.includes('diet-plans/recommended')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_RECOMMENDED) });
      } else if (url.includes('diet-plans')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PLANS) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: {}, msg: 'success' }) });
      }
    });

    // Navigate to Index First
    console.log(`Loading Index first...`);
    await page.goto(`${IMPLEMENTATION_BASE}/#/`, { waitUntil: 'networkidle' });
    
    // Ensure we are logged in
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4ODAwLCJleHAiOjE3NzA2OTM2MDB9.qkXf3Em3S8Ukb0452W1qgpy6ML7qH_65OEjYXmtDCk8');
    });

    // Find and Click Plan Tab
    console.log(`Attempting to click "Plan" Tab...`);
    try {
      // Find the "计划" button in the tabbar. Taro H5 tabbar items are often plain text or divs.
      const planTab = await page.locator('.taro-tabbar__item, .nut-tabbar-item, div').filter({ hasText: /^计划$/ }).first();
      await planTab.click();
      console.log('Clicked Plan Tab.');
      
      // Wait for the specific header text of Plan page
      await page.waitForSelector('text=管理你的健康目标', { timeout: 10000 });
      console.log('✅ Plan Page content detected.');
    } catch (e) {
      console.error('❌ Could not switch Tab or detect content:', e.message);
      // Fallback: direct goto
      console.log('Attempting direct goto as fallback...');
      await page.goto(IMPLEMENTATION_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);
    }
    
    // Final screenshot of Plan Page
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'implementation_plan.png') });
    console.log('✅ Implementation captured.');

    // TEST CLICK "新建"
    console.log('🧪 Testing "Create" button click...');
    try {
      // 查找 Header 上的“新建”按钮。
      const createBtn = await page.locator('text=新建').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        console.log('🖱️ Clicked "新建"');
        
        // Wait for modal animation
        await page.waitForTimeout(1000);
        
        // Check for modal content
        const modalVisible = await page.locator('text=创建新计划').isVisible();
        if (modalVisible) {
           console.log('✅ CreateOptionsModal appeared!');
           await page.screenshot({ path: path.join(OUTPUT_DIR, 'modal_opened.png') });
        } else {
           console.error('❌ CreateOptionsModal did NOT appear.');
           await page.screenshot({ path: path.join(OUTPUT_DIR, 'modal_fail.png') });
        }
        
        // Close modal to reset state (click overlay)
        await page.mouse.click(10, 10);
        await page.waitForTimeout(500);
      } else {
        console.error('❌ "新建" button not visible.');
      }
    } catch (e) {
      console.error('❌ Error testing create button:', e);
    }

    // 3. Compare Images
    console.log('🔍 Comparing images...');
    const img1 = PNG.sync.read(fs.readFileSync(path.join(OUTPUT_DIR, 'prototype_plan.png')));
    const img2 = PNG.sync.read(fs.readFileSync(path.join(OUTPUT_DIR, 'implementation_plan.png')));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    // Resize img2 if dimensions differ (simple crop/pad)
    if (img2.width !== width || img2.height !== height) {
      console.warn(`⚠️ Dimension mismatch: Prototype ${width}x${height}, Implementation ${img2.width}x${img2.height}`);
      // Usually Playwright screenshots match viewport, but page length might differ
    }

    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    const totalPixels = width * height;
    const mismatchRate = (numDiffPixels / totalPixels) * 100;
    const matchRate = 100 - mismatchRate;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'diff_plan.png'), PNG.sync.write(diff));

    console.log(`📊 Comparison Result: ${matchRate.toFixed(2)}% Match`);
    console.log(`❌ Diff Pixels: ${numDiffPixels}`);

    // Generate Report
    const reportContent = `# Visual Audit Report: P-5 Plan List

**Date**: ${new Date().toLocaleString()}
**Match Rate**: ${matchRate.toFixed(2)}%
**Requirement**: 99%

## Evidence
| Prototype | Implementation | Diff |
| :---: | :---: | :---: |
| ![Prototype](prototype_plan.png) | ![Implementation](implementation_plan.png) | ![Diff](diff_plan.png) |

## Analysis
- **Status**: ${matchRate >= 99 ? '✅ PASSED' : '⚠️ FAILED'}
- **Differences**: ${numDiffPixels} pixels differ.

## Notes
- If mismatch is high, check:
  - Font rendering (system fonts vs web fonts).
  - Dynamic content (dates, times).
  - Scrollbar visibility.
  - Padding/Margin subtleties.
`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'REPORT_PLAN.md'), reportContent);
    console.log('📝 Report generated.');

  } catch (error) {
    console.error('❌ Comparison Failed:', error);
  } finally {
    await browser.close();
  }
})();