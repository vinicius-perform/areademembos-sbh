'use client'

import React, { useState } from 'react'
import { Edit2, Unlink, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateEnrollmentAction, revokeEnrollmentAction } from '@/app/admin/enrollments/actions'

interface EnrollmentActionsClientProps {
  user: {
    id: string
    name: string
    email: string
    plan_type: string
    password?: string
  }
}

export function EnrollmentActionsClient({ user }: EnrollmentActionsClientProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // States for Edit Form
  const [formData, setFormData] = useState({
    name: user.name,
    plan_type: user.plan_type as 'basic' | 'premium',
    password: user.password || ''
  })

  const handleUpdate = async () => {
    setIsLoading(true)
    const result = await updateEnrollmentAction(user.id, formData)
    setIsLoading(false)
    if (result.success) {
      setIsEditDialogOpen(false)
    } else {
      alert('Erro ao atualizar: ' + result.error)
    }
  }

  const handleRevoke = async () => {
    setIsLoading(true)
    const result = await revokeEnrollmentAction(user.id)
    setIsLoading(false)
    if (result.success) {
      setIsRevokeDialogOpen(false)
    } else {
      alert('Erro ao revogar: ' + result.error)
    }
  }

  return (
    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger
          render={
            <Button variant="glass" size="icon" className="h-9 w-9 text-zinc-500 hover:text-white" title="Editar Progresso/Plano">
              <Edit2 className="h-4 w-4" />
            </Button>
          }
        />
        <DialogContent className="bg-black/90 border-white/10 backdrop-blur-3xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-medium tracking-tight uppercase">Editar Matrícula</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Altere os dados de acesso de {user.name} ({user.email}).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nome do Aluno</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-zinc-900/50 border-white/5 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Senha de Acesso</Label>
              <Input 
                id="password" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Defina uma nova senha..."
                className="bg-zinc-900/50 border-white/5 focus:border-primary/50 text-primary font-mono"
              />
              <p className="text-[9px] text-zinc-600 uppercase tracking-tight">Cuidado: Alterar este campo mudará a senha de login do aluno imediatamente.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Tipo de Plano</Label>
              <Select 
                value={formData.plan_type} 
                onValueChange={(val: any) => setFormData({ ...formData, plan_type: val })}
              >
                <SelectTrigger className="bg-zinc-900/50 border-white/5 focus:border-primary/50">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="basic">ESSENTIAL MEMBER</SelectItem>
                  <SelectItem value="premium">PLATINUM PREMIUM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="border-white/5 hover:bg-white/5 text-[10px] font-black tracking-widest uppercase"
            >
              Cancelar
            </Button>
            <Button 
              variant="premium" 
              onClick={handleUpdate} 
              disabled={isLoading}
              className="h-10 px-6 text-[10px] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(191,155,95,0.2)]"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              SALVAR ALTERAÇÕES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogTrigger
          render={
            <Button variant="glass" size="icon" className="h-9 w-9 text-zinc-500 hover:text-destructive" title="Revogar Matrícula">
              <Unlink className="h-4 w-4" />
            </Button>
          }
        />
        <DialogContent className="bg-black/90 border-red-900/20 backdrop-blur-3xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-medium tracking-tight uppercase text-destructive">Revogar Matrícula?</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Esta ação é irreversível. O aluno <strong>{user.name}</strong> perderá acesso imediato à plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex items-center justify-center">
             <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Unlink className="h-10 w-10 text-red-500" />
             </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsRevokeDialogOpen(false)}
              className="border-white/5 hover:bg-white/5 text-[10px] font-black tracking-widest uppercase"
            >
              Manter Acesso
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevoke}
              disabled={isLoading}
              className="h-10 px-6 text-[10px] font-black tracking-widest uppercase bg-red-600 hover:bg-red-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CONFIRMAR REVOGAÇÃO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
