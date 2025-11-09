#!/usr/bin/env python3
"""
Seed script to populate the database with realistic data center inventory items.
Run this script to populate the inventory with common data center components.
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import models
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from mongoengine import connect
from models.InventoryItem import InventoryItem
from datetime import datetime

load_dotenv()

# Connect to MongoDB
connect(
    db="datacenter",
    host=os.getenv("MONGODB_HOST")
)

# Realistic data center inventory items with quantities
INVENTORY_ITEMS = [
    # GPUs - High-end data center GPUs
    {"name": "NVIDIA H100 GPU", "quantity": 23, "location": "Storage Room A", "cost": "35000", "reserved": False},
    {"name": "NVIDIA A100 GPU", "quantity": 47, "location": "Storage Room A", "cost": "10000", "reserved": False},
    {"name": "NVIDIA A40 GPU", "quantity": 12, "location": "Storage Room A", "cost": "5500", "reserved": False},
    {"name": "NVIDIA V100 GPU", "quantity": 8, "location": "Storage Room B", "cost": "8000", "reserved": False},
    
    # Memory Modules
    {"name": "Corsair DDR4 ECC 32GB SDRAM", "quantity": 156, "location": "Storage Room B", "cost": "250", "reserved": False},
    {"name": "Corsair DDR4 ECC 64GB SDRAM", "quantity": 89, "location": "Storage Room B", "cost": "450", "reserved": False},
    {"name": "Samsung DDR5 64GB ECC SDRAM", "quantity": 124, "location": "Storage Room B", "cost": "500", "reserved": False},
    {"name": "Micron DDR4 128GB ECC SDRAM", "quantity": 45, "location": "Storage Room B", "cost": "1200", "reserved": False},
    
    # CPUs
    {"name": "Intel Xeon Platinum 8380", "quantity": 34, "location": "Storage Room C", "cost": "8100", "reserved": False},
    {"name": "Intel Xeon Gold 6348", "quantity": 67, "location": "Storage Room C", "cost": "3072", "reserved": False},
    {"name": "AMD EPYC 7763", "quantity": 28, "location": "Storage Room C", "cost": "7890", "reserved": False},
    {"name": "AMD EPYC 7543", "quantity": 41, "location": "Storage Room C", "cost": "3760", "reserved": False},
    
    # Storage Drives
    {"name": "Samsung 980 Pro 2TB NVMe SSD", "quantity": 89, "location": "Storage Room D", "cost": "200", "reserved": False},
    {"name": "Intel P5510 3.84TB NVMe SSD", "quantity": 56, "location": "Storage Room D", "cost": "800", "reserved": False},
    {"name": "Western Digital SN850 1TB NVMe SSD", "quantity": 112, "location": "Storage Room D", "cost": "150", "reserved": False},
    {"name": "Seagate Exos X20 20TB HDD", "quantity": 78, "location": "Storage Room D", "cost": "450", "reserved": False},
    {"name": "Western Digital Gold 18TB HDD", "quantity": 92, "location": "Storage Room D", "cost": "400", "reserved": False},
    
    # Power Supplies
    {"name": "Super Micro 1600W 80 Plus Platinum PSU", "quantity": 45, "location": "Storage Room E", "cost": "350", "reserved": False},
    {"name": "Delta Electronics 2000W 80 Plus Platinum PSU", "quantity": 23, "location": "Storage Room E", "cost": "550", "reserved": False},
    {"name": "Seasonic 1200W 80 Plus Titanium PSU", "quantity": 34, "location": "Storage Room E", "cost": "280", "reserved": False},
    
    # Network Cards
    {"name": "Intel X710 10GbE Dual Port Network Adapter", "quantity": 67, "location": "Storage Room F", "cost": "250", "reserved": False},
    {"name": "Mellanox ConnectX-6 100GbE Network Adapter", "quantity": 28, "location": "Storage Room F", "cost": "1200", "reserved": False},
    {"name": "Broadcom 57416 25GbE Dual Port Network Adapter", "quantity": 41, "location": "Storage Room F", "cost": "450", "reserved": False},
    
    # Cooling Components
    {"name": "Noctua NH-U12A CPU Cooler", "quantity": 56, "location": "Storage Room G", "cost": "100", "reserved": False},
    {"name": "Corsair H150i RGB Liquid CPU Cooler", "quantity": 34, "location": "Storage Room G", "cost": "180", "reserved": False},
    {"name": "Arctic P12 PWM 120mm Fan (5-pack)", "quantity": 45, "location": "Storage Room G", "cost": "30", "reserved": False},
    
    # Cables and Connectors
    {"name": "Cat6 Ethernet Cable 10ft", "quantity": 234, "location": "Storage Room H", "cost": "8", "reserved": False},
    {"name": "Cat6A Ethernet Cable 25ft", "quantity": 178, "location": "Storage Room H", "cost": "15", "reserved": False},
    {"name": "Fiber Optic Cable LC-LC 50m", "quantity": 89, "location": "Storage Room H", "cost": "45", "reserved": False},
    {"name": "SATA 6Gb/s Cable", "quantity": 156, "location": "Storage Room H", "cost": "5", "reserved": False},
    {"name": "SAS 12Gb/s Cable", "quantity": 112, "location": "Storage Room H", "cost": "12", "reserved": False},
    
    # Server Components
    {"name": "Supermicro X12SPI-TF Motherboard", "quantity": 23, "location": "Storage Room I", "cost": "650", "reserved": False},
    {"name": "ASUS ProArt X570-CREATOR WIFI Motherboard", "quantity": 18, "location": "Storage Room I", "cost": "450", "reserved": False},
    {"name": "Dell PowerEdge R750 Chassis", "quantity": 12, "location": "Storage Room I", "cost": "2500", "reserved": False},
    {"name": "HP ProLiant DL380 Gen10 Chassis", "quantity": 15, "location": "Storage Room I", "cost": "2800", "reserved": False},
    
    # RAID Controllers
    {"name": "Dell PERC H740P RAID Controller", "quantity": 34, "location": "Storage Room J", "cost": "450", "reserved": False},
    {"name": "LSI MegaRAID 9460-8i RAID Controller", "quantity": 28, "location": "Storage Room J", "cost": "600", "reserved": False},
    
    # Backup Power
    {"name": "APC Smart-UPS 3000VA UPS", "quantity": 15, "location": "Storage Room K", "cost": "800", "reserved": False},
    {"name": "Eaton 5PX 3000VA UPS", "quantity": 12, "location": "Storage Room K", "cost": "750", "reserved": False},
    {"name": "CyberPower OR2200LCDRT2U UPS", "quantity": 18, "location": "Storage Room K", "cost": "450", "reserved": False},
    
    # Rack Components
    {"name": "42U Server Rack", "quantity": 8, "location": "Warehouse", "cost": "1200", "reserved": False},
    {"name": "19-inch Rack Mount Rails (Pair)", "quantity": 45, "location": "Storage Room L", "cost": "80", "reserved": False},
    {"name": "PDU Power Distribution Unit 30A", "quantity": 23, "location": "Storage Room L", "cost": "350", "reserved": False},
    
    # Miscellaneous
    {"name": "Thermal Paste (Arctic MX-4)", "quantity": 67, "location": "Storage Room M", "cost": "8", "reserved": False},
    {"name": "Compressed Air Duster", "quantity": 34, "location": "Storage Room M", "cost": "12", "reserved": False},
    {"name": "Anti-Static Wrist Strap", "quantity": 45, "location": "Storage Room M", "cost": "5", "reserved": False},
    {"name": "Server Screw Set (M3, M4, M5)", "quantity": 89, "location": "Storage Room M", "cost": "15", "reserved": False},
]

def seed_inventory():
    """Seed the database with inventory items."""
    print("Starting inventory seeding...")
    
    # Clear existing inventory (optional - comment out if you want to keep existing items)
    # InventoryItem.objects().delete()
    # print("Cleared existing inventory items.")
    
    created_count = 0
    updated_count = 0
    
    for item_data in INVENTORY_ITEMS:
        # Check if item already exists
        existing_item = InventoryItem.objects(name=item_data["name"]).first()
        
        if existing_item:
            # Update existing item
            existing_item.quantity = item_data["quantity"]
            existing_item.location = item_data["location"]
            existing_item.cost = item_data["cost"]
            existing_item.reserved = item_data["reserved"]
            existing_item.save()
            updated_count += 1
            print(f"Updated: {item_data['name']} - Quantity: {item_data['quantity']}")
        else:
            # Create new item
            inventory_item = InventoryItem(
                name=item_data["name"],
                quantity=item_data["quantity"],
                location=item_data["location"],
                cost=item_data["cost"],
                reserved=item_data["reserved"]
            )
            inventory_item.save()
            created_count += 1
            print(f"Created: {item_data['name']} - Quantity: {item_data['quantity']} - Location: {item_data['location']}")
    
    print(f"\nInventory seeding complete!")
    print(f"Created: {created_count} items")
    print(f"Updated: {updated_count} items")
    print(f"Total items in inventory: {InventoryItem.objects().count()}")

if __name__ == "__main__":
    try:
        seed_inventory()
    except Exception as e:
        print(f"Error seeding inventory: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
