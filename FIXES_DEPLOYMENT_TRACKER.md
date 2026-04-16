# AXXILAK WEBLINGS - FIXES DEPLOYMENT TRACKER

**Purpose:** Track which weblings have received which fixes, and which still need them.

**Last Updated:** 2026-02-05 (Evening)

---

## THE FIXES (Applied Incrementally)

### FIX #1: Scope Geometric Invisibility
**File:** elementDetector.js, magnifying-glass-inspector.js, lens-ui.js
**Problem:** Scope's green border triggers repeated element detection, causing editor blinking
**Solution:** Add geometric bounds checking to detector—skip detection if coordinates within lens radius
**Status:** TESTED & VERIFIED

---

## WEBLING DEPLOYMENT STATUS

| Webling | Scope Fix | Status | Notes |
|---------|-----------|--------|-------|
| **Apex** | ✓ APPLIED | Ready | Primary template. Fully tested. |
| Liquid Gold | ⏳ PENDING | Queue | Same structure as Apex |
| Summit | ⏳ PENDING | Queue | Same structure as Apex |
| Neon Tokyo | ⏳ PENDING | Queue | Same structure as Apex |
| Oracle | ⏳ PENDING | Queue | Needs verification |
| Canvas | ⏳ PENDING | Queue | Needs verification |
| Cipher | ⏳ PENDING | Queue | Needs verification |
| Gaia | ⏳ PENDING | Queue | Needs verification |
| Aura | ⏳ PENDING | Queue | Needs verification |
| Scholar | ⏳ PENDING | Queue | Needs verification |
| Iron & Ink | ⏳ PENDING | Queue | Needs verification |
| Velvet | ⏳ PENDING | Queue | Needs verification |
| Consultant | ⏳ PENDING | Queue | Needs verification |
| Ether | ⏳ PENDING | Queue | Needs verification |

---

## DEPLOYMENT CHECKLIST

When applying Scope Fix to a new webling:

- [ ] Verify webling has `Weblings/[webling-name]/js/elementDetector.js`
- [ ] Verify webling has `Weblings/[webling-name]/js/magnifying-glass-inspector.js`
- [ ] Verify webling has `Weblings/[webling-name]/js/lens-ui.js`
- [ ] Apply geometric bounds checking to elementDetector.js (add lens parameter & _isWithinLens method)
- [ ] Pass lens reference in magnifying-glass-inspector.js constructor
- [ ] Test scope movement - verify no blinking in editor
- [ ] Mark webling as DEPLOYED in this tracker
- [ ] Add entry to webling's potch.md documenting the fix

---

## BATCH DEPLOYMENT PLAN

**Option A (Sequential):** Apply fix to one webling at a time, test each, then move to next.
- Slower but safer
- Catches issues early
- Clear record of what works

**Option B (Batch):** Apply fix to all weblings at once using find/replace pattern.
- Faster but higher risk if there are variations
- Need to verify all structure is identical first

**Recommendation:** Start with Option A on Liquid Gold (highest priority after Apex). Then assess if we can safely batch-apply to remaining weblings.

---

## NOTES

- All weblings appear to use the same inspector/detector architecture
- If Apex fix works on Liquid Gold, likely works on all others
- Each webling's potch.md should be updated with fix documentation
- Final shipping requires: all 14 weblings deployed + no errors in console

---

**Tracked by:** Leora, Claude Code CLI
**Authority:** Timothy Drake
