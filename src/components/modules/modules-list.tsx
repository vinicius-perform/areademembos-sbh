'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, Plus, Video, Edit2, Archive, Trash2, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { EditModuleDialog } from './edit-module-dialog';
import { CreateModuleDialog } from './create-module-dialog';
import { CreateLessonDialog } from './create-lesson-dialog';
import { EditLessonDialog } from './edit-lesson-dialog';

export function ModulesList({ modules }: { modules: any[] }) {
  const router = useRouter();
  
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [creatingLessonFor, setCreatingLessonFor] = useState<any | null>(null);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState<string | null>(null);
  const [isDeletingModule, setIsDeletingModule] = useState<string | null>(null);

  const handleArchive = async (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente arquivar este módulo? Ele sumirá da área de membros e dessa tela.')) return;
    
    setIsArchiving(moduleId);
    try {
      const { error } = await supabase.from('modules').update({ status: 'archived' }).eq('id', moduleId);
      if (error) throw error;
      router.refresh(); 
    } catch (err: any) {
      alert(`Erro ao arquivar: ${err.message}`);
    } finally {
      setIsArchiving(null);
    }
  };

  const handleRestore = async (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('modules').update({ status: 'active' }).eq('id', moduleId);
      if (error) throw error;
      router.refresh(); 
    } catch (err: any) {
      alert(`Erro ao restaurar: ${err.message}`);
    }
  };

  const handleDeleteModule = async (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    if (!confirm('ATENÇÃO: Deseja realmente EXCLUIR PERMANENTEMENTE este módulo e todas as suas aulas? Esta ação é irreversível e apagará os arquivos em cascata (caso configurado no banco).')) return;
    
    setIsDeletingModule(moduleId);
    try {
      const { error } = await supabase.from('modules').delete().eq('id', moduleId);
      if (error) throw error;
      router.refresh(); 
    } catch (err: any) {
      alert(`Erro ao excluir permanentemente: ${err.message}`);
    } finally {
      setIsDeletingModule(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, module: any) => {
    e.stopPropagation();
    setEditingModule(module);
  };

  const handleAddLesson = (e: React.MouseEvent, module: any) => {
    e.stopPropagation();
    setCreatingLessonFor(module);
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Deseja realmente excluir permanentemente esta aula? A ação não pode ser desfeita.')) return;
    
    setIsDeletingLesson(lessonId);
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if (error) throw error;
      router.refresh(); 
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    } finally {
      setIsDeletingLesson(null);
    }
  };

  const activeModules = modules
    .filter((m: any) => m.status !== 'archived')
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const archivedModules = modules
    .filter((m: any) => m.status === 'archived')
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white block">Área de Membros <span className="text-primary">(Módulos)</span></h2>
          <p className="text-zinc-400 mt-2">
            Organize os módulos principais e suas respectivas aulas com facilidade.
          </p>
        </div>
        <CreateModuleDialog />
      </div>

      {activeModules.length === 0 ? (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md shadow-2xl">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <FolderOpen className="w-12 h-12 text-primary/40 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sua Área de Membros está vazia</h3>
            <p className="text-zinc-500 font-medium">Cadastre seu primeiro Módulo clicando no botão acima para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md shadow-2xl">
          <CardContent className="p-6">
            <Accordion type="multiple" defaultValue={activeModules.map((m: any) => m.id)} className="space-y-4">
              {activeModules.map((module: any) => (
                <AccordionItem 
                  key={module.id} 
                  value={module.id}
                  className={`border border-white/10 rounded-xl bg-black/20 overflow-hidden px-2 transition-opacity ${isArchiving === module.id ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <AccordionTrigger className="hover:no-underline px-4 hover:bg-white/5 rounded-lg transition-all py-4">
                    <div className="flex items-center justify-between w-full pr-4 text-left">
                      <div className="flex flex-row items-center gap-4">
                        <GripVertical className="h-5 w-5 text-zinc-600 cursor-grab active:cursor-grabbing hover:text-white transition-colors" />
                        
                        <div className="h-14 w-10 relative flex-shrink-0 rounded-md overflow-hidden bg-black/50 border border-white/10 hidden sm:block">
                           {module.cover_image_vertical ? (
                              <img src={module.cover_image_vertical} alt={module.title} className="absolute inset-0 w-full h-full object-cover" />
                           ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-primary/40"><FolderOpen className="h-4 w-4" /></div>
                           )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-white text-lg block truncate">{module.title}</span>
                          {module.description && <span className="text-sm text-zinc-500 block truncate font-normal mt-0.5">{module.description}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className="border-white/10 text-zinc-400 bg-black/40">
                          {module.lessons?.length || 0} aulas
                        </Badge>
                        <Button onClick={(e) => handleEdit(e, module)} disabled={isArchiving === module.id} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={(e) => handleArchive(e, module.id)} disabled={isArchiving === module.id} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-destructive hover:bg-destructive/20">
                          {isArchiving === module.id ? <Archive className="h-4 w-4 animate-spin opacity-50" /> : <Archive className="h-4 w-4" />}
                        </Button>
                        
                        <Button onClick={e => handleAddLesson(e, module)} size="sm" variant="outline" className="h-8 ml-2 border-primary/50 text-primary hover:bg-primary/10 transition-colors">
                          <Plus className="mr-1 h-3 w-3" /> Aula
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 px-4 sm:px-16">
                    <div className="space-y-2 mt-4">
                      {(!module.lessons || module.lessons.length === 0) ? (
                        <div className="p-4 rounded-lg border border-dashed border-white/10 text-zinc-500 text-sm italic text-center">Nenhuma aula cadastrada neste módulo ainda.</div>
                      ) : (
                        module.lessons.sort((a: any,b: any) => (a.order||0) - (b.order||0)).map((lesson: any) => (
                          <div 
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab hover:text-white shrink-0" />
                              <div className="h-8 w-8 rounded bg-primary/20 flex shrink-0 items-center justify-center">
                                <Video className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex flex-col items-start gap-1">
                                <p className="font-medium text-white text-sm truncate flex items-center gap-2">
                                  {lesson.title}
                                  {lesson.is_premium && (
                                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/30">
                                      👑 {new Date() < new Date(lesson.premium_start_date || new Date()) ? `Premium após ${new Date(lesson.premium_start_date).toLocaleDateString('pt-BR')}` : 'Premium Ativo'}
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">{lesson.video_url}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Button onClick={() => handleEditLesson(lesson)} disabled={isDeletingLesson === lesson.id} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => handleDeleteLesson(lesson.id)} disabled={isDeletingLesson === lesson.id} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-destructive hover:bg-destructive/20">
                                {isDeletingLesson === lesson.id ? <Trash2 className="h-4 w-4 animate-spin opacity-50" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {archivedModules.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-white/5">
          <div>
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <Archive className="h-5 w-5 text-zinc-400" /> Módulos Arquivados
             </h3>
             <p className="text-zinc-500 text-sm mt-1">Módulos que não estão visíveis para os alunos. Você pode restaurá-los ou excluí-los permanentemente.</p>
          </div>
          
          <div className="space-y-3">
             {archivedModules.map((module: any) => (
                <div key={module.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 relative flex-shrink-0 rounded-md overflow-hidden bg-black/50 border border-white/10 grayscale opacity-50">
                         {module.cover_image_vertical ? (
                            <img src={module.cover_image_vertical} alt={module.title} className="absolute inset-0 w-full h-full object-cover" />
                         ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-500"><FolderOpen className="h-4 w-4" /></div>
                         )}
                      </div>
                      <div>
                         <span className="font-semibold text-zinc-400 block">{module.title}</span>
                         <span className="text-xs text-zinc-500 block">{module.lessons?.length || 0} aulas arquivadas</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <Button onClick={(e) => handleRestore(e, module.id)} variant="outline" size="sm" className="h-8 border-white/10 text-zinc-300 hover:text-white bg-black/50">
                         Restaurar
                      </Button>
                      <Button onClick={(e) => handleDeleteModule(e, module.id)} disabled={isDeletingModule === module.id} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-destructive hover:bg-destructive/20" title="Excluir Permanentemente">
                         {isDeletingModule === module.id ? <Trash2 className="h-4 w-4 animate-spin opacity-50" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Modais Anexadas */}
      {editingModule && (
        <EditModuleDialog 
          module={editingModule} 
          open={!!editingModule} 
          onOpenChange={(isOpen) => {
            if (!isOpen) setEditingModule(null);
          }} 
        />
      )}

      {creatingLessonFor && (
        <CreateLessonDialog 
          module={creatingLessonFor}
          open={!!creatingLessonFor}
          onOpenChange={(isOpen) => {
             if (!isOpen) setCreatingLessonFor(null);
          }}
        />
      )}

      {editingLesson && (
        <EditLessonDialog
          lesson={editingLesson}
          open={!!editingLesson}
          onOpenChange={(isOpen) => {
             if (!isOpen) setEditingLesson(null);
          }}
        />
      )}
    </div>
  );
}
