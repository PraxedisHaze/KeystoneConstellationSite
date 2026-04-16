/**
 * Axxilak Augmentation: Brush Stroke
 * A textured oil-paint transition.
 * Designed for: Canvas
 */
class BrushStroke {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'canvas-transition';
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        document.body.appendChild(this.canvas);
        
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
        
        let x = -200;
        let y = 100;
        let step = 0;

        const animate = () => {
            if (!this.active) return;
            
            this.ctx.fillStyle = '#f0f0f0'; // Canvas white
            if (step === 0) {
                // Background once
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                step = 1;
            }

            // Draw broad textured stroke
            this.ctx.fillStyle = 'rgba(20, 20, 20, 0.1)';
            for(let i=0; i<10; i++) {
                const ox = (Math.random()-0.5) * 50;
                const oy = (Math.random()-0.5) * 50;
                this.ctx.fillRect(x + ox, y + oy, 200, 100);
            }

            x += 40;
            if (x > this.canvas.width + 200) {
                x = -200;
                y += 150;
            }

            if (y > this.canvas.height + 200) {
                if (callback) {
                    callback();
                    callback = null;
                }
                setTimeout(() => {
                    this.active = false;
                    this.canvas.style.opacity = '0';
                    setTimeout(() => {
                        this.canvas.style.pointerEvents = 'none';
                    }, 500);
                }, 400);
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}

window.AxxilakTransition = new BrushStroke();
