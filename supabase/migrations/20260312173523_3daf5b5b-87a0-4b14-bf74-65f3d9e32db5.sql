
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create prediction_history table
CREATE TABLE public.prediction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  age INTEGER NOT NULL,
  gender INTEGER NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  ap_hi INTEGER NOT NULL,
  ap_lo INTEGER NOT NULL,
  cholesterol INTEGER NOT NULL,
  glucose INTEGER NOT NULL,
  smoke INTEGER NOT NULL,
  alco INTEGER NOT NULL,
  active INTEGER NOT NULL,
  prediction TEXT NOT NULL,
  probability NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  top_factors JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for prediction_history
ALTER TABLE public.prediction_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own predictions" ON public.prediction_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" ON public.prediction_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions" ON public.prediction_history
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
