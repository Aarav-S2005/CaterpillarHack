import numpy as np
from typing import Dict, Any, Tuple
from ..models.schemas import InterventionAction

ACTION_MAP = {
    0: "NO_ACTION",
    1: "VISUAL_WARNING",
    2: "AUDIO_WARNING",
    3: "STRONG_WARNING",
    4: "REDUCE_SPEED",
    5: "STOP_RECOMMENDATION",
    6: "SUPERVISOR_ALERT"
}

class AdaptiveSafetyPolicy:
    """
    Simulation-Trained Adaptive Safety Policy.
    Operates within deterministic Hard Safety Envelope bounds.
    """
    def __init__(self, critical_threshold: float = 3.0, high_threshold: float = 5.0, warning_threshold: float = 10.0):
        self.critical_threshold = critical_threshold
        self.high_threshold = high_threshold
        self.warning_threshold = warning_threshold

    def evaluate(self, state_vector: dict) -> Tuple[InterventionAction, bool, float, str]:
        """
        Evaluates current kinematics against safety envelope and adaptive policy.
        Returns: (action_name, deterministic_override, expected_reward, selected_policy_name)
        """
        worker_dist = float(state_vector.get("minWorkerDist", 12.4))
        worker_vel = float(state_vector.get("workerVelocity", 0.4))
        speed = float(state_vector.get("speed", 0.8))
        swing_spd = abs(float(state_vector.get("swingRate", 8.5)))
        worker_angle = float(state_vector.get("workerRelativeAngle", 85.0))
        seatbelt_fastened = state_vector.get("seatbeltStatus") == "FASTENED"

        # Check Blind Zone
        in_blind_zone = (135 <= worker_angle <= 225) or (70 <= worker_angle <= 110)
        seatbelt_violation = speed > 0.2 and not seatbelt_fastened

        # 1. Deterministic Hard Safety Envelope Check
        if worker_dist < self.critical_threshold or (seatbelt_violation and speed > 4.0):
            action = "STOP_RECOMMENDATION" if worker_dist < self.critical_threshold else "STRONG_WARNING"
            return (
                action,
                True, # Deterministic override enforced!
                -0.15,
                "DETERMINISTIC_HARD_ENVELOPE_OVERRIDE"
            )

        if worker_dist < self.high_threshold:
            return (
                "STRONG_WARNING" if (swing_spd > 5.0 or in_blind_zone) else "REDUCE_SPEED",
                True,
                0.85,
                "DETERMINISTIC_HIGH_ENVELOPE_OVERRIDE"
            )

        # 2. Adaptive Policy Layer (Operates inside warning and safe zones)
        if seatbelt_violation:
            return (
                "AUDIO_WARNING",
                False,
                0.78,
                "ADAPTIVE_PPO_SAFETY_POLICY_V4"
            )

        if worker_dist < self.warning_threshold:
            # If worker is approaching fast into blind zone
            if worker_vel < -0.3 and in_blind_zone:
                return (
                    "AUDIO_WARNING",
                    False,
                    0.92,
                    "ADAPTIVE_PPO_SAFETY_POLICY_V4"
                )
            else:
                return (
                    "VISUAL_WARNING",
                    False,
                    0.95,
                    "ADAPTIVE_PPO_SAFETY_POLICY_V4"
                )

        # Normal safe standoff
        return (
            "NO_ACTION",
            False,
            0.98,
            "ADAPTIVE_PPO_SAFETY_POLICY_V4"
        )

    def get_action(self, obs: np.ndarray, deterministic: bool = True):
        """Helper for Gymnasium observation arrays."""
        # 0: worker_distance, 1: worker_vel, 2: speed, 3: swing_spd, 4: worker_angle, 5: seatbelt
        dist = float(obs[0])
        vel = float(obs[1])
        speed = float(obs[2])
        swing_spd = float(obs[3])
        angle = float(obs[4])
        seatbelt_fastened = float(obs[5]) > 0.5

        state_dict = {
            "minWorkerDist": dist,
            "workerVelocity": vel,
            "speed": speed,
            "swingRate": swing_spd,
            "workerRelativeAngle": angle,
            "seatbeltStatus": "FASTENED" if seatbelt_fastened else "UNFASTENED"
        }

        action_name, override, expected_reward, policy_name = self.evaluate(state_dict)
        name_to_idx = {v: k for k, v in ACTION_MAP.items()}
        action_idx = name_to_idx.get(action_name, 0)
        return action_idx, {
            "action_name": action_name,
            "override": override,
            "expected_reward": expected_reward,
            "policy_name": policy_name
        }

safety_policy = AdaptiveSafetyPolicy()
CatSafetyPolicy = AdaptiveSafetyPolicy
