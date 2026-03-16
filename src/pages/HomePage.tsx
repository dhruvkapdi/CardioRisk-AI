import { useNavigate } from "react-router-dom";
import { LandingPage } from "@/components/LandingPage";

export default function HomePage() {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    navigate(page === "home" ? "/" : `/${page}`);
  };
  return <LandingPage onNavigate={handleNavigate} />;
}
