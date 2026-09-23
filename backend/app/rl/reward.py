def compute_safety_reward(
    distance: float,
    action: int,
    critical_distance: float = 3.0,
    high_distance: float = 5.0,
    seatbelt_violation: bool = False,
    response_time_seconds: float = 0.8
) -> float:
    """
    Simulation reward formulation prioritizing zero-harm safety while penalizing false alerts.
    """
    reward = 0.0

    if distance < critical_distance:
        if action == 5: # STOP_RECOMMENDATION
            reward += 100.0
            if response_time_seconds < 1.0:
                reward += 20.0 # Fast operator response bonus
        else:
            reward -= 500.0 # Safety incident penalty
    elif distance < high_distance:
        if action in [3, 4]: # STRONG_WARNING or REDUCE_SPEED
            reward += 60.0
        elif action == 0:
            reward -= 80.0
    elif distance > 10.0:
        if action == 0:
            reward += 10.0 # Safe task continuation
        elif action in [5, 6]:
            reward -= 25.0 # Unnecessary false alarm disruption

    if seatbelt_violation:
        if action in [2, 3]:
            reward += 30.0
        else:
            reward -= 70.0

    return reward
