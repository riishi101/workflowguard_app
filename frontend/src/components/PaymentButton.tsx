import React, { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { ApiService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { TokenValidator } from '../utils/tokenValidator';

interface PaymentButtonProps {
  planId: string;
  planName: string;
  onSuccess?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Single Payment Component - Memory-Guided Implementation
 * Avoiding MISTAKE #2: Clear separation from HubSpot OAuth
 * Avoiding MISTAKE #5: Single unified payment component (no fragmentation)
 */
export const PaymentButton: React.FC<PaymentButtonProps> = ({
  planId,
  planName,
  onSuccess,
  disabled = false,
  children
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  /**
   * Check authentication before payment
   * Memory Check: Avoiding 401 errors by ensuring user is authenticated
   * Memory Check: Following MISTAKE #6 lesson - Specific error messages with clear instructions
   */
  const handlePaymentClick = async () => {
    // Use TokenValidator for comprehensive token validation
    const tokenValidation = TokenValidator.validateToken();
    
    if (!tokenValidation.isValid) {TokenValidator.cleanInvalidToken();
      
      toast({
        title: tokenValidation.isExpired ? "Session Expired" : "Authentication Error",
        description: tokenValidation.isExpired 
          ? "Your session has expired. Please log in again to continue with your payment."
          : "Authentication failed. Please log in again to continue with your payment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isAuthenticated || !user) {toast({
        title: "Authentication Required",
        description: "Please log in to upgrade your subscription.",
        variant: "destructive"
      });
      return;
    }

    // Proceeding with payment

    await handlePayment();
  };

  /**
   * 🎯 PRODUCTION READY - Load real Razorpay script
   * Production-grade Razorpay integration for real payments
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log('🎯 PRODUCTION - Razorpay script already loaded');
        resolve(true);
        return;
      }

      console.log('🎯 PRODUCTION - Loading real Razorpay checkout script');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ PRODUCTION - Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ PRODUCTION - Failed to load Razorpay script');
        reject(new Error('Failed to load payment gateway. Please check your internet connection and try again.'));
      };
      document.body.appendChild(script);
    });
  };

  /**
   * Handle payment process
   * Memory Check: Following all critical lessons from memory
   */
  const handlePayment = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);

    try {
      // Step 1: Get payment configuration (Backend-only config - MISTAKE #1 avoided)
      toast({
        title: 'Initializing Payment...',
        description: 'Setting up secure payment gateway...'
      });

      const configResponse = await ApiService.getPaymentConfig();
      
      if (!configResponse.success || !configResponse.data?.keyId) {
        throw new Error(configResponse.message || 'Payment system is currently unavailable. Please contact support.');
      }

      const config = configResponse.data;

      // Step 2: Load Razorpay script
      try {
        await loadRazorpayScript();
      } catch (scriptError) {
        throw new Error('Unable to load payment gateway. Please check your internet connection and try again.');
      }

      // Step 3: Create payment order
      toast({
        title: 'Creating Order...',
        description: `Preparing ${planName} subscription...`
      });

      const orderResponse = await ApiService.createPaymentOrder(planId);
      
      if (!orderResponse.success || !orderResponse.data?.orderId) {
        throw new Error(orderResponse.message || 'Unable to create payment order. Please try again.');
      }

      const order = orderResponse.data;

      // Step 4: Configure Razorpay options (Simple, clear configuration)
      const razorpayOptions = {
        key: config.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'WorkflowGuard',
        description: `${planName} Subscription`,
        order_id: order.orderId,
        handler: async function (paymentResult: any) {
          try {
            // Step 5: Confirm payment
            toast({
              title: 'Confirming Payment...',
              description: 'Verifying your payment and activating subscription...'
            });

            const confirmResponse = await ApiService.confirmPayment({
              orderId: order.orderId,
              paymentId: paymentResult.razorpay_payment_id,
              signature: paymentResult.razorpay_signature,
              planId: planId
            });

            if (confirmResponse.success) {
              toast({
                title: 'Payment Successful! 🎉',
                description: confirmResponse.message || `Welcome to ${planName}! Your subscription is now active.`
              });
              
              // Call success callback
              if (onSuccess) {
                onSuccess();
              }
            } else {
              throw new Error(confirmResponse.message || 'Payment confirmation failed. Please contact support if amount was deducted.');
            }
          } catch (confirmError: any) {
            console.error('Payment confirmation error:', confirmError);
            toast({
              title: 'Payment Confirmation Failed',
              description: confirmError.message || 'Payment was processed but confirmation failed. Please contact support.',
              variant: 'destructive'
            });
          }
        },
        prefill: {
          name: '',
          email: ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            toast({
              title: 'Payment Cancelled',
              description: 'You can try again anytime. Your plan selection has been saved.',
              variant: 'default'
            });
            setIsProcessing(false);
          }
        }
      };

      // Step 6: Open Real Razorpay checkout
      toast({
        title: 'Opening Payment Gateway...',
        description: 'Redirecting to secure Razorpay checkout',
      });

      console.log('🎯 PRODUCTION - Opening real Razorpay checkout with options:', razorpayOptions);
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();

      rzp.on('payment.failed', function (response: any) {
        console.error('🎯 PRODUCTION - Payment failed:', response);
        toast({
          title: 'Payment Failed',
          description: response.error?.description || 'Payment was unsuccessful. Please try again.',
          variant: 'destructive'
        });
        setIsProcessing(false);
      });

    } catch (error: any) {
      console.error('Payment process error:', error);
      
      // Memory Check: Following MISTAKE #6 lesson - Specific error messages
      toast({
        title: 'Payment Error',
        description: error.message || 'Unable to process payment. Please try again or contact support.',
        variant: 'destructive'
      });
      
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePaymentClick}
      disabled={disabled || isProcessing}
      className="w-full"
    >
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </>
      ) : (
        children || `Upgrade to ${planName}`
      )}
    </Button>
  );
};
