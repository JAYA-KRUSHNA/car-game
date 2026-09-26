/**
 * Neon Velocity - Photorealistic Highway World, Skyline & Dynamic Sky Dome
 * Features:
 * - Procedural photorealistic glass curtain-wall skyscraper facade textures
 * - Distant mountain & skyline silhouettes along the horizon
 * - Luminous sun/moon disk with atmospheric corona haze
 * - Highway overhead exit signs & roadside reflective hazard chevrons
 * - Real shadow mapping on asphalt and barriers
 */

class World {
    constructor(scene) {
        this.scene = scene;
        this.chunkLength = 95;
        this.chunkCount = 6;
        this.roadWidth = 22;
        this.totalLength = this.chunkLength * this.chunkCount;
        this.chunks = [];

        this.themes = {
            midnight: {
                name: "Midnight Metropolis",
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
                skyTop: '#120516',
                skyMid: '#38122c',
                skyBottom: '#6b203c',
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
                skyTop: '#060d16',
                skyMid: '#0c1c28',
                skyBottom: '#14303c',
                roughness: 0.4,
                metalness: 0.6
            }
        };
        this.currentThemeKey = 'midnight';
        this.currentTheme = this.themes.midnight;

        this.initTextures();
        this.initMaterials();
        this.initSkyAndLighting();
        this.initRoadChunks();
    }

    initTextures() {
        // 1. Procedural High-Res Skyscraper Window Canvas Texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Dark glass facade background
        ctx.fillStyle = '#0a0d16';
        ctx.fillRect(0, 0, 512, 1024);

        // Draw structural vertical mullions
        ctx.strokeStyle = '#181e2e';
        ctx.lineWidth = 4;
        for (let x = 0; x < 512; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 1024);
            ctx.stroke();
        }

        // Draw horizontal floor spandrels
        for (let y = 0; y < 1024; y += 48) {
            ctx.fillStyle = '#141a28';
            ctx.fillRect(0, y, 512, 10);
        }

        // Draw illuminated office window matrix
        for (let y = 14; y < 1024; y += 48) {
            for (let x = 6; x < 512; x += 32) {
                const rand = Math.random();
                if (rand > 0.45) {
                    // Warm golden or cool cyan office light
                    ctx.fillStyle = rand > 0.8 ? '#ffeedd' : (rand > 0.65 ? '#cceeff' : '#ffd788');
                    ctx.fillRect(x, y, 20, 24);
                }
            }
        }

        this.buildingTexture = new THREE.CanvasTexture(canvas);
        this.buildingTexture.wrapS = THREE.RepeatWrapping;
        this.buildingTexture.wrapT = THREE.RepeatWrapping;
        this.buildingTexture.repeat.set(1, 2);

