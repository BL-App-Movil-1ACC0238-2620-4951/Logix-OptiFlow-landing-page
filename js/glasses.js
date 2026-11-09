import * as THREE from "three";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";

const canvas = document.querySelector("#glasses");
const stage = document.querySelector("#stage");
if (!canvas || !stage) throw new Error("Falta o escenario dos lentes");

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Renderizador con transparencia total
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();

// Configuración da cámara para unha vista ampla de fondo
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
camera.position.set(0, 0, 10);

// Entorno e Iluminación
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.5);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);

const navyRimLight = new THREE.DirectionalLight(0x122b5c, 2.8);
navyRimLight.position.set(-5, -3, -2);
scene.add(navyRimLight);

// Materiais coordinados coa paleta da marca
const materials = {
  gold: new THREE.MeshPhysicalMaterial({
    color: 0xd4af37,
    metalness: 0.95,
    roughness: 0.15,
    clearcoat: 0.6
  }),
  navy: new THREE.MeshPhysicalMaterial({
    color: 0x122b5c,
    metalness: 0.7,
    roughness: 0.2,
    clearcoat: 0.4
  }),
  optiBlue: new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 0.5
  }),
  pinkCrystal: new THREE.MeshPhysicalMaterial({
    color: 0xe8a2b8,
    metalness: 0.1,
    roughness: 0.12,
    clearcoat: 0.8,
    transparent: true,
    opacity: 0.88
  }),
  techCyan: new THREE.MeshPhysicalMaterial({
    color: 0x00b4d8,
    metalness: 0.85,
    roughness: 0.2,
    clearcoat: 0.4
  }),
  lensClear: new THREE.MeshPhysicalMaterial({
    color: 0xcfe3ff,
    metalness: 0,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.4,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false
  })
};

// --- FABRICACIÓN DE MODELOS 3D (TAMAÑO PROPORCIONAL) ---
function createRoundGoldGlasses() {
  const group = new THREE.Group();
  const rimMat = materials.gold;
  const glassMat = materials.lensClear;

  [-0.65, 0.65].forEach((x) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 16, 48), rimMat);
    rim.position.x = x;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.03, 32), glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.x = x;
    group.add(rim, glass);
  });

  const bridge = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 12, 20, Math.PI), rimMat);
  bridge.rotation.z = Math.PI;
  bridge.position.set(0, 0.18, 0);
  group.add(bridge);

  [-1.15, 1.15].forEach((x) => {
    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 1.1), rimMat);
    temple.position.set(x, 0.05, -0.55);
    temple.rotation.y = x > 0 ? -0.12 : 0.12;
    group.add(temple);
  });

  return group;
}

function createPinkGlasses() {
  const group = new THREE.Group();
  const rimMat = materials.pinkCrystal;
  const glassMat = materials.lensClear;

  [-0.68, 0.68].forEach((x) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.06, 16, 40), rimMat);
    rim.position.x = x;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.03, 32), glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.x = x;
    group.add(rim, glass);
  });

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 0.05), rimMat);
  bridge.position.set(0, 0.15, 0);
  group.add(bridge);

  [-1.2, 1.2].forEach((x) => {
    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.1), rimMat);
    temple.position.set(x, 0.1, -0.55);
    group.add(temple);
  });

  return group;
}

function createNavyModernGlasses() {
  const group = new THREE.Group();
  const rimMat = materials.navy;
  const glassMat = materials.lensClear;

  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.38);
  shape.lineTo(0.5, -0.38);
  shape.lineTo(0.55, 0.38);
  shape.lineTo(-0.55, 0.38);
  shape.closePath();

  [-0.68, 0.68].forEach((x) => {
    const frameGeom = new THREE.ShapeGeometry(shape);
    const glass = new THREE.Mesh(frameGeom, glassMat);
    glass.position.set(x, 0, 0);
    glass.scale.set(0.9, 0.9, 1);

    const wireGeom = new THREE.WireframeGeometry(frameGeom);
    const line = new THREE.LineSegments(wireGeom, new THREE.LineBasicMaterial({ color: 0x122b5c, linewidth: 2 }));
    line.position.set(x, 0, 0.02);

    group.add(glass, line);
  });

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.04), rimMat);
  bridge.position.set(0, 0.2, 0);
  group.add(bridge);

  [-1.2, 1.2].forEach((x) => {
    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.2), rimMat);
    temple.position.set(x, 0.1, -0.6);
    group.add(temple);
  });

  return group;
}

