import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, Eye, EyeOff, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupPageProps {
  onSignup: (email: string, password: string) => Promise<{ error: any }>;
  onNavigate: (page: string) => void;
}

export function SignupPage({ onSignup, onNavigate }: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await onSignup(email, password);
    if (error) {
      setError(error.message);
    } else {
      // Supabase auto-signs in after signup; navigate to home
      onNavigate("home");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 mb-4">
              <Mail className="w-7 h-7 text-success" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-6">We've sent a confirmation link to <strong className="text-foreground">{email}</strong></p>
            <Button onClick={() => onNavigate("login")} variant="outline" className="w-full">
              Back to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 relative">
            <Heart className="w-7 h-7 text-primary" />
            <Activity className="absolute w-4 h-4 text-accent -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Join <span className="text-gradient-primary">CardioRisk AI</span>
          </h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
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
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-10" required />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button onClick={() => onNavigate("login")} className="text-primary hover:underline font-medium">
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
