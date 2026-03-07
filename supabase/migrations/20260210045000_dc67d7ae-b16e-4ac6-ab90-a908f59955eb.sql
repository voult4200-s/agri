
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  mobile_number TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  language_preference TEXT DEFAULT 'English',
  state TEXT,
  district TEXT,
  village TEXT,
  pin_code TEXT,
  farm_size NUMERIC,
  farm_size_unit TEXT DEFAULT 'Acres',
  primary_crops TEXT[],
  soil_type TEXT,
  ph_level NUMERIC,
  irrigation_type TEXT,
  bank_account_name TEXT,
  bank_name TEXT,
  account_number_last4 TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  gstin TEXT,
  business_name TEXT,
  theme_preference TEXT DEFAULT 'light',
  font_size TEXT DEFAULT 'normal',
  high_contrast BOOLEAN DEFAULT false,
  notify_weather BOOLEAN DEFAULT true,
  notify_price BOOLEAN DEFAULT true,
  notify_orders BOOLEAN DEFAULT true,
  notify_storage BOOLEAN DEFAULT true,
  notify_community BOOLEAN DEFAULT true,
  notify_marketing BOOLEAN DEFAULT false,
  notify_email_weekly BOOLEAN DEFAULT true,
  notify_email_orders BOOLEAN DEFAULT true,
  notify_sms_critical BOOLEAN DEFAULT true,
  notify_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
