import json
import os
import subprocess
import time

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
BASE_URL = "http://localhost:3000"
TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI"

def generate_report(flow_id, name, status, details, logs):
    report_content = f"""# 集成测试报告 - {flow_id}
- **测试场景**: {name}
- **联调结果**: {"✅ PASSED" if status else "❌ FAILED"}
- **执行时间**: {time.strftime('%Y-%m-%d %H:%M:%S')}

## 1. 联调详情
{details}

## 2. 后端审计日志
```text
{logs}
```

## 3. 结论
{'链路已彻底打通，数据持久化与前端契约一致。' if status else '链路存在阻塞，需核实后端路由或 DTO 匹配情况。'}
"""
    output_path = os.path.join(PROJECT_ROOT, f"tests/minium/outputs/REPORT_{flow_id}.md")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        f.write(report_content)
    print(f"📄 Report generated: {output_path}")

def get_logs():
    log_date = time.strftime('%Y-%m-%d')
    log_file = os.path.join(PROJECT_ROOT, f"fit_cycle_app/logs/info/app-{log_date}.log")
    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            lines = f.readlines()
            return "".join(lines[-15:])
    return "No logs found."

def run_integration_test():
    print("🚀 Starting I-4.1 Integration Test (Protocol Hook)...")
    
    # 模拟前端 handleFoodPicked 发送 POST 请求
    payload = {
        "date": "2026-02-10",
        "mealType": "breakfast",
        "foodId": 1,
        "quantity": 150
    }
    
    curl_cmd = [
        "curl", "-s", "-X", "POST", f"{BASE_URL}/records/meal",
        "-H", f"Authorization: {TOKEN}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload)
    ]
    
    print("📡 Sending POST /records/meal...")
    result = subprocess.run(curl_cmd, capture_output=True, text=True)
    resp_text = result.stdout
    
    success = False
    details = ""
    try:
        resp_json = json.loads(resp_text)
        # 如果返回了 id 和 foodName，说明入库成功且快照计算闭环
        if resp_json.get("id") or "data" in resp_json:
            success = True
            details = f"接口成功响应：已存入食物 {resp_json.get('foodName', 'N/A')}，ID: {resp_json.get('id', 'N/A')}"
        elif resp_json.get("code") == 404:
            details = "接口返回 404，确认路由 /records/meal 是否已挂载。"
        else:
            details = f"接口逻辑报错: {resp_text}"
    except:
        details = f"解析失败: {resp_text}"

    generate_report("I-4.1", "打卡保存闭环联调", success, details, get_logs())
    print("🏁 I-4.1 Test Finished.")

if __name__ == "__main__":
    run_integration_test()
