/**
 * Neon Velocity - Procedural 3D Car Models
 * Uses Three.js primitives and custom geometries for maximum performance and zero load delay.
 */

const CAR_PRESETS = {
    apex: {
        name: "Apex Phantom",
        tagline: "Precision Engineered Aerodynamic Hypercar",
        baseColor: 0x00e5ff,
        accentColor: 0x111625,
        underglowColor: 0x00f0ff,
        topSpeed: 215,
        acceleration: 9.2,
        handling: 8.8,
        nitroPower: 8.5,
        unlocked: true,
        price: 0
    },
    spectre: {
        name: "Cyber Spectre",
        tagline: "Quantum EV with Twin Photon Thrusters",
        baseColor: 0xff0077,
        accentColor: 0x0d0d14,
        underglowColor: 0xff00aa,
        topSpeed: 228,
        acceleration: 9.8,
        handling: 9.0,
        nitroPower: 9.5,
        unlocked: false,
        price: 3500
    },
    viper: {
        name: "Crimson Viper",
        tagline: "Twin-Turbo V10 Street Dominator",
        baseColor: 0xff2a00,
        accentColor: 0x1a1a24,
        underglowColor: 0xff3300,
        topSpeed: 220,
        acceleration: 8.9,
        handling: 7.9,
        nitroPower: 9.0,
        unlocked: false,
        price: 6000
    },
    valkyrie: {
        name: "Valkyrie Hyper",
        tagline: "Extreme Le Mans Spec Carbon Prototype",
        baseColor: 0x00ff88,
        accentColor: 0x080c10,
        underglowColor: 0x00ffaa,
        topSpeed: 245,
        acceleration: 9.5,
        handling: 9.6,
        nitroPower: 10.0,
        unlocked: false,
        price: 12000
    }
};

