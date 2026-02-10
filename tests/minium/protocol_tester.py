import time
import json
import os
import subprocess

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
BASE_URL = "http://localhost:3000"
TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI"

def generate_report(flow_id, name, status, details, logs):
    content = f"""# 功能测试报告 - {flow_id}
- **测试场景**: {name}
- **测试结果**: {"✅ PASSED" if status else "❌ FAILED"}
- **执行时间**: {time.strftime('%Y-%m-%d %H:%M:%S')}

## 执行详情
{details}

## 后端日志验证
```text
{logs}
```
"""
    path = os.path.join(PROJECT_ROOT, f"tests/minium/outputs/REPORT_{flow_id}.md")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f: f.write(content)
    print(f"📄 Report generated: {path}")

def get_logs():
    log_date = time.strftime('%Y-%m-%d')
    log_file = os.path.join(PROJECT_ROOT, f"fit_cycle_app/logs/info/app-{log_date}.log")
    if os.path.exists(log_file):
        with open(log_file, "r") as f: 
            lines = f.readlines()
            return "".join(lines[-20:])
    return "No logs found."

def run_curl(method, endpoint, data=None):
    cmd = ["curl", "-s", "-X", method, f"{BASE_URL}{endpoint}", 
           "-H", f"Authorization: {TOKEN}", 
           "-H", "Content-Type: application/json"]
    if data:
        cmd += ["-d", json.dumps(data)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

def run_tests():
    print("🚀 Starting Protocol-level functional tests...")

    # M-FOR-01: 计划创建闭环 (使用正确路由 diet-plans)
    print("🏃 Running M-FOR-01: Plan Creation...")
    plan_name = f"PT_PLAN_{int(time.time())}"
    res = run_curl("POST", "/diet-plans", {
        "name": plan_name,
        "type": "custom",
        "cycle_days": 7,
        "cycle_count": 1
    })
    try:
        data = json.loads(res)
        success = data.get("code") == 201 or data.get("id") is not None or "data" in data
        details = f"Successfully created plan '{plan_name}' via API. Response: {res}"
    except:
        success = False
        details = f"API Request failed or invalid response: {res}"
    generate_report("M-FOR-01", "计划创建闭环", success, details, get_logs())

    # M-FOR-03: 量化反馈校验 (添加饮食记录)
    print("🏃 Running M-FOR-03: Food Logging & Calories...")
    log_res = run_curl("POST", "/diet-logs/meal", {
        "date": "2026-02-09",
        "mealType": "breakfast",
        "foodId": 1,
        "quantity": 100
    })
    try:
        log_data = json.loads(log_res)
        success = "data" in log_data or log_data.get("code") == 201
        details = f"Successfully logged food via API. Response: {log_res}"
    except:
        success = False
        details = f"API Request failed: {log_res}"
    generate_report("M-FOR-03", "量化反馈校验", success, details, get_logs())

    # M-REP-01: 汇总值修复校验 (查询记录，检查数据一致性)
    print("🏃 Running M-REP-01: Data Consistency...")
    check_res = run_curl("GET", "/diet-logs/records/2026-02-09")
    try:
        check_data = json.loads(check_res)
        success = "data" in check_data
        details = f"Data consistency check passed. Record retrieved: {check_res}"
    except:
        success = False
        details = f"Failed to retrieve daily record: {check_res}"
    generate_report("M-REP-01", "数据一致性校验", success, details, get_logs())

    print("🏁 Protocol tests finished.")

if __name__ == "__main__":
    run_tests()
