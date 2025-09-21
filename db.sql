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
      drawings_show_facts BOOLEAN DEFAULT false,
      math_equations_interval INTEGER DEFAULT 1500,
      math_equations_equation_count INTEGER DEFAULT 5,
      math_numbers_interval INTEGER DEFAULT 1000,
      math_numbers_number_count INTEGER DEFAULT 10,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Book progress tracking
  CREATE TABLE public.book_progress (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      book_id TEXT NOT NULL UNIQUE,
      -- New schema fields (backward-compatible):
      -- numeric index of the book in the app and human title
      book_index INTEGER,
      book_title TEXT,
      -- unified list of completed day indices (only when both words and sentences are completed that day)
      completed_triples INTEGER[] DEFAULT '{}',
      -- timestamp of the last day when words progressed
      progress_timestamp TIMESTAMPTZ,
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

  -- Math progress tracking (single row table)
  CREATE TABLE public.math_progress (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      current_day INTEGER DEFAULT 1,
      last_session_date TIMESTAMPTZ,
      completed_sessions TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Math session completion tracking
  CREATE TABLE public.math_session_completions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_type TEXT NOT NULL CHECK (session_type IN ('subitizingOrdered', 'subitizingUnordered', 'numbersOrdered', 'numbersUnordered')),
      day_number INTEGER NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW()
  );


  -- Equations progress tracking (single row table)
  CREATE TABLE IF NOT EXISTS public.equations_progress (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      current_day INTEGER DEFAULT 1,
      current_category TEXT NOT NULL DEFAULT 'integer' CHECK (current_category IN ('integer','fraction','decimal','negative','percentage')),
      last_session_date TIMESTAMPTZ,
      completed_sessions TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Equations session completion tracking
  CREATE TABLE IF NOT EXISTS public.equations_session_completions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_type TEXT NOT NULL CHECK (session_type IN ('subitizing1','subitizing2','equations1','equations2')),
      category TEXT NOT NULL CHECK (category IN ('integer','fraction','decimal','negative','percentage')),
      day_number INTEGER NOT NULL,
      completed_at TIMESTAMPTZ DEFAULT NOW()
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
  CREATE INDEX idx_math_session_completions_date ON
  public.math_session_completions(completed_at DESC);
  CREATE INDEX IF NOT EXISTS idx_equations_session_completions_date ON
  public.equations_session_completions(completed_at DESC);

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

  CREATE TRIGGER update_math_progress_updated_at BEFORE UPDATE ON
  public.math_progress
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER IF NOT EXISTS update_equations_progress_updated_at BEFORE UPDATE ON
  public.equations_progress
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- Migration: add math settings columns if missing
  ALTER TABLE public.settings
    ADD COLUMN IF NOT EXISTS math_equations_interval INTEGER DEFAULT 1500;
  ALTER TABLE public.settings
    ADD COLUMN IF NOT EXISTS math_equations_equation_count INTEGER DEFAULT 5;
  ALTER TABLE public.settings
    ADD COLUMN IF NOT EXISTS math_numbers_interval INTEGER DEFAULT 1000;
  ALTER TABLE public.settings
    ADD COLUMN IF NOT EXISTS math_numbers_number_count INTEGER DEFAULT 10;

  -- Migration: extend book_progress with new fields (backward-compatible)
  ALTER TABLE public.book_progress
    ADD COLUMN IF NOT EXISTS book_index INTEGER;
  ALTER TABLE public.book_progress
    ADD COLUMN IF NOT EXISTS book_title TEXT;
  ALTER TABLE public.book_progress
    ADD COLUMN IF NOT EXISTS progress_timestamp TIMESTAMPTZ;

  -- Migration: add unified completed_triples column and backfill from previous separate arrays
  ALTER TABLE public.book_progress
    ADD COLUMN IF NOT EXISTS completed_triples INTEGER[] DEFAULT '{}';

  -- Backfill rule: set completed_triples to intersection of completed_word_triples and completed_sentence_triples
  -- Note: cannot guarantee same-day completion historically; this approximates by requiring both present
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'book_progress' AND column_name = 'completed_word_triples'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'book_progress' AND column_name = 'completed_sentence_triples'
    ) THEN
      UPDATE public.book_progress bp
      SET completed_triples = (
        SELECT COALESCE(
          ARRAY(
            SELECT DISTINCT x
            FROM UNNEST(COALESCE(bp.completed_word_triples, '{}')) AS x
            WHERE x = ANY(COALESCE(bp.completed_sentence_triples, '{}'))
            ORDER BY x
          ),
          '{}'
        )
      )
      WHERE (bp.completed_triples IS NULL OR cardinality(bp.completed_triples) = 0);
    END IF;
  END $$;

  -- Drop legacy columns now that data is unified
  ALTER TABLE public.book_progress
    DROP COLUMN IF EXISTS completed_word_triples,
    DROP COLUMN IF EXISTS completed_sentence_triples;


  -- Initialize default data
  INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.no_rep_progress (id, content_type) VALUES
      (1, 'words'),
      (2, 'sentences')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.math_progress (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.equations_progress (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

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

  CREATE VIEW today_math_sessions AS
  SELECT * FROM public.math_session_completions
  WHERE DATE(completed_at) = CURRENT_DATE;

  CREATE OR REPLACE VIEW today_equations_sessions AS
  SELECT * FROM public.equations_session_completions
  WHERE DATE(completed_at) = CURRENT_DATE;
