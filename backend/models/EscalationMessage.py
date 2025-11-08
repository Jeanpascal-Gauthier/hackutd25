from mongoengine import Document, StringField, ReferenceField, DateTimeField
from models import WorkOrder, Technician

class EscalationMessage(Document):
    work_order_id = ReferenceField(WorkOrder)
    timestamp = DateTimeField()
    message = StringField()
    engineer = ReferenceField(Technician)
    status = StringField(choices=["sent","acknowledged","resolved"], default="sent")
