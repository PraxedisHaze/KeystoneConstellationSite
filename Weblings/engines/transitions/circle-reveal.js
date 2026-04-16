/**
 * APPLING: CIRCLE REVEAL
 * Description: Geometric circular mask transition for theme switching.
 * Usage: import { CircleReveal } from '../engines/transitions/circle-reveal.js';
 *        const reveal = new CircleReveal();
 *        reveal.trigger(() => toggleTheme());
 */

export class CircleReveal {
    constructor(options = {}) {
        this.duration = options.duration || 1.2;
        this.init();
    }

    init() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'circle-reveal-overlay';
        this.overlay.setAttribute('data-anothen-internal', '');
        this.overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            pointer-events: none; clip-path: circle(0% at 50% 50%);
            background: var(--bg, #000);
            transition: clip-path ${this.duration}s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(this.overlay);
    }

    trigger(callback) {
        // Match current background color before starting
        this.overlay.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
        
        this.overlay.style.clipPath = 'circle(150% at 50% 50%)';
        
        setTimeout(() => {
            if (callback) callback();
            
            // Allow time for DOM to update theme before shrinking
            setTimeout(() => {
                this.overlay.style.clipPath = 'circle(0% at 50% 50%)';
            }, 50);
        }, this.duration * 1000 * 0.5); // Trigger half-way through
    }
}