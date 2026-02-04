# 🔍 CUSTOM DESIGN PAGE - COMPREHENSIVE INSPECTION REPORT
**Date:** January 29, 2026  
**File:** src/pages/CustomDesignPage.tsx (3882 lines)  
**Database:** MySQL via Prisma ORM

---

## ✅ PASSING TESTS

### 1. Database Schema ✅
- **user_current_design** table structure verified
- All fields present and correct types
- Indexes properly configured (user_id, customizable_product_id, last_saved_at)
- Unique constraint on (user_id, customizable_product_id) working
- **Status:** No issues found

### 2. API Field Mapping ✅
- Backend service correctly converts snake_case (DB) to camelCase (API)
- Frontend sends correct camelCase fields
- All required fields validated on backend
- **Example:**
  - DB: `customizable_product_id` → API: `customizableProductId` ✅
  - DB: `selected_size` → API: `selectedSize` ✅
  - DB: `print_area_preset` → API: `printAreaPreset` ✅

### 3. Auto-Save Logic ✅
- 2-second debounce implemented correctly
- Only triggers with 2+ objects (prevents empty saves)
- Uses ref to prevent loops
- Clears timeout properly on unmount
- **Status:** Well implemented

### 4. Error Handling ✅
- Try-catch blocks in all async operations
- User-friendly error messages via toast
- Network errors handled gracefully
- 5-second timeout on loadUserDesign
- Fallback to fresh canvas on errors

---

## 🐛 CRITICAL BUGS FOUND

### BUG #1: parseInt(user.id) - UUID Truncation ⚠️
**Location:** Line 698 in `loadUserDesign`
```typescript
const userId = user?.id ? parseInt(user.id) : null;
```

**Problem:**  
User IDs are UUID strings (e.g., "29143851555ed693023e6d8ed1b64b40"), not integers.  
`parseInt()` converts this to `29143851555`, truncating the rest and creating invalid query.

**Impact:** HIGH - loadUserDesign will ALWAYS fail to load saved designs

**Fix:**
```typescript
const userId = user?.id || null;
```

---

### BUG #2: selectedView Not Saved to Both Canvases ⚠️
**Location:** Line 469-477 in `handleSave`

**Problem:**
```typescript
frontCanvasJson: view === 'front' ? canvasJSON : null,
backCanvasJson: view === 'back' ? canvasJSON : null,
```

This **ONLY** saves the current view. If you design on front, switch to back, the front design is lost when you save on back.

**Impact:** HIGH - Switching views loses previous work

**Fix:** handleViewSwitch should save BEFORE switching, but current implementation may have race conditions.

---

### BUG #3: handleViewSwitch Race Condition 🔴
**Location:** Line 507-522

**Problem:**
```typescript
const handleViewSwitch = useCallback(async (newView: ViewSide) => {
  if (newView === selectedView) return;
  
  // Save current view before switching
  if (fabricCanvas.canvasRef && activeVariant) {
    const objects = fabricCanvas.canvasRef.getObjects().filter(/*...*/);
    if (objects.length > 0) {
      console.log(`Saving ${selectedView} view before switching to ${newView}...`);
      await handleSave();  // ⚠️ ASYNC - but view switches immediately after
    }
  }
  
  setSelectedView(newView);  // 🐛 This happens BEFORE save completes!
}
```

**Impact:** MEDIUM - View might switch before save completes, causing wrong canvas JSON to save

**Fix:** Move `setSelectedView(newView)` into the `await` block

---

### BUG #4: No Validation for selectedPrintOption ⚠️
**Location:** Line 471 in `handleSave`

**Problem:**
```typescript
selectedPrintOption: view === 'front' ? 'front' : 'back',
```

This doesn't check if the product actually supports front/back printing. Could save incompatible data.

**Impact:** MEDIUM - May cause issues with products that only support one-sided printing

---

### BUG #5: Missing Null Check on Product Images 🟡
**Location:** Line 1505 (loadLastUsedVariant)

