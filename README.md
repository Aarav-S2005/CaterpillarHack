# CAT Operator Copilot — How to Run

Follow these direct steps to run the complete CAT Operator Copilot system.

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
