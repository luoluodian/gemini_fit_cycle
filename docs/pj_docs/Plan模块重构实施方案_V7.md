# Plan 模块“全链路持久化与查看编辑统一”实施方案 (V7)

## 1. 核心设计思想
本次重构的核心是将饮食计划（Plan）从“内存草稿型”流程转变为“实时持久化型”流程。

*   **数据源统一**：废弃 Store 作为计划数据的真理来源，所有页面直接通过 API 与后端同步。
*   **状态闭环**：通过 `DRAFT` (草稿)、`CONFIGURED` (已配置)、`ACTIVE` (激活) 三态管理计划生命周期。
*   **安全兜底**：引入带版本和过期控制的 `localStorage` 机制，防止用户在“单日配置”过程中的意外丢数。

---

## 2. 后端技术细节 (Backend)

### 2.1 状态定义
在 `DietPlan` 实体中明确状态机：
- **DRAFT**: Step 1 完成后。
- **CONFIGURED**: 用户点击“完成配置”并通过后台校验。
- **ACTIVE**: 计划已正式生效，与首页 Dashboard 挂钩。

### 2.2 核心 API 契约补全

#### 1. 批量初始化接口
- **路径**: `POST /diet-plans/:id/init-days`
- **功能**: 一次性生成周期的天数结构。
- **保护逻辑**: 若 `force=false` 且已有 `isConfigured=true` 的天，则报错并提示覆盖风险。

#### 2. 单日详情获取
- **路径**: `GET /diet-plans/days/:dayId/detail`
- **功能**: 返回该日完整的树状结构（Day -> Meals -> Items）。

#### 3. 单日全量原子更新
- **路径**: `PUT /diet-plans/days/:dayId/full-update`
- **功能**: 接收完整配置，在事务内完成差量更新。

---

## 3. 前端重构路径 (Frontend)

### 3.1 页面流转适配
- **Step 1 (基础信息)**: 点击下一步立即调用 `createPlan`，拿到 `id` 跳转。
- **Step 1.5 (碳循环)**: 提交参数后调用 `init-days` 预生成全周期结构。
- **Step 2 (周期列表)**: 直接从后端 `fetch` 计划详情，渲染日历。
- **Step 3 (EditTemplate)**: 成为通用组件，承载所有“单日编辑”需求。

### 3.2 独立编辑页 (EditTemplate) 逻辑重构
采用 **“双源合路 (Hybrid Data Loader)”** 策略：
1.  **加载阶段**:
    - 检查 `localStorage` 有无 `draft_day_${dayId}`。
    - 若有且未过期（24h）且计划 ID 匹配：弹窗询问用户“恢复”还是“丢弃”。
    - 若无或选择丢弃：从后端 API 拉取数据。
2.  **编辑阶段**:
    - `watch` 本地变量，实时更新 `localStorage`（防丢）。
3.  **保存阶段**:
    - 调用 `full-update` 接口。
    - 成功后**显式销毁** `localStorage`。

---

## 4. 风险缓解措施 (Edge Cases)

| 风险点 | 表现 | 解决方案 |
| :--- | :--- | :--- |
| **缓存幽灵** | 用户在旧版缓存中恢复了不兼容的数据 | 增加 `version` 标识，版本不一致强制失效。 |
| **并发创建** | 连续快速点击“+新增” | 前端 `loading` 禁用按钮；后端设置 `(planId, dayNumber)` 唯一索引。 |
| **误操作清空** | 修改参数导致之前配好的天数被覆盖 | 后端 `init-days` 接口实施覆盖前校验，前端展示警告弹窗。 |

---

## 5. 开发顺序
1.  **后端 DTO & 接口开发**：补全单日查询、更新、初始化接口。
2.  **前端 Service 封装**：对接新接口。
3.  **PlanCreator 全流程改造**：对接 API 替换 Store 操作。
4.  **EditTemplate 重构**：实现 `useAutoSave` 逻辑与 API 提交闭环。
