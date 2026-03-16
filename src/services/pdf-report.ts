import jsPDF from "jspdf";
import { PredictionResult } from "@/types/cardiorisk";

const RECOMMENDATIONS = [
  "Exercise at least 30 minutes daily",
  "Reduce salt intake",
  "Monitor blood pressure regularly",
  "Maintain a healthy weight",
  "Consult a cardiologist if risk is high",
  "Follow a heart-healthy diet low in saturated fats",
  "Avoid smoking and limit alcohol intake",
  "Manage stress through relaxation techniques",
];

export function getRecommendations(result: PredictionResult): string[] {
  const recs: string[] = [];
  if (result.prediction === "High Risk") {
    recs.push("Consult a cardiologist immediately");
    recs.push("Monitor blood pressure daily");
  } else {
    recs.push("Continue regular health checkups");
  }
  if (result.input.smoke === 1) recs.push("Quit smoking to reduce cardiovascular risk");
  if (result.input.active === 0) recs.push("Exercise at least 30 minutes daily");
  if (result.bmi >= 25) recs.push("Maintain a healthy weight through diet and exercise");
  if (result.input.cholesterol >= 2) recs.push("Follow a heart-healthy diet low in saturated fats");
  if (result.input.ap_hi >= 130) recs.push("Reduce salt intake to manage blood pressure");
  if (result.input.alco === 1) recs.push("Limit alcohol consumption");
  recs.push("Manage stress through relaxation techniques");
  // Deduplicate and limit
  return [...new Set(recs)].slice(0, 6);
}

export function generatePDFReport(result: PredictionResult) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(14, 116, 144); // primary-ish color
  doc.rect(0, 0, w, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CardioRisk AI", 20, 18);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Cardiovascular Risk Assessment Report", 20, 28);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 36);

  y = 52;
  doc.setTextColor(30, 30, 30);

  // Patient Input Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Input Summary", 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const genderLabel = result.input.gender === 1 ? "Male" : "Female";
  const cholLabels = ["", "Normal", "Above Normal", "Well Above Normal"];
  const glucLabels = ["", "Normal", "Above Normal", "Well Above Normal"];

  const fields = [
    ["Age", `${result.input.age} years`],
    ["Gender", genderLabel],
    ["Height", `${result.input.height} cm`],
    ["Weight", `${result.input.weight} kg`],
    ["BMI", `${result.bmi}`],
    ["Systolic BP", `${result.input.ap_hi} mmHg`],
    ["Diastolic BP", `${result.input.ap_lo} mmHg`],
    ["Cholesterol", cholLabels[result.input.cholesterol]],
    ["Glucose", glucLabels[result.input.gluc]],
    ["Smoking", result.input.smoke === 1 ? "Yes" : "No"],
    ["Alcohol", result.input.alco === 1 ? "Yes" : "No"],
    ["Physical Activity", result.input.active === 1 ? "Yes" : "No"],
  ];

  fields.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 25, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 6;
  });

  y += 6;

  // Prediction Result
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Prediction Result", 20, y);
  y += 8;

  const isHigh = result.prediction === "High Risk";
  doc.setFillColor(isHigh ? 220 : 34, isHigh ? 50 : 150, isHigh ? 50 : 80);
  doc.roundedRect(25, y - 4, 60, 10, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(result.prediction, 30, y + 3);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Probability: ${result.probability}%`, 95, y + 3);
  doc.text(`Confidence: ${result.confidence}%`, 145, y + 3);
  y += 18;

  // Top Contributing Factors
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Top Contributing Risk Factors", 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  result.top_factors.forEach((factor, i) => {
    doc.text(`${i + 1}. ${factor}`, 25, y);
    y += 6;
  });

  y += 6;

  // Recommendations
  const recs = getRecommendations(result);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Health Recommendations", 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  recs.forEach((rec, i) => {
    doc.text(`• ${rec}`, 25, y);
    y += 6;
  });

  y += 10;

  // Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "⚠ This is an AI-based screening tool and not a medical diagnosis. Always consult a healthcare professional.",
    20,
    y
  );

  doc.save(`CardioRisk_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
