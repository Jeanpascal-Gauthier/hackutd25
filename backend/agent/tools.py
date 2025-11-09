from langchain_core.tools import tool
from models.InventoryItem import InventoryItem
from models.EscalationMessage import EscalationMessage
from models.WorkOrder import WorkOrder
from models.Technician import Technician
from mongoengine import DoesNotExist
from datetime import datetime

@tool(parse_docstring=True)
def reboot_server(server_id: str) -> str:
    """Reboots the server with the given server ID.
    
    Args:
        server_id: The ID or identifier of the server to reboot.
    
    Returns:
        A success message indicating the server was rebooted.
    """
    print(f"SERVER WITH ID {server_id} REBOOTING!")
    return f"Server {server_id} rebooted successfully."

@tool(parse_docstring=True)
def run_diagnostics(server_id: str, diagnostic_type: str = "full") -> str:
    """Runs diagnostic tests on a server to identify issues.
    
    Args:
        server_id: The ID or identifier of the server to run diagnostics on.
        diagnostic_type: Type of diagnostics to run (full, hardware, network, power). Defaults to "full".
    
    Returns:
        Diagnostic results and any issues found.
    """
    print(f"Running {diagnostic_type} diagnostics on server {server_id}...")
    # Simulate diagnostic results
    results = {
        "server_id": server_id,
        "diagnostic_type": diagnostic_type,
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "results": {
            "cpu": "OK",
            "memory": "OK",
            "disk": "OK",
            "network": "OK",
            "power": "OK"
        },
        "issues_found": []
    }
    return f"Diagnostics completed for server {server_id}. Status: All systems operational. No issues detected."

@tool(parse_docstring=True)
def check_inventory(item_name: str = None, location: str = None) -> str:
    """Checks inventory for items. Can search by item name or location.
    
    Args:
        item_name: Optional name of the item to search for.
        location: Optional location to filter inventory by.
    
    Returns:
        Inventory information including available quantities and locations.
    """
    try:
        if item_name and location:
            items = InventoryItem.objects(name__icontains=item_name, location__icontains=location)
        elif item_name:
            items = InventoryItem.objects(name__icontains=item_name)
        elif location:
            items = InventoryItem.objects(location__icontains=location)
        else:
            items = InventoryItem.objects()
        
        if not items or len(items) == 0:
            return f"No inventory items found{' for ' + item_name if item_name else ''}{' at ' + location if location else ''}."
        
        result = f"Inventory check results ({len(items)} item{'s' if len(items) != 1 else ''} found):\n"
        for item in items:
            reserved_status = " (Reserved)" if item.reserved else ""
            available_status = " (Available)" if not item.reserved and item.quantity > 0 else " (Out of Stock)" if item.quantity == 0 else ""
            result += f"- {item.name}: Quantity {item.quantity}, Location: {item.location or 'N/A'}{reserved_status}{available_status}\n"
        
        return result
    except Exception as e:
        return f"Error checking inventory: {str(e)}"

@tool(parse_docstring=True)
def update_inventory(item_name: str, quantity_change: int, location: str = None) -> str:
    """Updates inventory quantity for an item. Use positive numbers to add, negative to subtract.
    
    Args:
        item_name: Name of the item to update.
        quantity_change: Amount to change (positive to add, negative to subtract).
        location: Optional location to filter by.
    
    Returns:
        Confirmation message with updated inventory status.
    """
    try:
        if location:
            item = InventoryItem.objects(name__icontains=item_name, location__icontains=location).first()
        else:
            item = InventoryItem.objects(name__icontains=item_name).first()
        
        if not item:
            return f"Inventory item '{item_name}' not found. Cannot update inventory."
        
        current_quantity = item.quantity if item.quantity else 0
        new_quantity = max(0, current_quantity + quantity_change)  # Prevent negative quantities
        item.quantity = new_quantity
        item.save()
        
        action = "added" if quantity_change > 0 else "removed"
        location_info = f" at {item.location}" if item.location else ""
        return f"Inventory updated: {abs(quantity_change)} units {action} from {item_name}. New quantity: {new_quantity}{location_info}."
    except Exception as e:
        return f"Error updating inventory: {str(e)}"

