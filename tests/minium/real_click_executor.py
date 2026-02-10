import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def run_real_click_test():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    
    print("\n🚀 [AUTO-SIM] Starting physical click flow...")
    mini = minium.Minium(conf)
    app = mini.app
    
    try:
        # 1. Auth & Home
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        app.call_wx_method("setStorageSync", ["access_token", token])
        app.relaunch("/pages/index/index")
        time.sleep(5)
        
        # 2. Click Add Button
        print("👉 Step 1: Clicking '+ 添加食物'...")
        page = app.get_current_page()
        add_btn = page.get_element("view", inner_text="+ 添加食物")
        if not add_btn:
            print("❌ Error: '+ 添加食物' button not found")
            return
        add_btn.click()
        time.sleep(2)
        
        # 3. Search for item
        print("👉 Step 2: Typing '燕麦'...")
        page = app.get_current_page()
        search_input = page.get_element("input")
        search_input.input("燕麦")
        time.sleep(3)
        
        # 4. Click Result
        print("👉 Step 3: Selecting search result...")
        page = app.get_current_page()
        # 精准匹配结果项文本
        target = page.get_element("view", inner_text="燕麦")
        if not target:
            target = page.get_element(".rounded-xl", inner_text="燕麦")
        
        if not target:
            print("❌ Error: '燕麦' result not visible")
            return
        target.click()
        time.sleep(3) # 重要：等待二级详情弹窗完全渲染
        
        # 5. Confirm in detail modal
        print("👉 Step 4: Clicking '确认添加' button...")
        page = app.get_current_page()
        # 同步组件中的真实文本：确认添加
        confirm_btn = page.get_element("view", inner_text="确认添加")
        if not confirm_btn:
            # 备选路径：根据 CSS 特征寻找
            confirm_btn = page.get_element(".bg-emerald-600")
            
        if not confirm_btn:
            print("❌ Error: Could not locate confirmation button in detail modal")
            return
        confirm_btn.click()
        time.sleep(3)
        
        # 6. Final Validation
        print("👉 Step 5: Final UI verification on home page...")
        page = app.get_current_page()
        if page.element_is_exists("view", inner_text="燕麦"):
            print("✅ SUCCESS: Added item '燕麦' is now visible! Flow verified.")
        else:
            print("❌ FAILED: Home page did not refresh with the new item.")
            
    finally:
        print("🏁 Simulation Finished.")

if __name__ == "__main__":
    run_real_click_test()
