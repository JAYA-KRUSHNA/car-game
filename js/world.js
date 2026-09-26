/**
 * Neon Velocity - Photorealistic Multi-Map World System
 * Features:
 * - 4 Selectable Environments with authentic procedural scenery:
 *   1. Tokyo Neon Expressway (High-density architectural glass & steel skyscrapers, neon billboards)
 *   2. Pacific Sunset Coastline (Expansive ocean horizon, sandy beach, palm trees, coastal villas)
 *   3. Dubai Desert Super-Highway (Sweeping golden dunes, futuristic solar monoliths, canyon rocks)
 *   4. Alpine Mountain Pass (Granite crags, snow caps, pine trees, concrete tunnel arches)
 * - 5 Distinct Architectural Skyscraper Typologies:
 *   - The Aerodynamic Blade Tower (Curved crown, vertical LED ribbons)
 *   - The Diagrid Structural Mega-Tower (Steel X-bracing, illuminated floor plates)
 *   - The Stepped Metropolis High-Rise (Multi-tiered setbacks, rooftop helipad, HVAC chillers)
 *   - The Twin Towers with Skybridge (Connecting glass bridge at mid-height)
 *   - The Commercial Street Podium (Illuminated storefronts, entrance canopies, street trees)
 * - Dynamic Scenery Rebuilding when switching maps in real-time.
 */

class World {
    constructor(scene) {
        this.scene = scene;
        this.chunkLength = 95;
        this.chunkCount = 6;
        this.roadWidth = 22;
        this.totalLength = this.chunkLength * this.chunkCount;
        this.chunks = [];

        // 4 Distinct Maps
        this.maps = {
            tokyo_night: {
                id: 'tokyo_night',
                name: "Tokyo Neon Expressway",
                subtitle: "Midnight wet asphalt with high-rise neon skyline",
                fogColor: 0x060814,
                fogNear: 70,
                fogFar: 380,
                barrierColor: 0x00f0ff,
                ambientLight: 0x141828,
                dirLightColor: 0x88bbff,
                dirIntensity: 2.2,
                sunPosition: [30, 85, -40],
                roadColor: 0x11131a,
                skyTop: '#040610',
                skyMid: '#0a1024',
                skyBottom: '#0e1834',
                roughness: 0.35,
                metalness: 0.65,
                features: 'city'
            },
            sunset_coast: {
                id: 'sunset_coast',
                name: "Pacific Sunset Coastline",
                subtitle: "Golden hour synthwave ocean strip with coastal cliffs",
                fogColor: 0x1e0a1a,
                fogNear: 60,
                fogFar: 360,
                barrierColor: 0xff0066,
                ambientLight: 0x321422,
                dirLightColor: 0xff9044,
                dirIntensity: 2.9,
                sunPosition: [-60, 40, 50],
                roadColor: 0x17151e,
                skyTop: '#150618',
                skyMid: '#3e1430',
                skyBottom: '#752844',
                roughness: 0.45,
                metalness: 0.55,
                features: 'coast'
            },
            desert_run: {
                id: 'desert_run',
                name: "Dubai Desert Super-Highway",
                subtitle: "Sun-drenched golden dunes with futuristic mega-monoliths",
                fogColor: 0x221810,
                fogNear: 80,
                fogFar: 420,
                barrierColor: 0xffaa00,
                ambientLight: 0x302518,
                dirLightColor: 0xffeedd,
                dirIntensity: 3.2,
                sunPosition: [50, 95, -20],
                roadColor: 0x1c1916,
                skyTop: '#0a1a30',
                skyMid: '#243a58',
                skyBottom: '#556a88',
                roughness: 0.55,
                metalness: 0.4,
                features: 'desert'
            },
            mountain_pass: {
                id: 'mountain_pass',
                name: "Alpine Mountain Pass",
                subtitle: "Granite cliffs, crisp alpine haze, and illuminated tunnel arches",
                fogColor: 0x0a1420,
                fogNear: 50,
                fogFar: 330,
                barrierColor: 0x00ffaa,
                ambientLight: 0x12222e,
                dirLightColor: 0x66ffcc,
                dirIntensity: 2.1,
                sunPosition: [40, 65, -30],
                roadColor: 0x10161e,
                skyTop: '#050c14',
                skyMid: '#0e202e',
                skyBottom: '#183848',
                roughness: 0.4,
                metalness: 0.6,
                features: 'mountain'
            }
        };

        this.currentMapKey = 'tokyo_night';
        this.currentMap = this.maps.tokyo_night;

        this.initTextures();
        this.initMaterials();
        this.initSkyAndLighting();
        this.initRoadChunks();
    }

    initTextures() {
        // 1. High-Res Skyscraper Window Canvas Texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Dark reflective glass background
        ctx.fillStyle = '#080b12';
        ctx.fillRect(0, 0, 512, 1024);

        // Vertical Aluminum Mullions
        ctx.strokeStyle = '#151b2a';
        ctx.lineWidth = 3;
        for (let x = 0; x < 512; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 1024);
            ctx.stroke();
        }

