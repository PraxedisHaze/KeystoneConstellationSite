/**
 * Voronoi Fracture Generator
 * Generates Voronoi-based shard patterns for cracking background effect
 * Uses d3-delaunay for computational geometry
 */

class VoronoiGenerator {
    constructor(width, height, options = {}) {
        this.width = width;
        this.height = height;
        this.shardCount = options.shardCount || 85;
        this.seed = options.seed || Math.random();
        this.borderInset = options.borderInset || 40; // Keep shards away from edges
        this.cachedPatterns = [];
    }

    /**
     * Generate a single Voronoi fracture pattern
     * Returns array of shard objects with geometry and physics properties
     */
    generate() {
        const points = this._generateSeedPoints();
        const shards = this._computeVoronoiShards(points);
        return shards;
    }

    /**
     * Generate pseudo-random seed points weighted toward center
     * Creates more natural-looking fractures with denser center
     */
    _generateSeedPoints() {
        const points = [];
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.max(this.width, this.height) / 2;

        for (let i = 0; i < this.shardCount; i++) {
            // Gaussian distribution weighted toward center
            const angle = Math.random() * Math.PI * 2;
            const randomRadius = Math.sqrt(Math.random()) * maxRadius * 0.8;

            const x = centerX + Math.cos(angle) * randomRadius;
            const y = centerY + Math.sin(angle) * randomRadius;

            // Clamp to viewport with inset
            const clampedX = Math.max(this.borderInset, Math.min(this.width - this.borderInset, x));
            const clampedY = Math.max(this.borderInset, Math.min(this.height - this.borderInset, y));

            points.push([clampedX, clampedY]);
        }

        return points;
    }

    /**
     * Compute Voronoi diagram and convert to shard objects
     * Each shard gets physics properties (velocity, rotation, opacity)
     */
    _computeVoronoiShards(points) {
        // Using d3-delaunay (loaded globally)
        if (typeof d3 === 'undefined' || !d3.Delaunay) {
            console.warn('d3-delaunay not loaded. Using fallback circular shards.');
            return this._generateFallbackShards(points);
        }

        try {
            const delaunay = d3.Delaunay.from(points);
            const voronoi = delaunay.voronoi([0, 0, this.width, this.height]);

            const shards = [];
            for (let i = 0; i < points.length; i++) {
                const cell = voronoi.cellPolygon(i);
                if (!cell) continue;

                const vertices = cell.map(p => ({ x: p[0], y: p[1] }));
                const centroid = this._calculateCentroid(vertices);

                shards.push({
                    id: i,
                    vertices: vertices,
                    centroid: centroid,
                    // Physics properties
                    vx: (Math.random() - 0.5) * 3, // Horizontal velocity
                    vy: 2 + Math.random() * 3, // Gravity downward
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.08,
                    // 3D rotation (tumbling in 3D space)
                    pitch: Math.random() * Math.PI * 2, // X-axis rotation (front-to-back)
                    yaw: Math.random() * Math.PI * 2, // Y-axis rotation (side-to-side)
                    pitchSpeed: (Math.random() - 0.5) * 0.25, // Faster tumble
                    yawSpeed: (Math.random() - 0.5) * 0.25,
                    opacity: 1,
                    // Animation timing
                    delay: Math.random() * 100, // Stagger effect
                    duration: 800 + Math.random() * 400
                });
            }

            return shards;
        } catch (e) {
            console.warn('Voronoi computation failed:', e);
            return this._generateFallbackShards(points);
        }
    }

    /**
     * Fallback: Generate circular shards if d3-delaunay unavailable
     * Ensures graceful degradation
     */
    _generateFallbackShards(points) {
        return points.map((p, i) => ({
            id: i,
            // Approximate circular shard
            vertices: this._generateCircleVertices(p[0], p[1], 20),
            centroid: { x: p[0], y: p[1] },
            vx: (Math.random() - 0.5) * 3,
            vy: 2 + Math.random() * 3,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
            // 3D rotation
            pitch: Math.random() * Math.PI * 2,
            yaw: Math.random() * Math.PI * 2,
            pitchSpeed: (Math.random() - 0.5) * 0.12,
            yawSpeed: (Math.random() - 0.5) * 0.12,
            opacity: 1,
            delay: Math.random() * 100,
            duration: 800 + Math.random() * 400
        }));
    }

    /**
     * Generate vertices for a circle approximation
     */
    _generateCircleVertices(cx, cy, radius, points = 8) {
        const vertices = [];
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            vertices.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }
        return vertices;
    }

    /**
     * Calculate centroid of polygon (average of all vertices)
     */
    _calculateCentroid(vertices) {
        let x = 0, y = 0;
        vertices.forEach(v => {
            x += v.x;
            y += v.y;
        });
        return {
            x: x / vertices.length,
            y: y / vertices.length
        };
    }

    /**
     * Generate and cache multiple patterns for performance
     * Allows instant fracture creation without recomputation
     */
    generateCachedPatterns(count = 5) {
        this.cachedPatterns = [];
        for (let i = 0; i < count; i++) {
            this.cachedPatterns.push(this.generate());
        }
        return this.cachedPatterns;
    }

    /**
     * Get a random cached pattern
     */
    getRandomPattern() {
        if (this.cachedPatterns.length === 0) {
            return this.generate();
        }
        return this.cachedPatterns[Math.floor(Math.random() * this.cachedPatterns.length)];
    }
}
