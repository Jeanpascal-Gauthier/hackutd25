WORKORDERS = [
    {"id": 1, "title": "Replace GPU Node A12", "status": "pending"},
    {"id": 2, "title": "Check Rack Temperature R18", "status": "in_progress"}
]

INVENTORY = {
    "gpu-a100": {"available": True, "location": "Shelf 3"},
    "psu-1200w": {"available": True, "location": "Shelf 1"}
}

def get_work_order_details(workorder_id):
    return next((w for w in WORKORDERS if w["id"] == workorder_id), {"title": "Unknown"})

def check_inventory(part_id):
    return INVENTORY.get(part_id, {"available": False})
