// C:\Users\Dhruv\Downloads\cardio-health-ai-main (1)\cardio-health-ai-main\src\components\LandingPage.tsx
import { motion } from "framer-motion";
import { Heart, ArrowRight, Shield, Brain, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Users,
  HeartPulse,
  Hospital,
  Bot,
  Lock,
  LayoutDashboard,
  PieChart,
  FileText
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const features = [
  {
    icon: Brain,
    title: "ML-Powered Analysis",
    description:
      "Trained on 70,000+ patient records using XGBoost, Random Forest, SVM and Logistic Regression.",
  },
  {
    icon: Shield,
    title: "Explainable AI",
    description:
      "Understand which factors contribute most to the risk assessment with SHAP-based explanations.",
  },
  {
    icon: Activity,
    title: "Real-Time Prediction",
    description:
      "Get instant cardiovascular risk assessments with confidence scoring and actionable insights.",
  },
  {
    icon: BarChart3,
    title: "Clinical Analytics",
    description:
      "Explore model performance, ROC curves, confusion matrices, and feature importance charts.",
  },

  {
    icon: Users,
    title: "Multi-Profile Family Health",
    description:
      "Track cardiovascular risk for multiple family members with separate prediction history.",
  },
  {
    icon: HeartPulse,
    title: "Automated Health Recommendations",
    description:
      "AI suggests lifestyle improvements and preventive measures based on predicted cardiovascular risk.",
  },
  {
    icon: Hospital,
    title: "Nearby Hospital Discovery",
    description:
      "High-risk predictions automatically recommend nearby hospitals for quick medical consultation.",
  },
  {
    icon: Bot,
    title: "AI Health Assistant",
    description:
      "Interactive chatbot answering cardiovascular health questions and explaining prediction results.",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    description:
      "Supabase authentication with protected routes, secure sessions and role-based access control.",
  },
  {
    icon: LayoutDashboard,
    title: "Role-Based Admin Panel",
    description:
      "Dedicated admin portal for monitoring users, predictions and system activity.",
  },
  {
    icon: PieChart,
    title: "Admin Analytics Dashboard",
    description:
      "Platform-wide statistics including total predictions, high-risk cases and health trends.",
  },
  {
    icon: FileText,
    title: "Health Report Generation",
    description:
      "Generate downloadable cardiovascular risk reports with medical-style summaries.",
  },
];

const stats = [
  { value: "73.6%", label: "Model Accuracy" },
  { value: "70K+", label: "Training Records" },
  { value: "11", label: "Risk Factors" },
  { value: "4", label: "ML Models" },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-8">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary-foreground/90">AI-Powered Healthcare</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Cardio<span className="text-primary">Risk</span> AI
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/75 mb-10 leading-relaxed max-w-2xl mx-auto">
              Advanced cardiovascular disease risk prediction using machine learning. Get instant, explainable risk assessments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
  size="lg"
  onClick={() => onNavigate("predict")}
  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary-glow px-8 py-6 text-lg font-semibold rounded-xl"
>
  Start Assessment
  <ArrowRight className="w-5 h-5 ml-2" />
</Button>

<Button
  size="lg"
  onClick={() => onNavigate("analytics")}
  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary-glow px-8 py-6 text-lg font-semibold rounded-xl"
>
  View Analytics
</Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">{s.value}</div>
                <div className="text-sm text-primary-foreground/60 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

            {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24 scroll-mt-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Clinical-Grade AI Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with state-of-the-art machine learning models trained on real-world cardiovascular data.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="bg-gradient-hero rounded-2xl p-12 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold mb-4">Ready to assess cardiovascular risk?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
              Enter patient data and get an instant AI-powered risk prediction with explainable results.
            </p>
            <Button
              size="lg"
              onClick={() => onNavigate("predict")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary-glow px-8 py-6 text-lg font-semibold rounded-xl"
            >
              Start Free Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
