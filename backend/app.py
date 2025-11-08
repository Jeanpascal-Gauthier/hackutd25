from flask import Flask, jsonify, request
from flask_cors import CORS
from agent.main_agent import run_agent
from mongoengine import connect
from dotenv import load_dotenv
import os
from routes.work_orders import work_orders_bp

load_dotenv('./')

app = Flask(__name__)
CORS(app)

connect(
    db="datacenter",
    host=os.getenv("MONGODB_HOST")
)

print("Connected to MongoDB!")


app.register_blueprint(work_orders_bp)

if __name__ == "__main__":
    app.run(port=5000, debug=True)