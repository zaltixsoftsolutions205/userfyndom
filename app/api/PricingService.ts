// app/api/PricingService.ts
import ApiClient from './ApiClient';

export interface PricingItem {
  sharingType: string;
  durationType: 'daily' | 'monthly';
  price: number;
  currency: string;
}

export interface PricingResponse {
  success: boolean;
  data: PricingItem[];
}

export interface CombinedPricingData {
  [key: string]: {
    daily: { price: number; currency: string; } | null;
    monthly: { price: number; currency: string; } | null;
    availableBeds: number;
    isAvailable: boolean;
    displayName: string;
  };
}

class PricingService {
  // Get hostel pricing (public endpoint)
  async getHostelPricing(hostelId: string): Promise<PricingResponse> {
    return await ApiClient.get<PricingResponse>(
      `/public/pricing/${hostelId}`
    );
  }

  // Combine pricing data into a structured format
  combinePricingData(pricingItems: PricingItem[]): CombinedPricingData {
    const combined: CombinedPricingData = {};
    
    // Initialize all sharing types
    const ALL_SHARING_TYPES = [
      'single', 'double', 'triple', 'four', 'five', 
      'six', 'seven', 'eight', 'nine', 'ten'
    ];

    ALL_SHARING_TYPES.forEach(type => {
      combined[type] = {
        daily: null,
        monthly: null,
        availableBeds: 0,
        isAvailable: false,
        displayName: this.getDisplayName(type)
      };
    });

    // Fill in pricing data
    pricingItems.forEach(item => {
      const sharingType = item.sharingType.toLowerCase();
      
      if (combined[sharingType]) {
        if (item.durationType === 'daily') {
          combined[sharingType].daily = {
            price: item.price,
            currency: item.currency
          };
          combined[sharingType].isAvailable = true;
        } else if (item.durationType === 'monthly') {
          combined[sharingType].monthly = {
            price: item.price,
            currency: item.currency
          };
          combined[sharingType].isAvailable = true;
        }
      }
    });

    return combined;
  }

  // Get display name for sharing type
  getDisplayName(sharingType: string): string {
    const displayMap: Record<string, string> = {
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

    return displayMap[sharingType] || sharingType;
  }

  // Get internal type from display type
  getInternalType(displayType: string): string {
    const typeMap: Record<string, string> = {
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

  // Calculate starting price from combined pricing
  calculateStartingPrice(pricingData: CombinedPricingData): number {
    const prices: number[] = [];

    Object.keys(pricingData).forEach(type => {
      if (pricingData[type].monthly?.price && pricingData[type].monthly.price > 0) {
        prices.push(pricingData[type].monthly.price);
      }
    });

    return prices.length > 0 ? Math.min(...prices) : 0;
  }
}

export default new PricingService();