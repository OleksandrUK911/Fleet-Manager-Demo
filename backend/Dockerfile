# backend/Dockerfile — Fleet Manager FastAPI backend
# Runs: uvicorn app.main:app on port 7767

FROM python:3.13-slim

# Prevent Python writing .pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose the API port
EXPOSE 7767

# Start the API server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7767"]
