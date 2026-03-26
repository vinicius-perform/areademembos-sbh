'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Bell, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearSessionAction } from '@/app/actions';

export function StudentHeader() {
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await clearSessionAction();
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-500 border-b border-white/5">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl z-0" />
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="relative z-10 flex items-center justify-between px-8 md:px-16 h-24 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/app/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-all">
               <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-bold tracking-widest text-white leading-none">SBH</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">MEMBER AREA</span>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/app/home" className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${pathname === '/app/home' ? 'text-primary' : 'text-zinc-500 hover:text-white'}`}>
              Dashboard
            </Link>
            <Link href="#" className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-white transition-all">
              Minha Biblioteca
            </Link>
            <Link href="#" className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-white transition-all">
              Comunidade
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-primary transition-colors relative group">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </Button>
          
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-white">Dr. Membro</span>
              <span className="text-[9px] text-primary uppercase tracking-widest font-bold">Plano Premium</span>
            </div>
            <Button 
               variant="ghost" 
               className="p-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
               onClick={handleLogout}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
