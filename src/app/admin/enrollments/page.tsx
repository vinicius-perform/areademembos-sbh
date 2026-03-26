import { createClient } from '@supabase/supabase-js';
import { BookOpenCheck, Edit2, Link as LinkIcon, Unlink, AlertCircle, Users } from 'lucide-react';
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <BookOpenCheck className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Gestão de Ativos</span>
          </div>
          <h2 className="text-4xl font-heading font-bold tracking-tight text-white uppercase">Controle de Matrículas</h2>
          <p className="text-zinc-500 text-sm mt-1">Monitoramento de vigência e status de planos ativos.</p>
        </div>
        <Button variant="premium" className="h-10 text-[10px] font-bold tracking-widest uppercase px-6">
          <LinkIcon className="mr-2 h-4 w-4" /> VINCULAR ALUNO
        </Button>
      </div>

      <Card className="bg-black/40 border-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest">Registros de Matrícula</h3>
             <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-[9px] font-bold tracking-widest uppercase hover:bg-white/5">Filtros Avançados</Button>
             </div>
         </div>
        <Table>
          <TableHeader className="bg-black/40 border-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5 px-6">Beneficiário</TableHead>
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5">Programa Habilitado</TableHead>
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5 text-center">Data de Ingresso</TableHead>
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5 text-right px-6">Ações de Gestão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!users || users.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={4} className="h-40 text-center text-zinc-700">
                   <AlertCircle className="h-6 w-6 mx-auto mb-3 opacity-20" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Nenhuma matrícula ativa no sistema</span>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.01] transition-colors group">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
                        <Users className="h-5 w-5 text-zinc-600 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-tight">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.plan_type === 'premium' ? (
                       <Badge variant="premium" className="h-5 px-2 text-[8px] tracking-[0.2em]">PLATINUM PREMIUM</Badge>
                    ) : (
                       <Badge variant="outline" className="h-5 px-2 text-[8px] tracking-[0.2em] border-zinc-700 text-zinc-500 bg-zinc-900/40">ESSENTIAL MEMBER</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                       {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <Button variant="glass" size="icon" className="h-9 w-9 text-zinc-500 hover:text-white" title="Editar Progresso/Plano">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="glass" size="icon" className="h-9 w-9 text-zinc-500 hover:text-destructive" title="Revogar Matrícula">
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
      
      <div className="p-8 bg-primary/[0.02] border border-primary/10 rounded-3xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
               <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
               <h4 className="text-lg font-heading font-medium text-white uppercase tracking-tight mb-2">Integridade de Matrícula</h4>
               <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl font-medium">As matrículas são sincronizadas em tempo real com o gateway de pagamento. Alterações manuais nesta tela podem afetar a conciliação financeira do sistema.</p>
            </div>
            <div className="md:ml-auto">
               <Button variant="outline" className="h-10 text-[10px] font-bold tracking-widest border-white/10 hover:bg-white/5 uppercase">Auditoria Log</Button>
            </div>
         </div>
      </div>
    </div>
  );
}
