import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def run_log_audit():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    
    print("--- LOG INFILTRATION START ---")
    mini = minium.Minium(conf)
    app = mini.app
    
    try:
        # Auth
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        app.call_wx_method("setStorageSync", ["access_token", token])
        app.relaunch("/pages/index/index")
        time.sleep(5)
        
        page = app.get_current_page()
        
        # 1. 物理动作：点击编辑
        print("[ACTION] Clicking Edit Button...")
        edit_btn = page.get_element(".bg-gray-50")
        if edit_btn:
            edit_btn.click()
            time.sleep(3)
        
        # 2. 日志监听：从 Page 实例获取 console 日志
        print("--- [REALTIME FRONTEND LOGS] ---")
        logs = page.get_app_log()
        for log in logs:
            print(f">> CONSOLE: {log.get('message', '')}")
        
        # 3. 深度探测：检查 Vue 响应式状态是否锁死
        print("\n[ACTION] Deep Probing Vue State...")
        is_loading = app.evaluate("require('@/stores/record').useRecordStore().isLoading")
        print(f">> Store Loading State: {is_loading}")
        
        if is_loading:
            print(">> WARNING: Store is stuck in loading state!")
        else:
            print(">> SUCCESS: Store state is healthy.")

    finally:
        print("--- AUDIT FINISHED ---")

if __name__ == "__main__":
    run_log_audit()
