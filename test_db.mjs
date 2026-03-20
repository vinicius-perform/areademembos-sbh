import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://brmkhfvmjgwtbotiaooa.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJybWtoZnZtamd3dGJvdGlhb29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NjMyNTMsImV4cCI6MjA4OTUzOTI1M30.5fKNXOiLAhcoMN1y5UB8thflyjsoo1rHngrwi22KmKM');

async function test() {
  const { data, error } = await supabase
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
        duration,
        "order"
      )
    `);
  console.log("Result:", JSON.stringify({ data, error }, null, 2));
}
test();
