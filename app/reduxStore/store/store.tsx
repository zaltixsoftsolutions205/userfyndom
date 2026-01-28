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
        ignoredActions: ['hostel/setSelectedHostel', 'hostel/setHostelFacilities'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['hostel.selectedHostel.photos', 'hostel.hostelFacilities'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;