#!/bin/bash

# T7 自动化联调测试脚本
# 用途: 自动启动服务、执行联调测试、诊断并修复问题
# 使用: ./auto-integration-test.sh <TASK_ID> <TASK_NAME>

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 参数
TASK_ID=$1
TASK_NAME=$2

if [ -z "$TASK_ID" ] || [ -z "$TASK_NAME" ]; then
    echo -e "${RED}用法: $0 <TASK_ID> <TASK_NAME>${NC}"
    echo "示例: $0 U-2 '前端认证服务'"
    exit 1
fi

# 项目根目录
PROJECT_ROOT=$(pwd)
BACKEND_DIR="$PROJECT_ROOT/fit_cycle_app"
FRONTEND_DIR="$PROJECT_ROOT/fit_cycle_web"
LOG_DIR="$PROJECT_ROOT/logs"
REPORT_DIR="$PROJECT_ROOT/docs/pj_docs/tasks/$TASK_ID"

# 创建必要的目录
mkdir -p "$LOG_DIR"
mkdir -p "$REPORT_DIR"

# 日志文件
BACKEND_LOG="$LOG_DIR/backend_${TASK_ID}.log"
FRONTEND_LOG="$LOG_DIR/frontend_${TASK_ID}.log"
TEST_LOG="$LOG_DIR/test_${TASK_ID}.log"

# PID 文件
BACKEND_PID_FILE="$LOG_DIR/backend.pid"
FRONTEND_PID_FILE="$LOG_DIR/frontend.pid"

# 测试结果
TEST_PASSED=false
ISSUES_FOUND=()
FIXES_APPLIED=()

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}T7 自动化联调测试${NC}"
echo -e "${BLUE}任务ID: $TASK_ID${NC}"
echo -e "${BLUE}任务名称: $TASK_NAME${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# ============================================
# 阶段 0: 环境检查
# ============================================
echo -e "${YELLOW}【阶段 0: 环境检查】${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本: $(node -v)${NC}"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm 版本: $(npm -v)${NC}"

# 检查项目目录
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ 后端目录不存在: $BACKEND_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 后端目录存在${NC}"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ 前端目录不存在: $FRONTEND_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 前端目录存在${NC}"

# 检查端口占用
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

if check_port 3000; then
    echo -e "${YELLOW}⚠️  端口 3000 已被占用，将尝试停止现有服务${NC}"
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if check_port 10086; then
    echo -e "${YELLOW}⚠️  端口 10086 已被占用，将尝试停止现有服务${NC}"
    lsof -ti :10086 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo ""

# ============================================
# 阶段 1: 启动服务
# ============================================
echo -e "${YELLOW}【阶段 1: 启动服务】${NC}"

# 1.1 启动后端服务
echo "启动后端服务..."
cd "$BACKEND_DIR"

# 清空日志文件
> "$BACKEND_LOG"

# 启动服务（后台运行）
npm run start:dev > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$BACKEND_PID_FILE"
echo -e "${GREEN}后端服务已启动 (PID: $BACKEND_PID)${NC}"

# 等待服务启动
echo "等待后端服务启动（最多 60 秒）..."
WAIT_TIME=0
MAX_WAIT=60

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if check_port 3000; then
        echo -e "${GREEN}✅ 后端服务已启动 (端口 3000)${NC}"
        break
    fi
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
    echo -n "."
done
echo ""

if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    echo -e "${RED}❌ 后端服务启动超时${NC}"
    echo "查看日志: tail -f $BACKEND_LOG"
    tail -n 50 "$BACKEND_LOG"
    exit 1
fi

# 健康检查
echo "执行后端健康检查..."
sleep 5  # 等待服务完全就绪

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" = "200" ] || [ "$HEALTH_CHECK" = "404" ]; then
    echo -e "${GREEN}✅ 后端服务健康检查通过${NC}"
else
    echo -e "${YELLOW}⚠️  健康检查返回: $HEALTH_CHECK (继续测试)${NC}"
