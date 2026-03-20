'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EditModuleDialogProps {
  module: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditModuleDialog({ module, open, onOpenChange }: EditModuleDialogProps) {
  const router = useRouter();

  const [title, setTitle] = useState(module.title || '');
  const [description, setDescription] = useState(module.description || '');
  
  const [bannerUrl, setBannerUrl] = useState<string | null>(module.banner_image_horizontal || module.cover_image_vertical || null);

  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [successMSG, setSuccessMSG] = useState<string | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);

  const uploadFileToStorage = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('courses').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(`Falha no upload (${folder}): ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from('courses').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSave = async () => {
    setErrorMSG(null);
    setSuccessMSG(null);

    if (!title.trim()) {
      setErrorMSG('O título do módulo é obrigatório.');
      return;
    }

    setIsLoading(true);

    try {
      let finalBanner = bannerUrl;

      if (bannerFile) finalBanner = await uploadFileToStorage(bannerFile, 'banners');

      const { error } = await supabase.from('modules').update({ 
        title,
        description,
        cover_image_vertical: finalBanner,
        banner_image_horizontal: finalBanner
      }).eq('id', module.id);

      if (error) throw new Error(`Erro ao atualizar: ${error.message}`);

      setSuccessMSG('Módulo atualizado com sucesso!');
      
      setTimeout(() => {
        onOpenChange(false);
        router.refresh();
      }, 1000);

    } catch (err: any) {
      setErrorMSG(err.message || 'Um erro inesperado ocorreu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if(!isLoading) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[700px] border-white/10 bg-[#050806]/95 backdrop-blur-3xl text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Editar Módulo</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Atualize as informações e imagens do módulo ativo.
          </DialogDescription>
        </DialogHeader>

        {errorMSG && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
             <AlertCircle className="h-4 w-4 shrink-0" />
             <span>{errorMSG}</span>
          </div>
        )}

        {successMSG && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
             <CheckCircle2 className="h-4 w-4 shrink-0" />
             <span>{successMSG}</span>
          </div>
        )}

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Título do Módulo <span className="text-red-500">*</span></Label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading || !!successMSG}
              className="bg-black/40 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-zinc-600 h-12" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Descrição Curta</Label>
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading || !!successMSG}
              className="bg-black/40 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-zinc-600 h-12" 
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Capa do Módulo (Horizontal)</Label>
              <div 
                onClick={() => !isLoading && bannerInputRef.current?.click()}
                className={`aspect-[21/9] w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all relative group cursor-pointer ${isLoading ? 'opacity-50' : 'bg-black/40 border-white/10 hover:border-primary/50 hover:bg-white/5'}`}
              >
                {(bannerFile || bannerUrl) ? (
                   <img src={bannerFile ? URL.createObjectURL(bannerFile) : bannerUrl!} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80" />
                ) : (
                   <>
                     <ImageIcon className="h-8 w-8 text-zinc-500 group-hover:scale-110 transition-transform" />
                     <span className="text-xs text-center text-zinc-400">Arraste ou clique</span>
                   </>
                )}
              </div>
              <input type="file" ref={bannerInputRef} onChange={(e) => setBannerFile(e.target.files?.[0] || null)} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" disabled={isLoading} className="text-zinc-400 hover:text-white" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !!successMSG} className="bg-primary text-primary-foreground font-semibold">
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
