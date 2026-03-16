import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Server, Database, Activity, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function SystemOverviewPage() {
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

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading system overview...</div></div>;
  if (error) return <div className="p-8"><div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center"><p className="text-destructive font-medium">{error}</p></div></div>;
  if (!data) return null;

  const items = [
    { icon: Database, label: "Total Predictions Stored", value: data.totalPredictions, color: "text-primary" },
    { icon: Activity, label: "High Risk Records", value: data.highRisk, color: "text-destructive" },
    { icon: CheckCircle, label: "Low Risk Records", value: data.lowRisk, color: "text-accent" },
    { icon: Server, label: "Registered Users", value: data.totalUsers, color: "text-primary" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Server className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">System Overview</h1>
          <p className="text-sm text-muted-foreground">Platform health and data summary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border/50 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-display font-bold text-foreground">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Platform Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Authentication", status: "Active" },
            { label: "Database (Supabase)", status: "Connected" },
            { label: "ML Prediction Engine", status: "Online" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.status}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
