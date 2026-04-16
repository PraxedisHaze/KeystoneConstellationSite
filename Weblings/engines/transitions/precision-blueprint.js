/**
 * Axxilak Augmentation: Precision Blueprint
 * A technical sketching transition with grids and drafting lines.
 * Designed for: Apex
 */
class PrecisionBlueprint {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'blueprint-transition';
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            background: #003366; /* Blueprint Blue */
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(this.canvas);
        
        this.lines = [];
        this.active = false;
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    trigger(callback) {
        this.active = true;
        this.canvas.style.opacity = '1';
        this.canvas.style.pointerEvents = 'auto';
        this.lines = [];
        
        // Phase 1: Grid and Drafting Lines
        for(let i=0; i<30; i++) {
            this.lines.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                len: 0,
                maxLen: 200 + Math.random() * 400,
                angle: Math.random() > 0.5 ? 0 : Math.PI / 2, // Horizontal or Vertical
                speed: 10 + Math.random() * 20
            });
        }

        let progress = 0;
        const animate = () => {
            if (!this.active) return;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw Grid
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            const size = 40;
            for(let x=0; x<this.canvas.width; x+=size) {
                this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
            }
            for(let y=0; y<this.canvas.height; y+=size) {
                this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke();
            }

            // Draw Drafting Lines
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            let allDone = true;
            this.lines.forEach(l => {
                if (l.len < l.maxLen) {
                    l.len += l.speed;
                    allDone = false;
                }
                this.ctx.beginPath();
                this.ctx.moveTo(l.x, l.y);
                this.ctx.lineTo(l.x + Math.cos(l.angle) * l.len, l.y + Math.sin(l.angle) * l.len);
                this.ctx.stroke();
            });

            if (allDone && progress === 0) {
                progress = 1;
                if (callback) callback();
                setTimeout(() => {
                    this.canvas.style.opacity = '0';
                    setTimeout(() => {
                        this.active = false;
                        this.canvas.style.pointerEvents = 'none';
                    }, 300);
                }, 400);
            }

            requestAnimationFrame(animate);
        };
        animate();
    }
}

window.AxxilakTransition = new PrecisionBlueprint();
