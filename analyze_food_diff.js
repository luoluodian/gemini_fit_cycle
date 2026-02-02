import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

function compare(img1Path, img2Path, diffPath) {
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  console.log(`Comparison: ${img1Path} vs ${img2Path}`);
  console.log(`Different pixels: ${numDiffPixels}`);
  console.log(`Similarity: ${(1 - numDiffPixels / (width * height)) * 100}%`);
}

try {
  compare('screenshot_food_prototype.png', 'screenshot_food_implementation.png', 'diff_food.png');
} catch (e) {
  console.error('Error during comparison:', e.message);
}
