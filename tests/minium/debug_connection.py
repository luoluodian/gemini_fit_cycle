import minium
import logging

# 开启详细日志，捕获连接细节
logging.basicConfig(level=logging.DEBUG)

def debug_minium():
    conf = {
        "project_path": "/Users/wangweining/Desktop/web/gemini_fit_cycle/fit_cycle_web/dist",
        "dev_tool_path": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
        "test_port": 46910
    }
    
    print("🚀 Attempting to connect to WeChat DevTools at port 46910...")
    try:
        mini = minium.Minium(conf)
        print("✅ Connection Established!")
        print("Page Path:", mini.get_current_page().path)
    except Exception as e:
        print(f"❌ Connection Failed: {str(e)}")

if __name__ == "__main__":
    debug_minium()
