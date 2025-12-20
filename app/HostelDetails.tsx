import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl
} from 'react-native';
import Toast from 'react-native-toast-message';
// import MapViewWrapper from '../components/MapViewWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/reduxStore/store/store';
import { getStartingPrice, getHostelFacilities, getHostelRooms } from '../app/reduxStore/reduxSlices/hostelSlice';
import PricingService, { CombinedPricingData } from '../app/api/PricingService';

const { width } = Dimensions.get('window');

// Define a type for the pricing keys
type SharingType = 'single' | 'double' | 'triple' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten';

const ALL_SHARING_TYPES: SharingType[] = ['single', 'double', 'triple', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const SHARING_LABELS: Record<SharingType, string> = {
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

interface HostelData {
  id: string;
  name: string;
  address: string;
  contact: string;
  email: string;
  hostelType: string;
  rating?: number;
  summary: string;
  photos: any[];
  pricing: {
    [key in SharingType]?: {
      daily: { price: number; currency: string };
      monthly: { price: number; currency: string };
      availableBeds: number;
      availableRooms: any[];
    };
  };
  allFacilities: {
    roomSharingTypes: any[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu?: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  startingPrice: number;
  availabilitySummary: any;
  sharingOptions: any[];
  allPhotos: any[];
  hostelOwnerId?: string;
}

export default function HostelDetails() {
  const router = useRouter();
  const { hostel } = useLocalSearchParams();

  const dispatch = useDispatch<AppDispatch>();
  const startingPrice = useSelector((state: RootState) => state.hostel.startingPrice);
  const loadingPrice = useSelector((state: RootState) => state.hostel.loading);
  const hostelFacilities = useSelector((state: RootState) => state.hostel.hostelFacilities);
  const hostelRooms = useSelector((state: RootState) => state.hostel.hostelRooms);
  const roomsLoading = useSelector((state: RootState) => state.hostel.roomsLoading);

  let hostelData: HostelData | null = null;

  try {
    if (hostel && typeof hostel === 'string') {
      hostelData = JSON.parse(hostel);
    }
  } catch (error) {
    console.error("Failed to parse hostel data:", error);
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [feedbacks] = useState([
    {
      name: 'Rahul',
      rating: 5,
      description: 'Very clean and friendly hostel. Loved the facilities!',
      media: ['https://picsum.photos/200/120?1'],
    },
  ]);
  const [newRating, setNewRating] = useState<number>(0);
  const [newDescription, setNewDescription] = useState<string>('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [selectedSharing, setSelectedSharing] = useState<SharingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [priceFetchAttempted, setPriceFetchAttempted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New state for API data
  const [facilitiesData, setFacilitiesData] = useState<any>(null);
  const [availableSharingTypes, setAvailableSharingTypes] = useState<Array<{ type: string; display: string; availableBeds: number }>>([]);

  // Pricing API state
  const [pricingData, setPricingData] = useState<CombinedPricingData | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [calculatedStartingPrice, setCalculatedStartingPrice] = useState<number>(0);

  const photos = hostelData?.photos || hostelData?.allPhotos || [];

  // Fetch hostel data from APIs
  useEffect(() => {
    if (hostelData?.id) {
      fetchHostelData();
    }
  }, [hostelData?.id]);

  // Fetch pricing data from API
  const fetchPricingData = async () => {
    if (!hostelData) return;

    try {
      setLoadingPricing(true);

      // Use hostelOwnerId if available, otherwise use hostel id
      const ownerId = hostelData.hostelOwnerId || hostelData.id;

      const response = await PricingService.getHostelPricing(ownerId);
      console.log('Pricing API response:', response);

      if (response.success && response.data && Array.isArray(response.data)) {
        const combinedPricing = PricingService.combinePricingData(response.data);
        console.log('Combined pricing:', combinedPricing);
        setPricingData(combinedPricing);

        // Calculate starting price from pricing data
        const startPrice = PricingService.calculateStartingPrice(combinedPricing);
        setCalculatedStartingPrice(startPrice);
        console.log('Calculated starting price:', startPrice);

      } else {
        console.warn('No valid pricing data received, using fallback');
        setFallbackPricing();
      }
    } catch (error: any) {
      console.error('Error fetching pricing data:', error);
      Toast.show({
        type: 'error',
        text1: 'Info',
        text2: 'Using default pricing information'
      });
      setFallbackPricing();
    } finally {
      setLoadingPricing(false);
    }
  };

  // Set fallback pricing from hostel data
  const setFallbackPricing = () => {
    const fallbackPricing: CombinedPricingData = {};

    ALL_SHARING_TYPES.forEach(type => {
      const hostelPricing = hostelData?.pricing?.[type];
      const hasPricing = hostelPricing?.monthly || hostelPricing?.daily;

      fallbackPricing[type] = {
        daily: hostelPricing?.daily || null,
        monthly: hostelPricing?.monthly || null,
        availableBeds: 0,
        isAvailable: !!hasPricing,
        displayName: SHARING_LABELS[type]
      };
    });

    setPricingData(fallbackPricing);
    
    // Calculate fallback starting price
    const startPrice = PricingService.calculateStartingPrice(fallbackPricing);
    setCalculatedStartingPrice(startPrice || 8000);
  };

  // Fetch all hostel data
  const fetchHostelData = async () => {
    if (!hostelData?.id) return;

    setIsLoading(true);
    setRefreshing(true);

    try {
      // Fetch pricing data FIRST
      await fetchPricingData();

      // Fetch rooms data (public API - no auth needed)
      dispatch(getHostelRooms(hostelData.id))
        .unwrap()
        .then((response) => {
          console.log('Rooms data loaded successfully');
          
          // Update available sharing types from rooms data
          if (response.data?.sharingTypeAvailability) {
            const availableTypes: Array<{ type: string; display: string; availableBeds: number }> = [];
            
            ALL_SHARING_TYPES.forEach(sharingType => {
              const availability = response.data.sharingTypeAvailability[sharingType];
              if (availability?.available && availability.availableBeds > 0) {
                availableTypes.push({
                  type: sharingType,
                  display: SHARING_LABELS[sharingType],
                  availableBeds: availability.availableBeds
                });
              }
            });
            
            setAvailableSharingTypes(availableTypes);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch rooms:', error);
          Toast.show({
            type: 'error',
            text1: 'Warning',
            text2: 'Could not load room availability'
          });
        });

      // Fetch facilities data
      if (!hostelFacilities) {
        dispatch(getHostelFacilities(hostelData.id))
          .unwrap()
          .then((response) => {
            setFacilitiesData(response.data);
          })
          .catch((error) => {
            console.error("Failed to fetch facilities:", error);
            // Set mock facilities data if API fails
            setFacilitiesData({
              sharingTypes: ["1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing"],
              bathroomTypes: ["Attached Bathroom", "Common Bathroom"],
              essentials: ["Air Conditioning", "Free WiFi", "Power Backup"],
              foodServices: ["Vegetarian Meals", "Breakfast", "Lunch", "Dinner"]
            });
          });
      } else {
        setFacilitiesData(hostelFacilities);
      }

      // Fetch starting price (optional, we already have calculated from pricing API)
      if (!priceFetchAttempted) {
        dispatch(getStartingPrice(hostelData.id))
          .unwrap()
          .then((response) => {
            console.log('Starting price API success:', response);
            setPriceFetchAttempted(true);
          })
          .catch((error) => {
            console.error('Failed to fetch starting price:', error);
            setPriceFetchAttempted(true);
          });
      }

    } catch (error) {
      console.error("Error fetching hostel data:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load some hostel data, showing available information'
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchHostelData();
  };

  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % photos.length;
      setCurrentImageIndex(nextIndex);

      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentImageIndex, photos.length]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffset / width);
    setCurrentImageIndex(index);
  };

  const getDisplayPrice = (): number => {
    // Use calculated starting price from pricing API first
    if (calculatedStartingPrice > 0) {
      return calculatedStartingPrice;
    }

    // Fallback to Redux starting price
    if (startingPrice !== null && startingPrice > 0) {
      return startingPrice;
    }

    // Fallback to hostel data starting price
    if (hostelData?.startingPrice && hostelData.startingPrice > 0) {
      return hostelData.startingPrice;
    }

    return 8000; // Default fallback
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Storage permission is needed to upload images.' });
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeTypes.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewImages([...newImages, ...result.assets.map(a => a.uri)]);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Image selection failed.' });
    }
  };

  const handleCameraPick = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Camera permission is needed to take photos.' });
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeTypes.Images,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewImages([...newImages, ...result.assets.map(a => a.uri)]);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Camera capture failed.' });
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };

  const renderStars = (rating: number, onPress?: (i: number) => void) =>
    [...Array(5)].map((_, i) => (
      <Text key={i} style={{ color: i < rating ? '#4CBB17' : '#ccc', fontSize: 18 }} onPress={() => onPress && onPress(i + 1)}>
        ★
      </Text>
    ));

  // Get available beds for a sharing type from API response
  const getAvailableBeds = (sharingType: SharingType): number => {
    if (!hostelRooms?.sharingTypeAvailability) return 0;
    return hostelRooms.sharingTypeAvailability[sharingType]?.availableBeds || 0;
  };

  // Check if sharing type is available (has beds)
  const isSharingTypeAvailable = (sharingType: SharingType): boolean => {
    const availableBeds = getAvailableBeds(sharingType);
    return availableBeds > 0;
  };

  // Get price for sharing type from pricing data
  const getPriceForSharingType = (sharingType: SharingType) => {
    // Use pricing API data first
    if (pricingData?.[sharingType]) {
      return {
        monthly: pricingData[sharingType].monthly?.price || 0,
        daily: pricingData[sharingType].daily?.price || 0,
        isAvailable: pricingData[sharingType].isAvailable
      };
    }

    // Fallback to hostel data
    const pricing = hostelData?.pricing?.[sharingType];
    return {
      monthly: pricing?.monthly?.price || 0,
      daily: pricing?.daily?.price || 0,
      isAvailable: !!pricing
    };
  };

  const handleBooking = (sharingType: SharingType) => {
    if (!hostelData) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Hostel data not available' });
      return;
    }

    // Check availability from rooms data
    const availableBeds = getAvailableBeds(sharingType);

    if (availableBeds === 0) {
      Toast.show({
        type: 'error',
        text1: 'Room Unavailable',
        text2: 'This room type is currently sold out'
      });
      return;
    }

    // Get pricing from API data or hostel data
    const priceInfo = getPriceForSharingType(sharingType);

    router.push({
      pathname: '/BookingForm',
      params: {
        hostel: JSON.stringify({
          _id: hostelData.id,
          hostelOwnerId: hostelData.hostelOwnerId || hostelData.id,
          hostelName: hostelData.name,
          address: hostelData.address,
          contact: hostelData.contact,
          email: hostelData.email,
          hostelType: hostelData.hostelType,
          pricing: pricingData,
          coordinates: hostelData.coordinates,
          startingPrice: getDisplayPrice(),
          photos: hostelData.photos,
          summary: hostelData.summary,
          facilities: facilitiesData,
          roomsData: hostelRooms
        }),
        selectedSharing: sharingType,
        monthlyPrice: priceInfo.monthly?.toString() || '0',
        dailyPrice: priceInfo.daily?.toString() || '0',
        availableBeds: availableBeds?.toString() || '0'
      }
    });
  };

  const handleQuickBooking = () => {
    if (!hostelData || selectedSharing === null) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please select a room type first!' });
      return;
    }
    handleBooking(selectedSharing);
  };

  const facilities = [
    {
      category: 'Room Types',
      items: ALL_SHARING_TYPES.map(type => ({
        name: `${SHARING_LABELS[type]} Room`,
        key: type,
        available: isSharingTypeAvailable(type)
      }))
    },
    {
      category: 'Bathroom',
      items: [
        {
          name: 'Attached Bathroom',
          key: 'attached',
          available: facilitiesData?.bathroomTypes?.includes('Attached Bathroom') || false
        },
        {
          name: 'Common Bathroom',
          key: 'common',
          available: facilitiesData?.bathroomTypes?.includes('Common Bathroom') || false
        },
      ],
    },
    {
      category: 'Essential Facilities',
      items: [
        { name: 'Air Conditioning', key: 'ac', available: facilitiesData?.essentials?.includes('Air Conditioning') || false },
        { name: 'Free WiFi', key: 'wifi', available: facilitiesData?.essentials?.includes('Free WiFi') || false },
        { name: 'Power Backup', key: 'power-backup', available: facilitiesData?.essentials?.includes('Power Backup') || false },
        { name: 'CCTV Security', key: 'cctv', available: facilitiesData?.essentials?.includes('CCTV Security') || false },
        { name: 'RO Water', key: 'ro-water', available: facilitiesData?.essentials?.includes('RO Water') || false },
        { name: 'Daily Cleaning', key: 'cleaning', available: facilitiesData?.essentials?.includes('Daily Cleaning') || false },
        { name: 'Elevator/Lift', key: 'lift', available: facilitiesData?.essentials?.includes('Elevator/Lift') || false },
        { name: 'Laundry Service', key: 'laundry', available: facilitiesData?.essentials?.includes('Washing Machine') || false },
        { name: 'Parking Space', key: 'parking', available: facilitiesData?.essentials?.includes('Parking Space') || false },
        { name: 'Dining Hall', key: 'dining', available: facilitiesData?.essentials?.includes('Dining Hall') || false },
        { name: 'Study Room/Library', key: 'library', available: facilitiesData?.essentials?.includes('Study Room/Library') || false },
        { name: 'Hot Water / Geyser', key: 'geyser', available: facilitiesData?.essentials?.includes('Hot Water/Geyser/Inverter') || false },
        { name: 'Inverter', key: 'inverter', available: facilitiesData?.essentials?.includes('Hot Water/Geyser/Inverter') || false },
        { name: 'Room Heater', key: 'heater', available: facilitiesData?.essentials?.includes('Room Heater') || false },
      ],
    },
    {
      category: 'Food Services',
      items: [
        { name: 'Vegetarian Meals', key: 'veg', available: facilitiesData?.foodServices?.includes('Vegetarian Meals') || false },
        { name: 'Non-Vegetarian Meals', key: 'non-veg', available: facilitiesData?.foodServices?.includes('Non-vegetarian Meals') || false },
        { name: 'Breakfast', key: 'breakfast', available: facilitiesData?.foodServices?.includes('Breakfast') || false },
        { name: 'Lunch', key: 'lunch', available: facilitiesData?.foodServices?.includes('Lunch') || false },
        { name: 'Dinner', key: 'dinner', available: facilitiesData?.foodServices?.includes('Dinner') || false },
        { name: 'Tea/Coffee', key: 'tea-coffee', available: facilitiesData?.foodServices?.includes('Tea/Coffee') || false },
        { name: 'Chinese Meals', key: 'chinese', available: facilitiesData?.foodServices?.includes('Chinese Meals') || false },
        { name: 'North Indian Meals', key: 'north-indian', available: facilitiesData?.foodServices?.includes('North Indian Meals') || false },
      ],
    }
  ];

  const getBookButtonText = (): string => {
    if (selectedSharing === null) {
      return 'Select Room Type';
    }

    const availableBeds = getAvailableBeds(selectedSharing);

    if (availableBeds === 0) {
      return 'Room Sold Out';
    }

    return `Book ${SHARING_LABELS[selectedSharing]}`;
  };

  // Loading state
  if (!hostelData || isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CBB17" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading hostel details...</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const displayPrice = getDisplayPrice();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CBB17']}
            tintColor="#4CBB17"
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIconContainer}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.hostelName}>{hostelData?.name || 'Unnamed Hostel'}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          {photos.length > 0 ? (
            <>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {photos.map((photo: any, index: number) => (
                  <View key={photo._id || index} style={styles.carouselItem}>
                    <Image source={{ uri: photo.url || photo.uri }} style={styles.hostelImage} />
                  </View>
                ))}
              </ScrollView>

              {photos.length > 1 && (
                <View style={styles.pagination}>
                  {photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        currentImageIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              {photos.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {currentImageIndex + 1} / {photos.length}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="home-outline" size={50} color="#ccc" />
              <Text style={styles.noImageText}>No photos available</Text>
            </View>
          )}
        </View>

        {/* Main Info Card */}
        <View style={styles.mainInfoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.hostelNameTitle}>{hostelData?.name || 'Unnamed Hostel'}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {hostelData?.rating?.toFixed(1) || '4.0'}</Text>
            </View>
          </View>

          <Text style={styles.hostelAddress}>{hostelData?.address || 'No address provided'}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Starts from</Text>
            {loadingPricing ? (
              <ActivityIndicator size="small" color="#4CBB17" style={{ marginHorizontal: 8 }} />
            ) : (
              <>
                <Text style={styles.hostelPrice}>₹{displayPrice}</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </>
            )}
            {!loadingPricing && calculatedStartingPrice > 0 && (
              <View style={styles.apiPriceIndicator}>
                <Ionicons name="cloud-done" size={12} color="#4CBB17" />
                <Text style={styles.apiPriceText}>Live</Text>
              </View>
            )}
          </View>

          {facilitiesData?.essentials && facilitiesData.essentials.length > 0 && (
            <View style={styles.quickFacilities}>
              <Text style={styles.quickFacilitiesTitle}>Key Facilities:</Text>
              <View style={styles.quickFacilitiesRow}>
                {facilitiesData.essentials.slice(0, 4).map((facility: string, i: number) => (
                  <View key={i} style={styles.quickFacilityTag}>
                    <Ionicons name="checkmark-circle" size={14} color="#4CBB17" />
                    <Text style={styles.quickFacilityText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rooms Summary from API */}
          {hostelRooms?.summary && (
            <View style={styles.roomsSummaryContainer}>
              <Text style={styles.roomsSummaryTitle}>Rooms Summary:</Text>
              <View style={styles.roomsSummaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{hostelRooms.summary.totalRooms || 0}</Text>
                  <Text style={styles.summaryLabel}>Total Rooms</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{hostelRooms.summary.vacantBeds || 0}</Text>
                  <Text style={styles.summaryLabel}>Available Beds</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{hostelRooms.summary.totalBeds || 0}</Text>
                  <Text style={styles.summaryLabel}>Total Beds</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.summaryText}>
            {hostelData?.summary || 'No summary available for this hostel.'}
          </Text>
        </View>

        {/* Facilities & Amenities */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
          <Text style={styles.sectionSubtitle}>All available amenities at this hostel</Text>

          {facilities.map((category, categoryIndex) => (
            <View key={categoryIndex} style={styles.facilityCategory}>
              <Text style={styles.facilityCategoryTitle}>{category.category}</Text>
              <View style={styles.facilitiesGrid}>
                {category.items.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <View style={[
                      styles.facilityIconContainer,
                      {
                        backgroundColor: facility.available ? '#F0F8E7' : '#f8f9fa',
                      }
                    ]}>
                      <Ionicons
                        name={(() => {
                          switch (facility.key) {
                            case 'single':
                            case 'double':
                            case 'triple':
                            case 'four':
                            case 'five':
                            case 'six':
                            case 'seven':
                            case 'eight':
                            case 'nine':
                            case 'ten':
                              return 'bed-outline';
                            case 'attached':
                            case 'common':
                              return 'water-outline';
                            case 'ac':
                              return 'snow';
                            case 'wifi':
                              return 'wifi';
                            case 'power-backup':
                              return 'flash';
                            case 'cctv':
                              return 'videocam-outline';
                            case 'ro-water':
                              return 'water-outline';
                            case 'cleaning':
                              return 'home-outline';
                            case 'lift':
                              return 'business-outline';
                            case 'laundry':
                              return 'shirt-outline';
                            case 'parking':
                              return 'car-sport-outline';
                            case 'dining':
                              return 'restaurant-outline';
                            case 'library':
                              return 'book-outline';
                            case 'geyser':
                            case 'inverter':
                            case 'heater':
                              return 'thermometer-outline';
                            case 'veg':
                              return 'leaf-outline';
                            case 'non-veg':
                              return 'restaurant-outline';
                            case 'breakfast':
                              return 'cafe-outline';
                            case 'lunch':
                            case 'dinner':
                              return 'restaurant-outline';
                            case 'tea-coffee':
                              return 'cafe-outline';
                            case 'chinese':
                              return 'fast-food-outline';
                            case 'north-indian':
                              return 'restaurant-outline';
                            default:
                              return 'checkmark-circle-outline';
                          }
                        })()}
                        size={22}
                        color={facility.available ? '#4CBB17' : '#ccc'}
                      />
                    </View>
                    <Text style={[
                      styles.facilityName,
                      { color: facility.available ? '#333' : '#999' }
                    ]}>
                      {facility.name}
                    </Text>
                    <View style={[
                      styles.availabilityIndicator,
                      { backgroundColor: facility.available ? '#4CBB17' : '#ccc' }
                    ]}>
                      <Ionicons
                        name={facility.available ? "checkmark" : "close"}
                        size={12}
                        color="#fff"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Custom Food Menu */}
          {facilitiesData?.customFoodMenu && (
            <View style={styles.customFoodMenuContainer}>
              <Text style={styles.customFoodMenuTitle}>Custom Food Menu</Text>
              <Text style={styles.customFoodMenuText}>{facilitiesData.customFoodMenu}</Text>
            </View>
          )}
        </View>

        {/* Room Options - All 10 sharing types with REAL API data */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Room Options</Text>
          <Text style={styles.sectionSubtitle}>Select your preferred sharing type</Text>

          {roomsLoading || loadingPricing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CBB17" />
              <Text style={styles.loadingText}>Loading room information...</Text>
            </View>
          ) : (
            <View style={styles.sharingGrid}>
              {ALL_SHARING_TYPES.map((sharingType) => {
                const isAvailable = isSharingTypeAvailable(sharingType);
                const availableBeds = getAvailableBeds(sharingType);
                const isSoldOut = availableBeds === 0;
                const isSelected = selectedSharing === sharingType;
                const priceInfo = getPriceForSharingType(sharingType);
                const displayName = SHARING_LABELS[sharingType];
                const hasPrice = priceInfo.monthly > 0 || priceInfo.daily > 0;

                return (
                  <TouchableOpacity
                    key={sharingType}
                    style={[
                      styles.sharingItem,
                      isSelected && styles.selectedSharing,
                      isSoldOut && styles.soldOutSharing,
                      (!isAvailable || !hasPrice) && styles.notAvailableSharing
                    ]}
                    onPress={() => {
                      if (isAvailable && availableBeds > 0 && hasPrice) {
                        setSelectedSharing(sharingType);
                      }
                    }}
                    disabled={!isAvailable || availableBeds === 0 || !hasPrice}
                  >
                    <Text style={styles.sharingType}>{displayName}</Text>

                    {hasPrice ? (
                      <>
                        {priceInfo.monthly > 0 ? (
                          <>
                            <Text style={styles.sharingPrice}>₹{priceInfo.monthly}/month</Text>
                            {priceInfo.daily > 0 && (
                              <Text style={styles.dailyPrice}>₹{priceInfo.daily}/day</Text>
                            )}
                          </>
                        ) : priceInfo.daily > 0 ? (
                          <Text style={styles.sharingPrice}>₹{priceInfo.daily}/day</Text>
                        ) : (
                          <Text style={styles.notAvailablePrice}>Contact for price</Text>
                        )}

                        <Text style={[
                          styles.sharingAvailability,
                          { color: availableBeds > 0 ? '#4CBB17' : '#ff6b6b' }
                        ]}>
                          {availableBeds > 0
                            ? `${availableBeds} bed${availableBeds !== 1 ? 's' : ''} available`
                            : 'Sold out'}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.notAvailablePrice}>No pricing</Text>
                        <Text style={styles.notAvailableText}>Contact for details</Text>
                      </>
                    )}

                    {isSelected && isAvailable && availableBeds > 0 && hasPrice && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CBB17" />
                      </View>
                    )}

                    {isSoldOut && (
                      <View style={styles.soldOutOverlay}>
                        <Text style={styles.soldOutText}>SOLD OUT</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Starting Price Info */}
          <View style={styles.startingPriceInfo}>
            <Text style={styles.startingPriceLabel}>
              {loadingPricing ? 'Fetching prices...' : 'Starting Price:'}
            </Text>
            {loadingPricing ? (
              <ActivityIndicator size="small" color="#4CBB17" style={{ marginLeft: 8 }} />
            ) : (
              <Text style={styles.startingPriceValue}>
                {formatPrice(displayPrice)}/month
              </Text>
            )}
          </View>
        </View>

        {/* Guest Reviews */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Guest Reviews</Text>

          <View style={styles.addReviewSection}>
            <Text style={styles.addReviewTitle}>Add Your Review</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Your Rating:</Text>
              <View style={{ flexDirection: 'row', marginLeft: 10 }}>{renderStars(newRating, setNewRating)}</View>
            </View>

            <TextInput
              placeholder="Share your experience..."
              value={newDescription}
              onChangeText={setNewDescription}
              style={styles.input}
              multiline
              placeholderTextColor="#999"
            />

            <View style={styles.uploadButtonsRow}>
              <TouchableOpacity onPress={handleImagePick} style={styles.uploadButton}>
                <Ionicons name="image-outline" size={20} color="#fff" />
                <Text style={styles.uploadText}>Photos</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCameraPick} style={[styles.uploadButton, { backgroundColor: '#219150' }]}>
                <Ionicons name="camera-outline" size={20} color="#fff" />
                <Text style={styles.uploadText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {newImages.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                {newImages.map((uri, idx) => (
                  <View key={idx} style={styles.imagePreview}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(idx)}>
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                if (!newDescription || newRating === 0) {
                  Toast.show({ type: 'error', text1: 'Error', text2: 'Please provide rating and description' });
                  return;
                }
                Toast.show({ type: 'success', text1: 'Success', text2: 'Review submitted!' });
              }}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>

          {feedbacks.map((fb, idx) => (
            <View key={idx} style={styles.reviewBox}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{fb.name}</Text>
                <View style={{ flexDirection: 'row' }}>{renderStars(fb.rating)}</View>
              </View>
              <Text style={styles.reviewText}>{fb.description}</Text>
              {fb.media && fb.media.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImagesContainer}>
                  {fb.media.map((uri: string, i: number) => (
                    <Image key={i} source={{ uri }} style={styles.reviewImage} />
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesText}>📍 {hostelData.coordinates?.latitude?.toFixed(6) || '17.385044'}, {hostelData.coordinates?.longitude?.toFixed(6) || '78.486671'}</Text>
          </View>
          {/* <MapViewWrapper
            latitude={hostelData.coordinates?.latitude || 17.385044}
            longitude={hostelData.coordinates?.longitude || 78.486671}
            title={hostelData?.name || 'Hostel Location'}
          /> */}
        </View>
      </ScrollView>

      {/* Fixed Bottom Book Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (selectedSharing === null || !getAvailableBeds(selectedSharing)) &&
            styles.bookButtonDisabled
          ]}
          disabled={selectedSharing === null || !getAvailableBeds(selectedSharing)}
          onPress={handleQuickBooking}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>
              {getBookButtonText()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    backgroundColor: '#ffffff'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  backIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  hostelName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  carouselContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  carouselItem: {
    width: width - 32,
    height: 250,
  },
  hostelImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f5f5f5'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noImageContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  noImageText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  mainInfoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomsSummaryContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  roomsSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  roomsSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CBB17',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  notAvailableSharing: {
    opacity: 0.6,
    backgroundColor: "#f5f5f5",
  },
  notAvailablePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginBottom: 6,
  },
  notAvailableText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  hostelNameTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  ratingBadge: {
    backgroundColor: "#4CBB17",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  hostelAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 6,
  },
  hostelPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CBB17",
  },
  pricePeriod: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    marginRight: 8,
  },
  apiPriceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8E7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  apiPriceText: {
    fontSize: 10,
    color: '#4CBB17',
    fontWeight: '600',
    marginLeft: 2,
  },
  quickFacilities: {
    marginTop: 8,
  },
  quickFacilitiesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  quickFacilitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  quickFacilityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8E7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  quickFacilityText: {
    fontSize: 12,
    color: "#4CBB17",
    fontWeight: "500",
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customFoodMenuContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0F8E7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CBB17',
  },
  customFoodMenuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customFoodMenuText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  startingPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  startingPriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  startingPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CBB17',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  summaryText: {
    color: "#666",
    fontSize: 14,
    lineHeight: 22,
  },
  facilityCategory: {
    marginBottom: 20,
  },
  facilityCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  facilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  facilityItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  facilityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  facilityName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  availabilityIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  sharingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sharingItem: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  selectedSharing: {
    borderColor: "#4CBB17",
    backgroundColor: "#F0F8E7",
    transform: [{ scale: 1.02 }],
  },
  soldOutSharing: {
    opacity: 0.6,
    backgroundColor: "#f8f9fa",
  },
  sharingType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  sharingPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CBB17",
    marginBottom: 6,
  },
  dailyPrice: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  sharingAvailability: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  soldOutOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  soldOutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    transform: [{ rotate: "-45deg" }],
  },
  addReviewSection: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: "#333",
    fontSize: 14,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    minHeight: 80,
  },
  uploadButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: "#4CBB17",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 6,
  },
  uploadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  selectedImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  imagePreview: {
    position: "relative",
    marginRight: 8,
    marginBottom: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: "#4CBB17",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  reviewBox: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  reviewText: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  reviewImagesContainer: {
    marginTop: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  coordinatesContainer: {
    marginBottom: 12,
  },
  coordinatesText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  bookButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bookButton: {
    backgroundColor: "#4CBB17",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#4CBB17",
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});