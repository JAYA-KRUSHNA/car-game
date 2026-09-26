/**
 * Neon Velocity - Realistic Live Cars AI Traffic Management
 * Features:
 * - Smart AI behavior: Safe following distance, collision avoidance, overtaking.
 * - Live dynamic lighting: Functional brake lights that flare on deceleration,
 *   and flashing amber turn signal indicators that blink during lane changes!
 * - Smooth S-curve lane shifts with realistic vehicle roll.
 * - Multi-tier vehicles: Executive Sedans, Urban SUVs, Sports Coupes, Commercial Heavy Haulers.
 */

class TrafficManager {
    constructor(scene, carFactory, particleSystem) {
        this.scene = scene;
        this.carFactory = carFactory;
        this.particles = particleSystem;

        // 4 Highway Lanes (road width 22, lanes at x = -8.25, -2.75, 2.75, 8.25)
        this.lanes = [-8.25, -2.75, 2.75, 8.25];

        // Vehicle Pool
        this.poolSize = 18;
        this.vehicles = [];

        // Collectibles Pool
        this.pickupPoolSize = 12;
        this.pickups = [];

        this.blinkTimer = 0;
        this.blinkState = false;

        this.initVehiclePool();
        this.initPickupPool();
    }

    initVehiclePool() {
        const types = ['sedan', 'sedan', 'suv', 'coupe', 'truck', 'sedan'];

        for (let i = 0; i < this.poolSize; i++) {
            const type = types[i % types.length];
            const carData = this.carFactory.createTrafficCar(type);
            carData.group.position.set(0, -100, 0);
            this.scene.add(carData.group);

            this.vehicles.push({
                ...carData,
                active: false,
                lane: 0,
                targetX: 0,
                speed: 0,
                baseSpeed: 0,
                targetSpeed: 0,
                isBraking: false,
                isChangingLane: false,
                blinkDir: 0, // -1: left, 1: right, 0: off
                laneChangeTimer: 0,
                laneChangeProgress: 0,
                nearMissClaimed: false
            });
        }
    }

    initPickupPool() {
        const coinGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.16, 12);
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

            const light = new THREE.PointLight(
                type === 'nitro' ? 0x00f0ff : (type === 'shield' ? 0xff00cc : 0xffcc00),
                1.6,
                4.5
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
            v.isChangingLane = false;
            v.blinkDir = 0;
            v.updateLighting(false, 0, false);
        }
        for (const p of this.pickups) {
            p.active = false;
            p.group.position.set(0, -100, 0);
        }

        // Spawn initial wave of realistic traffic
        for (let i = 0; i < 9; i++) {
            const laneIdx = Math.floor(Math.random() * this.lanes.length);
            const z = startZ + 45 + i * 32 + (Math.random() - 0.5) * 8;
            this.spawnVehicleAt(laneIdx, z);
        }

