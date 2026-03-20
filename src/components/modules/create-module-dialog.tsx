'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, AlertCircle, CheckCircle2, Image as ImageIcon, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function CreateModuleDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Files
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [successMSG, setSuccessMSG] = useState<string | null>(null);

  // File Inputs
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return;
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBannerFile(null);
    setErrorMSG(null);
    setSuccessMSG(null);
  };

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
      let finalBanner = null;

      if (bannerFile) finalBanner = await uploadFileToStorage(bannerFile, 'banners');

      // Obter max order - simples: apenas inserimos e deixamos order ser o máximo + 1 
      const { data: currentModules, error: fetchErr } = await supabase.from('modules').select('order').order('order', { ascending: false }).limit(1);
      const nextOrder = (currentModules && currentModules.length > 0) ? (currentModules[0].order || 0) + 1 : 0;

      const { error: dbError } = await supabase.from('modules').insert({
        title,
        description,
        cover_image_vertical: finalBanner, // Preenchendo com o banner para retrocompatibilidade
        banner_image_horizontal: finalBanner,
        status: 'active',
        "order": nextOrder
      });

      if (dbError) throw new Error(`Erro ao salvar no banco: ${dbError.message}`);

      setSuccessMSG('Módulo criado com sucesso!');
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
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_4px_14px_0_oklch(0.75_0.14_80_/_0.39)] transition-transform hover:scale-105">
          <Plus className="mr-2 h-4 w-4" /> Novo Módulo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] border-white/10 bg-[#050806]/95 backdrop-blur-3xl text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Criar Novo Módulo</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Adicione um novo módulo na plataforma. Preencha as capas para exibi-las na Home.
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
              placeholder="Ex: Introdução ao Mercado"
              disabled={isLoading || !!successMSG}
              className="bg-black/40 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-zinc-600 h-12" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Descrição Curta (Opcional)</Label>
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sobre o que é este módulo..."
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
                {bannerFile ? (
                   <img src={URL.createObjectURL(bannerFile)} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80" />
                ) : (
                   <>
                     <ImageIcon className="h-8 w-8 text-zinc-500 group-hover:scale-110 transition-transform" />
                     <span className="text-xs text-center text-zinc-400">Banner amplo</span>
                   </>
                )}
              </div>
              <input type="file" ref={bannerInputRef} onChange={(e) => setBannerFile(e.target.files?.[0] || null)} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" disabled={isLoading} className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl px-6" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !!successMSG} className="bg-primary text-primary-foreground font-semibold rounded-xl px-6">
            {isLoading ? 'Criando...' : 'Criar Módulo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
