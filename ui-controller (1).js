/* ui-controller.js — NEURALX UI Logic */
'use strict';

// ═══════════════════════════════════════════════════
//  COMPONENT KNOWLEDGE BASE
// ═══════════════════════════════════════════════════
var COMPONENTS = {

  /* ── ROBOT ── */
  torso: {
    name: 'Torso Core Module',
    badge: 'STRUCTURAL · ROBOT',
    function: 'Central structural chassis housing the primary actuator network, power distribution bus, and inter-limb communication backbone.',
    science: 'The torso uses a carbon-composite exoskeleton with internal titanium alloy struts. Force distribution follows the principle of <strong>load path optimization</strong>, channeling mechanical stresses through the minimum-weight structural members.',
    beginner: 'This is the robot\'s "body center" — it connects all arms, legs, and the head while protecting the computer and battery inside.',
    advanced: 'The torso implements a redundant actuator topology with distributed motor control units (MCUs) operating at 1kHz servo loops. The internal power bus operates at 48V DC with ≥92% conversion efficiency via synchronous buck-boost converters.',
    paper: 'In the SEM adaptive framework, the torso\'s structural optimization mirrors the cognitive self-optimization loop — both minimize waste while maintaining structural integrity under variable loads.',
    formula: 'σ = F/A · k_safety   |   P_loss = I²R'
  },
  core: {
    name: 'AI Energy Core',
    badge: 'POWER · COGNITION · ROBOT',
    function: 'Central power generation and AI computation nexus. Houses the neural processing unit and primary energy storage with electromagnetic shielding.',
    science: 'The core implements a <strong>supercapacitor-battery hybrid</strong> storage system. Energy density follows E = ½CV², while the neural processor performs parallel inference using sparse matrix multiplication optimized for sub-10ms latency.',
    beginner: 'Think of this as the robot\'s heart and brain combined — it stores energy and runs all the thinking.',
    advanced: 'The AI core runs a quantized transformer model (INT8) at 15 TOPS. Thermal management uses vapor-chamber cooling with adaptive clock throttling. The supercap bank provides 200kJ burst capacity for peak actuator demands.',
    paper: 'Directly maps to the paper\'s "Cognitive Self-Optimization" module — the core continuously updates its internal state representation using Bayesian inference and adapts efficiency parameters in real-time.',
    formula: 'E = ½CV²   |   η_cognitive = 1 - H(X|Y)/H(X)'
  },
  head: {
    name: 'Neural Processor Head',
    badge: 'COGNITION · SENSING · ROBOT',
    function: 'Houses the primary AI inference engine, multi-modal sensor fusion array, and wireless communication transceivers.',
    science: '<strong>Sensor fusion</strong> combines stereo vision (depth), LiDAR point clouds, and IMU data using a Kalman Filter to produce a unified 3D world model at 60Hz update rates.',
    beginner: 'The robot\'s head is like its eyes, ears, and main computer all together — it sees the world and decides what to do.',
    advanced: 'Extended Kalman Filter (EKF) state estimation: x̂_{k|k} = x̂_{k|k-1} + K_k(z_k - H x̂_{k|k-1}). Vision pipeline achieves 2ms latency on embedded NPU.',
    paper: 'The head\'s adaptive perception system implements the paper\'s "AI intersection" principle: physics-grounded constraints are fed into the neural model as prior knowledge.',
    formula: 'x̂ = x̂⁻ + K(z - Hx̂⁻)   |   K = P⁻Hᵀ(HP⁻Hᵀ + R)⁻¹'
  },
  visor: {
    name: 'Optical Sensor Visor',
    badge: 'VISION · SENSING · ROBOT',
    function: 'Multi-spectral imaging array combining RGB, infrared, and depth sensors for real-time environmental mapping.',
    science: '<strong>Time-of-Flight (ToF)</strong> depth sensing measures distance via d = c·Δt/2, where Δt is the photon round-trip delay. The visor achieves sub-millimeter depth resolution at 5m range.',
    beginner: 'The visor is the robot\'s eyes — it can see colors, distances, and even heat signatures, just like having super-vision.',
    advanced: 'ToF array operates at 940nm IR. Depth resolution: 0.5mm @ 1m, 2mm @ 5m. RGB: 4K@60fps. Stereoscopic baseline: 65mm. Fusion pipeline: 8ms end-to-end.',
    paper: 'Sensor data feeds directly into the SEM adaptive efficiency framework\'s input layer for closed-loop environment modeling.',
    formula: 'd = c·Δt/2   |   f_depth = c/(2·Δt_max)'
  },
  shoulder: {
    name: 'Shoulder Joint Actuator',
    badge: 'ACTUATION · MECHANICAL · ROBOT',
    function: '3-DOF spherical joint enabling full arm rotation with torque-controlled servo motors and compliant force feedback.',
    science: '<strong>Series Elastic Actuators (SEA)</strong> introduce intentional compliance between motor and joint, enabling accurate force control: F = k·(θ_motor - θ_joint). This prevents damage during impacts and enables safe human interaction.',
    beginner: 'The shoulder joint works like a ball-and-socket, but with smart motors that can feel forces and adjust strength automatically.',
    advanced: 'SEA impedance: k = 300 N·m/rad. Backdrivability ratio > 0.85. Peak torque: 180 N·m. Bandwidth: 30Hz. Encoder resolution: 2²⁰ counts/rev.',
    paper: 'The SEA\'s force-adaptive behavior mirrors the paper\'s adaptive efficiency principle: the system continuously minimizes energy waste while maintaining precise force output.',
    formula: 'F_joint = k_spring(θ_motor - θ_joint)   |   τ_imp = B·q̇ + K·(q - q_d)'
  },
  elbow: {
    name: 'Elbow Revolute Joint',
    badge: 'ACTUATION · MECHANICAL · ROBOT',
    function: '1-DOF revolute joint with direct-drive brushless motor, optimized for high-speed pick-and-place operations.',
    science: 'The direct-drive brushless DC motor eliminates gearbox efficiency losses: η_total = η_motor × η_gearbox. By removing the gearbox (η=1), back-EMF braking provides natural compliance and energy recovery during deceleration.',
    beginner: 'The elbow bends the arm. It uses a special electric motor that\'s very efficient and can even recover energy when slowing down.',
    advanced: 'BLDC motor: Kv = 200 rpm/V, peak power 850W, efficiency 94%. Regenerative braking recovers up to 35% of kinetic energy. Position accuracy: ±0.01°.',
    paper: 'Energy recovery at the elbow joint demonstrates the paper\'s "efficiency optimization" principle in hardware — minimizing wasted energy at every mechanical stage.',
    formula: 'P_recovered = ½Iω²·η_regen   |   V_bemf = Kv⁻¹·ω'
  },
  knee: {
    name: 'Knee Joint Assembly',
    badge: 'LOCOMOTION · STRUCTURAL · ROBOT',
    function: 'Variable-stiffness knee joint enabling dynamic walking, running gaits, and energy-efficient locomotion on uneven terrain.',
    science: '<strong>Variable Stiffness Actuation (VSA)</strong>: K(t) = f(θ_stiffness_motor). During stance phase, high stiffness absorbs impact. During swing, low stiffness enables natural pendulum dynamics (E = mgl·(1-cos θ)), reducing motor energy demand.',
    beginner: 'The smart knee can change how stiff or soft it is — hard when stepping down, soft when swinging forward — saving lots of battery power.',
    advanced: 'VSA range: 50-3000 N·m/rad. Walking COT (Cost of Transport): 0.18 J/kg·m. Running top speed: 4.2 m/s. Proprioceptive sensing: 6-axis F/T, ±500N.',
    paper: 'Variable stiffness directly implements the SEM paper\'s "adaptive efficiency" concept — the system dynamically allocates mechanical resources based on task context.',
    formula: 'E_walk = C_ot·m·g·d   |   K_opt = √(m·g/l)'
  },
  foot: {
    name: 'Locomotion Foot Pad',
    badge: 'LOCOMOTION · SENSING · ROBOT',
    function: 'Multi-zone force-sensitive foot with active ankle compliance and terrain adaptation for stable bipedal locomotion.',
    science: 'Pressure distribution is measured across 16 force sensors using a resistive sensor matrix. Center of Pressure (CoP) = Σ(F_i · r_i) / Σ(F_i). CoP position determines gait stability and drives real-time ankle compensation torques.',
    beginner: 'The foot has 16 tiny sensors that measure exactly how much weight is on each part — like a smart scale that tells the robot how to balance.',
    advanced: 'CoP control bandwidth: 100Hz. ZMP (Zero Moment Point) stability criterion enforced in real-time. Terrain adaptation: ±35° slope, 5cm obstacle clearance. Foot compliance: viscoelastic polymer damper.',
    paper: 'CoP-based stability control feeds into the SEM framework\'s feedback loop, providing physics-grounded constraints for gait optimization.',
    formula: 'CoP = Σ(Fᵢ·rᵢ)/ΣFᵢ   |   ZMP condition: τ_ankle ≥ 0'
  },
  hand: {
    name: 'Dexterous Manipulator',
    badge: 'MANIPULATION · SENSING · ROBOT',
    function: '4-finger dexterous end-effector with tactile sensing, enabling precision grasping and tool use in unstructured environments.',
    science: '<strong>Tactile grasp stability</strong> requires sufficient frictional contacts: each fingertip must satisfy μ·N ≥ F_tangential (Coulomb friction law). The hand uses Form Closure + Force Closure grasp planning for robust object manipulation.',
    beginner: 'The robot\'s hand has 4 smart fingers with touch sensors, allowing it to pick up delicate objects without crushing them.',
    advanced: 'Force control: 0.1N resolution per finger. Grasp planning: Monte Carlo tree search over 10⁶ contact configurations. Tactile array: 64 taxels/finger, 200Hz sampling rate.',
    paper: 'Manipulation efficiency is a key output metric in the SEM framework — the adaptive controller minimizes task completion energy.',
    formula: 'μN ≥ Fₜ   |   W = (min eig(G·Gᵀ)) · w'
  },

  /* ── MACHINE ── */
  chamber: {
    name: 'SEM Vacuum Chamber',
    badge: 'STRUCTURE · SEM · MACHINE',
    function: 'Ultra-high vacuum containment vessel maintaining 10⁻⁶ to 10⁻¹⁰ Torr environment essential for electron beam propagation without scattering.',
    science: 'Electrons travel without deflection only in high vacuum because air molecules scatter the beam. Mean free path: λ = kT/(√2·π·d²·P). At 10⁻⁷ Torr, λ > 500 meters, ensuring beam coherence across the sample column.',
    beginner: 'The vacuum chamber removes all air so electrons can travel in a perfectly straight line. Even a tiny bit of air would deflect the beam and ruin the image.',
    advanced: 'Chamber material: 316L stainless steel, μ-metal shielding for B-field suppression (<1nT). Pumping sequence: roughing pump (≤10 mTorr) → turbomolecular (≤10⁻⁷ Torr) → ion pump (≤10⁻¹⁰ Torr). Bakeout: 150°C for 24h.',
    paper: 'The SEM vacuum chamber represents the physical substrate of the paper\'s framework — the controlled environment where precise measurements enable AI-driven efficiency optimization.',
    formula: 'λ = kT/(√2·π·d²·P)   |   P·λ = const'
  },
  electronGun: {
    name: 'Electron Gun Assembly',
    badge: 'BEAM GENERATION · SEM · MACHINE',
    function: 'Generates and accelerates a focused electron beam through thermionic or field emission, forming the primary probe for sample imaging.',
    science: '<strong>Field Emission</strong> uses quantum tunneling: electrons tunnel through the reduced potential barrier near a sharp tungsten tip under high electric field E > 10⁹ V/m. The Fowler-Nordheim equation: J = (AE²/φ)·exp(-Bφ³/²/E) governs emission current density.',
    beginner: 'The electron gun shoots a beam of electrons — tiny particles — at the sample. It\'s like a very precise flashlight using electrons instead of light.',
    advanced: 'Schottky FEG: brightness β = 5×10⁸ A/cm²·sr @ 15kV. Energy spread ΔE = 0.3 eV. Emission current: 100μA. Extraction voltage: 4.5kV. Tip radius: 300nm.',
    paper: 'Electron gun stability parameters (brightness, energy spread) are primary inputs to the paper\'s AI optimization framework for adaptive beam quality control.',
    formula: 'J = (AE²/φ)·exp(-Bφ^(3/2)/E)   |   β = J/(π·α²·ΔΩ)'
  },
  cathode: {
    name: 'Field Emission Cathode',
    badge: 'EMISSION · QUANTUM · MACHINE',
    function: 'Single-crystal tungsten emitter tip that produces a coherent, high-brightness electron beam via quantum-mechanical field emission.',
    science: 'The cathode works by <strong>quantum tunneling</strong>: at the atomic-scale tip (r < 100nm), the electric field exceeds 10⁹ V/m, thinning the work function barrier until electrons have significant transmission probability T = exp(-2∫κ dx) where κ = √(2m(V-E))/ℏ.',
    beginner: 'The cathode is the source of electrons — a tiny sharp tungsten needle where electrons "tunnel" through an invisible wall to escape. This is pure quantum physics!',
    advanced: 'Work function φ_W = 4.5 eV. Transmission probability at E₉ V/m: T ≈ 10⁻³. Current density J_FN follows F-N equation. Emitter life: >2000 hours with UHV maintenance.',
    paper: 'Cathode emission variability is a key noise source in SEM imaging — the paper\'s AI framework predicts and compensates for emission drift using a physics-informed neural model.',
    formula: 'T ≈ exp(-2·√(2m(φ)/ℏ²)·d)   |   J_FN = (e³E²)/(8πhφ)·exp(-8π√(2mφ³)/3eEh)'
  },
  beam: {
    name: 'Primary Electron Beam',
    badge: 'BEAM · PHYSICS · MACHINE',
    function: 'Focused electron probe that scans the sample surface in a raster pattern, exciting secondary electron emission and X-ray signals for imaging.',
    science: 'Beam focusing follows electron optics analogous to light optics: 1/f = 1/d_o + 1/d_i. The theoretical minimum spot size is limited by diffraction: d_min = 0.61λ/NA, where de Broglie wavelength λ = h/√(2meV). At 15kV, λ = 10pm.',
    beginner: 'The electron beam is like a super-precise laser that scans back and forth over the sample, point by point, to build up an image.',
    advanced: 'Beam diameter: 0.8nm @ 15kV. Current: 1-100pA (tunable). Scan speed: 1μs/pixel for fast imaging, 100μs for analytical mode. Spot size limited by aberrations, not diffraction.',
    paper: 'Beam current and energy are the primary control parameters in the SEM adaptive efficiency framework — AI continuously adjusts them to maximize SNR while minimizing sample damage.',
    formula: 'λ_dB = h/√(2meV)   |   d_spot = f(Cs, λ, α)'
  },
  lens: {
    name: 'Electromagnetic Condenser Lens',
    badge: 'OPTICS · ELECTROMAGNETIC · MACHINE',
    function: 'Magnetic coil lenses that converge the electron beam using Lorentz forces, reducing beam diameter and controlling illumination angle.',
    science: 'Magnetic lenses focus electrons via the Lorentz force: F = e(v×B). The focal length f = (8V/e)·(∫B²dz)⁻¹ depends on accelerating voltage V and axial field integral. <strong>Spherical aberration</strong> (C_s) is the fundamental limit: d_s = ½C_s·α³.',
    beginner: 'These magnetic lenses work like magnifying glasses but for electrons, using magnetic fields to steer and focus the electron beam.',
    advanced: 'Lens design: 2-pole electromagnetic. C_s = 1.2mm (uncorrected), 0.001mm (Cs-corrected). C_c = 1.0mm. Objective lens gap: 5mm. Max field: 1.2T. Aberration coefficients determine fundamental resolution limit.',
    paper: 'Lens excitation parameters are optimized by the paper\'s AI system — adaptive algorithms continuously correct for thermal drift and hysteresis in lens performance.',
    formula: '1/f = (e/8V)·∫B²dz   |   d_total = √(d_s² + d_c² + d_d²)'
  },
  detector: {
    name: 'Secondary Electron Detector',
    badge: 'DETECTION · SIGNAL · MACHINE',
    function: 'Everhart-Thornley detector that captures low-energy secondary electrons (< 50eV) emitted from the sample to form topographic contrast images.',
    science: 'The detector uses an <strong>Everhart-Thornley geometry</strong>: a positively biased Faraday cage (+300V) attracts secondary electrons, which are accelerated to a scintillator (+10kV) causing photon emission. Photons travel via light pipe to a photomultiplier tube (PMT) with gain G > 10⁶.',
    beginner: 'The detector catches the secondary electrons bouncing off the sample and turns them into an electrical signal to create the image.',
    advanced: 'SE collection efficiency: ~80%. PMT gain: 10⁶. Bandwidth: 10MHz. SNR improvement per frame: √N (signal averaging). Time constant τ = RC limits scan bandwidth.',
    paper: 'Detector signal quality is the optimization target in the paper — the AI framework adaptively controls acquisition parameters to maximize information gain per electron dose.',
    formula: 'SNR = √(N_e·η·G·B)   |   S/N_per_pixel = √(I·τ/e)'
  },
  stage: {
    name: 'Motorized Sample Stage',
    badge: 'MECHANICS · PRECISION · MACHINE',
    function: '5-axis piezoelectric stage providing nanometer-precision sample positioning with thermal stability and vibration isolation.',
    science: '<strong>Piezoelectric actuation</strong>: d = d₃₃·V, where d₃₃ is the piezoelectric coefficient (~400 pm/V for PZT). A 1mm travel piezo stack with d₃₃ = 400pm/V requires ΔV = 2500V. Feedback via capacitive sensors achieves sub-nanometer positioning accuracy.',
    beginner: 'The sample stage uses special crystals that expand or shrink when electricity passes through them to move with incredible precision — smaller than an atom!',
    advanced: 'Stage travel: XY ±62.5mm, Z 25mm, tilt ±70°, rotation 360°. Positioning accuracy: 0.5nm (closed loop). Thermal drift: <1nm/min with temperature control. Vibration isolation: pneumatic active.',
    paper: 'Stage positional accuracy directly affects the SEM imaging quality that feeds the AI system — drift compensation using adaptive algorithms is a direct application of the paper\'s framework.',
    formula: 'd = d₃₃·V   |   σ_pos = √(k_BT/κ_mech)'
  },
  vacuumPump: {
    name: 'Turbomolecular Vacuum Pump',
    badge: 'VACUUM · ENGINEERING · MACHINE',
    function: 'High-speed turbomolecular pump achieving pressures below 10⁻⁷ Torr through kinetic momentum transfer from spinning blades to gas molecules.',
    science: 'Turbomolecular pumps work via <strong>molecular drag</strong>: rotor blade tip speed must exceed mean molecular speed. Compression ratio per stage: K = exp(Δv_blade/v_thermal), where v_thermal = √(2kT/m). At 30,000 RPM, blade tip speed ≈ 200 m/s > v_thermal for N₂.',
    beginner: 'This pump spins incredibly fast (500 times per second!) to knock air molecules out of the chamber, creating the near-perfect vacuum needed for electron imaging.',
    advanced: 'Pump speed: 30,000 RPM. Pumping speed: 300 L/s (N₂). Compression ratio: 10⁹ for N₂. Foreline pressure: ≤0.1 Torr. Power: 300W. Bearing: magnetic levitation (no oil contamination).',
    paper: 'Pump power consumption is an efficiency parameter monitored by the SEM framework — the AI identifies pump performance degradation before it affects beam quality.',
    formula: 'K_stage = exp(v_blade/v̄)   |   S = Q/(P_in - P_out)'
  },
  controlPanel: {
    name: 'SEM Control Interface',
    badge: 'CONTROL · SOFTWARE · MACHINE',
    function: 'Integrated hardware-software control system managing beam parameters, stage positioning, detector signals, and AI optimization feedback loops.',
    science: 'The control system implements a <strong>multi-loop PID control architecture</strong> with hierarchical feedback. Inner loops (μs timescale): beam current, lens excitation. Outer loops (ms timescale): image quality metrics. AI supervisor (s timescale): adaptive parameter optimization from paper.',
    beginner: 'The control panel is like the cockpit of the SEM — it manages everything from beam strength to how the AI optimizes the scanning process automatically.',
    advanced: 'Control architecture: FPGA inner loops at 1MHz, CPU outer loops at 1kHz, GPU-accelerated AI at 10Hz. Real-time OS (RTOS). Latency budget: <100μs from signal to actuator response.',
    paper: 'The control interface is the direct implementation of the paper\'s framework — the AI model runs here, continuously computing optimal SEM parameters based on current imaging conditions.',
    formula: 'u(t) = Kp·e + Ki·∫e·dt + Kd·de/dt   |   J_opt = min Σ(w_i·σ²_i + λ·P_total)'
  },
  sample: {
    name: 'Specimen Sample',
    badge: 'ANALYSIS · MATERIAL · MACHINE',
    function: 'Target material under investigation, mounted on a conductive substrate for high-resolution surface topography, composition, and structural analysis.',
    science: 'Electrons interact with the specimen via <strong>electron-matter interactions</strong>: elastic (Rutherford backscattering: dσ/dΩ = Z²e⁴/4E²sin⁴(θ/2)) and inelastic scattering generates secondary electrons, X-rays (EDS), and cathodoluminescence. Interaction volume = teardrop-shaped region ≈ R = 0.0276·A·E₀¹·⁶⁷/(ρ·Z⁰·⁸⁸⁹) μm.',
    beginner: 'The sample is what we want to examine — it could be a nano-material, biological tissue, or electronics. The electron beam scans it to reveal details invisible to light microscopes.',
    advanced: 'Sample prep: sputter coat (Au/Pd, 3nm) for non-conductors. EDX: element detection Z>4, detection limit 0.1 wt%. Electron dose: 10²-10⁶ e⁻/Å² depending on beam sensitivity.',
    paper: 'Sample imaging is the primary data source for the SEM efficiency framework — AI models the relationship between beam parameters and image quality for a given material.',
    formula: 'R_K = 0.0276·A·E₀^1.67/(ρ·Z^0.889)   |   I_SE = I₀·sec(θ)'
  },

  /* ── NEURAL SYSTEM ── */
  aiCore: {
    name: 'Central AI Cognitive Core',
    badge: 'AI · COGNITION · SYSTEM',
    function: 'Primary neural network computation hub implementing the paper\'s Cognitive Self-Optimization framework with physics-constrained learning.',
    science: '<strong>Physics-Informed Neural Networks (PINNs)</strong> embed physical laws directly into the loss function: L_total = L_data + λ·L_physics. For SEM: L_physics = ||∇²Φ - ρ/ε₀||² (electron optics). This dramatically reduces training data requirements while guaranteeing physical consistency.',
    beginner: 'This is the main AI brain — a neural network that doesn\'t just learn from data but also understands physics laws, making it much smarter and more reliable.',
    advanced: 'Architecture: Transformer (6 layers, 512 dims, 8 heads). Physics residual loss weight λ=0.1. Convergence: 10x faster than data-only. Inference: 5ms on GPU, 50ms on CPU. Training: 10K SEM image pairs.',
    paper: 'The AI core IS the paper\'s central contribution — the unified framework that bridges artificial intelligence with physics-based modeling for SEM adaptive efficiency.',
    formula: 'L = L_MSE + λ·||F(u;θ) - N(u)||²   |   η_adapt = 1 - KL(q_φ||p_θ)'
  },
  inputLayer: {
    name: 'Input Layer — Sensor Fusion',
    badge: 'INPUT · SENSING · SYSTEM',
    function: 'Multi-modal data ingestion layer normalizing and encoding raw SEM signals: beam parameters, detector signals, stage position, and vacuum status.',
    science: 'Input normalization using Z-score standardization: x_norm = (x - μ)/σ ensures all features contribute equally regardless of physical units. Positional encoding for sequential scan data uses sinusoidal PE(pos,2i) = sin(pos/10000^(2i/d_model)).',
    beginner: 'The input layer is like the senses of the AI — it takes in all the raw data from the SEM machine and converts it into a form the neural network can understand.',
    advanced: 'Input dimensionality: 128 features (32 beam params, 48 detector signals, 24 stage/env). Batch normalization after each linear layer. Dropout p=0.1 for regularization. Adam optimizer: lr=3×10⁻⁴.',
    paper: 'The input layer directly corresponds to Section 3.1 of the paper — the sensory interface that bridges physical measurements with the AI optimization framework.',
    formula: 'x̂ = (x - μ)/σ   |   PE(p,2i) = sin(p/10000^(2i/d))'
  },
  hiddenL1: {
    name: 'Hidden Layer 1 — Feature Extraction',
    badge: 'PROCESSING · NEURAL · SYSTEM',
    function: 'First hidden layer performing non-linear feature extraction, learning abstract representations of beam-sample interaction physics.',
    science: '<strong>Universal Approximation Theorem</strong> guarantees that a neural network with ≥1 hidden layer can approximate any continuous function to arbitrary precision. ReLU activation: f(x) = max(0,x) introduces non-linearity: critical for learning the non-linear beam-sample physics.',
    beginner: 'The first hidden layer is where the AI starts recognizing patterns — it learns features like "high beam current → more secondary electrons" without being explicitly programmed.',
    advanced: 'Layer width: 256 neurons. Activation: GELU (smoother gradient flow than ReLU). Weight initialization: He normal. Gradient norm clipping at 1.0 for training stability. Features correspond to beam optics, interaction volume dynamics.',
    paper: 'Feature extraction in Hidden Layer 1 corresponds to the "physics feature encoder" in the paper\'s SEM efficiency model.',
    formula: 'h = σ(Wx + b)   |   GELU(x) = x·Φ(x)'
  },
  hiddenL2: {
    name: 'Hidden Layer 2 — Optimization Policy',
    badge: 'OPTIMIZATION · ADAPTIVE · SYSTEM',
    function: 'Policy generation layer that maps physical state representations to optimal SEM control actions for efficiency maximization.',
    science: '<strong>Reinforcement Learning policy</strong>: π_θ(a|s) = softmax(Wh + b). The policy is trained to maximize expected cumulative reward: J(θ) = E[Σγᵗr_t]. For SEM: reward = image_quality / power_consumed, incentivizing efficient operation.',
    beginner: 'This layer is the decision-making part — it takes all the learned features and figures out the best settings to use for maximum efficiency and image quality.',
    advanced: 'Policy network: actor-critic architecture. Advantage function: A(s,a) = Q(s,a) - V(s). PPO clipping: ε=0.2. Entropy regularization α=0.01. Policy update frequency: every 10 imaging cycles.',
    paper: 'This directly implements the paper\'s "adaptive efficiency" component — the core RL policy that continuously improves SEM operation strategy.',
    formula: 'π(a|s) = softmax(f(s))   |   J(θ) = E_π[Σᵢ γⁱr_{t+i}]'
  },
  outputLayer: {
    name: 'Output Layer — Control Commands',
    badge: 'OUTPUT · CONTROL · SYSTEM',
    function: 'Final layer generating optimized SEM control parameters: accelerating voltage, beam current, scan speed, and focus coefficients.',
    science: 'The output uses a <strong>multi-objective optimization</strong> formulation with Pareto frontier solutions. For k objectives: min [f₁(x), f₂(x),...,fₖ(x)]. SEM objectives: (1) maximize resolution, (2) minimize sample damage, (3) minimize power. No single optimal solution exists — a Pareto-optimal set is computed.',
    beginner: 'The output layer produces the final decisions — the exact settings the SEM machine should use. It balances image quality, sample safety, and energy use all at once.',
    advanced: 'Output dim: 32 (continuous control params). Activation: sigmoid scaled to physical bounds. Uncertainty quantification via MC dropout (N=100 samples). Control validation against physics constraints before execution.',
    paper: 'The output layer is the direct "action interface" of the SEM Adaptive Efficiency framework described in the paper — translating AI decisions into physical hardware commands.',
    formula: 'y = σ(W_out·h + b_out)   |   Pareto: ∄x\': f_i(x\')<f_i(x) ∀i'
  },
  semFeedback: {
    name: 'SEM Feedback Module',
    badge: 'FEEDBACK · CONTROL · SYSTEM',
    function: 'Closed-loop feedback controller comparing actual SEM performance against AI-predicted optimal performance and computing correction signals.',
    science: '<strong>Closed-loop control with AI supervisor</strong>: error signal e(t) = y_desired(t) - y_actual(t) drives the adaptive controller. The AI module continuously updates the desired trajectory y_desired(t) based on learned environmental models, unlike fixed PID which uses static setpoints.',
    beginner: 'The feedback module checks whether the SEM is actually performing as the AI predicted. If not, it sends a correction signal — like a thermostat but for a scientific microscope.',
    advanced: 'Feedback latency: <5ms. Error signal dimensionality: 16 (image quality metrics). Adaptive gain scheduling using Gaussian Process regression on operating history. RMSE tracking: <0.5% of full scale.',
    paper: 'The feedback module is the closed-loop implementation of the paper\'s framework — enabling continuous learning from real-world deviations to improve future predictions.',
    formula: 'e(t) = r(t) - y(t)   |   K_adaptive = K₀ + ΔK(θ_learned)'
  },
  adaptiveEngine: {
    name: 'Adaptive Efficiency Engine',
    badge: 'ADAPTATION · OPTIMIZATION · SYSTEM',
    function: 'Core adaptation module that updates the AI model parameters in real-time based on imaging outcomes, implementing online learning for continuous improvement.',
    science: '<strong>Online Bayesian updating</strong>: posterior p(θ|data) ∝ likelihood × prior. With new observation x_new: p(θ|x_1...x_n) ∝ p(x_n|θ)·p(θ|x_1...x_{n-1}). This enables the system to improve with each imaging session while preventing catastrophic forgetting through Elastic Weight Consolidation (EWC).',
    beginner: 'The adaptive engine makes the AI smarter every time it\'s used — it learns from each SEM session and gets better at predicting optimal settings.',
    advanced: 'Online learning rate: η = 0.001 (Adam). EWC penalty: λ_EWC = 5000. Memory buffer: 10,000 recent samples (experience replay). Model update: every 100 steps. Performance gain: +15% efficiency vs fixed model after 50 sessions.',
    paper: 'The Adaptive Efficiency Engine is the paper\'s central innovation — the online learning system that bridges AI adaptivity with physics-grounded SEM operation.',
    formula: 'L_EWC = L(θ) + Σᵢ(λ/2)·Fᵢ·(θᵢ-θ*ᵢ)²   |   Δθ = -η·∇L'
  },
  physicsCore: {
    name: 'Physics Simulation Core',
    badge: 'PHYSICS · SIMULATION · SYSTEM',
    function: 'Embedded physics engine that constrains and validates AI outputs against fundamental electron-matter interaction laws, ensuring physically realizable control commands.',
    science: '<strong>Physics-informed constraints</strong> use hard boundary enforcement: any AI output violating Maxwell\'s equations, energy conservation, or material limits is projected onto the feasible manifold. Constraint projection: θ_valid = argmin_{θ∈C} ||θ - θ_AI||², where C is the constraint set defined by physics laws.',
    beginner: 'The physics core makes sure the AI never suggests something physically impossible — it\'s like a "reality check" that enforces the laws of physics on every AI decision.',
    advanced: 'Physics constraints: 47 analytical equations encoded. Constraint satisfaction guaranteed by interior-point method (IPOPT solver). Average projection cost: 0.8ms. Constraint violation rate: <0.001% after training.',
    paper: 'The Physics Simulation Core is the "physics" half of the paper\'s title — the intersection of AI and physics that makes the framework both accurate and reliable.',
    formula: 'θ* = argmin_{θ∈𝒞}||θ-θ_AI||²   |   𝒞 = {θ: g(θ)≤0, h(θ)=0}'
  },

  /* ── FALLBACKS ── */
  armor: {
    name: 'Structural Armor Panel',
    badge: 'STRUCTURAL · PROTECTION · ROBOT',
    function: 'Impact-resistant composite armor protecting internal systems from mechanical damage and electromagnetic interference.',
    science: 'Carbon fiber reinforced polymer (CFRP): tensile strength 1500 MPa (10× steel at 1/5 weight). Energy absorption: E_abs = σ_y · ε_f · V. EM shielding via Faraday cage principle: SE(dB) = 20·log(λ/2πt·σ).',
    beginner: 'The armor panels protect the robot\'s insides from bumps, impacts, and even electronic interference.',
    advanced: 'Material: T800 CFRP + Kevlar hybrid. Thickness: 3mm. Ballistic resistance: NIJ Level II. EMI shielding: -40dB at 1GHz. Modulus: 130 GPa.',
    paper: 'Structural protection ensures the physical integrity of the SEM-robot interface — a prerequisite for reliable adaptive efficiency operation.',
    formula: 'SE = 20·log(1/T_EM)   |   σ_yield ≥ F_impact/A_min'
  },
  hip: {
    name: 'Hip Actuator Module',
    badge: 'LOCOMOTION · ACTUATION · ROBOT',
    function: '3-DOF hip joint enabling forward/backward swing, lateral abduction, and axial rotation for dynamic bipedal locomotion.',
    science: 'The hip is the primary power consumer in walking. Mechanical work: W = τ·Δθ. During normal gait, hip moment peaks at ~0.8 Nm/kg body weight at heel strike. Assistive exoskeleton torques can reduce metabolic cost by 23% via resonant actuation at gait frequency.',
    beginner: 'The hip joint moves the legs in multiple directions — like a ball-and-socket in your own hip, but with powerful motors that can adapt to any walking surface.',
    advanced: 'Peak torque: 240 N·m. Power: 2.4 kW peak. Gear ratio: 80:1. Motor: Quasi-Direct-Drive for improved transparency. Impact response: <10ms. Gait frequency: 1-3 Hz.',
    paper: 'Hip joint power consumption is a primary efficiency metric in the locomotion section of the SEM framework.',
    formula: 'W_hip = ∫τ·ω·dt   |   COT = E_total/(m·g·d)'
  },
  pelvis: {
    name: 'Actuator Pelvis Structure',
    badge: 'STRUCTURAL · MECHANICAL · ROBOT',
    function: 'Central pelvic structural bridge connecting both hip joints and the torso, routing power cables and control wiring through a protected channel.',
    science: 'The pelvis must withstand peak forces during double-support phase: F_reaction ≈ 1.2×BW per leg. The I-beam cross-section maximizes second moment of area: I = bh³/12, providing high bending stiffness with minimal material.',
    beginner: 'The pelvis connects the robot\'s legs to its body — it needs to be very strong because it handles all the forces from walking and running.',
    advanced: 'Material: 7075 aluminum alloy. Peak load: 6× robot body weight. Fatigue life: >10⁷ cycles. Internal routing: 36 power wires, 48 signal lines, pneumatic channels.',
    paper: 'Structural compliance in the pelvis contributes to locomotion energy efficiency — a key parameter in the paper\'s adaptive efficiency model.',
    formula: 'I = bh³/12   |   σ_max = M·c/I ≤ σ_yield/SF'
  }
};

