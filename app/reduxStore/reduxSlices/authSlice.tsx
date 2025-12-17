import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AuthService, { LoginData } from "../../../app/api/AuthService";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  userId: null,
  role: null,
  isAuthenticated: false,
};

// Login thunk
export const login = createAsyncThunk(
  "auth/login",
  async (data: LoginData, { rejectWithValue }) => {
    try {
      const response = await AuthService.studentLogin(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed, try again"
      );
    }
  }
);

// Refresh token thunk
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshToken();
      return response;
    } catch (error: any) {
      await AuthService.logout();
      return rejectWithValue(
        error.response?.data?.message || "Session expired, please login again"
      );
    }
  }
);

// Initialize auth from storage
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const [userData, token, refreshToken] = await Promise.all([
        AuthService.getUserData(),
        AuthService.getAccessToken(),
        AuthService.getRefreshToken()
      ]);

      if (token && userData) {
        return {
          user: userData.user,
          token,
          refreshToken,
          role: userData.role,
          isAuthenticated: true
        };
      }

      return {
        user: null,
        token: null,
        refreshToken: null,
        role: null,
        isAuthenticated: false
      };
    } catch (error: any) {
      return rejectWithValue("Failed to initialize authentication");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.userId = null;
      state.role = null;
      state.isAuthenticated = false;
      AuthService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.role = action.payload.role;
      state.userId = action.payload.user?._id || null;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.role = action.payload.role;
        state.userId = action.payload.user?._id || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Initialize auth cases
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.role;
        state.userId = action.payload.user?._id || null;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;