# Food 模块审计报告与代码索引 (Food Module Audit & Index)

本报告是对 `Food` (食材) 模块全栈实现的深度审计，涵盖架构合理性、代码优雅度及资产索引。

---

## 1. 模块代码索引 (Code Index)

### 1.1 后端核心资产 (`fit_cycle_app`)
| 路径 | 类型 | 职责说明 | 关键审计点 |
| :--- | :--- | :--- | :--- |
| `src/database/entity/food-item.entity.ts` | Entity | 食材原型定义 | `FoodType` 权限隔离、`isArchived` 逻辑下架逻辑。 |
| `src/modules/food-items/food-items.service.ts` | Service | 核心业务逻辑 | `getPopular` 热门算法、`injectFavoriteStatus` 高性能注入、Emoji 智能匹配。 |
| `src/modules/food-items/food-items.controller.ts`| Controller| 接口层 | 统一使用 `JwtAuthGuard`，支持相似度检测接口。 |
| `src/dtos/food-item.dto.ts` | DTO | 输入校验 | 集成 `IsPhysicsBalanced` 物理守恒校验。 |
| `src/common/utils/nutrition.util.ts` | Util | 算法中心 | 统一后端营养计算公式，消除重复建设。 |

### 1.2 前端核心资产 (`fit_cycle_web`)
| 路径 | 类型 | 职责说明 | 关键审计点 |
| :--- | :--- | :--- | :--- |
| `src/pages/food/index.vue` | Page | 食材库主页 | 分类切换、防抖搜索、乐观 UI 收藏同步。 |
| `src/components/food/FoodPicker.vue` | Component| 搜索选择器 | 供计划/记录模块调用的通用弹窗。 |
| `src/components/food/FoodDetailModal.vue` | Modal | 详情与快照同步| `sourceUpdatedAt` 快照过期检测、`calculateMacros` 比例计算。 |
| `src/components/food/CustomFoodModal.vue` | Modal | 自建食材表单 | `getTheoreticalCalories` 物理校验、相似食材 Tip。 |
| `src/utils/nutrition.ts` | Util | 算法中心 | 统一前端营养计算公式，建立 `NUTRITION_COEFFICIENTS`。 |

---

## 2. 审计结论 (Audit Findings)

### 2.1 架构合理性与优雅度 (Rationality & Elegance)
- **✅ 物理定律防御 (Physics-First)**：通过 `PhysicsBalance` 校验从源头杜绝了“100g 含有 300g 蛋白质”的无效数据，体现了业务严谨性。
- **✅ 引用不崩溃原则 (Logical Archiving)**：引入 `isArchived` 和 `referenceCount` 解决了分布式环境下删除操作导致历史记录报错的经典难题。
- **✅ 快照自治 (Snapshotting)**：`meal_logs` 存储冗余营养数据，并配合 `source_updated_at` 实现数据过期提醒，极大地增强了系统的健壮性。
- **✅ 性能分步查询**：后端避免了海量数据下的 `LEFT JOIN` 收藏表，转而采用 $O(1)$ 的内存注入，性能表现优异。
- **✅ 算法中心化**：通过 `NutritionUtil` (前后端) 统一了营养素比例计算与理论热量公式，消除了逻辑散乱。
- **✅ 遵循最小必要原则**：移除了非核心的 Emoji 智能映射（降级为分类兜底）与后端强行拦截的热量合理性校验（移至前端警告），并将物理清理逻辑解耦至离线维护，确保业务内核聚焦。

### 2.2 审计改进项记录 (Optimizations Completed)
...
#### 4. 最小必要原则对齐 (Minimalism Alignment)
- **已优化**：简化 Emoji 推荐逻辑，仅按 9 大分类映射图标。
- **已优化**：移除后端 `ThermalGuard` 强制拦截逻辑，物理守恒（P+F+C）防线予以保留。
- **已优化**：移除 `adjustReferenceCount` 中的自动物理清理触发器，简化事务逻辑。

#### 1. 重复建设 (Redundancy)
- **已修复**：后端抽取 `NutritionUtil`，合并了 `DietRecordsService` 中的重复公式。
- **已修复**：前端抽取 `utils/nutrition.ts`，统一了 `FoodDetailModal` 与 `CustomFoodModal` 的计算逻辑。

#### 2. 硬编码风险 (Hard-coding)
- **已优化**：引入 `NUTRITION_COEFFICIENTS` 常量替代散落在各处的魔法数字（4, 9, 4）。
- **待优化**：基准值 `baseCount = 100` 仍有部分硬编码 fallback，建议未来完全字典化。

#### 3. 公共方法复用性 (Commonality)
- **已修复**：`FoodItemsService` 抽取 `injectFavoriteStatus` 私有方法，消除了列表与热门查询的逻辑重复。

---
*注：本索引与审计报告由独立任务执行协议基于当前代码库 (commit: latest) 生成。*
