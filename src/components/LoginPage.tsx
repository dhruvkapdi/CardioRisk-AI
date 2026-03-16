import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, Eye, EyeOff, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ error: any }>;
  onNavigate: (page: string) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await onLogin(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, don't navigate here — let Index.tsx handle role-based redirect
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 relative">
            <Heart className="w-7 h-7 text-primary" />
            <Activity className="absolute w-4 h-4 text-accent -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome back to <span className="text-gradient-primary">CardioRisk AI</span>
          </h1>
          <p className="text-muted-foreground mt-2">Sign in to access your dashboard</p>
        </div>

        <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="pl-10" required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password" type={showPassword ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="pl-10 pr-10" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button type="button" onClick={() => onNavigate("forgot-password")} className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <button onClick={() => onNavigate("signup")} className="text-primary hover:underline font-medium">
              Sign up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
