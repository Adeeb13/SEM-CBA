/* three-engine.js — NEURALX 3D Engine */
'use strict';

// ═══════════════════════════════════════════════════
//  GLOBAL STATE
// ═══════════════════════════════════════════════════
var NX = {
  scene: null, camera: null, renderer: null,
  clock: null, raycaster: null, mouse: new THREE.Vector2(),
  currentScene: 'robot',
  isDragging: false, prevMouse: { x: 0, y: 0 },
  targetRotX: 0, targetRotY: 0,
  rotX: 0, rotY: 0,
  zoom: 1, targetZoom: 1,
  autoRotate: false,
  exploded: false,
  wireframe: false,
  mode: 'viewer',
  groups: {},
  particles: [],
  clickables: [],
  frameCount: 0,
  lastFPSTime: performance.now(),
  animMixers: [],
  highlighted: null,
  robotParts: {},
  machineParts: {},
  systemParts: {}
};

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
function initThreeEngine() {
  var canvas = document.getElementById('threeCanvas');
  var wrap   = document.getElementById('canvasWrap');

  // Renderer
  NX.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  NX.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  NX.renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  NX.renderer.shadowMap.enabled = true;
  NX.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  NX.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  NX.renderer.toneMappingExposure = 1.2;

  // Scene
  NX.scene = new THREE.Scene();
  NX.scene.background = new THREE.Color(0x000408);
  NX.scene.fog = new THREE.FogExp2(0x000408, 0.02);

  // Camera
  NX.camera = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, 0.1, 500);
  NX.camera.position.set(0, 1, 8);

  // Clock & Raycaster
  NX.clock = new THREE.Clock();
  NX.raycaster = new THREE.Raycaster();

  // Lighting
  setupLighting();

  // Background particles
  createBackgroundStars();

  // Load initial scene
  loadScene('robot');

  // Events
  setupEvents(canvas, wrap);

  // Start render loop
  renderLoop();
}

// ═══════════════════════════════════════════════════
//  LIGHTING
// ═══════════════════════════════════════════════════
function setupLighting() {
  // Ambient
  var ambient = new THREE.AmbientLight(0x0a0020, 0.8);
  NX.scene.add(ambient);

  // Key light (purple)
  var keyLight = new THREE.DirectionalLight(0x9933ff, 2.5);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  NX.scene.add(keyLight);

  // Fill light (cyan)
  var fillLight = new THREE.DirectionalLight(0x00ccff, 1.2);
  fillLight.position.set(-5, 3, -3);
  NX.scene.add(fillLight);

  // Rim light
  var rimLight = new THREE.DirectionalLight(0x6600ff, 1.5);
  rimLight.position.set(0, -3, -6);
  NX.scene.add(rimLight);

  // Point light (core glow)
  NX.coreLight = new THREE.PointLight(0xaa44ff, 2, 8);
  NX.coreLight.position.set(0, 0, 0);
  NX.scene.add(NX.coreLight);
}

// ═══════════════════════════════════════════════════
//  BACKGROUND STARS
// ═══════════════════════════════════════════════════
function createBackgroundStars() {
  var geom = new THREE.BufferGeometry();
  var count = 1500;
  var positions = new Float32Array(count * 3);
  for (var i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 200;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.6 });
  var stars = new THREE.Points(geom, mat);
  NX.scene.add(stars);
  NX.stars = stars;
}

// ═══════════════════════════════════════════════════
//  SCENE LOADER
// ═══════════════════════════════════════════════════
function loadScene(sceneName) {
  // Remove old group
  if (NX.groups.main) {
    NX.scene.remove(NX.groups.main);
  }
  NX.clickables = [];
  NX.groups.main = new THREE.Group();
  NX.scene.add(NX.groups.main);
  NX.currentScene = sceneName;
  NX.exploded = false;
  NX.rotX = 0; NX.rotY = 0;
  NX.targetRotX = 0; NX.targetRotY = 0;

  if (sceneName === 'robot')   buildRobotScene();
  if (sceneName === 'machine') buildMachineScene();
  if (sceneName === 'system')  buildSystemScene();

  updateSceneTitle(sceneName);
}

