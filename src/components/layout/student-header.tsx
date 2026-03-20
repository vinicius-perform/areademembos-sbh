'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearSessionAction } from '@/app/actions';

export function StudentHeader() {
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await clearSessionAction();
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm transition-all duration-300 border-b border-white/5">
      <div className="flex items-center justify-between px-8 h-20 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/app/home" className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
            SBH <span className="text-primary">Premium</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/app/home" className={`text-sm font-medium transition-colors ${pathname === '/app/home' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>
              Conteúdo
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white hover:bg-white/10 rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors" onClick={handleLogout} title="Sair">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
