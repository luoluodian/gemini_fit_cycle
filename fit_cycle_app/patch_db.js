const mysql = require('mysql2/promise');

async function fix() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🛠 Patching meal_logs table...');
  try {
    // 强制设置默认值以防御旧代码插入失败
    await connection.query("ALTER TABLE `meal_logs` MODIFY COLUMN `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 0");
    console.log('✅ Column user_id patched with default 0.');
  } catch (e) {
    console.error('❌ Patch failed:', e.message);
  }

  await connection.end();
}

fix().catch(console.error);
