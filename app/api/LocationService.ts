// app/api/LocationService.ts - UPDATED WITH REAL APIS
import ApiClient from './ApiClient';
import HostelService from './HostelService';

export interface MapHostel {
  hostelId: string;
  hostelName: string;
  city: string;
  state: string;
  landmark: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  hostelType?: string;
}

export interface SearchResult {
  hostelId: string;
  hostelName: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface NearbyHostelResponse {
  success: boolean;
  total: number;
  data: MapHostel[];
}

export interface SearchHostelsResponse {
  success: boolean;
  total: number;
  data: SearchResult[];
}

export interface NearbyResponse {
  success: boolean;
  total: number;
  data: any[];
  message?: string;
}

export interface HostelLocationResponse {
  success: boolean;
  data: {
    hostelId: string;
    hostelName: string;
    location: {
      coordinates: {
        latitude: number;
        longitude: number;
      };
      formattedAddress: string;
      city: string;
      state: string;
      landmark: string;
    };
  };
}

class LocationService {
  async getAllHostelsForMap(): Promise<NearbyHostelResponse> {
    try {
      console.log('🗺️ Fetching all hostels for map view');
      const response = await ApiClient.get<NearbyHostelResponse>('/public/hostels/map');
      return response;
    } catch (error: any) {
      console.error('❌ Error fetching map hostels:', error);
      return {
        success: false,
        total: 0,
        data: []
      };
    }
  }

  async searchHostelsByArea(query: string): Promise<SearchHostelsResponse> {
    try {
      console.log(`🔍 Searching hostels by area: ${query}`);
      
      if (!query.trim()) {
        return {
          success: false,
          total: 0,
          data: []
        };
      }

      const response = await ApiClient.get<SearchHostelsResponse>(`/public/hostels/search?q=${encodeURIComponent(query)}`);
      
      console.log(`✅ Found ${response.total} hostels for area: ${query}`);
      return response;
      
    } catch (error: any) {
      console.error('❌ Error searching hostels:', error);
      return {
        success: false,
        total: 0,
        data: []
      };
    }
  }

  async getNearbyHostels(latitude: number, longitude: number, radius: number = 5): Promise<NearbyResponse> {
    try {
      console.log(`📍 Fetching nearby hostels: lat=${latitude}, lng=${longitude}, radius=${radius}km`);
      
      const response = await ApiClient.get<NearbyResponse>(
        `/public/hostels/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      
      console.log(`✅ Found ${response.total} nearby hostels`);
      
      if (response.success && response.data && response.data.length > 0) {
        const detailedHostels = [];
        
        for (const hostel of response.data) {
          try {
            const hostelDetail = await HostelService.getHostelById(hostel.hostelId);
            if (hostelDetail.success && hostelDetail.data) {
              detailedHostels.push({
                ...hostelDetail.data,
                distance: this.calculateDistance(
                  latitude,
                  longitude,
                  hostel.coordinates?.latitude || 0,
                  hostel.coordinates?.longitude || 0
                )
              });
            }
          } catch (error) {
            console.error(`Error fetching hostel details for ${hostel.hostelId}:`, error);
          }
        }
        
        return {
          success: true,
          total: detailedHostels.length,
          data: detailedHostels,
          message: `Found ${detailedHostels.length} nearby hostels`
        };
      }
      
      return response;
      
    } catch (error: any) {
      console.error('❌ Error in getNearbyHostels:', error);
      return {
        success: false,
        total: 0,
        data: [],
        message: error.message || 'Failed to fetch nearby hostels'
      };
    }
  }

  async getHostelLocation(hostelId: string): Promise<HostelLocationResponse> {
    try {
      console.log(`📍 Fetching location for hostel: ${hostelId}`);
      
      const response = await ApiClient.get<HostelLocationResponse>(`/public/hostels/location/${hostelId}`);
      
      return response;
      
    } catch (error: any) {
      console.error('❌ Error fetching hostel location:', error);
      return {
        success: false,
        data: {
          hostelId,
          hostelName: 'Unknown Hostel',
          location: {
            coordinates: {
              latitude: 17.385044,
              longitude: 78.486671
            },
            formattedAddress: 'Hyderabad, Telangana',
            city: 'Hyderabad',
            state: 'Telangana',
            landmark: ''
          }
        }
      };
    }
  }

  async getAllHostelCoordinates(): Promise<MapHostel[]> {
    try {
      console.log('🗺️ Fetching all hostel coordinates');
      
      const response = await this.getAllHostelsForMap();
      
      if (response.success && response.data) {
        const validHostels = response.data.filter(hostel => 
          hostel.coordinates && 
          Math.abs(hostel.coordinates.latitude) > 0 &&
          Math.abs(hostel.coordinates.longitude) > 0 &&
          hostel.coordinates.latitude !== 0 &&
          hostel.coordinates.longitude !== 0
        );
        
        console.log(`✅ Found ${validHostels.length} valid hostel coordinates`);
        return validHostels;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Error getting hostel coordinates:', error);
      return [];
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async getHostelCoordinates(hostelId: string): Promise<{latitude: number, longitude: number} | null> {
    try {
      const response = await this.getHostelLocation(hostelId);
      
      if (response.success && response.data?.location?.coordinates) {
        return response.data.location.coordinates;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error getting hostel coordinates:', error);
      return null;
    }
  }
}

export default new LocationService();