// ═══════════════════════════════════════════════════
//  ROBOT SCENE — AXIOM-7 Purple Humanoid
// ═══════════════════════════════════════════════════
function buildRobotScene() {
  var g = NX.groups.main;
  NX.robotParts = {};

  var mats = {
    body:   makeMat(0x3d0080, 0.8, 0.2, 0xaa44ff, 1.0),
    joint:  makeMat(0x220044, 0.9, 0.1, 0x6600cc, 0.8),
    core:   makeMat(0xcc44ff, 0.1, 0.9, 0xdd77ff, 1.5, true),
    visor:  makeMat(0x001133, 0.05, 0.95, 0x00e5ff, 1.0, true),
    armor:  makeMat(0x5500aa, 0.7, 0.3, 0xbb55ff, 0.9),
    detail: makeMat(0x110022, 0.9, 0.1, 0x8844cc, 0.6),
    dark:   makeMat(0x0a0015, 1.0, 0.0),
    wire:   makeMat(0x00ffcc, 0.1, 0.9, 0x00ffcc, 1.2, true)
  };

  // ── TORSO ──
  var torsoGeo = new THREE.BoxGeometry(1.6, 1.8, 0.9, 2, 2);
  var torso = new THREE.Mesh(torsoGeo, mats.body);
  torso.position.set(0, 0.5, 0);
  torso.castShadow = true;
  torso.userData = { name: 'Torso Core', component: 'torso' };
  g.add(torso);
  NX.robotParts.torso = torso;
  NX.clickables.push(torso);

  // Torso detail plates
  addDetailPlate(g, mats.armor, [-0.4, 0.7, 0.46], [0.5, 0.4, 0.05], 'Chest Plate L');
  addDetailPlate(g, mats.armor, [0.4, 0.7, 0.46], [0.5, 0.4, 0.05], 'Chest Plate R');

  // ── ENERGY CORE ──
  var coreGeo = new THREE.OctahedronGeometry(0.28, 2);
  var core = new THREE.Mesh(coreGeo, mats.core);
  core.position.set(0, 0.6, 0.5);
  core.userData = { name: 'AI Energy Core', component: 'core' };
  g.add(core);
  NX.robotParts.core = core;
  NX.clickables.push(core);

  // Core orbit ring
  var ringGeo = new THREE.TorusGeometry(0.4, 0.02, 8, 32);
  var ring1 = new THREE.Mesh(ringGeo, mats.wire);
  ring1.position.copy(core.position);
  ring1.rotation.x = Math.PI / 2;
  g.add(ring1);
  NX.robotParts.ring1 = ring1;

  var ring2 = ring1.clone();
  ring2.rotation.set(0.5, 0, 0);
  g.add(ring2);
  NX.robotParts.ring2 = ring2;

  // ── HEAD ──
  var headGeo = new THREE.BoxGeometry(0.9, 0.85, 0.85, 2, 2);
  var head = new THREE.Mesh(headGeo, mats.body);
  head.position.set(0, 1.75, 0);
  head.castShadow = true;
  head.userData = { name: 'Neural Processor Head', component: 'head' };
  g.add(head);
  NX.robotParts.head = head;
  NX.clickables.push(head);

  // Visor
  var visorGeo = new THREE.BoxGeometry(0.7, 0.2, 0.1);
  var visor = new THREE.Mesh(visorGeo, mats.visor);
  visor.position.set(0, 1.78, 0.46);
  visor.userData = { name: 'Optical Sensor Visor', component: 'visor' };
  g.add(visor);
  NX.robotParts.visor = visor;
  NX.clickables.push(visor);

  // Head antenna
  var antGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8);
  var ant = new THREE.Mesh(antGeo, mats.wire);
  ant.position.set(0.28, 2.22, 0);
  g.add(ant);
  var antTipGeo = new THREE.SphereGeometry(0.04, 8, 8);
  var antTip = new THREE.Mesh(antTipGeo, mats.core);
  antTip.position.set(0.28, 2.42, 0);
  g.add(antTip);
  NX.robotParts.antTip = antTip;

  // Neck
  var neckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.25, 12);
  var neck = new THREE.Mesh(neckGeo, mats.joint);
  neck.position.set(0, 1.31, 0);
  g.add(neck);

  // ── SHOULDER JOINTS ──
  for (var side = -1; side <= 1; side += 2) {
    var sX = side * 1.0;

    // Shoulder ball
    var shoulderGeo = new THREE.SphereGeometry(0.22, 16, 16);
    var shoulder = new THREE.Mesh(shoulderGeo, mats.joint);
    shoulder.position.set(sX, 0.95, 0);
    shoulder.userData = { name: (side < 0 ? 'Left' : 'Right') + ' Shoulder Joint', component: 'shoulder' };
    g.add(shoulder);
    NX.clickables.push(shoulder);

    // Upper arm
    var uarmGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.8, 12);
    var uarm = new THREE.Mesh(uarmGeo, mats.armor);
    uarm.position.set(sX, 0.48, 0);
    uarm.rotation.z = side * 0.15;
    uarm.userData = { name: (side < 0 ? 'Left' : 'Right') + ' Upper Arm', component: 'upperArm' };
    g.add(uarm);
    NX.clickables.push(uarm);

    // Elbow joint
    var elbowGeo = new THREE.SphereGeometry(0.14, 12, 12);
    var elbow = new THREE.Mesh(elbowGeo, mats.joint);
    elbow.position.set(sX + side * 0.05, 0.05, 0);
    elbow.userData = { name: (side < 0 ? 'Left' : 'Right') + ' Elbow Joint', component: 'elbow' };
    g.add(elbow);
    NX.clickables.push(elbow);

    // Forearm
    var farmGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.75, 12);
    var farm = new THREE.Mesh(farmGeo, mats.body);
    farm.position.set(sX + side * 0.08, -0.4, 0);
    farm.rotation.z = side * 0.2;
    g.add(farm);

    // Hand
    var handGeo = new THREE.BoxGeometry(0.18, 0.22, 0.12);
    var hand = new THREE.Mesh(handGeo, mats.armor);
    hand.position.set(sX + side * 0.12, -0.83, 0);
    hand.userData = { name: (side < 0 ? 'Left' : 'Right') + ' Manipulator', component: 'hand' };
    g.add(hand);
    NX.clickables.push(hand);

    // Side chest detail
    addDetailStripe(g, mats.wire, [sX * 0.82, 0.65, 0.44], [0.04, 0.25, 0.02], null);
  }

  // ── PELVIS ──
  var pelvisGeo = new THREE.BoxGeometry(1.3, 0.4, 0.75);
  var pelvis = new THREE.Mesh(pelvisGeo, mats.detail);
  pelvis.position.set(0, -0.72, 0);
  pelvis.userData = { name: 'Actuator Pelvis', component: 'pelvis' };
  g.add(pelvis);
  NX.robotParts.pelvis = pelvis;
  NX.clickables.push(pelvis);

  // ── LEGS ──
  for (var lside = -1; lside <= 1; lside += 2) {
    var lX = lside * 0.42;

    // Hip joint
    var hipGeo = new THREE.SphereGeometry(0.18, 12, 12);
    var hip = new THREE.Mesh(hipGeo, mats.joint);
    hip.position.set(lX, -0.95, 0);
    hip.userData = { name: (lside < 0 ? 'Left' : 'Right') + ' Hip Actuator', component: 'hip' };
    g.add(hip);
    NX.clickables.push(hip);

    // Thigh
    var thighGeo = new THREE.CylinderGeometry(0.17, 0.14, 0.9, 12);
    var thigh = new THREE.Mesh(thighGeo, mats.armor);
    thigh.position.set(lX, -1.45, 0);
    g.add(thigh);

    // Knee
    var kneeGeo = new THREE.SphereGeometry(0.15, 12, 12);
    var knee = new THREE.Mesh(kneeGeo, mats.joint);
    knee.position.set(lX, -1.95, 0);
    knee.userData = { name: (lside < 0 ? 'Left' : 'Right') + ' Knee Joint', component: 'knee' };
    g.add(knee);
    NX.clickables.push(knee);

    // Shin
    var shinGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.85, 12);
    var shin = new THREE.Mesh(shinGeo, mats.body);
    shin.position.set(lX, -2.45, 0);
    g.add(shin);

    // Foot
    var footGeo = new THREE.BoxGeometry(0.22, 0.14, 0.38);
    var foot = new THREE.Mesh(footGeo, mats.armor);
    foot.position.set(lX, -2.93, 0.06);
    foot.userData = { name: (lside < 0 ? 'Left' : 'Right') + ' Locomotion Foot', component: 'foot' };
    g.add(foot);
    NX.clickables.push(foot);
  }

  // ── SPINE ──
  for (var sp = 0; sp < 4; sp++) {
    var spGeo = new THREE.SphereGeometry(0.07, 8, 8);
    var spMesh = new THREE.Mesh(spGeo, mats.joint);
    spMesh.position.set(0, 0.2 - sp * 0.3, -0.4);
    g.add(spMesh);
  }

  // ── PARTICLE EMITTERS (floating around robot) ──
  createRobotAura(g);

  // Position
  g.position.set(0, 0.8, 0);
}

