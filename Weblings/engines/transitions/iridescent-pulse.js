/**
 * Axxilak Augmentation: Iridescent Pulse
 * A prismatic ripple transition.
 * Designed for: Aura
 */
class IridescentPulse {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'aura-transition';
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
        
        let progress = 0;

        const animate = () => {
            if (!this.active) return;
            
            progress += 0.015;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const maxR = Math.max(this.canvas.width, this.canvas.height) * 1.5;
            const r = maxR * progress;

            // Create Iridescent Gradient Ripple
            const grad = this.ctx.createRadialGradient(centerX, centerY, r * 0.8, centerX, centerY, r);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.2, 'rgba(255, 100, 255, 0.3)'); // Magenta
            grad.addColorStop(0.4, 'rgba(100, 255, 255, 0.3)'); // Cyan
            grad.addColorStop(0.6, 'rgba(255, 255, 100, 0.3)'); // Yellow
            grad.addColorStop(0.8, 'rgba(150, 100, 255, 0.3)'); // Violet
            grad.addColorStop(1, 'transparent');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            this.ctx.fill();

            if (progress > 0.5 && callback) {
                callback();
                callback = null;
            }

            if (progress >= 1.2) {
                this.active = false;
                this.canvas.style.opacity = '0';
                setTimeout(() => {
                    this.canvas.style.pointerEvents = 'none';
                }, 500);
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}

window.AxxilakTransition = new IridescentPulse();
