from mongoengine import Document, StringField, ReferenceField, DateTimeField
from models import WorkOrder

class PlanStep(Document):
    work_order_id = ReferenceField(WorkOrder)
    step_number = StringField(required=True)
    description = StringField()
    executor = StringField(choices=["agent","technician"], default="agent")
    status = StringField(choices=["pending","in_progress","completed","failed"], default="pending")
    result = StringField()
    executed_at = DateTimeField()