function addDetailPlate(group, mat, pos, size, name) {
  var geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (name) mesh.userData = { name: name, component: 'armor' };
  group.add(mesh);
  if (name) NX.clickables.push(mesh);
  return mesh;
}

function addDetailStripe(group, mat, pos, size) {
  var geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  group.add(mesh);
  return mesh;
}

function createRobotAura(group) {
  // Floating energy orbs around robot
  for (var i = 0; i < 8; i++) {
    var angle = (i / 8) * Math.PI * 2;
    var orbGeo = new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 8, 8);
    var orbMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xaa44ff : 0x00e5ff,
      transparent: true, opacity: 0.8
    });
    var orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(
      Math.cos(angle) * 1.5,
      Math.sin(angle * 0.7) * 0.5,
      Math.sin(angle) * 1.5
    );
    orb.userData = { isAura: true, angle: angle, speed: 0.3 + Math.random() * 0.5, radius: 1.5 + Math.random() * 0.5, yOff: orb.position.y };
    group.add(orb);
    NX.robotParts['aura' + i] = orb;
  }
}

// ═══════════════════════════════════════════════════
//  MACHINE SCENE — SEM CORE
// ═══════════════════════════════════════════════════
function buildMachineScene() {
  var g = NX.groups.main;
  NX.machineParts = {};

  var mats = {
    casing:  makeMat(0x111122, 0.8, 0.2, 0x5533aa, 0.7),
    metal:   makeMat(0x223344, 0.7, 0.3, 0x4488cc, 0.6),
    glowing: makeMat(0x0022ff, 0.1, 0.9, 0x0099ff, 2.0, true),
    purple:  makeMat(0x330066, 0.5, 0.5, 0xaa33ff, 1.5),
    beam:    makeMat(0xffffff, 0.0, 1.0, 0xffffff, 3.0, true),
    sensor:  makeMat(0x004400, 0.3, 0.7, 0x00ff88, 1.2, true),
    coil:    makeMat(0x442200, 0.6, 0.4, 0xff8800, 0.8),
    screen:  makeMat(0x001133, 0.05, 0.95, 0x00ccff, 1.0, true)
  };

  // ── MAIN CHAMBER ──
  var chamberGeo = new THREE.CylinderGeometry(1.5, 1.7, 2.2, 16, 4);
  var chamber = new THREE.Mesh(chamberGeo, mats.casing);
  chamber.position.set(0, 0, 0);
  chamber.castShadow = true;
  chamber.userData = { name: 'SEM Vacuum Chamber', component: 'chamber' };
  g.add(chamber);
  NX.machineParts.chamber = chamber;
  NX.clickables.push(chamber);

  // Chamber bands
  for (var b = -1; b <= 1; b++) {
    var bandGeo = new THREE.TorusGeometry(1.7, 0.04, 8, 32);
    var band = new THREE.Mesh(bandGeo, mats.purple);
    band.position.y = b * 0.7;
    band.rotation.x = Math.PI / 2;
    g.add(band);
  }

  // ── ELECTRON GUN (top) ──
  var gunBaseGeo = new THREE.CylinderGeometry(0.5, 0.3, 0.8, 12);
  var gunBase = new THREE.Mesh(gunBaseGeo, mats.metal);
  gunBase.position.set(0, 1.9, 0);
  gunBase.userData = { name: 'Electron Gun Assembly', component: 'electronGun' };
  g.add(gunBase);
  NX.machineParts.electronGun = gunBase;
  NX.clickables.push(gunBase);

  var gunTipGeo = new THREE.CylinderGeometry(0.12, 0.5, 0.5, 12);
  var gunTip = new THREE.Mesh(gunTipGeo, mats.casing);
  gunTip.position.set(0, 2.5, 0);
  g.add(gunTip);

  // Electron emitter
  var emitterGeo = new THREE.SphereGeometry(0.1, 12, 12);
  var emitter = new THREE.Mesh(emitterGeo, mats.glowing);
  emitter.position.set(0, 2.78, 0);
  emitter.userData = { name: 'Field Emission Cathode', component: 'cathode' };
  g.add(emitter);
  NX.machineParts.emitter = emitter;
  NX.clickables.push(emitter);

  // ── ELECTRON BEAM (animated) ──
  var beamGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.5, 8);
  var beam = new THREE.Mesh(beamGeo, mats.beam);
  beam.position.set(0, 0.2, 0);
  beam.userData = { name: 'Primary Electron Beam', component: 'beam' };
  g.add(beam);
  NX.machineParts.beam = beam;
  NX.clickables.push(beam);

  // ── CONDENSER LENSES ──
  for (var l = 0; l < 3; l++) {
    var lensGeo = new THREE.TorusGeometry(0.45 - l * 0.05, 0.08, 8, 24);
    var lens = new THREE.Mesh(lensGeo, mats.coil);
    lens.position.set(0, 1.4 - l * 0.55, 0);
    lens.rotation.x = Math.PI / 2;
    lens.userData = { name: 'Electromagnetic Condenser Lens ' + (l + 1), component: 'lens' };
    g.add(lens);
    NX.clickables.push(lens);
    NX.machineParts['lens' + l] = lens;
  }

  // ── DETECTOR ──
  var detGeo = new THREE.BoxGeometry(0.5, 0.3, 0.5);
  var det = new THREE.Mesh(detGeo, mats.sensor);
  det.position.set(1.4, -0.5, 0.5);
  det.userData = { name: 'Secondary Electron Detector', component: 'detector' };
  g.add(det);
  NX.machineParts.detector = det;
  NX.clickables.push(det);

  // Detector wire
  var pts = [
    new THREE.Vector3(0, -0.5, 0.5),
    new THREE.Vector3(0.7, -0.3, 0.5),
    new THREE.Vector3(1.4, -0.5, 0.5)
  ];
  var curve = new THREE.CatmullRomCurve3(pts);
  var wireGeo = new THREE.TubeGeometry(curve, 12, 0.02, 8, false);
  var wire = new THREE.Mesh(wireGeo, mats.sensor);
  g.add(wire);

  // ── SAMPLE STAGE ──
  var stageGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.12, 16);
  var stage = new THREE.Mesh(stageGeo, mats.metal);
  stage.position.set(0, -0.95, 0);
  stage.userData = { name: 'Motorized Sample Stage', component: 'stage' };
  g.add(stage);
  NX.machineParts.stage = stage;
  NX.clickables.push(stage);

  // Sample
  var sampleGeo = new THREE.BoxGeometry(0.3, 0.05, 0.3);
  var sample = new THREE.Mesh(sampleGeo, mats.purple);
  sample.position.set(0, -0.85, 0);
  sample.userData = { name: 'Specimen Sample', component: 'sample' };
  g.add(sample);
  NX.machineParts.sample = sample;
  NX.clickables.push(sample);

  // ── VACUUM PUMP ──
  var pumpGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 10);
  var pump = new THREE.Mesh(pumpGeo, mats.metal);
  pump.position.set(-1.9, -0.8, 0);
  pump.rotation.z = Math.PI / 2;
  pump.userData = { name: 'Turbomolecular Vacuum Pump', component: 'vacuumPump' };
  g.add(pump);
  NX.machineParts.vacuumPump = pump;
  NX.clickables.push(pump);

  // Pump pipe
  var pipePts = [
    new THREE.Vector3(-1.7, -0.8, 0),
    new THREE.Vector3(-1.5, -0.5, 0),
    new THREE.Vector3(-1.5, -0.1, 0)
  ];
  var pipeCurve = new THREE.CatmullRomCurve3(pipePts);
  var pipeGeo = new THREE.TubeGeometry(pipeCurve, 10, 0.06, 8, false);
  var pipe = new THREE.Mesh(pipeGeo, mats.casing);
  g.add(pipe);

  // ── CONTROL DISPLAY ──
  var dispGeo = new THREE.BoxGeometry(0.6, 0.4, 0.06);
  var disp = new THREE.Mesh(dispGeo, mats.screen);
  disp.position.set(1.9, 0.5, 0);
  disp.rotation.y = -Math.PI / 4;
  disp.userData = { name: 'SEM Control Interface', component: 'controlPanel' };
  g.add(disp);
  NX.machineParts.controlPanel = disp;
  NX.clickables.push(disp);

  // Create beam particles
  createBeamParticles(g);

  g.position.set(0, 0.5, 0);
}

