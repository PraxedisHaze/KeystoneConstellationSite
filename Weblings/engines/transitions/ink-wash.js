/**
 * Axxilak Augmentation: Ink Wash
 * A watercolor bloom transition.
 * Designed for: Scholar
 */
class InkWash {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'scholar-transition';
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        document.body.appendChild(this.canvas);
        
        this.blooms = [];
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
        this.blooms = [];
        
        // One big central bloom and a few smaller ones
        this.blooms.push({
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            r: 0,
            maxR: Math.max(this.canvas.width, this.canvas.height) * 1.2,
            opacity: 0.8
        });

        for(let i=0; i<5; i++) {
            this.blooms.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                r: 0,
                maxR: 200 + Math.random() * 400,
                opacity: 0.6
            });
        }

        const animate = () => {
            if (!this.active) return;
            
            // Background - Paper color
            this.ctx.fillStyle = 'rgba(245, 241, 230, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            let allDone = true;
            this.ctx.fillStyle = '#1a1a1a'; // Ink color

            this.blooms.forEach(b => {
                if (b.r < b.maxR) {
                    b.r += 15;
                    allDone = false;
                }
                
                // Draw irregular circle (ink bleed)
                this.ctx.beginPath();
                for (let a = 0; a < Math.PI * 2; a += 0.1) {
                    const noise = 1 + Math.sin(a * 10) * 0.1; // Add wobble
                    const rx = b.x + Math.cos(a) * b.r * noise;
                    const ry = b.y + Math.sin(a) * b.r * noise;
                    if (a === 0) this.ctx.moveTo(rx, ry);
                    else this.ctx.lineTo(rx, ry);
                }
                this.ctx.fill();
            });

            if (allDone) {
                if (callback) {
                    callback();
                    callback = null;
                }
                setTimeout(() => {
                    this.canvas.style.opacity = '0';
                    setTimeout(() => {
                        this.active = false;
                        this.canvas.style.pointerEvents = 'none';
                    }, 500);
                }, 400);
            }

            requestAnimationFrame(animate);
        };
        animate();
    }
}

window.AxxilakTransition = new InkWash();
