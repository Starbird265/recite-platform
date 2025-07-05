import { useState, useEffect } from 'react';
import Head from 'next/head';
import CentreMap from '../components/CentreMap';
import CentreList from '../components/CentreList';
import { getCentres } from '../utils/api';

interface Center {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  fees: number;
  capacity: number;
  verified: boolean;
}

export default function FindCentrePage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  useEffect(() => {
    const fetchCentersData = async () => {
      try {
        const data = await getCentres();
        setCenters(data as Center[]);
      } catch (err) {
        setError('Failed to fetch centers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCentersData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading centers...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <Head>
        <title>Find a Centre | RS-CIT Platform</title>
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Find Your Nearest Centre</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CentreMap onSelectCenter={setSelectedCenter} />
          </div>
          <div>
            <CentreList centers={centers} onSelectCenter={setSelectedCenter} />
          </div>
        </div>
        {selectedCenter && (
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <h2 className="text-xl font-semibold">Selected Centre: {selectedCenter.name}</h2>
            <p>{selectedCenter.address}, {selectedCenter.city}</p>
            <button 
              onClick={() => alert(`Booking for ${selectedCenter.name}`)} 
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Book Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