// ═══════════════════════════════════════════════════
//  PAPER SECTIONS
// ═══════════════════════════════════════════════════
var PAPER_SECTIONS = {
  abstract: 'This paper presents a Unified Framework for Cognitive Self-Optimization at the intersection of Artificial Intelligence and Physics, targeting Scanning Electron Microscope (SEM) adaptive efficiency systems. We demonstrate that embedding physics-informed constraints into neural networks achieves 34% efficiency improvement over conventional control methods.',
  intro: 'Scanning Electron Microscopes represent a class of precision instruments where operational efficiency is governed by complex, interdependent physical processes. Traditional control methods rely on expert-defined heuristics; we propose replacing these with a cognitive AI framework that learns optimal operation strategies from physics-grounded data.',
  sem: 'The SEM Adaptive Efficiency Framework (SEA-F) models the microscope as a multi-objective optimization problem: maximize image resolution, minimize electron dose to the sample, and minimize total system power consumption. The framework uses a Physics-Informed Neural Network (PINN) to embed electromagnetic lens equations and electron-matter interaction models as soft constraints in the loss function.',
  ai: 'The AI integration layer implements an actor-critic reinforcement learning agent operating in the SEM parameter space. The agent observes: beam parameters (voltage 1-30kV, current 1-100pA), detector settings, vacuum level, and image quality metrics (SNR, sharpness). It outputs optimized control commands validated against physics constraints before execution.',
  results: 'Experimental validation across 5 material classes (metals, semiconductors, polymers, biological, ceramics) demonstrates: 34% average efficiency improvement, 28% reduction in electron dose (reducing sample damage), 2.1× faster optimal parameter acquisition vs expert operation, and 96.3% physics constraint satisfaction. The adaptive system improves by 15% efficiency over 50 imaging sessions.',
  conclusion: 'We demonstrate that the intersection of AI and physics provides a powerful framework for SEM adaptive efficiency optimization. The PINN-based approach achieves superior performance while guaranteeing physical realizability of all control outputs. Future work will extend to correlative multi-modal microscopy and in-situ materials characterization under extreme conditions.'
};

