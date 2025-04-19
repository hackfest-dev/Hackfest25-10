import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from scoring.creditScoringSystem import CreditScoringSystem, benchmark_data, feature_names, weights

# Load .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'))

app = Flask(__name__)

# Initialize the credit scoring system
scoring = CreditScoringSystem(
    benchmark_data=benchmark_data,
    feature_names=feature_names,
    weights=weights
)

@app.route('/score', methods=['POST'])
def score():
    payload = request.get_json() or {}

    user_id = payload.get('userId')
    
    print(f"Received payload: {payload}")
    if not user_id:
        return jsonify({'error': 'Missing userId'}), 400

    try:
        # Ensure that user_id is a string
        if not isinstance(user_id, str) or len(user_id) == 0:
            return jsonify({'error': 'Invalid userId format, expected a non-empty string'}), 400

        # Manually assign feature data based on user_id (no need to query the database)
        if user_id == "6803b88f17d16d54a7861bae":
            feature_names = {
                "previous_emis_paid": 3,
                "previous_emis_missed": 7,
                "total_amount_borrowed": 20000,
                "total_amount_paid": 8000,
                "total_pending_amount": 12000,
                "avg_payment_delay": 12,
                "monthly_repayment_ratio": 0.4
            }
        else:
            feature_names = {
                "previous_emis_paid": 10,
                "previous_emis_missed": 1,
                "total_amount_borrowed": 30000,
                "total_amount_paid": 28000,
                "total_pending_amount": 2000,
                "avg_payment_delay": 2,
                "monthly_repayment_ratio": 0.9
            }

    except Exception as e:
        return jsonify({'error': 'Error processing data', 'details': str(e)}), 500

    # Evaluate the applicant's credit score
    result = scoring.evaluate_applicant(feature_names)
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
