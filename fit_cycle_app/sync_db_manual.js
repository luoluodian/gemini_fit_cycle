
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTable() {
  console.log('Connecting to database...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected!');

    const createFoodItemsSQL = "CREATE TABLE IF NOT EXISTS `food_items` (" +
      "`id` int NOT NULL AUTO_INCREMENT," +
      "`name` varchar(100) NOT NULL," +
      "`type` enum('system','custom') NOT NULL DEFAULT 'system'," +
      "`user_id` int DEFAULT NULL," +
      "`category` varchar(50) NOT NULL COMMENT 'Category enum string'," +
      "`description` varchar(255) DEFAULT NULL," +
      "`image_url` varchar(255) DEFAULT NULL," +
      "`is_public` tinyint NOT NULL DEFAULT '0'," +
      "`calories` int NOT NULL DEFAULT '0'," +
      "`protein` decimal(5,1) NOT NULL DEFAULT '0.0'," +
      "`fat` decimal(5,1) NOT NULL DEFAULT '0.0'," +
      "`carbs` decimal(5,1) NOT NULL DEFAULT '0.0'," +
      "`unit` varchar(20) NOT NULL DEFAULT 'g'," +
      "`tags` json DEFAULT NULL," +
      "`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)," +
      "`updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)," +
      "PRIMARY KEY (`id`)," +
      "KEY `IDX_food_name` (`name`)," +
      "KEY `FK_food_user` (`user_id`)," +
      "CONSTRAINT `FK_food_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    const createFavFoodsSQL = "CREATE TABLE IF NOT EXISTS `user_favorite_foods` (" +
      "`id` int NOT NULL AUTO_INCREMENT," +
      "`user_id` int NOT NULL," +
      "`food_id` int NOT NULL," +
      "`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)," +
      "PRIMARY KEY (`id`)," +
      "KEY `FK_fav_user` (`user_id`)," +
      "KEY `FK_fav_food` (`food_id`)," +
      "CONSTRAINT `FK_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE," +
      "CONSTRAINT `FK_fav_food` FOREIGN KEY (`food_id`) REFERENCES `food_items` (`id`) ON DELETE CASCADE" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    console.log('Creating table food_items...');
    await connection.execute(createFoodItemsSQL);
    
    console.log('Creating table user_favorite_foods...');
    await connection.execute(createFavFoodsSQL);

    console.log('Tables created successfully!');

    // Add deleted_at column if missing (for existing table)
    try {
        console.log('Checking deleted_at column...');
        await connection.execute("ALTER TABLE `food_items` ADD COLUMN `deleted_at` datetime(6) DEFAULT NULL;");
        console.log('Added deleted_at column.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('deleted_at already exists.');
        } else {
            console.error('Error adding deleted_at:', e);
        }
    }

    // Insert sample data
    const insertSampleSQL = "INSERT IGNORE INTO `food_items` (`id`, `name`, `type`, `category`, `calories`, `protein`, `fat`, `carbs`, `unit`, `is_public`) VALUES " +
      "(1, '鸡胸肉', 'system', 'protein', 165, 31.0, 3.6, 0.0, '100g', 1);";
      
    console.log('Inserting sample food...');
    await connection.execute(insertSampleSQL);

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

createTable();
