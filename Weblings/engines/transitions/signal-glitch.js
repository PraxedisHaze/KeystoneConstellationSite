/**
 * Axxilak Augmentation: Signal Glitch
 * A violent CRT/Data-Shredding transition.
 * Designed for: Neon Tokyo (The Showcase)
 */
class SignalGlitch {
    constructor() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'glitch-transition';
        this.overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: #000;
            z-index: 999999;
            pointer-events: none;
            opacity: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;
        
        // Create 20 "shred" slices
        for (let i = 0; i < 20; i++) {
            const slice = document.createElement('div');
            slice.className = 'glitch-slice';
            slice.style.cssText = `
                flex: 1;
                width: 100%;
                background: #050505;
                position: relative;
                transform: translateX(0);
                border-bottom: 1px solid rgba(0,255,255,0.05);
            `;
            this.overlay.appendChild(slice);
        }

        document.body.appendChild(this.overlay);
    }

    trigger(callback) {
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';
        
        const slices = this.overlay.querySelectorAll('.glitch-slice');
        
        // Phase 1: Shred In
        slices.forEach((slice, i) => {
            const offset = (Math.random() - 0.5) * 200;
            slice.style.transition = 'none';
            slice.style.transform = `translateX(${offset}%)`;
            slice.style.background = Math.random() > 0.5 ? '#ff00ff' : '#00ffff';
        });

        setTimeout(() => {
            // Phase 2: Solidify/Flicker
            slices.forEach(slice => {
                slice.style.transition = 'transform 0.1s ease-out';
                slice.style.transform = 'translateX(0)';
                slice.style.background = '#050505';
            });

            if (callback) callback();

            // Phase 3: CRT Flicker Out
            setTimeout(() => {
                let flickers = 0;
                const interval = setInterval(() => {
                    this.overlay.style.opacity = flickers % 2 === 0 ? '0' : '1';
                    flickers++;
                    if (flickers > 6) {
                        clearInterval(interval);
                        this.overlay.style.opacity = '0';
                        this.overlay.style.pointerEvents = 'none';
                    }
                }, 40);
            }, 200);
        }, 300);
    }
}

window.AxxilakTransition = new SignalGlitch();
