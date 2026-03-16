import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const PIE_COLORS = ["hsl(0, 72%, 51%)", "hsl(152, 60%, 42%)"];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
};

export function PredictionAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError("Not authenticated"); setLoading(false); return; }
        const { data: result, error: fnErr } = await supabase.functions.invoke("admin-analytics", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (fnErr) throw fnErr;
        if (result?.error) setError(result.error);
        else setData(result);
      } catch (e: any) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading analytics...</div></div>;
  if (error) return <div className="p-8"><div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center"><p className="text-destructive font-medium">{error}</p></div></div>;
  if (!data) return null;

  const predDist = [
    { name: "High Risk", value: data.highRisk, fill: PIE_COLORS[0] },
    { name: "Low Risk", value: data.lowRisk, fill: PIE_COLORS[1] },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Prediction Analytics</h1>
          <p className="text-sm text-muted-foreground">Platform-wide prediction insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Prediction Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={predDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                {predDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Risk Rate Trend</h3>
          {data.riskTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="riskRate" stroke="hsl(0, 72%, 51%)" fill="hsl(0 72% 51% / 0.15)" strokeWidth={2} name="High Risk %" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm text-center py-10">No trend data yet</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">BMI Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.bmiDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {data.topFactors?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Top Risk Factors</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.topFactors} layout="vertical" margin={{ left: 160 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis type="category" dataKey="factor" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} width={160} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
