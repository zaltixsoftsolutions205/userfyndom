// app/utils/priceUtils.ts
export const calculateStartingPrice = (pricing: any): number => {
  if (!pricing) return 0;
  
  const prices: number[] = [];
  
  // Check each sharing type for monthly price
  if (pricing.single?.monthly?.price && pricing.single.monthly.price > 0) {
    prices.push(pricing.single.monthly.price);
  }
  if (pricing.double?.monthly?.price && pricing.double.monthly.price > 0) {
    prices.push(pricing.double.monthly.price);
  }
  if (pricing.triple?.monthly?.price && pricing.triple.monthly.price > 0) {
    prices.push(pricing.triple.monthly.price);
  }
  if (pricing.four?.monthly?.price && pricing.four.monthly.price > 0) {
    prices.push(pricing.four.monthly.price);
  }
  
  // Return the minimum price if available, otherwise 0
  return prices.length > 0 ? Math.min(...prices) : 0;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getDisplayPrice = (
  fetchedPrice: number | null, 
  localPrice: number | undefined, 
  fallbackPrice: number = 8000
): number => {
  if (fetchedPrice !== null && fetchedPrice > 0) {
    return fetchedPrice;
  }
  if (localPrice && localPrice > 0) {
    return localPrice;
  }
  return fallbackPrice;
};