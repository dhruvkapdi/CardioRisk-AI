import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let action = "dashboard";
    try {
      const body = await req.json();
      if (body?.action) action = body.action;
    } catch {
      // no body = default dashboard
    }

    if (action === "users") return await handleUsers(adminClient, corsHeaders);
    if (action === "predictions") return await handlePredictions(adminClient, corsHeaders);
    if (action === "health_profiles") return await handleHealthProfiles(adminClient, corsHeaders);

    return await handleDashboard(adminClient, corsHeaders);
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleUsers(adminClient: any, corsHeaders: Record<string, string>) {
  const { data: profiles } = await adminClient.from("profiles").select("*");
  const { data: roles } = await adminClient.from("user_roles").select("user_id, role");
  const { data: predictions } = await adminClient.from("prediction_history").select("user_id");

  const roleMap: Record<string, string> = {};
  (roles || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });

  const predCountMap: Record<string, number> = {};
  (predictions || []).forEach((p: any) => {
    predCountMap[p.user_id] = (predCountMap[p.user_id] || 0) + 1;
  });

  const users = (profiles || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    created_at: p.created_at,
    role: roleMap[p.id] || "user",
    predictionCount: predCountMap[p.id] || 0,
  }));

  return new Response(JSON.stringify({ users }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handlePredictions(adminClient: any, corsHeaders: Record<string, string>) {
  const { data: preds } = await adminClient
    .from("prediction_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const { data: profilesList } = await adminClient.from("profiles").select("id, email");
  const { data: healthProfiles } = await adminClient.from("health_profiles").select("id, profile_name");

  const emailMap: Record<string, string> = {};
  (profilesList || []).forEach((p: any) => { emailMap[p.id] = p.email; });

  const hpMap: Record<string, string> = {};
  (healthProfiles || []).forEach((p: any) => { hpMap[p.id] = p.profile_name; });

  const predictions = (preds || []).map((p: any) => ({
    id: p.id,
    user_email: emailMap[p.user_id] || null,
    profile_name: p.profile_id ? (hpMap[p.profile_id] || null) : null,
    age: p.age,
    gender: p.gender,
    bmi: p.bmi,
    ap_hi: p.ap_hi,
    ap_lo: p.ap_lo,
    prediction: p.prediction,
    probability: p.probability,
    created_at: p.created_at,
  }));

  return new Response(JSON.stringify({ predictions }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleHealthProfiles(adminClient: any, corsHeaders: Record<string, string>) {
  const { data: hps } = await adminClient
    .from("health_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profilesList } = await adminClient.from("profiles").select("id, email");
  const { data: predictions } = await adminClient.from("prediction_history").select("profile_id");

  const emailMap: Record<string, string> = {};
  (profilesList || []).forEach((p: any) => { emailMap[p.id] = p.email; });

  const predCountMap: Record<string, number> = {};
  (predictions || []).forEach((p: any) => {
    if (p.profile_id) predCountMap[p.profile_id] = (predCountMap[p.profile_id] || 0) + 1;
  });

  const profiles = (hps || []).map((p: any) => ({
    id: p.id,
    user_email: emailMap[p.user_id] || null,
    profile_name: p.profile_name,
    relation: p.relation,
    age: p.age,
    gender: p.gender,
    height: Number(p.height),
    weight: Number(p.weight),
    default_ap_hi: p.default_ap_hi,
    default_ap_lo: p.default_ap_lo,
    prediction_count: predCountMap[p.id] || 0,
    created_at: p.created_at,
  }));

  return new Response(JSON.stringify({ profiles }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleDashboard(adminClient: any, corsHeaders: Record<string, string>) {
  const { data: predictions, error: predErr } = await adminClient
    .from("prediction_history")
    .select("*")
    .order("created_at", { ascending: true });

  if (predErr) throw predErr;

  const { count: totalUsers } = await adminClient
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const allPreds = predictions || [];
  const totalPredictions = allPreds.length;
  const highRisk = allPreds.filter((p: any) => p.prediction === "High Risk").length;
  const lowRisk = allPreds.filter((p: any) => p.prediction === "Low Risk").length;

  const avg = (arr: number[]) =>
    arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;

  const avgBmi = avg(allPreds.map((p: any) => Number(p.bmi)));
  const avgSystolic = avg(allPreds.map((p: any) => Number(p.ap_hi)));
  const avgDiastolic = avg(allPreds.map((p: any) => Number(p.ap_lo)));
  const avgCholesterol = avg(allPreds.map((p: any) => Number(p.cholesterol)));

  const ageBuckets: Record<string, number> = {
    "20-29": 0, "30-39": 0, "40-49": 0, "50-59": 0, "60-69": 0, "70+": 0,
  };
  allPreds.forEach((p: any) => {
    const age = Number(p.age);
    if (age < 30) ageBuckets["20-29"]++;
    else if (age < 40) ageBuckets["30-39"]++;
    else if (age < 50) ageBuckets["40-49"]++;
    else if (age < 60) ageBuckets["50-59"]++;
    else if (age < 70) ageBuckets["60-69"]++;
    else ageBuckets["70+"]++;
  });

  const bmiBuckets: Record<string, number> = {
    "Underweight (<18.5)": 0, "Normal (18.5-25)": 0, "Overweight (25-30)": 0, "Obese (30+)": 0,
  };
  allPreds.forEach((p: any) => {
    const bmi = Number(p.bmi);
    if (bmi < 18.5) bmiBuckets["Underweight (<18.5)"]++;
    else if (bmi < 25) bmiBuckets["Normal (18.5-25)"]++;
    else if (bmi < 30) bmiBuckets["Overweight (25-30)"]++;
    else bmiBuckets["Obese (30+)"]++;
  });

  const trendMap = new Map<string, { total: number; highRisk: number }>();
  allPreds.forEach((p: any) => {
    const date = p.created_at.split("T")[0];
    const entry = trendMap.get(date) || { total: 0, highRisk: 0 };
    entry.total++;
    if (p.prediction === "High Risk") entry.highRisk++;
    trendMap.set(date, entry);
  });
  const riskTrend = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({
      date,
      riskRate: +((val.highRisk / val.total) * 100).toFixed(1),
      predictions: val.total,
    }));

  const factorCount: Record<string, number> = {};
  allPreds.forEach((p: any) => {
    const factors = p.top_factors as string[];
    if (Array.isArray(factors)) {
      factors.forEach((f) => { factorCount[f] = (factorCount[f] || 0) + 1; });
    }
  });
  const topFactors = Object.entries(factorCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([factor, count]) => ({ factor, count }));

  return new Response(
    JSON.stringify({
      totalUsers: totalUsers || 0, totalPredictions, highRisk, lowRisk,
      avgBmi, avgSystolic, avgDiastolic, avgCholesterol,
      ageDistribution: Object.entries(ageBuckets).map(([range, count]) => ({ range, count })),
      bmiDistribution: Object.entries(bmiBuckets).map(([range, count]) => ({ range, count })),
      riskTrend, topFactors,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
