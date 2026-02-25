import minium
import time
from .base_test import BaseTest

class FoodModuleTest(BaseTest):
    """
    Food 模块自动化测试：搜索、筛选、收藏及详情重算
    """

    def test_F_001_search_and_filter(self):
        """
        TC-F-001/002: 关键词搜索与分类筛选
        """
        print("\n🚀 [TC-F-001/002] Testing Food Search and Filter...")
        self.app.relaunch("/pages/food/index")
        time.sleep(2)
        
        # 1. 分类筛选验证
        # 假设分类栏第一个是“全部”，第二个是“蛋白质”
        print("🔍 Switching category to 'Protein'...")
        self.page.get_element(".category-item:nth-child(2)").click()
        time.sleep(1)
        
        # 2. 搜索框验证
        print("⌨️ Searching for '鸡胸肉'...")
        search_input = self.page.get_element("input")
        search_input.input("鸡胸肉")
        time.sleep(1)
        
        # 验证结果
        cards = self.page.get_elements(".food-item-card")
        if len(cards) == 0:
            self.fail("Search result empty for '鸡胸肉'")
        
        food_name = cards[0].get_element(".food-name").inner_text
        print(f"✅ Found: {food_name}")
        if "鸡胸肉" not in food_name:
            self.fail(f"Search result mismatch: expected '鸡胸肉', got '{food_name}'")

    def test_F_011_nutrition_recalc(self):
        """
        TC-F-011: 详情页营养素重算
        """
        print("\n🚀 [TC-F-011] Testing Nutrition Recalculation...")
        self.app.relaunch("/pages/food/index")
        time.sleep(2)
        
        # 点击第一个食材
        self.page.get_elements(".food-item-card")[0].click()
        time.sleep(1)
        
        # 获取初始热量 (使用更稳定的 test class)
        initial_cal_text = self.page.get_element(".test-nutrition-value").inner_text
        initial_cal = float(initial_cal_text)
        print(f"📊 Initial Cal (100g): {initial_cal}")
        
        # 模拟增加数量到 200g
        print("⌨️ Increasing quantity to 200g...")
        # 使用 JS 直接修改，因为步进器定位较复杂
        self.app.evaluate("function(){ const p = getCurrentPages().pop(); if(p) p.localQuantity = 200; }")
            
        time.sleep(1)
        
        # 获取重算后的热量
        final_cal_text = self.page.get_element(".nutrition-value").inner_text
        final_cal = float(final_cal_text)
        print(f"📈 Final Cal (200g): {final_cal}")
        
        # 容差检查
        if abs(final_cal - initial_cal * 2) > 1:
            self.fail(f"Recalculation error: Expected {initial_cal * 2}, got {final_cal}")

    def test_F_020_favorite_toggle(self):
        """
        TC-F-020: 收藏状态切换
        """
        print("\n🚀 [TC-F-020] Testing Favorite Toggle...")
        self.app.relaunch("/pages/food/index")
        time.sleep(2)
        
        # 点击第一个食材
        self.page.get_elements(".food-item-card")[0].click()
        time.sleep(1)
        
        # 记录初始收藏状态
        is_fav = self.app.evaluate("function(){ const p = getCurrentPages().pop(); return p.isFavorite }")
        print(f"❤️ Initial Favorite state: {is_fav}")
        
        # 通过 JS 触发切换，避免图标定位问题
        self.app.evaluate("function(){ const p = getCurrentPages().pop(); if(p) p.$emit('toggleFavorite', p.food); }")
            
        time.sleep(1)
        new_fav = self.app.evaluate("function(){ const p = getCurrentPages().pop(); return p.isFavorite }")
        print(f"❤️ New Favorite state: {new_fav}")
        
        if new_fav == is_fav:
            self.fail("Favorite state did not toggle")

    def test_F_030_create_custom_food(self):
        """
        TC-F-030: 创建自定义食材
        """
        print("\n🚀 [TC-F-030] Testing Custom Food Creation...")
        self.app.relaunch("/pages/food/index")
        time.sleep(2)
        
        # 1. 触发创建弹窗
        self.app.evaluate("function(){ const p = getCurrentPages().pop(); if(p) p.handleCreateCustomFood(); }")
        time.sleep(1)
        
        food_name = f"AUTO_{int(time.time())}"
        print(f"⌨️ Creating custom food: {food_name}")
        
        # 2. 通过 JS 填充并提交，UI 定位在弹窗中往往不稳
        self.app.evaluate(f"""
            function() {{
                const p = getCurrentPages().pop();
                if(p && p.showCustomFoodModal) {{
                    // 注意：这里需要确保能访问到弹窗组件的 data/methods
                    // 如果无法直接访问，则尝试定位 input
                }}
            }}
        """)
        
        # 回退到 selector 方式输入名称
        name_input = self.page.get_element("input[placeholder='例如：自制沙拉']")
        if name_input:
            name_input.input(food_name)
        
        cal_input = self.page.get_element("input[placeholder='0']") 
        if cal_input:
            cal_input.input("150")
            
        # 点击“创建”按钮
        create_btn = self.page.get_element("view", inner_text="创建")
        if create_btn:
            create_btn.click()
        
        time.sleep(2)
        
        # 3. 验证
        exists = self.app.evaluate(f"function() {{ const p = getCurrentPages().pop(); return p.allFoods.some(f => f.name === '{food_name}'); }}")
        if not exists:
            self.fail(f"Custom food '{food_name}' not found after creation")
        
        print(f"✅ Custom food '{food_name}' created and verified.")

    def test_F_050_calorie_validation(self):
        """
        TC-F-050: 热量计算校验提醒
        预期：输入热量明显低于三大营养素总和时，弹出提醒弹窗
        """
        print("\n🚀 [TC-F-050] Testing Calorie Validation Logic...")
        self.app.relaunch("/pages/food/index")
        time.sleep(2)
        
        self.app.evaluate("function(){ const p = getCurrentPages().pop(); if(p) p.handleCreateCustomFood(); }")
        time.sleep(1)
        
        # 输入矛盾数据：10g脂肪(90kcal)，但输入热量 10kcal
        self.page.get_element("input[placeholder='例如：自制沙拉']").input("ValidationTest")
        # 定位热量输入 (第一个 placeholder='0')
        inputs = self.page.get_elements("input[placeholder='0']")
        inputs[0].input("10") # 热量
        inputs[2].input("10") # 脂肪 (第三个输入框)
        
        create_btn = self.page.get_element("view", inner_text="创建")
        create_btn.click()
        time.sleep(1)
        
        # 验证弹窗是否出现 (通过查找“数据校验提醒”文本)
        modal_title = self.page.get_element("view", inner_text="数据校验提醒")
        if not modal_title:
            self.fail("Validation modal DID NOT appear for mismatched calories")
        print("✅ Calorie validation modal verified.")

    def test_F_060_localization_check(self):
        """
        TC-F-060: 本地化单位检查
        预期：不出现 'g', 'ml'，显示为 '克', '毫升'
        """
        print("\n🚀 [TC-F-060] Testing Localization Compliance...")
        self.app.relaunch("/pages/food/index")
        time.sleep(2)
        
        # 进入详情页查看单位
        self.page.get_elements(".food-item-card")[0].click()
        time.sleep(1)
        
        page_source = self.page.get_element("page").inner_text
        
        # 检查非法英文单位
        for forbidden in ["g", "ml"]:
            if f" {forbidden}" in page_source or f"{forbidden} " in page_source:
                # 注意：这里需要排除 'kcal'，因为它是准许的
                self.fail(f"Forbidden English unit '{forbidden}' found in UI")
        
        # 检查合法中文单位
        for required in ["克", "kcal"]:
            if required not in page_source:
                self.fail(f"Required unit '{required}' missing from UI")
        
        print("✅ Localization check passed (Found '克' and 'kcal', No 'g').")

    def tearDown(self):
        print("🧹 Cleanup...")
        super(FoodModuleTest, self).tearDown()
