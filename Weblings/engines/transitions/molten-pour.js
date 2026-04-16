/**
 * Axxilak Augmentation: Molten Pour
 * A viscous, golden fluid transition that coats the screen.
 * Designed for: Liquid Gold
 */
class MoltenPour {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'molten-transition';
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(this.canvas);
        
        this.drops = [];
        this.active = false;
        
        window.addEventListener('resize', () => this._resize());
        this._resize();
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    trigger(callback) {
        this.active = true;
        this.canvas.style.opacity = '1';
        this.drops = [];
        
        // Initialize heavy drops from top
        const columns = Math.ceil(this.canvas.width / 20);
        for (let i = 0; i < columns; i++) {
            this.drops.push({
                x: i * 20,
                y: -Math.random() * 100,
                speed: 5 + Math.random() * 15,
                len: 20 + Math.random() * 50,
                width: 25 + Math.random() * 10
            });
        }

        let phase = 'pour'; // pour, cover, reveal

        const animate = () => {
            if (!this.active) return;

            this.ctx.fillStyle = '#d4af37'; // Gold
            // Clear slightly to create trail effect? No, we want accumulation.
            // Actually, for a "wipe", we want it to fill the screen.
            
            if (phase === 'pour') {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                let allFinished = true;
                this.ctx.beginPath();
                this.drops.forEach(d => {
                    d.y += d.speed;
                    // Draw dripping rect
                    this.ctx.rect(d.x, 0, d.width, d.y);
                    // Drip head
                    this.ctx.arc(d.x + d.width/2, d.y, d.width/2, 0, Math.PI*2);
                    
                    if (d.y < this.canvas.height + 100) allFinished = false;
                });
                this.ctx.fill();

                if (allFinished) {
                    phase = 'cover';
                    // Fill completely just in case of gaps
                    this.ctx.fillStyle = '#d4af37';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    // Callback to change state
                    setTimeout(() => {
                        if (callback) callback();
                        phase = 'reveal';
                    }, 200);
                }
            } else if (phase === 'reveal') {
                // Fade out or slide away? Let's dissolve.
                this.canvas.style.opacity = '0';
                setTimeout(() => {
                    this.active = false;
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }, 500);
                return; 
            }

            requestAnimationFrame(animate);
        };
        animate();
    }
}

// Global Hook
window.AxxilakTransition = new MoltenPour();
