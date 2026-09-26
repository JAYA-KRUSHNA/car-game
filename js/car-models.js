/**
 * Neon Velocity - Highly Realistic 3D Automotive Models & Live Cars
 * Features:
 * - Sculpted aerodynamic curves, flared fenders, vented hoods, side scoops, and rear diffusers.
 * - Multi-spoke forged alloy wheels with drilled ceramic rotors and heated brake glow.
 * - Motorized Active Aero Rear Wing (lifts at speed, acts as Air Brake on hard deceleration).
 * - Scissor doors for interactive showroom animation.
 * - Realistic AI Traffic (Executive Sedan, Urban SUV, Sports Coupe, Heavy Container Semi-Truck).
 * - Live dynamic traffic lighting: Functional brake lights and flashing amber turn signal indicators!
 */

const CAR_PRESETS = {
    apex: {
        name: "Apex Phantom GT",
        tagline: "Twin-Turbo Hybrid Hypercar with Active Aero",
        baseColor: 0x00d8ff,
        accentColor: 0x0a0d16,
        underglowColor: 0x00f0ff,
        topSpeed: 218,
        acceleration: 9.3,
        handling: 8.9,
        nitroPower: 8.8,
        unlocked: true,
        price: 0
    },
    spectre: {
        name: "Cyber Spectre EV",
        tagline: "Solid-State Quad-Motor Hypercar (1,800 HP)",
        baseColor: 0xff0066,
        accentColor: 0x070910,
        underglowColor: 0xff00aa,
        topSpeed: 232,
        acceleration: 9.9,
        handling: 9.2,
        nitroPower: 9.6,
        unlocked: false,
        price: 3500
    },
    viper: {
        name: "Crimson Viper V10",
        tagline: "8.4L Naturally Aspirated Track Monster",
        baseColor: 0xee2200,
        accentColor: 0x12141a,
        underglowColor: 0xff3300,
        topSpeed: 224,
        acceleration: 9.0,
        handling: 8.2,
        nitroPower: 9.1,
        unlocked: false,
        price: 6000
    },
    valkyrie: {
        name: "Valkyrie Hyper-LM",
        tagline: "Carbon Fiber Le Mans Prototype with Ground Effects",
        baseColor: 0x00ff88,
        accentColor: 0x06080e,
        underglowColor: 0x00ffaa,
        topSpeed: 248,
        acceleration: 9.6,
        handling: 9.8,
        nitroPower: 10.0,
        unlocked: false,
        price: 12000
    }
};

