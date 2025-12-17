// utils/razorpay.ts
import RazorpayCheckout from 'react-native-razorpay';

interface RazorpayOptions {
  description: string;
  image?: string;
  currency: string;
  key: string;
  amount: string;
  name: string;
  order_id: string;
  prefill: {
    email: string;
    contact: string;
    name: string;
  };
  theme: {
    color: string;
  };
}

export const openRazorpayCheckout = (options: RazorpayOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    RazorpayCheckout.open(options)
      .then((data: any) => {
        resolve(data);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

// Razorpay configuration - Use the same key from backend .env
export const RAZORPAY_CONFIG = {
  key_id: 'rzp_test_RaUeTdJG9NMzfB', // Same as in backend .env
  currency: 'INR',
  name: 'Hostel Management',
  description: 'Hostel Booking Payment',
  theme: {
    color: '#4CBB17'
  }
};