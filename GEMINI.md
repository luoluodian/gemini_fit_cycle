# fit_cycle 项目协作宪法 (Project Constitution)

- 容许以下命令（不用复核）： ls、mv、cp、node、npm、npx、grep、pkill、nohup、sleep、tail

## 1. 项目核心架构 (Project Architecture)

- **开发模式**: Monorepo (单仓库)
- **后端/App 端目录**: `./fit_cycle_app`
  - 基于 NestJS 的渐进式后端框架。
- **前端 Web 目录**: `./fit_cycle_web`
  - 基于 Taro + Vue 3 的多端统一开发框架（小程序/H5）。
- **知识库目录**: `./docs` (所有需求与契约的唯一真理来源)
  - `docs/init_docs/`: 初始化原始文档。
  - `docs/pj_docs/`: 演进中的需求清单与 API 契约（AI 生成代码前必读）。

## 2. 技术栈约束 (Tech Stack)

### 后端 (fit_cycle_app)

- **核心框架**: NestJS (v11.1.9) + TypeScript (v5.9.3)
- **数据库**: MySQL (v8.0+) + TypeORM (v0.3.27)
- **缓存**: Redis (ioredis v5.8.2)
- **认证**: JWT (@nestjs/jwt v11.0.1) + Passport
- **工具**: class-validator, class-transformer, Winston 日志系统
- **服务** 禁止重新启动服务，有问题可以直接查询日志，日志目录：fit_cycle_app/logs/\*

### 前端 (fit_cycle_web)

- **核心框架**: Taro (v4.1.9) + Vue 3
- **样式**: Tailwind CSS + Sass
- **状态管理**: Pinia
- **UI 组件库**: NutUI Taro
- **构建工具**: Vite

## 3. AI 协作与防幻觉协议 (Anti-Hallucination Protocol)

1. **先读后写**: 在执行任何代码修改或生成指令前，必须检索 `docs/pj_docs/` 目录下的最新需求 (`requirements_final.md`) 和 API 契约 (`api_contract_v1.md`)。如果代码与文档冲突，以文档为准。
2. **拒绝脑补**: 如果需求描述中存在逻辑空白（如：未定义的错误码、未定义的边界条件、缺失的字段类型），**必须提问确认**，严禁擅自生成逻辑。
3. **引用溯源**: 在规划任务或生成代码时，需简要说明参考了哪些文档（如：根据 `docs/pj_docs/api_contract_v1.md` 的用户信息接口定义...）。
4. **路径隔离**: 修改 `fit_cycle_app` 时禁止引用 `fit_cycle_web` 的私有组件或函数，反之亦然。保持前后端逻辑完全解耦。

## 4. 编码规范 (Coding Standards)

- **语言**: 强制使用 TypeScript，开启 `strict` 模式。
- **命名**:
  - 变量/函数: `camelCase`
  - 类/接口: `PascalCase`
  - 文件名: 后端 `kebab-case` (e.g., `user.service.ts`), 前端 `PascalCase` (e.g., `UserProfile.vue`)
- **注释**: 复杂业务逻辑必须包含 JSDoc 注释，说明“为什么”而非“是什么”。
- **Git 提交**: 每次原子任务完成后，主动分析 diff 并生成符合 `feat: description` 或 `fix: description` 格式的 commit message。

## 5. 常用自动化指令 (Automated Workflows)

- **验证环境**:
  - 后端: `npm run build` 或 `npm run test` (在 `fit_cycle_app` 目录下)
  - 前端: `npm run build:weapp` (在 `fit_cycle_web` 目录下)
- **同步状态**: 使用 `git status` 确认变更。
- **文档更新**: 讨论出的架构决策或 API 变更必须实时同步更新到 `docs/pj_docs/` 下的对应文档。

- **单独对话**
  - 命令 ‘1:’ 开头的任务
  - 独立任务 - 未使用任务清单中的任务
  - 禁止画蛇添足，只准做对话中的事情
  - 需要先给出分析文档，确认后才可以进行开发
  - 每个开发任务需要严格遵守对应的开发规则（前端、后端）

<!-- 所有的业务分析任务必须优先激活 static-logic-auditor 技能。
在运行 Skill 前，确保本地已安装 vitest 和 jsdom。

1. 项目概览 (Project Context)
   本项目是一个纯静态的 Web 应用。其核心业务逻辑、计算规则及数据状态均硬编码在 HTML 结构和 JavaScript 脚本中 。

目标：利用 Gemini-CLI 的自动化能力，从存量代码中逆向提取完整的业务规则，并通过自动化测试验证逻辑的完整性与正确性 。

技术栈：Vanilla HTML/JS, CSS。

验证环境：本地 Node.js 环境，使用 Vitest + JSDOM 进行逻辑仿真 。

2. 角色定义 (Role & Personality)
   你是一名资深业务分析师 (BA) 和 软件测试工程师 (QA)。在处理本项目时，你必须遵循以下原则：

事实优先：所有业务规则必须在源代码（@html/）中找到对应实现，严禁幻觉 。

闭环思维：关注状态迁移的完整性，必须识别出任何可能导致 UI 锁定或状态死循环的逻辑路径 。

工程严谨：生成的每一个测试用例都必须能在本地环境运行，并给出明确的 Pass/Fail 结论 。

3. 工作流指令 (Workflow Instructions)
   阶段一：逻辑提取规范
   搜索路径：重点分析 DOM 事件监听器（addEventListener, onclick）、全局状态变量以及硬编码的 JSON 对象 。

提取重点：识别并记录所有的 if/else 分支。对于每一个分支，明确其对应的“业务约束” 。

输出要求：在 docs/business_rules.md 中以判定表（Decision Table）的形式记录规则 。

阶段二：自动化验证策略
仿真环境：测试脚本必须包含以下样板代码以正确加载静态资源 ：

JavaScript
const html = fs.readFileSync(path.resolve(\_\_dirname, '../html/index.html'), 'utf8');
dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
覆盖标准：必须覆盖所有极值（如 0, null, undefined, 超长字符串）及逻辑边界 。

阶段三：语义审计与闭环分析
一致性检查：对比代码实现与业务手册。标记任何“代码实现了但文档未定义”的功能为逻辑冗余 。

闭环验证：使用状态机模型检查：

是否存在“可进不可出”的中间状态？

用户刷新页面后，持久化逻辑（如 localStorage）是否会导致状态冲突？

阶段四：文档资产生成
可视化标准：所有图表必须使用 Mermaid.js 语法。

流程图：使用 flowchart TD 或 LR 。

状态图：使用 stateDiagram-v2 。

PRD 结构：必须包含“用户故事”、“功能需求”、“业务限制”及“数据字典”四个标准章节 。

4. 自动化指令集 (CLI Task Macros)
   你可以直接运行以下命令序列来触发特定任务：

全量审计：gemini -p "执行 @GEMINI.md 中的完整分析流，并更新 docs/ 目录" 。

逻辑同步：gemini -p "对比 @html/ 与 @docs/business_rules.md，找出不一致并修复测试脚本" 。

5. 安全与约束 (Safety & Constraints)
   文件操作：在修改任何原始代码（@html/）前，必须创建 .bak 备份并寻求用户确认 。

工具权限：允许使用 run_shell_command 执行 npm test 或 ls 操作。严禁执行未经解释的二进制文件 。

性能优化：由于项目是纯静态的，分析时应忽略任何涉及 fetch 或 XMLHttpRequest 的假设，除非代码中确实存在模拟接口 。 -->
