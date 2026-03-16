import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Heart, Activity, LayoutDashboard, Users, BarChart3, Server, LogOut, Moon, Sun, ChevronLeft, FileText, UserCircle } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { id: "users", label: "User Management", icon: Users, path: "/admin/users" },
  { id: "predictions", label: "Prediction Records", icon: FileText, path: "/admin/predictions" },
  { id: "profiles", label: "Profile Records", icon: UserCircle, path: "/admin/profiles" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { id: "system", label: "System Overview", icon: Server, path: "/admin/system" },
];

interface AdminLayoutProps {
  userEmail?: string;
  onSignOut: () => void;
}

export function AdminLayout({ userEmail, onSignOut }: AdminLayoutProps) {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`${collapsed ? "w-16" : "w-64"} bg-card border-r border-border/50 flex flex-col transition-all duration-200 shrink-0`}>
        <div className="h-16 flex items-center gap-2 px-4 border-b border-border/50">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
            <Heart className="w-5 h-5 text-primary" />
            <Activity className="absolute w-3 h-3 text-accent -top-0.5 -right-0.5" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-display font-bold text-sm text-foreground">Admin Portal</span>
              <p className="text-[10px] text-muted-foreground">CardioRisk AI</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border/50 p-3 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Back to App"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" />
            {!collapsed && "Back to App"}
          </button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggle} className="rounded-lg shrink-0">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onSignOut} className="rounded-lg text-muted-foreground hover:text-destructive shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          {!collapsed && userEmail && (
            <p className="text-[10px] text-muted-foreground truncate px-1">{userEmail}</p>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
