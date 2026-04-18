# NEURALX — SEM Adaptive Efficiency Intelligence System

> **Unified Framework for Cognitive Self-Optimization at the Intersection of AI and Physics**  
> Interactive 3D Scientific Visualization Platform

---

## 🌌 What This Is

A cinematic, interactive 3D web platform for presenting the SEM research paper. Features:

- **AXIOM-7 Purple Robot** — 3D original humanoid with click-to-learn components
- **SEM Machine** — Full Scanning Electron Microscope with animated electron beam
- **Neural Network System** — AI cognitive architecture with signal particle animations
- **360° Drag/Zoom/Rotate** — Full mouse and touch interaction
- **Exploded View** — Separate all components for examination
- **Presentation Mode** — 6-step guided cinematic walkthrough for professors/judges
- **Component Info Panels** — Beginner + Advanced explanations for every part
- **Scientific Formulas** — Real physics equations for every component
- **Paper Sections** — Full abstract, introduction, framework, results, conclusion

---

## 📁 File Structure

```
neuralx/
├── index.html          # Main HTML structure
├── style.css           # Full design system (dark sci-fi aesthetic)
├── three-engine.js     # Three.js 3D engine (robot, machine, neural scenes)
├── ui-controller.js    # UI logic, panel data, presentation mode
└── README.md           # This file
```

---

## 🚀 Publishing on GitHub Pages (Step by Step)

### Step 1 — Create GitHub Repository
1. Go to **github.com** → Sign in
2. Click **"+"** (top right) → **"New repository"**
3. Name it: `neuralx-sem` (or any name)
4. Set to **Public**
5. Click **"Create repository"**

### Step 2 — Upload Files
**Option A: Direct Upload (Easiest)**
1. Open your repository
2. Click **"uploading an existing file"** or drag and drop
3. Upload all 4 files: `index.html`, `style.css`, `three-engine.js`, `ui-controller.js`
4. Scroll down → Click **"Commit changes"**

**Option B: Using Git**
```bash
git init
git add .
git commit -m "NEURALX — Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/neuralx-sem.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. In your repository → click **"Settings"** tab
2. Scroll down to **"Pages"** (left sidebar)
3. Under **"Source"** → select **"main"** branch → **"/ (root)"**
4. Click **"Save"**
5. Wait 1-3 minutes

### Step 4 — Access Your Site
Your site will be live at:
```
https://YOUR_USERNAME.github.io/neuralx-sem/
```

---

## 🖥️ Running Locally

Just open `index.html` in any modern browser. No server required.

```bash
# OR use a simple local server for best results:
python3 -m http.server 8080
# Then open: http://localhost:8080
```

---

## 🎮 Controls

| Action | Control |
|--------|---------|
| Rotate model | Click + Drag |
| Zoom | Scroll wheel |
| Select component | Click |
| Hover info | Mouse over |
| Touch rotate | Touch + drag |

---

## 🎯 Features Guide

### 3D Scenes (left panel)
- **AXIOM-7 Robot** — Purple humanoid with AI core, joints, sensors
- **SEM Core** — Full electron microscope with beam animation
- **Neural Net** — AI system with signal particle flow

### Mode Buttons (top bar)
- **360°** — Free rotation viewer
- **LEARN** — Click components for detailed science explanations
- **PRESENT** — Guided 6-step presentation mode

### Control Panel (bottom)
- **360° VIEW** — Enable continuous auto-rotation axis
- **EXPLODE** — Separate all components in 3D space
- **WIRE** — Toggle wireframe mode
- **RESET** — Return to default view
- **AUTO** — Continuous slow rotation

---

## 📱 Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 14+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| Mobile Chrome | ✅ Touch support |
| Mobile Safari | ✅ Touch support |

---

## 📄 Scientific Content

All explanations are grounded in:
- **Scanning Electron Microscopy** (vacuum physics, electron optics, beam-matter interaction)
- **Robotics** (actuator dynamics, kinematics, sensor fusion)
- **Physics-Informed Neural Networks** (PINN loss functions, Bayesian updating)
- **Reinforcement Learning** (actor-critic, PPO, reward shaping)
- **Control Theory** (PID, Kalman filtering, ZMP stability)

All formulas are real, scientifically accurate equations.

---

## 🔧 Troubleshooting

**Black screen?**
→ Check browser supports WebGL: visit [webgl.org](https://get.webgl.org)

**"Three is not defined" error?**
→ Ensure internet connection (Three.js loads from CDN)

**Slow performance?**
→ Close other tabs; use Chrome for best WebGL performance

**Files not loading?**
→ Make sure all 4 files are in the same folder

---

*Built for academic research presentation. All 3D models are original designs.*
