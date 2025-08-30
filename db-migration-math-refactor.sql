-- Migration: Refactor math_progress table
-- This migration:
-- 1. Removes current_day column (as it can be derived from completed_days)
-- 2. Adds last_completion_date column to track when the last day was completed

-- Drop current_day column if it exists
ALTER TABLE public.math_progress 
DROP COLUMN IF EXISTS current_day;

-- Add last_completion_date column if it doesn't exist
ALTER TABLE public.math_progress 
ADD COLUMN IF NOT EXISTS last_completion_date DATE DEFAULT NULL;

-- Migration verification
DO $$
BEGIN
    -- Check if current_day column was removed
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'math_progress' 
        AND column_name = 'current_day'
    ) THEN
        RAISE EXCEPTION 'Column current_day was not removed from math_progress table';
    END IF;
    
    -- Check if last_completion_date column was added
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'math_progress' 
        AND column_name = 'last_completion_date'
    ) THEN
        RAISE EXCEPTION 'Column last_completion_date was not added to math_progress table';
    END IF;
    
    RAISE NOTICE 'Math progress table refactored successfully: removed current_day, added last_completion_date';
END;
$$;