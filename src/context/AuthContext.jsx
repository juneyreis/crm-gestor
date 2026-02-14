import { createContext, useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export const AuthContext = createContext();

/**
 * AuthContext v2 - Simplificado e Resiliente
 * Focado em velocidade e eliminação de travamentos de carregamento.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSyncing, setIsSyncing] = useState(false);

  // Função para sincronizar o perfil em background
  const syncProfile = async (authUser) => {
    if (!authUser) return;
    setIsSyncing(true);

    const isAdminEmail = authUser.email === 'juneyreis@gmail.com';
    console.log(`[Sync] Iniciando validação para: ${authUser.email} (ID: ${authUser.id})`);

    try {
      const { data, error: profileError } = await supabaseClient
        .from('user_rules')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (profileError) {
        // PGRST116 = O registro não foi encontrado (Behavior normal para novos usuários)
        const isNotFound = profileError.code === 'PGRST116';

        if (isNotFound) {
          console.log(`[Sync] Usuário ${authUser.email} não encontrado no rules. Iniciando auto-registro...`);

          if (isAdminEmail) {
            console.log(`[Sync] Admin detectado por e-mail, ignorando registro obrigatório.`);
            setIsSyncing(false);
            return;
          }

          // Tenta auto-registrar o usuário "órfão"
          const { error: insertError } = await supabaseClient
            .from('user_rules')
            .insert([{
              user_id: authUser.id,
              email: authUser.email,
              role: 'user',
              status: 'pending',
              plan_type: 'basic'
            }]);

          if (!insertError) {
            console.log(`[Sync] Auto-registro concluído como 'pending'.`);
            setError("Seu acesso foi registrado e aguarda liberação do administrador.");
          } else {
            console.error(`[Sync] Falha no auto-registro:`, insertError.message);
            // Se falhou por conflito de unicidade, talvez o usuário exista mas o select falhou
            if (insertError.code === '23505') {
              console.warn(`[Sync] Conflito de cadastro detectado. Usuário já pode existir.`);
              // Não desloga ainda, tenta manter a sessão
              setIsSyncing(false);
              return;
            }
            setError("Erro ao validar permissões. Entre em contato com o suporte.");
          }
          await logout();
          return;
        } else {
          // Outro erro de banco (ex: timeout, 500, RLS loop)
          console.error(`[Sync] Erro inesperado ao buscar perfil:`, profileError);
          if (isAdminEmail) {
            setIsSyncing(false);
            return; // Confia no e-mail se for admin
          }
          // Não desloga imediatamente por erro transitório para evitar frustração
          // Mas também não deixa isSyncing = false se quiser travar a tela
          setIsSyncing(false);
          return;
        }
      }

      if (!data) {
        // Caso teórico onde não há erro mas não há data
        if (!isAdminEmail) await logout();
        setIsSyncing(false);
        return;
      }
      console.log(`[Sync] Perfil carregado com sucesso. Status: ${data.status}`);

      // Se usuário está bloqueado
      if (data.status === 'blocked' || data.status === 'pending') {
        console.warn(`[Sync] Acesso negado pelo status: ${data.status}`);
        setError(data.status === 'blocked' ? "Conta bloqueada." : "Acesso aguardando ativação.");
        await logout();
        return;
      }

      // Atualiza com os dados finais do banco
      setUser({
        ...authUser,
        role: data.role || 'user',
        status: data.status || 'active',
        plan: data.plan_type || 'basic',
        isAdmin: data.role === 'admin' || isAdminEmail
      });
    } catch (err) {
      console.error('[Sync] Erro crítico na sincronização:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Inicialização Rápida e Não-Bloqueante
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabaseClient.auth.getSession();

        if (initialSession) {
          setSession(initialSession);
          // PERFIL PROVISÓRIO: Evita tela branca e libera o carregamento
          const provisionalUser = {
            ...initialSession.user,
            role: initialSession.user.email === 'juneyreis@gmail.com' ? 'admin' : 'user',
            isAdmin: initialSession.user.email === 'juneyreis@gmail.com'
          };
          setUser(provisionalUser);

          // Sincroniza em background
          syncProfile(initialSession.user);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false); // LIBERA O "CARREGANDO" SEMPRE
      }
    };

    initAuth();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, newSession) => {
        if (newSession) {
          setSession(newSession);
          const provUser = {
            ...newSession.user,
            role: newSession.user.email === 'juneyreis@gmail.com' ? 'admin' : 'user',
            isAdmin: newSession.user.email === 'juneyreis@gmail.com'
          };
          setUser(prev => prev || provUser);
          syncProfile(newSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error: loginError } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      setSession(data.session);
      setUser({
        ...data.user,
        role: data.user.email === 'juneyreis@gmail.com' ? 'admin' : 'user',
        isAdmin: data.user.email === 'juneyreis@gmail.com'
      });
      syncProfile(data.user);

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err.message };
    }
  };

  const signup = async (email, password) => {
    setError(null);
    try {
      const { data, error: signupError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` }
      });
      if (signupError) throw signupError;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err.message };
    }
  };

  const logout = async () => {
    console.log('[Auth] Iniciando logout atômico...');
    try {
      // Força o reset de todos os estados antes mesmo de chamar o Supabase
      setUser(null);
      setSession(null);
      setError(null);
      setIsSyncing(false);

      await supabaseClient.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Limpeza nuclear de storage para evitar conflitos cross-user
      localStorage.clear();
      sessionStorage.clear();

      // Força o redirecionamento ou refresh se necessário (opcional, dependendo da rota)
      console.log('[Auth] Logout concluído. Storage limpo.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      error,
      login,
      signup,
      logout,
      isSyncing,
      isAuthenticated: !!user // Agora autenticação depende do objeto de usuário validado
    }}>
      {children}
    </AuthContext.Provider>
  );
}