function createBeamParticles(group) {
  NX.beamParticles = [];
  for (var i = 0; i < 20; i++) {
    var pGeo = new THREE.SphereGeometry(0.02, 6, 6);
    var pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    var p = new THREE.Mesh(pGeo, pMat);
    p.userData = { progress: i / 20, speed: 0.5 + Math.random() * 0.5 };
    p.position.set(0, 2.5 - (i / 20) * 3.5, 0);
    group.add(p);
    NX.beamParticles.push(p);
  }
}

// ═══════════════════════════════════════════════════
//  NEURAL SYSTEM SCENE
// ═══════════════════════════════════════════════════
function buildSystemScene() {
  var g = NX.groups.main;
  NX.systemParts = {};

  var nodeMat = makeMat(0x440088, 0.3, 0.7, 0xaa44ff, 1.5);
  var connMat = makeMat(0x220044, 0.5, 0.5, 0x6633cc, 0.8);
  var activeMat = makeMat(0x002244, 0.1, 0.9, 0x00ccff, 2.0, true);
  var inputMat = makeMat(0x004422, 0.2, 0.8, 0x00ff88, 1.5, true);
  var outputMat = makeMat(0x442200, 0.2, 0.8, 0xff8844, 1.5, true);

  // Central AI core
  var coreGeo = new THREE.IcosahedronGeometry(0.6, 2);
  var coreNode = new THREE.Mesh(coreGeo, makeMat(0x6600cc, 0.1, 0.9, 0xcc44ff, 2.5, true));
  coreNode.position.set(0, 0, 0);
  coreNode.userData = { name: 'Central AI Cognitive Core', component: 'aiCore' };
  g.add(coreNode);
  NX.systemParts.aiCore = coreNode;
  NX.clickables.push(coreNode);

  // Neural layers
  var layers = [
    { name: 'Input Layer', y: 0, r: 2.5, count: 6, mat: inputMat, comp: 'inputLayer' },
    { name: 'Hidden Layer 1', y: 0, r: 1.5, count: 5, mat: nodeMat, comp: 'hiddenL1' },
    { name: 'Hidden Layer 2', y: 0, r: 1.5, count: 4, mat: connMat, comp: 'hiddenL2' },
    { name: 'Output Layer', y: 0, r: 2.0, count: 3, mat: outputMat, comp: 'outputLayer' }
  ];

  var layerXOffsets = [-3, -1.2, 1.2, 3];
  var allNodes = [];

  for (var li = 0; li < layers.length; li++) {
    var ldata = layers[li];
    var lnodes = [];
    for (var ni = 0; ni < ldata.count; ni++) {
      var angle = (ni / ldata.count) * Math.PI * 2;
      var nodeGeo = new THREE.SphereGeometry(0.2, 12, 12);
      var node = new THREE.Mesh(nodeGeo, ldata.mat);
      var rr = ldata.r * 0.55;
      node.position.set(
        layerXOffsets[li],
        Math.sin(angle) * rr,
        Math.cos(angle) * rr
      );
      node.userData = { name: ldata.name + ' Node ' + (ni + 1), component: ldata.comp };
      g.add(node);
      NX.clickables.push(node);
      lnodes.push(node);
    }
    allNodes.push(lnodes);
  }

  // Connections between layers
  for (var cl = 0; cl < allNodes.length - 1; cl++) {
    var fromLayer = allNodes[cl];
    var toLayer = allNodes[cl + 1];
    for (var fi = 0; fi < fromLayer.length; fi++) {
      for (var ti = 0; ti < toLayer.length; ti++) {
        if (Math.random() > 0.4) {
          drawConnection(g, fromLayer[fi].position, toLayer[ti].position, connMat);
        }
      }
    }
  }

  // Connect outer nodes to core
  var outerRing = allNodes[1].concat(allNodes[2]);
  for (var oi = 0; oi < outerRing.length; oi++) {
    drawConnection(g, new THREE.Vector3(0,0,0), outerRing[oi].position, connMat);
  }

  // SEM Labels
  var labels = [
    { name: 'SEM Feedback Module', pos: [0, 2, 0], comp: 'semFeedback' },
    { name: 'Adaptive Efficiency Engine', pos: [0, -2, 0], comp: 'adaptiveEngine' },
    { name: 'Physics Simulation Core', pos: [0, 0, 2.2], comp: 'physicsCore' }
  ];
  for (var lbi = 0; lbi < labels.length; lbi++) {
    var lb = labels[lbi];
    var lbGeo = new THREE.OctahedronGeometry(0.25, 1);
    var lbMesh = new THREE.Mesh(lbGeo, activeMat);
    lbMesh.position.set(lb.pos[0], lb.pos[1], lb.pos[2]);
    lbMesh.userData = { name: lb.name, component: lb.comp };
    g.add(lbMesh);
    NX.systemParts[lb.comp] = lbMesh;
    NX.clickables.push(lbMesh);
  }

  // Signal particles
  NX.signalParticles = [];
  for (var si = 0; si < 30; si++) {
    var sGeo = new THREE.SphereGeometry(0.04, 6, 6);
    var sMat = new THREE.MeshBasicMaterial({
      color: si % 3 === 0 ? 0xaa44ff : (si % 3 === 1 ? 0x00ffcc : 0x4488ff),
      transparent: true, opacity: 0.9
    });
    var sp = new THREE.Mesh(sGeo, sMat);
    sp.userData = {
      t: Math.random(),
      speed: 0.2 + Math.random() * 0.4,
      pathIdx: Math.floor(Math.random() * 3)
    };
    g.add(sp);
    NX.signalParticles.push(sp);
  }

  g.position.set(0, 0, 0);
  NX.camera.position.set(0, 0, 10);
}

