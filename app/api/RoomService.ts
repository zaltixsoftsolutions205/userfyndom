// app/api/RoomService.ts
import ApiClient from "./ApiClient";

export interface Room {
  _id?: string;
  floor: string;
  roomNumber: string;
  sharingType: string;
  capacity: number;
  occupied: number;
  remaining: number;
  isAvailable: boolean;
  status?: string;
}

export interface BedAvailabilityBySharing {
  sharingType: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
}

export interface SharingTypeAvailability {
  available: boolean;
  totalRooms?: number;
  availableRooms?: number;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds?: number;
}

export interface RoomsSummary {
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds?: number;
  availableBeds: number;
  totalRooms: number;
}

export interface SharingTypeAvailabilityMap {
  single: SharingTypeAvailability;
  double: SharingTypeAvailability;
  triple: SharingTypeAvailability;
  four: SharingTypeAvailability;
  five: SharingTypeAvailability;
  six: SharingTypeAvailability;
  seven: SharingTypeAvailability;
  eight: SharingTypeAvailability;
  nine: SharingTypeAvailability;
  ten: SharingTypeAvailability;
}

export interface HostelInfo {
  hostelId: string;
  hostelName: string;
  hostelType: string;
}

// Updated to match ACTUAL API response structure
export interface RoomsResponse {
  success: boolean;
  data: {
    hostelInfo: HostelInfo;
    rooms: Room[];
    bedAvailabilityBySharing: BedAvailabilityBySharing[]; // This is the key array
    summary: RoomsSummary;
  };
}

// Define all valid sharing type keys as a union type
export type SharingTypeKey = 
  | 'single' | 'double' | 'triple' | 'four' | 'five' 
  | 'six' | 'seven' | 'eight' | 'nine' | 'ten';

// Helper function to check if a string is a valid SharingTypeKey
export function isSharingTypeKey(key: string): key is SharingTypeKey {
  const validKeys: SharingTypeKey[] = [
    'single', 'double', 'triple', 'four', 'five',
    'six', 'seven', 'eight', 'nine', 'ten'
  ];
  return validKeys.includes(key as SharingTypeKey);
}

class RoomService {
  // Get all rooms for a specific hostel (public endpoint - no authentication needed)
  async getHostelRooms(hostelId: string): Promise<RoomsResponse> {
    return await ApiClient.get<RoomsResponse>(
      `/public/rooms/hostel/${hostelId}`
    );
  }

  // Helper to transform API response to match expected format
  private transformApiResponse(apiResponse: RoomsResponse['data']): {
    rooms: Room[];
    sharingTypeAvailability: SharingTypeAvailabilityMap;
    summary: RoomsSummary;
  } {
    // Initialize all sharing types with default values
    const sharingTypeAvailability: SharingTypeAvailabilityMap = {
      single: { available: false, totalBeds: 0, availableBeds: 0 },
      double: { available: false, totalBeds: 0, availableBeds: 0 },
      triple: { available: false, totalBeds: 0, availableBeds: 0 },
      four: { available: false, totalBeds: 0, availableBeds: 0 },
      five: { available: false, totalBeds: 0, availableBeds: 0 },
      six: { available: false, totalBeds: 0, availableBeds: 0 },
      seven: { available: false, totalBeds: 0, availableBeds: 0 },
      eight: { available: false, totalBeds: 0, availableBeds: 0 },
      nine: { available: false, totalBeds: 0, availableBeds: 0 },
      ten: { available: false, totalBeds: 0, availableBeds: 0 }
    };

    // Process bedAvailabilityBySharing array
    if (apiResponse.bedAvailabilityBySharing && Array.isArray(apiResponse.bedAvailabilityBySharing)) {
      apiResponse.bedAvailabilityBySharing.forEach(item => {
        const typeKey = this.getSharingTypeKey(item.sharingType);
        if (isSharingTypeKey(typeKey)) {
          sharingTypeAvailability[typeKey] = {
            available: item.availableBeds > 0,
            totalBeds: item.totalBeds,
            availableBeds: item.availableBeds,
            occupiedBeds: item.occupiedBeds
          };
        }
      });
    }

    // Calculate room counts for each sharing type
    const roomCounts: Record<string, { total: number; available: number }> = {};
    
    apiResponse.rooms?.forEach(room => {
      const typeKey = this.getSharingTypeKey(room.sharingType);
      if (!roomCounts[typeKey]) {
        roomCounts[typeKey] = { total: 0, available: 0 };
      }
      roomCounts[typeKey].total++;
      if (room.isAvailable) {
        roomCounts[typeKey].available++;
      }
    });

    // Add room counts to availability
    Object.keys(sharingTypeAvailability).forEach(key => {
      if (isSharingTypeKey(key) && roomCounts[key]) {
        sharingTypeAvailability[key].totalRooms = roomCounts[key].total;
        sharingTypeAvailability[key].availableRooms = roomCounts[key].available;
      }
    });

    return {
      rooms: apiResponse.rooms || [],
      sharingTypeAvailability,
      summary: {
        totalBeds: apiResponse.summary?.totalBeds || 0,
        occupiedBeds: apiResponse.summary?.occupiedBeds || 0,
        vacantBeds: apiResponse.summary?.availableBeds || 0,
        totalRooms: apiResponse.summary?.totalRooms || 0
      }
    };
  }

