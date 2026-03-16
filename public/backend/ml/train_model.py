"""
CardioRisk AI — Complete ML Training Pipeline

Trains and compares:
- Logistic Regression
- Random Forest
- XGBoost
- Support Vector Machine

Uses the Kaggle Cardiovascular Disease dataset.
Outputs: model.pkl, scaler.pkl, metrics.json
"""

import os
import json
import warnings
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

# ============================================================
# 1. Load Data
# ============================================================

def load_data(path="dataset/cardiovascular.csv"):
    """
    Load the cardiovascular disease dataset.
    Expected columns: id, age, gender, height, weight, ap_hi, ap_lo,
                      cholesterol, gluc, smoke, alco, active, cardio
    
    Download from: https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset
    The file uses semicolon delimiter.
    """
    if not os.path.exists(path):
        print(f"Dataset not found at {path}")
        print("Generating synthetic dataset for demonstration...")
        return generate_synthetic_data()
    
    df = pd.read_csv(path, delimiter=";")
    return df


def generate_synthetic_data(n_samples=70000):
    """Generate synthetic cardiovascular dataset for demo purposes."""
    np.random.seed(42)
    
    data = {
        "id": range(n_samples),
        "age": np.random.normal(53 * 365, 7 * 365, n_samples).astype(int),  # age in days
        "gender": np.random.choice([1, 2], n_samples),
        "height": np.random.normal(165, 10, n_samples).astype(int),
        "weight": np.random.normal(75, 15, n_samples).astype(float),
        "ap_hi": np.random.normal(125, 18, n_samples).astype(int),
        "ap_lo": np.random.normal(82, 10, n_samples).astype(int),
        "cholesterol": np.random.choice([1, 2, 3], n_samples, p=[0.52, 0.28, 0.20]),
        "gluc": np.random.choice([1, 2, 3], n_samples, p=[0.56, 0.24, 0.20]),
        "smoke": np.random.choice([0, 1], n_samples, p=[0.91, 0.09]),
        "alco": np.random.choice([0, 1], n_samples, p=[0.95, 0.05]),
        "active": np.random.choice([0, 1], n_samples, p=[0.20, 0.80]),
    }
    
    df = pd.DataFrame(data)
    
    # Generate target based on features
    risk_score = (
        0.3 * ((df["ap_hi"] - 110) / 80).clip(0, 1) +
        0.2 * ((df["cholesterol"] - 1) / 2) +
        0.15 * ((df["ap_lo"] - 70) / 40).clip(0, 1) +
        0.15 * ((df["age"] / 365 - 30) / 40).clip(0, 1) +
        0.08 * ((df["weight"] / ((df["height"] / 100) ** 2) - 20) / 20).clip(0, 1) +
        0.05 * df["smoke"] +
        0.04 * (1 - df["active"]) +
        0.03 * df["alco"] +
        np.random.normal(0, 0.15, n_samples)
    )
    df["cardio"] = (risk_score > 0.35).astype(int)
    
    return df


# ============================================================
# 2. Preprocess Data
# ============================================================

def preprocess(df):
    """Clean and preprocess the cardiovascular dataset."""
    # Convert age from days to years if values are large
    if df["age"].mean() > 200:
        df["age"] = (df["age"] / 365).astype(int)
    
    # Remove ID column
    if "id" in df.columns:
        df = df.drop("id", axis=1)
    
    # Handle outliers in blood pressure
    df = df[(df["ap_hi"] > 60) & (df["ap_hi"] < 250)]
    df = df[(df["ap_lo"] > 40) & (df["ap_lo"] < 180)]
    df = df[df["ap_hi"] > df["ap_lo"]]
    
    # Handle outliers in height/weight
    df = df[(df["height"] > 100) & (df["height"] < 220)]
    df = df[(df["weight"] > 30) & (df["weight"] < 200)]
    
    # Feature engineering: BMI
    df["bmi"] = df["weight"] / ((df["height"] / 100) ** 2)
    
    # Remove missing values
    df = df.dropna()
    
    print(f"Dataset shape after preprocessing: {df.shape}")
    print(f"Class distribution:\n{df['cardio'].value_counts()}")
    
    return df


# ============================================================
# 3. Train & Compare Models
# ============================================================

def train_and_evaluate(df):
    """Train multiple models and compare performance."""
    X = df.drop("cardio", axis=1)
    y = df["cardio"]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Define models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(
            n_estimators=200, max_depth=10, min_samples_split=5,
            random_state=42, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1,
            random_state=42, eval_metric="logloss", use_label_encoder=False
        ),
        "SVM (RBF Kernel)": SVC(kernel="rbf", probability=True, random_state=42),
    }
    
    results = []
    best_score = 0
    best_model = None
    best_name = ""
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train_scaled, y_train)
        
        y_pred = model.predict(X_test_scaled)
        y_proba = model.predict_proba(X_test_scaled)[:, 1]
        
        metrics = {
            "model_name": name,
            "accuracy": round(accuracy_score(y_test, y_pred), 4),
            "precision": round(precision_score(y_test, y_pred), 4),
            "recall": round(recall_score(y_test, y_pred), 4),
            "f1_score": round(f1_score(y_test, y_pred), 4),
            "roc_auc": round(roc_auc_score(y_test, y_proba), 4),
        }
        results.append(metrics)
        
        print(f"  Accuracy:  {metrics['accuracy']}")
        print(f"  Precision: {metrics['precision']}")
        print(f"  Recall:    {metrics['recall']}")
        print(f"  F1 Score:  {metrics['f1_score']}")
        print(f"  ROC-AUC:   {metrics['roc_auc']}")
        
        if metrics["roc_auc"] > best_score:
            best_score = metrics["roc_auc"]
            best_model = model
            best_name = name
    
    print(f"\n🏆 Best model: {best_name} (ROC-AUC: {best_score})")
    
    return best_model, scaler, results, best_name


# ============================================================
# 4. Save Artifacts
# ============================================================

def save_artifacts(model, scaler, metrics, output_dir="."):
    """Save trained model, scaler, and metrics."""
    os.makedirs(output_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(output_dir, "model.pkl"))
    joblib.dump(scaler, os.path.join(output_dir, "scaler.pkl"))
    
    with open(os.path.join(output_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    
    print(f"\n✅ Artifacts saved to {output_dir}/")
    print(f"   - model.pkl")
    print(f"   - scaler.pkl")
    print(f"   - metrics.json")


# ============================================================
# 5. Main
# ============================================================

if __name__ == "__main__":
    print("=" * 60)
    print("CardioRisk AI — Model Training Pipeline")
    print("=" * 60)
    
    # Load data
    df = load_data()
    
    # Preprocess
    df = preprocess(df)
    
    # Train and evaluate
    best_model, scaler, metrics, best_name = train_and_evaluate(df)
    
    # Save
    save_artifacts(best_model, scaler, metrics)
    
    print("\n" + "=" * 60)
    print("Training complete! Run the backend with:")
    print("  uvicorn app.main:app --reload --port 8000")
    print("=" * 60)