function drawConnection(group, from, to, mat) {
  var pts = [from.clone(), to.clone()];
  var geo = new THREE.BufferGeometry().setFromPoints(pts);
  var lineMat = new THREE.LineBasicMaterial({ color: 0x440088, transparent: true, opacity: 0.3 });
  var line = new THREE.Line(geo, lineMat);
  group.add(line);
  return line;
}

// ═══════════════════════════════════════════════════
//  MATERIAL HELPER
// ═══════════════════════════════════════════════════
function makeMat(color, roughness, metalness, emissive, emissiveIntensity, isEmissive) {
  var opts = {
    color: color,
    roughness: roughness !== undefined ? roughness : 0.5,
    metalness: metalness !== undefined ? metalness : 0.5
  };
  if (emissive !== undefined) {
    opts.emissive = emissive;
    opts.emissiveIntensity = emissiveIntensity || 0.5;
  }
  if (isEmissive) {
    opts.transparent = true;
    opts.opacity = 0.92;
  }
  return new THREE.MeshStandardMaterial(opts);
}

// ═══════════════════════════════════════════════════
//  EXPLODED VIEW
// ═══════════════════════════════════════════════════
function toggleExplode() {
  NX.exploded = !NX.exploded;
  var scale = NX.exploded ? 1.8 : 1.0;

  if (!NX.groups.main) return;
  var children = NX.groups.main.children;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (!child.userData || child.userData.isAura) continue;
    var orig = child.userData.origPos || child.position.clone();
    if (!child.userData.origPos) child.userData.origPos = orig.clone();

    var target = NX.exploded
      ? new THREE.Vector3(orig.x * scale, orig.y * scale, orig.z * scale)
      : orig.clone();

    animatePosition(child, target, 0.8);
  }
}

