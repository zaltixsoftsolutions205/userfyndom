// app/hooks/useHostel.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/reduxStore/store/store';
import { 
  getStartingPrice, 
  getHostelById, 
  searchHostels, 
  getAllHostels,
  clearHostelError,
  setStartingPrice,
  clearStartingPrice
} from '../app/reduxStore/reduxSlices/hostelSlice';

export const useHostel = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const hostels = useSelector((state: RootState) => state.hostel.hostels);
  const selectedHostel = useSelector((state: RootState) => state.hostel.selectedHostel);
  const startingPrice = useSelector((state: RootState) => state.hostel.startingPrice);
  const loading = useSelector((state: RootState) => state.hostel.loading);
  const error = useSelector((state: RootState) => state.hostel.error);
  const searchResults = useSelector((state: RootState) => state.hostel.searchResults);

  const fetchStartingPrice = useCallback((hostelId: string) => {
    return dispatch(getStartingPrice(hostelId));
  }, [dispatch]);

  const fetchHostelById = useCallback((hostelId: string) => {
    return dispatch(getHostelById(hostelId));
  }, [dispatch]);

  const searchHostelsByQuery = useCallback((searchQuery: string) => {
    return dispatch(searchHostels(searchQuery));
  }, [dispatch]);

  const fetchAllHostels = useCallback(() => {
    return dispatch(getAllHostels());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearHostelError());
  }, [dispatch]);

  const updateStartingPrice = useCallback((price: number) => {
    dispatch(setStartingPrice(price));
  }, [dispatch]);

  const resetStartingPrice = useCallback(() => {
    dispatch(clearStartingPrice());
  }, [dispatch]);

  return {
    hostels,
    selectedHostel,
    startingPrice,
    loading,
    error,
    searchResults,
    fetchStartingPrice,
    fetchHostelById,
    searchHostelsByQuery,
    fetchAllHostels,
    clearError,
    updateStartingPrice,
    resetStartingPrice,
  };
};