/**
 * Neon Velocity - Realistic Highway World & Dynamic Environments
 * Features:
 * - Real shadow mapping on road and barriers
 * - Wet asphalt with specular sheen & road lane dividers
 * - 3 Selectable realistic environments: Midnight Metropolis, Golden Sunset, and Cyber Dawn
 * - Streetlamps with volumetric road lighting pools
 * - Overhead LED gantries with animated billboards
 */

class World {
    constructor(scene) {
        this.scene = scene;
        this.chunkLength = 95;
        this.chunkCount = 6;
        this.roadWidth = 22; // 4 full lanes
        this.totalLength = this.chunkLength * this.chunkCount;
        this.chunks = [];

        // Realistic Environment Presets
        this.themes = {
            midnight: {
                name: "Midnight Metropolis",
                fogColor: 0x070914,
                fogNear: 70,
                fogFar: 380,
                barrierColor: 0x00f0ff,
                ambientLight: 0x141828,
                dirLightColor: 0x88bbff,
                dirIntensity: 2.2,
                sunPosition: [30, 85, -40],
                roadColor: 0x11131a,
                roughness: 0.35,
                metalness: 0.65
            },
            sunset: {
                name: "Golden Sunset Coast",
                fogColor: 0x1c0b1a,
                fogNear: 60,
                fogFar: 350,
                barrierColor: 0xff0066,
                ambientLight: 0x2d1222,
                dirLightColor: 0xffa055,
                dirIntensity: 2.8,
                sunPosition: [-45, 45, 60],
                roadColor: 0x14141d,
                roughness: 0.45,
                metalness: 0.55
            },
            dawn: {
                name: "Cyber Dawn",
                fogColor: 0x0a1420,
                fogNear: 45,
                fogFar: 320,
                barrierColor: 0x00ffaa,
                ambientLight: 0x10202c,
                dirLightColor: 0x66ffcc,
                dirIntensity: 2.0,
                sunPosition: [40, 60, -30],
                roadColor: 0x0e151d,
                roughness: 0.4,
                metalness: 0.6
            }
        };
        this.currentThemeKey = 'midnight';
        this.currentTheme = this.themes.midnight;

        this.initMaterials();
        this.initSkyAndLighting();
        this.initRoadChunks();
    }