// ═══════════════════════════════════════════════════
//  PRESENTATION STEPS
// ═══════════════════════════════════════════════════
var PRESENTATION_STEPS = [
  {
    title: 'System Reveal — AXIOM-7',
    desc: 'Introducing AXIOM-7: the AI-powered robotic platform demonstrating the physical embodiment of the SEM adaptive efficiency principles. Each component implements real physics and engineering.',
    scene: 'robot',
    rotY: 0, rotX: 0, zoom: 1
  },
  {
    title: 'AI Energy Core',
    desc: 'The central AI core houses the physics-informed neural network — the same framework described in the paper. It continuously optimizes system efficiency through physics-constrained reinforcement learning.',
    scene: 'robot',
    rotY: 0.3, rotX: 0.1, zoom: 0.7,
    highlight: 'core'
  },
  {
    title: 'SEM Machine Overview',
    desc: 'The Scanning Electron Microscope system. Each component generates the sensor data that feeds the AI optimization framework: from the field emission cathode to the secondary electron detector.',
    scene: 'machine',
    rotY: -0.3, rotX: 0.2, zoom: 1
  },
  {
    title: 'Electron Beam Path',
    desc: 'The primary electron beam travels from the field emission cathode through three electromagnetic condenser lenses to focus on the sample surface. AI continuously optimizes this path for maximum imaging efficiency.',
    scene: 'machine',
    rotY: 0, rotX: 0.4, zoom: 0.75,
    highlight: 'beam'
  },
  {
    title: 'Neural Network Architecture',
    desc: 'The AI cognitive system: input sensors feed a multi-layer transformer neural network with an embedded physics simulation core. The adaptive efficiency engine performs online learning from every SEM imaging session.',
    scene: 'system',
    rotY: 0.2, rotX: 0, zoom: 0.9
  },
  {
    title: 'Results & Conclusions',
    desc: '34% efficiency improvement. 28% reduction in electron dose. 15% continuous improvement over 50 sessions. The fusion of AI and physics at the SEM interface represents the future of intelligent scientific instrumentation.',
    scene: 'system',
    rotY: 0, rotX: 0, zoom: 1.1
  }
];

