# 饮食计划全链路业务逻辑与测试验证方案 (基于 V7.7 真实代码)

## 1. 核心链路定义
本方案严格基于 `fit_cycle_web` 与 `fit_cycle_app` 的源码实现，描述从计划建模到数据打卡的闭环。

---

## 2. 按钮级交互测试用例 (Step-by-Step)

### 第一阶段：计划创建 (Plan Creation)
**操作入口**：`pages/plan/index.vue` (饮食计划列表)

| 序号 | 交互动作 | 关联代码/组件 | 预期 UI 表现 | 关键数据/接口 |
| :--- | :--- | :--- | :--- | :--- |
| 1.1 | 点击左上角 `+` 图标 | `createNewPlan` (Icon: Uploader) | 弹出 `CreateOptionsModal` (新建选项) | 无 |
| 1.2 | 点击“手动创建” | `@create="handleSelectCreate"` | 跳转至 `pages/plan-creator` | `planStore.resetDraft()` |
| 1.3 | 输入计划名称 | `BasicInfoStep` | 文本实时同步至 `planStore.draft.name` | 无 |
| 1.4 | 选择“碳循环”类型 | `CycleSettingsStep` | UI 显示周期天数(7)与循环次数(3) | 无 |
| 1.5 | 点击 `下一步` | `handleNext` | 按钮进入 Loading 态，随后跳转至 `pages/carb-cycle-setup` | `POST /diet-plans` (status: 'draft') |

### 第二阶段：参数与模板配置 (Configuration)
**操作入口**：`pages/carb-cycle-setup/index.vue` & `pages/plan-templates/index.vue`

| 序号 | 交互动作 | 关联代码/组件 | 预期 UI 表现 | 关键数据/接口 |
| :--- | :--- | :--- | :--- | :--- |
| 2.1 | 设置体重与比例 | `GlassCard` 中的输入框 | 底部 `checkStatus` 显示天数平衡状态 (如：7 / 7) | `planStore.draft.carbCycleConfig` |
| 2.2 | 点击底部 `下一步` | `handleNext` | 弹出 `更新营养目标` 或 `重置确认` 模态框 | 无 |
| 2.3 | 点击 `确认更新` | `Taro.showModal` (confirm) | 按钮 Loading，跳转至 `pages/plan-templates` | `POST /diet-plans/:id/init-days` |
| 2.4 | 点击第一天“编辑” | `handleEditTemplate(0)` | 跳转至 `pages/edit-template` | 无 |
| 2.5 | 点击早餐“+添加食物” | `handleShowPicker` | 弹出 `FoodPicker` (含食材库数据) | 无 |
| 2.6 | 选择食材并确认克数 | `handleFoodPicked` | 早餐板块内出现带分类标签的置灰食材行 | 无 (内存态) |
| 2.7 | 点击“保存此天配置” | `handleSave` | 弹出 `保存成功` Toast，返回模板列表 | `POST /diet-plans/:id/templates` |
| 2.8 | 点击“确认计划” | `handleSave` (in templates page) | 弹出成功提示，1.5s 后跳转回计划列表页 | `PUT /diet-plans/:id` (status: 'configured') |

### 第三阶段：激活与首页打卡 (Execution)
**操作入口**：`pages/plan/index.vue` -> `pages/index/index.vue`

| 序号 | 交互动作 | 关联代码/组件 | 预期 UI 表现 | 关键数据/接口 |
| :--- | :--- | :--- | :--- | :--- |
| 3.1 | 点击卡片右侧 `激活` | `handlePlanAction('activate')` | 计划卡片标签由 `已就绪` 变为 `进行中/当前使用` | `POST /diet-plans/:id/activate` |
| 3.2 | 点击 TabBar `记录` | `switchTab(ROUTES.HOME)` | 页面顶部 `DateNavigation` 显示正确的计划名与天数 | `GET /records/:date` |
| 3.3 | 查看早餐卡片内容 | `HomeMealCard` | 渲染出模板中的食材，文字置灰且带 `计划建议` 标签 | `RecordInfoResponse.plannedDay` |
| 3.4 | 点击食材右侧 `打卡` | `handleItemClick` | 该行背景瞬间变绿，`计划建议` 变为 `已记录` (逻辑由 status 驱动) | `POST /records/meal` |
| 3.5 | 观察顶部仪表盘 | `DailyGoalsOverview` | “已摄入”进度条/环形图根据打卡食材热量实时增长 | `achievementRatios` 计算 |
| 3.6 | 点击已记录项改数量 | `handleRequestEdit` -> `FoodDetailModal` | 弹出修改框，修改克数并保存后，该行由绿变回 **置灰/未记录** 态 | `PUT /records/meal/:id` (isRecorded: false) |
| 3.7 | 再次点击 `打卡` | `handleItemClick` | 该行重新变绿，顶部进度按新热量重新统计 | `PUT /records/meal/:id` (isRecorded: true) |

---

## 3. 系统逻辑判定表 (Ground Truth)

