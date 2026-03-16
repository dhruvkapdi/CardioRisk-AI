import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordPageProps {
  onReset: (email: string) => Promise<{ error: any }>;
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onReset, onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await onReset(email);
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8">
          <button onClick={() => onNavigate("login")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>

          {sent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 mb-4">
                <Mail className="w-7 h-7 text-success" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-muted-foreground">We've sent a password reset link to <strong className="text-foreground">{email}</strong></p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">Reset your password</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
