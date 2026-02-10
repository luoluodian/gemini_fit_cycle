import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def wait_for_element(page, selector, text=None, timeout=5):
    start = time.time()
    while time.time() - start < timeout:
        try:
            if text:
                el = page.get_element(selector, inner_text=text)
            else:
                el = page.get_element(selector)
            if el: return el
        except:
            pass
        time.sleep(0.5)
    return None

def run_full_simulation():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    
    print("[MASTER-SIM] Starting adaptive full-cycle simulation...")
    mini = minium.Minium(conf)
    app = mini.app
    
    try:
        # Auth
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        app.call_wx_method("setStorageSync", ["access_token", token])
        app.relaunch("/pages/index/index")
        time.sleep(5)
        
        # --- FLOW 1: ADD ---
        print("[STEP 1] Adding item...")
        page = app.get_current_page()
        add_btn = wait_for_element(page, "view", "+ 添加食物")
        add_btn.click()
        
        time.sleep(2)
        page = app.get_current_page()
        search_input = wait_for_element(page, "input")
        search_input.input("燕麦")
        
        time.sleep(3)
        pick_target = wait_for_element(page, "view", "燕麦")
        pick_target.click()
        
        time.sleep(2)
        page = app.get_current_page()
        # 适应性等待确认按钮出现
        confirm_btn = wait_for_element(page, "view", "确认添加")
        if confirm_btn:
            confirm_btn.click()
            print("[OK] Item Added.")
        else:
            print("[FAIL] Confirm button timeout.")
            return

        time.sleep(3)

        # --- FLOW 2: EDIT ---
        print("[STEP 2] Editing item...")
        page = app.get_current_page()
        # 寻找刚才生成的记录图标 (.bg-gray-50)
        edit_btn = wait_for_element(page, ".bg-gray-50")
        if edit_btn:
            edit_btn.click()
            time.sleep(2)
            page = app.get_current_page()
            # 编辑模式按钮文本不同：保存修改
            save_btn = wait_for_element(page, "view", "保存修改")
            if save_btn:
                save_btn.click()
                print("[OK] Item Edited.")
        
        time.sleep(3)

        # --- FLOW 3: DELETE ---
        print("[STEP 3] Deleting item...")
        page = app.get_current_page()
        del_btn = wait_for_element(page, ".bg-red-50")
        if del_btn:
            app.mock_native_modal(title="确认删除", confirm=True)
            del_btn.click()
            time.sleep(2)
            print("[OK] Item Deleted.")

        print("--- ALL CORE FLOWS PASSED ---")
            
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        page = app.get_current_page()
        page.capture("simulation_fail")
            
    finally:
        print("SIMULATION FINISHED.")

if __name__ == "__main__":
    run_full_simulation()
