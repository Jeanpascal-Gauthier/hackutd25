# /routes/work_orders.py
from flask import Blueprint, request, jsonify
from mongoengine import DoesNotExist
from models.WorkOrder import WorkOrder
from models.PlanStep import PlanStep
from datetime import datetime
from agent.main_agent import Context, run_agent, regenerate_steps_from_issue

work_orders_bp = Blueprint('work_orders', __name__, url_prefix='/api/work_orders')

@work_orders_bp.route('/test', methods=['POST'])
def test_llm():
    data = request.json
    context = Context(work_order_title=data.get("work_order_title"), work_order_description=data.get("work_order_description"))
    result = run_agent(context)
#     print(result.messages)
#     return jsonify(result.messages), 201

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

# Report Issue and Regenerate Steps
@work_orders_bp.route('/issue', methods=['POST'])
def report_issue():
    data = request.json
    
    # Validate required fields
    if not data.get('step_id') or not data.get('work_order_id') or not data.get('issue_description'):
        return jsonify({"error": "step_id, work_order_id, and issue_description are required"}), 400
    
    try:
        # Get the work order
        work_order = WorkOrder.objects.get(id=data['work_order_id'])
        
        # Get the problematic step
        problematic_step = PlanStep.objects.get(id=data['step_id'], work_order=work_order)
        
        # Get all plan steps for this work order, ordered by step_number
        all_steps = PlanStep.objects(work_order=work_order).order_by('step_number')
        
        # Get completed steps before the problematic step (for context)
        completed_steps = [
            step for step in all_steps 
            if step.step_number < problematic_step.step_number and step.status == "success"
        ]
        
        # Delete all steps from the problematic step onwards
        steps_to_delete = [
            step for step in all_steps 
            if step.step_number >= problematic_step.step_number
        ]
        
        for step in steps_to_delete:
            step.delete()
        
        # Regenerate steps from the problematic step onwards
        new_steps_data = regenerate_steps_from_issue(
            work_order=work_order,
            issue_description=data['issue_description'],
            from_step_number=problematic_step.step_number,
            completed_steps=completed_steps
        )
        
        # Create new PlanSteps
        new_plan_steps = [
            PlanStep(
                work_order=work_order,
                step_number=step['step_number'],
                description=step['description'],
                executor="undecided",
                status="pending",
                result=None,
                executed_at=None
            ) for step in new_steps_data
        ]
        
        # Bulk insert the new steps
        PlanStep.objects.insert(new_plan_steps)
        
        # Update work order status if needed
        work_order.updated_at = datetime.utcnow()
        if work_order.status == "completed":
            work_order.status = "in_progress"
        work_order.save()
        
        return jsonify({
            "message": "Steps regenerated successfully",
            "deleted_steps_count": len(steps_to_delete),
            "new_steps_count": len(new_plan_steps),
            "new_steps": [
                {
                    "id": str(step.id),
                    "step_number": step.step_number,
                    "description": step.description
                } for step in new_plan_steps
            ]
        }), 200
        
    except DoesNotExist as e:
        return jsonify({"error": f"WorkOrder or PlanStep not found: {str(e)}"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

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
