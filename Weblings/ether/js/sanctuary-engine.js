/**
 * Ether Sanctuary Engine
 * High-frequency parallax space view for the Ether webling.
 * Designed for the "Hard-Locked Light" state.
 */
class EtherSanctuary {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.id = 'sanctuary-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.stars = [];
        this.nebulas = [];
        this.scrollPos = 0;

        this._init();
        this._animate();

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this._init();
        });

        window.addEventListener('scroll', () => {
            this.scrollPos = window.scrollY;
        });
    }

    _init() {
        this.stars = [];
        this.nebulas = [];

        // Create high-frequency stars (Bright, subtle)
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5,
                speed: 0.1 + Math.random() * 0.5,
                opacity: 0.2 + Math.random() * 0.5
            });
        }

        // Create layered nebulas (Soft, ethereal colors)
        const colors = [
            'rgba(165, 180, 252, 0.05)', // Soft Indigo
            'rgba(199, 210, 254, 0.03)', // Lighter Indigo
            'rgba(245, 243, 255, 0.05)'  // Soft Violet
        ];

        for (let i = 0; i < 5; i++) {
            this.nebulas.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 400 + Math.random() * 600,
                color: colors[i % colors.length],
                parallax: 0.05 + Math.random() * 0.1
            });
        }
    }

    _animate() {
        // Subtle white/grey void background
        this.ctx.fillStyle = '#fafafa';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Nebulas (Deep parallax)
        this.nebulas.forEach(n => {
            const yOffset = (this.scrollPos * n.parallax) % this.height;
            const gradient = this.ctx.createRadialGradient(n.x, n.y - yOffset, 0, n.x, n.y - yOffset, n.radius);
            gradient.addColorStop(0, n.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y - yOffset, n.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw wrapped version for seamless scroll
            this.ctx.beginPath();
            this.ctx.arc(n.x, (n.y - yOffset) + this.height, n.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw Stars (Fast parallax)
        this.ctx.fillStyle = '#1a1a1a';
        this.stars.forEach(s => {
            const yOffset = (this.scrollPos * s.speed) % this.height;
            this.ctx.globalAlpha = s.opacity;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y - yOffset, s.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw wrapped version
            this.ctx.beginPath();
            this.ctx.arc(s.x, (s.y - yOffset) + this.height, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;

        requestAnimationFrame(() => this._animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EtherSanctuary();
});
