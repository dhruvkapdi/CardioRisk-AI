import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Activity, AlertTriangle, CheckCircle, Heart,
  TrendingUp, Scale, Gauge,
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
}

function KPICard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card border border-border/50 p-5 flex items-center gap-4">
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

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
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

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading dashboard...</div></div>;
  if (error) return <div className="p-8"><div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center"><p className="text-destructive font-medium">{error}</p></div></div>;
  if (!data) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform-wide metrics overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Total Users" value={data.totalUsers} color="bg-primary/10 text-primary" />
        <KPICard icon={Activity} label="Total Predictions" value={data.totalPredictions} color="bg-accent/10 text-accent" />
        <KPICard icon={AlertTriangle} label="High Risk Cases" value={data.highRisk} color="bg-destructive/10 text-destructive" />
        <KPICard icon={CheckCircle} label="Low Risk Cases" value={data.lowRisk} color="bg-accent/10 text-accent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Scale} label="Avg BMI" value={data.avgBmi} color="bg-primary/10 text-primary" />
        <KPICard icon={Gauge} label="Avg Systolic BP" value={`${data.avgSystolic} mmHg`} color="bg-destructive/10 text-destructive" />
        <KPICard icon={Heart} label="Avg Diastolic BP" value={`${data.avgDiastolic} mmHg`} color="bg-primary/10 text-primary" />
        <KPICard icon={TrendingUp} label="Avg Cholesterol" value={data.avgCholesterol} color="bg-accent/10 text-accent" />
      </div>
    </div>
  );
}
