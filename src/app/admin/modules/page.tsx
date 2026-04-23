import { supabase } from '@/lib/supabase';
import { ModulesList } from '@/components/modules/modules-list';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminModulesPage() {
  const { data: modules, error } = await supabase
    .from('modules')
    .select(`
      id, 
      title,
      description,
      cover_image_vertical,
      banner_image_horizontal,
      "order",
      status,
      lessons (
        id,
        title,
        video_url,
        is_premium,
        premium_start_date,
        release_date,
        attachments,
        "order"
      )
    `)
    .order('order', { ascending: true });

  if (error) {
    console.error("Erro ao puxar dados para módulos:", error.message);
  }

  return <ModulesList modules={modules || []} />;
}
