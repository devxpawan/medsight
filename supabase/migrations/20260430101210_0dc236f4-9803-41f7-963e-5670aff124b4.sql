
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Medicines
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  illness TEXT NOT NULL,
  notes TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medicines are viewable by everyone"
  ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert medicines"
  ON public.medicines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medicines"
  ON public.medicines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medicines"
  ON public.medicines FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX medicines_illness_idx ON public.medicines (illness);
CREATE INDEX medicines_created_at_idx ON public.medicines (created_at DESC);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('medicine-images', 'medicine-images', true);

CREATE POLICY "Medicine images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'medicine-images');
CREATE POLICY "Authenticated users can upload medicine images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'medicine-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own medicine images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'medicine-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own medicine images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'medicine-images' AND auth.uid()::text = (storage.foldername(name))[1]);
