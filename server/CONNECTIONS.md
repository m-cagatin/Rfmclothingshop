# System Connections: Payment Verification → Orders → Cashflow → Reports

## ✅ Connection Flow

### 1. Payment Verification → Orders
**File**: `server/src/services/payments.service.ts` (lines 362-396)
- When a payment is **approved**:
  - Payment status updates to `'paid'`
  - Order status updates:
    - If balance remaining > 0: `'payment_pending'`
    - If balance remaining = 0: `'pending'` (moves to production)
  - Order balance is updated

### 2. Payment Approval → Cashflow
**File**: `server/src/services/payments.service.ts` (lines 398-412)
- When payment is approved, automatically adds income to cashflow:
  ```typescript
  await cashflowService.addMoneyIn({
    description: `Order Payment - ${order.order_ref}`,
    amount: amountPaid,
    category: 'income',
    vendor: order.customer_name,
    paymentMethod: payment.payment_method,
    date: new Date(),
    referenceNumber: payment.reference_number || undefined,
  });
  ```

### 3. Cashflow → Reports
**File**: `server/src/services/cashflow.service.ts`
- Reports are **automatically generated** from cashflow data:
  - Daily reports: `getDailyReport()`
  - Weekly reports: `getWeeklyReport()`
  - Monthly reports: `getMonthlyReport()`
  - Custom date range: `getCashflowReport(startDate, endDate)`
- All reports read from the `expenses` table (which stores both income and expenses)

## 📊 Data Flow Diagram

```
Payment Submitted
    ↓
Payment Verification (Admin)
    ↓
Payment Approved
    ├─→ Updates Order Status
    │   └─→ Order moves to 'pending' (production)
    │
    └─→ Adds Income to Cashflow
        └─→ Reports automatically reflect new data
            ├─→ Daily Report
            ├─→ Weekly Report
            └─→ Monthly Report
```

## 🔄 Complete Flow Example

1. **Customer submits payment** → Payment created with status `'pending'`
2. **Admin verifies payment** → Calls `approvePayment()`
3. **Payment approved**:
   - Payment status → `'paid'`
   - Order status → `'pending'` (if fully paid) or `'payment_pending'` (if partial)
   - **Cashflow entry created** → Income added automatically
4. **Reports updated** → All reports now show the new income

## 🗑️ Reset Cashflow & Reports

**Script**: `server/reset-cashflow-reports.ts`
- Deletes all entries from `expenses` table
- Reports automatically reset to zero (they're generated from cashflow data)

**API Endpoint**: `DELETE /api/cashflow/reset/all`
- Can be called via API to reset cashflow and reports

## ✅ Verification

All connections are **already implemented** and working:
- ✅ Payment approval updates orders
- ✅ Payment approval adds to cashflow
- ✅ Reports read from cashflow
- ✅ Reset functionality available

