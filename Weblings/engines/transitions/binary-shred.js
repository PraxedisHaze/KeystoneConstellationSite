/**
 * Axxilak Augmentation: Binary Shred
 * A vertical shredding transition with binary code.
 * Designed for: Cipher
 */
class BinaryShred {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'cipher-transition';
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            background: #000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(this.canvas);
        
        this.strips = [];
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
        this.strips = [];
        
        const numStrips = 20;
        const stripWidth = this.canvas.width / numStrips;

        for(let i=0; i<numStrips; i++) {
            this.strips.push({
                x: i * stripWidth,
                y: 0,
                width: stripWidth,
                speed: 10 + Math.random() * 20,
                delay: Math.random() * 500
            });
        }

        let startTime = Date.now();

        const animate = () => {
            if (!this.active) return;
            
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '12px monospace';
            
            let allGone = true;
            const elapsed = Date.now() - startTime;

            this.strips.forEach(s => {
                if (elapsed > s.delay) {
                    s.y += s.speed;
                }
                
                if (s.y < this.canvas.height) {
                    allGone = false;
                    // Draw binary in the strip
                    for(let by=0; by<this.canvas.height; by+=20) {
                        if (by > s.y) {
                            const char = Math.random() > 0.5 ? '1' : '0';
                            this.ctx.fillText(char, s.x + s.width/2, by);
                        }
                    }
                }
            });

            if (allGone) {
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

window.AxxilakTransition = new BinaryShred();
