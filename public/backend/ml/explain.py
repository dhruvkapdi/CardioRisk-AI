"""
SHAP-based model explainability for CardioRisk AI.
"""

import shap
import joblib
import numpy as np
import matplotlib.pyplot as plt


def explain_prediction(model_path="model.pkl", scaler_path="scaler.pkl"):
    """Generate SHAP explanations for model predictions."""
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    feature_names = [
        "age", "gender", "height", "weight", "ap_hi", "ap_lo",
        "cholesterol", "gluc", "smoke", "alco", "active", "bmi"
    ]
    
    # Example patient
    sample = np.array([[52, 1, 170, 78, 145, 95, 2, 2, 1, 0, 0, 26.99]])
    sample_scaled = scaler.transform(sample)
    
    # Create SHAP explainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(sample_scaled)
    
    # Display
    print("\nSHAP Feature Contributions:")
    print("-" * 40)
    
    if isinstance(shap_values, list):
        sv = shap_values[1][0]  # class 1 (high risk)
    else:
        sv = shap_values[0]
    
    contributions = list(zip(feature_names, sv))
    contributions.sort(key=lambda x: abs(x[1]), reverse=True)
    
    for name, value in contributions:
        direction = "↑ increases risk" if value > 0 else "↓ decreases risk"
        print(f"  {name:>15}: {value:+.4f} ({direction})")
    
    # Save SHAP summary plot
    shap.summary_plot(
        shap_values if not isinstance(shap_values, list) else shap_values[1],
        sample_scaled,
        feature_names=feature_names,
        show=False
    )
    plt.savefig("shap_summary.png", dpi=150, bbox_inches="tight")
    print("\n✅ SHAP summary plot saved to shap_summary.png")


if __name__ == "__main__":
    explain_prediction()
