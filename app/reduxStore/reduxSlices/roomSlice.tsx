import { createSlice } from "@reduxjs/toolkit";
import { getAllRooms } from "../reduxSlices/roomSlice"; // if thunk is elsewhere, fix path

const initialState = {
  allRooms: [],
  allRoomsLoading: false,
  allRoomsError: null,

  summary: null,

  // ✅ THIS IS THE KEY
  sharingTypeAvailability: {},
};

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    // --------------------
    // FETCH ROOMS - LOADING
    // --------------------
    builder.addCase(getAllRooms.pending, (state) => {
      state.allRoomsLoading = true;
    });

    // --------------------
    // FETCH ROOMS - SUCCESS
    // --------------------
    builder.addCase(getAllRooms.fulfilled, (state, action) => {
      state.allRoomsLoading = false;

      state.allRooms = action.payload.data.rooms;
      state.summary = action.payload.data.summary;

      // ✅ MAIN FIX
      state.sharingTypeAvailability =
        action.payload.data.sharingTypeAvailability || {};
    });

    // --------------------
    // FETCH ROOMS - ERROR
    // --------------------
    builder.addCase(getAllRooms.rejected, (state, action) => {
      state.allRoomsLoading = false;
      state.allRoomsError = action.payload || "Failed to fetch rooms";
    });
  },
});

export default roomSlice.reducer;
