import ApiClient from "./ApiClient";

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    otpValid: boolean;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

class PasswordResetService {
  // Step 1: Send OTP
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return ApiClient.post("/password-reset/forgot-password", { email });
  }

  // Step 2: Verify OTP
  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    return ApiClient.post("/password-reset/verify-otp", {
      email,
      otp,
    });
  }

  // Step 3: Reset Password
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    return ApiClient.post("/password-reset/reset-password", {
      email,
      otp,
      newPassword,
    });
  }
}

export default new PasswordResetService();
