// app/(tabs)/Search.tsx - UPDATED WITH REAL SEARCH FUNCTIONALITY
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import HostelService from '../api/HostelService';
import LocationService from '../api/LocationService';

const { width } = Dimensions.get('window');

export default function Search() {
  const router = useRouter();
  const { query } = useLocalSearchParams();
  
  const [searchText, setSearchText] = useState(typeof query === 'string' ? query : '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (searchText.trim().length > 0) {
      performSearch(searchText);
    }
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      // You can use AsyncStorage or Context for recent searches
      const recent = ['Ameerpet', 'Kukatpally', 'Hitech City', 'Girls Hostel', 'Boys Hostel'];
      setRecentSearches(recent);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Performing search for: ${searchQuery}`);
      
      // Save to recent searches
      if (!recentSearches.includes(searchQuery)) {
        const updated = [searchQuery, ...recentSearches.slice(0, 4)];
        setRecentSearches(updated);
      }
      
      // First try area-based search
      const areaResponse = await LocationService.searchHostelsByArea(searchQuery);
      
      if (areaResponse.success && areaResponse.data.length > 0) {
        console.log(`✅ Found ${areaResponse.data.length} hostels in area: ${searchQuery}`);
        
        const hostelIds = areaResponse.data.map((result: any) => result.hostelId);
        const detailedHostels = [];
        
        for (const hostelId of hostelIds) {
          try {
            const hostelDetail = await HostelService.getHostelById(hostelId);
            if (hostelDetail.success && hostelDetail.data) {
              detailedHostels.push({
                ...hostelDetail.data,
                searchType: 'area'
              });
            }
          } catch (error) {
            console.error(`Error fetching hostel ${hostelId}:`, error);
          }
        }
        
        if (detailedHostels.length > 0) {
          setSearchResults(detailedHostels);
          return;
        }
      }
      
      // Fallback to general hostel search
      console.log(`🔍 Searching in all hostels for: ${searchQuery}`);
      const allHostels = await HostelService.getAllHostels();
      
      if (allHostels.success && allHostels.data) {
        const filtered = allHostels.data.filter(hostel => {
          const searchLower = searchQuery.toLowerCase();
          return (
            hostel.name?.toLowerCase().includes(searchLower) ||
            hostel.location?.toLowerCase().includes(searchLower) ||
            hostel.address?.toLowerCase().includes(searchLower) ||
            hostel.city?.toLowerCase().includes(searchLower) ||
            hostel.hostelType?.toLowerCase().includes(searchLower) ||
            hostel.gender?.toLowerCase().includes(searchLower)
          );
        });
        
        console.log(`✅ Found ${filtered.length} hostels matching: ${searchQuery}`);
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Search Error',
        text2: 'Failed to perform search'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchText.trim().length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Empty Search',
        text2: 'Please enter a search term'
      });
      return;
    }
    
    performSearch(searchText);
  };

  const handleRecentSearch = (searchTerm: string) => {
    setSearchText(searchTerm);
    performSearch(searchTerm);
  };

  const handleHostelPress = (hostel: any) => {
    router.push({
      pathname: "/HostelDetails",
      params: {
        hostel: JSON.stringify({
          ...hostel,
          hostelOwnerId: hostel.hostelOwnerId || hostel.id || hostel._id,
          hostelId: hostel.id || hostel._id
        })
      }
    });
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
  };

  const renderHostelCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.hostelCard} onPress={() => handleHostelPress(item)}>
      <View style={styles.hostelImageContainer}>
        {item.image || item.photos?.[0]?.url ? (
          <Image 
            source={{ uri: item.image || item.photos?.[0]?.url }} 
            style={styles.hostelImage} 
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="home-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.hostelInfo}>
        <Text style={styles.hostelName} numberOfLines={1}>
          {item.name || 'Unnamed Hostel'}
        </Text>
        <Text style={styles.hostelLocation} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} color="#666" /> 
          {item.location || item.address || item.city || 'Location not specified'}
        </Text>
        
        <View style={styles.hostelDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.hostelPrice}>₹{item.startingPrice || item.price || '0'}</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.0'}</Text>
          </View>
        </View>
        
        <View style={styles.facilitiesRow}>
          {item.facilities?.slice(0, 2).map((facility: string, index: number) => (
            <View key={index} style={styles.facilityTag}>
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          ))}
          {item.facilities?.length > 2 && (
            <Text style={styles.moreFacilities}>+{item.facilities.length - 2} more</Text>
          )}
        </View>
        
        <View style={styles.typeRow}>
          <Text style={[
            styles.hostelType,
            { backgroundColor: item.gender === 'Girls' || item.hostelType === 'girls' ? '#FFE4E8' : 
                         item.gender === 'Boys' || item.hostelType === 'boys' ? '#E3F2FD' : '#F0F8E7' }
          ]}>
            {item.gender || item.hostelType || 'Co-living'}
          </Text>
          
          {item.searchType === 'area' && (
            <View style={styles.areaBadge}>
              <Ionicons name="location" size={10} color="#fff" />
              <Text style={styles.areaBadgeText}>Area Match</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentSearchItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.recentSearchItem} 
      onPress={() => handleRecentSearch(item)}
    >
      <Ionicons name="time-outline" size={16} color="#666" />
      <Text style={styles.recentSearchText}>{item}</Text>
      <Ionicons name="arrow-forward" size={16} color="#4CBB17" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search hostels, areas, cities..."
            style={styles.searchInput}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CBB17" />
          <Text style={styles.loadingText}>Searching for "{searchText}"...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => performSearch(searchText)}>
            <Text style={styles.retryButtonText}>Retry Search</Text>
          </TouchableOpacity>
        </View>
      ) : searchResults.length === 0 && searchText ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>
            No hostels found for "{searchText}"
          </Text>
          <Text style={styles.emptySuggestion}>
            Try searching for areas like "Ameerpet", "Kukatpally" or hostel types like "Boys Hostel"
          </Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/Home')}>
            <Text style={styles.browseButtonText}>Browse All Hostels</Text>
          </TouchableOpacity>
        </View>
      ) : searchResults.length > 0 ? (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              Search Results
            </Text>
            <Text style={styles.resultsCount}>
              {searchResults.length} {searchResults.length === 1 ? 'hostel' : 'hostels'} found
            </Text>
          </View>
          
          <FlatList
            data={searchResults}
            renderItem={renderHostelCard}
            keyExtractor={(item) => `search-${item.id || item._id || Math.random()}`}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        // Show recent searches when no search has been performed
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
          
          {recentSearches.length > 0 ? (
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearchItem}
              keyExtractor={(item, index) => `recent-${index}`}
              contentContainerStyle={styles.recentSearchesList}
            />
          ) : (
            <View style={styles.noRecentSearches}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noRecentSearchesText}>No recent searches</Text>
            </View>
          )}
          
          <Text style={styles.popularSearchesTitle}>Popular Areas</Text>
          <View style={styles.popularAreasContainer}>
            {['Ameerpet', 'Kukatpally', 'Hitech City', 'Dilsukhnagar', 'Madhapur'].map((area) => (
              <TouchableOpacity 
                key={area} 
                style={styles.areaTag}
                onPress={() => handleRecentSearch(area)}
              >
                <Ionicons name="location-outline" size={14} color="#4CBB17" />
                <Text style={styles.areaTagText}>{area}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  searchButton: {
    backgroundColor: '#4CBB17',
    borderRadius: 6,
    padding: 6,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#4CBB17',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySuggestion: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  browseButton: {
    backgroundColor: '#4CBB17',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  resultsList: {
    padding: 16,
  },
  hostelCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hostelImageContainer: {
    width: 100,
    height: 120,
  },
  hostelImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostelInfo: {
    flex: 1,
    padding: 12,
  },
  hostelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hostelLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  hostelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hostelPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CBB17',
  },
  pricePeriod: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#FF8F00',
    fontWeight: '600',
    marginLeft: 2,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 10,
    color: '#4CBB17',
    fontWeight: '500',
  },
  moreFacilities: {
    fontSize: 10,
    color: '#666',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostelType: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CBB17',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  areaBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 2,
  },
  recentSearchesContainer: {
    flex: 1,
    padding: 16,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  recentSearchesList: {
    paddingBottom: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  noRecentSearches: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noRecentSearchesText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  popularSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  popularAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8E7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CBB17',
  },
  areaTagText: {
    fontSize: 14,
    color: '#4CBB17',
    fontWeight: '600',
    marginLeft: 4,
  },
});