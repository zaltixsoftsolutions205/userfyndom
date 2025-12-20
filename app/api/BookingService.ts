// import ApiClient from "./ApiClient";

// export interface BookingHistoryItem {
//   _id: string;
//   hostelName: string;
//   address: string;
//   contact: string;
//   roomNumber: string;
//   floor: string;
//   sharingType: string;
//   durationType: string;
//   duration: number;
//   price: number;
//   amountPaid: number;
//   checkInDate: string;
//   paymentStatus: string;
//   bookingStatus: string;
//   createdAt: string;
// }

// export interface BookingHistoryResponse {
//   success: boolean;
//   data: BookingHistoryItem[];
// }

// class BookingService {
//   async getBookingHistory(): Promise<BookingHistoryResponse> {
//     return await ApiClient.get<BookingHistoryResponse>("/students/bookings");
//   }
// }

// export default new BookingService();

import ApiClient from "./ApiClient";

export interface BookingHistoryItem {
  _id: string;

  hostel: {
    hostelName: string;
    address: string | null;
    contact: string | null;
  };

  room: {
    roomNumber: string;
    floor: string;
    sharingType: string;
  };

  bookingDetails: {
    durationType: string;
    duration: number;
    price: number;
    amountPaid: number;
    checkInDate: string;
    assignmentType: string;
  };

  status: {
    bookingStatus: string;
    paymentStatus: string;
  };

  createdAt: string;
}


export interface BookingHistoryResponse {
  success: boolean;
  data: BookingHistoryItem[];
}

class BookingService {
  async getBookingHistory(): Promise<BookingHistoryResponse> {
    return await ApiClient.get<BookingHistoryResponse>("/students/bookings");
  }
}

export default new BookingService();