**Problem:**
```typescript
const frontImage = product.images?.find((img: any) => img.type === 'front');
const imageUrl = frontImage?.url || product.images?.[0]?.url || '';
```

If `product.images` is undefined or empty, could cause issues. Should default to placeholder.

**Impact:** LOW - Visual glitch only

---

## ⚠️ POTENTIAL ISSUES

### Issue #1: Multiple useEffect Hooks (16 total)
**Observation:** The component has 16 useEffect hooks, many with overlapping dependencies.

**Specific Concerns:**
1. **Line 1474:** `loadLastUsedVariant` depends on `[isHydrating, user, productsLoading, allProducts, activeVariant, location.state, selectedCategory]`
   - Adding `selectedCategory` to deps might cause unnecessary re-runs
   - `location.state` object reference changes on every navigation

2. **Line 1430:** Design status useEffect has side effects (setTimeout)
   - Could cause memory leaks if component unmounts during timeout

3. **Line 895:** Canvas setup useEffect missing fabricCanvas.updateCanvasObjects in deps
   - Might not update when canvas ref changes

**Recommendation:** Audit each useEffect for:
- Missing dependencies
- Stale closures
- Memory leaks (clearTimeout/clearInterval)
- Dependencies that shouldn't trigger re-runs

---

### Issue #2: loadUserDesign Triggers Multiple Renders
**Location:** Line 676-802

**Problem:**  
Multiple render calls with timeouts:
```typescript
fabricCanvas.canvasRef?.renderAll();
fabricCanvas.updateCanvasObjects?.();

requestAnimationFrame(() => {
  fabricCanvas.canvasRef?.requestRenderAll();
  
  setTimeout(() => {
    fabricCanvas.canvasRef?.requestRenderAll();  // 3rd render!
  }, 100);
});
```

**Impact:** Performance - excessive re-renders on canvas load

**Recommendation:** Test if single `requestRenderAll()` is sufficient

---

### Issue #3: handleAddToCart Missing Error Handling for Upload
**Location:** Line 1691-1699

**Problem:**
```typescript
const uploadResponse = await fetch(/*...*/);
const uploadResult = await uploadResponse.json();
const thumbnailUrl = uploadResult?.url || '';  // ⚠️ What if uploadResponse.ok is false?
```

No check for `uploadResponse.ok` before parsing JSON.

**Impact:** MEDIUM - Could cause cart to have broken thumbnails

---

### Issue #4: No Cleanup on Component Unmount
**Observation:** Several setTimeout/requestAnimationFrame calls throughout, but no comprehensive cleanup.

**Locations:**
- Line 762: `setTimeout(() => { isLoadingDesignRef.current = false; }, 500);`
- Line 1439: `setTimeout(() => setDesignStatus({ type: 'idle' }), 3000);`
- Line 499: `setTimeout(() => { setDesignStatus({ type: 'idle' }); }, 3000);`

**Recommendation:** Use cleanup functions in useEffect or track timeout IDs for clearing on unmount

---

## 🔧 CODE QUALITY ISSUES

### Quality #1: Hardcoded Old Products Array
**Location:** Line 1744-1850+

**Problem:**  
Old `clothingProducts` array still exists in code (commented as "Remove the hardcoded clothingProducts array") but is actually still defined.

**Impact:** Code bloat - 100+ lines of dead code

---

### Quality #2: Inconsistent API Base URL Handling
**Observations:**
- Line 427: `const API_BASE = import.meta.env['VITE_API_BASE'] || 'http://localhost:4000';`
- Line 693: `await fetch(\`/api/design/load/${activeVariant.productId}?userId=${userId}\`, ...` (relative URL)
- Line 1487: Uses `${API_BASE}/api/design/load/last-used`

**Recommendation:** Standardize to always use API_BASE or always use relative URLs

---

### Quality #3: Console.log Debugging Left in Production Code
**Observation:** 50+ console.log statements throughout the file

**Examples:**
- Line 528: `console.log('🔵 Preview clicked');`
- Line 550: `console.log('🔵 Objects on canvas:', objects.length);`
- Line 1506: `console.log('✅ Product found:', product.name, 'Category:', product.category);`

