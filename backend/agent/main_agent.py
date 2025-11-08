from .tools import get_work_order_details, check_inventory

def run_agent(workorder_id):
    logs = []
    
    # Step 1: Get work order
    order = get_work_order_details(workorder_id)
    logs.append(f"Loaded work order: {order['title']}")
    
    # Step 2: Simple check (simulate Nemotron reasoning)
    if "GPU" in order['title']:
        part = "gpu-a100"
        inv = check_inventory(part)
        if inv['available']:
            logs.append(f"{part} is available at {inv['location']}")
        else:
            logs.append(f"{part} not in stock! Escalating...")
    else:
        logs.append("No special inventory checks needed")
    
    # Step 3: Return plan/logs
    logs.append("Plan generated successfully.")
    return {"logs": logs, "plan": ["Step 1", "Step 2", "Step 3"]}
