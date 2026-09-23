# Simulation Engine for CAT Operator Copilot

This directory provides standalone simulation scripts for streaming CAN-bus machine telemetry, running multi-scenario counterfactual stress-tests, and evaluating the Gymnasium Reinforcement Learning safety policy.

---

## 1. Prerequisites

Activate the backend virtual environment configured with `uv`:

### Windows (PowerShell):
```powershell
..\backend\.venv\Scripts\activate
```

---

## 2. Running the Simulators

### A. Live CAN-Bus Telemetry Streamer
Streams continuous high-fidelity telemetry packets into the FastAPI backend (`/api/telemetry`).
```powershell
# Standard operating cycle (2.0 Hz)
python run_telemetry_stream.py

# Inject rollover slope hazard
python run_telemetry_stream.py --scenario rollover

# Inject worker proximity incursion (< 2.0m)
python run_telemetry_stream.py --scenario worker

# Inject hydraulic pressure spike (> 350 bar)
python run_telemetry_stream.py --scenario hydraulic

# Inject operator fatigue condition (PERCLOS > 0.35)
python run_telemetry_stream.py --scenario fatigue
```

---

### B. Batch Counterfactual Scenario Stress-Testing
Runs parameter sweeps against the ML ETA Regressor, Anomaly Detector, and Risk Engine.
```powershell
python run_batch_scenarios.py
```

---

### C. Gymnasium RL Safety Policy Simulator
Evaluates the adaptive safety policy and Hard Safety Envelope intervention mechanics across continuous episodes in `CatSafetyEnv`.
```powershell
python simulate_rl_safety.py --episodes 20 --steps 50
```
