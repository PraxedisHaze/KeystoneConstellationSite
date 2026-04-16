# Apex Editor Deployment Checklist - scholar

## Quick Start for scholar

### Files to Copy
- [ ] Copy `../../apex/js/` → `./js/`
- [ ] Copy `../../apex/elementDetector.js` → `./elementDetector.js`

### HTML Changes
- [ ] Add lens and palette containers (before `</body>`)
- [ ] Add EDIT button to nav (line ~186-193, in the flex flex-col items-end)

### Ignored Selectors for scholar
```javascript
ignoredSelectors: [
    '[data-anothen-internal]',
    '.lens-container',
    '#palette-container',
    '#edit-mode-btn',
    '.sidenote',          // scholar: marginal notes
    '.palette-header',    // scholar: existing palette (if any)
    '.scholar-grid'       // scholar: layout container
]
```

### CSS to Add
- [ ] Draggable elements (grab cursors)
- [ ] Palette dark/light theme colors
- [ ] Highlight and grayscale effects
- [ ] Tool palette styling

### JavaScript
- [ ] Add module script with inspector initialization (before `</body>`)

### Testing
- [ ] EDIT button visible in nav
- [ ] Typing animation on "Thought" doesn't interfere
- [ ] Sidenotes are not detected/highlighted
- [ ] Academic layout is preserved
- [ ] Test both dark and light themes

### Color Notes
- scholar uses `#8c2f00` (rust) in dark, `#d97706` (orange) in light
- Green highlight on serif text should be readable
- The academic aesthetic is compatible with neon inspector aesthetic

---

**Last Updated:** 2026-02-06
