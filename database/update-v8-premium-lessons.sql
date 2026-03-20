-- v8 premium lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS premium_start_date TIMESTAMPTZ;

-- Drop duration if exists
DO $$ 
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='lessons' AND column_name='duration') THEN
    ALTER TABLE public.lessons DROP COLUMN duration;
  END IF;
END $$;

NOTIFY pgrst, 'reload_schema';
