// app/utils/sharingTypes.ts

// All possible sharing types (1-10)
export const ALL_SHARING_TYPES = [
  'single',
  'double',
  'triple',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten'
] as const;

export type SharingType = typeof ALL_SHARING_TYPES[number];

// Mapping between internal and display names
export const SHARING_LABELS: Record<SharingType, string> = {
  single: '1 Sharing',
  double: '2 Sharing',
  triple: '3 Sharing',
  four: '4 Sharing',
  five: '5 Sharing',
  six: '6 Sharing',
  seven: '7 Sharing',
  eight: '8 Sharing',
  nine: '9 Sharing',
  ten: '10 Sharing'
};

// Reverse mapping
export const DISPLAY_TO_INTERNAL: Record<string, SharingType> = {
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

// Helper functions
export const getSharingNumber = (sharingType: string): number => {
  const match = sharingType.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const getInternalType = (displayType: string): SharingType => {
  return DISPLAY_TO_INTERNAL[displayType] || 'double';
};

export const getDisplayType = (internalType: string): string => {
  return SHARING_LABELS[internalType as SharingType] || internalType;
};

// Get all display types
export const getAllDisplaySharingTypes = (): string[] => {
  return ALL_SHARING_TYPES.map(type => SHARING_LABELS[type]);
};

// Check if a sharing type is available
export const isSharingTypeAvailable = (
  sharingType: SharingType,
  pricing: any,
  facilitiesSharingTypes: string[]
): boolean => {
  // First check if it's in pricing (has available beds)
  if (pricing?.[sharingType]?.availableBeds > 0) {
    return true;
  }
  
  // For types 5-10, check if they exist in facilities
  const displayType = SHARING_LABELS[sharingType];
  if (facilitiesSharingTypes.includes(displayType)) {
    // If it's in facilities but no pricing data, we assume it might be available
    // This is a fallback - you might want to check room availability differently
    return true;
  }
  
  return false;
};

// Get price for sharing type
export const getPriceForSharingType = (
  sharingType: SharingType,
  pricing: any
): { monthly: number | null; daily: number | null } => {
  const priceData = pricing?.[sharingType];
  
  return {
    monthly: priceData?.monthly?.price || null,
    daily: priceData?.daily?.price || null
  };
};