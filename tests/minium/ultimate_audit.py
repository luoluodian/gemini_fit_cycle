import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def run_ultimate_audit():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    mini = minium.Minium(conf)
    app = mini.app
    print('AUDIT START')
    try:
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8'
        app.call_wx_method('setStorageSync', ['access_token', token])
        app.evaluate('global.__FE_LOGS__ = []; const oldL = console.log; console.log = (...a) => { global.__FE_LOGS__.push(a.join(" ")); oldL(...a); }; console.error = (...a) => { global.__FE_LOGS__.push("ERROR: " + a.join(" ")); }')
        app.relaunch('/pages/index/index')
        time.sleep(5)

        print('Step 1: Adding Oats...')
        page = app.get_current_page()
        page.get_element('view', inner_text='+ 添加食物').click()
        time.sleep(2)
        app.get_current_page().get_element('input').input('燕麦')
        time.sleep(3)
        app.get_current_page().get_element('view', inner_text='燕麦').click()
        time.sleep(3)
        app.get_current_page().get_element('view', inner_text='确认添加').click()
        time.sleep(3)
        logs1 = app.evaluate('global.__FE_LOGS__')
        for l in logs1: print('LOG: ' + str(l))
        app.evaluate('global.__FE_LOGS__ = []')

        print('Step 2: Editing...')
        edit_btn = app.get_current_page().get_element('.bg-gray-50')
        if edit_btn:
            edit_btn.click()
            time.sleep(3)
            save_btn = app.get_current_page().get_element('view', inner_text='保存修改')
            if save_btn: save_btn.click()
        time.sleep(3)
        logs2 = app.evaluate('global.__FE_LOGS__')
        for l in logs2: print('LOG: ' + str(l))
        app.evaluate('global.__FE_LOGS__ = []')

        print('Step 3: Deleting...')
        app.evaluate('wx.showModal = (o) => { o.success({confirm: true}) }')
        del_btn = app.get_current_page().get_element('.bg-red-50')
        if del_btn: del_btn.click()
        time.sleep(3)
        logs3 = app.evaluate('global.__FE_LOGS__')
        for l in logs3: print('LOG: ' + str(l))

        print('AUDIT FINISHED')
    finally:
        print('DISCONNECTED')

if __name__ == '__main__':
    run_ultimate_audit()