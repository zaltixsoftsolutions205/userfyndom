// app/api/FacilityService.ts
import ApiClient from "./ApiClient";

export interface FacilitiesResponse {
  success: boolean;
  data: {
    sharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu: string;
  };
}

export interface ParsedFacilities {
  sharingNumbers: number[];
  bathroomTypes: string[];
  essentials: string[];
  foodServices: string[];
  customFoodMenu: string;
}

class FacilityService {
  // Get facilities for a specific hostel
  async getHostelFacilities(hostelId: string): Promise<FacilitiesResponse> {
    return await ApiClient.get<FacilitiesResponse>(
      `/hostel-operations/facilities/student/${hostelId}`
    );
  }

  // Parse and transform API data
  parseFacilitiesData(apiData: FacilitiesResponse['data']): ParsedFacilities {
    // Parse sharing types to get numbers
    const sharingNumbers = apiData.sharingTypes
      .map(type => {
        const match = type.match(/(\d+)\s*Sharing/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((num): num is number => num !== null)
      .sort((a, b) => a - b);

    return {
      sharingNumbers,
      bathroomTypes: apiData.bathroomTypes,
      essentials: apiData.essentials,
      foodServices: apiData.foodServices,
      customFoodMenu: apiData.customFoodMenu
    };
  }

  // Convert sharing number to type key
  sharingNumberToKey(sharingNumber: number): string {
    switch(sharingNumber) {
      case 1: return 'single';
      case 2: return 'double';
      case 3: return 'triple';
      case 4: return 'four';
      case 5: return 'five';
      case 6: return 'six';
      case 7: return 'seven';
      case 8: return 'eight';
      case 9: return 'nine';
      case 10: return 'ten';
      default: return 'single';
    }
  }

  // Convert sharing number to display label
  sharingNumberToLabel(sharingNumber: number): string {
    return `${sharingNumber} Sharing`;
  }

  // Check if sharing type exists
  hasSharingType(apiData: FacilitiesResponse['data'], sharingNumber: number): boolean {
    const label = this.sharingNumberToLabel(sharingNumber);
    return apiData.sharingTypes.includes(label);
  }

  // Get all available sharing types from API
  getAvailableSharingTypes(apiData: FacilitiesResponse['data']): number[] {
    return this.parseFacilitiesData(apiData).sharingNumbers;
  }
}

export default new FacilityService();