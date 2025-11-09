from mongoengine import Document, StringField, DateTimeField, ReferenceField
from datetime import datetime, timezone

class AgentLog(Document):
    work_order = ReferenceField('WorkOrder', required=True)
    timestamp = DateTimeField(required=True, default=lambda: datetime.now(timezone.utc))
    agent_action = StringField(required=True)
    result = StringField()
    related_step = ReferenceField('PlanStep')
    source = StringField(choices=["agent", "technician"], default="agent")
    log_type = StringField(choices=["info", "success", "warning", "error"], default="info")
    
    def to_dict(self):
        """Convert log to dictionary for API responses"""
        # Format timestamp with timezone handling
        timestamp_str = None
        if self.timestamp:
            # If datetime is naive (no timezone), assume it's UTC and make it timezone-aware
            if self.timestamp.tzinfo is None:
                timestamp_str = self.timestamp.replace(tzinfo=timezone.utc).isoformat()
            else:
                timestamp_str = self.timestamp.isoformat()
        
        return {
            "id": str(self.id),
            "work_order_id": str(self.work_order.id) if self.work_order else None,
            "timestamp": timestamp_str,
            "message": self.agent_action or "",
            "result": self.result or "",
            "source": self.source or "agent",
            "type": self.log_type or "info",
            "step_id": str(self.related_step.id) if self.related_step else None,
            "step_number": self.related_step.step_number if self.related_step else None,
        }
