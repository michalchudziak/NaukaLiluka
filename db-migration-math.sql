-- Migration: Add Math Learning Support
-- This migration adds tables and functions for math learning progress tracking

-- Math progress tracking (single row table)
CREATE TABLE IF NOT EXISTS public.math_progress (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    completed_days INTEGER[] DEFAULT '{}',
    last_practice_date DATE DEFAULT NULL,
    last_day_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Math session completions
CREATE TABLE IF NOT EXISTS public.math_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_name TEXT NOT NULL CHECK (session_name IN ('session1', 'session2')),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_math_sessions_completed ON public.math_sessions(completed_at DESC);

-- Add trigger for updated_at timestamp on math_progress
CREATE TRIGGER update_math_progress_updated_at BEFORE UPDATE ON public.math_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize default data
INSERT INTO public.math_progress (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create helper views for math tables
CREATE OR REPLACE VIEW today_math_completions AS
SELECT * FROM public.math_sessions
WHERE DATE(completed_at) = CURRENT_DATE;

-- Migration verification
DO $$
BEGIN
    -- Check if all required tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'math_progress') THEN
        RAISE EXCEPTION 'Table math_progress was not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'math_sessions') THEN
        RAISE EXCEPTION 'Table math_sessions was not created';
    END IF;
    
    RAISE NOTICE 'Math learning support migration completed successfully';
END;
$$;