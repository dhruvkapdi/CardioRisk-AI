import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ForgotPasswordPage } from "@/components/ForgotPasswordPage";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleNavigate = (page: string) => {
    if (page === "login") navigate("/login");
    else navigate("/");
  };

  return <ForgotPasswordPage onReset={resetPassword} onNavigate={handleNavigate} />;
}
