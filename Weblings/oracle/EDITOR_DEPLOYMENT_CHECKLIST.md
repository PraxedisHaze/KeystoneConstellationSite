# Apex Editor Deployment Checklist - oracle

## Quick Start for oracle

### Files to Copy
- [ ] Copy `../../apex/js/` → `./js/`
- [ ] Copy `../../apex/elementDetector.js` → `./elementDetector.js`

### HTML Changes
- [ ] Add lens and palette containers (before `</body>`)
- [ ] Add EDIT button to nav (line ~137-145, add to flex gap-8 container)

### Ignored Selectors for oracle
```javascript
ignoredSelectors: [
    '[data-anothen-internal]',
    '.lens-container',
    '#palette-container',
    '#edit-mode-btn',
    '.stars',             // oracle: star field background
    '.star',              // oracle: individual stars
    '.moon'               // oracle: moon element (if interactive)
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
- [ ] Star field doesn't interfere with lens
- [ ] Gold theme colors work well with green highlight
- [ ] Palette readable in dark mode

### Color Notes
- oracle uses `#fde047` (gold/starlight) in dark, `#f59e0b` (amber) in light
- Green highlight will stand out beautifully against the celestial theme
- Test both themes thoroughly

---

**Last Updated:** 2026-02-06
