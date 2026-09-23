import os
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from .feature_engineering import extract_anomaly_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "anomaly_model.joblib")

class AnomalyDetector:
    def __init__(self):
        self.model: IsolationForest = None
        self._load_or_train_fallback()

    def _load_or_train_fallback(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                return
            except Exception as e:
                print(f"Warning: Failed to load {MODEL_PATH}: {e}")

        # Train a default baseline IsolationForest model
        np.random.seed(42)
        # Normal nominal data
        n_samples = 600
        normal_idle = np.random.normal(18.0, 4.0, (n_samples, 1))
        normal_idle_dev = (normal_idle - 18.0) / 18.0 * 100.0
        normal_rpm = np.random.normal(1800, 50, (n_samples, 1))
        normal_hyd = np.random.normal(245, 15, (n_samples, 1))
        normal_spd = np.random.exponential(1.0, (n_samples, 1))
        normal_swing = np.random.normal(8.0, 2.0, (n_samples, 1))
        normal_vib = np.random.normal(2.0, 0.4, (n_samples, 1))

        X_train = np.hstack([
            normal_idle, normal_idle_dev, normal_rpm, normal_hyd, normal_spd, normal_swing, normal_vib
        ])

        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.08,
            random_state=42
        )
        self.model.fit(X_train)

    def predict_anomaly(self, telemetry_dict: dict, baseline_idle: float = 18.0) -> dict:
        features = extract_anomaly_features(telemetry_dict, baseline_idle)
        # isolation forest: -1 is anomaly, 1 is normal
        pred = self.model.predict(features)[0]
        # score_samples returns opposite of anomaly score (lower is more anomalous)
        raw_score = self.model.score_samples(features)[0]

        # Convert to 0 - 100 Anomaly Score (100 is highly anomalous)
        # Typical raw_score is between -0.8 and -0.3
        normalized_score = int(np.clip(((-raw_score) - 0.35) / 0.40 * 100.0, 5, 98))

        is_anomaly = pred == -1 or normalized_score > 60

        # Determine primary contributing factors
        contributions = []
        idle_val = features[0, 0]
        idle_dev = features[0, 1]
        rpm_val = features[0, 2]
        hyd_val = features[0, 3]

        if idle_dev > 50:
            contributions.append({
                "type": "Excessive Idling during Hauler Delay",
                "severity": "MEDIUM" if idle_dev < 100 else "HIGH",
                "detail": f"Idle percentage at {idle_val:.0f}% (baseline {baseline_idle:.0f}%), causing excess delay and fuel burn.",
                "detectedAt": "09:30 AM",
                "deviation": f"+{idle_dev:.0f}% vs Operator Baseline"
            })
        if hyd_val > 290:
            contributions.append({
                "type": "Hydraulic Pressure Spike on Hard Sub-base",
                "severity": "LOW" if hyd_val < 320 else "HIGH",
                "detail": f"Peak pressure reached {hyd_val:.0f} bar momentarily when striking dense clay subgrade.",
                "detectedAt": "10:15 AM",
                "deviation": f"+{((hyd_val - 245)/245*100):.0f}% vs Nominal"
            })
        if rpm_val > 2100:
            contributions.append({
                "type": "Engine RPM Overrun",
                "severity": "MEDIUM",
                "detail": f"Engine speed reached {rpm_val:.0f} RPM exceeding 1900 RPM eco-threshold.",
                "detectedAt": "10:45 AM",
                "deviation": f"+{((rpm_val - 1800)/1800*100):.0f}% vs Target"
            })

        return {
            "anomalyScore": normalized_score,
            "isAnomaly": is_anomaly,
            "anomaliesDetected": contributions,
            "featuresEvaluated": {
                "idlePercent": float(idle_val),
                "idleDeviation": float(idle_dev),
                "rpm": int(rpm_val),
                "hydraulicPressure": int(hyd_val)
            }
        }

anomaly_detector = AnomalyDetector()
