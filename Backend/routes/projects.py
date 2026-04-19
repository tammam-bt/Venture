from flask import Blueprint, request, jsonify
from models import db, Project, ProjectStatus, Transaction, TransactionType, TransactionStatus
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from services.ai_engine import evaluate_startup

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_project():
    user_id = get_jwt_identity()

    # Get text fields
    title = request.form.get('title')
    company_name = request.form.get('company_name')
    industry = request.form.get('industry')
    funding_amount = request.form.get('funding_amount')
    stage = request.form.get('stage')
    project_type = request.form.get('project_type', 'Startup')

    if not all([title, company_name, industry, funding_amount, stage]):
        return jsonify({"error": "Missing required text fields"}), 400

    # Get files
    pitch_deck = request.files.get('pitch_deck')
    financials = request.files.get('financials')

    if not pitch_deck or not financials:
        return jsonify({"error": "Missing required files (pitch_deck, financials)"}), 400

    # Mock Supabase Storage upload
    pitch_deck_url = f"https://mock-supabase.com/storage/v1/object/public/uploads/{user_id}_pitch.pdf"
    financials_url = f"https://mock-supabase.com/storage/v1/object/public/uploads/{user_id}_financials.pdf"

    documents_json = {
        "pitch_deck": pitch_deck_url,
        "financials": financials_url
    }

    # Save to disk temporarily
    pitch_path = f"/tmp/{user_id}_pitch.pdf"
    financials_path = f"/tmp/{user_id}_financials.pdf"
    os.makedirs('/tmp', exist_ok=True)
    pitch_deck.save(pitch_path)
    financials.save(financials_path)

    try:
        # Call new teammate API
        score_result = evaluate_startup(
            company_name=company_name, 
            project_type=project_type, 
            sector=industry, 
            stage=stage, 
            funding_amount=funding_amount, 
            pitch_path=pitch_path, 
            financial_path=financials_path
        )
    except Exception as e:
        # Fallback to mock data if AI fails (invalid PDF, missing API key, etc.)
        import traceback
        traceback.print_exc()
        score_result = {
            "viability": {"score": 20, "evidence": "N/A", "verdict": "Could not evaluate - AI pipeline error"},
            "feasibility": {"score": 20, "evidence": "N/A", "verdict": "Could not evaluate - AI pipeline error"},
            "impact": {"score": 20, "evidence": "N/A", "verdict": "Could not evaluate - AI pipeline error"},
            "roi_financial_logic": {"score": 20, "evidence": "N/A", "verdict": "Could not evaluate - AI pipeline error"},
            "total_score": 0,
            "overall_summary": f"AI evaluation failed: {str(e)}. Project saved with placeholder scores.",
            "biggest_red_flag": "AI evaluation could not be completed.",
            "investor_recommendation": "PENDING REVIEW"
        }
    finally:
        # Cleanup temp files
        if os.path.exists(pitch_path): os.remove(pitch_path)
        if os.path.exists(financials_path): os.remove(financials_path)

    # Save to database
    project = Project(
        promoter_id=int(user_id),
        title=title,
        company_name=company_name,
        industry=industry,
        funding_amount=funding_amount,
        stage=stage,
        summary=score_result.get("overall_summary", ""),
        score=score_result.get("total_score", 0),
        eval_summary=score_result,
        documents_json=documents_json,
        status=ProjectStatus.LISTED
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({
        "message": "Project submitted successfully",
        "project_id": project.id,
        "score": project.score
    }), 201

@projects_bp.route('/feed', methods=['GET'])
def get_feed():
    projects = Project.query.filter_by(status=ProjectStatus.LISTED).order_by(Project.score.desc()).all()
    
    feed = []
    for p in projects:
        feed.append({
            "id": p.id,
            "title": p.title,
            "company_name": p.company_name,
            "industry": p.industry,
            "summary": p.summary,
            "score": p.score
        })
    return jsonify({"feed": feed}), 200

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.get_or_404(project_id)

    # Check if promoter owns this or if investor unlocked it
    is_owner = str(project.promoter_id) == str(user_id)
    has_unlocked = Transaction.query.filter_by(
        user_id=int(user_id), 
        project_id=project_id, 
        type=TransactionType.UNLOCK, 
        status=TransactionStatus.COMPLETED
    ).first() is not None

    if is_owner or has_unlocked:
        return jsonify({
            "id": project.id,
            "title": project.title,
            "company_name": project.company_name,
            "industry": project.industry,
            "funding_amount": project.funding_amount,
            "stage": project.stage,
            "summary": project.summary,
            "score": project.score,
            "eval_summary": project.eval_summary,
            "documents_json": project.documents_json,
            "promoter_contact": {
                "email": project.promoter.email,
                "phone": project.promoter.phone_number,
                "whatsapp": project.promoter.whatsapp_number
            }
        }), 200
    
    return jsonify({"error": "Unauthorized. Project must be unlocked first."}), 403
