from mongoengine import Document, StringField, ListField, ReferenceField, DateTimeField
from models import Technician, PlanStep, AgentLog, EscalationMessage

class WorkOrder(Document):
    title = StringField(required=True)
    description = StringField()
    priority = StringField(choices=["low","medium","high"], default="medium")
    estimated_expertise_level = StringField(choices=["junior","mid","senior"], default="mid")
    category = StringField(choices=["reboot","hardware","network","other"], default="other")
    status = StringField(choices=["pending","in_progress","completed","escalated"], default="pending")
    assigned_technician = ReferenceField(Technician)
    agent_plan = ListField(ReferenceField(PlanStep))
    logs = ListField(ReferenceField(AgentLog))
    escalation_messages = ListField(ReferenceField(EscalationMessage))
    created_at = DateTimeField()
    updated_at = DateTimeField()
