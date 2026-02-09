import asyncio
import websockets
import json
import time

async def raw_test():
    uri = "ws://localhost:46910"
    print(f"🔗 Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Socket Connected.")
            
            async def cmd(method, params=None):
                payload = {
                    "id": int(time.time() * 1000),
                    "method": method,
                    "params": params or {}
                }
                await websocket.send(json.dumps(payload))
                while True:
                    res_str = await websocket.recv()
                    res = json.loads(res_str)
                    if res.get("id") == payload["id"]:
                        return res
                    # 跳过推送通知，直到等到对应的回复
                    print(f"  (Skipping notification: {res.get('method')})")

            print("💉 Injecting Token...")
            res = await cmd("App.callWxMethod", {
                "method": "setStorageSync",
                "args": ["access_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwiaWF0IjoxNzcwMDg4NDMyLCJleHAiOjE3NzA2OTMyMzJ9.S4lgYfSNOF7f0QpNdPhqUWzQJPrr9Jboxk8I4y4NxaI"]
            })
            print("Response:", res)

            print("🏃 Relaunching to Plan Index...")
            await cmd("App.relaunch", {"url": "/pages/plan/index"})
            await asyncio.sleep(3)
            
            print("🔍 Checking Location...")
            res = await cmd("App.getCurrentPage")
            print("📍 Final Location:", res.get("result", {}).get("path"))
            
            print("\n🎉 RAW PROTOCOL SUCCESS!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(raw_test())