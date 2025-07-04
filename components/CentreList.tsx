import React from 'react';

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

interface CentreListProps {
  centers: Center[];
  onSelectCenter?: (center: Center) => void;
}

const CentreList: React.FC<CentreListProps> = ({ centers, onSelectCenter }) => {
  return (
    <div className="space-y-4">
      {centers.map((center) => (
        <div key={center.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{center.name}</h3>
          <p className="text-gray-600 mb-2">{center.address}, {center.city}</p>
          <p className="text-gray-600 mb-2">Rating: {center.rating}</p>
          <p className="text-gray-600 mb-2">Fees: ₹{center.fees}</p>
          <button
            onClick={() => onSelectCenter && onSelectCenter(center)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Select Center
          </button>
        </div>
      ))}
    </div>
  );
};

export default CentreList;