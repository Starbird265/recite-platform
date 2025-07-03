'use client';

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '../supabaseClient';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

type CentreType = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  // Add other centre properties like contact, status, etc.
};

const emiPlans = [
  { label: '3 months (₹1,566/mo)', value: '3' },
  { label: '4 months (₹1,175/mo)', value: '4' },
  { label: '6 months (₹783/mo)', value: '6' },
];

const CentreFinder = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(75.7139);
  const [lat, setLat] = useState(26.9124);
  const [zoom, setZoom] = useState(9);
  const [centres, setCentres] = useState<CentreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<string | null>(null);
  const [selectedEmi, setSelectedEmi] = useState<string>('3');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = require('./AuthContext').useAuth();

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const { data, error } = await supabase
          .from('centres')
          .select('id, name, address, latitude, longitude')
          .eq('status', 'approved'); // Only show approved centres

        if (error) throw error;
        setCentres(data || []);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch centres.');
      } finally {
        setLoading(false);
      }
    };
    fetchCentres();
  }, []);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('move', () => {
      setLng(parseFloat(map.current!.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current!.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(map.current!.getZoom().toFixed(2)));
    });

    // Add markers for centres
    map.current.on('load', () => {
      centres.forEach((centre) => {
        if (centre.longitude && centre.latitude) {
          new mapboxgl.Marker()
            .setLngLat([centre.longitude, centre.latitude])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${centre.name}</h3><p>${centre.address}</p>`))
            .addTo(map.current!);
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [centres]); // Re-run effect when centres data changes

  const handleSelect = async (centreId: string) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (!user) throw new Error('User not found.');
      // Save centre and EMI plan to user profile
      const { error } = await supabase
        .from('profiles')
        .update({ centre_id: centreId, emi_plan: selectedEmi })
        .eq('id', user.id);
      if (error) throw error;
      setSelectedCentre(centreId);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save selection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading centres...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0 mb-4">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-3">Step 2: Select Your Centre & EMI Plan</h2>
              <p className="text-center text-muted mb-4">Choose a nearby ITGK centre and your preferred EMI plan to continue your RS-CIT journey.</p>
              <div className="mb-4">
                <div ref={mapContainer} style={{ height: '350px', width: '100%' }} className="mb-3 rounded" />
                <div className="sidebar mb-2 text-center text-secondary">
                  Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="mb-2">Choose EMI Plan <span className='text-danger'>*</span></h4>
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  {emiPlans.map((plan) => (
                    <div className="form-check form-check-inline" key={plan.value}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="emiPlan"
                        id={`emi-${plan.value}`}
                        value={plan.value}
                        checked={selectedEmi === plan.value}
                        onChange={() => setSelectedEmi(plan.value)}
                        disabled={success}
                      />
                      <label className="form-check-label fw-bold" htmlFor={`emi-${plan.value}`}>{plan.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <h4 className="mb-3">Available Centres</h4>
              <div className="row">
                {centres.length > 0 ? (
                  centres.map((centre) => (
                    <div className="col-md-6 col-lg-4 mb-4" key={centre.id}>
                      <div className={`card h-100 ${selectedCentre === centre.id ? 'border-success' : ''}`}>
                        <div className="card-body">
                          <h5 className="card-title">{centre.name}</h5>
                          <p className="card-text">{centre.address}</p>
                          <button
                            className="btn btn-primary w-100 mt-2"
                            onClick={() => handleSelect(centre.id)}
                            disabled={saving || success}
                          >
                            {selectedCentre === centre.id && success ? 'Selected!' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12"><p>No approved centres found.</p></div>
                )}
              </div>
              {success && (
                <div className="alert alert-success text-center mt-4">
                  Centre and EMI plan saved! You can now continue to your dashboard.
                </div>
              )}
              {error && (
                <div className="alert alert-danger text-center mt-4">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentreFinder;
