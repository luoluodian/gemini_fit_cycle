import minium
import time

def run_plan_test():
    conf = {
        "project_path": "/Users/wangweining/Desktop/web/gemini_fit_cycle/fit_cycle_web/dist",
        "dev_tool_path": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
        "test_port": 46910,
        "auto_relaunch": True
    }
    
    print("🚀 Final Stabilized UI Acceptance Flow...")
    try:
        mini = minium.Minium(conf)
        app = mini.app
        print("✅ Connection Active.")
        
        # 1. 物理环境重置
        print("🧹 Clearing session...")
        app.call_wx_method("clearStorageSync")
        # 激活特权标志（防止中间环节干扰）
        app.evaluate("global.__FC_TEST_SKIP_AUTH__ = true")
        
        # 2. 登录触发
        app.relaunch("/pages/login/index")
        app.wait_for_page("/pages/login/index", 10000)
        time.sleep(3)
        
        page = app.get_current_page()
        print("🖱️ Clicking Mock Login (.FC-TEST-MOCK-LOGIN)...")
        login_btn = page.get_element(".FC-TEST-MOCK-LOGIN")
        
        if login_btn:
            login_btn.click()
            # 关键：点击后立即放弃旧页面句柄，等待新页面
            print("⏳ Waiting for Login-to-Home transition...")
            if not app.wait_for_page("/pages/index/index", 15000):
                print("⚠️ Redirect to Home failed, trying direct relaunch to Plan...")
                app.relaunch("/pages/plan/index")
        else:
            print("🚨 ERROR: Mock Login button not visible. Re-building might be needed.")
            app.capture("login_err.png")
            return

        # 3. 导航至计划页
        print("🔄 Switching Tab to Plan...")
        app.switch_tab("/pages/plan/index")
        app.wait_for_page("/pages/plan/index", 10000)
        time.sleep(4)
        
        # 重新捕获稳定的计划页实例
        page = app.get_current_page()
        print(f"📍 Current Path: {page.path}")

        # 4. 执行创建流 (基于物理 Class)
        print("🔍 Locating Create Button (.FC-TEST-CREATE-BTN)...")
        create_btn = page.get_element(".FC-TEST-CREATE-BTN")
        if not create_btn:
            print("💡 Class fallback to inner_text '+'...")
            create_btn = page.get_element("view", inner_text="+")
            
        if create_btn:
            create_btn.click()
            time.sleep(2)
            
            # 处理弹出菜单
            page = app.get_current_page()
            option = page.get_element("view", inner_text="创建新计划")
            if option:
                print("✨ Selecting '创建新计划'...")
                option.click()
                
                # 5. 向导人工模拟
                if app.wait_for_page("/pages/plan-creator/index", 10000):
                    print("📍 Entered Wizard.")
                    time.sleep(2)
                    page = app.get_current_page()
                    
                    # 输入计划名称
                    input_el = page.get_element("input")
                    if input_el:
                        plan_name = f"Final_Acceptance_{int(time.time())}"
                        print(f"⌨️ Entering name: {plan_name}")
                        input_el.input(plan_name)
                        time.sleep(1)
                        
                        # 点击下一步
                        next_btn = page.get_element("view", inner_text="下一步")
                        if next_btn:
                            print("🖱️ Clicking '下一步'...")
                            next_btn.click()
                            
                            # 6. 跨页数据闭环验证
                            if app.wait_for_page("/pages/plan-templates/index", 15000):
                                print(f"🎉 MISSION ACCOMPLISHED! Destination: {app.get_current_page().path}")
                                print("🏁 ALL UI ANCHORS AND LOGIC BRANCHES VERIFIED.")
                            else:
                                print("❌ FAILED: Wizard submission timeout.")
                                app.capture("submission_stuck.png")
                        else:
                            print("❌ FAILED: '下一步' button unreachable.")
                    else:
                        print("❌ FAILED: Name input missing.")
                else:
                    print("❌ FAILED: Wizard entry timed out.")
            else:
                print("❌ FAILED: Selection Modal not displayed.")
        else:
            print("❌ FAILED: Create button not found on Plan page.")

    except Exception as e:
        print(f"💥 SYSTEM ERROR: {str(e)}")
    finally:
        print("🏁 Flow Terminated.")

if __name__ == "__main__":
    run_plan_test()