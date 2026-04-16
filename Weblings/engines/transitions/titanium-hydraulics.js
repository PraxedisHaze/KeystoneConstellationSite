/**
 * Axxilak Augmentation: Titanium Hydraulics
 * A heavy, industrial door transition with hydraulic pistons and steam particles.
 * Designed for: Iron & Ink
 */
class TitaniumHydraulics {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'hydraulic-transition';
        this.container.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 999999;
            pointer-events: none;
            display: flex;
            overflow: hidden;
        `;

        // Left Door
        this.leftDoor = document.createElement('div');
        this.leftDoor.style.cssText = `
            flex: 1;
            background: #2a2a2a;
            border-right: 4px solid #1a1a1a;
            transform: translateX(-100%);
            transition: transform 0.6s cubic-bezier(0.8, 0, 0.2, 1);
            position: relative;
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
        `;

        // Right Door
        this.rightDoor = document.createElement('div');
        this.rightDoor.style.cssText = `
            flex: 1;
            background: #2a2a2a;
            border-left: 4px solid #1a1a1a;
            transform: translateX(100%);
            transition: transform 0.6s cubic-bezier(0.8, 0, 0.2, 1);
            position: relative;
            box-shadow: -10px 0 30px rgba(0,0,0,0.5);
        `;

        // Decorative Rivets & Panels
        [this.leftDoor, this.rightDoor].forEach(door => {
            door.innerHTML = `
                <div style="position: absolute; inset: 20px; border: 1px solid rgba(255,255,255,0.05); pointer-events: none;"></div>
                <div style="position: absolute; top: 20px; left: 20px; width: 8px; height: 8px; border-radius: 50%; background: #111; box-shadow: 1px 1px 1px rgba(255,255,255,0.1);"></div>
                <div style="position: absolute; top: 20px; right: 20px; width: 8px; height: 8px; border-radius: 50%; background: #111; box-shadow: 1px 1px 1px rgba(255,255,255,0.1);"></div>
                <div style="position: absolute; bottom: 20px; left: 20px; width: 8px; height: 8px; border-radius: 50%; background: #111; box-shadow: 1px 1px 1px rgba(255,255,255,0.1);"></div>
                <div style="position: absolute; bottom: 20px; right: 20px; width: 8px; height: 8px; border-radius: 50%; background: #111; box-shadow: 1px 1px 1px rgba(255,255,255,0.1);"></div>
                <div class="piston" style="position: absolute; top: 50%; width: 60px; height: 120px; background: #1a1a1a; border: 2px solid #333; transform: translateY(-50%);"></div>
            `;
        });
        this.leftDoor.querySelector('.piston').style.right = '-30px';
        this.rightDoor.querySelector('.piston').style.left = '-30px';

        this.container.appendChild(this.leftDoor);
        this.container.appendChild(this.rightDoor);
        document.body.appendChild(this.container);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cssText = 'position:fixed; inset:0; z-index:1000000; pointer-events:none;';
        document.body.appendChild(this.canvas);
        
        this.particles = [];
    }

    trigger(callback) {
        this.container.style.pointerEvents = 'auto';
        
        // 1. Close Doors
        this.leftDoor.style.transform = 'translateX(0)';
        this.rightDoor.style.transform = 'translateX(0)';

        setTimeout(() => {
            // 2. Steam Venting
            this._ventSteam();
            
            // 3. Execute Page Change
            if (callback) callback();

            // 4. Open Doors
            setTimeout(() => {
                this.leftDoor.style.transform = 'translateX(-100%)';
                this.rightDoor.style.transform = 'translateX(100%)';
                
                setTimeout(() => {
                    this.container.style.pointerEvents = 'none';
                }, 600);
            }, 800);
        }, 600);
    }

    _ventSteam() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        const centerX = this.canvas.width / 2;
        
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: centerX,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 2,
                size: 5 + Math.random() * 20,
                opacity: 0.8
            });
        }
        this._animateSteam();
    }

    _animateSteam() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let active = false;

        this.particles.forEach((p, i) => {
            if (p.opacity <= 0) return;
            active = true;
            
            p.x += p.vx;
            p.y += p.vy;
            p.opacity -= 0.02;
            p.size += 0.5;

            this.ctx.fillStyle = `rgba(200, 200, 220, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        if (active) requestAnimationFrame(() => this._animateSteam());
    }
}

// Global Hook for Weblings
window.AxxilakTransition = new TitaniumHydraulics();
