-- Atualização Schema V2 - SBH Premium

-- Adicionar controle de plano nos usuários
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium'));

-- Adicionar controle de vencimento nas aulas
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS available_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_premium_after_expiration BOOLEAN DEFAULT true;

-- Adicionar tabela de configuração da Home Dinâmica (Netflix)
CREATE TABLE IF NOT EXISTS public.home_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir chaves padrão para a home
INSERT INTO public.home_config (key, value) VALUES
('hero_banner', '{"title": "Especialização em Suturas", "subtitle": "Acesso premium às técnicas mais avançadas...", "imageUrl": "https://images.unsplash.com/photo-1551076805-e1869043e560?auto=format&fit=crop&w=1200", "buttonText": "Assistir Agora", "courseId": null}'::jsonb),
('sections_order', '["continue_watching", "my_courses", "recommended", "premium_highlights"]'::jsonb),
('active_sections', '{"continue_watching": true, "my_courses": true, "recommended": true, "premium_highlights": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
