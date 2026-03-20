import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaySquare, Users, Video, BookOpenCheck, TrendingUp, AlertCircle } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const [{ count: modulesCount }, { count: lessonsCount }, { count: usersCount }, { data: latestUsers }] = await Promise.all([
    supabase.from('modules').select('*', { count: 'exact', head: true }),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white block">Dashboard</h2>
        <p className="text-zinc-400 mt-2">Visão geral do sistema de membros SBH Premium.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total de Módulos', value: modulesCount ?? 0, icon: PlaySquare, color: 'text-primary' },
          { title: 'Alunos Ativos', value: usersCount ?? 0, icon: Users, color: 'text-zinc-100' },
          { title: 'Total de Aulas', value: lessonsCount ?? 0, icon: Video, color: 'text-zinc-100' },
          { title: 'Matrículas Hoje', value: 0, icon: BookOpenCheck, color: 'text-green-400' },
        ].map((item, i) => (
          <Card key={i} className="bg-black/40 border-white/10 backdrop-blur-md shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Desempenho de Acessos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-zinc-500">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary/50" />
              <p>O gráfico será renderizado aqui com o Recharts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Últimos Alunos</CardTitle>
            <CardDescription className="text-zinc-400">Recém matriculados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!latestUsers || latestUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
                  <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhum aluno encontrado no banco de dados.</p>
                </div>
              ) : (
                latestUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white leading-none">{user.name}</p>
                      <p className="text-sm text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
