  -- Enable UUID extension for primary keys
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Settings table (single row table)
  CREATE TABLE public.settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      reading_no_rep_words INTEGER DEFAULT 3,
      reading_no_rep_sentences INTEGER DEFAULT 3,
      reading_interval_words INTEGER DEFAULT 1500,
      reading_interval_sentences INTEGER DEFAULT 2500,
      reading_allow_all_books BOOLEAN DEFAULT true,
      reading_word_spacing INTEGER DEFAULT 1,
      drawings_show_captions BOOLEAN DEFAULT true,
      drawings_interval INTEGER DEFAULT 1500,
      drawings_random_order BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Book progress tracking
  CREATE TABLE public.book_progress (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      book_id TEXT NOT NULL UNIQUE,
      completed_word_triples INTEGER[] DEFAULT '{}',
      completed_sentence_triples INTEGER[] DEFAULT '{}',
      is_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Daily reading plans
  CREATE TABLE public.daily_plans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      book_id TEXT NOT NULL,
      selected_word_triple_index INTEGER NOT NULL,
      selected_sentence_triple_index INTEGER NOT NULL,
      session1_content JSONB NOT NULL,
      session2_content JSONB NOT NULL,
      session3_content JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Book track session completions
  CREATE TABLE public.book_track_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      daily_plan_id UUID REFERENCES public.daily_plans(id) ON DELETE
  CASCADE,
      session_name TEXT NOT NULL CHECK (session_name IN ('session1',
  'session2', 'session3')),
      content_type TEXT NOT NULL CHECK (content_type IN ('words',
  'sentences')),
      completed_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- No-repetition progress tracking
  CREATE TABLE public.no_rep_progress (
      id INTEGER PRIMARY KEY CHECK (id IN (1, 2)),
      content_type TEXT NOT NULL UNIQUE CHECK (content_type IN ('words',
  'sentences')),
      displayed_items TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- No-repetition completion timestamps
  CREATE TABLE public.no_rep_completions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      content_type TEXT NOT NULL CHECK (content_type IN ('words',
  'sentences')),
      completed_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Drawing presentations tracking
  CREATE TABLE public.drawing_presentations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      set_title TEXT NOT NULL,
      presented_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Create indexes for efficient queries
  CREATE INDEX idx_daily_plans_created ON public.daily_plans(created_at
  DESC);
  CREATE INDEX idx_book_track_sessions_completed ON
  public.book_track_sessions(completed_at DESC);
  CREATE INDEX idx_no_rep_completions_date ON
  public.no_rep_completions(completed_at DESC);
  CREATE INDEX idx_drawing_presentations_date ON
  public.drawing_presentations(presented_at DESC);

  -- Triggers for updated_at timestamps
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language plpgsql;

  CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON
  public.settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_book_progress_updated_at BEFORE UPDATE ON
  public.book_progress
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_no_rep_progress_updated_at BEFORE UPDATE ON
  public.no_rep_progress
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- Initialize default data
  INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.no_rep_progress (id, content_type) VALUES
      (1, 'words'),
      (2, 'sentences')
  ON CONFLICT DO NOTHING;

  -- Helper views for common queries
  CREATE VIEW today_book_track_completions AS
  SELECT * FROM public.book_track_sessions
  WHERE DATE(completed_at) = CURRENT_DATE;

  CREATE VIEW today_no_rep_completions AS
  SELECT * FROM public.no_rep_completions
  WHERE DATE(completed_at) = CURRENT_DATE;

  CREATE VIEW today_drawing_presentations AS
  SELECT * FROM public.drawing_presentations
  WHERE DATE(presented_at) = CURRENT_DATE;

  CREATE VIEW latest_daily_plan AS
  SELECT * FROM public.daily_plans
  ORDER BY created_at DESC
  LIMIT 1;

  -- Function to check if daily plan is for today
  CREATE OR REPLACE FUNCTION is_daily_plan_today()
  RETURNS BOOLEAN AS $$
  BEGIN
      RETURN EXISTS (
          SELECT 1 FROM public.daily_plans
          WHERE DATE(created_at) = CURRENT_DATE
      );
  END;
  $$ language plpgsql;

  -- Function to get today's book track completion status
  CREATE OR REPLACE FUNCTION get_today_book_track_status()
  RETURNS TABLE (
      session1_words BOOLEAN,
      session1_sentences BOOLEAN,
      session2_words BOOLEAN,
      session2_sentences BOOLEAN,
      session3_words BOOLEAN,
      session3_sentences BOOLEAN
  ) AS $$
  BEGIN
      RETURN QUERY
      SELECT
          EXISTS(SELECT 1 FROM today_book_track_completions WHERE
  session_name = 'session1' AND content_type = 'words'),
          EXISTS(SELECT 1 FROM today_book_track_completions WHERE
  session_name = 'session1' AND content_type = 'sentences'),
          EXISTS(SELECT 1 FROM today_book_track_completions WHERE
  session_name = 'session2' AND content_type = 'words'),
          EXISTS(SELECT 1 FROM today_book_track_completions WHERE
  session_name = 'session2' AND content_type = 'sentences'),
          EXISTS(SELECT 1 FROM today_book_track_completions WHERE
  session_name = 'session3' AND content_type = 'words'),
          EXISTS(SELECT 1 FROM today_book_track_completions WHERE
  session_name = 'session3' AND content_type = 'sentences');
  END;
  $$ language plpgsql;

  -- Function to get today's no-rep completion status
  CREATE OR REPLACE FUNCTION get_today_no_rep_status()
  RETURNS TABLE (
      words_completed BOOLEAN,
      sentences_completed BOOLEAN
  ) AS $$
  BEGIN
      RETURN QUERY
      SELECT
          EXISTS(SELECT 1 FROM today_no_rep_completions WHERE content_type
  = 'words'),
          EXISTS(SELECT 1 FROM today_no_rep_completions WHERE content_type
  = 'sentences');
  END;
  $$ language plpgsql;

  -- Function to get drawing presentation count for a specific set today
  CREATE OR REPLACE FUNCTION get_today_drawing_count(p_set_title TEXT)
  RETURNS INTEGER AS $$
  BEGIN
      RETURN (
          SELECT COUNT(*)::INTEGER
          FROM today_drawing_presentations
          WHERE set_title = p_set_title
      );
  END;
  $$ language plpgsql;