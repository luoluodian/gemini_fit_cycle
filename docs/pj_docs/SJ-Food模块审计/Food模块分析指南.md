# Food 模块分析指南 (Food Module Comprehensive Analysis Guide)

本指南为开发者提供 `Food` (食材) 模块的全栈技术索引，涵盖从底层数据库建模、业务逻辑计算到前端 UI 交互的实现细节，阐释其“高内核、高可用”的设计逻辑。

---

## 1. 核心架构与设计哲学

Food 模块的核心设计目标是：**数据精度（营养学严谨性）** 与 **交互灵活性（用户自定义能力）** 的统一。

- **混合数据源**：官方食材 (System) 提供权威数据，用户食材 (Custom) 提供个性化扩展。
- **维度锁定**：通过数据字典定义单位维度（重量/体积/计数），强制计算逻辑在同一物理尺度内流转。
- **原子化营养属性**：所有食材基于“基准值”存储，结合“快照机制”确保历史数据不可篡改。

---

## 2. 数据库建模与资产索引

Food 模块的数据设计遵循 **“原型库 + 关系表 + 快照记录”** 的三层架构。详细的字段定义、索引策略与 DDL 说明请参阅：[Food 模块数据库设计全书](./Food模块数据库设计全书.md)。

### 2.1 数据层级概览
1. **食材主库 (`food_items`)**：存储食材的物理原型。
    - **逻辑下架**：引入 `isArchived` 字段。若食材被引用过，删除操作将转为下架，保障存量引用的稳定性。
    - **社交治理**：通过 `referenceCount` 追踪食材在计划、打卡中的活跃度。
2. **用户收藏 (`user_favorite_foods`)**：处理 M:N 关联。核心约束为 `Unique(['userId', 'foodId'])`。
3. **快照记录 (`meal_logs`)**：**关键逻辑**。当食材进入饮食记录时，系统会冗余存储当时的营养单价及 `sourceUpdatedAt` 时间戳。

### 2.2 核心设计哲学
- **精度保障**：全线使用 `decimal` 存储营养素，配合 TypeORM Transformer 解决 JS 浮点数计算尾差问题。
- **数据闭环**：`MealLog` 对食材采用 `SET NULL` 级联策略，即便源食材被物理删除，历史饮食数据依然具有可追溯性（通过冗余的 `food_name` 字段）。

---

## 3. 营养学逻辑计算索引

### 3.1 动态营养价值计算公式
在前端 `FoodDetailModal.vue` 中，实时显示的营养数值由以下公式驱动：
$$ \text{DisplayValue} = \text{BaseAttribute} \times \left( \frac{\text{LocalQuantity}}{\text{BaseCount}} \right) $$

- **实现逻辑**：
  - `BaseAttribute`: 食材记录中的原始营养值（如 100g 含有 31g 蛋白质）。
  - `LocalQuantity`: 用户在步进器 (`QuantityStepper`) 中选择的摄入量。
  - `BaseCount`: 该食材定义的基准基数。

### 3.2 物理与热量双重校验 (Validation)
在自建/更新食材时，执行严格的逻辑拦截：
- **物理平衡**：`protein + fat + carbs <= baseCount`。从物理常识层面杜绝虚假数据。
- **热量校验**：对比输入热量与理论热量 $Q_{\text{theory}} = (P \times 4) + (F \times 9) + (C \times 4)$。若差异较大（$> 10\%$ 且 $> 15\text{kcal}$），触发警告。

---

## 4. 前端组件与交互架构

### 4.1 核心组件职责
- **`FoodPicker.vue`**：通用的食材选择器，支持搜索与分类双联动。
- **`FoodDetailModal.vue`**：
  - **同步系统**：若检测到 `item.updatedAt > log.sourceUpdatedAt`，自动弹出“同步最新数据”按钮，解决快照滞后性。
  - **下架提醒**：针对 `isArchived` 食材，显示“仅作历史展示”，禁止新的计划引用。
- **`CustomFoodModal.vue`**：
  - **相似度检测**：输入名称时触发 `/check-similarity`，提示库中已有的相似官方食材，减少冗余录入。
  - **自动 Emoji**：基于“长词优先”算法，根据名称自动推荐图标（如输入“鸡胸肉”自动匹配 🍗）。

---

## 5. 后端 Service 关键逻辑剖析

### 5.1 字典维度治理 (`data_dictionary`)
- **ext_info 扩展**：在字典项中存储 `dimension: 'weight' | 'volume' | 'count'`。
- **逻辑应用**：后端在处理饮食录入时，校验传入单位是否与原型单位同维度，规避“用毫升量鸡蛋”的逻辑错误。

### 5.2 性能优化
- **联合索引**：新增 `idx_archived_name` 联合索引，支撑在下架状态过滤下的高性能模糊检索。
- **状态注入**：采用“分步查询”替代海量 Join，先拉取食材再通过 `Set` 注入 `isFavorite` 状态，性能提升约 40%。

---

## 6. 开发规范建议 (Developer Guidelines)

1. **单位修改**：注意 `baseCount` 的物理意义。若单位是“个”，`baseCount` 必须设为 1。
2. **局部更新校验**：由于 NestJS DTO 局部更新的局限性，Service 层在 `update` 时必须先合并数据再进行物理守恒二次校验。
3. **数据同步**：修改系统食材库数据后，必须执行 `patch` 脚本刷新 `updated_at`，以触发客户端的同步提醒。
