from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum
from sqlalchemy.dialects.postgresql import JSONB

db = SQLAlchemy()

class UserRole(enum.Enum):
    PROMOTER = "promoter"
    INVESTOR = "investor"

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False)
    phone_number = db.Column(db.String(50), nullable=True)
    whatsapp_number = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ProjectStatus(enum.Enum):
    PENDING = "pending"
    LISTED = "listed"

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    promoter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    company_name = db.Column(db.String(200), nullable=False)
    industry = db.Column(db.String(100), nullable=False)
    funding_amount = db.Column(db.String(100), nullable=False)
    stage = db.Column(db.String(100), nullable=False)
    summary = db.Column(db.Text, nullable=True)
    documents_json = db.Column(JSONB, nullable=True)  # Stores {"pitch_deck": "url", "financials": "url"}
    score = db.Column(db.Integer, nullable=True)
    eval_summary = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum(ProjectStatus), default=ProjectStatus.PENDING)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    promoter = db.relationship('User', backref=db.backref('projects', lazy=True))

class TransactionType(enum.Enum):
    POST = "post"
    UNLOCK = "unlock"

class TransactionStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True)
    type = db.Column(db.Enum(TransactionType), nullable=False)
    status = db.Column(db.Enum(TransactionStatus), default=TransactionStatus.PENDING)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
