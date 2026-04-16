/**
 * APPLING: CINEMATIC DISSOLVE
 * Description: Smooth fade-to-black transition for internal navigation.
 * Usage: import { CinematicDissolve } from '../engines/transitions/cinematic-dissolve.js';
 *        new CinematicDissolve({ duration: 400 });
 */

export class CinematicDissolve {
    constructor(options = {}) {
        this.duration = options.duration || 400;
        this.color = options.color || 'var(--bg, #000)';
        this.init();
    }

    init() {
        // 1. Create Overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'transition-overlay';
        this.overlay.setAttribute('data-anothen-internal', '');
        this.overlay.style.cssText = `
            position: fixed; inset: 0; background-color: ${this.color};
            z-index: 99999; pointer-events: none; opacity: 0;
            transition: opacity ${this.duration}ms cubic-bezier(0.16, 1, 0.3, 1);
        `;
        document.body.appendChild(this.overlay);

        // 2. Disable smooth scroll for instant jump
        document.documentElement.style.scrollBehavior = 'auto';

        // 3. Intercept Clicks
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#' || targetId === '') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    this.trigger(targetElement.offsetTop);
                }
            });
        });
    }

    trigger(scrollPos) {
        this.overlay.style.opacity = '1';
        
        setTimeout(() => {
            window.scrollTo(0, scrollPos);
            setTimeout(() => {
                this.overlay.style.opacity = '0';
            }, 100);
        }, this.duration);
    }
}