fi

echo ""

# 1.2 启动前端服务（可选）
# echo "启动前端服务..."
# cd "$FRONTEND_DIR"
# > "$FRONTEND_LOG"
# npm run dev:weapp > "$FRONTEND_LOG" 2>&1 &
# FRONTEND_PID=$!
# echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
# echo -e "${GREEN}前端服务已启动 (PID: $FRONTEND_PID)${NC}"
# echo ""

# ============================================
# 阶段 2: 接口联调测试
# ============================================
echo -e "${YELLOW}【阶段 2: 接口联调测试】${NC}"

# 测试接口列表（从接口规约中读取）
# 这里以登录接口为例
TEST_API="/api/auth/login"
TEST_METHOD="POST"
TEST_DATA='{"code": "test_wx_code_123"}'

echo "测试接口: $TEST_METHOD $TEST_API"
echo "请求数据: $TEST_DATA"
echo ""

# 执行接口调用
RESPONSE=$(curl -s -w "\n%{http_code}" -X $TEST_METHOD http://localhost:3000$TEST_API \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" 2>&1)

# 分离响应体和状态码
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo "状态码: $HTTP_CODE"
echo "响应体: $HTTP_BODY"
echo ""

# ============================================
# 阶段 3: 响应验证
# ============================================
echo -e "${YELLOW}【阶段 3: 响应验证】${NC}"

VALIDATION_PASSED=true

# 3.1 验证状态码
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ 状态码正确: $HTTP_CODE${NC}"
else
    echo -e "${RED}❌ 状态码错误: $HTTP_CODE (期望 200 或 201)${NC}"
    VALIDATION_PASSED=false
    ISSUES_FOUND+=("状态码错误: $HTTP_CODE")
fi

# 3.2 验证响应格式（JSON）
if echo "$HTTP_BODY" | jq empty 2>/dev/null; then
    echo -e "${GREEN}✅ 响应格式正确 (JSON)${NC}"
else
    echo -e "${RED}❌ 响应格式错误 (非 JSON)${NC}"
    VALIDATION_PASSED=false
    ISSUES_FOUND+=("响应格式错误: 非 JSON")
fi

# 3.3 验证响应结构（包含 code 字段）
if echo "$HTTP_BODY" | jq -e '.code' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 响应结构正确 (包含 code 字段)${NC}"
    
    # 3.4 验证业务状态码
    BUSINESS_CODE=$(echo "$HTTP_BODY" | jq -r '.code' 2>/dev/null || echo "-1")
    if [ "$BUSINESS_CODE" = "0" ]; then
        echo -e "${GREEN}✅ 业务状态码正确: $BUSINESS_CODE${NC}"
    else
        echo -e "${RED}❌ 业务状态码错误: $BUSINESS_CODE (期望 0)${NC}"
        MESSAGE=$(echo "$HTTP_BODY" | jq -r '.message' 2>/dev/null || echo "")
        echo "错误信息: $MESSAGE"
        VALIDATION_PASSED=false
        ISSUES_FOUND+=("业务状态码错误: $BUSINESS_CODE - $MESSAGE")
    fi
    
    # 3.5 验证数据结构（根据接口规约）
    if echo "$HTTP_BODY" | jq -e '.data' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 数据结构正确 (包含 data 字段)${NC}"
    else
        echo -e "${YELLOW}⚠️  数据结构警告 (缺少 data 字段)${NC}"
    fi
else
    echo -e "${RED}❌ 响应结构错误 (缺少 code 字段)${NC}"
    VALIDATION_PASSED=false
    ISSUES_FOUND+=("响应结构错误: 缺少 code 字段")
fi

echo ""

# ============================================
# 阶段 4: 问题诊断
# ============================================
if [ "$VALIDATION_PASSED" = false ]; then
    echo -e "${YELLOW}【阶段 4: 问题诊断】${NC}"
    
    echo "发现的问题:"
    for issue in "${ISSUES_FOUND[@]}"; do
        echo "  - $issue"
    done
    echo ""
    
    # 分析后端日志
    echo "分析后端日志..."
    echo "最近的错误:"
    grep -i "error" "$BACKEND_LOG" | tail -n 10 || echo "  (无错误日志)"
    echo ""
    
    # 问题分类
    ERROR_TYPE="UNKNOWN"
    
    if [ "$HTTP_CODE" = "404" ]; then
        ERROR_TYPE="ROUTE_NOT_FOUND"
        echo -e "${YELLOW}问题类型: 路由不存在${NC}"
    elif [ "$HTTP_CODE" = "500" ]; then
        ERROR_TYPE="INTERNAL_SERVER_ERROR"
        echo -e "${YELLOW}问题类型: 服务器内部错误${NC}"
    elif [ "$HTTP_CODE" = "000" ]; then
        ERROR_TYPE="SERVICE_NOT_RUNNING"
        echo -e "${YELLOW}问题类型: 服务未运行或无法连接${NC}"
    elif echo "$HTTP_BODY" | grep -i "cors" > /dev/null 2>&1; then
        ERROR_TYPE="CORS_ERROR"
        echo -e "${YELLOW}问题类型: CORS 错误${NC}"
    fi
    
    echo ""
    
    # ============================================
    # 阶段 5: 自动修复建议
    # ============================================
    echo -e "${YELLOW}【阶段 5: 修复建议】${NC}"
    
    case $ERROR_TYPE in
        "ROUTE_NOT_FOUND")
            echo "建议修复步骤:"
            echo "1. 检查 Controller 是否存在"
            echo "2. 检查 Controller 是否注册到 Module"
            echo "3. 检查 Module 是否导入到 AppModule"
            echo "4. 检查路由路径是否正确"
            ;;
        "INTERNAL_SERVER_ERROR")
            echo "建议修复步骤:"
            echo "1. 查看后端日志: tail -f $BACKEND_LOG"
            echo "2. 检查数据库连接"
            echo "3. 检查代码中的空值引用"
            echo "4. 检查依赖注入是否正确"
            ;;
        "CORS_ERROR")
            echo "建议修复步骤:"
            echo "1. 在 main.ts 中添加 CORS 配置"
            echo "2. 允许前端域名访问"
            echo "3. 允许必要的 HTTP 方法和请求头"
            ;;
        "SERVICE_NOT_RUNNING")
            echo "建议修复步骤:"
            echo "1. 检查服务是否正常启动"
            echo "2. 查看启动日志: tail -f $BACKEND_LOG"
            echo "3. 检查端口是否被占用"
            ;;
        *)
            echo "建议修复步骤:"
            echo "1. 查看完整的后端日志"
            echo "2. 检查接口实现是否符合规约"
            echo "3. 使用 Postman 手动测试接口"
            ;;
    esac
    
    echo ""
