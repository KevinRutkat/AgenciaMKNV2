'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  getSessionInfo: () => { isValid: boolean; expiresAt: Date | null; timeLeft: string | null };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Si la sesión se ha renovado automáticamente, mostrar mensaje en consola
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed automatically - session extended');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      // Asegurar que el estado local se limpie inmediatamente
      setUser(null);
      setSession(null);
      // Limpieza defensiva de posibles claves de sesión en localStorage
      if (typeof window !== 'undefined') {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            // Formato típico: sb-<project-ref>-auth-token
            if (key && /^sb-.*-auth-token$/.test(key)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((k) => window.localStorage.removeItem(k));
        } catch {
          // Ignorar errores de almacenamiento (modo privado, etc.)
        }
      }
    }
  };

  const getSessionInfo = () => {
    if (!session) {
      return { isValid: false, expiresAt: null, timeLeft: null };
    }

    const expiresAt = new Date(session.expires_at! * 1000);
    const now = new Date();
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    
    if (timeLeftMs <= 0) {
      return { isValid: false, expiresAt, timeLeft: 'Expirada' };
    }

    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeLeft = `${hours}h ${minutes}m`;

    return { 
      isValid: true, 
      expiresAt, 
      timeLeft 
    };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    getSessionInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
