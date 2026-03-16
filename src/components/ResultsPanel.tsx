import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, TrendingUp, Stethoscope, Dumbbell, HeartPulse, ArrowLeft, Download } from "lucide-react";
import { PredictionResult } from "@/types/cardiorisk";
import { Button } from "@/components/ui/button";
import { generatePDFReport, getRecommendations } from "@/services/pdf-report";
import { NearbyHospitals } from "@/components/NearbyHospitals";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";

interface ResultsPanelProps {
  result: PredictionResult;
  onBack: () => void;
}

const recIcons = [Stethoscope, HeartPulse, Dumbbell, TrendingUp, Stethoscope, HeartPulse];

function RiskGauge({ probability, prediction }: { probability: number; prediction: string }) {
  const isHigh = prediction === "High Risk";
  const angle = (probability / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28 overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="16" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={isHigh ? "hsl(var(--danger))" : "hsl(var(--success))"} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(probability / 100) * 251.3} 251.3`} />
          <motion.line x1="100" y1="100" x2="100" y2="30" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" initial={{ rotate: -90, originX: "100px", originY: "100px" }} animate={{ rotate: angle, originX: "100px", originY: "100px" }} transition={{ duration: 1.5, ease: "easeOut" }} style={{ transformOrigin: "100px 100px" }} />
          <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
        </svg>
      </div>
      <div className="text-3xl font-display font-bold text-foreground mt-2">{probability}%</div>
      <div className="text-sm text-muted-foreground">Risk Probability</div>
    </div>
  );
}

export function ResultsPanel({ result, onBack }: ResultsPanelProps) {
  const isHigh = result.prediction === "High Risk";
  const recs = getRecommendations(result);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          New Assessment
        </Button>
        <Button onClick={() => generatePDFReport(result)} className="gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      {/* Main Result Card */}
      <div className={`rounded-2xl p-8 text-center border ${isHigh ? "bg-danger/5 border-danger/20" : "bg-success/5 border-success/20"}`}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isHigh ? "bg-danger/10" : "bg-success/10"}`}>
          {isHigh ? <AlertTriangle className="w-8 h-8 text-danger" /> : <CheckCircle className="w-8 h-8 text-success" />}
        </motion.div>
        <h2 className={`text-3xl font-display font-bold mb-2 ${isHigh ? "text-danger" : "text-success"}`}>{result.prediction}</h2>
        <p className="text-muted-foreground">
          Confidence: <span className="font-semibold text-foreground">{result.confidence}%</span>
          {" · "}BMI: <span className="font-semibold text-foreground">{result.bmi}</span>
        </p>
      </div>

      {/* Gauge */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
        <RiskGauge probability={result.probability} prediction={result.prediction} />
      </div>

      {/* Contributing Factors */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Top Contributing Factors</h3>
        <div className="space-y-3">
          {result.top_factors.map((factor, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`w-2 h-2 rounded-full ${isHigh ? "bg-danger" : "bg-success"}`} />
              <span className="text-sm text-foreground">{factor}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Health Recommendations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recs.map((rec, i) => {
            const Icon = recIcons[i % recIcons.length];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3 mb-1">
                  <Icon className="w-5 h-5 text-primary" />
                  <p className="text-sm text-foreground font-medium">{rec}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feature Importance Chart */}
      <FeatureImportanceChart input={result.input} bmi={result.bmi} />

      {/* Nearby Hospitals — High Risk only */}
      {isHigh && <NearbyHospitals />}

      <p className="text-xs text-center text-muted-foreground italic">
        ⚠ This is an AI-based screening tool and not a medical diagnosis. Always consult a healthcare professional.
      </p>
    </motion.div>
  );
}
