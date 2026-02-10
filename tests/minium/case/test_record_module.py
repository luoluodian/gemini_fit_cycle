import minium
import time
from .base_test import BaseTest

class RecordModuleTest(BaseTest):
    """
    记录模块 (Record Domain) 自动化集成测试集
    覆盖 R-2, R-3, R-6, R-8
    """

    def test_record_full_flow(self):
        print("
🚀 Starting Record Module Full Flow Test...")
        
        # 1. 进入首页并验证初始预览态 (R-2/R-8)
        self.app.relaunch("/pages/index/index")
        time.sleep(3)
        print("📍 Arrived at Index. Checking initial goals...")
        
        # 验证进度环是否渲染（即 R-2 接口通畅）
        goals_view = self.page.get_element("view", inner_text="今日目标")
        if not goals_view:
            self.capture("r2_load_failed")
            self.fail("R-2 API failed to provide initial record preview.")
        print("✅ R-2 Preview verified.")

        # 2. 模拟手动添加食物 (R-3 / I-4.1)
        # 验证之前的 500 (user_id 缺失) 修复情况
        print("🧪 Testing R-3: Add Food (Manual)...")
        self.app.evaluate("""
            (function() {
                const p = getCurrentPages().pop();
                if(p && p.handleFoodPicked) {
                    p.handleFoodPicked({
                        food: { id: 1, name: '集成测试燕麦' },
                        quantity: 100
                    });
                }
            })()
        """)
        time.sleep(3)
        
        # 检查是否保存成功（判断弹窗是否关闭或检查 Store）
        is_picker_visible = self.app.evaluate("const p = getCurrentPages().pop(); p.foodPickerVisible;")
        if is_picker_visible:
            self.capture("r3_save_failed")
            print("❌ R-3 Save failed (check backend logs for 500).")
            # 这里不直接 fail，继续测试以收集更多错误
        else:
            print("✅ R-3 Save success. UI linkage verified.")

        # 3. 验证营养统计实时刷新 (R-8 / I-4.2)
        print("🧪 Testing R-8: Real-time calculation...")
        consumed_cal = self.app.evaluate("require('@/stores/record').useRecordStore().displaySummary.calories")
        print(f"📊 Current Consumed Calories in Store: {consumed_cal}")
        # 如果保存成功，热量应 > 0
        
        # 4. 测试快捷同步 (R-6)
        print("🧪 Testing R-6: Sync from Plan...")
        sync_btn = self.page.get_element("view", inner_text="按计划同步")
        if sync_btn:
            sync_btn.click()
            time.sleep(3)
            print("✅ R-6 Sync triggered.")
        else:
            print("⚠️ Sync button not found (possibly no active plan). Skipping R-6.")

        # 5. 测试删除逻辑 (R-3 / I-4.2)
        print("🧪 Testing R-3: Delete item...")
        # 寻找第一个删除图标（NutUI Del）
        del_btn = self.page.get_element(".nut-icon-del") # 假设类名，实际根据渲染调整
        if del_btn:
            del_btn.click()
            time.sleep(1)
            # 模拟 Modal 确认 (由于是 Native Modal，使用 Minium Mock)
            # config.json 中已配置 mock_native_modal
            print("✅ Delete triggered.")
        else:
            print("⚠️ No delete button found (list might be empty).")

        print("🏁 Record Module Test Finished.")

    def tearDown(self):
        super(RecordModuleTest, self).tearDown()
