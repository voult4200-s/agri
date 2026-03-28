-- Add community_comment_likes table
CREATE TABLE IF NOT EXISTS public.community_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_comment_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view comment likes"
ON public.community_comment_likes FOR SELECT
USING (true);

-- Authenticated users can like
CREATE POLICY "Authenticated users can like comments"
ON public.community_comment_likes FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Users can unlike
CREATE POLICY "Users can unlike comments"
ON public.community_comment_likes FOR DELETE
USING (auth.uid() = user_id);

-- Function to increment post views
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.community_posts
  SET views_count = views_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-update comment likes count
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_comments
    SET likes_count = (SELECT COUNT(*) FROM public.community_comment_likes WHERE comment_id = NEW.comment_id)
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_comments
    SET likes_count = (SELECT COUNT(*) FROM public.community_comment_likes WHERE comment_id = OLD.comment_id)
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER IF NOT EXISTS update_comment_likes_count
  AFTER INSERT OR DELETE ON public.community_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_likes_count();
