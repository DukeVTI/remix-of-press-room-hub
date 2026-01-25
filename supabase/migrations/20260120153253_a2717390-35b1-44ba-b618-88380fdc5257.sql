-- Press Room Publisher Database Schema
-- Complete schema for multi-user blogging platform

-- ============================================
-- HELPER FUNCTION FOR UPDATED_AT (CREATE FIRST)
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- ENUMS
-- ============================================

-- Account status enum
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'deactivated');

-- Blog status enum
CREATE TYPE public.blog_status AS ENUM ('active', 'hidden', 'deleted');

-- Admin status enum
CREATE TYPE public.admin_status AS ENUM ('pending', 'active', 'removed');

-- Post status enum
CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'hidden', 'deleted');

-- Media type enum
CREATE TYPE public.media_type AS ENUM ('image', 'video', 'audio');

-- Reaction type enum
CREATE TYPE public.reaction_type AS ENUM ('approve', 'disapprove');

-- Content status enum
CREATE TYPE public.content_status AS ENUM ('active', 'hidden', 'deleted');

-- Reported item type enum
CREATE TYPE public.reported_item_type AS ENUM ('post', 'comment', 'blog', 'user');

-- Report reason enum
CREATE TYPE public.report_reason AS ENUM (
  'misleading', 'falsehood', 'wrong_impression', 'cyber_bully', 'scam', 
  'cursing', 'abuse', 'discrimination', 'bad_profiling', 'propaganda', 
  'instigating', 'miseducation', 'disrespectful', 'intolerance', 'others'
);

-- Report status enum
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved');

-- Celebration type enum
CREATE TYPE public.celebration_type AS ENUM ('account_anniversary', 'birthday');

-- Celebration status enum
CREATE TYPE public.celebration_status AS ENUM ('active', 'expired');

-- ============================================
-- PROFILES TABLE (Primary User Accounts)
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  screen_name TEXT UNIQUE,
  date_of_birth DATE NOT NULL,
  profile_photo_url TEXT,
  bio TEXT,
  hobbies TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  account_status public.account_status NOT NULL DEFAULT 'active',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_profiles_screen_name ON public.profiles(screen_name) WHERE screen_name IS NOT NULL;

-- ============================================
-- BLOG CATEGORIES REFERENCE TABLE
-- ============================================

CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.blog_categories (name, slug) VALUES
  ('News', 'news'), ('Gossip', 'gossip'), ('Cooking', 'cooking'), ('Lifestyle', 'lifestyle'),
  ('Traveling', 'traveling'), ('Fiction', 'fiction'), ('Movie Reviews', 'movie-reviews'),
  ('Automobile', 'automobile'), ('Real Estate', 'real-estate'), ('Fashion', 'fashion'),
  ('Laws And Constitution', 'laws-and-constitution'), ('Book Reviews', 'book-reviews'),
  ('Editorials', 'editorials'), ('Court And Crimes', 'court-and-crimes'),
  ('Entrepreneurship', 'entrepreneurship'), ('Public Speaking', 'public-speaking'),
  ('International Trade', 'international-trade'), ('Business Operation', 'business-operation'),
  ('Financial Management', 'financial-management'), ('Government And Governance', 'government-and-governance'),
  ('Music Reviews', 'music-reviews'), ('Security', 'security'), ('Farming', 'farming'),
  ('Animal Life', 'animal-life'), ('Sport News', 'sport-news'), ('Daily Diary', 'daily-diary'),
  ('Kiddies', 'kiddies'), ('Romance', 'romance'), ('Healthcare', 'healthcare'),
  ('Campus Life', 'campus-life'), ('Cultural Festivals', 'cultural-festivals'),
  ('Comparison', 'comparison'), ('Love Life', 'love-life'), ('Community Development', 'community-development'),
  ('Drama', 'drama'), ('Music', 'music'), ('Politics', 'politics'), ('Public Education', 'public-education'),
  ('Do It Yourself', 'do-it-yourself'), ('Technology', 'technology'), ('Entertainment', 'entertainment'),
  ('Adventures', 'adventures'), ('Comedy', 'comedy'), ('Documentary', 'documentary'),
  ('Folktales', 'folktales'), ('Commentary', 'commentary'), ('Satire', 'satire'),
  ('Story Telling', 'story-telling'), ('Editorial Review', 'editorial-review'),
  ('Reportage', 'reportage'), ('Variety', 'variety'), ('True Life', 'true-life'),
  ('Poetry', 'poetry'), ('Magazine', 'magazine'), ('Science', 'science'), ('Fun Fact', 'fun-fact'),
  ('Religious', 'religious'), ('Inventions', 'inventions'), ('Fact Checking', 'fact-checking'),
  ('Culture And Traditions', 'culture-and-traditions'), ('Promotions', 'promotions'),
  ('Food', 'food'), ('Travels And Tourism', 'travels-and-tourism'), ('Language', 'language'),
  ('Others', 'others');

-- ============================================
-- BLOG LANGUAGES REFERENCE TABLE
-- ============================================

