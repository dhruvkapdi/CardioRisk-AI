"""
Prediction routes for the CardioRisk AI API.
"""

import json
import os
from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.patient import PatientInput, PredictionResponse, ModelMetric
from app.services.ml_service import MLService

router = APIRouter()
ml_service = MLService()

# In-memory prediction history (use PostgreSQL/Supabase in production)
prediction_history: list = []


@router.post("/predict", response_model=PredictionResponse)
async def predict(patient: PatientInput):
    """Make a cardiovascular disease risk prediction."""
    try:
        result = ml_service.predict(patient)
        prediction_history.insert(0, {
            "input": patient.dict(),
            "result": result,
            "timestamp": __import__("datetime").datetime.utcnow().isoformat()
        })
        # Keep only last 100 predictions
        if len(prediction_history) > 100:
            prediction_history.pop()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/model-metrics", response_model=List[ModelMetric])
async def get_model_metrics():
    """Get performance metrics for all trained models."""
    metrics_path = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "metrics.json")
    try:
        with open(metrics_path, "r") as f:
            metrics = json.load(f)
        return metrics
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model metrics not found. Train the model first.")


@router.get("/prediction-history")
async def get_prediction_history():
    """Get previous prediction results."""
    return prediction_history[:50]