// ═══════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════
var UI = {
  currentLevel: 'beginner',
  presentStep: 0,
  presenting: false
};

// ═══════════════════════════════════════════════════
//  DOM READY
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  setupLanding();
  setupModeButtons();
  setupSceneButtons();
  setupControlButtons();
  setupPaperStrip();
  setupQuickFacts();
  setupPresentation();
  spawnLandingParticles();
});

// ═══════════════════════════════════════════════════
//  LANDING
// ═══════════════════════════════════════════════════
function setupLanding() {
  var btn = document.getElementById('startBtn');
  var landing = document.getElementById('landing');
  var app = document.getElementById('app');

  btn.addEventListener('click', function() {
    landing.classList.add('fade-out');
    setTimeout(function() {
      landing.classList.add('hidden');
      app.classList.remove('hidden');
      // Init Three.js after app is visible
      setTimeout(function() {
        initThreeEngine();
        simulateLoad();
      }, 100);
    }, 800);
  });
}

function simulateLoad() {
  var fill = document.getElementById('loadFill');
  var overlay = document.getElementById('sceneLoading');
  var progress = 0;
  var interval = setInterval(function() {
    progress += Math.random() * 15 + 5;
    if (fill) fill.style.width = Math.min(progress, 100) + '%';
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(function() {
        if (overlay) overlay.classList.add('done');
      }, 300);
    }
  }, 80);
}

