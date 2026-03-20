'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, ShieldAlert, GraduationCap, Plus, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminStudents() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase.from('users').update({ approval_status: 'approved' }).eq('id', userId);
      if (error) throw error;
      fetchUsers();
    } catch (err: any) {
      alert(`Erro ao aprovar: ${err.message}`);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Deseja realmente rejeitar este usuário? O acesso dele será bloqueado.')) return;
    try {
      const { error } = await supabase.from('users').update({ approval_status: 'rejected' }).eq('id', userId);
      if (error) throw error;
      fetchUsers();
    } catch (err: any) {
      alert(`Erro ao rejeitar: ${err.message}`);
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditStatus(user.approval_status || 'pending');
    setEditPlan(user.plan_type || 'basic');
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
       const { error } = await supabase.from('users').update({
         name: editName,
         approval_status: editStatus,
         plan_type: editPlan
       }).eq('id', editingUser.id);
       if (error) throw error;
       
       alert("Usuário atualizado com sucesso!");
       setEditingUser(null);
       fetchUsers();
    } catch (err: any) {
       alert(`Erro ao salvar usuário: ${err.message}`);
    } finally {
       setIsSaving(false);
    }
  };

  const pendingUsers = users.filter((u: any) => u.approval_status === 'pending');
  const activeUsers = users.filter((u: any) => u.approval_status !== 'pending');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white block">Aprovações e Alunos</h2>
          <p className="text-zinc-400 mt-2">Gerencie solicitações de acesso e alunos da sua área de membros.</p>
        </div>
      </div>

      {/* Tabela de Pendentes */}
      {pendingUsers.length > 0 && (
        <Card className="bg-[#1a1405]/40 border-primary/20 backdrop-blur-md overflow-hidden">
          <div className="p-4 border-b border-primary/10 bg-primary/5 flex items-center gap-2">
             <Clock className="w-5 h-5 text-primary" />
             <h3 className="font-semibold text-primary">Solicitações Pendentes ({pendingUsers.length})</h3>
          </div>
          <Table>
            <TableHeader className="bg-black/20 hover:bg-transparent border-white/10">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">Usuário</TableHead>
                <TableHead className="text-zinc-400">Data de Solicitação</TableHead>
                <TableHead className="text-zinc-400 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user: any) => (
                <TableRow key={user.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white flex items-center gap-3 py-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p>{user.name}</p>
                      <p className="text-xs text-zinc-500 font-normal">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button onClick={() => handleApprove(user.id)} className="bg-green-600/20 text-green-500 hover:bg-green-600/40 border border-green-600/30">
                         <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                       </Button>
                       <Button onClick={() => handleReject(user.id)} variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/30">
                         <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
         <div className="p-4 border-b border-white/5 bg-white/5">
             <h3 className="font-semibold text-white">Usuários Processados (Aprovados / Rejeitados)</h3>
         </div>
        <Table>
          <TableHeader className="bg-black/20 hover:bg-transparent border-white/10">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-400">Usuário</TableHead>
              <TableHead className="text-zinc-400">Cargo</TableHead>
              <TableHead className="text-zinc-400">Plano do Aluno</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={3} className="h-32 text-center text-zinc-500">
                     Aguarde, carregando...
                  </TableCell>
               </TableRow>
            ) : (!activeUsers || activeUsers.length === 0) ? (
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableCell colSpan={3} className="h-32 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="h-6 w-6 opacity-50" />
                    <p>Nenhum usuário processado ainda.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              activeUsers.map((user: any) => (
                <TableRow key={user.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white flex items-center gap-3 py-4">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p>{user.name}</p>
                      <p className="text-xs text-zinc-500 font-normal">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={user.role === 'admin' ? 'border-primary/50 text-primary bg-primary/10 font-bold' : 'border-blue-400/30 text-blue-300 bg-blue-500/10'}
                    >
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Administrador</span>
                      ) : (
                        <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Aluno</span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                       <span className="text-zinc-600 text-xs italic">-</span>
                    ) : user.plan_type === 'premium' ? (
                       <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10 font-bold"><span className="flex items-center gap-1">👑 Premium</span></Badge>
                    ) : (
                       <Badge variant="outline" className="border-zinc-500/30 text-zinc-400 bg-zinc-800/30">Comum</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                     {user.approval_status === 'approved' ? (
                        <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">Aprovado</Badge>
                     ) : (
                        <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10">Rejeitado</Badge>
                     )}
                  </TableCell>
                  <TableCell className="text-right">
                     <Button onClick={() => openEditModal(user)} variant="ghost" size="sm" className="text-zinc-400 hover:text-white border border-white/5 hover:border-white/10 bg-black/20 hover:bg-white/10">
                        Editar
                     </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#050806]/95 backdrop-blur-3xl text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Usuário</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Gerencie as permissões e dados básicos deste usuário.
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Nome Completo</Label>
                <Input 
                  id="name" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  disabled={isSaving}
                  className="bg-black/40 border-white/10 focus-visible:ring-primary/50 text-white placeholder:text-zinc-600 h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-zinc-300">Status de Aprovação</Label>
                <select 
                  id="status" 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={isSaving || editingUser.role === 'admin'}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <option value="pending" className="bg-zinc-900">Pendente</option>
                  <option value="approved" className="bg-zinc-900">Aprovado</option>
                  <option value="rejected" className="bg-zinc-900">Rejeitado</option>
                </select>
              </div>

              {editingUser.role !== 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="plan" className="text-zinc-300">Plano do Aluno</Label>
                  <div className="p-3 border border-white/5 bg-black/20 rounded-xl space-y-3">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="plan_type" 
                          value="basic" 
                          checked={editPlan === 'basic' || !editPlan} 
                          onChange={(e) => setEditPlan(e.target.value)}
                          className="w-4 h-4 text-primary focus:ring-primary/50 bg-black/40 border-white/20"
                        />
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Aluno Comum (Básico)</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="plan_type" 
                          value="premium" 
                          checked={editPlan === 'premium'} 
                          onChange={(e) => setEditPlan(e.target.value)}
                          className="w-4 h-4 text-amber-500 focus:ring-amber-500/50 bg-black/40 border-white/20"
                        />
                        <span className="text-sm font-bold text-amber-500 group-hover:text-amber-400 transition-colors flex items-center gap-1">👑 Aluno Premium</span>
                     </label>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Alunos Premium ultrapassam os bloqueios de data configurados nas aulas.</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
             <Button variant="ghost" onClick={() => setEditingUser(null)} disabled={isSaving} className="text-zinc-400 hover:text-white">Cancelar</Button>
             <Button onClick={handleSaveEdit} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
               {isSaving ? "Salvando..." : "Salvar Alterações"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
