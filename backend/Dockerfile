# Python 3.12 Slim base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy dependency specifications
COPY requirements.txt .

# Install dependencies into system Python via uv
RUN uv pip install --system -r requirements.txt

# Copy backend application source code
COPY . .

# Pre-train and serialize ML predictive models (ETA regressor & Anomaly isolation forest)
RUN python -m app.ml.training

# Expose backend port
EXPOSE 8000

# Start FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
