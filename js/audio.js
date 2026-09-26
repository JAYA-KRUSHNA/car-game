/**
 * Neon Velocity - Realistic Automotive Audio Engine
 * Features:
 * - Multi-layer violent crash impact: Deep chassis sub-shockwave, metal buckling crunch,
 *   shattering tempered glass tinkle, and guardrail scraping.
 * - Continuous metallic guardrail scrape sound.
 * - Multi-stage turbocharger flutter blow-off valve (tss-ts-ts-shh!).
 * - High-speed Doppler traffic whoosh & horn.
 * - Synthesized multi-harmonic engine (idle rumble, intake roar, high-RPM valve harmonics).
 * - Realistic asphalt tire screech with dynamic slip modulation.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isMusicPlaying = false;
        this.masterVolume = 0.85;
        this.musicVolume = 0.45;
        this.sfxVolume = 0.9;

        // Engine Nodes
        this.engineOscSub = null;
        this.engineOscMid = null;
        this.engineOscHigh = null;
        this.engineFilter = null;
        this.engineGain = null;
        this.engineNoise = null;
        this.engineNoiseGain = null;

        // Turbo Spool & Flutter
        this.turboOsc = null;
        this.turboFilter = null;
        this.turboGain = null;
        this.turboSpoolAmount = 0.0;

        // Wind Rush
        this.windSource = null;
        this.windFilter = null;
        this.windGain = null;

        // Tire Drift / Screech
        this.driftNoise = null;
        this.driftFilter = null;
        this.driftGain = null;

        // Guardrail Scrape
        this.scrapeNoise = null;
        this.scrapeFilter = null;
        this.scrapeGain = null;

        // Nitro Jet
        this.nitroNoise = null;
        this.nitroFilter = null;
        this.nitroGain = null;

        // Music
        this.musicTimer = null;
        this.musicStep = 0;
        this.musicBpm = 126;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.setupEngineSynth();
        this.setupTurboSynth();
        this.setupWindSynth();
        this.setupNitroSynth();
        this.setupDriftSynth();
        this.setupScrapeSynth();
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createNoiseBuffer(duration = 2.0) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    setupEngineSynth() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        this.engineOscSub = this.ctx.createOscillator();
        this.engineOscSub.type = 'triangle';
        this.engineOscSub.frequency.setValueAtTime(30, t);

        this.engineOscMid = this.ctx.createOscillator();
        this.engineOscMid.type = 'sawtooth';
        this.engineOscMid.frequency.setValueAtTime(45, t);

        this.engineOscHigh = this.ctx.createOscillator();
        this.engineOscHigh.type = 'sawtooth';
        this.engineOscHigh.frequency.setValueAtTime(90.5, t);

        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(280, t);
        this.engineFilter.Q.setValueAtTime(3.2, t);

        const noiseBuf = this.createNoiseBuffer(2.0);
        this.engineNoise = this.ctx.createBufferSource();
        this.engineNoise.buffer = noiseBuf;
        this.engineNoise.loop = true;

        const noiseFilt = this.ctx.createBiquadFilter();
        noiseFilt.type = 'bandpass';
        noiseFilt.frequency.setValueAtTime(140, t);
        noiseFilt.Q.setValueAtTime(2.0, t);

        this.engineNoiseGain = this.ctx.createGain();
        this.engineNoiseGain.gain.setValueAtTime(0.04, t);

        this.engineNoise.connect(noiseFilt);
        noiseFilt.connect(this.engineNoiseGain);

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0.0, t);

        this.engineOscSub.connect(this.engineFilter);
        this.engineOscMid.connect(this.engineFilter);
        this.engineOscHigh.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineNoiseGain.connect(this.engineGain);
        this.engineGain.connect(this.sfxGain);

        this.engineOscSub.start();
        this.engineOscMid.start();
        this.engineOscHigh.start();
        this.engineNoise.start();
    }

    setupTurboSynth() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        this.turboOsc = this.ctx.createOscillator();
        this.turboOsc.type = 'sine';
        this.turboOsc.frequency.setValueAtTime(1400, t);

        this.turboFilter = this.ctx.createBiquadFilter();
        this.turboFilter.type = 'bandpass';
        this.turboFilter.frequency.setValueAtTime(2400, t);
        this.turboFilter.Q.setValueAtTime(7.5, t);

        this.turboGain = this.ctx.createGain();
        this.turboGain.gain.setValueAtTime(0.0, t);

        this.turboOsc.connect(this.turboFilter);
        this.turboFilter.connect(this.turboGain);
        this.turboGain.connect(this.sfxGain);
        this.turboOsc.start();
    }

    setupWindSynth() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        const noiseBuf = this.createNoiseBuffer(2.0);
        this.windSource = this.ctx.createBufferSource();
        this.windSource.buffer = noiseBuf;
        this.windSource.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'lowpass';
        this.windFilter.frequency.setValueAtTime(320, t);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0.0, t);

        this.windSource.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.sfxGain);
        this.windSource.start();
    }

    setupNitroSynth() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const noiseBuf = this.createNoiseBuffer(2.0);

        this.nitroNoise = this.ctx.createBufferSource();
        this.nitroNoise.buffer = noiseBuf;
        this.nitroNoise.loop = true;

        this.nitroFilter = this.ctx.createBiquadFilter();
        this.nitroFilter.type = 'bandpass';
        this.nitroFilter.frequency.setValueAtTime(850, t);
        this.nitroFilter.Q.setValueAtTime(2.2, t);

        this.nitroGain = this.ctx.createGain();
        this.nitroGain.gain.setValueAtTime(0.0, t);

        this.nitroNoise.connect(this.nitroFilter);
        this.nitroFilter.connect(this.nitroGain);
        this.nitroGain.connect(this.sfxGain);
        this.nitroNoise.start();
    }

    setupDriftSynth() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const noiseBuf = this.createNoiseBuffer(2.0);

        this.driftNoise = this.ctx.createBufferSource();
        this.driftNoise.buffer = noiseBuf;
        this.driftNoise.loop = true;

        this.driftFilter = this.ctx.createBiquadFilter();
        this.driftFilter.type = 'bandpass';
        this.driftFilter.frequency.setValueAtTime(1450, t);
        this.driftFilter.Q.setValueAtTime(6.5, t);

        this.driftGain = this.ctx.createGain();
        this.driftGain.gain.setValueAtTime(0.0, t);

        this.driftNoise.connect(this.driftFilter);
        this.driftFilter.connect(this.driftGain);
        this.driftGain.connect(this.sfxGain);
        this.driftNoise.start();
    }

    setupScrapeSynth() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const noiseBuf = this.createNoiseBuffer(2.0);

        this.scrapeNoise = this.ctx.createBufferSource();
        this.scrapeNoise.buffer = noiseBuf;
        this.scrapeNoise.loop = true;

        this.scrapeFilter = this.ctx.createBiquadFilter();
        this.scrapeFilter.type = 'highpass';
        this.scrapeFilter.frequency.setValueAtTime(2800, t);
        this.scrapeFilter.Q.setValueAtTime(4.0, t);

        this.scrapeGain = this.ctx.createGain();
        this.scrapeGain.gain.setValueAtTime(0.0, t);

        this.scrapeNoise.connect(this.scrapeFilter);
        this.scrapeFilter.connect(this.scrapeGain);
        this.scrapeGain.connect(this.sfxGain);
        this.scrapeNoise.start();
    }

    updateEngine(rpmRatio, throttle, speedRatio, dt = 0.016) {
        if (!this.ctx || !this.engineGain) return;
        const t = this.ctx.currentTime;

        const baseFreq = 38 + (rpmRatio * 185) + (speedRatio * 50);
        this.engineOscSub.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.04);
        this.engineOscMid.frequency.setTargetAtTime(baseFreq, t, 0.04);
        this.engineOscHigh.frequency.setTargetAtTime(baseFreq * 2.015, t, 0.04);

        const filterCutoff = 220 + (throttle * 780) + (rpmRatio * 2100);
        this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.04);

        const targetVol = this.isMuted ? 0 : 0.09 + (throttle * 0.22) + (rpmRatio * 0.14);
        this.engineGain.gain.setTargetAtTime(targetVol, t, 0.04);

        this.engineNoiseGain.gain.setTargetAtTime(0.02 + throttle * 0.08, t, 0.04);

        if (throttle > 0.6 && speedRatio > 0.15) {
            this.turboSpoolAmount = Math.min(1.0, this.turboSpoolAmount + dt * 1.6);
        } else {
            this.turboSpoolAmount = Math.max(0.0, this.turboSpoolAmount - dt * 2.2);
        }

        const turboFreq = 1600 + this.turboSpoolAmount * 3000;
        this.turboOsc.frequency.setTargetAtTime(turboFreq, t, 0.05);
        this.turboFilter.frequency.setTargetAtTime(turboFreq, t, 0.05);
        const turboVol = (!this.isMuted) ? (this.turboSpoolAmount * 0.14) : 0;
        this.turboGain.gain.setTargetAtTime(turboVol, t, 0.05);

        const windVol = (!this.isMuted) ? (Math.pow(speedRatio, 1.8) * 0.28) : 0;
        this.windGain.gain.setTargetAtTime(windVol, t, 0.08);
        this.windFilter.frequency.setTargetAtTime(320 + speedRatio * 1900, t, 0.08);
    }

    triggerBackfire() {
        if (!this.ctx || this.isMuted) return;
        this.playBackfire();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.09);

        gain.gain.setValueAtTime(0.38, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    playTurboBlowOff() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // Realistic turbo flutter (tss-ts-ts-ts-shh!)
        const flutterCount = 4;
        for (let i = 0; i < flutterCount; i++) {
            const timeOffset = i * 0.045;
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
                data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (this.ctx.sampleRate * 0.025));
            }

            const src = this.ctx.createBufferSource();
            src.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2800 - i * 300, t + timeOffset);

            const gain = this.ctx.createGain();
            const vol = 0.28 * Math.pow(0.72, i);
            gain.gain.setValueAtTime(vol, t + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.08);

            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            src.start(t + timeOffset);
        }
    }

    playGearShift() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.08);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.1);

        if (this.turboSpoolAmount > 0.35) {
            this.playTurboBlowOff();
        }
    }

    // =========================================================================
    // MULTI-LAYER CRASH AUDIO (REALISTIC SHEET METAL, SUB IMPACT & GLASS)
    // =========================================================================
    playCrash() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // Layer 1: Heavy sub chassis impact (seismic low-end shockwave)
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(190, t);
        sub.frequency.exponentialRampToValueAtTime(18, t + 0.55);
        subGain.gain.setValueAtTime(1.0, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(t);
        sub.stop(t + 0.62);

        // Layer 2: Violent metal buckling crunch (distorted steel crush)
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.75);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const decay = Math.exp(-i / (this.ctx.sampleRate * 0.16));
            // Non-linear clipping for gritty metallic crunch
            const raw = (Math.random() * 2 - 1) * decay;
            data[i] = Math.tanh(raw * 2.8);
        }
        const crunchSource = this.ctx.createBufferSource();
        crunchSource.buffer = noiseBuffer;

        const crunchFilter = this.ctx.createBiquadFilter();
        crunchFilter.type = 'lowpass';
        crunchFilter.frequency.setValueAtTime(2200, t);
        crunchFilter.frequency.exponentialRampToValueAtTime(160, t + 0.55);

        const crunchGain = this.ctx.createGain();
        crunchGain.gain.setValueAtTime(0.95, t);
        crunchGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

        crunchSource.connect(crunchFilter);
        crunchFilter.connect(crunchGain);
        crunchGain.connect(this.sfxGain);
        crunchSource.start(t);

        // Layer 3: Shattering tempered glass spray & crystalline shards
        for (let i = 0; i < 9; i++) {
            const glassOsc = this.ctx.createOscillator();
            const glassGain = this.ctx.createGain();
            const glassTime = t + 0.02 + Math.random() * 0.38;
            glassOsc.type = 'sine';
            glassOsc.frequency.setValueAtTime(2800 + Math.random() * 5200, glassTime);
            glassOsc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 1000, glassTime + 0.16);

            glassGain.gain.setValueAtTime(0.22, glassTime);
            glassGain.gain.exponentialRampToValueAtTime(0.001, glassTime + 0.15);

            glassOsc.connect(glassGain);
            glassGain.connect(this.sfxGain);
            glassOsc.start(glassTime);
            glassOsc.stop(glassTime + 0.17);
        }

        // Layer 4: Twisted metal shearing screech
        const screechOsc = this.ctx.createOscillator();
        const screechFilter = this.ctx.createBiquadFilter();
        const screechGain = this.ctx.createGain();
        screechOsc.type = 'sawtooth';
        screechOsc.frequency.setValueAtTime(950, t);
        screechOsc.frequency.exponentialRampToValueAtTime(140, t + 0.45);

        screechFilter.type = 'bandpass';
        screechFilter.frequency.setValueAtTime(1400, t);
        screechFilter.Q.setValueAtTime(5.5, t);

        screechGain.gain.setValueAtTime(0.42, t);
        screechGain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

        screechOsc.connect(screechFilter);
        screechFilter.connect(screechGain);
        screechGain.connect(this.sfxGain);
        screechOsc.start(t);
        screechOsc.stop(t + 0.5);

        // Layer 5: Carbon-fiber & plastic bumper fracturing snap
        const snapBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.15), this.ctx.sampleRate);
        const snapData = snapBuf.getChannelData(0);
        for (let i = 0; i < snapData.length; i++) {
            snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
        }
        const snapSrc = this.ctx.createBufferSource();
        snapSrc.buffer = snapBuf;
        const snapFilt = this.ctx.createBiquadFilter();
        snapFilt.type = 'highpass';
        snapFilt.frequency.setValueAtTime(1800, t);
        const snapGain = this.ctx.createGain();
        snapGain.gain.setValueAtTime(0.65, t);
        snapSrc.connect(snapFilt);
        snapFilt.connect(snapGain);
        snapGain.connect(this.sfxGain);
        snapSrc.start(t + 0.01);
    }

    // Dual-tone European sports car horn (F4 + A4)
    playHorn(isTraffic = false) {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const duration = isTraffic ? 0.35 : 0.45;
        const baseFreq = isTraffic ? 380 : 349.23; // F4
        const harmFreq = isTraffic ? 480 : 440.0;  // A4

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(baseFreq, t);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(harmFreq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, t);

        const vol = isTraffic ? 0.22 : 0.32;
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.04);
        gain.gain.setValueAtTime(vol, t + duration - 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + duration + 0.02);
        osc2.stop(t + duration + 0.02);
    }

    // High-RPM Exhaust Backfire / Anti-Lag Crackle (pop-pop-bang!)
    playBackfire() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const pops = 1 + Math.floor(Math.random() * 3);

        for (let p = 0; p < pops; p++) {
            const timeOffset = p * (0.04 + Math.random() * 0.05);
            const popBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
            const data = popBuf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.008));
            }
            const src = this.ctx.createBufferSource();
            src.buffer = popBuf;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(650 + Math.random() * 500, t + timeOffset);
            filter.Q.setValueAtTime(1.8, t + timeOffset);

            const gain = this.ctx.createGain();
            const vol = (p === 0 ? 0.42 : 0.25) * (0.8 + Math.random() * 0.4);
            gain.gain.setValueAtTime(vol, t + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.07);

            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            src.start(t + timeOffset);
        }
    }

    // Speed Trap / Radar Strobe Chime
    playSpeedTrap() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, t); // A6
        osc.frequency.exponentialRampToValueAtTime(2637, t + 0.12); // E7
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.26);
    }

    setGuardrailScrape(active) {
        if (!this.ctx || !this.scrapeGain) return;
        const t = this.ctx.currentTime;
        const targetVol = (active && !this.isMuted) ? 0.32 : 0.0;
        this.scrapeGain.gain.setTargetAtTime(targetVol, t, 0.05);
    }

    setNitro(active) {
        if (!this.ctx || !this.nitroGain) return;
        const t = this.ctx.currentTime;
        const targetVol = (active && !this.isMuted) ? 0.38 : 0.0;
        this.nitroGain.gain.setTargetAtTime(targetVol, t, 0.08);
        if (active) {
            this.nitroFilter.frequency.setTargetAtTime(1200, t, 0.12);
        } else {
            this.nitroFilter.frequency.setTargetAtTime(600, t, 0.1);
        }
    }

    setDrift(intensity) {
        if (!this.ctx || !this.driftGain) return;
        const t = this.ctx.currentTime;
        const targetVol = (!this.isMuted && intensity > 0.05) ? Math.min(intensity * 0.36, 0.38) : 0.0;
        this.driftGain.gain.setTargetAtTime(targetVol, t, 0.04);
        if (intensity > 0.05) {
            this.driftFilter.frequency.setTargetAtTime(1150 + intensity * 680, t, 0.04);
        }
    }

    playNearMiss() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // Stereo high-speed Doppler wind whoosh + distant passing tone
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(750, t + 0.08);
        osc.frequency.exponentialRampToValueAtTime(210, t + 0.25);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(3.2, t);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.3);
    }

    playCoin() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, t);
        osc.frequency.setValueAtTime(1318.51, t + 0.08);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    playClick() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, t);
        osc.frequency.exponentialRampToValueAtTime(1300, t + 0.04);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.06);
    }

    startMusic() {
        this.ensureContext();
        if (this.isMusicPlaying || !this.ctx) return;
        this.isMusicPlaying = true;
        this.musicStep = 0;

        const stepTime = (60 / this.musicBpm) / 4;
        const bassLine = [
            55, 55, 110, 55, 55, 55, 110, 55,
            49, 49, 98, 49, 49, 49, 98, 49,
            43.65, 43.65, 87.3, 43.65, 43.65, 43.65, 87.3, 43.65,
            49, 49, 98, 49, 55, 55, 110, 55
        ];

        const melody = [
            440, 0, 523.25, 0, 659.25, 0, 523.25, 0,
            440, 0, 659.25, 0, 783.99, 0, 659.25, 0,
            349.23, 0, 440, 0, 523.25, 0, 440, 0,
            392.00, 0, 493.88, 0, 587.33, 0, 493.88, 0
        ];

        this.musicTimer = setInterval(() => {
            if (!this.isMusicPlaying || this.isMuted) return;
            const t = this.ctx.currentTime;
            const step = this.musicStep % 32;

            if (step % 4 === 0) this.triggerKick(t);
            if (step % 8 === 4) this.triggerSnare(t);
            if (step % 2 === 1) this.triggerHihat(t);

            const bassFreq = bassLine[step];
            if (bassFreq) this.triggerBass(t, bassFreq, stepTime * 0.85);

            const leadFreq = melody[step];
            if (leadFreq > 0) this.triggerLead(t, leadFreq, stepTime * 0.7);

            this.musicStep++;
        }, stepTime * 1000);
    }

    stopMusic() {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
        this.isMusicPlaying = false;
    }

    triggerKick(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.1);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.14);
    }

    triggerSnare(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 0.08);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    triggerHihat(t) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(6500, t);
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7500, t);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    triggerBass(t, freq, duration) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.exponentialRampToValueAtTime(170, t + duration);
        filter.Q.setValueAtTime(3.8, t);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + duration);
    }

    triggerLead(t, freq, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, t);
        filter.Q.setValueAtTime(2.0, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + duration);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx && !this.isMuted) {
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        }
    }
}

window.soundEngine = new SoundEngine();
