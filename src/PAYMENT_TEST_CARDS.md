# PayMongo Test Cards

Use these test card numbers to test your PayMongo integration in development mode.

## ✅ Successful Payment

**Card Number:** `4343 4343 4343 4345`  
**Expiry:** Any future date (e.g., `12/25`)  
**CVV:** Any 3 digits (e.g., `123`)  
**Result:** Payment will succeed

---

## ❌ Failed Payment

**Card Number:** `4571 7360 0000 0075`  
**Expiry:** Any future date (e.g., `12/25`)  
**CVV:** Any 3 digits (e.g., `123`)  
**Result:** Payment will be declined

---

## 🔐 3D Secure Required

**Card Number:** `4120 0000 0000 0007`  
**Expiry:** Any future date (e.g., `12/25`)  
**CVV:** Any 3 digits (e.g., `123`)  
**Result:** Will require 3D Secure authentication

---

## 💡 Quick Test Flow

1. Add items to cart
2. Go to checkout
3. Fill in shipping information
4. Select "Credit / Debit Card" payment method
5. Enter one of the test card numbers above
6. Complete the order

---

## 📝 Notes

- All test cards work only with **TEST API keys** (pk_test_xxx)
- Use any future date for expiry
- Use any 3-digit number for CVV
- The current implementation uses **mock processing** - replace with real PayMongo API calls for production

---

## 🔄 Other Payment Methods

### GCash Test
- Select "GCash" payment method
- Will simulate redirect to GCash
- Automatically succeeds in mock mode

### PayMaya Test
- Select "PayMaya" payment method
- Will simulate redirect to PayMaya
- Automatically succeeds in mock mode

### GrabPay Test
- Select "GrabPay" payment method
- Will simulate redirect to GrabPay
- Automatically succeeds in mock mode

### Cash on Delivery
- Select "Cash on Delivery"
- No payment processing required
- Order placed immediately

---

For more test cards and scenarios, visit:  
[PayMongo Test Cards Documentation](https://developers.paymongo.com/docs/testing)
