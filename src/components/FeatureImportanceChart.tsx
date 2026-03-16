import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PatientInput } from "@/types/cardiorisk";
import { BrainCircuit } from "lucide-react";

interface Props {
  input: PatientInput;
  bmi: number;
}

// Compute per-prediction feature contributions based on model weights and patient values
function computeContributions(input: PatientInput, bmi: number) {
  const features = [
    { name: "Systolic BP", value: Math.min(Math.max((input.ap_hi - 110) / 80, 0), 1) * 0.223 },
    { name: "Cholesterol", value: ((input.cholesterol - 1) / 2) * 0.181 },
    { name: "Diastolic BP", value: Math.min(Math.max((input.ap_lo - 70) / 40, 0), 1) * 0.152 },
    { name: "Age", value: Math.min(Math.max((input.age - 30) / 40, 0), 1) * 0.141 },
    { name: "BMI", value: Math.min(Math.max((bmi - 20) / 20, 0), 1) * 0.098 },
    { name: "Glucose", value: ((input.gluc - 1) / 2) * 0.082 },
    { name: "Smoking", value: input.smoke * 0.048 },
    { name: "Inactivity", value: (1 - input.active) * 0.039 },
    { name: "Alcohol", value: input.alco * 0.025 },
  ];

  // Normalize to percentage
  const total = features.reduce((s, f) => s + f.value, 0) || 1;
  return features
    .map((f) => ({ name: f.name, contribution: +((f.value / total) * 100).toFixed(1) }))
    .sort((a, b) => b.contribution - a.contribution);
}

export function FeatureImportanceChart({ input, bmi }: Props) {
  const data = computeContributions(input, bmi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-card rounded-2xl shadow-card border border-border/50 p-6"
    >
      <h3 className="font-display font-semibold text-foreground mb-1 flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-primary" />
        Feature Contribution Analysis
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        How each factor contributed to your risk score
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [`${value}%`, "Contribution"]}
          />
          <Bar dataKey="contribution" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
