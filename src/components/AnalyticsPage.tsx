import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { getModelMetrics, getFeatureImportance, getConfusionMatrix, getRocCurveData, getClassDistribution } from "@/services/prediction-engine";
import { Trophy, Target } from "lucide-react";
import { BatchPrediction } from "@/components/BatchPrediction";

export function AnalyticsPage() {
  const metrics = getModelMetrics();
  const featureImportance = getFeatureImportance();
  const cm = getConfusionMatrix();
  const rocData = getRocCurveData();
  const classDist = getClassDistribution();
  const bestModel = metrics[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Model Analytics</h1>
        <p className="text-muted-foreground mt-1">Performance comparison across trained ML models</p>
      </div>

      {/* Best Model Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground">Best Model: {bestModel.model_name}</h3>
          <p className="text-sm text-muted-foreground">
            Accuracy: {(bestModel.accuracy * 100).toFixed(1)}% · ROC-AUC: {(bestModel.roc_auc * 100).toFixed(1)}%
          </p>
        </div>
      </motion.div>

      {/* Model Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Model Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Model</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Accuracy</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Precision</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Recall</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">F1</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">ROC-AUC</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={i} className={`border-b border-border/50 ${i === 0 ? "bg-primary/5" : ""}`}>
                  <td className="px-6 py-4 font-medium text-foreground">{m.model_name} {i === 0 && <span className="text-xs text-primary ml-1">★ Best</span>}</td>
                  <td className="text-center px-4 py-4 text-foreground">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="text-center px-4 py-4 text-foreground">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="text-center px-4 py-4 text-foreground">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="text-center px-4 py-4 text-foreground">{(m.f1_score * 100).toFixed(1)}%</td>
                  <td className="text-center px-4 py-4 text-foreground">{(m.roc_auc * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Feature Importance (XGBoost)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis type="category" dataKey="feature" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} width={80} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ROC Curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">ROC Curve (AUC = 0.802)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="fpr" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} label={{ value: "False Positive Rate", position: "insideBottom", offset: -5, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} label={{ value: "True Positive Rate", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Line type="monotone" dataKey="tpr" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              {/* Diagonal reference */}
              <Line type="linear" data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} dataKey="tpr" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Confusion Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Confusion Matrix</h3>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="text-2xl font-display font-bold text-success">{cm.trueNegative}</div>
              <div className="text-xs text-muted-foreground mt-1">True Negative</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-danger/10 border border-danger/20">
              <div className="text-2xl font-display font-bold text-danger">{cm.falsePositive}</div>
              <div className="text-xs text-muted-foreground mt-1">False Positive</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-warning/10 border border-warning/20">
              <div className="text-2xl font-display font-bold text-warning">{cm.falseNegative}</div>
              <div className="text-xs text-muted-foreground mt-1">False Negative</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="text-2xl font-display font-bold text-success">{cm.truePositive}</div>
              <div className="text-xs text-muted-foreground mt-1">True Positive</div>
            </div>
          </div>
        </motion.div>

        {/* Class Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Dataset Class Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={classDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                {classDist.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Batch Prediction */}
      <BatchPrediction />
    </div>
  );
}
