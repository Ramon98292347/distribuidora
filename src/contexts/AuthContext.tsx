import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthUser {
  id: string;
  username: string;
  type: 'admin' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, companyName: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, type')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        setUser({
          id: profile.id,
          username: profile.name,
          type: profile.type === 'admin' ? 'admin' : 'user'
        });
        return;
      }

      setUser({
        id: authUser.id,
        username: authUser.email?.split('@')[0] || 'Usuário',
        type: 'user'
      });
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      setUser({
        id: authUser.id,
        username: authUser.email?.split('@')[0] || 'Usuário',
        type: 'user'
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.'
      });

      return {};
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro ao fazer login' };
    }
  };

  const register = async (email: string, password: string, name: string, companyName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company_name: companyName,
            requested_role: 'admin',
            trial_requested: true,
            trial_days: 7
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: 'Cadastro de teste realizado!',
        description: 'Confira seu e-mail para confirmar a conta e iniciar os 7 dias grátis.'
      });

      return {};
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { error: 'Erro ao cadastrar usuário' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);

      toast({
        title: 'Logout realizado com sucesso!',
        description: 'Até logo.'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