function spawnLandingParticles() {
  var container = document.getElementById('landingParticles');
  if (!container) return;
  for (var i = 0; i < 30; i++) {
    (function(idx) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'particle';
        var size = 2 + Math.random() * 4;
        p.style.cssText = [
          'width:' + size + 'px',
          'height:' + size + 'px',
          'left:' + Math.random() * 100 + '%',
          'bottom:-10px',
          'background:' + (Math.random() > 0.5 ? 'rgba(170,68,255,0.8)' : 'rgba(0,229,255,0.8)'),
          'animation-duration:' + (4 + Math.random() * 6) + 's',
          'animation-delay:' + (Math.random() * 3) + 's'
        ].join(';');
        container.appendChild(p);
      }, idx * 100);
    })(i);
  }
}

// ═══════════════════════════════════════════════════
//  MODE BUTTONS
// ═══════════════════════════════════════════════════
function setupModeButtons() {
  var tabs = document.querySelectorAll('.mode-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var mode = tab.getAttribute('data-mode');
      setMode(mode);
    });
  });
}

function setMode(mode) {
  window.NX && (window.NX.mode = mode);
  var presentOverlay = document.getElementById('presentOverlay');

  if (mode === 'present') {
    if (presentOverlay) presentOverlay.classList.remove('hidden');
    startPresentation();
  } else {
    if (presentOverlay) presentOverlay.classList.add('hidden');
    UI.presenting = false;
  }
}

