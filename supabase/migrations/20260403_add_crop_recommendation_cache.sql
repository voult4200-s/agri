-- Cache table for crop recommendation results based on repeated farm input combinations
CREATE TABLE IF NOT EXISTS public.crop_recommendation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  location TEXT,
  soil_type TEXT,
  budget NUMERIC,
  response_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crop_recommendation_cache_expires_at
  ON public.crop_recommendation_cache (expires_at);

CREATE INDEX IF NOT EXISTS idx_crop_recommendation_cache_lookup
  ON public.crop_recommendation_cache (location, soil_type, budget);

-- Block direct client access; only service-role server calls should use this table.
ALTER TABLE public.crop_recommendation_cache ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_crop_recommendation_cache_updated_at
  ON public.crop_recommendation_cache;

CREATE TRIGGER update_crop_recommendation_cache_updated_at
  BEFORE UPDATE ON public.crop_recommendation_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
