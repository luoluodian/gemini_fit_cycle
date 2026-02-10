import minium
import time
import os
from .base_test import BaseTest
from utils.db_checker import get_latest_plan

class PlanV77Test(BaseTest):
    """
    Plan 模块 V7.7 自修复与数据回滚自动化测试
    """

    def smart_click(self, selector, backup_selector=None):
        """
        自愈定位策略：首选 selector，失败尝试 backup_selector
        """
        print(f"🔍 Finding element: {selector}")
        el = self.page.get_element(selector)
        if not el and backup_selector:
            print(f"⚠️ Primary selector {selector} failed, trying backup: {backup_selector}")
            el = self.page.get_element(backup_selector)
            if el:
                print("✨ Self-healed: Found element via backup selector.")
        
        if el:
            el.click()
            return True
        return False

    def test_M_FOR_01_create_plan_loop(self):
        """
        M-FOR-01: 计划创建闭环测试
        预期：完成创建后状态变为 active，DRAFT 清理
        """
        print("\n🚀 [M-FOR-01] Testing Plan Creation Loop...")
        self.app.relaunch("/pages/plan/index")
        time.sleep(2)
        self.page = self.app.get_current_page() # 确保 page 是最新的
        
        # 使用智能定位查找新建按钮
        if not self.smart_click("#_HY", "view[data-test-id='btn-create-plan']"):
            print("💡 Trying text fallback for create button...")
            btn = self.page.get_element("view", inner_text="创建新计划")
            if btn:
                btn.click()
            else:
                self.fail("Could not find Create Plan button")

        time.sleep(1)
        # 选择“创建新计划”
        opt = self.app.get_current_page().get_element("view", inner_text="创建新计划")
        if opt:
            opt.click()
        
        self.app.wait_for_page("/pages/plan-creator/index", timeout=5)
        
        plan_name = f"V77_AUTO_{int(time.time())}"
        print(f"⌨️ Submitting plan: {plan_name}")
        
        self.app.evaluate(f"""
            function() {{
                const p = getCurrentPages().pop();
                if(p && p.planStore) {{
                    p.planStore.draft.name = '{plan_name}';
                    p.planStore.draft.type = 'custom';
                    p.handleNext();
                }}
            }}
        """)
        
        self.app.wait_for_page("/pages/plan-templates/index", timeout=8)
        print("📍 Reached Template List.")
        
        # 点击“确认计划”
        self.page = self.app.get_current_page()
        if not self.smart_click("button[type='primary']", "view[inner_text='确认计划']"):
            # 最后的降级逻辑：通过 JS 提交
            self.app.evaluate("function(){ const p = getCurrentPages().pop(); if(p && p.submitPlan) p.submitPlan(); }")
        
        time.sleep(3) 
        latest_plan = get_latest_plan()
        print(f"📊 DB Result: {latest_plan}")
        
        if latest_plan and latest_plan['name'] == plan_name:
            if latest_plan['status'] != 'active':
                self.fail(f"Status is {latest_plan['status']}, expected active")
        else:
            self.fail(f"Plan {plan_name} not found in DB")

    def test_M_FOR_03_quant_feedback(self):
        """
        M-FOR-03: 量化反馈校验
        """
        print("\n🚀 [M-FOR-03] Testing Quant Feedback...")
        # 记录初始
        initial_cal = self.app.evaluate("function(){ return (getApp().planStore.currentDayTarget || {}).currentCalories || 0 }")
        
        food_item = {"name": "TestOats", "calories": 370, "quantity": 100}
        self.app.evaluate(f"function(){{ const p = getCurrentPages().pop(); if(p && p.addFoodToMeal) p.addFoodToMeal('breakfast', {food_item}); }}")
        
        time.sleep(1)
        final_cal = self.app.evaluate("function(){ return (getApp().planStore.currentDayTarget || {}).currentCalories || 0 }")
        print(f"📉 Cal: {initial_cal} -> {final_cal}")
        
        if final_cal != initial_cal + 370:
            self.fail(f"Calculation Error: Expected {initial_cal+370}, got {final_cal}")

    def test_M_REP_01_silent_repair(self):
        """
        M-REP-01: 静默修复
        """
        print("\n🚀 [M-REP-01] Testing Silent Repair...")
        self.app.evaluate("""
            function() {
                const store = getApp().planStore;
                if(store.currentDayTarget) {
                    store.currentDayTarget.meals.breakfast = [{name: 'RepFood', calories: 500}];
                    store.currentDayTarget.currentCalories = 0;
                }
            }
        """)
        self.app.evaluate("function(){ const p = getCurrentPages().pop(); if(p && p.checkDataConsistency) p.checkDataConsistency(); }")
        time.sleep(1)
        repaired = self.app.evaluate("function(){ return (getApp().planStore.currentDayTarget || {}).currentCalories || 0 }")
        if repaired != 500:
            self.fail(f"Repair Failed: Expected 500, got {repaired}")

    def tearDown(self):
        print("🧹 Cleanup...")
        self.app.evaluate("function(){ if(getApp().planStore) getApp().planStore.resetDraft(); }")
        super(PlanV77Test, self).tearDown()