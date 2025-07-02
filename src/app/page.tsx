'use client';

import { useAuth } from '../components/AuthContext';
import Dashboard from '../components/Dashboard';
import Auth from '../components/Auth';
import CentreDashboard from '../components/CentreDashboard';
import CentreOnboarding from '../components/CentreOnboarding';

export default function Home() {
  const { session, role, centreId } = useAuth();

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

  return <Dashboard />;
}

import AdminDashboard from '../components/AdminDashboard';
}
