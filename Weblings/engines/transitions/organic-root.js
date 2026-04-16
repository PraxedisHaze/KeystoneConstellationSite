/**
 * Axxilak Augmentation: Organic Root
 * A growth-based transition with weaving roots.
 * Designed for: Gaia
 */
class OrganicRoot {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'gaia-transition';
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        document.body.appendChild(this.canvas);
        
        this.roots = [];
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
        this.roots = [];
        
        // Initialize roots from 4 corners
        const corners = [
            {x: 0, y: 0}, 
            {x: this.canvas.width, y: 0}, 
            {x: 0, y: this.canvas.height}, 
            {x: this.canvas.width, y: this.canvas.height}
        ];

        corners.forEach(c => {
            for(let i=0; i<8; i++) {
                this.roots.push({
                    x: c.x,
                    y: c.y,
                    segments: [{x: c.x, y: c.y}],
                    angle: Math.atan2(this.canvas.height/2 - c.y, this.canvas.width/2 - c.x) + (Math.random()-0.5),
                    thickness: 20 + Math.random() * 20,
                    finished: false
                });
            }
        });

        let phase = 'grow'; // grow, cover, retreat

        const animate = () => {
            if (!this.active) return;
            
            // Draw background (Parchment or Dark depending on theme?)
            // We'll use a neutral charcoal green for Gaia.
            this.ctx.fillStyle = 'rgba(26, 31, 26, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.strokeStyle = '#2d3436';
            this.ctx.lineCap = 'round';
            
            let allFinished = true;

            this.roots.forEach(r => {
                if (r.segments.length > 100) r.finished = true;
                if (!r.finished) {
                    allFinished = false;
                    const last = r.segments[r.segments.length - 1];
                    r.angle += (Math.random() - 0.5) * 0.5;
                    const next = {
                        x: last.x + Math.cos(r.angle) * 15,
                        y: last.y + Math.sin(r.angle) * 15
                    };
                    r.segments.push(next);
                    
                    this.ctx.lineWidth = r.thickness;
                    this.ctx.beginPath();
                    this.ctx.moveTo(last.x, last.y);
                    this.ctx.lineTo(next.x, next.y);
                    this.ctx.stroke();
                    
                    r.thickness *= 0.99;
                }
            });

            if (allFinished && phase === 'grow') {
                phase = 'cover';
                this.ctx.fillStyle = '#1a1f1a';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
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

window.AxxilakTransition = new OrganicRoot();
