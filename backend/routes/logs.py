# /routes/logs.py
from flask import Blueprint, request, jsonify
from mongoengine import DoesNotExist
from models.AgentLog import AgentLog
from models.WorkOrder import WorkOrder
from models.PlanStep import PlanStep
from datetime import datetime, timezone

logs_bp = Blueprint('logs', __name__, url_prefix='/api/logs')

# Helper function to ensure datetime has timezone info
def format_datetime(dt):
    if not dt:
        return None
    # If datetime is naive (no timezone), assume it's UTC and make it timezone-aware
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()

# Get All Logs for a Work Order
@logs_bp.route('/work_order/<string:work_order_id>', methods=['GET'])
def get_work_order_logs(work_order_id):
    try:
        work_order = WorkOrder.objects.get(id=work_order_id)
        logs = AgentLog.objects(work_order=work_order).order_by('-timestamp')
        results = [log.to_dict() for log in logs]
        return jsonify(results)
    except DoesNotExist:
        return jsonify({"error": "WorkOrder not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Get All Logs (optional: filter by work_order_id query param)
@logs_bp.route('/', methods=['GET'])
def get_logs():
    try:
        work_order_id = request.args.get('work_order_id')
        if work_order_id:
            work_order = WorkOrder.objects.get(id=work_order_id)
            logs = AgentLog.objects(work_order=work_order).order_by('-timestamp')
        else:
            logs = AgentLog.objects().order_by('-timestamp')
        
        results = [log.to_dict() for log in logs]
        return jsonify(results)
    except DoesNotExist:
        return jsonify({"error": "WorkOrder not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Create a Log Entry
@logs_bp.route('/', methods=['POST'])
def create_log():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('work_order_id'):
            return jsonify({"error": "work_order_id is required"}), 400
        if not data.get('agent_action'):
            return jsonify({"error": "agent_action is required"}), 400
        
        work_order = WorkOrder.objects.get(id=data['work_order_id'])
        
        # Get related step if provided
        related_step = None
        if data.get('step_id'):
            try:
                related_step = PlanStep.objects.get(id=data['step_id'], work_order=work_order)
            except DoesNotExist:
                pass  # Step not found, but continue without it
        
        # Create log entry
        log = AgentLog(
            work_order=work_order,
            agent_action=data['agent_action'],
            result=data.get('result', ''),
            related_step=related_step,
            source=data.get('source', 'agent'),
            log_type=data.get('log_type', 'info'),
            timestamp=datetime.now(timezone.utc)
        )
        log.save()
        
        return jsonify(log.to_dict()), 201
    except DoesNotExist:
        return jsonify({"error": "WorkOrder not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Get Single Log Entry
@logs_bp.route('/<string:log_id>', methods=['GET'])
def get_log(log_id):
    try:
        log = AgentLog.objects.get(id=log_id)
        return jsonify(log.to_dict())
    except DoesNotExist:
        return jsonify({"error": "Log not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Delete Log Entry
@logs_bp.route('/<string:log_id>', methods=['DELETE'])
def delete_log(log_id):
    try:
        log = AgentLog.objects.get(id=log_id)
        log.delete()
        return jsonify({"message": "Log deleted"})
    except DoesNotExist:
        return jsonify({"error": "Log not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

