import { StudentHeader } from '@/components/layout/student-header';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#050806] text-white selection:bg-primary/30 selection:text-white">
      <StudentHeader />
      <main className="w-full pb-20">
        {children}
      </main>
    </div>
  );
}
