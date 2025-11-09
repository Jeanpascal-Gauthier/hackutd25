from mongoengine import Document, StringField, EmailField, DateTimeField
from datetime import datetime
import bcrypt

# Note: bcrypt may need to be installed: pip install bcrypt

class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    role = StringField(required=True, choices=["technician", "engineer"], default="technician")
    name = StringField(required=True)
    team = StringField(choices=["compute", "network", "storage"], default="compute")
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def set_password(self, password):
        """Hash and set the password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        """Check if the provided password matches the hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        """Convert user to dictionary (excluding password)"""
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "name": self.name,
            "team": self.team,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

