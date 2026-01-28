// app/api/HostelService.ts
import ApiClient from './ApiClient';
import HostelFacilitiesService from "./HostelFacilitiesService";

export interface Hostel {
  _id: string;
  hostelId: string;
  hostelName: string;
  hostelType: string;
  address: string;
  owner: {
    name: string;
    email: string;
    mobile: string;
  };
  summary: string;
  photos: Array<{
    filename: string;
    originalName: string;
    path: string;
    url: string;
    isPrimary: boolean;
    _id: string;
    uploadDate: string;
  }>;
  amenities: string[];
  foodServices: string[];
  startingPrice: number;
  pricing: Array<{
    _id: string;
    sharingType: string;
    durationType: 'daily' | 'monthly';
    price: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  // Added for compatibility
  contact?: string;
  email?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  } | null;
  formattedAddress?: string;
  availabilitySummary?: any;
  allRooms?: any[];
  hostelTypeDisplay?: string;
}

export interface HostelsResponse {
  success: boolean;
  count: number;
  data: Hostel[];
  message?: string;
  pagination?: {
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
  // Helper to extract location from address
  private extractLocationFromAddress(address: string): string {
    if (!address) return 'Hyderabad';

    const areas = [
      'Kukatpally', 'L.B. Nagar', 'Secunderabad', 'Ameerpet',
      'Hitech City', 'Madhapur', 'Begumpet', 'KPHB', 'Dilsukhnagar',
      'Vizag', 'Visakhapatnam', 'Hyderabad', 'Trivendrum', 'Kerala'
    ];

    for (const area of areas) {
      if (address.toLowerCase().includes(area.toLowerCase())) {
        return area;
      }
    }

    // Fallback: try to extract first meaningful word from address
    const words = address.split(',').map(word => word.trim()).filter(word => word.length > 3);
    return words[0] || 'Hyderabad';
  }

  // Helper to determine gender from hostel type
  private determineGenderFromHostel(hostel: Hostel): string {
    const type = hostel.hostelType?.toLowerCase() || '';
    const name = hostel.hostelName?.toLowerCase() || '';

    if (type.includes('boys') || name.includes('boys') || name.includes('boy')) return 'Boys';
    if (type.includes('girls') || name.includes('girls') || name.includes('girl')) return 'Girls';
    if (name.includes('women') || name.includes('womens')) return 'Girls';
    if (type.includes('co-living') || type.includes('coliving')) return 'Co-living';
    return 'Co-living';
  }

  // Convert internal type to display type
  private internalToDisplayType(internalType: string): string {
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

  // Convert display type to internal type
  private displayToInternalType(displayType: string): string {
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

  // Extract sharing number from type
  private extractSharingNumber(sharingType: string): number {
    const match = sharingType.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // Get display name for hostel type
  private getHostelTypeDisplay(hostelType: string): string {
    const typeMap: { [key: string]: string } = {
      'boys': 'Boys Hostel',
      'girls': 'Girls Hostel',
      'co-living': 'Co-living Hostel',
      'coliving': 'Co-living Hostel'
    };

    return typeMap[hostelType] || hostelType;
  }

  // Transform API response to match the expected structure
  transformHostelData(apiHostel: Hostel): any {
    // Get primary photo or first photo
    const primaryPhoto = apiHostel.photos?.[0];

    // Convert photo URL to absolute URL
    let imageUrl = null;
    if (primaryPhoto?.url) {
      if (primaryPhoto.url.startsWith('http')) {
        imageUrl = primaryPhoto.url;
      } else {
        const normalizedUrl = primaryPhoto.url.startsWith('/')
          ? primaryPhoto.url
          : `/${primaryPhoto.url}`;
        imageUrl = `http://192.168.29.230:5000${normalizedUrl}`;
      }
    }

    // Convert ALL photos to absolute URLs for details page
    const allPhotos = apiHostel.photos?.map(photo => {
      let photoUrl = photo.url;
      if (photoUrl && !photoUrl.startsWith('http')) {
        const normalizedUrl = photoUrl.startsWith('/')
          ? photoUrl
          : `/${photoUrl}`;
        photoUrl = `http://192.168.29.230:5000${normalizedUrl}`;
      }
      return {
        ...photo,
        url: photoUrl
      };
    }) || [];

    // Organize pricing by sharing type
    const organizedPricing: any = {};
    const availabilitySummary: any = {};

    // Process pricing array into structured format
    apiHostel.pricing?.forEach(priceItem => {
      const sharingType = priceItem.sharingType;
      if (!organizedPricing[sharingType]) {
        organizedPricing[sharingType] = {
          daily: null,
          monthly: null,
          availableBeds: Math.floor(Math.random() * 5) + 1, // Mock data
          availableRooms: [],
          totalRooms: Math.floor(Math.random() * 3) + 1
        };

        // Also populate availability summary
        availabilitySummary[sharingType] = {
          availableBeds: Math.floor(Math.random() * 5) + 1,
          totalBeds: Math.floor(Math.random() * 10) + 5,
          availableRooms: []
        };
      }

      if (priceItem.durationType === 'daily') {
        organizedPricing[sharingType].daily = {
          price: priceItem.price,
          currency: priceItem.currency || 'INR',
          pricingId: priceItem._id
        };
      } else if (priceItem.durationType === 'monthly') {
        organizedPricing[sharingType].monthly = {
          price: priceItem.price,
          currency: priceItem.currency || 'INR',
          pricingId: priceItem._id
        };
      }
    });

    // Calculate starting price
    const monthlyPrices = apiHostel.pricing
      ?.filter(p => p.durationType === 'monthly')
      ?.map(p => p.price) || [];

    const dailyPrices = apiHostel.pricing
      ?.filter(p => p.durationType === 'daily')
      ?.map(p => p.price) || [];

    let startingPrice = apiHostel.startingPrice || 0;
    if (monthlyPrices.length > 0 && startingPrice === 0) {
      startingPrice = Math.min(...monthlyPrices);
    } else if (dailyPrices.length > 0 && startingPrice === 0) {
      startingPrice = Math.min(...dailyPrices) * 30; // Convert daily to monthly
    }

    // Get sharing number from pricing
    const getSharingNumber = (): number => {
      const availableTypes = Object.keys(organizedPricing);
      if (availableTypes.length > 0) {
        const firstType = availableTypes[0];
        if (firstType === 'single') return 1;
        if (firstType === 'double') return 2;
        if (firstType === 'triple') return 3;
        if (firstType === 'four') return 4;
        if (firstType === 'five') return 5;
        if (firstType === 'six') return 6;
        if (firstType === 'seven') return 7;
        if (firstType === 'eight') return 8;
        if (firstType === 'nine') return 9;
        if (firstType === 'ten') return 10;
      }
      return 2; // Default
    };

    // Calculate rating
    const baseRating = 3.5;
    let ratingBonus = 0;

    if (allPhotos.length > 0) ratingBonus += 0.3;

    const amenitiesCount = apiHostel.amenities?.length || 0;
    ratingBonus += Math.min(amenitiesCount * 0.1, 0.5);

    if (apiHostel.amenities?.includes('Air Conditioning')) ratingBonus += 0.2;
    if (apiHostel.amenities?.includes('Free WiFi')) ratingBonus += 0.2;
    if (apiHostel.amenities?.includes('CCTV Security')) ratingBonus += 0.2;

    const finalRating = Math.min(baseRating + ratingBonus + (Math.random() * 0.6), 5.0);

    // Calculate recommendation score
    const calculateRecommendationScore = (): number => {
      let score = 0;

      score += Math.min(allPhotos.length * 4, 20);
      score += Math.min(amenitiesCount * 1.5, 15);

      const premiumAmenities = ['Air Conditioning', 'Free WiFi', 'CCTV Security', 'Laundry Service'];
      premiumAmenities.forEach(amenity => {
        if (apiHostel.amenities?.includes(amenity)) {
          score += 3;
        }
      });

      const totalAvailableBeds = Object.values(availabilitySummary || {}).reduce(
        (sum: number, type: any) => sum + (type.availableBeds || 0), 0
      );
      score += Math.min(totalAvailableBeds * 2, 10);

      if (startingPrice < 5000) score += 15;
      else if (startingPrice < 8000) score += 10;
      else if (startingPrice < 12000) score += 5;

      return Math.round(score);
    };

    const sharingNumber = getSharingNumber();
    const sharingOptions = Object.keys(organizedPricing).map(type => {
      const monthlyPrice = organizedPricing[type]?.monthly?.price;
      if (monthlyPrice) {
        return {
          type: this.internalToDisplayType(type),
          price: monthlyPrice,
          available: organizedPricing[type]?.availableBeds || 0
        };
      }
      return null;
    }).filter(Boolean);

    return {
      id: apiHostel._id || apiHostel.hostelId,
      _id: apiHostel._id || apiHostel.hostelId,
      hostelId: apiHostel.hostelId,
      name: apiHostel.hostelName || 'Unnamed Hostel',
      hostelName: apiHostel.hostelName,
      address: apiHostel.address || 'Address not provided',
      price: startingPrice > 0 ? `₹${startingPrice} / month` : 'Price not available',
      startingPrice: startingPrice,
      location: this.extractLocationFromAddress(apiHostel.address),
      rating: parseFloat(finalRating.toFixed(1)),
      image: imageUrl,
      facilities: apiHostel.amenities || [],
      amenities: apiHostel.amenities || [],
      gender: this.determineGenderFromHostel(apiHostel),
      sharing: sharingNumber,
      summary: apiHostel.summary || 'Comfortable accommodation with modern amenities.',
      contact: apiHostel.owner?.mobile || 'Not provided',
      email: apiHostel.owner?.email || 'Not provided',
      coordinates: null,
      allPhotos: allPhotos,
      photos: allPhotos,
      pricing: organizedPricing,
      foodServices: apiHostel.foodServices,
      availabilitySummary: availabilitySummary,
      recommendationScore: calculateRecommendationScore(),
      hostelOwnerId: apiHostel._id || apiHostel.hostelId,
      owner: apiHostel.owner,
      createdAt: apiHostel.createdAt,
      hostelType: apiHostel.hostelType,
      hostelTypeDisplay: this.getHostelTypeDisplay(apiHostel.hostelType),
      allFacilities: {
        essentials: apiHostel.amenities || [],
        foodServices: apiHostel.foodServices || [],
        roomSharingTypes: Object.keys(organizedPricing).map(type => this.internalToDisplayType(type)),
        bathroomTypes: ['Attached', 'Common'], // Default
        customFoodMenu: ''
      },
      sharingOptions: sharingOptions
    };
  }

  // Get all hostels
  async getAllHostels(): Promise<HostelsResponse> {
    try {
      console.log('📡 Fetching all hostels from /students/hostels endpoint...');
      const response = await ApiClient.get<HostelsResponse>('/students/hostels');

      console.log('✅ Hostels API Response:', {
        success: response.success,
        count: response.count,
        hasData: !!response.data,
        dataLength: response.data?.length || 0
      });

      // Transform the data
      if (response.success && response.data) {
        const transformedData = response.data.map(hostel => this.transformHostelData(hostel));

        console.log('🔄 Transformed hostel data:', transformedData.length);

        return {
          success: true,
          count: transformedData.length,
          data: transformedData as any[],
          message: response.message || 'Hostels fetched successfully',
          pagination: response.pagination
        };
      }

      return response;
    } catch (error: any) {
      console.error('❌ Error fetching hostels:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Return empty response for error
      return {
        success: false,
        count: 0,
        data: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch hostels'
      };
    }
  }

  // Search hostels by keyword
  async searchHostels(searchQuery: string): Promise<HostelsResponse> {
    try {
      const allHostels = await this.getAllHostels();

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const filtered = allHostels.data.filter(hostel =>
          hostel.name.toLowerCase().includes(query) ||
          hostel.location.toLowerCase().includes(query) ||
          hostel.address.toLowerCase().includes(query) ||
          (hostel.summary && hostel.summary.toLowerCase().includes(query))
        );

        return {
          ...allHostels,
          data: filtered,
          count: filtered.length,
          message: `Found ${filtered.length} hostels matching "${searchQuery}"`
        };
      }

      return allHostels;
    } catch (error) {
      console.error('Error searching hostels:', error);
      throw error;
    }
  }

  // Get hostel by ID
  async getHostelById(hostelId: string): Promise<SingleHostelResponse> {
    try {
      // First get all hostels
      const response = await this.getAllHostels();

      if (response.success) {
        const hostel = response.data.find(h =>
          h.id === hostelId ||
          h._id === hostelId ||
          h.hostelId === hostelId
        );

        if (hostel) {
          return {
            success: true,
            data: hostel,
            message: 'Hostel found successfully'
          };
        }
      }

      return {
        success: false,
        data: null as any,
        message: 'Hostel not found'
      };
    } catch (error) {
      console.error('Error getting hostel by ID:', error);
      return {
        success: false,
        data: null as any,
        message: 'Error fetching hostel details'
      };
    }
  }

  // Get starting price for a specific hostel
  async getStartingPrice(hostelId: string): Promise<StartingPriceResponse> {
    try {
      const response = await this.getHostelById(hostelId);

      if (response.success && response.data) {
        return {
          success: true,
          startingPrice: response.data.startingPrice || 0,
          message: 'Starting price fetched successfully'
        };
      }

      return {
        success: false,
        startingPrice: 0,
        message: response.message || 'Failed to get starting price'
      };
    } catch (error) {
      console.error('Error getting starting price:', error);
      return {
        success: false,
        startingPrice: 0,
        message: 'Error fetching starting price'
      };
    }
  }

  // Get facilities for a specific hostel
  async getHostelFacilities(hostelId: string): Promise<FacilitiesResponse> {
    try {
      console.log(`📡 Fetching facilities via API for hostel: ${hostelId}`);

      // Use the HostelFacilitiesService to get real API data
      const response = await HostelFacilitiesService.getFacilities(hostelId);

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            sharingTypes: response.data.sharingTypes || [],
            bathroomTypes: response.data.bathroomTypes || [],
            essentials: response.data.essentials || [],
            foodServices: response.data.foodServices || [],
            customFoodMenu: response.data.customFoodMenu || ''
          }
        };
      }

      // Fallback to existing data if API fails
      const localResponse = await this.getHostelById(hostelId);

      if (localResponse.success && localResponse.data) {
        const hostel = localResponse.data;

        return {
          success: false,
          data: {
            sharingTypes: hostel.allFacilities?.roomSharingTypes || [],
            bathroomTypes: hostel.allFacilities?.bathroomTypes || ['Attached', 'Common'],
            essentials: hostel.amenities || hostel.facilities || [],
            foodServices: hostel.foodServices || [],
            customFoodMenu: hostel.allFacilities?.customFoodMenu || ''
          }
        };
      }

      return {
        success: false,
        data: {
          sharingTypes: [],
          bathroomTypes: [],
          essentials: [],
          foodServices: [],
          customFoodMenu: ''
        }
      };

    } catch (error: any) {
      console.error('Error getting hostel facilities from API:', error);

      // Ultimate fallback
      return {
        success: false,
        data: {
          sharingTypes: [],
          bathroomTypes: [],
          essentials: [],
          foodServices: [],
          customFoodMenu: ''
        }
      };
    }
  }

  // Get nearby hostels based on location
  async getNearbyHostels(latitude: number, longitude: number, maxDistance: number = 10): Promise<HostelsResponse> {
    try {
      // For now, just return all hostels since we don't have location data in API
      const response = await this.getAllHostels();

      // Add distance property to hostels (mock for now)
      const hostelsWithDistance = response.data.map(hostel => ({
        ...hostel,
        distance: Math.floor(Math.random() * 10) + 1, // Mock distance
        isNearby: true
      }));

      return {
        ...response,
        data: hostelsWithDistance,
        message: 'Nearby hostels fetched successfully'
      };
    } catch (error) {
      console.error('Error getting nearby hostels:', error);
      throw error;
    }
  }

  

  // Get hostels by area
  async getHostelsByArea(areaName: string): Promise<HostelsResponse> {
    try {
      const LocationService = require('./LocationService').default;
      const areaResponse = await LocationService.searchHostelsByArea(areaName);

      if (!areaResponse.success || !areaResponse.data) {
        return {
          success: false,
          count: 0,
          data: [],
          message: `No hostels found in ${areaName}`
        };
      }

      // Get full details for each hostel
      const hostels = [];
      for (const searchResult of areaResponse.data) {
        try {
          const hostelDetail = await this.getHostelById(searchResult.hostelId);
          if (hostelDetail.success && hostelDetail.data) {
            hostels.push(hostelDetail.data);
          }
        } catch (error) {
          console.error(`Error fetching hostel ${searchResult.hostelId}:`, error);
        }
      }

      return {
        success: true,
        count: hostels.length,
        data: hostels,
        message: `Found ${hostels.length} hostels in ${areaName}`
      };

    } catch (error: any) {
      console.error('Error getting hostels by area:', error);
      return {
        success: false,
        count: 0,
        data: [],
        message: error.message || 'Failed to fetch hostels by area'
      };
    }
  }

  // Get area names for quick selection
  getAreaSuggestions(): string[] {
    return [
      "Kukatpally",
      "Ameerpet",
      "Hitech City",
      "Madhapur",
      "Begumpet",
      "Secunderabad",
      "Dilsukhnagar",
      "L.B. Nagar",
      "Charminar",
      "Gachibowli",
      "Kondapur",
      "Banjara Hills",
      "Jubilee Hills",
      "Manikonda"
    ];
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

  // Get combined pricing data
  getCombinedPricingData(hostel: any, pricingData?: any, facilitiesData?: any): CombinedPricingData {
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
        availableBeds: hostelPricing?.availableBeds || 0,
        availableRooms: hostelPricing?.availableRooms || [],
        totalRooms: hostelPricing?.totalRooms || 0,
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
  getAvailableSharingTypes(hostel: any, facilitiesData?: any): string[] {
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