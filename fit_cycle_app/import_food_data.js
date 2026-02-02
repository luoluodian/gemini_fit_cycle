
const mysql = require('mysql2/promise');
require('dotenv').config();

const foodDatabase = {
  protein: [
    { name: "鸡胸肉", emoji: "🥩", calories: 165, protein: 31, fat: 3.6, carbs: 0, unit: "100g", description: "高蛋白，低脂肪的优质蛋白质来源", category: "protein" },
    { name: "三文鱼", emoji: "🐟", calories: 208, protein: 25, fat: 12, carbs: 0, unit: "100g", description: "富含Omega-3脂肪酸的优质鱼类", category: "protein" },
    { name: "金枪鱼", emoji: "🐟", calories: 184, protein: 30, fat: 6, carbs: 0, unit: "100g", description: "高蛋白，低脂肪的海鱼", category: "protein" },
  ],
  vegetables: [
    { name: "西兰花", emoji: "🥬", calories: 35, protein: 2.8, fat: 0.4, carbs: 7, unit: "100g", description: "维生素C和纤维素丰富的绿色蔬菜", category: "vegetables" },
    { name: "胡萝卜", emoji: "🥕", calories: 41, protein: 0.9, fat: 0.2, carbs: 10, unit: "100g", description: "富含β-胡萝卜素的健康蔬菜", category: "vegetables" },
    { name: "菠菜", emoji: "🥬", calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, unit: "100g", description: "铁质丰富的绿叶蔬菜", category: "vegetables" },
  ],
  fruits: [
    { name: "苹果", emoji: "🍎", calories: 52, protein: 0.3, fat: 0.2, carbs: 14, unit: "100g", description: "膳食纤维丰富的健康水果", category: "fruits" },
    { name: "香蕉", emoji: "🍌", calories: 89, protein: 1.1, fat: 0.3, carbs: 23, unit: "100g", description: "钾元素丰富的能量水果", category: "fruits" },
    { name: "蓝莓", emoji: "🫐", calories: 57, protein: 0.7, fat: 0.3, carbs: 14, unit: "100g", description: "抗氧化剂丰富的小浆果", category: "fruits" },
  ],
  grains: [
    { name: "糙米饭", emoji: "🍚", calories: 111, protein: 2.6, fat: 0.9, carbs: 23, unit: "100g", description: "全谷物，富含膳食纤维", category: "grains" },
    { name: "燕麦", emoji: "🌾", calories: 389, protein: 17, fat: 7, carbs: 66, unit: "100g", description: "营养丰富的全谷物", category: "grains" },
    { name: "藜麦", emoji: "🌾", calories: 368, protein: 14, fat: 6, carbs: 64, unit: "100g", description: "完全蛋白质的超级谷物", category: "grains" },
  ],
  dairy: [
    { name: "牛奶", emoji: "🥛", calories: 42, protein: 3.4, fat: 1, carbs: 5, unit: "100ml", description: "钙质丰富的乳制品", category: "dairy" },
    { name: "酸奶", emoji: "🥛", calories: 59, protein: 10, fat: 0.4, carbs: 3.6, unit: "100g", description: "益生菌丰富的发酵乳制品", category: "dairy" },
    { name: "奶酪", emoji: "🧀", calories: 113, protein: 7, fat: 9, carbs: 1, unit: "28g", description: "浓缩的乳制品蛋白质", category: "dairy" },
  ],
  nuts: [
    { name: "杏仁", emoji: "🥜", calories: 579, protein: 21, fat: 50, carbs: 22, unit: "100g", description: "维生素E丰富的不饱和脂肪", category: "nuts" },
    { name: "核桃", emoji: "🥜", calories: 654, protein: 15, fat: 65, carbs: 14, unit: "100g", description: "Omega-3脂肪酸丰富的坚果", category: "nuts" },
    { name: "腰果", emoji: "🥜", calories: 553, protein: 18, fat: 44, carbs: 30, unit: "100g", description: "矿物质丰富的坚果", category: "nuts" },
  ],
  oils: [
    { name: "橄榄油", emoji: "🫒", calories: 884, protein: 0, fat: 100, carbs: 0, unit: "100ml", description: "单不饱和脂肪酸的健康油脂", category: "oils" },
    { name: "椰子油", emoji: "🥥", calories: 862, protein: 0, fat: 100, carbs: 0, unit: "100ml", description: "中链脂肪酸的特殊油脂", category: "oils" },
  ],
};

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Connected to DB');

  // Clear existing system foods
  await connection.execute("DELETE FROM food_items WHERE type = 'system'");
  console.log('Cleared existing system foods');

  const insertSQL = "INSERT INTO food_items (name, image_url, calories, protein, fat, carbs, unit, description, category, type, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'system', 1)";

  for (const cat in foodDatabase) {
    for (const food of foodDatabase[cat]) {
      await connection.execute(insertSQL, [
        food.name,
        food.emoji,
        food.calories,
        food.protein,
        food.fat,
        food.carbs,
        food.unit,
        food.description,
        food.category
      ]);
      console.log(`Imported: ${food.name}`);
    }
  }

  await connection.end();
  console.log('Done');
}

main().catch(console.error);
