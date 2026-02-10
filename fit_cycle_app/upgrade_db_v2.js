const mysql = require('mysql2/promise');

async function upgrade() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🛠 Upgrading database for Record Status Machine...');
  try {
    // 增加 is_recorded 字段，默认为 true (1)
    await connection.query("ALTER TABLE `meal_logs` ADD COLUMN `is_recorded` BOOLEAN NOT NULL DEFAULT 1 AFTER `is_planned` ");
    console.log('✅ Column is_recorded added.');
  } catch (e) {
    console.warn('⚠️ Note:', e.message);
  }

  await connection.end();
}

upgrade().catch(console.error);
