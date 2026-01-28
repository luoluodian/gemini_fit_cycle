# T7 自动化联调 - Gemini CLI 专用提示词

> **版本**: v1.0  
> **适用工具**: Gemini CLI  
> **核心能力**: AI 智能体通过命令行直接执行，无需脚本

---

## 🎯 核心理念

使用 Gemini CLI 时，AI 智能体可以：
1. ✅ 直接执行命令行命令
2. ✅ 读取文件内容
3. ✅ 修改代码文件
4. ✅ 分析日志输出
5. ✅ 自动诊断和修复问题

**无需编写脚本，AI 直接操作！**

---

## 📋 完整自动化提示词

```
执行任务 {task_id} 的 T7 自动化联调测试：

【任务信息】
- 任务ID: {task_id}
- 任务名称: {task_name}
- 任务类型: 后端/前端

【AI 执行规则】
1. 自主决策：根据情况自动启动/停止服务
2. 自动修复：遇到常见问题自动修复代码
3. 自动重试：修复后自动重启服务并重新测试
4. 完整记录：记录所有操作和修复过程

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 0: 环境检查】

0.1 检查当前目录：
执行: pwd
确认: 是否在项目根目录

0.2 检查服务状态：
执行: lsof -i :3000
分析: 
- 如果端口被占用，记录 PID 并停止: kill -9 <PID>
- 如果端口空闲，准备启动服务

0.3 检查后端目录：
执行: ls -la fit_cycle_app/src
确认: 项目结构是否正常

0.4 检查依赖安装：
执行: cd fit_cycle_app && npm list --depth=0 | head -20
分析: 关键依赖是否已安装

输出: 
```
【环境检查结果】
✅ 项目目录: /Users/wangweining/Desktop/web/gemini_fit_cycle
✅ 端口 3000: 空闲
✅ 后端目录: 正常
✅ 依赖安装: 正常
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 1: 启动后端服务】

1.1 创建日志目录：
执行: mkdir -p logs

1.2 启动后端服务：
执行: cd fit_cycle_app && npm run start:dev > ../logs/backend_{task_id}.log 2>&1 &
记录: 进程已在后台启动

1.3 等待服务启动：
执行: sleep 30
说明: 等待 30 秒让服务完全启动

1.4 检查服务是否启动：
执行: lsof -i :3000
分析:
- 如果有输出，服务已启动 ✅
- 如果无输出，查看日志诊断问题

1.5 查看启动日志：
执行: tail -n 50 logs/backend_{task_id}.log
分析:
- 查找 "Nest application successfully started" 或类似信息
- 查找错误信息

1.6 健康检查：
执行: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health
分析:
- 200: 服务正常 ✅
- 404: 可能没有健康检查接口（继续测试）
- 000: 服务未响应（查看日志）

输出:
```
【服务启动结果】
✅ 后端服务已启动
✅ 端口 3000 已监听
✅ 健康检查: 200 OK
```

如果启动失败:
- 查看完整日志: tail -n 100 logs/backend_{task_id}.log
- 诊断问题类型
- 自动修复或提供修复建议
- 重新启动

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 2: 读取接口规约】

2.1 读取任务分析文档：
执行: cat docs/pj_docs/tasks/{task_id}/T5_分析文档.md
提取: 涉及的接口路径、方法、参数

2.2 读取接口规约：
执行: grep -A 20 "POST /api/auth" docs/pj_docs/04_接口与数据规约.md
提取: 接口的完整定义

2.3 构造测试数据：
根据接口规约构造合适的测试数据
示例:
```json
{
  "code": "test_wx_code_123",
  "userInfo": {
    "nickName": "测试用户",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

输出:
```
【接口信息】
路径: POST /api/auth/login
参数: {"code": "test_wx_code_123"}
期望响应: {"code": 0, "data": {...}, "message": "success"}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 3: 执行接口测试】

3.1 执行 curl 请求：
执行: curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_wx_code_123"}'

3.2 分离响应体和状态码：
从输出中提取:
- 响应体: 最后一行之前的所有内容
- 状态码: 最后一行

3.3 格式化响应体：
执行: echo '<响应体>' | jq .
美化 JSON 输出

