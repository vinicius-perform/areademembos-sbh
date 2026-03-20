-- Atualização Schema V4 - Remoção de Cursos e Single Membership Area

-- 1. Desvincular Módulos de Cursos
ALTER TABLE public.modules DROP CONSTRAINT IF EXISTS modules_course_id_fkey;
ALTER TABLE public.modules ALTER COLUMN course_id DROP NOT NULL;

-- 2. Adicionar novas colunas em Módulos para abrigar o conteúdo principal
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS cover_image_vertical TEXT;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS banner_image_horizontal TEXT;

-- O status já foi adicionado na v3
