'use server'

import { cookies } from 'next/headers'

export async function setSessionAction(role: string) {
  const cookieStore = await cookies();
  cookieStore.set('session', role, { secure: true, httpOnly: true, path: '/' });
}

export async function clearSessionAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