function animatePosition(mesh, target, duration) {
  var start = mesh.position.clone();
  var startTime = performance.now();
  var ms = duration * 1000;

  function step() {
    var t = Math.min((performance.now() - startTime) / ms, 1);
    var ease = 1 - Math.pow(1 - t, 3);
    mesh.position.lerpVectors(start, target, ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ═══════════════════════════════════════════════════
//  WIREFRAME TOGGLE
// ═══════════════════════════════════════════════════
function toggleWireframe() {
  NX.wireframe = !NX.wireframe;
  if (!NX.groups.main) return;
  NX.groups.main.traverse(function(obj) {
    if (obj.isMesh && obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(function(m) { m.wireframe = NX.wireframe; });
      } else {
        obj.material.wireframe = NX.wireframe;
      }
    }
  });
}

// ═══════════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════════
function setupEvents(canvas, wrap) {
  // Mouse down
  canvas.addEventListener('mousedown', function(e) {
    NX.isDragging = true;
    NX.prevMouse.x = e.clientX;
    NX.prevMouse.y = e.clientY;
  });

  // Mouse move
  window.addEventListener('mousemove', function(e) {
    // Update mouse for raycaster
    var rect = canvas.getBoundingClientRect();
    NX.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    NX.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (NX.isDragging) {
      var dx = e.clientX - NX.prevMouse.x;
      var dy = e.clientY - NX.prevMouse.y;
      NX.targetRotY += dx * 0.008;
      NX.targetRotX += dy * 0.008;
      NX.targetRotX = Math.max(-1.2, Math.min(1.2, NX.targetRotX));
      NX.prevMouse.x = e.clientX;
      NX.prevMouse.y = e.clientY;
    }
  });

  window.addEventListener('mouseup', function() { NX.isDragging = false; });

  // Scroll zoom
  canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    NX.targetZoom += e.deltaY * 0.002;
    NX.targetZoom = Math.max(0.3, Math.min(3.0, NX.targetZoom));
  }, { passive: false });

  // Click
  canvas.addEventListener('click', function(e) {
    if (Math.abs(e.clientX - NX.prevMouse.x) > 3) return;
    handleClick();
  });

  // Touch support
  var lastTouch = null;
  canvas.addEventListener('touchstart', function(e) {
    NX.isDragging = true;
    lastTouch = e.touches[0];
  });
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!lastTouch) return;
    var t = e.touches[0];
    var dx = t.clientX - lastTouch.clientX;
    var dy = t.clientY - lastTouch.clientY;
    NX.targetRotY += dx * 0.01;
    NX.targetRotX += dy * 0.01;
    NX.targetRotX = Math.max(-1.2, Math.min(1.2, NX.targetRotX));
    lastTouch = t;
  }, { passive: false });
  canvas.addEventListener('touchend', function() { NX.isDragging = false; lastTouch = null; });

  // Resize
  window.addEventListener('resize', function() {
    var w = wrap.clientWidth;
    var h = wrap.clientHeight;
    NX.camera.aspect = w / h;
    NX.camera.updateProjectionMatrix();
    NX.renderer.setSize(w, h);
  });
}

