# /routes/escalations.py
from flask import Blueprint, request, jsonify
from mongoengine import DoesNotExist
from models.EscalationMessage import EscalationMessage
from models.WorkOrder import WorkOrder
from datetime import datetime

escalations_bp = Blueprint('escalations', __name__, url_prefix='/api/escalations')

@escalations_bp.route('/', methods=['POST'])
def create_escalation():
    """
    Create an escalation message.
    
    Expected JSON body:
    {
        "work_order_id": "string",
        "message": "string",
        "source": "technician" | "ai_agent",
        "engineer_id": "string" (optional)
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        work_order_id = data.get("work_order_id")
        message = data.get("message")
        source = data.get("source")
        
        if not work_order_id:
            return jsonify({"error": "work_order_id is required"}), 400
        if not message:
            return jsonify({"error": "message is required"}), 400
        if not source:
            return jsonify({"error": "source is required"}), 400
        if source not in ["technician", "ai_agent"]:
            return jsonify({"error": "source must be either 'technician' or 'ai_agent'"}), 400
        
        # Verify work order exists
        try:
            work_order = WorkOrder.objects.get(id=work_order_id)
        except DoesNotExist:
            return jsonify({"error": "WorkOrder not found"}), 404
        
        # Create escalation message
        escalation = EscalationMessage(
            work_order_id=work_order,
            timestamp=datetime.utcnow(),
            message=message,
            source=source,
            status="sent"
        )
        
        # Set engineer if provided (engineer_id should be a Technician ID)
        engineer_id = data.get("engineer_id")
        if engineer_id:
            try:
                from models.Technician import Technician
                engineer = Technician.objects.get(id=engineer_id)
                escalation.engineer = engineer
            except DoesNotExist:
                # Engineer is optional, so we'll continue without it
                pass
        
        escalation.save()
        
        # Update work order status to escalated if not already
        if work_order.status != "escalated":
            work_order.status = "escalated"
            work_order.updated_at = datetime.utcnow()
            work_order.save()
        
        # Add escalation to work order's escalation_messages list if it exists
        if hasattr(work_order, 'escalation_messages'):
            if not work_order.escalation_messages:
                work_order.escalation_messages = []
            work_order.escalation_messages.append(escalation)
            work_order.save()
        
        return jsonify({
            "message": "Escalation created successfully",
            "escalation": escalation.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@escalations_bp.route('/work_order/<string:work_order_id>', methods=['GET'])
def get_escalations_by_work_order(work_order_id):
    """Get all escalation messages for a specific work order"""
    try:
        # Verify work order exists
        try:
            work_order = WorkOrder.objects.get(id=work_order_id)
        except DoesNotExist:
            return jsonify({"error": "WorkOrder not found"}), 404
        
        # Get all escalations for this work order
        escalations = EscalationMessage.objects(work_order_id=work_order_id)
        
        results = [escalation.to_dict() for escalation in escalations]
        
        return jsonify({
            "work_order_id": work_order_id,
            "escalations": results,
            "count": len(results)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@escalations_bp.route('/<string:escalation_id>', methods=['GET'])
def get_escalation(escalation_id):
    """Get a specific escalation message by ID"""
    try:
        escalation = EscalationMessage.objects.get(id=escalation_id)
        return jsonify(escalation.to_dict()), 200
    except DoesNotExist:
        return jsonify({"error": "Escalation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@escalations_bp.route('/<string:escalation_id>/status', methods=['PUT'])
def update_escalation_status(escalation_id):
    """Update the status of an escalation message"""
    try:
        data = request.json
        if not data or not data.get("status"):
            return jsonify({"error": "status is required"}), 400
        
        status = data.get("status")
        if status not in ["sent", "acknowledged", "resolved"]:
            return jsonify({"error": "status must be 'sent', 'acknowledged', or 'resolved'"}), 400
        
        escalation = EscalationMessage.objects.get(id=escalation_id)
        escalation.status = status
        escalation.save()
        
        return jsonify({
            "message": "Escalation status updated",
            "escalation": escalation.to_dict()
        }), 200
        
    except DoesNotExist:
        return jsonify({"error": "Escalation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