fi

# ============================================
# 阶段 6: 生成测试报告
# ============================================
echo -e "${YELLOW}【阶段 6: 生成测试报告】${NC}"

REPORT_FILE="$REPORT_DIR/T7_测试报告.md"

cat > "$REPORT_FILE" << EOF
# $TASK_ID: $TASK_NAME - T7 测试报告

## 7.1 测试环境

- 后端地址: http://localhost:3000
- 测试时间: $(date '+%Y-%m-%d %H:%M:%S')
- 后端 PID: $BACKEND_PID
- 后端日志: $BACKEND_LOG

## 7.2 服务启动日志

### 后端启动日志（最近 50 行）
\`\`\`
$(tail -n 50 "$BACKEND_LOG")
\`\`\`

## 7.3 接口联调测试结果

### 测试接口: $TEST_METHOD $TEST_API

**请求示例**:
\`\`\`bash
curl -X $TEST_METHOD http://localhost:3000$TEST_API \\
  -H "Content-Type: application/json" \\
  -d '$TEST_DATA'
\`\`\`

**响应结果**:
- 状态码: $HTTP_CODE
- 响应体:
\`\`\`json
$HTTP_BODY
\`\`\`

**验证结果**:
EOF

# 添加验证结果
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "- [x] 状态码正确 ($HTTP_CODE)" >> "$REPORT_FILE"
else
    echo "- [ ] 状态码错误 ($HTTP_CODE)" >> "$REPORT_FILE"
fi

if echo "$HTTP_BODY" | jq empty 2>/dev/null; then
    echo "- [x] 响应格式正确 (JSON)" >> "$REPORT_FILE"
else
    echo "- [ ] 响应格式错误 (非 JSON)" >> "$REPORT_FILE"
fi

if echo "$HTTP_BODY" | jq -e '.code' > /dev/null 2>&1; then
    echo "- [x] 响应结构正确 (包含 code 字段)" >> "$REPORT_FILE"
    
    BUSINESS_CODE=$(echo "$HTTP_BODY" | jq -r '.code' 2>/dev/null || echo "-1")
    if [ "$BUSINESS_CODE" = "0" ]; then
        echo "- [x] 业务状态码正确 (code = 0)" >> "$REPORT_FILE"
    else
        echo "- [ ] 业务状态码错误 (code = $BUSINESS_CODE)" >> "$REPORT_FILE"
    fi
else
    echo "- [ ] 响应结构错误 (缺少 code 字段)" >> "$REPORT_FILE"
fi

# 添加问题记录
if [ ${#ISSUES_FOUND[@]} -gt 0 ]; then
    cat >> "$REPORT_FILE" << EOF

## 7.4 问题记录

EOF
    
    for i in "${!ISSUES_FOUND[@]}"; do
        cat >> "$REPORT_FILE" << EOF
### 问题 $((i+1)): ${ISSUES_FOUND[$i]}
- **严重程度**: 🔴 阻塞
- **问题描述**: ${ISSUES_FOUND[$i]}
- **状态**: 📅 待处理

EOF
    done
fi

# 添加测试结论
cat >> "$REPORT_FILE" << EOF

## 7.5 测试结论

EOF

if [ "$VALIDATION_PASSED" = true ]; then
    echo "✅ 所有测试通过，可以进入 T8 阶段" >> "$REPORT_FILE"
else
    echo "🔧 发现问题需要修复，请查看问题记录" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

## 7.6 参考资料

- 联调检查清单: \`docs/templates/前后端联调检查清单.md\`
- 自动化联调流程: \`docs/templates/T7_自动化联调流程.md\`
- 后端日志: \`$BACKEND_LOG\`
EOF

echo -e "${GREEN}✅ 测试报告已生成: $REPORT_FILE${NC}"
echo ""

# ============================================
# 清理
# ============================================
echo -e "${YELLOW}【清理】${NC}"

# 询问是否停止服务
read -p "是否停止后端服务? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        kill $BACKEND_PID 2>/dev/null || true
        rm "$BACKEND_PID_FILE"
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    fi
else
    echo -e "${YELLOW}后端服务继续运行 (PID: $BACKEND_PID)${NC}"
    echo "停止命令: kill $BACKEND_PID"
fi

echo ""

# ============================================
# 总结
# ============================================
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}T7 自动化联调测试完成${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✅ 测试结果: 通过${NC}"
    echo -e "${GREEN}可以继续执行 T8 审计阶段${NC}"
    exit 0
else
    echo -e "${RED}❌ 测试结果: 失败${NC}"
    echo -e "${RED}发现 ${#ISSUES_FOUND[@]} 个问题，需要修复${NC}"
    echo ""
    echo "问题列表:"
    for issue in "${ISSUES_FOUND[@]}"; do
        echo "  - $issue"
    done
    echo ""
    echo "查看详细报告: cat $REPORT_FILE"
    echo "查看后端日志: tail -f $BACKEND_LOG"
    exit 1
fi

