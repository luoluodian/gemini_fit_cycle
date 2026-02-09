import sqlite3
import os

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../fit_cycle_app/database.sqlite"))

def get_latest_plan():
    """
    获取最新创建的一条计划记录
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # 查询最新的 diet_plan
        cursor.execute("SELECT id, name, status, type, created_at FROM diet_plans ORDER BY created_at DESC LIMIT 1")
        plan = cursor.fetchone()
        
        conn.close()
        
        if plan:
            return {
                "id": plan[0],
                "name": plan[1],
                "status": plan[2],
                "type": plan[3],
                "created_at": plan[4]
            }
        return None
    except Exception as e:
        print(f"⚠️ DB Check Error: {e}")
        return None

def check_plan_exists(name_keyword):
    """
    检查是否存在名称包含关键字的计划
    """
    plan = get_latest_plan()
    if plan and name_keyword in plan['name']:
        return plan
    return None
