'use client';

import { Play, Info, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

function ModuleRow({ title, modules }: { title: string, modules: any[] }) {
  if (!modules?.length) return null;
  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center justify-between px-8 md:px-16">
        <h3 className="text-2xl font-heading font-medium tracking-tight text-[#F5E6CA]">{title}</h3>
        <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium group text-[10px] tracking-[0.2em] uppercase">
          Ver Tudo <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="flex gap-6 px-8 md:px-16 overflow-x-auto pb-10 snap-x style-scrollbar-hide">
        {modules.map((module, i) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="snap-start shrink-0"
          >
            <Link href={`/app/module/${module.id}/lesson/first`} className="focus:outline-none block">
              <Card className="w-[340px] h-[200px] overflow-hidden group relative border-white/5 bg-black/60 hover:border-primary/30 transition-all duration-500 shadow-2xl">
                <img 
                  src={module.banner_image_horizontal || module.cover_image_vertical || 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80'} 
                  alt={module.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-transparent to-transparent opacity-90" />
                
                <CardContent className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-primary/40 bg-primary/10 text-primary px-2 py-0">
                      Médico
                    </Badge>
                  </div>
                  <h4 className="font-heading font-medium text-lg text-white line-clamp-2 leading-tight drop-shadow-lg group-hover:text-primary transition-colors">
                    {module.title}
                  </h4>
                </CardContent>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-[2px]">
                   <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all shadow-[0_0_25px_rgba(191,155,95,0.4)]">
                     <Play className="h-6 w-6 ml-1 fill-current" />
                   </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export default function StudentHomeClient({ config, modulesToUse }: { config: any, modulesToUse: any[] }) {
  const banner = {
    title: config?.banner_title || 'Mestres da Harmonização',
    subtitle: config?.banner_subtitle || 'Aprenda as técnicas exclusivas que estão definindo o novo padrão da estética avançada mundial.',
    buttonText: config?.banner_button_text || 'INICIAR JORNADA',
    imageUrl: config?.banner_image_url || 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1920&q=80',
  };

  const sections = config?.sections || [
    { id: 'highlight_modules', label: 'Módulos em Destaque', active: true },
    { id: 'recent_lessons', label: 'Módulos de Especialização', active: true },
  ];

  const ctaLinkId = modulesToUse?.length > 0 ? modulesToUse[0].id : '';

  return (
    <div className="bg-[#050806] min-h-screen relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full" />
      </div>

      {/* Cinematic Hero */}
      <div className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            src={banner.imageUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          {/* Layered Overlays for Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050806] via-[#050806]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative z-10 px-8 md:px-16 w-full max-w-7xl flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="space-y-10"
          >
            <div className="flex flex-col items-center gap-4">
              <Badge variant="premium" className="px-5 py-1 text-[10px] tracking-[0.5em] font-black uppercase ring-1 ring-primary/50 shadow-[0_0_20px_rgba(191,155,95,0.3)]">
                 ÁREA DE MEMBROS
              </Badge>
              <div className="h-12 w-[1px] bg-gradient-to-b from-primary/60 to-transparent" />
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold text-white leading-[1] tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {banner.title.split(' ').map((word: string, i: number) => (
                <span key={i} className={i % 2 === 0 ? "block" : "block text-transparent bg-clip-text bg-gradient-to-b from-primary to-[#F5E6CA] opacity-90"}>
                  {word}
                </span>
              ))}
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 drop-shadow-md font-medium leading-relaxed max-w-2xl mx-auto italic opacity-80 backdrop-blur-[1px]">
               {banner.subtitle}
            </p>
            

          </motion.div>
        </div>

        {/* Floating Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-40">
           <div className="w-[1px] h-20 bg-gradient-to-b from-primary to-transparent animate-pulse" />
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-20 pb-40 space-y-10 -mt-24">
        {sections.map((section: any) => {
           if (!section.active) return null;
           const sModules = modulesToUse || [];
           return <ModuleRow key={section.id} title={section.label} modules={sModules} />;
        })}
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
