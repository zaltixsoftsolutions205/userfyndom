// app/reduxStore/store/store.tsx
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../reduxSlices/authSlice";
import hostelReducer from "../reduxSlices/hostelSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostel: hostelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['hostel/setSelectedHostel', 'hostel/setHostelFacilities'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['hostel.selectedHostel.photos', 'hostel.hostelFacilities'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;