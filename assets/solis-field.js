import * as THREE from "./three.module.js";

const canvas = document.querySelector("#solis-field");
const metricThroughput = document.querySelector("#metric-throughput");
const metricVolume = document.querySelector("#metric-volume");
const metricRisk = document.querySelector("#metric-risk");
const metricTime = document.querySelector("#metric-time");
const buttons = {
  live: document.querySelector("#mode-live"),
  risk: document.querySelector("#mode-risk"),
  rail: document.querySelector("#mode-rail"),
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1213);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1000);
camera.position.set(0, 38, 92);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const root = new THREE.Group();
scene.add(root);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pointerTarget = new THREE.Vector3();
let mode = "live";
let fieldData = null;
let pulses = [];
let railMap = new Map();
let hoverPulse = null;

const materials = {
  grid: new THREE.LineBasicMaterial({ color: 0x344044, transparent: true, opacity: 0.34 }),
  axis: new THREE.LineBasicMaterial({ color: 0x5dd6c8, transparent: true, opacity: 0.42 }),
  trail: new THREE.LineBasicMaterial({ color: 0x5dd6c8, transparent: true, opacity: 0.32 }),
  node: new THREE.MeshStandardMaterial({
    color: 0x5dd6c8,
    emissive: 0x183a37,
    roughness: 0.38,
    metalness: 0.1,
  }),
};

scene.add(new THREE.AmbientLight(0xb5c8c2, 1.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(38, 64, 42);
scene.add(keyLight);
const warmLight = new THREE.PointLight(0xd39b57, 110, 180);
warmLight.position.set(-38, 18, 34);
scene.add(warmLight);

function colorFor(hex) {
  return new THREE.Color(hex || "#5dd6c8");
}

function hashVector(label, scale) {
  let hash = 0;
  for (const char of label) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return ((hash % 2000) / 1000 - 1) * scale;
}

function makeLine(points, material) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  root.add(line);
  return line;
}

function buildGrid() {
  const size = 72;
  const step = 12;
  for (let i = -size; i <= size; i += step) {
    makeLine([new THREE.Vector3(-size, 0, i), new THREE.Vector3(size, 0, i)], materials.grid);
    makeLine([new THREE.Vector3(i, 0, -size), new THREE.Vector3(i, 0, size)], materials.grid);
  }
  makeLine([new THREE.Vector3(-74, 0, 0), new THREE.Vector3(74, 0, 0)], materials.axis);
  makeLine([new THREE.Vector3(0, 0, -74), new THREE.Vector3(0, 0, 74)], materials.axis);
  makeLine([new THREE.Vector3(0, -22, 0), new THREE.Vector3(0, 42, 0)], materials.axis);
}

function railPosition(railId) {
  const rail = railMap.get(railId);
  const index = rail ? rail.index : 0;
  const count = Math.max(railMap.size, 1);
  return ((index / Math.max(count - 1, 1)) - 0.5) * 62;
}

function transactionPosition(tx, timeOffset = 0) {
  const railX = railPosition(tx.rail);
  const fromX = hashVector(tx.from, 12);
  const toZ = hashVector(tx.to, 26);
  const amountLift = Math.log10(Math.max(tx.amount, 1)) * 7;
  const phase = (tx.settlement + timeOffset) * Math.PI * 2;
  const loop = Math.sin(phase) * 7;
  const riskLift = tx.risk * 34;
  return new THREE.Vector3(
    railX + fromX + Math.cos(phase) * 4,
    3 + amountLift + riskLift * 0.55 + loop,
    toZ + (tx.confidence - 0.84) * 60 + Math.sin(phase * 0.7) * 5,
  );
}

function makePulse(tx) {
  const rail = railMap.get(tx.rail);
  const color = colorFor(rail?.color);
  const radius = 0.9 + Math.log10(tx.amount) * 0.4 + tx.risk * 1.4;
  const geometry = new THREE.SphereGeometry(radius, 22, 16);
  const material = materials.node.clone();
  material.color = color;
  material.emissive = color.clone().multiplyScalar(0.28);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { tx };
  root.add(mesh);

  const trailMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.28 + tx.confidence * 0.22,
  });
  const trail = new THREE.Line(new THREE.BufferGeometry(), trailMaterial);
  root.add(trail);
  return { tx, mesh, trail, color, age: tx.settlement };
}

