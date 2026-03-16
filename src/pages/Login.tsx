import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { LoginPage } from "@/components/LoginPage";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const { isAdmin, roleLoading } = useRole(user?.id);

  useEffect(() => {
    if (!loading && !roleLoading && user) {
      navigate(isAdmin ? "/admin" : "/", { replace: true });
    }
  }, [user, loading, roleLoading, isAdmin, navigate]);

  if (loading || (user && roleLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  const handleNavigate = (page: string) => {
    if (page === "signup") navigate("/signup");
    else if (page === "forgot-password") navigate("/forgot-password");
    else navigate("/");
  };

  return <LoginPage onLogin={signIn} onNavigate={handleNavigate} />;
}
