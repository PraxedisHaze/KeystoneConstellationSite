/**
 * APPLING: SYSTEM BOOT SEQUENCE
 * Description: Injects a terminal-style boot sequence overlay.
 * Usage: import { SystemBoot } from '../engines/transitions/system-boot.js';
 *        new SystemBoot({ messages: [...], speed: 300 });
 */

export class SystemBoot {
    constructor(options = {}) {
        this.messages = options.messages || [
            '> INITIALIZING SYSTEM...',
            '> ANALYZING LATTICE...',
            '> CORE STATUS: ACTIVE',
            '> SYSTEM ONLINE.'
        ];
        this.speed = options.speed || 300;
        this.accentColor = options.accentColor || 'var(--accent, #00ff00)';
        this.init();
    }

    init() {
        // 1. Create Overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'boot-overlay';
        this.overlay.setAttribute('data-anothen-internal', '');
        this.overlay.style.cssText = `
            position: fixed; inset: 0; background: #000; z-index: 100000;
            display: flex; align-items: center; justify-content: center;
            font-family: 'JetBrains Mono', monospace; color: ${this.accentColor};
            padding: 2rem; transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        this.logContainer = document.createElement('div');
        this.logContainer.style.cssText = 'text-align: left; max-width: 400px; width: 100%;';
        
        this.overlay.appendChild(this.logContainer);
        document.body.appendChild(this.overlay);

        // 2. Inject Styles
        if (!document.getElementById('boot-styles')) {
            const styles = document.createElement('style');
            styles.id = 'boot-styles';
            styles.innerHTML = `
                .boot-line { opacity: 0; margin-bottom: 0.5rem; font-size: 14px; letter-spacing: 1px; transform: translateX(-10px); }
                @keyframes fadeInBoot { to { opacity: 1; transform: translateX(0); } }
                .boot-fade-out { opacity: 0 !important; pointer-events: none !important; }
            `;
            document.head.appendChild(styles);
        }

        this.lineIndex = 0;
        this.typeLines();
    }

    typeLines() {
        if (this.lineIndex < this.messages.length) {
            const line = document.createElement('div');
            line.className = 'boot-line';
            line.style.animation = 'fadeInBoot 0.2s forwards';
            line.innerText = this.messages[this.lineIndex];
            this.logContainer.appendChild(line);
            this.lineIndex++;
            setTimeout(() => this.typeLines(), this.speed);
        } else {
            setTimeout(() => this.finish(), 1000);
        }
    }

    finish() {
        this.overlay.classList.add('boot-fade-out');
        setTimeout(() => this.overlay.remove(), 800);
    }
}