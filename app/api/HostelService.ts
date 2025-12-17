// app/api/HostelService.ts
import ApiClient from './ApiClient';

export interface Hostel {
  _id: string;
  hostelName: string;
  address: string;
  contact: string;
  email: string;
  photos: Array<{
    filename: string;
    originalName: string;
    path: string;
    url: string;
    isPrimary: boolean;
    _id: string;
    uploadDate: string;
  }>;
  summary: string;
  startingPrice: number;
  pricing: {
    [key: string]: {
      daily: { price: number; currency: string; pricingId: string } | null;
      monthly: { price: number; currency: string; pricingId: string } | null;
      availableBeds: number;
      availableRooms: any[];
      totalRooms: number;
    };
  };
  facilities: {
    roomSharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
  };
  coordinates: {
    latitude?: number;
    longitude?: number;
  } | null;
  formattedAddress: string;
  availabilitySummary: {
    [key: string]: {
      availableBeds: number;
      totalBeds: number;
      availableRooms: any[];
    };
  };
  allRooms: any[];
  hostelType: string;
  hostelTypeDisplay: string;
  distance?: number;
  isNearby?: boolean;
}

export interface HostelsResponse {
  success: boolean;
  data: Hostel[];
  message: string;
  searchType: string;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface StartingPriceResponse {
  success: boolean;
  startingPrice: number;
  message: string;
}

export interface SingleHostelResponse {
  success: boolean;
  data: Hostel;
  message: string;
}

export interface FacilitiesResponse {
  success: boolean;
  data: {
    sharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu?: string;
  };
}

// Interface for combined pricing data
export interface CombinedPricingData {
  [key: string]: {
    daily: { price: number; currency: string; pricingId?: string } | null;
    monthly: { price: number; currency: string; pricingId?: string } | null;
    availableBeds: number;
    availableRooms: any[];
    totalRooms: number;
    isAvailable: boolean;
    displayName: string;
  };
}

class HostelService {
  // Get all hostels
  async getAllHostels(): Promise<HostelsResponse> {
    const response = await ApiClient.get<HostelsResponse>('/student/hostels');
    return response;
  }

  // Search hostels by keyword (name, address, area)
  async searchHostels(searchQuery: string): Promise<HostelsResponse> {
    const response = await ApiClient.get<HostelsResponse>('/student/hostels', {
      params: { search: searchQuery }
    });
    return response;
  }

  // Get nearby hostels based on location
  async getNearbyHostels(latitude: number, longitude: number, maxDistance: number = 10): Promise<HostelsResponse> {
    const response = await ApiClient.get<HostelsResponse>('/student/hostels', {
      params: {
        useLocation: true,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        maxDistance: maxDistance.toString()
      }
    });
    return response;
  }

  // Get starting price for a specific hostel
  async getStartingPrice(hostelId: string): Promise<StartingPriceResponse> {
    const response = await ApiClient.get<StartingPriceResponse>(
      `/student/hostels/${hostelId}/starting-price`
    );
    return response;
  }

  // Get hostel by ID with detailed information
  async getHostelById(hostelId: string): Promise<SingleHostelResponse> {
    const response = await ApiClient.get<SingleHostelResponse>(
      `/student/hostels/${hostelId}`
    );
    return response;
  }

  // Get facilities for a specific hostel
  async getHostelFacilities(hostelId: string): Promise<FacilitiesResponse> {
    const response = await ApiClient.get<FacilitiesResponse>(
      `/hostel-operations/facilities/student/${hostelId}`
    );
    return response;
  }

