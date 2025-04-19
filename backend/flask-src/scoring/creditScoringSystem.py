import numpy as np

class CreditScoringSystem:
    def __init__(self, benchmark_data, feature_names, weights=None, int_min=0.05, int_max=0.25, L_base=None):
        self.feature_names = feature_names
        self.int_min = int_min
        self.int_max = int_max

        self.min_vals = {}
        self.max_vals = {}
        self.weights = {}

        for feature in feature_names:
            vals = [d[feature] for d in benchmark_data]
            self.min_vals[feature] = min(vals)
            self.max_vals[feature] = max(vals)

        if weights:
            self.weights = weights
        else:
            eq = 1 / len(feature_names)
            self.weights = {f: eq for f in feature_names}

        if L_base is not None:
            self.L_base = L_base
        else:
            good = [d['total_amount_borrowed'] for d in benchmark_data if d.get('previous_emis_missed',0) == 0]
            self.L_base = np.mean(good) if good else 10000

    def normalize(self, value, feature):
        lo, hi = self.min_vals[feature], self.max_vals[feature]
        if hi == lo:
            return 0.0

        norm = (value - lo) / (hi - lo)

        # Features where higher values are bad for creditworthiness
        negatively_correlated = {
            'previous_emis_missed',
            'total_pending_amount',
            'avg_payment_delay'
        }

        if feature in negatively_correlated:
            return 1 - norm  # reverse scale for bad features

        return norm

    def evaluate_applicant(self, data):
        norm = {f: self.normalize(data.get(f, 0), f) for f in self.feature_names}
        idx = sum(self.weights[f] * norm[f] for f in self.feature_names)

        # Clamp risk index between a soft minimum (say 0.2) and 1.0
        idx = max(0.2, min(1.0, idx))

        # Calculate the credit score (higher risk = lower score)
        credit_score = round(900 - (idx * 600), 0)  # Maps risk index to credit score

        rate = self.int_min + (1 - idx) * (self.int_max - self.int_min)
        cap = idx * self.L_base
        return {
            'risk_index': round(idx, 4),
            'interest_rate_percent': round(rate * 100, 2),
            'max_loan_amount': round(cap, 2),
            'credit_score': credit_score  # Add credit score to the result
        }

# Example benchmark data (good and bad)
benchmark_data = [
    {
        'previous_emis_paid': 12,
        'previous_emis_missed': 0,
        'total_amount_borrowed': 50000,
        'total_amount_paid': 50000,
        'total_pending_amount': 0,
        'avg_payment_delay': 0,
        'monthly_repayment_ratio': 1.0
    },
    {
        'previous_emis_paid': 5,
        'previous_emis_missed': 5,
        'total_amount_borrowed': 20000,
        'total_amount_paid': 10000,
        'total_pending_amount': 10000,
        'avg_payment_delay': 10,
        'monthly_repayment_ratio': 0.5
    }
]

feature_names = [
    'previous_emis_paid',
    'previous_emis_missed',
    'total_amount_borrowed',
    'total_amount_paid',
    'total_pending_amount',
    'avg_payment_delay',
    'monthly_repayment_ratio'
]

weights = {
    'previous_emis_paid': 0.20,
    'previous_emis_missed': 0.25,
    'total_amount_borrowed': 0.10,
    'total_amount_paid': 0.10,
    'total_pending_amount': 0.10,
    'avg_payment_delay': 0.15,
    'monthly_repayment_ratio': 0.10
}
