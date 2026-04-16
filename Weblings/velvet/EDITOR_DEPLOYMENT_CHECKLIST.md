# Apex Editor Deployment Checklist - velvet

## Quick Start for velvet

### Files to Copy
- [ ] Copy `../../apex/js/` → `./js/`
- [ ] Copy `../../apex/elementDetector.js` → `./elementDetector.js`

### HTML Changes
- [ ] Add lens and palette containers
- [ ] Add EDIT button to navigation

### Ignored Selectors for velvet
```javascript
ignoredSelectors: [
    '[data-anothen-internal]',
    '.lens-container',
    '#palette-container',
    '#edit-mode-btn',
    // Discover velvet-specific UI to ignore
]
```

### CSS to Add
- [ ] Draggable elements
- [ ] Palette colors
- [ ] Highlight effects
- [ ] Tool palette styling

### JavaScript
- [ ] Add module script

### Testing
- [ ] EDIT button works
- [ ] Lens and palette functional
- [ ] No interfering animations
- [ ] Theme compatibility

---

**Last Updated:** 2026-02-06
