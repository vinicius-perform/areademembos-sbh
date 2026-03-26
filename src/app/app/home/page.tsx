import { supabase } from '@/lib/supabase';
import StudentHomeClient from '@/components/layout/student-home-client';

export const dynamic = 'force-dynamic';

export default async function StudentHome() {
  const { data: config } = await supabase.from('home_config').select('*').eq('id', 1).single();
  const { data: dbModules } = await supabase.from('modules').select('*').order('order', { ascending: true });
  
  const modulesToUse = dbModules || [];

  return <StudentHomeClient config={config} modulesToUse={modulesToUse} />;
}
