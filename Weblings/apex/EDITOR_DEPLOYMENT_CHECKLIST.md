# Apex Editor Deployment Checklist

## Quick Reference: Deploying Editor to Each Webling

### Phase 1: File Setup
- [ ] Copy `Weblings/apex/js/` folder to target webling directory
- [ ] Copy `Weblings/apex/elementDetector.js` to target webling root
- [ ] Verify relative paths in imports work (test with local server)

### Phase 2: HTML Integration

#### Add Editor Containers (copy from Apex lines 654-675)
```html
<!-- EDIT MODE: LENS CONTAINER (for draggable/resizable frame) -->
<div id="lens-container" class="hidden z-[5000]"></div>

<!-- EDIT MODE: PALETTE CONTAINER (for context-aware tools) -->
<div id="palette-container" data-anothen-internal
    class="fixed bottom-6 right-6 w-96 bg-zinc-900 border-2 border-[var(--accent)] rounded-sm shadow-2xl z-[19998] hidden max-h-[600px] overflow-y-auto text-white">
    <div class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-[var(--accent)]">APEX EDITOR</h3>
            <button onclick="toggleEditMode()" class="text-zinc-500 hover:text-white">✕</button>
        </div>
        <div id="palette-content"></div>
        <div class="flex gap-3 mt-6 pt-6 border-t border-zinc-800">
            <button onclick="exportApex()"
                class="flex-1 p-2 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition">EXPORT</button>
            <button onclick="resetApex()"
                class="flex-1 p-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition">RESET</button>
        </div>
    </div>
</div>
```

#### Add EDIT Button to Navigation
- [ ] Add button with `id="edit-mode-btn"` to navigation (look at Apex line ~358-362 for style)
- [ ] Position should be prominent in header/nav

### Phase 3: CSS Integration

#### Add all CSS blocks (from Apex index.html):
- [ ] Draggable elements styles (lines 683-700)
- [ ] Palette text color rules for dark/light theme (lines 713-751)
- [ ] Highlight and grayscale effects (lines 862-927)
- [ ] Tool palette styling (lines 748-852)

**Theme Color Reference:**
```
DARK THEME (default):
- Primary: #00ff00 (neon green)
- Secondary: #00ffff (cyan)

LIGHT THEME (data-theme="light"):
- Primary: #d4af37 (gold)
- Secondary: #003366 (navy)
```

### Phase 4: JavaScript Integration

#### Add module script (from Apex lines 995-1070):
```html
<script type="module">
    import MagnifyingGlassInspector from './js/magnifying-glass-inspector.js';

    let inspector = null;
    let editMode = false;

    function initInspector() {
        if (!inspector) {
            inspector = new MagnifyingGlassInspector();
        }
    }

    function toggleEditMode() {
        initInspector();
        editMode = !editMode;

        if (editMode) {
            document.body.classList.add('edit-mode');
            inspector.enable();
        } else {
            document.body.classList.remove('edit-mode');
            inspector.disable();
        }
    }

    // Export functions to window
    window.toggleEditMode = toggleEditMode;

    const editBtn = document.getElementById('edit-mode-btn');
    if (editBtn) {
        editBtn.addEventListener('click', toggleEditMode);
    }

    window.exportApex = function() {
        const doc = document.documentElement.cloneNode(true);
        doc.querySelectorAll('.lens-container, #palette-container, .depth-map-overlay').forEach(el => el.remove());
        doc.querySelectorAll('script[type="module"]').forEach(script => script.remove());

        const cleanHTML = "<!DOCTYPE html>\n" + doc.outerHTML;
        const blob = new Blob([cleanHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'webling-customized.html';
        link.click();
        URL.revokeObjectURL(url);
        alert('Webling exported! Download started.');
    }

    window.resetApex = function() {
        if (confirm('Reset all customizations? This cannot be undone.')) {
            localStorage.removeItem('apex-edits-state');
            localStorage.removeItem('apex-lens-state');
            location.reload();
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        initInspector();
    });
</script>
```

