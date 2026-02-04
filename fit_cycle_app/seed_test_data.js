
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Seeding basic dictionary data...');
  const mealTypes = [
    { category: 'MealType', value: 1, text: '早餐' },
    { category: 'MealType', value: 2, text: '午餐' },
    { category: 'MealType', value: 3, text: '晚餐' },
    { category: 'MealType', value: 4, text: '加餐' },
  ];

  for (const m of mealTypes) {
    await connection.execute(
      'INSERT INTO data_dictionary (category, value, text) VALUES (?, ?, ?)',
      [m.category, m.value, m.text]
    );
  }

  console.log('✅ Basic dictionary data seeded');
  await connection.end();
}

seed().catch(console.error);
