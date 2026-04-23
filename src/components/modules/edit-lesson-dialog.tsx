'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, FileText, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EditLessonDialogProps {
  lesson: any; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLessonDialog({ lesson, open, onOpenChange }: EditLessonDialogProps) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStartDate, setPremiumStartDate] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [successMSG, setSuccessMSG] = useState<string | null>(null);

  useEffect(() => {
    if (lesson && open) {
      setTitle(lesson.title || '');
      setVideoUrl(lesson.video_url || '');
      setIsPremium(lesson.is_premium || false);
      setPremiumStartDate(lesson.premium_start_date ? lesson.premium_start_date.split('T')[0] : '');
      setReleaseDate(lesson.release_date ? lesson.release_date.split('T')[0] : '');
      setAttachments(lesson.attachments || []);
      setErrorMSG(null);
      setSuccessMSG(null);
    }
  }, [lesson, open]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return;
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    setErrorMSG(null);
    setSuccessMSG(null);

    // Validações
    if (!title.trim()) {
      setErrorMSG('O título da aula é obrigatório.');
      return;
    }
    if (!videoUrl.trim()) {
       setErrorMSG('A URL do vídeo é obrigatória.');
       return;
    }

    if (isPremium && !premiumStartDate) {
       setErrorMSG('Se a aula for Premium, você deve selecionar a data de liberação.');
       return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('lessons').update({
        title,
        video_url: videoUrl,
        is_premium: isPremium,
        premium_start_date: isPremium ? (premiumStartDate ? new Date(premiumStartDate + 'T00:00:00').toISOString() : null) : null,
        release_date: releaseDate ? new Date(releaseDate + 'T00:00:00').toISOString() : null,
        attachments: attachments
      }).eq('id', lesson.id);

      if (error) throw new Error(`Erro ao salvar aula: ${error.message}`);

      setSuccessMSG('Aula atualizada com sucesso!');
      
      setTimeout(() => {
        handleOpenChange(false);
        router.refresh();
      }, 1000);

    } catch (err: any) {
      setErrorMSG(err.message || 'Erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-white/10 bg-[#050806]/95 backdrop-blur-3xl text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Editar Aula</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Alterando informações da aula <span className="text-primary font-medium">{title}</span>.
          </DialogDescription>
        </DialogHeader>

        {errorMSG && (
          <div className="flex items-center gap-2 p-3 rounded-lg overflow-hidden bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
             <AlertCircle className="h-4 w-4 shrink-0" />
             <span>{errorMSG}</span>
          </div>
        )}

        {successMSG && (
          <div className="flex items-center gap-2 p-3 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 text-primary text-sm">
             <CheckCircle2 className="h-4 w-4 shrink-0" />
             <span>{successMSG}</span>
          </div>
        )}

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-300">Título da Aula <span className="text-red-500">*</span></Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tipos de Fios Cirúrgicos" 
              disabled={isLoading || !!successMSG}
              className="bg-black/40 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-zinc-600 h-10" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url" className="text-zinc-300">YouTube Video ID ou URL <span className="text-red-500">*</span></Label>
            <Input 
              id="video_url" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Ex: dQw4w9WgXcQ" 
              disabled={isLoading || !!successMSG}
              className="bg-black/40 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-zinc-600 h-10" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="release_date" className="text-zinc-300">Data de Estreia</Label>
            <Input 
              id="release_date" 
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              disabled={isLoading || !!successMSG}
              className="bg-black/40 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-zinc-600 h-10 w-full [&::-webkit-calendar-picker-indicator]:[filter:invert(65%)_sepia(85%)_saturate(400%)_hue-rotate(10deg)] cursor-pointer" 
            />
            <p className="text-xs text-zinc-500">Data em que a aula ficará visível para os alunos.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="is_premium" 
                checked={isPremium} 
                onChange={(e) => {
                  setIsPremium(e.target.checked);
                  if (!e.target.checked) setPremiumStartDate('');
                }}
                className="w-5 h-5 rounded border-white/20 bg-black/40 text-primary focus:ring-primary/50"
              />
              <Label htmlFor="is_premium" className="text-zinc-300 font-medium cursor-pointer text-base">
                Aula Premium 👑
              </Label>
            </div>
            
            {isPremium && (
              <div className="space-y-2 mt-4 pl-8 border-l-2 border-primary/30 py-1">
                <Label htmlFor="premium_start_date" className="text-zinc-300 text-sm">Data de ativação do Premium <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input 
                    id="premium_start_date" 
                    type="date"
                    value={premiumStartDate}
                    onChange={(e) => setPremiumStartDate(e.target.value)}
                    disabled={isLoading || !!successMSG}
                    className="bg-black/40 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-zinc-600 h-10 w-full [&::-webkit-calendar-picker-indicator]:[filter:invert(65%)_sepia(85%)_saturate(400%)_hue-rotate(10deg)] cursor-pointer" 
                  />
                </div>
                <p className="text-xs text-zinc-500">A partir desta data, a aula será restrita a usuários pagantes.</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Materiais Complementares</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                disabled={isUploading || isLoading || !!successMSG}
                className="h-8 border-primary/30 text-primary hover:bg-primary/10 gap-2"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                Adicionar Arquivo
              </Button>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  setIsUploading(true);
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                    const filePath = `materials/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                      .from('courses')
                      .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                      .from('courses')
                      .getPublicUrl(filePath);

                    setAttachments([...attachments, { name: file.name, url: publicUrl, size: file.size }]);
                  } catch (err: any) {
                    setErrorMSG(`Erro no upload: ${err.message}`);
                  } finally {
                    setIsUploading(false);
                    e.target.value = '';
                  }
                }} 
              />
            </div>

            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {attachments.length === 0 ? (
                <p className="text-xs text-zinc-600 italic text-center py-4 border border-dashed border-white/5 rounded-lg">
                  Nenhum material adicionado.
                </p>
              ) : (
                attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-zinc-300 truncate">{file.name}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" disabled={isLoading} className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl px-6" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !!successMSG} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-6 transition-all shadow-[0_4px_20px_0_rgba(212,175,55,0.4)]"
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
