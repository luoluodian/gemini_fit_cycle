# Food 模块数据库设计全书 (Food Module Database Specification)

本文件是对 `Food` 模块数据库结构的终极审计报告。包含了所有相关表的详尽字段说明、索引策略、关联关系及其背后的业务建模逻辑。

---

## 1. 食材基础库：`food_items` 表
存储所有“食材原型”，包括官方预设与用户自建。

### 1.1 字段详表
| 字段名 | 物理类型 | 约束 | 默认值 | 业务逻辑说明 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `bigint(20)` | `PK`, `unsigned`, `AI` | - | 全局唯一标识。 |
| `name` | `varchar(100)` | `NOT NULL` | - | 食材展示名。建立索引 `idx_name` 支持模糊搜索。 |
| `type` | `enum` | `NOT NULL` | `'system'` | `'system'`: 官方；`'custom'`: 用户私有。 |
| `user_id` | `bigint(20)` | `unsigned`, `nullable` | `NULL` | 创建者 ID。系统食材为 `NULL`。 |
| `category` | `enum` | `NOT NULL` | `'custom'` | 9 大核心分类（蛋白质、蔬菜等）。 |
| `calories` | `int(11)` | `NOT NULL` | `0` | **核心热量**。指每 `base_count` 基准量的能量 (kcal)。 |
| `protein` | `decimal(8,2)` | `NOT NULL` | `0.00` | 蛋白质 (g)。使用 `decimal` 规避浮点计算误差。 |
| `fat` | `decimal(8,2)` | `NOT NULL` | `0.00` | 脂肪 (g)。 |
| `carbs` | `decimal(8,2)` | `NOT NULL` | `0.00` | 碳水化合物 (g)。 |
| `base_count` | `decimal(8,2)` | `NOT NULL` | `100.00` | **营养基准**。定义上述营养素的基数（如 100g, 1个）。 |
| `unit` | `varchar(20)` | `NOT NULL` | `'g'` | 物理单位。如 `g`, `ml`, `piece`。 |
| `reference_count`| `int(11)` | `NOT NULL` | `0` | **引用计数**。累计在计划与打卡记录中的被引用次数。 |
| `is_archived` | `tinyint(1)` | `NOT NULL` | `0` | **逻辑下架**。若计数 > 0，删除操作将转为下架。 |
| `updated_at` | `datetime(6)` | - | `CURRENT` | 每次修改都会更新时间戳，用于触发快照同步。 |

### 1.2 索引策略
- `PRIMARY KEY (id)`
- `INDEX idx_archived_name (isArchived, name)`: **核心优化**。支持在过滤下架状态下的高性能搜索。
- `INDEX idx_category (category)`: 分类筛选维度。

---

## 2. 用户偏好库：`user_favorite_foods` 表
处理用户与食材的 M:N 关联。

### 2.1 字段详表
| 字段名 | 物理类型 | 约束 | 业务逻辑说明 |
| :--- | :--- | :--- | :--- |
| `id` | `bigint(20)` | `PK`, `unsigned`, `AI` | 收藏记录唯一 ID。 |
| `user_id` | `bigint(20)` | `NOT NULL` | 外键关联 `users.id`。 |
| `food_id` | `bigint(20)` | `NOT NULL` | 外键关联 `food_items.id`。 |

### 2.2 维护逻辑
- **引用增加**：用户收藏时，`food_items.reference_count` +1。
- **引用减少**：取消收藏时，`reference_count` -1。

---

## 3. 消费记录库：`meal_logs` 表
记录用户摄入的每一餐。此表对 `FoodItem` 进行了**快照式（Snapshot）**建模。

### 3.1 核心快照字段
为了应对源头数据变动，`meal_logs` 采用冗余存储策略：

| 字段名 | 物理类型 | 业务逻辑说明 |
| :--- | :--- | :--- |
| `food_id` | `bigint(20)` | 引用源食材。`onDelete: 'SET NULL'`。 |
| `base_count` | `int(11)` | 记录当时的营养基准。 |
| `base_calories` | `int(11)` | 记录当时的基准热量。 |
| `quantity` | `decimal(10,4)` | **摄入量**。用户实际摄入的数值。 |
| `source_updated_at`| `datetime(6)` | **同步标记**。记录快照时原食材的最后更新时间。 |

---

## 4. 基础设施：`data_dictionary` 表
提供全局枚举与逻辑配置。

### 4.1 单位维度治理 (Dimension Governance)
通过 `ext_info` 字段存储 JSON 配置：
- **示例数据**：
  ```json
  { "code": "g", "category": "unit", "ext_info": { "dimension": "weight" } }
  { "code": "ml", "category": "unit", "ext_info": { "dimension": "volume" } }
  ```
- **核心逻辑**：禁止跨维度计算。例如，食材定义单位为 `weight`，则录入时不允许选择 `volume` 维度的单位。

---

## 5. 计划系统：`plan_meal_items` 表
连接食材与饮食计划。

- **关系恢复**：明确关联 `FoodItem` 实体。
- **维护逻辑**：
    - **导入计划**：深拷贝 `DietPlan` 时，批量增加对应食材的 `reference_count`。
    - **同步打卡**：将计划同步至 `meal_logs` 时，增加 `reference_count` 并填充 `source_updated_at` 快照。

---

## 6. 核心建模哲学：为什么要这样设计？

### 6.1 为什么要进行“二次物理校验”？
NestJS 的 DTO 校验器在处理 `PATCH` 请求时无法感知未传入的原始字段。为了防止恶意利用局部更新绕过物理守恒（如只调大蛋白质却不调整基准重量），Service 层在持久化前必须进行合并后的全量逻辑核对。

### 6.2 为什么 `MealLog` 需要 `source_updated_at`?
解决了快照机制的“信息孤岛”问题。系统通过比对时间戳，能主动告知用户其历史记录使用的营养单价是否已“过时”，并提供一键同步到最新官方数据的能力。
