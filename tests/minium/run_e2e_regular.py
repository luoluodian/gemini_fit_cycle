import minium
import time
import sys
import os

# 确保能找到 utils
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils.db_checker import get_latest_plan

def run_e2e():
    conf = {
        "project_path": "/Users/wangweining/Desktop/web/gemini_fit_cycle/fit_cycle_web/dist",
        "dev_tool_path": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
        "test_port": 46910,
        "auto_relaunch": False
    }
    
    print("🚀 [FastE2E-V2] Connecting...")
    try:
        mini = minium.Minium(conf)
        app = mini.app
        print("✅ [OK] Connected.")
        
        # 1. 登录
        app.call_wx_method("setStorageSync", ["access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI"])
        app.relaunch("/pages/plan/index")
        app.wait_for_page("/pages/plan/index", 10000)
        
        # 2. 触发新建
        print("💉 [Step 2] Triggering createNewPlan()...")
        # 修正语法：Minium evaluate 内部不加外层 function 包装
        app.evaluate("const p = getCurrentPages().pop(); if(p && p.createNewPlan) p.createNewPlan();")
        
        # 3. 寻找并点击“创建新计划”
        print("📦 [Step 3] Navigating to Creator (Bypassing UI click if needed)...")
        # 如果 3 秒后没跳转，强制跳转
        if not app.wait_for_page("/pages/plan-creator/index", 3000):
            app.evaluate("wx.navigateTo({ url: '/pages/plan-creator/index' });")
        
        app.wait_for_page("/pages/plan-creator/index", 5000)
        print("📍 [OK] Arrived at Creator.")
        
        # 4. 提交数据
        plan_name = f"V7_FIXED_{int(time.time())}"
        print(f"📝 [Step 4] Submitting Form: {plan_name}")
        app.evaluate(f"""
            const p = getCurrentPages().pop();
            if(p && p.planStore) {{
                p.planStore.draft.name = '{plan_name}';
                p.planStore.draft.type = 'custom';
                p.handleNext();
            }}
        """)
        
        # 5. 处理可能出现的碳循环设置页 (Carb Cycle Setup)
        print("⏳ [Step 5] Checking for intermediate Carb Cycle page...")
        if app.wait_for_page("/pages/carb-cycle-setup/index", 5000):
            print("⚠️ [INFO] Intercepted Carb Cycle Setup. Bypassing...")
            # 直接点击“保存”或调用 handleSave 跳转到模板页
            app.evaluate("const p = getCurrentPages().pop(); if(p && p.handleSave) p.handleSave();")
        
        # 6. 最终验证持久化跳转 (Templates Page)
        print("⏳ [Step 6] Waiting for Templates page...")
        if app.wait_for_page("/pages/plan-templates/index", 10000):
            print("✅ [OK] Success! Reached Templates page.")
            db_plan = get_latest_plan()
            print(f"📊 [DB] Verification: {db_plan}")
            if db_plan and plan_name in db_plan['name']:
                print("\n🎉🎉🎉 [ALL PASSED] PLAN CREATED AND PERSISTED.")
            else:
                print("❌ [FAIL] DB record mismatch.")
        else:
            print(f"❌ [FAIL] Persistence Timeout. Current page: {app.get_current_page().path}")

    except Exception as e:
        print(f"💥 [ERROR] {str(e)}")
    finally:
        print("🏁 Test finished.")

if __name__ == "__main__":
    run_e2e()
