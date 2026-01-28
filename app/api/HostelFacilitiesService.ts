// app/api/HostelFacilitiesService.ts
import ApiClient from "./ApiClient";

export interface HostelFacilitiesResponse {
  success: boolean;
  data: {
    hostelId: string;
    hostelName: string;
    sharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu?: string;
  };
}

export interface TransformedFacilities {
  sharingTypes: string[];
  bathroomTypes: string[];
  essentials: string[];
  foodServices: string[];
  customFoodMenu?: string;
}

class HostelFacilitiesService {
  /**
   * Get facilities for a specific hostel (Public endpoint - no auth needed)
   */
  async getFacilities(hostelId: string): Promise<HostelFacilitiesResponse> {
    try {
      console.log(`📡 Fetching facilities for hostel: ${hostelId}`);
      
      const response = await ApiClient.get<HostelFacilitiesResponse>(
        `/students/hostels/${hostelId}/facilities`
      );
      
      console.log('✅ Facilities fetched successfully:', {
        success: response.success,
        hasData: !!response.data,
        hostelName: response.data?.hostelName
      });
      
      return response;
    } catch (error: any) {
      console.error('❌ Error fetching hostel facilities:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  /**
   * Transform API response to match the expected format
   */
  transformFacilitiesData(apiData: any): TransformedFacilities {
    return {
      sharingTypes: apiData.sharingTypes || [],
      bathroomTypes: apiData.bathroomTypes || [],
      essentials: apiData.essentials || [],
      foodServices: apiData.foodServices || [],
      customFoodMenu: apiData.customFoodMenu || ''
    };
  }

  /**
   * Get and transform facilities in one call
   */
  async getAndTransformFacilities(hostelId: string): Promise<TransformedFacilities> {
    try {
      const response = await this.getFacilities(hostelId);
      
      if (response.success && response.data) {
        return this.transformFacilitiesData(response.data);
      }
      
      return {
        sharingTypes: [],
        bathroomTypes: [],
        essentials: [],
        foodServices: [],
        customFoodMenu: ''
      };
    } catch (error) {
      console.error('Error in getAndTransformFacilities:', error);
      return {
        sharingTypes: [],
        bathroomTypes: [],
        essentials: [],
        foodServices: [],
        customFoodMenu: ''
      };
    }
  }
}

export default new HostelFacilitiesService();