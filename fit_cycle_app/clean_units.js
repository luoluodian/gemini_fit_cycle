const mysql = require('mysql2/promise');

async function cleanData() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🛠 Cleaning food_items.unit data...');
  try {
    // 物理去除 unit 中的 100g -> g, 100ml -> ml
    await connection.query("UPDATE `food_items` SET `unit` = 'g' WHERE `unit` = '100g'");
    await connection.query("UPDATE `food_items` SET `unit` = 'ml' WHERE `unit` = '100ml'");
    
    // 同时也清理已有的记录明细
    await connection.query("UPDATE `meal_logs` SET `unit` = 'g' WHERE `unit` = '100g'");
    await connection.query("UPDATE `meal_logs` SET `unit` = 'ml' WHERE `unit` = '100ml'");
    
    console.log('✅ Data cleaning complete.');
  } catch (e) {
    console.error('❌ Data cleaning failed:', e.message);
  }

  await connection.end();
}

cleanData().catch(console.error);
