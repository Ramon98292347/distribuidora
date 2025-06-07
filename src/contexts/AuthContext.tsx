
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
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          loadUserProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        // Se não encontrar o usuário na tabela users, criar um usuário básico
        setUser({
          id: authUser.id,
          username: authUser.email?.split('@')[0] || 'Usuário',
          type: 'user'
        });
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          username: profile.name || profile.email,
          type: profile.role as 'admin' | 'user'
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback: criar usuário básico se houver erro
      setUser({
        id: authUser.id,
        username: authUser.email?.split('@')[0] || 'Usuário',
        type: 'user'
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });

      return {};
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Erro ao fazer login' };
    }
  };

  const register = async (email: string, password: string, name: string, role: 'admin' | 'user' = 'user') => {
    try {
      // Primeiro, criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (authError) {
        return { error: authError.message };
      }

      // Se o usuário foi criado com sucesso, inserir na tabela users
      if (authData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            name: name,
            role: role
          });

        if (insertError) {
          console.error('Error inserting user profile:', insertError);
          // Não retornar erro aqui, pois o usuário já foi criado no Auth
        }
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você já pode fazer login.",
      });

      return {};
    } catch (error) {
      console.error('Register error:', error);
      return { error: 'Erro ao cadastrar usuário' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo.",
      });
    } catch (error) {
      console.error('Logout error:', error);
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
