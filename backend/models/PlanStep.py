from mongoengine import Document, StringField, ReferenceField, DateTimeField, IntField

class PlanStep(Document):
    work_order = ReferenceField('WorkOrder')
    step_number = IntField(required=True)
    description = StringField()
    executor = StringField(choices=["agent","technician","undecided"], default="undecided")
    status = StringField(choices=["pending","in_progress","success","failure"], default="pending")
    result = StringField()
    executed_at = DateTimeField()
