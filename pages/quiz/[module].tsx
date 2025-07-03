import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

export default function PageName() {
  const { user } = useAuth();
  if (!user) return <p>Please log in</p>;
  return <div>PageName works!</div>;
}