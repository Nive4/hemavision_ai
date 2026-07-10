# ============================================================
# HemaVision AI – Hugging Face Spaces Dockerfile
# Single container serving React frontend + FastAPI backend
# ============================================================

# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Empty VITE_API_URL → frontend uses same-origin relative URLs
ENV VITE_API_URL=""
RUN npm run build

# Stage 2: Python backend + bundled frontend
FROM python:3.10-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (use CPU-only PyTorch to save space)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir \
    torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ /app/backend

# Copy built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Set environment for production
ENV PYTHONPATH=/app
ENV FRONTEND_URL=*
ENV DATABASE_URL=sqlite:///./hemavision.db
ENV PROJECT_NAME="HemaVision AI"
ENV HF_LLM_MODEL=Qwen/Qwen2.5-1.5B-Instruct

# HF Spaces uses port 7860
EXPOSE 7860

# Start FastAPI serving both API + frontend
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "7860"]