// ═══════════════════════════════════════════════════
//  SCENE BUTTONS
// ═══════════════════════════════════════════════════
function setupSceneButtons() {
  var btns = document.querySelectorAll('.scene-btn');
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var scene = btn.getAttribute('data-scene');
      if (window.loadScene) {
        showSceneLoading();
        setTimeout(function() {
          loadScene(scene);
          hideSceneLoading();
        }, 400);
      }
      resetPanelDefault();
    });
  });
}

function showSceneLoading() {
  var el = document.getElementById('sceneLoading');
  if (!el) return;
  var fill = document.getElementById('loadFill');
  el.classList.remove('done');
  var p = 0;
  var iv = setInterval(function() {
    p += 20 + Math.random() * 30;
    if (fill) fill.style.width = Math.min(p, 100) + '%';
    if (p >= 100) { clearInterval(iv); setTimeout(function() { el.classList.add('done'); }, 200); }
  }, 80);
}

function hideSceneLoading() {
  var el = document.getElementById('sceneLoading');
  if (el) setTimeout(function() { el.classList.add('done'); }, 600);
}

// ═══════════════════════════════════════════════════
//  CONTROL BUTTONS
// ═══════════════════════════════════════════════════
function setupControlButtons() {
  var btn360 = document.getElementById('btn360');
  var btnExplode = document.getElementById('btnExplode');
  var btnWire = document.getElementById('btnWireframe');
  var btnReset = document.getElementById('btnReset');
  var btnAuto = document.getElementById('btnAutoRotate');

  if (btn360) btn360.addEventListener('click', function() {
    this.classList.toggle('active');
  });

  if (btnExplode) btnExplode.addEventListener('click', function() {
    if (window.toggleExplode) toggleExplode();
    this.classList.toggle('active');
  });

  if (btnWire) btnWire.addEventListener('click', function() {
    if (window.toggleWireframe) toggleWireframe();
    this.classList.toggle('active');
  });

  if (btnReset) btnReset.addEventListener('click', function() {
    if (window.resetView) resetView();
    btnExplode && btnExplode.classList.remove('active');
    btnWire && btnWire.classList.remove('active');
    btnAuto && btnAuto.classList.remove('active');
  });

  if (btnAuto) btnAuto.addEventListener('click', function() {
    this.classList.toggle('active');
    window.NX && (window.NX.autoRotate = !window.NX.autoRotate);
  });

  var fullBtn = document.getElementById('fullscreenBtn');
  if (fullBtn) fullBtn.addEventListener('click', function() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  var audioBtn = document.getElementById('audioToggle');
  if (audioBtn) audioBtn.addEventListener('click', function() {
    this.textContent = this.textContent === '♪' ? '♪̶' : '♪';
  });
}

// ═══════════════════════════════════════════════════
//  PAPER STRIP
// ═══════════════════════════════════════════════════
function setupPaperStrip() {
  var items = document.querySelectorAll('.paper-item');
  items.forEach(function(item) {
    item.addEventListener('click', function() {
      items.forEach(function(i) { i.classList.remove('active'); });
      item.classList.add('active');
      var section = item.getAttribute('data-section');
      var textEl = document.getElementById('paperText');
      if (textEl && PAPER_SECTIONS[section]) {
        textEl.style.opacity = '0';
        setTimeout(function() {
          textEl.textContent = PAPER_SECTIONS[section];
          textEl.style.opacity = '1';
        }, 150);
      }
    });
  });
}

// ═══════════════════════════════════════════════════
//  QUICK FACTS
// ═══════════════════════════════════════════════════
function setupQuickFacts() {
  var cards = document.querySelectorAll('.fact-card');
  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      var comp = card.getAttribute('data-component');
      var quickMap = {
        sem: 'chamber',
        neural: 'aiCore',
        sensor: 'detector',
        actuator: 'shoulder'
      };
      if (quickMap[comp]) showComponentInfo(null, quickMap[comp]);
    });
  });
}

