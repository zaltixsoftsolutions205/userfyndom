import ApiClient from "./ApiClient";

export interface Room {
  _id: string;
  floor: string;
  roomNumber: string;
  sharingType: string;
  capacity: number;
  occupied: number;
  remaining: number;
  isAvailable: boolean;
  status: string;
}

export interface SharingTypeAvailability {
  available: boolean;
  totalRooms: number;
  availableRooms: number;
  totalBeds: number;
  availableBeds: number;
}

export interface RoomsSummary {
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
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

export interface RoomsResponse {
  success: boolean;
  data: {
    rooms: Room[];
    sharingTypeAvailability: SharingTypeAvailabilityMap;
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

  // Get available beds count by sharing type - TYPE SAFE VERSION
  getAvailableBedsBySharingType(
    roomsData: RoomsResponse['data'],
    sharingType: string
  ): number {
    const typeKey = this.getSharingTypeKey(sharingType);
    
    // Use the type guard
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
  getAvailableSharingTypes(roomsData: RoomsResponse['data']): string[] {
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

  // Get rooms by sharing type - TYPE SAFE VERSION
  getRoomsBySharingType(roomsData: RoomsResponse['data'], sharingType: string): Room[] {
    const typeKey = this.getSharingTypeKey(sharingType);
    
    if (!isSharingTypeKey(typeKey)) {
      return [];
    }
    
    return roomsData.rooms.filter(room =>
      this.getSharingTypeKey(room.sharingType) === typeKey && room.isAvailable
    );
  }

  // SIMPLE METHOD: Get available beds with type assertion (if you really need it)
  getAvailableBedsBySharingTypeSimple(
    roomsData: RoomsResponse['data'],
    sharingType: string
  ): number {
    const typeKey = this.getSharingTypeKey(sharingType);
    
    // Method 1: Use any (simplest)
    const availability = roomsData.sharingTypeAvailability as any;
    return availability[typeKey]?.availableBeds || 0;
  }

  // Get all sharing types with their availability
  getAllSharingTypesWithAvailability(roomsData: RoomsResponse['data']): 
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

  // Check if a sharing type is available (has beds)
  isSharingTypeAvailable(roomsData: RoomsResponse['data'], sharingType: string): boolean {
    const typeKey = this.getSharingTypeKey(sharingType);
    
    if (isSharingTypeKey(typeKey)) {
      const availability = roomsData.sharingTypeAvailability[typeKey];
      return availability?.available && (availability.availableBeds > 0);
    }
    
    return false;
  }

  // Get total available beds across all sharing types
  getTotalAvailableBeds(roomsData: RoomsResponse['data']): number {
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

  // Helper to get all valid sharing type keys
  getAllSharingTypeKeys(): SharingTypeKey[] {
    return ['single', 'double', 'triple', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  }

  // Get availability for a specific type (type-safe)
  getSharingTypeAvailability(roomsData: RoomsResponse['data'], typeKey: string): SharingTypeAvailability | null {
    if (isSharingTypeKey(typeKey)) {
      return roomsData.sharingTypeAvailability[typeKey];
    }
    return null;
  }
}

export default new RoomService();