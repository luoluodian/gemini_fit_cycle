import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

class StepAudit:
    def __init__(self):
        with open(CONFIG_PATH, "r") as f:
            conf = json.load(f)
        self.mini = minium.Minium(conf)
        self.app = self.mini.app
        self.last_log_idx = 0

    def check_console(self, step_name):
        print('Checking logs after: ' + step_name)
        all_logs = self.app.get_app_log()
        new_logs = all_logs[self.last_log_idx:]
        self.last_log_idx = len(all_logs)
        has_error = False
        for log in new_logs:
            msg = log.get('message', '')
            if 'ERROR' in log.get('level', '') or 'fail' in msg.lower() or 'error' in msg.lower():
                print('Found console error: ' + msg)
                has_error = True
        return has_error

    def run(self):
        try:
            token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8'
            self.app.call_wx_method('setStorageSync', ['access_token', token])
            self.app.relaunch('/pages/index/index')
            time.sleep(5)
            self.last_log_idx = len(self.app.get_app_log())

            print('Step 1: Adding item...')
            page = self.app.get_current_page()
            page.get_element('view', inner_text='+ 添加食物').click()
            time.sleep(2)
            self.app.get_current_page().get_element('input').input('燕麦')
            time.sleep(3)
            self.app.get_current_page().get_element('view', inner_text='燕麦').click()
            time.sleep(3)
            self.app.get_current_page().get_element('view', inner_text='确认添加').click()
            time.sleep(3)
            if self.check_console('Add'): return

            print('Step 2: Editing item...')
            page = self.app.get_current_page()
            edit_btn = page.get_element('.bg-gray-50')
            if edit_btn:
                edit_btn.click()
                time.sleep(3)
                if self.check_console('OpenEdit'): return
                save_btn = self.app.get_current_page().get_element('view', inner_text='保存修改')
                if save_btn:
                    save_btn.click()
                    time.sleep(3)
                    if self.check_console('SaveEdit'): return

            print('Step 3: Deleting item...')
            page = self.app.get_current_page()
            del_btn = page.get_element('.bg-red-50')
            if del_btn:
                self.app.evaluate('wx.showModal = (o) => { o.success({confirm: true}) }')
                del_btn.click()
                time.sleep(3)
                if self.check_console('Delete'): return

            print('SUCCESS: All steps passed audit.')
        finally:
            print('Audit Finished.')

if __name__ == '__main__':
    StepAudit().run()