// ═══════════════════════════════════════════════════
//  COMPONENT INFO PANEL
// ═══════════════════════════════════════════════════
window.showComponentInfo = function(name, component) {
  var data = COMPONENTS[component];
  if (!data) {
    // Try to find by partial name match
    for (var k in COMPONENTS) {
      if (k.toLowerCase().includes(component.toLowerCase()) ||
          component.toLowerCase().includes(k.toLowerCase())) {
        data = COMPONENTS[k];
        break;
      }
    }
  }
  if (!data) {
    resetPanelDefault();
    return;
  }

  var panelTitle = document.getElementById('panelTitle');
  var panelBody = document.getElementById('panelBody');

  if (panelTitle) panelTitle.textContent = data.name.toUpperCase();

  if (panelBody) {
    panelBody.innerHTML = buildComponentHTML(data);
    setupLevelTabs(panelBody);
  }
};

function buildComponentHTML(data) {
  return [
    '<div class="comp-header">',
    '  <div class="comp-name">' + data.name + '</div>',
    '  <span class="comp-badge">' + data.badge + '</span>',
    '</div>',
    '<div class="comp-divider"></div>',
    '<div class="info-section">',
    '  <div class="info-label">◈ FUNCTION</div>',
    '  <div class="info-text">' + data.function + '</div>',
    '</div>',
    '<div class="comp-divider"></div>',
    '<div class="info-section">',
    '  <div class="info-label">⚡ SCIENCE</div>',
    '  <div class="info-text">' + data.science + '</div>',
    '</div>',
    data.formula ? '<div class="formula-box">' + data.formula + '</div>' : '',
    '<div class="comp-divider"></div>',
    '<div class="info-section">',
    '  <div class="info-label">📖 EXPLANATION</div>',
    '  <div class="level-tabs">',
    '    <button class="level-tab ' + (UI.currentLevel === 'beginner' ? 'active' : '') + '" data-level="beginner">BEGINNER</button>',
    '    <button class="level-tab ' + (UI.currentLevel === 'advanced' ? 'active' : '') + '" data-level="advanced">ADVANCED</button>',
    '  </div>',
    '  <div class="info-text level-content" id="levelContent">' + data[UI.currentLevel] + '</div>',
    '</div>',
    '<div class="comp-divider"></div>',
    '<div class="info-section">',
    '  <div class="info-label">📄 PAPER LINK</div>',
    '  <div class="info-text">' + data.paper + '</div>',
    '</div>'
  ].join('\n');
}

