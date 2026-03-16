import { useAuth } from "@/hooks/use-auth";
import { usePrediction } from "@/hooks/use-prediction";
import { useHealthProfiles } from "@/hooks/use-health-profiles";
import { PredictPage } from "@/components/PredictPage";
import { PatientInput } from "@/types/cardiorisk";

export default function PredictRoute() {
  const { user } = useAuth();
  const { currentResult, isLoading, makePrediction, setCurrentResult } = usePrediction();
  const { profiles, activeProfileId, setActiveProfileId } = useHealthProfiles(user?.id);

  const handlePredict = (input: PatientInput, profileId?: string | null) => {
    makePrediction(input, profileId);
  };

  return (
    <PredictPage
      onPredict={handlePredict}
      isLoading={isLoading}
      result={currentResult}
      onClearResult={() => setCurrentResult(null)}
      profiles={profiles}
      activeProfileId={activeProfileId}
      onSelectProfile={setActiveProfileId}
    />
  );
}
