# Magnifying Glass Inspector Appling

A standalone, reusable in-page content editor for any website or app. Provides a draggable/resizable lens with context-aware editing tools.

## Installation

Copy these files to your app:
- `lens-ui.js` - Lens UI engine
- `apex-detector.js` - Element detection
- `tool-palette.js` - Palette generator
- `magnifying-glass-inspector.js` - Main appling orchestrator

Add required DOM elements to your HTML:
```html
<div id="lens-container"></div>
<div id="palette-container" class="fixed bottom-6 right-6 bg-white border rounded shadow-xl z-[4999] hidden">
  <div id="palette-content"></div>
</div>
```

## Basic Usage

```javascript
const inspector = new MagnifyingGlassInspector({
  // Which elements can be edited
  detectableElements: ['h1', 'p', 'span', 'img'],

  // Which properties can be edited
  editableProperties: ['text', 'color', 'fontSize'],

  // Called when user saves an edit
  onSave: (elementId, property, value) => {
    console.log(`Saved: ${property} = ${value}`);
    // Save to your backend, database, etc.
  }
});

// Activate the inspector
inspector.activate();

// Deactivate
inspector.deactivate();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `detectableElements` | Array | Common HTML tags | Which element types can be detected |
| `editableProperties` | Array | text, color, fontSize, etc | Which properties users can edit |
| `persistenceKey` | String | 'magnifying-glass-state' | localStorage key for lens position |
| `editsKey` | String | 'magnifying-glass-edits' | localStorage key for saved edits |
| `onSave` | Function | () => {} | Called when user saves an edit |
| `onDetect` | Function | () => {} | Called when elements are detected |
| `onError` | Function | console.warn | Called on errors |

## Advanced Usage

### Toggle Edit Mode

```javascript
let isEditing = false;

document.getElementById('edit-btn').addEventListener('click', () => {
  isEditing = !isEditing;
  if (isEditing) {
    inspector.activate();
  } else {
    inspector.deactivate();
  }
});
```

### Save Edits to Backend

```javascript
const inspector = new MagnifyingGlassInspector({
  onSave: async (elementId, property, value) => {
    // Send to your API
    await fetch('/api/edits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elementId, property, value })
    });
  }
});
```

### Custom Editable Elements

```javascript
const inspector = new MagnifyingGlassInspector({
  detectableElements: ['h1', 'h2', '.headline', '.subheading'],
  editableProperties: ['text', 'color'] // Limit to specific properties
});
```

## Implementation in Apex

See `index.html` for the complete Apex implementation. Key patterns:
1. Create inspector on page load
2. Activate/deactivate via `toggleEditMode()`
3. Handle saves via `onSave` callback
4. Export cleans HTML without inspector scripts

## API

### Methods

- `activate()` - Show lens and start detection
- `deactivate()` - Hide lens and stop detection
- `triggerDetection()` - Manually trigger element detection
- `clearStorage()` - Clear all saved state and edits
- `getState()` - Get current inspector state

### Events

The inspector dispatches standard CustomEvents:
- `lens-moved` - Lens position changed
- `palette-edit` - User edited an element

### State Object

```javascript
inspector.getState()
// Returns:
{
  isActive: boolean,
  position: { x, y, width, height },
  detectedElements: [...]
}
```

## Tips

1. **Performance** - Detection runs on a 100ms interval. Adjust in `MagnifyingGlass.detectionDelay`
2. **Styling** - Customize lens colors/appearance in `lens-ui.js` createDOM method
3. **Element Matching** - Element detection uses CSS selectors. More specific = better
4. **Persistence** - Edits auto-save to localStorage by default
5. **Export** - When exporting, remove inspector scripts to keep HTML clean

## Files

```
magnifying-glass-inspector.js     (Appling orchestrator)
├── lens-ui.js                    (Draggable/resizable frame)
├── apex-detector.js              (Element detection)
└── tool-palette.js               (Context-aware tool generator)
```

## Use Across Apps

This appling is designed to work in:
- **Weblings** (Apex, Gaia, Summit, Velvet)
- **Hub** (content editing)
- **CodeGnosis** (documentation editing)
- Any other app with editable content

Just copy the files and configure for your app's editable elements.
