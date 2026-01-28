// app/HostelDetails.tsx - COMPLETE FILE WITH COORDINATE FIXES
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
  RefreshControl,
  Alert
} from 'react-native';
import Toast from 'react-native-toast-message';
import MapViewWrapper from '../components/MapViewWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/reduxStore/store/store';
import { getStartingPrice, getHostelFacilities, getHostelRooms } from '../app/reduxStore/reduxSlices/hostelSlice';
import PricingService from '../app/api/PricingService';
import HostelFacilitiesService from '../app/api/HostelFacilitiesService';
import RoomService from '../app/api/RoomService';
import LocationService from '../app/api/LocationService';

const { width } = Dimensions.get('window');

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
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  startingPrice: number;
  availabilitySummary: any;
  sharingOptions: any[];
  allPhotos: any[];
  hostelOwnerId?: string;
  hostelId?: string;
  _id?: string;
  city?: string;
  state?: string;
  landmark?: string;
  location?: string;
}

interface RoomAvailability {
  sharingType: string;
  availableBeds: number;
  totalBeds: number;
  availableRooms: number;
  totalRooms: number;
  rooms: any[];
}

interface PricingData {
  [key: string]: {
    daily: number | null;
    monthly: number | null;
  };
}

interface CombinedPricingData {
  [key: string]: {
    daily: { price: number; currency: string } | null;
    monthly: { price: number; currency: string } | null;
    availableBeds: number;
    isAvailable: boolean;
    displayName: string;
  };
}

interface MapHostel {
  hostelId: string;
  hostelName: string;
  city: string;
  state: string;
  landmark: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface HostelLocationData {
  hostelId: string;
  hostelName: string;
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    formattedAddress: string;
    city: string;
    state: string;
    landmark: string;
  };
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

  let initialHostelData: HostelData | null = null;

