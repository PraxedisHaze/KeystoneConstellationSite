export class ToolPalette {
    constructor() {
        this.container = document.getElementById('palette-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'palette-container';
            this.container.setAttribute('data-anothen-internal', '');
            this.container.className = 'fixed bottom-6 right-6 w-96 bg-zinc-900 border-2 border-[var(--accent)] rounded-sm shadow-2xl z-[20000] hidden max-h-[600px] overflow-y-auto text-white p-6';
            
            this.contentArea = document.createElement('div');
            this.contentArea.id = 'palette-content';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors';
            closeBtn.innerHTML = '✕';
            closeBtn.onclick = () => window.toggleEditMode();
            
            this.container.appendChild(closeBtn);
            this.container.appendChild(this.contentArea);
            document.body.appendChild(this.container);
        } else {
            this.contentArea = document.getElementById('palette-content');
        }
        this.onEdit = null; 
        this.quill = null;
        this.currentElement = null;
        this.depthMapActive = false;
        this.view3DActive = false;
        this.labelsActive = false;
        this.debug = false;
    }

    update(data) {
        this.lastData = data;
        const { selector, styles, textContent, element, role } = data;
        const isStructural = role === 'structure';
        const isMedia = role === 'media';

        if (this.debug) {
            console.log('[APEX][palette.update]', role, selector || '(no-selector)', textContent || '(no-text)');
        }
        
        if (this.currentElement && this.currentElement.dataset.axId === element.dataset.axId) {
            return;
        }

        this.currentElement = element;
        this.container.classList.remove('hidden');

        // LATTICE FLOW DETECTION (Horizontal vs Vertical intuition)
        const parent = element.parentElement;
        const parentStyle = window.getComputedStyle(parent);
        const isHorizontal = parentStyle.display === 'flex' && parentStyle.flexDirection === 'row' || 
                             parentStyle.display === 'inline-flex' ||
                             styles.display === 'inline' || styles.display === 'inline-block';

        const isLocked = element.dataset.axLocked === 'true' || element.closest('[data-ax-locked="true"]');
        const tagName = element.tagName.toUpperCase();

        const childCount = element.children.length;
        const currentOpacity = styles.opacity || '1';

        this.contentArea.innerHTML = `
            <div class="tool-palette">
                <!-- SIMPLE HEADER -->
                <div class="palette-header">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"></div>
                        <span class="palette-title font-mono text-xs tracking-tighter">${tagName} <span class="text-[8px] opacity-40">[${role.toUpperCase()}]</span></span>
                    </div>
                    <button id="btn-advanced-toggle" class="text-[9px] font-bold text-zinc-500 hover:text-[var(--accent)] uppercase tracking-widest transition-colors">
                        Advanced +
                    </button>
                </div>

                <!-- 3D EXIT BUTTON (Global ritualistic exit) -->
                ${this.view3DActive ? `
                <button id="btn-exit-3d" class="w-full mb-4 py-3 bg-red-600 text-white text-[10px] font-bold rounded-sm animate-pulse hover:bg-red-500 transition-all uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    Exit 3D Matrix
                </button>
                ` : ''}

                <!-- ADVANCED PANEL (Hidden by default) -->
                <div id="advanced-panel" class="hidden mb-4 p-3 bg-black/40 border border-zinc-800 rounded-sm">
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="palette-control">
                            <label class="palette-label text-[9px]">Lattice ID</label>
                            <div class="font-mono text-[9px] text-[var(--accent)] opacity-60">${element.dataset.axId}</div>
                        </div>
                        <div class="palette-control">
                            <label class="palette-label text-[9px]">Children</label>
                            <div class="font-mono text-[9px] text-zinc-400">${childCount} nodes</div>
                        </div>
                    </div>

                    <div class="palette-control mb-4">
                        <label class="palette-label text-[9px]">Selector</label>
                        <div class="font-mono text-[10px] text-zinc-400 break-all bg-black/20 p-2 mt-1 border border-zinc-800/50">${selector}</div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="palette-control">
                            <label class="palette-label text-[9px]">Opacity</label>
                            <input type="range" id="input-opacity" min="0" max="1" step="0.1" value="${currentOpacity}" class="w-full accent-[var(--accent)]">
                        </div>
                        <div class="palette-control">
                            <label class="palette-label text-[9px]">Scale</label>
                            <input type="range" id="input-scale" min="0.5" max="2" step="0.1" value="1" class="w-full accent-[var(--accent)]">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 mt-3">
                        <div class="palette-control">
                            <label class="palette-label text-[9px]">Margin</label>
                            <input type="text" id="input-margin" class="palette-input text-[10px]" value="${styles.margin}" placeholder="e.g. 20px">
                        </div>
                        <div class="palette-control">
                            <label class="palette-label text-[9px]">Padding</label>
                            <input type="text" id="input-padding" class="palette-input text-[10px]" value="${styles.padding}" placeholder="e.g. 10px">
                        </div>
                    </div>
                </div>

                <!-- MAIN CONTROLS -->
                <div class="palette-control ${(isStructural || isMedia) ? 'opacity-30 pointer-events-none' : ''}">
                    <label class="palette-label">Content ${isStructural ? '(Container)' : (isMedia ? '(Media)' : '')}</label>
                    <div id="quill-editor" class="bg-zinc-900 text-white" style="height: 100px;"></div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-4 ${isMedia ? 'opacity-30 pointer-events-none' : ''}">
                    <div class="palette-control">
                        <label class="palette-label">Color</label>
                        <div class="palette-color-group">
                            <input type="color" id="input-color" class="palette-input--color" value="${this.rgbToHex(styles.color)}">
                            <input type="text" id="hex-color" class="palette-input palette-input--hex font-mono text-[11px]" value="${this.rgbToHex(styles.color)}">
                        </div>
                    </div>
                    <div class="palette-control">
                        <label class="palette-label">Depth (Z)</label>
                        <input type="number" id="input-zindex" class="palette-input" value="${styles.zIndex || 0}">
                    </div>
                </div>

                <div class="palette-control mt-4">
                    <label class="palette-label">Typography</label>
                    <select id="input-font" class="palette-input palette-input--select">
                        <option value="Inter" ${styles.fontFamily.includes('Inter') ? 'selected' : ''}>Inter</option>
                        <option value="JetBrains Mono" ${styles.fontFamily.includes('Mono') ? 'selected' : ''}>JetBrains Mono</option>
                        <option value="serif" ${styles.fontFamily.includes('serif') ? 'selected' : ''}>Serif</option>
                    </select>
                </div>

                <div class="mt-4 flex items-center justify-between bg-zinc-800/50 p-3 rounded-sm border border-zinc-700/50">
                    <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Visualizers</span>
                    <div class="flex gap-2">
                        <button id="toggle-labels" class="px-2 py-1 ${this.labelsActive ? 'bg-green-600' : 'bg-zinc-700'} text-white text-[9px] font-bold rounded-sm transition-colors uppercase">
                            Labels
                        </button>
                        <button id="toggle-depth-map" class="px-2 py-1 ${this.depthMapActive ? 'bg-blue-600' : 'bg-zinc-700'} text-white text-[9px] font-bold rounded-sm transition-colors uppercase">
                            Map
                        </button>
                        <button id="toggle-3d-view" class="px-2 py-1 ${this.view3DActive ? 'bg-indigo-600' : 'bg-zinc-700'} text-white text-[9px] font-bold rounded-sm transition-colors uppercase">
                            3D
                        </button>
                    </div>
                </div>

                <div class="palette-control mt-6 pt-4 border-t border-zinc-800">
                    <label class="palette-label text-[9px] mb-3">Structure & Hierarchy</label>
                    <div class="grid grid-cols-4 gap-2">
                        <button id="btn-move-up" title="${isHorizontal ? 'Move Left' : 'Move Up'}" class="flex items-center justify-center p-2 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition ${isLocked ? 'opacity-30' : ''}" ${isLocked ? 'disabled' : ''}>
                            ${isHorizontal ? 
                                `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>` : 
                                `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`
                            }
                        </button>
                        <button id="btn-move-down" title="${isHorizontal ? 'Move Right' : 'Move Down'}" class="flex items-center justify-center p-2 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition ${isLocked ? 'opacity-30' : ''}" ${isLocked ? 'disabled' : ''}>
                            ${isHorizontal ? 
                                `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>` : 
                                `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`
                            }
                        </button>
                        <button id="btn-clone" title="Clone Element" class="flex items-center justify-center p-2 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition ${isLocked ? 'opacity-30' : ''}" ${isLocked ? 'disabled' : ''}>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                        </button>
                        <button id="btn-delete" title="Delete Element" class="flex items-center justify-center p-2 bg-red-900/20 text-red-500/70 rounded hover:bg-red-900/40 transition ${isLocked ? 'opacity-30' : ''}" ${isLocked ? 'disabled' : ''}>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.initQuill(textContent);
        this.attachListeners();
    }

    initQuill(content) {
        if (this.debug && typeof Quill === 'undefined') {
            console.warn('[APEX][palette] Quill is undefined - editor cannot initialize.');
        }
        this.quill = new Quill('#quill-editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }],
                    ['clean']
                ]
            }
        });
        
        // Prevent Quill from triggering an 'onEdit' during initialization
        this.quill.root.innerText = content || '';
        
        this.quill.on('text-change', (delta, oldDelta, source) => {
            // Only trigger edit if the user made the change
            if (source === 'user') {
                if (this.onEdit) this.onEdit('textContent', this.quill.getText().trim());
            }
        });
    }

    attachListeners() {
        const colorInput = document.getElementById('input-color');
        const hexInput = document.getElementById('hex-color');
        const zInput = document.getElementById('input-zindex');
        const fontSelect = document.getElementById('input-font');
        const depthToggle = document.getElementById('toggle-depth-map');
        const view3DToggle = document.getElementById('toggle-3d-view');
        const labelsToggle = document.getElementById('toggle-labels');
        const advancedToggle = document.getElementById('btn-advanced-toggle');
        const advancedPanel = document.getElementById('advanced-panel');
        const moveUpBtn = document.getElementById('btn-move-up');
        const moveDownBtn = document.getElementById('btn-move-down');
        const cloneBtn = document.getElementById('btn-clone');
        const deleteBtn = document.getElementById('btn-delete');
        const exit3DBtn = document.getElementById('btn-exit-3d');
        
        // Advanced Controls
        const opacityInput = document.getElementById('input-opacity');
        const scaleInput = document.getElementById('input-scale');
        const marginInput = document.getElementById('input-margin');
        const paddingInput = document.getElementById('input-padding');

        if (exit3DBtn) {
            exit3DBtn.onclick = () => {
                this.view3DActive = false;
                if (this.onEdit) this.onEdit('view3D', false);
                // Clean re-render using last known state
                if (this.lastData) this.update(this.lastData);
            };
        }

        if (opacityInput) {
            opacityInput.oninput = (e) => { if (this.onEdit) this.onEdit('opacity', e.target.value); };
        }
        if (scaleInput) {
            scaleInput.oninput = (e) => { if (this.onEdit) this.onEdit('transform', `scale(${e.target.value})`); };
        }
        if (marginInput) {
            marginInput.oninput = (e) => { 
                let val = e.target.value;
                if (val && !isNaN(val)) val += 'px';
                if (this.onEdit) this.onEdit('margin', val); 
            };
        }
        if (paddingInput) {
            paddingInput.oninput = (e) => { 
                let val = e.target.value;
                if (val && !isNaN(val)) val += 'px';
                if (this.onEdit) this.onEdit('padding', val); 
            };
        }

        if (advancedToggle && advancedPanel) {
            advancedToggle.onclick = () => {
                const isHidden = advancedPanel.classList.toggle('hidden');
                advancedToggle.innerText = isHidden ? 'Advanced +' : 'Advanced -';
            };
        }

        if (moveUpBtn && !moveUpBtn.disabled) {
            moveUpBtn.onclick = () => { if (this.onEdit) this.onEdit('moveUp', this.currentElement); };
        }

        if (moveDownBtn && !moveDownBtn.disabled) {
            moveDownBtn.onclick = () => { if (this.onEdit) this.onEdit('moveDown', this.currentElement); };
        }

        if (colorInput) {
            colorInput.oninput = (e) => {
                hexInput.value = e.target.value;
                if (this.onEdit) this.onEdit('color', e.target.value);
            };
        }

        if (zInput) {
            zInput.oninput = (e) => {
                if (this.onEdit) this.onEdit('zIndex', e.target.value);
            };
        }

        if (fontSelect) {
            fontSelect.onchange = (e) => {
                if (this.onEdit) this.onEdit('fontFamily', e.target.value);
            };
        }

        if (labelsToggle) {
            labelsToggle.onclick = () => {
                this.labelsActive = !this.labelsActive;
                if (this.onEdit) this.onEdit('toggleLabels', this.labelsActive);
                if (this.lastData) this.update(this.lastData);
            };
        }

        if (depthToggle) {
            depthToggle.onclick = () => {
                this.depthMapActive = !this.depthMapActive;
                if (this.onEdit) this.onEdit('depthMap', this.depthMapActive);
                if (this.lastData) this.update(this.lastData);
            };
        }

        if (view3DToggle) {
            view3DToggle.onclick = () => {
                this.view3DActive = !this.view3DActive;
                if (this.onEdit) this.onEdit('view3D', this.view3DActive);
                if (this.lastData) this.update(this.lastData);
            };
        }

        if (cloneBtn && !cloneBtn.disabled) {
            cloneBtn.onclick = () => { if (this.onEdit) this.onEdit('clone', this.currentElement); };
        }
        if (deleteBtn && !deleteBtn.disabled) {
            deleteBtn.onclick = () => {
                if (confirm('Delete this element?')) {
                    if (this.onEdit) this.onEdit('delete', this.currentElement);
                    this.hide();
                }
            };
        }
    }

    rgbToHex(rgb) {
        if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
        if (rgb.startsWith('#')) return rgb;
        const match = rgb.match(/\d+/g);
        if (!match) return '#000000';
        const [r, g, b] = match;
        return "#" + ((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1);
    }

    showStandby() {
        this.container.classList.remove('hidden');
        this.contentArea.innerHTML = `
            <div class="p-12 text-center">
                <div class="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4 opacity-40"></div>
                <h4 class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">Lattice Standby</h4>
                <p class="text-[10px] text-zinc-600 leading-relaxed">Move the lens over any element<br>to begin synchronization.</p>
            </div>
        `;
    }

    show() { this.container.classList.remove('hidden'); }
    hide() { this.container.classList.add('hidden'); }
}