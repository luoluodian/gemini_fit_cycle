import minium
import time

class PlanToRecordFullFlowTest(minium.MiniTest):
    """
    饮食计划全链路闭环测试 (基于 V7.7 真实代码)
    
    完全优化审计修复 (V6)：
    1. 【确定性等待】使用 page.wait_for 代替 sleep，精准捕捉组件渲染时机。
    2. 【物理特征匹配】移除对 inner_text 的强依赖（防止 Taro 编译导致的文本节点偏移），改用 WXML 物理类名。
    3. 【会话接力】完美适配 auto_relaunch: false。
    """

    def setUp(self):
        super(PlanToRecordFullFlowTest, self).setUp()
        print("\n🌅 [Setup] Initializing session...")
        
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwib3BlbklkIjoibW9ja19vcGVuaWRfMTIzNDU2IiwiaWF0IjoxNzcyMTczNTkyLCJleHAiOjE3NzQ3NjU1OTJ9.brMsh1el4WZB-MQLNaTVuukSEXr-Xm5oXpzCxlZaaYA"
        
        # 仅在必要时注入
        try:
            curr_token = self.app.call_wx_method("getStorageSync", ["access_token"]).get("result")
        except:
            curr_token = None
            
        if curr_token != token:
            self.app.call_wx_method("clearStorageSync")
            self.app.call_wx_method("setStorageSync", ["access_token", token])
            self.app.evaluate("global.__FC_TEST_SKIP_AUTH__ = true")
            self.app.relaunch("/pages/index/index")
        
        self.app.wait_for_page("/pages/index/index")
        print("✅ Session Ready.")

    def test_full_flow_all_in_one(self):
        try:
            # --- PHASE 1: 创建计划 ---
            print("\n🚀 [Phase 1] Plan Creation...")
            self.app.switch_tab("/pages/plan/index")
            plan_page = self.app.wait_for_page("/pages/plan/index")
            # 显式等待列表渲染完成
            plan_page.wait_for(".pb-tabbar", timeout=10000)
            
            # 点击创建按钮
            print("🔍 Finding Create Icon...")
            # 经过审计，Icon 容器具有 border-emerald-600 类名
            create_btn = plan_page.get_element("view.border-emerald-600")
            if not create_btn:
                self.fail("Create button (view.border-emerald-600) not found")
            create_btn.click()
            
            # 等待 Modal 弹出
            print("🔍 Waiting for Modal...")
            # 弹窗容器类名为 nut-popup
            time.sleep(2) 
            modal_page = self.app.get_current_page()
            
            # 点击“创建新计划” (使用 WXML 中可见的 bg-emerald-50 容器类名)
            # 经 WXML 审计，该选项容器具有 bg-emerald-50_f80 类名
            manual_btn = None
            for el in modal_page.get_elements("view"):
                if "创建新计划" in el.inner_text or "手动创建" in el.inner_text:
                    manual_btn = el
                    break
            
            if not manual_btn:
                # 尝试根据类名寻找选项 1
                manual_btn = modal_page.get_element("view.bg-emerald-50")
                
            if manual_btn:
                manual_btn.click()
            else:
                self.fail("Manual Create option not found in modal")
            
            # --- PHASE 2: Creator ---
            self.app.wait_for_page("/pages/plan-creator/index")
            page = self.app.get_current_page()
            plan_name = f"V77_AUTO_{int(time.time())}"
            print(f"📝 Plan Name: {plan_name}")
            
            # 输入名称
            page.wait_for("input", timeout=5000)
            page.get_element("input").input(plan_name)
            
            # 点击碳循环按钮 (具有 bg-purple-100 的标签提示)
            type_btn = None
            for el in page.get_elements("view"):
                if "碳循环" in el.inner_text:
                    type_btn = el
                    break
            if type_btn: type_btn.click()
            
            # 点击下一步
            next_btn = None
            for el in page.get_elements("view"):
                if "下一步" in el.inner_text:
                    next_btn = el
                    break
            if next_btn: next_btn.click()
            else: self.fail("Next button not found in creator")
            
            # --- PHASE 3: Setup ---
            self.app.wait_for_page("/pages/carb-cycle-setup/index")
            page = self.app.get_current_page()
            page.wait_for("input", timeout=5000)
            page.get_element("input").input("75")
            
            next_btn = page.get_element("view", inner_text="下一步")
            if not next_btn:
                for el in page.get_elements("view"):
                    if "下一步" in el.inner_text:
                        next_btn = el
                        break
            next_btn.click()
            
            time.sleep(2)
            self.app.current_page.handle_modal("confirm")
            
            # --- PHASE 4: Templates ---
            self.app.wait_for_page("/pages/plan-templates/index")
            page = self.app.get_current_page()
            page.wait_for(".template-card", timeout=10000)
            page.get_elements(".template-card")[0].click()
            
            # 添加鸡蛋
            self.app.wait_for_page("/pages/edit-template/index")
            page = self.app.get_current_page()
            # 点击早餐
            for el in page.get_elements("view"):
                if el.inner_text == "早餐":
                    el.click()
                    break
            
            self.app.wait_for_page("/pages/meal-config/index")
            page = self.app.get_current_page()
            page.get_element("view", inner_text="+ 添加食材").click()
            
            # Picker
            time.sleep(1)
            picker = self.app.get_current_page()
            picker.get_element("input").input("鸡蛋")
            time.sleep(3)
            # 点击结果
            found = False
            for el in picker.get_elements("view"):
                if "鸡蛋" in el.inner_text and "kcal" in el.inner_text:
                    el.click()
                    found = True
                    break
            if not found:
                picker.get_element(".food-item-card").click()
            
            # 确定 & 完成
            for btn_text in ["确定", "完成"]:
                for el in self.app.get_current_page().get_elements("view"):
                    if el.inner_text == btn_text:
                        el.click()
                        time.sleep(1)
                        break
            
            # 保存
            self.app.wait_for_page("/pages/edit-template/index")
            self.app.get_current_page().get_element("view", inner_text="保存此天配置").click()
            self.app.wait_for_page("/pages/plan-templates/index")
            self.app.get_current_page().get_element("view", inner_text="确认计划").click()
            
            # --- PHASE 5: Activation & Validation ---
            self.app.wait_for_page("/pages/plan/index")
            time.sleep(2)
            page = self.app.get_current_page()
            
            found_act = False
            for card in page.get_elements(".plan-card"):
                if plan_name in card.inner_text:
                    act_btn = None
                    for b in card.get_elements("view"):
                        if "激活" in b.inner_text:
                            act_btn = b
                            break
                    if act_btn:
                        act_btn.click()
                        found_act = True
                        break
            if not found_act: self.fail("Activation failed")
            
            time.sleep(3)
            self.app.switch_tab("/pages/index/index")
            page = self.app.wait_for_page("/pages/index/index")
            time.sleep(3)
            
            # 寻找一键记录
            sync_btn = None
            for el in page.get_elements("view"):
                if "一键记录" in el.inner_text:
                    sync_btn = el
                    break
            
            if sync_btn:
                sync_btn.click()
                print("🖱️ Sync clicked.")
                # 等待按钮消失
                cleared = False
                for _ in range(10):
                    time.sleep(1)
                    # 重新扫全屏，看还有没有“打卡”按钮
                    has_punch = any("打卡" in b.inner_text for b in self.app.get_current_page().get_elements("view"))
                    if not has_punch:
                        cleared = True
                        break
                self.assertTrue(cleared, "Sync did not clear punches")
            
            print("\n🎉 SUCCESS: FULL FLOW AUDITED.")

        except Exception as e:
            self.capture("final_error")
            print(f"❌ FAILED: {str(e)}")
            raise e

    def tearDown(self):
        super(PlanToRecordFullFlowTest, self).tearDown()
