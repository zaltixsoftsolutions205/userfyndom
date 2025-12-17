import ApiClient from './ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  user: any;
  role: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  user: any;
  role: string;
}

class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_DATA_KEY = 'userData';

  // Student Login
  async studentLogin(loginData: LoginData): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      '/students/login',
      loginData
    );

    if (response.success) {
      await this.storeAuthData(response);
    }

    return response;
  }

  // Refresh Token
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = await this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await ApiClient.post<RefreshTokenResponse>('/auth/refresh-token', {
      refreshToken
    });

    if (response.success) {
      await this.storeAuthData(response);
    }

    return response;
  }

  // Store authentication data
  private async storeAuthData(response: AuthResponse | RefreshTokenResponse): Promise<void> {
    await AsyncStorage.setItem(AuthService.ACCESS_TOKEN_KEY, response.tokens.accessToken);
    await AsyncStorage.setItem(AuthService.REFRESH_TOKEN_KEY, response.tokens.refreshToken);
    await AsyncStorage.setItem(AuthService.USER_DATA_KEY, JSON.stringify({
      user: response.user,
      role: response.role
    }));
  }

  // Get stored access token
  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
  }

  // Get stored refresh token
  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
  }

  // Get stored user data
  async getUserData(): Promise<{ user: any; role: string } | null> {
    const userData = await AsyncStorage.getItem(AuthService.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  // Logout - clear all stored data
  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      AuthService.ACCESS_TOKEN_KEY,
      AuthService.REFRESH_TOKEN_KEY,
      AuthService.USER_DATA_KEY
    ]);
  }

  // Check token validity and refresh if needed
  async checkAndRefreshToken(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      if (!accessToken) {
        return false;
      }

      // Simple token expiration check (you might want to decode JWT for proper validation)
      // For now, we'll try to use the token and refresh if it fails
      return true;

    } catch (error) {
      console.log('Token validation error:', error);
      return false;
    }
  }
}

export default new AuthService();