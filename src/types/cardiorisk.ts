// Types for the CardioRisk AI application

export interface PatientInput {
  age: number;
  gender: number; // 1 = male, 2 = female
  height: number; // cm
  weight: number; // kg
  ap_hi: number; // systolic BP
  ap_lo: number; // diastolic BP
  cholesterol: number; // 1: normal, 2: above normal, 3: well above normal
  gluc: number; // 1: normal, 2: above normal, 3: well above normal
  smoke: number; // 0 or 1
  alco: number; // 0 or 1
  active: number; // 0 or 1
}

export interface PredictionResult {
  id: string;
  prediction: "High Risk" | "Low Risk";
  probability: number;
  confidence: number;
  top_factors: string[];
  input: PatientInput;
  timestamp: string;
  bmi: number;
}

export interface ModelMetrics {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}
