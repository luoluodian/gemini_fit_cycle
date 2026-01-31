-- 02_seed_dictionary.sql
-- 基础字典数据初始化

INSERT INTO `data_dictionary` (`category`, `code`, `value`, `sort_order`, `description`) VALUES
-- MealType
('meal_type', 'breakfast', '早餐', 1, '一日之计在于晨'),
('meal_type', 'lunch', '午餐', 2, '补充能量'),
('meal_type', 'dinner', '晚餐', 3, '清淡为主'),
('meal_type', 'snacks', '加餐', 4, '额外补充'),

-- FoodCategory
('food_category', 'protein', '蛋白质', 1, '肉蛋奶豆'),
('food_category', 'vegetables', '蔬菜', 2, '绿叶根茎'),
('food_category', 'fruits', '水果', 3, '浆果瓜果'),
('food_category', 'grains', '谷物', 4, '米面粮油'),
('food_category', 'dairy', '乳制品', 5, '牛奶酸奶'),
('food_category', 'nuts', '坚果', 6, '核桃杏仁'),
('food_category', 'oils', '油脂', 7, '烹饪用油'),
('food_category', 'snacks', '零食', 8, '加工食品'),
('food_category', 'custom', '自定义', 9, '用户自定义'),

-- PlanStatus
('plan_status', 'active', '进行中', 1, '当前正在执行'),
('plan_status', 'paused', '已暂停', 2, '暂时停止'),
('plan_status', 'completed', '已完成', 3, '计划结束'),
('plan_status', 'archived', '已归档', 4, '历史记录'),

-- Gender
('gender', 'male', '男', 1, NULL),
('gender', 'female', '女', 2, NULL),

-- PlanType
('plan_type', 'fat-loss', '减脂', 1, '低卡低脂'),
('plan_type', 'muscle-gain', '增肌', 2, '高蛋白高碳'),
('plan_type', 'maintenance', '维持', 3, '均衡饮食'),
('plan_type', 'custom', '自定义', 4, '自由配置'),
('plan_type', 'carb-cycle', '碳循环', 5, '高低碳交替');
