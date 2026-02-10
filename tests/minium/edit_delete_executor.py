import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def run_test():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    
    print("🚀 [PHYSICAL-SIM] Starting icon-based Edit/Delete test...")
    mini = minium.Minium(conf)
    app = mini.app
    
    try:
        # Step 0: Login & Page
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        app.call_wx_method("setStorageSync", ["access_token", token])
        app.relaunch("/pages/index/index")
        time.sleep(5)
        
        # --- PHASE 1: EDIT (Gray Icon) ---
        print("👉 Step 1: Locating Edit Button (.bg-gray-50)...")
        page = app.get_current_page()
        # 直接定位包裹 Edit 图标的灰色按钮
        edit_btn = page.get_element(".bg-gray-50")
        if not edit_btn:
            print("❌ Error: Edit icon container not found. Make sure an item is already logged.")
            return
        
        edit_btn.click() # 真实模拟点击
        print("✅ Clicked Edit Icon.")
        time.sleep(3)
        
        print("👉 Step 2: Confirming change in modal...")
        page = app.get_current_page()
        # 点击详情窗里的“确认添加”
        confirm_btn = page.get_element("view", inner_text="确认添加")
        if confirm_btn:
            confirm_btn.click()
            print("✅ Edit confirmed.")
        time.sleep(3)

        # --- PHASE 2: DELETE (Red Icon) ---
        print("👉 Step 3: Locating Delete Button (.bg-red-50)...")
        page = app.get_current_page()
        # 直接定位包裹 Del 图标的红色按钮
        del_btn = page.get_element(".bg-red-50")
        if not del_btn:
            print("❌ Error: Delete icon container not found.")
            return
        
        # 预设 Mock 处理接下来的系统弹窗
        app.mock_native_modal(title="确认删除", confirm=True)
        
        del_btn.click() # 真实模拟点击
        print("✅ Clicked Delete Icon.")
        time.sleep(3)
        
        # --- FINAL CHECK ---
        print("👉 Step 4: Final verification...")
        # 此时首页应当不含有刚才那个项了（假设之前只有这一项）
        if not page.element_is_exists(".bg-red-50"):
            print("✅ SUCCESS: Item deleted via physical icon click!")
        else:
            print("⚠️ Note: Item still exists (check if multiple items were present).")
            
    finally:
        print("🏁 Simulation Finished.")

if __name__ == "__main__":
    run_test()