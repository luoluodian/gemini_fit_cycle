const mysql = require('mysql2/promise');

async function optimize() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🚀 Connected to MySQL. Starting optimization...');

  const tablesToDrop = [
    'badge', 'daily_checkin', 'daily_goal', 'meal_record', 
    'plan_detail', 'plan_template', 'reminder', 
    'template_comment', 'template_day', 'template_favorite', 
    'template_like', 'template_meal_item', 'template_meal', 'user_badge'
  ];

  for (const table of tablesToDrop) {
    try {
      await connection.query('DROP TABLE IF EXISTS `' + table + '`');
      console.log('✅ Dropped table: ' + table);
    } catch (e) {
      console.error('❌ Failed to drop ' + table + ':', e.message);
    }
  }

  console.log('\n🔍 Optimizing Indexes...');

  // MySQL 8.0 之前不支持 ADD INDEX IF NOT EXISTS，这里采用通用方案
  const applyIndex = async (tableName, indexName, columns) => {
    try {
      const [rows] = await connection.query(
        "SELECT COUNT(1) as hasIndex FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = 'fit_cycle' AND table_name = ? AND index_name = ?",
        [tableName, indexName]
      );
      if (rows[0].hasIndex === 0) {
        await connection.query('ALTER TABLE `' + tableName + '` ADD INDEX `' + indexName + '` (' + columns + ')');
        console.log('✅ Added index: ' + indexName);
      } else {
        console.log('ℹ️ Index ' + indexName + ' already exists.');
      }
    } catch (e) {
      console.warn('⚠️ Note on ' + indexName + ': ' + e.message);
    }
  };

  await applyIndex('daily_records', 'idx_user_date', 'user_id, date');
  await applyIndex('meal_logs', 'idx_user_record', 'user_id, record_id');
  await applyIndex('meal_logs', 'idx_user_meal_type', 'user_id, meal_type');

  console.log('\n🏁 Optimization finished.');
  await connection.end();
}

optimize().catch(console.error);