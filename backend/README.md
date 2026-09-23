# CAT Operator Copilot — Python FastAPI Intelligence Backend

This directory contains the Python FastAPI backend hosting real Machine Learning, Reinforcement Learning, and AI Copilot services for the CAT Operator Copilot application.

---

## Architecture Overview

```text
 ┌──────────────────────────────────────────────────────────────┐
 │                      FASTAPI API GATEWAY                    │
 │  /api/telemetry, /api/safety, /api/predictions, /api/copilot │
 └───────────────┬───────────────────────────────┬──────────────┘
                 │                               │
 ┌───────────────▼───────────────┐ ┌─────────────▼──────────────┐
 │      ML PREDICTIVE ENGINES    │ │    SAFETY & RL ENGINES     │
 │ • IsolationForest (Anomalies) │ │ • CatSafetyEnv (Gymnasium) │
 │ • RandomForestRegressor (ETA) │ │ • Hard Safety Envelope     │
 │ • What-If Counterfactual Sim  │ │ • Adaptive RL Policy       │
 └───────────────┬───────────────┘ └─────────────┬──────────────┘
                 │                               │
 ┌───────────────▼───────────────────────────────▼──────────────┐
 │                   DOMAIN SERVICES & DATA                     │
 │  Digital Twin • Operator Skill Graph • Task Assignments      │
 │  Ollama llama3.1:8b Fused Domain Context Orchestration       │
 └──────────────────────────────────────────────────────────────┘
```

---

## 1. Quick Start

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Train / Generate ML Models
```bash
python -m backend.app.ml.training
```
This trains:
- `anomaly_model.joblib`: Scikit-Learn `IsolationForest` detecting kinematic and operational anomalies.
- `eta_model.joblib`: Scikit-Learn `RandomForestRegressor` predicting task completion with factor attribution.

### Run RL Simulation Training
```bash
python -m backend.app.rl.training
```

### Start FastAPI Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

---

## 2. Ollama LLM Integration

The AI Copilot connects to local Ollama running `llama3.1:8b`.

1. Install Ollama from [ollama.com](https://ollama.com).
2. Start Ollama and pull the model:
   ```bash
   ollama run llama3.1:8b
   ```
3. When running, the FastAPI Copilot service gathers live telemetry, active task progress, delay factor decomposition, safety envelope status, and operator digital twin scores, passing them into the model's system context.

---

## 3. Engineering & Prototype Notice

> [!NOTE]
> All heavy civil machinery parameters (RPM, hydraulic pressure, cycle duration, worker proximity radar vectors, and soil hardness indices) are simulation models designed for human-machine interface prototyping and algorithmic evaluation. They do not constitute certified hardware interlocks.
