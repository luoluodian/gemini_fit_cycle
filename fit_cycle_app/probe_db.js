const mysql = require('mysql2/promise');

async function probe() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🔍 Probing MySQL Tables...');

  const tables = ['daily_records', 'meal_logs', 'data_dictionary'];
  
  for (const table of tables) {
    const [rows] = await connection.query("SHOW TABLES LIKE '" + table + "'");
    if (rows.length > 0) {
      console.log("✅ Table Found: " + table);
      if (table === 'data_dictionary') {
        const [cols] = await connection.query("SHOW COLUMNS FROM `data_dictionary` LIKE 'code'");
        console.log(cols.length > 0 ? '   - Field "code" exists.' : '   - Field "code" MISSING.');
      }
    } else {
      console.log("❌ Table MISSING: " + table);
    }
  }

  console.log('\n⚡ Attempting final Index reinforcement...');
  const applyIndex = async (tableName, indexName, columns) => {
    try {
      await connection.query("ALTER TABLE `" + tableName + "` ADD INDEX `" + indexName + "` (" + columns + ")");
      console.log("   + Index " + indexName + " added to " + tableName);
    } catch (e) {
      console.log("   ~ Index " + indexName + " state: " + (e.message.includes('Duplicate') ? 'Already exists' : e.message));
    }
  };

  const [drExists] = await connection.query("SHOW TABLES LIKE 'daily_records'");
  if (drExists.length > 0) await applyIndex('daily_records', 'idx_user_date', 'user_id, date');
  
  const [mlExists] = await connection.query("SHOW TABLES LIKE 'meal_logs'");
  if (mlExists.length > 0) await applyIndex('meal_logs', 'idx_user_record', 'user_id, record_id');

  console.log('\n🏁 Probe and reinforcement complete.');
  await connection.end();
}

probe().catch(console.error);