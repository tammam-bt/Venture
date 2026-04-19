from flask import Blueprint, request, jsonify, make_response
from models import db, Transaction, TransactionType, TransactionStatus, Project
from flask_jwt_extended import jwt_required, get_jwt_identity

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/unlock/<int:project_id>', methods=['POST'])
@jwt_required()
def initiate_unlock(project_id):
    user_id = get_jwt_identity()
    project = Project.query.get_or_404(project_id)

    # Check if already unlocked
    existing = Transaction.query.filter_by(
        user_id=int(user_id), 
        project_id=project_id, 
        type=TransactionType.UNLOCK, 
        status=TransactionStatus.COMPLETED
    ).first()
    
    if existing:
        return jsonify({"message": "Project already unlocked"}), 200

    # Create pending transaction
    tx = Transaction(
        user_id=int(user_id),
        project_id=project_id,
        type=TransactionType.UNLOCK,
        status=TransactionStatus.PENDING,
        amount=50.0  # mock fee amount for hackerathon
    )
    db.session.add(tx)
    db.session.commit()

    return jsonify({
        "message": "Checkout initiated",
        "checkout_url": f"/api/payments/mock_checkout/{tx.id}"
    }), 200

@payments_bp.route('/mock_checkout/<int:tx_id>', methods=['GET'])
def mock_checkout(tx_id):
    tx = Transaction.query.get_or_404(tx_id)
    html = f"""
    <html>
        <head><title>Mock Payment</title></head>
        <body style="font-family: sans-serif; padding: 2rem;">
            <h1>Mock Payment Gateway</h1>
            <p>Pay ${tx.amount} to unlock Project {tx.project_id}</p>
            <form action="/api/payments/mock_success/{tx.id}" method="POST">
                <button type="submit" style="padding: 1rem 2rem; background: #007bff; color: white; border: none; cursor: pointer; border-radius: 4px;">
                    Pay Now
                </button>
            </form>
            <p style="color: gray; margin-top: 1rem;">This is a mock page. Pressing the button will simulate a successful real payment event (e.g. from Stripe Checkout).</p>
        </body>
    </html>
    """
    return make_response(html)

@payments_bp.route('/mock_success/<int:tx_id>', methods=['POST'])
def mock_success(tx_id):
    tx = Transaction.query.get_or_404(tx_id)
    tx.status = TransactionStatus.COMPLETED
    db.session.commit()
    
    html = f"""
    <html>
        <head><title>Payment Success</title></head>
        <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
            <h1 style="color: green;">Payment Successful!</h1>
            <p>You can now view the full details of Project {tx.project_id}.</p>
            <a href="http://localhost:3000/project/{tx.project_id}" style="color: blue; text-decoration: underline;">Return to Application</a>
        </body>
    </html>
    """
    return make_response(html)
