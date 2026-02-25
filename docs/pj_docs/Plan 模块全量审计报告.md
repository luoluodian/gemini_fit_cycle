✦ Plan 模块全量审计报告 (Complete Audit Report)

依据 independent-mission 协议，对 plan 模块（含所有子页面、组件、Store 及 Service）进行了深度闭环审计。以下为完整报告：

---

1. 核心业务漏洞 (Critical Business Gaps)

1. 计划执行期“空壳化”：
   - 严重程度：高 (MVP 阻断)
   - 详情：pages/daily-plan/index.vue 虽有完整 UI，但内部核心逻辑仍硬编码为
     mockPlan。用户在首页激活计划后，无法进入真实的记录/执行流程。
   - 遗漏项：之前的分析未提及 recordStore 与 planStore 在该页面的协作缺失。
1. 碳循环计算逻辑冲突：
   - 严重程度：中
   - 详情：在 plan-creator 第一步修改周期天数后，若用户已在第二步配置了明细，此时返回第一步修改参数，系统会通过 force: true
     覆盖所有后端数据，导致用户辛苦录入的食材明细永久丢失且无二次确认。
1. 模板批量操作缺失：
   - 严重程度：中 (UX 体验)
   - 详情：PLAN_TEMPLATES 页面中的“克隆”、“排序”按钮仍指向 showError("开发中")。对于长周期计划，用户录入成本呈几何倍数增加。

1. 本地化与合规性缺陷 (Localization Gaps)

针对“禁止出现英文单位（除 kcal、kg、g、ml 外）”及“去英文 UI”约束，发现以下未修复项：

1.  单位违规：
    - NutritionTargets.vue / NutritionProgress.vue：硬编码显示 g, kcal。应调用 displayUnit。
    - TargetsModal.vue：表单标签显示 (kcal), (g)。
2.  UI 引导违规：
    - TemplateManagementStep.vue：CONFIG PROGRESS (uppercase), Slide to view 虽已汉化，但 CSS 中仍有大量针对英文排版的 uppercase
      冗余样式。
    - plan/index.vue：列表计数器显示 {{ n }} Items。

3.  流程与导航缺陷 (Navigation & Flow)

4.  激活路径不闭环：向导完成后跳转回 PLAN_OVERVIEW，但新计划默认为 configured 而非
    active。用户必须在列表深处寻找“激活”按钮，路径多出一步 3 秒以上的操作。
5.  缓存隔离风险：EDIT*TEMPLATE 使用的本地缓存 draft_day*{id} 未区分 userId。若同一设备切换账号，可能看到前一个用户的草稿碎片。

6.  修复与优化设计方案 (Action Plan)

┌──────────────┬────────────────────────────┬───────────────────────────────────────────────────┐
│ 阶段 │ 任务描述 │ 关键逻辑/文件 │
├──────────────┼────────────────────────────┼───────────────────────────────────────────────────┤
│ P0: 合规修复 │ 全面清理英文单位与 UI 引导 │ utils/unit.ts 适配 + 各组件 displayUnit 替换 │
│ P0: 逻辑闭环 │ 接入 daily-plan 真实数据 │ 重构 pages/daily-plan/index.vue 的 loadData │
│ P1: 体验增强 │ 实现“克隆天”功能 │ planService.createPlanDay 增加 fromDayId 参数支持 │
│ P1: 流程防呆 │ 激活路径直达 │ 向导末尾增加“立即激活” API 调用 │
└──────────────┴────────────────────────────┴───────────────────────────────────────────────────┘

---

审计结论：Plan 模块目前处于“UI 完成度 90%，业务逻辑完成度 60%”的状态。核心阻断点在于执行页面的 Mock
数据以及向导回溯导致的数据丢失风险。
