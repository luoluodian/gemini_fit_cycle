-- 04_seed_unit_dictionary.sql
-- 初始化单位数据字典

-- 先清理旧的单位数据（如果有）以防止重复
DELETE FROM `data_dictionary` WHERE `category` = 'unit';

INSERT INTO `data_dictionary` (`category`, `code`, `value`, `text`, `sort_order`, `description`, `ext_info`) VALUES
('unit', 'g', 1, '克', 1, '质量单位：克', '{"dimension": "mass", "base": 100}'),
('unit', 'kg', 2, '千克', 2, '质量单位：千克', '{"dimension": "mass", "base": 1}'),
('unit', 'ml', 3, '毫升', 3, '体积单位：毫升', '{"dimension": "volume", "base": 100}'),
('unit', 'l', 4, '升', 4, '体积单位：升', '{"dimension": "volume", "base": 1}'),
('unit', 'piece', 5, '个/片', 5, '数量单位：个或片', '{"dimension": "count", "base": 1}'),
('unit', 'bar', 6, '根/条', 6, '数量单位：根或条', '{"dimension": "count", "base": 1}'),
('unit', 'scoop', 7, '勺', 7, '数量单位：勺', '{"dimension": "count", "base": 1}'),
('unit', 'cup', 8, '杯', 8, '数量单位：杯', '{"dimension": "count", "base": 1}'),
('unit', 'tbsp', 9, '大勺', 9, '数量单位：大勺', '{"dimension": "count", "base": 1}');
