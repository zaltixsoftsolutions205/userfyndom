// app/api/HostelFacilitiesService.ts
import ApiClient from "./ApiClient";

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

class HostelFacilitiesService {
  async getFacilities(hostelId: string): Promise<FacilitiesResponse> {
    return await ApiClient.get(`/hostel-operations/facilities/student/${hostelId}`);
  }
}

export default new HostelFacilitiesService();
