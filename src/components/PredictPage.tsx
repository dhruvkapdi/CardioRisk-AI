import { useEffect } from "react";
import { PredictionForm } from "@/components/PredictionForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ProfileSelector } from "@/components/ProfileSelector";
import { PatientInput, PredictionResult } from "@/types/cardiorisk";
import { HealthProfile } from "@/hooks/use-health-profiles";

interface PredictPageProps {
  onPredict: (input: PatientInput, profileId?: string | null) => void;
  isLoading: boolean;
  result: PredictionResult | null;
  onClearResult: () => void;
  profiles: HealthProfile[];
  activeProfileId: string | null;
  onSelectProfile: (id: string | null) => void;
}

export function PredictPage({ onPredict, isLoading, result, onClearResult, profiles, activeProfileId, onSelectProfile }: PredictPageProps) {
  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? null;

  const prefillValues = activeProfile
    ? {
        age: activeProfile.age,
        gender: activeProfile.gender,
        height: Number(activeProfile.height),
        weight: Number(activeProfile.weight),
        ap_hi: activeProfile.default_ap_hi,
        ap_lo: activeProfile.default_ap_lo,
        cholesterol: activeProfile.default_cholesterol,
        gluc: activeProfile.default_glucose,
        smoke: activeProfile.default_smoke,
        alco: activeProfile.default_alco,
        active: activeProfile.default_active,
      }
    : undefined;

  const handleSubmit = (input: PatientInput) => {
    onPredict(input, activeProfileId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
      {!result && (
        <ProfileSelector
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelect={onSelectProfile}
        />
      )}
      {result ? (
        <ResultsPanel result={result} onBack={onClearResult} />
      ) : (
        <PredictionForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          prefillValues={prefillValues}
          prefillKey={activeProfileId}
        />
      )}
    </div>
  );
}
