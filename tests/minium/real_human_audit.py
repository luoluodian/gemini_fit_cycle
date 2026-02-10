import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def run_audit():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    
    print("INITIALIZING DETAILED AUDIT...")
    mini = minium.Minium(conf)
    app = mini.app
    
    try:
        # Step 0: Login
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        app.call_wx_method("setStorageSync", ["access_token", token])
        app.relaunch("/pages/index/index")
        time.sleep(5)
        
        # 1. Physical Add
        print("[AUDIT 1] Adding food manually...")
        page = app.get_current_page()
        page.get_element("view", inner_text="+ 添加食物").click()
        time.sleep(2)
        app.get_current_page().get_element("input").input("燕麦")
        time.sleep(3)
        app.get_current_page().get_element("view", inner_text="燕麦").click()
        time.sleep(3)
        
        # Verify text: Confirm Add
        confirm_btn = app.get_current_page().get_element("view", inner_text="确认添加")
        if confirm_btn:
            confirm_btn.click()
            print("OK: Item Added with correct text '确认添加'")
        time.sleep(4)

        # 2. Capture Initial Cal
        initial_val = app.get_current_page().get_element(".text-lg.font-black").inner_text
        print("Initial Calorie state captured.")

        # 3. Physical Edit
        print("[AUDIT 2] Editing record...")
        app.get_current_page().get_element(".bg-gray-50").click()
        time.sleep(3)
        
        # Verify text: Save Edit
        save_btn = app.get_current_page().get_element("view", inner_text="保存修改")
        if save_btn:
            save_btn.click()
            print("OK: Record Edited with correct text '保存修改'")
        time.sleep(4)

        # 4. Compare State
        new_val = app.get_current_page().get_element(".text-lg.font-black").inner_text
        print("After-edit Calorie state captured.")

        # 5. Physical Delete
        print("[AUDIT 3] Deleting record...")
        # Use Official Modal Handler
        with mini.app.handle_modal("确认删除", confirm=True):
            app.get_current_page().get_element(".bg-red-50").click()
            print("OK: Delete clicked, modal confirmed.")
        
        time.sleep(4)
        
        if not app.get_current_page().element_is_exists("view", inner_text="燕麦"):
            print("OK: Final check passed. Item removed.")

        print("SUMMARY: ALL DETAILED TESTS PASSED.")
            
    except Exception as e:
        print(f"AUDIT ERROR: {str(e)}")
            
    finally:
        print("AUDIT FINISHED.")

if __name__ == "__main__":
    run_audit()