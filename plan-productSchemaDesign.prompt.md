## Plan: Product Schema Design

We’ll define a future-proof product data model based on how the app uses product info across listings, details, cart/favorites, checkout, and custom design. We’ll align prices to PayMongo (centavos), support variants, and capture customization layers.

### Steps
1. Map product fields from `ProductCard`, `CustomProductCard`, `ProductDetailsPage`, and mock data in `App.tsx` to a canonical Product/Variant model.
2. Define `CartItem` and `FavoriteItem` shapes from `CartDrawer.tsx` and `FavoritesDrawer.tsx`, including variant and customization references.
3. Extract checkout form fields from `pages/CheckoutPage.tsx` and align with `Order`/`OrderItem` needs (amounts in centavos, currency code).
4. Model custom design entities from `pages/CustomDesignPage.tsx` and `CustomDesignPreviewPage.tsx` (Design, Layer, positions, sides, pricing impact).
5. Propose schemas (PostgreSQL and MongoDB) with keys, indexes, and slugs; include inventory, media, categories, attributes/options, and auditing.

### Further Considerations
1. Variants: use strict size/color vs flexible attribute set (confirm).
2. Media: single primary image vs gallery with alt text and sort order.
3. Customization storage: save flattened render + editable layers, or layers only (confirm retention and GDPR requirements).

### Field Inventory From Admin UI Screenshots (Initial Pass)

1. Basic Info
	- `product_category` (required): High-level grouping (e.g., T-Shirt, Hoodie). Needs taxonomy table (`categories`) with slug, display_name, parent_id (optional), is_active.
	- `product_type` / audience (required): Unisex | Men | Women | Kids. Suggest enum or lookup table (`audiences`). Influences available sizes.
	- `product_name` (required): Unique per category? Recommend global unique slug derived (`slug` indexed unique).
	- `available_sizes` (required multiselect): XS,S,M,L,XL,2XL,3XL,4XL (Kid sizes differ). Represent via `product_variants` or `size_options`. Potential size premium pricing; store `base_price_adjustment` per size.
	- `fit_type` (required): e.g., Classic, Slim, Oversized. Lookup table or enum (`fit_profiles`).
	- `fit_description` (optional): Short text guidance. VARCHAR(160) for concise UI. Index for full-text? Probably no.
	- `description` (optional long): Marketing copy. TEXT. Consider rich text vs markdown flag.

2. Images
	- `front_view_image` (required): Primary hero image; store in `product_media` with role = 'front'. Enforce 1.
	- `back_view_image` (required): role = 'back'. Enforce 1.
	- `additional_images[]` (optional, 2-4 recommended): role = 'gallery'. Maintain `sort_order`, `alt_text`, maybe focal point.
	- Constraints: formats JPG/PNG/SVG; recommended <5MB; max 10MB. Store validation rules in config. Optionally pre-process via Cloudinary.

3. Material & Fabric
	- `fabric_composition`: e.g., "100% Cotton". Store structured? Option A: free text. Option B: parse into fiber percentages table. Start free text, with `material_profile_id` for future.
	- `fabric_weight` (optional): e.g., "180 g/m²" numeric + unit. Store numeric `fabric_weight_gsm` INT.
	- `texture_finish` (optional): e.g., Soft-washed, Brushed. Lookup table (`finishes`).

4. Pricing
	- `base_cost` (your production cost): INT (centavos). Non-customer visible; used for margin analytics.
	- `retail_price` (required): INT (centavos). Price before size premium & shipping.
	- Derived: `final_checkout_price = retail_price + size_premium (if any) + shipping_fee`. Taxes currently absent (assumption: no VAT modeling yet). Add fields: `currency` default 'PHP'. Track `msrp` vs `sale_price` (nullable) for promotions later.

