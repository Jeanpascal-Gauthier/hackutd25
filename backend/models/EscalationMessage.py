from mongoengine import Document, StringField, ReferenceField, DateTimeField

class EscalationMessage(Document):
    work_order_id = ReferenceField('WorkOrder', required=True)  # String reference
    timestamp = DateTimeField(required=True)
    message = StringField(required=True)
    source = StringField(choices=["technician", "ai_agent"], required=True)
    engineer = ReferenceField('Technician')  # String reference
    status = StringField(choices=["sent","acknowledged","resolved"], default="sent")
    
    def to_dict(self):
        """Convert escalation message to dictionary"""
        return {
            "id": str(self.id),
            "work_order_id": str(self.work_order_id.id) if self.work_order_id else None,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "message": self.message,
            "source": self.source,
            "engineer_id": str(self.engineer.id) if self.engineer else None,
            "status": self.status
        }