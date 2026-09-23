import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

def train_and_save_models():
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    print("Generating synthetic civil excavation dataset...")

    np.random.seed(42)
    n_samples = 2000

    # 1. Anomaly Model Dataset
    # 85% normal operations, 15% anomalous (lugging, excessive idle, hydraulic spikes)
    n_normal = int(n_samples * 0.85)
    n_anom = n_samples - n_normal

    normal_idle = np.random.normal(18.0, 3.5, (n_normal, 1))
    normal_idle_dev = (normal_idle - 18.0) / 18.0 * 100.0
    normal_rpm = np.random.normal(1840, 45, (n_normal, 1))
    normal_hyd = np.random.normal(245, 12, (n_normal, 1))
    normal_spd = np.random.exponential(0.8, (n_normal, 1))
    normal_swing = np.random.normal(8.5, 1.8, (n_normal, 1))
    normal_vib = np.random.normal(2.1, 0.3, (n_normal, 1))
    X_normal = np.hstack([normal_idle, normal_idle_dev, normal_rpm, normal_hyd, normal_spd, normal_swing, normal_vib])

    anom_idle = np.random.uniform(32.0, 55.0, (n_anom, 1))
    anom_idle_dev = (anom_idle - 18.0) / 18.0 * 100.0
    anom_rpm = np.random.uniform(2100, 2350, (n_anom, 1))
    anom_hyd = np.random.uniform(295, 340, (n_anom, 1))
    anom_spd = np.random.uniform(3.5, 9.0, (n_anom, 1))
    anom_swing = np.random.uniform(12.0, 18.0, (n_anom, 1))
    anom_vib = np.random.uniform(3.5, 6.0, (n_anom, 1))
    X_anom = np.hstack([anom_idle, anom_idle_dev, anom_rpm, anom_hyd, anom_spd, anom_swing, anom_vib])

    X_anomaly = np.vstack([X_normal, X_anom])
    anomaly_model = IsolationForest(n_estimators=150, contamination=0.10, random_state=42)
    anomaly_model.fit(X_anomaly)

    anomaly_path = os.path.join(SAVED_MODELS_DIR, "anomaly_model.joblib")
    joblib.dump(anomaly_model, anomaly_path)
    print(f"[OK] Trained and saved Anomaly Detection model to: {anomaly_path}")

    # 2. ETA Prediction Dataset
    vol = np.random.uniform(30.0, 600.0, n_samples)
    depth = np.random.uniform(0.5, 7.0, n_samples)
    soil_hardness = np.random.uniform(2.0, 9.5, n_samples)
    exp = np.random.uniform(0.5, 15.0, n_samples)
    idle = np.random.uniform(10.0, 48.0, n_samples)
    cycle = np.random.uniform(15.0, 34.0, n_samples)
    weather_p = np.random.choice([0.0, 4.0, 6.0, 9.0, 13.0], n_samples)
    fill_ratio = np.random.uniform(0.75, 1.10, n_samples)

    X_eta = np.column_stack([vol, depth, soil_hardness, exp, idle, cycle, weather_p, fill_ratio])

    # True physical excavation formula:
    bucket_capacity_m3 = 1.4
    cycles = vol / (bucket_capacity_m3 * fill_ratio)
    base_minutes = (cycles * cycle) / 60.0
    soil_penalty = (soil_hardness - 3.5) * (vol / 120.0) * 1.8
    idle_penalty = (idle - 18.0) * 0.45
    exp_discount = (exp - 2.0) * 1.2
    noise = np.random.normal(0, 2.5, n_samples)

    y_eta = base_minutes + soil_penalty + idle_penalty + weather_p - exp_discount + noise
    y_eta = np.maximum(y_eta, 8.0)

    X_train, X_test, y_train, y_test = train_test_split(X_eta, y_eta, test_size=0.2, random_state=42)

    eta_model = RandomForestRegressor(n_estimators=150, max_depth=14, random_state=42)
    eta_model.fit(X_train, y_train)

    preds = eta_model.predict(X_test)
    r2 = r2_score(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    print(f"[OK] ETA Model Evaluation: R2 = {r2:.4f}, RMSE = {rmse:.2f} minutes")

    eta_path = os.path.join(SAVED_MODELS_DIR, "eta_model.joblib")
    joblib.dump(eta_model, eta_path)
    print(f"[OK] Trained and saved ETA Prediction model to: {eta_path}")

if __name__ == "__main__":
    train_and_save_models()
