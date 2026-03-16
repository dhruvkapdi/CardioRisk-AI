import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery type in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      // Not a valid recovery link, but still show the form in case session exists
    }
  }, []);

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
    const { error } = await updatePassword(password);
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Password updated!</h2>
            <p className="text-muted-foreground mb-6">Your password has been reset successfully.</p>
            <Button onClick={() => navigate("/")} className="w-full">Go to Dashboard</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Set new password</h2>
          <p className="text-muted-foreground text-sm mb-6">Enter your new password below.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required />
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
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
