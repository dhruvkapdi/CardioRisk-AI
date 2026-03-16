import { Outlet, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { HealthChatAssistant } from "@/components/HealthChatAssistant";

export function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const { isAdmin, roleLoading } = useRole(user?.id);

  // While auth or role is loading, show a loading state to prevent flicker
  if (loading || (user && roleLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If the logged-in user is an admin, redirect them to /admin immediately
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onSignOut={user ? handleSignOut : undefined} />
      <Outlet />
      {user && <HealthChatAssistant predictionResult={null} />}
    </div>
  );
}
