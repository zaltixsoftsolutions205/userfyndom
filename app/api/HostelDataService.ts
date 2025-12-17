// app/api/HostelDataService.ts
import ApiClient from "./ApiClient";
import FacilityService from "./FacilityService";
import RoomService from "./RoomService";

export interface CombinedHostelData {
  facilities: {
    sharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu?: string;
  };
  rooms: {
    list: any[];
    availability: {
      single: any;
      double: any;
      triple: any;
      four: any;
      five: any;
      six: any;
      seven: any;
      eight: any;
      nine: any;
      ten: any;
    };
    summary: {
      totalBeds: number;
      occupiedBeds: number;
      vacantBeds: number;
      totalRooms: number;
    };
  };
  pricing?: any;
}

class HostelDataService {
  // Get complete hostel data including facilities and rooms
  async getCompleteHostelData(hostelId: string): Promise<CombinedHostelData> {
    try {
      // Fetch facilities data
      const facilitiesResponse = await FacilityService.getHostelFacilities(hostelId);
      
      // Fetch rooms data
      const roomsResponse = await RoomService.getHostelRooms(hostelId);
      
      return {
        facilities: facilitiesResponse.data,
        rooms: {
          list: roomsResponse.data.rooms,
          availability: roomsResponse.data.sharingTypeAvailability,
          summary: roomsResponse.data.summary
        }
      };
    } catch (error) {
      console.error("Error fetching complete hostel data:", error);
      throw error;
    }
  }

  // Get available beds for a specific sharing type
  getAvailableBedsForSharingType(
    roomsData: any,
    sharingType: string
  ): number {
    const typeKey = RoomService.getSharingTypeKey(sharingType);
    return roomsData.availability[typeKey]?.availableBeds || 0;
  }

  // Check if sharing type is available (has beds and exists in facilities)
  isSharingTypeAvailable(
    sharingType: string,
    facilitiesData: any,
    roomsData: any
  ): boolean {
    // Check if it exists in facilities
    const existsInFacilities = facilitiesData.sharingTypes?.includes(sharingType);
    if (!existsInFacilities) return false;
    
    // Check if it has available beds
    const typeKey = RoomService.getSharingTypeKey(sharingType);
    const availableBeds = roomsData.availability[typeKey]?.availableBeds || 0;
    
    return availableBeds > 0;
  }

  // Get all available sharing types with their bed counts
  getAvailableSharingTypesWithBeds(
    facilitiesData: any,
    roomsData: any
  ): Array<{type: string; display: string; availableBeds: number}> {
    const availableTypes: Array<{type: string; display: string; availableBeds: number}> = [];
    
    if (!facilitiesData.sharingTypes) return availableTypes;
    
    facilitiesData.sharingTypes.forEach((sharingType: string) => {
      const typeKey = RoomService.getSharingTypeKey(sharingType);
      const availableBeds = roomsData.availability[typeKey]?.availableBeds || 0;
      
      if (availableBeds > 0) {
        availableTypes.push({
          type: typeKey,
          display: sharingType,
          availableBeds
        });
      }
    });
    
    return availableTypes.sort((a, b) => {
      const numA = parseInt(a.display);
      const numB = parseInt(b.display);
      return numA - numB;
    });
  }
}

export default new HostelDataService();