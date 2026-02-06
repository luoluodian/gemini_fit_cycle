import minium
import os

class BaseTest(minium.MiniTest):
    """
    Minium 测试基类：负责初始化登录状态
    """
    def setUp(self):
        super(BaseTest, self).setUp()
        self.inject_auth_token()

    def inject_auth_token(self):
        """
        复用 Mock Token，强行注入 Storage 实现免扫码登录
        """
        mock_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI"
        mock_user = {
            "id": 1,
            "nickname": "TestUser",
            "avatarUrl": ""
        }
        
        # 写入前端约定好的 Storage Key (需根据 constants/storage.ts 对齐)
        self.app.call_wx_method("setStorageSync", ["access_token", mock_token])
        self.app.call_wx_method("setStorageSync", ["user_info", mock_user])
        
        print("✅ Auth Token Injected. Ready for Plan tests.")

    def navigate_to_plan(self):
        """
        快捷跳转至计划模块
        """
        self.app.switch_tab("/pages/plan/index")
        self.app.wait_for_page("/pages/plan/index")
