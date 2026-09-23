import numpy as np
import pandas as pd

SOIL_HARDNESS_MAP = {
    "Topsoil": 3.0,
    "Dense Sand": 4.5,
    "Gravel": 5.5,
    "Clay / Silt": 7.2,
    "Hard Rock / Granite": 9.5,
}

WEATHER_IMPACT_MAP = {
    "Clear": 0.0,
    "Moderate Rain": 6.0,
    "Heavy Rain": 13.0,
    "Muddy / Wet": 9.0,
    "High Heat": 2.0,
}

def extract_anomaly_features(telemetry_dict: dict, baseline_idle: float = 18.0) -> np.ndarray:
    """
    Extracts numerical feature vector for IsolationForest anomaly detection.
    Features:
    0: idle_percentage
    1: idle_deviation_from_baseline
    2: rpm
    3: hydraulic_pressure
    4: ground_speed
    5: swing_speed
    6: vibration_level
    """
    idle_pct = 42.0 if telemetry_dict.get("idle") else 18.0
    idle_dev = ((idle_pct - baseline_idle) / baseline_idle) * 100.0
    rpm = float(telemetry_dict.get("rpm", 1840))
    hyd = float(telemetry_dict.get("hydraulicPressure", 245))
    speed = float(telemetry_dict.get("speed", 0.8))
    swing_spd = float(telemetry_dict.get("swingSpeed", 8.5))
    vibration = float(telemetry_dict.get("vibrationLevel", 2.1))

    return np.array([[idle_pct, idle_dev, rpm, hyd, speed, swing_spd, vibration]])

def extract_eta_features(
    volume_remaining: float,
    depth: float,
    soil_type: str,
    soil_hardness: float,
    operator_exp: float,
    idle_pct: float,
    cycle_time: float,
    weather: str,
    bucket_fill_ratio: float = 0.95
) -> np.ndarray:
    """
    Extracts feature vector for ETA regression model.
    Features:
    0: volume_remaining (m3)
    1: depth (m)
    2: soil_hardness (1-10)
    3: operator_experience_years
    4: idle_percentage (%)
    5: cycle_time_seconds (s)
    6: weather_penalty_factor (minutes)
    7: bucket_fill_ratio (0.5 - 1.1)
    """
    weather_penalty = WEATHER_IMPACT_MAP.get(weather, 0.0)
    hardness = soil_hardness if soil_hardness > 0 else SOIL_HARDNESS_MAP.get(soil_type, 5.0)

    return np.array([[
        volume_remaining,
        depth,
        hardness,
        operator_exp,
        idle_pct,
        cycle_time,
        weather_penalty,
        bucket_fill_ratio
    ]])
