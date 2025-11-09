# /routes/inventory.py
from flask import Blueprint, request, jsonify
from mongoengine import DoesNotExist
from models.InventoryItem import InventoryItem

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

# Get All Inventory Items
@inventory_bp.route('/', methods=['GET'])
def get_inventory():
    try:
        items = InventoryItem.objects()
        results = [item.to_dict() for item in items]
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Get Single Inventory Item
@inventory_bp.route('/<string:item_id>', methods=['GET'])
def get_inventory_item(item_id):
    try:
        item = InventoryItem.objects.get(id=item_id)
        return jsonify(item.to_dict())
    except DoesNotExist:
        return jsonify({"error": "Inventory item not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Search Inventory Items
@inventory_bp.route('/search', methods=['GET'])
def search_inventory():
    try:
        query = request.args.get('q', '')
        location = request.args.get('location', '')
        
        if query and location:
            items = InventoryItem.objects(name__icontains=query, location__icontains=location)
        elif query:
            items = InventoryItem.objects(name__icontains=query)
        elif location:
            items = InventoryItem.objects(location__icontains=location)
        else:
            items = InventoryItem.objects()
        
        results = [item.to_dict() for item in items]
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Create Inventory Item
@inventory_bp.route('/', methods=['POST'])
def create_inventory_item():
    try:
        data = request.json
        item = InventoryItem(
            name=data.get('name'),
            quantity=int(data.get('quantity', 0)),
            location=data.get('location', ''),
            cost=data.get('cost', ''),
            reserved=bool(data.get('reserved', False))
        )
        item.save()
        return jsonify(item.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Update Inventory Item
@inventory_bp.route('/<string:item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    try:
        item = InventoryItem.objects.get(id=item_id)
        data = request.json
        
        if 'name' in data:
            item.name = data['name']
        if 'quantity' in data:
            item.quantity = int(data['quantity'])
        if 'location' in data:
            item.location = data['location']
        if 'cost' in data:
            item.cost = data['cost']
        if 'reserved' in data:
            item.reserved = bool(data['reserved'])
        
        item.save()
        return jsonify(item.to_dict())
    except DoesNotExist:
        return jsonify({"error": "Inventory item not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Update Inventory Quantity
@inventory_bp.route('/<string:item_id>/quantity', methods=['PATCH'])
def update_inventory_quantity(item_id):
    try:
        item = InventoryItem.objects.get(id=item_id)
        data = request.json
        quantity_change = int(data.get('quantity_change', 0))
        
        new_quantity = max(0, item.quantity + quantity_change)
        item.quantity = new_quantity
        item.save()
        
        return jsonify(item.to_dict())
    except DoesNotExist:
        return jsonify({"error": "Inventory item not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Delete Inventory Item
@inventory_bp.route('/<string:item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    try:
        item = InventoryItem.objects.get(id=item_id)
        item.delete()
        return jsonify({"message": "Inventory item deleted"})
    except DoesNotExist:
        return jsonify({"error": "Inventory item not found"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

