/**
 * AXXILAK CINEMATIC SCROLLER
 * Purpose: Smooth, automated scrolling for high-quality screen recording.
 */
(function() {
    const UI_ID = 'axxilak-scroller-ui';
    if (document.getElementById(UI_ID)) return;

    // Configuration Variables
    let config = {
        maxVelocity: 2,      // Pixels per frame
        acceleration: 0.01,  // Speed increase per frame
        deceleration: 0.02,  // Speed decrease per frame
        stopBuffer: 500,     // Start slowing down this many pixels from bottom
        isRunning: false,
        currentVelocity: 0
    };

    // Create UI
    const ui = document.createElement('div');
    ui.id = UI_ID;
    ui.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.9);
        color: #d4af37;
        padding: 20px;
        border: 1px solid #d4af37;
        border-radius: 8px;
        font-family: sans-serif;
        z-index: 9999999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-size: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        backdrop-filter: blur(10px);
    `;

    ui.innerHTML = `
        <div style="font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Cinematic Scroller</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 5px;">
            <label>Max Speed</label>
            <input type="number" id="scroller-max" value="${config.maxVelocity}" step="0.1" style="background:#222; color:#fff; border:none; padding:2px;">
            <label>Accel</label>
            <input type="number" id="scroller-accel" value="${config.acceleration}" step="0.001" style="background:#222; color:#fff; border:none; padding:2px;">
            <label>Braking</label>
            <input type="number" id="scroller-brake" value="${config.stopBuffer}" style="background:#222; color:#fff; border:none; padding:2px;">
        </div>
        <button id="scroller-start" style="background:#d4af37; color:#000; border:none; padding:10px; font-weight:bold; cursor:pointer; margin-top:10px;">START SCROLL</button>
        <button id="scroller-hide" style="background:transparent; color:#666; border:none; cursor:pointer; font-size:10px;">Hide for Recording (H to toggle)</button>
    `;

    document.body.appendChild(ui);

    const startBtn = document.getElementById('scroller-start');
    
    function scrollStep() {
        if (!config.isRunning) return;

        const scrollPos = window.pageYOffset;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const remaining = maxScroll - scrollPos;

        // Logic: Accelerate, Steady, or Decelerate
        if (remaining <= 0) {
            config.isRunning = false;
            config.currentVelocity = 0;
            startBtn.innerText = "START SCROLL";
            return;
        }

        if (remaining < config.stopBuffer) {
            // Decelerate
            config.currentVelocity -= config.deceleration;
            if (config.currentVelocity < 0.2) config.currentVelocity = 0.2; // Min creep
        } else if (config.currentVelocity < config.maxVelocity) {
            // Accelerate
            config.currentVelocity += config.acceleration;
        }

        window.scrollBy(0, config.currentVelocity);
        requestAnimationFrame(scrollStep);
    }

    startBtn.onclick = () => {
        config.isRunning = !config.isRunning;
        
        // Update config from UI
        config.maxVelocity = parseFloat(document.getElementById('scroller-max').value);
        config.acceleration = parseFloat(document.getElementById('scroller-accel').value);
        config.stopBuffer = parseFloat(document.getElementById('scroller-brake').value);

        if (config.isRunning) {
            startBtn.innerText = "STOP SCROLL";
            scrollStep();
        } else {
            startBtn.innerText = "START SCROLL";
        }
    };

    // Shortcut H to hide/show UI
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'h') {
            ui.style.display = ui.style.display === 'none' ? 'flex' : 'none';
        }
    });

    document.getElementById('scroller-hide').onclick = () => ui.style.display = 'none';

    console.log("Axxilak Scroller Loaded. Press 'H' to toggle controls.");
})();