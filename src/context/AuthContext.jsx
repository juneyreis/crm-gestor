import { createContext, useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar sessão ao iniciar
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Obter sessão atual
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, newSession) => {
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Cadastro
  const signup = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      // Após signup bem-sucedido, fazer login automático
      if (data?.user) {
        // Fazer login automático primeiro
        const loginResponse = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (loginResponse.error) throw loginResponse.error;

        setSession(loginResponse.data.session);
        setUser(loginResponse.data.session.user);

        // Criar registro em user_rules como 'user' padrão
        // IMPORTANTE: Fazer após login para ter sessão ativa
        try {
          const { data: roleData, error: roleError } = await supabaseClient
            .from('user_rules')
            .insert([{
              user_id: data.user.id,
              role: 'user',
              email: data.user.email
            }])
            .select();

          if (roleError) {
            console.error('❌ Erro ao criar user_rules:', roleError);
            console.error('Detalhes:', {
              message: roleError.message,
              code: roleError.code,
              details: roleError.details
            });
          } else {
            console.log('✅ user_rules criado com sucesso:', roleData);
          }
        } catch (roleErr) {
          console.error('❌ Erro ao criar user_rules (catch):', roleErr);
        }
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao cadastrar';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  // Login
  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.session.user);

      return { data, error: null };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao fazer login';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    setError(null);
    try {
      // Tentar logout com scope local (não global) para evitar erro 403
      const { error } = await supabaseClient.auth.signOut({ scope: 'local' });

      if (error) {
        console.error('Erro no signOut do Supabase:', error);
        throw error;
      }

      // Limpar estado local
      setSession(null);
      setUser(null);

      return { error: null };
    } catch (err) {
      console.error('Erro ao fazer logout:', err);

      // Fallback: limpar manualmente o localStorage
      // Isso garante que o usuário consiga sair mesmo com erro 403
      try {
        // Limpar tokens do Supabase
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      } catch (storageErr) {
        console.error('Erro ao limpar localStorage:', storageErr);
      }

      // Mesmo com erro do servidor, limpar estado local
      setSession(null);
      setUser(null);

      const errorMessage = err.message || 'Erro ao fazer logout';
      setError(errorMessage);

      // Retornar sucesso mesmo com erro do servidor
      // pois o estado local foi limpo e o usuário pode continuar
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signup,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
