"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List


class PatientInput(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Patient age in years")
    gender: int = Field(..., ge=1, le=2, description="1=Male, 2=Female")
    height: float = Field(..., ge=50, le=250, description="Height in cm")
    weight: float = Field(..., ge=20, le=300, description="Weight in kg")
    ap_hi: int = Field(..., ge=60, le=250, description="Systolic blood pressure")
    ap_lo: int = Field(..., ge=40, le=180, description="Diastolic blood pressure")
    cholesterol: int = Field(..., ge=1, le=3, description="1=normal, 2=above, 3=well above")
    gluc: int = Field(..., ge=1, le=3, description="1=normal, 2=above, 3=well above")
    smoke: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    alco: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    active: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 52, "gender": 1, "height": 170, "weight": 78,
                "ap_hi": 145, "ap_lo": 95, "cholesterol": 2, "gluc": 2,
                "smoke": 1, "alco": 0, "active": 0
            }
        }


class PredictionResponse(BaseModel):
    prediction: str
    probability: float
    confidence: float
    top_factors: List[str]
    bmi: float


class ModelMetric(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
