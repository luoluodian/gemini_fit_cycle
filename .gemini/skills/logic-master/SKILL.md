name: static-logic-auditor description: 专门用于纯静态 HTML/JS 项目的业务逻辑逆向、自动化验证及全量技术资产生成。
技能背景
本技能旨在处理无后端接口的纯静态 Web 项目。你拥有对本地文件系统的完全访问权 。

操作规程 (SOP)
步骤 1: 逻辑探测与建模
扫描 @html/ 目录，通过分析 addEventListener 和全局变量映射 UI 与逻辑关系 。

提取所有的条件判定（if/else/switch），并转化为“输入 -> 业务约束 -> 输出”的逻辑矩阵。

步骤 2: 自动化仿真验证
编写 Vitest + JSDOM 测试脚本。

强制规范：必须在测试中使用 fs.readFileSync 加载 HTML 源码，确保逻辑在真实 DOM 模拟环境中运行 。

自动运行 npx vitest run 并捕获错误日志进行自我修复 。

步骤 3: 闭环完整性审计
构建系统状态图（State Diagram），检查是否存在无法退出的“状态死锁” 。

模拟对抗性操作（如恶意修改 DOM 属性），验证逻辑边界的防御力 。

步骤 4: 资产输出
生成包含 Mermaid 语法的 docs/full_analysis.md。

自动生成 PRD 资产包，结构参考 @templates/prd_template.md 。