class CarFactory {
    constructor() {
        // Shared materials for memory efficiency and zero lag
        this.materials = {
            blackRubber: new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.9, metalness: 0.1 }),
            rimChrome: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 }),
            brakeCaliper: new THREE.MeshStandardMaterial({ color: 0xff1100, roughness: 0.3, metalness: 0.6 }),
            brakeDisc: new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.3, metalness: 0.8 }),
            tintedGlass: new THREE.MeshPhysicalMaterial({
                color: 0x111625,
                roughness: 0.1,
                metalness: 0.9,
                transparent: true,
                opacity: 0.85
            }),
            carbonFiber: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7, metalness: 0.4 }),
            headlightGlow: new THREE.MeshBasicMaterial({ color: 0xe0ffff }),
            taillightGlow: new THREE.MeshBasicMaterial({ color: 0xff0033 }),
            exhaustFlame: new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.0 }),
            underglowGlow: new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            })
        };
    }

    createWheel(radius = 0.36, width = 0.26) {
        const wheelGroup = new THREE.Group();

        // Tire
        const tireGeom = new THREE.CylinderGeometry(radius, radius, width, 18);
        tireGeom.rotateZ(Math.PI / 2);
        const tire = new THREE.Mesh(tireGeom, this.materials.blackRubber);
        wheelGroup.add(tire);

        // Rim
        const rimGeom = new THREE.CylinderGeometry(radius * 0.68, radius * 0.68, width * 1.02, 12);
        rimGeom.rotateZ(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeom, this.materials.rimChrome);
        wheelGroup.add(rim);

        // Spokes
        const spokeGeom = new THREE.BoxGeometry(width * 1.03, radius * 1.25, 0.05);
        const spoke1 = new THREE.Mesh(spokeGeom, this.materials.rimChrome);
        const spoke2 = spoke1.clone();
        spoke2.rotation.x = Math.PI / 2;
        wheelGroup.add(spoke1);
        wheelGroup.add(spoke2);

        // Brake rotor
        const rotorGeom = new THREE.CylinderGeometry(radius * 0.52, radius * 0.52, width * 0.8, 12);
        rotorGeom.rotateZ(Math.PI / 2);
        const rotor = new THREE.Mesh(rotorGeom, this.materials.brakeDisc);
        wheelGroup.add(rotor);

        // Brake caliper
        const caliperGeom = new THREE.BoxGeometry(width * 0.9, radius * 0.35, 0.1);
        caliperGeom.translate(0, radius * 0.32, 0);
        const caliper = new THREE.Mesh(caliperGeom, this.materials.brakeCaliper);
        wheelGroup.add(caliper);

        return wheelGroup;
    }

    createPlayerCar(modelKey = 'apex', customColor = null, customUnderglow = null) {
        const preset = CAR_PRESETS[modelKey] || CAR_PRESETS.apex;
        const carColor = customColor !== null ? customColor : preset.baseColor;
        const underglowColor = customUnderglow !== null ? customUnderglow : preset.underglowColor;

        const root = new THREE.Group();
        root.name = `car_${modelKey}`;

        // Car Body Material (High-gloss metallic automotive paint)
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: carColor,
            metalness: 0.85,
            roughness: 0.22
        });

        const accentMaterial = new THREE.MeshStandardMaterial({
            color: preset.accentColor,
            metalness: 0.6,
            roughness: 0.4
        });

        // 1. CHASSIS / LOWER BODY
        const lowerBodyGeom = new THREE.BoxGeometry(2.0, 0.35, 4.4);
        lowerBodyGeom.translate(0, 0.32, 0);
        const lowerBody = new THREE.Mesh(lowerBodyGeom, bodyMaterial);
        root.add(lowerBody);

        // 2. FRONT HOOD & NOSE (Wedge shape)
        const hoodGeom = new THREE.BoxGeometry(1.88, 0.22, 1.6);
        hoodGeom.translate(0, 0.5, 1.25);
        hoodGeom.rotateX(-0.06);
        const hood = new THREE.Mesh(hoodGeom, bodyMaterial);
        root.add(hood);

        // Front Splitter / Carbon aero lip
        const splitterGeom = new THREE.BoxGeometry(2.08, 0.08, 0.6);
        splitterGeom.translate(0, 0.16, 2.2);
        const splitter = new THREE.Mesh(splitterGeom, this.materials.carbonFiber);
        root.add(splitter);

        // Side Skirts
        const skirtLGeom = new THREE.BoxGeometry(0.12, 0.12, 2.6);
        skirtLGeom.translate(-1.02, 0.2, 0);
        const skirtL = new THREE.Mesh(skirtLGeom, this.materials.carbonFiber);
        const skirtR = skirtL.clone();
        skirtR.position.x = 2.04;
        root.add(skirtL);
        root.add(skirtR);

        // 3. COCKPIT / CABIN ROOF
        const cabinGeom = new THREE.BoxGeometry(1.45, 0.48, 1.9);
        cabinGeom.translate(0, 0.82, -0.2);
        const cabin = new THREE.Mesh(cabinGeom, this.materials.tintedGlass);
        root.add(cabin);

        // Windshield bevel & pillars
        const pillarGeom = new THREE.BoxGeometry(1.48, 0.08, 0.08);
        pillarGeom.translate(0, 1.04, -0.2);
        const roofTrim = new THREE.Mesh(pillarGeom, accentMaterial);
        root.add(roofTrim);

        // 4. REAR DECK & ENGINE COVER
        const rearDeckGeom = new THREE.BoxGeometry(1.84, 0.3, 1.4);
        rearDeckGeom.translate(0, 0.54, -1.4);
        const rearDeck = new THREE.Mesh(rearDeckGeom, bodyMaterial);
        root.add(rearDeck);

        // Rear Diffuser
        const diffuserGeom = new THREE.BoxGeometry(1.9, 0.25, 0.5);
        diffuserGeom.translate(0, 0.22, -2.15);
        const diffuser = new THREE.Mesh(diffuserGeom, this.materials.carbonFiber);
        root.add(diffuser);

        // 5. MODEL-SPECIFIC SPOILERS & FEATURES
        if (modelKey === 'valkyrie' || modelKey === 'viper') {
            // Massive Racing GT Wing
            const wingGeom = new THREE.BoxGeometry(2.1, 0.06, 0.45);
            wingGeom.translate(0, 1.15, -2.05);
            const wing = new THREE.Mesh(wingGeom, this.materials.carbonFiber);
            
            // Struts
            const strutLGeom = new THREE.BoxGeometry(0.06, 0.45, 0.18);
            strutLGeom.translate(-0.65, 0.9, -2.0);
            const strutL = new THREE.Mesh(strutLGeom, this.materials.carbonFiber);
            const strutR = strutL.clone();
            strutR.position.x = 1.3;

            root.add(wing);
            root.add(strutL);
            root.add(strutR);
        } else if (modelKey === 'spectre') {
            // Dual active cyber fins
            const finLGeom = new THREE.BoxGeometry(0.08, 0.42, 0.8);
            finLGeom.translate(-0.85, 0.85, -1.7);
            const finL = new THREE.Mesh(finLGeom, accentMaterial);
            const finR = finL.clone();
            finR.position.x = 1.7;
            root.add(finL);
            root.add(finR);
        } else {
            // Apex Phantom Integrated ducktail spoiler
            const spoilerGeom = new THREE.BoxGeometry(1.85, 0.12, 0.3);
            spoilerGeom.translate(0, 0.74, -2.1);
            const spoiler = new THREE.Mesh(spoilerGeom, this.materials.carbonFiber);
            root.add(spoiler);
        }

        // 6. HEADLIGHTS (Cyber LED strips)
        const hlGeom = new THREE.BoxGeometry(0.48, 0.08, 0.1);
        const hlL = new THREE.Mesh(hlGeom, this.materials.headlightGlow);
        hlL.position.set(-0.7, 0.45, 2.22);
        const hlR = hlL.clone();
        hlR.position.x = 0.7;
        root.add(hlL);
        root.add(hlR);

        // Headlight spot/point lights illuminating the road ahead
        const headlightLightL = new THREE.SpotLight(0xaae8ff, 2.0, 45, Math.PI / 6, 0.4);
        headlightLightL.position.set(-0.7, 0.5, 2.3);
        headlightLightL.target.position.set(-0.7, 0, 15);
        root.add(headlightLightL);
        root.add(headlightLightL.target);

        const headlightLightR = new THREE.SpotLight(0xaae8ff, 2.0, 45, Math.PI / 6, 0.4);
        headlightLightR.position.set(0.7, 0.5, 2.3);
        headlightLightR.target.position.set(0.7, 0, 15);
        root.add(headlightLightR);
        root.add(headlightLightR.target);

        // 7. TAILLIGHTS (Cyber neon light bar)
        const tlGeom = new THREE.BoxGeometry(1.8, 0.08, 0.08);
        const tl = new THREE.Mesh(tlGeom, this.materials.taillightGlow);
        tl.position.set(0, 0.55, -2.2);
        root.add(tl);

        // 8. EXHAUST & NITRO JETS
        const exhaustLGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
        exhaustLGeom.rotateX(Math.PI / 2);
        const exhaustL = new THREE.Mesh(exhaustLGeom, this.materials.carbonFiber);
        exhaustL.position.set(-0.35, 0.35, -2.15);
        const exhaustR = exhaustL.clone();
        exhaustR.position.x = 0.35;
        root.add(exhaustL);
        root.add(exhaustR);

        // Nitro flame cones (scaled up when nitro is active)
        const flameGeom = new THREE.ConeGeometry(0.12, 0.9, 8);
        flameGeom.rotateX(-Math.PI / 2);
        flameGeom.translate(0, 0, -0.45);
        
        const flameL = new THREE.Mesh(flameGeom, this.materials.exhaustFlame.clone());
        flameL.position.set(-0.35, 0.35, -2.3);
        const flameR = new THREE.Mesh(flameGeom, flameL.material);
        flameR.position.set(0.35, 0.35, -2.3);
        root.add(flameL);
        root.add(flameR);

        // 9. UNDERGLOW
        const underglowPlaneGeom = new THREE.PlaneGeometry(1.9, 3.8);
        underglowPlaneGeom.rotateX(-Math.PI / 2);
        const underglowMat = new THREE.MeshBasicMaterial({
            color: underglowColor,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
        });
        const underglowMesh = new THREE.Mesh(underglowPlaneGeom, underglowMat);
        underglowMesh.position.y = 0.08;
        root.add(underglowMesh);

        const underglowLight = new THREE.PointLight(underglowColor, 2.2, 4.5);
        underglowLight.position.set(0, 0.2, 0);
        root.add(underglowLight);

        // 10. WHEELS
        const wheels = [];
        const wheelFL = this.createWheel();
        wheelFL.position.set(-0.95, 0.36, 1.35);
        const wheelFR = this.createWheel();
        wheelFR.position.set(0.95, 0.36, 1.35);
        wheelFR.rotation.y = Math.PI;

        const wheelRL = this.createWheel();
        wheelRL.position.set(-0.98, 0.38, -1.35);
        const wheelRR = this.createWheel();
        wheelRR.position.set(0.98, 0.38, -1.35);
        wheelRR.rotation.y = Math.PI;

        root.add(wheelFL);
        root.add(wheelFR);
        root.add(wheelRL);
        root.add(wheelRR);

        wheels.push(wheelFL, wheelFR, wheelRL, wheelRR);

        // Reference pointers for animation
        return {
            group: root,
            wheels: wheels,
            frontWheels: [wheelFL, wheelFR],
            bodyMaterial: bodyMaterial,
            flameL: flameL,
            flameR: flameR,
            underglowMesh: underglowMesh,
            underglowLight: underglowLight,
            modelKey: modelKey,
            setColor: (col) => {
                bodyMaterial.color.setHex(col);
            },
            setUnderglow: (col) => {
                underglowMat.color.setHex(col);
                underglowLight.color.setHex(col);
            }
        };
    }

    createTrafficCar(type = 'sedan') {
        const root = new THREE.Group();
        const colors = [0x2288ff, 0xffbb00, 0xee2244, 0x9933ff, 0x00cc88, 0xd0d0d0, 0x1f2421];
        const carColor = colors[Math.floor(Math.random() * colors.length)];

        const bodyMat = new THREE.MeshStandardMaterial({
            color: carColor,
            roughness: 0.3,
            metalness: 0.6
        });

        let length = 4.2;
        let width = 1.9;
        let height = 0.7;

        if (type === 'truck') {
            length = 7.5;
            width = 2.4;
            height = 1.8;

            // Semi Truck Cabin
            const cabGeom = new THREE.BoxGeometry(width, 1.6, 2.4);
            cabGeom.translate(0, 1.1, 2.2);
            const cab = new THREE.Mesh(cabGeom, bodyMat);
            root.add(cab);

            // Container Trailer
            const contGeom = new THREE.BoxGeometry(width * 0.95, 2.0, 5.0);
            contGeom.translate(0, 1.3, -1.2);
            const contMat = new THREE.MeshStandardMaterial({ color: 0x242b35, roughness: 0.8 });
            const cont = new THREE.Mesh(contGeom, contMat);
            root.add(cont);

            // Side warning lights
            const sideStripGeom = new THREE.BoxGeometry(width + 0.05, 0.08, 4.8);
            sideStripGeom.translate(0, 1.3, -1.2);
            const sideMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
            root.add(new THREE.Mesh(sideStripGeom, sideMat));
        } else if (type === 'suv') {
            length = 4.6;
            width = 2.1;
            height = 0.95;

            const baseGeom = new THREE.BoxGeometry(width, 0.5, length);
            baseGeom.translate(0, 0.45, 0);
            root.add(new THREE.Mesh(baseGeom, bodyMat));

            const topGeom = new THREE.BoxGeometry(width * 0.85, 0.65, length * 0.65);
            topGeom.translate(0, 0.95, -0.3);
            root.add(new THREE.Mesh(topGeom, this.materials.tintedGlass));
        } else {
            // Standard Sedan / Sport
            length = 4.2;
            width = 1.9;
            height = 0.65;

            const baseGeom = new THREE.BoxGeometry(width, 0.4, length);
            baseGeom.translate(0, 0.35, 0);
            root.add(new THREE.Mesh(baseGeom, bodyMat));

            const topGeom = new THREE.BoxGeometry(width * 0.8, 0.5, length * 0.55);
            topGeom.translate(0, 0.75, -0.2);
            root.add(new THREE.Mesh(topGeom, this.materials.tintedGlass));
        }

        // Headlights (White/Yellow LED)
        const hlGeom = new THREE.BoxGeometry(width * 0.85, 0.1, 0.08);
        const hl = new THREE.Mesh(hlGeom, this.materials.headlightGlow);
        hl.position.set(0, 0.4, length / 2);
        root.add(hl);

        // Taillights (Red LED)
        const tlGeom = new THREE.BoxGeometry(width * 0.85, 0.1, 0.08);
        const tl = new THREE.Mesh(tlGeom, this.materials.taillightGlow);
        tl.position.set(0, 0.45, -length / 2);
        root.add(tl);

        // 4 Simple Wheels
        const wheelGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 10);
        wheelGeom.rotateZ(Math.PI / 2);

        const wFL = new THREE.Mesh(wheelGeom, this.materials.blackRubber);
        wFL.position.set(-width / 2, 0.34, length * 0.3);
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
            setColor: (c) => bodyMat.color.setHex(c)
        };
    }
}

window.carFactory = new CarFactory();
