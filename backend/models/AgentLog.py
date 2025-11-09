from mongoengine import Document, StringField, DateTimeField, ReferenceField
from models import WorkOrder, PlanStep

class AgentLog(Document):
    work_order = ReferenceField('WorkOrder')
    timestamp = DateTimeField()
    agent_action = StringField()
    result = StringField()
    related_step = ReferenceField('PlanStep')
