// app/api/ApiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_URL } from "./api_urlLink";
import AsyncStorage from "@react-native-async-storage/async-storage";

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    /* ===================== REQUEST INTERCEPTOR ===================== */
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

        // ✅ ONLY truly public endpoints
        const publicEndpoints = [
          "/students/login",
          "/students/register",
          "/auth/refresh-token",
        ];

        const isPublic = publicEndpoints.some((ep) =>
          config.url?.startsWith(ep)
        );

        if (!isPublic) {
          const token = await AsyncStorage.getItem("accessToken");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("🔑 Access token attached");
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    /* ===================== RESPONSE INTERCEPTOR ===================== */
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 🌐 Network error
        if (!error.response) {
          return Promise.reject(
            new Error("Network error. Please check your internet connection.")
          );
        }

        // 🔁 Handle 401
        if (
          error.response.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/students/login") &&
          !originalRequest.url.includes("/students/register")
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => this.axiosInstance(originalRequest));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token");

            console.log("🔄 Refreshing token...");

            const refreshResponse = await axios.post(
              `${BASE_URL}/auth/refresh-token`,
              { refreshToken }
            );

            const tokens = refreshResponse.data?.data?.tokens;
            if (!tokens?.accessToken) {
              throw new Error("Invalid refresh response");
            }

            // ✅ SAVE TOKENS IMMEDIATELY
            await AsyncStorage.setItem("accessToken", tokens.accessToken);
            await AsyncStorage.setItem("refreshToken", tokens.refreshToken);

            console.log("✅ Token refreshed");

            // ✅ Retry queued requests
            this.failedQueue.forEach((p) => p.resolve());
            this.failedQueue = [];

            // ✅ Retry original request
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error("❌ Refresh failed:", refreshError);

            this.failedQueue.forEach((p) => p.reject(refreshError));
            this.failedQueue = [];

            await AsyncStorage.multiRemove([
              "accessToken",
              "refreshToken",
              "userData",
            ]);

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /* ===================== HTTP METHODS ===================== */

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return res.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return res.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return res.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return res.data;
  }
}

export default new ApiClient(BASE_URL);
