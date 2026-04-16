import * as THREE from 'three';

class CinematicStrucity3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // Remove old Axxilak canvas placeholder if it exists
        this.container.style.position = 'relative';
        const canvas = this.container.querySelector('canvas');
        if (canvas) canvas.remove();

        this.scene = new THREE.Scene();
        // Background color removed to allow CSS starfield image to underlay WebGL canvas with zero draw-calls
        // Exponential fog creates deep space depth for geometry fading into the background
        this.scene.fog = new THREE.FogExp2(0x030303, 0.005);

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false });
        this.renderer.setClearColor(0x000000, 0); // Explicitly enforce absolute 0 alpha to reveal the static CSS stars
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.9; // Lowered exposure significantly deepens the mid-tones to pull out natural contrast
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Core Physics Parameters
        this.baseR = 1.0; 
        this.maxRings = 10; // Mathematical depth (yields ~300 circles, allowing closer geometry)
        this.planetRadius = 40; 
        
        // State Machine
        this.circlesData = [];
        this.circleMeshes = [];
        this.geometryGroup = new THREE.Group();
        this.scene.add(this.geometryGroup);
        
        this.visibleCount = 0;
        this.speed = 0.05;
        this.state = 'SINGULARITY';
        this.swoopProgress = 0;
        
        // Let there be light
        this.setupPlanet();
        
        // Camera starts precisely top-down, looking directly at the North Pole.
        // Zoomed in extremely tight so the mathematical hex dominates the biological hex.
        this.camera.position.set(0, this.planetRadius + 15, 0);
        this.camera.lookAt(0, 0, 0); 
        
        // Geometry hovers directly over the singularity (North Pole)
        // Bind it to the planet so it inextricably rotates with the surface
        this.planet.add(this.geometryGroup);
        this.geometryGroup.position.set(0, this.planetRadius + 0.1, 0);
        // Rotate geometry so it lays flat along the planetary pole (XZ plane)
        this.geometryGroup.rotation.x = -Math.PI / 2;

        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        this.generatePoints();
        
        this.clock = new THREE.Clock();
        this.animate();
    }


    setupPlanet() {
        const textureLoader = new THREE.TextureLoader();
        
        // 1. The True Saturn Globe
        const geometry = new THREE.SphereGeometry(this.planetRadius, 64, 64);
        const mapTex = textureLoader.load('saturn_map2.jpg');
        
        // Force high-contrast rendering if supported
        if (THREE.SRGBColorSpace) mapTex.colorSpace = THREE.SRGBColorSpace;
        else if (THREE.sRGBEncoding) mapTex.encoding = THREE.sRGBEncoding;
        
        // We dim the planet to slightly lower the blinding transmission bleed through the dust
        const material = new THREE.MeshStandardMaterial({
            map: mapTex,
            bumpMap: mapTex, // Zero-shader trick: using color map as bump forces the storm lines to cast micro-shadows
            bumpScale: 0.15, // Cranked severely to wildly exaggerate the storm ridges
            roughness: 0.8,
            metalness: 0.0, // Removed the sheen so the dark bands go pitch black in the micro-shadows
            emissive: new THREE.Color(0x000000), 
            color: 0xffffff 
        });

        this.planet = new THREE.Mesh(geometry, material);
        // CRITICAL FIX: The planet MUST receive shadows so the Rings can cast their intricate striped shadows across the globe.
        this.planet.receiveShadow = true;
        this.planet.castShadow = false; // Kept false to prevent the dreaded blocky terminator self-shadowing 

        // 1.5 The Phantom Shadow Planet
        // A slightly shrunken invisible clone. Because it is physically smaller than the visible planet,
        // its shadow map depth is strictly deeper than the planet's surface, mathematically 
        // preventing any self-shadowing acne on the planet, while flawlessly casting the vast planetary shadow 
        // far out into space where it beautifully cuts across the back of the rings!
        const shadowPlanetGeo = new THREE.SphereGeometry(this.planetRadius * 0.98, 64, 64);
        const shadowPlanetMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
        const shadowPlanet = new THREE.Mesh(shadowPlanetGeo, shadowPlanetMat);
        shadowPlanet.castShadow = true;
        this.planet.add(shadowPlanet);
        
        // 2. The Magnificent Rings
        const innerRad = this.planetRadius * 1.2;
        const outerRad = this.planetRadius * 2.3;
        const ringGeo = new THREE.RingGeometry(innerRad, outerRad, 128);
        
        // We must brutally override Three.js default bounding-box UVs into true radial UVs perfectly mapping the NASA strip
        const pos = ringGeo.attributes.position;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            let len = v3.length();
            let v = (len - innerRad) / (outerRad - innerRad);
            // The texture strip maps horizontally across the radius
            ringGeo.attributes.uv.setXY(i, v, 1);
        }
        
        const ringColorTex = textureLoader.load(window.SATURN_RING_COLOR);
        const ringAlphaTex = textureLoader.load(window.SATURN_RING_ALPHA);
        
        // --- The One-Way Shadow Valve ---
        //
        // Two meshes, one geometry. The shadow map pass and the color pass are
        // completely separate in WebGL — colorWrite: false makes a mesh invisible
        // to the eye without removing it from the shadow map.
        //
        // shadowRings  — invisible, castShadow only. Puts the ring pattern into the
        // shadow map so the planet receives the ring's shadow. Never
        // renders to the color or depth buffer, so canvas punch-through
        // is impossible and it cannot receive its own shadow.
        //
        // rings        — visible, receiveShadow only. DoubleSide so it survives planet
        // tilt and rotation from any camera angle. Never casts, so it
        // cannot appear in the shadow map and cannot produce acne on itself.

        const shadowRingMat = new THREE.MeshBasicMaterial({
            alphaMap: ringAlphaTex,
            alphaTest: 0.1,       // Cast shadow only where the dust is actually present
            transparent: false,   // Not needed — alphaTest handles the gaps
            colorWrite: false,    // Invisible to the eye
            depthWrite: false,    // Invisible to the depth buffer
            side: THREE.DoubleSide,
        });
        const shadowRings = new THREE.Mesh(ringGeo, shadowRingMat);
        shadowRings.rotation.x = -Math.PI / 2;
        shadowRings.castShadow = true;
        shadowRings.receiveShadow = false;
        this.planet.add(shadowRings);

        const ringMat = new THREE.MeshStandardMaterial({
            map: ringColorTex,
            emissiveMap: ringColorTex, // The secret Braid fix: uses the texture to illuminate the dark side perfectly
            emissive: new THREE.Color(0x110d0a), // Dropped to a faint whisper to violently deepen the cast shadow to near-black
            alphaMap: ringAlphaTex,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            color: 0x998a7a, // Shifted from pure matte gray to a dusty, warm orange-tinted gray
            roughness: 0.8,
        });

        const rings = new THREE.Mesh(ringGeo, ringMat);
        rings.rotation.x = -Math.PI / 2;
        rings.castShadow = false;
        rings.receiveShadow = true;
        this.planet.add(rings);
        
        // 3. The Physical Polar Hexagon Graft (Bypassing Spherical UV Pinching)
        // Grafting a flat circular geometry directly over the pole
        const hexGeo = new THREE.CircleGeometry(this.planetRadius * 0.32, 64);
        const hexTex = textureLoader.load(window.SATURN_HEX_CAP);
        if (THREE.SRGBColorSpace) hexTex.colorSpace = THREE.SRGBColorSpace;
        else if (THREE.sRGBEncoding) hexTex.encoding = THREE.sRGBEncoding;

        const hexMat = new THREE.MeshStandardMaterial({
            map: hexTex,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending, // Deep blacks fade out, natively feathering the storm borders into the planet
            depthWrite: false, // Prevents depth collisions with geometry
            color: 0xffffff, // Max vibrance to let the raw Cassini spectrum show through
            roughness: 0.9
        });
        
        this.polarCap = new THREE.Mesh(hexGeo, hexMat);
        this.polarCap.position.set(0, this.planetRadius + 0.05, 0); // Sits underneath the golden Flower of Life (which is at +0.1)
        this.polarCap.rotation.x = -Math.PI / 2;
        this.polarCap.renderOrder = 2; // Under the eclipse overlay
        this.planet.add(this.polarCap);
        
        // Planet remains strictly upright (Z=0) so the top-down 2D illusion is mathematically perfect
        // The tilt will be simulated by the camera swoop trajectory
        this.scene.add(this.planet);
        
        // Deeper void shadows to plunge the eclipse and unlit hemisphere into total pitch black
        const ambient = new THREE.AmbientLight(0xffffff, 0.01); // 1% ambient floor to preserve submersion and absolute physical starkness
        this.scene.add(ambient);
        
        // The Origin Point Light
        // Reach reduced from 60 to 15. The Flower of Life geometry extends ~10 units
        // from the pole — reach 15 covers it. At reach 60, the light was reaching the
        // equatorial dark side (~58 units away), bleeding white through the transparent rings.
        this.poleLight = new THREE.PointLight(0x00f0ff, 1.0, 15);
        this.poleLight.position.set(0, this.planetRadius + 3, 0);
        this.planet.add(this.poleLight);
        
        // Crisp, pure white sunlight to allow the Cassini texture to perfectly render its own natural, realistic colors without tinting
        // Dropped intensity slightly further to prevent blowing out the delicate contrasting storm bands
        this.dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
        // Pulled all the way to the side and behind the planet (Z = -20 instead of +30).
        // This forces the terminator forward, plunging most of the camera-facing hemisphere into deep shadow 
        // and leaving only a dramatic, thin crescent highlight on the outer edge.
        this.dirLight.position.set(100, 10, -20); 
        this.dirLight.castShadow = true;
        
        // Enveloping the infinite diagonal shadow tail entirely to eradicate the 'Square'
        this.dirLight.shadow.mapSize.width = 4096;
        this.dirLight.shadow.mapSize.height = 4096;
        this.dirLight.shadow.camera.near = 1;
        // Far must exceed the light-to-far-ring-edge distance to avoid
        // the hard shadow cutoff across the back half of the rings.
        this.dirLight.shadow.camera.far = 600;
        // Expanded to 4.0x completely removes any chance of the shadow frustum diagonally clipping the planet
        this.dirLight.shadow.camera.left = -this.planetRadius * 4.0;
        this.dirLight.shadow.camera.right = this.planetRadius * 4.0;
        this.dirLight.shadow.camera.top = this.planetRadius * 4.0;
        this.dirLight.shadow.camera.bottom = -this.planetRadius * 4.0;

        // CRITICAL MISSING ENGINE COMMAND: Forcing the GPU to accept the expanded matrix bounds.
        this.dirLight.shadow.camera.updateProjectionMatrix();

        this.dirLight.shadow.bias = -0.0005; // Proper microscopic offset as planned
        this.dirLight.shadow.normalBias = 0; // Removed backface inversion bug 
        
        this.scene.add(this.dirLight);

        // -----------------------------------------------------------------------------------------
        // THE TRUE PLANETARY SUN
        // -----------------------------------------------------------------------------------------

        // Soft Ring Shine (Fill Light for the planet's dark side)
        this.ringShineLight = new THREE.DirectionalLight(0xffeebb, 0.8);
        this.ringShineLight.position.set(-80, -20, -30);
        this.scene.add(this.ringShineLight);
        
        // The Deep Space Starfield has been fully stripped to permanently eliminate driver TDR loading spikes.
        // It is replaced by a zero-cost CSS static backdrop honoring the Law of the Living context limits.
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    generatePoints() {
        // Pre-compute coordinates
        for (let q = -this.maxRings; q <= this.maxRings; q++) {
            for (let r = -this.maxRings; r <= this.maxRings; r++) {
                let s = -q - r;
                let ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
                if (ring <= this.maxRings) {
                    let x = this.baseR * (q + r / 2);
                    let y = this.baseR * (r * Math.sqrt(3) / 2);
                    this.circlesData.push({ x, y, ring });
                }
            }
        }
        
        // Map to chronological expansion
        this.circlesData.sort((a, b) => {
            if (a.ring !== b.ring) return a.ring - b.ring;
            let angleA = Math.atan2(a.y, a.x);
            let angleB = Math.atan2(b.y, b.x);
            return angleA - angleB;
        });
        
        // Single optimized circular path
        const circleGeo = new THREE.BufferGeometry();
        const points = [];
        const segments = 64;
        for(let i=0; i<=segments; i++) {
            let theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(theta)*this.baseR, Math.sin(theta)*this.baseR, 0));
        }
        circleGeo.setFromPoints(points);
        
        // Generate Line meshes
        for(let i=0; i<this.circlesData.length; i++) {
            let p = this.circlesData[i];
            
            let isFirstOfRing = false;
            if (i === 0) { isFirstOfRing = true; } 
            else if (p.ring > this.circlesData[i-1].ring) { isFirstOfRing = true; }
            
            // All components of the Flower of Life are now unified in sovereign gold
            let color = 0xfbbf24; 
            let opacity = isFirstOfRing ? 1.0 : 0.6;
            
            let mat = new THREE.LineBasicMaterial({ 
                color: color, 
                transparent: true, 
                opacity: opacity,
                depthWrite: false, 
                blending: THREE.AdditiveBlending 
            });
            
            let line = new THREE.Line(circleGeo, mat);
            line.position.set(p.x, p.y, 0); 
            line.visible = false; // Hidden at origin time
            line.userData.baselineOpacity = opacity; // Cache baseline for sparkle recovery
            
            this.geometryGroup.add(line);
            this.circleMeshes.push(line);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        let dt = this.clock.getDelta();
        
        // Rotate the planet smoothly along its Y axis (which is tilted via Z)
        if(this.planet) {
            this.planet.rotation.y -= 0.05 * dt;
        }

        // Spin the geometry slightly independent of planet
        // Z is the local UP axis because we rotated the plane -90deg on X.
        // Reversed direction to counter-rotate against the biological cap.
        this.geometryGroup.rotation.z -= 0.1 * dt; 

        // Execute form creation
        let renderCount = Math.min(Math.floor(this.visibleCount), this.circleMeshes.length);
        for(let i = 0; i < renderCount; i++) {
            this.circleMeshes[i].visible = true;
        }

        // Structural Sparkle Physics
        // Random glares rapidly flash across the mathematical matrix as it spins
        this.circleMeshes.forEach((mesh) => {
            if (mesh.visible) {
                if (Math.random() > 0.99) {
                    mesh.material.opacity = 2.5; // Massive additive flash blowout
                } else {
                    // Decay back to baseline effortlessly
                    mesh.material.opacity += (mesh.userData.baselineOpacity - mesh.material.opacity) * 0.05;
                }
            }
        });

        // Sequence State Machine
        if (this.visibleCount < this.circleMeshes.length) {
            this.visibleCount += this.speed;
            
            let currentMaxRing = renderCount > 0 ? this.circlesData[renderCount - 1].ring : 0;

            if (currentMaxRing === 0) {
                this.speed = 0.05; 
            } else if (currentMaxRing <= 2) {
                this.speed *= 1.02; 
            } else {
                this.speed *= 1.04;
                if (this.speed > 50) this.speed = 50; 
            }

            // Cinematic condition: Trigger HOLD once the math completes
            if (this.state === 'SINGULARITY' && currentMaxRing >= this.maxRings) {
                this.state = 'HOLD';
                this.holdTimer = 0;
            }
        } 
        
        // Contemplation Phase: Hold the camera rigidly on the polar alignment for 7 seconds
        if (this.state === 'HOLD') {
            this.holdTimer += dt;
            if (this.holdTimer >= 7.0) {
                this.state = 'SWOOP';
            }
        }

        // The Cinematic Swoop
        if(this.state === 'SWOOP') {
            // Unveil the deep space background flawlessly as we dive into 3D space
            const spaceBg = document.getElementById('space-background');
            if (spaceBg && spaceBg.style.opacity === '0') {
                spaceBg.style.opacity = '0.6';
            }

            this.swoopProgress += dt * 0.2; // Speed of the camera move
            if (this.swoopProgress >= 1) {
                this.swoopProgress = 1;
                this.state = 'FADE_CAP'; // Proceed to dissolve the photographic layer
            }

            // EaseInOutQuad curve
            let t = this.swoopProgress < 0.5 ? 2 * this.swoopProgress * this.swoopProgress : -1 + (4 - 2 * this.swoopProgress) * this.swoopProgress;
            
            // Cock the entire planet massively to its true axial tilt (dragging geometry and rings with it)
            this.planet.rotation.z = 0.55 * t; // 0.55 rad is ~31 degrees, an aggressive cinematic tilt
            
            // Start vector precisely matches the top-down contemplation initialization to permanently remove the telemetry stutter
            // Target: Swoop diagonally down to (35, 15, 85).
            let startY = this.planetRadius + 15;
            let startZ = 0;
            let startX = 0;
            
            let targetY = 15; 
            let targetZ = 85;
            let targetX = 35;
            
            this.camera.position.y = startY + (targetY - startY) * t;
            this.camera.position.z = startZ + (targetZ - startZ) * t;
            this.camera.position.x = startX + (targetX - startX) * t;

            // Shift focus down slightly so Saturn dominates the screen
            this.camera.lookAt(0, this.planetRadius * 0.4, 0); 
        }

        // Dissolve the empirical Cassini photograph to leave only the theoretical Anothen math.
        if(this.state === 'FADE_CAP') {
            if(this.polarCap && this.polarCap.material.opacity > 0) {
                this.polarCap.material.opacity -= dt * 0.5; // Smooth 2-second fade
                if(this.polarCap.material.opacity <= 0) {
                    this.polarCap.material.opacity = 0;
                    this.polarCap.visible = false;
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Expose to global scope so the non-module inline script in index.html can initialize it
window.CinematicStrucity3D = CinematicStrucity3D;
