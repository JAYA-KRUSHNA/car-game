/**
 * Neon Velocity - AI Traffic & Pickups Management (Pooled & Zero-Lag)
 * Controls smart traffic vehicles, lane switching, near-miss detection, and collectibles.
 */

class TrafficManager {
    constructor(scene, carFactory, particleSystem) {
        this.scene = scene;
        this.carFactory = carFactory;
        this.particles = particleSystem;

        // Highway lanes (4 lanes across road width 22)
        this.lanes = [-8.25, -2.75, 2.75, 8.25];

        // Vehicle Pool
        this.poolSize = 18;
        this.vehicles = [];

        // Pickups Pool (Coins & Nitro)
        this.pickupPoolSize = 12;
        this.pickups = [];

        this.initVehiclePool();
        this.initPickupPool();

        // Temp vectors for allocation-free distance and collision math
        this._boxPlayer = new THREE.Box3();
        this._boxTraffic = new THREE.Box3();
    }

    initVehiclePool() {
        const types = ['sedan', 'sedan', 'suv', 'truck', 'sedan'];

        for (let i = 0; i < this.poolSize; i++) {
            const type = types[i % types.length];
            const carData = this.carFactory.createTrafficCar(type);
            carData.group.position.set(0, -100, 0); // Stored underground initially
            this.scene.add(carData.group);

            this.vehicles.push({
                ...carData,
                active: false,
                lane: 0,
                targetX: 0,
                speed: 0,
                baseSpeed: 0,
                isChangingLane: false,
                laneChangeTimer: 0,
                nearMissClaimed: false
            });
        }
    }

