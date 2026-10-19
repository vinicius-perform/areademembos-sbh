import { supabase } from '@/lib/supabase';
import StudentHomeClient from '@/components/layout/student-home-client';

export const revalidate = 60;

export default async function StudentHome() {
  const [configResult, modulesResult] = await Promise.all([
    supabase.from('home_config').select('*').eq('id', 1).single(),
    supabase.from('modules').select('*').order('order', { ascending: true })
  ]);
  
  const config = configResult.data;
  const modulesToUse = modulesResult.data || [];

  return <StudentHomeClient config={config} modulesToUse={modulesToUse} />;
}
