# Variant Persistence Bug Fix Report

## Issue Summary
**Problem:** When a user selects a variant in the custom design page, it shows a "saved" message, but after refreshing the page, the selected variant disappears.

**Root Cause:** React state updates are asynchronous. The save API call was using state values (`selectedSize`, `selectedPrintOption`) that hadn't updated yet, resulting in wrong/stale data being saved to the database.

---

## Technical Details

### The Bug Code (BEFORE):
```typescript
const handleAddToCustomize = (product: ClothingProduct) => {
  // Create variant using state values
  const newVariant = {
    size: selectedSize,  // ❌ Using potentially stale state
    printOption: selectedPrintOption,  // ❌ Using potentially stale state
    // ...
  };
  
  setActiveVariant(newVariant);
  setSelectedSize(selectedSize);  // This is async!
  
  // Save immediately (but state hasn't updated yet!)
  setTimeout(async () => {
    await fetch('/api/design/save', {
      body: JSON.stringify({
        selectedSize: selectedSize,  // ❌ Still using old value!
        selectedPrintOption: selectedPrintOption,  // ❌ Still using old value!
        // ...
      })
    });
  }, 1000);
};
```

### The Fix (AFTER):
```typescript
const handleAddToCustomize = (product: ClothingProduct) => {
  // 1. Capture actual values FIRST (not from state)
  const sizeToUse = selectedSize || (product.sizes?.[0] || 'M');
  const printOptionToUse = selectedPrintOption;
  
  // 2. Create variant using captured values
  const newVariant = {
    size: sizeToUse,  // ✅ Using captured value
    printOption: printOptionToUse,  // ✅ Using captured value
    // ...
  };
  
  setActiveVariant(newVariant);
  setSelectedSize(sizeToUse);  // Update state
  
  // 3. Save using captured values (not state)
  setTimeout(async () => {
    await fetch('/api/design/save', {
      body: JSON.stringify({
        selectedSize: sizeToUse,  // ✅ Using captured value!
        selectedPrintOption: printOptionToUse,  // ✅ Using captured value!
        // ...
      })
    });
  }, 1000);
};
```

---

## What Changed

### File: `src/pages/CustomDesignPage.tsx`
**Function:** `handleAddToCustomize` (around line 1397)

**Changes Made:**
1. ✅ Captured values at the start of the function before any state updates
2. ✅ Used captured values in variant object creation
3. ✅ Used captured values in API save call
4. ✅ Added detailed logging for debugging

---

## Testing Instructions

### 1. Test Variant Selection Persistence
1. Start the app: `npm run dev` (frontend) and ensure backend is running
2. Login to the application
3. Navigate to Custom Design page
4. Select a product variant:
   - Choose a size (e.g., "M")
   - Choose a print option (e.g., "Front")
5. **Verify "Product variant saved!" toast appears**
6. **Open browser DevTools > Console** and verify:
   ```
   💾 Saving variant immediately after selection...
     Product ID: [number]
     Size: M
     Print Option: front
     Print Area: Letter
   ✅ Variant saved successfully on selection
   ```
7. **Refresh the page (F5)**
8. **EXPECTED RESULT:** The selected variant should still be visible with:
   - Correct size
   - Correct print option
   - Variant details panel showing the saved information

### 2. Test Database Verification
Run this command to check what's saved:
```bash
cd server
npx ts-node check-variant-persistence.ts
```

Expected output should show:
- User ID
- Product ID  
- Selected Size (matching what you selected)
- Selected Print Option (matching what you selected)
- Last Saved timestamp (recent)

---

## Database Schema Reference

The data is stored in table: `user_current_design`

Key fields:
- `user_id` (VARCHAR): User's Google ID
- `customizable_product_id` (INT): Product ID
- `selected_size` (VARCHAR): Size selection (e.g., "M", "L", "XL")
- `selected_print_option` (VARCHAR): Print choice ("none", "front", "back")
- `print_area_preset` (VARCHAR): Print area size ("A4", "Letter", etc.)
- `front_canvas_json` (TEXT): Front canvas design data
- `back_canvas_json` (TEXT): Back canvas design data
- `last_saved_at` (DATETIME): Last save timestamp

Unique constraint: `(user_id, customizable_product_id)` - One active design per user per product

---

## API Endpoints Involved

### Save Endpoint
- **URL:** `POST /api/design/save`
- **File:** `server/src/routes/design.routes.ts`
- **Service:** `server/src/services/design.service.ts`
- **Function:** `saveCurrentDesign()`

### Load Endpoint
- **URL:** `GET /api/design/load/last-used?userId={userId}`
- **File:** `server/src/routes/design.routes.ts`
- **Service:** `server/src/services/design.service.ts`
- **Function:** `getLastUsedDesign()`

---

## Common Issues & Solutions

### Issue: "Variant still disappears after refresh"
**Solution:** Check browser console for errors. Verify:
1. User is logged in (check `user.id` exists)
2. Backend server is running on port 4000
3. Database connection is working (check `.env` file)

### Issue: "Error: Missing required fields"
**Solution:** Ensure these fields are being sent in the API request:
- `userId` (string)
- `customizableProductId` (number)
- `selectedSize` (string)
- `selectedPrintOption` (string)

### Issue: "Database connection error"
**Solution:** Verify `.env` file:
```
DATABASE_URL="mysql://[user]:[password]@[host]:[port]/[database]"
```

---

## Files Modified

1. ✅ `src/pages/CustomDesignPage.tsx` - Fixed variant selection and save logic

---

## Files Created (for debugging)

1. `server/check-variant-persistence.ts` - Database verification script

---

## Next Steps

After confirming the fix works:
1. ✅ Delete the debug script: `server/check-variant-persistence.ts`
2. ✅ Test with multiple users
3. ✅ Test with different products
4. ✅ Test with both front and back canvas designs

---

**Fix Applied:** February 10, 2026  
**Status:** ✅ Complete - Ready for Testing
