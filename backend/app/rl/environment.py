import gymnasium as gym
from gymnasium import spaces
import numpy as np

ACTION_NAMES = {
    0: "NO_ACTION",
    1: "VISUAL_WARNING",
    2: "AUDIO_WARNING",
    3: "STRONG_WARNING",
    4: "REDUCE_SPEED",
    5: "STOP_RECOMMENDATION",
    6: "SUPERVISOR_ALERT"
}

class CatSafetyEnv(gym.Env):
    """
    Gymnasium Environment for CAT Operator Safety Interventions.
    Simulates machine-worker proximity dynamics, upper-frame rotation into blind zones,
    and operator reaction latency under various soil/weather conditions.
    """
    metadata = {"render_modes": ["human"]}

    def __init__(self, critical_distance: float = 3.0, high_distance: float = 5.0):
        super().__init__()
        self.critical_dist = critical_distance
        self.high_dist = high_distance

        # Observation space: 8 continuous parameters
        # 0: worker_distance (0 - 30 m)
        # 1: worker_velocity (-3.0 to +3.0 m/s, negative is approaching)
        # 2: machine_speed (0 - 15 km/h)
        # 3: swing_speed (-20 to +20 deg/s)
        # 4: worker_relative_angle (0 - 360 deg)
        # 5: seatbelt_status (0: unfastened, 1: fastened)
        # 6: weather_factor (1.0: clear to 1.5: heavy storm)
        # 7: operator_experience_years (0.5 - 15 yrs)
        self.observation_space = spaces.Box(
            low=np.array([0.0, -3.0, 0.0, -20.0, 0.0, 0.0, 1.0, 0.5], dtype=np.float32),
            high=np.array([30.0, 3.0, 15.0, 20.0, 360.0, 1.0, 1.5, 15.0], dtype=np.float32),
            dtype=np.float32
        )

        # Action space: 7 discrete intervention actions
        # 0 = NO_ACTION
        # 1 = VISUAL_WARNING
        # 2 = AUDIO_WARNING
        # 3 = STRONG_WARNING
        # 4 = REDUCE_SPEED
        # 5 = STOP_RECOMMENDATION
        # 6 = SUPERVISOR_ALERT
        self.action_space = spaces.Discrete(7)

        self.state = None
        self.step_count = 0
        self.max_steps = 100

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.step_count = 0

        # Sample realistic initial state
        worker_dist = np.random.uniform(2.0, 25.0)
        worker_vel = np.random.uniform(-1.5, 1.0)
        machine_spd = np.random.uniform(0.0, 4.0)
        swing_spd = np.random.uniform(-12.0, 12.0)
        worker_angle = np.random.uniform(0.0, 360.0)
        seatbelt = 1.0 if np.random.rand() > 0.1 else 0.0
        weather = np.random.choice([1.0, 1.2, 1.4])
        exp = np.random.uniform(1.0, 8.0)

        self.state = np.array([
            worker_dist, worker_vel, machine_spd, swing_spd,
            worker_angle, seatbelt, weather, exp
        ], dtype=np.float32)

        return self.state, {}

    def get_allowed_actions(self, state: np.ndarray) -> list:
        """
        DETERMINISTIC HARD SAFETY ENVELOPE:
        If worker < critical_dist (3.0m) or (speed > 1.0 km/h and seatbelt == 0),
        RL policy is strictly restricted to high/critical safety actions.
        """
        worker_dist = state[0]
        speed = state[2]
        seatbelt = state[5]

        if worker_dist < self.critical_dist:
            # Mandatory critical intervention: RL cannot select NO_ACTION or VISUAL_WARNING
            return [5, 4, 3, 6] # STOP_RECOMMENDATION, REDUCE_SPEED, STRONG_WARNING, SUPERVISOR_ALERT
        elif worker_dist < self.high_dist:
            return [3, 2, 4, 5]
        elif speed > 1.0 and seatbelt < 0.5:
            return [2, 3, 4] # Audio warning or speed reduction mandatory
        else:
            return list(range(7)) # All actions permitted in safe envelope

    def step(self, action: int):
        self.step_count += 1
        dist, vel, speed, swing_spd, angle, seatbelt, weather, exp = self.state

        # Enforce Hard Safety Envelope: override if illegal action chosen
        allowed = self.get_allowed_actions(self.state)
        enforced_action = action
        if action not in allowed:
            enforced_action = allowed[0] # Deterministic override to highest priority allowed action

        # Simulate physics transition
        closing_speed = max(0.0, -vel) + (speed / 3.6)
        new_dist = max(0.5, dist + (vel * 1.0) - (speed / 3.6 * 0.5))
        new_vel = np.clip(vel + np.random.normal(0, 0.2), -2.5, 2.5)

        # Blind zone condition: rear 135-225 or right side 70-110
        is_blind_zone = (135 <= angle <= 225) or (70 <= angle <= 110)

        # Calculate reward
        reward = 0.0

        if new_dist < self.critical_dist:
            if enforced_action in [4, 5]: # REDUCE_SPEED or STOP_RECOMMENDATION
                reward += 100.0 # Successful critical hazard intervention
            else:
                reward -= 500.0 # Critical safety violation penalty
        elif new_dist < self.high_dist:
            if enforced_action in [2, 3, 4]:
                reward += 50.0
            elif enforced_action == 0:
                reward -= 100.0
        else: # Normal safe standoff > 10m
            if enforced_action == 0:
                reward += 10.0 # Safe productive task continuation
            elif enforced_action in [5, 6]:
                reward -= 30.0 # Unnecessary disruption false alarm penalty

        if speed > 1.0 and seatbelt < 0.5:
            if enforced_action in [2, 3, 4]:
                reward += 25.0
            else:
                reward -= 80.0

        self.state = np.array([
            new_dist, new_vel, speed, swing_spd,
            angle, seatbelt, weather, exp
        ], dtype=np.float32)

        terminated = bool(new_dist < 1.0 or self.step_count >= self.max_steps)
        truncated = False

        info = {
            "deterministic_override": bool(enforced_action != action),
            "enforced_action": enforced_action,
            "worker_distance": float(new_dist),
            "in_blind_zone": bool(is_blind_zone)
        }

        return self.state, reward, terminated, truncated, info
