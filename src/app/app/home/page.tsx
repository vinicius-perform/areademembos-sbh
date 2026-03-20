import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function ModuleRow({ title, modules }: { title: string, modules: any[] }) {
  if (!modules?.length) return null;
  return (
    <div className="space-y-4 pt-8">
      <h3 className="text-xl font-semibold px-8 md:px-16 text-zinc-100">{title}</h3>
      <div className="flex gap-4 px-8 md:px-16 overflow-x-auto pb-6 snap-x style-scrollbar-hide">
        {modules.map((module) => (
          <Link href={`/app/module/${module.id}/lesson/first`} key={module.id} className="snap-start focus:outline-none focus-visible:ring-2 ring-primary rounded-xl shrink-0">
            <Card className="w-[300px] h-[170px] overflow-hidden group relative border-white/5 bg-black/50 hover:border-white/20 transition-all duration-300 shadow-xl">
              <img 
                src={module.banner_image_horizontal || module.cover_image_vertical || 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80'} 
                alt={module.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <CardContent className="absolute inset-0 p-4 flex flex-col justify-end">
                <h4 className="font-medium text-white line-clamp-2 leading-tight mb-3 drop-shadow-md">
                  {module.title}
                </h4>
              </CardContent>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                <div className="h-14 w-14 rounded-full border-2 border-white flex items-center justify-center bg-black/40 text-white backdrop-blur-md shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                  <Play className="h-6 w-6 ml-1 fill-current" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function StudentHome() {
  const { data: config } = await supabase.from('home_config').select('*').eq('id', 1).single();
  const { data: dbModules } = await supabase.from('modules').select('*').order('order', { ascending: true });
  
  const modulesToUse = dbModules || [];

  const banner = {
    title: config?.banner_title || 'Especialização em Suturas',
    subtitle: config?.banner_subtitle || 'Acesso premium às técnicas mais avançadas da cirurgia moderna.',
    buttonText: config?.banner_button_text || 'Assistir Agora',
    imageUrl: config?.banner_image_url || 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1920&q=80',
  };

  const sections = config?.sections || [
    { id: 'continue_watching', label: 'Continue assistindo', active: true },
    { id: 'highlight_modules', label: 'Módulos em Destaque', active: true },
    { id: 'recent_lessons', label: 'Aulas Recentes', active: true },
    { id: 'premium_content', label: 'Conteúdos Premium', active: true },
  ];

  // Em um ambiente real, 'continue_watching' buscaria o progresso exato.
  // E o primeiro botão do CTA apontaria para o último vídeo assistido ou primeiro destaque.
  const ctaLinkId = modulesToUse.length > 0 ? modulesToUse[0].id : '';

  const sectionsData: Record<string, { title: string, modules: any[] }> = {
    'continue_watching': { title: 'Continue Assistindo', modules: modulesToUse.slice(0, 2) },
    'highlight_modules': { title: 'Módulos em Destaque', modules: modulesToUse },
    'recent_lessons': { title: 'Destaques Premium', modules: modulesToUse.slice(1,3) },
    'premium_content': { title: 'Últimas Adições', modules: modulesToUse.slice(0, 1) },
  };

  return (
    <div className="animate-in fade-in duration-1000">
      <div className="relative w-full h-[70vh] min-h-[600px] max-h-[800px] flex items-end pb-24 border-b border-white/5">
        <img 
          src={banner.imageUrl}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050806] via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-transparent to-transparent" />
        
        <div className="relative z-10 px-8 md:px-16 max-w-4xl space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/50 text-white bg-primary tracking-widest uppercase text-[10px] w-fit font-bold rounded-sm py-1">
              Premium
            </Badge>
            <span className="text-zinc-400 text-sm font-medium">Lançamento</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg leading-tight uppercase">
            {banner.title}
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-300 drop-shadow-md font-light leading-relaxed max-w-2xl line-clamp-3">
            {banner.subtitle}
          </p>
          
          <div className="flex items-center gap-3 pt-4">
            {ctaLinkId ? (
               <Link href={`/app/module/${ctaLinkId}/lesson/first`}>
                 <Button size="lg" className="bg-white hover:bg-zinc-200 text-black font-semibold h-12 md:h-14 px-6 md:px-8 text-base md:text-lg flex items-center gap-2 rounded shadow-lg transition-transform hover:scale-105">
                   <Play className="h-5 w-5 fill-current" />
                   {banner.buttonText}
                 </Button>
               </Link>
            ) : (
               <Button disabled size="lg" className="bg-white/50 text-black/50 font-semibold h-12 md:h-14 px-6 md:px-8 text-base md:text-lg flex items-center gap-2 rounded">
                 Nenhum Módulo
               </Button>
            )}
            <Button size="lg" variant="outline" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg rounded bg-zinc-600/30 hover:bg-zinc-600/50 border-white/20 text-white backdrop-blur-md gap-2 shadow-lg">
              <Info className="h-5 w-5" />
              <span className="hidden sm:inline">Mais informações</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2 -mt-16 md:-mt-24 relative z-20 pb-12">
        {sections.map((section: any) => {
           if (!section.active) return null;
           // Fallback seguro caso 'sectionsData' não mapeie o novo ID de seção perfeitamente
           const s = sectionsData[section.id] || { title: section.label, modules: modulesToUse };
           if (!s) return null;
           
           // override title just to be sure it matches exactly the label on config
           return <ModuleRow key={section.id} title={section.label} modules={s.modules} />;
        })}
        
        {sections.filter((s: any) => s.active).length === 0 && (
           <div className="px-8 md:px-16 text-zinc-500 italic mt-32 text-center text-lg">
              Nenhuma seção ativa na home no momento.
           </div>
        )}
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
