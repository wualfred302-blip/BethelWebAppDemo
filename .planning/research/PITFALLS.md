# Pitfalls Research: Bethel CGL Web Application

## Critical Pitfalls

### 1. PSGC Data Size
**Risk:** The `philippine_full.json` file is ~2.3MB. Loading it all at once can slow initial page load.

**Warning signs:**
- Long initial load time
- Lighthouse performance score drops
- Users on slow connections see blank selects

**Prevention:**
- Load the JSON file lazily (only when Location step is reached)
- Or import it as a static module (Next.js will handle bundling)
- The reference project uses `public/philippine_full.json` with dynamic `fetch()` — follow the same pattern

**Phase to address:** Phase 1 (Foundation)

---

### 2. Base64 File Storage in State
**Risk:** Storing uploaded files as base64 strings in Zustand inflates localStorage usage. Large files (high-res IDs, multi-page permits) can exceed localStorage limits (~5MB).

**Warning signs:**
- localStorage quota exceeded errors
- Slow state persistence
- App crashes on file upload

**Prevention:**
- Compress images before converting to base64
- Limit file size to 5MB per file (validate in UI)
- For the demo, this is acceptable — production would use server upload

**Phase to address:** Phase 3 (Document Upload)

---

### 3. PDF Generation Complexity
**Risk:** Generating realistic-looking PDFs with proper formatting, fonts, and layout is more complex than expected. pdf-lib requires manual positioning of text elements.

**Warning signs:**
- Text overflow or clipping
- Missing Filipino characters (ñ, accents)
- Unprofessional-looking output

**Prevention:**
- Use built-in PDF fonts (Helvetica) — no custom font embedding needed
- Test with edge case data (long names, special characters)
- Keep layout simple: tabular, left-aligned, clear sections
- Filipino names rarely have special characters in insurance context

**Phase to address:** Phase 5 (Cover Note & Policy)

---

### 4. Form Validation Gaps
**Risk:** Skipping validation on "optional" steps (like document upload) leads to incomplete applications being submitted.

**Warning signs:**
- Users can skip document upload
- Empty fields in generated PDFs
- Cover note shows incomplete data

**Prevention:**
- Every step must validate before allowing "Continue"
- Documents step: all 3 uploads required
- Cover Note step: no form, but data completeness check
- Payment step: proof of payment required

**Phase to address:** Throughout all form steps

---

### 5. State Desynchronization
**Risk:** If Zustand state and form state diverge (user edits form but doesn't submit), the persisted state becomes stale.

**Warning signs:**
- Cover note shows old data after user edited fields
- Page refresh loads outdated form values
- Generated PDF has inconsistent data

**Prevention:**
- Always save to Zustand on form submit (step advancement)
- Load form defaults from Zustand store
- Single source of truth: Zustand store

**Phase to address:** Phase 2 (Form Steps)

---

### 6. Mobile Input Issues
**Risk:** Numeric inputs (floor area) trigger wrong keyboard on mobile. File upload may not work consistently across browsers.

**Warning signs:**
- Full keyboard shows instead of numeric pad
- File picker doesn't open on mobile Safari
- Touch targets too small

**Prevention:**
- Use `inputMode="numeric"` for floor area input
- Use `<input type="file">` with `accept` attribute (not custom file picker)
- Minimum 44px touch targets (already in reference project)
- Test on real mobile devices

**Phase to address:** Phase 1-3 (all input components)

---

### 7. Cascading Select Race Conditions
**Risk:** When user changes Region after selecting a Province/City/Barangay, the dependent selects need to reset. If not handled, stale data persists.

**Warning signs:**
- Barangay selected but doesn't belong to new Province
- Form validates with mismatched location data
- Generated policy has inconsistent address

**Prevention:**
- When parent changes, clear all child selections
- Form validation should check consistency
- Visual indicator when child is disabled/empty

**Phase to address:** Phase 2 (Location Step)

---
*Research conducted: 2026-03-21*
