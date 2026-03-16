import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, User, Ruler, Weight, Activity, Wind, Droplets, Cigarette, Wine, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PatientInput } from "@/types/cardiorisk";

interface PredictionFormProps {
  onSubmit: (input: PatientInput) => void;
  isLoading: boolean;
  prefillValues?: PatientInput;
  prefillKey?: string | null;
}

const defaultValues: PatientInput = {
  age: 50, gender: 1, height: 170, weight: 75, ap_hi: 130, ap_lo: 85,
  cholesterol: 1, gluc: 1, smoke: 0, alco: 0, active: 1,
};

export function PredictionForm({ onSubmit, isLoading, prefillValues, prefillKey }: PredictionFormProps) {
  const [form, setForm] = useState<PatientInput>(prefillValues ?? defaultValues);

  // Reset form when profile changes
  useEffect(() => {
    setForm(prefillValues ?? defaultValues);
  }, [prefillKey]);

  const bmi = form.height > 0 ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : "—";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const updateField = (field: keyof PatientInput, value: number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card border border-border/50 p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">Patient Assessment</h2>
          <p className="text-sm text-muted-foreground">Enter patient details for risk prediction</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demographics */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Demographics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground"><User className="w-4 h-4 text-muted-foreground" /> Age</Label>
              <Input type="number" value={form.age} onChange={e => updateField("age", +e.target.value)} min={1} max={120} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground"><User className="w-4 h-4 text-muted-foreground" /> Gender</Label>
              <Select value={String(form.gender)} onValueChange={v => updateField("gender", +v)}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Male</SelectItem>
                  <SelectItem value="2">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">BMI (auto)</Label>
              <div className="h-10 flex items-center px-3 rounded-md bg-muted text-foreground font-semibold">{bmi}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground"><Ruler className="w-4 h-4 text-muted-foreground" /> Height (cm)</Label>
              <Input type="number" value={form.height} onChange={e => updateField("height", +e.target.value)} min={50} max={250} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground"><Weight className="w-4 h-4 text-muted-foreground" /> Weight (kg)</Label>
              <Input type="number" value={form.weight} onChange={e => updateField("weight", +e.target.value)} min={20} max={300} className="bg-background" />
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vitals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground"><Wind className="w-4 h-4 text-muted-foreground" /> Systolic BP (mmHg)</Label>
              <Input type="number" value={form.ap_hi} onChange={e => updateField("ap_hi", +e.target.value)} min={60} max={250} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground"><Wind className="w-4 h-4 text-muted-foreground" /> Diastolic BP (mmHg)</Label>
              <Input type="number" value={form.ap_lo} onChange={e => updateField("ap_lo", +e.target.value)} min={40} max={180} className="bg-background" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground"><Droplets className="w-4 h-4 text-muted-foreground" /> Cholesterol</Label>
              <Select value={String(form.cholesterol)} onValueChange={v => updateField("cholesterol", +v)}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="2">Above Normal</SelectItem>
                  <SelectItem value="3">Well Above Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground"><Zap className="w-4 h-4 text-muted-foreground" /> Glucose</Label>
              <Select value={String(form.gluc)} onValueChange={v => updateField("gluc", +v)}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="2">Above Normal</SelectItem>
                  <SelectItem value="3">Well Above Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lifestyle</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="flex items-center gap-2 text-foreground"><Cigarette className="w-4 h-4 text-muted-foreground" /> Smoking</Label>
              <Switch checked={form.smoke === 1} onCheckedChange={v => updateField("smoke", v ? 1 : 0)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="flex items-center gap-2 text-foreground"><Wine className="w-4 h-4 text-muted-foreground" /> Alcohol</Label>
              <Switch checked={form.alco === 1} onCheckedChange={v => updateField("alco", v ? 1 : 0)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label className="flex items-center gap-2 text-foreground"><Activity className="w-4 h-4 text-muted-foreground" /> Active</Label>
              <Switch checked={form.active === 1} onCheckedChange={v => updateField("active", v ? 1 : 0)} />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary-glow py-6 text-lg font-semibold rounded-xl"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            <><Heart className="w-5 h-5 mr-2" /> Predict Cardiovascular Risk</>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
