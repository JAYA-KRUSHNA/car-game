# 🏎️ NEON VELOCITY: Cyber Overdrive

An ultra-modern, high-octane 3D arcade highway racing game built with Three.js, Vanilla CSS, and Procedural Web Audio API. Engineered for silky smooth 60–120 FPS performance with zero lag, instant loading, and glassmorphic cyberpunk visual design.

---

## 🌟 Key Features

- **⚡ Zero Lag & 120 FPS Performance**:
  - Full object pooling for highway road segments, AI traffic, collectibles, and particles.
  - Zero memory allocation (`new THREE.Vector3()`) in the render loop to prevent garbage collection frame drops.
  - Pre-allocated particle buffers for nitro flame trails, drift tire smoke, collision sparks, and hyperspace speed lines.

- **🚗 3D Showroom & Hypercars**:
  - **Apex Phantom**: Precision-engineered aerodynamic hypercar.
  - **Cyber Spectre**: Quantum EV with twin photon thrusters.
  - **Crimson Viper**: Twin-turbo V10 street dominator.
  - **Valkyrie Hyper**: Extreme Le Mans spec carbon prototype.
  - Interactive 360° showroom turntable.
  - Real-time aerodynamic paint & neon underglow color customizers.
  - Upgradeable stats: Top Speed, Acceleration, Handling, and Nitro.

- **🏁 Dynamic Gameplay Mechanics**:
  - **Simulated 6-Speed Transmission & RPM**: Realistic engine revving, redlines, and mechanical gear shifts.
  - **Drifting Mechanics**: Spacebar / brake initiates realistic power slides with counter-steering and tire smoke.
  - **Nitro Overdrive**: Dual exhaust flames, camera FOV hyperspace distortion, and speed boost.
  - **Near-Miss / Close-Call System**: Weave through traffic within inches to earn score multipliers and instant Nitro refills.
  - **Smart AI Traffic**: Multi-lane highway with sedans, SUVs, and heavy cargo haulers that signal and switch lanes.
  - **Collectibles & Power-ups**: Cyber Credits, Nitro Boost canisters, and EMP invulnerability shields.

- **🎥 Multiple Camera Angles (Key `C`)**:
  - Dynamic 3rd-Person Chase Cam
  - High-Speed Bonnet / Hood Cam
  - Immersive Cockpit / Dashboard Cam
  - Retro Top-Down Arcade Cam

- **🔊 100% Procedural Web Audio Engine**:
  - Zero external sound files — instantaneous loading without 404s or network lag.
  - Multi-oscillator synthesized supercar engine pitch modulated by RPM and throttle.
  - Turbo blow-off valve hiss, nitro burn, tire screech, crash crunch, and dynamic 80s Synthwave soundtrack.

---

## 🎮 Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Accelerate** | `W` or `↑` | `GAS` button |
| **Brake / Drift** | `Space` or `S` / `↓` | `DRIFT` button |
| **Steer Left / Right** | `A` / `D` or `←` / `→` | `◀` / `▶` buttons |
| **Nitro Boost** | `Left Shift` or `Right Shift` | `NITRO` button |
| **Change Camera** | `C` | 📷 Icon button |
| **Pause Game** | `P` or `ESC` | ⏸️ Icon button |
| **Mute / Unmute** | `M` | 🔊 Icon button |

---

## 🚀 Running Locally

No heavy installations or complex build steps required. Simply open with any static server:

```bash
# Python 3
python3 -m http.server 3000

# Node.js (npx)
npx serve .
```

Open [http://localhost:3000](http://localhost:3000) in your browser and hit the gas!

---

## 🛠️ Tech Stack

- **Graphics**: [Three.js](https://threejs.org/) (WebGL)
- **Audio**: Web Audio API (Synthesized procedural sound)
- **Styling**: Vanilla CSS (Custom Cyberpunk Glassmorphic Design System)
- **Architecture**: Object pooling, bounded delta-time, zero external dependencies

---

## 📜 License

MIT License. Designed and developed with ❤️ for speed and visual excellence.
