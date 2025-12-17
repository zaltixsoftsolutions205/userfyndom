import ApiClient from "./ApiClient";

class StudentService {
  async getProfile() {
    return await ApiClient.get("/students/profile");
  }

  async updateProfile(data: { fullName: string; email: string }) {
    return await ApiClient.put("/students/edit-profile", data);
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return await ApiClient.put("/students/change-password", data);
  }
}

export default new StudentService();
