# Plan 模块 Minium 自动化测试方案 (V7.7 自修复与数据回滚版)

## 1. 引言 (Introduction)

本方案在 V7.6 基础上，引入了**脚本自愈 (Self-healing)** 与 **业务数据修复 (Data Recovery)** 机制。V7.7 旨在降低由于 UI 细微变动导致的脚本维护成本，并确保业务系统在复杂交互后具备自我纠错与环境彻底净化的能力。

## 2. 环境配置 (Environment Setup)

### 2.1 基础环境
- **测试框架**: Minium (Python 版)
- **开发工具**: 微信开发者工具 (开启服务端口)
- **运行入口**: `tests/minium/run_plan_flow.py`

## 3. Minium 测试核心策略 (Core Strategy)

### 3.1 关键状态快照 (Critical State Snapshots)
1.  **路径一致性**: 验证跳转后 `planStore.draft` 核心参数保持不变。
2.  **自动保存校验**: 检查编辑数据后的 Draft 同步落库情况。

### 3.2 测试执行异常容错 (Test Resilience)
1.  **智能重试机制**: 对 `element.click()` 等封装 `wait_and_retry` 逻辑（默认 3 次）。
2.  **脚本定位自愈**: 封装 `smart_find_element`。当首选 ID 失效时，自动尝试存储在配置中的冗余定位符（如 `xpath`, `inner_text`），并记录 `Warning` 警告。
3.  **失败现场存证**: 任何 `AssertionError` 触发时，立即执行截图并导出 Store 全量快照。

## 4. 详细测试用例矩阵 (Detailed Test Matrix)

### 4.1 正向与异常路径 (Forward & Exception)
| ID | 场景描述 | 核心校验逻辑 (Key Logic) | 预期结果 |
| :--- | :--- | :--- | :--- |
| **M-FOR-01** | **计划创建闭环** | 配置 -> 提交 -> 确认激活 | 状态转为 `active`，Draft 物理清理 |
| **M-FOR-03** | **量化反馈校验** | 添加食物后观察营养进度环 | 数值增长与食物热量绝对一致 |

### 4.2 自修复与数据一致性 (Self-repair & Consistency)
| ID | 场景描述 | 操作与审计点 | 预期结果 |
| :--- | :--- | :--- | :--- |
| **M-REP-01** | **汇总值静默修复** | 注入不一致的热量明细与汇总字段 | 进入页面后系统自动重算并修复差异 |
| **M-REP-02** | **环境深度修复** | 复杂流程后执行 `teardown` | 1. 物理删除 DRAFT 记录<br>2. 强制刷新 Redis 统计缓存 |
| **M-REP-03** | **原子性保存回滚** | 修改数据后模拟数据库写入失败 | 前端 Draft 状态回滚至修改前，防止显示虚假成功 |

### 4.3 异常防御与熔断逻辑 (Robustness)
| ID | 场景描述 | 操作步骤 | 预期结果 |
| :--- | :--- | :--- | :--- |
| **M-ERR-09** | **认证失效恢复** | 编辑中途 Token 过期 -> 重新登录 | 自动回跳编辑原 Step，Draft 数据 100% 还原 |
| **M-ERR-11** | **组件崩溃自愈** | 模拟某个餐次组件渲染异常 | 页面触发 Error Boundary，显示重试按钮而非全屏崩溃 |

## 5. 执行指令 (Execution)

```bash
# 执行全量自修复能力测试
python3 tests/minium/run_plan_flow.py --mode=full --healing=on
```

## 6. 维护注意事项
- **Self-healing Audit**: 定期审计自愈日志，将生效的备选定位器更新至代码，防止脚本运行性能退化。
- **Atomic Cleanup**: 必须在 `tearDown` 中调用清理接口，严禁在数据库中遗留 `status=DRAFT` 的测试数据。
- **Diagnosis**: 优先利用 `app.evaluate` 导出的快照分析数据层级的“静默修复”是否触发。