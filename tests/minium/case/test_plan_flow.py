import minium
import time
from .base_test import BaseTest

class PlanFlowTest(BaseTest):
    """
    饮食计划核心链路测试 - 增强版
    """
    def test_create_plan_navigation(self):
        """
        测试：从列表页点击新建，是否能正确跳转至创建向导
        """
        print("\n🏃 Starting test_create_plan_navigation...")
        
        # 1. 注入 Token 后，给予小程序一点初始化时间
        time.sleep(2)
        
        self.navigate_to_plan()
        print("📍 Current Page Path:", self.app.get_current_page().path)
        
        # 2. 查找“新建”按钮 (使用刚才添加的 data-test-id)
        # 优先级：data-test-id > inner_text
        new_btn = self.page.get_element("view[data-test-id='btn-create-plan']")
        
        if not new_btn:
            print("⚠️ Button with data-test-id not found, falling back to text search...")
            new_btn = self.page.get_element("view", inner_text="创建新计划")
            
        if not new_btn:
            # 尝试通过父级容器或其它逻辑寻找按钮
            self.capture("create_plan_btn_not_found")
            raise Exception("❌ [Error] 'Create New Plan' button not found on page.")

        print("✅ Found 'New Plan' button. Clicking...")
        new_btn.click()
        
        # 3. 验证页面跳转
        # 由于涉及 API 调用，设置 5s 超时
        success = self.app.wait_for_page("/pages/plan-creator/index", timeout=5)
        
        if success:
            print("✅ Jumped to Plan Creator page.")
            self.assertEqual(self.app.get_current_page().path, "pages/plan-creator/index")
        else:
            print("❌ Failed to jump to Plan Creator within 5s.")
            self.capture("navigation_timeout")
            self.fail("Navigation to Plan Creator timed out.")

    def test_carb_cycle_setup_flow(self):
        """
        验证碳循环设置流程的数据完整性 (Stub)
        """
        pass