**Recommendation:** Use proper logging library or conditional logging based on environment

---

## 📊 DATABASE DIAGNOSTICS RESULTS

```
✅ user_current_design: 0 designs (clean state after manual clear)
✅ user_saved_designs: 0 designs (clean state)
✅ 7 users in database (mix of Google OAuth and manual)
✅ 4 customizable products:
   - [CP211750] Polo Shirt
   - [CP349485] Polo Shirt - Pre Template
   - [CP510837] T - Shirt Pre template
   - [CP833540] V - Neck Pre template

✅ No orphaned data
✅ No invalid print_area_preset values (table empty)
✅ Schema structure matches code expectations
```

---

## 🎯 PRIORITY FIXES REQUIRED

### IMMEDIATE (Deploy Blocker):
1. **Fix BUG #1:** Remove parseInt(user.id) in loadUserDesign (line 698)
2. **Fix BUG #3:** Fix handleViewSwitch race condition (line 507-522)
3. **Fix BUG #2:** Ensure both front/back canvases are preserved

### HIGH PRIORITY:
4. Add null check validation for uploadResponse.ok in handleAddToCart
5. Review all 16 useEffect hooks for memory leaks and missing cleanups

### MEDIUM PRIORITY:
6. Add validation for selectedPrintOption based on product capabilities
7. Reduce excessive canvas render calls in loadUserDesign
8. Standardize API URL handling

### LOW PRIORITY (Tech Debt):
9. Remove dead code (old clothingProducts array)
10. Clean up console.log statements
11. Add proper logging framework

---

## ✅ WHAT'S WORKING WELL

1. **Auto-save logic** - Well implemented with debounce
2. **Error boundaries** - Good try-catch coverage
3. **Design validation** - Comprehensive validation before save/preview
4. **Cloudinary integration** - Thumbnail upload working correctly
5. **Database schema** - Properly normalized and indexed
6. **API service layer** - Clean separation of concerns
7. **TypeScript types** - Good type safety throughout

---

## 🚀 RECOMMENDATIONS

### Architecture:
1. Consider splitting this 3882-line component into smaller sub-components:
   - CanvasEditor
   - ToolsPanel
   - VariantSelector
   - PropertiesPanel
   - LibraryPanel

### Performance:
2. Implement React.memo for heavy sub-components
3. Use useMemo for expensive computations
4. Debounce canvas event handlers

### Testing:
5. Add unit tests for:
   - handleSave (with mocked Cloudinary)
   - loadUserDesign (with mocked API)
   - handleViewSwitch (race condition test)

### Monitoring:
6. Add error tracking (Sentry/LogRocket)
7. Add analytics for user actions
8. Track save/load success rates

---

## 📝 TESTING CHECKLIST

- [ ] Fix BUG #1 (parseInt issue)
- [ ] Fix BUG #3 (race condition)
- [ ] Test: Add objects → switch view → add more objects → save → reload → verify both sides loaded
- [ ] Test: Add objects → preview → verify navigation works
- [ ] Test: Add objects → add to cart → verify cart has correct thumbnail
- [ ] Test: Save design → logout → login → verify design loads
- [ ] Test: Navigate from category → verify no wrong variant auto-loads
- [ ] Test: Page refresh on design page → verify last design loads
- [ ] Test: Switch views rapidly → verify no data loss
- [ ] Test: Network offline → verify graceful handling

---

## 🏁 CONCLUSION

**Overall Assessment:** The custom design page has a **solid foundation** with good error handling and database structure. However, there are **3 critical bugs** that must be fixed before production:

1. UUID truncation in loadUserDesign
2. View-switching data loss
3. Race condition in handleViewSwitch

Once these are resolved, the page should function reliably. The main tech debt is the component size (3882 lines) which makes maintenance challenging.

**Estimated Fix Time:** 1-2 hours for critical bugs, 4-6 hours for all priority fixes.
