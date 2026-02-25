const mysql = require('mysql2/promise');

async function checkColumns() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🔍 Checking columns for meal_logs...');
  const [cols] = await connection.query("SHOW COLUMNS FROM `meal_logs` ");
  console.table(cols);
  
  await connection.end();
}

checkColumns().catch(console.error);