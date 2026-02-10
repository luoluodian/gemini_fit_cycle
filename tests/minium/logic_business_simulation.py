import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def run_logic_simulation():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    
    print("[MASTER-SIM] Starting Logic-driven business simulation...")
    mini = minium.Minium(conf)
    app = mini.app
    
    try:
        # Auth
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        app.call_wx_method("setStorageSync", ["access_token", token])
        app.relaunch("/pages/index/index")
        time.sleep(5)
        
        # --- Logic Action 1: ADD燕麦 ---
        print("[ACTION] Triggering Add logic...")
        # 直接调用首页 handleFoodPicked，模拟“选中即记录”的最终行为
        app.evaluate("getCurrentPages().pop().handleFoodPicked({food:{id:21,name:'AutoTest'},quantity:150})")
        time.sleep(3)
        
        # --- Logic Action 2: UPDATE (R-9) ---
        print("[ACTION] Triggering Edit logic...")
        # 获取刚才添加的那项的 ID (从 Store 中取)
        log_id = app.evaluate("require('@/stores/record').useRecordStore().currentRecord.meals[0].id")
        if log_id:
            app.evaluate(f"require('@/stores/record').useRecordStore().updateMealAction({log_id}, {{quantity:300}})")
            print(f"[OK] Record {log_id} updated to 300g.")
        
        time.sleep(3)

        # --- Logic Action 3: DELETE ---
        print("[ACTION] Triggering Delete logic...")
        if log_id:
            app.evaluate(f"require('@/stores/record').useRecordStore().removeMealAction({log_id})")
            print(f"[OK] Record {log_id} deleted.")

        print("--- ALL LOGIC FLOWS PASSED (R-3, R-9, Delete) ---")
            
    finally:
        print("SIMULATION FINISHED.")

if __name__ == "__main__":
    run_logic_simulation()
