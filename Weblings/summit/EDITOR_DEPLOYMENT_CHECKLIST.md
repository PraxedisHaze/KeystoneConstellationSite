# Apex Editor Deployment Checklist - summit

## Quick Start for summit

### Files to Copy
- [ ] Copy `../../apex/js/` → `./js/`
- [ ] Copy `../../apex/elementDetector.js` → `./elementDetector.js`

### HTML Changes
- [ ] Add lens and palette containers (before `</body>`)
- [ ] Add EDIT button to navigation header

### Ignored Selectors for summit
```javascript
ignoredSelectors: [
    '[data-anothen-internal]',
    '.lens-container',
    '#palette-container',
    '#edit-mode-btn',
    // Add summit-specific UI elements as discovered
]
```

### CSS to Add
- [ ] Draggable elements styles
- [ ] Palette dark/light theme colors
- [ ] Highlight and grayscale effects
- [ ] Tool palette styling

### JavaScript
- [ ] Add module script with inspector initialization

### Testing Checklist
- [ ] EDIT button visible and clickable
- [ ] No console errors on page load
- [ ] Lens and palette appear when clicking EDIT
- [ ] Highlighting works properly
- [ ] Theme toggle works

### Notes
- Discover and document summit-specific UI that should be ignored
- Test both dark and light themes

---

**Last Updated:** 2026-02-06