输出:
```
【接口调用结果】
状态码: 200
响应体:
{
  "code": 0,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {
      "userId": "123",
      "userName": "测试用户"
    }
  },
  "message": "success"
}
响应时间: 245ms
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 4: 响应验证】

4.1 验证状态码：
检查: 状态码是否为 200 或 201
结果: ✅ 通过 / ❌ 失败

4.2 验证响应格式：
执行: echo '<响应体>' | jq empty
检查: 是否为有效的 JSON
结果: ✅ 通过 / ❌ 失败

4.3 验证响应结构：
执行: echo '<响应体>' | jq -e '.code, .data, .message'
检查: 是否包含必需字段
结果: ✅ 通过 / ❌ 失败

4.4 验证业务状态码：
执行: echo '<响应体>' | jq -r '.code'
检查: code 是否为 0
结果: ✅ 通过 / ❌ 失败

4.5 验证数据结构：
执行: echo '<响应体>' | jq -e '.data.access_token'
检查: 是否包含期望的字段
结果: ✅ 通过 / ❌ 失败

输出:
```
【验证结果】
✅ 状态码正确: 200
✅ 响应格式正确: JSON
✅ 响应结构正确: 包含 code, data, message
✅ 业务状态码正确: code = 0
✅ 数据结构正确: 包含 access_token

总结: 所有验证通过 ✅
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 5: 问题诊断】⭐ 如果验证失败

5.1 分析错误类型：
根据状态码和响应内容分类:
- 000: 服务未运行或无法连接
- 404: 路由不存在
- 500: 服务器内部错误
- 响应格式错误: 未返回标准格式

5.2 查看后端日志：
执行: tail -n 100 logs/backend_{task_id}.log
分析:
- 提取错误信息
- 提取堆栈跟踪
- 识别错误位置

5.3 搜索特定错误：
执行: grep -i "error" logs/backend_{task_id}.log | tail -20
执行: grep -i "undefined" logs/backend_{task_id}.log | tail -20
执行: grep -i "database" logs/backend_{task_id}.log | tail -20

5.4 诊断根本原因：
根据错误类型和日志分析:
- 路由不存在 → Controller 未注册
- 500 + "database" → 数据库问题
- 500 + "undefined" → 空值引用
- CORS 错误 → CORS 配置缺失

