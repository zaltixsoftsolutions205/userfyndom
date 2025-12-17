import React from 'react';
import MapView, { Marker } from 'react-native-maps';

interface MapViewWrapperProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export default function MapViewWrapper({ latitude, longitude, title }: MapViewWrapperProps) {
  return (
    <MapView
      style={{ width: '100%', height: 200, borderRadius: 12 }}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={{ latitude, longitude }} title={title} />
    </MapView>
  );
}
