import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ApiClient from './api/ApiClient';
import { Hostel } from './api/HostelService';

const { width } = Dimensions.get('window');

export default function AllHostels() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get parameters passed from Home screen
  const hostelsParam = params.hostels as string;
  const title = params.title as string || 'All Hostels';
  const sectionType = params.sectionType as string || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHostels, setFilteredHostels] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allHostels, setAllHostels] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalHostels, setTotalHostels] = useState(0);

  // Parse initial hostels from params
  useEffect(() => {
    if (hostelsParam) {
      try {
        const parsedHostels = JSON.parse(hostelsParam);
        setAllHostels(parsedHostels);
        setFilteredHostels(parsedHostels);
      } catch (error) {
        console.error('Error parsing hostels:', error);
      }
    } else {
      // If no hostels passed, fetch all hostels
      fetchAllHostels();
    }
  }, []);

  const categories = [
    { id: 'All', label: 'All Hostels' },
    { id: 'Boys', label: 'Boys Hostels' },
    { id: 'Girls', label: 'Girls Hostels' },
    { id: 'Co-living', label: 'Co-living' },
  ];

  const fetchAllHostels = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await ApiClient.get('/student/hostels', {
        params: { 
          page: pageNum,
          limit: 20,
          ...(sectionType === 'forYou' && { sort: 'recommended' }),
          ...(sectionType === 'featured' && { sort: 'rating' })
        }
      });

      if (response.success) {
        const transformedHostels = response.data.map((hostel: Hostel) => transformHostelData(hostel));
        
        if (isRefresh || pageNum === 1) {
          setAllHostels(transformedHostels);
        } else {
          setAllHostels(prev => [...prev, ...transformedHostels]);
        }
        
        setTotalHostels(response.pagination?.total || transformedHostels.length);
        setHasMore(response.pagination?.current < response.pagination?.pages);
        
        // Apply current filters to new data
        applyFilters(transformedHostels, isRefresh || pageNum === 1 ? transformedHostels : [...allHostels, ...transformedHostels]);
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
      Alert.alert('Error', 'Failed to load hostels. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const transformHostelData = (hostel: Hostel) => {
    const primaryPhoto = hostel.photos?.find(photo => photo.isPrimary) || hostel.photos?.[0];
    
    let imageUrl = null;
    if (primaryPhoto?.url) {
      if (primaryPhoto.url.startsWith('http')) {
        imageUrl = primaryPhoto.url;
      } else {
        const normalizedUrl = primaryPhoto.url.startsWith('/')
          ? primaryPhoto.url
          : `/${primaryPhoto.url}`;
        imageUrl = `https://api.fyndom.in${normalizedUrl}`;
      }
    }

    const allPhotos = hostel.photos?.map(photo => {
      let photoUrl = photo.url;
      if (photoUrl && !photoUrl.startsWith('http')) {
        const normalizedUrl = photoUrl.startsWith('/')
          ? photoUrl
          : `/${photoUrl}`;
        photoUrl = `https://api.fyndom.in${normalizedUrl}`;
      }
      return {
        ...photo,
        url: photoUrl
      };
    }) || [];

    const sharingOptions = [];
    if (hostel.pricing) {
      if (hostel.pricing.single?.monthly?.price !== undefined && hostel.pricing.single?.monthly?.price !== null) {
        sharingOptions.push({
          type: '1 Sharing',
          price: hostel.pricing.single.monthly.price,
          available: hostel.pricing.single.availableBeds || 0
        });
      }
      if (hostel.pricing.double?.monthly?.price !== undefined && hostel.pricing.double?.monthly?.price !== null) {
        sharingOptions.push({
          type: '2 Sharing',
          price: hostel.pricing.double.monthly.price,
          available: hostel.pricing.double.availableBeds || 0
        });
      }
      if (hostel.pricing.triple?.monthly?.price !== undefined && hostel.pricing.triple?.monthly?.price !== null) {
        sharingOptions.push({
          type: '3 Sharing',
          price: hostel.pricing.triple.monthly.price,
          available: hostel.pricing.triple.availableBeds || 0
        });
      }
      if (hostel.pricing.four?.monthly?.price !== undefined && hostel.pricing.four?.monthly?.price !== null) {
        sharingOptions.push({
          type: '4 Sharing',
          price: hostel.pricing.four.monthly.price,
          available: hostel.pricing.four.availableBeds || 0
        });
      }
    }

    const firstSharing = sharingOptions.find(opt => opt.available > 0) || sharingOptions[0];
    const sharingNumber = firstSharing ? parseInt(firstSharing.type.split(' ')[0]) : 2;

    const extractLocationFromAddress = (address: string): string => {
      if (!address) return 'Unknown Location';
      const areas = ['Kukatpally', 'L.B. Nagar', 'Secunderabad', 'Ameerpet', 'Hitech City', 'Madhapur', 'Begumpet', 'KPHB', 'Dilsukhnagar'];
      for (const area of areas) {
        if (address.toLowerCase().includes(area.toLowerCase())) {
          return area;
        }
      }
      const words = address.split(',').map(word => word.trim()).filter(word => word.length > 3);
      return words[0] || 'Hyderabad';
    };

    const determineGenderFromHostel = (hostel: Hostel): string => {
      const name = hostel.hostelName?.toLowerCase() || '';
      const type = hostel.hostelType?.toLowerCase() || '';
      if (name.includes('boys') || name.includes('boy') || type === 'boys') return 'Boys';
      if (name.includes('girls') || name.includes('girl') || type === 'girls') return 'Girls';
      if (name.includes('women') || name.includes('womens')) return 'Girls';
      return 'Co-living';
    };

    const facilitiesCount = hostel.facilities?.essentials?.length || 0;
    let ratingBonus = 0;
    if (allPhotos.length > 0) ratingBonus += 0.3;
    ratingBonus += Math.min(facilitiesCount * 0.1, 0.5);
    if (hostel.facilities?.essentials?.includes('Air Conditioning')) ratingBonus += 0.2;
    if (hostel.facilities?.essentials?.includes('Free WiFi')) ratingBonus += 0.2;
    
    const baseRating = 3.5;
    const finalRating = Math.min(baseRating + ratingBonus + (Math.random() * 0.6), 5.0);

    return {
      id: hostel._id,
      name: hostel.hostelName || 'Unnamed Hostel',
      address: hostel.address || 'Address not provided',
      price: firstSharing ? `₹${firstSharing.price} / month` : `₹${hostel.startingPrice || 0} / month`,
      location: extractLocationFromAddress(hostel.address),
      rating: parseFloat(finalRating.toFixed(1)),
      image: imageUrl,
      facilities: hostel.facilities?.essentials || [],
      gender: determineGenderFromHostel(hostel),
      sharing: sharingNumber,
      summary: hostel.summary || 'Comfortable accommodation with modern amenities.',
      contact: hostel.contact || 'Not provided',
      email: hostel.email || 'Not provided',
      coordinates: hostel.coordinates || null,
      allPhotos: allPhotos,
      allFacilities: hostel.facilities || {},
      pricing: hostel.pricing || {},
      availabilitySummary: hostel.availabilitySummary || {},
      sharingOptions: sharingOptions,
      startingPrice: hostel.startingPrice || 0,
      hostelOwnerId: hostel._id,
      // For API fetching
      _id: hostel._id,
      photos: allPhotos
    };
  };

  const applyFilters = useCallback((hostels: any[], allHostelsData: any[] = hostels) => {
    let filtered = allHostelsData;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(hostel => hostel.gender === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hostel =>
        hostel.name.toLowerCase().includes(query) ||
        hostel.location.toLowerCase().includes(query) ||
        hostel.address.toLowerCase().includes(query)
      );
    }

    setFilteredHostels(filtered);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    applyFilters(allHostels);
  }, [selectedCategory, searchQuery, allHostels]);

  const handleRefresh = useCallback(() => {
    if (!hostelsParam) {
      fetchAllHostels(1, true);
    }
  }, [hostelsParam]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !hostelsParam) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAllHostels(nextPage);
    }
  };

  const renderHostelCard = ({ item }: { item: any }) => (
    <View style={styles.hostelCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.hostelImage} />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="home-outline" size={40} color="#ccc" />
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}
      
      <View style={styles.hostelContent}>
        <View style={styles.headerRow}>
          <Text style={styles.hostelName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.hostelLocation}>
          {item.location} • {item.sharing} Sharing
        </Text>
        
        <Text style={styles.hostelAddress} numberOfLines={2}>
          {item.address}
        </Text>

        <View style={styles.facilitiesRow}>
          {item.facilities.slice(0, 2).map((facility: string, index: number) => (
            <View key={index} style={styles.facilityTag}>
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          ))}
          {item.facilities.length > 2 && (
            <View style={styles.moreFacilitiesTag}>
              <Text style={styles.moreFacilitiesText}>+{item.facilities.length - 2}</Text>
            </View>
          )}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{item.price}</Text>
          <View style={[
            styles.genderBadge,
            { 
              backgroundColor: item.gender === 'Boys' ? '#e3f2fd' : 
                             item.gender === 'Girls' ? '#fce4ec' : '#f3e5f5'
            }
          ]}>
            <Text style={[
              styles.genderText,
              { 
                color: item.gender === 'Boys' ? '#1976d2' : 
                       item.gender === 'Girls' ? '#c2185b' : '#7b1fa2'
              }
            ]}>
              {item.gender}
            </Text>
          </View>
        </View>

        {/* View Details Button */}
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => router.push({ 
            pathname: "/HostelDetails", 
            params: { 
              hostel: JSON.stringify({
                ...item,
                hostelOwnerId: item.hostelOwnerId || item.id
              })
            } 
          })}
        >
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#219150" />
        <Text style={styles.loadingText}>Loading more hostels...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#666" />
          <TextInput
            placeholder="Search hostels, locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredHostels.length} {filteredHostels.length === 1 ? 'hostel' : 'hostels'} found
          {totalHostels > 0 && ` out of ${totalHostels}`}
        </Text>
      </View>

      {/* Hostels Grid */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#219150" />
          <Text style={styles.loadingText}>Loading hostels...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHostels}
          renderItem={renderHostelCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.hostelsGrid}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#219150']}
              tintColor="#219150"
            />
          }
          onEndReached={!hostelsParam ? handleLoadMore : undefined}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hostels found</Text>
              <Text style={styles.emptySubText}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#219150',
    borderColor: '#219150',
    shadowColor: '#219150',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  hostelsGrid: {
    padding: 12,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  hostelCard: {
    width: (width - 36) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  hostelImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  noImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  hostelContent: {
    padding: 12,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  hostelName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
    lineHeight: 18,
  },
  ratingBadge: {
    backgroundColor: '#4CBB17',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  hostelLocation: {
    fontSize: 13,
    color: '#219150',
    fontWeight: '600',
    marginBottom: 4,
  },
  hostelAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
    flex: 1,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  facilityTag: {
    backgroundColor: '#F0F8E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 10,
    color: '#4CBB17',
    fontWeight: '600',
  },
  moreFacilitiesTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  moreFacilitiesText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#219150',
  },
  genderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewDetailsButton: {
    backgroundColor: '#219150',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    width: '100%',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});