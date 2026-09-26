/**
 * Neon Velocity - Procedural Web Audio API Sound System
 * 100% procedural: No external audio files, zero load lag, instant responsiveness.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isMusicPlaying = false;
        this.masterVolume = 0.8;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        // Engine sound nodes
        this.engineOsc1 = null;
        this.engineOsc2 = null;
        this.engineSub = null;
        this.engineFilter = null;
        this.engineGain = null;
        this.engineNoise = null;
        this.engineNoiseGain = null;
        this.isEngineRunning = false;

        // Nitro sound nodes
        this.nitroNoise = null;
        this.nitroFilter = null;
        this.nitroGain = null;
        this.isNitroPlaying = false;

        // Drift / Tire screech nodes
        this.driftOsc = null;
        this.driftFilter = null;
        this.driftGain = null;
        this.isDriftPlaying = false;

        // Music nodes
        this.musicTimer = null;
        this.musicStep = 0;
        this.musicBpm = 128;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Music Master Gain
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        // SFX Master Gain
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.setupEngineSynth();
        this.setupNitroSynth();
        this.setupDriftSynth();
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setupEngineSynth() {
        if (!this.ctx) return;

        // Dual Sawtooth Oscillators for deep rich supercar roar
        this.engineOsc1 = this.ctx.createOscillator();
        this.engineOsc1.type = 'sawtooth';
        this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);

        this.engineOsc2 = this.ctx.createOscillator();
        this.engineOsc2.type = 'triangle';
        this.engineOsc2.frequency.setValueAtTime(45.5, this.ctx.currentTime); // Slight detune for fat chorus

        this.engineSub = this.ctx.createOscillator();
        this.engineSub.type = 'sine';
        this.engineSub.frequency.setValueAtTime(22.5, this.ctx.currentTime); // Sub-bass growl

        // Lowpass filter for engine RPM shaping
        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
        this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        // Engine exhaust noise (white noise buffer)
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this.engineNoise = this.ctx.createBufferSource();
        this.engineNoise.buffer = noiseBuffer;
        this.engineNoise.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(150, this.ctx.currentTime);
        noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

        this.engineNoiseGain = this.ctx.createGain();
        this.engineNoiseGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        this.engineNoise.connect(noiseFilter);
        noiseFilter.connect(this.engineNoiseGain);

        // Engine output gain
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.engineOsc1.connect(this.engineFilter);
        this.engineOsc2.connect(this.engineFilter);
        this.engineSub.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineNoiseGain.connect(this.engineGain);
        this.engineGain.connect(this.sfxGain);

        this.engineOsc1.start();
        this.engineOsc2.start();
        this.engineSub.start();
        this.engineNoise.start();
        this.isEngineRunning = true;
    }

    setupNitroSynth() {
        if (!this.ctx) return;

        // Bandpass noise for roaring jet thrust
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this.nitroNoise = this.ctx.createBufferSource();
        this.nitroNoise.buffer = noiseBuffer;
        this.nitroNoise.loop = true;

        this.nitroFilter = this.ctx.createBiquadFilter();
        this.nitroFilter.type = 'bandpass';
        this.nitroFilter.frequency.setValueAtTime(900, this.ctx.currentTime);
        this.nitroFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

        this.nitroGain = this.ctx.createGain();
        this.nitroGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.nitroNoise.connect(this.nitroFilter);
        this.nitroFilter.connect(this.nitroGain);
        this.nitroGain.connect(this.sfxGain);

        this.nitroNoise.start();
    }

    setupDriftSynth() {
        if (!this.ctx) return;

        // High frequency modulated noise/saw for tire squeal
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const driftNoise = this.ctx.createBufferSource();
        driftNoise.buffer = noiseBuffer;
        driftNoise.loop = true;

        this.driftFilter = this.ctx.createBiquadFilter();
        this.driftFilter.type = 'bandpass';
        this.driftFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
        this.driftFilter.Q.setValueAtTime(6.0, this.ctx.currentTime);

        this.driftGain = this.ctx.createGain();
        this.driftGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        driftNoise.connect(this.driftFilter);
        this.driftFilter.connect(this.driftGain);
        this.driftGain.connect(this.sfxGain);

        driftNoise.start();
    }

    updateEngine(rpmRatio, throttle, speedRatio) {
        if (!this.ctx || !this.engineGain) return;
        const t = this.ctx.currentTime;

        // Calculate pitch based on RPM (0.0 to 1.0)
        const baseFreq = 42 + (rpmRatio * 160) + (speedRatio * 40);
        this.engineOsc1.frequency.setTargetAtTime(baseFreq, t, 0.05);
        this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.015, t, 0.05);
        this.engineSub.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.05);

        // Filter opens up as throttle increases
        const filterCutoff = 220 + (throttle * 700) + (rpmRatio * 1800);
        this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.05);

        // Engine volume: quiet idle, loud revving
        const targetVol = this.isMuted ? 0 : 0.08 + (throttle * 0.18) + (rpmRatio * 0.12);
        this.engineGain.gain.setTargetAtTime(targetVol, t, 0.05);

        // Noise rumble
        this.engineNoiseGain.gain.setTargetAtTime(0.02 + throttle * 0.07, t, 0.05);
    }

    setNitro(active) {
        if (!this.ctx || !this.nitroGain) return;
        const t = this.ctx.currentTime;
        const targetVol = (active && !this.isMuted) ? 0.35 : 0.0;
        this.nitroGain.gain.setTargetAtTime(targetVol, t, 0.08);

        if (active) {
            this.nitroFilter.frequency.setTargetAtTime(1300, t, 0.15);
        } else {
            this.nitroFilter.frequency.setTargetAtTime(600, t, 0.1);
        }
    }

    setDrift(intensity) {
        if (!this.ctx || !this.driftGain) return;
        const t = this.ctx.currentTime;
        const targetVol = (!this.isMuted && intensity > 0.05) ? Math.min(intensity * 0.28, 0.3) : 0.0;
        this.driftGain.gain.setTargetAtTime(targetVol, t, 0.04);
        if (intensity > 0.05) {
            this.driftFilter.frequency.setTargetAtTime(1200 + intensity * 600, t, 0.04);
        }
    }

    playTurboBlowOff() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(250, t + 0.18);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.22);
    }

    playGearShift() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        
        // Mechanical clunk sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.09);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    playCoin() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    playNearMiss() {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;

        // Stereo sweeping futuristic whoosh
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(650, t + 0.1);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.25);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, t);
        filter.Q.setValueAtTime(3.0, t);

        gain.gain.setValueAtTime(0.25, t);
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

        // Heavy sub punch
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(150, t);
        sub.frequency.exponentialRampToValueAtTime(30, t + 0.4);
        subGain.gain.setValueAtTime(0.8, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(t);
        sub.stop(t + 0.5);

        // Metal crunch noise
        const bufferSize = this.ctx.sampleRate * 0.5;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1200, t);
        noiseFilter.frequency.linearRampToValueAtTime(200, t + 0.4);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

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
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.04);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.06);
    }

    // High energy Synthwave music generator
    startMusic() {
        this.ensureContext();
        if (this.isMusicPlaying || !this.ctx) return;
        this.isMusicPlaying = true;
        this.musicStep = 0;

        const stepTime = (60 / this.musicBpm) / 4; // 16th notes
        const bassLine = [
            55, 55, 110, 55,  55, 55, 110, 55,  // A1
            49, 49, 98,  49,  49, 49, 98,  49,  // G1
            43.65, 43.65, 87.3, 43.65, 43.65, 43.65, 87.3, 43.65, // F1
            49, 49, 98,  49,  55, 55, 110, 55   // G1 -> A1
        ];

        const melody = [
            440, 0, 523.25, 0,  659.25, 0, 523.25, 0,
            440, 0, 659.25, 0,  783.99, 0, 659.25, 0,
            349.23, 0, 440, 0,  523.25, 0, 440, 0,
            392.00, 0, 493.88, 0, 587.33, 0, 493.88, 0
        ];

        this.musicTimer = setInterval(() => {
            if (!this.isMusicPlaying || this.isMuted) return;
            const t = this.ctx.currentTime;
            const step = this.musicStep % 32;

            // 1. Kick on beat 0, 4, 8, 12, 16, 20, 24, 28 (four-on-the-floor)
            if (step % 4 === 0) {
                this.triggerKick(t);
            }

            // 2. Snare on beat 4, 12, 20, 28 (backbeat)
            if (step % 8 === 4) {
                this.triggerSnare(t);
            }

            // 3. Hi-hat on offbeats
            if (step % 2 === 1) {
                this.triggerHihat(t);
            }

            // 4. Synthwave Bass
            const bassFreq = bassLine[step];
            if (bassFreq) {
                this.triggerBass(t, bassFreq, stepTime * 0.85);
            }

            // 5. Arpeggio / Lead
            const leadFreq = melody[step];
            if (leadFreq > 0) {
                this.triggerLead(t, leadFreq, stepTime * 0.7);
            }

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
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.09);
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
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.07);
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
        osc.frequency.setValueAtTime(6000, t);
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, t);
        gain.gain.setValueAtTime(0.08, t);
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
        filter.frequency.setValueAtTime(650, t);
        filter.frequency.exponentialRampToValueAtTime(180, t + duration);
        filter.Q.setValueAtTime(4.0, t);

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

// Global Sound Instance
window.soundEngine = new SoundEngine();
