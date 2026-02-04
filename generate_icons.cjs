
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const TARGET_DIR = 'fit_cycle_web/src/static/tabs';
const COLORS = {
  home: { r: 255, g: 0, b: 0 },      // Red
  plan: { r: 0, g: 255, b: 0 },      // Green
  food: { r: 0, g: 0, b: 255 },      // Blue
  user: { r: 255, g: 255, b: 0 }     // Yellow
};

const FILES = [
  'home.png', 'home_active.png',
  'plan.png', 'plan_active.png',
  'food.png', 'food_active.png',
  'user.png', 'user_active.png'
];

FILES.forEach(file => {
  const png = new PNG({ width: 48, height: 48 });
  const key = file.split('_')[0].replace('.png', '');
  const color = COLORS[key] || { r: 128, g: 128, b: 128 };
  const isActive = file.includes('active');

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      
      // Simple circle
      const cx = 24, cy = 24, r = 20;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      if (dist < r) {
        png.data[idx] = color.r;
        png.data[idx + 1] = color.g;
        png.data[idx + 2] = color.b;
        png.data[idx + 3] = isActive ? 255 : 128; // Active: opaque, Inactive: semi-transparent
      } else {
        png.data[idx + 3] = 0; // Transparent background
      }
    }
  }

  const filePath = path.join(TARGET_DIR, file);
  png.pack().pipe(fs.createWriteStream(filePath))
    .on('finish', () => console.log(`Generated ${file}`));
});
