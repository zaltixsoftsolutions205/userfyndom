// app/screens/RazorpayPaymentScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/hooks/hooks';
import Toast from 'react-native-toast-message';

interface PaymentParams {
  razorpayOrder: any;
  studentDetails: any;
  bookingId: string;
  hostelName: string;
  sharingType: string;
  durationType: string;
  duration: string;
  totalAmount: number;
}

const RazorpayPaymentScreen = () => {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  
  const params = useLocalSearchParams();
  
  // Parse parameters
  const razorpayOrder = JSON.parse(params.razorpayOrder as string);
  const studentDetails = JSON.parse(params.studentDetails as string);
  const bookingId = params.bookingId as string;
  const hostelName = params.hostelName as string;
  const sharingType = params.sharingType as string;
  const durationType = params.durationType as string;
  const duration = params.duration as string;
  const totalAmount = parseFloat(params.totalAmount as string);

  // HTML content with Razorpay checkout
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
            width: 90%;
          }
          .loading {
            color: #666;
            font-size: 16px;
          }
          .pay-btn {
            background: #155a46;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
          }
          .pay-btn:hover {
            background: #0f4535;
          }
          .pay-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        </style>
        <script>
          function makePayment() {
            var options = {
              key: "${razorpayOrder.key}",
              amount: "${razorpayOrder.amount}",
              currency: "${razorpayOrder.currency}",
              name: "${hostelName}",
              order_id: "${razorpayOrder.id}",
              description: "Hostel Booking - ${sharingType} sharing for ${duration} ${durationType}",
              handler: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'SUCCESS',
                  data: response
                }));
              },
              prefill: {
                name: "${studentDetails.name}",
                email: "${studentDetails.email}",
                contact: "${studentDetails.contact}"
              },
              notes: {
                booking_id: "${bookingId}",
                hostel_name: "${hostelName}",
                sharing_type: "${sharingType}"
              },
              theme: {
                color: "#155a46"
              },
              modal: {
                ondismiss: function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'DISMISSED'
                  }));
                }
              }
            };
            
            var rzp1 = new Razorpay(options);
            rzp1.open();
            
            rzp1.on('payment.failed', function(response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'FAILED',
                data: response.error
              }));
            });
          }
          
          // Auto-start payment when page loads
          window.onload = function() {
            setTimeout(makePayment, 1000);
          };
        </script>
      </head>
      <body>
        <div class="container">
          <h2>Hostel Booking Payment</h2>
          <p><strong>${hostelName}</strong></p>
          <p>${sharingType} sharing • ${duration} ${durationType}(s)</p>
          <p><strong>Amount: ₹${(totalAmount).toFixed(2)}</strong></p>
          <div class="loading" id="loading">
            Opening payment gateway...
          </div>
          <button class="pay-btn" onclick="makePayment()" id="payBtn" style="display:none;">
            Pay ₹${(totalAmount).toFixed(2)}
          </button>
        </div>
        
        <script>
          // Show pay button after 2 seconds as fallback
          setTimeout(function() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('payBtn').style.display = 'block';
          }, 2000);
        </script>
      </body>
    </html>
  `;

  // Verify payment with backend
  const verifyPaymentWithBackend = async (paymentData: any) => {
    try {
      console.log('🔐 Verifying payment:', paymentData);

      const verifyResponse = await fetch('https://api.fyndom.in/api/bookings/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyResult = await verifyResponse.json();
      console.log('✅ Verification result:', verifyResult);
      
      if (verifyResult.success) {
        Toast.show({
          type: "success",
          text1: "Payment Successful!",
          text2: "Your booking has been confirmed"
        });
        
        // Redirect to bookings page
        setTimeout(() => {
          router.replace('/(tabs)/Bookings');
        }, 2000);
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed');
      }
      
    } catch (error: any) {
      console.error('Payment verification error:', error);
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.message || "Failed to verify payment"
      });
      router.back();
    }
  };

  // Handle WebView messages
  const handleWebViewMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📨 WebView message:', message);

      switch (message.type) {
        case 'SUCCESS':
          // Payment successful
          await verifyPaymentWithBackend(message.data);
          break;

        case 'FAILED':
          // Payment failed
          const errorMsg = message.data?.description || 'Payment failed';
          Alert.alert(
            'Payment Failed',
            errorMsg,
            [{ text: 'OK', onPress: () => router.back() }]
          );
          break;

        case 'DISMISSED':
          // User closed the payment modal
          Alert.alert(
            'Payment Cancelled',
            'You closed the payment window.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
      Alert.alert('Error', 'Invalid payment response');
      router.back();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'white',
          zIndex: 1000 
        }}>
          <ActivityIndicator size="large" color="#155a46" />
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleWebViewMessage}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default RazorpayPaymentScreen;