        // Horizontal Spandrel Beams between floors
        for (let y = 0; y < 1024; y += 48) {
            ctx.fillStyle = '#101624';
            ctx.fillRect(0, y, 512, 12);
            ctx.strokeStyle = '#050810';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        // Illuminated Office Windows (Tungsten Warm, Cool Tech Blue, and Crisp White)
        for (let y = 14; y < 1024; y += 48) {
            for (let x = 6; x < 512; x += 32) {
                const rand = Math.random();
                if (rand > 0.42) {
                    if (rand > 0.85) {
                        ctx.fillStyle = '#ffeedd'; // Warm White
                    } else if (rand > 0.68) {
                        ctx.fillStyle = '#aaddff'; // Cool Cyan/Blue
                    } else {
                        ctx.fillStyle = '#ffd077'; // Golden Amber
                    }
                    ctx.fillRect(x, y, 20, 24);

                    // Add subtle desk / blind silhouette
                    if (Math.random() > 0.5) {
                        ctx.fillStyle = 'rgba(10, 15, 25, 0.4)';
                        ctx.fillRect(x, y + 14, 20, 10);
                    }
                }
            }
        }

        // Top Floor Executive Penthouse Glow
        ctx.fillStyle = '#fff4e0';
        ctx.fillRect(0, 0, 512, 28);

        this.buildingTexture = new THREE.CanvasTexture(canvas);
        this.buildingTexture.wrapS = THREE.RepeatWrapping;
        this.buildingTexture.wrapT = THREE.RepeatWrapping;
        this.buildingTexture.repeat.set(1, 2);

        // 2. Ground Storefront / Lobby Glass Canvas Texture
        const lobbyCanvas = document.createElement('canvas');
        lobbyCanvas.width = 512;
        lobbyCanvas.height = 256;
        const lctx = lobbyCanvas.getContext('2d');
        lctx.fillStyle = '#0a0e18';
        lctx.fillRect(0, 0, 512, 256);

        // Warm lobby illumination
        for (let i = 0; i < 4; i++) {
            const lx = i * 128 + 16;
            const lgrad = lctx.createLinearGradient(lx, 256, lx, 40);
            lgrad.addColorStop(0.0, '#ffe5aa');
            lgrad.addColorStop(0.7, '#ffcc66');
            lgrad.addColorStop(1.0, '#332211');
            lctx.fillStyle = lgrad;
            lctx.fillRect(lx, 30, 96, 226);

            // Lobby frame
            lctx.strokeStyle = '#222d44';
            lctx.lineWidth = 6;
            lctx.strokeRect(lx, 30, 96, 226);
        }
        this.lobbyTexture = new THREE.CanvasTexture(lobbyCanvas);

        // 3. High-Tech Neon Billboard Canvases
        this.billboardTextures = [];
        const neonAds = [
            { text: "APEX // DYNAMICS", sub: "HYPER SPEED ACTIVE AERO", col1: "#00f0ff", col2: "#0066ff" },
            { text: "CYBER SPECTRE", sub: "1800HP SOLID STATE EV", col1: "#ff0077", col2: "#aa00ff" },
            { text: "NEO TOKYO 2099", sub: "SHIBUYA EXPRESSWAY LINK", col1: "#ffaa00", col2: "#ff0033" },
            { text: "KANEDA MOTORS", sub: "TWIN ROTOR POWER BIKE", col1: "#00ff88", col2: "#00bbff" }
        ];

        for (const ad of neonAds) {
            const bCanvas = document.createElement('canvas');
            bCanvas.width = 512;
            bCanvas.height = 256;
            const bCtx = bCanvas.getContext('2d');

            bCtx.fillStyle = '#05070e';
            bCtx.fillRect(0, 0, 512, 256);

            // Glowing border
            bCtx.strokeStyle = ad.col1;
            bCtx.lineWidth = 8;
            bCtx.strokeRect(8, 8, 496, 240);

            // Main typography
            bCtx.fillStyle = '#ffffff';
            bCtx.font = 'bold 36px "Rajdhani", "Segoe UI", sans-serif';
            bCtx.textAlign = 'center';
            bCtx.shadowColor = ad.col1;
            bCtx.shadowBlur = 18;
            bCtx.fillText(ad.text, 256, 115);

            // Sub text
            bCtx.font = 'bold 18px "Rajdhani", sans-serif';
            bCtx.fillStyle = ad.col2;
            bCtx.shadowColor = ad.col2;
            bCtx.shadowBlur = 12;
            bCtx.fillText(ad.sub, 256, 175);

            const bTex = new THREE.CanvasTexture(bCanvas);
            this.billboardTextures.push(bTex);
        }

        // 4. Sky Dome Gradient Canvas Texture
        this.skyCanvas = document.createElement('canvas');
        this.skyCanvas.width = 512;
        this.skyCanvas.height = 512;
        this.updateSkyTexture();
        this.skyTexture = new THREE.CanvasTexture(this.skyCanvas);
    }

