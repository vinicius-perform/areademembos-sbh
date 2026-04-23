import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaySquare, Users, Video, BookOpenCheck, TrendingUp, AlertCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const [{ count: modulesCount }, { count: lessonsCount }, { count: usersCount }, { data: latestUsers }] = await Promise.all([
    supabase.from('modules').select('*', { count: 'exact', head: true }),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const stats = [
    { title: 'Gestão de Módulos', value: modulesCount ?? 0, icon: PlaySquare, description: 'Módulos estruturados', trend: '+2 este mês' },
    { title: 'Comunidade Global', value: usersCount ?? 0, icon: Users, description: 'Médicos ativos', trend: '+15% crescimento' },
    { title: 'Acervo de Aulas', value: lessonsCount ?? 0, icon: Video, description: 'Conteúdos publicados', trend: 'Auditado' },
    { title: 'Novas Matrículas', value: 0, icon: BookOpenCheck, description: 'Nas últimas 24h', trend: 'Estável' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Visão Geral</span>
          </div>
          <h2 className="text-4xl font-heading font-bold tracking-tight text-white uppercase">Centro de Controle</h2>
          <p className="text-zinc-500 text-sm mt-1">Gerenciamento estratégico da plataforma SBH Premium.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="glass" size="sm" className="text-[10px] tracking-widest font-bold">RELATÓRIO PDF</Button>
           <Button variant="premium" size="sm" className="text-[10px] tracking-widest font-bold">NOVO MÓDULO</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, i) => (
          <Card key={i} className="bg-black/40 border-white/5 backdrop-blur-2xl group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {item.title}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                <item.icon className="h-4 w-4 text-zinc-400 group-hover:text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold text-white mb-1">{item.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-zinc-500">{item.description}</p>
                <span className="text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">{item.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-black/40 border-white/5 backdrop-blur-2xl overflow-hidden group">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white font-heading font-medium">Fluxo de Engajamento</CardTitle>
                <CardDescription className="text-zinc-500 text-xs">Acompanhamento de acessos semanais</CardDescription>
              </div>
              <div className="flex gap-2">
                 <div className="h-2 w-2 rounded-full bg-primary" />
                 <div className="h-2 w-2 rounded-full bg-zinc-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center p-0 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(191,155,95,0.05),transparent)] pointer-events-none" />
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                <TrendingUp className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">Dados analíticos em processamento...</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-black/40 border-white/5 backdrop-blur-2xl flex flex-col group">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-white font-heading font-medium">Últimas Matrículas</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Membros recém-admitidos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="divide-y divide-white/5">
              {!latestUsers || latestUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                  <AlertCircle className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-xs uppercase tracking-widest font-bold">Nenhum registro</p>
                </div>
              ) : (
                latestUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors group/item">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 group-hover/item:border-primary/30 transition-all">
                      <Users className="h-5 w-5 text-zinc-500 group-hover/item:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Entrou em</p>
                       <p className="text-[10px] text-primary font-medium">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
             <Button variant="ghost" className="w-full text-[10px] tracking-widest font-bold h-10 hover:bg-primary/5">VER TODOS OS ALUNOS</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
