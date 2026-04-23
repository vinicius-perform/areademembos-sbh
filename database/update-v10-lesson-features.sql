-- v10 lesson features: release date and attachments
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS release_date TIMESTAMPTZ;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload_schema';
