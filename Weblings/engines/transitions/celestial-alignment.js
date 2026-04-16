/**
 * Axxilak Augmentation: Celestial Alignment
 * A deep space star-alignment transition.
 * Designed for: Oracle
 */
class CelestialAlignment {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'oracle-transition';
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            background: #050508;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        document.body.appendChild(this.canvas);
        
        this.stars = [];
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
        this.stars = [];
        
        // Initialize Stars
        for(let i=0; i<100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                tx: Math.random() * this.canvas.width, // Target
                ty: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                vx: (Math.random() - 0.5) * 40,
                vy: (Math.random() - 0.5) * 40
            });
        }

        let phase = 'scatter'; // scatter, align, fade

        const animate = () => {
            if (!this.active) return;
            
            this.ctx.fillStyle = '#050508';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            let allSettled = true;

            this.stars.forEach(s => {
                if (phase === 'scatter') {
                    s.x += s.vx;
                    s.y += s.vy;
                    // Wrap
                    if (s.x < 0) s.x = this.canvas.width;
                    if (s.x > this.canvas.width) s.x = 0;
                    if (s.y < 0) s.y = this.canvas.height;
                    if (s.y > this.canvas.height) s.y = 0;
                } else if (phase === 'align') {
                    const dx = s.tx - s.x;
                    const dy = s.ty - s.y;
                    s.x += dx * 0.1;
                    s.y += dy * 0.1;
                    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) allSettled = false;
                }

                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
                this.ctx.fill();
                
                // Draw constellation lines if aligning
                if (phase === 'align') {
                    this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(s.x, s.y);
                    // Connect to a few neighbors
                    this.stars.slice(0, 5).forEach(n => {
                        this.ctx.lineTo(n.x, n.y);
                    });
                    this.ctx.stroke();
                }
            });

            if (phase === 'scatter') {
                setTimeout(() => { phase = 'align'; }, 400);
            }

            if (phase === 'align' && allSettled) {
                if (callback) {
                    callback();
                    callback = null; // Run once
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

window.AxxilakTransition = new CelestialAlignment();
