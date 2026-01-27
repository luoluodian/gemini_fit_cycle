# fit_ccle 项目协作宪法 (Project Constitution)

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
