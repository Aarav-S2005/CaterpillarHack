from ..data.mock_data import db
from ..ml.anomaly_model import anomaly_detector
from ..models.schemas import BehaviorAnalytics, AnomalyDetail, TrendPoint

def get_behavior_analytics() -> BehaviorAnalytics:
    telemetry = db.telemetry
    operator = db.operator
    baseline_idle = 18.0

    # Run actual IsolationForest model inference
    anom_result = anomaly_detector.predict_anomaly(telemetry.model_dump(), baseline_idle)

    idle_pct = 42 if telemetry.idle else 18
    idle_dev = int(round(((idle_pct - baseline_idle) / baseline_idle) * 100))

    hyd_strain = int(min(100, max(10, round((telemetry.hydraulicPressure / 350) * 100))))

    anomalies = [
        AnomalyDetail(**item) for item in anom_result["anomaliesDetected"]
    ]

    trend_history = [
        TrendPoint(time="08:00", idlePercent=20, cycleTimeSec=21.0, rpmAvg=1750, safetyScore=96),
        TrendPoint(time="09:00", idlePercent=28, cycleTimeSec=23.4, rpmAvg=1810, safetyScore=95),
        TrendPoint(time="10:00", idlePercent=36, cycleTimeSec=25.6, rpmAvg=1860, safetyScore=94),
        TrendPoint(time="11:00", idlePercent=idle_pct, cycleTimeSec=24.8, rpmAvg=telemetry.rpm, safetyScore=operator.safetyScore),
    ]

    return BehaviorAnalytics(
        operatorId=operator.id,
        idleTimePercentage=idle_pct,
        idleBaselinePercentage=int(baseline_idle),
        idleDeviationPercentage=idle_dev,
        avgCycleTimeSeconds=24.8,
        baselineCycleTimeSeconds=21.2,
        cycleTimeDeviationPercentage=17,
        rpmSpikeCount=3,
        abruptMovementScore=14,
        fuelBurnRateLitersPerHour=19.4,
        baselineFuelBurnRate=16.8,
        hydraulicStrainIndex=hyd_strain,
        anomalyScore=anom_result["anomalyScore"],
        anomaliesDetected=anomalies,
        trendHistory=trend_history
    )
