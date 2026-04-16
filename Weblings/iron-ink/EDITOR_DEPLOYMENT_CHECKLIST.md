# Apex Editor Deployment Checklist

**FOR THIS WEBLING: iron-ink**

## Quick Reference: Deploying Editor to Each Webling

### Phase 1: File Setup
- [ ] Copy `../../apex/js/` folder to this webling directory
- [ ] Copy `../../apex/elementDetector.js` to this webling root
- [ ] Verify relative paths in imports work (test with local server)

### Phase 2: HTML Integration

#### Add Editor Containers
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
- [ ] Add button with `id="edit-mode-btn"` to header (near theme toggle)
- [ ] **For iron-ink**: Add to the header flex container around line 161-170

### Phase 3: CSS Integration

#### Add all CSS blocks (copy from Apex index.html):
- [ ] Draggable elements styles
- [ ] Palette text color rules for dark/light theme
- [ ] Highlight and grayscale effects
- [ ] Tool palette styling

**iron-ink Ignored Selectors:**
```javascript
ignoredSelectors: [
    '[data-anothen-internal]',
    '.lens-container',
    '#palette-container',
    '#edit-mode-btn',
    '.marquee-container',  // iron-ink: running tape
    '.drag-handle'         // iron-ink: message box
]
```

### Phase 4: JavaScript Integration

Add this module script before closing `</body>`:
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
        link.download = 'iron-ink-customized.html';
        link.click();
        URL.revokeObjectURL(url);
        alert('Iron & Ink exported! Download started.');
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

### Phase 5: Testing Checklist

- [ ] Page loads without console errors
- [ ] EDIT button appears and is clickable
- [ ] Clicking EDIT shows lens and palette
- [ ] Hovering over elements highlights them with green glow
- [ ] Off-screen indicator works
- [ ] Can drag lens and palette around
- [ ] Palette inputs work correctly
- [ ] Theme toggle works (colors change)
- [ ] Marquee animation doesn't interfere with editor

### Notes

- iron-ink uses `#ff3300` as accent (International Orange) - green highlight will stand out nicely
- The brutalist grid background should not be detected (it's a fixed::before element)
- Message box drag handle is already in the design - your inspector drag works similarly

---

**Last Updated:** 2026-02-06