    initPickupPool() {
        // Shared geometry & materials for collectibles
        const coinGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.16, 8);
        coinGeom.rotateX(Math.PI / 2);
        const coinMat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0xaa7700
        });

        const nitroGeom = new THREE.OctahedronGeometry(0.65, 0);
        const nitroMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            metalness: 0.8,
            roughness: 0.1,
            emissive: 0x0088cc
        });

        const shieldGeom = new THREE.IcosahedronGeometry(0.65, 1);
        const shieldMat = new THREE.MeshStandardMaterial({
            color: 0xff00cc,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0x880066,
            wireframe: true
        });

        for (let i = 0; i < this.pickupPoolSize; i++) {
            const group = new THREE.Group();
            let type = 'coin';
            let mesh;

            if (i % 5 === 3) {
                type = 'nitro';
                mesh = new THREE.Mesh(nitroGeom, nitroMat);
            } else if (i % 5 === 4) {
                type = 'shield';
                mesh = new THREE.Mesh(shieldGeom, shieldMat);
            } else {
                type = 'coin';
                mesh = new THREE.Mesh(coinGeom, coinMat);
            }

            // Floating glow light
            const light = new THREE.PointLight(
                type === 'nitro' ? 0x00f0ff : (type === 'shield' ? 0xff00cc : 0xffcc00),
                1.5,
                4
            );
            light.position.set(0, 0, 0);

            group.add(mesh);
            group.add(light);
            group.position.set(0, -100, 0);
            this.scene.add(group);

            this.pickups.push({
                group: group,
                mesh: mesh,
                type: type,
                active: false
            });
        }
    }

    reset(startZ = 0) {
        for (const v of this.vehicles) {
            v.active = false;
            v.group.position.set(0, -100, 0);
            v.nearMissClaimed = false;
        }
        for (const p of this.pickups) {
            p.active = false;
            p.group.position.set(0, -100, 0);
        }

        // Spawn initial wave ahead of player
        for (let i = 0; i < 8; i++) {
            const laneIdx = Math.floor(Math.random() * this.lanes.length);
            const z = startZ + 45 + i * 32 + (Math.random() - 0.5) * 10;
            this.spawnVehicleAt(laneIdx, z);
        }

        // Spawn initial pickups
        for (let i = 0; i < 4; i++) {
            const laneIdx = Math.floor(Math.random() * this.lanes.length);
            const z = startZ + 30 + i * 55;
            this.spawnPickupAt(laneIdx, z);
        }
    }

    spawnVehicleAt(laneIdx, z) {
        const inactive = this.vehicles.find(v => !v.active);
        if (!inactive) return;

        const laneX = this.lanes[laneIdx];
        
        // Ensure no overlapping vehicle nearby in same lane
        for (const v of this.vehicles) {
            if (v.active && Math.abs(v.group.position.x - laneX) < 2.0 && Math.abs(v.group.position.z - z) < 18) {
                return; // Lane occupied, skip
            }
        }

        let speed = 90; // MPH
        if (inactive.type === 'truck') speed = 80 + Math.random() * 15;
        else if (inactive.type === 'suv') speed = 100 + Math.random() * 20;
        else speed = 110 + Math.random() * 25;

        inactive.active = true;
        inactive.lane = laneIdx;
        inactive.targetX = laneX;
        inactive.group.position.set(laneX, 0, z);
        inactive.group.rotation.set(0, 0, 0);
        inactive.speed = speed;
        inactive.baseSpeed = speed;
        inactive.isChangingLane = false;
        inactive.laneChangeTimer = Math.random() * 8 + 6;
        inactive.nearMissClaimed = false;
    }

    spawnPickupAt(laneIdx, z) {
        const inactive = this.pickups.find(p => !p.active);
        if (!inactive) return;

        inactive.active = true;
        inactive.group.position.set(this.lanes[laneIdx], 0.9, z);
    }

    update(dt, playerCar, playerSpeed, onNearMiss, onCollectPickup, onCrash) {
        const playerPos = playerCar.group.position;
        const playerSpeedKmh = playerSpeed; // in game speed units

        // 1. UPDATE VEHICLES
        for (let i = 0; i < this.vehicles.length; i++) {
            const v = this.vehicles[i];
            if (!v.active) continue;

            // Move vehicle forward based on its speed (converted to world units/sec)
            // (100 MPH approx 44 m/s in scaled coords)
            const speedMps = (v.speed / 2.237) * 0.45;
            v.group.position.z += speedMps * dt;

            // Rotate wheels
            for (const w of v.wheels) {
                w.rotation.x += speedMps * dt * 3.5;
            }

            // Lane change AI logic
            v.laneChangeTimer -= dt;
            if (v.laneChangeTimer <= 0 && !v.isChangingLane) {
                v.laneChangeTimer = Math.random() * 10 + 8;
                // 50% chance to switch to adjacent lane if clear
                if (Math.random() > 0.5) {
                    const dir = Math.random() > 0.5 ? 1 : -1;
                    const nextLane = v.lane + dir;
                    if (nextLane >= 0 && nextLane < this.lanes.length) {
                        v.lane = nextLane;
                        v.targetX = this.lanes[nextLane];
                        v.isChangingLane = true;
                    }
                }
            }

            // Smooth lane shift interpolation
            if (v.isChangingLane) {
                const dx = v.targetX - v.group.position.x;
                v.group.position.x += dx * 3.0 * dt;
                v.group.rotation.y = dx * 0.12; // Slight turn angle during lane shift
                if (Math.abs(dx) < 0.05) {
                    v.group.position.x = v.targetX;
                    v.group.rotation.y = 0;
                    v.isChangingLane = false;
                }
            }

            // CHECK COLLISIONS WITH PLAYER
            const dz = Math.abs(v.group.position.z - playerPos.z);
            const dx = Math.abs(v.group.position.x - playerPos.x);

            const hitDistZ = (v.length / 2) + 2.1;
            const hitDistX = (v.width / 2) + 0.95;

            // Collision check
            if (dz < hitDistZ && dx < hitDistX) {
                onCrash(v);
                return;
            }

            // NEAR-MISS / CLOSE-CALL DETECTION (Passed close within shaving distance at speed)
            if (!v.nearMissClaimed && playerSpeed > 100) {
                // If player is overtaking this vehicle
                if (playerPos.z > v.group.position.z && (playerPos.z - v.group.position.z) < 3.5) {
                    // Margin: very close lateral distance without crashing
                    if (dx > hitDistX - 0.2 && dx < hitDistX + 1.2 && dz < hitDistZ + 1.5) {
                        v.nearMissClaimed = true;
                        this.particles.emitSparks(
                            (playerPos.x + v.group.position.x) / 2,
                            0.5,
                            playerPos.z,
                            14,
                            0x00f0ff
                        );
                        onNearMiss(v);
                    }
                }
            }

            // Despawn vehicles that fall far behind or are too far ahead
            if (v.group.position.z < playerPos.z - 40 || v.group.position.z > playerPos.z + 320) {
                v.active = false;
                v.group.position.set(0, -100, 0);
            }
        }

        // 2. SPAWN NEW TRAFFIC AHEAD
        let activeCount = this.vehicles.filter(v => v.active).length;
        if (activeCount < 10) {
            const laneIdx = Math.floor(Math.random() * this.lanes.length);
            const spawnZ = playerPos.z + 160 + Math.random() * 80;
            this.spawnVehicleAt(laneIdx, spawnZ);
        }

        // 3. UPDATE PICKUPS
        for (let i = 0; i < this.pickups.length; i++) {
            const p = this.pickups[i];
            if (!p.active) continue;

            // Spin & bob animation
            p.mesh.rotation.y += 3.5 * dt;
            p.mesh.rotation.z += 1.2 * dt;
            p.group.position.y = 0.9 + Math.sin(Date.now() * 0.005 + i) * 0.2;

            // Collect check
            const dz = Math.abs(p.group.position.z - playerPos.z);
            const dx = Math.abs(p.group.position.x - playerPos.x);

            if (dz < 2.5 && dx < 1.7) {
                // Collected!
                p.active = false;
                p.group.position.set(0, -100, 0);
                this.particles.emitSparks(
                    playerPos.x,
                    0.9,
                    playerPos.z + 1.0,
                    20,
                    p.type === 'nitro' ? 0x00f0ff : (p.type === 'shield' ? 0xff00ff : 0xffd700)
                );
                onCollectPickup(p.type);
            }

            // Despawn behind
            if (p.group.position.z < playerPos.z - 30) {
                p.active = false;
                p.group.position.set(0, -100, 0);
            }
        }

        // Spawn new pickups ahead
        const activePickups = this.pickups.filter(p => p.active).length;
        if (activePickups < 4) {
            const laneIdx = Math.floor(Math.random() * this.lanes.length);
            const spawnZ = playerPos.z + 140 + Math.random() * 90;
            this.spawnPickupAt(laneIdx, spawnZ);
        }
    }
}

window.TrafficManager = TrafficManager;
