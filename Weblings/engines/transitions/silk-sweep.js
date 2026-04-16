/**
 * Axxilak Augmentation: Silk Sweep
 * A luxurious velvet curtain transition.
 * Designed for: Velvet
 */
class SilkSweep {
    constructor() {
        this.curtain = document.createElement('div');
        this.curtain.id = 'silk-transition';
        this.curtain.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            pointer-events: none;
            transform: translateX(100%);
            transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1);
            background: linear-gradient(90deg, 
                #2a0a10 0%, 
                #4a0e1c 15%, 
                #2a0a10 30%, 
                #5a1220 50%, 
                #2a0a10 70%, 
                #4a0e1c 85%, 
                #2a0a10 100%
            );
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
        `;
        // Add "fabric" texture/noise if possible, or just the gradient sheen.
        // Let's add a gold trim.
        const trim = document.createElement('div');
        trim.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(to bottom, #d4af37, #fcf6ba, #d4af37);
        `;
        this.curtain.appendChild(trim);
        document.body.appendChild(this.curtain);
    }

    trigger(callback) {
        this.curtain.style.pointerEvents = 'auto';
        
        // 1. Slide In (Right to Left)
        this.curtain.style.transition = 'transform 0.8s cubic-bezier(0.7, 0, 0.3, 1)';
        this.curtain.style.transform = 'translateX(0)';

        setTimeout(() => {
            // 2. Change Content
            if (callback) callback();

            // 3. Slide Out (Left to Right? Or keep going Left?)
            // Let's keep going left to "wipe" the screen.
            // Move it to -100%
            setTimeout(() => {
                this.curtain.style.transform = 'translateX(-100%)';
                
                setTimeout(() => {
                    // Reset position silently
                    this.curtain.style.transition = 'none';
                    this.curtain.style.transform = 'translateX(100%)';
                    this.curtain.style.pointerEvents = 'none';
                }, 800);
            }, 400); // Short pause at full cover
        }, 800);
    }
}

// Global Hook
window.AxxilakTransition = new SilkSweep();