function createCyanAviatorGlasses() {
  const group = new THREE.Group();
  const rimMat = materials.techCyan;
  const glassMat = materials.lensClear;

  [-0.7, 0.7].forEach((x) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 16, 40), rimMat);
    rim.scale.set(1, 0.82, 1);
    rim.position.x = x;

    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.02, 32), glassMat);
    glass.scale.set(1, 1, 0.82);
    glass.rotation.x = Math.PI / 2;
    glass.position.x = x;

    group.add(rim, glass);
  });

  const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 12), rimMat);
  topBar.rotation.z = Math.PI / 2;
  topBar.position.set(0, 0.35, 0);

  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12), rimMat);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.set(0, 0.15, 0);

  group.add(topBar, bridge);

  [-1.25, 1.25].forEach((x) => {
    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.15), rimMat);
    temple.position.set(x, 0.2, -0.55);
    group.add(temple);
  });

  return group;
}

const glassesFactories = [
  createRoundGoldGlasses,
  createPinkGlasses,
  createNavyModernGlasses,
  createCyanAviatorGlasses
];

// --- LENTES CAYENDO ---------------------------------------------------------
// Las posiciones se calculan según lo que la cámara realmente ve, así siempre
// aparecen dentro del escenario (en móvil y en escritorio) y no fuera de cuadro.
const fallingGlasses = [];
const isSmall = window.matchMedia("(max-width: 700px)").matches;
const GLASSES_COUNT = reduce ? 4 : isSmall ? 6 : 9;
const HIT_RADIUS = 1.25; // zona de clic generosa: los lentes giran y de canto son muy finos

const view = { halfH: 3.6, halfW: 4 };

function updateView() {
  view.halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  view.halfW = view.halfH * camera.aspect;
}

function placeGlasses(item, { anywhere = false } = {}) {
  if (reduce) anywhere = true; // sin movimiento: los lentes quedan a la vista (y se pueden tocar)
  const margin = Math.min(1.2, view.halfW * 0.35);
  item.position.x = (Math.random() * 2 - 1) * Math.max(0.5, view.halfW - margin);
  item.position.y = anywhere
    ? (Math.random() * 2 - 1) * view.halfH
    : view.halfH + 1.2 + Math.random() * 2.5;
  item.position.z = (Math.random() - 0.5) * 2.0;

  item.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

  // unidades por segundo (independiente de los fps del equipo)
  item.userData.speedY = 0.55 + Math.random() * 0.9;
  item.userData.rotSpeed = {
    x: (Math.random() - 0.5) * 1.2,
    y: (Math.random() - 0.5) * 1.5,
    z: (Math.random() - 0.5) * 1.2
  };
  item.scale.setScalar((isSmall ? 0.7 : 0.85) + Math.random() * 0.35);
  item.visible = true;
}

for (let i = 0; i < GLASSES_COUNT; i++) {
  const model = glassesFactories[i % glassesFactories.length]();
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(HIT_RADIUS, 10, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  model.add(hit);
  model.userData = {};
  scene.add(model);
  fallingGlasses.push(model);
}

// --- EXPLOSIÓN --------------------------------------------------------------
const particles = [];
const particleGroup = new THREE.Group();
scene.add(particleGroup);

const shardGeometries = [
  new THREE.TetrahedronGeometry(0.11),
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.OctahedronGeometry(0.09)
];
const shardColors = [0xd4af37, 0x2563eb, 0xe8a2b8, 0x00b4d8, 0xffffff, 0x9ec0ff];
const shardMaterials = shardColors.map(
  (color) => new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.3, emissive: color, emissiveIntensity: 0.25 })
);

const shockGeom = new THREE.RingGeometry(0.18, 0.3, 40);
const shockwaves = [];

