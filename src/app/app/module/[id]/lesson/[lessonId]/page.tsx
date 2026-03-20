'use client';

import { Play, CheckCircle2, ChevronLeft, Menu, Lock, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CustomVideoPlayer from '@/components/player/custom-video-player';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';

export default function LessonPlayer({ params }: { params: any }) {
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
      // Puxa perfil e regras
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

      // Puxa aulas do módulo para a sidebar
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

      // Descobre qual aula carregar
      let currentLessonData = null;
      if (lessId === 'first') {
         currentLessonData = sortedLessons[0];
      } else {
         const { data: dbLesson } = await supabase.from('lessons').select('*').eq('id', lessId).single();
         if (dbLesson) currentLessonData = dbLesson;
      }
      
      if (currentLessonData) {
        setLesson(currentLessonData);
        
        // Regra de Bloqueio
        const isPremium = currentLessonData.is_premium;
        const premiumDateStr = currentLessonData.premium_start_date;
        const premiumDate = premiumDateStr ? new Date(premiumDateStr) : null;
        
        let shouldBlock = false;
        
        if (isPremium && premiumDate) {
          const now = new Date();
          if (now >= premiumDate) {
            // A data já chegou/passou. Bloqueia se for comum.
            if (localRole !== 'admin' && localPlan !== 'premium') {
               shouldBlock = true;
            }
          }
          // Se now < premiumDate (data futura), `shouldBlock` continua false para todos.
        }
        
        setIsBlocked(shouldBlock);
        
        // Recupera progresso do cache
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
  ) : 'M7lc1UVf-VE'; // Fallback visual se a url do banco n for um video

  return (
    <div className="pt-20 min-h-screen bg-[#050806] flex flex-col md:flex-row border-t border-white/5 relative">
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full p-4 md:hidden flex items-center gap-2 border-b border-white/5">
          <Link href="/app/home" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm">
             <ChevronLeft className="h-4 w-4" /> Voltar para a Home
          </Link>
        </div>

        <div className="w-full max-w-6xl mx-auto md:p-6">
          {isBlocked ? (
            <div className="w-full aspect-video bg-black/60 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-primary/20 shadow-[0_8px_30px_rgb(212,175,55,0.1)] p-8 text-center">
               <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/20">
                 <Lock className="w-10 h-10 text-primary" />
               </div>
               <h2 className="text-3xl font-bold text-white mb-3">Conteúdo Exclusivo Premium</h2>
               <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">Este conteúdo agora é exclusivo para alunos premium. Identificamos que seu acesso é básico. Assine o plano Premium para liberar este material imediatamente.</p>
               <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 h-auto shadow-[0_4px_20px_0_rgba(212,175,55,0.4)] transition-all">
                 Fazer Upgrade Agora
               </Button>
            </div>
          ) : (
            <div className={`w-full ${lesson.is_premium ? 'shadow-[0_0_50px_rgba(212,175,55,0.15)] ring-1 ring-primary/20' : 'shadow-[0_0_50px_rgba(0,0,0,0.5)]'} rounded-2xl overflow-hidden`}>
              {initialTime !== null && (
                 <CustomVideoPlayer 
                   videoId={videoId} 
                   initialTime={initialTime} 
                   onProgress={handleProgress} 
                 />
              )}
            </div>
          )}
        </div>

        <div className="w-full max-w-6xl p-6 md:p-10 mx-auto">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <Link href="/app/home" className="hidden md:inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm mb-4">
                <ChevronLeft className="h-4 w-4" /> Voltar para a Home
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight flex flex-wrap items-center gap-3">
                {lesson.title}
                {lesson.is_premium && (
                   <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-500 border border-amber-500/30 whitespace-nowrap">
                     👑 Premium
                   </span>
                )}
              </h1>
              <p className="text-zinc-400">Conteúdo em Vídeo • Liberação especial</p>
            </div>
            <Button size="lg" disabled={isBlocked} className="bg-primary/10 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground font-medium rounded-xl gap-2 transition-all shadow-[0_4px_14px_0_rgba(212,175,55,0.2)] disabled:opacity-50">
              <CheckCircle2 className="h-5 w-5" />
              Marcar como concluída
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[400px] border-l border-white/10 bg-black/40 flex flex-col h-auto md:h-[calc(100vh-80px)] md:sticky top-20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md sticky top-0 md:static z-20">
          <div>
            <h3 className="font-bold text-white text-lg">Conteúdo</h3>
            <p className="text-sm text-zinc-400 mt-1">100% atualizado</p>
          </div>
          <Menu className="h-5 w-5 text-zinc-400 md:hidden" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-8 style-scrollbar-hide">
           <div className="space-y-2">
             {moduleLessons.length > 0 ? moduleLessons.map((l: any, idx: number) => {
               const isActive = l.id === lesson.id;
               
               // Verifica se a aula listada está bloqueada
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
                   <div className={`flex gap-4 p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-primary/10 border-primary/30 shadow-lg relative overflow-hidden' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10 relative overflow-hidden'}`}>
                      {isBlockedInList && !isActive && (
                         <div className="absolute top-0 right-0 p-1 bg-red-500/10 rounded-bl-lg border-b border-l border-red-500/20">
                            <Lock className="h-3 w-3 text-red-500/60 group-hover:text-red-500 transition-colors" />
                         </div>
                      )}
                      {l.is_premium && (
                         <div className="absolute top-0 right-8 px-1.5 py-0.5 bg-amber-500/20 rounded-b-lg border-b border-x border-amber-500/30">
                            <span className="text-[9px] font-bold text-amber-500 select-none uppercase">Premium</span>
                         </div>
                      )}
                      <div className="h-5 w-5 shrink-0 mt-0.5 flex items-center justify-center">
                        {isActive ? <Play className="h-3 w-3 text-primary fill-current ml-0.5" /> : <div className="h-2 w-2 rounded-full bg-zinc-600" />}
                      </div>
                      <div className="pr-4 min-w-0">
                        <p className={`text-sm font-medium leading-snug truncate ${isActive ? 'text-primary' : 'text-zinc-300'}`}>{idx + 1}. {l.title}</p>
                        <p className={`text-xs mt-1 ${isActive ? 'text-primary/70' : 'text-zinc-500'}`}>{isActive ? 'Assistindo' : 'Pendente'}</p>
                      </div>
                   </div>
                 </Link>
               );
             }) : (
               <div className="text-zinc-500 text-sm text-center italic py-4">Nenhuma aula encontrada para este módulo.</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
