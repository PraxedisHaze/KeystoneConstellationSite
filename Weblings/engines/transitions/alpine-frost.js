/**
 * Axxilak Augmentation: Alpine Frost
 * A freezing/shattering ice transition.
 * Designed for: Summit
 */
class AlpineFrost {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'summit-transition';
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(this.canvas);
        
        this.shards = [];
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
        this.shards = [];
        
        let phase = 'freeze'; // freeze, shatter
        let freezeProgress = 0;

        const animate = () => {
            if (!this.active) return;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (phase === 'freeze') {
                freezeProgress += 0.02;
                this.ctx.fillStyle = 'rgba(230, 245, 255, 0.8)';
                
                // Draw ice crystals growing from corners
                const corners = [
                    [0, 0], [this.canvas.width, 0], 
                    [0, this.canvas.height], [this.canvas.width, this.canvas.height]
                ];

                corners.forEach(([cx, cy]) => {
                    this.ctx.beginPath();
                    this.ctx.moveTo(cx, cy);
                    // Draw jagged ice edge
                    const r = Math.max(this.canvas.width, this.canvas.height) * 1.5 * freezeProgress;
                    for(let a=0; a<Math.PI*2; a+=0.2) {
                        const dist = r * (0.8 + Math.random() * 0.4);
                        this.ctx.lineTo(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist);
                    }
                    this.ctx.fill();
                });

                if (freezeProgress >= 1) {
                    phase = 'shatter';
                    if (callback) { callback(); callback = null; }
                    
                    // Create shards for shattering
                    for(let i=0; i<40; i++) {
                        this.shards.push({
                            x: Math.random() * this.canvas.width,
                            y: Math.random() * this.canvas.height,
                            vx: (Math.random() - 0.5) * 20,
                            vy: Math.random() * 20 + 10,
                            r: Math.random() * Math.PI,
                            vr: (Math.random() - 0.5) * 0.2,
                            size: 20 + Math.random() * 40
                        });
                    }
                }
            } else if (phase === 'shatter') {
                this.ctx.fillStyle = 'rgba(230, 245, 255, 0.5)';
                let anyVisible = false;
                this.shards.forEach(s => {
                    s.x += s.vx;
                    s.y += s.vy;
                    s.r += s.vr;
                    if (s.y < this.canvas.height + 100) {
                        anyVisible = true;
                        this.ctx.save();
                        this.ctx.translate(s.x, s.y);
                        this.ctx.rotate(s.r);
                        this.ctx.beginPath();
                        this.ctx.moveTo(-s.size, -s.size);
                        this.ctx.lineTo(s.size, -s.size);
                        this.ctx.lineTo(0, s.size);
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.restore();
                    }
                });

                if (!anyVisible) {
                    this.active = false;
                    this.canvas.style.opacity = '0';
                    this.canvas.style.pointerEvents = 'none';
                }
            }

            requestAnimationFrame(animate);
        };
        animate();
    }
}

window.AxxilakTransition = new AlpineFrost();
