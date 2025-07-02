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

const CentreFinder = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(75.7139);
  const [lat, setLat] = useState(26.9124);
  const [zoom, setZoom] = useState(9);
  const [centres, setCentres] = useState<CentreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div>Loading centres...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header"><h2>Find a Centre</h2></div>
        <div className="card-body">
          <div ref={mapContainer} style={{ height: '400px', width: '100%' }} className="mb-3" />
          <div className="sidebar">
            Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
          </div>
          <h3>Available Centres</h3>
          {centres.length > 0 ? (
            <ul className="list-group">
              {centres.map((centre) => (
                <li key={centre.id} className="list-group-item">
                  <h5>{centre.name}</h5>
                  <p>{centre.address}</p>
                  {/* Add more centre details here */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No approved centres found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CentreFinder;
