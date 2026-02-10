import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def get_backend_logs():
    log_path = f"{PROJECT_ROOT}/fit_cycle_app/logs/info/app-{time.strftime('%Y-%m-%d')}.log"
    if os.path.exists(log_path):
        with open(log_path, "r") as f:
            lines = f.readlines()
            return "".join(lines[-10:]).replace("\n", " | ")
    return "Log not found."

def run_audit():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    
    print("--- MONITORING AUDIT START ---")
    mini = minium.Minium(conf)
    app = mini.app
    
    try:
        # Auth
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        app.call_wx_method("setStorageSync", ["access_token", token])
        app.relaunch("/pages/index/index")
        time.sleep(5)
        
        # 1. EDIT
        print("[STEP 1] Testing EDIT...")
        page = app.get_current_page()
        edit_btn = page.get_element(".bg-gray-50")
        if edit_btn:
            edit_btn.click()
            time.sleep(3)
            save_btn = app.get_current_page().get_element("view", inner_text="保存修改")
            if save_btn:
                save_btn.click()
                print("UI: Save button clicked.")
                time.sleep(3)
                print(f"Backend: {get_backend_logs()}")
        
        # 2. DELETE
        print("[STEP 2] Testing DELETE...")
        del_btn = app.get_current_page().get_element(".bg-red-50")
        if del_btn:
            with app.handle_modal("确认删除", confirm=True):
                del_btn.click()
                print("UI: Delete icon clicked and Modal confirmed.")
            
            time.sleep(4)
            print(f"Backend After Delete: {get_backend_logs()}")
            
            if not app.get_current_page().element_is_exists(".bg-red-50"):
                print("UI Check: Item removed from DOM.")
            else:
                print("UI Check: FAILED, item still visible.")

        # Frontend Logs
        fe_logs = app.get_app_log()
        if fe_logs:
            print(f"Frontend Last Log: {fe_logs[-1]}")

    finally:
        print("--- AUDIT FINISHED ---")

if __name__ == "__main__":
    run_audit()