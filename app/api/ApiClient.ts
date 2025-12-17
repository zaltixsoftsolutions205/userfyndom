import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_URL } from "./api_urlLink";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './AuthService';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const isPublicRoute =
          config.url?.includes('/students/login') ||
          config.url?.includes('/students/register') ||
          config.url?.includes('/password-reset/') ||
          config.url?.includes('/public/rooms/hostel/');
          config.url?.includes('/public/pricing/'); // ADD THIS LINE

        if (!isPublicRoute) {
          const token = await AsyncStorage.getItem("accessToken");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );


    // Response interceptor with token refresh logic
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await AuthService.refreshToken();

            // Retry all queued requests
            this.failedQueue.forEach(pending => pending.resolve());
            this.failedQueue = [];

            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear auth data and redirect to login
            this.failedQueue.forEach(pending => pending.reject(refreshError));
            this.failedQueue = [];

            await AuthService.logout();

            // You might want to redirect to login here
            // For now, we'll just reject the request
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        console.log("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }
}

export default new ApiClient(BASE_URL);