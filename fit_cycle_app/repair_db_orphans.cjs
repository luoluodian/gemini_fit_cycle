const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'fit_cycle_app/.env' });

async function repair() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Connected to database.');

  try {
    // 1. 找出 daily_records 中 user_id 不在 users 表里的记录并删除
    console.log('Cleaning orphan daily_records...');
    const [result] = await connection.execute(`
      DELETE FROM daily_records 
      WHERE user_id NOT IN (SELECT id FROM users)
    `);
    console.log(`Deleted ${result.affectedRows} orphan records from daily_records.`);

    // 2. 同样的逻辑清理其他可能的表 (可选)
    // DELETE FROM diet_plans WHERE user_id NOT IN (SELECT id FROM users);
    
  } catch (error) {
    console.error('Repair failed:', error);
  } finally {
    await connection.end();
  }
}

repair();
