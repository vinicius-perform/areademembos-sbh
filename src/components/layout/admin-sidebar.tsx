'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  FolderOpen,
  GraduationCap,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { clearSessionAction } from '@/app/actions';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Experiência do Aluno', href: '/admin/experience', icon: Sparkles },
  { name: 'Módulos e Aulas', href: '/admin/modules', icon: FolderOpen },
  { name: 'Alunos', href: '/admin/students', icon: Users },
  { name: 'Matrículas', href: '/admin/enrollments', icon: GraduationCap },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await clearSessionAction();
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col w-64 h-screen border-r border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white tracking-tight">SBH <span className="text-primary">Admin</span></h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`h-5 w-5 relative z-10 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium font-sm relative z-10">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-zinc-400 hover:text-white hover:bg-destructive/20 transition-all font-medium"
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
