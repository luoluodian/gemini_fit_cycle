-- 饮食计划小程序数据库表结构
-- 根据设计文档 V1.0 创建
-- 生成时间: 2026-01-15 12:14:09

-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  open_id VARCHAR(100) UNIQUE NOT NULL,
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  email VARCHAR(100),
  phone VARCHAR(20),
  gender_id INT,
  date_of_birth DATE,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  activity_level_id INT,
  goal_type_id INT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_open_id (open_id)
) COMMENT='用户表';

-- 食物表
CREATE TABLE foods (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  calories_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  protein_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  fat_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  carbs_per_100g DECIMAL(8,2) NOT NULL DEFAULT 0,
  gi DECIMAL(5,2) DEFAULT NULL,
  default_unit VARCHAR(20) DEFAULT 'g',
  image_url VARCHAR(255),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_category (category)
) COMMENT='食物表';

-- 饮食记录表
CREATE TABLE meal_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'g',
  recorded_date DATE NOT NULL,
  calories DECIMAL(8,2),
  protein DECIMAL(8,2),
  fat DECIMAL(8,2),
  carbs DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, recorded_date),
  UNIQUE KEY uk_user_food_date_meal (user_id, food_id, recorded_date, meal_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE RESTRICT
) COMMENT='饮食记录表';

-- 饮食计划表
CREATE TABLE plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  goal_type VARCHAR(20) NOT NULL,
  duration_days INT NOT NULL,
  daily_calories DECIMAL(8,2) NOT NULL,
  daily_protein DECIMAL(8,2) NOT NULL,
  daily_fat DECIMAL(8,2) NOT NULL,
  daily_carbs DECIMAL(8,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_status (user_id, status),
  UNIQUE KEY uk_user_active (user_id, is_active),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='饮食计划表';

-- 计划详情表
CREATE TABLE plan_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plan_id INT NOT NULL,
  day_number INT NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  food_id INT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'g',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_plan_day (plan_id, day_number),
  UNIQUE KEY uk_plan_day_meal_food (plan_id, day_number, meal_type, food_id),
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE RESTRICT
) COMMENT='计划详情表';

-- 每日目标表
CREATE TABLE daily_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  target_date DATE NOT NULL,
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(8,2) NOT NULL,
  fat DECIMAL(8,2) NOT NULL,
  carbs DECIMAL(8,2) NOT NULL,
  plan_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_date (user_id, target_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
) COMMENT='每日目标表';

-- 体重记录表
CREATE TABLE weight_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  record_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, record_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='体重记录表';

-- 每日打卡表
CREATE TABLE daily_checkins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_date (user_id, checkin_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='每日打卡表';

-- 运动记录表
CREATE TABLE exercise_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exercise_type VARCHAR(50) NOT NULL,
  duration_minutes INT NOT NULL,
  calories_burned DECIMAL(8,2),
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, log_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='运动记录表';

-- 数据字典表（保持现有结构）
CREATE TABLE IF NOT EXISTS data_dictionary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dict_type VARCHAR(50) NOT NULL,
  dict_code VARCHAR(50) NOT NULL,
  dict_value VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_type_code (dict_type, dict_code)
) COMMENT='数据字典表';

-- 插入基础数据字典数据
INSERT INTO data_dictionary (dict_type, dict_code, dict_value, sort_order) VALUES
('meal_type', 'breakfast', '早餐', 1),
('meal_type', 'lunch', '午餐', 2),
('meal_type', 'dinner', '晚餐', 3),
('meal_type', 'snack', '加餐', 4),
('plan_status', 'draft', '草稿', 1),
('plan_status', 'active', '进行中', 2),
('plan_status', 'paused', '已暂停', 3),
('plan_status', 'completed', '已完成', 4),
('plan_status', 'archived', '已归档', 5),
('activity_level', 'sedentary', '久坐', 1),
('activity_level', 'light', '轻度活动', 2),
('activity_level', 'moderate', '中度活动', 3),
('activity_level', 'active', '活跃', 4),
('activity_level', 'very_active', '非常活跃', 5),
('goal_type', 'lose_weight', '减重', 1),
('goal_type', 'gain_muscle', '增肌', 2),
('goal_type', 'maintain', '维持', 3);