from flask import Blueprint, request, jsonify
from models import db, User, UserRole
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or 'email' not in data or 'password' not in data or 'role' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400

    try:
        role = UserRole(data['role'].lower())
    except ValueError:
        return jsonify({"error": "Invalid role. Must be 'promoter' or 'investor'"}), 400

    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        role=role,
        phone_number=data.get('phone_number'),
        whatsapp_number=data.get('whatsapp_number')
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user_id": user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(days=1))
        return jsonify({
            "access_token": access_token,
            "user_id": user.id,
            "role": user.role.value
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401
