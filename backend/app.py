from flask import Flask, jsonify, request
from flask_cors import CORS
from agent.main_agent import run_agent

app = Flask(__name__)
CORS(app)

WORKORDERS = [
    { "id": 1, "title": "Replace GPU Node A12", "status": "pending" },
    { "id": 2, "title": "Check Rack Temperature R18", "status": "in_progress" }
]

INVENTORY = {
    "gpu-a100": { "available": True, "location": "Shelf 3" },
    "psu-1200w": { "available": True, "location": "Shelf 1" }
}

@app.route("/inventory/<part_id>")
def get_inventory(part_id):
    return jsonify(INVENTORY.get(part_id, {"available": False}))

@app.route("/start_agent/<int:workorder_id>", methods=["POST"])
def start_agent(workorder_id):
    result = run_agent(workorder_id)
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5000, debug=True)