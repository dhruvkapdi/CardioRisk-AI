"""
ML Service — Loads trained model and makes predictions.
"""

import os
import joblib
import numpy as np
from app.schemas.patient import PatientInput, PredictionResponse


class MLService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self._load_model()

    def _load_model(self):
        model_dir = os.path.join(os.path.dirname(__file__), "..", "..", "ml")
        model_path = os.path.join(model_dir, "model.pkl")
        scaler_path = os.path.join(model_dir, "scaler.pkl")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            print("✅ Model and scaler loaded successfully")
        else:
            print("⚠️ Model files not found. Run ml/train_model.py first.")

    def predict(self, patient: PatientInput) -> PredictionResponse:
        if self.model is None or self.scaler is None:
            raise RuntimeError("Model not loaded. Run train_model.py first.")

        # Calculate BMI
        height_m = patient.height / 100
        bmi = round(patient.weight / (height_m ** 2), 1)

        # Prepare feature vector
        features = np.array([[
            patient.age,
            patient.gender,
            patient.height,
            patient.weight,
            patient.ap_hi,
            patient.ap_lo,
            patient.cholesterol,
            patient.gluc,
            patient.smoke,
            patient.alco,
            patient.active,
            bmi,  # engineered feature
        ]])

        # Scale features
        features_scaled = self.scaler.transform(features)

        # Predict
        prediction_class = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]

        prediction = "High Risk" if prediction_class == 1 else "Low Risk"
        probability = round(float(probabilities[1]) * 100, 1)
        confidence = round(float(max(probabilities)) * 100, 1)

        # Determine top contributing factors
        top_factors = self._get_top_factors(patient, bmi)

        return PredictionResponse(
            prediction=prediction,
            probability=probability,
            confidence=confidence,
            top_factors=top_factors,
            bmi=bmi,
        )

    def _get_top_factors(self, patient: PatientInput, bmi: float) -> list:
        factors = []
        if patient.ap_hi >= 140:
            factors.append("High systolic blood pressure")
        elif patient.ap_hi >= 130:
            factors.append("Elevated systolic blood pressure")
        if patient.ap_lo >= 90:
            factors.append("High diastolic blood pressure")
        if patient.cholesterol >= 3:
            factors.append("Very high cholesterol level")
        elif patient.cholesterol >= 2:
            factors.append("Above normal cholesterol")
        if patient.gluc >= 3:
            factors.append("Very high glucose level")
        elif patient.gluc >= 2:
            factors.append("Above normal glucose level")
        if patient.age >= 55:
            factors.append("Age above 55 increases risk")
        if bmi >= 30:
            factors.append("Obesity (BMI >= 30)")
        elif bmi >= 25:
            factors.append("Overweight (BMI >= 25)")
        if patient.smoke == 1:
            factors.append("Smoking increases cardiovascular risk")
        if patient.active == 0:
            factors.append("Low physical activity")
        if patient.alco == 1:
            factors.append("Alcohol intake")
        return factors[:5]
