from flask import Blueprint, request, jsonify
from mongoengine import DoesNotExist, NotUniqueError
from models.User import User
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv

# Verify that jwt module has the required methods
if not hasattr(jwt, 'encode'):
    raise ImportError(
        "JWT module is missing 'encode' method. "
        "Please install PyJWT: pip install PyJWT==2.8.0"
    )

load_dotenv()

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# JWT Secret Key (in production, use a secure random key from environment)
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

def generate_token(user):
    """Generate JWT token for user"""
    payload = {
        'user_id': str(user.id),
        'username': user.username,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        # Check if request has JSON data
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        data = request.json
        
        # Check if data is None (empty request body)
        if data is None:
            return jsonify({"error": "Request body is required"}), 400
        
        # Validate required fields
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Username, email, and password are required"}), 400
        
        if not data.get('name'):
            return jsonify({"error": "Name is required"}), 400
        
        # Check if user already exists
        if User.objects(username=data['username']).first():
            return jsonify({"error": "Username already exists"}), 400
        
        if User.objects(email=data['email']).first():
            return jsonify({"error": "Email already exists"}), 400
        
        # Validate password length
        if len(data['password']) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
        
        # Validate role
        role = data.get('role', 'technician')
        if role not in ['technician', 'engineer']:
            return jsonify({"error": "Invalid role. Must be 'technician' or 'engineer'"}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            name=data['name'],
            role=role,
            team=data.get('team', 'compute'),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Hash and set password
        user.set_password(data['password'])
        user.save()
        
        # Generate JWT token
        token = generate_token(user)
        
        return jsonify({
            "message": "User created successfully",
            "token": token,
            "user": user.to_dict()
        }), 201
        
    except NotUniqueError:
        return jsonify({"error": "Username or email already exists"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        # Check if request has JSON data
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        data = request.json
        
        # Check if data is None (empty request body)
        if data is None:
            return jsonify({"error": "Request body is required"}), 400
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user by email
        try:
            user = User.objects.get(email=data['email'])
        except DoesNotExist:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Check password
        if not user.check_password(data['password']):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Update last login time
        user.updated_at = datetime.utcnow()
        user.save()
        
        # Generate JWT token
        token = generate_token(user)
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    """Verify JWT token and return user info"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header missing"}), 401
        
        # Extract token from "Bearer <token>"
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({"error": "Invalid authorization header format"}), 401
        
        # Decode and verify token
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get('user_id')
            
            user = User.objects.get(id=user_id)
            return jsonify({
                "valid": True,
                "user": user.to_dict()
            }), 200
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except DoesNotExist:
            return jsonify({"error": "User not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

