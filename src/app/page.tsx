'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { setSessionAction } from './actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Setup master admin direto no Client-Side (Evita hang da API do Next.js)
      if (email === 'bruna@sbh.com' && password === '252501as') {
        let authUserId: string | undefined;

        // Tenta logar primeiro
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        authUserId = signInData?.user?.id;

        // Se falhar, tenta criar (SignUp)
        if (signInError) {
           const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
           if (signUpError && !signUpError.message.includes('already')) {
              throw new Error(`Auth SignUp Erro: ${signUpError.message}`);
           }
           authUserId = signUpData?.user?.id;
           
           // Se criou mas não logou, tenta logar novamente
           if (!authUserId) {
              const { data: signInRetry } = await supabase.auth.signInWithPassword({ email, password });
              authUserId = signInRetry?.user?.id;
           }
        }

        if (!authUserId) throw new Error("Erro Crítico: Não foi possível obter o ID do usuário no Auth.");

        // Atualiza a tabela com o Role = admin de forma Idempotente
        const { error: dbError } = await supabase.from('users').upsert({
           id: authUserId,
           email: 'bruna@sbh.com',
           name: 'Bruna',
           role: 'admin'
        }, { onConflict: 'id' });

        if (dbError && dbError.code !== 'PGRST116') {
           throw new Error(`Erro na Tabela 'users' (Execute o schema.sql!): ${dbError.message}`);
        }

        await setSessionAction('admin');
        router.push('/admin/dashboard');
        return;
      }

      // Permite bypass mock para o aluno conforme requisitos
      if (email === 'aluno' || email === 'aluno@sbh.com') {
        await setSessionAction('student');
        router.push('/app/home');
        return;
      }

      // Fluxo principal para estudantes logarem
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) throw new Error('Credenciais inválidas. Verifique e tente novamente.');

      // Puxa a role do usuário no banco
      const { data: userRow } = await supabase.from('users').select('role, approval_status').eq('id', data.user.id).single();
      
      const role = userRow?.role || 'student';
      const status = userRow?.approval_status || 'pending';

      if (role === 'admin') {
        await setSessionAction('admin');
        router.push('/admin/dashboard');
        return;
      }

      if (status === 'pending') {
        await supabase.auth.signOut();
        throw new Error('Seu cadastro foi enviado e está aguardando aprovação.');
      }

      if (status === 'rejected') {
        await supabase.auth.signOut();
        throw new Error('Seu acesso não foi aprovado. Entre em contato com a administração.');
      }

      await setSessionAction('student');
      router.push('/app/home');

    } catch (err: any) {
      console.error("Login catch block:", err);
      setError(err.message || 'Erro inesperado no sistema de login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
       if (password !== confirmPassword) {
         throw new Error('As senhas não coincidem.');
       }
       if (password.length < 6) {
         throw new Error('A senha deve ter no mínimo 6 caracteres.');
       }
       if (!name.trim()) {
         throw new Error('O nome completo é obrigatório.');
       }

       // Attempt to create user
       const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
         email, 
         password,
         options: {
           data: { name }
         } 
       });

       if (signUpError) {
         if (signUpError.message.includes('already')) {
            throw new Error('Este e-mail já está cadastrado.');
         }
         throw new Error(`Erro ao criar conta: ${signUpError.message}`);
       }

       if (!signUpData.user) {
         throw new Error('Erro ao criar usuário.');
       }

       // Create user profile in 'users' table
       const { error: dbError } = await supabase.from('users').upsert({
         id: signUpData.user.id,
         email: email,
         name: name,
         role: 'student',
         approval_status: 'pending'
       }, { onConflict: 'id' });

       if (dbError) throw new Error(`Erro ao salvar perfil no banco: ${dbError.message}`);

       setSuccessMessage('Cadastro enviado com sucesso. Aguarde a aprovação do administrador para acessar a plataforma.');
       
       // Force sign out in case signUp auto-logged in
       await supabase.auth.signOut();

       // Limpar
       setEmail('');
       setPassword('');
       setConfirmPassword('');
       setName('');
       
       setTimeout(() => {
         setIsRegistering(false);
         setSuccessMessage('');
       }, 5000);

    } catch (err: any) {
       setError(err.message || 'Erro inesperado no cadastro.');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0a0f0d]">
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-[400px] border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-white">
              {isRegistering ? 'Criar sua conta' : 'SBH Premium'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {isRegistering ? 'Solicite seu acesso VIP preenchendo os dados' : 'Acesso exclusivo à área de membros'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium text-center"
              >
                {successMessage}
              </motion.div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
              <div className="space-y-4">
                {isRegistering && (
                   <div className="space-y-2">
                     <Label htmlFor="name" className="text-zinc-300">Nome Completo</Label>
                     <div className="relative">
                       <Input
                         id="name"
                         type="text"
                         placeholder="Seu nome"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50 h-11"
                         required={isRegistering}
                         disabled={loading}
                       />
                     </div>
                   </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email {isRegistering ? 'Profissional' : 'ou Usuário'}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="bruna@sbh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50 h-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-300">Senha</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50 h-11"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {isRegistering && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="confirmPassword" className="text-zinc-300">Confirmar Senha</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50 h-11"
                        required={isRegistering}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-destructive text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide transition-all shadow-[0_4px_14px_0_oklch(0.75_0.14_80_/_0.39)] disabled:opacity-50"
              >
                {loading ? 'Aguarde...' : (isRegistering ? 'Solicitar Acesso' : 'Acessar Plataforma')}
              </Button>

              <div className="text-center text-sm text-zinc-400 mt-4">
               {isRegistering ? (
                 <>Já tem uma conta? <button type="button" onClick={() => { setIsRegistering(false); setError(''); setSuccessMessage(''); }} className="text-primary hover:underline hover:text-primary/80 font-medium">Voltar para o login</button></>
               ) : (
                 <>Ainda não tem acesso? <button type="button" onClick={() => { setIsRegistering(true); setError(''); setSuccessMessage(''); }} className="text-primary hover:underline hover:text-primary/80 font-medium">Criar conta</button></>
               )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