CREATE TABLE public.blog_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.blog_languages (name, code) VALUES
  ('English', 'en'), ('Yoruba', 'yo'), ('Igbo', 'ig'), ('Hausa', 'ha'),
  ('French', 'fr'), ('Spanish', 'es'), ('Arabic', 'ar'), ('Chinese', 'zh'),
  ('Swahili', 'sw'), ('Pidgin', 'pcm'), ('Others', 'other');

-- ============================================
-- BLOGS TABLE (Blog Accounts)
-- ============================================

CREATE TABLE public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blog_name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id),
  custom_category TEXT CHECK (char_length(custom_category) <= 50),
  languages UUID[] NOT NULL DEFAULT '{}',
  custom_language TEXT CHECK (char_length(custom_language) <= 50),
  description TEXT NOT NULL,
  profile_photo_url TEXT NOT NULL,
  follower_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  status public.blog_status NOT NULL DEFAULT 'active'
);

CREATE INDEX idx_blogs_owner ON public.blogs(owner_id);
CREATE INDEX idx_blogs_slug ON public.blogs(slug);
CREATE INDEX idx_blogs_category ON public.blogs(category_id);
CREATE INDEX idx_blogs_status ON public.blogs(status) WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.blog_name, '[^a-zA-Z0-9]+', '-', 'g'));
  NEW.slug := trim(both '-' from NEW.slug);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_blog_slug
  BEFORE INSERT OR UPDATE OF blog_name ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_blog_slug();

-- ============================================
-- BLOG ADMINS TABLE
-- ============================================

CREATE TABLE public.blog_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_first_name TEXT NOT NULL,
  admin_last_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.admin_status NOT NULL DEFAULT 'pending',
  invitation_sent BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (blog_id, admin_email)
);

CREATE INDEX idx_blog_admins_blog ON public.blog_admins(blog_id);
CREATE INDEX idx_blog_admins_user ON public.blog_admins(admin_user_id) WHERE admin_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.check_admin_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.blog_admins WHERE blog_id = NEW.blog_id AND status != 'removed') >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 administrators allowed per blog';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER enforce_admin_limit
  BEFORE INSERT ON public.blog_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.check_admin_limit();

-- ============================================
-- POSTS TABLE
-- ============================================

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  headline TEXT NOT NULL CHECK (char_length(headline) <= 150),
  subtitle TEXT CHECK (char_length(subtitle) <= 250),
  byline TEXT NOT NULL CHECK (char_length(byline) <= 100),
  content TEXT NOT NULL CHECK (char_length(content) <= 2500),
  status public.post_status NOT NULL DEFAULT 'draft',
  comments_locked BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  approval_count INTEGER NOT NULL DEFAULT 0,
  disapproval_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_posts_blog ON public.posts(blog_id);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_published ON public.posts(published_at DESC) WHERE status = 'published';

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_post_published_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_published_at();

-- ============================================
-- MEDIA TABLE
-- ============================================

CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_type public.media_type NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) <= 500),
  file_size INTEGER,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_post ON public.media(post_id);

-- ============================================
-- FOLLOWS TABLE
-- ============================================

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, blog_id)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_blog ON public.follows(blog_id);

CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blogs SET follower_count = follower_count + 1 WHERE id = NEW.blog_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blogs SET follower_count = follower_count - 1 WHERE id = OLD.blog_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_blog_follower_count
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follower_count();

-- ============================================
-- POST REACTIONS TABLE
-- ============================================

CREATE TABLE public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reaction_type public.reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

CREATE INDEX idx_post_reactions_post ON public.post_reactions(post_id);
CREATE INDEX idx_post_reactions_user ON public.post_reactions(user_id);

CREATE OR REPLACE FUNCTION public.update_post_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'approve' THEN
      UPDATE public.posts SET approval_count = approval_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET disapproval_count = disapproval_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'approve' THEN
      UPDATE public.posts SET approval_count = approval_count - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE public.posts SET disapproval_count = disapproval_count - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.reaction_type != NEW.reaction_type THEN
    IF NEW.reaction_type = 'approve' THEN
      UPDATE public.posts SET approval_count = approval_count + 1, disapproval_count = disapproval_count - 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET approval_count = approval_count - 1, disapproval_count = disapproval_count + 1 WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_post_reactions
  AFTER INSERT OR UPDATE OR DELETE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

-- ============================================
-- COMMENTS TABLE
-- ============================================

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  approval_count INTEGER NOT NULL DEFAULT 0,
  disapproval_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_post_comment_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_count();

-- ============================================
-- COMMENT REACTIONS TABLE
-- ============================================

CREATE TABLE public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reaction_type public.reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, comment_id)
);

CREATE INDEX idx_comment_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user ON public.comment_reactions(user_id);

CREATE OR REPLACE FUNCTION public.update_comment_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'approve' THEN
      UPDATE public.comments SET approval_count = approval_count + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE public.comments SET disapproval_count = disapproval_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'approve' THEN
      UPDATE public.comments SET approval_count = approval_count - 1 WHERE id = OLD.comment_id;
    ELSE
      UPDATE public.comments SET disapproval_count = disapproval_count - 1 WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_comment_reactions
  AFTER INSERT OR DELETE ON public.comment_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_reaction_counts();

