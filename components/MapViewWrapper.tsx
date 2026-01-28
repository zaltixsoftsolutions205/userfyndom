// components/MapViewWrapper.tsx - COMPLETE FILE
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface MapHostel {
  hostelId: string;
  hostelName: string;
  city: string;
  state: string;
  landmark: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface MapViewWrapperProps {
  latitude: number;
  longitude: number;
  title: string;
  allHostels?: MapHostel[];
}

const MapViewWrapper: React.FC<MapViewWrapperProps> = ({ 
  latitude, 
  longitude, 
  title,
  allHostels = []
}) => {
  const [region, setRegion] = useState({
    latitude: latitude || 17.385044,
    longitude: longitude || 78.486671,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (latitude && longitude) {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [latitude, longitude]);

  const validHostels = allHostels.filter(hostel => 
    hostel.coordinates && 
    Math.abs(hostel.coordinates.latitude) > 0 && 
    Math.abs(hostel.coordinates.longitude) > 0 &&
    hostel.coordinates.latitude !== 0 &&
    hostel.coordinates.longitude !== 0
  );

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        zoomControlEnabled={true}
      >
        <Marker
          coordinate={{
            latitude: latitude || 17.385044,
            longitude: longitude || 78.486671,
          }}
          title={title || "Hostel Location"}
          description="Selected Hostel"
          pinColor="#4CBB17"
        />

        {validHostels.map((hostel, index) => (
          <Marker
            key={`${hostel.hostelId}-${index}`}
            coordinate={{
              latitude: hostel.coordinates.latitude,
              longitude: hostel.coordinates.longitude,
            }}
            title={hostel.hostelName}
            description={hostel.city}
            pinColor="#2196F3"
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapViewWrapper;