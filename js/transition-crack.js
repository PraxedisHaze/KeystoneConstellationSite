/**
 * Axxilak Cracking Background Transition Engine
 * Orchestrates cinematic shard animation, card expansion, and navigation
 * 2-second cinematic experience with physics simulation
 */

class CrackingTransition {
    constructor(options = {}) {
        this.isAnimating = false;
        this.canvas = null;
        this.ctx = null;
        this.backdropEl = null;
        this.forgeIframe = null;
        this.shards = [];
        this.cardElement = null;
        this.selectedWebling = null;

        // Animation timing (milliseconds)
        this.totalDuration = 7100;
        this.crackFormationDuration = 1750; // 0-1750ms: multi-stage crack formation with long pauses
        this.freezeFullDuration = 2750; // 1750-2750ms: freeze at full screen (1 second pause)
        this.explosionDuration = 4350; // 2750-7100ms: explosion/fall (4350ms, extended for complete cascade)
        this.navigateDuration = 7100; // Navigate at 7100ms

        // Physics
        this.gravity = 0.15;
        this.airResistance = 0.995; // Slightly less damping for more dramatic spread
        this.angularDamping = 0.98;

        // Rendering
        this.dpr = window.devicePixelRatio || 1;
        this.animationFrameId = null;
        this.startTime = null;

        // Performance detection (basic heuristic)
        this.detectedShardCount = this._detectSystemCapability();

        this._setupEventListeners();
    }

    /**
     * Detect system capability based on device info
     * Returns optimal shard count based on hardware or user preference
     */
    _detectSystemCapability() {
        // 1. Check for user override (Stability Setting)
        const userOverride = localStorage.getItem('axxilak_shard_density');
        if (userOverride) {
            const count = parseInt(userOverride);
            console.log(`[Performance] User override detected → ${count} shards`);
            return count;
        }

        // 2. Hardware Detection
        const isLowPowerDevice = /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);
        const cpuCores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 8;

        // Optimized defaults: 150 (Low), 300 (Med), 500 (High)
        if (isLowPowerDevice || cpuCores <= 2 || memory <= 2) {
            console.log(`[Performance] Low-power device detected → 150 shards`);
            return 150;
        } else if (cpuCores <= 4 || memory <= 4) {
            console.log(`[Performance] Medium device detected → 300 shards`);
            return 300;
        } else {
            console.log(`[Performance] High-end device detected → 500 shards`);
            return 500;
        }
    }

    /**
     * Initiate transition from webling card
     */
    async initiateTransition(weblingId, cardElement) {
        if (this.isAnimating) return; // Debounce

        this.isAnimating = true;
        this.selectedWebling = weblingId;
        this.cardElement = cardElement;

        console.log(`[Transition] Initiating transition for webling: ${weblingId}`);

        try {
            // Store state for back button
            sessionStorage.setItem('transitionSource', 'landing');
            sessionStorage.setItem('selectedWeblingId', weblingId);
            // Clear old Forge state so it loads fresh with the new webling
            sessionStorage.removeItem('axxilak_state');

            // Begin animation sequence
            await this._prepareTransition();
            this._startAnimation();
        } catch (error) {
            console.error('Transition failed:', error);
            this._fallbackNavigation();
        }
    }

    /**
     * Prepare canvas, shards, and visual elements
     */
    async _prepareTransition() {
        // Create canvas overlay
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'transition-crack-canvas';
        this.canvas.width = window.innerWidth * this.dpr;
        this.canvas.height = window.innerHeight * this.dpr;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '9998';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(this.dpr, this.dpr);

        // Create backdrop (behind landing page, not part of transition overlay)
        this.backdropEl = document.createElement('div');
        this.backdropEl.id = 'transition-backdrop';
        this.backdropEl.style.position = 'fixed';
        this.backdropEl.style.inset = '0';
        this.backdropEl.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.backdropEl.style.zIndex = '100'; // Low z-index, behind main page
        this.backdropEl.style.pointerEvents = 'none';
        document.body.appendChild(this.backdropEl);

        // Load Forge iframe (fills entire viewport, revealed by radial mask)
        this.forgeIframe = document.createElement('iframe');
        this.forgeIframe.id = 'transition-forge-iframe';
        this.forgeIframe.style.position = 'fixed';
        this.forgeIframe.style.top = '0';
        this.forgeIframe.style.left = '0';
        this.forgeIframe.style.width = '100vw';
        this.forgeIframe.style.height = '100vh';
        this.forgeIframe.style.zIndex = '9997'; // Above backdrop, below canvas
        this.forgeIframe.style.border = 'none';
        this.forgeIframe.style.pointerEvents = 'none'; // Disabled until reveal completes
        // Start with radial mask completely hidden (reveal starts at 0%)
        this.forgeIframe.style.maskImage = 'radial-gradient(circle at center, black 0%, transparent 0.1%)';
        this.forgeIframe.style.webkitMaskImage = 'radial-gradient(circle at center, black 0%, transparent 0.1%)';
        const baseUrl = window.location.origin === 'null' || window.location.protocol === 'file:'
            ? 'http://localhost:8000/Websites/Axxilak/Axxilak%20Forge%20v4.0%20-%20The%20Composer.html'
            : `${window.location.origin}/Websites/Axxilak/Axxilak%20Forge%20v4.0%20-%20The%20Composer.html`;
        const forgeUrl = `${baseUrl}?template=${this.selectedWebling}&t=${Date.now()}`;
        console.log(`[Transition] Loading Forge with URL: ${forgeUrl}`);
        this.forgeIframe.src = forgeUrl;
        document.body.appendChild(this.forgeIframe);

        // Generate shards using detected system performance
        const shardCount = this.detectedShardCount || 500; // Fallback to 500 if detection hasn't completed
        const generator = new VoronoiGenerator(window.innerWidth, window.innerHeight, {
            shardCount: shardCount
        });
        this.shards = generator.generate();
        console.log(`[Transition] Generating ${shardCount} shards for this system`);

        // Freeze page scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Main animation loop
     */
    _startAnimation() {
        this.startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - this.startTime;
            const progress = Math.min(elapsed / this.totalDuration, 1);

            // Clear canvas
            this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Multi-stage crack formation with dramatic pauses
            if (elapsed < this.crackFormationDuration) {
                const stageData = this._calculateCrackStage(elapsed);
                if (stageData.opacity > 0) { // Only draw if opacity > 0 (hide during pauses)
                    this._drawCracklines(stageData.radius, stageData.opacity);
                }
            } else if (elapsed < this.freezeFullDuration) {
                // Freeze at full screen
                this._drawCracklines(1, 1);
            }

            // Radial reveal starts 250ms before explosion
            const revealStartTime = this.freezeFullDuration - 250;
            if (elapsed >= revealStartTime && elapsed < this.navigateDuration) {
                const revealElapsed = elapsed - revealStartTime;
                const revealProgress = revealElapsed / (this.explosionDuration + 250);
                this._drawRadialReveal(revealProgress);
            }

            // Explosion + shard fall (1300-2200ms)
            if (elapsed >= this.freezeFullDuration && elapsed < this.navigateDuration) {
                const explosionElapsed = elapsed - this.freezeFullDuration;
                const explosionProgress = explosionElapsed / this.explosionDuration;

                // Draw falling shards (cracks wink out instantly)
                this._updateAndDrawShards(explosionProgress);
                this._animateCardExpansion(progress);
            }

            // Phase 4: Navigate to Forge (at 1800ms)
            if (elapsed >= this.navigateDuration) {
                this._navigateToForge();
                return;
            }

            // Continue animation
            this.animationFrameId = requestAnimationFrame(animate);
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    /**
     * Calculate multi-stage crack expansion with long dramatic pauses
     * Stage 1: expand to 33% (0-250ms = 0.25 seconds)
     * Freeze at 33% (250-1250ms = 1 second)
     * Stage 2: expand to 66% (1250-1500ms = 0.25 seconds)
     * Freeze at 66% (1500-2500ms = 1 second)
     * Stage 3: expand to 100% (2500-2750ms = 0.25 seconds)
     */
    _calculateCrackStage(elapsed) {
        // Stage 1: grow to 10% in 250ms
        if (elapsed < 250) {
            return { radius: 0.1 * (elapsed / 250), opacity: 1 };
        }
        // Pause 1: FROZEN at 10% for 1 second (stays visible)
        else if (elapsed < 1250) {
            return { radius: 0.1, opacity: 1 };
        }
        // Stage 2: grow from 10% to 100% (fill screen) in 500ms (TWICE AS LONG)
        else if (elapsed < 1750) {
            return { radius: 0.1 + (0.9 * (elapsed - 1250) / 500), opacity: 1 };
        }
        // Pause 2: FROZEN at 100% for 1 second (stays visible before explosion)
        else if (elapsed < 2750) {
            return { radius: 1.0, opacity: 1 };
        }
        // Keep full and visible for explosion phase
        return { radius: 1.0, opacity: 1 };
    }

    /**
     * Draw propagating crack lines with golden glow
     * @param {number} radiusMultiplier - 0 to 1 for how far cracks expand (0 = none, 1 = full screen)
     * @param {number} opacity - Opacity level (0 to 1)
     */
    _drawCracklines(radiusMultiplier, opacity) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const maxRadius = Math.max(window.innerWidth, window.innerHeight);

        this.ctx.strokeStyle = `rgba(212, 175, 55, ${1.0 * opacity})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowColor = 'rgba(212, 175, 55, 1.0)';
        this.ctx.shadowBlur = 80;

        // Draw expanding cracks from center
        const radius = maxRadius * radiusMultiplier;
        const crackCount = 8;

        for (let i = 0; i < crackCount; i++) {
            const angle = (i / crackCount) * Math.PI * 2;
            const endX = centerX + Math.cos(angle) * radius;
            const endY = centerY + Math.sin(angle) * radius;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }

        this.ctx.shadowBlur = 0;
    }

    /**
     * Update shard physics and render them
     */
    _updateAndDrawShards(explosionProgress) {
        if (explosionProgress < 0 || explosionProgress > 1) return;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        this.shards.forEach((shard, index) => {
            // Store initial position and vertex offsets on first frame
            if (shard.initialX === undefined) {
                shard.initialX = shard.centroid.x;
                shard.initialY = shard.centroid.y;
                // Store relative vertex positions
                shard.vertexOffsets = shard.vertices.map(v => ({
                    x: v.x - shard.centroid.x,
                    y: v.y - shard.centroid.y
                }));
                // Calculate radial burst direction (away from center)
                const dx = shard.initialX - centerX;
                const dy = shard.initialY - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // Unit vector pointing away from center
                shard.burstDirX = distance > 0 ? dx / distance : 0;
                shard.burstDirY = distance > 0 ? dy / distance : 0;
                // Initial burst speed with WIDE variance - some barely move, some launch far
                // Range: 0-22.5 (25% backed off from 30)
                shard.burstSpeed = Math.random() * 22.5;
                // 3D depth with extreme J-curve: only center pieces get massive force, fast falloff
                // Creates a few big violent shards surrounded by cascading smaller pieces
                const maxDist = Math.max(window.innerWidth, window.innerHeight) / 2;
                const normalizedDist = Math.min(distance / maxDist, 1); // 0 at center, 1 at edges
                shard.z = Math.pow(1 - normalizedDist, 6); // Extreme J-curve (sextic) - very sharp center peak

                // Center pieces fly EXTREMELY fast toward/past screen, edges move slowly
                // Only a couple pieces at absolute center get massive velocity, rest stay normal
                const velocityMultiplier = 0.15 + (shard.z * 14.85); // Range 0.15-15.0 (25% backed off)

                // Velocity trackers (accumulated each frame)
                shard.vx = shard.burstDirX * shard.burstSpeed * velocityMultiplier;
                // Aggressive upward/downward variation - strong upward launches
                shard.vy = shard.burstDirY * shard.burstSpeed * velocityMultiplier + (Math.random() - 0.5) * 45; // ±22.5 variation (25% backed off)
                // Position trackers (accumulate over frames)
                shard.x = shard.initialX;
                shard.y = shard.initialY;
            }

            // Apply frame-by-frame physics
            shard.vy += this.gravity; // Gravity accelerates downward
            shard.vx *= this.airResistance; // Air resistance dampens horizontal
            shard.vy *= this.airResistance; // Air resistance dampens vertical

            // Update position based on velocity (frame-by-frame accumulation)
            shard.x += shard.vx;
            shard.y += shard.vy;

            const newX = shard.x;
            const newY = shard.y;

            // Update centroid
            shard.centroid.x = newX;
            shard.centroid.y = newY;

            // Move vertices with centroid
            shard.vertices.forEach((v, i) => {
                v.x = newX + shard.vertexOffsets[i].x;
                v.y = newY + shard.vertexOffsets[i].y;
            });

            // Update rotation - no damping, spin at constant speed
            shard.rotation += shard.rotationSpeed;

            // Update 3D tumbling (pitch and yaw) - no damping, tumble at constant speed
            shard.pitch += shard.pitchSpeed;
            shard.yaw += shard.yawSpeed;

            // Keep full opacity until shard leaves screen, then fade
            const offscreenDistance = Math.max(
                Math.abs(shard.centroid.x - centerX) - window.innerWidth / 2,
                Math.abs(shard.centroid.y - centerY) - window.innerHeight / 2
            );
            if (offscreenDistance > 0) {
                shard.opacity = Math.max(0, 1 - (offscreenDistance / 200));
            } else {
                shard.opacity = 1;
            }

            // Draw shard
            this._drawShard(shard);
        });
    }

    /**
     * Draw individual shard with rotation, opacity, and 3D depth scaling
     */
    _drawShard(shard) {
        this.ctx.save();

        this.ctx.translate(shard.centroid.x, shard.centroid.y);
        this.ctx.rotate(shard.rotation);

        // 3D depth effect: EXTREME scaling for visible 3D parallax
        // Z range 0-1 creates massive scale range 0.1-4.0 and opacity range 0.3-1.0
        const depthScale = 0.1 + (shard.z * 3.9); // Scales from 0.1x to 4.0x (extremely dramatic!)
        const depthOpacity = 0.3 + (shard.z * 0.7); // Opacity factor 0.3 to 1.0

        this.ctx.scale(depthScale, depthScale);

        // Apply 3D tumbling effect (pitch and yaw)
        // Pitch: rotation around X axis (front-to-back) - affects vertical skew and scale
        const pitchFactor = Math.sin(shard.pitch); // -1 to 1
        const pitchScale = 1 + (pitchFactor * 0.5); // Scale 0.5x to 1.5x based on pitch (more dramatic)

        // Yaw: rotation around Y axis (side-to-side) - affects horizontal skew
        const yawFactor = Math.sin(shard.yaw); // -1 to 1

        // Apply 3D perspective: scale by pitch (rotate back = bigger, rotate forward = smaller)
        this.ctx.scale(pitchScale, pitchScale);

        // Apply EXTREME skew based on pitch and yaw for dramatic tumbling effect
        this.ctx.transform(1, pitchFactor * 0.5, yawFactor * 1.5, 1, 0, 0);

        // Add glow/shadow for pronounced effect
        this.ctx.shadowColor = `rgba(212, 175, 55, ${0.8 * depthOpacity})`;
        this.ctx.shadowBlur = 16;

        this.ctx.fillStyle = `rgba(212, 175, 55, ${shard.opacity * 0.206 * depthOpacity})`; // Even weaker fill
        this.ctx.strokeStyle = `rgba(212, 175, 55, ${shard.opacity * 1.875 * depthOpacity})`; // Even brighter lines
        this.ctx.lineWidth = 1.3 / depthScale; // Thinner, brighter lines

        this.ctx.beginPath();
        shard.vertices.forEach((v, i) => {
            const x = v.x - shard.centroid.x;
            const y = v.y - shard.centroid.y;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Animate radial mask reveal on Forge iframe
     * Expands from center outward, revealing Forge
     */
    _drawRadialReveal(explosionProgress) {
        // Calculate reveal radius as percentage of viewport
        const maxRadius = Math.max(window.innerWidth, window.innerHeight);
        const revealRadius = Math.min(explosionProgress * 150, 100); // 0-100% as explosion progresses

        // Update iframe mask to expand radially from center
        const maskGradient = `radial-gradient(circle at center, black ${revealRadius}%, transparent ${revealRadius}%)`;
        this.forgeIframe.style.maskImage = maskGradient;
        this.forgeIframe.style.webkitMaskImage = maskGradient; // Webkit prefix for Safari
    }

    /**
     * Animate card expansion from grid position to fullscreen
     */
    _animateCardExpansion(overallProgress) {
        if (!this.cardElement) return;

        const phaseProgress = Math.max(0, (overallProgress - this.cracklineDuration / this.totalDuration) /
            (this.fallDuration / this.totalDuration));

        if (phaseProgress < 0) return;

        // Get card's original position
        const rect = this.cardElement.getBoundingClientRect();
        const startScale = 1;
        const endScale = 1;

        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - phaseProgress, 3);

        // Calculate intermediate values
        const currentScale = startScale + (endScale - startScale) * eased;
        const offsetX = (window.innerWidth / 2 - (rect.left + rect.width / 2)) * eased;
        const offsetY = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * eased;

        // Apply transform to card
        this.cardElement.style.position = 'fixed';
        this.cardElement.style.zIndex = '9999';
        this.cardElement.style.transform = `
            translate(${offsetX}px, ${offsetY}px)
            scale(${currentScale + eased * 0.05})
        `;
        this.cardElement.style.opacity = 1;
    }

    /**
     * Complete transition and reveal fully-loaded Forge
     */
    _navigateToForge() {
        // Clean up animation
        this.isAnimating = false;
        cancelAnimationFrame(this.animationFrameId);

        // Enable Forge iframe interaction
        if (this.forgeIframe) {
            this.forgeIframe.style.pointerEvents = 'auto';
        }

        // Clean up animation overlays - Forge is now visible
        this._cleanup();
    }

    /**
     * Fallback navigation (instant redirect)
     */
    _fallbackNavigation() {
        this._cleanup();
        const baseUrl = window.location.origin === 'null' || window.location.protocol === 'file:'
            ? 'http://localhost:8000/Websites/Axxilak/Axxilak%20Forge%20v4.0%20-%20The%20Composer.html'
            : `${window.location.origin}/Websites/Axxilak/Axxilak%20Forge%20v4.0%20-%20The%20Composer.html`;
        const forgeUrl = `${baseUrl}?template=${this.selectedWebling}`;
        window.location.href = forgeUrl;
    }

    /**
     * Abort transition (e.g., on window resize or double-click)
     */
    abort() {
        if (!this.isAnimating) return;

        cancelAnimationFrame(this.animationFrameId);
        this._cleanup();
        this.isAnimating = false;
    }

    /**
     * Clean up animation overlays (keep iframe visible)
     */
    _cleanup() {
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }
        if (this.backdropEl) {
            this.backdropEl.remove();
            this.backdropEl = null;
        }
        if (this.cardElement) {
            this.cardElement.style.position = '';
            this.cardElement.style.zIndex = '';
            this.cardElement.style.transform = '';
            this.cardElement.style.opacity = '';
        }
        // forgeIframe stays visible - it fills the viewport seamlessly
        document.body.style.overflow = '';
    }

    /**
     * Handle window resize during animation
     */
    _setupEventListeners() {
        window.addEventListener('resize', () => {
            if (this.isAnimating) {
                this.abort();
            }
        });
    }
}

// Initialize global instance
let transitionEngine = null;

document.addEventListener('DOMContentLoaded', () => {
    transitionEngine = new CrackingTransition();
});
