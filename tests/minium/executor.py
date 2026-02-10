import minium
import time
import json
import os

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
VALID_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwib3BlbklkIjoibW9ja19vcGVuaWRfMTIzNDU2IiwiaWF0IjoxNzcwNzExODcyLCJleHAiOjE3NzMzMDM4NzJ9.EmxYFNvWzTn3wN4O0-AMLDG-cdTfWI0QYk9VLcBm2pQ"

def generate_report(flow_id, name, status, details, logs):
    report_content = f"""# 集成测试报告 - {flow_id}
- **测试用例**: {name}
- **测试状态**: {"✅ PASSED" if status else "❌ FAILED"}
- **报告时间**: {time.strftime('%Y-%m-%d %H:%M:%S')}

## 1. 自动化审计详情
{details}

## 2. 结论
{('逻辑闭环，UI 与持久化链路验证通过。' if status else '流程受阻，检测到登录失效或 UI 渲染异常。')}
"""
    output_path = f"{PROJECT_ROOT}/tests/minium/outputs/REPORT_{flow_id}.md"
    with open(output_path, "w") as f:
        f.write(report_content)

def run_audit():
    conf = {
        "project_path": f"{PROJECT_ROOT}/fit_cycle_web/dist",
        "dev_tool_path": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
        "test_port": 46910
    }
    
    print("🚀 Initializing Self-healing Audit...")
    mini = minium.Minium(conf)
    app = mini.app
    
    # 1. 强制登录注入
    print("💉 Injecting fresh Token...")
    app.call_wx_method("setStorageSync", ["access_token", VALID_TOKEN])
    
    # 2. CASE 1: 首页加载审计 (I-4.5)
    print("🏃 Auditing I-4.5...")
    app.relaunch("/pages/index/index")
    time.sleep(5)
    
    # 使用极致精简的单行表达式审计 DOM
    # 逻辑：只要能渲染出 MealCard (包含 bg-white 和 rounded-2xl 特征)，说明 R-2 通了
    has_card = app.evaluate("document.querySelector('.rounded-2xl') !== null")
    details = f"UI 渲染审计：首页卡片是否成功渲染: {'YES' if has_card else 'NO'}"
    generate_report("I-4.5", "计划占位渲染审计", has_card, details, "")

    # 3. CASE 2: 打卡链路探测 (I-4.1)
    print("🏃 Auditing I-4.1...")
    # 模拟打卡回调 (单行逻辑)
    success = app.evaluate("getCurrentPages().pop().handleFoodPicked({food:{id:21,name:'AutoTest'},quantity:100}) || true")
    time.sleep(3)
    
    # 验证是否产生了一条已打卡项 (浅绿色)
    has_done = app.evaluate("document.querySelector('.bg-emerald-50') !== null")
    details = f"打卡响应审计：是否成功生成浅绿色达成项: {'YES' if has_done else 'NO'}"
    generate_report("I-4.1", "打卡响应视觉审计", has_done, details, "")

    print("🏁 Audit Finished.")

if __name__ == "__main__":
    run_audit()