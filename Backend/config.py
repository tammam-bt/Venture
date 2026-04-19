import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    _raw_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/venture_db')
    # Strip sslmode from URL to avoid conflicts — we pass it via engine options instead
    SQLALCHEMY_DATABASE_URI = _raw_url.split('?')[0]
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"sslmode": "require"},
        "pool_pre_ping": True,
    }
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-key-for-hackathon')
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
