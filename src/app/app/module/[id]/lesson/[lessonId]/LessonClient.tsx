'use client';

import { Play, CheckCircle2, ChevronLeft, Menu, Lock, FolderOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import CustomVideoPlayer from '@/components/player/custom-video-player';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';

export default function LessonClient({ params }: { params: any }) {
  const unwrappedParams = use(params) as any;
  const modId = unwrappedParams.id;
  const lessId = unwrappedParams.lessonId;

  const [lesson, setLesson] = useState<any>(null);
  const [moduleLessons, setModuleLessons] = useState<any[]>([]);
  const [initialTime, setInitialTime] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isEmptyModule, setIsEmptyModule] = useState(false);
  const [userRole, setUserRole] = useState<string>('student');
  const [userPlan, setUserPlan] = useState<string>('basic');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      let localRole = 'student';
      let localPlan = 'basic';
      
      if (user) {
         const { data: userRow } = await supabase.from('users').select('role, plan_type').eq('id', user.id).single();
         if (userRow) {
           localRole = userRow.role;
           localPlan = userRow.plan_type?.toLowerCase() || 'basic';
           setUserRole(localRole);
           setUserPlan(localPlan);
         }
      }

      const { data: allLessons, error: err } = await supabase.from('lessons').select('*').eq('module_id', modId);
      
      let sortedLessons: any[] = [];
      if (allLessons) {
         sortedLessons = [...allLessons].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
         setModuleLessons(sortedLessons);
      }
      
      if (err) console.error("Erro puxando aulas:", err);

      if (sortedLessons.length === 0) {
         setIsEmptyModule(true);
         setLoading(false);
         return;
      }

      let currentLessonData = null;
      if (lessId === 'first') {
         currentLessonData = sortedLessons[0];
      } else {
         const { data: dbLesson } = await supabase.from('lessons').select('*').eq('id', lessId).single();
         if (dbLesson) currentLessonData = dbLesson;
      }
      
      if (currentLessonData) {
        setLesson(currentLessonData);
        
        const isPremium = currentLessonData.is_premium;
        const premiumDateStr = currentLessonData.premium_start_date;
        const premiumDate = premiumDateStr ? new Date(premiumDateStr) : null;
        
        let shouldBlock = false;
        
        if (isPremium && premiumDate) {
          const now = new Date();
          if (now >= premiumDate) {
            if (localRole !== 'admin' && localPlan !== 'premium') {
               shouldBlock = true;
            }
          }
        }
        
        setIsBlocked(shouldBlock);
        
        const saved = localStorage.getItem(`video-progress-${currentLessonData.id}`);
        setInitialTime(saved ? Number(saved) : 0);
      }
      
      setLoading(false);
    }
    
    init();
  }, [modId, lessId]);

  const handleProgress = (time: number) => {
    if (lesson?.id) {
       localStorage.setItem(`video-progress-${lesson.id}`, time.toString());
    }
  };

  if (loading) {
     return <div className="pt-20 min-h-screen bg-[#050806] flex items-center justify-center text-zinc-500">Carregando conteúdo...</div>;
  }

  if (isEmptyModule) {
     return (
       <div className="pt-20 min-h-screen bg-[#050806] flex flex-col items-center justify-center border-t border-white/5 relative">
         <div className="flex flex-col items-center text-center max-w-md mx-auto p-8 rounded-2xl bg-black/40 border border-white/10 shadow-2xl mt-48">
           <FolderOpen className="h-16 w-16 text-primary/40 mb-6" />
           <h2 className="text-2xl font-bold text-white mb-2">Módulo em Construção</h2>
           <p className="text-zinc-400 mb-6">Este módulo ainda não possui aulas cadastradas. Volte em breve para novos conteúdos.</p>
           <Link href="/app/home">
             <Button className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl">Voltar para a Home</Button>
           </Link>
         </div>
       </div>
     );
  }

  if (!lesson) {
     return <div className="pt-20 min-h-screen bg-[#050806] flex items-center justify-center text-zinc-500">Aula não encontrada.</div>;
  }

  const isYouTubeVideo = lesson.video_url?.includes('youtube.com') || lesson.video_url?.includes('youtu.be') || lesson.video_url?.length === 11;
  const videoId = isYouTubeVideo ? (
    lesson.video_url?.split('v=')[1]?.split('&')[0] || 
    lesson.video_url?.split('youtu.be/')[1]?.split('?')[0] || 
    lesson.video_url
  ) : 'M7lc1UVf-VE';

  return (
    <div className="pt-24 min-h-screen bg-background flex flex-col lg:flex-row border-t border-white/5 relative">
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full p-4 lg:hidden flex items-center gap-4 bg-black/40 border-b border-white/10">
          <Link href="/app/home" className="flex items-center gap-2 text-primary hover:text-white text-xs font-bold tracking-widest uppercase">
             <ChevronLeft className="h-4 w-4" /> Home
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest truncate">{lesson.title}</span>
        </div>

        <div className="w-full max-w-7xl mx-auto lg:p-10">
          {isBlocked ? (
            <div className="w-full aspect-video bg-black/60 backdrop-blur-3xl rounded-3xl flex flex-col items-center justify-center border border-white/5 shadow-2xl p-12 text-center overflow-hidden relative group">
               <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
               <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 ring-8 ring-primary/5 group-hover:ring-primary/10 transition-all duration-700">
                 <Lock className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(191,155,95,0.3)]" />
               </div>
               <h2 className="text-4xl font-heading font-bold text-white mb-4 uppercase tracking-tighter">Experiência Restrita</h2>
               <p className="text-zinc-400 max-w-md mx-auto mb-10 leading-relaxed text-sm">Este conteúdo é exclusivo para membros da Sociedade Brasileira de Harmonização com plano **Premium** ativo.</p>
               <Button variant="premium" className="px-12 h-14 text-sm font-bold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(191,155,95,0.3)]">
                 Elevar meu Acesso
               </Button>
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className={`w-full relative ${lesson.is_premium ? 'shadow-[0_0_60px_rgba(191,155,95,0.1)] ring-1 ring-primary/30' : 'shadow-2xl'} rounded-2xl overflow-hidden bg-black`}
            >
              {initialTime !== null && (
                 <CustomVideoPlayer 
                   videoId={videoId} 
                   initialTime={initialTime} 
                   onProgress={handleProgress} 
                 />
              )}
              {lesson.is_premium && (
                <div className="absolute top-6 right-6 z-30">
                  <Badge variant="premium" className="px-4 py-1.5 text-[10px] tracking-[0.2em]">PREMIUM ACCESS</Badge>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="w-full max-w-7xl p-8 md:p-12 mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Link href="/app/home" className="hidden lg:flex items-center gap-2 text-primary hover:text-white font-bold text-[10px] tracking-[0.2em] uppercase transition-colors">
                  <ChevronLeft className="h-3 w-3" /> Dashboard
                 </Link>
                 <div className="hidden lg:block h-3 w-[1px] bg-white/10" />
                 <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Módulo • {modId}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight tracking-tight flex flex-wrap items-center gap-4">
                {lesson.title}
                {lesson.is_premium && (
                   <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </h1>
              <div className="flex items-center gap-6 text-zinc-500">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary/60" />
                  <span className="text-xs uppercase tracking-widest font-medium">Acesso Vitalício</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary/60" />
                  <span className="text-xs uppercase tracking-widest font-medium">Material de Apoio</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-stretch sm:flex-row gap-4">
              <Button 
                variant={isBlocked ? "ghost" : "premium"} 
                disabled={isBlocked} 
                className="h-14 px-10 text-xs font-bold uppercase tracking-widest gap-3 shadow-lg"
              >
                <CheckCircle2 className="h-5 w-5" />
                CONCLUIR AULA
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/5 border border-white/5 p-8 rounded-2xl">
                   <h3 className="text-lg font-heading font-medium text-white mb-4">Sobre esta aula</h3>
                   <p className="text-zinc-400 leading-relaxed">
                     Esta aula aborda os princípios fundamentais da harmonização facial, focando em técnicas avançadas de volumização e refinamento estético. Conteúdo exclusivo desenvolvido pela equipe técnica da SBH.
                   </p>
                </div>
             </div>
             <div>
                <Card className="bg-black/40 border-primary/20 p-6">
                   <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Suporte ao Aluno</h4>
                   <p className="text-[11px] text-zinc-500 mb-6 leading-relaxed">Dúvidas sobre o conteúdo? Nossa equipe técnica está disponível para suporte via comunidade exclusiva ou canal direto.</p>
                   <Button variant="outline" className="w-full text-[10px] tracking-widest font-bold h-11">ABRIR CHAMADO</Button>
                </Card>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[450px] border-l border-white/10 bg-black/40 flex flex-col h-auto lg:h-[calc(100vh-96px)] lg:sticky top-24">
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-3xl sticky top-0 lg:static z-20">
          <div>
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Cronograma</h3>
            <p className="text-lg font-heading font-medium text-white mt-1">Grade Curricular</p>
          </div>
          <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
             <Menu className="h-5 w-5 text-zinc-400" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 style-scrollbar-hide bg-gradient-to-b from-transparent to-primary/5">
           {moduleLessons.length > 0 ? moduleLessons.map((l: any, idx: number) => {
             const isActive = l.id === lesson.id;
             const isPremium = l.is_premium;
             const premiumDateStr = l.premium_start_date;
             const premiumDateList = premiumDateStr ? new Date(premiumDateStr) : null;
             
             let isBlockedInList = false;
             if (isPremium && premiumDateList) {
                if (new Date() >= premiumDateList) {
                  if (userRole !== 'admin' && userPlan !== 'premium') {
                     isBlockedInList = true;
                  }
                }
             }

             return (
               <Link href={`/app/module/${modId}/lesson/${l.id}`} key={l.id} className="block group">
                 <div className={`p-4 rounded-xl transition-all duration-300 flex items-center gap-4 ${isActive ? 'bg-primary shadow-[0_8px_30px_rgba(191,155,95,0.3)]' : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'}`}>
                    <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-black/20 border border-white/10'}`}>
                       {isActive ? <Play className="h-4 w-4 text-white fill-current ml-0.5" /> : <span className="text-[10px] font-bold text-zinc-600">{String(idx + 1).padStart(2, '0')}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className={`text-xs font-bold tracking-wide truncate ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-primary transition-colors'}`}>{l.title}</p>
                       <div className="flex items-center gap-2 mt-1">
                          {isBlockedInList && <Lock className="h-3 w-3 text-red-400/60" />}
                          {l.is_premium && <Badge className="h-3.5 px-1.5 text-[8px] bg-primary/20 text-primary border-none">PREMIUM</Badge>}
                          <span className={`text-[9px] uppercase tracking-widest font-medium ${isActive ? 'text-white/60' : 'text-zinc-600'}`}>{isActive ? 'Tocando agora' : 'Vídeo aula'}</span>
                       </div>
                    </div>
                    {!isActive && !isBlockedInList && <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-primary transition-all group-hover:translate-x-1" />}
                 </div>
               </Link>
             );
           }) : (
             <div className="text-zinc-600 text-xs text-center italic py-8 border border-dashed border-white/5 rounded-2xl">Aguardando novos conteúdos...</div>
           )}
        </div>
      </div>
    </div>
  );
}
