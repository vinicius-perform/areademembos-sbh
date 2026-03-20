'use client';

import { Settings, Save, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AdminSettings() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white block">Configurações</h2>
          <p className="text-zinc-400 mt-2">Ajuste as preferências globais da plataforma e integrações.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Gerais
            </CardTitle>
            <CardDescription className="text-zinc-400">Configurações básicas de SEO e nome do projeto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-zinc-300">Nome da Plataforma</Label>
              <Input id="siteName" defaultValue="SBH Premium" className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-zinc-300">Email de Suporte</Label>
              <Input id="contactEmail" defaultValue="suporte@sbh.com" className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Integrações
            </CardTitle>
            <CardDescription className="text-zinc-400">Tokens de API de serviços externos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabaseUrl" className="text-zinc-300">Supabase URL</Label>
              <Input id="supabaseUrl" type="password" defaultValue="************************" className="bg-black/20 border-white/10 text-zinc-500 focus-visible:ring-primary/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabaseKey" className="text-zinc-300">Supabase Anon Key</Label>
              <Input id="supabaseKey" type="password" defaultValue="********************************************************" className="bg-black/20 border-white/10 text-zinc-500 focus-visible:ring-primary/50" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" className="bg-transparent border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white">
            Descartar Alterações
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
            <Save className="w-4 h-4" />
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
