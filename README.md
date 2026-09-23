# CAT Operator Copilot — How to Run & Technical Architecture

Follow these direct steps to run the complete CAT Operator Copilot system, followed by the comprehensive breakdown of our **6 Core Technical Novelties**.

## Quick Startup with Docker Compose (Recommended)

To spin up the entire system (FastAPI backend + Next.js frontend + pre-trained ML models) in one command:

```bash
docker compose up --build
```

- **Web Application**: [http://localhost:3005](http://localhost:3005)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 1. Prerequisites (For Local Development)

- [uv](https://docs.astral.sh/uv/) (Fast Python package manager)
- [Node.js](https://nodejs.org/) (v18+) & [pnpm](https://pnpm.io/) (or `npm`)
- *(Optional)* [Ollama](https://ollama.com) for local AI Copilot (`llama3.1:8b`)
- *(Optional)* [Docker Desktop](https://www.docker.com/) for containerized deployment

---

## 2. Start the Backend (FastAPI with `uv`)

Open a terminal and navigate to the `backend/` directory:

```bash
cd backend

# 1. Create Python virtual environment with uv
uv venv

# 2. Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# 3. Install backend dependencies using uv
uv pip install -r requirements.txt

# 4. Train & serialize ML models (Random Forest ETA & Isolation Forest Anomaly Detector)
python -m app.ml.training

# 5. Start the FastAPI server on port 8000
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive OpenAPI Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 3. Start the Frontend (Next.js)

Open a second terminal in the project root:

```bash
# 1. Install frontend dependencies
pnpm install

# 2. Start Next.js development server on port 3005
pnpm dev -H 127.0.0.1 -p 3005
```

- **Web Application**: [http://127.0.0.1:3005](http://127.0.0.1:3005)

---

## 4. (Optional) Run the Simulation Engine

With the backend running, open a third terminal to run standalone simulation scripts:

```bash
cd simulation-engine

# Activate the backend virtual environment
# Windows (PowerShell):
..\backend\.venv\Scripts\activate
# Linux/macOS:
source ../backend/.venv/bin/activate

# A. Stream live CAN-bus telemetry updates into the backend:
python run_telemetry_stream.py

# Or inject specific hazard scenarios:
python run_telemetry_stream.py --scenario rollover
python run_telemetry_stream.py --scenario worker
python run_telemetry_stream.py --scenario hydraulic
python run_telemetry_stream.py --scenario fatigue

# B. Run multi-scenario batch stress-test sweeps:
python run_batch_scenarios.py

# C. Run Gymnasium Reinforcement Learning safety policy simulation:
python simulate_rl_safety.py --episodes 15 --steps 40
```

---

## 5. (Optional) Run Local AI Copilot (Ollama)

```bash
ollama run llama3.1:8b
```
*(If Ollama is not running, the copilot uses rule-grounded reasoning from the live ML models & telemetry).*

---

## 6. Core Technical Novelties & Implementation Architecture

This section provides a detailed breakdown of the **6 Core Technical Novelties** engineered into the **Caterpillar Operator Copilot Platform**, explaining the industrial problem, the theoretical novelty, and exact end-to-end implementation across the Next.js frontend and Python FastAPI ML/RL backend.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               NEXT.JS 16 DASHBOARD UI (Port 3005)                      │
│   /dashboard   /safety   /behavior   /predictions   /simulator   /operator   /site     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST API (Pydantic Schemas)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             FASTAPI PYTHON ML/RL GATEWAY (Port 8000)                   │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│   Novelty 1: RL   │  Novelty 2: Iso-  │  Novelty 3: ML    │  Novelty 4: Counterfactual │
│   Safety Envelope │  Forest Anomaly   │  ETA Predictor    │  "What-If" Simulator       │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────┤
│  Novelty 5: Oper- │  Novelty 6: Mine- │  Ollama AI Domain │  Gymnasium Simulation      │
│  ator Twin & Graph│  Star™ Kinematics │  Copilot (8B LLM) │  Engine (Batch Scenarios)  │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
```

---

### Novelty 1: Deterministic Hard-Safety Envelope Reinforcement Learning (RL Policy Guardrails)

#### Problem Statement
Standard heuristic safety alerts in heavy machinery either trigger too late or flood operators with nuisance warnings. Pure deep reinforcement learning models are dangerous because neural network policies are "black boxes" that can exhibit unpredictable exploration edge cases.

#### The Novelty
A **Hierarchical Safe Reinforcement Learning Framework** combining a **Gymnasium `CatSafetyEnv`** with deterministic **Hard Safety Envelope bounds**. The agent learns efficiency policies while an immutable physical supervisor intercepts unsafe actions (overpressure, roll threshold, trench edge standoff) with 100% mathematical guarantees.

#### Implementation Details
- **Environment & Spaces**: Defined in `backend/app/rl/environment.py`. 
  - **State Space**: 7-dimensional continuous vector (Grade Pitch/Roll, Boom Angle, Hydraulic Pressure, Trench Standoff Distance, Engine RPM, Payload Weight, Swing Velocity).
  - **Action Space**: Continuous control $[-1.0, 1.0]$ over Boom Lift, Arm Crowd, Swing Torque, and Engine Throttle.
- **Deterministic Override Layer**: Implemented in `backend/app/rl/policy.py`.
  - Machine stability limits: Roll $> 18^\circ$, Pitch $> 22^\circ$, Hydraulic Pressure $> 345\text{ bar}$, Trench Standoff $< 2.5\text{ m}$.
  - If the RL action breaches safety boundaries, the deterministic supervisor clamps the command to safe limits and logs an intervention event with override reason.
- **Frontend Visualization**: Rendered on [`/safety`](http://localhost:3005/safety) with real-time Safety Envelope status gauge, roll/pitch level indicators, and live RL action override logs.

---

### Novelty 2: Real-Time Isolation Forest Telematics Anomaly Scoring with Closed-Loop Auto-Remediation

#### Problem Statement
Static sensor thresholds fail to detect subtle, multi-variate mechanical degradation (e.g. normal RPM combined with abnormal hydraulic harmonics and oil pressure drift during idle).

#### The Novelty
An **Unsupervised Scikit-Learn `IsolationForest` Model** running over 12-dimensional telematics, outputting continuous calibrated anomaly scores ($0 - 100$), SHAP-inspired root cause attribution, and a **4-Step Closed-Loop Auto-Remediation Pipeline** (Detect $\to$ Diagnose $\to$ Auto-Command $\to$ Verify).

#### Implementation Details
- **Model Pipeline**: Implemented in `backend/app/ml/anomaly_model.py` and `backend/app/services/anomaly_service.py`.
  - **Feature Extraction**: Engineered in `backend/app/ml/feature_engineering.py` (rolling RPM variance, hydraulic pressure delta, vibration spectrum, fuel efficiency index, thermal gradient).
  - **Decision Boundary**: Calibrated so active operations evaluate as clean inliers ($10-25/100$) while erratic idle surges or pressure overshoots produce high anomaly scores ($> 60/100$).
- **Root Cause Attribution**: Decomposes the anomaly into percentage contributions (e.g. 54% Hydraulic Pressure Spike, 31% Engine RPM Jitter, 15% Oil Temperature Gradient).
- **Closed-Loop Auto-Remediation**: Implemented in `src/app/behavior/page.tsx` and `backend/app/api/behavior.py`. When an anomaly is detected, the system autonomously applies ECU corrections (throttles RPM, resets hydraulic bypass, normalizes pressure) and displays live step verification.

---

### Novelty 3: Explainable ML-Driven Dynamic ETA Prediction Engine with Tree Feature Attribution

#### Problem Statement
Standard project management tools estimate task completion using fixed linear speed estimates that fail to account for weather changes, rock hardness, idle delays, and operator skill level.

#### The Novelty
A **Trained Scikit-Learn `RandomForestRegressor` ($R^2 = 0.979$)** that takes multi-factor geological and operational inputs to produce accurate completion ETAs with **transparent factor decomposition**.

#### Implementation Details
- **Training & Model**: Implemented in `backend/app/ml/eta_model.py` and `backend/app/ml/training.py`.
  - Trained on 500+ realistic heavy civil cycles (Excavation, Trenching, Grading, Demolition).
  - Inputs: Target Volume ($m^3$), Rock Hardness Index (1–10), Rainfall Index, Operator Skill Score (0–100), Idle Percentage (%), and Fill Factor.
- **Explainability Deconstruction**: Implemented in `backend/app/services/eta_service.py`.
  - Breaks down the final ETA into human-readable delay/acceleration factors:
    - *Hard Granite / Hardness 8.5*: $+9\text{ min delay}$
    - *Moderate Rain / Muddy Surface*: $+6\text{ min delay}$
    - *Excessive Idle Time (28%)*: $+4\text{ min delay}$
    - *High Operator Skill (88/100)*: $-5\text{ min acceleration}$
- **Frontend UI**: Displayed on [`/predictions`](http://localhost:3005/predictions) and [`/tasks`](http://localhost:3005/tasks) with delay impact waterfall charts and live completion progress.

---

### Novelty 4: Counterfactual "What-If" Digital Twin Simulator for Fleet & Cost Optimization

#### Problem Statement
Jobsite supervisors cannot test the impact of operational adjustments (e.g. "What if we reduce idle by 15%?" or "What if operator skill improves by 10%?") without risking real equipment downtime or fuel waste.

#### The Novelty
A **Real-Time Counterfactual Inference Simulator** that executes user-defined counterfactual parameters directly through the trained non-linear Random Forest Model to calculate precise Time Savings (minutes), Fuel Reductions (liters), and Operational Cost Savings ($USD).

#### Implementation Details
- **Inference Engine**: Implemented in `backend/app/services/what_if_service.py` and `backend/app/api/simulator.py`.
  - Takes counterfactual slider inputs: Idle Reduction %, Cycle Time Reduction (s), Weather Override, Operator Skill Boost %, RPM Optimization %.
  - Synthesizes the modified feature vector, runs `eta_model.predict()`, and computes the delta against current baseline:
    $$\Delta \text{Time} = \text{Simulated ETA} - \text{Baseline ETA}$$
    $$\Delta \text{Fuel} = \Delta \text{Time} \times \text{Fuel Burn Rate} \times \text{RPM Factor}$$
    $$\text{Cost Savings (\$) } = (\Delta \text{Fuel} \times \text{Diesel Price/L}) + (\Delta \text{Hours} \times \text{Labor/Machine Overhead Rate})$$
- **Frontend UI**: Displayed on [`/simulator`](http://localhost:3005/simulator) with interactive sliders, before vs. after comparison tables, and instant cost/fuel ROI cards.

---

### Novelty 5: Operator Digital Twin & Adaptive Closed-Loop Skill Evolution

#### Problem Statement
Heavy equipment operators rarely receive targeted, quantitative feedback on specific technical weaknesses (e.g. hydraulic jerky movements, unnecessary idle revving, or unsafe swing velocities).

#### The Novelty
A **Dynamic 5-Axis Operator Skill Graph** that tracks real-time telematics against fleet benchmark averages and dynamically triggers **Personalized Micro-Training Drills** whenever a specific performance degradation is detected.

#### Implementation Details
- **Skill Modeling**: Implemented in `backend/app/services/digital_twin_service.py` and `backend/app/services/training_service.py`.
  - 5 Core Skill Pillars:
    1. *Hydraulic Smoothness* (Pressure variance & abrupt valve closures)
    2. *Eco-Driving & Fuel Economy* (RPM optimization & idle discipline)
    3. *Trench & Grade Precision* (Bucket positioning accuracy & over-dig prevention)
    4. *Safety & Exclusion Compliance* (Buffer standoff & hard safety interventions)
    5. *Cycle Time & Loading Efficiency* (Payload per pass & swing speed)
- **Closed-Loop Learning Loop**:
  - Telematics monitoring continuously computes the skill score ($0 - 100$).
  - If a safety incident or excessive idle occurs, the system logs an evolution milestone and auto-assigns targeted interactive simulator modules (e.g. *Hydraulic Feathering Mastery*, *Eco-Idle Management*).
- **Frontend UI**: Displayed on [`/operator`](http://localhost:3005/operator) and [`/training`](http://localhost:3005/training) with radar skill graphs, certifications, and interactive training modules.

---

### Novelty 6: MineStar™ Spatial Radar & Kinematic Trajectory Conflict Verification

#### Problem Statement
Standard proximity warning systems trigger false alarms whenever vehicles travel near each other (even if moving parallel on safe lanes) and fail to detect long-range high-speed head-on converging collisions before it is too late.

#### The Novelty
A **2D Sector Kinematic Radar Engine** computing **Closest Point of Approach ($t_{\text{CPA}}$)**, relative velocity vectors ($\vec{v}_{\text{rel}}$), and heading angles ($\Delta\theta$) to mathematically evaluate whether a collision warning should or should not be issued.

#### Implementation Details
- **Kinematic Formulas**: Implemented in `src/app/site/page.tsx` and `backend/app/services/site_service.py`.
  - Relative velocity: $\vec{v}_{\text{rel}} = \vec{v}_1 - \vec{v}_2$
  - Time to Closest Approach: $t_{\text{CPA}} = -\frac{\vec{r} \cdot \vec{v}_{\text{rel}}}{|\vec{v}_{\text{rel}}|^2}$
  - Minimum predicted distance: $d_{\text{min}} = |\vec{r} + \vec{v}_{\text{rel}} \cdot t_{\text{CPA}}|$
- **4 Deterministic Evaluation Test Cases**:
  1. **Case 1: Parallel Lane Transit (Same Direction)**: $\Delta\theta = 0^\circ \implies$ **`NO WARNING (SAFE)`** (no intersecting paths).
  2. **Case 2: Head-On Converging Trajectory**: $\Delta\theta = 180^\circ, v_{\text{rel}} = 21\text{ km/h} \implies$ **`CRITICAL WARNING`** ($TTC = 7\text{s}$, retarder brake required).
  3. **Case 3: 90° Cross-Junction Crossing**: $\Delta\theta = 90^\circ \implies$ **`HIGH WARNING`** ($TTC = 5\text{s}$, Right-of-Way arbitration: loader yields).
  4. **Case 4: High-Speed Lateral Transit**: Truck speed $24\text{ km/h}$, lateral offset $35\text{m} \implies$ **`NO WARNING (SAFE STANDOFF)`** (prevents false alarms).
- **Frontend UI**: Displayed on [`/site`](http://localhost:3005/site) with 2D vector radar, directional velocity arrows, projected path rays, target impact crosshairs, and kinematic telemetry inspector.

---

### Summary Matrix of the 6 Novelties

| # | Novelty Area | Key Technical Innovation | Backend Service / Model | Frontend Route |
|---|---|---|---|---|
| **1** | **Deterministic RL Safety Envelope** | Gymnasium `CatSafetyEnv` + Hard physical override bounds (zero envelope breaches) | `backend/app/rl/` (`policy.py`, `environment.py`) | [`/safety`](http://localhost:3005/safety) |
| **2** | **Real-Time Isolation Forest Anomaly** | Unsupervised 12-feature anomaly scoring ($0-100$) + 4-step closed-loop auto-remediation | `backend/app/ml/anomaly_model.py`, `backend/app/services/anomaly_service.py` | [`/behavior`](http://localhost:3005/behavior) |
| **3** | **Explainable ML ETA Engine** | Random Forest Regressor ($R^2 = 0.979$) with transparent factor explainability breakdown | `backend/app/ml/eta_model.py`, `backend/app/services/eta_service.py` | [`/predictions`](http://localhost:3005/predictions) |
| **4** | **Counterfactual Digital Twin Simulator** | Real-time parameter synthesizer computing instant ETA, Fuel (L), and Cost ($) ROI deltas | `backend/app/services/what_if_service.py` | [`/simulator`](http://localhost:3005/simulator) |
| **5** | **Operator Twin & Skill Evolution** | 5-axis dynamic skill graph tracking benchmark drift with targeted training remediation | `backend/app/services/digital_twin_service.py`, `training_service.py` | [`/operator`](http://localhost:3005/operator) |
| **6** | **Spatial Kinematics Conflict Radar** | Vector Closest Point of Approach ($t_{\text{CPA}}$) and directional collision verification (4 cases) | `src/app/site/page.tsx`, `backend/app/services/site_service.py` | [`/site`](http://localhost:3005/site) |