    updateSkyTexture() {
        const ctx = this.skyCanvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.0, this.currentMap.skyTop);
        grad.addColorStop(0.55, this.currentMap.skyMid);
        grad.addColorStop(0.9, this.currentMap.skyBottom);
        grad.addColorStop(1.0, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Dynamic Sun/Moon Orb
        const sunX = 256;
        const sunY = 180;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 130);
        sunGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.98)');
        sunGrad.addColorStop(0.25, 'rgba(255, 200, 150, 0.45)');
        sunGrad.addColorStop(0.65, 'rgba(150, 180, 255, 0.12)');
        sunGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 130, 0, Math.PI * 2);
        ctx.fill();

        if (this.skyTexture) this.skyTexture.needsUpdate = true;
    }

    initMaterials() {
        this.roadMaterial = new THREE.MeshStandardMaterial({
            color: this.currentMap.roadColor,
            roughness: this.currentMap.roughness,
            metalness: this.currentMap.metalness
        });

        this.barrierMaterial = new THREE.MeshBasicMaterial({
            color: this.currentMap.barrierColor
        });

        this.markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        this.shoulderMaterial = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

        this.curbMaterial = new THREE.MeshStandardMaterial({
            color: 0x222630,
            roughness: 0.8,
            metalness: 0.2
        });

        this.buildingFacadeMaterial = new THREE.MeshStandardMaterial({
            map: this.buildingTexture,
            roughness: 0.25,
            metalness: 0.85
        });

        this.lobbyMaterial = new THREE.MeshStandardMaterial({
            map: this.lobbyTexture,
            roughness: 0.3,
            metalness: 0.7
        });

        this.buildingSolidMaterial = new THREE.MeshStandardMaterial({
            color: 0x0b0e17,
            roughness: 0.6,
            metalness: 0.5
        });

        this.concretePillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a3242,
            roughness: 0.7,
            metalness: 0.3
        });

        // Terrain Materials
        this.sandMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4a054,
            roughness: 0.9,
            metalness: 0.05
        });

        this.graniteMaterial = new THREE.MeshStandardMaterial({
            color: 0x2b3340,
            roughness: 0.85,
            metalness: 0.15
        });

        this.snowMaterial = new THREE.MeshStandardMaterial({
            color: 0xebf2ff,
            roughness: 0.4,
            metalness: 0.2
        });

        this.oceanMaterial = new THREE.MeshStandardMaterial({
            color: 0x082044,
            roughness: 0.1,
            metalness: 0.85
        });

        this.foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x145228,
            roughness: 0.7,
            metalness: 0.1
        });

        this.palmWoodMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3622,
            roughness: 0.8,
            metalness: 0.1
        });

        // Highway Exit Sign Green
        this.signGreenMaterial = new THREE.MeshStandardMaterial({
            color: 0x005830,
            roughness: 0.4,
            metalness: 0.2
        });

        // Dynamic Billboards Materials
        this.billboardMaterials = this.billboardTextures.map(tex =>
            new THREE.MeshBasicMaterial({ map: tex })
        );
    }

    initSkyAndLighting() {
        this.scene.fog = new THREE.Fog(
            this.currentMap.fogColor,
            this.currentMap.fogNear,
            this.currentMap.fogFar
        );
        this.scene.background = new THREE.Color(this.currentMap.fogColor);

        const skyGeom = new THREE.SphereGeometry(450, 24, 16);
        const skyMat = new THREE.MeshBasicMaterial({
            map: this.skyTexture,
            side: THREE.BackSide
        });
        this.skyDome = new THREE.Mesh(skyGeom, skyMat);
        this.scene.add(this.skyDome);

        this.ambientLight = new THREE.AmbientLight(this.currentMap.ambientLight, 1.8);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(
            this.currentMap.dirLightColor,
            this.currentMap.dirIntensity
        );
        this.dirLight.position.set(...this.currentMap.sunPosition);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        this.dirLight.shadow.camera.near = 10;
        this.dirLight.shadow.camera.far = 280;
        this.dirLight.shadow.camera.left = -30;
        this.dirLight.shadow.camera.right = 30;
        this.dirLight.shadow.camera.top = 30;
        this.dirLight.shadow.camera.bottom = -30;
        this.dirLight.shadow.bias = -0.0005;
        this.scene.add(this.dirLight);

        this.hemiLight = new THREE.HemisphereLight(0x283850, 0x060914, 1.1);
        this.scene.add(this.hemiLight);

        // Starfield Dome
        const starGeom = new THREE.BufferGeometry();
        const starCount = 800;
        const starPos = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const r = 380 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.45;
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.cos(phi) + 20;
            starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }

        starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        this.starMesh = new THREE.Points(starGeom, new THREE.PointsMaterial({
            color: 0xd8e4ff,
            size: 1.6,
            transparent: true,
            opacity: 0.85
        }));
        this.scene.add(this.starMesh);
    }

    createRoadChunk(index) {
        const chunk = new THREE.Group();
        const zCenter = index * this.chunkLength;
        chunk.position.z = zCenter;

        // 1. Road Surface (4 lanes)
        const roadGeom = new THREE.PlaneGeometry(this.roadWidth, this.chunkLength);
        roadGeom.rotateX(-Math.PI / 2);
        const road = new THREE.Mesh(roadGeom, this.roadMaterial);
        road.receiveShadow = true;
        chunk.add(road);

        // 2. Concrete Curbs
        const curbWidth = 1.3;
        const curbGeom = new THREE.BoxGeometry(curbWidth, 0.48, this.chunkLength);

        const curbL = new THREE.Mesh(curbGeom, this.curbMaterial);
        curbL.position.set(-this.roadWidth / 2 - curbWidth / 2, 0.24, 0);
        curbL.receiveShadow = true;
        chunk.add(curbL);

        const curbR = new THREE.Mesh(curbGeom, this.curbMaterial);
        curbR.position.set(this.roadWidth / 2 + curbWidth / 2, 0.24, 0);
        curbR.receiveShadow = true;
        chunk.add(curbR);

        // Glowing Guardrails
        const railGeom = new THREE.BoxGeometry(0.2, 0.24, this.chunkLength);
        const railL = new THREE.Mesh(railGeom, this.barrierMaterial);
        railL.position.set(-this.roadWidth / 2 + 0.1, 0.52, 0);
        chunk.add(railL);

        const railR = new THREE.Mesh(railGeom, this.barrierMaterial);
        railR.position.set(this.roadWidth / 2 - 0.1, 0.52, 0);
        chunk.add(railR);

        // 3. Lane Dash Lines
        const lanePositions = [-5.5, 0, 5.5];
        const dashCount = 8;
        const dashLength = 4.8;
        const dashSpacing = this.chunkLength / dashCount;

        for (const laneX of lanePositions) {
            for (let i = 0; i < dashCount; i++) {
                const isCenter = Math.abs(laneX) < 0.1;
                const dashGeom = new THREE.PlaneGeometry(0.22, dashLength);
                dashGeom.rotateX(-Math.PI / 2);
                const dashMesh = new THREE.Mesh(dashGeom, isCenter ? this.shoulderMaterial : this.markingMaterial);
                dashMesh.position.set(laneX, 0.02, -this.chunkLength / 2 + (i + 0.5) * dashSpacing);
                chunk.add(dashMesh);
            }
        }

        // 4. Overhead Highway Gantry (Alternate chunks)
        if (index % 2 === 1) {
            const arch = this.createHighwayGantry();
            arch.position.set(0, 0, 0);
            chunk.add(arch);
        }

        // 5. Street Light Poles
        const poleSpacing = 32;
        for (let pz = -this.chunkLength / 2 + 16; pz < this.chunkLength / 2; pz += poleSpacing) {
            const poleL = this.createLightPole(-this.roadWidth / 2 - 1.6, pz, false);
            const poleR = this.createLightPole(this.roadWidth / 2 + 1.6, pz, true);
            chunk.add(poleL);
            chunk.add(poleR);
        }

        // 6. Map-Specific Surroundings (Skyscrapers, Dunes, Ocean, or Mountain)
        const sceneryGroup = new THREE.Group();
        this.populateScenery(sceneryGroup, this.chunkLength, index);
        chunk.add(sceneryGroup);

        chunk.userData = { index: index, sceneryGroup: sceneryGroup };
        this.scene.add(chunk);
        return chunk;
    }

    createLightPole(x, z, flip = false) {
        const pole = new THREE.Group();
        pole.position.set(x, 0, z);

        const mastGeom = new THREE.CylinderGeometry(0.14, 0.2, 9.5, 8);
        mastGeom.translate(0, 4.75, 0);
        const mast = new THREE.Mesh(mastGeom, this.buildingSolidMaterial);
        mast.castShadow = true;
        pole.add(mast);

        const armLength = 4.5;
        const armGeom = new THREE.BoxGeometry(armLength, 0.14, 0.14);
        const armOffset = flip ? -armLength / 2 : armLength / 2;
        armGeom.translate(armOffset, 9.4, 0);
        const arm = new THREE.Mesh(armGeom, this.buildingSolidMaterial);
        arm.castShadow = true;
        pole.add(arm);

        const lampGeom = new THREE.BoxGeometry(1.3, 0.12, 0.35);
        const lampOffset = flip ? -armLength + 0.65 : armLength - 0.65;
        lampGeom.translate(lampOffset, 9.3, 0);
        const lamp = new THREE.Mesh(lampGeom, this.billboardMaterials[0]);
        pole.add(lamp);

        return pole;
    }

    createHighwayGantry() {
        const gantry = new THREE.Group();
        const height = 9.2;
        const span = this.roadWidth + 4.5;

        const pillarGeom = new THREE.BoxGeometry(0.65, height, 0.65);
        pillarGeom.translate(0, height / 2, 0);

        const pillarL = new THREE.Mesh(pillarGeom, this.buildingSolidMaterial);
        pillarL.position.set(-span / 2, 0, 0);
        pillarL.castShadow = true;

        const pillarR = pillarL.clone();
        pillarR.position.x = span / 2;
        gantry.add(pillarL);
        gantry.add(pillarR);

        const beam = new THREE.Mesh(new THREE.BoxGeometry(span, 0.8, 0.9), this.buildingSolidMaterial);
        beam.position.set(0, height - 0.4, 0);
        beam.castShadow = true;
        gantry.add(beam);

        // Realistic Highway Directional Signboard
        const signGeom = new THREE.BoxGeometry(span * 0.7, 2.6, 0.22);
        signGeom.translate(0, height - 0.1, 0);
        const sign = new THREE.Mesh(signGeom, this.signGreenMaterial);
        gantry.add(sign);

        return gantry;
    }

    // =========================================================================
    // DYNAMIC ENVIRONMENT SCENERY POPULATION
    // =========================================================================
    populateScenery(parentGroup, length, chunkIndex = 0) {
        const feat = this.currentMap.features || 'city';

        if (feat === 'city') {
            this.populateCityScenery(parentGroup, length, chunkIndex);
        } else if (feat === 'coast') {
            this.populateCoastScenery(parentGroup, length, chunkIndex);
        } else if (feat === 'desert') {
            this.populateDesertScenery(parentGroup, length, chunkIndex);
        } else if (feat === 'mountain') {
            this.populateMountainScenery(parentGroup, length, chunkIndex);
        }
    }

    // -------------------------------------------------------------
    // 1. TOKYO NEON SKYLINE (Realistic Architectural Skyscrapers)
    // -------------------------------------------------------------
    populateCityScenery(parentGroup, length, chunkIndex) {
        const numPerSide = 3;
        for (let i = 0; i < numPerSide; i++) {
            const zOffset = -length / 2 + (i + 0.5) * (length / numPerSide);

            // Left side building
            const towerL = this.createDiverseSkyscraper(chunkIndex * 10 + i * 2);
            towerL.position.set(-(this.roadWidth / 2 + 18 + Math.random() * 6), 0, zOffset);
            parentGroup.add(towerL);

            // Right side building
            const towerR = this.createDiverseSkyscraper(chunkIndex * 10 + i * 2 + 1);
            towerR.position.set(this.roadWidth / 2 + 18 + Math.random() * 6, 0, zOffset);
            parentGroup.add(towerR);
        }
    }

    createDiverseSkyscraper(seed) {
        const style = seed % 4;
        if (style === 0) {
            return this.createBladeTower();
        } else if (style === 1) {
            return this.createDiagridTower();
        } else if (style === 2) {
            return this.createSteppedTower();
        } else {
            return this.createTwinLinkedTowers();
        }
    }

    // Skyscraper 1: The Aerodynamic Blade Tower
    createBladeTower() {
        const group = new THREE.Group();
        const baseWidth = 22;
        const baseDepth = 24;
        const totalHeight = 85 + Math.random() * 40;

        // Ground lobby podium
        const lobby = new THREE.Mesh(new THREE.BoxGeometry(baseWidth + 4, 12, baseDepth + 4), this.lobbyMaterial);
        lobby.position.y = 6;
        group.add(lobby);

        // Main blade body
        const towerGeom = new THREE.BoxGeometry(baseWidth, totalHeight, baseDepth);
        towerGeom.translate(0, totalHeight / 2 + 12, 0);
        const tower = new THREE.Mesh(towerGeom, this.buildingFacadeMaterial);
        group.add(tower);

        // Vertical LED edge ribbons (Cyan/Magenta neon lines running up the building)
        const ribGeom = new THREE.BoxGeometry(0.35, totalHeight, 0.35);
        ribGeom.translate(-baseWidth / 2, totalHeight / 2 + 12, baseDepth / 2);
        const rib1 = new THREE.Mesh(ribGeom, this.barrierMaterial);
        const rib2 = rib1.clone();
        rib2.position.x = baseWidth;
        group.add(rib1);
        group.add(rib2);

        // Angled blade crown
        const crownGeom = new THREE.ConeGeometry(baseWidth * 0.6, 22, 4);
        crownGeom.rotateY(Math.PI / 4);
        crownGeom.translate(0, totalHeight + 23, 0);
        const crown = new THREE.Mesh(crownGeom, this.buildingSolidMaterial);
        group.add(crown);

        // Spire & Aviation Beacon
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 18, 6), this.buildingSolidMaterial);
        spire.position.y = totalHeight + 43;
        group.add(spire);

        const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshBasicMaterial({ color: 0xff0033 }));
        beacon.position.y = totalHeight + 52;
        group.add(beacon);

        // Neon Billboard attached to facade
        if (this.billboardMaterials.length > 0) {
            const bMat = this.billboardMaterials[Math.floor(Math.random() * this.billboardMaterials.length)];
            const bBoard = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), bMat);
            bBoard.position.set(0, 24, baseDepth / 2 + 0.2);
            group.add(bBoard);
        }

        return group;
    }

    // Skyscraper 2: Diagrid Structural Mega-Tower (Steel X-Bracing)
    createDiagridTower() {
        const group = new THREE.Group();
        const width = 26;
        const depth = 22;
        const height = 95 + Math.random() * 30;

        // Ground lobby podium
        const lobby = new THREE.Mesh(new THREE.BoxGeometry(width + 2, 14, depth + 2), this.lobbyMaterial);
        lobby.position.y = 7;
        group.add(lobby);

        // Main glass core
        const core = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), this.buildingFacadeMaterial);
        core.position.y = 14 + height / 2;
        group.add(core);

        // External Steel Corner Columns
        const colGeom = new THREE.BoxGeometry(1.4, height + 14, 1.4);
        colGeom.translate(0, (height + 14) / 2, 0);
        const c1 = new THREE.Mesh(colGeom, this.concretePillarMaterial);
        c1.position.set(-width / 2, 0, -depth / 2);
        const c2 = c1.clone(); c2.position.set(width / 2, 0, -depth / 2);
        const c3 = c1.clone(); c3.position.set(-width / 2, 0, depth / 2);
        const c4 = c1.clone(); c4.position.set(width / 2, 0, depth / 2);
        group.add(c1); group.add(c2); group.add(c3); group.add(c4);

        // Rooftop penthouse & dual antennas
        const top = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 10, depth * 0.7), this.buildingSolidMaterial);
        top.position.y = 14 + height + 5;
        group.add(top);

        const ant1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 16, 6), this.buildingSolidMaterial);
        ant1.position.set(-width * 0.22, 14 + height + 18, 0);
        const ant2 = ant1.clone();
        ant2.position.x = width * 0.22;
        group.add(ant1); group.add(ant2);

        return group;
    }

    // Skyscraper 3: Cascading Stepped Metropolis High-Rise with Helipad
    createSteppedTower() {
        const group = new THREE.Group();
        const baseW = 30;
        const baseD = 28;

        // Tier 1 (Podium)
        const t1 = new THREE.Mesh(new THREE.BoxGeometry(baseW, 26, baseD), this.buildingFacadeMaterial);
        t1.position.y = 13;
        group.add(t1);

        // Tier 2 (Setback)
        const t2 = new THREE.Mesh(new THREE.BoxGeometry(baseW * 0.75, 40, baseD * 0.75), this.buildingFacadeMaterial);
        t2.position.y = 26 + 20;
        group.add(t2);

        // Tier 3 (Upper Setback)
        const t3 = new THREE.Mesh(new THREE.BoxGeometry(baseW * 0.5, 32, baseD * 0.5), this.buildingFacadeMaterial);
        t3.position.y = 66 + 16;
        group.add(t3);

        // Rooftop Helipad
        const padGeom = new THREE.CylinderGeometry(baseW * 0.22, baseW * 0.22, 1.2, 16);
        padGeom.translate(0, 98.6, 0);
        const pad = new THREE.Mesh(padGeom, this.buildingSolidMaterial);
        group.add(pad);

        // Helipad glowing perimeter ring
        const ringGeom = new THREE.TorusGeometry(baseW * 0.2, 0.18, 8, 20);
        ringGeom.rotateX(Math.PI / 2);
        ringGeom.translate(0, 99.3, 0);
        const ring = new THREE.Mesh(ringGeom, this.shoulderMaterial);
        group.add(ring);

        // Rooftop HVAC chillers
        const hvac = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 3.5), this.buildingSolidMaterial);
        hvac.position.set(-baseW * 0.16, 99.2, -baseD * 0.16);
        group.add(hvac);

        return group;
    }

    // Skyscraper 4: Twin Linked Towers with Connecting Skybridge
    createTwinLinkedTowers() {
        const group = new THREE.Group();
        const towerW = 14;
        const towerD = 18;
        const towerH = 90;
        const towerGap = 20;

        // Tower Left
        const towL = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), this.buildingFacadeMaterial);
        towL.position.set(-towerGap / 2, towerH / 2, 0);
        group.add(towL);

        // Tower Right
        const towR = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), this.buildingFacadeMaterial);
        towR.position.set(towerGap / 2, towerH / 2, 0);
        group.add(towR);

        // Enclosed Glass Skybridge at height 55m
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(towerGap + 2, 7, 6), this.buildingSolidMaterial);
        bridge.position.set(0, 55, 0);
        group.add(bridge);

        const bridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(towerGap, 4.5, 6.2), this.buildingFacadeMaterial);
        bridgeGlass.position.set(0, 55, 0);
        group.add(bridgeGlass);

        return group;
    }

    // -------------------------------------------------------------
    // 2. PACIFIC SUNSET COASTLINE (Ocean, Beach, Palm Trees, Cliffs)
    // -------------------------------------------------------------
    populateCoastScenery(parentGroup, length, chunkIndex) {
        // Ocean Water Plane (Right side stretching to sunset horizon)
        const oceanGeom = new THREE.PlaneGeometry(160, length);
        oceanGeom.rotateX(-Math.PI / 2);
        const ocean = new THREE.Mesh(oceanGeom, this.oceanMaterial);
        ocean.position.set(this.roadWidth / 2 + 82, -1.8, 0);
        parentGroup.add(ocean);

        // Sandy Beach Verge
        const sandGeom = new THREE.PlaneGeometry(18, length);
        sandGeom.rotateX(-Math.PI / 2);
        const sand = new THREE.Mesh(sandGeom, this.sandMaterial);
        sand.position.set(this.roadWidth / 2 + 10, -0.2, 0);
        parentGroup.add(sand);

        // Palm Trees along the beach verge
        for (let i = 0; i < 4; i++) {
            const pz = -length / 2 + (i + 0.5) * (length / 4) + (Math.random() * 4 - 2);
            const palmR = this.createPalmTree();
            palmR.position.set(this.roadWidth / 2 + 6 + Math.random() * 4, 0, pz);
            parentGroup.add(palmR);
        }

        // Left Side: Coastal Sandstone Cliffs & Hillside Glass Villas
        for (let i = 0; i < 3; i++) {
            const pz = -length / 2 + (i + 0.5) * (length / 3);
            const cliffGeom = new THREE.DodecahedronGeometry(14 + Math.random() * 6, 1);
            const cliff = new THREE.Mesh(cliffGeom, this.sandMaterial);
            cliff.position.set(-(this.roadWidth / 2 + 22 + Math.random() * 6), 6, pz);
            cliff.scale.set(1.4, 1.2, 1.6);
            parentGroup.add(cliff);

            // Coastal luxury villa on top of cliff
            if (i === 1) {
                const villa = this.createCoastalVilla();
                villa.position.set(-(this.roadWidth / 2 + 24), 13, pz);
                parentGroup.add(villa);
            }
        }
    }

    createPalmTree() {
        const group = new THREE.Group();
        const trunkGeom = new THREE.CylinderGeometry(0.22, 0.4, 9, 7);
        trunkGeom.translate(0, 4.5, 0);
        const trunk = new THREE.Mesh(trunkGeom, this.palmWoodMaterial);
        trunk.rotation.z = (Math.random() - 0.5) * 0.15;
        group.add(trunk);

        // Palm Fronds
        const frondCount = 7;
        for (let i = 0; i < frondCount; i++) {
            const angle = (i / frondCount) * Math.PI * 2;
            const frondGeom = new THREE.ConeGeometry(0.7, 4.2, 4);
            frondGeom.rotateX(Math.PI / 2.3);
            frondGeom.translate(0, 8.8, 1.8);
            const frond = new THREE.Mesh(frondGeom, this.foliageMaterial);
            frond.rotation.y = angle;
            group.add(frond);
        }
        return group;
    }

    createCoastalVilla() {
        const villa = new THREE.Group();
        const main = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 12), this.buildingSolidMaterial);
        main.position.y = 2.25;
        villa.add(main);

        const glass = new THREE.Mesh(new THREE.BoxGeometry(15, 3.2, 11), this.buildingFacadeMaterial);
        glass.position.y = 2.25;
        villa.add(glass);

        return villa;
    }

    // -------------------------------------------------------------
    // 3. DUBAI DESERT SUPER-HIGHWAY (Rolling Dunes & Solar Monoliths)
    // -------------------------------------------------------------
    populateDesertScenery(parentGroup, length, chunkIndex) {
        // Dune Fields Left & Right
        const numDunes = 4;
        for (let i = 0; i < numDunes; i++) {
            const pz = -length / 2 + (i + 0.5) * (length / numDunes);

            // Left Dune
            const duneLGeom = new THREE.ConeGeometry(24 + Math.random() * 8, 14, 12);
            duneLGeom.scale(1.8, 0.65, 1.4);
            const duneL = new THREE.Mesh(duneLGeom, this.sandMaterial);
            duneL.position.set(-(this.roadWidth / 2 + 28 + Math.random() * 8), 3.5, pz);
            parentGroup.add(duneL);

            // Right Dune
            const duneR = duneL.clone();
            duneR.position.x = this.roadWidth / 2 + 28 + Math.random() * 8;
            parentGroup.add(duneR);
        }

        // Futuristic Solar Monolith Obelisk (Alternate chunks)
        if (chunkIndex % 2 === 0) {
            const obelisk = this.createSolarMonolith();
            obelisk.position.set(-(this.roadWidth / 2 + 26), 0, 0);
            parentGroup.add(obelisk);
        } else {
            const obeliskR = this.createSolarMonolith();
            obeliskR.position.set(this.roadWidth / 2 + 26, 0, 0);
            parentGroup.add(obeliskR);
        }
    }

    createSolarMonolith() {
        const group = new THREE.Group();
        const height = 65;

        // Tapered hexagonal futuristic tower
        const towerGeom = new THREE.CylinderGeometry(2.5, 7.5, height, 6);
        towerGeom.translate(0, height / 2, 0);
        const tower = new THREE.Mesh(towerGeom, this.buildingFacadeMaterial);
        group.add(tower);

        // Glowing solar ring accents
        for (let y = 15; y < height; y += 18) {
            const ringGeom = new THREE.TorusGeometry(5.8 - y * 0.05, 0.22, 6, 16);
            ringGeom.rotateX(Math.PI / 2);
            ringGeom.translate(0, y, 0);
            const ring = new THREE.Mesh(ringGeom, this.barrierMaterial);
            group.add(ring);
        }

        // Glowing Spire
        const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 14, 6), this.shoulderMaterial);
        spire.position.y = height + 7;
        group.add(spire);

        return group;
    }

    // -------------------------------------------------------------
    // 4. ALPINE MOUNTAIN PASS (Granite Crags, Pines & Tunnel Arches)
    // -------------------------------------------------------------
    populateMountainScenery(parentGroup, length, chunkIndex) {
        // Massive Granite Mountain Crags Left & Right
        const numPeaks = 3;
        for (let i = 0; i < numPeaks; i++) {
            const pz = -length / 2 + (i + 0.5) * (length / numPeaks);

            // Left Granite Peak
            const rockLGeom = new THREE.DodecahedronGeometry(22 + Math.random() * 8, 1);
            rockLGeom.scale(1.2, 2.2, 1.4);
            const rockL = new THREE.Mesh(rockLGeom, this.graniteMaterial);
            rockL.position.set(-(this.roadWidth / 2 + 22 + Math.random() * 6), 18, pz);
            parentGroup.add(rockL);

            // Snow Cap on mountain peak
            const snowGeom = new THREE.ConeGeometry(14, 12, 8);
            const snow = new THREE.Mesh(snowGeom, this.snowMaterial);
            snow.position.set(rockL.position.x, 42, pz);
            parentGroup.add(snow);

            // Right Peak
            const rockRGeom = new THREE.DodecahedronGeometry(22 + Math.random() * 8, 1);
            rockRGeom.scale(1.2, 2.2, 1.4);
            const rockR = new THREE.Mesh(rockRGeom, this.graniteMaterial);
            rockR.position.set(this.roadWidth / 2 + 22 + Math.random() * 6, 18, pz);
            parentGroup.add(rockR);
        }

        // Alpine Pine/Fir Trees along road edge
        for (let i = 0; i < 5; i++) {
            const pz = -length / 2 + (i + 0.5) * (length / 5);
            const pineL = this.createPineTree();
            pineL.position.set(-(this.roadWidth / 2 + 4.5 + Math.random() * 3), 0, pz);
            parentGroup.add(pineL);

            const pineR = this.createPineTree();
            pineR.position.set(this.roadWidth / 2 + 4.5 + Math.random() * 3, 0, pz);
            parentGroup.add(pineR);
        }

        // Concrete Avalanche / Mountain Tunnel Arch (Alternate chunks)
        if (chunkIndex % 3 === 1) {
            const tunnelArch = this.createTunnelArch();
            tunnelArch.position.set(0, 0, 0);
            parentGroup.add(tunnelArch);
        }
    }

    createPineTree() {
        const group = new THREE.Group();
        const trunkGeom = new THREE.CylinderGeometry(0.18, 0.35, 3.5, 6);
        trunkGeom.translate(0, 1.75, 0);
        group.add(new THREE.Mesh(trunkGeom, this.palmWoodMaterial));

        // 3 tiers of conical pine needles
        for (let tier = 0; tier < 3; tier++) {
            const coneGeom = new THREE.ConeGeometry(2.4 - tier * 0.55, 3.8, 7);
            coneGeom.translate(0, 3.2 + tier * 2.2, 0);
            group.add(new THREE.Mesh(coneGeom, this.foliageMaterial));
        }
        return group;
    }

    createTunnelArch() {
        const group = new THREE.Group();
        const span = this.roadWidth + 3.5;
        const height = 8.5;
        const archDepth = 14;

        // Left support pillar
        const pillarL = new THREE.Mesh(new THREE.BoxGeometry(1.6, height, archDepth), this.concretePillarMaterial);
        pillarL.position.set(-span / 2, height / 2, 0);
        group.add(pillarL);

        // Right support pillar
        const pillarR = pillarL.clone();
        pillarR.position.x = span / 2;
        group.add(pillarR);

        // Top concrete roof arch
        const roof = new THREE.Mesh(new THREE.BoxGeometry(span + 1.6, 1.4, archDepth), this.concretePillarMaterial);
        roof.position.set(0, height + 0.7, 0);
        group.add(roof);

        // Warm interior sodium tunnel lights
        for (let z = -archDepth / 3; z <= archDepth / 3; z += archDepth / 3) {
            const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.6), new THREE.MeshBasicMaterial({ color: 0xffcc44 }));
            lamp.position.set(0, height - 0.1, z);
            group.add(lamp);
        }

        return group;
    }

    // =========================================================================
    // UPDATE CYCLE & DYNAMIC MAP SWITCHING
    // =========================================================================
    initRoadChunks() {
        for (let i = 0; i < this.chunkCount; i++) {
            const chunk = this.createRoadChunk(i);
            this.chunks.push(chunk);
        }
    }

    update(playerZ) {
        if (this.starMesh) this.starMesh.position.z = playerZ;
        if (this.skyDome) this.skyDome.position.z = playerZ;

        if (this.dirLight) {
            this.dirLight.position.z = playerZ - 30;
            this.dirLight.target.position.z = playerZ + 20;
            this.dirLight.target.updateMatrixWorld();
        }

        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            if (chunk.position.z < playerZ - this.chunkLength * 1.5) {
                let maxZ = -Infinity;
                for (let j = 0; j < this.chunks.length; j++) {
                    if (this.chunks[j].position.z > maxZ) maxZ = this.chunks[j].position.z;
                }
                chunk.position.z = maxZ + this.chunkLength;
            }
        }
    }

    setMap(mapKey) {
        const map = this.maps[mapKey] || this.maps.tokyo_night;
        this.currentMapKey = mapKey;
        this.currentMap = map;

        this.updateSkyTexture();

        if (this.scene.fog) {
            this.scene.fog.color.setHex(map.fogColor);
            this.scene.fog.near = map.fogNear;
            this.scene.fog.far = map.fogFar;
            this.scene.background.setHex(map.fogColor);
        }
        if (this.ambientLight) this.ambientLight.color.setHex(map.ambientLight);
        if (this.dirLight) {
            this.dirLight.color.setHex(map.dirLightColor);
            this.dirLight.intensity = map.dirIntensity;
            this.dirLight.position.x = map.sunPosition[0];
            this.dirLight.position.y = map.sunPosition[1];
        }
        if (this.barrierMaterial) this.barrierMaterial.color.setHex(map.barrierColor);
        if (this.roadMaterial) {
            this.roadMaterial.color.setHex(map.roadColor);
            this.roadMaterial.roughness = map.roughness;
            this.roadMaterial.metalness = map.metalness;
        }

        // Rebuild Scenery for all chunks to immediately reflect new map
        for (const chunk of this.chunks) {
            if (chunk.userData && chunk.userData.sceneryGroup) {
                while (chunk.userData.sceneryGroup.children.length > 0) {
                    chunk.userData.sceneryGroup.remove(chunk.userData.sceneryGroup.children[0]);
                }
                this.populateScenery(chunk.userData.sceneryGroup, this.chunkLength, chunk.userData.index);
            }
        }
    }
}

window.World = World;