  // Get hostel rooms with transformed response
  async getHostelRoomsTransformed(hostelId: string): Promise<{
    success: boolean;
    data: {
      rooms: Room[];
      sharingTypeAvailability: SharingTypeAvailabilityMap;
      summary: RoomsSummary;
      originalData?: any;
    };
  }> {
    const response = await this.getHostelRooms(hostelId);
    
    if (response.success && response.data) {
      const transformedData = this.transformApiResponse(response.data);
      return {
        success: true,
        data: {
          ...transformedData,
          originalData: response.data // Keep original for reference
        }
      };
    }
    
    // Return empty structure if API fails
    return {
      success: false,
      data: {
        rooms: [],
        sharingTypeAvailability: {
          single: { available: false, totalBeds: 0, availableBeds: 0 },
          double: { available: false, totalBeds: 0, availableBeds: 0 },
          triple: { available: false, totalBeds: 0, availableBeds: 0 },
          four: { available: false, totalBeds: 0, availableBeds: 0 },
          five: { available: false, totalBeds: 0, availableBeds: 0 },
          six: { available: false, totalBeds: 0, availableBeds: 0 },
          seven: { available: false, totalBeds: 0, availableBeds: 0 },
          eight: { available: false, totalBeds: 0, availableBeds: 0 },
          nine: { available: false, totalBeds: 0, availableBeds: 0 },
          ten: { available: false, totalBeds: 0, availableBeds: 0 }
        },
        summary: {
          totalBeds: 0,
          occupiedBeds: 0,
          vacantBeds: 0,
          totalRooms: 0
        }
      }
    };
  }

  // Get available beds count by sharing type - UPDATED VERSION
  getAvailableBedsBySharingType(
    roomsData: { sharingTypeAvailability: SharingTypeAvailabilityMap },
    sharingType: string
  ): number {
    const typeKey = this.getSharingTypeKey(sharingType);
    
    if (isSharingTypeKey(typeKey)) {
      return roomsData.sharingTypeAvailability[typeKey]?.availableBeds || 0;
    }
    
    return 0;
  }

  // Convert sharing type to key
  getSharingTypeKey(sharingType: string): string {
    const sharingMap: Record<string, string> = {
      '1 Sharing': 'single',
      '2 Sharing': 'double',
      '3 Sharing': 'triple',
      '4 Sharing': 'four',
      '5 Sharing': 'five',
      '6 Sharing': 'six',
      '7 Sharing': 'seven',
      '8 Sharing': 'eight',
      '9 Sharing': 'nine',
      '10 Sharing': 'ten',
      'single': 'single',
      'double': 'double',
      'triple': 'triple',
      'four': 'four',
      'five': 'five',
      'six': 'six',
      'seven': 'seven',
      'eight': 'eight',
      'nine': 'nine',
      'ten': 'ten'
    };

    return sharingMap[sharingType] || sharingType.toLowerCase();
  }

