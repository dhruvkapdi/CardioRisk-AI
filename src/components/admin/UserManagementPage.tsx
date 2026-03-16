import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface UserRow {
  id: string;
  email: string | null;
  created_at: string;
  role: string;
  predictionCount: number;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError("Not authenticated"); setLoading(false); return; }

        const { data: result, error: fnErr } = await supabase.functions.invoke("admin-analytics", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { action: "users" },
        });
        if (fnErr) throw fnErr;
        if (result?.error) setError(result.error);
        else setUsers(result?.users || []);
      } catch (e: any) {
        setError(e.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading users...</div></div>;
  if (error) return <div className="p-8"><div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center"><p className="text-destructive font-medium">{error}</p></div></div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Predictions</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.email || "—"}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>{u.predictionCount}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(u.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
