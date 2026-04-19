from flask import Flask
from config import Config
from models import db
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.payments import payments_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')

    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # This can be used to initialize the database
        db.create_all()
    app.run(debug=True, port=int(os.environ.get('PORT', 5000)))