// ═══════════════════════════════════════════════════
//  CLICK HANDLING
// ═══════════════════════════════════════════════════
function handleClick() {
  NX.raycaster.setFromCamera(NX.mouse, NX.camera);
  var intersects = NX.raycaster.intersectObjects(NX.clickables);

  if (intersects.length > 0) {
    var obj = intersects[0].object;
    if (obj.userData && obj.userData.name) {
      highlightObject(obj);
      if (window.showComponentInfo) {
        window.showComponentInfo(obj.userData.name, obj.userData.component);
      }
    }
  }
}

function highlightObject(obj) {
  // Reset previous
  if (NX.highlighted && NX.highlighted !== obj) {
    NX.highlighted.material.emissiveIntensity = NX.highlighted.userData.origEmissive || 0.5;
  }
  NX.highlighted = obj;
  NX.highlighted.userData.origEmissive = obj.material.emissiveIntensity || 0.5;
  // Flash
  obj.material.emissiveIntensity = 3.0;
  setTimeout(function() {
    if (obj.material) obj.material.emissiveIntensity = 2.0;
  }, 200);
}

// ═══════════════════════════════════════════════════
//  HOVER DETECTION
// ═══════════════════════════════════════════════════
function updateHover() {
  NX.raycaster.setFromCamera(NX.mouse, NX.camera);
  var intersects = NX.raycaster.intersectObjects(NX.clickables);

  var label = document.getElementById('hoverLabel');
  if (!label) return;

  if (intersects.length > 0 && intersects[0].object.userData.name) {
    var obj = intersects[0].object;
    var point = intersects[0].point.clone().project(NX.camera);
    var canvas = NX.renderer.domElement;
    var rect = canvas.getBoundingClientRect();
    var px = (point.x * 0.5 + 0.5) * rect.width;
    var py = (-point.y * 0.5 + 0.5) * rect.height;
    label.style.left = (px + 15) + 'px';
    label.style.top = (py - 30) + 'px';
    label.textContent = obj.userData.name;
    label.classList.add('visible');
    document.body.style.cursor = 'pointer';
  } else {
    label.classList.remove('visible');
    document.body.style.cursor = '';
  }
}

// ═══════════════════════════════════════════════════
//  RENDER LOOP
// ═══════════════════════════════════════════════════
function renderLoop() {
  requestAnimationFrame(renderLoop);

  var delta = NX.clock.getDelta();
  var time = NX.clock.getElapsedTime();

  // Smooth rotation
  NX.rotX += (NX.targetRotX - NX.rotX) * 0.08;
  NX.rotY += (NX.targetRotY - NX.rotY) * 0.08;
  NX.zoom += (NX.targetZoom - NX.zoom) * 0.06;

  if (NX.groups.main) {
    NX.groups.main.rotation.x = NX.rotX;
    NX.groups.main.rotation.y = NX.rotY + (NX.autoRotate ? time * 0.3 : 0);
  }

  // Camera zoom
  NX.camera.position.z = 8 * NX.zoom;

  // Core light pulse
  if (NX.coreLight) {
    NX.coreLight.intensity = 1.5 + Math.sin(time * 2) * 0.5;
  }

  // Scene-specific animations
  if (NX.currentScene === 'robot') animateRobot(time);
  if (NX.currentScene === 'machine') animateMachine(time);
  if (NX.currentScene === 'system') animateSystem(time);

  // Stars slow rotation
  if (NX.stars) NX.stars.rotation.y = time * 0.005;

  // Hover
  updateHover();

  // FPS counter
  NX.frameCount++;
  if (time * 1000 - NX.lastFPSTime > 500) {
    var fps = Math.round(NX.frameCount / ((time * 1000 - NX.lastFPSTime) / 1000));
    var fpsEl = document.getElementById('fpsVal');
    if (fpsEl) fpsEl.textContent = fps;
    NX.frameCount = 0;
    NX.lastFPSTime = time * 1000;
  }

  NX.renderer.render(NX.scene, NX.camera);
}