  try {
    if (hostel && typeof hostel === 'string') {
      initialHostelData = JSON.parse(hostel);
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

  const [facilitiesData, setFacilitiesData] = useState<any>(null);
  const [availableSharingTypes, setAvailableSharingTypes] = useState<RoomAvailability[]>([]);
  const [roomAvailabilityByType, setRoomAvailabilityByType] = useState<Record<string, RoomAvailability>>({});

  const [pricingData, setPricingData] = useState<CombinedPricingData | null>(null);
  const [apiPricingData, setApiPricingData] = useState<PricingData | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [calculatedStartingPrice, setCalculatedStartingPrice] = useState<number>(0);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [roomsData, setRoomsData] = useState<any>(null);
  const [allMapHostels, setAllMapHostels] = useState<MapHostel[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  
  const [hostelData, setHostelData] = useState<HostelData | null>(initialHostelData);
  const [hostelLocationData, setHostelLocationData] = useState<HostelLocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const photos = hostelData?.photos || hostelData?.allPhotos || [];

  useEffect(() => {
    if (hostelData?.hostelId || hostelData?.id || hostelData?._id) {
      fetchAllHostelData();
      fetchHostelLocation();
      fetchAllMapHostels();
    }
  }, [hostelData?.hostelId, hostelData?.id, hostelData?._id]);

  const fetchHostelLocation = async () => {
    if (!hostelData) return;

    const hostelId = hostelData.hostelId || hostelData.id || hostelData._id;
    
    if (!hostelId) {
      console.error('No hostel ID available for location');
      return;
    }

    try {
      setLocationLoading(true);
      console.log(`📍 Fetching location for hostel: ${hostelId}`);
      
      const response = await LocationService.getHostelLocation(hostelId);
      
      if (response.success && response.data) {
        console.log('✅ Hostel location data fetched:', response.data);
        
        setHostelLocationData(response.data);
        
        if (response.data.location?.coordinates) {
          const updatedHostelData = {
            ...hostelData,
            coordinates: response.data.location.coordinates,
            address: response.data.location.formattedAddress || hostelData.address,
            city: response.data.location.city || hostelData.city,
            state: response.data.location.state || hostelData.state,
            landmark: response.data.location.landmark || hostelData.landmark
          };
          
          setHostelData(updatedHostelData);
          console.log('✅ Updated hostel data with coordinates:', updatedHostelData.coordinates);
        }
      } else {
        console.warn('⚠️ No location data in response, using default coordinates');
        const updatedHostelData = {
          ...hostelData,
          coordinates: hostelData.coordinates || { latitude: 17.385044, longitude: 78.486671 },
          city: hostelData.city || 'Hyderabad',
          state: hostelData.state || 'Telangana'
        };
        setHostelData(updatedHostelData);
      }
      
    } catch (error) {
      console.error('❌ Error fetching hostel location:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Failed to fetch hostel location'
      });
      
      if (hostelData) {
        const updatedHostelData = {
          ...hostelData,
          coordinates: hostelData.coordinates || { latitude: 17.385044, longitude: 78.486671 }
        };
        setHostelData(updatedHostelData);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchAllHostelData = async () => {
    if (!hostelData) return;

    setIsLoading(true);
    setRefreshing(true);

    try {
      console.log('🔄 Starting to fetch all hostel data...');

      await fetchFacilitiesData();
      await fetchPricingData();
      await fetchRoomsData();

    } catch (error) {
      console.error("Error fetching hostel data:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load some hostel data'
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFacilitiesData = async () => {
    if (!hostelData) return;

    setFacilitiesLoading(true);

    const hostelId = hostelData.hostelOwnerId || hostelData.hostelId || hostelData.id || hostelData._id;

    if (!hostelId) {
      console.error('No hostel ID available');
      setFacilitiesLoading(false);
      return;
    }

    try {
      console.log(`🔄 Fetching facilities for hostel ID: ${hostelId}`);

      const response = await HostelFacilitiesService.getFacilities(hostelId);

      if (response.success && response.data) {
        const transformedFacilities = HostelFacilitiesService.transformFacilitiesData(response.data);
        setFacilitiesData(transformedFacilities);

        console.log('✅ Facilities data loaded from API:', {
          sharingTypes: transformedFacilities.sharingTypes,
          essentialsCount: transformedFacilities.essentials.length,
        });

      } else {
        throw new Error('Failed to fetch facilities');
      }

    } catch (error: any) {
      console.error('❌ Failed to fetch facilities from API:', error);

      if (hostelData?.allFacilities) {
        setFacilitiesData(hostelData.allFacilities);
        console.log('Using facilities from hostel data');
      }

      Toast.show({
        type: 'info',
        text1: 'Info',
        text2: 'Using cached facility information'
      });
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const fetchPricingData = async () => {
    if (!hostelData) return;

    try {
      setLoadingPricing(true);
      const hostelId = hostelData.hostelId || hostelData.id || hostelData._id;

      if (hostelId) {
        console.log(`📊 Fetching pricing data for hostel: ${hostelId}`);

        try {
          const response = await PricingService.getHostelPricing(hostelId);

          if (response.success && response.pricing) {
            console.log('✅ Real pricing data loaded from API:', response.pricing);
            setApiPricingData(response.pricing);

            const combinedPricing: CombinedPricingData = {};

            ALL_SHARING_TYPES.forEach(type => {
              combinedPricing[type] = {
                daily: null,
                monthly: null,
                availableBeds: 0,
                isAvailable: false,
                displayName: SHARING_LABELS[type]
              };
            });

            Object.keys(response.pricing).forEach(sharingType => {
              const typeKey = sharingType.toLowerCase();

              if (combinedPricing[typeKey]) {
                const pricing = response.pricing[sharingType];

                if (pricing.daily && pricing.daily > 0) {
                  combinedPricing[typeKey].daily = {
                    price: pricing.daily,
                    currency: 'INR'
                  };
                  combinedPricing[typeKey].isAvailable = true;
                }

                if (pricing.monthly && pricing.monthly > 0) {
                  combinedPricing[typeKey].monthly = {
                    price: pricing.monthly,
                    currency: 'INR'
                  };
                  combinedPricing[typeKey].isAvailable = true;
                }
              }
            });

            setPricingData(combinedPricing);

            const prices: number[] = [];
            Object.values(combinedPricing).forEach(typePricing => {
              if (typePricing.monthly?.price && typePricing.monthly.price > 0) {
                prices.push(typePricing.monthly.price);
              }
              if (typePricing.daily?.price && typePricing.daily.price > 0) {
                prices.push(typePricing.daily.price * 30);
              }
            });

            const startPrice = prices.length > 0 ? Math.min(...prices) : 0;
            setCalculatedStartingPrice(startPrice);
            console.log(`💰 Calculated starting price: ₹${startPrice}`);

          } else {
            console.warn('No pricing data in API response');
          }
        } catch (error) {
          console.error('Error fetching pricing:', error);
        }
      }
    } catch (error: any) {
      console.error('Error in fetchPricingData:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const fetchRoomsData = async () => {
    if (!hostelData) return;

    const hostelId = hostelData.hostelId || hostelData.id || hostelData._id;

    if (!hostelId) {
      console.error('No hostel ID available for fetching rooms');
      return;
    }

    try {
      console.log(`🔄 Fetching rooms data for hostel: ${hostelId}`);

      const response = await RoomService.getHostelRooms(hostelId);

      if (response.success && response.data) {
        console.log('✅ Rooms data loaded:', {
          totalRooms: response.data.rooms?.length || 0,
          bedAvailability: response.data.bedAvailabilityBySharing,
          summary: response.data.summary
        });

        setRoomsData(response.data);

        const availabilityByType: Record<string, RoomAvailability> = {};
        const availableTypes: RoomAvailability[] = [];

        if (response.data.bedAvailabilityBySharing && Array.isArray(response.data.bedAvailabilityBySharing)) {
          response.data.bedAvailabilityBySharing.forEach((item: any) => {
            const typeKey = RoomService.getSharingTypeKey(item.sharingType);
            const displayName = RoomService.getSharingTypeDisplay(typeKey);

            const availability: RoomAvailability = {
              sharingType: typeKey,
              availableBeds: item.availableBeds || 0,
              totalBeds: item.totalBeds || 0,
              availableRooms: 0,
              totalRooms: 0,
              rooms: response.data.rooms?.filter((room: any) =>
                RoomService.getSharingTypeKey(room.sharingType) === typeKey
              ) || []
            };

            if (availability.rooms.length > 0) {
              availability.totalRooms = availability.rooms.length;
              availability.availableRooms = availability.rooms.filter((room: any) =>
                room.isAvailable && room.remaining > 0
              ).length;
            }

            availabilityByType[typeKey] = availability;
            availabilityByType[displayName] = availability;

            if (availability.availableBeds > 0) {
              availableTypes.push(availability);
            }
          });
        }

        setRoomAvailabilityByType(availabilityByType);
        setAvailableSharingTypes(availableTypes);

        console.log('📊 Room availability summary:', {
          availableTypes: availableTypes.map(t => ({
            type: t.sharingType,
            beds: t.availableBeds,
            rooms: t.availableRooms
          })),
          totalAvailableBeds: availableTypes.reduce((sum, type) => sum + type.availableBeds, 0)
        });

      } else {
        console.warn('No valid rooms data in response');
      }

    } catch (error: any) {
      console.error('❌ Failed to fetch rooms data:', error);
    }
  };

  const fetchAllMapHostels = async () => {
    try {
      setMapLoading(true);
      console.log('🗺️ Fetching all hostels for map...');
      
      const response = await LocationService.getAllHostelCoordinates();
      
      if (response && response.length > 0) {
        const currentHostelId = hostelData?.hostelId || hostelData?.id || hostelData?._id;
        const otherHostels = response.filter(hostel => 
          hostel.hostelId !== currentHostelId &&
          hostel.coordinates &&
          Math.abs(hostel.coordinates.latitude) > 0 &&
          Math.abs(hostel.coordinates.longitude) > 0 &&
          hostel.coordinates.latitude !== 0 &&
          hostel.coordinates.longitude !== 0
        );
        
        console.log(`✅ Found ${otherHostels.length} other hostels for map`);
        setAllMapHostels(otherHostels);
      } else {
        console.log('No hostels found for map');
      }
    } catch (error) {
      console.error('❌ Error fetching map hostels:', error);
      Toast.show({
        type: 'error',
        text1: 'Map Error',
        text2: 'Failed to load hostel locations for map'
      });
    } finally {
      setMapLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllHostelData();
    fetchHostelLocation();
    fetchAllMapHostels();
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
    if (calculatedStartingPrice > 0) {
      return calculatedStartingPrice;
    }
    if (startingPrice !== null && startingPrice > 0) {
      return startingPrice;
    }
    if (hostelData?.startingPrice && hostelData.startingPrice > 0) {
      return hostelData.startingPrice;
    }
    return 0;
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getCoordinates = () => {
    if (!hostelData) {
      return { latitude: 17.385044, longitude: 78.486671 };
    }
    
    if (hostelLocationData?.location?.coordinates) {
      return hostelLocationData.location.coordinates;
    }
    
    if (hostelData.coordinates) {
      return hostelData.coordinates;
    }
    
    return { latitude: 17.385044, longitude: 78.486671 };
  };

  const getFormattedAddress = () => {
    if (!hostelData) return 'No address provided';
    
    if (hostelLocationData?.location?.formattedAddress) {
      return hostelLocationData.location.formattedAddress;
    }
    
    if (hostelData.address) {
      return hostelData.address;
    }
    
    if (hostelLocationData?.location?.city) {
      const city = hostelLocationData.location.city;
      const state = hostelLocationData.location.state;
      return state ? `${city}, ${state}` : city;
    }
    
    if (hostelData.city) {
      const city = hostelData.city;
      const state = hostelData.state;
      return state ? `${city}, ${state}` : city;
    }
    
    return 'Address not available';
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

  const getAvailableBeds = (sharingType: SharingType): number => {
    const availability = roomAvailabilityByType[sharingType];
    if (availability) {
      return availability.availableBeds;
    }

    if (roomsData?.bedAvailabilityBySharing) {
      const item = roomsData.bedAvailabilityBySharing.find((item: any) =>
        RoomService.getSharingTypeKey(item.sharingType) === sharingType
      );
      return item?.availableBeds || 0;
    }

    return 0;
  };

  const getRoomAvailability = (sharingType: SharingType): RoomAvailability | null => {
    const availability = roomAvailabilityByType[sharingType];
    if (availability) {
      return availability;
    }

    return null;
  };

  const isSharingTypeAvailable = (sharingType: SharingType): boolean => {
    const availableBeds = getAvailableBeds(sharingType);
    return availableBeds > 0;
  };

  const getPriceForSharingType = (sharingType: SharingType) => {
    if (pricingData?.[sharingType]) {
      return {
        monthly: pricingData[sharingType].monthly?.price || 0,
        daily: pricingData[sharingType].daily?.price || 0,
        isAvailable: pricingData[sharingType].isAvailable
      };
    }

    return {
      monthly: 0,
      daily: 0,
      isAvailable: false
    };
  };

  const handleBooking = (sharingType: SharingType) => {
    if (!hostelData) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Hostel data not available' });
      return;
    }

    const availableBeds = getAvailableBeds(sharingType);

    if (availableBeds === 0) {
      Toast.show({
        type: 'error',
        text1: 'Room Unavailable',
        text2: 'This room type is currently sold out'
      });
      return;
    }

    const priceInfo = getPriceForSharingType(sharingType);

    router.push({
      pathname: '/BookingForm',
      params: {
        hostel: JSON.stringify({
          _id: hostelData.id,
          hostelOwnerId: hostelData.hostelOwnerId || hostelData.id,
          hostelName: hostelData.name,
          address: getFormattedAddress(),
          contact: hostelData.contact,
          email: hostelData.email,
          hostelType: hostelData.hostelType,
          pricing: pricingData,
          coordinates: getCoordinates(),
          startingPrice: getDisplayPrice(),
          photos: hostelData.photos,
          summary: hostelData.summary,
          facilities: facilitiesData,
          roomsData: roomsData
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
      items: (facilitiesData?.sharingTypes || []).map((sharingType: string) => {
        const internalType = sharingType.toLowerCase().replace(' sharing', '');
        const isAvailable = isSharingTypeAvailable(internalType as SharingType);
        const availability = getRoomAvailability(internalType as SharingType);

        return {
          name: sharingType,
          key: internalType,
          available: isAvailable,
          availabilityText: availability ?
            `${availability.availableBeds} bed${availability.availableBeds !== 1 ? 's' : ''} available` :
            'Check availability'
        };
      })
    },
    {
      category: 'Bathroom',
      items: (facilitiesData?.bathroomTypes || []).map((bathroomType: string) => ({
        name: bathroomType,
        key: bathroomType.toLowerCase().replace(' bathroom', '').replace(/\s+/g, '-'),
        available: true
      })),
    },
    {
      category: 'Essential Facilities',
      items: (facilitiesData?.essentials || []).map((essential: string) => ({
        name: essential,
        key: essential.toLowerCase().replace(/\s+/g, '-'),
        available: true
      })),
    },
    {
      category: 'Food Services',
      items: (facilitiesData?.foodServices || []).map((service: string) => ({
        name: service,
        key: service.toLowerCase().replace(/\s+/g, '-'),
        available: true
      })),
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
  const coordinates = getCoordinates();
  const formattedAddress = getFormattedAddress();

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
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIconContainer}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.hostelName}>{hostelData?.name || 'Unnamed Hostel'}</Text>
          <View style={{ width: 24 }} />
        </View>

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

        <View style={styles.mainInfoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.hostelNameTitle}>{hostelData?.name || 'Unnamed Hostel'}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {hostelData?.rating?.toFixed(1) || '4.0'}</Text>
            </View>
          </View>

          <Text style={styles.hostelAddress}>{formattedAddress}</Text>

          {hostelData.city && (
            <View style={styles.locationDetails}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.locationDetailsText}>
                {hostelData.city}{hostelData.state ? `, ${hostelData.state}` : ''}
                {hostelData.landmark ? ` • Near ${hostelData.landmark}` : ''}
              </Text>
            </View>
          )}

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

          {facilitiesLoading && (
            <View style={styles.loadingFacilities}>
              <ActivityIndicator size="small" color="#4CBB17" />
              <Text style={styles.loadingFacilitiesText}>Loading facilities...</Text>
            </View>
          )}

          {roomsData?.summary && (
            <View style={styles.roomsSummaryContainer}>
              <Text style={styles.roomsSummaryTitle}>Rooms Summary:</Text>
              <View style={styles.roomsSummaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{roomsData.summary.totalRooms || 0}</Text>
                  <Text style={styles.summaryLabel}>Total Rooms</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{roomsData.summary.vacantBeds || 0}</Text>
                  <Text style={styles.summaryLabel}>Available Beds</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{roomsData.summary.totalBeds || 0}</Text>
                  <Text style={styles.summaryLabel}>Total Beds</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{roomsData.summary.occupiedBeds || 0}</Text>
                  <Text style={styles.summaryLabel}>Occupied Beds</Text>
                </View>
              </View>
            </View>
          )}

          {availableSharingTypes.length > 0 && (
            <View style={styles.quickAvailabilityContainer}>
              <Text style={styles.quickAvailabilityTitle}>Available Rooms:</Text>
              <View style={styles.quickAvailabilityTags}>
                {availableSharingTypes.slice(0, 3).map((availability, index) => (
                  <View key={index} style={styles.availabilityTag}>
                    <Ionicons name="bed-outline" size={14} color="#4CBB17" />
                    <Text style={styles.availabilityTagText}>
                      {SHARING_LABELS[availability.sharingType as SharingType] || availability.sharingType}
                    </Text>
                    <Text style={styles.availabilityTagCount}>
                      ({availability.availableBeds} beds)
                    </Text>
                  </View>
                ))}
                {availableSharingTypes.length > 3 && (
                  <View style={styles.moreAvailabilityTag}>
                    <Text style={styles.moreAvailabilityText}>
                      +{availableSharingTypes.length - 3} more
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.summaryText}>
            {hostelData?.summary || 'No summary available for this hostel.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
          <Text style={styles.sectionSubtitle}>All available amenities at this hostel</Text>

          {facilitiesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CBB17" />
              <Text style={styles.loadingText}>Loading facilities...</Text>
            </View>
          ) : (
            <>
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
                            name="checkmark-circle-outline"
                            size={22}
                            color={facility.available ? '#4CBB17' : '#ccc'}
                          />
                        </View>
                        <View style={styles.facilityTextContainer}>
                          <Text style={[
                            styles.facilityName,
                            { color: facility.available ? '#333' : '#999' }
                          ]}>
                            {facility.name}
                          </Text>
                          {categoryIndex === 0 && facility.availabilityText && (
                            <Text style={[
                              styles.facilityAvailabilityText,
                              { color: facility.available ? '#4CBB17' : '#999' }
                            ]}>
                              {facility.availabilityText}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}

              {facilitiesData?.customFoodMenu && (
                <View style={styles.customFoodMenuContainer}>
                  <Text style={styles.customFoodMenuTitle}>Custom Food Menu</Text>
                  <Text style={styles.customFoodMenuText}>{facilitiesData.customFoodMenu}</Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Room Options & Availability</Text>
          <Text style={styles.sectionSubtitle}>Real-time pricing and availability</Text>

          {roomsLoading || loadingPricing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CBB17" />
              <Text style={styles.loadingText}>Loading room information...</Text>
            </View>
          ) : (
            <>
              {roomsData?.summary && (
                <View style={styles.realAvailabilitySummary}>
                  <Text style={styles.realSummaryTitle}>Current Availability</Text>
                  <View style={styles.realSummaryGrid}>
                    <View style={styles.realSummaryItem}>
                      <Text style={styles.realSummaryValue}>{roomsData.summary.totalBeds || 0}</Text>
                      <Text style={styles.realSummaryLabel}>Total Beds</Text>
                    </View>
                    <View style={styles.realSummaryItem}>
                      <Text style={styles.realSummaryValue}>{roomsData.summary.availableBeds || 0}</Text>
                      <Text style={styles.realSummaryLabel}>Available Beds</Text>
                    </View>
                    <View style={styles.realSummaryItem}>
                      <Text style={styles.realSummaryValue}>{roomsData.summary.totalRooms || 0}</Text>
                      <Text style={styles.realSummaryLabel}>Total Rooms</Text>
                    </View>
                  </View>
                </View>
              )}

              {apiPricingData && (
                <View style={styles.pricingInfoContainer}>
                  <Text style={styles.pricingInfoTitle}>Real Pricing Data</Text>
                  <Text style={styles.pricingInfoText}>
                    Prices fetched from: /public/pricing/{hostelData.hostelId}
                  </Text>
                </View>
              )}

              <View style={styles.sharingGrid}>
                {ALL_SHARING_TYPES.map((sharingType) => {
                  const isAvailable = isSharingTypeAvailable(sharingType);
                  const availableBeds = getAvailableBeds(sharingType);
                  const isSoldOut = availableBeds === 0;
                  const isSelected = selectedSharing === sharingType;
                  const priceInfo = getPriceForSharingType(sharingType);
                  const displayName = SHARING_LABELS[sharingType];
                  const hasPrice = priceInfo.monthly > 0 || priceInfo.daily > 0;
                  const availability = getRoomAvailability(sharingType);

                  return (
                    <TouchableOpacity
                      key={sharingType}
                      style={[
                        styles.sharingItem,
                        isSelected && styles.selectedSharing,
                        isSoldOut && styles.soldOutSharing,
                        (!hasPrice) && styles.notAvailableSharing
                      ]}
                      onPress={() => {
                        if (isAvailable && availableBeds > 0 && hasPrice) {
                          setSelectedSharing(sharingType);
                        } else if (!hasPrice) {
                          Toast.show({
                            type: 'info',
                            text1: 'No Pricing',
                            text2: `${displayName} pricing not available`
                          });
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

                          <View style={styles.availabilityDetails}>
                            <Ionicons
                              name={availableBeds > 0 ? "bed-outline" : "bed"}
                              size={14}
                              color={availableBeds > 0 ? '#4CBB17' : '#ff6b6b'}
                            />
                            <Text style={[
                              styles.sharingAvailability,
                              { color: availableBeds > 0 ? '#4CBB17' : '#ff6b6b' }
                            ]}>
                              {availableBeds > 0
                                ? `${availableBeds} bed${availableBeds !== 1 ? 's' : ''} available`
                                : 'Sold out'}
                            </Text>
                          </View>

                          {availability && (
                            <Text style={styles.roomDetails}>
                              {availability.availableRooms} room{availability.availableRooms !== 1 ? 's' : ''} •
                              {availability.totalBeds} total beds
                            </Text>
                          )}
                        </>
                      ) : (
                        <>
                          <Text style={styles.notAvailablePrice}>No pricing data</Text>
                          <Text style={styles.notAvailableText}>Contact hostel</Text>
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

              <View style={styles.realStartingPriceInfo}>
                <Text style={styles.realStartingPriceLabel}>
                  {loadingPricing ? 'Calculating...' : 'Starting from:'}
                </Text>
                {loadingPricing ? (
                  <ActivityIndicator size="small" color="#4CBB17" style={{ marginLeft: 8 }} />
                ) : (
                  <Text style={styles.realStartingPriceValue}>
                    {formatPrice(displayPrice)}/month
                  </Text>
                )}
              </View>

              <View style={styles.dataSourceInfo}>
                <Ionicons name="information-circle-outline" size={14} color="#666" />
                <Text style={styles.dataSourceText}>
                  Prices and availability fetched from real APIs
                </Text>
              </View>
            </>
          )}
        </View>

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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          {locationLoading ? (
            <View style={styles.locationLoadingContainer}>
              <ActivityIndicator size="small" color="#4CBB17" />
              <Text style={styles.locationLoadingText}>Fetching hostel location...</Text>
            </View>
          ) : (
            <>
              <View style={styles.locationInfoContainer}>
                <View style={styles.locationInfoRow}>
                  <Ionicons name="location" size={16} color="#4CBB17" />
                  <Text style={styles.locationInfoText}>
                    {formattedAddress}
                  </Text>
                </View>
                
                {hostelData.city && (
                  <View style={styles.locationInfoRow}>
                    <Ionicons name="business" size={16} color="#666" />
                    <Text style={styles.locationInfoText}>
                      {hostelData.city}{hostelData.state ? `, ${hostelData.state}` : ''}
                    </Text>
                  </View>
                )}
                
                {hostelData.landmark && (
                  <View style={styles.locationInfoRow}>
                    <Ionicons name="flag" size={16} color="#666" />
                    <Text style={styles.locationInfoText}>
                      Near {hostelData.landmark}
                    </Text>
                  </View>
                )}
                
                <View style={styles.coordinatesContainer}>
                  <Text style={styles.coordinatesText}>
                    📍 Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  </Text>
                  {hostelLocationData && (
                    <Text style={styles.coordinatesSource}>
                      Source: Hostel Location API
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.mapContainer}>
                {mapLoading ? (
                  <View style={styles.mapLoadingContainer}>
                    <ActivityIndicator size="large" color="#4CBB17" />
                    <Text style={styles.mapLoadingText}>Loading map...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.mapTitle}>Hostel Location on Map</Text>
                    <Text style={styles.mapSubtitle}>
                      {allMapHostels.length} other hostels shown in blue
                    </Text>
                    <MapViewWrapper
                      latitude={coordinates.latitude}
                      longitude={coordinates.longitude}
                      title={hostelData?.name || 'Hostel Location'}
                      allHostels={allMapHostels}
                    />
                    <View style={styles.mapLegend}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: '#4CBB17' }]} />
                        <Text style={styles.legendText}>This Hostel</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
                        <Text style={styles.legendText}>Other Hostels</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

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
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationDetailsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  loadingFacilities: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  loadingFacilitiesText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  quickAvailabilityContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickAvailabilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quickAvailabilityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  availabilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8E7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  availabilityTagText: {
    fontSize: 12,
    color: '#4CBB17',
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 2,
  },
  availabilityTagCount: {
    fontSize: 11,
    color: '#666',
  },
  moreAvailabilityTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  moreAvailabilityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
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
  facilityTextContainer: {
    flex: 1,
  },
  facilityAvailabilityText: {
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  },
  realAvailabilitySummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  realSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  realSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  realSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  realSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CBB17',
    marginBottom: 4,
  },
  realSummaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  pricingInfoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pricingInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 4,
  },
  pricingInfoText: {
    fontSize: 12,
    color: '#1976d2',
    fontStyle: 'italic',
  },
  availabilityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  roomDetails: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
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
    marginBottom: 8,
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
  realStartingPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  realStartingPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  realStartingPriceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CBB17',
    marginLeft: 8,
  },
  dataSourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dataSourceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontStyle: 'italic',
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
    width: "100%",
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
    marginLeft: 4,
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
  locationInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInfoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  coordinatesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  coordinatesSource: {
    fontSize: 10,
    color: '#4CBB17',
    fontStyle: 'italic',
    marginTop: 4,
  },
  mapContainer: {
    marginTop: 8,
  },
  mapLoadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  locationLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  locationLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
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