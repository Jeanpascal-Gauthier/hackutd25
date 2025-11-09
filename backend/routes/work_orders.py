# /routes/work_orders.py
from flask import Blueprint, request, jsonify
from mongoengine import DoesNotExist
from models.WorkOrder import WorkOrder
from datetime import datetime
from agent.main_agent import run_agent, AgentState

work_orders_bp = Blueprint('work_orders', __name__, url_prefix='/api/work_orders')

@work_orders_bp.route('/test', methods=['POST'])
def test_llm():
    data = request.json
    state = AgentState(work_order_title=data.get("work_order_title"), work_order_description=data.get("work_order_description"))
    result = run_agent(state)
    print(result.messages)
    return jsonify(result.messages), 201

# Create WorkOrder
@work_orders_bp.route('/', methods=['POST'])
def create_workorder():
    data = request.json
    work_order = WorkOrder(
        title=data.get("title"),
        description=data.get("description"),
        priority=data.get("priority", "medium"),
        estimated_expertise_level=data.get("estimated_expertise_level", "mid"),
        category=data.get("category", "other"),
        status="pending",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    work_order.save()
    return jsonify({"id": str(work_order.id)}), 201

# Get All WorkOrders
@work_orders_bp.route('/', methods=['GET'])
def get_workorders():
    workorders = WorkOrder.objects()
    results = []
    for wo in workorders:
        results.append({
            "id": str(wo.id),
            "title": wo.title,
            "description": wo.description,
            "priority": wo.priority,
            "status": wo.status,
            "estimated_expertise_level": wo.estimated_expertise_level,
            "category": wo.category
        })
    return jsonify(results)

# Get Single WorkOrder
@work_orders_bp.route('/<string:workorder_id>', methods=['GET'])
def get_workorder(workorder_id):
    try:
        wo = WorkOrder.objects.get(id=workorder_id)
        return jsonify({
            "id": str(wo.id),
            "title": wo.title,
            "description": wo.description,
            "priority": wo.priority,
            "status": wo.status,
            "estimated_expertise_level": wo.estimated_expertise_level,
            "category": wo.category
        })
    except DoesNotExist:
        return jsonify({"error": "WorkOrder not found"}), 404

# Update WorkOrder
@work_orders_bp.route('/<string:workorder_id>', methods=['PUT'])
def update_workorder(workorder_id):
    data = request.json
    try:
        wo = WorkOrder.objects.get(id=workorder_id)
        wo.update(
            title=data.get("title", wo.title),
            description=data.get("description", wo.description),
            priority=data.get("priority", wo.priority),
            estimated_expertise_level=data.get("estimated_expertise_level", wo.estimated_expertise_level),
            category=data.get("category", wo.category),
            status=data.get("status", wo.status),
            updated_at=datetime.utcnow()
        )
        return jsonify({"message": "WorkOrder updated"})
    except DoesNotExist:
        return jsonify({"error": "WorkOrder not found"}), 404

# Delete WorkOrder
@work_orders_bp.route('/<string:workorder_id>', methods=['DELETE'])
def delete_workorder(workorder_id):
    try:
        wo = WorkOrder.objects.get(id=workorder_id)
        wo.delete()
        return jsonify({"message": "WorkOrder deleted"})
    except DoesNotExist:
        return jsonify({"error": "WorkOrder not found"}), 404
