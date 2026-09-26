/**
 * Neon Velocity - Particle Systems (Pooled & Zero-Allocation)
 * Handles Nitro thrust trails, drift smoke, speed lines, sparks, and collection sparkles.
 */

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;

        // 1. NITRO EXHAUST PARTICLES
        this.nitroCount = 200;
        this.nitroGeom = new THREE.BufferGeometry();
        this.nitroPos = new Float32Array(this.nitroCount * 3);
        this.nitroColors = new Float32Array(this.nitroCount * 3);
        this.nitroSizes = new Float32Array(this.nitroCount);
        this.nitroVel = [];
        this.nitroLife = new Float32Array(this.nitroCount);

        for (let i = 0; i < this.nitroCount; i++) {
            this.nitroPos[i * 3] = 0;
            this.nitroPos[i * 3 + 1] = -100; // Hidden initially
            this.nitroPos[i * 3 + 2] = 0;
            this.nitroColors[i * 3] = 0.0;
            this.nitroColors[i * 3 + 1] = 0.9;
            this.nitroColors[i * 3 + 2] = 1.0;
            this.nitroSizes[i] = 0.0;
            this.nitroLife[i] = 0.0;
            this.nitroVel.push({ x: 0, y: 0, z: 0 });
        }

        this.nitroGeom.setAttribute('position', new THREE.BufferAttribute(this.nitroPos, 3));
        this.nitroGeom.setAttribute('color', new THREE.BufferAttribute(this.nitroColors, 3));
        this.nitroGeom.setAttribute('size', new THREE.BufferAttribute(this.nitroSizes, 1));

        this.nitroMat = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.nitroMesh = new THREE.Points(this.nitroGeom, this.nitroMat);
        this.scene.add(this.nitroMesh);

        // 2. TIRE DRIFT SMOKE PARTICLES
        this.smokeCount = 150;
        this.smokeGeom = new THREE.BufferGeometry();
        this.smokePos = new Float32Array(this.smokeCount * 3);
        this.smokeSizes = new Float32Array(this.smokeCount);
        this.smokeLife = new Float32Array(this.smokeCount);
        this.smokeVel = [];

        for (let i = 0; i < this.smokeCount; i++) {
            this.smokePos[i * 3 + 1] = -100;
            this.smokeSizes[i] = 0.0;
            this.smokeLife[i] = 0.0;
            this.smokeVel.push({ x: 0, y: 0, z: 0 });
        }

        this.smokeGeom.setAttribute('position', new THREE.BufferAttribute(this.smokePos, 3));
        this.smokeGeom.setAttribute('size', new THREE.BufferAttribute(this.smokeSizes, 1));

        this.smokeMat = new THREE.PointsMaterial({
            color: 0x99aacc,
            size: 1.4,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });
        this.smokeMesh = new THREE.Points(this.smokeGeom, this.smokeMat);
        this.scene.add(this.smokeMesh);

        // 3. HIGH SPEED WARP LINES
        this.speedLinesCount = 120;
        this.speedLinesGeom = new THREE.BufferGeometry();
        this.speedLinesPos = new Float32Array(this.speedLinesCount * 6); // 2 vertices per line
        this.speedLinesData = [];

        for (let i = 0; i < this.speedLinesCount; i++) {
            const rx = (Math.random() - 0.5) * 22;
            const ry = Math.random() * 8 + 0.5;
            const rz = (Math.random() - 0.5) * 80;
            const len = Math.random() * 6 + 3;

            this.speedLinesData.push({ x: rx, y: ry, z: rz, len: len, speed: Math.random() * 30 + 60 });

            this.speedLinesPos[i * 6] = rx;
            this.speedLinesPos[i * 6 + 1] = ry;
            this.speedLinesPos[i * 6 + 2] = rz;

            this.speedLinesPos[i * 6 + 3] = rx;
            this.speedLinesPos[i * 6 + 4] = ry;
            this.speedLinesPos[i * 6 + 5] = rz - len;
        }

        this.speedLinesGeom.setAttribute('position', new THREE.BufferAttribute(this.speedLinesPos, 3));
        this.speedLinesMat = new THREE.LineBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.0, // Becomes visible at high speed
            blending: THREE.AdditiveBlending
        });
        this.speedLinesMesh = new THREE.LineSegments(this.speedLinesGeom, this.speedLinesMat);
        this.scene.add(this.speedLinesMesh);

        // 4. SPARKS & PICKUP POP PARTICLES
        this.sparkCount = 120;
        this.sparkGeom = new THREE.BufferGeometry();
        this.sparkPos = new Float32Array(this.sparkCount * 3);
        this.sparkColors = new Float32Array(this.sparkCount * 3);
        this.sparkLife = new Float32Array(this.sparkCount);
        this.sparkVel = [];

        for (let i = 0; i < this.sparkCount; i++) {
            this.sparkPos[i * 3 + 1] = -100;
            this.sparkLife[i] = 0;
            this.sparkColors[i * 3] = 1.0;
            this.sparkColors[i * 3 + 1] = 0.8;
            this.sparkColors[i * 3 + 2] = 0.2;
            this.sparkVel.push({ x: 0, y: 0, z: 0 });
        }

        this.sparkGeom.setAttribute('position', new THREE.BufferAttribute(this.sparkPos, 3));
        this.sparkGeom.setAttribute('color', new THREE.BufferAttribute(this.sparkColors, 3));

        this.sparkMat = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.sparkMesh = new THREE.Points(this.sparkGeom, this.sparkMat);
        this.scene.add(this.sparkMesh);

        this.nitroIndex = 0;
        this.smokeIndex = 0;
        this.sparkIndex = 0;
    }

    emitNitro(originX, originY, originZ, speed, carHeading) {
        for (let j = 0; j < 4; j++) {
            const idx = (this.nitroIndex++) % this.nitroCount;
            this.nitroPos[idx * 3] = originX + (Math.random() - 0.5) * 0.3;
            this.nitroPos[idx * 3 + 1] = originY + (Math.random() - 0.5) * 0.15;
            this.nitroPos[idx * 3 + 2] = originZ - 0.2;

            this.nitroLife[idx] = 1.0;
            this.nitroSizes[idx] = Math.random() * 0.8 + 0.4;

            // Electric blue or magenta flame color
            if (Math.random() > 0.3) {
                this.nitroColors[idx * 3] = 0.0;
                this.nitroColors[idx * 3 + 1] = 0.8;
                this.nitroColors[idx * 3 + 2] = 1.0;
            } else {
                this.nitroColors[idx * 3] = 0.9;
                this.nitroColors[idx * 3 + 1] = 0.1;
                this.nitroColors[idx * 3 + 2] = 0.9;
            }

            this.nitroVel[idx].x = (Math.random() - 0.5) * 0.6;
            this.nitroVel[idx].y = (Math.random() - 0.5) * 0.4;
            this.nitroVel[idx].z = -(speed * 0.5 + Math.random() * 8 + 12);
        }
    }

    emitDriftSmoke(wheelX, wheelY, wheelZ) {
        for (let j = 0; j < 2; j++) {
            const idx = (this.smokeIndex++) % this.smokeCount;
            this.smokePos[idx * 3] = wheelX + (Math.random() - 0.5) * 0.25;
            this.smokePos[idx * 3 + 1] = wheelY + 0.1;
            this.smokePos[idx * 3 + 2] = wheelZ + (Math.random() - 0.5) * 0.25;

            this.smokeLife[idx] = 1.0;
            this.smokeSizes[idx] = Math.random() * 0.6 + 0.4;

            this.smokeVel[idx].x = (Math.random() - 0.5) * 1.5;
            this.smokeVel[idx].y = Math.random() * 1.2 + 0.3;
            this.smokeVel[idx].z = -(Math.random() * 3 + 2);
        }
    }

    emitSparks(x, y, z, count = 12, colorHex = 0xffcc00) {
        const col = new THREE.Color(colorHex);
        for (let i = 0; i < count; i++) {
            const idx = (this.sparkIndex++) % this.sparkCount;
            this.sparkPos[idx * 3] = x;
            this.sparkPos[idx * 3 + 1] = y;
            this.sparkPos[idx * 3 + 2] = z;

            this.sparkLife[idx] = 1.0;
            this.sparkColors[idx * 3] = col.r;
            this.sparkColors[idx * 3 + 1] = col.g;
            this.sparkColors[idx * 3 + 2] = col.b;

            const speed = Math.random() * 8 + 4;
            const angle = Math.random() * Math.PI * 2;
            const up = Math.random() * 4 + 2;

            this.sparkVel[idx].x = Math.cos(angle) * speed;
            this.sparkVel[idx].y = up;
            this.sparkVel[idx].z = Math.sin(angle) * speed;
        }
    }

    update(dt, playerZ, speedRatio) {
        // 1. Update Nitro
        for (let i = 0; i < this.nitroCount; i++) {
            if (this.nitroLife[i] > 0) {
                this.nitroLife[i] -= dt * 4.5;
                if (this.nitroLife[i] <= 0) {
                    this.nitroPos[i * 3 + 1] = -100;
                    this.nitroSizes[i] = 0;
                } else {
                    this.nitroPos[i * 3] += this.nitroVel[i].x * dt;
                    this.nitroPos[i * 3 + 1] += this.nitroVel[i].y * dt;
                    this.nitroPos[i * 3 + 2] += this.nitroVel[i].z * dt;
                    this.nitroSizes[i] *= 0.94;
                }
            }
        }
        this.nitroGeom.attributes.position.needsUpdate = true;
        this.nitroGeom.attributes.size.needsUpdate = true;
        this.nitroGeom.attributes.color.needsUpdate = true;

        // 2. Update Smoke
        for (let i = 0; i < this.smokeCount; i++) {
            if (this.smokeLife[i] > 0) {
                this.smokeLife[i] -= dt * 1.8;
                if (this.smokeLife[i] <= 0) {
                    this.smokePos[i * 3 + 1] = -100;
                } else {
                    this.smokePos[i * 3] += this.smokeVel[i].x * dt;
                    this.smokePos[i * 3 + 1] += this.smokeVel[i].y * dt;
                    this.smokePos[i * 3 + 2] += this.smokeVel[i].z * dt;
                    this.smokeSizes[i] += dt * 0.9; // Smoke expands
                }
            }
        }
        this.smokeGeom.attributes.position.needsUpdate = true;
        this.smokeGeom.attributes.size.needsUpdate = true;

        // 3. Update Speed Lines
        const speedLineOpacity = Math.max(0, (speedRatio - 0.65) * 2.8);
        this.speedLinesMat.opacity = Math.min(speedLineOpacity, 0.85);

        if (this.speedLinesMat.opacity > 0.01) {
            for (let i = 0; i < this.speedLinesCount; i++) {
                const item = this.speedLinesData[i];
                item.z -= item.speed * dt * (speedRatio * 1.8);

                // Recycle lines ahead of player
                if (item.z < playerZ - 20) {
                    item.z = playerZ + 90 + Math.random() * 40;
                }

                this.speedLinesPos[i * 6] = item.x;
                this.speedLinesPos[i * 6 + 1] = item.y;
                this.speedLinesPos[i * 6 + 2] = item.z;

                this.speedLinesPos[i * 6 + 3] = item.x;
                this.speedLinesPos[i * 6 + 4] = item.y;
                this.speedLinesPos[i * 6 + 5] = item.z - item.len;
            }
            this.speedLinesGeom.attributes.position.needsUpdate = true;
        }

        // 4. Update Sparks
        for (let i = 0; i < this.sparkCount; i++) {
            if (this.sparkLife[i] > 0) {
                this.sparkLife[i] -= dt * 2.5;
                if (this.sparkLife[i] <= 0) {
                    this.sparkPos[i * 3 + 1] = -100;
                } else {
                    this.sparkVel[i].y -= 9.8 * dt; // Gravity
                    this.sparkPos[i * 3] += this.sparkVel[i].x * dt;
                    this.sparkPos[i * 3 + 1] += this.sparkVel[i].y * dt;
                    this.sparkPos[i * 3 + 2] += this.sparkVel[i].z * dt;

                    // Bounce on road
                    if (this.sparkPos[i * 3 + 1] < 0.05) {
                        this.sparkPos[i * 3 + 1] = 0.05;
                        this.sparkVel[i].y *= -0.4;
                    }
                }
            }
        }
        this.sparkGeom.attributes.position.needsUpdate = true;
    }
}

window.ParticleSystem = ParticleSystem;
