from mongoengine import Document, StringField

class InventoryItem(Document):
    name = StringField(required=True)
    quantity = StringField()
    location = StringField()
    cost = StringField()
    reserved = StringField(default=False)
