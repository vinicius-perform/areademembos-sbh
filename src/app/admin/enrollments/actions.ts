'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function updateEnrollmentAction(userId: string, data: { plan_type?: string, name?: string }) {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)

    if (error) throw error
    
    revalidatePath('/admin/enrollments')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating enrollment:', error)
    return { success: false, error: error.message }
  }
}

export async function revokeEnrollmentAction(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin/enrollments')
    return { success: true }
  } catch (error: any) {
    console.error('Error revoking enrollment:', error)
    return { success: false, error: error.message }
  }
}
