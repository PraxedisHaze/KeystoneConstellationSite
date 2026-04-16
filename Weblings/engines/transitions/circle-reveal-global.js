/**
 * Axxilak Augmentation: Circle Reveal
 * Geometric circular mask transition for theme switching.
 * Global syntax version for direct use in HTML.
 * Designed for: Velvet
 */
class CircleReveal {
    constructor(options = {}) {
        this.duration = options.duration || 1.2;
        this.init();
    }

    init() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'circle-reveal-overlay';
        this.overlay.setAttribute('data-anothen-internal', '');
        this.overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 99999;
            pointer-events: none;
            clip-path: circle(0% at 50% 50%);
            background: var(--bg, #000);
            transition: clip-path ${this.duration}s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(this.overlay);
    }

    trigger(callback) {
        // Match current background color before starting
        this.overlay.style.backgroundColor = getComputedStyle(document.body).backgroundColor;

        // Expand circle to full screen
        this.overlay.style.clipPath = 'circle(150% at 50% 50%)';

        setTimeout(() => {
            // Execute callback at midpoint
            if (callback) callback();

            // Allow time for DOM to update theme before shrinking
            setTimeout(() => {
                // Contract circle back to center
                this.overlay.style.clipPath = 'circle(0% at 50% 50%)';
            }, 50);
        }, this.duration * 1000 * 0.5); // Trigger half-way through
    }
}

// Global Hook
window.AxxilakTransition = new CircleReveal();