        for (let i = 0; i < 4; i++) {
            const laneIdx = Math.floor(Math.random() * this.lanes.length);
            const z = startZ + 35 + i * 55;
            this.spawnPickupAt(laneIdx, z);
        }
    }

    spawnVehicleAt(laneIdx, z) {
        const inactive = this.vehicles.find(v => !v.active);
        if (!inactive) return;

        const laneX = this.lanes[laneIdx];

        // Ensure clear spawn space
        for (const v of this.vehicles) {
            if (v.active && Math.abs(v.group.position.x - laneX) < 2.0 && Math.abs(v.group.position.z - z) < 22) {
                return;
            }
        }

        let speed = 90;
        if (inactive.type === 'truck') {
            speed = 78 + Math.random() * 14;
        } else if (inactive.type === 'suv') {
            speed = 95 + Math.random() * 20;
        } else if (inactive.type === 'coupe') {
            speed = 120 + Math.random() * 25; // Faster sports car
        } else {
            speed = 105 + Math.random() * 20;
        }

        inactive.active = true;
        inactive.lane = laneIdx;
        inactive.targetX = laneX;
        inactive.group.position.set(laneX, 0, z);
        inactive.group.rotation.set(0, 0, 0);
        inactive.speed = speed;
        inactive.baseSpeed = speed;
        inactive.targetSpeed = speed;
        inactive.isBraking = false;
        inactive.isChangingLane = false;
        inactive.blinkDir = 0;
        inactive.laneChangeTimer = Math.random() * 7 + 5;
        inactive.laneChangeProgress = 0;
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

        // Turn signal flash timing (~2.5 Hz blinker cycle)
        this.blinkTimer += dt;
        if (this.blinkTimer > 0.22) {
            this.blinkTimer = 0;
            this.blinkState = !this.blinkState;
        }

        // 1. UPDATE AI TRAFFIC
        for (let i = 0; i < this.vehicles.length; i++) {
            const v = this.vehicles[i];
            if (!v.active) continue;

            // Check for vehicle ahead in same lane (Safe following distance logic)
            let carAheadDist = Infinity;
            let carAheadSpeed = 0;
            for (let j = 0; j < this.vehicles.length; j++) {
                if (i === j) continue;
                const other = this.vehicles[j];
                if (other.active && Math.abs(other.group.position.x - v.group.position.x) < 2.0) {
                    const dz = other.group.position.z - v.group.position.z;
                    if (dz > 0 && dz < carAheadDist) {
                        carAheadDist = dz;
                        carAheadSpeed = other.speed;
                    }
                }
            }

            // Safe following distance braking
            if (carAheadDist < 25) {
                // Apply brakes to match or slow below car ahead
                v.targetSpeed = Math.min(v.baseSpeed, carAheadSpeed * 0.95);
                v.isBraking = true;
            } else {
                v.targetSpeed = v.baseSpeed;
                v.isBraking = false;
            }

            // Smooth speed acceleration / braking adjustment
            const speedAdjustRate = v.isBraking ? 25 : 12;
            v.speed += (v.targetSpeed - v.speed) * dt * (speedAdjustRate / 10);

            // Move vehicle forward
            const speedMps = (v.speed / 2.237) * 0.45;
            v.group.position.z += speedMps * dt;

            // Spin wheels
            for (const w of v.wheels) {
                w.rotation.x += speedMps * dt * 3.5;
            }

            // Smart Lane Change AI
            v.laneChangeTimer -= dt;
            if (v.laneChangeTimer <= 0 && !v.isChangingLane) {
                v.laneChangeTimer = Math.random() * 8 + 6;

                // If stuck behind slow vehicle or random chance
                if (carAheadDist < 30 || Math.random() > 0.45) {
                    const dir = Math.random() > 0.5 ? 1 : -1;
                    const nextLane = v.lane + dir;
                    if (nextLane >= 0 && nextLane < this.lanes.length) {
                        // Check if target lane is clear
                        const targetX = this.lanes[nextLane];
                        let laneClear = true;
                        for (const other of this.vehicles) {
                            if (other.active && other !== v) {
                                if (Math.abs(other.group.position.x - targetX) < 2.2) {
                                    if (Math.abs(other.group.position.z - v.group.position.z) < 24) {
                                        laneClear = false;
                                        break;
                                    }
                                }
                            }
                        }

                        if (laneClear) {
                            v.lane = nextLane;
                            v.targetX = targetX;
                            v.isChangingLane = true;
                            v.blinkDir = dir; // Activate left/right turn signal!
                            v.laneChangeProgress = 0;
                        }
                    }
                }
            }

            // Smooth S-curve lane shift interpolation
            if (v.isChangingLane) {
                const dx = v.targetX - v.group.position.x;
                v.group.position.x += dx * 3.2 * dt;

                // Vehicle yaw and roll into lane shift
                v.group.rotation.y = dx * 0.14;
                v.group.rotation.z = -dx * 0.04;

                if (Math.abs(dx) < 0.06) {
                    v.group.position.x = v.targetX;
                    v.group.rotation.y = 0;
                    v.group.rotation.z = 0;
                    v.isChangingLane = false;
                    v.blinkDir = 0; // Turn off blinker once lane change is complete
                }
            }

            // Update Live Vehicle Lighting (Brake lights + Blinker)
            v.updateLighting(v.isBraking, v.blinkDir, this.blinkState);

            // COLLISION DETECTION WITH PLAYER
            const dz = Math.abs(v.group.position.z - playerPos.z);
            const dx = Math.abs(v.group.position.x - playerPos.x);

            const hitDistZ = (v.length / 2) + 2.15;
            const hitDistX = (v.width / 2) + 0.98;

            if (dz < hitDistZ && dx < hitDistX) {
                onCrash(v);
                return;
            }

            // NEAR-MISS CLOSE CALL SYSTEM
            if (!v.nearMissClaimed && playerSpeed > 100) {
                if (playerPos.z > v.group.position.z && (playerPos.z - v.group.position.z) < 3.8) {
                    if (dx > hitDistX - 0.2 && dx < hitDistX + 1.25 && dz < hitDistZ + 1.6) {
                        v.nearMissClaimed = true;
                        this.particles.emitSparks(
                            (playerPos.x + v.group.position.x) / 2,
                            0.5,
                            playerPos.z,
                            16,
                            0x00f0ff
                        );
                        onNearMiss(v);
                    }
                }
            }

            // Despawn vehicles outside bounds
            if (v.group.position.z < playerPos.z - 45 || v.group.position.z > playerPos.z + 330) {
                v.active = false;
                v.group.position.set(0, -100, 0);
            }
        }

        // 2. SPAWN NEW TRAFFIC AHEAD
        const activeCount = this.vehicles.filter(v => v.active).length;
        if (activeCount < 10) {
            const laneIdx = Math.floor(Math.random() * this.lanes.length);
            const spawnZ = playerPos.z + 160 + Math.random() * 80;
            this.spawnVehicleAt(laneIdx, spawnZ);
        }

        // 3. UPDATE PICKUPS
        for (let i = 0; i < this.pickups.length; i++) {
            const p = this.pickups[i];
            if (!p.active) continue;

            p.mesh.rotation.y += 3.5 * dt;
            p.mesh.rotation.z += 1.2 * dt;
            p.group.position.y = 0.9 + Math.sin(Date.now() * 0.005 + i) * 0.2;

            const dz = Math.abs(p.group.position.z - playerPos.z);
            const dx = Math.abs(p.group.position.x - playerPos.x);

            if (dz < 2.5 && dx < 1.7) {
                p.active = false;
                p.group.position.set(0, -100, 0);
                this.particles.emitSparks(
                    playerPos.x,
                    0.9,
                    playerPos.z + 1.0,
                    22,
                    p.type === 'nitro' ? 0x00f0ff : (p.type === 'shield' ? 0xff00ff : 0xffd700)
                );
                onCollectPickup(p.type);
            }

            if (p.group.position.z < playerPos.z - 30) {
                p.active = false;
                p.group.position.set(0, -100, 0);
            }
        }

        const activePickups = this.pickups.filter(p => p.active).length;
        if (activePickups < 4) {
            const laneIdx = Math.floor(Math.random() * this.lanes.length);
            const spawnZ = playerPos.z + 140 + Math.random() * 90;
            this.spawnPickupAt(laneIdx, spawnZ);
        }
    }
}

window.TrafficManager = TrafficManager;
