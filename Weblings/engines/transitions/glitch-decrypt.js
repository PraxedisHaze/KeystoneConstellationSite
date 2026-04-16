/**
 * APPLING: GLITCH DECRYPT
 * Description: High-speed character scramble/glitch transition.
 * Usage: import { GlitchDecrypt } from '../engines/transitions/glitch-decrypt.js';
 *        const glitch = new GlitchDecrypt();
 *        glitch.trigger(() => toggleTheme());
 */

export class GlitchDecrypt {
    constructor(options = {}) {
        this.duration = options.duration || 300;
        this.init();
    }

    init() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'glitch-overlay';
        this.overlay.setAttribute('data-anothen-internal', '');
        this.overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            pointer-events: none; background: #000;
            display: flex; align-items: center; justify-content: center;
            font-family: 'JetBrains Mono', monospace; color: #00ff41;
            opacity: 0; transition: opacity 0.1s;
            font-size: 2rem; letter-spacing: 0.5em; overflow: hidden;
        `;
        document.body.appendChild(this.overlay);
    }

    trigger(callback) {
        this.overlay.style.opacity = '1';
        this.overlay.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
        this.overlay.style.color = getComputedStyle(document.body).color;

        const chars = '01#@$%&<>[]{}';
        const interval = setInterval(() => {
            let text = '';
            for(let i=0; i<20; i++) text += chars[Math.floor(Math.random() * chars.length)];
            this.overlay.innerText = text;
        }, 50);

        setTimeout(() => {
            if (callback) callback();
            clearInterval(interval);
            setTimeout(() => {
                this.overlay.style.opacity = '0';
            }, 50);
        }, this.duration);
    }
}