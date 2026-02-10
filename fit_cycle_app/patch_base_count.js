const mysql = require('mysql2/promise');

async function fixBaseCount() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🛠 Patching base_count for high-precision nutrition calculation...');
  try {
    // 物理增加 base_count 字段，默认 100
    await connection.query("ALTER TABLE `meal_logs` ADD COLUMN `base_count` INT NOT NULL DEFAULT 100 AFTER `unit` ");
    console.log('✅ Column base_count added to meal_logs.');
  } catch (e) {
    console.warn('⚠️ Note:', e.message);
  }

  await connection.end();
}

fixBaseCount().catch(console.error);
