import ApiClient from "./ApiClient";

export interface PaymentItem {
  _id: string;
  amount: number;
  status: string;
  method: string;
  razorpayPaymentId?: string;
  razorpayOrderId: string;
  date: string;
  hostelName: string;
  roomNumber?: string;
  sharingType?: string;
  checkInDate?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentItem[];
}

class PaymentService {
  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    return await ApiClient.get("/student/payments");
  }
}

export default new PaymentService();
