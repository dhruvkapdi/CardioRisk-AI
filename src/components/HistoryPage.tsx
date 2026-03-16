import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PredictionResult } from "@/types/cardiorisk";
import { Clock, Trash2, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Activity, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface HistoryItem extends PredictionResult {
  profile_id?: string | null;
  profile_name?: string;
}

interface HistoryPageProps {
  history: HistoryItem[];
  onClear: () => void;
}

export function HistoryPage({ history, onClear }: HistoryPageProps) {
  const [profileFilter, setProfileFilter] = useState<string>("all");

  // Get unique profile names for filter
  const profileOptions = useMemo(() => {
    const names = new Map<string, string>();
    for (const h of history) {
      if (h.profile_id && h.profile_name) {
        names.set(h.profile_id, h.profile_name);
      }
    }
    return Array.from(names.entries());
  }, [history]);

  const filtered = useMemo(() => {
    if (profileFilter === "all") return history;
    if (profileFilter === "none") return history.filter(h => !h.profile_id);
    return history.filter(h => h.profile_id === profileFilter);
  }, [history, profileFilter]);

  const trendData = useMemo(() => {
    if (filtered.length === 0) return [];
    return [...filtered]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(item => ({
        date: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        risk: item.probability,
        prediction: item.prediction,
      }));
  }, [filtered]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const probs = filtered.map(h => h.probability);
    return {
      average: Math.round(probs.reduce((a, b) => a + b, 0) / probs.length),
      highest: Math.max(...probs),
      latest: probs[0],
    };
  }, [filtered]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Prediction History</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} predictions{profileFilter !== "all" ? " (filtered)" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {profileOptions.length > 0 && (
            <Select value={profileFilter} onValueChange={setProfileFilter}>
              <SelectTrigger className="w-[180px] bg-card">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                <SelectItem value="none">No Profile</SelectItem>
                {profileOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {history.length > 0 && (
            <Button variant="outline" onClick={onClear} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Risk Trend Graph */}
      {trendData.length >= 2 && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-card border border-border/50 p-6 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Health Risk Trend
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">Cardiovascular risk over time</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Average</div>
                <div className="text-lg font-display font-bold text-foreground">{stats.average}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><TrendingUp className="w-3 h-3" /> Highest</div>
                <div className="text-lg font-display font-bold text-danger">{stats.highest}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><TrendingDown className="w-3 h-3" /> Latest</div>
                <div className="text-lg font-display font-bold text-primary">{stats.latest}%</div>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value}%`, "Risk"]}
              />
              <ReferenceLine y={50} stroke="hsl(var(--danger))" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "High Risk Threshold", fill: "hsl(var(--muted-foreground))", fontSize: 10, position: "insideTopRight" }} />
              <Area type="monotone" dataKey="risk" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#riskGradient)" dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-2">No Predictions Yet</h3>
          <p className="text-muted-foreground text-sm">Complete an assessment to see your history here.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Date</th>
                  {profileOptions.length > 0 && (
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Profile</th>
                  )}
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Patient Summary</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Risk</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Probability</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Confidence</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Top Factor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const isHigh = item.prediction === "High Risk";
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-foreground whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      {profileOptions.length > 0 && (
                        <td className="px-4 py-4">
                          {item.profile_name ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {item.profile_name}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-4 text-foreground">
                        {item.input.gender === 1 ? "M" : "F"}, {item.input.age}y, {item.bmi} BMI, BP {item.input.ap_hi}/{item.input.ap_lo}
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          isHigh ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                        }`}>
                          {isHigh ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {item.prediction}
                        </span>
                      </td>
                      <td className="text-center px-4 py-4 font-semibold text-foreground">{item.probability}%</td>
                      <td className="text-center px-4 py-4 text-foreground">{item.confidence}%</td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">{item.top_factors[0] || "—"}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