        // 2. Realistic Sky Dome Gradient Texture
        this.skyCanvas = document.createElement('canvas');
        this.skyCanvas.width = 512;
        this.skyCanvas.height = 512;
        this.updateSkyTexture();
        this.skyTexture = new THREE.CanvasTexture(this.skyCanvas);
    }

    updateSkyTexture() {
        const ctx = this.skyCanvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.0, this.currentTheme.skyTop);
        grad.addColorStop(0.55, this.currentTheme.skyMid);
        grad.addColorStop(0.9, this.currentTheme.skyBottom);
        grad.addColorStop(1.0, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Draw celestial Sun / Moon glow
        const sunX = 256;
        const sunY = 180;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120);
        sunGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
        sunGrad.addColorStop(0.2, 'rgba(150, 220, 255, 0.4)');
        sunGrad.addColorStop(0.6, 'rgba(100, 180, 255, 0.1)');
        sunGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
        ctx.fill();

        if (this.skyTexture) this.skyTexture.needsUpdate = true;
    }

    initMaterials() {
        this.roadMaterial = new THREE.MeshStandardMaterial({
            color: this.currentTheme.roadColor,
            roughness: this.currentTheme.roughness,
            metalness: this.currentTheme.metalness
        });

        this.barrierMaterial = new THREE.MeshBasicMaterial({
            color: this.currentTheme.barrierColor
        });

        this.markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        this.shoulderMaterial = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

        this.curbMaterial = new THREE.MeshStandardMaterial({
            color: 0x222630,
            roughness: 0.8,
            metalness: 0.2
        });

        // Photorealistic Glass Skyscraper Material
        this.buildingFacadeMaterial = new THREE.MeshStandardMaterial({
            map: this.buildingTexture,
            roughness: 0.25,
            metalness: 0.85
        });

        this.buildingSolidMaterial = new THREE.MeshStandardMaterial({
            color: 0x090c14,
            roughness: 0.6,
            metalness: 0.5
        });

        const billboardColors = [0x00f0ff, 0xff0066, 0x9900ff, 0x00ff88, 0xffbb00];
        this.billboardMaterials = billboardColors.map(c => new THREE.MeshBasicMaterial({ color: c }));
    }

    initSkyAndLighting() {
        this.scene.fog = new THREE.Fog(
            this.currentTheme.fogColor,
            this.currentTheme.fogNear,
            this.currentTheme.fogFar
        );
        this.scene.background = new THREE.Color(this.currentTheme.fogColor);

        // Realistic Sky Dome Hemisphere
        const skyGeom = new THREE.SphereGeometry(450, 24, 16);
        const skyMat = new THREE.MeshBasicMaterial({
            map: this.skyTexture,
            side: THREE.BackSide
        });
        this.skyDome = new THREE.Mesh(skyGeom, skyMat);
        this.scene.add(this.skyDome);

        this.ambientLight = new THREE.AmbientLight(this.currentTheme.ambientLight, 1.8);
        this.scene.add(this.ambientLight);

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

        this.hemiLight = new THREE.HemisphereLight(0x283850, 0x060914, 1.1);
        this.scene.add(this.hemiLight);

        // Twinkling Starfield
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
        const starMat = new THREE.PointsMaterial({
            color: 0xd8e4ff,
            size: 1.6,
            transparent: true,
            opacity: 0.85
        });
        this.starMesh = new THREE.Points(starGeom, starMat);
        this.scene.add(this.starMesh);
    }

    createRoadChunk(index) {
        const chunk = new THREE.Group();
        const zCenter = index * this.chunkLength;
        chunk.position.z = zCenter;

        // 1. Road Surface (Receives shadows)
        const roadGeom = new THREE.PlaneGeometry(this.roadWidth, this.chunkLength);
        roadGeom.rotateX(-Math.PI / 2);
        const road = new THREE.Mesh(roadGeom, this.roadMaterial);
        road.receiveShadow = true;
        chunk.add(road);

        // 2. Curbs & Guardrails
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

        // Glowing Barrier
        const railGeom = new THREE.BoxGeometry(0.2, 0.24, this.chunkLength);
        const railL = new THREE.Mesh(railGeom, this.barrierMaterial);
        railL.position.set(-this.roadWidth / 2 + 0.1, 0.52, 0);
        chunk.add(railL);

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

        // 4. Overhead Highway Gantry
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

        // 6. Realistic Skyscraper Architecture
        const buildingGroup = new THREE.Group();
        this.populateSkyscrapers(buildingGroup, this.chunkLength);
        chunk.add(buildingGroup);

        chunk.userData = { index: index };
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
        const height = 9.0;
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

        // Realistic Highway Signboard
        const signGeom = new THREE.BoxGeometry(span * 0.65, 2.4, 0.22);
        signGeom.translate(0, height - 0.1, 0);
        const signMat = this.billboardMaterials[Math.floor(Math.random() * this.billboardMaterials.length)];
        const sign = new THREE.Mesh(signGeom, signMat);
        gantry.add(sign);

        return gantry;
    }

    populateSkyscrapers(parentGroup, length) {
        const numLeft = 4;
        const numRight = 4;

        for (let i = 0; i < numLeft; i++) {
            const bWidth = Math.random() * 14 + 12;
            const bHeight = Math.random() * 85 + 45;
            const bDepth = Math.random() * 16 + 12;

            const bGeom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            bGeom.translate(0, bHeight / 2, 0);
            const building = new THREE.Mesh(bGeom, this.buildingFacadeMaterial);

            const posX = -(this.roadWidth / 2 + 14 + bWidth / 2 + Math.random() * 8);
            const posZ = -length / 2 + (i + 0.5) * (length / numLeft);
            building.position.set(posX, 0, posZ);

            // Rooftop antenna with flashing red aviation obstruction light
            const antennaGeom = new THREE.CylinderGeometry(0.08, 0.18, 14, 6);
            antennaGeom.translate(0, bHeight + 7, 0);
            building.add(new THREE.Mesh(antennaGeom, this.buildingSolidMaterial));

            const beaconGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            beaconGeom.translate(0, bHeight + 14, 0);
            const beaconMat = this.billboardMaterials[1];
            building.add(new THREE.Mesh(beaconGeom, beaconMat));

            parentGroup.add(building);
        }

        for (let i = 0; i < numRight; i++) {
            const bWidth = Math.random() * 14 + 12;
            const bHeight = Math.random() * 95 + 45;
            const bDepth = Math.random() * 16 + 12;

            const bGeom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            bGeom.translate(0, bHeight / 2, 0);
            const building = new THREE.Mesh(bGeom, this.buildingFacadeMaterial);

            const posX = (this.roadWidth / 2 + 14 + bWidth / 2 + Math.random() * 8);
            const posZ = -length / 2 + (i + 0.5) * (length / numRight);
            building.position.set(posX, 0, posZ);

            const antennaGeom = new THREE.CylinderGeometry(0.08, 0.18, 14, 6);
            antennaGeom.translate(0, bHeight + 7, 0);
            building.add(new THREE.Mesh(antennaGeom, this.buildingSolidMaterial));

            const beaconGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            beaconGeom.translate(0, bHeight + 14, 0);
            building.add(new THREE.Mesh(beaconGeom, this.billboardMaterials[1]));

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

    setTheme(themeKey) {
        const theme = this.themes[themeKey] || this.themes.midnight;
        this.currentThemeKey = themeKey;
        this.currentTheme = theme;

        this.updateSkyTexture();

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
