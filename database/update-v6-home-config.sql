-- Script de Atualização V6: Adicionando tabela home_config
-- Esta tabela guarda o estado da "Experiência do Aluno" (Banner, Botão CTA, Ordem de Seções, etc)
-- Para que o Administrador possa alterar a home dinamicamente.

CREATE TABLE IF NOT EXISTS public.home_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  banner_title TEXT DEFAULT 'Especialização em Suturas',
  banner_subtitle TEXT DEFAULT 'Acesso premium às técnicas mais avançadas da cirurgia moderna.',
  banner_button_text TEXT DEFAULT 'Assistir Agora',
  banner_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1920&q=80',
  sections JSONB DEFAULT '[
    {"id": "continue_watching", "label": "Continue assistindo", "active": true},
    {"id": "highlight_modules", "label": "Módulos em Destaque", "active": true},
    {"id": "recent_lessons", "label": "Aulas Recentes", "active": true},
    {"id": "premium_content", "label": "Conteúdos Premium", "active": true}
  ]'::jsonb,
  highlight_modules JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inserir a configuração padrão para sempre existir
INSERT INTO public.home_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Políticas de Acesso
ALTER TABLE public.home_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access for home_config" ON public.home_config FOR SELECT USING (true);
CREATE POLICY "Public All Access for MVP admin usage" ON public.home_config FOR ALL USING (true) WITH CHECK (true);
