-- Atualização Schema V3 - SBH Premium (CRUD Real)

-- 1. Adicionar status de arquivado para os Módulos (Arquivamento Lógico)
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived'));

-- 2. Criar e configurar o Bucket de Uploads para Cursos (Capas e Banners)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('courses', 'courses', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Configurar Políticas de Segurança do Storage (RLS)
-- Permitir que qualquer pessoa veja as imagens (Select)
CREATE POLICY "Public Read Access on courses" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'courses');

-- Permitir que APENAS usuários logados façam Uploads (Insert) nas imagens
CREATE POLICY "Auth Insert Access on courses" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'courses' AND auth.role() = 'authenticated');