function setupLevelTabs(container) {
  var tabs = container.querySelectorAll('.level-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      UI.currentLevel = tab.getAttribute('data-level');
      var contentEl = container.querySelector('#levelContent');
      if (contentEl) {
        contentEl.style.opacity = '0';
        // Grab current data from panel title to find component
        var titleEl = document.getElementById('panelTitle');
        if (titleEl) {
          var compData = findComponentByDisplayName(titleEl.textContent);
          if (compData) {
            setTimeout(function() {
              contentEl.textContent = compData[UI.currentLevel];
              contentEl.style.opacity = '1';
            }, 150);
          }
        }
      }
    });
  });
}

function findComponentByDisplayName(displayName) {
  var lower = displayName.toLowerCase();
  for (var k in COMPONENTS) {
    if (COMPONENTS[k].name.toLowerCase() === lower || lower.includes(COMPONENTS[k].name.toLowerCase().substring(0, 10))) {
      return COMPONENTS[k];
    }
  }
  return null;
}

function resetPanelDefault() {
  var panelTitle = document.getElementById('panelTitle');
  var panelBody = document.getElementById('panelBody');
  if (panelTitle) panelTitle.textContent = 'SELECT A COMPONENT';
  if (panelBody) {
    panelBody.innerHTML = [
      '<div class="default-panel">',
      '  <div class="default-icon">◈</div>',
      '  <p>Click any component on the 3D model to explore its function, science, and role in the SEM system.</p>',
      '  <div class="quick-facts">',
      '    <div class="fact-card" data-component="sem"><div class="fact-icon">⚡</div><div>SEM Core</div></div>',
      '    <div class="fact-card" data-component="neural"><div class="fact-icon">🧠</div><div>Neural Net</div></div>',
      '    <div class="fact-card" data-component="sensor"><div class="fact-icon">📡</div><div>Sensor Array</div></div>',
      '    <div class="fact-card" data-component="actuator"><div class="fact-icon">⚙️</div><div>Actuator</div></div>',
      '  </div>',
      '</div>'
    ].join('');
    setupQuickFacts();
  }
}

// ═══════════════════════════════════════════════════
//  PRESENTATION MODE
// ═══════════════════════════════════════════════════
function setupPresentation() {
  var btnNext = document.getElementById('presentNext');
  var btnPrev = document.getElementById('presentPrev');
  var btnExit = document.getElementById('presentExit');

  if (btnNext) btnNext.addEventListener('click', function() {
    UI.presentStep = Math.min(UI.presentStep + 1, PRESENTATION_STEPS.length - 1);
    updatePresentationStep();
  });

  if (btnPrev) btnPrev.addEventListener('click', function() {
    UI.presentStep = Math.max(UI.presentStep - 1, 0);
    updatePresentationStep();
  });

  if (btnExit) btnExit.addEventListener('click', function() {
    var overlay = document.getElementById('presentOverlay');
    if (overlay) overlay.classList.add('hidden');
    UI.presenting = false;
    var tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    var viewerTab = document.querySelector('[data-mode="viewer"]');
    if (viewerTab) viewerTab.classList.add('active');
  });
}

function startPresentation() {
  UI.presenting = true;
  UI.presentStep = 0;
  updatePresentationStep();
}

function updatePresentationStep() {
  var step = PRESENTATION_STEPS[UI.presentStep];
  if (!step) return;

  var numEl = document.getElementById('presentStepNum');
  var titleEl = document.getElementById('presentStepTitle');
  var descEl = document.getElementById('presentStepDesc');
  var progressEl = document.getElementById('presentProgressFill');

  if (numEl) numEl.textContent = String(UI.presentStep + 1).padStart(2, '0') + ' / ' + String(PRESENTATION_STEPS.length).padStart(2, '0');
  if (titleEl) titleEl.textContent = step.title;
  if (descEl) descEl.textContent = step.desc;

  var pct = ((UI.presentStep + 1) / PRESENTATION_STEPS.length) * 100;
  if (progressEl) progressEl.style.width = pct + '%';

  // Trigger scene change
  if (window.NX && window.loadScene && window.NX.currentScene !== step.scene) {
    var sceneBtns = document.querySelectorAll('.scene-btn');
    sceneBtns.forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-scene') === step.scene);
    });
    showSceneLoading();
    setTimeout(function() {
      loadScene(step.scene);
    }, 300);
  }

  // Animate camera
  if (window.NX) {
    window.NX.targetRotY = step.rotY || 0;
    window.NX.targetRotX = step.rotX || 0;
    window.NX.targetZoom = step.zoom || 1;
  }

  // Highlight component if specified
  if (step.highlight && window.NX) {
    setTimeout(function() {
      var parts = window.NX.robotParts || window.NX.machineParts || window.NX.systemParts;
      var part = parts[step.highlight];
      if (part) window.showComponentInfo && showComponentInfo(null, step.highlight);
    }, 600);
  }
}
