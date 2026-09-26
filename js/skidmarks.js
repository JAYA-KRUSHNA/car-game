/**
 * Neon Velocity - Realistic Tire Skid Marks System
 * Renders persistent rubber skid ribbons on the asphalt surface during drifts and hard braking.
 */

class SkidmarkSystem {
    constructor(scene) {
        this.scene = scene;
        this.maxPoints = 400; // 200 quad segments
        this.pointIndex = 0;

        this.geom = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.maxPoints * 3);
        this.opacities = new Float32Array(this.maxPoints);

        for (let i = 0; i < this.maxPoints; i++) {
            this.positions[i * 3] = 0;
            this.positions[i * 3 + 1] = -100; // Hidden initially
            this.positions[i * 3 + 2] = 0;
            this.opacities[i] = 0;
        }

        this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geom.setAttribute('opacity', new THREE.BufferAttribute(this.opacities, 1));

        // Skidmark material (dark burnt rubber)
        this.mat = new THREE.MeshBasicMaterial({
            color: 0x111115,
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        // Generate indices for triangle strip / quads
        const indices = [];
        for (let i = 0; i < this.maxPoints - 2; i += 2) {
            indices.push(i, i + 1, i + 2);
            indices.push(i + 1, i + 3, i + 2);
        }
        this.geom.setIndex(indices);

        this.mesh = new THREE.Mesh(this.geom, this.mat);
        this.mesh.receiveShadow = false;
        this.scene.add(this.mesh);

        this.lastLeftPos = null;
        this.lastRightPos = null;
    }

    addSkidmark(wheelLeftPos, wheelRightPos, intensity = 1.0) {
        if (!wheelLeftPos || !wheelRightPos) return;

        const idx = this.pointIndex;
        const width = 0.28; // Tire tread contact patch width

        // Left tire segment
        this.positions[idx * 3] = wheelLeftPos.x;
        this.positions[idx * 3 + 1] = 0.025; // Slight offset above asphalt to avoid Z-fighting
        this.positions[idx * 3 + 2] = wheelLeftPos.z;

        this.positions[(idx + 1) * 3] = wheelRightPos.x;
        this.positions[(idx + 1) * 3 + 1] = 0.025;
        this.positions[(idx + 1) * 3 + 2] = wheelRightPos.z;

        this.pointIndex = (this.pointIndex + 2) % (this.maxPoints - 2);

        this.geom.attributes.position.needsUpdate = true;
    }

    reset() {
        for (let i = 0; i < this.maxPoints; i++) {
            this.positions[i * 3 + 1] = -100;
        }
        this.geom.attributes.position.needsUpdate = true;
        this.pointIndex = 0;
    }
}

window.SkidmarkSystem = SkidmarkSystem;
