import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileRow {
  id: string;
  user_email: string | null;
  profile_name: string;
  relation: string;
  age: number;
  gender: number;
  height: number;
  weight: number;
  default_ap_hi: number;
  default_ap_lo: number;
  prediction_count: number;
  created_at: string;
}

export function AdminProfileRecordsPage() {
  const [records, setRecords] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError("Not authenticated"); setLoading(false); return; }

        const { data: result, error: fnErr } = await supabase.functions.invoke("admin-analytics", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { action: "health_profiles" },
        });
        if (fnErr) throw fnErr;
        if (result?.error) setError(result.error);
        else setRecords(result?.profiles || []);
      } catch (e: any) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading profiles...</div></div>;
  if (error) return <div className="p-8"><div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center"><p className="text-destructive font-medium">{error}</p></div></div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <UserCircle className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Profile Records</h1>
          <p className="text-sm text-muted-foreground">{records.length} health profiles across all users</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>BP</TableHead>
              <TableHead>Predictions</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-foreground text-sm">{r.user_email || "—"}</TableCell>
                <TableCell className="font-medium">{r.profile_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{r.relation}</Badge>
                </TableCell>
                <TableCell>{r.age}</TableCell>
                <TableCell>{r.gender === 1 ? "Female" : "Male"}</TableCell>
                <TableCell className="text-sm">{r.default_ap_hi}/{r.default_ap_lo}</TableCell>
                <TableCell>{r.prediction_count}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(r.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No profiles found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
