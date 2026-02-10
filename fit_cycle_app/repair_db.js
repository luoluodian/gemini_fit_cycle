const mysql = require('mysql2/promise');

async function repair() {
  const connection = await mysql.createConnection({
    host: "120.26.103.157",
    user: "cluoc",
    password: "Qq123456!#**",
    database: "fit_cycle"
  });

  console.log('🛠 Starting Database Physical Repair...');

  // 1. 修复数据字典字段
  try {
    const [cols] = await connection.query("SHOW COLUMNS FROM `data_dictionary` LIKE 'code'");
    if (cols.length === 0) {
      await connection.query("ALTER TABLE `data_dictionary` ADD COLUMN `code` VARCHAR(50) AFTER `category` ");
      await connection.query("ALTER TABLE `data_dictionary` ADD UNIQUE INDEX `idx_category_code` (`category`, `code`) ");
      console.log('✅ Added "code" column to data_dictionary.');
    }
  } catch (e) { console.error('❌ Dict Repair Failed:', e.message); }

  // 2. 手动创建 daily_records
  const createDailyRecords = "CREATE TABLE IF NOT EXISTS `daily_records` (" +
      "`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT," +
      "`user_id` BIGINT UNSIGNED NOT NULL," +
      "`date` DATE NOT NULL," +
      "`target_calories` INT NOT NULL DEFAULT 0," +
      "`target_protein` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`target_fat` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`target_carbs` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`plan_id` BIGINT UNSIGNED NULL," +
      "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
      "`deleted_at` TIMESTAMP NULL," +
      "PRIMARY KEY (`id`)," +
      "UNIQUE INDEX `idx_user_date` (`user_id`, `date`)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

  // 3. 手动创建 meal_logs
  const createMealLogs = "CREATE TABLE IF NOT EXISTS `meal_logs` (" +
      "`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT," +
      "`user_id` BIGINT UNSIGNED NOT NULL," +
      "`record_id` BIGINT UNSIGNED NOT NULL," +
      "`meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL," +
      "`food_id` BIGINT UNSIGNED NULL," +
      "`food_name` VARCHAR(100) NOT NULL," +
      "`custom_name` VARCHAR(255) NULL," +
      "`quantity` DECIMAL(10,4) NOT NULL," +
      "`unit` VARCHAR(20) NOT NULL," +
      "`calories` INT NOT NULL DEFAULT 0," +
      "`protein` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`fat` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`carbs` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`base_calories` INT NOT NULL DEFAULT 0," +
      "`base_protein` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`base_fat` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`base_carbs` DECIMAL(10,4) NOT NULL DEFAULT 0," +
      "`is_planned` BOOLEAN NOT NULL DEFAULT 0," +
      "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
      "`deleted_at` TIMESTAMP NULL," +
      "PRIMARY KEY (`id`)," +
      "INDEX `idx_user_record` (`user_id`, `record_id`)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

  try {
    await connection.query(createDailyRecords);
    console.log('✅ Table daily_records created.');
    await connection.query(createMealLogs);
    console.log('✅ Table meal_logs created.');
  } catch (e) { console.error('❌ Table Creation Failed:', e.message); }

  console.log('\n🏁 Physical repair finished.');
  await connection.end();
}

repair().catch(console.error);