# PayMongo Integration Guide

This project includes **PayMongo Tier 1** payment gateway integration for processing payments in the Philippines.

## 🎯 Features Implemented

- ✅ Credit/Debit Card Payments (Visa, Mastercard)
- ✅ GCash E-Wallet
- ✅ PayMaya E-Wallet
- ✅ GrabPay E-Wallet
- ✅ Cash on Delivery (COD)
- ✅ Secure payment processing
- ✅ 3D Secure authentication support
- ✅ Order tracking and confirmation

## 📋 Setup Instructions

### 1. Create a PayMongo Account

1. Go to [https://paymongo.com](https://paymongo.com)
2. Sign up for a **Tier 1 (Individual/Small Business)** account
3. Complete the verification process
4. Navigate to your **Dashboard**

### 2. Get Your API Keys

1. In your PayMongo Dashboard, go to **Developers** → **API Keys**
2. You'll find two types of keys:
   - **Public Key** (pk_test_xxx) - for client-side operations
   - **Secret Key** (sk_test_xxx) - for server-side operations

**⚠️ IMPORTANT:** Start with **TEST keys** for development!

### 3. Configure the Application

Open `/services/paymongo.ts` and replace the placeholder keys:

```typescript
// Replace these with your actual PayMongo API keys
const PAYMONGO_PUBLIC_KEY = 'pk_test_YOUR_PUBLIC_KEY_HERE';
const PAYMONGO_SECRET_KEY = 'sk_test_YOUR_SECRET_KEY_HERE';
```

### 4. Test the Integration

For testing, you can use PayMongo's test cards:

#### Successful Payment
- **Card Number:** 4343434343434345
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)

#### Failed Payment
- **Card Number:** 4571736000000075
- **Expiry:** Any future date
- **CVC:** Any 3 digits

#### 3D Secure Required
- **Card Number:** 4120000000000007
- **Expiry:** Any future date
- **CVC:** Any 3 digits

### 5. Supported Payment Methods

#### Credit/Debit Cards
- Visa
- Mastercard
- Supports 3D Secure authentication

#### E-Wallets
- **GCash** - Popular mobile wallet in the Philippines
- **PayMaya** - Digital payment solution
- **GrabPay** - Integrated with Grab app

#### Cash on Delivery
- No online payment required
- Payment collected upon delivery

## 🔐 Security Best Practices

1. **Never commit API keys to version control**
   - Use environment variables in production
   - Add `.env` file to `.gitignore`

2. **Use HTTPS in production**
   - PayMongo requires secure connections

3. **Implement webhook verification**
   - Verify webhook signatures from PayMongo
   - Validate payment status server-side

4. **Test thoroughly**
   - Always test with test keys first
   - Verify all payment scenarios
   - Test error handling

## 🚀 Going to Production

### 1. Switch to Live Keys

Once you're ready for production:

1. Complete PayMongo's verification requirements
2. Get your **LIVE API keys** (pk_live_xxx and sk_live_xxx)
3. Update your configuration with live keys
4. Test in production environment

### 2. Enable Webhooks

Set up webhooks to receive real-time payment notifications:

1. In PayMongo Dashboard, go to **Developers** → **Webhooks**
2. Add your webhook URL: `https://yourdomain.com/api/webhooks/paymongo`
3. Subscribe to these events:
   - `payment.paid` - Payment successful
   - `payment.failed` - Payment failed
   - `source.chargeable` - E-wallet payment ready

### 3. Implement Server-Side Verification

For production, implement server-side payment verification:

```typescript
// Example: Verify payment on your backend
async function verifyPayment(paymentIntentId: string) {
  const paymentIntent = await getPaymentIntent(paymentIntentId);
  
  if (paymentIntent.attributes.status === 'succeeded') {
    // Payment successful - fulfill the order
    return true;
  }
  
  return false;
}
```

## 💰 Pricing (Tier 1)

PayMongo Tier 1 typically charges:
- **Credit/Debit Cards:** 3.5% + ₱15 per transaction
- **E-Wallets:** 2.5% - 3.5% per transaction
- No monthly fees
- No setup fees

*Check PayMongo's official website for current pricing*

## 📱 Testing E-Wallet Payments

E-wallet payments (GCash, PayMaya, GrabPay) require:
1. Redirect to e-wallet provider
2. User authentication on e-wallet app
3. Redirect back to your site

The current implementation uses mock payments. For real e-wallet integration:
- Use `createGCashSource()` function in `/services/paymongo.ts`
- Implement redirect flow
- Handle payment callback

## 🐛 Troubleshooting

### Payment Failed
- Verify API keys are correct
- Check card details are valid
- Ensure sufficient funds (for real payments)
- Check PayMongo dashboard for error details

### 3D Secure Issues
- Make sure `request_three_d_secure` is enabled
- Implement proper redirect flow
- Handle authentication callbacks

### Webhook Not Received
- Verify webhook URL is accessible
- Check webhook signature verification
- Enable webhook logging in PayMongo dashboard

## 📚 Resources

- [PayMongo Documentation](https://developers.paymongo.com/docs)
- [API Reference](https://developers.paymongo.com/reference)
- [Test Cards](https://developers.paymongo.com/docs/testing)
- [Support](https://support.paymongo.com)

## 🔄 Current Implementation Status

✅ **Implemented:**
- Payment intent creation
- Payment method creation
- Card payment processing
- E-wallet source creation
- Mock payment simulation
- Error handling
- Amount conversion (PHP to centavos)

⚠️ **Requires Production Setup:**
- Replace mock payment with real API calls
- Implement webhook handlers
- Add 3D Secure redirect flow
- Server-side payment verification
- Production API keys

## 📝 Notes

- The current implementation uses **mock payments** for development
- Replace `mockPaymentProcess()` with actual PayMongo API calls in production
- All amounts are stored in centavos (₱1.00 = 100 centavos)
- Test mode is active by default (test API keys)

---

**Need Help?** Contact PayMongo support or check their documentation at [developers.paymongo.com](https://developers.paymongo.com)
