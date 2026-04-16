import { MagnifyingGlass } from './lens-ui.js';
import ElementDetector from './elementDetector.js';
import { ToolPalette } from './tool-palette.js';

export default class MagnifyingGlassInspector {
    constructor() {
        this.isActive = false;
        this.editsKey = 'velvet-edits-state';
        this.debug = false;

        // Drag state
        this.dragState = {
            isDragging: false,
            target: null,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0
        };

        // Highlight state
        this.highlightedElement = null;
        this.contextBar = this._initContextBar();
        this.hintTimer = null;
        this.isPreviewMode = false;
        this.reticleZ = 0; // Depth Probe Value

        // 1. HARD PURGE: Clear any 'undefined' strings from the lattice immediately
        this._purgePoisonedEdits();
        this.edits = this.loadEdits();

        this.lens = new MagnifyingGlass();
        this.detector = new ElementDetector({
            throttle: 80,
            ignoredSelectors: [
                '[data-anothen-internal]', '.lens-container', '#palette-container', '#edit-mode-btn', '#apex-context-bar', '.depth-map-overlay',
                'script', 'style', 'canvas', 'svg', '.grid-lines', '.cyber-grid', '.stars', '.aura-bg', '.breathing-bg', '.scanline'
            ]
        }); // Sharper tracking
        this.palette = new ToolPalette();
        this.palette.debug = this.debug;

        this.detector.onDetect = (data) => {
            if (!this.isActive || this.isPreviewMode) return;

            // ... (searching logic remains)

            // 4. STABILITY LOCK: If we are already highlighting this specific node, STOP.
            if (this.highlightedElement === data.element) return;

            this.lens.setSearching(false);
            
            // RED DOT LOGIC: Only show over dark colors for high-precision targeting
            const isDark = this._isColorDark(data.styles.backgroundColor);
            this.lens.setCenterDot(isDark);

            // Start hint timer if we found something new
            if (this.highlightedElement !== data.element) {
                this._startHintTimer();
            }

            if (this.debug) {
                const tag = data?.element?.tagName || 'UNKNOWN';
                console.log('[APEX][detect]', tag, data?.selector || '(no-selector)', data?.textContent || '(no-text)');
            }

            // 2. DETECTOR SHIELD: Drop junk, but ALLOW empty text if it's a media/structural role
            const isMediaOrStructure = data.role === 'media' || data.role === 'structure';
            if (!isMediaOrStructure && (!data.textContent || data.textContent === 'undefined' || data.textContent === 'null' || data.textContent === '✏️ EDIT')) {
                return;
            }

            this.highlightElement(data.element);
            this.palette.update(data);
            this.palette.show();
            if (this.palette.depthMapActive) {
                this.visualizeDepth(data.element, this.reticleZ);
            }
        };

        this.palette.onEdit = (property, value) => {
            // 3. PALETTE SHIELD: Absolute refusal of 'undefined' or empty-junk
            if (value === undefined || value === null || String(value) === 'undefined' || String(value) === 'null') {
                console.warn('[APEX] Blocked attempt to save undefined state:', property);
                return;
            }

            if (property === 'depthMap') {
                value ? this.visualizeDepth(this.palette.currentElement, this.reticleZ) : this.clearDepthMap();
                return;
            }
            if (property === 'view3D') {
                value ? this.activate3DView() : this.deactivate3DView();
                return;
            }
            if (property === 'toggleLabels') {
                value ? this.showLatticeLabels() : this.clearLatticeLabels();
                return;
            }
            
            if (this.palette.currentElement) {
                this.applyEdit(this.palette.currentElement, property, value);
            }
        };

        // GLOBAL MOUSE TRACKING
        document.addEventListener('mousemove', (e) => {
            if (!this.isActive) return;

            // PERFORMANCE: Only update aesthetics if theme attribute changes, not every frame
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            if (this.lastTheme !== currentTheme) {
                this._updateThemeAesthetics();
                this.lastTheme = currentTheme;
            }

            const isOverPalette = this.palette.container.contains(e.target);
            if (!e.shiftKey && !this.dragState.isDragging && !isOverPalette) {
                this.lens.moveTo(e.clientX, e.clientY);
                this.detector.detect(e.clientX, e.clientY);
            }

            if (isOverPalette || e.shiftKey) {
                this._setCustomCursor();
                this.lens.lensContainer.style.opacity = e.shiftKey ? '1' : '0.1'; 
            } else {
                document.body.style.cursor = 'none';
                this.lens.lensContainer.style.opacity = '1';
            }
        });

        // DEPTH PROBE SCROLLING
        document.addEventListener('wheel', (e) => {
            if (!this.isActive || !this.palette.depthMapActive || this.isPreviewMode) return;
            
            // Only scroll depth if hovering main viewport or lens
            const isOverPalette = this.palette.container.contains(e.target);
            if (isOverPalette) return;

            e.preventDefault();
            const delta = e.deltaY > 0 ? -1 : 1;
            this.reticleZ += delta;
            
            // Update UI and Map
            this.lens.setProbe(true, this.reticleZ);
            this.visualizeDepth(this.highlightedElement, this.reticleZ);
        }, { passive: false });

        // GLOBAL KEY TRACKING (Delete/Structural shortcuts)
        document.addEventListener('keydown', (e) => {
            if (!this.isActive || this.isPreviewMode) return;

            // Handle Delete key
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.highlightedElement) {
                // Ensure we aren't typing in an input
                if (e.target.closest('input, textarea, .ql-editor')) return;

                e.preventDefault();
                if (confirm('Delete this element?')) {
                    this.applyEdit(this.highlightedElement, 'delete', true);
                    this._clearHighlight();
                    this.palette.hide();
                }
            }
        });