  // Calculate starting price locally from pricing data (fallback method)
  calculateLocalStartingPrice(pricing: any): number {
    if (!pricing) return 0;

    const prices: number[] = [];

    // Check each sharing type for monthly price
    const sharingTypes = ['single', 'double', 'triple', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

    sharingTypes.forEach(type => {
      if (pricing[type]?.monthly?.price && pricing[type].monthly.price > 0) {
        prices.push(pricing[type].monthly.price);
      }
    });

    // Return the minimum price if available, otherwise 0
    return prices.length > 0 ? Math.min(...prices) : 0;
  }

  // Helper to extract sharing type number from string
  extractSharingNumber(sharingType: string): number {
    const match = sharingType.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // Get all sharing types (1-10) for display
  getAllSharingTypes(): string[] {
    return [
      '1 Sharing',
      '2 Sharing',
      '3 Sharing',
      '4 Sharing',
      '5 Sharing',
      '6 Sharing',
      '7 Sharing',
      '8 Sharing',
      '9 Sharing',
      '10 Sharing'
    ];
  }

  // Convert display type to internal type
  displayToInternalType(displayType: string): string {
    const typeMap: { [key: string]: string } = {
      '1 Sharing': 'single',
      '2 Sharing': 'double',
      '3 Sharing': 'triple',
      '4 Sharing': 'four',
      '5 Sharing': 'five',
      '6 Sharing': 'six',
      '7 Sharing': 'seven',
      '8 Sharing': 'eight',
      '9 Sharing': 'nine',
      '10 Sharing': 'ten'
    };

    return typeMap[displayType] || displayType.toLowerCase();
  }

  // Convert internal type to display type
  internalToDisplayType(internalType: string): string {
    const typeMap: { [key: string]: string } = {
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

    return typeMap[internalType] || internalType;
  }

  // Update the getCombinedPricingData method in HostelService.ts
  getCombinedPricingData(hostel: Hostel, pricingData?: any, facilitiesData?: any): CombinedPricingData {
    const combined: CombinedPricingData = {};
    const allSharingTypes = this.getAllSharingTypes();

    allSharingTypes.forEach(displayType => {
      const internalType = this.displayToInternalType(displayType);

      // Get pricing from hostel data
      const hostelPricing = hostel.pricing?.[internalType];

      // Get pricing from API pricing data
      const apiPricing = pricingData?.[internalType];

      // Initialize with default values
      combined[internalType] = {
        daily: apiPricing?.daily || hostelPricing?.daily || null,
        monthly: apiPricing?.monthly || hostelPricing?.monthly || null,
        isAvailable: false,
        displayName: displayType
      };


      // Check availability
      if ((apiPricing && (apiPricing.daily || apiPricing.monthly)) || hostelPricing) {
        combined[internalType].isAvailable = true;
      }

      // For sharing types 5-10, also check facilities
      if (internalType === 'five' || internalType === 'six' || internalType === 'seven' ||
        internalType === 'eight' || internalType === 'nine' || internalType === 'ten') {

        // Check if this sharing type exists in facilities
        const existsInFacilities = facilitiesData?.sharingTypes?.includes(displayType);

        if (existsInFacilities && !combined[internalType].isAvailable) {
          // If it exists in facilities but not in pricing, mark as available with default pricing
          const basePrice = 3000;
          const sharingNumber = this.extractSharingNumber(displayType);
          const estimatedPrice = Math.max(basePrice - (sharingNumber * 200), 1500);

          combined[internalType] = {
            daily: { price: Math.round(estimatedPrice / 30), currency: 'INR' },
            monthly: { price: estimatedPrice, currency: 'INR' },
            availableBeds: 4,
            availableRooms: [],
            totalRooms: 1,
            isAvailable: true,
            displayName: displayType
          };
        }
      }
    });

    return combined;
  }

  // Get all available sharing types (for filters, etc.)
  getAvailableSharingTypes(hostel: Hostel, facilitiesData?: any): string[] {
    const availableTypes: string[] = [];
    const combinedPricing = this.getCombinedPricingData(hostel, facilitiesData);

    Object.keys(combinedPricing).forEach(internalType => {
      if (combinedPricing[internalType].isAvailable) {
        availableTypes.push(combinedPricing[internalType].displayName);
      }
    });

    return availableTypes;
  }
}

export default new HostelService();