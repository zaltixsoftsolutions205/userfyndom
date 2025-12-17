import React from 'react';

interface MapViewWrapperProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export default function MapViewWrapper({ latitude, longitude, title }: MapViewWrapperProps) {
  return (
    <div
      style={{
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#555',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      🗺️ Map not available on web — {title || 'Hostel'} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
    </div>
  );
}