输出:
```
【问题诊断】
❌ 问题类型: 路由不存在 (404)
❌ 根本原因: AuthController 未注册到 AuthModule
❌ 错误位置: fit_cycle_app/src/modules/auth/auth.module.ts
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 6: 自动修复】⭐ 核心能力

根据问题类型自动修复代码:

6.1 CORS 错误修复：
检查: cat fit_cycle_app/src/main.ts | grep "enableCors"
如果没有找到:
- 读取文件: cat fit_cycle_app/src/main.ts
- 在 app.listen 之前添加 CORS 配置
- 使用文件编辑工具修改

修复代码:
```typescript
// 在 await app.listen 之前添加
app.enableCors({
  origin: ['http://localhost:10086', 'http://127.0.0.1:10086'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

6.2 Controller 未注册修复：
检查: cat fit_cycle_app/src/modules/auth/auth.module.ts
分析: controllers 数组是否包含 AuthController
如果没有:
- 读取文件内容
- 在 controllers 数组中添加 AuthController
- 保存文件

6.3 Module 未导入修复：
检查: cat fit_cycle_app/src/app.module.ts
分析: imports 数组是否包含 AuthModule
如果没有:
- 读取文件内容
- 在 imports 数组中添加 AuthModule
- 保存文件

6.4 响应格式错误修复：
检查: ls fit_cycle_app/src/common/interceptors/
如果没有 transform.interceptor.ts:
- 创建响应拦截器文件
- 在 main.ts 中注册

输出:
```
【修复操作】
🔧 修复 1: 添加 CORS 配置到 main.ts
   文件: fit_cycle_app/src/main.ts
   内容: 添加 app.enableCors({...})
   
🔧 修复 2: 注册 AuthController 到 AuthModule
   文件: fit_cycle_app/src/modules/auth/auth.module.ts
   内容: controllers: [AuthController]
   
✅ 修复完成，准备重启服务
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 7: 重启服务并重试】

7.1 停止旧服务：
执行: lsof -ti :3000 | xargs kill -9
等待: sleep 5

7.2 清空日志：
执行: > logs/backend_{task_id}.log

7.3 重新启动服务：
执行: cd fit_cycle_app && npm run start:dev > ../logs/backend_{task_id}.log 2>&1 &
等待: sleep 30

7.4 检查服务状态：
执行: lsof -i :3000
执行: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health

7.5 重新执行测试：
重复阶段 3 和阶段 4

7.6 验证修复效果：
对比修复前后的测试结果

输出:
```
【重试结果】
✅ 服务已重启
✅ 重新测试通过
✅ 问题已修复

修复前: 404 Not Found
修复后: 200 OK
```

如果仍然失败:
- 分析新的错误信息
- 判断是否可以继续自动修复
- 如果无法自动修复，提供详细的人工修复建议

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 8: 生成测试报告】

8.1 创建报告目录：
执行: mkdir -p docs/pj_docs/tasks/{task_id}

8.2 生成测试报告：
创建文件: docs/pj_docs/tasks/{task_id}/T7_测试报告.md

报告内容包括:
- 测试环境信息
- 服务启动日志（最近 50 行）
- 接口调用结果
- 验证结果清单
- 问题诊断报告（如有）
- 修复操作记录（如有）
- 测试结论

8.3 更新看板：
读取: docs/pj_docs/04.5_原子任务交付看板.md
更新: 将任务 {task_id} 的 T7 列更新为 ✅

输出:
```
【报告生成】
✅ 测试报告已生成: docs/pj_docs/tasks/{task_id}/T7_测试报告.md
✅ 看板已更新: T7 列标记为 ✅
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【阶段 9: 清理与总结】

9.1 询问是否停止服务：
提示: "测试完成，是否需要停止后端服务？"

如果需要停止:
执行: lsof -ti :3000 | xargs kill -9

9.2 输出总结：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【T7 自动化联调测试总结】

任务: {task_id} - {task_name}

✅ 测试通过: 5/5
❌ 测试失败: 0/5
🔧 自动修复: 2 项

问题列表:
1. CORS 配置缺失 - ✅ 已修复
2. Controller 未注册 - ✅ 已修复

修复记录:
1. 添加 CORS 配置到 main.ts - ✅ 成功
2. 注册 AuthController 到 AuthModule - ✅ 成功

测试报告: docs/pj_docs/tasks/{task_id}/T7_测试报告.md
后端日志: logs/backend_{task_id}.log

下一步:
✅ 所有测试通过，可以执行 T8 审计阶段

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 重要提示：
1. 每个阶段完成后输出结果
2. 遇到问题时详细输出诊断分析
3. 修复代码前说明修复内容和位置
4. 修复后验证效果
5. 所有操作都要记录到测试报告
6. 如果无法自动修复，提供详细的人工修复指南
7. 使用 Gemini CLI 的文件编辑功能直接修改代码
```

---

## 🎯 使用示例

### 后端任务示例

```
执行任务 U-1 的 T7 自动化联调测试：

任务信息:
- 任务ID: U-1
- 任务名称: 微信登录认证接口
- 任务类型: 后端

请按照上述流程完全自动化执行，包括:
1. 检查环境
2. 启动服务
3. 读取接口规约
4. 执行接口测试
5. 验证响应
6. 如果有问题，自动诊断和修复
7. 重启服务并重试
8. 生成测试报告

要求:
- 每个阶段输出执行结果
- 遇到问题自动修复
- 所有操作记录到报告
```

### 前端任务示例

```
执行任务 U-2 的 T7 自动化联调测试：

任务信息:
- 任务ID: U-2
- 任务名称: 前端认证服务
- 任务类型: 前端

前提条件:
- 后端接口 U-1 已完成

请按照上述流程执行，重点验证:
1. 接口调用是否成功
2. Token 是否正确返回
3. 响应格式是否符合契约
4. 错误处理是否正确

如果发现问题，自动修复并重新测试。
```

---

## 💡 关键命令速查

### 服务管理
```bash
# 检查端口占用
lsof -i :3000

# 停止服务
lsof -ti :3000 | xargs kill -9

# 启动服务
cd fit_cycle_app && npm run start:dev > ../logs/backend.log 2>&1 &

# 查看日志
tail -f logs/backend.log
```

### 接口测试
```bash
# 测试接口
curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_wx_code_123"}'

# 格式化 JSON
echo '<json>' | jq .

# 提取字段
echo '<json>' | jq -r '.code'
```

### 日志分析
```bash
# 查看最近日志
tail -n 100 logs/backend.log

# 搜索错误
grep -i "error" logs/backend.log | tail -20

# 搜索特定关键词
grep -i "undefined\|null" logs/backend.log | tail -20
```

### 文件操作
```bash
# 检查文件内容
cat fit_cycle_app/src/main.ts

# 搜索文件内容
grep "enableCors" fit_cycle_app/src/main.ts

# 创建目录
mkdir -p docs/pj_docs/tasks/U-1
```

---

## 📚 参考资料

- `docs/templates/前后端联调检查清单.md`: 详细的验证清单
- `docs/pj_docs/04_接口与数据规约.md`: 接口契约定义
- `任务清单.md`: T7 测试阶段说明

---

**版本**: v1.0  
**最后更新**: 2026-01-28  
**适用工具**: Gemini CLI  
**维护者**: AI Assistant


