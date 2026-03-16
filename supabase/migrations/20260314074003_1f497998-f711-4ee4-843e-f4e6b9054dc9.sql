
-- Create health_profiles table
CREATE TABLE public.health_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  relation TEXT NOT NULL DEFAULT 'Self',
  gender INTEGER NOT NULL DEFAULT 1,
  age INTEGER NOT NULL DEFAULT 30,
  height NUMERIC NOT NULL DEFAULT 170,
  weight NUMERIC NOT NULL DEFAULT 70,
  default_ap_hi INTEGER NOT NULL DEFAULT 120,
  default_ap_lo INTEGER NOT NULL DEFAULT 80,
  default_cholesterol INTEGER NOT NULL DEFAULT 1,
  default_glucose INTEGER NOT NULL DEFAULT 1,
  default_smoke INTEGER NOT NULL DEFAULT 0,
  default_alco INTEGER NOT NULL DEFAULT 0,
  default_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for health_profiles
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profiles" ON public.health_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON public.health_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON public.health_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles" ON public.health_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add profile_id to prediction_history (nullable for backward compat)
ALTER TABLE public.prediction_history
  ADD COLUMN profile_id UUID REFERENCES public.health_profiles(id) ON DELETE SET NULL;
