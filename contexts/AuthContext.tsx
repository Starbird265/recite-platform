import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

type User = { id: string; email: string; [key: string]: any } | null;
const AuthContext = createContext<{ user: User }>({ user: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    // initialize
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);