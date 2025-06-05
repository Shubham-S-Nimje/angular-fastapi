from fastapi import APIRouter
import json

router = APIRouter()

@router.get("/adminData/")
def read_adminData():
    try:
        with open('admin_data.json', 'r') as data:
            admin_data = json.load(data)
        return {
            "success": True,
            "data": admin_data,
            "total_records": len(admin_data)
        }
    except FileNotFoundError:
        return {"success": False, "message": "Admin data file not found"}
    except json.JSONDecodeError:
        return {"success": False, "message": "Invalid JSON in admin data file"}
