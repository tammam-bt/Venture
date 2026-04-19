Install Dependencies: pip install -r Venture/Backend/requirements.txt
Initialize Database: python -c "from app import app, db; with app.app_context(): db.create_all()"
Run Server: python app.py
Run Test Script: bash test_endpoints.sh
