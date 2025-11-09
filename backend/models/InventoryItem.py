from mongoengine import Document, StringField, IntField, BooleanField

class InventoryItem(Document):
    name = StringField(required=True)
    quantity = IntField(default=0)
    location = StringField()
    cost = StringField()
    reserved = BooleanField(default=False)
    
    def to_dict(self):
        """Convert inventory item to dictionary"""
        return {
            "id": str(self.id),
            "name": self.name,
            "quantity": self.quantity,
            "location": self.location or "N/A",
            "cost": self.cost or "N/A",
            "reserved": self.reserved,
            "available": not self.reserved and self.quantity > 0
        }
