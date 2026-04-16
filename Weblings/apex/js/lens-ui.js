export class MagnifyingGlass {
    constructor() {
        this.lensContainer = document.createElement('div');
        this.lensContainer.className = 'lens-container';
        this.lensContainer.setAttribute('data-anothen-internal', '');
        
        // Lens is now centered on mouse, draggable by the border
        this.lensContainer.style.cssText = `
            position: fixed; width: 300px; height: 300px;
            border: 2px solid #00ff00; border-radius: 50%; z-index: 19999;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1);
            display: none; background: transparent;
            transform: translate(-50%, -50%);
            left: -1000px; top: -1000px;
            pointer-events: none;
        `;

        // Crosshairs & Center Dot (properly centered)
        const v = document.createElement('div'); v.style.cssText = 'position:absolute; top:0; bottom:0; left:50%; width:1px; background:rgba(0,255,0,0.5); transform:translateX(-50%);';
        const h = document.createElement('div'); h.style.cssText = 'position:absolute; left:0; right:0; top:50%; height:1px; background:rgba(0,255,0,0.5); transform:translateY(-50%);';
        this.centerDot = document.createElement('div');
        this.centerDot.id = 'lens-center-dot';
        this.centerDot.style.cssText = 'position:absolute; top:50%; left:50%; width:2px; height:2px; background:#ef4444; border-radius:50%; transform:translate(-50%,-50%); opacity:0; box-shadow:0 0 5px #ef4444; transition:opacity 0.2s;';

        // Depth Probe UI (Yellow Circle & Z-Label)
        this.probeDot = document.createElement('div');
        this.probeDot.style.cssText = 'position:absolute; top:50%; left:50%; width:12px; height:12px; border:2px solid #fbbf24; border-radius:50%; transform:translate(-50%,-50%); opacity:0; box-shadow:0 0 10px #fbbf24; transition:opacity 0.2s, width 0.1s, height 0.1s; pointer-events:none;';

        this.zLabel = document.createElement('div');
        this.zLabel.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(10px, -20px); font-family:monospace; font-size:10px; font-weight:bold; color:#fbbf24; text-shadow:0 1px 2px black; opacity:0; transition:opacity 0.2s; white-space:nowrap; pointer-events:none;';
        this.zLabel.innerText = 'Z:0';

        this.lensContainer.append(v, h, this.centerDot, this.probeDot, this.zLabel);
        document.body.appendChild(this.lensContainer);

        this.isVisible = false;
    }

    setCenterDot(visible) {
        if (this.centerDot) this.centerDot.style.opacity = visible ? '1' : '0';
    }

    setProbe(visible, z = 0) {
        if (this.probeDot) this.probeDot.style.opacity = visible ? '1' : '0';
        if (this.zLabel) {
            this.zLabel.style.opacity = visible ? '1' : '0';
            this.zLabel.innerText = `Z:${z}`;
        }
        // Visual feedback when changing Z
        if (visible) {
            this.probeDot.style.width = '16px';
            this.probeDot.style.height = '16px';
            setTimeout(() => {
                this.probeDot.style.width = '12px';
                this.probeDot.style.height = '12px';
            }, 50);
        }
    }

    moveTo(x, y) {
        this.lensContainer.style.left = `${x}px`;
        this.lensContainer.style.top = `${y}px`;
    }

    show() {
        this.lensContainer.style.display = 'block';
        this.isVisible = true;
        document.body.style.cursor = 'none'; // Hide default cursor
    }

    hide() { 
        this.lensContainer.style.display = 'none'; 
        this.isVisible = false; 
        document.body.style.cursor = 'default';
    }

    setSearching(isSearching) {
        if (isSearching) {
            this.lensContainer.style.borderColor = '#444';
            this.lensContainer.style.boxShadow = 'none';
        } else {
            this.lensContainer.style.borderColor = '#00ff00';
            this.lensContainer.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)';
        }
    }

    pulse() {
        this.lensContainer.style.boxShadow = '0 0 60px rgba(0, 255, 0, 0.8), inset 0 0 30px rgba(0, 255, 0, 0.4)';
        setTimeout(() => {
            this.lensContainer.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)';
        }, 150);
    }
}