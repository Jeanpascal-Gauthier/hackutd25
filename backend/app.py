from flask import Flask, jsonify, request
from flask_cors import CORS
from mongoengine import connect
from dotenv import load_dotenv
import os
import agent.main_agent
from routes.work_orders import work_orders_bp
from routes.auth import auth_bp
from routes.escalations import escalations_bp
from routes.inventory import inventory_bp
from routes.logs import logs_bp

app = Flask(__name__)
CORS(app)

connect(
    db="datacenter",
    host=os.getenv("MONGODB_HOST")
)

print("Connected to MongoDB!")

# Register blueprints
app.register_blueprint(work_orders_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(escalations_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(logs_bp)

if __name__ == "__main__":
    app.run(port=5000, debug=True)