-- ============================================
-- REPORTS TABLE
-- ============================================

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_item_type public.reported_item_type NOT NULL,
  reported_item_id UUID NOT NULL,
  reason_category public.report_reason NOT NULL,
  custom_reason TEXT CHECK (char_length(custom_reason) <= 250),
  status public.report_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_status ON public.reports(status) WHERE status = 'pending';
CREATE INDEX idx_reports_item ON public.reports(reported_item_type, reported_item_id);

-- ============================================
-- CELEBRATION POSTS TABLE
-- ============================================

CREATE TABLE public.celebration_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  celebration_type public.celebration_type NOT NULL,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  post_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status public.celebration_status NOT NULL DEFAULT 'active'
);

CREATE INDEX idx_celebration_posts_user ON public.celebration_posts(user_id);
CREATE INDEX idx_celebration_posts_expires ON public.celebration_posts(expires_at) WHERE status = 'active';

-- ============================================
-- SECURITY DEFINER FUNCTIONS FOR ROLE CHECKS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_blog_owner(_user_id UUID, _blog_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blogs
    WHERE id = _blog_id AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_blog_admin(_user_id UUID, _blog_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blog_admins
    WHERE blog_id = _blog_id 
      AND admin_user_id = _user_id 
      AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_blog(_user_id UUID, _blog_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_blog_owner(_user_id, _blog_id) 
      OR public.is_blog_admin(_user_id, _blog_id)
$$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_posts ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- BLOG CATEGORIES
CREATE POLICY "Categories are publicly viewable" ON public.blog_categories FOR SELECT USING (true);

-- BLOG LANGUAGES
CREATE POLICY "Languages are publicly viewable" ON public.blog_languages FOR SELECT USING (true);

-- BLOGS
CREATE POLICY "Active blogs are publicly viewable" ON public.blogs FOR SELECT USING (status = 'active' OR owner_id = auth.uid());
CREATE POLICY "Authenticated users can create blogs" ON public.blogs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Blog owners can update their blogs" ON public.blogs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Blog owners can delete their blogs" ON public.blogs FOR DELETE USING (auth.uid() = owner_id);

-- BLOG ADMINS
CREATE POLICY "Blog admins visible to blog owner and admins" ON public.blog_admins
  FOR SELECT USING (public.is_blog_owner(auth.uid(), blog_id) OR admin_user_id = auth.uid());
CREATE POLICY "Blog owners can add admins" ON public.blog_admins
  FOR INSERT WITH CHECK (auth.uid() = assigned_by AND public.is_blog_owner(auth.uid(), blog_id));
CREATE POLICY "Blog owners can update admins" ON public.blog_admins
  FOR UPDATE USING (public.is_blog_owner(auth.uid(), blog_id));
CREATE POLICY "Blog owners can remove admins" ON public.blog_admins
  FOR DELETE USING (public.is_blog_owner(auth.uid(), blog_id));

-- POSTS
CREATE POLICY "Published posts are publicly viewable" ON public.posts
  FOR SELECT USING (status = 'published' OR public.can_manage_blog(auth.uid(), blog_id));
CREATE POLICY "Blog managers can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id AND public.can_manage_blog(auth.uid(), blog_id));
CREATE POLICY "Blog managers can update posts" ON public.posts
  FOR UPDATE USING (public.can_manage_blog(auth.uid(), blog_id));
CREATE POLICY "Blog managers can delete posts" ON public.posts
  FOR DELETE USING (public.can_manage_blog(auth.uid(), blog_id));

-- MEDIA
CREATE POLICY "Media viewable with post" ON public.media
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND (p.status = 'published' OR public.can_manage_blog(auth.uid(), p.blog_id))));
CREATE POLICY "Blog managers can add media" ON public.media
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.can_manage_blog(auth.uid(), p.blog_id)));
CREATE POLICY "Blog managers can update media" ON public.media
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.can_manage_blog(auth.uid(), p.blog_id)));
CREATE POLICY "Blog managers can delete media" ON public.media
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.can_manage_blog(auth.uid(), p.blog_id)));

-- FOLLOWS
CREATE POLICY "Follows are publicly viewable" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- POST REACTIONS
CREATE POLICY "Post reactions are publicly viewable" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react to posts" ON public.post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their reactions" ON public.post_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their reactions" ON public.post_reactions FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "Active comments are publicly viewable" ON public.comments FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can comment" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.status = 'published' AND p.comments_locked = false));
CREATE POLICY "Users can update their comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- COMMENT REACTIONS
CREATE POLICY "Comment reactions are publicly viewable" ON public.comment_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react to comments" ON public.comment_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their comment reactions" ON public.comment_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their comment reactions" ON public.comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- REPORTS
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Authenticated users can submit reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- CELEBRATION POSTS
CREATE POLICY "Active celebrations are publicly viewable" ON public.celebration_posts FOR SELECT USING (status = 'active');
CREATE POLICY "System can create celebration posts" ON public.celebration_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CREATE PROFILE ON USER SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, date_of_birth)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE - INTERVAL '18 years')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();