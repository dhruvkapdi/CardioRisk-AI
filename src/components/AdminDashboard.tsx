import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  Users, Activity, AlertTriangle, CheckCircle, Heart,
  TrendingUp, Scale, Gauge, ShieldCheck,
} from "lucide-react";

interface AdminData {
  totalUsers: number;
  totalPredictions: number;
  highRisk: number;
  lowRisk: number;
  avgBmi: number;
  avgSystolic: number;
  avgDiastolic: number;
  avgCholesterol: number;
  ageDistribution: { range: string; count: number }[];
  bmiDistribution: { range: string; count: number }[];
  riskTrend: { date: string; riskRate: number; predictions: number }[];
  topFactors: { factor: string; count: number }[];
}

const PIE_COLORS = ["hsl(0, 72%, 51%)", "hsl(152, 60%, 42%)"];

function KPICard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card border border-border/50 p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      </div>
    </motion.div>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const { data: result, error: fnErr } = await supabase.functions.invoke("admin-analytics", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (fnErr) throw fnErr;
        if (result?.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground">Loading admin analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-danger/5 border border-danger/20 rounded-2xl p-8 text-center">
          <ShieldCheck className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">{error}. Only admin users can view this dashboard.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const predDist = [
    { name: "High Risk", value: data.highRisk, fill: PIE_COLORS[0] },
    { name: "Low Risk", value: data.lowRisk, fill: PIE_COLORS[1] },
  ];

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--foreground))",
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          Admin Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Platform-wide metrics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Total Users" value={data.totalUsers} color="bg-primary/10 text-primary" />
        <KPICard icon={Activity} label="Total Predictions" value={data.totalPredictions} color="bg-accent/10 text-accent" />
        <KPICard icon={AlertTriangle} label="High Risk Cases" value={data.highRisk} color="bg-danger/10 text-danger" />
        <KPICard icon={CheckCircle} label="Low Risk Cases" value={data.lowRisk} color="bg-success/10 text-success" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={Scale} label="Avg BMI" value={data.avgBmi} color="bg-warning/10 text-warning" />
        <KPICard icon={Gauge} label="Avg Systolic BP" value={`${data.avgSystolic} mmHg`} color="bg-danger/10 text-danger" />
        <KPICard icon={Heart} label="Avg Diastolic BP" value={`${data.avgDiastolic} mmHg`} color="bg-info/10 text-info" />
        <KPICard icon={TrendingUp} label="Avg Cholesterol" value={data.avgCholesterol} color="bg-primary/10 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
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

        {/* Risk Trend Over Time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Risk Rate Trend</h3>
          {data.riskTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="riskRate" stroke="hsl(var(--danger))" fill="hsl(var(--danger) / 0.15)" strokeWidth={2} name="High Risk %" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-10">No trend data yet</p>
          )}
        </motion.div>

        {/* Age Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
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

        {/* BMI Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
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

      {/* Top Risk Factors */}
      {data.topFactors.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Top Risk Factors (All Users)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.topFactors} layout="vertical" margin={{ left: 160 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis type="category" dataKey="factor" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} width={160} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--danger))" radius={[0, 4, 4, 0]} name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
