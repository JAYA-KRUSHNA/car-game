/**
 * Neon Velocity - World & Environment Generation (Zero Lag Road Pooling)
 * Generates an endless Cyberpunk metropolis highway with skyscrapers, neon signs, and streetlights.
 */

class World {
    constructor(scene) {
        this.scene = scene;
        this.chunkLength = 90;
        this.chunkCount = 6;
        this.roadWidth = 22; // 4 wide lanes
        this.totalLength = this.chunkLength * this.chunkCount;
        this.chunks = [];

        // Track Environment themes
        this.themes = {
            neoTokyo: {
                fogColor: 0x060914,
                fogNear: 60,
                fogFar: 360,
                barrierColor: 0x00f0ff,
                ambientLight: 0x182038,
                dirLight: 0x88bbff
            },
            sunsetSynth: {
                fogColor: 0x160822,
                fogNear: 50,
                fogFar: 340,
                barrierColor: 0xff0077,
                ambientLight: 0x2b103a,
                dirLight: 0xff88aa
            }
        };
        this.currentTheme = this.themes.neoTokyo;

        this.initMaterials();
        this.initSkyAndLighting();
        this.initRoadChunks();
    }

    initMaterials() {
        // Road Asphalt Material
        this.roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x12141c,
            roughness: 0.4,
            metalness: 0.6
        });

        // Glowing Barrier Material
        this.barrierMaterial = new THREE.MeshBasicMaterial({
            color: this.currentTheme.barrierColor
        });

        // Road Lane Marking (Dashed Neon Yellow / Cyan)
        this.markingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00
        });

        this.shoulderMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f0ff
        });

        // Building Facade Materials
        this.buildingMaterials = [
            new THREE.MeshStandardMaterial({ color: 0x0b0e17, roughness: 0.6, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x121726, roughness: 0.5, metalness: 0.7 }),
            new THREE.MeshStandardMaterial({ color: 0x070910, roughness: 0.8, metalness: 0.3 })
        ];

        // Neon Billboard Materials
        const billboardColors = [0x00f0ff, 0xff0066, 0x9900ff, 0x00ff88, 0xffbb00];
        this.billboardMaterials = billboardColors.map(c => new THREE.MeshBasicMaterial({ color: c }));
    }

    initSkyAndLighting() {
        // Deep Cyberpunk Distance Fog
        this.scene.fog = new THREE.Fog(this.currentTheme.fogColor, this.currentTheme.fogNear, this.currentTheme.fogFar);
        this.scene.background = new THREE.Color(this.currentTheme.fogColor);

        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(this.currentTheme.ambientLight, 1.8);
        this.scene.add(this.ambientLight);

        // Directional Moonlight / City Sky Light
        this.dirLight = new THREE.DirectionalLight(this.currentTheme.dirLight, 2.2);
        this.dirLight.position.set(30, 80, -40);
        this.scene.add(this.dirLight);

        // Hemisphere Light for soft horizon glow
        this.hemiLight = new THREE.HemisphereLight(0x334466, 0x050810, 1.2);
        this.scene.add(this.hemiLight);

        // Distant Starfield Dome
        const starGeom = new THREE.BufferGeometry();
        const starCount = 800;
        const starPos = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const r = 350 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.45; // Upper dome

            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.cos(phi) + 20;
            starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }

        starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xccddff,
            size: 1.5,
            transparent: true,
            opacity: 0.75
        });
        this.starMesh = new THREE.Points(starGeom, starMat);
        this.scene.add(this.starMesh);
    }

    createRoadChunk(index) {
        const chunk = new THREE.Group();
        const zCenter = index * this.chunkLength;
        chunk.position.z = zCenter;

        // 1. Road Surface Mesh
        const roadGeom = new THREE.PlaneGeometry(this.roadWidth, this.chunkLength);
        roadGeom.rotateX(-Math.PI / 2);
        const road = new THREE.Mesh(roadGeom, this.roadMaterial);
        chunk.add(road);

        // 2. Concrete Curbs & Neon Guardrails (Left and Right)
        const curbWidth = 1.2;
        const curbGeom = new THREE.BoxGeometry(curbWidth, 0.45, this.chunkLength);

        // Left curb
        const curbL = new THREE.Mesh(curbGeom, this.buildingMaterials[0]);
        curbL.position.set(-this.roadWidth / 2 - curbWidth / 2, 0.22, 0);
        chunk.add(curbL);

        // Right curb
        const curbR = new THREE.Mesh(curbGeom, this.buildingMaterials[0]);
        curbR.position.set(this.roadWidth / 2 + curbWidth / 2, 0.22, 0);
        chunk.add(curbR);

        // Left Glowing Neon Rail
        const railGeom = new THREE.BoxGeometry(0.18, 0.22, this.chunkLength);
        const railL = new THREE.Mesh(railGeom, this.barrierMaterial);
        railL.position.set(-this.roadWidth / 2 + 0.1, 0.5, 0);
        chunk.add(railL);

        // Right Glowing Neon Rail
        const railR = new THREE.Mesh(railGeom, this.barrierMaterial);
        railR.position.set(this.roadWidth / 2 - 0.1, 0.5, 0);
        chunk.add(railR);

        // 3. Lane Markings
        // 4 lanes: lane dividers at x = -5.5, x = 0, x = +5.5
        const lanePositions = [-5.5, 0, 5.5];
        const dashCount = 8;
        const dashLength = 4.5;
        const dashSpacing = this.chunkLength / dashCount;

        for (const laneX of lanePositions) {
            for (let i = 0; i < dashCount; i++) {
                const isCenter = Math.abs(laneX) < 0.1;
                const dashGeom = new THREE.PlaneGeometry(0.2, dashLength);
                dashGeom.rotateX(-Math.PI / 2);
                const dashMesh = new THREE.Mesh(dashGeom, isCenter ? this.shoulderMaterial : this.markingMaterial);
                dashMesh.position.set(laneX, 0.02, -this.chunkLength / 2 + (i + 0.5) * dashSpacing);
                chunk.add(dashMesh);
            }
        }

        // 4. Cyberpunk Overhead Gantry / Arch with Billboard (Every alternate chunk)
        if (index % 2 === 1) {
            const arch = this.createHighwayGantry();
            arch.position.set(0, 0, 0);
            chunk.add(arch);
        }

        // 5. Street Light Poles (Alternating left and right)
        const poleSpacing = 30;
        for (let pz = -this.chunkLength / 2 + 15; pz < this.chunkLength / 2; pz += poleSpacing) {
            const poleL = this.createLightPole(-this.roadWidth / 2 - 1.5, pz);
            const poleR = this.createLightPole(this.roadWidth / 2 + 1.5, pz, true);
            chunk.add(poleL);
            chunk.add(poleR);
        }

        // 6. City Skyline Buildings (Left & Right Flanks)
        const buildingGroup = new THREE.Group();
        this.populateBuildings(buildingGroup, this.chunkLength);
        chunk.add(buildingGroup);

        chunk.userData = {
            index: index,
            buildingGroup: buildingGroup
        };

        this.scene.add(chunk);
        return chunk;
    }

    createLightPole(x, z, flip = false) {
        const pole = new THREE.Group();
        pole.position.set(x, 0, z);

        // Vertical Mast
        const mastGeom = new THREE.CylinderGeometry(0.12, 0.18, 9, 8);
        mastGeom.translate(0, 4.5, 0);
        const mast = new THREE.Mesh(mastGeom, this.buildingMaterials[1]);
        pole.add(mast);

        // Horizontal Arm extending towards road
        const armLength = 4.2;
        const armGeom = new THREE.BoxGeometry(armLength, 0.12, 0.12);
        const armOffset = flip ? -armLength / 2 : armLength / 2;
        armGeom.translate(armOffset, 8.9, 0);
        const arm = new THREE.Mesh(armGeom, this.buildingMaterials[1]);
        pole.add(arm);

        // Glowing Lamp Fixture
        const lampGeom = new THREE.BoxGeometry(1.2, 0.1, 0.3);
        const lampOffset = flip ? -armLength + 0.6 : armLength - 0.6;
        lampGeom.translate(lampOffset, 8.8, 0);
        const lamp = new THREE.Mesh(lampGeom, this.billboardMaterials[0]);
        pole.add(lamp);

        return pole;
    }

    createHighwayGantry() {
        const gantry = new THREE.Group();
        const height = 8.5;
        const span = this.roadWidth + 4;

        // Twin pillars
        const pillarGeom = new THREE.BoxGeometry(0.6, height, 0.6);
        pillarGeom.translate(0, height / 2, 0);

        const pillarL = new THREE.Mesh(pillarGeom, this.buildingMaterials[1]);
        pillarL.position.set(-span / 2, 0, 0);
        const pillarR = pillarL.clone();
        pillarR.position.x = span / 2;
        gantry.add(pillarL);
        gantry.add(pillarR);

        // Cross beam
        const beamGeom = new THREE.BoxGeometry(span, 0.7, 0.8);
        beamGeom.translate(0, height - 0.35, 0);
        const beam = new THREE.Mesh(beamGeom, this.buildingMaterials[1]);
        gantry.add(beam);

        // Digital Billboard Signs
        const signGeom = new THREE.BoxGeometry(span * 0.6, 2.2, 0.2);
        signGeom.translate(0, height - 0.1, 0);
        const randomSignMat = this.billboardMaterials[Math.floor(Math.random() * this.billboardMaterials.length)];
        const sign = new THREE.Mesh(signGeom, randomSignMat);
        gantry.add(sign);

        return gantry;
    }

    populateBuildings(parentGroup, length) {
        // Left side skyscrapers
        const buildingDepths = [14, 18, 22, 26];
        const numLeft = 4;
        const numRight = 4;

        for (let i = 0; i < numLeft; i++) {
            const bWidth = Math.random() * 12 + 10;
            const bHeight = Math.random() * 65 + 35; // 35m to 100m tall
            const bDepth = Math.random() * 14 + 10;
            const bMat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)];

            const bGeom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            bGeom.translate(0, bHeight / 2, 0);
            const building = new THREE.Mesh(bGeom, bMat);

            const posX = -(this.roadWidth / 2 + 12 + bWidth / 2 + Math.random() * 8);
            const posZ = -length / 2 + (i + 0.5) * (length / numLeft);
            building.position.set(posX, 0, posZ);

            // Add glowing neon strip or logo on building face
            if (Math.random() > 0.4) {
                const neonGeom = new THREE.BoxGeometry(0.3, bHeight * 0.6, 0.3);
                neonGeom.translate(bWidth / 2 + 0.1, bHeight * 0.5, 0);
                const neonMat = this.billboardMaterials[Math.floor(Math.random() * this.billboardMaterials.length)];
                const neon = new THREE.Mesh(neonGeom, neonMat);
                building.add(neon);
            }

            parentGroup.add(building);
        }

        // Right side skyscrapers
        for (let i = 0; i < numRight; i++) {
            const bWidth = Math.random() * 12 + 10;
            const bHeight = Math.random() * 70 + 35;
            const bDepth = Math.random() * 14 + 10;
            const bMat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)];

            const bGeom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            bGeom.translate(0, bHeight / 2, 0);
            const building = new THREE.Mesh(bGeom, bMat);

            const posX = (this.roadWidth / 2 + 12 + bWidth / 2 + Math.random() * 8);
            const posZ = -length / 2 + (i + 0.5) * (length / numRight);
            building.position.set(posX, 0, posZ);

            // Glowing rooftop beacon
            const beaconGeom = new THREE.BoxGeometry(1.5, 3.0, 1.5);
            beaconGeom.translate(0, bHeight + 1.5, 0);
            const beacon = new THREE.Mesh(beaconGeom, this.billboardMaterials[1]);
            building.add(beacon);

            parentGroup.add(building);
        }
    }

    initRoadChunks() {
        for (let i = 0; i < this.chunkCount; i++) {
            const chunk = this.createRoadChunk(i);
            this.chunks.push(chunk);
        }
    }

    update(playerZ) {
        // Move starfield along with player so it stays at infinity
        if (this.starMesh) {
            this.starMesh.position.z = playerZ;
        }

        // Check if oldest chunk is far behind player
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            // If chunk is more than 1 chunk length behind the player
            if (chunk.position.z < playerZ - this.chunkLength * 1.5) {
                // Find highest Z chunk
                let maxZ = -Infinity;
                for (let j = 0; j < this.chunks.length; j++) {
                    if (this.chunks[j].position.z > maxZ) {
                        maxZ = this.chunks[j].position.z;
                    }
                }
                // Seamlessly leap chunk forward to front of highway!
                chunk.position.z = maxZ + this.chunkLength;
            }
        }
    }

    setTheme(themeName) {
        const theme = this.themes[themeName] || this.themes.neoTokyo;
        this.currentTheme = theme;
        if (this.scene.fog) {
            this.scene.fog.color.setHex(theme.fogColor);
            this.scene.background.setHex(theme.fogColor);
        }
        if (this.ambientLight) this.ambientLight.color.setHex(theme.ambientLight);
        if (this.dirLight) this.dirLight.color.setHex(theme.dirLight);
        if (this.barrierMaterial) this.barrierMaterial.color.setHex(theme.barrierColor);
    }
}

window.World = World;