function createExplosion(position) {
  // onda de choque mirando a la cámara
  const mat = new THREE.MeshBasicMaterial({ color: 0x6aa2ff, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false });
  const ring = new THREE.Mesh(shockGeom, mat);
  ring.position.copy(position);
  ring.position.z += 0.2;
  scene.add(ring);
  shockwaves.push({ mesh: ring, life: 1 });

  const shardCount = reduce ? 16 : 36;
  for (let i = 0; i < shardCount; i++) {
    const p = new THREE.Mesh(
      shardGeometries[i % shardGeometries.length],
      shardMaterials[Math.floor(Math.random() * shardMaterials.length)]
    );
    p.position.copy(position);
    p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    const speed = 3 + Math.random() * 6; // unidades por segundo
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    p.userData = {
      velocity: new THREE.Vector3(
        speed * Math.cos(phi) * Math.cos(theta),
        speed * Math.sin(phi) + 1,
        speed * Math.cos(phi) * Math.sin(theta)
      ),
      spin: new THREE.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14),
      life: 1,
      decay: 1.1 + Math.random() * 0.9 // vida por segundo
    };
    particleGroup.add(p);
    particles.push(p);
  }
}

// --- CLIC / TOQUE -----------------------------------------------------------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pick(event) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(fallingGlasses.filter((g) => g.visible), true);
  if (!hits.length) return null;
  let node = hits[0].object;
  while (node && !fallingGlasses.includes(node)) node = node.parent;
  return node || null;
}

function popGlasses(item) {
  const pos = new THREE.Vector3();
  item.getWorldPosition(pos);
  createExplosion(pos);
  item.visible = false;
  window.setTimeout(() => placeGlasses(item), 700);
}

stage.addEventListener("pointerdown", (event) => {
  if (event.button > 0) return;
  const hit = pick(event);
  if (hit) popGlasses(hit);
});

stage.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  stage.style.cursor = pick(event) ? "pointer" : "";
});

// --- TAMAÑO Y BUCLE ---------------------------------------------------------
let firstLayout = true;

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  if (!width || !height) return false;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width === Math.floor(width * ratio) && canvas.height === Math.floor(height * ratio)) return true;

  renderer.setPixelRatio(ratio);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  updateView();

  if (firstLayout) {
    // al cargar, algunos lentes ya están a la vista y el resto cae desde arriba
    fallingGlasses.forEach((g, i) => placeGlasses(g, { anywhere: i % 2 === 0 }));
    firstLayout = false;
  } else {
    // si cambió el ancho, vuelve a meter dentro del cuadro los que quedaron fuera
    fallingGlasses.forEach((g) => {
      const limit = Math.max(0.5, view.halfW - 0.6);
      g.position.x = THREE.MathUtils.clamp(g.position.x, -limit, limit);
    });
  }
  return true;
}

let running = true;
let last = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  if (!running) { last = now; return; }

  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (!resize()) return;

  fallingGlasses.forEach((item) => {
    if (!item.visible) return;
    if (!reduce) {
      item.position.y -= item.userData.speedY * dt;
      item.rotation.x += item.userData.rotSpeed.x * dt;
      item.rotation.y += item.userData.rotSpeed.y * dt;
      item.rotation.z += item.userData.rotSpeed.z * dt;
    }
    if (item.position.y < -view.halfH - 1.6) placeGlasses(item);
  });

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    const u = p.userData;
    p.position.addScaledVector(u.velocity, dt);
    u.velocity.y -= 6 * dt;
    p.rotation.x += u.spin.x * dt;
    p.rotation.y += u.spin.y * dt;
    u.life -= u.decay * dt;
    p.scale.setScalar(Math.max(0.001, u.life));
    if (u.life <= 0) {
      particleGroup.remove(p);
      particles.splice(i, 1);
    }
  }

  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const s = shockwaves[i];
    s.life -= dt * 2.2;
    s.mesh.scale.setScalar(1 + (1 - s.life) * 7);
    s.mesh.material.opacity = Math.max(0, s.life) * 0.9;
    if (s.life <= 0) {
      scene.remove(s.mesh);
      s.mesh.material.dispose();
      shockwaves.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// No gastar GPU/batería si el escenario no se ve o la pestaña está en segundo plano
let stageVisible = true;
const syncRunning = () => { running = stageVisible && !document.hidden; };
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => { stageVisible = entry.isIntersecting; syncRunning(); }).observe(stage);
}
document.addEventListener("visibilitychange", syncRunning);

requestAnimationFrame(animate);
