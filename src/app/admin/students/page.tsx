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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Users className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Gestão de Comunidade</span>
          </div>
          <h2 className="text-4xl font-heading font-bold tracking-tight text-white uppercase">Membros e Acessos</h2>
          <p className="text-zinc-500 text-sm mt-1">Moderação de ingressos e controle de permissões premium.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="glass" size="sm" className="text-[10px] tracking-widest font-bold">EXPORTAR CSV</Button>
           <Button variant="premium" size="sm" className="text-[10px] tracking-widest font-bold">CONVIDAR MÉDICO</Button>
        </div>
      </div>

      {/* Tabela de Pendentes - Estilo Bento Card */}
      {pendingUsers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">Solicitações Aguardando Auditoria ({pendingUsers.length})</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map((user: any) => (
              <Card key={user.id} className="bg-[#1a1405]/20 border-primary/20 backdrop-blur-3xl overflow-hidden group hover:bg-[#1a1405]/30 transition-all duration-500">
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate font-medium uppercase tracking-widest">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                     <span>Solicitado em</span>
                     <span className="text-zinc-400">{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                     <Button onClick={() => handleApprove(user.id)} className="flex-1 h-10 bg-primary/10 text-primary hover:bg-primary text-[10px] font-bold tracking-widest uppercase border border-primary/20 hover:text-white transition-all">
                       Aprovar
                     </Button>
                     <Button onClick={() => handleReject(user.id)} variant="ghost" className="h-10 px-4 text-zinc-500 hover:text-destructive hover:bg-destructive/5 text-[10px] font-bold tracking-widest uppercase">
                       Ignorar
                     </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-black/40 border-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest">Base Geral de Membros</h3>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                   <span className="text-[9px] font-bold text-zinc-500 uppercase">Admin</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                   <span className="text-[9px] font-bold text-zinc-500 uppercase">Médico</span>
                </div>
             </div>
         </div>
        <Table>
          <TableHeader className="bg-black/40 border-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5 px-6">Identificação</TableHead>
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5">Nível de Acesso</TableHead>
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5">Modalidade</TableHead>
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5">Status CRM</TableHead>
              <TableHead className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-5 text-right px-6">Gestão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={5} className="h-40 text-center text-zinc-700">
                     <Clock className="h-6 w-6 animate-spin mx-auto mb-3 opacity-20" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Consultando base de dados...</span>
                  </TableCell>
               </TableRow>
            ) : (!activeUsers || activeUsers.length === 0) ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={5} className="h-40 text-center text-zinc-700">
                   <AlertCircle className="h-6 w-6 mx-auto mb-3 opacity-20" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Nenhum registro validado encontrado</span>
                </TableCell>
              </TableRow>
            ) : (
              activeUsers.map((user: any) => (
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
                    {user.role === 'admin' ? (
                       <Badge variant="premium" className="h-5 px-2 text-[8px] tracking-[0.2em] bg-primary/20 border-primary/30">ADMIN</Badge>
                    ) : (
                       <Badge variant="outline" className="h-5 px-2 text-[8px] tracking-[0.2em] border-blue-500/30 text-blue-400 bg-blue-500/5">MÉDICO</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                       <span className="text-[10px] font-bold text-zinc-800 tracking-widest italic">SISTEMA</span>
                    ) : user.plan_type === 'premium' ? (
                       <Badge variant="premium" className="h-5 px-2 text-[8px] tracking-[0.2em]">PREMIUM</Badge>
                    ) : (
                       <Badge variant="outline" className="h-5 px-2 text-[8px] tracking-[0.2em] border-zinc-700 text-zinc-500">ESSENTIAL</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                     {user.approval_status === 'approved' ? (
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Validado</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Restrito</span>
                        </div>
                     )}
                  </TableCell>
                  <TableCell className="text-right px-6">
                     <Button onClick={() => openEditModal(user)} variant="glass" size="sm" className="h-9 px-4 text-[9px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        Configurar
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
        <DialogContent className="sm:max-w-[480px] border-white/5 bg-[#0a0f0d]/98 backdrop-blur-3xl text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold uppercase tracking-tight">Perfis de Membro</DialogTitle>
              <DialogDescription className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">
                Controle de governança e permissões de acesso.
              </DialogDescription>
            </DialogHeader>
            
            {editingUser && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Identidade Nominal</Label>
                  <Input 
                    id="name" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    disabled={isSaving}
                    className="bg-white/[0.03] border-white/10 focus-visible:ring-primary/40 text-sm h-12 uppercase tracking-wide font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <Label htmlFor="status" className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Auditoria</Label>
                     <select 
                       id="status" 
                       value={editStatus}
                       onChange={(e) => setEditStatus(e.target.value)}
                       disabled={isSaving || editingUser.role === 'admin'}
                       className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-30 transition-all"
                     >
                       <option value="pending" className="bg-[#0a0f0d]">Pendente</option>
                       <option value="approved" className="bg-[#0a0f0d]">Aprovado</option>
                       <option value="rejected" className="bg-[#0a0f0d]">Rejeitado</option>
                     </select>
                   </div>
                   
                   <div className="space-y-3">
                     <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Tier do Membro</Label>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => setEditPlan('basic')}
                          disabled={isSaving || editingUser.role === 'admin'}
                          className={`flex-1 h-12 rounded-xl border transition-all text-[9px] font-bold tracking-widest uppercase ${editPlan === 'basic' ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-400'}`}
                        >
                           Essential
                        </button>
                        <button 
                          onClick={() => setEditPlan('premium')}
                          disabled={isSaving || editingUser.role === 'admin'}
                          className={`flex-1 h-12 rounded-xl border transition-all text-[9px] font-bold tracking-widest uppercase ${editPlan === 'premium' ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(191,155,95,0.2)]' : 'bg-white/[0.02] border-white/5 text-zinc-600 hover:text-zinc-400'}`}
                        >
                           Premium
                        </button>
                     </div>
                   </div>
                </div>

                {editingUser.role !== 'admin' && (
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <div className="flex items-start gap-4">
                        <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                           <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Acesso Estratégico</p>
                           <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Membros com tier <span className="text-white">Premium</span> possuem bypass imediato em todos os bloqueios temporais de aula.</p>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="pt-4 flex gap-3">
               <Button variant="ghost" onClick={() => setEditingUser(null)} disabled={isSaving} className="h-12 text-[10px] font-bold text-zinc-600 tracking-widest uppercase px-6">Cancelar</Button>
               <Button onClick={handleSaveEdit} disabled={isSaving} variant="premium" className="h-12 text-[10px] font-bold tracking-widest uppercase flex-1 shadow-lg">
                 {isSaving ? "PROCESSANDO..." : "VALIDAR ALTERAÇÕES"}
               </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