5. Colors & Variants
	- Current UI: single color per product (`search_color` + add). Field `primary_color` storing hex or name; reference `colors` table with normalized color_name, hex_value, cmyk values.
	- Optional variant sample image + variant name/texture/type/color: This implies a future `variants` expansion. For now treat as `variant_preview` with fields: `variant_label`, `variant_image`. Note: UI restricts to 1 variant; confirm need for multi.
	- Recommendation: adopt `product_variants` table keyed by `product_id` supporting multiple future variants (color/texture combos) even if presently limited to 1.

6. Print & Customization
	- `print_method`: e.g., DTG, Screen, Sublimation. Lookup table (`print_methods`) with capabilities.
	- `print_areas[]`: Front | Back | Sleeve (multi-select). Store as relation table `product_print_areas` with enumerated area codes.
	- `design_upload_requirements`: Guidance string (resolution, file types). Store `upload_requirements` TEXT per product or per print method fallback.
	- Future: pricing per area (not represented yet). Add `area_price_adjustment` INT centavos default 0.

7. Business Details
	- `turnaround_time`: e.g., "3-5 days". Represent structured? Option A: free text. Option B: min_days INT, max_days INT. Recommend storing both structured + display string.
	- `minimum_order_quantity`: INT >=1. If 1 => retail; >1 => bulk. Use for validation and wholesale pricing ladder later.

### Preliminary Data Type Recommendations
| Field | Type | Notes |
|-------|------|------|
| product_name | VARCHAR(140) | Unique + slug generate |
| slug | VARCHAR(160) | unique index |
| description | TEXT | markdown flag optional |
| retail_price | INT | centavos, index for price filtering |
| base_cost | INT | internal only |
| currency | CHAR(3) | default 'PHP' |
| primary_color | VARCHAR(32) | hex or name |
| fabric_composition | VARCHAR(120) | free text start |
| fabric_weight_gsm | INT | nullable |
| texture_finish | VARCHAR(60) | FK finishes |
| fit_type | VARCHAR(40) | FK fit_profiles |
| fit_description | VARCHAR(160) | nullable |
| turnaround_min_days | INT | derived from parsed input |
| turnaround_max_days | INT | derived |
| minimum_order_quantity | INT | default 1 |

### Normalization / Entities (Initial Mapping)
- `products`: core descriptive + audience + category FK + pricing base.
- `product_variants`: size, optional color override, SKU, size_price_adjustment, inventory_qty.
- `product_media`: role (front/back/gallery/variant), url, alt_text, sort_order.
- `product_material_specs`: fabric_weight_gsm, composition text, finish FK.
- `product_print_methods`: link product -> method (if multiple allowed later).
- `product_print_areas`: enumerations for allowed design placements.
- `product_business_meta`: turnaround_min_days, turnaround_max_days, min_order_qty.

### Indexing Suggestions
- `products.slug` unique.
- `products.category_id` + `audience` composite index for catalog browsing.
- `product_variants.product_id` + `size` unique composite.
- `product_media.product_id` + `role` index (enforce single front/back via uniqueness constraint).
- Partial index for `sale_price IS NOT NULL` future.

### Open Questions / Clarifications Needed
1. Can future products have multiple colors? (UI currently restricts to one.)
2. Are size premiums planned? If yes, store `size_price_adjustment` now.
3. Need SKU per variant? Proposed format: CATEGORY-AUDIENCE-COLOR-SIZE incremental.
4. Will fabric data need structured fiber percentages (for filtering)? If yes, design fiber composition join table.
5. Print area pricing differences? (Sleeve often costs extra.)
6. Turnaround time dynamic by quantity? (If yes, need SLA rules table.)
7. Support sale/discount codes soon? Introduce `sale_price` + `active_promotions` relation.
8. Any plan for multi-currency (PHP only now)? If yes, separate `price_book` table.
9. Need soft delete? Recommend `deleted_at` TIMESTAMP on major tables.

### Next Actions
- Confirm open questions.
- Adjust entity list based on multi-color & multi-variant decisions.
- Add custom design linkage (Design referencing product + selected print areas + layers) in next section.

