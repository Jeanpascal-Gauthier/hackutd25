from mongoengine import Document, StringField, ListField
from models import WorkOrder

class Technician(Document):
    name = StringField(required=True)
    skill_level = StringField(choices=["junior","mid","senior"], default="mid")
    assigned_work_orders = ListField(WorkOrder)
    current_status = StringField(choices=["available","busy","offline"], default="available")