### Phase 5: Inspector Configuration

#### Update MagnifyingGlassInspector ignored selectors
In `magnifying-glass-inspector.js` line 27-29, add webling-specific internal UI selectors:

```javascript
this.detector = new ElementDetector({
    throttle: 80,
    ignoredSelectors: [
        '[data-anothen-internal]',
        '.lens-container',
        '#palette-container',
        '#edit-mode-btn',
        // Add webling-specific internal selectors here:
        // '.header', '.nav', '.footer', etc.
    ]
});
```

**Common ignored selectors by webling:**
- **iron-ink**: `.marquee-container`, `.drag-handle`
- **neon-tokyo**: `.cyber-grid`, `.crt::before`
- **oracle**: `.stars`, `.star`
- **scholar**: `.sidenote`, `.palette-header`
- **summit**: (add as discovered)
- **velvet**: (add as discovered)
- **aura**: (add as discovered)
- **canvas**: (add as discovered)
- **cipher**: (add as discovered)
- **ether**: (add as discovered)
- **gaia**: (add as discovered)

### Phase 6: Testing Checklist
... (existing items) ...

### Phase 7: Accessibility & UX Rituals (The High-Fidelity Standard)
- [ ] **Shift-Lock Ritual:** Verify the "HOLD SHIFT" hint appears after 1.5s of hovering over an element.
- [ ] **Searching State:** Verify the lens border becomes dashed and opacity drops when over "dead space."
- [ ] **Role-Based Safety:** Verify the text editor is disabled/hidden when a "Structure" or "Media" element is detected.
- [ ] **Lattice Flow Intuition:** Verify Move buttons rotate (Left/Right vs Up/Down) based on the element's layout context.
- [ ] **Danger Signaling:** Verify the Hazard Red pulse and "PRESS DEL" hint appear for deletable targets.
- [ ] **3D Exit Ritual:** Verify the prominent "Exit Matrix" button appears and functions when in 3D mode.

### Phase 8: Customization Per Webling
... (existing items) ...

#### Color Scheme Review
- [ ] Check if webling's --accent color looks good with green highlight
- [ ] Adjust grayscale opacity if needed (currently 85%)
- [ ] Test glow colors match webling aesthetic

#### Performance
- [ ] Check detection throttle (80ms is current default)
- [ ] Monitor for lag on large pages
- [ ] Verify no memory leaks (close/reopen editor several times)

---

## Deployment Order (by priority)

1. **Iron-Ink** (brutalist, high contrast) - good test
2. **Neon-Tokyo** (cyberpunk, similar colors) - easiest match
3. **Oracle** (celestial, gold accents) - good for light theme testing
4. **Scholar** (academic, already has typing animation)
5. **Summit**, **Velvet**, **Aura**, **Canvas**, **Cipher**, **Ether**, **Gaia** (batch deploy after #1-4 working)

---

## Quick Deploy Script (future automation)

```bash
#!/bin/bash
# Copy editor files to target webling
WEBLING=$1
cp -r Weblings/apex/js Weblings/$WEBLING/
cp Weblings/apex/elementDetector.js Weblings/$WEBLING/
echo "Editor files copied to Weblings/$WEBLING/"
echo "Next: Update HTML, CSS, and JS initialization"
```

---

## Rollback Plan

If something breaks on a webling:
1. Git restore the webling's index.html to previous version
2. Remove the `js/` folder copy
3. Test that webling works normally again
4. Investigate what caused the issue before redeploying

---

## Notes

- **Storage**: Each webling stores edits in `localStorage` with key `apex-edits-state` and `apex-lens-state`. These are isolated per page.
- **Coherence Engine**: Some weblings load `coherence_engine.js`. The editor is compatible but works independently.
- **Quill Integration**: The palette integrates with Quill for rich text editing if needed (currently optional).
- **Sanctuary Boundary**: The `data-anothen-internal` attribute is the key to preventing editor UI from being detected and highlighted.

---

**Last Updated:** 2026-02-06
**Template Version:** 1.0
