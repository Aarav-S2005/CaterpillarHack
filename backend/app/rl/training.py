import numpy as np

try:
    from .environment import CatSafetyEnv
    from .reward import compute_safety_reward
except ImportError:
    from environment import CatSafetyEnv
    from reward import compute_safety_reward

def run_rl_training_simulation(episodes: int = 50):
    print(f"Initializing Gymnasium CatSafetyEnv Simulation ({episodes} episodes)...")
    env = CatSafetyEnv(critical_distance=3.0, high_distance=5.0)

    total_rewards = []
    overrides_triggered = 0

    for ep in range(episodes):
        obs, _ = env.reset()
        ep_reward = 0
        done = False

        while not done:
            # Policy action selection: heuristic Q-approximation with safety priority
            dist = obs[0]
            if dist < 3.0:
                action = 5 # STOP_RECOMMENDATION
            elif dist < 5.0:
                action = 3 # STRONG_WARNING
            elif dist < 10.0:
                action = 1 # VISUAL_WARNING
            else:
                action = 0 # NO_ACTION

            obs, reward, terminated, truncated, info = env.step(action)
            ep_reward += reward
            if info.get("deterministic_override"):
                overrides_triggered += 1

            done = terminated or truncated

        total_rewards.append(ep_reward)

    avg_reward = np.mean(total_rewards)
    print(f"[OK] Simulation Training Complete. Episodes: {episodes}, Avg Reward: {avg_reward:.2f}, Safety Overrides: {overrides_triggered}")
    return {
        "episodes": episodes,
        "avg_reward": float(avg_reward),
        "overrides_triggered": overrides_triggered
    }

if __name__ == "__main__":
    run_rl_training_simulation(20)
