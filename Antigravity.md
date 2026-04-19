# CLAUDE.md - Backend & Database Context

## Project Overview
AI-powered startup funding platform. Promoters submit ideas (PDFs + Form data), an AI scores them, and investors pay to unlock full details.
- **Architecture:** Decoupled. The Flask backend acts *exclusively* as a headless REST API returning JSON. No HTML rendering (no Jinja2).
- **Tech Stack:** Python 3, Flask, Flask-SQLAlchemy, PostgreSQL (hosted on Supabase).

## Developer Role: Backend & DB Lead (Current User)
- **Primary Focus:** Database schema (`models.py`), API routing (`routes/`), and Supabase integration.
- **Out of Scope:** Do not implement the internal logic for AI scoring or PDF extraction. Those are handled by teammates.

## Dependency Contract (Teammate Services)
Treat the files in `backend/services/` as "black boxes". When writing backend routes, assume these functions exist and return the following structures. **Use mock data inside them for now** so API development is not blocked:
1. `services.pdf_processor.extract_text(file_stream) -> dict`
   - Returns: `{"text": "extracted string...", "status": "success"}`
2. `services.ai_engine.generate_score(project_text) -> dict`
   - Returns: `{"total_score": 85, "summary": "...", "breakdown": {"viability": 80, "feasibility": 90, "impact": 85, "roi": 85}}`

## Coding Standards
- **Routing:** Use Flask Blueprints. Store route files in `backend/routes/`.
- **Database:** Use Flask-SQLAlchemy. Columns must be `snake_case`. Use `JSONB` for the AI analysis breakdown.
- **Responses:** Every endpoint must return a JSON response (use `jsonify`). Handle errors gracefully with appropriate HTTP status codes (e.g., 400, 422, 500).
- **Security:** Passwords must be hashed. Never hardcode credentials; read from `os.getenv()`.

## Directory Structure
```
backend/
├── app.py                 # App factory, DB init, CORS setup
├── models.py              # SQLAlchemy schemas (User, Project, Transaction)
├── routes/                # Blueprints (auth.py, projects.py, payments.py)
└── services/              # Teammate logic (ai_engine.py, pdf_processor.py)
```

## Operational Rules & Commands
- **Database Connection:** Uses `postgresql://` protocol via `.env` (Supabase port 5432).
- **Init DB:** `python -c "from app import app, db; with app.app_context(): db.create_all()"`
- **Run Server:** `python app.py` (Ensure debug mode is on for local dev).

## Antigravity Agent Rules
- **Autonomy:** Agents are permitted to use the integrated browser to verify Supabase/SQLAlchemy documentation.
- **Verification:** Every backend route must be verified using a `curl` command in the integrated terminal or a browser test before marked as "Complete."
- **Artifacts:** Agents must generate an "Implementation Plan" before touching `models.py` to ensure schema alignment with the Backend Lead.
