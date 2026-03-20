-- v7 approval flow updates
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- Atualiza usuários já existentes para 'approved' para não barrá-los subitamente
UPDATE public.users SET approval_status = 'approved' WHERE approval_status = 'pending';

-- Permissão do DB: Todo mundo ou service role pode atualizar? 
-- RLS atual de users permite admin update all, select all.
NOTIFY pgrst, 'reload_schema';