    initMaterials() {
        // Wet Asphalt Material with specular reflection
        this.roadMaterial = new THREE.MeshStandardMaterial({
            color: this.currentTheme.roadColor,
            roughness: this.currentTheme.roughness,
            metalness: this.currentTheme.metalness
        });

        // Glowing Barrier Guardrail Material
        this.barrierMaterial = new THREE.MeshBasicMaterial({
            color: this.currentTheme.barrierColor
        });

        // Road Lane Dash Material
        this.markingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00
        });

        this.shoulderMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f0ff
        });

        // Concrete Curb
        this.curbMaterial = new THREE.MeshStandardMaterial({
            color: 0x222630,
            roughness: 0.8,
            metalness: 0.2
        });

        // Skyscraper Architectural Materials
        this.buildingMaterials = [
            new THREE.MeshStandardMaterial({ color: 0x0b0e16, roughness: 0.5, metalness: 0.6 }),
            new THREE.MeshStandardMaterial({ color: 0x121724, roughness: 0.4, metalness: 0.75 }),
            new THREE.MeshStandardMaterial({ color: 0x080b12, roughness: 0.7, metalness: 0.4 })
        ];

        // Animated Billboard LED Materials
        const billboardColors = [0x00f0ff, 0xff0066, 0x9900ff, 0x00ff88, 0xffbb00];
        this.billboardMaterials = billboardColors.map(c => new THREE.MeshBasicMaterial({ color: c }));
    }

    initSkyAndLighting() {
        // Distance Fog
        this.scene.fog = new THREE.Fog(
            this.currentTheme.fogColor,
            this.currentTheme.fogNear,
            this.currentTheme.fogFar
        );
        this.scene.background = new THREE.Color(this.currentTheme.fogColor);

        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(this.currentTheme.ambientLight, 1.8);
        this.scene.add(this.ambientLight);

        // Directional Sun / Moon Light with Soft Shadows
        this.dirLight = new THREE.DirectionalLight(
            this.currentTheme.dirLightColor,
            this.currentTheme.dirIntensity
        );
        this.dirLight.position.set(...this.currentTheme.sunPosition);
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

        // Hemisphere Light for soft environmental fill
        this.hemiLight = new THREE.HemisphereLight(0x283850, 0x060914, 1.1);
        this.scene.add(this.hemiLight);

        // Deep Starfield Dome
        const starGeom = new THREE.BufferGeometry();
        const starCount = 900;
        const starPos = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const r = 380 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.45;

            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.cos(phi) + 20;
            starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }

        starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xd8e4ff,
            size: 1.6,
            transparent: true,
            opacity: 0.8
        });
        this.starMesh = new THREE.Points(starGeom, starMat);
        this.scene.add(this.starMesh);
    }

    createRoadChunk(index) {
        const chunk = new THREE.Group();
        const zCenter = index * this.chunkLength;
        chunk.position.z = zCenter;

        // 1. Road Surface Mesh (Receives shadows)
        const roadGeom = new THREE.PlaneGeometry(this.roadWidth, this.chunkLength);
        roadGeom.rotateX(-Math.PI / 2);
        const road = new THREE.Mesh(roadGeom, this.roadMaterial);
        road.receiveShadow = true;
        chunk.add(road);

        // 2. Concrete Curbs & Neon Guardrails (Left and Right)
        const curbWidth = 1.3;
        const curbGeom = new THREE.BoxGeometry(curbWidth, 0.48, this.chunkLength);

        // Left curb
        const curbL = new THREE.Mesh(curbGeom, this.curbMaterial);
        curbL.position.set(-this.roadWidth / 2 - curbWidth / 2, 0.24, 0);
        curbL.receiveShadow = true;
        chunk.add(curbL);

        // Right curb
        const curbR = new THREE.Mesh(curbGeom, this.curbMaterial);
        curbR.position.set(this.roadWidth / 2 + curbWidth / 2, 0.24, 0);
        curbR.receiveShadow = true;
        chunk.add(curbR);

        // Left Glowing Barrier
        const railGeom = new THREE.BoxGeometry(0.2, 0.24, this.chunkLength);
        const railL = new THREE.Mesh(railGeom, this.barrierMaterial);
        railL.position.set(-this.roadWidth / 2 + 0.1, 0.52, 0);
        chunk.add(railL);

        // Right Glowing Barrier
        const railR = new THREE.Mesh(railGeom, this.barrierMaterial);
        railR.position.set(this.roadWidth / 2 - 0.1, 0.52, 0);
        chunk.add(railR);

        // 3. Lane Dividers
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

        // 4. Overhead Gantry with Digital Billboard (Every other chunk)
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

        // 6. City Skyline Architecture
        const buildingGroup = new THREE.Group();
        this.populateBuildings(buildingGroup, this.chunkLength);
        chunk.add(buildingGroup);

        chunk.userData = { index: index };
        this.scene.add(chunk);
        return chunk;
    }

    createLightPole(x, z, flip = false) {
        const pole = new THREE.Group();
        pole.position.set(x, 0, z);

        // Mast
        const mastGeom = new THREE.CylinderGeometry(0.14, 0.2, 9.5, 8);
        mastGeom.translate(0, 4.75, 0);
        const mast = new THREE.Mesh(mastGeom, this.buildingMaterials[1]);
        mast.castShadow = true;
        pole.add(mast);

        // Arm
        const armLength = 4.5;
        const armGeom = new THREE.BoxGeometry(armLength, 0.14, 0.14);
        const armOffset = flip ? -armLength / 2 : armLength / 2;
        armGeom.translate(armOffset, 9.4, 0);
        const arm = new THREE.Mesh(armGeom, this.buildingMaterials[1]);
        arm.castShadow = true;
        pole.add(arm);

        // Lamp Head
        const lampGeom = new THREE.BoxGeometry(1.3, 0.12, 0.35);
        const lampOffset = flip ? -armLength + 0.65 : armLength - 0.65;
        lampGeom.translate(lampOffset, 9.3, 0);
        const lamp = new THREE.Mesh(lampGeom, this.billboardMaterials[0]);
        pole.add(lamp);

        return pole;
    }

    createHighwayGantry() {
        const gantry = new THREE.Group();
        const height = 9.0;
        const span = this.roadWidth + 4.5;

        // Pillars
        const pillarGeom = new THREE.BoxGeometry(0.65, height, 0.65);
        pillarGeom.translate(0, height / 2, 0);

        const pillarL = new THREE.Mesh(pillarGeom, this.buildingMaterials[1]);
        pillarL.position.set(-span / 2, 0, 0);
        pillarL.castShadow = true;

        const pillarR = pillarL.clone();
        pillarR.position.x = span / 2;
        gantry.add(pillarL);
        gantry.add(pillarR);

        // Cross Beam
        const beamGeom = new THREE.BoxGeometry(span, 0.8, 0.9);
        beamGeom.translate(0, height - 0.4, 0);
        const beam = new THREE.Mesh(beamGeom, this.buildingMaterials[1]);
        beam.castShadow = true;
        gantry.add(beam);

        // High-Tech Digital Signboard
        const signGeom = new THREE.BoxGeometry(span * 0.65, 2.4, 0.22);
        signGeom.translate(0, height - 0.1, 0);
        const signMat = this.billboardMaterials[Math.floor(Math.random() * this.billboardMaterials.length)];
        const sign = new THREE.Mesh(signGeom, signMat);
        gantry.add(sign);

        return gantry;
    }

    populateBuildings(parentGroup, length) {
        const numLeft = 4;
        const numRight = 4;

        for (let i = 0; i < numLeft; i++) {
            const bWidth = Math.random() * 14 + 10;
            const bHeight = Math.random() * 75 + 40;
            const bDepth = Math.random() * 16 + 12;
            const bMat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)];

            const bGeom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            bGeom.translate(0, bHeight / 2, 0);
            const building = new THREE.Mesh(bGeom, bMat);

            const posX = -(this.roadWidth / 2 + 13 + bWidth / 2 + Math.random() * 8);
            const posZ = -length / 2 + (i + 0.5) * (length / numLeft);
            building.position.set(posX, 0, posZ);

            if (Math.random() > 0.35) {
                const neonGeom = new THREE.BoxGeometry(0.35, bHeight * 0.6, 0.35);
                neonGeom.translate(bWidth / 2 + 0.1, bHeight * 0.5, 0);
                const neonMat = this.billboardMaterials[Math.floor(Math.random() * this.billboardMaterials.length)];
                building.add(new THREE.Mesh(neonGeom, neonMat));
            }
            parentGroup.add(building);
        }

        for (let i = 0; i < numRight; i++) {
            const bWidth = Math.random() * 14 + 10;
            const bHeight = Math.random() * 80 + 40;
            const bDepth = Math.random() * 16 + 12;
            const bMat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)];

            const bGeom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            bGeom.translate(0, bHeight / 2, 0);
            const building = new THREE.Mesh(bGeom, bMat);

            const posX = (this.roadWidth / 2 + 13 + bWidth / 2 + Math.random() * 8);
            const posZ = -length / 2 + (i + 0.5) * (length / numRight);
            building.position.set(posX, 0, posZ);

            // Rooftop beacon
            const beaconGeom = new THREE.BoxGeometry(1.6, 3.2, 1.6);
            beaconGeom.translate(0, bHeight + 1.6, 0);
            const beaconMat = this.billboardMaterials[1];
            building.add(new THREE.Mesh(beaconGeom, beaconMat));

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
        if (this.starMesh) {
            this.starMesh.position.z = playerZ;
        }

        // Follow directional shadow camera along with player
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
                    if (this.chunks[j].position.z > maxZ) {
                        maxZ = this.chunks[j].position.z;
                    }
                }
                chunk.position.z = maxZ + this.chunkLength;
            }
        }
    }

    setTheme(themeKey) {
        const theme = this.themes[themeKey] || this.themes.midnight;
        this.currentThemeKey = themeKey;
        this.currentTheme = theme;

        if (this.scene.fog) {
            this.scene.fog.color.setHex(theme.fogColor);
            this.scene.fog.near = theme.fogNear;
            this.scene.fog.far = theme.fogFar;
            this.scene.background.setHex(theme.fogColor);
        }
        if (this.ambientLight) this.ambientLight.color.setHex(theme.ambientLight);
        if (this.dirLight) {
            this.dirLight.color.setHex(theme.dirLightColor);
            this.dirLight.intensity = theme.dirIntensity;
            this.dirLight.position.x = theme.sunPosition[0];
            this.dirLight.position.y = theme.sunPosition[1];
        }
        if (this.barrierMaterial) this.barrierMaterial.color.setHex(theme.barrierColor);
        if (this.roadMaterial) {
            this.roadMaterial.color.setHex(theme.roadColor);
            this.roadMaterial.roughness = theme.roughness;
            this.roadMaterial.metalness = theme.metalness;
        }
    }
}

window.World = World;
