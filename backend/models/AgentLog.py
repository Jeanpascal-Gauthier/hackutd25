from mongoengine import Document, StringField, DateTimeField, ReferenceField
from models import WorkOrder, PlanStep

class AgentLog(Document):
    work_order_id = ReferenceField(WorkOrder)
    timestamp = DateTimeField()
    agent_action = StringField()
    outcome = StringField()
    reasoning = StringField()
    related_step = ReferenceField(PlanStep)
