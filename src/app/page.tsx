'use client';

import { useAuth } from '../components/AuthContext';
import Dashboard from '../components/Dashboard';
import Auth from '../components/Auth';
import CentreDashboard from '../components/CentreDashboard';
import CentreOnboarding from '../components/CentreOnboarding';
import Profile from '../components/Profile';
import CentreFinder from '../components/CentreFinder';
import React from 'react';
import { supabase } from '../supabaseClient';

export default function Home() {
  const { session, role, centreId, user } = useAuth();
  const [profileComplete, setProfileComplete] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setProfileComplete(null);
        setLoading(false);
        return;
      }
      // Fetch profile fields needed for completion
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();
      if (error || !data) {
        setProfileComplete(false);
      } else {
        setProfileComplete(!!data.name && !!data.phone);
      }
      setLoading(false);
    };
    checkProfile();
  }, [user]);

  if (!session) {
    return <Auth />;
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'centre') {
    if (!centreId) {
      return <CentreOnboarding />;
    }
    return <CentreDashboard />;
  }

  if (loading) return <div>Loading...</div>;
  if (profileComplete === false) {
    // Show profile completion form
    return <Profile />;
  }
  if (!centreId) {
    // Show centre/EMI selection
    return <CentreFinder />;
  }
  return <Dashboard />;
}

import AdminDashboard from '../components/AdminDashboard';
