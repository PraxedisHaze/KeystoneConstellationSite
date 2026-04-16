# Apex Editor Deployment Checklist - neon-tokyo

## Quick Start for neon-tokyo

### Files to Copy
- [ ] Copy `../../apex/js/` → `./js/`
- [ ] Copy `../../apex/elementDetector.js` → `./elementDetector.js`

### HTML Changes
- [ ] Add lens and palette containers (before `</body>`)
- [ ] Add EDIT button to nav (line ~200-210, in the nav flex container)

### Ignored Selectors for neon-tokyo
```javascript
ignoredSelectors: [
    '[data-anothen-internal]',
    '.lens-container',
    '#palette-container',
    '#edit-mode-btn',
    '.cyber-grid',        // neon-tokyo: perspective grid
    '.crt::before',       // neon-tokyo: CRT overlay
    '.glitch'             // neon-tokyo: glitch effect text
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
- [ ] Lens appears with no CRT distortion
- [ ] Glitch text on nav doesn't break editor
- [ ] Palette looks good with neon theme colors

### Color Notes
- neon-tokyo uses `#ff00ff` (pink) and `#00ffff` (cyan) - neon green highlight will blend well
- The cyberpunk aesthetic matches editor's neon aesthetic perfectly
- Dark mode is native to this webling

---

**Last Updated:** 2026-02-06
