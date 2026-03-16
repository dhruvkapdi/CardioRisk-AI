import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin, roleLoading } = useRole(user?.id);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verifying access...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border/50 rounded-2xl p-10 text-center max-w-md">
          <ShieldCheck className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm">You do not have admin privileges. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
