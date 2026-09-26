/**
 * Neon Velocity - Highly Realistic Automotive & Superbike Models
 * Features:
 * - 7 Playable Vehicles: Hypercars, Tuners, and High-Performance Superbikes!
 * - Superbikes with authentic leaning chassis, fork suspension, and engine blocks.
 * - Photorealistic materials: Clearcoat metallic paint, forged alloy rims, carbon-fiber weave.
 * - Motorized Active Aero Rear Wings & Air Brakes.
 * - Live AI traffic with brake lights and flashing turn signals.
 */

const CAR_PRESETS = {
    apex: {
        name: "Apex Phantom GT",
        tagline: "Twin-Turbo Hybrid Hypercar with Active Aero",
        type: "car",
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
        type: "car",
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
    ninja: {
        name: "Apex Ninja RR 1000",
        tagline: "Supercharged 998cc Inline-4 Superbike (310 HP)",
        type: "bike",
        baseColor: 0x00ff44,
        accentColor: 0x0a0f0a,
        underglowColor: 0x00ff88,
        topSpeed: 226,
        acceleration: 10.0, // Blistering bike acceleration
        handling: 9.7,      // Ultra-agile leaning
        nitroPower: 9.0,
        unlocked: false,
        price: 4500
    },
    horizon: {
        name: "Horizon GT-R V-Spec",
        tagline: "Twin-Turbo AWD Japanese Tuner Legend",
        type: "car",
        baseColor: 0x2255dd,
        accentColor: 0x111624,
        underglowColor: 0x0088ff,
        topSpeed: 215,
        acceleration: 9.1,
        handling: 9.4,
        nitroPower: 8.6,
        unlocked: false,
        price: 5200
    },
    viper: {
        name: "Crimson Viper V10",
        tagline: "8.4L Naturally Aspirated Track Monster",
        type: "car",
        baseColor: 0xee2200,
        accentColor: 0x12141a,
        underglowColor: 0xff3300,
        topSpeed: 224,
        acceleration: 9.0,
        handling: 8.2,
        nitroPower: 9.1,
        unlocked: false,
        price: 6500
    },
    kaneda: {
        name: "Cyberpunk Akira V-Twin",
        tagline: "Neo-Tokyo Ceramic Double-Rotor Power Bike",
        type: "bike",
        baseColor: 0xff1122,
        accentColor: 0x1a0505,
        underglowColor: 0xff0044,
        topSpeed: 236,
        acceleration: 9.8,
        handling: 9.5,
        nitroPower: 9.8,
        unlocked: false,
        price: 8500
    },
    valkyrie: {
        name: "Valkyrie Hyper-LM",
        tagline: "Carbon Fiber Le Mans Prototype with Ground Effects",
        type: "car",
        baseColor: 0xffcc00,
        accentColor: 0x06080e,
        underglowColor: 0xffbb00,
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
            goldAnodized: new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                roughness: 0.2,
                metalness: 0.9
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
            engineMetal: new THREE.MeshStandardMaterial({
                color: 0x3a424e,
                roughness: 0.4,
                metalness: 0.8
            }),
            headlightLens: new THREE.MeshBasicMaterial({ color: 0xf0fbff }),
            taillightBright: new THREE.MeshBasicMaterial({ color: 0xff0022 }),
            turnSignalAmber: new THREE.MeshBasicMaterial({ color: 0xff9900 }),
            turnSignalOff: new THREE.MeshBasicMaterial({ color: 0x331e00 }),
            exhaustFlame: new THREE.MeshBasicMaterial({
                color: 0x00d4ff,
                transparent: true,
                opacity: 0.0
            })
        };
    }

    createRealisticWheel(radius = 0.38, width = 0.3) {
        const wheelGroup = new THREE.Group();

        const tireGeom = new THREE.CylinderGeometry(radius, radius, width, 24);
        tireGeom.rotateZ(Math.PI / 2);
        const tire = new THREE.Mesh(tireGeom, this.materials.blackRubber);
        tire.castShadow = true;
        wheelGroup.add(tire);

        const lipGeom = new THREE.TorusGeometry(radius * 0.76, 0.03, 8, 24);
        lipGeom.rotateY(Math.PI / 2);
        const lip = new THREE.Mesh(lipGeom, this.materials.rimForged);
        lip.position.x = width * 0.48;
        wheelGroup.add(lip);

        const rimGeom = new THREE.CylinderGeometry(radius * 0.74, radius * 0.74, width * 0.92, 16);
        rimGeom.rotateZ(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeom, this.materials.rimForged);
        wheelGroup.add(rim);

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

        const hubGeom = new THREE.CylinderGeometry(radius * 0.18, radius * 0.18, width * 1.02, 12);
        hubGeom.rotateZ(Math.PI / 2);
        wheelGroup.add(new THREE.Mesh(hubGeom, this.materials.carbonFiber));

        const discGeom = new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, 0.03, 16);
        discGeom.rotateZ(Math.PI / 2);
        const discMat = this.materials.brakeDiscDrilled.clone();
        const disc = new THREE.Mesh(discGeom, discMat);
        disc.position.x = -width * 0.08;
        wheelGroup.add(disc);

        const caliperGeom = new THREE.BoxGeometry(0.12, radius * 0.42, 0.16);
        caliperGeom.translate(0, radius * 0.36, 0);
        const caliper = new THREE.Mesh(caliperGeom, this.materials.brakeCaliper);
        caliper.position.x = -width * 0.08;
        wheelGroup.add(caliper);

        return { group: wheelGroup, discMat: discMat };
    }

    createMotorcycleWheel(radius = 0.34, width = 0.16) {
        const group = new THREE.Group();

        // Rounded motorcycle tire profile
        const tireGeom = new THREE.TorusGeometry(radius * 0.82, radius * 0.22, 16, 24);
        tireGeom.rotateY(Math.PI / 2);
        const tire = new THREE.Mesh(tireGeom, this.materials.blackRubber);
        tire.castShadow = true;
        group.add(tire);

        // Forged Rim
        const rimGeom = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width * 0.8, 16);
        rimGeom.rotateZ(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeom, this.materials.rimForged);
        group.add(rim);

        // Spokes
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const spokeGeom = new THREE.BoxGeometry(width * 0.85, radius * 1.25, 0.04);
            spokeGeom.rotateX(angle);
            group.add(new THREE.Mesh(spokeGeom, this.materials.rimForged));
        }

        // Dual drilled brake discs
        const discGeom = new THREE.CylinderGeometry(radius * 0.52, radius * 0.52, 0.02, 16);
        discGeom.rotateZ(Math.PI / 2);
        const discMat = this.materials.brakeDiscDrilled.clone();

        const discL = new THREE.Mesh(discGeom, discMat);
        discL.position.x = -width * 0.45;
        const discR = new THREE.Mesh(discGeom, discMat);
        discR.position.x = width * 0.45;
        group.add(discL);
        group.add(discR);

        return { group: group, discMat: discMat };
    }

    createVehicle(modelKey = 'apex', customColor = null, customUnderglow = null) {
        const preset = CAR_PRESETS[modelKey] || CAR_PRESETS.apex;
        if (preset.type === 'bike') {
            return this.createSuperbike(modelKey, customColor, customUnderglow);
        } else {
            return this.createPlayerCar(modelKey, customColor, customUnderglow);
        }
    }

    // -------------------------------------------------------------
    // SUPERBIKE GENERATION (Apex Ninja RR / Cyberpunk Akira Bike)
    // -------------------------------------------------------------
    createSuperbike(modelKey = 'ninja', customColor = null, customUnderglow = null) {
        const preset = CAR_PRESETS[modelKey];
        const bikeColor = customColor !== null ? customColor : preset.baseColor;
        const underglowColor = customUnderglow !== null ? customUnderglow : preset.underglowColor;

        const root = new THREE.Group();
        root.name = `bike_${modelKey}`;

        const bodyMat = new THREE.MeshStandardMaterial({
            color: bikeColor,
            metalness: 0.85,
            roughness: 0.2
        });

        // 1. Aerodynamic Front Fairing & Windscreen
        const fairingGeom = new THREE.BoxGeometry(0.58, 0.65, 0.95);
        fairingGeom.translate(0, 0.85, 0.6);
        const fairing = new THREE.Mesh(fairingGeom, bodyMat);
        fairing.castShadow = true;
        root.add(fairing);

        // Tinted Windscreen
        const screenGeom = new THREE.BoxGeometry(0.42, 0.35, 0.45);
        screenGeom.translate(0, 1.18, 0.55);
        screenGeom.rotateX(-0.35);
        const screen = new THREE.Mesh(screenGeom, this.materials.tintedGlass);
        root.add(screen);

        // Clip-on Handlebars
        const barGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.72, 8);
        barGeom.rotateZ(Math.PI / 2);
        const bars = new THREE.Mesh(barGeom, this.materials.rimForged);
        bars.position.set(0, 1.02, 0.5);
        root.add(bars);

        // Dual LED Headlights
        const hlGeom = new THREE.BoxGeometry(0.18, 0.08, 0.08);
        const hlL = new THREE.Mesh(hlGeom, this.materials.headlightLens);
        hlL.position.set(-0.16, 0.85, 1.08);
        const hlR = hlL.clone();
        hlR.position.x = 0.16;
        root.add(hlL);
        root.add(hlR);

        // Headlight road spotlight
        const hlSpot = new THREE.SpotLight(0xaae8ff, 2.8, 55, Math.PI / 5, 0.4);
        hlSpot.position.set(0, 0.85, 1.1);
        hlSpot.target.position.set(0, 0, 20);
        root.add(hlSpot);
        root.add(hlSpot.target);

        // 2. Fuel Tank & Trellis Frame
        const tankGeom = new THREE.BoxGeometry(0.52, 0.45, 0.75);
        tankGeom.translate(0, 0.95, 0.05);
        const tank = new THREE.Mesh(tankGeom, bodyMat);
        tank.castShadow = true;
        root.add(tank);

        // Exposed Engine Block
        const engineGeom = new THREE.BoxGeometry(0.46, 0.45, 0.65);
        engineGeom.translate(0, 0.55, 0.1);
        const engine = new THREE.Mesh(engineGeom, this.materials.engineMetal);
        engine.castShadow = true;
        root.add(engine);

        // 3. Seat & Tapered Tail Cowl
        const seatGeom = new THREE.BoxGeometry(0.38, 0.12, 0.42);
        seatGeom.translate(0, 0.88, -0.42);
        const seat = new THREE.Mesh(seatGeom, this.materials.carbonFiber);
        root.add(seat);

        const tailGeom = new THREE.BoxGeometry(0.36, 0.28, 0.7);
        tailGeom.translate(0, 0.92, -0.85);
        const tail = new THREE.Mesh(tailGeom, bodyMat);
        tail.castShadow = true;
        root.add(tail);

        // LED Taillight
        const tlMat = this.materials.taillightBright.clone();
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.06), tlMat);
        tl.position.set(0, 0.96, -1.22);
        root.add(tl);

        // Racing Titanium Exhaust Pipe
        const exhaustGeom = new THREE.CylinderGeometry(0.06, 0.07, 0.6, 8);
        exhaustGeom.rotateX(Math.PI / 2.4);
        const exhaust = new THREE.Mesh(exhaustGeom, this.materials.rimForged);
        exhaust.position.set(0.28, 0.55, -0.75);
        root.add(exhaust);

        // Nitro / Backfire Flame
        const flameGeom = new THREE.ConeGeometry(0.12, 0.9, 8);
        flameGeom.rotateX(-Math.PI / 2);
        flameGeom.translate(0, 0, -0.45);
        const flameMat = this.materials.exhaustFlame.clone();
        const flame = new THREE.Mesh(flameGeom, flameMat);
        flame.position.set(0.28, 0.55, -1.05);
        root.add(flame);

        const exhaustLight = new THREE.PointLight(0x00d4ff, 0, 5);
        exhaustLight.position.set(0.28, 0.55, -1.1);
        root.add(exhaustLight);

        // Underglow
        const underglowMat = new THREE.MeshBasicMaterial({
            color: underglowColor,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide
        });
        const underglowPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.4), underglowMat);
        underglowPlane.rotateX(-Math.PI / 2);
        underglowPlane.position.y = 0.08;
        root.add(underglowPlane);

        const underglowLight = new THREE.PointLight(underglowColor, 2.2, 4.0);
        underglowLight.position.set(0, 0.2, 0);
        root.add(underglowLight);

        // 4. Wheels & Suspension
        const frontWheelData = this.createMotorcycleWheel(0.36, 0.16);
        frontWheelData.group.position.set(0, 0.36, 1.15);

        // Front inverted gold forks
        const forkGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.95, 8);
        forkGeom.rotateX(-0.35);
        const forkL = new THREE.Mesh(forkGeom, this.materials.goldAnodized);
        forkL.position.set(-0.12, 0.72, 0.95);
        const forkR = forkL.clone();
        forkR.position.x = 0.12;
        root.add(forkL);
        root.add(forkR);

        const rearWheelData = this.createMotorcycleWheel(0.38, 0.22);
        rearWheelData.group.position.set(0, 0.38, -0.95);

        // Swingarm
        const swingarmGeom = new THREE.BoxGeometry(0.18, 0.08, 0.85);
        swingarmGeom.translate(0, 0.38, -0.45);
        root.add(new THREE.Mesh(swingarmGeom, this.materials.carbonFiber));

        root.add(frontWheelData.group);
        root.add(rearWheelData.group);

        return {
            group: root,
            isBike: true,
            wheels: [frontWheelData.group, rearWheelData.group],
            frontWheels: [frontWheelData.group],
            rearWheels: [rearWheelData.group],
            brakeDiscs: [frontWheelData.discMat, rearWheelData.discMat],
            bodyMaterial: bodyMat,
            tlMat: tlMat,
            flameL: flame,
            flameR: flame,
            exhaustLight: exhaustLight,
            underglowMat: underglowMat,
            underglowLight: underglowLight,
            modelKey: modelKey,
            setColor: (c) => bodyMat.color.setHex(c),
            setUnderglow: (c) => {
                underglowMat.color.setHex(c);
                underglowLight.color.setHex(c);
            },
            updateAero: () => {}, // Bikes use rider tuck-in instead of rear wing
            updateBrakeGlow: (isBraking, speedRatio, dt) => {
                const targetGlow = (isBraking && speedRatio > 0.4) ? 0.9 : 0.0;
                for (const disc of [frontWheelData.discMat, rearWheelData.discMat]) {
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

    // -------------------------------------------------------------
    // HYPERCAR GENERATION
    // -------------------------------------------------------------
    createPlayerCar(modelKey = 'apex', customColor = null, customUnderglow = null) {
        const preset = CAR_PRESETS[modelKey] || CAR_PRESETS.apex;
        const carColor = customColor !== null ? customColor : preset.baseColor;
        const underglowColor = customUnderglow !== null ? customUnderglow : preset.underglowColor;

        const root = new THREE.Group();
        root.name = `car_${modelKey}`;

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

        // 1. Chassis
        const chassisGeom = new THREE.BoxGeometry(2.05, 0.38, 4.45);
        chassisGeom.translate(0, 0.32, 0);
        const chassis = new THREE.Mesh(chassisGeom, bodyMaterial);
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        root.add(chassis);

        // Flared Front Fenders
        const fenderLGeom = new THREE.BoxGeometry(0.24, 0.45, 1.4);
        fenderLGeom.translate(-1.06, 0.42, 1.35);
        const fenderL = new THREE.Mesh(fenderLGeom, bodyMaterial);
        fenderL.castShadow = true;
        const fenderR = fenderL.clone();
        fenderR.position.x = 2.12;
        root.add(fenderL);
        root.add(fenderR);

        // Flared Rear Haunches
        const rearHaunchLGeom = new THREE.BoxGeometry(0.26, 0.52, 1.5);
        rearHaunchLGeom.translate(-1.08, 0.48, -1.35);
        const rearHaunchL = new THREE.Mesh(rearHaunchLGeom, bodyMaterial);
        rearHaunchL.castShadow = true;
        const rearHaunchR = rearHaunchL.clone();
        rearHaunchR.position.x = 2.16;
        root.add(rearHaunchL);
        root.add(rearHaunchR);

        // Front Wedge Hood
        const hoodGeom = new THREE.BoxGeometry(1.9, 0.22, 1.6);
        hoodGeom.translate(0, 0.48, 1.3);
        hoodGeom.rotateX(-0.08);
        const hood = new THREE.Mesh(hoodGeom, bodyMaterial);
        hood.castShadow = true;
        root.add(hood);

        // Hood dual heat extraction louvers
        const ventGeom = new THREE.BoxGeometry(0.42, 0.04, 0.6);
        const ventL = new THREE.Mesh(ventGeom, this.materials.carbonFiber);
        ventL.position.set(-0.45, 0.58, 1.2);
        ventL.rotation.x = -0.08;
        const ventR = ventL.clone();
        ventR.position.x = 0.45;
        root.add(ventL);
        root.add(ventR);

        // Front Splitter with Canards
        const splitterGeom = new THREE.BoxGeometry(2.14, 0.08, 0.7);
        splitterGeom.translate(0, 0.14, 2.22);
        const splitter = new THREE.Mesh(splitterGeom, this.materials.carbonFiber);
        splitter.castShadow = true;
        root.add(splitter);

        // Side Skirts
        const skirtLGeom = new THREE.BoxGeometry(0.12, 0.14, 2.5);
        skirtLGeom.translate(-1.06, 0.18, 0);
        const skirtL = new THREE.Mesh(skirtLGeom, this.materials.carbonFiber);
        const skirtR = skirtL.clone();
        skirtR.position.x = 2.12;
        root.add(skirtL);
        root.add(skirtR);

        // Side Air Intakes
        const scoopLGeom = new THREE.BoxGeometry(0.14, 0.28, 0.65);
        scoopLGeom.translate(-1.02, 0.45, -0.4);
        const scoopL = new THREE.Mesh(scoopLGeom, this.materials.carbonFiber);
        const scoopR = scoopL.clone();
        scoopR.position.x = 2.04;
        root.add(scoopL);
        root.add(scoopR);

        // 2. Cabin Canopy & Interior
        const canopyGeom = new THREE.BoxGeometry(1.48, 0.52, 1.95);
        canopyGeom.translate(0, 0.85, -0.15);
        const canopy = new THREE.Mesh(canopyGeom, this.materials.tintedGlass);
        root.add(canopy);

        const roofTrimGeom = new THREE.BoxGeometry(1.44, 0.06, 1.1);
        roofTrimGeom.translate(0, 1.12, -0.2);
        const roofTrim = new THREE.Mesh(roofTrimGeom, accentMaterial);
        roofTrim.castShadow = true;
        root.add(roofTrim);

        // Dashboard & Steering Wheel
        const dash = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.22, 0.45), this.materials.carbonFiber);
        dash.position.set(0, 0.72, 0.5);
        root.add(dash);

        const steerWheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 8, 16), this.materials.carbonFiber);
        steerWheel.position.set(-0.35, 0.8, 0.35);
        steerWheel.rotation.x = -Math.PI / 6;
        root.add(steerWheel);

        // Bucket Seats
        const seatL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.42), this.materials.carbonFiber);
        seatL.position.set(-0.35, 0.65, -0.25);
        const seatR = seatL.clone();
        seatR.position.x = 0.35;
        root.add(seatL);
        root.add(seatR);

        // Side Mirrors
        const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.14), bodyMaterial);
        mirrorL.position.set(-1.08, 0.85, 0.65);
        const mirrorR = mirrorL.clone();
        mirrorR.position.x = 1.08;
        root.add(mirrorL);
        root.add(mirrorR);

        // 3. Rear Deck & Motorized Active Aero Spoiler
        const rearDeckGeom = new THREE.BoxGeometry(1.86, 0.28, 1.45);
        rearDeckGeom.translate(0, 0.54, -1.45);
        const rearDeck = new THREE.Mesh(rearDeckGeom, bodyMaterial);
        rearDeck.castShadow = true;
        root.add(rearDeck);

        const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.28, 0.6), this.materials.carbonFiber);
        diffuser.position.set(0, 0.22, -2.18);
        diffuser.castShadow = true;
        root.add(diffuser);

        // Motorized Active Aero Rear Wing
        const activeWingGroup = new THREE.Group();
        activeWingGroup.position.set(0, 0.78, -2.05);

        const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.44), this.materials.carbonFiber);
        wingBlade.castShadow = true;
        activeWingGroup.add(wingBlade);

        const pylonLGeom = new THREE.BoxGeometry(0.06, 0.35, 0.14);
        pylonLGeom.translate(-0.65, -0.16, 0);
        const pylonL = new THREE.Mesh(pylonLGeom, this.materials.carbonFiber);
        const pylonR = pylonL.clone();
        pylonR.position.x = 1.3;
        activeWingGroup.add(pylonL);
        activeWingGroup.add(pylonR);
        root.add(activeWingGroup);

        // 4. Headlights & Taillights
        const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.12), this.materials.headlightLens);
        hlL.position.set(-0.7, 0.46, 2.22);
        const hlR = hlL.clone();
        hlR.position.x = 0.7;
        root.add(hlL);
        root.add(hlR);

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

        const tlMat = this.materials.taillightBright.clone();
        const tlMesh = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.09, 0.08), tlMat);
        tlMesh.position.set(0, 0.58, -2.22);
        root.add(tlMesh);

        // Quad Round Titanium Exhaust Tips
        const exhaustGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12);
        exhaustGeom.rotateX(Math.PI / 2);
        const ex1 = new THREE.Mesh(exhaustGeom, this.materials.carbonFiber);
        ex1.position.set(-0.48, 0.32, -2.2);
        const ex2 = new THREE.Mesh(exhaustGeom, this.materials.carbonFiber);
        ex2.position.set(-0.32, 0.32, -2.2);
        const ex3 = new THREE.Mesh(exhaustGeom, this.materials.carbonFiber);
        ex3.position.set(0.32, 0.32, -2.2);
        const ex4 = new THREE.Mesh(exhaustGeom, this.materials.carbonFiber);
        ex4.position.set(0.48, 0.32, -2.2);
        root.add(ex1); root.add(ex2); root.add(ex3); root.add(ex4);

        // Nitro / Backfire Flames
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

        const exhaustLight = new THREE.PointLight(0x00d4ff, 0, 6);
        exhaustLight.position.set(0, 0.35, -2.5);
        root.add(exhaustLight);

        // Underglow
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

        // 5. Wheels
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

        let currentWingHeight = 0;
        let currentWingTilt = 0;

        return {
            group: root,
            isBike: false,
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
            setColor: (col) => bodyMaterial.color.setHex(col),
            setUnderglow: (col) => {
                underglowMat.color.setHex(col);
                underglowLight.color.setHex(col);
            },
            updateAero: (speedRatio, isBraking, dt) => {
                const targetHeight = speedRatio > 0.35 ? 0.28 : 0.0;
                const targetTilt = (isBraking && speedRatio > 0.2) ? -Math.PI / 4 : 0.0;
                currentWingHeight += (targetHeight - currentWingHeight) * 6.0 * dt;
                currentWingTilt += (targetTilt - currentWingTilt) * 8.0 * dt;
                activeWingGroup.position.y = 0.78 + currentWingHeight;
                activeWingGroup.rotation.x = currentWingTilt;
            },
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

    // -------------------------------------------------------------
    // AI TRAFFIC CARS (Live lighting & signals)
    // -------------------------------------------------------------
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

        const brakeLightMat = this.materials.taillightBright.clone();
        const blinkerLeftMat = this.materials.turnSignalOff.clone();
        const blinkerRightMat = this.materials.turnSignalOff.clone();

        if (type === 'truck') {
            length = 8.5;
            width = 2.5;
            height = 2.4;

            const cabGeom = new THREE.BoxGeometry(width, 1.8, 2.6);
            cabGeom.translate(0, 1.2, 2.6);
            const cab = new THREE.Mesh(cabGeom, bodyMat);
            cab.castShadow = true;
            root.add(cab);

            const stackGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
            const stackL = new THREE.Mesh(stackGeom, this.materials.rimForged);
            stackL.position.set(-width / 2 + 0.1, 2.2, 1.4);
            const stackR = stackL.clone();
            stackR.position.x = width / 2 - 0.1;
            root.add(stackL);
            root.add(stackR);

            const contGeom = new THREE.BoxGeometry(width * 0.98, 2.3, 5.8);
            contGeom.translate(0, 1.55, -1.4);
            const cont = new THREE.Mesh(contGeom, new THREE.MeshStandardMaterial({ color: 0x242a36, roughness: 0.7 }));
            cont.castShadow = true;
            root.add(cont);

            const decalGeom = new THREE.BoxGeometry(width + 0.05, 0.1, 5.6);
            decalGeom.translate(0, 1.2, -1.4);
            root.add(new THREE.Mesh(decalGeom, this.materials.turnSignalAmber));
        } else if (type === 'suv') {
            length = 4.8;
            width = 2.15;
            height = 1.1;

            const base = new THREE.Mesh(new THREE.BoxGeometry(width, 0.6, length), bodyMat);
            base.position.set(0, 0.55, 0);
            base.castShadow = true;
            root.add(base);

            const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.72, length * 0.68), this.materials.tintedGlass);
            cabin.position.set(0, 1.15, -0.3);
            root.add(cabin);

            const railL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, length * 0.55), this.materials.rimForged);
            railL.position.set(-width * 0.42, 1.55, -0.3);
            const railR = railL.clone();
            railR.position.x = width * 0.42;
            root.add(railL);
            root.add(railR);
        } else if (type === 'coupe') {
            length = 4.4;
            width = 2.05;
            height = 0.75;

            const base = new THREE.Mesh(new THREE.BoxGeometry(width, 0.45, length), bodyMat);
            base.position.set(0, 0.42, 0);
            base.castShadow = true;
            root.add(base);

            const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 0.5, length * 0.55), this.materials.tintedGlass);
            cabin.position.set(0, 0.82, -0.2);
            root.add(cabin);

            const lip = new THREE.Mesh(new THREE.BoxGeometry(width * 0.82, 0.08, 0.22), this.materials.carbonFiber);
            lip.position.set(0, 0.7, -length / 2);
            root.add(lip);
        } else {
            length = 4.6;
            width = 2.0;
            height = 0.82;

            const base = new THREE.Mesh(new THREE.BoxGeometry(width, 0.48, length), bodyMat);
            base.position.set(0, 0.44, 0);
            base.castShadow = true;
            root.add(base);

            const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.84, 0.55, length * 0.6), this.materials.tintedGlass);
            cabin.position.set(0, 0.9, -0.2);
            root.add(cabin);
        }

        const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.08), this.materials.headlightLens);
        hlL.position.set(-width * 0.35, 0.46, length / 2);
        const hlR = hlL.clone();
        hlR.position.x = width * 0.35;
        root.add(hlL);
        root.add(hlR);

        const blL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.08), brakeLightMat);
        blL.position.set(-width * 0.35, 0.52, -length / 2);
        const blR = blL.clone();
        blR.position.x = width * 0.35;
        root.add(blL);
        root.add(blR);

        const sigL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.08), blinkerLeftMat);
        sigL.position.set(-width * 0.45, 0.52, -length / 2);
        const sigR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.08), blinkerRightMat);
        sigR.position.set(width * 0.45, 0.52, -length / 2);
        root.add(sigL);
        root.add(sigR);

        const wheelGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 12);
        wheelGeom.rotateZ(Math.PI / 2);
        const wFL = new THREE.Mesh(wheelGeom, this.materials.blackRubber);
        wFL.position.set(-width / 2, 0.36, length * 0.3);
        wFL.castShadow = true;
        const wFR = wFL.clone(); wFR.position.x = width / 2;
        const wRL = wFL.clone(); wRL.position.z = -length * 0.3;
        const wRR = wFR.clone(); wRR.position.z = -length * 0.3;
        root.add(wFL); root.add(wFR); root.add(wRL); root.add(wRR);

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
            updateLighting: (isBraking, blinkDir, blinkState) => {
                brakeLightMat.color.setHex(isBraking ? 0xff0022 : 0x550008);
                blinkerLeftMat.color.setHex((blinkDir < 0 && blinkState) ? 0xffaa00 : 0x331e00);
                blinkerRightMat.color.setHex((blinkDir > 0 && blinkState) ? 0xffaa00 : 0x331e00);
            }
        };
    }
}

window.carFactory = new CarFactory();
