-- 01_initial_schema.sql
-- 数据库初始化脚本
-- 基于: docs/pj_docs/04_接口与数据规约.md

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 用户域 (User Domain)

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `openid` VARCHAR(64) NOT NULL COMMENT '微信 OpenID',
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '用户昵称',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

-- 健康档案表
CREATE TABLE IF NOT EXISTS `health_profiles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  `gender` ENUM('male', 'female') DEFAULT 'male' COMMENT '性别',
  `height` DECIMAL(5, 2) DEFAULT NULL COMMENT '身高(cm)',
  `weight` DECIMAL(5, 2) DEFAULT NULL COMMENT '体重(kg)',
  `birthday` DATE DEFAULT NULL COMMENT '出生日期',
  `activity_level` DECIMAL(3, 2) DEFAULT 1.2 COMMENT '活动系数(1.2-1.9)',
  `bmr` INT DEFAULT NULL COMMENT '基础代谢率',
  `tdee` INT DEFAULT NULL COMMENT '每日总消耗',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户健康档案表';

-- 体重记录表
CREATE TABLE IF NOT EXISTS `user_weight_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  `weight` DECIMAL(5, 2) NOT NULL COMMENT '体重(kg)',
  `date` DATE NOT NULL COMMENT '记录日期',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_user_date` (`user_id`, `date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户体重记录表';

-- 2. 计划域 (Plan Domain)

-- 饮食计划表
CREATE TABLE IF NOT EXISTS `diet_plans` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联用户ID (模板为NULL)',
  `name` VARCHAR(100) NOT NULL COMMENT '计划名称',
  `description` TEXT DEFAULT NULL COMMENT '计划描述',
  `type` ENUM('fat-loss', 'muscle-gain', 'maintenance', 'custom', 'carb-cycle') NOT NULL COMMENT '计划类型',
  `status` ENUM('active', 'paused', 'completed', 'archived') DEFAULT 'active' COMMENT '状态',
  `is_template` BOOLEAN DEFAULT FALSE COMMENT '是否为系统模板',
  `cycle_days` INT DEFAULT 7 COMMENT '周期天数',
  `cycle_count` INT DEFAULT 1 COMMENT '循环次数',
  `start_date` DATE DEFAULT NULL COMMENT '开始日期',
  `carb_cycle_config` JSON DEFAULT NULL COMMENT '碳循环配置(JSON)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_user_status` (`user_id`, `status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='饮食计划表';

-- 计划模板详情表 (存储每日目标)
CREATE TABLE IF NOT EXISTS `plan_templates` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `plan_id` BIGINT UNSIGNED NOT NULL COMMENT '关联计划ID',
  `day_number` INT NOT NULL COMMENT '周期内第几天(1-cycle_days)',
  `target_calories` INT NOT NULL COMMENT '目标热量',
  `target_macros` JSON DEFAULT NULL COMMENT '目标宏量元素 {p, f, c}',
  `meals_config` JSON DEFAULT NULL COMMENT '预设餐单结构',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_plan_day` (`plan_id`, `day_number`),
  FOREIGN KEY (`plan_id`) REFERENCES `diet_plans`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='计划日模板详情表';

-- 3. 食材域 (Food Domain)

-- 食材表
CREATE TABLE IF NOT EXISTS `food_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '食材名称',
  `type` ENUM('system', 'custom') DEFAULT 'system' COMMENT '类型:系统/自定义',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建者ID(系统为NULL)',
  `category` ENUM('protein', 'vegetables', 'fruits', 'grains', 'dairy', 'nuts', 'oils', 'snacks', 'custom') DEFAULT 'custom' COMMENT '分类',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `image_url` VARCHAR(255) DEFAULT NULL COMMENT '图片或Emoji',
  `is_public` BOOLEAN DEFAULT FALSE COMMENT '是否公开',
  `calories` INT NOT NULL DEFAULT 0 COMMENT '热量(kcal/100g)',
  `protein` DECIMAL(8, 2) DEFAULT 0 COMMENT '蛋白质(g)',
  `fat` DECIMAL(8, 2) DEFAULT 0 COMMENT '脂肪(g)',
  `carbs` DECIMAL(8, 2) DEFAULT 0 COMMENT '碳水(g)',
  `unit` VARCHAR(20) DEFAULT 'g' COMMENT '计量单位',
  `tags` JSON DEFAULT NULL COMMENT '标签',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_name` (`name`),
  INDEX `idx_category` (`category`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='食材表';

-- 用户收藏食材表
CREATE TABLE IF NOT EXISTS `user_favorite_foods` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `food_id` BIGINT UNSIGNED NOT NULL COMMENT '食材ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY `uk_user_food` (`user_id`, `food_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户食材收藏表';

-- 4. 记录域 (Record Domain)

-- 每日记录主表 (快照)
CREATE TABLE IF NOT EXISTS `daily_records` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `date` DATE NOT NULL COMMENT '日期',
  `target_snapshot` JSON DEFAULT NULL COMMENT '当日目标快照',
  `plan_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联当时执行的计划ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY `uk_user_date` (`user_id`, `date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `diet_plans`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日饮食记录主表';

-- 饮食日志表 (每餐详情)
CREATE TABLE IF NOT EXISTS `meal_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `record_id` BIGINT UNSIGNED NOT NULL COMMENT '关联每日记录ID',
  `meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL COMMENT '餐次类型',
  `food_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '食材ID(可能为空如果已删除)',
  `food_name` VARCHAR(100) NOT NULL COMMENT '食材名称快照',
  `quantity` DECIMAL(8, 2) NOT NULL COMMENT '摄入数量',
  `unit` VARCHAR(20) NOT NULL COMMENT '单位',
  `calories` INT NOT NULL COMMENT '计算后的热量',
  `macros` JSON DEFAULT NULL COMMENT '计算后的宏量 {p, f, c}',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_record_meal` (`record_id`, `meal_type`),
  FOREIGN KEY (`record_id`) REFERENCES `daily_records`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='饮食日志详情表';

-- 5. 基础配置 (Infrastructure)

-- 数据字典表
CREATE TABLE IF NOT EXISTS `data_dictionary` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL COMMENT '分类Code',
  `code` VARCHAR(50) NOT NULL COMMENT '字典Code',
  `value` VARCHAR(100) NOT NULL COMMENT '字典值/显示名',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_cat_code` (`category`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通用数据字典表';

SET FOREIGN_KEY_CHECKS = 1;
