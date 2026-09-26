/**
 * Neon Velocity - Realistic Procedural Automotive Audio Engine
 * Features: Multi-harmonic cylinder firing, turbocharger spool whistle,
 * blow-off valve release, exhaust backfire pops, asphalt tire friction, and wind rush.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isMusicPlaying = false;
        this.masterVolume = 0.8;
        this.musicVolume = 0.45;
        this.sfxVolume = 0.85;

        // Multi-stage Engine Synth
        this.engineOscSub = null;
        this.engineOscMid = null;
        this.engineOscHigh = null;
        this.engineFilter = null;
        this.engineGain = null;
        this.engineNoise = null;
        this.engineNoiseGain = null;

        // Turbo Spool Whistle
        this.turboOsc = null;
        this.turboGain = null;
        this.turboFilter = null;
        this.turboSpoolAmount = 0.0;

        // Wind Rush
        this.windSource = null;
        this.windFilter = null;
        this.windGain = null;

        // Tire Friction / Screech
        this.driftOsc = null;
        this.driftFilter = null;
        this.driftGain = null;

        // Nitro Thrust
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

        // Layer 1: Sub-bass cylinder pulse
        this.engineOscSub = this.ctx.createOscillator();
        this.engineOscSub.type = 'triangle';
        this.engineOscSub.frequency.setValueAtTime(32, t);

        // Layer 2: Mid-range throaty sawtooth
        this.engineOscMid = this.ctx.createOscillator();
        this.engineOscMid.type = 'sawtooth';
        this.engineOscMid.frequency.setValueAtTime(48, t);

        // Layer 3: High-harmonic valve / cam rasp
        this.engineOscHigh = this.ctx.createOscillator();
        this.engineOscHigh.type = 'sawtooth';
        this.engineOscHigh.frequency.setValueAtTime(96.5, t);

        // Dynamic Resonant Filter
        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(260, t);
        this.engineFilter.Q.setValueAtTime(3.5, t);

        // Exhaust rumble noise
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

        // High-pitched turbo whistle (pure sine with highpass)
        this.turboOsc = this.ctx.createOscillator();
        this.turboOsc.type = 'sine';
        this.turboOsc.frequency.setValueAtTime(1200, t);

        this.turboFilter = this.ctx.createBiquadFilter();
        this.turboFilter.type = 'bandpass';
        this.turboFilter.frequency.setValueAtTime(2200, t);
        this.turboFilter.Q.setValueAtTime(8.0, t);

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
        this.windFilter.frequency.setValueAtTime(300, t);

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
        this.nitroFilter.frequency.setValueAtTime(800, t);
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

        const driftNoise = this.ctx.createBufferSource();
        driftNoise.buffer = noiseBuf;
        driftNoise.loop = true;

        this.driftFilter = this.ctx.createBiquadFilter();
        this.driftFilter.type = 'bandpass';
        this.driftFilter.frequency.setValueAtTime(1400, t);
        this.driftFilter.Q.setValueAtTime(6.0, t);

        this.driftGain = this.ctx.createGain();
        this.driftGain.gain.setValueAtTime(0.0, t);

        driftNoise.connect(this.driftFilter);
        this.driftFilter.connect(this.driftGain);
        this.driftGain.connect(this.sfxGain);
        driftNoise.start();
    }

    updateEngine(rpmRatio, throttle, speedRatio, dt = 0.016) {
        if (!this.ctx || !this.engineGain) return;
        const t = this.ctx.currentTime;

        // RPM Pitch calculation (50 Hz idle -> 480 Hz redline)
        const baseFreq = 40 + (rpmRatio * 180) + (speedRatio * 50);
        this.engineOscSub.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.04);
        this.engineOscMid.frequency.setTargetAtTime(baseFreq, t, 0.04);
        this.engineOscHigh.frequency.setTargetAtTime(baseFreq * 2.01, t, 0.04);

        // Throttle opens the intake filter
        const filterCutoff = 220 + (throttle * 750) + (rpmRatio * 2000);
        this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.04);

        const targetVol = this.isMuted ? 0 : 0.09 + (throttle * 0.22) + (rpmRatio * 0.12);
        this.engineGain.gain.setTargetAtTime(targetVol, t, 0.04);

        // Exhaust rumble
        this.engineNoiseGain.gain.setTargetAtTime(0.02 + throttle * 0.08, t, 0.04);

        // Turbo Spool dynamics
        if (throttle > 0.6 && speedRatio > 0.15) {
            this.turboSpoolAmount = Math.min(1.0, this.turboSpoolAmount + dt * 1.5);
        } else {
            this.turboSpoolAmount = Math.max(0.0, this.turboSpoolAmount - dt * 2.2);
        }

        const turboFreq = 1600 + this.turboSpoolAmount * 2800;
        this.turboOsc.frequency.setTargetAtTime(turboFreq, t, 0.05);
        this.turboFilter.frequency.setTargetAtTime(turboFreq, t, 0.05);
        const turboVol = (!this.isMuted) ? (this.turboSpoolAmount * 0.12) : 0;
        this.turboGain.gain.setTargetAtTime(turboVol, t, 0.05);

        // Wind Rush
        const windVol = (!this.isMuted) ? (Math.pow(speedRatio, 1.8) * 0.28) : 0;
        this.windGain.gain.setTargetAtTime(windVol, t, 0.08);
        this.windFilter.frequency.setTargetAtTime(300 + speedRatio * 1800, t, 0.08);
    }

    triggerBackfire() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // Sharp violent exhaust pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.11);
    }

    playTurboBlowOff() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // High frequency air release hiss
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.07));
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2200, t);
        filter.frequency.exponentialRampToValueAtTime(900, t + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        source.start(t);
    }

    playGearShift() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // Mechanical clunk
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.1);

        // Accompanying turbo blow-off if boost was high
        if (this.turboSpoolAmount > 0.4) {
            this.playTurboBlowOff();
        }
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
        const targetVol = (!this.isMuted && intensity > 0.05) ? Math.min(intensity * 0.35, 0.38) : 0.0;
        this.driftGain.gain.setTargetAtTime(targetVol, t, 0.04);
        if (intensity > 0.05) {
            this.driftFilter.frequency.setTargetAtTime(1100 + intensity * 700, t, 0.04);
        }
    }

    playCoin() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    playNearMiss() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(700, t + 0.1);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.25);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, t);
        filter.Q.setValueAtTime(3.2, t);

        gain.gain.setValueAtTime(0.26, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    playCrash() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(160, t);
        sub.frequency.exponentialRampToValueAtTime(25, t + 0.45);
        subGain.gain.setValueAtTime(0.85, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(t);
        sub.stop(t + 0.52);

        const bufferSize = this.ctx.sampleRate * 0.6;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.16));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1400, t);
        noiseFilter.frequency.linearRampToValueAtTime(150, t + 0.45);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.75, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
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
