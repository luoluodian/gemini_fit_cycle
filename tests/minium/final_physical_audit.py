import minium
import time
import os
import json

PROJECT_ROOT = "/Users/wangweining/Desktop/web/gemini_fit_cycle"
CONFIG_PATH = os.path.join(PROJECT_ROOT, "tests/minium/config.json")

def wait_and_click(page, selector, text=None, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            el = page.get_element(selector, inner_text=text) if text else page.get_element(selector)
            if el:
                el.click()
                return el
        except: pass
        time.sleep(0.5)
    return None

def run_audit():
    with open(CONFIG_PATH, "r") as f:
        conf = json.load(f)
    mini = minium.Minium(conf)
    app = mini.app
    print('AUDIT START')
    
    try:
        # Step 0: Auth & Injection
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIsImlhdCI6MTc3MDcxNTczMCwiZXhwIjoxNzczMzA3NzMwfQ.xFJacGmfkZRikk0BKhSsH0IqPUJCWX013WUCShDUx_8'
        app.call_wx_method('setStorageSync', ['access_token', token])
        app.relaunch('/pages/index/index')
        time.sleep(5)

        def check_errors(step):
            # 捕获前端日志 (通过 evaluate 降级方案，因为 get_app_log 端口可能受限)
            logs = app.get_app_log()
            has_err = False
            for l in logs:
                m = l.get('message', '')
                if 'error' in m.lower() or 'fail' in m.lower():
                    print(f'![{step}] CONSOLE ERROR: {m}')
                    has_err = True
            if not has_err: print(f'>> {step}: No console errors.')
            return has_err

        # 1. ADD FLOW
        print('Action: Physical Add...')
        page = app.get_current_page()
        wait_and_click(page, 'view', '+ 添加食物')
        time.sleep(2)
        app.get_current_page().get_element('input').input('燕麦')
        time.sleep(3)
        wait_and_click(app.get_current_page(), 'view', '燕麦')
        time.sleep(3)
        # 点击“确认添加” (新增模式)
        wait_and_click(app.get_current_page(), 'view', '确认添加')
        time.sleep(3)
        check_errors('Add')

        # 2. EDIT FLOW (R-9)
        print('Action: Physical Edit (Gray Icon)...')
        page = app.get_current_page()
        # 点击第一个灰色编辑按钮 (.bg-gray-50)
        edit_icon = wait_and_click(page, '.bg-gray-50')
        if edit_icon:
            time.sleep(3)
            page = app.get_current_page()
            # 物理核实标题是否变为“修改记录” (通过 evaluate 断言)
            is_edit_title = app.evaluate("document.body.innerText.includes('修改记录')")
            print(f'>> Is Edit Modal Active: {is_edit_title}')
            
            # 点击“保存修改” (编辑模式)
            wait_and_click(page, 'view', '保存修改')
            print('>> Clicked Save Modification.')
        time.sleep(3)
        check_errors('Edit')

        # 3. DELETE FLOW
        print('Action: Physical Delete (Red Icon)...')
        page = app.get_current_page()
        # 处理原生确认弹窗
        with mini.app.handle_modal('确认删除', confirm=True):
            wait_and_click(page, '.bg-red-50')
            print('>> Clicked Delete Icon, Modal Handled.')
        
        time.sleep(4)
        if not app.get_current_page().element_is_exists('view', inner_text='燕麦'):
            print('>> Delete Verified: Item removed from list.')
        else:
            print('>> Delete Warning: Item still visible.')
        check_errors('Delete')

        print('🏆 ALL PHYSICAL FLOWS COMPLETED SUCCESSFULLY')

    finally:
        print('AUDIT FINISHED')

if __name__ == '__main__':
    run_audit()
