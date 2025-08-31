-- Migration: Add equations progress and session completions
-- Creates tables, indexes, trigger, and initializes default row

-- Equations progress tracking (single row)
CREATE TABLE IF NOT EXISTS public.equations_progress (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  current_day INTEGER DEFAULT 1,
  current_category TEXT NOT NULL DEFAULT 'integer' CHECK (current_category IN ('integer','fraction','decimal','negative','percentage')),
  last_session_date TIMESTAMPTZ,
  completed_sessions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equations session completions
CREATE TABLE IF NOT EXISTS public.equations_session_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_type TEXT NOT NULL CHECK (session_type IN ('subitizing1','subitizing2','equations1','equations2')),
  category TEXT NOT NULL CHECK (category IN ('integer','fraction','decimal','negative','percentage')),
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster querying by date
CREATE INDEX IF NOT EXISTS idx_equations_session_completions_date
  ON public.equations_session_completions(completed_at DESC);

-- Trigger function for updated_at (re-use if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger to update updated_at on equations_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_equations_progress_updated_at'
  ) THEN
    CREATE TRIGGER update_equations_progress_updated_at
    BEFORE UPDATE ON public.equations_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- Initialize default row
INSERT INTO public.equations_progress (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Today view for equations sessions
CREATE OR REPLACE VIEW today_equations_sessions AS
SELECT * FROM public.equations_session_completions
WHERE DATE(completed_at) = CURRENT_DATE;

