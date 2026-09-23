from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import (
    telemetry,
    safety,
    tasks,
    incidents,
    behavior,
    predictions,
    simulator,
    operator,
    training,
    copilot,
    site,
)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend ML/RL & Adaptive Intelligence Service for Caterpillar Construction Machinery",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API Routers
app.include_router(telemetry.router)
app.include_router(safety.router)
app.include_router(tasks.router)
app.include_router(incidents.router)
app.include_router(behavior.router)
app.include_router(predictions.router)
app.include_router(simulator.router)
app.include_router(operator.router)
app.include_router(training.router)
app.include_router(copilot.router)
app.include_router(site.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CAT Operator Copilot FastAPI",
        "version": "2.0.0",
        "ml_models": ["IsolationForest", "RandomForestRegressor"],
        "rl_policy": "CatSafetyEnv Adaptive Policy with Hard Envelope Bounds"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
