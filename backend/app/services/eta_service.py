from ..data.mock_data import db
from ..ml.eta_model import eta_predictor
from ..models.schemas import ETAPrediction, BreakdownFactor, ExplainabilityDetails

def get_eta_prediction(task_id: str = "TASK-402") -> ETAPrediction:
    task = next((t for t in db.tasks if t.id == task_id), db.tasks[0])
    operator = db.operator
    volume_remaining = max(10.0, task.targetVolume - task.completedVolume)

    # Run ML regression model inference
    prediction = eta_predictor.predict_remaining_minutes(
        volume_remaining=volume_remaining,
        depth=task.targetDepth,
        soil_type=task.material,
        soil_hardness=task.soilHardnessIndex,
        operator_exp=operator.experienceYears,
        idle_pct=34.0,
        cycle_time=24.8,
        weather=task.weatherCondition,
        bucket_fill_ratio=0.96
    )

    factors = [BreakdownFactor(**item) for item in prediction["breakdownFactors"]]

    predicted_eta = "11:28 AM"

    explainability = ExplainabilityDetails(
        whatHappened=f"Task {task.code} estimated completion delayed by {prediction['delayMinutes']} minutes (predicted ETA: {predicted_eta}).",
        whyItHappened=f"Primary drivers: Dense clay sub-base hardness ({task.soilHardnessIndex}/10) and wet ground conditions compounding with elevated idle periods.",
        whatHappensNext="If current swing cadence and idle wait times persist, the remaining volume will miss the haul truck rotation window.",
        recommendedAction="Engage CAT Eco-Idle during truck positioning and step-cut clay in 15cm slices.",
        potentialTimeRecoveryMinutes=prediction["potentialRecoveryMinutes"]
    )

    return ETAPrediction(
        taskId=task.id,
        taskTitle=task.title,
        originalETA=task.originalETA,
        predictedETA=predicted_eta,
        delayMinutes=prediction["delayMinutes"],
        confidenceScore=prediction["confidenceScore"],
        breakdownFactors=factors,
        explainability=explainability
    )
