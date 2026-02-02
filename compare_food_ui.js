import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import http from 'http';
import serveHandler from 'serve-handler';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const APP_URL = 'http://localhost:10086/#/pages/food/index';
const PROTOTYPE_PORT = 5500;
const PROTOTYPE_URL = `http://localhost:${PROTOTYPE_PORT}/food.html`;
const REPORT_DIR = path.join(process.cwd(), 'docs/pj_docs/AUDIT_LOGS/UI_Compare_Food');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');

// Ensure directories
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Start Static Server for Prototype
const server = http.createServer((request, response) => {
  return serveHandler(request, response, {
    public: path.join(process.cwd(), 'html'),
    headers: [
      { source: '**/*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] }
    ]
  });
});

server.listen(PROTOTYPE_PORT, async () => {
  console.log(`Prototype server running at ${PROTOTYPE_URL}`);
  await runComparison();
  server.close();
});

async function runComparison() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X/11/12/13 Mini
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const pageApp = await context.newPage();
  const pageProto = await context.newPage();

  const report = {
    mainView: {},
    modalView: {}
  };

  try {
    // 1. App Login & Navigate
    console.log('Navigating App...');
    await pageApp.goto('http://localhost:10086/#/pages/login/index');
    await pageApp.waitForLoadState('networkidle');
    const mockLoginBtn = pageApp.getByText('🛠️ 开发者入口: 点击 Mock 登录');
    if (await mockLoginBtn.isVisible()) {
        await mockLoginBtn.click();
        await pageApp.waitForTimeout(3000); // Wait for redirect
        
        // Navigate to Food Tab if not already there
        const foodTab = pageApp.getByText('食材', { exact: true }).last();
        if (await foodTab.isVisible()) {
            await foodTab.click();
            await pageApp.waitForTimeout(1000);
        } else {
            await pageApp.goto(APP_URL);
        }
        await pageApp.waitForLoadState('networkidle');
        await pageApp.waitForTimeout(2000); // Let animations settle
    } else {
        console.log('Already logged in or button missing? trying direct nav');
        await pageApp.goto(APP_URL);
        await pageApp.waitForLoadState('networkidle');
        await pageApp.waitForTimeout(2000);
    }

    // 2. Prototype Navigate
    console.log('Navigating Prototype...');
    await pageProto.goto(PROTOTYPE_URL);
    await pageProto.waitForLoadState('networkidle');
    await pageProto.waitForTimeout(1000);

    // 3. Screenshot Main View
    console.log('Capturing Main Views...');
    await pageApp.screenshot({ path: path.join(SCREENSHOT_DIR, 'app_main.png'), fullPage: false });
    await pageProto.screenshot({ path: path.join(SCREENSHOT_DIR, 'proto_main.png'), fullPage: false });
    
    report.mainView = compareImages('app_main.png', 'proto_main.png', 'diff_main.png');

    // 4. Open Modal (Food Detail)
    console.log('Opening Modals...');
    
    // App Modal: Click first food item in the list
    // The list items have class "active:bg-gray-50" or just look for text "kcal" parent
    // Use xpath to find the text "kcal" and click its parent's parent
    const appFoodItem = pageApp.locator('.text-sm.font-semibold.text-gray-800').first();
    if (await appFoodItem.isVisible()) {
        await appFoodItem.click();
        await pageApp.waitForTimeout(1000);
        await pageApp.screenshot({ path: path.join(SCREENSHOT_DIR, 'app_detail_modal.png') });
    }

    // Prototype Modal: Click first food card
    const protoFoodCard = pageProto.locator('.food-card').first();
    if (await protoFoodCard.isVisible()) {
        await protoFoodCard.click();
        await pageProto.waitForTimeout(1000);
        await pageProto.screenshot({ path: path.join(SCREENSHOT_DIR, 'proto_detail_modal.png') });
    }

    report.modalView = compareImages('app_detail_modal.png', 'proto_detail_modal.png', 'diff_detail_modal.png');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
    generateReport(report);
  }
}

function compareImages(img1Name, img2Name, diffName) {
    const img1Path = path.join(SCREENSHOT_DIR, img1Name);
    const img2Path = path.join(SCREENSHOT_DIR, img2Name);
    
    if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
        return { error: 'Missing screenshots' };
    }

    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    const totalPixels = width * height;
    const diffPercent = (numDiffPixels / totalPixels) * 100;

    fs.writeFileSync(path.join(SCREENSHOT_DIR, diffName), PNG.sync.write(diff));

    return {
        diffPixels: numDiffPixels,
        diffPercent: diffPercent.toFixed(2) + '%',
        match: (100 - (numDiffPixels / totalPixels) * 100).toFixed(2) + '%'
    };
}

function generateReport(data) {
    let md = '# UI Visual Audit: Food Module\n\n';
    md += `**Date:** ${new Date().toLocaleString()}\n\n`;
    
    md += '## 1. Main List View\n';
    md += `- **Match:** ${data.mainView.match || 'N/A'}\n`;
    md += `- **Diff:** ${data.mainView.diffPercent || 'N/A'}\n\n`;
    md += `| App Implementation | Prototype Design | Difference |\n`;
    md += `|---|---|---|\n`;
    md += `| ![App](./screenshots/app_main.png) | ![Proto](./screenshots/proto_main.png) | ![Diff](./screenshots/diff_main.png) |\n\n`;

    md += '## 2. Food Detail Modal\n';
    md += `- **Match:** ${data.modalView.match || 'N/A'}\n`;
    md += `- **Diff:** ${data.modalView.diffPercent || 'N/A'}\n\n`;
    md += `| App Implementation | Prototype Design | Difference |\n`;
    md += `|---|---|---|\n`;
    md += `| ![App](./screenshots/app_detail_modal.png) | ![Proto](./screenshots/proto_detail_modal.png) | ![Diff](./screenshots/diff_detail_modal.png) |\n\n`;

    const reportPath = path.join(process.cwd(), 'AUDIT_UI_FOOD.md');
    fs.writeFileSync(reportPath, md);
    console.log(`Report saved to ${reportPath}`);
}
