import { PatientInput, PredictionResult, ModelMetrics, FeatureImportance } from "@/types/cardiorisk";

// Simulated ML prediction engine
// In production, this would call the FastAPI backend
// The logic here mirrors what the trained model would produce

const FEATURE_WEIGHTS: Record<string, number> = {
  ap_hi: 0.22,
  ap_lo: 0.15,
  cholesterol: 0.18,
  age: 0.14,
  weight: 0.10,
  gluc: 0.08,
  smoke: 0.05,
  active: -0.04,
  alco: 0.03,
  gender: 0.01,
};

function calculateBMI(height: number, weight: number): number {
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

function computeRiskScore(input: PatientInput): number {
  let score = 0;

  // Age contribution (normalized: 30-70 range)
  score += Math.min(Math.max((input.age - 30) / 40, 0), 1) * FEATURE_WEIGHTS.age;

  // Blood pressure
  const bpScore = Math.min(Math.max((input.ap_hi - 110) / 80, 0), 1);
  score += bpScore * FEATURE_WEIGHTS.ap_hi;

  const bpLoScore = Math.min(Math.max((input.ap_lo - 70) / 40, 0), 1);
  score += bpLoScore * FEATURE_WEIGHTS.ap_lo;

  // Cholesterol (1-3 scale)
  score += ((input.cholesterol - 1) / 2) * FEATURE_WEIGHTS.cholesterol;

  // Glucose
  score += ((input.gluc - 1) / 2) * FEATURE_WEIGHTS.gluc;

  // BMI / weight
  const bmi = calculateBMI(input.height, input.weight);
  const bmiScore = Math.min(Math.max((bmi - 20) / 20, 0), 1);
  score += bmiScore * FEATURE_WEIGHTS.weight;

  // Lifestyle
  score += input.smoke * FEATURE_WEIGHTS.smoke;
  score += input.alco * FEATURE_WEIGHTS.alco;
  score += (1 - input.active) * Math.abs(FEATURE_WEIGHTS.active);

  // Gender minor factor
  score += (input.gender === 1 ? 0.01 : 0);

  // Normalize to 0-1 with sigmoid-like curve
  const probability = 1 / (1 + Math.exp(-8 * (score - 0.35)));
  return parseFloat(probability.toFixed(4));
}

function getTopFactors(input: PatientInput): string[] {
  const factors: { label: string; score: number }[] = [];
  const bmi = calculateBMI(input.height, input.weight);

  if (input.ap_hi >= 140) factors.push({ label: "High systolic blood pressure", score: 0.9 });
  else if (input.ap_hi >= 130) factors.push({ label: "Elevated systolic blood pressure", score: 0.6 });

  if (input.ap_lo >= 90) factors.push({ label: "High diastolic blood pressure", score: 0.8 });

  if (input.cholesterol >= 3) factors.push({ label: "Very high cholesterol level", score: 0.85 });
  else if (input.cholesterol >= 2) factors.push({ label: "Above normal cholesterol", score: 0.6 });

  if (input.gluc >= 3) factors.push({ label: "Very high glucose level", score: 0.7 });
  else if (input.gluc >= 2) factors.push({ label: "Above normal glucose level", score: 0.5 });

  if (input.age >= 55) factors.push({ label: "Age above 55 increases risk", score: 0.65 });
  else if (input.age >= 45) factors.push({ label: "Age-related risk factor", score: 0.4 });

  if (bmi >= 30) factors.push({ label: "Obesity (BMI ≥ 30)", score: 0.7 });
  else if (bmi >= 25) factors.push({ label: "Overweight (BMI ≥ 25)", score: 0.45 });

  if (input.smoke === 1) factors.push({ label: "Smoking increases cardiovascular risk", score: 0.55 });
  if (input.active === 0) factors.push({ label: "Low physical activity", score: 0.5 });
  if (input.alco === 1) factors.push({ label: "Alcohol intake", score: 0.35 });

  factors.sort((a, b) => b.score - a.score);
  return factors.slice(0, 5).map(f => f.label);
}

export function predict(input: PatientInput): PredictionResult {
  const probability = computeRiskScore(input);
  const prediction = probability >= 0.5 ? "High Risk" : "Low Risk";
  const confidence = prediction === "High Risk" ? probability : 1 - probability;
  const bmi = calculateBMI(input.height, input.weight);

  return {
    id: crypto.randomUUID(),
    prediction,
    probability: parseFloat((probability * 100).toFixed(1)),
    confidence: parseFloat((confidence * 100).toFixed(1)),
    top_factors: getTopFactors(input),
    input,
    timestamp: new Date().toISOString(),
    bmi,
  };
}

export function getModelMetrics(): ModelMetrics[] {
  return [
    { model_name: "XGBoost", accuracy: 0.736, precision: 0.741, recall: 0.728, f1_score: 0.734, roc_auc: 0.802 },
    { model_name: "Random Forest", accuracy: 0.724, precision: 0.731, recall: 0.712, f1_score: 0.721, roc_auc: 0.793 },
    { model_name: "Logistic Regression", accuracy: 0.718, precision: 0.722, recall: 0.710, f1_score: 0.716, roc_auc: 0.785 },
    { model_name: "SVM (RBF Kernel)", accuracy: 0.711, precision: 0.718, recall: 0.698, f1_score: 0.708, roc_auc: 0.778 },
  ];
}

export function getFeatureImportance(): FeatureImportance[] {
  return [
    { feature: "Systolic BP", importance: 0.223 },
    { feature: "Cholesterol", importance: 0.181 },
    { feature: "Diastolic BP", importance: 0.152 },
    { feature: "Age", importance: 0.141 },
    { feature: "Weight / BMI", importance: 0.098 },
    { feature: "Glucose", importance: 0.082 },
    { feature: "Smoking", importance: 0.048 },
    { feature: "Physical Activity", importance: 0.039 },
    { feature: "Alcohol", importance: 0.025 },
    { feature: "Gender", importance: 0.011 },
  ];
}

export function getConfusionMatrix() {
  return {
    truePositive: 4892,
    falsePositive: 1708,
    falseNegative: 1832,
    trueNegative: 5568,
  };
}

export function getRocCurveData() {
  return [
    { fpr: 0, tpr: 0 },
    { fpr: 0.02, tpr: 0.15 },
    { fpr: 0.05, tpr: 0.32 },
    { fpr: 0.10, tpr: 0.48 },
    { fpr: 0.15, tpr: 0.58 },
    { fpr: 0.20, tpr: 0.65 },
    { fpr: 0.25, tpr: 0.71 },
    { fpr: 0.30, tpr: 0.76 },
    { fpr: 0.40, tpr: 0.82 },
    { fpr: 0.50, tpr: 0.87 },
    { fpr: 0.60, tpr: 0.91 },
    { fpr: 0.70, tpr: 0.94 },
    { fpr: 0.80, tpr: 0.96 },
    { fpr: 0.90, tpr: 0.98 },
    { fpr: 1.0, tpr: 1.0 },
  ];
}

export function getClassDistribution() {
  return [
    { name: "No CVD", count: 34979, fill: "hsl(168, 60%, 42%)" },
    { name: "Has CVD", count: 35021, fill: "hsl(0, 72%, 51%)" },
  ];
}
