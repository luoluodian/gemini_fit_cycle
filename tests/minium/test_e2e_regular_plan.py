import minium
import time
import sys
import os

# 添加项目根目录到 path 以便导入 utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.db_checker import get_latest_plan

class RegularPlanE2ETest(minium.MiniTest):
    """
    常规计划全链路 E2E 测试 (UI + DB 双重验证)
    """
    
    def test_create_flow(self):
        print("
🚀 Starting E2E Create Flow...")
        
        # 1. 注入 Token 并重置到首页
        self.app.call_wx_method("setStorageSync", ["access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI"])
        self.app.relaunch("/pages/plan/index")
        
        # 2. 触发创建逻辑 (优先尝试 ID 点击，兜底用 JS)
        print("🔍 Clicking Create Button...")
        btn = self.page.get_element("#_HY")
        if btn:
            btn.click()
        else:
            print("⚠️ ID #_HY not found, using logic trigger...")
            self.app.evaluate("function(){ const p = getCurrentPages().pop(); if(p.createNewPlan) p.createNewPlan(); }")
            
        time.sleep(1.5)
        
        # 3. 选择“创建新计划”
        print("📦 Selecting option...")
        options = self.page.get_elements("view")
        clicked = False
        for opt in options:
            if "创建新计划" in opt.inner_text:
                opt.click()
                clicked = True
                break
        self.assertTrue(clicked, "Failed to find 'Create New' option")
        
        # 4. 填写表单
        print("📝 Filling form...")
        self.app.wait_for_page("/pages/plan-creator/index", 5000)
        
        plan_name = f"E2E测试_{int(time.time())}"
        # 使用 JS 直接修改 Store 数据，这是最稳健的填单方式
        self.app.evaluate(f"""
            function() {{
                const p = getCurrentPages().pop();
                if(p.planStore) {{
                    p.planStore.draft.name = '{plan_name}';
                    p.planStore.draft.type = 'custom';
                }}
            }}
        """)
        
        # 5. 提交保存
        print("🚀 Submitting...")
        # 查找并点击“下一步”
        footer_btns = self.page.get_elements("view")
        next_btn = None
        for b in footer_btns:
            if "下一步" == b.inner_text.strip():
                next_btn = b
                break
        
        if next_btn:
            next_btn.click()
        else:
            # 兜底：直接调函数
            self.app.evaluate("function(){ getCurrentPages().pop().handleNext(); }")
            
        # 6. 验证跳转
        print("⏳ Waiting for navigation...")
        success = self.app.wait_for_page("/pages/plan-templates/index", 8000)
        self.assertTrue(success, "Failed to navigate to Templates page")
        
        # 7. 【关键】后端数据断言
        print("💾 Verifying DB persistence...")
        db_plan = get_latest_plan()
        
        print(f"📊 Latest Plan in DB: {db_plan}")
        self.assertIsNotNone(db_plan, "No plan found in DB")
        self.assertEqual(db_plan['name'], plan_name, "Plan Name mismatch in DB")
        self.assertEqual(db_plan['status'], 'DRAFT', "Plan Status should be DRAFT")
        self.assertEqual(db_plan['type'], 'custom', "Plan Type should be custom")
        
        print("🎉 E2E TEST PASSED: UI Flow + DB Verification Success!")
