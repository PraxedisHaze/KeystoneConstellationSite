/**
 * Axxilak Ambient Storm Engine
 * Distant, massive storm clouds that flicker to reveal monolith silhouettes.
 * The Void is neither civil nor safe.
 */
class AmbientStorm {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.clouds = [];
        this.monoliths = [];
        this.flicker = 0;
        this.nextFlicker = Date.now() + 5000 + Math.random() * 10000;
        
        this._init();
        this._animate();

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this._init();
        });
    }

    _init() {
        this.clouds = [];
        this.monoliths = [];

        // Create distant clouds
        for (let i = 0; i < 15; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.7,
                radius: 200 + Math.random() * 400,
                opacity: 0.05 + Math.random() * 0.1,
                speed: 0.1 + Math.random() * 0.2
            });
        }

        // Create massive monolith silhouettes
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const w = 100 + Math.random() * 200;
            this.monoliths.push({
                x: (this.width / count) * i + (Math.random() * 100),
                width: w,
                height: 400 + Math.random() * 600,
                tilt: (Math.random() - 0.5) * 0.1
            });
        }
    }

    _drawClouds(flash) {
        this.ctx.save();
        this.clouds.forEach(cloud => {
            const gradient = this.ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
            const intensity = flash ? 0.3 : 0.05;
            gradient.addColorStop(0, `rgba(40, 40, 50, ${cloud.opacity * (1 + flash * 4)})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Move clouds slowly
            cloud.x += cloud.speed;
            if (cloud.x - cloud.radius > this.width) cloud.x = -cloud.radius;
        });
        this.ctx.restore();
    }

    _drawMonoliths(flash) {
        if (flash < 0.1) return; // Only see silhouettes during meaningful light

        this.ctx.save();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${flash})`;
        this.monoliths.forEach(m => {
            this.ctx.beginPath();
            this.ctx.moveTo(m.x, this.height);
            this.ctx.lineTo(m.x + m.tilt * m.height, this.height - m.height);
            this.ctx.lineTo(m.x + m.width + m.tilt * m.height, this.height - m.height);
            this.ctx.lineTo(m.x + m.width, this.height);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    _animate() {
        const now = Date.now();
        
        // Handle lightning flicker
        if (now > this.nextFlicker) {
            this.flicker = 1.0;
            this.nextFlicker = now + 8000 + Math.random() * 15000;
        }

        this.flicker *= 0.92; // Decay flicker

        // Clear
        this.ctx.fillStyle = '#030303';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw lightning flash background
        if (this.flicker > 0.05) {
            const flashIntensity = Math.sin(now * 0.05) * 0.5 + 0.5; // Jittery lightning
            const finalFlash = this.flicker * flashIntensity;
            this.ctx.fillStyle = `rgba(100, 100, 120, ${finalFlash * 0.15})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this._drawClouds(finalFlash);
            this._drawMonoliths(finalFlash);
        } else {
            this._drawClouds(0);
        }

        requestAnimationFrame(() => this._animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AmbientStorm('stormCanvas');
});
