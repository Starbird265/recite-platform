'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Assuming you have a supabaseClient.ts file
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: string | null;
  centreId: string | null;
  streakCount: number | null;
  lastCompletedDate: string | null;
};

const AuthContext = createContext<AuthContextType>({ user: null, session: null, role: null, centreId: null, streakCount: null, lastCompletedDate: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [centreId, setCentreId] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return;
      }
      setSession(sessionData.session);
      const currentUser = sessionData.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, centre_id, streak_count, last_completed_date')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setRole(null);
          setCentreId(null);
          setStreakCount(null);
          setLastCompletedDate(null);
        } else {
          setRole(profileData?.role || null);
          setCentreId(profileData?.centre_id || null);
          setStreakCount(profileData?.streak_count || null);
          setLastCompletedDate(profileData?.last_completed_date || null);
        }
      } else {
        setRole(null);
        setCentreId(null);
        setStreakCount(null);
        setLastCompletedDate(null);
      }
    };

    getSessionAndProfile();

  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, centreId, streakCount, lastCompletedDate }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};