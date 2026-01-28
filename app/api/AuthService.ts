// app/api/AuthService.ts
import ApiClient from './ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  referredBy?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType?: string;
  };
  user?: any;
  role?: string;
  data?: any;
}

export interface ReferralResponse {
  success: boolean;
  data?: {
    _id: string;
    referralCode: string;
    referralCount: number;
    referralPoints: number;
  };
  message?: string;
}

export interface WalletResponse {
  success: boolean;
  data?: {
    balance: number;
    transactions: Array<{
      _id: string;
      type: 'credit' | 'debit';
      amount: number;
      description: string;
      reference: string;
      createdAt: string;
    }>;
  };
  message?: string;
}

class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_DATA_KEY = 'userData';

  // Student Login - FIXED VERSION
  // In AuthService.ts - Update studentLogin method:

  async studentLogin(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔐 DEBUG Login Attempt:', {
        email: loginData.email,
        password_length: loginData.password.length,
        trimmed_email: loginData.email.trim(),
        lowercased_email: loginData.email.toLowerCase()
      });

      // Try different formats - some backends are picky
      const payloadsToTry = [
        // Format 1: Standard
        loginData,
        // Format 2: With trimmed email
        {
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password
        },
        // Format 3: Different content-type (if needed)
        {
          email: loginData.email,
          password: loginData.password,
          // Some backends expect additional fields
          deviceType: 'mobile'
        }
      ];

      let lastError;

      for (let i = 0; i < payloadsToTry.length; i++) {
        try {
          console.log(`🔄 Trying format ${i + 1}:`, {
            email: payloadsToTry[i].email,
            payload_keys: Object.keys(payloadsToTry[i])
          });

          const response = await ApiClient.post<AuthResponse>(
            '/students/login',
            payloadsToTry[i]
          );

          console.log(`✅ Format ${i + 1} successful:`, {
            success: response.success,
            message: response.message
          });

          if (response.success && response.tokens && response.user) {
            await this.storeAuthData(response);
            return response;
          }
        } catch (formatError: any) {
          lastError = formatError;
          console.log(`❌ Format ${i + 1} failed:`, formatError.message);

          // If we get a different error than 401, stop trying
          if (formatError.response?.status !== 401) {
            throw formatError;
          }
        }
      }

      // If all formats failed
      throw lastError || new Error('All login attempts failed');

    } catch (error: any) {
      console.error('❌ FINAL Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });

      throw error;
    }
  }
  // Student Registration
  async studentRegister(registerData: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Registering student...');

      const response = await ApiClient.post<AuthResponse>(
        '/students/register',
        registerData
      );

      console.log('📥 Registration response:', response);

      if (response.success) {
        if (response.tokens && response.user) {
          // If registration includes auto-login, store tokens
          await this.storeAuthData(response);
        } else if (response.data) {
          // Store basic user data without tokens (user will need to login)
          const userData = {
            user: {
              fullName: response.data.fullName || registerData.fullName,
              email: response.data.email || registerData.email,
              mobileNumber: response.data.mobileNumber || registerData.mobileNumber,
              _id: response.data.studentId || response.data._id
            },
            role: 'student',
            referralCode: response.data.referralCode,
            referredBy: response.data.referredBy
          };

          await AsyncStorage.setItem(AuthService.USER_DATA_KEY, JSON.stringify(userData));
        }
      }

      return response;
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Store authentication data
  private async storeAuthData(response: AuthResponse): Promise<void> {
    try {
      if (response.tokens?.accessToken) {
        await AsyncStorage.setItem(AuthService.ACCESS_TOKEN_KEY, response.tokens.accessToken);
        console.log('✅ Access token stored');
      }

      if (response.tokens?.refreshToken) {
        await AsyncStorage.setItem(AuthService.REFRESH_TOKEN_KEY, response.tokens.refreshToken);
        console.log('✅ Refresh token stored');
      }

      // Prepare user data
      const userData = {
        user: response.user || response.data,
        role: response.role || 'student',
        referralCode: response.data?.referralCode,
        referredBy: response.data?.referredBy
      };

      await AsyncStorage.setItem(AuthService.USER_DATA_KEY, JSON.stringify(userData));
      console.log('✅ User data stored');

    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      throw error;
    }
  }

  // Get Referral Stats
  async getReferralStats(): Promise<ReferralResponse> {
    try {
      console.log('📊 Getting referral stats...');
      const response = await ApiClient.get<ReferralResponse>('/students/referrals');
      return response;
    } catch (error: any) {
      console.error('❌ Get referral stats error:', error);
      throw error;
    }
  }

  // Get Wallet Balance
  async getWalletBalance(): Promise<WalletResponse> {
    try {
      console.log('💰 Getting wallet balance...');
      const response = await ApiClient.get<WalletResponse>('/students/wallet');
      return response;
    } catch (error: any) {
      console.error('❌ Get wallet balance error:', error);
      throw error;
    }
  }

  // Get stored access token
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Get access token error:', error);
      return null;
    }
  }

  // Get stored refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Get refresh token error:', error);
      return null;
    }
  }

  // Get stored user data
  async getUserData(): Promise<{ user: any; role: string } | null> {
    try {
      const userDataString = await AsyncStorage.getItem(AuthService.USER_DATA_KEY);
      if (!userDataString) return null;

      const userData = JSON.parse(userDataString);
      return userData;
    } catch (error) {
      console.error('❌ Get user data error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('❌ Check authentication error:', error);
      return false;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        AuthService.ACCESS_TOKEN_KEY,
        AuthService.REFRESH_TOKEN_KEY,
        AuthService.USER_DATA_KEY
      ]);
      console.log('👋 Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  // Clear all storage (for debugging)
  async clearAllStorage(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('🧹 All storage cleared');
    } catch (error) {
      console.error('❌ Clear storage error:', error);
    }
  }
}

export default new AuthService();