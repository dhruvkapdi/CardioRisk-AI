import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Edit2, Trash2, User, Heart, Activity, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HealthProfile, useHealthProfiles } from "@/hooks/use-health-profiles";

const RELATIONS = ["Self", "Father", "Mother", "Spouse", "Son", "Daughter", "Grandparent", "Sibling", "Other"];

interface HealthProfilesPageProps {
  userId: string;
  activeProfileId: string | null;
  onSelectProfile: (id: string | null) => void;
  profiles: HealthProfile[];
  loading: boolean;
  onCreate: (p: any) => Promise<any>;
  onUpdate: (id: string, p: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

interface ProfileFormData {
  profile_name: string;
  relation: string;
  gender: number;
  age: number;
  height: number;
  weight: number;
  default_ap_hi: number;
  default_ap_lo: number;
  default_cholesterol: number;
  default_glucose: number;
  default_smoke: number;
  default_alco: number;
  default_active: number;
}

const defaultForm: ProfileFormData = {
  profile_name: "",
  relation: "Self",
  gender: 1,
  age: 30,
  height: 170,
  weight: 70,
  default_ap_hi: 120,
  default_ap_lo: 80,
  default_cholesterol: 1,
  default_glucose: 1,
  default_smoke: 0,
  default_alco: 0,
  default_active: 1,
};

export function HealthProfilesPage({
  userId,
  activeProfileId,
  onSelectProfile,
  profiles,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: HealthProfilesPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: HealthProfile) => {
    setForm({
      profile_name: p.profile_name,
      relation: p.relation,
      gender: p.gender,
      age: p.age,
      height: Number(p.height),
      weight: Number(p.weight),
      default_ap_hi: p.default_ap_hi,
      default_ap_lo: p.default_ap_lo,
      default_cholesterol: p.default_cholesterol,
      default_glucose: p.default_glucose,
      default_smoke: p.default_smoke,
      default_alco: p.default_alco,
      default_active: p.default_active,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.profile_name.trim()) return;
    setSaving(true);
    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onCreate(form);
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this health profile?")) return;
    await onDelete(id);
  };

  const updateField = (field: keyof ProfileFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse text-muted-foreground">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Health Profiles
          </h1>
          <p className="text-muted-foreground mt-1">Manage profiles for yourself and family members</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Profile
        </Button>
      </div>

      {/* Profile Cards */}
      {profiles.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-2">No Profiles Yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Create a health profile to get started with predictions.</p>
          <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Create First Profile</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {profiles.map((p) => {
              const isActive = activeProfileId === p.id;
              const bmi = Number(p.height) > 0 ? (Number(p.weight) / ((Number(p.height) / 100) ** 2)).toFixed(1) : "—";
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-card rounded-2xl shadow-card border p-5 transition-all cursor-pointer ${
                    isActive ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-primary/30"
                  }`}
                  onClick={() => onSelectProfile(isActive ? null : p.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <User className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{p.profile_name}</h3>
                        <span className="text-xs text-muted-foreground">{p.relation}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {isActive && (
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mr-1">Active</span>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Age</div>
                      <div className="text-sm font-semibold text-foreground">{p.age}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Gender</div>
                      <div className="text-sm font-semibold text-foreground">{p.gender === 1 ? "M" : "F"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">BMI</div>
                      <div className="text-sm font-semibold text-foreground">{bmi}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">BP</div>
                      <div className="text-sm font-semibold text-foreground">{p.default_ap_hi}/{p.default_ap_lo}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl shadow-card border border-border/50 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-lg text-foreground">
                  {editingId ? "Edit Profile" : "New Health Profile"}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Profile Name</Label>
                    <Input value={form.profile_name} onChange={e => updateField("profile_name", e.target.value)} placeholder="e.g., Papa" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Relation</Label>
                    <Select value={form.relation} onValueChange={v => updateField("relation", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RELATIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Gender</Label>
                    <Select value={String(form.gender)} onValueChange={v => updateField("gender", +v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Male</SelectItem>
                        <SelectItem value="2">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Age</Label>
                    <Input type="number" value={form.age} onChange={e => updateField("age", +e.target.value)} min={1} max={120} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Height (cm)</Label>
                    <Input type="number" value={form.height} onChange={e => updateField("height", +e.target.value)} min={50} max={250} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Weight (kg)</Label>
                    <Input type="number" value={form.weight} onChange={e => updateField("weight", +e.target.value)} min={20} max={300} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Systolic BP</Label>
                    <Input type="number" value={form.default_ap_hi} onChange={e => updateField("default_ap_hi", +e.target.value)} min={60} max={250} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Diastolic BP</Label>
                    <Input type="number" value={form.default_ap_lo} onChange={e => updateField("default_ap_lo", +e.target.value)} min={40} max={180} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Cholesterol</Label>
                    <Select value={String(form.default_cholesterol)} onValueChange={v => updateField("default_cholesterol", +v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Normal</SelectItem>
                        <SelectItem value="2">Above Normal</SelectItem>
                        <SelectItem value="3">Well Above</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Glucose</Label>
                    <Select value={String(form.default_glucose)} onValueChange={v => updateField("default_glucose", +v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Normal</SelectItem>
                        <SelectItem value="2">Above Normal</SelectItem>
                        <SelectItem value="3">Well Above</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label className="text-foreground text-sm">Smoking</Label>
                    <Switch checked={form.default_smoke === 1} onCheckedChange={v => updateField("default_smoke", v ? 1 : 0)} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label className="text-foreground text-sm">Alcohol</Label>
                    <Switch checked={form.default_alco === 1} onCheckedChange={v => updateField("default_alco", v ? 1 : 0)} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label className="text-foreground text-sm">Active</Label>
                    <Switch checked={form.default_active === 1} onCheckedChange={v => updateField("default_active", v ? 1 : 0)} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 gap-2" disabled={saving}>
                    {saving ? "Saving..." : <><Check className="w-4 h-4" /> {editingId ? "Update" : "Create"} Profile</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
