import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function handler() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !adminKey) {
      return NextResponse.json({ error: 'Supabase keys missing' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, adminKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = 'bruna@sbh.com';
    const password = '252501as';

    let userId: string | undefined;

    // 1. Tentar fazer signIn primeiro (idempotente se der certo)
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (!signInError && signInData.user) {
      userId = signInData.user.id;
    } else {
      // Não existe ou erro de credencial, tenta criar
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createError) {
           return NextResponse.json({ error: 'Falha admin.createUser: ' + createError.message }, { status: 400 });
        }
        userId = createData.user?.id;
      } else {
        // Fallback p/ signUp (sujeito a email-confirmation dependendo do painel)
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          return NextResponse.json({ error: 'Falha signUp anon: ' + signUpError.message }, { status: 400 });
        }
        userId = signUpData.user?.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Não foi possível resolver o ID do usuário.' }, { status: 500 });
    }

    // 2. Garante registro na tabela `users` com role 'admin' e o mesmo ID!
    const { error: dbError } = await supabaseAdmin.from('users').upsert({
      id: userId,
      email: email,
      name: 'Bruna',
      role: 'admin',
    }, { onConflict: 'id' });

    if (dbError) {
      return NextResponse.json({ error: 'Erro ao sincronizar tabela users: ' + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin configurado e sincronizado com sucesso!',
      userId 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() { return handler(); }
export async function POST() { return handler(); }
