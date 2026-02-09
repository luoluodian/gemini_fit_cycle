import minium
import os

class BaseTest(minium.MiniTest):
    """
    Minium 测试基类：负责初始化登录状态
    """
    def setUp(self):
        super(BaseTest, self).setUp()
        try:
            # 等待应用初始化
            self.app.wait_for_page("/pages/index/index", timeout=10)
            self.inject_auth_token()
        except Exception as e:
            print(f"⚠️ Setup Warning: {str(e)}")

    def inject_auth_token(self):
        """
        复用 Mock Token，强行注入 Storage 实现免扫码登录
        """
        # 注意：这里的 Key 必须与前端 constants/storage.ts 中的常量完全一致
        # access_token -> ACCESS_TOKEN_KEY
        # user_info -> USER_INFO_KEY
        mock_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI"
        mock_user = {
            "id": 1,
            "nickname": "TestUser"
        }
        
        print("💉 Injecting credentials...")
        self.app.call_wx_method("setStorageSync", ["access_token", mock_token])
        self.app.call_wx_method("setStorageSync", ["user_info", mock_user])
        
        # 强制重启页面以应用 Storage
        self.app.relaunch("/pages/plan/index")
        self.app.wait_for_page("/pages/plan/index", timeout=5)
        print("✅ Credentials Injected & Relauched.")

    def navigate_to_plan(self):
        """
        快捷跳转至计划模块
        """
        self.app.switch_tab("/pages/plan/index")
        self.app.wait_for_page("/pages/plan/index")
