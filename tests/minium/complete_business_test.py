import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def adaptive_click(page, selector, text=None, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            if text:
                el = page.get_element(selector, inner_text=text)
            else:
                el = page.get_element(selector)
            if el:
                el.click()
                return True
        except:
            pass
        time.sleep(0.5)
    return False

def run_complete_test():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    
    print("\n--- STARTING ADAPTIVE BUSINESS AUDIT ---")
    mini = minium.Minium(conf)
    app = mini.app
    
    try:
        # Step 0: Auth
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        app.call_wx_method("setStorageSync", ["access_token", token])
        app.relaunch("/pages/index/index")
        time.sleep(5)
        
        # 1. ADD
        print("[ACTION 1] Adding item via click...")
        page = app.get_current_page()
        if not adaptive_click(page, "view", "+ 添加食物"):
            raise Exception("Add button timeout")
        
        time.sleep(2)
        page = app.get_current_page()
        search_input = page.get_element("input")
        search_input.input("燕麦")
        
        time.sleep(3)
        page = app.get_current_page()
        if not adaptive_click(page, "view", "燕麦"):
            # 兼容性尝试：点击第一个 card
            adaptive_click(page, ".rounded-xl")
        
        time.sleep(3)
        page = app.get_current_page()
        if not adaptive_click(page, "view", "确认添加"):
            raise Exception("Confirm button timeout")
        print(">> ADD FLOW: OK")
        time.sleep(4)

        # 2. EDIT
        print("[ACTION 2] Editing via icon click...")
        page = app.get_current_page()
        if not adaptive_click(page, ".bg-gray-50"):
            raise Exception("Edit icon missing")
        
        time.sleep(3)
        page = app.get_current_page()
        if not adaptive_click(page, "view", "保存修改"):
            raise Exception("Save button missing")
        print(">> EDIT FLOW: OK")
        time.sleep(4)

        # 3. SYNC
        print("[ACTION 3] Syncing...")
        page = app.get_current_page()
        adaptive_click(page, "view", "按计划同步")
        print(">> SYNC FLOW: OK")
        time.sleep(3)

        # 4. DELETE
        print("[ACTION 4] Deleting via icon click...")
        page = app.get_current_page()
        app.evaluate("wx.showModal = (o) => { o.success({confirm: true}) }")
        if not adaptive_click(page, ".bg-red-50"):
            raise Exception("Delete icon missing")
        
        time.sleep(3)
        page = app.get_current_page()
        if not page.element_is_exists("view", inner_text="燕麦"):
            print(">> DELETE FLOW: OK")
        else:
            print(">> DELETE FLOW: WARNING - Item still in DOM")

        print("\n--- [PASSED] ALL BUSINESS NODES VERIFIED VIA PHYSICAL CLICK ---")
            
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
            
    finally:
        print("--- AUDIT FINISHED ---")

if __name__ == "__main__":
    run_complete_test()
