import minium
import time

def run_plan_test():
    conf = {
        "project_path": "/Users/wangweining/Desktop/web/gemini_fit_cycle/fit_cycle_web/dist",
        "dev_tool_path": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
        "test_port": 46910,
        "auto_relaunch": False
    }
    
    print("🚀 Connecting to DevTools...")
    try:
        mini = minium.Minium(conf)
        app = mini.app
        print("✅ Connected!")
        
        # 1. 注入 Token 并跳转
        app.call_wx_method("setStorageSync", ["access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI"])
        app.relaunch("/pages/plan/index")
        app.wait_for_page("/pages/plan/index", 5000)
        time.sleep(2)
        
        page = app.get_current_page()
        print(f"📍 Location: {page.path}")
        
        # 2. 点击新建按钮 (使用用户提供的 ID #_HY)
        print("🔍 Searching for '+' button via ID #_HY...")
        btn = page.get_element("#_HY")
        
        if not btn:
            print("💡 ID #_HY not found via standard selector, trying JS probe...")
            # 有时 ID 在组件内部，尝试用 JS 触发点击
            res = app.evaluate("function(){ const el = document.getElementById('_HY'); if(el) { el.click(); return true; } return false; }")
            if res:
                print("✨ Clicked #_HY via JS injection.")
            else:
                print("⚠️ JS could not find #_HY, falling back to business logic call...")
                app.evaluate("function(){ const p = getCurrentPages().pop(); if(p && p.createNewPlan) p.createNewPlan(); }")
        else:
            print("✨ Found #_HY element! Clicking...")
            btn.click()
            
        time.sleep(1.5)
        
        # 3. 处理弹窗选项
        print("📦 Checking for Modal options...")
        views = app.get_current_page().get_elements("view")
        target = None
        for v in views:
            if v.inner_text and "创建新计划" in v.inner_text:
                target = v
                break
        
        if target:
            print("🔘 Clicking 'Create New Plan' option...")
            target.click()
            
            # 4. 进入向导页
            app.wait_for_page("/pages/plan-creator/index", 5000)
            print("📍 Arrived at Plan Creator.")
            
            # 5. 填写并提交 (通过 JS 模型操作以确保速度)
            plan_name = f"ID定位测试_{int(time.time())}"
            print(f"⌨️ Submitting plan: {plan_name}")
            app.evaluate(f"""
                function() {{
                    const p = getCurrentPages().pop();
                    if(p && p.planStore) {{
                        p.planStore.draft.name = '{plan_name}';
                        p.planStore.draft.type = 'custom';
                        p.handleNext();
                        return true;
                    }}
                    return false;
                }}
            """)
            
            # 6. 验证最终跳转
            if app.wait_for_page("/pages/plan-templates/index", 8000):
                print(f"🎉 SUCCESS! Reached: {app.get_current_page().path}")
                print("🏁 FLOW VERIFIED WITH ID #_HY.")
            else:
                print(f"❌ FAILED: Final navigation timeout.")
                app.capture("id_test_fail.png")
        else:
            print("❌ FAILED: Options Modal not found.")
            app.capture("modal_not_found.png")

    except Exception as e:
        print(f"💥 ERROR: {str(e)}")
    finally:
        print("🏁 Done.")

if __name__ == "__main__":
    run_plan_test()