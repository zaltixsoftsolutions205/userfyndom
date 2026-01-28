import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AuthService, { LoginData, RegisterData } from "../../../app/api/AuthService";
import AsyncStorage from '@react-native-async-storage/async-storage';


interface ReferralData {
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  referralPoints?: number;
}

interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

interface AuthState {
  user: any;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  registrationSuccess: boolean;
  registrationData: any;
  referralData: ReferralData | null;
  walletData: WalletData | null;
  isInitialized: boolean;
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
  registrationSuccess: false,
  registrationData: null,
  referralData: null,
  walletData: null,
  isInitialized: false,
};

// Register thunk - REAL
export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await AuthService.studentRegister(data);

      if (!response.success) {
        return rejectWithValue(response.message || "Registration failed");
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed, try again";
      return rejectWithValue(errorMessage);
    }
  }
);

// Login thunk - REAL
// In your authSlice.tsx, update the login thunk:

// Login thunk - UPDATED with better error handling
export const login = createAsyncThunk(
  "auth/login",
  async (data: LoginData, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux: Attempting login...');
      const response = await AuthService.studentLogin(data);

      console.log('📥 Redux: Login response:', {
        success: response.success,
        message: response.message
      });

      if (!response.success) {
        console.log('❌ Redux: Login failed in response:', response.message);
        return rejectWithValue(response.message || "Login failed");
      }

      if (!response.tokens || !response.user) {
        console.log('❌ Redux: Missing tokens or user data');
        return rejectWithValue("Invalid response from server");
      }

      console.log('✅ Redux: Login successful, returning data');
      return response;
    } catch (error: any) {
      console.error('❌ Redux: Login catch error:', {
        message: error.message,
        response: error.response?.data
      });

      // Extract error message
      let errorMessage = "Login failed, please try again";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Get referral stats thunk - REAL
export const getReferralStats = createAsyncThunk(
  "auth/getReferralStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getReferralStats();

      if (!response.success) {
        return rejectWithValue(response.message || "Failed to fetch referral data");
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch referral data";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get wallet balance thunk - REAL
export const getWalletBalance = createAsyncThunk(
  "auth/getWalletBalance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getWalletBalance();

      if (!response.success) {
        return rejectWithValue(response.message || "Failed to fetch wallet data");
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch wallet data";
      return rejectWithValue(errorMessage);
    }
  }
);

// Initialize auth from storage - REAL
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Initializing auth from storage...');

      const [userData, token, refreshToken] = await Promise.all([
        AuthService.getUserData(),
        AuthService.getAccessToken(),
        AuthService.getRefreshToken()
      ]);

      console.log('📦 Stored data:', {
        hasUserData: !!userData,
        hasToken: !!token,
        hasRefreshToken: !!refreshToken
      });

      if (token && userData) {
        console.log('✅ User is authenticated');
        return {
          user: userData.user,
          token,
          refreshToken,
          role: userData.role,
          isAuthenticated: true,
          referralData: {
            referralCode: userData.referralCode,
            referredBy: userData.referredBy
          }
        };
      }

      console.log('⚠️ No valid auth data found');
      return {
        user: null,
        token: null,
        refreshToken: null,
        role: null,
        isAuthenticated: false,
        referralData: null
      };
    } catch (error: any) {
      console.error('❌ Initialize auth error:', error);
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
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.error = null;
      state.registrationSuccess = false;
      state.registrationData = null;
      state.referralData = null;
      state.walletData = null;
      AuthService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
      state.registrationData = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    updateWalletBalance: (state, action) => {
      if (state.walletData) {
        state.walletData.balance = action.payload;
      } else {
        state.walletData = {
          balance: action.payload,
          transactions: []
        };
      }
    }
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.role;
        state.userId = action.payload.user?._id || null;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.referralData = action.payload.referralData;
        state.isInitialized = true;
        console.log('✅ Auth initialized:', {
          isAuthenticated: state.isAuthenticated,
          isInitialized: state.isInitialized
        });
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
        state.registrationData = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.registrationData = action.payload.data;
        state.error = null;

        if (action.payload.data) {
          state.referralData = {
            referralCode: action.payload.data.referralCode,
            referredBy: action.payload.data.referredBy,
            referralCount: 0,
            referralPoints: 0
          };
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.registrationSuccess = false;
        state.registrationData = null;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.role = action.payload.role || 'student';
        state.userId = action.payload.user?._id || null;
        state.isAuthenticated = true;
        state.error = null;

        // ✅ SAVE TOKENS FOR API CLIENT
        AsyncStorage.multiSet([
          ['accessToken', action.payload.tokens.accessToken],
          ['refreshToken', action.payload.tokens.refreshToken],
          ['userData', JSON.stringify({
            user: action.payload.user,
            role: action.payload.role
          })]
        ]);
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Referral stats
    builder
      .addCase(getReferralStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReferralStats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.referralData = action.payload.data;
        }
      })
      .addCase(getReferralStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Wallet balance
    builder
      .addCase(getWalletBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.walletData = action.payload.data;
        }
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, clearRegistrationSuccess, setCredentials, updateWalletBalance } = authSlice.actions;
export default authSlice.reducer;