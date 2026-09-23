from ..data.mock_data import db
from ..ml.eta_model import eta_predictor
from ..models.schemas import WhatIfScenarioInput, WhatIfScenarioResult, ComparisonItem

def run_what_if_simulation(input_params: WhatIfScenarioInput) -> WhatIfScenarioResult:
    task = db.tasks[0]
    operator = db.operator
    volume_remaining = max(10.0, task.targetVolume - task.completedVolume)

    # 1. Baseline Model Run (current state)
    base_pred = eta_predictor.predict_remaining_minutes(
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

    # 2. Counterfactual Model Run with Modified Features
    sim_idle = max(10.0, 34.0 - input_params.idleTimeReductionPercent)
    sim_cycle = max(14.0, 24.8 - input_params.cycleTimeReductionSeconds)
    sim_exp = operator.experienceYears + (input_params.operatorSkillBoostPercent / 10.0)

    sim_pred = eta_predictor.predict_remaining_minutes(
        volume_remaining=volume_remaining,
        depth=task.targetDepth,
        soil_type=task.material,
        soil_hardness=task.soilHardnessIndex,
        operator_exp=sim_exp,
        idle_pct=sim_idle,
        cycle_time=sim_cycle,
        weather=input_params.weatherCondition,
        bucket_fill_ratio=0.96 + (input_params.operatorSkillBoostPercent * 0.005)
    )

    time_delta = int(round(sim_pred["predictedMinutesRemaining"] - base_pred["predictedMinutesRemaining"]))

    # Additional savings from RPM power optimization
    if input_params.rpmOptimizationPercent > 0:
        time_delta -= int(round(input_params.rpmOptimizationPercent * 0.15))

    # Calculate Simulated Clock ETA
    base_hour, base_min = 11, 28
    total_sim_mins = (base_hour * 60 + base_min) + time_delta
    sim_hour = total_sim_mins // 60
    sim_minute = total_sim_mins % 60
    simulated_eta_str = f"{sim_hour}:{sim_minute:02d} AM"

    # Fuel & Cost Calculation
    fuel_delta = 0.0
    fuel_delta -= (input_params.idleTimeReductionPercent / 10.0) * 1.8
    fuel_delta -= (input_params.rpmOptimizationPercent / 10.0) * 1.2
    if input_params.weatherCondition == "Heavy Rain":
        fuel_delta += 2.8
    elif input_params.weatherCondition == "Clear":
        fuel_delta -= 1.1

    fuel_delta = round(fuel_delta, 1)

    machine_hours_saved = -time_delta / 60.0
    fuel_cost_saved = -fuel_delta * 1.45
    operating_cost_saved = max(0.0, machine_hours_saved * 65.0)
    est_savings = int(round(max(-50.0, fuel_cost_saved + operating_cost_saved)))

    comparison_items = [
        ComparisonItem(
            metric="Estimated Task Completion (ETA)",
            current="11:28 AM",
            simulated=simulated_eta_str,
            delta=f"{abs(time_delta)} min faster" if time_delta < 0 else f"{time_delta} min slower",
            isImprovement=time_delta <= 0
        ),
        ComparisonItem(
            metric="Idle Time Ratio",
            current="34%",
            simulated=f"{int(sim_idle)}%",
            delta=f"-{input_params.idleTimeReductionPercent}%",
            isImprovement=input_params.idleTimeReductionPercent > 0
        ),
        ComparisonItem(
            metric="Average Excavation Cycle",
            current="24.8 sec",
            simulated=f"{sim_cycle:.1f} sec",
            delta=f"-{input_params.cycleTimeReductionSeconds:.1f}s",
            isImprovement=input_params.cycleTimeReductionSeconds > 0
        ),
        ComparisonItem(
            metric="Projected Fuel Burn",
            current="19.4 L/hr",
            simulated=f"{max(12.0, 19.4 + fuel_delta):.1f} L/hr",
            delta=f"{fuel_delta} L/hr" if fuel_delta <= 0 else f"+{fuel_delta} L/hr",
            isImprovement=fuel_delta <= 0
        ),
        ComparisonItem(
            metric="Predicted Operational Cost Delta",
            current="Baseline ($180/hr)",
            simulated=f"-${est_savings} Net Savings" if est_savings > 0 else f"+${abs(est_savings)} Expense",
            delta=f"-${est_savings}" if est_savings > 0 else f"+${abs(est_savings)}",
            isImprovement=est_savings >= 0
        )
    ]

    return WhatIfScenarioResult(
        baselineETA="11:28 AM",
        simulatedETA=simulated_eta_str,
        timeDeltaMinutes=time_delta,
        fuelDeltaLiters=fuel_delta,
        estimatedCostSavingUSD=est_savings,
        safetyIndexDelta=2 if time_delta <= 0 else -1,
        comparisonItems=comparison_items
    )
