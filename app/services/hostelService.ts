// app/services/hostelService.ts
import ApiClient from '../api/ApiClient';

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
  facilities: {
    roomTypes: string[];
    sharingTypes: string[];
    bathroomType: string;
    essentials: string[];
    foodServices: {
      vegetarian: boolean;
      nonVegetarian: boolean;
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      teaCoffee: boolean;
      chineseMeals: boolean;
      northIndianMeals: boolean;
      otherMeals: string[];
    };
  };
  coordinates: {
    latitude?: number;
    longitude?: number;
  } | null;
}

export interface HostelsResponse {
  success: boolean;
  data: Hostel[];
  message: string;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export const hostelService = {
  async getAllHostels(): Promise<HostelsResponse> {
    try {
      const response = await ApiClient.get<HostelsResponse>('/hostels');
      return response;
    } catch (error) {
      console.error('Error fetching hostels:', error);
      throw error;
    }
  }
};