        this.applyAllSavedEdits();
        this.deactivate();
    }

    _updateThemeAesthetics() {
        const isLight = document.body.getAttribute('data-theme') === 'light';
        
        // THEMES: ANOTHEN (Dark) vs BEDROCK (Light)
        const primary = isLight ? '#d4af37' : '#00ff00'; // Gold vs Neon Green
        const secondary = isLight ? '#003366' : '#00ffff'; // Navy vs Cyan
        const bg = isLight ? 'rgba(255, 253, 240, 0.95)' : 'rgba(5, 5, 5, 0.95)';
        
        // Lens Aesthetics
        this.lens.lensContainer.style.borderColor = primary;
        this.lens.lensContainer.style.boxShadow = `0 0 40px ${primary}55, inset 0 0 20px ${primary}22`;
        this.lens.lensContainer.style.background = isLight ? 'rgba(212, 175, 55, 0.05)' : 'rgba(0, 255, 0, 0.05)';
        
        const hairs = this.lens.lensContainer.querySelectorAll('div');
        hairs.forEach(h => h.style.background = isLight ? secondary : primary);

        // Palette Aesthetics (Utterly Different)
        const pContainer = this.palette.container;
        pContainer.style.background = bg;
        pContainer.style.borderColor = primary;
        pContainer.style.color = isLight ? '#1a1a1a' : '#00ff00';
        pContainer.style.boxShadow = isLight ? '0 20px 50px rgba(0,0,0,0.1)' : `0 0 50px ${primary}22`;
        
        // Force header colors in the palette
        const pHeader = pContainer.querySelector('.palette-header');
        if (pHeader) {
            pHeader.style.borderBottomColor = isLight ? '#e5e7eb' : '#00ff0033';
            pHeader.style.color = isLight ? '#003366' : '#00ff00';
        }
    }

    _setCustomCursor() {
        const isLight = document.body.getAttribute('data-theme') === 'light';
        const fill = isLight ? '#d4af37' : '#00ff00';
        const stroke = isLight ? '#003366' : '#006400';
        
        document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="${fill.replace('#', '%23')}" stroke="${stroke.replace('#', '%23')}" stroke-width="2.5"/></svg>') 16 16, auto`;
    }

    _purgePoisonedEdits() {
        const saved = localStorage.getItem(this.editsKey);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                let cleaned = false;
                for (const selector in data) {
                    for (const prop in data[selector]) {
                        const val = String(data[selector][prop]);
                        if (val === 'undefined' || val === 'null' || !val || val === '✏️ EDIT') {
                            delete data[selector][prop];
                            cleaned = true;
                        }
                    }
                    if (Object.keys(data[selector]).length === 0) delete data[selector];
                }
                if (cleaned) localStorage.setItem(this.editsKey, JSON.stringify(data));
            } catch (e) {
                localStorage.removeItem(this.editsKey);
            }
        }
    }

    activate(e) {
        this.isActive = true;
        this.lens.show();
        
        // Hide site's native cursor if it exists
        const nativeCursor = document.getElementById('cursor');
        if (nativeCursor) nativeCursor.style.display = 'none';
        
        // Immediate UI feedback
        this.palette.showStandby();
        
        if (e && e.clientX !== undefined) {
            this.lens.moveTo(e.clientX, e.clientY);
            this.detector.detect(e.clientX, e.clientY);
        }

        // Preview Mode Toggle Listener
        const previewBtn = document.getElementById('btn-preview-mode');
        if (previewBtn) {
            previewBtn.onclick = () => this.togglePreviewMode();
        }

        // Palette dragging still works because it's interactive
        this.palette.container.addEventListener('mousedown', (e) => this._startDrag(e, this.palette.container));
        document.addEventListener('mousemove', (e) => this._continueDrag(e));
        document.addEventListener('mouseup', () => this._endDrag());
    }

    togglePreviewMode() {
        this.isPreviewMode = !this.isPreviewMode;
        const btn = document.getElementById('btn-preview-mode');
        
        if (this.isPreviewMode) {
            this.lens.hide();
            this.contextBar.classList.add('hidden');
            this._clearHighlight();
            if (btn) btn.innerText = 'EXIT PREVIEW';
            document.body.classList.remove('edit-mode');
            document.body.style.cursor = 'default';
        } else {
            this.lens.show();
            if (btn) btn.innerText = 'PREVIEW';
            document.body.classList.add('edit-mode');
        }
    }

    _startHintTimer() {
        this._clearHintTimer();
        this.hintTimer = setTimeout(() => {
            if (this.isActive && this.highlightedElement && !this.isPreviewMode) {
                const bar = this.contextBar;
                const originalHTML = bar.innerHTML;
                bar.innerHTML = `
                    <span class="context-tag">Ritual</span>
                    <div class="w-[1px] h-3 bg-black/20 mx-1"></div>
                    <span class="animate-pulse">HOLD SHIFT TO LOCK YOUR GAZE</span>
                `;
                setTimeout(() => {
                    if (this.isActive && this.contextBar === bar) {
                        bar.innerHTML = originalHTML;
                        // Restore tag if it changed
                        const tag = this.highlightedElement?.tagName.toLowerCase();
                        if (tag) bar.querySelector('.context-tag').innerText = tag;
                    }
                }, 3000);
            }
        }, 1500);
    }

    _clearHintTimer() {
        if (this.hintTimer) {
            clearTimeout(this.hintTimer);
            this.hintTimer = null;
        }
    }

    deactivate() {
        this.isActive = false;
        this.lens.hide();
        this.palette.hide();
        this.clearDepthMap();
        document.body.style.cursor = 'default';
        this._clearHighlight();

        // Restore site's native cursor if it exists
        const nativeCursor = document.getElementById('cursor');
        if (nativeCursor) nativeCursor.style.display = 'block';
    }

    _initContextBar() {
        let bar = document.getElementById('apex-context-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'apex-context-bar';
            bar.className = 'hidden';
            bar.innerHTML = `
                <span class="context-tag"></span>
                <div class="w-[1px] h-3 bg-black/20 mx-1"></div>
                <span class="opacity-70">LATTICE ACTIVE</span>
            `;
            document.body.appendChild(bar);
        }
        return bar;
    }

    updateContextBar(el) {
        if (!el || !this.isActive) {
            this.contextBar.classList.add('hidden');
            return;
        }

        const rect = el.getBoundingClientRect();
        const tag = el.tagName.toLowerCase();
        
        // Check if element is locked
        const isLocked = el.dataset.axLocked === 'true' || el.closest('[data-ax-locked="true"]');

        this.contextBar.innerHTML = `
            <span class="context-tag">${tag}</span>
            <div class="w-[1px] h-3 bg-black/20 mx-1"></div>
            ${isLocked ? '<span class="opacity-50 text-[8px]">LOCKED</span>' : '<span class="text-red-700 opacity-80 animate-pulse">PRESS DEL TO REMOVE</span>'}
        `;
        
        this.contextBar.classList.remove('hidden');

        // Position at top-left of element, accounting for scroll
        const top = rect.top + window.scrollY;
        const left = rect.left + window.scrollX;

        // Offset bar so it sits ON the top border
        this.contextBar.style.top = (rect.top - 20) + 'px';
        this.contextBar.style.left = rect.left + 'px';
    }

    _clearHighlight() {
        if (this.highlightedElement) {
            this.highlightedElement.classList.remove('apex-highlighted');
            this.highlightedElement.classList.remove('apex-danger-target');
            this.highlightedElement = null;
        }
        document.body.classList.remove('apex-grayscale-mode');
    }

    toggle() { this.isActive ? this.deactivate() : this.activate(); }

    highlightElement(el) {
        // Remove previous highlight
        if (this.highlightedElement && this.highlightedElement !== el) {
            this.highlightedElement.classList.remove('apex-highlighted');
            this.highlightedElement.classList.remove('apex-danger-target');
        }

        // Add highlight to new element
        el.classList.add('apex-highlighted');
        
        // Add danger class if not locked
        const isLocked = el.dataset.axLocked === 'true' || el.closest('[data-ax-locked="true"]');
        if (!isLocked) {
            el.classList.add('apex-danger-target');
        }

        this.highlightedElement = el;
    }

    enterEditMode(el) {
        // Called when actually clicking to edit - applies grayscale
        document.body.classList.add('apex-grayscale-mode');
    }

    _initializeDrag() {
        // Obsolete - dragging now handled in activate
    }

    _cleanupDrag() {
        // Obsolete
    }

    _startDrag(e, target) {
        if (e.button !== 0) return; // Only left-click
        
        // Allow interaction with inputs and editor
        const isInteractive = e.target.closest('input, textarea, select, .ql-editor, button');
        if (isInteractive) return;

        e.preventDefault();
        this.dragState.isDragging = true;
        this.dragState.target = target;
        this.dragState.startX = e.clientX;
        this.dragState.startY = e.clientY;

        const rect = target.getBoundingClientRect();
        this.dragState.offsetX = rect.left;
        this.dragState.offsetY = rect.top;

        target.style.cursor = 'grabbing';
    }

    _continueDrag(e) {
        if (!this.dragState.isDragging || !this.dragState.target) return;

        const deltaX = e.clientX - this.dragState.startX;
        const deltaY = e.clientY - this.dragState.startY;

        const newX = this.dragState.offsetX + deltaX;
        const newY = this.dragState.offsetY + deltaY;

        this.dragState.target.style.position = 'fixed';
        this.dragState.target.style.left = newX + 'px';
        this.dragState.target.style.top = newY + 'px';
        this.dragState.target.style.right = 'auto';
        this.dragState.target.style.bottom = 'auto';
    }

    _endDrag() {
        if (this.dragState.target) {
            this.dragState.target.style.cursor = 'grab';
        }
        this.dragState.isDragging = false;
        this.dragState.target = null;
    }

    applyEdit(el, property, value) {
        // 4. EXECUTION SHIELD: Final check before touching DOM
        if (value === undefined || value === null || String(value) === 'undefined' || String(value) === 'null') return;
        
        const selector = this.detector.getUniqueSelector(el);
        if (!selector) return;

        if (property === 'clone') {
            const clone = el.cloneNode(true);
            delete clone.dataset.axId; // Reset ID so it gets a new one
            el.parentNode.insertBefore(clone, el.nextSibling);
            this.detector.initLattice();
            return;
        }

        if (property === 'moveUp') {
            const prev = el.previousElementSibling;
            if (prev) {
                el.parentNode.insertBefore(el, prev);
            }
            return;
        }

        if (property === 'moveDown') {
            const next = el.nextElementSibling;
            if (next) {
                el.parentNode.insertBefore(next, el);
            }
            return;
        }

        if (property === 'delete') {
            el.remove();
            if (!this.edits[selector]) this.edits[selector] = {};
            this.edits[selector]['deleted'] = true;
            this.saveEdits();
            return;
        }

        if (property === 'textContent') {
            el.textContent = value;
        } else if (property === 'innerHTML') {
            el.innerHTML = value;
        } else if (property === 'zIndex') {
            const currentPos = window.getComputedStyle(el).position;
            const newPos = currentPos === 'static' ? 'relative' : currentPos;
            el.style.position = newPos;
            el.style.zIndex = value;

            // 5. STORAGE SHIELD: Save both zIndex AND position so it persists on reload
            if (!this.edits[selector]) this.edits[selector] = {};
            this.edits[selector]['zIndex'] = value;
            this.edits[selector]['position'] = newPos;
            this.saveEdits();
            return;
        } else {
            el.style[property] = value;
        }

        // 5. STORAGE SHIELD: Only save valid data
        if (!this.edits[selector]) this.edits[selector] = {};
        this.edits[selector][property] = value;
        this.saveEdits();
    }

    visualizeDepth(targetEl, probeZ = 0) {
        this.clearDepthMap();
        if (!this.isActive) return;
        
        // Show the yellow probe on the lens
        this.lens.setProbe(true, probeZ);

        const targetZ = targetEl ? (parseInt(window.getComputedStyle(targetEl).zIndex) || 0) : 0;
        const siblings = Array.from(document.querySelectorAll('body > *:not(script):not(.depth-map-overlay):not(.lens-container):not(#palette-container):not(#apex-context-bar):not([data-anothen-internal])'));
        
        // Add Map Legend
        const legend = document.createElement('div');
        legend.className = 'depth-map-overlay';
        legend.style.cssText = `
            position: fixed; bottom: 80px; left: 24px; padding: 12px;
            background: rgba(0,0,0,0.8); border: 1px solid #fbbf24;
            color: #fbbf24; font-family: monospace; font-size: 9px;
            z-index: 19997; border-radius: 2px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;
        legend.innerHTML = `
            <div class="font-bold mb-2 uppercase tracking-widest text-[10px]">Topographic Map</div>
            <div class="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-[#fbbf24]/20">
                <span class="opacity-70">Probe Depth</span>
                <span class="text-white font-bold text-[11px]">Z: ${probeZ}</span>
            </div>
            <div class="flex items-center gap-2 mb-1"><div class="w-2 h-2 bg-red-500/50 border border-red-500"></div> ABOVE PROBE</div>
            <div class="flex items-center gap-2 mb-1"><div class="w-2 h-2 bg-white/10 border border-white/30"></div> SAME AS PROBE</div>
            <div class="flex items-center gap-2 mb-3"><div class="w-2 h-2 bg-blue-500/50 border border-blue-500"></div> BELOW PROBE</div>
            <div class="text-[8px] opacity-40 uppercase italic mt-1">Scroll to raise/lower probe</div>
        `;
        document.body.appendChild(legend);

        siblings.forEach(el => {
            const z = parseInt(window.getComputedStyle(el).zIndex) || 0;
            const diff = z - probeZ;
            
            const overlay = document.createElement('div');
            overlay.className = 'depth-map-overlay';
            let color = 'rgba(255, 255, 255, 0.1)';
            let borderColor = 'rgba(255, 255, 255, 0.3)';
            if (z > probeZ) {
                color = 'rgba(239, 68, 68, 0.4)';
                borderColor = 'rgba(239, 68, 68, 0.8)';
            } else if (z < probeZ) {
                color = 'rgba(59, 130, 246, 0.4)';
                borderColor = 'rgba(59, 130, 246, 0.8)';
            }
            
            const rect = el.getBoundingClientRect();
            if (rect.width < 5 || rect.height < 5) return; // Skip tiny elements

            overlay.style.cssText = `position:fixed; top:${rect.top}px; left:${rect.left}px; width:${rect.width}px; height:${rect.height}px; background:${color}; pointer-events:none; z-index:19997; border:1px solid ${borderColor}; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:monospace; font-size:9px; color:white; font-weight:bold; text-shadow:0 1px 2px black;`;
            overlay.innerHTML = `
                <div>Z:${z}</div>
                <div class="text-[7px] opacity-70">${diff > 0 ? '+' : ''}${diff}</div>
            `;
            document.body.appendChild(overlay);
        });
    }

    activate3DView() {
        document.body.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
        document.body.style.perspective = '2500px';
        document.body.style.transform = 'rotateX(25deg) rotateY(-15deg) scale(0.8)';
        document.body.style.transformStyle = 'preserve-3d';
        document.querySelectorAll('[data-ax-id]').forEach(el => {
            const z = parseInt(window.getComputedStyle(el).zIndex) || 0;
            el.style.transform = `translateZ(${z * 30}px)`;
            el.style.transition = 'transform 0.6s ease';
            if (z > 0) el.style.boxShadow = `0 15px 40px rgba(0,0,0,0.6)`;
        });
    }

    deactivate3DView() {
        document.body.style.transform = '';
        document.querySelectorAll('[data-ax-id]').forEach(el => {
            el.style.transform = '';
            el.style.boxShadow = '';
        });
    }

    clearDepthMap() {
        document.querySelectorAll('.depth-map-overlay').forEach(el => el.remove());
        if (this.lens) this.lens.setProbe(false);
    }

    _isColorDark(color) {
        if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true; // Assume dark background
        const rgb = color.match(/\d+/g);
        if (!rgb) return true;
        const [r, g, b] = rgb.map(Number);
        // HSP Color Model brightness formula
        const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
        return hsp < 127.5;
    }

    showLatticeLabels() {
        this.clearLatticeLabels();
        
        // Scan for all potential elements, not just those already tagged
        const elements = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div,button,a,img,section,header,footer');
        elements.forEach((el, index) => {
            if (el.dataset.anothenInternal !== undefined || el.closest('[data-anothen-internal]')) return;
            
            const rect = el.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 10) return;
            if (rect.top < 0 || rect.top > window.innerHeight) return;

            const tag = el.tagName.toLowerCase();
            const className = el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : '';
            const labelText = `${tag}${className ? '.' + className.substring(0, 8) : ''}`;

            const label = document.createElement('div');
            label.className = 'lattice-label-overlay';
            label.setAttribute('data-anothen-internal', '');
            label.style.cssText = `
                position: fixed; top: ${rect.top}px; left: ${rect.left}px;
                background: #00ff00; color: #000; font-family: monospace;
                font-size: 7px; font-weight: bold; padding: 1px 2px;
                border-radius: 1px; z-index: 19996; pointer-events: none;
                box-shadow: 0 0 5px rgba(0,255,0,0.4); transform: translateY(-100%);
                white-space: nowrap; opacity: 0.9; border-bottom: 1px solid rgba(0,0,0,0.2);
            `;
            label.innerText = labelText;
            document.body.appendChild(label);
        });
    }

    clearLatticeLabels() {
        document.querySelectorAll('.lattice-label-overlay').forEach(el => el.remove());
    }

    saveEdits() { localStorage.setItem(this.editsKey, JSON.stringify(this.edits)); }
    loadEdits() { const saved = localStorage.getItem(this.editsKey); return saved ? JSON.parse(saved) : {}; }
    applyAllSavedEdits() {
        const data = this.loadEdits();
        for (const selector in data) {
            const el = document.querySelector(selector);
            if (el) {
                const props = data[selector];
                if (props.deleted) { el.remove(); continue; }
                for (const prop in props) {
                    const val = props[prop];
                    if (val === undefined || val === null || String(val) === 'undefined' || String(val) === 'null') continue;
                    
                    if (prop === 'textContent') el.textContent = val;
                    else if (prop === 'innerHTML') el.innerHTML = val;
                    else el.style[prop] = val;
                }
            }
        }
    }
}