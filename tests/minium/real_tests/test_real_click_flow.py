import minium
import time
import os
import json
from .base_test import BaseTest

class RealClickTest(BaseTest):
    """
    真实人工点击操作流程测试 (Real Human Simulation)
    覆盖：首页 -> 弹窗 -> 搜索 -> 选中 -> 确定 -> 首页刷新
    """

    @classmethod
    def setUpClass(cls):
        # 物理加载 config.json 以确保端口对齐 (46910)
        config_path = os.path.join(os.path.dirname(__file__), "..", "config.json")
        with open(config_path, "r") as f:
            cls.CONFIG = json.load(f)
        
        # 强制更新 cls.CONFIG 以适配 Minium 驱动
        # 注意：BaseTest 内部会使用 cls.CONFIG 初始化 app
        super(RealClickTest, cls).setUpClass()

    def test_add_food_simulation(self):
        print("\n[STEP] Starting Real Human Simulation Test...")
        
        # 1. 确保登录并进入首页
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8"
        self.app.call_wx_method("setStorageSync", ["access_token", token])
        self.app.relaunch("/pages/index/index")
        time.sleep(5)
        
        # 2. 点击“+ 添加食物”按钮 (物理点击)
        print("[STEP 1] Clicking '+ Add Food' button...")
        add_btn = self.page.get_element("view", inner_text="+ 添加食物")
        if not add_btn:
            self.capture("btn_not_found")
            self.fail("Could not find '+ Add Food' button")
        add_btn.click() 
        time.sleep(2)

        # 3. 模拟搜索输入 (物理输入)
        print("[STEP 2] Typing in search bar...")
        # SearchBar 内部有一个真实的 input 标签
        search_input = self.page.get_element("input")
        if not search_input:
            self.fail("Search input not found")
        search_input.input("燕麦")
        time.sleep(3) # 等待后端防抖搜索加载

        # 4. 点击搜索结果列表项 (物理选中)
        print("[STEP 3] Selecting food item...")
        # 点击包含“燕麦”文本的项
        target_food = self.page.get_element("view", inner_text="燕麦")
        if not target_food:
            # 兼容性：点击第一个卡片
            target_food = self.page.get_element(".rounded-xl")
        
        if not target_food:
            self.capture("no_search_results")
            self.fail("No food items visible in search list")
        
        target_food.click()
        time.sleep(2)

        # 5. 确认添加 (物理确定)
        print("[STEP 4] Confirming in detail modal...")
        confirm_btn = self.page.get_element("view", inner_text="确定添加")
        if not confirm_btn:
            confirm_btn = self.page.get_element("view", inner_text="确定")
        
        if not confirm_btn:
            self.capture("confirm_btn_not_found")
            self.fail("Confirm button not found")
        
        confirm_btn.click()
        time.sleep(3)

        # 6. 首页结果检查
        print("[STEP 5] Verifying result on home page...")
        # 人工核查首页是否出现了新卡片
        final_check = self.page.element_is_exists("view", inner_text="燕麦")
        if final_check:
            print("✅ [SUCCESS] Real click flow completed!")
        else:
            self.capture("verify_failed")
            self.fail("Added item not visible in UI list")

    def tearDown(self):
        super(RealClickTest, self).tearDown()