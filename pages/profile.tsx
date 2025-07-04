import { useEffect, useState } from 'react';
import { getUserDetails, updateUserProfile } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) return; // Wait for authUser to be loaded

    const fetchUserDetails = async () => {
      try {
        const fetchedUser = await getUserDetails();
        setUser(fetchedUser);
        setName(fetchedUser?.user_metadata?.name || '');
        setPhone(fetchedUser?.user_metadata?.phone || '');
      } catch (err) {
        setError('Failed to load user details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [authUser]);

  const handleUpdate = async () => {
    if (!authUser) return;
    setSaving(true);
    try {
      await updateUserProfile(name, phone);
      toast.success('Profile updated!');
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
      toast.error('Failed to update profile!');
    } finally {
      setSaving(false);
    }
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <Head>
        <title>Profile | RS-CIT Platform</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            id="name"
            className="border p-2 w-full rounded-md"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mt-4 mb-2">Phone</label>
          <input
            id="phone"
            className="border p-2 w-full rounded-md"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </div>
    </>
  );
}