| 状态位 (status) | `isPlanned` | `isRecorded` | UI 渲染逻辑 | 业务含义 |
| :--- | :--- | :--- | :--- | :--- |
| **ghost** | true | undefined | 置灰、无删除按钮、有打卡按钮 | 来自计划模板，尚未产生数据库记录 |
| **draft** | true/false | false | 置灰、有删除按钮、有打卡按钮 | 已产生的记录，但被修改过或尚未确认摄入 |
| **completed**| true/false | true | 彩色、有编辑/删除按钮 | 正式的饮食记录，计入营养统计 |

---

## 4. 关键分支与风险规避逻辑 (Anti-Hallucination Logic)

### 4.1 碳循环参数变更保护 (非毁灭性更新)
*   **触发场景**：计划已配置食材明细，用户返回 `CARB_CYCLE_SETUP` 修改体重或配比。
*   **判定逻辑**：
    *   **周期天数未变**：后端执行 `In-place Update`。仅更新 `PlanDay` 的目标热量与宏量配比，**保留** `PlanMeal` 和 `PlanMealItem`。
    *   **周期天数变化**：后端执行物理重置。删除所有旧天数配置并重建。
*   **UI 提示**：前端根据周期是否变化，动态显示“确认更新 (绿色)”或“重置确认 (红色)”弹窗。

### 4.2 首页食材匹配启发式算法
*   **跨来源去重匹配**：
    *   逻辑不再强制要求 `isPlanned: true`。只要 `foodId` 或 `foodName` 匹配，无论是手动添加还是计划生成的记录，均会“填补”计划建议的置灰占位符。
*   **多项同名冲突处理**：
    *   逻辑采用 `find + splice` 策略。若计划建议吃两个“鸡蛋”，用户每打卡一个（无论来源），对应的第一个 `Ghost` 占位符将被消耗并变绿。
    *   匹配优先级：`foodId (精准)` > `foodName (模糊名称)`。
*   **删除回退机制**：
    *   删除一个由计划生成的“实态”记录后，首页会通过当日模板自动恢复显示对应的“置灰建议态 (Ghost)”，确保计划引导的连续性。

### 4.3 计划生命周期边界 (Infinite Loop Protection)
*   **超期判定**：若当前日期超过了 `startDate + (cycleDays * cycleCount)`。
*   **预期表现**：首页不再下发 `plannedDay` 模板建议，营养目标自动退回至用户健康档案的 TDEE 基准值。

### 4.4 动态餐次与排序兼容性 (Custom Meal Visibility & Order)
*   **加载逻辑**：首页餐次卡片不再写死 4 餐。系统会动态解析 `plannedDay` 中的所有餐次。
*   **排序规则**：系统会根据计划模板中定义的先后顺序（基于字典 `value` 或 `sortOrder`）对餐次进行重新排列，确保“练前加餐”等自定义餐次出现在正确的时间位置，而非盲目堆叠在底部。

### 4.5 一键记录防重 (Sync Deduplication)
*   **拦截逻辑**：在执行“一键记录”前，后端与前端会双重对比已有的 `meal_logs`。若用户已录入过某项计划食物（基于 ID 或名称），该项将不再重复触发插入，确保数据幂等性。

### 4.6 核心约束一致性 (Integrity Constraints)
*   **全链路餐次支持**：饮食记录表 (`meal_logs`) 采用 String 存储餐次标识，确保计划中自定义的“宵夜”、“练前餐”等能顺利打卡存盘。
*   **激活状态互斥**：系统在 `Service` 层强制约束，无论通过何种接口（`activate` 或通用的 `update`），均会自动处理“激活 A 停用 B”的逻辑，确保全局只有一个 Active 计划。

---

## 6. 故障排查与日志审计指南 (Debugging & Log Audit Guide)

若测试脚本在执行过程中遇到阻塞或失败，应遵循以下审计链路：

### 6.1 后端异常溯源 (Backend Audit)
*   **错误日志**：`tail -n 100 fit_cycle_app/logs/error/app-$(date +%F).error.log`
*   **排查重点**：
    1. **400 BadRequest**：检查 DTO 校验规则是否与前端传参类型一致。
    2. **500 QueryFailed**：检查数据库外键约束或字段长度限制（如 `meal_type`）。
    3. **401 Unauthorized**：检查测试 Token 是否过期。

### 6.2 前端状态审计 (Frontend Audit)
*   **状态机检查**：通过 Minium 的 `app.evaluate` 实时读取 `pinia` store 状态，确认 `plannedDay` 是否成功载入。
*   **选择器诊断**：若报 `ElementNotFound`，利用截图确认页面是否停留在 `Loading` 态或出现了非预期的微信原生弹窗。

### 6.3 数据清理与重置 (Data Reset)
*   **脏数据处理**：测试失败可能留下未清理的饮食记录。可执行以下操作重置环境：
    * `cd fit_cycle_app && node seed_test_data.js` (覆盖式重置)
    * `rm -rf fit_cycle_web/dist && npm run build:weapp` (解决前端缓存导致的 UI 滞后)

---

## 7. 变更记录 (Changelog)
* **V1.0**: 初始版本，涵盖基础流程。
* **V1.1**: 增加参数保护、同名匹配、动态餐次、一键记录去重逻辑验证。
* **V1.2**: 补充故障审计协议，确立 [观测-溯源-修复-重验] 的闭环流程。