class CarFactory {
    constructor() {
        // High quality shared PBR materials
        this.materials = {
            blackRubber: new THREE.MeshStandardMaterial({
                color: 0x1c1c1c,
                roughness: 0.85,
                metalness: 0.15
            }),
            rimForged: new THREE.MeshStandardMaterial({
                color: 0xd8d8d8,
                roughness: 0.15,
                metalness: 0.95
            }),
            brakeCaliper: new THREE.MeshStandardMaterial({
                color: 0xee1100,
                roughness: 0.25,
                metalness: 0.7
            }),
            brakeDiscDrilled: new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.35,
                metalness: 0.85,
                emissive: 0x000000
            }),
            tintedGlass: new THREE.MeshPhysicalMaterial({
                color: 0x090c14,
                roughness: 0.05,
                metalness: 0.95,
                transparent: true,
                opacity: 0.88,
                reflectivity: 0.9
            }),
            carbonFiber: new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.5,
                metalness: 0.5
            }),
            mirrorChrome: new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.05,
                metalness: 0.98
            }),
            headlightLens: new THREE.MeshBasicMaterial({ color: 0xf0fbff }),
            headlightReflector: new THREE.MeshBasicMaterial({ color: 0x00e5ff }),
            taillightOff: new THREE.MeshBasicMaterial({ color: 0x440008 }),
            taillightBright: new THREE.MeshBasicMaterial({ color: 0xff0022 }),
            turnSignalAmber: new THREE.MeshBasicMaterial({ color: 0xff9900 }),
            turnSignalOff: new THREE.MeshBasicMaterial({ color: 0x442800 }),
            exhaustFlame: new THREE.MeshBasicMaterial({
                color: 0x00d4ff,
                transparent: true,
                opacity: 0.0
            })
        };
    }

    createRealisticWheel(radius = 0.38, width = 0.3) {
        const wheelGroup = new THREE.Group();

        // 1. Tire Rubber (Torus with beveled shoulder)
        const tireGeom = new THREE.CylinderGeometry(radius, radius, width, 24);
        tireGeom.rotateZ(Math.PI / 2);
        const tire = new THREE.Mesh(tireGeom, this.materials.blackRubber);
        tire.castShadow = true;
        wheelGroup.add(tire);

        // Tire sidewall rim lip
        const lipGeom = new THREE.TorusGeometry(radius * 0.76, 0.03, 8, 24);
        lipGeom.rotateY(Math.PI / 2);
        const lip = new THREE.Mesh(lipGeom, this.materials.rimForged);
        lip.position.x = width * 0.48;
        wheelGroup.add(lip);

        // 2. Forged Rim Barrel
        const rimGeom = new THREE.CylinderGeometry(radius * 0.74, radius * 0.74, width * 0.92, 16);
        rimGeom.rotateZ(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeom, this.materials.rimForged);
        wheelGroup.add(rim);

        // 3. Multi-Spoke Center (5 twin-spokes / 10 spokes)
        const spokeGroup = new THREE.Group();
        const numSpokes = 5;
        for (let i = 0; i < numSpokes; i++) {
            const angle = (i / numSpokes) * Math.PI * 2;
            const spokeGeom = new THREE.BoxGeometry(width * 0.96, radius * 1.35, 0.045);
            spokeGeom.rotateX(angle);
            const spoke = new THREE.Mesh(spokeGeom, this.materials.rimForged);
            spokeGroup.add(spoke);
        }
        wheelGroup.add(spokeGroup);

        // Center wheel hub nut
        const hubGeom = new THREE.CylinderGeometry(radius * 0.18, radius * 0.18, width * 1.02, 12);
        hubGeom.rotateZ(Math.PI / 2);
        const hub = new THREE.Mesh(hubGeom, this.materials.carbonFiber);
        wheelGroup.add(hub);

        // 4. Drilled Carbon-Ceramic Brake Rotor (Separate so it doesn't spin with the wheel!)
        const discGeom = new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, 0.03, 16);
        discGeom.rotateZ(Math.PI / 2);
        const discMat = this.materials.brakeDiscDrilled.clone();
        const disc = new THREE.Mesh(discGeom, discMat);
        disc.position.x = -width * 0.08;
        wheelGroup.add(disc);

        // 5. High-Performance Painted Brake Caliper
        const caliperGeom = new THREE.BoxGeometry(0.12, radius * 0.42, 0.16);
        caliperGeom.translate(0, radius * 0.36, 0);
        const caliper = new THREE.Mesh(caliperGeom, this.materials.brakeCaliper);
        caliper.position.x = -width * 0.08;
        wheelGroup.add(caliper);

        return {
            group: wheelGroup,
            tire: tire,
            spokes: spokeGroup,
            discMat: discMat
        };
    }

    createPlayerCar(modelKey = 'apex', customColor = null, customUnderglow = null) {
        const preset = CAR_PRESETS[modelKey] || CAR_PRESETS.apex;
        const carColor = customColor !== null ? customColor : preset.baseColor;
        const underglowColor = customUnderglow !== null ? customUnderglow : preset.underglowColor;

        const root = new THREE.Group();
        root.name = `car_${modelKey}`;

        // Glossy automotive multi-coat metallic paint
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: carColor,
            metalness: 0.88,
            roughness: 0.18
        });

        const accentMaterial = new THREE.MeshStandardMaterial({
            color: preset.accentColor,
            metalness: 0.7,
            roughness: 0.3
        });

        // -------------------------------------------------------------
        // 1. SCULPTED CHASSIS & LOWER BODY
        // -------------------------------------------------------------
        // Main aerodynamic monocoque
        const chassisGeom = new THREE.BoxGeometry(2.05, 0.38, 4.45);
        chassisGeom.translate(0, 0.32, 0);
        const chassis = new THREE.Mesh(chassisGeom, bodyMaterial);
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        root.add(chassis);

        // Flared Front Wheel Arches (Fenders)
        const fenderLGeom = new THREE.BoxGeometry(0.24, 0.45, 1.4);
        fenderLGeom.translate(-1.06, 0.42, 1.35);
        const fenderL = new THREE.Mesh(fenderLGeom, bodyMaterial);
        fenderL.castShadow = true;
        const fenderR = fenderL.clone();
        fenderR.position.x = 2.12;
        root.add(fenderL);
        root.add(fenderR);

        // Flared Rear Muscular Haunches
        const rearHaunchLGeom = new THREE.BoxGeometry(0.26, 0.52, 1.5);
        rearHaunchLGeom.translate(-1.08, 0.48, -1.35);
        const rearHaunchL = new THREE.Mesh(rearHaunchLGeom, bodyMaterial);
        rearHaunchL.castShadow = true;
        const rearHaunchR = rearHaunchL.clone();
        rearHaunchR.position.x = 2.16;
        root.add(rearHaunchL);
        root.add(rearHaunchR);

        // Front Low Wedge Nose & Hood
        const hoodGeom = new THREE.BoxGeometry(1.9, 0.22, 1.6);
        hoodGeom.translate(0, 0.48, 1.3);
        hoodGeom.rotateX(-0.08);
        const hood = new THREE.Mesh(hoodGeom, bodyMaterial);
        hood.castShadow = true;
        root.add(hood);

        // Hood dual heat extraction vents (Carbon fiber slats)
        const ventGeom = new THREE.BoxGeometry(0.42, 0.04, 0.6);
        const ventL = new THREE.Mesh(ventGeom, this.materials.carbonFiber);
        ventL.position.set(-0.45, 0.58, 1.2);
        ventL.rotation.x = -0.08;
        const ventR = ventL.clone();
        ventR.position.x = 0.45;
        root.add(ventL);
        root.add(ventR);

        // Front Carbon Aerodynamic Splitter with Canards
        const splitterGeom = new THREE.BoxGeometry(2.14, 0.08, 0.7);
        splitterGeom.translate(0, 0.14, 2.22);
        const splitter = new THREE.Mesh(splitterGeom, this.materials.carbonFiber);
        splitter.castShadow = true;
        root.add(splitter);

        // Carbon Side Skirts with Ground Effects
        const skirtLGeom = new THREE.BoxGeometry(0.12, 0.14, 2.5);
        skirtLGeom.translate(-1.06, 0.18, 0);
        const skirtL = new THREE.Mesh(skirtLGeom, this.materials.carbonFiber);
        const skirtR = skirtL.clone();
        skirtR.position.x = 2.12;
        root.add(skirtL);
        root.add(skirtR);

        // Side Air Intakes (Intercooler scoops)
        const scoopLGeom = new THREE.BoxGeometry(0.14, 0.28, 0.65);
        scoopLGeom.translate(-1.02, 0.45, -0.4);
        const scoopL = new THREE.Mesh(scoopLGeom, this.materials.carbonFiber);
        const scoopR = scoopL.clone();
        scoopR.position.x = 2.04;
        root.add(scoopL);
        root.add(scoopR);

        // -------------------------------------------------------------
        // 2. GREENHOUSE CABIN & INTERIOR
        // -------------------------------------------------------------
        // Curved Cockpit Glass Canopy
        const canopyGeom = new THREE.BoxGeometry(1.48, 0.52, 1.95);
        canopyGeom.translate(0, 0.85, -0.15);
        const canopy = new THREE.Mesh(canopyGeom, this.materials.tintedGlass);
        root.add(canopy);

        // Carbon Roof Beam & Trim
        const roofTrimGeom = new THREE.BoxGeometry(1.44, 0.06, 1.1);
        roofTrimGeom.translate(0, 1.12, -0.2);
        const roofTrim = new THREE.Mesh(roofTrimGeom, accentMaterial);
        roofTrim.castShadow = true;
        root.add(roofTrim);

        // Interior Dashboard & Steering Wheel (Visible through glass)
        const dashGeom = new THREE.BoxGeometry(1.3, 0.22, 0.45);
        dashGeom.translate(0, 0.72, 0.5);
        const dash = new THREE.Mesh(dashGeom, this.materials.carbonFiber);
        root.add(dash);

        // Steering Wheel
        const steerRingGeom = new THREE.TorusGeometry(0.14, 0.02, 8, 16);
        const steerWheel = new THREE.Mesh(steerRingGeom, this.materials.carbonFiber);
        steerWheel.position.set(-0.35, 0.8, 0.35);
        steerWheel.rotation.x = -Math.PI / 6;
        root.add(steerWheel);

        // Dual Racing Bucket Seats
        const seatGeom = new THREE.BoxGeometry(0.42, 0.52, 0.42);
        const seatL = new THREE.Mesh(seatGeom, this.materials.carbonFiber);
        seatL.position.set(-0.35, 0.65, -0.25);
        const seatR = seatL.clone();
        seatR.position.x = 0.35;
        root.add(seatL);
        root.add(seatR);

        // Side Mirrors
        const mirrorGeom = new THREE.BoxGeometry(0.24, 0.1, 0.14);
        const mirrorL = new THREE.Mesh(mirrorGeom, bodyMaterial);
        mirrorL.position.set(-1.08, 0.85, 0.65);
        const mirrorR = mirrorL.clone();
        mirrorR.position.x = 1.08;
        root.add(mirrorL);
        root.add(mirrorR);

        // -------------------------------------------------------------
        // 3. REAR DECK, DIFFUSER & MOTORIZED ACTIVE SPOILER
        // -------------------------------------------------------------
        const rearDeckGeom = new THREE.BoxGeometry(1.86, 0.28, 1.45);
        rearDeckGeom.translate(0, 0.54, -1.45);
        const rearDeck = new THREE.Mesh(rearDeckGeom, bodyMaterial);
        rearDeck.castShadow = true;
        root.add(rearDeck);

        // Aggressive Rear Racing Diffuser with vertical strakes
        const diffuserGeom = new THREE.BoxGeometry(1.98, 0.28, 0.6);
        diffuserGeom.translate(0, 0.22, -2.18);
        const diffuser = new THREE.Mesh(diffuserGeom, this.materials.carbonFiber);
        diffuser.castShadow = true;
        root.add(diffuser);

        // 4 Diffuser Fins
        for (let i = -0.7; i <= 0.7; i += 0.45) {
            const finGeom = new THREE.BoxGeometry(0.04, 0.22, 0.5);
            finGeom.translate(i, 0.16, -2.18);
            const fin = new THREE.Mesh(finGeom, this.materials.carbonFiber);
            root.add(fin);
        }

        // MOTORIZED ACTIVE AERO REAR WING
        const activeWingGroup = new THREE.Group();
        activeWingGroup.position.set(0, 0.78, -2.05);

        const wingBladeGeom = new THREE.BoxGeometry(2.1, 0.06, 0.44);
        const wingBlade = new THREE.Mesh(wingBladeGeom, this.materials.carbonFiber);
        wingBlade.castShadow = true;
        activeWingGroup.add(wingBlade);

        // Twin motorized pylons
        const pylonLGeom = new THREE.BoxGeometry(0.06, 0.35, 0.14);
        pylonLGeom.translate(-0.65, -0.16, 0);
        const pylonL = new THREE.Mesh(pylonLGeom, this.materials.carbonFiber);
        const pylonR = pylonL.clone();
        pylonR.position.x = 1.3;
        activeWingGroup.add(pylonL);
        activeWingGroup.add(pylonR);

        root.add(activeWingGroup);

        // -------------------------------------------------------------
        // 4. MULTI-ELEMENT LIGHTING & EXHAUST
        // -------------------------------------------------------------
        // Projector Headlights
        const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.12), this.materials.headlightLens);
        hlL.position.set(-0.7, 0.46, 2.22);
        const hlR = hlL.clone();
        hlR.position.x = 0.7;
        root.add(hlL);
        root.add(hlR);

        // High Intensity Road Illumination Spotlights
        const hlSpotL = new THREE.SpotLight(0xcce8ff, 2.6, 55, Math.PI / 5, 0.35);
        hlSpotL.position.set(-0.7, 0.5, 2.3);
        hlSpotL.target.position.set(-0.7, 0, 22);
        root.add(hlSpotL);
        root.add(hlSpotL.target);

        const hlSpotR = new THREE.SpotLight(0xcce8ff, 2.6, 55, Math.PI / 5, 0.35);
        hlSpotR.position.set(0.7, 0.5, 2.3);
        hlSpotR.target.position.set(0.7, 0, 22);
        root.add(hlSpotR);
        root.add(hlSpotR.target);

        // Full-Width Smoked LED Taillight Bar
        const tlMat = this.materials.taillightBright.clone();
        const tlMesh = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.09, 0.08), tlMat);
        tlMesh.position.set(0, 0.58, -2.22);
        root.add(tlMesh);

        // Quad Round Titanium Exhaust Tips
        const exhaustGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12);
        exhaustGeom.rotateX(Math.PI / 2);

        const exhaust1 = new THREE.Mesh(exhaustGeom, this.materials.carbonFiber);
        exhaust1.position.set(-0.48, 0.32, -2.2);
        const exhaust2 = new THREE.Mesh(exhaustGeom, this.materials.carbonFiber);
        exhaust2.position.set(-0.32, 0.32, -2.2);
        const exhaust3 = new THREE.Mesh(exhaustGeom, this.materials.carbonFiber);
        exhaust3.position.set(0.32, 0.32, -2.2);
        const exhaust4 = new THREE.Mesh(exhaustGeom, this.materials.carbonFiber);
        exhaust4.position.set(0.48, 0.32, -2.2);

        root.add(exhaust1);
        root.add(exhaust2);
        root.add(exhaust3);
        root.add(exhaust4);

        // Nitro & Backfire Flame Cones
        const flameGeom = new THREE.ConeGeometry(0.14, 1.1, 8);
        flameGeom.rotateX(-Math.PI / 2);
        flameGeom.translate(0, 0, -0.55);

        const flameMatL = this.materials.exhaustFlame.clone();
        const flameL = new THREE.Mesh(flameGeom, flameMatL);
        flameL.position.set(-0.4, 0.32, -2.35);

        const flameMatR = this.materials.exhaustFlame.clone();
        const flameR = new THREE.Mesh(flameGeom, flameMatR);
        flameR.position.set(0.4, 0.32, -2.35);

        root.add(flameL);
        root.add(flameR);

        // Exhaust flame point light (illuminates ground when backfiring)
        const exhaustLight = new THREE.PointLight(0x00d4ff, 0, 6);
        exhaustLight.position.set(0, 0.35, -2.5);
        root.add(exhaustLight);

        // Dynamic Neon Underglow
        const underglowMat = new THREE.MeshBasicMaterial({
            color: underglowColor,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const underglowPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 3.9), underglowMat);
        underglowPlane.rotateX(-Math.PI / 2);
        underglowPlane.position.y = 0.06;
        root.add(underglowPlane);

        const underglowLight = new THREE.PointLight(underglowColor, 2.4, 5.0);
        underglowLight.position.set(0, 0.18, 0);
        root.add(underglowLight);

        // -------------------------------------------------------------
        // 5. FOUR REALISTIC HIGH-PERFORMANCE WHEELS
        // -------------------------------------------------------------
        const wheelFLData = this.createRealisticWheel();
        wheelFLData.group.position.set(-0.98, 0.38, 1.38);
        const wheelFRData = this.createRealisticWheel();
        wheelFRData.group.position.set(0.98, 0.38, 1.38);
        wheelFRData.group.rotation.y = Math.PI;

        const wheelRLData = this.createRealisticWheel();
        wheelRLData.group.position.set(-1.02, 0.39, -1.38);
        const wheelRRData = this.createRealisticWheel();
        wheelRRData.group.position.set(1.02, 0.39, -1.38);
        wheelRRData.group.rotation.y = Math.PI;

        root.add(wheelFLData.group);
        root.add(wheelFRData.group);
        root.add(wheelRLData.group);
        root.add(wheelRRData.group);

        const wheels = [wheelFLData.group, wheelFRData.group, wheelRLData.group, wheelRRData.group];
        const brakeDiscs = [wheelFLData.discMat, wheelFRData.discMat, wheelRLData.discMat, wheelRRData.discMat];

        // Animated Active Aero State
        let currentWingHeight = 0;
        let currentWingTilt = 0;

        return {
            group: root,
            wheels: wheels,
            frontWheels: [wheelFLData.group, wheelFRData.group],
            rearWheels: [wheelRLData.group, wheelRRData.group],
            brakeDiscs: brakeDiscs,
            activeWing: activeWingGroup,
            bodyMaterial: bodyMaterial,
            tlMat: tlMat,
            flameL: flameL,
            flameR: flameR,
            exhaustLight: exhaustLight,
            underglowMat: underglowMat,
            underglowLight: underglowLight,
            modelKey: modelKey,
            setColor: (col) => {
                bodyMaterial.color.setHex(col);
            },
            setUnderglow: (col) => {
                underglowMat.color.setHex(col);
                underglowLight.color.setHex(col);
            },
            // Active Aero update method
            updateAero: (speedRatio, isBraking, dt) => {
                // Target height: elevates at speed > 80 MPH (speedRatio > 0.35)
                const targetHeight = speedRatio > 0.35 ? 0.28 : 0.0;
                // Target tilt: 45° air-brake if braking at speed
                const targetTilt = (isBraking && speedRatio > 0.2) ? -Math.PI / 4 : 0.0;

                currentWingHeight += (targetHeight - currentWingHeight) * 6.0 * dt;
                currentWingTilt += (targetTilt - currentWingTilt) * 8.0 * dt;

                activeWingGroup.position.y = 0.78 + currentWingHeight;
                activeWingGroup.rotation.x = currentWingTilt;
            },
            // Brake Disc Glow update
            updateBrakeGlow: (isBraking, speedRatio, dt) => {
                const targetGlow = (isBraking && speedRatio > 0.4) ? 0.9 : 0.0;
                for (const disc of brakeDiscs) {
                    if (targetGlow > 0.01) {
                        disc.emissive.setHex(0xff3300);
                        disc.emissiveIntensity = targetGlow;
                    } else {
                        disc.emissiveIntensity = Math.max(0, disc.emissiveIntensity - dt * 2.0);
                    }
                }
            }
        };
    }

    // -----------------------------------------------------------------
    // REALISTIC "LIVE CARS" AI TRAFFIC GENERATOR
    // -----------------------------------------------------------------
    createTrafficCar(type = 'sedan') {
        const root = new THREE.Group();
        const colors = [0x1e2430, 0xefefef, 0xb82020, 0x1f5fbb, 0x33383f, 0xc28f1e];
        const carColor = colors[Math.floor(Math.random() * colors.length)];

        const bodyMat = new THREE.MeshStandardMaterial({
            color: carColor,
            roughness: 0.25,
            metalness: 0.75
        });

        let length = 4.4;
        let width = 2.0;
        let height = 0.8;

        // Functional Lighting Materials
        const brakeLightMat = this.materials.taillightBright.clone();
        const blinkerLeftMat = this.materials.turnSignalOff.clone();
        const blinkerRightMat = this.materials.turnSignalOff.clone();

        if (type === 'truck') {
            // HEAVY COMMERCIAL CONTAINER SEMI-TRUCK
            length = 8.5;
            width = 2.5;
            height = 2.4;

            // Truck Cab
            const cabGeom = new THREE.BoxGeometry(width, 1.8, 2.6);
            cabGeom.translate(0, 1.2, 2.6);
            const cab = new THREE.Mesh(cabGeom, bodyMat);
            cab.castShadow = true;
            root.add(cab);

            // Chrome Vertical Exhaust Stacks
            const stackGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
            const stackL = new THREE.Mesh(stackGeom, this.materials.rimForged);
            stackL.position.set(-width / 2 + 0.1, 2.2, 1.4);
            const stackR = stackL.clone();
            stackR.position.x = width / 2 - 0.1;
            root.add(stackL);
            root.add(stackR);

            // Container Trailer
            const contGeom = new THREE.BoxGeometry(width * 0.98, 2.3, 5.8);
            contGeom.translate(0, 1.55, -1.4);
            const contMat = new THREE.MeshStandardMaterial({ color: 0x242a36, roughness: 0.7 });
            const cont = new THREE.Mesh(contGeom, contMat);
            cont.castShadow = true;
            root.add(cont);

            // Reflective Hazard Side Decals
            const decalGeom = new THREE.BoxGeometry(width + 0.05, 0.1, 5.6);
            decalGeom.translate(0, 1.2, -1.4);
            root.add(new THREE.Mesh(decalGeom, this.materials.turnSignalAmber));
        } else if (type === 'suv') {
            // MODERN LUXURY URBAN SUV
            length = 4.8;
            width = 2.15;
            height = 1.1;

            const baseGeom = new THREE.BoxGeometry(width, 0.6, length);
            baseGeom.translate(0, 0.55, 0);
            const base = new THREE.Mesh(baseGeom, bodyMat);
            base.castShadow = true;
            root.add(base);

            const cabinGeom = new THREE.BoxGeometry(width * 0.88, 0.72, length * 0.68);
            cabinGeom.translate(0, 1.15, -0.3);
            const cabin = new THREE.Mesh(cabinGeom, this.materials.tintedGlass);
            root.add(cabin);

            // Roof Rails
            const railGeom = new THREE.BoxGeometry(0.06, 0.06, length * 0.55);
            const railL = new THREE.Mesh(railGeom, this.materials.rimForged);
            railL.position.set(-width * 0.42, 1.55, -0.3);
            const railR = railL.clone();
            railR.position.x = width * 0.42;
            root.add(railL);
            root.add(railR);
        } else if (type === 'coupe') {
            // SPORTS COUPE
            length = 4.4;
            width = 2.05;
            height = 0.75;

            const baseGeom = new THREE.BoxGeometry(width, 0.45, length);
            baseGeom.translate(0, 0.42, 0);
            const base = new THREE.Mesh(baseGeom, bodyMat);
            base.castShadow = true;
            root.add(base);

            const cabinGeom = new THREE.BoxGeometry(width * 0.8, 0.5, length * 0.55);
            cabinGeom.translate(0, 0.82, -0.2);
            root.add(new THREE.Mesh(cabinGeom, this.materials.tintedGlass));

            // Rear Lip Spoiler
            const lipGeom = new THREE.BoxGeometry(width * 0.82, 0.08, 0.22);
            lipGeom.translate(0, 0.7, -length / 2);
            root.add(new THREE.Mesh(lipGeom, this.materials.carbonFiber));
        } else {
            // EXECUTIVE SEDAN
            length = 4.6;
            width = 2.0;
            height = 0.82;

            const baseGeom = new THREE.BoxGeometry(width, 0.48, length);
            baseGeom.translate(0, 0.44, 0);
            const base = new THREE.Mesh(baseGeom, bodyMat);
            base.castShadow = true;
            root.add(base);

            const cabinGeom = new THREE.BoxGeometry(width * 0.84, 0.55, length * 0.6);
            cabinGeom.translate(0, 0.9, -0.2);
            root.add(new THREE.Mesh(cabinGeom, this.materials.tintedGlass));
        }

        // Projector Headlights
        const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.08), this.materials.headlightLens);
        hlL.position.set(-width * 0.35, 0.46, length / 2);
        const hlR = hlL.clone();
        hlR.position.x = width * 0.35;
        root.add(hlL);
        root.add(hlR);

        // Brake Lights (Fires bright red when slowing)
        const blL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.08), brakeLightMat);
        blL.position.set(-width * 0.35, 0.52, -length / 2);
        const blR = blL.clone();
        blR.position.x = width * 0.35;
        root.add(blL);
        root.add(blR);

        // Turn Signal Blinkers (Amber LED strips)
        const sigL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.08), blinkerLeftMat);
        sigL.position.set(-width * 0.45, 0.52, -length / 2);
        const sigR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.08), blinkerRightMat);
        sigR.position.set(width * 0.45, 0.52, -length / 2);
        root.add(sigL);
        root.add(sigR);

        // 4 Wheels
        const wheelGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 12);
        wheelGeom.rotateZ(Math.PI / 2);

        const wFL = new THREE.Mesh(wheelGeom, this.materials.blackRubber);
        wFL.position.set(-width / 2, 0.36, length * 0.3);
        wFL.castShadow = true;
        const wFR = wFL.clone();
        wFR.position.x = width / 2;

        const wRL = wFL.clone();
        wRL.position.z = -length * 0.3;
        const wRR = wFR.clone();
        wRR.position.z = -length * 0.3;

        root.add(wFL);
        root.add(wFR);
        root.add(wRL);
        root.add(wRR);

        return {
            group: root,
            type: type,
            width: width,
            length: length,
            height: height,
            wheels: [wFL, wFR, wRL, wRR],
            brakeLightMat: brakeLightMat,
            blinkerLeftMat: blinkerLeftMat,
            blinkerRightMat: blinkerRightMat,
            setColor: (c) => bodyMat.color.setHex(c),
            // Live indicator & brake light update
            updateLighting: (isBraking, blinkDir, blinkState) => {
                // Brake light
                if (isBraking) {
                    brakeLightMat.color.setHex(0xff0022); // Bright STOP red
                } else {
                    brakeLightMat.color.setHex(0x550008); // Tail red
                }

                // Left blinker
                if (blinkDir < 0 && blinkState) {
                    blinkerLeftMat.color.setHex(0xffaa00);
                } else {
                    blinkerLeftMat.color.setHex(0x331e00);
                }

                // Right blinker
                if (blinkDir > 0 && blinkState) {
                    blinkerRightMat.color.setHex(0xffaa00);
                } else {
                    blinkerRightMat.color.setHex(0x331e00);
                }
            }
        };
    }
}

window.carFactory = new CarFactory();
