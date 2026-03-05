const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'fit_cycle_app/.env' });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await connection.execute("SELECT id, name, unit, type FROM food_items WHERE type = 'custom' ORDER BY updated_at DESC LIMIT 5");
  console.log('Recent custom food items:');
  console.log(JSON.stringify(rows, null, 2));

  await connection.end();
}

check().catch(console.error);
