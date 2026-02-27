import minium
import time

class PlanToRecordFullFlowTest(minium.MiniTest):
    """
    饮食计划全链路闭环测试 (基于 V7.7 真实代码)
    补全验证：参数原地更新、修改回退草稿、同名去重匹配、多餐次兼容
    规则：严禁注入，模拟真实用户点击
    """

    def setUp(self):
        super(PlanToRecordFullFlowTest, self).setUp()
        print("\n🌅 [Setup] Starting Full Flow Test...")
        # 1. 确保在登录页
        self.app.relaunch("/pages/login/index")
        time.sleep(2)
        
        # 2. 点击 Mock 登录按钮 (模拟真实点击)
        print("🔑 Attempting Mock Login...")
        page = self.app.get_current_page()
        mock_btn = page.get_element("view", inner_text="🛠️ 开发者入口: 点击 Mock 登录")
        if mock_btn:
            mock_btn.click()
            self.app.wait_for_page("/pages/index/index", timeout=10)
            print("✅ Mock Login Success.")
        else:
            if page.path != "pages/index/index":
                self.fail("Login failed: Mock button not found and not on index page.")

    def test_full_flow_with_edge_cases(self):
        """
        全链路验证方案补全版
        """
        # --- 第一阶段：计划创建 ---
        print("\n🚀 [Phase 1] Plan Creation...")
        self.app.switch_tab("/pages/plan/index")
        self.app.wait_for_page("/pages/plan/index")
        page = self.app.get_current_page()
        
        # 记录初始计划数
        initial_plan_count = len(page.get_elements("view.plan-card"))
        
        # 点击新建
        page.get_element("view[data-test-id='btn-nav-create']").click()
        time.sleep(1)
        self.app.get_current_page().get_element("view", inner_text="手动创建").click()
        self.app.wait_for_page("/pages/plan-creator/index")
        
        # 输入信息
        page = self.app.get_current_page()
        plan_name = f"AUTO_FIX_{int(time.time())}"
        page.get_element("input[placeholder*='21天']").input(plan_name)
        page.get_element("view", inner_text="碳循环").click()
        page.get_element("view", inner_text="下一步").click()
        
        self.app.wait_for_page("/pages/carb-cycle-setup/index", timeout=10)
        
        # --- 第二阶段：参数与模板配置 ---
        print("\n⚙️ [Phase 2] Configuration...")
        page = self.app.get_current_page()
        page.get_element("input[type='digit']").input("70")
        page.get_element("view", inner_text="下一步").click()
        time.sleep(1)
        
        # 处理重置确认弹窗
        print("💡 Confirming Reset Modal...")
        self.app.current_page.handle_modal("confirm")
        self.app.wait_for_page("/pages/plan-templates/index")
        
        # 输入信息
        page = self.app.get_current_page()
        plan_name = f"AUTO_FIX_{int(time.time())}"
        page.get_element("input[placeholder*='21天']").input(plan_name)
        self.app.hide_keyboard() # 🚀 规避键盘遮挡
        page.get_element("view", inner_text="碳循环").click()
        page.get_element("view", inner_text="下一步").click()
        
        self.app.wait_for_page("/pages/carb-cycle-setup/index", timeout=10)
        
        # --- 第二阶段：参数与模板配置 ---
        print("\n⚙️ [Phase 2] Configuration...")
        page = self.app.get_current_page()
        page.get_element("input[type='digit']").input("70")
        self.app.hide_keyboard()
        page.get_element("view", inner_text="下一步").click()
        time.sleep(1)
        
        # 处理重置确认弹窗
        print("💡 Confirming Reset Modal...")
        self.app.current_page.handle_modal("confirm")
        self.app.wait_for_page("/pages/plan-templates/index")
        
        # 为第一天添加“鸡蛋” x 2 和 “自定义餐次”
        page = self.app.get_current_page()
        page.get_elements("view.template-card")[0].click()
        self.app.wait_for_page("/pages/edit-template/index")
        
        # 1. 早餐添加两个鸡蛋 (验证堆栈匹配)
        for i in range(2):
            self.app.get_current_page().get_element("view", inner_text="早餐").click()
            self.app.wait_for_page("/pages/meal-config/index")
            self.app.get_current_page().get_element("view", inner_text="+ 添加食材").click()
            time.sleep(1)
            self.app.get_current_page().get_element("input[placeholder*='搜索']").input("鸡蛋")
            self.app.hide_keyboard()
            time.sleep(2)
            self.app.get_current_page().get_element("view.food-item-card").click()
            time.sleep(1)
            self.app.get_current_page().get_element("view", inner_text="确定").click()
            time.sleep(1)
            self.app.get_current_page().get_element("view", inner_text="完成").click()
            self.app.wait_for_page("/pages/edit-template/index")

        # 2. 添加自定义餐次 “练前餐” (验证动态餐次渲染)
        print("🍽️ Adding custom meal: 练前餐")
        self.app.get_current_page().get_element("view", inner_text="+ 新增餐次").click()
        time.sleep(1)
        self.app.get_current_page().get_element("input[placeholder*='最多5个字']").input("练前餐")
        self.app.hide_keyboard()
        self.app.get_current_page().get_element("view", inner_text="确认添加").click()
        time.sleep(1)
        
        # 在练前餐中添加一个“香蕉”
        self.app.get_current_page().get_element("view", inner_text="练前餐").click()
        self.app.wait_for_page("/pages/meal-config/index")
        self.app.get_current_page().get_element("view", inner_text="+ 添加食材").click()
        time.sleep(1)
        self.app.get_current_page().get_element("input[placeholder*='搜索']").input("香蕉")
        self.app.hide_keyboard()
        time.sleep(2)
        self.app.get_current_page().get_element("view.food-item-card").click()
        self.app.get_current_page().get_element("view", inner_text="确定").click()
        self.app.get_current_page().get_element("view", inner_text="完成").click()
        self.app.wait_for_page("/pages/edit-template/index")
        
        self.app.get_current_page().get_element("view", inner_text="保存此天配置").click()
        self.app.wait_for_page("/pages/plan-templates/index")
        
        # 确认计划
        self.app.get_current_page().get_element("view", inner_text="确认计划").click()
        self.app.wait_for_page("/pages/plan/index", timeout=10)

        # --- [补全] 4.1 章节验证：原地更新保护 ---
        print("\n🛡️ [Verify 4.1] Non-destructive Parameter Update...")
        page = self.app.get_current_page()
        
        # 找到刚刚创建的计划并点击“查看详情”
        target_card = None
        for card in page.get_elements("view.plan-card"):
            if plan_name in card.inner_text:
                target_card = card
                break
        
        if not target_card: self.fail("Created plan card not found")
        target_card.get_element("view", inner_text="查看详情").click()
        self.app.wait_for_page("/pages/plan-detail/index")
        
        # 点击左上角菜单 -> 编辑计划
        menu_btn = self.app.get_current_page().get_element("view.w-10.h-10 .flex-col")
        menu_btn.click()
        time.sleep(1)
        self.app.current_page.handle_action_sheet(0) 
        
        self.app.wait_for_page("/pages/plan-creator/index")
        self.app.get_current_page().get_element("view", inner_text="下一步").click()
        self.app.wait_for_page("/pages/carb-cycle-setup/index")
        
        # 修改体重为 80kg
        self.app.get_current_page().get_element("input[type='digit']").input("80")
        self.app.hide_keyboard()
        self.app.get_current_page().get_element("view", inner_text="下一步").click()
        time.sleep(1)
        
        # 验证原地更新确认弹窗
        print("💡 Confirming In-place Update Modal...")
        self.app.current_page.handle_modal("confirm")
        
        self.app.wait_for_page("/pages/plan-templates/index")
        # 验证食材是否依然存在
        first_day_info = self.app.get_current_page().get_elements("view.template-card")[0].inner_text
        if "蛋" not in first_day_info or "香蕉" not in first_day_info:
            self.fail("Complex food items were lost after parameter update!")
        print("✨ In-place update verified: Multiple items preserved.")
        
        # 再次回到列表页
        self.app.get_current_page().get_element("view", inner_text="确认计划").click()
        self.app.wait_for_page("/pages/plan/index")

        # --- 第三阶段：激活与首页打卡 ---
        print("\n✅ [Phase 3] Activation & Punch Flow...")
        page = self.app.get_current_page()
        
        # 激活
        target_card = None
        for card in page.get_elements("view.plan-card"):
            if plan_name in card.inner_text:
                target_card = card
                break
        target_card.get_element("view", inner_text="激活").click()
        time.sleep(2)
        
        # 跳转首页
        self.app.switch_tab("/pages/index/index")
        self.app.wait_for_page("/pages/index/index")
        
        # 🚀 区域定位辅助函数：定位特定的餐次卡片
        def get_meal_card(name):
            cards = self.app.get_current_page().get_elements("view.glass-card")
            for c in cards:
                if name in c.inner_text: return c
            return None

        # [Verify 4.4] 动态餐次校验
        print("\n🔍 [Verify 4.4] Dynamic Meal Check...")
        self.assertIsNotNone(get_meal_card("练前餐"), "Custom meal '练前餐' should be visible on home page")
        
        # [Verify 4.2] 手动记录填补坑位
        print("\n🔍 [Verify 4.2] Manual Record Fill Matching...")
        breakfast_card = get_meal_card("早餐")
        # 模拟手动在早餐添加一个鸡蛋
        breakfast_card.get_element("view", inner_text="+ 添加食物").click()
        self.app.wait_for_page("/pages/food/index")
        self.app.get_current_page().get_element("input[placeholder*='搜索']").input("鸡蛋")
        self.app.hide_keyboard()
        time.sleep(2)
        self.app.get_current_page().get_element("view.food-item-card").click()
        self.app.get_current_page().get_element("view", inner_text="确定").click()
        
        # 等待数据刷回首页
        time.sleep(2) 
        page = self.app.get_current_page()
        breakfast_card = get_meal_card("早餐")
        
        # 断言：早餐中有2个鸡蛋建议，手动加1个后，该卡片内应剩余1个“打卡”按钮
        punch_btns = breakfast_card.get_elements("view", inner_text="打卡")
        if len(punch_btns) != 1:
            self.fail(f"Matching logic failed in Breakfast. Expected 1 punch button, found {len(punch_btns)}")
        print("✨ Deduplication Matching verified: Manual entry filled 1 of 2 plan slots.")

        # [Verify 4.5] 一键记录验证
        print("\n🚀 [Verify 4.5] One-click Sync & Idempotency...")
        # 点击早餐卡片的一键记录
        breakfast_card.get_element("view", inner_text="一键记录").click()
        time.sleep(3)
        
        # 断言：早餐的所有打卡按钮应该消失
        breakfast_card = get_meal_card("早餐")
        self.assertEqual(len(breakfast_card.get_elements("view", inner_text="打卡")), 0, "Breakfast should have 0 unrecorded items")
        
        # 验证练前餐项依然存在
        pre_workout_card = get_meal_card("练前餐")
        self.assertEqual(len(pre_workout_card.get_elements("view", inner_text="打卡")), 1, "Pre-workout should still have 1 unrecorded item")
        print("✨ One-click sync verified: Recorded remaining items selectively.")

        # [Verify 3.6] 修改回退验证
        print("\n🔄 [Verify 3.6] Edit & Rollback...")
        # 在早餐中点击一个“鸡蛋”
        breakfast_card.get_element("view", inner_text="鸡蛋").click()
        time.sleep(1)
        self.app.current_page.handle_modal("confirm")
        
        page = self.app.get_current_page()
        qty_input = page.get_element("input[type='digit']")
        qty_input.input("250")
        self.app.hide_keyboard()
        page.get_element("view", inner_text="保存修改").click()
        time.sleep(2)
        
        # 断言：修改后状态应退回为“置灰/未记录”，在该卡片内重新出现“打卡”按钮
        breakfast_card = get_meal_card("早餐")
        self.assertTrue(breakfast_card.get_element("view", inner_text="打卡"), "Item should rollback to draft status after quantity change")
        
        print("\n🎉 ALL Safeguards (4.1-4.5) verified with Scoped Locators and Keyboard handling.")

    def tearDown(self):
        super(PlanToRecordFullFlowTest, self).tearDown()
