import { createClient } from '@supabase/supabase-js';
import { BookOpenCheck, Edit2, Link as LinkIcon, Unlink, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function AdminEnrollments() {
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email, plan_type, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white block">Gestão de Matrículas</h2>
          <p className="text-zinc-400 mt-2">Gerencie os acessos e planos dos alunos na plataforma.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <LinkIcon className="mr-2 h-4 w-4" /> Nova Matrícula
        </Button>
      </div>

      <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-black/20 hover:bg-transparent border-white/10">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-400">Aluno</TableHead>
              <TableHead className="text-zinc-400">Plano Ativo</TableHead>
              <TableHead className="text-zinc-400 text-center">Data Ref.</TableHead>
              <TableHead className="text-zinc-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!users || users.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="h-6 w-6 opacity-50" />
                    <p>Nenhuma matrícula registrada no sistema.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white py-4">
                    <p>{user.name}</p>
                    <p className="text-xs text-zinc-500 font-normal">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-primary font-medium tracking-wider uppercase text-xs">
                      {user.plan_type || 'NENHUMA'}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-center text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10" title="Editar Progresso/Plano">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-destructive hover:bg-destructive/20" title="Revogar Matrícula">
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
