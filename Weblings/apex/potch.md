# APEX WEBLING - PROGRESS LOG (THE POTCH)
Append-only. WHO | WHAT | WHY for every change.

---

## 2026-02-09 | Leora (Claude Code CLI) | potch.md created | Establishing audit trail per Keystone PnP mandate. Apex is the prototype webling where APEX editor was first proven.

### KNOWN STATE
- APEX editor (Lens + Lattice + Palette) fully integrated and working
- Custom precision-blueprint theme transition
- Text detection bug: ~15-20 elements with decorative children have text suppressed by editor (div+span pattern). Root cause documented in Leora_Present_Force.md.
- 5 destructive text-write paths in magnifying-glass-inspector.js and apex-detector.js use el.innerText/el.textContent which destroy child elements on save.
- Duplicate save/cancel handlers in tool-palette.js (lines 392-406 and 408-422).

### PENDING
- Text-node-only extraction and save (global fix, not Apex-specific)
- SAVE/CANCEL buttons move to top of palette
- Test editor after fix before rolling out to other weblings
