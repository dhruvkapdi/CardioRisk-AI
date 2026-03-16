import { Heart, Moon, Sun, Activity, LogOut, Menu, X, Users } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  user?: any;
  onSignOut?: () => void;
}

const navItems = [
  { id: "/", label: "Home" },
  { id: "features", label: "Features", isSection: true },
  { id: "/predict", label: "Predict", requiresAuth: true },
  { id: "/analytics", label: "Analytics", requiresAuth: true },
  { id: "/history", label: "History", requiresAuth: true },
  { id: "/profiles", label: "Profiles", icon: Users, requiresAuth: true },
];

export function Navbar({ user, onSignOut }: NavbarProps) {
  const { isDark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const visibleItems = navItems.filter((item) => !item.requiresAuth || user);

  const handleFeaturesClick = () => {
    if (location.pathname === "/") {
      const section = document.getElementById("features");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById("features");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
    }
    setMobileOpen(false);
  };

  const isActiveItem = (item: (typeof navItems)[number]) => {
    if (item.isSection) return false;
    return location.pathname === item.id;
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
            <Heart className="w-5 h-5 text-primary" />
            <Activity className="absolute w-3 h-3 text-accent -top-0.5 -right-0.5 animate-pulse-glow" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            Cardio<span className="text-gradient-primary">Risk</span> AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {visibleItems.map((item) =>
            item.isSection ? (
              <button
                key={item.id}
                onClick={handleFeaturesClick}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                to={item.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActiveItem(item)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[140px]">
              {user.email}
            </span>
          )}

          {!user && (
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-lg text-sm">
                Sign In
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-lg">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {user && onSignOut && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="rounded-lg text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-card px-4 py-3 space-y-1">
          {visibleItems.map((item) =>
            item.isSection ? (
              <button
                key={item.id}
                onClick={handleFeaturesClick}
                className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                to={item.id}
                onClick={() => setMobileOpen(false)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActiveItem(item)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}