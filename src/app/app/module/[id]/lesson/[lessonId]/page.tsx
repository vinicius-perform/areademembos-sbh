import { supabase } from '@/lib/supabase';
import LessonClient from './LessonClient';

export async function generateStaticParams() {
  const { data: modules } = await supabase.from('modules').select('id');
  const { data: lessons } = await supabase.from('lessons').select('id, module_id');

  const params: { id: string; lessonId: string }[] = [];

  if (modules) {
    modules.forEach((mod: any) => {
      params.push({ id: String(mod.id), lessonId: 'first' });
    });
  }

  if (lessons) {
    lessons.forEach((lesson: any) => {
      params.push({ id: String(lesson.module_id), lessonId: String(lesson.id) });
    });
  }

  return params;
}

export default function LessonPage({ params }: { params: any }) {
  return <LessonClient params={params} />;
}
