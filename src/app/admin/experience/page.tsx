'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, GripVertical, Save, Image as ImageIcon, ToggleLeft, ToggleRight, Play, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@supabase/supabase-js';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const initialSections = [
  { id: 'continue_watching', label: 'Continue assistindo', active: true },
  { id: 'highlight_modules', label: 'Módulos em Destaque', active: true },
  { id: 'recent_lessons', label: 'Aulas Recentes', active: true },
  { id: 'premium_content', label: 'Conteúdos Premium', active: true },
];

function SortableSectionItem({ id, section, toggleSection }: { id: string, section: any, toggleSection: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl mb-3 group hover:border-white/20 transition-colors relative z-10">
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners} className="text-zinc-500 hover:text-white cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="text-white font-medium">{section.label}</span>
      </div>
      <button 
        type="button" 
        onClick={() => toggleSection(section.id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${section.active ? 'bg-primary/20 text-primary' : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'}`}
      >
        {section.active ? (
          <><ToggleRight className="h-4 w-4" /> Ativo</>
        ) : (
          <><ToggleLeft className="h-4 w-4" /> Oculto</>
        )}
      </button>
    </div>
  );
}

export default function AdminExperiencePage() {
  const [sections, setSections] = useState(initialSections);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [bannerTitle, setBannerTitle] = useState('Especialização em Suturas');
  const [bannerSubtitle, setBannerSubtitle] = useState('Acesso premium às técnicas mais avançadas da cirurgia moderna.');
  const [bannerButton, setBannerButton] = useState('Assistir Agora');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1920&q=80');

  const [mockModules, setMockModules] = useState<any[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      // Carregar configs da home
      const { data: config } = await supabase.from('home_config').select('*').eq('id', 1).single();
      if (config) {
        setBannerTitle(config.banner_title || '');
        setBannerSubtitle(config.banner_subtitle || '');
        setBannerButton(config.banner_button_text || '');
        setBannerImage(config.banner_image_url || '');
        if (config.sections) {
          setSections(config.sections);
        }
      }

      // Carregar preview real de módulos para o mock da tela
      const { data: mods } = await supabase.from('modules').select('*').eq('status', 'active').limit(4);
      if (mods) {
        setMockModules(mods.map(m => ({
          id: m.id,
          title: m.title,
          progress: Math.floor(Math.random() * 100), // Visual fake progress
          image: m.cover_image_vertical || m.banner_image_horizontal || 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80'
        })));
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadBanner(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadBanner(file);
    }
  };

  const uploadBanner = async (file: File) => {
    setSaving(true);
    const fileName = `home-banner-${Date.now()}`;
    const { error: uploadError } = await supabase.storage.from('courses').upload(fileName, file, { upsert: false });
    
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('courses').getPublicUrl(fileName);
      setBannerImage(publicUrl);
    }
    setSaving(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase.from('home_config').upsert({
      id: 1,
      banner_title: bannerTitle,
      banner_subtitle: bannerSubtitle,
      banner_button_text: bannerButton,
      banner_image_url: bannerImage,
      sections: sections,
    });

    setSaving(false);
    if (!error) {
      alert('Configurações da Área do Aluno salvas com sucesso no banco de dados!');
    } else {
      alert('Erro ao salvar configurações.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Carregando configurações atuais...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Experiência do Aluno
          </h2>
          <p className="text-zinc-400 mt-2">Personalize a Home (estilo Netflix), capas, textos e ordenação.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Gravando no Banco...' : 'Salvar Configurações'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">Banner Principal</CardTitle>
            <CardDescription className="text-zinc-400">O grande destaque inicial ao entrar na plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[21/9] w-full bg-zinc-900 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all relative overflow-hidden group ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-zinc-700 hover:border-primary/50'}`}
            >
              <img src={bannerImage} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-10 transition-opacity" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors z-10" />
              <ImageIcon className={`h-10 w-10 relative z-20 transition-transform duration-300 group-hover:scale-110 ${isDragging ? 'text-primary scale-125' : 'text-zinc-300'}`} />
              <span className="text-sm font-medium text-white relative z-20 text-center px-4 drop-shadow-md">
                {isDragging ? 'Solte a imagem para usar no Banner!' : 'Clique ou arraste uma imagem aqui para fazer Upload Real'}
              </span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">URL da Imagem (Opção por Link)</Label>
                <Input value={bannerImage} onChange={e => setBannerImage(e.target.value)} className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50 placeholder:text-zinc-600" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Título do Banner</Label>
                <Input value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Subtítulo (Resumo)</Label>
                <Input value={bannerSubtitle} onChange={e => setBannerSubtitle(e.target.value)} className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Texto do Botão CTA</Label>
                <Input value={bannerButton} onChange={e => setBannerButton(e.target.value)} className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">Seções da Home</CardTitle>
              <CardDescription className="text-zinc-400">Arraste para reordenar. Oculte as que não desejar exibir.</CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                  {sections.map((section) => (
                    <SortableSectionItem key={section.id} id={section.id} section={section} toggleSection={toggleSection} />
                  ))}
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-white/10 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">Preview da Área de Membros</h3>
          <p className="text-zinc-400">Visualize em tempo real como a home do aluno está ficando.</p>
        </div>
        
        <div className="w-full border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#050806] ring-1 ring-white/5 relative h-[700px] overflow-y-auto style-scrollbar-hide">
          <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent z-50 px-8 flex items-center pointer-events-none">
             <div className="font-bold text-white tracking-tight text-xl opacity-80">SBH <span className="text-primary opacity-90">Premium</span></div>
          </div>
          
          <div className="relative w-full h-[450px] flex items-end pb-16 border-b border-white/5">
            <img 
              src={bannerImage || 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1920&q=80'}
              alt="Banner Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050806] via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-transparent to-transparent" />
            
            <div className="relative z-10 px-8 max-w-3xl space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg leading-tight uppercase">
                {bannerTitle || 'Título do Banner'}
              </h1>
              <p className="text-base text-zinc-300 drop-shadow-md font-light leading-relaxed line-clamp-2 max-w-xl">
                {bannerSubtitle || 'O subtítulo aparecerá aqui preenchendo o espaço inferior do Hero Banner.'}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Button size="lg" className="bg-white text-black font-semibold px-6 flex items-center gap-2 rounded shadow-lg pointer-events-none py-2 h-10">
                  <Play className="h-4 w-4 fill-current" />
                  {bannerButton || 'Assistir Agora'}
                </Button>
                <Button size="lg" variant="outline" className="px-6 rounded bg-zinc-600/30 border-white/20 text-white backdrop-blur-md gap-2 shadow-lg pointer-events-none py-2 h-10">
                  <Info className="h-4 w-4" />
                  Mais informações
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 -mt-10 relative z-20 pb-16">
            {sections.map(section => {
               if (!section.active) return null;
               
               let displayItems = mockModules.length > 0 ? mockModules : [];

               return (
                 <div key={section.id} className="space-y-3 pt-4 pointer-events-none">
                   <h3 className="text-lg font-semibold px-8 text-zinc-100">{section.label}</h3>
                   <div className="flex gap-4 px-8 overflow-hidden">
                     {displayItems.map((c: any, i: number) => (
                       <Card key={i} className="w-[260px] h-[146px] overflow-hidden relative border-white/5 bg-black/50 shrink-0 shadow-lg">
                         <img src={c.image} alt={c.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                         <CardContent className="absolute inset-0 p-3 flex flex-col justify-end">
                           <h4 className="font-medium text-white text-sm line-clamp-2 leading-tight mb-2">{c.title}</h4>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 </div>
               );
            })}
            
            {sections.filter(s => s.active).length === 0 && (
              <div className="px-8 text-zinc-500 italic mt-12 text-center text-sm">
                Nenhuma seção ativa na home no momento. Ative as seções acima para visualizar o layout local.
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .style-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .style-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
