-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create community_comments table
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create community_post_likes table for user likes
CREATE TABLE public.community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

-- Posts: Anyone can view
CREATE POLICY "Anyone can view posts"
ON public.community_posts FOR SELECT
USING (true);

-- Posts: Authenticated users can create
CREATE POLICY "Authenticated users can create posts"
ON public.community_posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Posts: Users can update their own
CREATE POLICY "Users can update own posts"
ON public.community_posts FOR UPDATE
USING (auth.uid() = user_id);

-- Posts: Users can delete their own
CREATE POLICY "Users can delete own posts"
ON public.community_posts FOR DELETE
USING (auth.uid() = user_id);

-- Comments: Anyone can view
CREATE POLICY "Anyone can view comments"
ON public.community_comments FOR SELECT
USING (true);

-- Comments: Authenticated users can create
CREATE POLICY "Authenticated users can create comments"
ON public.community_comments FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Comments: Users can update their own
CREATE POLICY "Users can update own comments"
ON public.community_comments FOR UPDATE
USING (auth.uid() = user_id);

-- Comments: Users can delete their own
CREATE POLICY "Users can delete own comments"
ON public.community_comments FOR DELETE
USING (auth.uid() = user_id);

-- Post likes: Authenticated users can manage
CREATE POLICY "Authenticated users can like posts"
ON public.community_post_likes FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can unlike their likes"
ON public.community_post_likes FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes"
ON public.community_post_likes FOR SELECT
USING (true);

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_community_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_timestamp
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_timestamp();

CREATE TRIGGER update_comments_timestamp
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_timestamp();

-- Auto-update likes count on post when a like is added/removed
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET likes_count = (SELECT COUNT(*) FROM public.community_post_likes WHERE post_id = NEW.post_id)
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET likes_count = (SELECT COUNT(*) FROM public.community_post_likes WHERE post_id = OLD.post_id)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_post_likes_count
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_likes_count();
