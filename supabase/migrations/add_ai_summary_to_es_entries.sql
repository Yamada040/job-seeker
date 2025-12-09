-- Add new columns to es_entries table for company information and AI functionality
ALTER TABLE public.es_entries 
ADD COLUMN IF NOT EXISTS ai_summary jsonb,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_url text,
ADD COLUMN IF NOT EXISTS selection_status text,
ADD COLUMN IF NOT EXISTS memo text;