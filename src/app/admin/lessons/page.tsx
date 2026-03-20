'use client';

import { Plus, Video, Edit2, Trash2, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const mockLessons = [
  { id: '1', title: 'Boas vindas e Visão Geral', module: '1. Introdução à Prática', duration: '12:45', status: 'publicado' },
  { id: '2', title: 'Preparação do Centro Cirúrgico', module: '1. Introdução à Prática', duration: '45:20', status: 'publicado' },
  { id: '3', title: 'Fios e Agulhas: O Essencial', module: '2. Técnicas de Sutura', duration: '28:10', status: 'rascunho' },
];

export default function AdminLessons() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white block">Gestão de Aulas</h2>
          <p className="text-zinc-400 mt-2">Adicione ou edite as aulas da plataforma de forma unificada.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nova Aula
        </Button>
      </div>

      <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input placeholder="Buscar aula..." className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50" />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-black/20 hover:bg-transparent border-white/10">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-400">Aula</TableHead>
              <TableHead className="text-zinc-400">Módulo</TableHead>
              <TableHead className="text-zinc-400 text-center">Duração</TableHead>
              <TableHead className="text-zinc-400 text-center">Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLessons.map((lesson) => (
              <TableRow key={lesson.id} className="border-white/10 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-white flex items-center gap-3 py-4">
                  <div className="h-10 w-10 border border-white/10 rounded-lg bg-black/40 flex items-center justify-center">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                  {lesson.title}
                </TableCell>
                <TableCell className="text-zinc-300">{lesson.module}</TableCell>
                <TableCell className="text-zinc-400 text-center">{lesson.duration}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={lesson.status === 'publicado' ? 'border-primary/50 text-primary bg-primary/10' : 'border-zinc-500 text-zinc-400 bg-zinc-800/50'}>
                    {lesson.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10" title="Editar">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-destructive hover:bg-destructive/20" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