  // Get display name from key
  getSharingTypeDisplay(sharingTypeKey: string): string {
    const displayMap: Record<SharingTypeKey, string> = {
      'single': '1 Sharing',
      'double': '2 Sharing',
      'triple': '3 Sharing',
      'four': '4 Sharing',
      'five': '5 Sharing',
      'six': '6 Sharing',
      'seven': '7 Sharing',
      'eight': '8 Sharing',
      'nine': '9 Sharing',
      'ten': '10 Sharing'
    };

    return isSharingTypeKey(sharingTypeKey) 
      ? displayMap[sharingTypeKey] 
      : sharingTypeKey;
  }

  // Get all available sharing types
  getAvailableSharingTypes(roomsData: { sharingTypeAvailability: SharingTypeAvailabilityMap }): string[] {
    const availableTypes: string[] = [];
    const sharingTypes: SharingTypeKey[] = [
      'single', 'double', 'triple', 'four', 'five', 
      'six', 'seven', 'eight', 'nine', 'ten'
    ];

    sharingTypes.forEach(type => {
      if (roomsData.sharingTypeAvailability[type]?.available) {
        availableTypes.push(this.getSharingTypeDisplay(type));
      }
    });

    return availableTypes;
  }

  // Get rooms by sharing type
  getRoomsBySharingType(rooms: Room[], sharingType: string): Room[] {
    const typeKey = this.getSharingTypeKey(sharingType);
    
    return rooms.filter(room =>
      this.getSharingTypeKey(room.sharingType) === typeKey && room.isAvailable
    );
  }

  // Check if a sharing type is available (has beds)
  isSharingTypeAvailable(
    roomsData: { sharingTypeAvailability: SharingTypeAvailabilityMap }, 
    sharingType: string
  ): boolean {
    const typeKey = this.getSharingTypeKey(sharingType);
    
    if (isSharingTypeKey(typeKey)) {
      const availability = roomsData.sharingTypeAvailability[typeKey];
      return availability?.available && (availability.availableBeds > 0);
    }
    
    return false;
  }

  // Get total available beds across all sharing types
  getTotalAvailableBeds(roomsData: { sharingTypeAvailability: SharingTypeAvailabilityMap }): number {
    let total = 0;
    const sharingTypes: SharingTypeKey[] = [
      'single', 'double', 'triple', 'four', 'five', 
      'six', 'seven', 'eight', 'nine', 'ten'
    ];

    sharingTypes.forEach(type => {
      total += roomsData.sharingTypeAvailability[type]?.availableBeds || 0;
    });

    return total;
  }

  // Get all sharing types with their availability
  getAllSharingTypesWithAvailability(roomsData: { sharingTypeAvailability: SharingTypeAvailabilityMap }): 
    Array<{type: SharingTypeKey; display: string; availability: SharingTypeAvailability}> {
    
    const result: Array<{type: SharingTypeKey; display: string; availability: SharingTypeAvailability}> = [];
    const sharingTypes: SharingTypeKey[] = [
      'single', 'double', 'triple', 'four', 'five', 
      'six', 'seven', 'eight', 'nine', 'ten'
    ];

    sharingTypes.forEach(type => {
      result.push({
        type,
        display: this.getSharingTypeDisplay(type),
        availability: roomsData.sharingTypeAvailability[type]
      });
    });

    return result;
  }

  // Helper to get all valid sharing type keys
  getAllSharingTypeKeys(): SharingTypeKey[] {
    return ['single', 'double', 'triple', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  }

  // Get availability for a specific type (type-safe)
  getSharingTypeAvailability(
    roomsData: { sharingTypeAvailability: SharingTypeAvailabilityMap }, 
    typeKey: string
  ): SharingTypeAvailability | null {
    if (isSharingTypeKey(typeKey)) {
      return roomsData.sharingTypeAvailability[typeKey];
    }
    return null;
  }

  // NEW: Direct method to get availability from bedAvailabilityBySharing array
  getBedAvailabilityFromArray(bedAvailabilityArray: BedAvailabilityBySharing[], sharingType: string): number {
    const typeKey = this.getSharingTypeKey(sharingType);
    const availability = bedAvailabilityArray.find(item => 
      this.getSharingTypeKey(item.sharingType) === typeKey
    );
    return availability?.availableBeds || 0;
  }
}

export default new RoomService();