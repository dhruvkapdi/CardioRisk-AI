import { useState, useCallback, useEffect } from "react";
import { PredictionResult, PatientInput } from "@/types/cardiorisk";
import { predict } from "@/services/prediction-engine";
import { getRecommendations } from "@/services/pdf-report";
import { supabase } from "@/integrations/supabase/client";

export function usePrediction() {
  const [history, setHistory] = useState<(PredictionResult & { profile_id?: string | null; profile_name?: string })[]>([]);
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("prediction_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      // Fetch profile names for profile_ids
      const profileIds = [...new Set((data as any[]).map((r: any) => r.profile_id).filter(Boolean))];
      let profileMap: Record<string, string> = {};
      if (profileIds.length > 0) {
        const { data: profiles } = await supabase
          .from("health_profiles")
          .select("id, profile_name")
          .in("id", profileIds);
        if (profiles) {
          for (const p of profiles as any[]) {
            profileMap[p.id] = p.profile_name;
          }
        }
      }

      setHistory((data as any[]).map((row: any) => ({
        id: row.id,
        prediction: row.prediction as "High Risk" | "Low Risk",
        probability: Number(row.probability),
        confidence: Number(row.confidence),
        top_factors: row.top_factors as string[],
        bmi: Number(row.bmi),
        timestamp: row.created_at,
        profile_id: row.profile_id ?? null,
        profile_name: row.profile_id ? (profileMap[row.profile_id] ?? "Unknown") : undefined,
        input: {
          age: row.age,
          gender: row.gender,
          height: Number(row.height),
          weight: Number(row.weight),
          ap_hi: row.ap_hi,
          ap_lo: row.ap_lo,
          cholesterol: row.cholesterol,
          gluc: row.glucose,
          smoke: row.smoke,
          alco: row.alco,
          active: row.active,
        },
      })));
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const makePrediction = useCallback(async (input: PatientInput, profileId?: string | null) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const result = predict(input);
    setCurrentResult(result);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const recs = getRecommendations(result);
      await supabase.from("prediction_history").insert({
        user_id: user.id,
        age: input.age,
        gender: input.gender,
        height: input.height,
        weight: input.weight,
        bmi: result.bmi,
        ap_hi: input.ap_hi,
        ap_lo: input.ap_lo,
        cholesterol: input.cholesterol,
        glucose: input.gluc,
        smoke: input.smoke,
        alco: input.alco,
        active: input.active,
        prediction: result.prediction,
        probability: result.probability,
        confidence: result.confidence,
        top_factors: result.top_factors,
        recommendations: recs,
        ...(profileId ? { profile_id: profileId } : {}),
      } as any);
      loadHistory();
    }

    setIsLoading(false);
  }, [loadHistory]);

  const clearHistory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("prediction_history").delete().eq("user_id", user.id);
    }
    setHistory([]);
  }, []);

  return { history, currentResult, isLoading, makePrediction, setCurrentResult, clearHistory, loadHistory };
}
