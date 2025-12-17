// app/reduxStore/reduxSlices/hostelSlice.tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import HostelService, { Hostel, StartingPriceResponse, SingleHostelResponse, FacilitiesResponse } from "../../api/HostelService";
import RoomService from "../../api/RoomService";

interface HostelState {
  hostels: Hostel[];
  selectedHostel: Hostel | null;
  startingPrice: number | null;
  loading: boolean;
  error: string | null;
  searchResults: Hostel[];
  hostelFacilities: {
    sharingTypes: string[];
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
    customFoodMenu?: string;
  } | null;
  facilitiesLoading: boolean;
  facilitiesError: string | null;
  hostelRooms: any | null;
  roomsLoading: boolean;
  roomsError: string | null;
}

const initialState: HostelState = {
  hostels: [],
  selectedHostel: null,
  startingPrice: null,
  loading: false,
  error: null,
  searchResults: [],
  hostelFacilities: null,
  facilitiesLoading: false,
  facilitiesError: null,
  hostelRooms: null,
  roomsLoading: false,
  roomsError: null,
};

// Get starting price for a hostel
export const getStartingPrice = createAsyncThunk(
  "hostel/getStartingPrice",
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response: StartingPriceResponse = await HostelService.getStartingPrice(hostelId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get starting price"
      );
    }
  }
);

// Get hostel rooms (public endpoint)
export const getHostelRooms = createAsyncThunk(
  "hostel/getHostelRooms",
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response = await RoomService.getHostelRooms(hostelId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get hostel rooms"
      );
    }
  }
);

// Get hostel by ID
export const getHostelById = createAsyncThunk(
  "hostel/getHostelById",
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response: SingleHostelResponse = await HostelService.getHostelById(hostelId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get hostel details"
      );
    }
  }
);

// Get hostel facilities
export const getHostelFacilities = createAsyncThunk(
  "hostel/getHostelFacilities",
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response: FacilitiesResponse = await HostelService.getHostelFacilities(hostelId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get hostel facilities"
      );
    }
  }
);

// Search hostels
export const searchHostels = createAsyncThunk(
  "hostel/searchHostels",
  async (searchQuery: string, { rejectWithValue }) => {
    try {
      const response = await HostelService.searchHostels(searchQuery);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search hostels"
      );
    }
  }
);

// Get all hostels
export const getAllHostels = createAsyncThunk(
  "hostel/getAllHostels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await HostelService.getAllHostels();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get hostels"
      );
    }
  }
);

const hostelSlice = createSlice({
  name: "hostel",
  initialState,
  reducers: {
    clearHostelError: (state) => {
      state.error = null;
    },
    clearFacilitiesError: (state) => {
      state.facilitiesError = null;
    },
    setSelectedHostel: (state, action) => {
      state.selectedHostel = action.payload;
    },
    clearSelectedHostel: (state) => {
      state.selectedHostel = null;
      state.startingPrice = null;
      state.hostelFacilities = null;
      state.facilitiesError = null;
    },
    setStartingPrice: (state, action) => {
      state.startingPrice = action.payload;
    },
    clearStartingPrice: (state) => {
      state.startingPrice = null;
    },
    setHostelFacilities: (state, action) => {
      state.hostelFacilities = action.payload;
    },
    clearHostelFacilities: (state) => {
      state.hostelFacilities = null;
      state.facilitiesError = null;
    },
    clearRooms: (state) => {
      state.hostelRooms = null;
      state.roomsError = null;
    },
    setHostelRooms: (state, action) => {
      state.hostelRooms = action.payload;
    },
    clearRoomsError: (state) => {
      state.roomsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get starting price cases
      .addCase(getStartingPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStartingPrice.fulfilled, (state, action) => {
        state.loading = false;
        state.startingPrice = action.payload.startingPrice;
        state.error = null;
      })
      .addCase(getStartingPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.startingPrice = null;
      })

      // Get hostel by ID cases
      .addCase(getHostelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHostelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHostel = action.payload.data;
        if (action.payload.data.startingPrice) {
          state.startingPrice = action.payload.data.startingPrice;
        } else if (action.payload.data.pricing) {
          state.startingPrice = HostelService.calculateLocalStartingPrice(action.payload.data.pricing);
        }
        state.error = null;
      })
      .addCase(getHostelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get hostel rooms cases
      .addCase(getHostelRooms.pending, (state) => {
        state.roomsLoading = true;
        state.roomsError = null;
      })
      .addCase(getHostelRooms.fulfilled, (state, action) => {
        state.roomsLoading = false;
        state.hostelRooms = action.payload.data;
        state.roomsError = null;
      })
      .addCase(getHostelRooms.rejected, (state, action) => {
        state.roomsLoading = false;
        state.roomsError = action.payload as string;
        state.hostelRooms = null;
      })

      // Get hostel facilities cases
      .addCase(getHostelFacilities.pending, (state) => {
        state.facilitiesLoading = true;
        state.facilitiesError = null;
      })
      .addCase(getHostelFacilities.fulfilled, (state, action) => {
        state.facilitiesLoading = false;
        state.hostelFacilities = action.payload.data;
        state.facilitiesError = null;
      })
      .addCase(getHostelFacilities.rejected, (state, action) => {
        state.facilitiesLoading = false;
        state.facilitiesError = action.payload as string;
        state.hostelFacilities = null;
      })

      // Search hostels cases
      .addCase(searchHostels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchHostels.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
        state.error = null;
      })
      .addCase(searchHostels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get all hostels cases
      .addCase(getAllHostels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllHostels.fulfilled, (state, action) => {
        state.loading = false;
        state.hostels = action.payload.data;
        state.error = null;
      })
      .addCase(getAllHostels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearHostelError, 
  clearFacilitiesError,
  setSelectedHostel, 
  clearSelectedHostel,
  setStartingPrice,
  clearStartingPrice,
  setHostelFacilities,
  clearHostelFacilities,
  clearRooms,
  setHostelRooms,
  clearRoomsError
} = hostelSlice.actions;

export default hostelSlice.reducer;