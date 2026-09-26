/**
 * Neon Velocity - Realistic Automotive & Superbike Game Engine
 * Features:
 * - 7 Playable Vehicles: Hypercars, Tuners, and High-Performance Superbikes!
 * - Realistic motorcycle leaning dynamics (up to 28° lean angle into turns)
 * - Corrected steering orientation (Left moves Left, points Left, leans Left; Right moves Right, points Right, leans Right)
 * - Active aero motorized wing & air brake
 * - Heated brake disc glow
 * - Persistent tire rubber skid marks
 * - Exhaust backfire crackles with dynamic ground light
 * - Photorealistic PCFSoftShadowMap shadows & atmospheric sky dome
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.state = 'MENU';

        // 7 Playable Vehicles (Cars & Superbikes)
        this.carKeys = ['apex', 'spectre', 'ninja', 'horizon', 'viper', 'kaneda', 'valkyrie'];
        this.selectedCarIndex = 0;

        this.customColors = {
            apex: { paint: 0x00d8ff, underglow: 0x00f0ff },
            spectre: { paint: 0xff0066, underglow: 0xff00aa },
            ninja: { paint: 0x00ff44, underglow: 0x00ff88 },
            horizon: { paint: 0x2255dd, underglow: 0x0088ff },
            viper: { paint: 0xee2200, underglow: 0xff3300 },
            kaneda: { paint: 0xff1122, underglow: 0xff0044 },
            valkyrie: { paint: 0xffcc00, underglow: 0xffbb00 }
        };

        this.credits = parseInt(localStorage.getItem('nv_credits') || '1500', 10);
        this.highScore = parseInt(localStorage.getItem('nv_highscore') || '0', 10);
        this.unlockedCars = JSON.parse(localStorage.getItem('nv_unlocked') || '["apex"]');

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.world = null;
        this.traffic = null;
        this.particles = null;
        this.skidmarks = null;
        this.playerCar = null;

        this.cameraMode = 0; // 0: Chase, 1: Hood/Handlebars, 2: Cockpit/Helmet, 3: Top-Down
        this.baseFov = 64;
        this.currentFov = 64;

        this.speed = 0;
        this.maxSpeed = 218;
        this.baseMaxSpeed = 218;
        this.acceleration = 36;
        this.handling = 18;
        this.currentGear = 1;
        this.rpm = 1100;
        this.lateralSpeed = 0;

        // Suspension & Leaning Dynamics
        this.carHeading = 0; // Yaw
        this.carPitch = 0;   // Squat / Dive
        this.carRoll = 0;    // Lean / Bank
        this.suspensionY = 0;
        this.isDrifting = false;
        this.driftIntensity = 0;

        this.backfireTimer = 0;
        this.isBackfiring = false;

        this.nitroAmount = 100;
        this.isNitroActive = false;
        this.nitroDrainRate = 22;
        this.nitroRechargeRate = 4.5;

        this.shieldTimer = 0;

        this.score = 0;
        this.distanceTraveled = 0;
        this.maxSpeedReached = 0;
        this.nearMissCount = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            drift: false,
            nitro: false
        };

        this.garageTurntableAngle = 0;
        this.isDraggingGarage = false;
        this.lastMouseX = 0;

        this._camTarget = new THREE.Vector3();
        this._camPos = new THREE.Vector3();
        this._wheelRLPos = new THREE.Vector3();
        this._wheelRRPos = new THREE.Vector3();
        this._lastTime = performance.now();

        this.initThree();
        this.initSubsystems();
        this.initPlayerCar();
        this.bindEvents();
        this.updateMenuUI();

        this.animate();
    }

    initThree() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            this.baseFov,
            window.innerWidth / window.innerHeight,
            0.1,
            650
        );
        this.camera.position.set(0, 5, -8);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        // Turntable pedestal
        const pedestalGeom = new THREE.CylinderGeometry(4.3, 4.5, 0.45, 36);
        const pedestalMat = new THREE.MeshStandardMaterial({
            color: 0x111624,
            metalness: 0.85,
            roughness: 0.2
        });
        this.pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
        this.pedestal.receiveShadow = true;
        this.pedestal.position.set(0, -0.22, 0);

        const ringGeom = new THREE.TorusGeometry(4.35, 0.07, 12, 48);
        ringGeom.rotateX(Math.PI / 2);
        this.pedestalRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        this.pedestalRing = new THREE.Mesh(ringGeom, this.pedestalRingMat);
        this.pedestal.add(this.pedestalRing);
        this.scene.add(this.pedestal);
    }

    initSubsystems() {
        this.particles = new ParticleSystem(this.scene);
        this.skidmarks = new SkidmarkSystem(this.scene);
        this.world = new World(this.scene);
        this.traffic = new TrafficManager(this.scene, window.carFactory, this.particles);
    }

    initPlayerCar() {
        const key = this.carKeys[this.selectedCarIndex];
        const colors = this.customColors[key];

        if (this.playerCar) {
            this.scene.remove(this.playerCar.group);
        }

        this.playerCar = window.carFactory.createVehicle(key, colors.paint, colors.underglow);
        this.scene.add(this.playerCar.group);

        const preset = CAR_PRESETS[key];
        this.baseMaxSpeed = preset.topSpeed;
        this.maxSpeed = preset.topSpeed;
        this.acceleration = 26 + preset.acceleration * 2.6;
        this.handling = 15 + preset.handling * 1.25;

        if (this.pedestalRingMat) {
            this.pedestalRingMat.color.setHex(colors.underglow);
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onResize());

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        this.bindTouchControls();
        this.bindUIButtons();

        // Garage Turntable Drag
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.state === 'GARAGE' || this.state === 'MENU') {
                this.isDraggingGarage = true;
                this.lastMouseX = e.clientX;
            }
        });
        window.addEventListener('mousemove', (e) => {
            if (this.isDraggingGarage) {
                const dx = e.clientX - this.lastMouseX;
                this.garageTurntableAngle += dx * 0.008;
                this.lastMouseX = e.clientX;
            }
        });
        window.addEventListener('mouseup', () => {
            this.isDraggingGarage = false;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if ((this.state === 'GARAGE' || this.state === 'MENU') && e.touches.length > 0) {
                this.isDraggingGarage = true;
                this.lastMouseX = e.touches[0].clientX;
            }
        });
        window.addEventListener('touchmove', (e) => {
            if (this.isDraggingGarage && e.touches.length > 0) {
                const dx = e.touches[0].clientX - this.lastMouseX;
                this.garageTurntableAngle += dx * 0.01;
                this.lastMouseX = e.touches[0].clientX;
            }
        });
        window.addEventListener('touchend', () => {
            this.isDraggingGarage = false;
        });
    }

    onKeyDown(e) {
        if (e.repeat) return;
        const code = e.code;

        if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = true;
        if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = true;
        if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
        if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;
        if (code === 'Space') {
            this.keys.drift = true;
            e.preventDefault();
        }
        if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.nitro = true;

        if (code === 'KeyC') this.cycleCamera();
        if (code === 'KeyP' || code === 'Escape') this.togglePause();
        if (code === 'KeyM') this.toggleSound();
        if (code === 'KeyH') window.soundEngine.playHorn(false);

        window.soundEngine.ensureContext();
    }

    onKeyUp(e) {
        const code = e.code;
        if (code === 'KeyW' || code === 'ArrowUp') {
            this.keys.up = false;
            if (this.rpm > 5500 && Math.random() > 0.4) {
                this.triggerExhaustBackfire();
            }
        }
        if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = false;
        if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
        if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
        if (code === 'Space') this.keys.drift = false;
        if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.nitro = false;
    }

    bindTouchControls() {
        const setupTouchBtn = (id, keyName) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const startHandler = (e) => {
                e.preventDefault();
                this.keys[keyName] = true;
                window.soundEngine.ensureContext();
            };
            const endHandler = (e) => {
                e.preventDefault();
                this.keys[keyName] = false;
                if (keyName === 'up' && this.rpm > 5500) {
                    this.triggerExhaustBackfire();
                }
            };
            btn.addEventListener('touchstart', startHandler);
            btn.addEventListener('touchend', endHandler);
            btn.addEventListener('mousedown', startHandler);
            btn.addEventListener('mouseup', endHandler);
        };

        setupTouchBtn('touch-left', 'left');
        setupTouchBtn('touch-right', 'right');
        setupTouchBtn('touch-gas', 'up');
        setupTouchBtn('touch-brake', 'drift');
        setupTouchBtn('touch-nitro', 'nitro');
    }

    bindUIButtons() {
        document.getElementById('btn-play-game').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.startRace();
        });
        // Track / Map Selection Modals
        document.getElementById('btn-open-maps')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.switchScreen('MAPS');
        });
        document.getElementById('btn-open-maps-from-garage')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.switchScreen('MAPS');
        });
        document.getElementById('btn-close-maps')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.switchScreen('MENU');
        });
        document.getElementById('btn-race-from-maps')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.startRace();
        });

        // Map Cards Selection
        const mapCards = document.querySelectorAll('.map-card');
        mapCards.forEach(card => {
            card.addEventListener('click', () => {
                mapCards.forEach(c => {
                    c.classList.remove('active');
                    const btn = c.querySelector('.btn-choose-map');
                    if (btn) btn.textContent = 'SELECT TRACK';
                });
                card.classList.add('active');
                const myBtn = card.querySelector('.btn-choose-map');
                if (myBtn) myBtn.textContent = '✓ CURRENT TRACK';

                const mapId = card.getAttribute('data-map');
                this.world.setMap(mapId);

                const badge = document.getElementById('hud-track-badge');
                if (badge && this.world.currentMap) {
                    badge.textContent = `📍 ${this.world.currentMap.name.toUpperCase()}`;
                }
                const envSelect = document.getElementById('setting-perf-mode');
                if (envSelect) envSelect.value = mapId;

                window.soundEngine.playClick();
            });
        });

        document.getElementById('btn-open-garage').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.switchScreen('GARAGE');
        });
        document.getElementById('btn-open-settings').addEventListener('click', () => {
            window.soundEngine.playClick();
            document.getElementById('screen-settings').classList.add('active');
        });
        document.getElementById('btn-close-settings').addEventListener('click', () => {
            window.soundEngine.playClick();
            document.getElementById('screen-settings').classList.remove('active');
        });
        document.getElementById('btn-toggle-sound-menu').addEventListener('click', () => {
            this.toggleSound();
        });

        document.getElementById('btn-close-garage').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.switchScreen('MENU');
        });
        document.getElementById('btn-race-from-garage').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.startRace();
        });
        document.getElementById('btn-prev-car').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.navigateCar(-1);
        });
        document.getElementById('btn-next-car').addEventListener('click', () => {
            window.soundEngine.playClick();
            this.navigateCar(1);
        });
        document.getElementById('btn-garage-action').addEventListener('click', () => {
            this.handleGarageAction();
        });

        const paintDots = document.querySelectorAll('#paint-swatches .color-dot');
        paintDots.forEach(dot => {
            dot.addEventListener('click', () => {
                paintDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                const col = parseInt(dot.getAttribute('data-color'), 16);
                const currentKey = this.carKeys[this.selectedCarIndex];
                this.customColors[currentKey].paint = col;
                this.playerCar.setColor(col);
                window.soundEngine.playClick();
            });
        });

        const underglowDots = document.querySelectorAll('#underglow-swatches .color-dot');
        underglowDots.forEach(dot => {
            dot.addEventListener('click', () => {
                underglowDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                const col = parseInt(dot.getAttribute('data-color'), 16);
                const currentKey = this.carKeys[this.selectedCarIndex];
                this.customColors[currentKey].underglow = col;
                this.playerCar.setUnderglow(col);
                if (this.pedestalRingMat) this.pedestalRingMat.color.setHex(col);
                window.soundEngine.playClick();
            });
        });

        document.getElementById('btn-switch-camera').addEventListener('click', () => {
            this.cycleCamera();
        });
        document.getElementById('btn-pause-game').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('btn-resume-game').addEventListener('click', () => {
            this.togglePause();
        });
        document.getElementById('btn-restart-game').addEventListener('click', () => {
            this.startRace();
        });
        document.getElementById('btn-exit-garage').addEventListener('click', () => {
            this.switchScreen('GARAGE');
        });
        document.getElementById('btn-exit-menu').addEventListener('click', () => {
            this.switchScreen('MENU');
        });

        document.getElementById('btn-go-restart').addEventListener('click', () => {
            this.startRace();
        });
        document.getElementById('btn-go-garage').addEventListener('click', () => {
            this.switchScreen('GARAGE');
        });

        document.getElementById('setting-vol-master').addEventListener('input', (e) => {
            window.soundEngine.setMasterVolume(e.target.value / 100);
        });
        document.getElementById('setting-vol-music').addEventListener('input', (e) => {
            if (window.soundEngine.musicGain) {
                window.soundEngine.musicGain.gain.setValueAtTime(e.target.value / 100, window.soundEngine.ctx.currentTime);
            }
        });

        const envSelect = document.getElementById('setting-perf-mode');
        if (envSelect) {
            envSelect.addEventListener('change', (e) => {
                this.world.setMap(e.target.value);
                const badge = document.getElementById('hud-track-badge');
                if (badge && this.world.currentMap) {
                    badge.textContent = `📍 ${this.world.currentMap.name.toUpperCase()}`;
                }
            });
        }
    }

    switchScreen(newScreen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.state = newScreen;

        if (newScreen === 'MENU') {
            document.getElementById('screen-menu').classList.add('active');
            this.pedestal.visible = true;
            this.pedestal.position.set(0, -0.22, 0);
            this.playerCar.group.position.set(0, 0, 0);
            this.playerCar.group.rotation.set(0, 0, 0);
            window.soundEngine.stopMusic();
            this.updateMenuUI();
        } else if (newScreen === 'MAPS') {
            document.getElementById('screen-maps').classList.add('active');
            this.pedestal.visible = true;
            this.pedestal.position.set(0, -0.22, 0);
            this.playerCar.group.position.set(0, 0, 0);
            this.playerCar.group.rotation.set(0, 0, 0);
            window.soundEngine.stopMusic();
        } else if (newScreen === 'GARAGE') {
            document.getElementById('screen-garage').classList.add('active');
            this.pedestal.visible = true;
            this.pedestal.position.set(0, -0.22, 0);
            this.playerCar.group.position.set(0, 0, 0);
            this.playerCar.group.rotation.set(0, 0, 0);
            window.soundEngine.stopMusic();
            this.updateGarageUI();
        } else if (newScreen === 'PLAYING') {
            document.getElementById('screen-hud').classList.add('active');
            this.pedestal.visible = false;
            window.soundEngine.startMusic();
        } else if (newScreen === 'PAUSED') {
            document.getElementById('screen-pause').classList.add('active');
        } else if (newScreen === 'GAMEOVER') {
            document.getElementById('screen-gameover').classList.add('active');
            window.soundEngine.stopMusic();
        }
    }

    startRace() {
        this.speed = 0;
        this.currentGear = 1;
        this.rpm = 1100;
        this.score = 0;
        this.distanceTraveled = 0;
        this.maxSpeedReached = 0;
        this.nearMissCount = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
        this.nitroAmount = 100;
        this.shieldTimer = 0;
        this.lateralSpeed = 0;
        this.carHeading = 0;
        this.carPitch = 0;
        this.carRoll = 0;
        this.suspensionY = 0;

        this.playerCar.group.position.set(0, 0, 0);
        this.playerCar.group.rotation.set(0, 0, 0);

        this.traffic.reset(0);
        this.skidmarks.reset();

        this.updateHUD(0);
        document.getElementById('combo-popup').classList.remove('show');
        document.getElementById('hud-combo-badge').classList.remove('visible');
        document.getElementById('hud-shield').classList.remove('active');
        document.getElementById('gameover-new-record').classList.remove('show');

        this.switchScreen('PLAYING');
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('screen-pause').classList.add('active');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('screen-pause').classList.remove('active');
            document.getElementById('screen-hud').classList.add('active');
        }
    }

    toggleSound() {
        const isMuted = window.soundEngine.toggleMute();
        const soundBtns = [document.getElementById('btn-toggle-sound-menu')];
        soundBtns.forEach(btn => {
            if (btn) btn.textContent = isMuted ? '🔇' : '🔊';
        });
    }

    cycleCamera() {
        this.cameraMode = (this.cameraMode + 1) % 4;
        window.soundEngine.playClick();
    }

    navigateCar(dir) {
        this.selectedCarIndex = (this.selectedCarIndex + dir + this.carKeys.length) % this.carKeys.length;
        this.initPlayerCar();
        this.updateGarageUI();
    }

    handleGarageAction() {
        const key = this.carKeys[this.selectedCarIndex];
        const preset = CAR_PRESETS[key];
        const isUnlocked = this.unlockedCars.includes(key);

        if (!isUnlocked) {
            if (this.credits >= preset.price) {
                this.credits -= preset.price;
                this.unlockedCars.push(key);
                localStorage.setItem('nv_credits', this.credits.toString());
                localStorage.setItem('nv_unlocked', JSON.stringify(this.unlockedCars));
                window.soundEngine.playCoin();
                this.updateGarageUI();
            } else {
                alert(`Not enough credits! You need ${preset.price.toLocaleString()} CR.`);
            }
        }
    }

    updateMenuUI() {
        document.getElementById('menu-credits-display').textContent = this.credits.toLocaleString();
    }

    updateGarageUI() {
        const key = this.carKeys[this.selectedCarIndex];
        const preset = CAR_PRESETS[key];
        const isUnlocked = this.unlockedCars.includes(key);

        document.getElementById('garage-credits-display').textContent = this.credits.toLocaleString();
        document.getElementById('garage-car-index').textContent = `VEHICLE ${this.selectedCarIndex + 1} / ${this.carKeys.length} ${preset.type === 'bike' ? '🏍️ SUPERBIKE' : '🏎️ HYPERCAR'}`;
        document.getElementById('garage-car-name').textContent = preset.name;
        document.getElementById('garage-car-tagline').textContent = preset.tagline;

        document.getElementById('stat-val-speed').textContent = `${preset.topSpeed} MPH`;
        document.getElementById('stat-fill-speed').style.width = `${(preset.topSpeed / 260) * 100}%`;

        document.getElementById('stat-val-accel').textContent = `${preset.acceleration} / 10`;
        document.getElementById('stat-fill-accel').style.width = `${preset.acceleration * 10}%`;

        document.getElementById('stat-val-handling').textContent = `${preset.handling} / 10`;
        document.getElementById('stat-fill-handling').style.width = `${preset.handling * 10}%`;

        document.getElementById('stat-val-nitro').textContent = `${preset.nitroPower} / 10`;
        document.getElementById('stat-fill-nitro').style.width = `${preset.nitroPower * 10}%`;

        const actionBtn = document.getElementById('btn-garage-action');
        if (isUnlocked) {
            actionBtn.textContent = 'SELECTED & ACTIVE';
            actionBtn.className = 'cyber-btn accent';
        } else {
            actionBtn.textContent = `UNLOCK FOR ${preset.price.toLocaleString()} CR`;
            actionBtn.className = 'cyber-btn gold';
        }
    }

    triggerExhaustBackfire() {
        window.soundEngine.triggerBackfire();
        this.isBackfiring = true;
        this.backfireTimer = 0.12;

        if (this.playerCar) {
            this.playerCar.flameL.scale.set(1.5, 1.5, 2.2);
            this.playerCar.flameR.scale.set(1.5, 1.5, 2.2);
            this.playerCar.flameL.material.opacity = 1.0;
            this.playerCar.flameR.material.opacity = 1.0;
            this.playerCar.exhaustLight.intensity = 4.0;
        }

        const pos = this.playerCar.group.position;
        this.particles.emitSparks(pos.x, 0.35, pos.z - 2.4, 8, 0x00d4ff);
    }

    // =========================================================================
    // MAIN LOOP
    // =========================================================================
    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const dt = Math.min((now - this._lastTime) / 1000, 0.05);
        this._lastTime = now;

        if (this.state === 'PLAYING') {
            this.updatePhysics(dt);
            this.updateCamera(dt);
            this.world.update(this.playerCar.group.position.z);
            this.traffic.update(
                dt,
                this.playerCar,
                this.speed,
                (v) => this.onNearMiss(v),
                (type) => this.onCollectPickup(type),
                (v) => this.onCrash(v)
            );
            this.particles.update(dt, this.playerCar.group.position.z, this.speed / this.maxSpeed);
            this.updateAudio(dt);
            this.updateHUD(dt);
        } else if (this.state === 'MENU' || this.state === 'GARAGE') {
            this.updateShowroom(dt);
        } else if (this.state === 'GAMEOVER') {
            this.updateGameOverCamera(dt);
            this.particles.update(dt, this.playerCar.group.position.z, 0);
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateShowroom(dt) {
        if (!this.isDraggingGarage) {
            this.garageTurntableAngle += dt * 0.35;
        }

        const distance = 8.2;
        const height = 2.4;
        const camX = Math.sin(this.garageTurntableAngle) * distance;
        const camZ = Math.cos(this.garageTurntableAngle) * distance;

        this.camera.position.set(camX, height, camZ);
        this.camera.lookAt(0, 0.6, 0);

        if (this.playerCar) {
            for (const w of this.playerCar.wheels) {
                w.rotation.x += dt * 0.5;
            }
        }
    }

    updatePhysics(dt) {
        const car = this.playerCar;
        const pos = car.group.position;
        const isBike = car.isBike === true;
        const isBraking = this.keys.down || this.keys.drift;

        // 1. NITRO BOOST
        const wantNitro = this.keys.nitro && this.nitroAmount > 0 && this.keys.up;
        if (wantNitro) {
            this.isNitroActive = true;
            this.nitroAmount = Math.max(0, this.nitroAmount - this.nitroDrainRate * dt);
            this.maxSpeed = this.baseMaxSpeed + 48;
            document.getElementById('speed-vignette').classList.add('nitro-active');

            this.particles.emitNitro(pos.x - 0.2, 0.35, pos.z - 2.0, this.speed, this.carHeading);
            this.particles.emitNitro(pos.x + 0.2, 0.35, pos.z - 2.0, this.speed, this.carHeading);

            car.flameL.scale.set(1.4, 1.4, 1.8);
            car.flameR.scale.set(1.4, 1.4, 1.8);
            car.flameL.material.opacity = 0.95;
            car.flameR.material.opacity = 0.95;
            car.exhaustLight.intensity = 2.5;
        } else {
            this.isNitroActive = false;
            this.maxSpeed = this.baseMaxSpeed;
            this.nitroAmount = Math.min(100, this.nitroAmount + this.nitroRechargeRate * dt);
            document.getElementById('speed-vignette').classList.remove('nitro-active');

            if (this.isBackfiring) {
                this.backfireTimer -= dt;
                if (this.backfireTimer <= 0) {
                    this.isBackfiring = false;
                    car.flameL.scale.set(0.01, 0.01, 0.01);
                    car.flameR.scale.set(0.01, 0.01, 0.01);
                    car.flameL.material.opacity = 0.0;
                    car.flameR.material.opacity = 0.0;
                    car.exhaustLight.intensity = 0.0;
                }
            } else {
                car.flameL.scale.set(0.01, 0.01, 0.01);
                car.flameR.scale.set(0.01, 0.01, 0.01);
                car.flameL.material.opacity = 0.0;
                car.flameR.material.opacity = 0.0;
                car.exhaustLight.intensity = 0.0;
            }
        }

        // 2. ACCELERATION & BRAKING
        const accelRate = this.isNitroActive ? this.acceleration * 1.8 : this.acceleration;
        const brakeRate = 58;
        const dragRate = 12;

        if (this.keys.up) {
            this.speed = Math.min(this.maxSpeed, this.speed + accelRate * dt);
        } else if (this.keys.down) {
            this.speed = Math.max(0, this.speed - brakeRate * dt);
        } else {
            this.speed = Math.max(0, this.speed - dragRate * dt);
        }

        if (this.speed > this.maxSpeedReached) {
            this.maxSpeedReached = Math.round(this.speed);
        }

        // 3. GEAR & RPM
        const speedRatio = this.speed / this.maxSpeed;
        const numGears = 6;
        const gearFraction = 1.0 / numGears;
        const newGear = Math.min(6, Math.floor(speedRatio / gearFraction) + 1);

        if (newGear !== this.currentGear && this.speed > 12) {
            if (newGear > this.currentGear) {
                window.soundEngine.playGearShift();
                if (Math.random() > 0.3) this.triggerExhaustBackfire();
            }
            this.currentGear = newGear;
        }

        const gearProgress = (speedRatio - (this.currentGear - 1) * gearFraction) / gearFraction;
        this.rpm = 1100 + gearProgress * 7300;

        // 4. ACTIVE AERO & BRAKE GLOW
        car.updateAero(speedRatio, isBraking, dt);
        car.updateBrakeGlow(isBraking, speedRatio, dt);

        // 5. CORRECTED STEERING CONTROLS (Left moves Left, Right moves Right)
        let steerInput = 0;
        if (this.keys.left) steerInput -= 1; // Left arrow / A steers LEFT (-X)
        if (this.keys.right) steerInput += 1; // Right arrow / D steers RIGHT (+X)

        this.isDrifting = (this.keys.drift || isBraking) && this.speed > 42 && Math.abs(steerInput) > 0;
        if (this.isDrifting) {
            this.driftIntensity = Math.min(1.0, this.driftIntensity + dt * 4.2);
            this.score += Math.round(350 * dt * this.comboMultiplier);

            this.particles.emitDriftSmoke(pos.x - 0.4, 0.38, pos.z - 1.2);
            this.particles.emitDriftSmoke(pos.x + 0.4, 0.38, pos.z - 1.2);

            this._wheelRLPos.set(pos.x - 0.6, 0, pos.z - 1.2);
            this._wheelRRPos.set(pos.x + 0.6, 0, pos.z - 1.2);
            this.skidmarks.addSkidmark(this._wheelRLPos, this._wheelRRPos, this.driftIntensity);
        } else {
            this.driftIntensity = Math.max(0.0, this.driftIntensity - dt * 3.5);
        }

        const targetLatSpeed = steerInput * this.handling * (this.isDrifting ? 1.45 : 1.0);
        this.lateralSpeed += (targetLatSpeed - this.lateralSpeed) * 8.5 * dt;
        pos.x += this.lateralSpeed * dt;

        // Road boundaries
        const maxRoadX = 9.85;
        if (pos.x < -maxRoadX) {
            pos.x = -maxRoadX;
            this.lateralSpeed = 0;
            this.particles.emitSparks(pos.x - 0.5, 0.45, pos.z, 10, 0x00f0ff);
        } else if (pos.x > maxRoadX) {
            pos.x = maxRoadX;
            this.lateralSpeed = 0;
            this.particles.emitSparks(pos.x + 0.5, 0.45, pos.z, 10, 0x00f0ff);
        }

        // 6. REALISTIC ORIENTATION: YAW, PITCH, AND ROLL/LEAN
        // Pitch: Squat on acceleration, Dive on braking
        let targetPitch = 0;
        if (this.keys.up) {
            targetPitch = 0.025 * (this.isNitroActive ? 1.6 : 1.0);
        } else if (isBraking) {
            targetPitch = -0.045;
        }
        this.carPitch += (targetPitch - this.carPitch) * 7.0 * dt;
        car.group.rotation.x = this.carPitch;

        // Yaw: Points in direction of steering turn
        // From chase cam (behind car), negative Y rotation = nose turns LEFT visually
        // lateralSpeed < 0 means steering left, so yaw must be POSITIVE proportion of lateralSpeed
        const targetYaw = this.lateralSpeed * (this.isDrifting ? 0.045 : 0.022);
        this.carHeading += (targetYaw - this.carHeading) * 10 * dt;
        car.group.rotation.y = this.carHeading;

        // Roll / Lean:
        // For Superbikes: Lean heavily into corners (up to 28° / 0.48 rad)
        // For Cars: Centrifugal body roll opposite to turning direction
        let targetRoll = 0;
        if (isBike) {
            targetRoll = this.lateralSpeed * 0.028; // Motorcycle banks INTO the turn
        } else {
            targetRoll = -this.lateralSpeed * 0.018; // Car rolls AWAY from turn (centrifugal)
        }
        this.carRoll += (targetRoll - this.carRoll) * 8.5 * dt;
        car.group.rotation.z = this.carRoll;

        // Micro road bounce
        this.suspensionY = Math.sin(pos.z * 1.5) * 0.015 * (this.speed / 150);
        car.group.position.y = this.suspensionY;

        // Front wheels turn in direction of steering
        const wheelSteerAngle = -steerInput * 0.38;
        for (const fw of car.frontWheels) {
            fw.rotation.y = wheelSteerAngle;
        }

        // 7. LONGITUDINAL MOVEMENT
        const forwardMps = (this.speed / 2.237) * 0.45;
        pos.z += forwardMps * dt;
        this.distanceTraveled += forwardMps * dt;
        this.score += Math.round(this.speed * dt * 0.16 * this.comboMultiplier);

        for (const w of car.wheels) {
            w.rotation.x += forwardMps * dt * 3.2;
        }

        if (isBraking) {
            car.tlMat.color.setHex(0xff0022);
        } else {
            car.tlMat.color.setHex(0x550008);
        }

        if (this.shieldTimer > 0) {
            this.shieldTimer -= dt;
            if (this.shieldTimer <= 0) {
                document.getElementById('hud-shield').classList.remove('active');
            }
        }

        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.comboMultiplier = 1;
                document.getElementById('hud-combo-badge').classList.remove('visible');
            }
        }
    }

    updateCamera(dt) {
        const car = this.playerCar;
        const pos = car.group.position;
        const isBike = car.isBike === true;
        const speedRatio = this.speed / this.maxSpeed;

        const targetFov = this.isNitroActive ? 79 : (this.baseFov + speedRatio * 8.5);
        this.currentFov += (targetFov - this.currentFov) * 5.0 * dt;
        this.camera.fov = this.currentFov;
        this.camera.updateProjectionMatrix();

        if (this.cameraMode === 0) {
            // Dynamic Chase Cam (Lower & more intimate for bikes)
            const followDist = (isBike ? 5.8 : 7.0) + speedRatio * 1.5;
            const followHeight = (isBike ? 1.9 : 2.45) - (this.isNitroActive ? 0.35 : 0);

            const targetX = pos.x * 0.72;
            const targetY = pos.y + followHeight;
            const targetZ = pos.z - followDist;

            this.camera.position.x += (targetX - this.camera.position.x) * 10 * dt;
            this.camera.position.y += (targetY - this.camera.position.y) * 8 * dt;
            this.camera.position.z += (targetZ - this.camera.position.z) * 12 * dt;

            if (this.isNitroActive || speedRatio > 0.85) {
                this.camera.position.x += (Math.random() - 0.5) * 0.04;
                this.camera.position.y += (Math.random() - 0.5) * 0.04;
            }

            this.camera.lookAt(pos.x, pos.y + (isBike ? 0.9 : 1.1), pos.z + 10);
        } else if (this.cameraMode === 1) {
            // Handlebars / Bonnet Cam
            this.camera.position.set(pos.x, pos.y + (isBike ? 1.05 : 0.92), pos.z + (isBike ? 0.6 : 1.35));
            this.camera.lookAt(pos.x + this.lateralSpeed * 0.05, pos.y + 0.92, pos.z + 20);
        } else if (this.cameraMode === 2) {
            // Helmet / Cockpit Cam
            this.camera.position.set(pos.x - (isBike ? 0 : 0.35), pos.y + (isBike ? 1.25 : 1.08), pos.z - 0.1);
            this.camera.lookAt(pos.x - (isBike ? 0 : 0.35), pos.y + 1.1, pos.z + 15);
        } else if (this.cameraMode === 3) {
            // Top-Down Retro Arcade Cam
            this.camera.position.set(pos.x, pos.y + 18, pos.z - 4);
            this.camera.lookAt(pos.x, 0, pos.z + 12);
        }
    }

    updateAudio(dt) {
        const speedRatio = this.speed / this.maxSpeed;
        const rpmRatio = (this.rpm - 1100) / 7300;
        const throttle = this.keys.up ? 1.0 : (this.keys.down ? 0.05 : 0.18);

        window.soundEngine.updateEngine(rpmRatio, throttle, speedRatio, dt);
        window.soundEngine.setNitro(this.isNitroActive);
        window.soundEngine.setDrift(this.driftIntensity);
    }

    updateHUD(dt) {
        document.getElementById('hud-speed').textContent = Math.round(this.speed);
        document.getElementById('hud-gear').textContent = this.isNitroActive ? 'BOOST' : this.currentGear;

        const rpmRatio = Math.min(1.0, Math.max(0, (this.rpm - 1100) / 7300));
        const maxOffset = 565;
        const minOffset = 150;
        const currentOffset = maxOffset - rpmRatio * (maxOffset - minOffset);
        document.getElementById('hud-rpm-circle').style.strokeDashoffset = currentOffset;

        document.getElementById('hud-nitro-fill').style.height = `${this.nitroAmount}%`;
        document.getElementById('hud-score').textContent = this.score.toLocaleString();
        document.getElementById('hud-distance').textContent = `${(this.distanceTraveled / 1000).toFixed(1)} KM`;

        this.updateRadar();
    }

    updateRadar() {
        const container = document.getElementById('radar-blips-container');
        if (!container) return;

        let html = '';
        const playerZ = this.playerCar.group.position.z;
        const playerX = this.playerCar.group.position.x;
        const radarRangeZ = 120;
        const radarRangeX = 22;

        for (const v of this.traffic.vehicles) {
            if (!v.active) continue;
            const dz = v.group.position.z - playerZ;
            const dx = v.group.position.x - playerX;

            if (dz > -10 && dz < radarRangeZ) {
                const normY = 75 - (dz / radarRangeZ) * 65;
                const normX = 50 + (dx / radarRangeX) * 45;
                html += `<div class="traffic-blip" style="top: ${normY}%; left: ${normX}%;"></div>`;
            }
        }
        container.innerHTML = html;
    }

    onNearMiss(vehicle) {
        window.soundEngine.playNearMiss();
        this.nearMissCount++;

        this.nitroAmount = Math.min(100, this.nitroAmount + 30);
        this.comboMultiplier = Math.min(5, this.comboMultiplier + 1);
        this.comboTimer = 4.5;

        const bonus = 150 * this.comboMultiplier;
        this.score += bonus;

        this.showComboPopup(`CLOSE CALL! +${bonus}`);
        const badge = document.getElementById('hud-combo-badge');
        badge.textContent = `🔥 x${this.comboMultiplier} COMBO!`;
        badge.classList.add('visible');
    }

    onCollectPickup(type) {
        window.soundEngine.playCoin();

        if (type === 'coin') {
            this.credits += 50;
            this.score += 250;
            this.showComboPopup(`+50 CREDITS!`);
            localStorage.setItem('nv_credits', this.credits.toString());
        } else if (type === 'nitro') {
            this.nitroAmount = 100;
            this.score += 200;
            this.showComboPopup(`NITRO FULL CHARGE!`);
        } else if (type === 'shield') {
            this.shieldTimer = 6.0;
            this.showComboPopup(`EMP SHIELD ACTIVATED!`);
            document.getElementById('hud-shield').classList.add('active');
        }
    }

    showComboPopup(text) {
        const popup = document.getElementById('combo-popup');
        popup.textContent = text;
        popup.classList.add('show');

        clearTimeout(this._popupTimeout);
        this._popupTimeout = setTimeout(() => {
            popup.classList.remove('show');
        }, 1200);
    }

    onCrash(vehicle) {
        if (this.shieldTimer > 0) {
            window.soundEngine.playCrash();
            vehicle.active = false;
            vehicle.group.position.set(0, -100, 0);
            this.particles.emitSparks(vehicle.group.position.x, 1.2, this.playerCar.group.position.z, 30, 0xff00ff);
            this.score += 500;
            this.showComboPopup(`SHIELD SMASH! +500`);
            return;
        }

        window.soundEngine.playCrash();
        window.soundEngine.setNitro(false);
        window.soundEngine.setDrift(0);

        const flash = document.getElementById('crash-flash');
        flash.style.opacity = '0.85';
        setTimeout(() => { flash.style.opacity = '0'; }, 180);

        const pos = this.playerCar.group.position;
        this.particles.emitSparks(pos.x, 0.8, pos.z, 55, 0xff3300);

        const creditsEarned = Math.round(this.score / 20) + (this.nearMissCount * 25);
        this.credits += creditsEarned;
        localStorage.setItem('nv_credits', this.credits.toString());

        let isNewRecord = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('nv_highscore', this.highScore.toString());
            isNewRecord = true;
        }

        document.getElementById('go-score').textContent = this.score.toLocaleString();
        document.getElementById('go-distance').textContent = `${(this.distanceTraveled / 1000).toFixed(1)} KM`;
        document.getElementById('go-max-speed').textContent = `${this.maxSpeedReached} MPH`;
        document.getElementById('go-near-misses').textContent = this.nearMissCount;
        document.getElementById('go-credits-earned').textContent = `+${creditsEarned.toLocaleString()}`;

        if (isNewRecord && this.score > 0) {
            document.getElementById('gameover-new-record').classList.add('show');
        }

        this.switchScreen('GAMEOVER');
    }

    updateGameOverCamera(dt) {
        this.garageTurntableAngle += dt * 0.4;
        const pos = this.playerCar.group.position;
        const dist = 7.5;
        this.camera.position.set(
            pos.x + Math.sin(this.garageTurntableAngle) * dist,
            pos.y + 2.2,
            pos.z + Math.cos(this.garageTurntableAngle) * dist
        );
        this.camera.lookAt(pos.x, pos.y + 0.5, pos.z);
    }

    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