@tool(parse_docstring=True)
def check_existing_specs(server_id: str = None, component_type: str = None) -> str:
    """Checks existing specifications for servers or components.
    
    Args:
        server_id: Optional server ID to check specs for.
        component_type: Optional component type (CPU, GPU, RAM, Storage, etc.).
    
    Returns:
        Specification information for the requested server or component.
    """
    # Simulate spec checking
    if server_id:
        specs = {
            "server_id": server_id,
            "cpu": "Intel Xeon E5-2690 v4",
            "ram": "128 GB DDR4",
            "storage": "2x 1TB SSD",
            "gpu": "NVIDIA A100",
            "network": "10 GbE",
            "power": "800W"
        }
        result = f"Specifications for server {server_id}:\n"
        for key, value in specs.items():
            if key != "server_id":
                result += f"- {key.upper()}: {value}\n"
        return result
    else:
        return f"Specification check: {component_type if component_type else 'General'} specifications retrieved. Please specify a server_id for detailed specs."

@tool(parse_docstring=True)
def escalate_to_higher_engineer(work_order_id: str, reason: str, escalation_level: str = "senior") -> str:
    """Escalates a work order to a higher-level engineer or technician.
    
    Args:
        work_order_id: The ID of the work order to escalate.
        reason: Reason for escalation.
        escalation_level: Level to escalate to (senior, lead, manager). Defaults to "senior".
    
    Returns:
        Confirmation message with escalation details.
    """
    try:
        work_order = WorkOrder.objects.get(id=work_order_id)
        
        # Create escalation message
        escalation = EscalationMessage(
            work_order_id=work_order,
            message=f"Escalation to {escalation_level} engineer. Reason: {reason}",
            timestamp=datetime.utcnow(),
            status="sent"
        )
        escalation.save()
        
        # Update work order status
        work_order.status = "escalated"
        work_order.save()
        
        return f"Work order {work_order_id} escalated to {escalation_level} engineer. Reason: {reason}. Escalation message created and sent."
    except DoesNotExist:
        return f"Work order {work_order_id} not found."
    except Exception as e:
        return f"Error escalating work order: {str(e)}"

@tool(parse_docstring=True)
def order_supplies(item_name: str, quantity: int, urgency: str = "normal", supplier: str = None) -> str:
    """Orders supplies for the data center.
    
    Args:
        item_name: Name of the item to order.
        quantity: Quantity to order.
        urgency: Urgency level (low, normal, high, urgent). Defaults to "normal".
        supplier: Optional supplier name.
    
    Returns:
        Confirmation message with order details.
    """
    try:
        # In a real system, this would create an order in a procurement system
        order_id = f"ORD-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        
        # Note: In a real system, this would create an order in a procurement system
        # For now, we'll just return the order confirmation
        # The inventory system would handle the order separately
        
        supplier_info = f" from {supplier}" if supplier else ""
        return f"Supply order created: Order ID {order_id}. {quantity} units of {item_name}{supplier_info}. Urgency: {urgency}. Expected delivery: 3-5 business days."
    except Exception as e:
        return f"Error creating supply order: {str(e)}"

@tool(parse_docstring=True)
def check_temperature(rack_id: str = None, unit_id: str = None) -> str:
    """Checks the temperature of a rack or unit in the data center.
    
    Args:
        rack_id: Optional rack ID to check temperature for.
        unit_id: Optional unit ID to check temperature for.
    
    Returns:
        Temperature readings and status.
    """
    # Simulate temperature check
    location = rack_id or unit_id or "General data center"
    temp = 72  # Simulated temperature in Fahrenheit
    status = "Normal" if temp < 80 else "Warning" if temp < 85 else "Critical"
    
    return f"Temperature check for {location}: {temp}°F. Status: {status}. Recommended range: 68-78°F."

@tool(parse_docstring=True)
def deploy_update(machine_group: str, update_type: str = "software") -> str:
    """Deploys a software or firmware update to a machine group.
    
    Args:
        machine_group: The machine group or server cluster to update.
        update_type: Type of update (software, firmware, security). Defaults to "software".
    
    Returns:
        Deployment status and results.
    """
    print(f"Deploying {update_type} update to {machine_group}...")
    return f"{update_type.capitalize()} update deployed to {machine_group} successfully. All machines updated and verified."