function buildRails() {
  fieldData.rails.forEach((rail, index) => {
    railMap.set(rail.id, { ...rail, index });
    const x = ((index / Math.max(fieldData.rails.length - 1, 1)) - 0.5) * 62;
    const material = new THREE.LineBasicMaterial({
      color: colorFor(rail.color),
      transparent: true,
      opacity: 0.46,
    });
    makeLine([new THREE.Vector3(x, 0, -56), new THREE.Vector3(x, 0, 56)], material);
  });
}

function buildField() {
  root.clear();
  pulses = [];
  buildGrid();
  buildRails();
  pulses = fieldData.transactions.map(makePulse);
}

function resize() {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function updateMetrics(active, time) {
  const volume = active.reduce((sum, pulse) => sum + pulse.tx.amount, 0);
  const risk = active.length
    ? active.reduce((sum, pulse) => sum + pulse.tx.risk, 0) / active.length
    : 0;
  metricThroughput.textContent = `${active.length.toString().padStart(2, "0")} tps`;
  metricVolume.textContent = formatCurrency(volume);
  metricRisk.textContent = risk.toFixed(2);
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time % 60);
  metricTime.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function setMode(nextMode) {
  mode = nextMode;
  Object.entries(buttons).forEach(([key, button]) => {
    button.classList.toggle("primary", key === mode);
  });
}

function animate() {
  const elapsed = clock.getElapsedTime();
  const timeLoop = (elapsed * 0.055) % 1.36;
  const active = [];

  root.rotation.y = Math.sin(elapsed * 0.08) * 0.16;
  root.rotation.x = -0.1 + Math.sin(elapsed * 0.05) * 0.04;

  pulses.forEach((pulse) => {
    const tx = pulse.tx;
    const phaseDistance = Math.abs(((timeLoop - tx.settlement + 1.36) % 1.36) - 0.68);
    const activity = Math.max(0.08, 1 - phaseDistance * 1.45);
    const position = transactionPosition(tx, elapsed * 0.025);
    pulse.mesh.position.copy(position);
    pulse.mesh.scale.setScalar(0.72 + activity * 1.2);

    if (mode === "risk") {
      pulse.mesh.material.color.setHSL(0.02 + (1 - tx.risk) * 0.28, 0.78, 0.56);
      pulse.mesh.material.emissive.copy(pulse.mesh.material.color).multiplyScalar(0.36);
    } else if (mode === "rail") {
      pulse.mesh.material.color.copy(pulse.color);
      pulse.mesh.material.emissive.copy(pulse.color).multiplyScalar(0.34);
    } else {
      pulse.mesh.material.color.copy(pulse.color).lerp(new THREE.Color(0xffffff), activity * 0.22);
      pulse.mesh.material.emissive.copy(pulse.color).multiplyScalar(0.28 + activity * 0.2);
    }

    const points = [];
    for (let i = 0; i < 16; i += 1) {
      points.push(transactionPosition(tx, elapsed * 0.025 - i * 0.015));
    }
    pulse.trail.geometry.dispose();
    pulse.trail.geometry = new THREE.BufferGeometry().setFromPoints(points);
    pulse.trail.material.opacity = 0.12 + activity * 0.3;

    if (activity > 0.62) {
      active.push(pulse);
    }
  });

  if (hoverPulse) {
    pointerTarget.lerp(hoverPulse.mesh.position, 0.08);
    camera.lookAt(pointerTarget);
  } else {
    camera.lookAt(0, 12, 0);
  }

  updateMetrics(active, elapsed);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function onPointerMove(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pulses.map((pulse) => pulse.mesh), false);
  hoverPulse = hits[0]?.object ? pulses.find((pulse) => pulse.mesh === hits[0].object) : null;
}

async function loadField() {
  const response = await fetch("assets/solis-transactions.json", { cache: "no-store" });
  fieldData = await response.json();
  buildField();
  resize();
  animate();
}

window.addEventListener("resize", resize);
canvas.addEventListener("pointermove", onPointerMove);
buttons.live.addEventListener("click", () => setMode("live"));
buttons.risk.addEventListener("click", () => setMode("risk"));
buttons.rail.addEventListener("click", () => setMode("rail"));

setMode("live");
loadField().catch((error) => {
  console.error("Failed to load Solis transaction field", error);
});
