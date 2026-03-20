-- v9 user plan types
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium'));

-- Update existing students to basic if null
UPDATE public.users SET plan_type = 'basic' WHERE plan_type IS NULL AND role = 'student';

NOTIFY pgrst, 'reload_schema';
