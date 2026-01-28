// app/api/PasswordResetService.ts
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
    resetToken: string;
    expiresIn: number;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    passwordReset: boolean;
    loginRequired: boolean;
  };
}

class PasswordResetService {
  // STEP 1 – Send OTP
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return ApiClient.post("/students/forgot-password", { email });
  }

  // STEP 2 – Verify OTP
  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    return ApiClient.post("/students/verify-otp", { email, otp });
  }

  // STEP 3 – Reset Password
  async resetPassword(
    email: string,
    resetToken: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> {
    return ApiClient.post("/students/reset-password", {
      email,
      resetToken,
      newPassword,
    });
  }
}

export default new PasswordResetService();