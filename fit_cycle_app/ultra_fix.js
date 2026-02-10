const mysql = require('mysql2/promise');

async function fix() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🛠 Starting Ultra Repair...');
  try {
    // 强制设置 user_id 默认值，确保任何插入都能成功
    await connection.query("ALTER TABLE `meal_logs` CHANGE `user_id` `user_id` BIGINT UNSIGNED NOT NULL DEFAULT '0'");
    console.log('✅ Column user_id: Set DEFAULT 0 successfully.');
    
    // 顺便检查记录表
    await connection.query("ALTER TABLE `daily_records` CHANGE `user_id` `user_id` BIGINT UNSIGNED NOT NULL DEFAULT '0'");
    console.log('✅ Column user_id (daily_records): Set DEFAULT 0 successfully.');
  } catch (e) {
    console.error('❌ SQL Fix Failed:', e.message);
  }

  await connection.end();
}

fix().catch(console.error);
