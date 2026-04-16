# Apex - Corporate Excellence

**For:** Startups, Consultants, Tech Leaders

Precision is power. The shortest path is the one you build yourself. Ultra-clean, perfectly aligned, no drift.

## Philosophy
"Crisp sans-serif, white/black/electric blue, perfectly aligned grid. For those who know clarity is luxury."

## Features
- Ultra-clean layout
- Inter sans-serif (professional)
- Electric blue accents
- Perfect grid alignment
- Sharp lines, no drift
- Startup/corporate polish

## Audience
Tech startups, management consultants, SaaS companies, corporate executives, strategy firms

## Pricing
$10 (additional webling purchase)

---

*Made with love. Made to last.*

---

## 3D Mode Features (Exploration & Visualization)

### Overview
3D mode provides a volumetric visualization of page layers, showing all elements in an "exploded view" where each element is positioned at a distance based on its z-index. This allows designers and developers to understand and debug complex layering without modifying z-indices.

### Implemented Features

**Activation:**
- Click "✏️ EDIT" button in nav to enter edit mode
- 3D mode activates automatically when lens/palette are visible
- Rotation and layer spacing controls in floating toolbar

**Visualization:**
- **Exploded 3D View:** Elements arranged in 3D space using `translateZ()` based on z-index value
- **Dynamic Layer Spacing:** Adjustable distance between layers (default: 50px)
- **Fixed 3D Rotation:** rotateX(35deg) rotateY(-25deg) scale(0.8) - stable perspective
- **Color-Coded Layering:** Visual separation shows hierarchy at a glance
- **Lens Stays Locked:** Green reticle centers on selected element during 3D mode

**Controls (Toolbar at top center):**
- **← / → Buttons:** Move element up/down in layer stack (disabled in view-only mode)
- **Rotation Slider:** Control 3D perspective intensity (0-100%, deferred for v2)
- **Layer Spacing Slider:** Adjust visual distance between layers (10-150px)
- **Exit Button:** Return to 2D mode

**Safety Features:**
- Lockdown overlay prevents accidental clicks on page elements
- Nav buttons disabled during edit sessions (handlers restored on exit)
- Save/Cancel workflow for palette edits (palette-focused editing)
- Boot overlay hidden cleanly with CSS (no DOM reflow)
- All pointer-events properly cascaded during mode transitions

### Features NOT Implemented (v2 backlog)
- Parallax effect on layers
- Rotation angle control (slider created, logic deferred)
- Layer label numbering (only position shown)
- "Expanding Title Effect" on reveal circle

### Architecture
- **3D Transform:** Standard CSS 3D perspective with preserve-3d
- **Lens Interface:** Circular 300px reticle, fixed z-index: 19999
- **Layer Detection:** Element Detector scans DOM, ignores internal UI elements
- **State Persistence:** Edits stored in localStorage with lattice ID (data-ax-id)

### Known Behaviors
- Header does NOT jump (boot-overlay DOM removal fixed with display:none)
- Nav buttons blocked during edit (inline onclick handlers disabled/restored)
- 3D rotation is fixed perspective (not user-controllable, planned for v2)
- Z-index changes NOT persisted (visual only, user cannot modify z-order)
- Scale on exit: 0.8 (smaller view, prevents "too large" feeling)

### Strategic Insight
The 3D visualization mode proves the concept: a webling could be ENTIRELY built through 3D mode as a primary interaction paradigm. Rather than editing individual elements, users could build entire page layouts by positioning elements in 3D space, then export cleaned code. This is "Volumetric Page Builder" - future exploration opportunity.
