/**
 * PayMongo Payment Gateway Integration (Tier 1)
 * 
 * Setup Instructions:
 * 1. Sign up at https://paymongo.com
 * 2. Get your API keys from the Dashboard
 * 3. Replace the placeholder keys below with your actual keys
 * 4. For production, use environment variables instead of hardcoded keys
 */

// TODO: Replace with your actual PayMongo API keys
const PAYMONGO_PUBLIC_KEY = 'pk_test_YOUR_PUBLIC_KEY_HERE';
const PAYMONGO_SECRET_KEY = 'sk_test_YOUR_SECRET_KEY_HERE';

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Base64 encode the secret key for authentication
const getAuthHeader = () => {
  const encoded = btoa(PAYMONGO_SECRET_KEY + ':');
  return `Basic ${encoded}`;
};

export interface PaymentIntentData {
  amount: number; // Amount in centavos (e.g., 10000 = ₱100.00)
  currency: string;
  description: string;
  statement_descriptor?: string;
}

export interface PaymentMethodData {
  type: 'card' | 'gcash' | 'paymaya' | 'grab_pay';
  details: {
    card_number?: string;
    exp_month?: number;
    exp_year?: number;
    cvc?: string;
  };
  billing?: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1: string;
      city: string;
      state?: string;
      postal_code: string;
      country: string;
    };
  };
}

export interface PaymentIntent {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    status: string;
    client_key: string;
    payment_method_allowed: string[];
    payments: any[];
    next_action: any;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  attributes: {
    type: string;
    billing: any;
    details: any;
  };
}

/**
 * Create a Payment Intent
 * This is the first step in processing a payment
 */
export async function createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntent> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: data.amount,
            payment_method_allowed: ['card', 'gcash', 'paymaya', 'grab_pay'],
            payment_method_options: {
              card: { request_three_d_secure: 'any' }
            },
            currency: data.currency,
            description: data.description,
            statement_descriptor: data.statement_descriptor || 'RFM Store',
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create payment intent');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('PayMongo createPaymentIntent error:', error);
    throw error;
  }
}

/**
 * Create a Payment Method
 * This stores the payment method details (card, e-wallet, etc.)
 */
export async function createPaymentMethod(data: PaymentMethodData): Promise<PaymentMethod> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/payment_methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: data.type,
            details: data.details,
            billing: data.billing,
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create payment method');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('PayMongo createPaymentMethod error:', error);
    throw error;
  }
}

/**
 * Attach Payment Method to Payment Intent
 * This links the payment method to the payment intent and processes the payment
 */
export async function attachPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string,
  clientKey: string
): Promise<PaymentIntent> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: clientKey,
            return_url: `${window.location.origin}/payment-callback`,
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to attach payment method');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('PayMongo attachPaymentIntent error:', error);
    throw error;
  }
}

/**
 * Retrieve Payment Intent
 * Check the status of a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to retrieve payment intent');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('PayMongo getPaymentIntent error:', error);
    throw error;
  }
}

/**
 * Create a GCash Payment Source
 * For GCash payments
 */
export async function createGCashSource(amount: number, description: string) {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount,
            redirect: {
              success: `${window.location.origin}/payment-callback?status=success`,
              failed: `${window.location.origin}/payment-callback?status=failed`,
            },
            type: 'gcash',
            currency: 'PHP',
            description: description,
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to create GCash source');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('PayMongo createGCashSource error:', error);
    throw error;
  }
}

/**
 * Mock Payment Processing (for development/testing)
 * Remove this in production and use actual PayMongo API calls
 */
export async function mockPaymentProcess(
  amount: number,
  paymentMethod: string,
  cardDetails?: any
): Promise<{ success: boolean; paymentIntentId: string; message: string }> {
  console.log('🔄 Processing mock payment...', { amount, paymentMethod, cardDetails });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate success (90% success rate for testing)
  const isSuccess = Math.random() > 0.1;
  
  if (isSuccess) {
    return {
      success: true,
      paymentIntentId: `pi_mock_${Date.now()}`,
      message: 'Payment processed successfully',
    };
  } else {
    throw new Error('Payment declined. Please try another card.');
  }
}

/**
 * Helper function to convert amount to centavos
 */
export function toCentavos(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Helper function to convert centavos to amount
 */
export function fromCentavos(centavos: number): number {
  return centavos / 100;
}
