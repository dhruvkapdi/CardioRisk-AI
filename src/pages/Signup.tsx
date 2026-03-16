import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { SignupPage } from "@/components/SignupPage";

export default function Signup() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  if (loading || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleNavigate = (page: string) => {
    if (page === "login") navigate("/login");
    else navigate("/");
  };

  return <SignupPage onSignup={signUp} onNavigate={handleNavigate} />;
}
