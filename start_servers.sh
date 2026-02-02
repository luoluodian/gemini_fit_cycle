#!/bin/bash

# 1. 清理端口占用
echo "Cleaning up ports 3000 and 10086..."
kill -9 $(lsof -t -i:3000) 2>/dev/null
kill -9 $(lsof -t -i:10086) 2>/dev/null

# 2. 检查数据库连接配置
echo "Checking database config..."
if [ ! -f "fit_cycle_app/.env" ]; then
    echo "Warning: fit_cycle_app/.env not found!"
fi

# 3. 启动后端 (后台运行，输出到 nohup.out)
echo "Starting Backend (Port 3000)..."
cd fit_cycle_app
npm run start:dev > ../backend_run.log 2>&1 &
BACKEND_PID=$!
cd ..

# 4. 等待后端启动
echo "Waiting for backend to warm up..."
sleep 15

# 5. 启动前端 (后台运行)
echo "Starting Frontend (Port 10086)..."
cd fit_cycle_web
npm run dev:h5 > ../frontend_run.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Servers are starting in background."
echo "Backend Log: tail -f backend_run.log"
echo "Frontend Log: tail -f frontend_run.log"
echo "Check status with: lsof -i :3000,10086"
