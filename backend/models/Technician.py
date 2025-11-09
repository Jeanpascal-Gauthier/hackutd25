from mongoengine import Document, StringField, ListField, ReferenceField

class Technician(Document):
    name = StringField(required=True)
    skill_level = StringField(choices=["junior","mid","senior"], default="mid")
    assigned_work_orders = ListField(ReferenceField('WorkOrder')) 
    current_status = StringField(choices=["available","busy","offline"], default="available")