// ─── Robot Animations ───
function animateRobot(time) {
  var p = NX.robotParts;

  // Core pulsate
  if (p.core) {
    p.core.rotation.y = time * 1.5;
    p.core.rotation.x = time * 0.8;
    var s = 1 + Math.sin(time * 3) * 0.08;
    p.core.scale.set(s, s, s);
  }

  // Ring orbits
  if (p.ring1) { p.ring1.rotation.z = time * 1.2; }
  if (p.ring2) { p.ring2.rotation.x = time * 0.9; p.ring2.rotation.y = time * 0.6; }

  // Antenna tip blink
  if (p.antTip) {
    p.antTip.material.emissiveIntensity = 0.5 + Math.abs(Math.sin(time * 4)) * 2;
  }

  // Head slight bob
  if (p.head) {
    p.head.position.y = 1.75 + Math.sin(time * 0.8) * 0.015;
    p.head.rotation.y = Math.sin(time * 0.4) * 0.06;
  }

  // Aura orbits
  for (var k in p) {
    var part = p[k];
    if (part && part.userData && part.userData.isAura) {
      var d = part.userData;
      d.angle += d.speed * 0.012;
      part.position.x = Math.cos(d.angle) * d.radius;
      part.position.z = Math.sin(d.angle) * d.radius;
      part.position.y = d.yOff + Math.sin(time * 0.8 + d.angle) * 0.3;
      var blink = 0.4 + Math.abs(Math.sin(time * 2 + d.angle)) * 0.6;
      if (part.material) part.material.opacity = blink;
    }
  }
}

// ─── Machine Animations ───
function animateMachine(time) {
  var mp = NX.machineParts;

  // Emitter pulse
  if (mp.emitter) {
    mp.emitter.material.emissiveIntensity = 1.5 + Math.sin(time * 4) * 0.5;
    var es = 1 + Math.sin(time * 5) * 0.1;
    mp.emitter.scale.set(es, es, es);
  }

  // Lens rotation
  for (var li = 0; li < 3; li++) {
    var lens = mp['lens' + li];
    if (lens) lens.rotation.z = time * (0.5 + li * 0.3);
  }

  // Stage slow rotation
  if (mp.stage) mp.stage.rotation.y = time * 0.2;

  // Sample glow
  if (mp.sample) {
    mp.sample.material.emissiveIntensity = 0.5 + Math.abs(Math.sin(time * 2)) * 1.0;
  }

  // Beam particles animation
  if (NX.beamParticles) {
    for (var bi = 0; bi < NX.beamParticles.length; bi++) {
      var bp = NX.beamParticles[bi];
      bp.userData.progress = (bp.userData.progress + bp.userData.speed * 0.008) % 1;
      bp.position.y = 2.5 - bp.userData.progress * 3.5;
      bp.material.opacity = 0.5 + Math.sin(bp.userData.progress * Math.PI) * 0.5;
    }
  }
}

// ─── System Animations ───
function animateSystem(time) {
  if (NX.systemParts.aiCore) {
    NX.systemParts.aiCore.rotation.y = time * 0.6;
    NX.systemParts.aiCore.rotation.x = Math.sin(time * 0.4) * 0.3;
    var cs = 1 + Math.sin(time * 2) * 0.06;
    NX.systemParts.aiCore.scale.set(cs, cs, cs);
  }

  // Animate module floats
  var mods = ['semFeedback', 'adaptiveEngine', 'physicsCore'];
  for (var mi = 0; mi < mods.length; mi++) {
    var mod = NX.systemParts[mods[mi]];
    if (mod) {
      mod.rotation.y = time * (0.4 + mi * 0.2);
      mod.position.y = (mod.userData.origY || mod.position.y) + Math.sin(time * 0.6 + mi) * 0.1;
      if (!mod.userData.origY) mod.userData.origY = mod.position.y;
    }
  }

  // Signal particle paths
  if (NX.signalParticles) {
    for (var si = 0; si < NX.signalParticles.length; si++) {
      var sp = NX.signalParticles[si];
      var t2 = (sp.userData.t + sp.userData.speed * 0.007) % 1;
      sp.userData.t = t2;
      var angle = t2 * Math.PI * 2;
      var idx = sp.userData.pathIdx;
      var radii = [2.5, 1.5, 2.0];
      var r = radii[idx];
      sp.position.x = Math.cos(angle + idx * 2.1) * r;
      sp.position.y = Math.sin(angle * 1.3 + idx) * r * 0.5;
      sp.position.z = Math.sin(angle + idx * 1.5) * r;
    }
  }
}

// ═══════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════
function updateSceneTitle(scene) {
  var titles = { robot: 'AXIOM-7 — Futuristic AI Robot', machine: 'SEM CORE — Scanning Electron Microscope', system: 'NEURAL NETWORK — AI Cognitive System' };
  var el = document.getElementById('sceneTitle');
  if (el) el.textContent = titles[scene] || scene;
}

function resetView() {
  NX.targetRotX = 0; NX.targetRotY = 0; NX.targetZoom = 1;
  NX.exploded = false;
  NX.wireframe = false;
  if (NX.groups.main) {
    NX.groups.main.traverse(function(obj) {
      if (obj.isMesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(function(m) { m.wireframe = false; });
        } else {
          obj.material.wireframe = false;
        }
      }
    });
  }
}

// ═══════════════════════════════════════════════════
//  EXPOSE API
// ═══════════════════════════════════════════════════
window.NX = NX;
window.initThreeEngine = initThreeEngine;
window.loadScene = loadScene;
window.toggleExplode = toggleExplode;
window.toggleWireframe = toggleWireframe;
window.resetView = resetView;
