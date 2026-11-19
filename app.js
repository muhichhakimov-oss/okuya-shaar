// ОКУЯ-ШААР — 3D-город подписчиков @bir.okuya.kg. Поиск по нику → полёт к дому → «Ичине кир».
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {FOLLOWERS, SPEC, UPDATED} from './data.js';
import {makeRooms} from './rooms.js';

/* ---------- утилиты ---------- */
const rnd = (i, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const $ = (id) => document.getElementById(id);
const BODY = ['#6B3F22', '#7A4A28', '#5C3620', '#8A5630', '#70452A', '#7B3B2B', '#4F5E7A', '#6A3A52', '#3F6A5A', '#8C6A2E', '#5B4A7A', '#2F5E78'];
const GARL = ['#FF4D4D', '#FFD23F', '#4DD2FF', '#6BFF8A', '#FF7AE0'];
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const norm = (s) => s.toLowerCase().replace(/^@/, '').trim();

/* ---------- раскладка (как в роликах) ---------- */
function layout(n) {
  const out = [];
  let ring = 0;
  let id = 0;
  while (out.length < n) {
    const R = 10.5 + ring * 4.6;
    const cnt = Math.floor((2 * Math.PI * R) / 3.1);
    for (let k = 0; k < cnt && out.length < n; k++) {
      const a = (k / cnt) * Math.PI * 2 + ring * 0.37 + Math.PI / 2;
      const da = Math.abs(((a - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (da * R < 2.2) continue;
      const rr = R + (rnd(id, 3) - 0.5) * 0.9;
      out.push({x: Math.cos(a) * rr, z: Math.sin(a) * rr, rot: -a - Math.PI / 2 + (rnd(id, 4) - 0.5) * 0.25, floors: rnd(id, 5) > 0.8 ? 2 : 1, id});
      id++;
    }
    ring++;
  }
  return out;
}

const fol = FOLLOWERS.filter(Boolean);
const specMap = new Map(SPEC.filter(([n]) => fol.includes(n)));
const order = [...specMap.keys(), ...fol.filter((n) => !specMap.has(n))];
const HOUSES = layout(order.length).map((h, i) => {
  const kind = specMap.get(order[i]);
  return {...h, name: order[i], kind, floors: kind === 'f2' ? 2 : kind === 'f3' ? 3 : kind === 'f10' ? 10 : h.floors, color: kind === 'blue' ? '#2D6BD8' : BODY[Math.floor(rnd(h.id, 6) * BODY.length)]};
});
const BY = new Map(HOUSES.map((h) => [h.name.toLowerCase(), h]));
const MAXR = Math.max(...HOUSES.map((h) => Math.hypot(h.x, h.z)));
const topY = (h) => (h.kind === 'f3' ? 3.8 : h.kind === 'f10' ? 10.4 : h.kind === 'palace' || h.kind === 'special' ? 4.2 : h.floors === 2 ? 3.6 : 2.6);

/* ---------- рендер ---------- */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 900);
const city = new THREE.Scene();
city.background = new THREE.Color('#0B1438');
city.fog = new THREE.Fog('#0A1030', 90, 330);
city.add(new THREE.AmbientLight('#6C80C0', 1.0));
city.add(new THREE.HemisphereLight('#8FA6E8', '#26335E', 0.9));
const dl = new THREE.DirectionalLight('#BCD0FF', 1.5);
dl.position.set(-30, 50, 20);
city.add(dl);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2 - 0.06;
controls.minDistance = 4;
controls.maxDistance = 190;
controls.screenSpacePanning = false;
camera.position.set(0, 95, 120);
controls.target.set(0, 0, -6);

/* ---------- материалы и геометрии ---------- */
const M = (o) => new THREE.MeshStandardMaterial(o);
const B = (o) => new THREE.MeshBasicMaterial(o);
const roofGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(-1.05, 0);
  s.lineTo(1.05, 0);
  s.lineTo(0, 0.95);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 1.9, bevelEnabled: false});
  g.translate(0, 0, -0.95);
  return g;
})();
const snowRoofGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(-1.16, -0.04);
  s.lineTo(1.16, -0.04);
  s.lineTo(0, 1.06);
  s.closePath();
  const h = new THREE.Path();
  h.moveTo(-0.96, 0.0);
  h.lineTo(0.96, 0.0);
  h.lineTo(0, 0.9);
  h.closePath();
  s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, {depth: 2.06, bevelEnabled: false});
  g.translate(0, 0, -1.03);
  return g;
})();

function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}
function textTex(text, bg, fg, w = 512, h = 128, size = 72) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.font = `900 ${size}px Montserrat, Arial`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let s = size;
  while (g.measureText(text).width > w - 20 && s > 14) {
    s -= 2;
    g.font = `900 ${s}px Montserrat, Arial`;
  }
  g.fillText(text, w / 2, h / 2 + 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- обычные дома (инстансинг) ---------- */
const plain = HOUSES.filter((h) => !h.kind || h.kind === 'f2' || h.kind === 'blue');
function inst(geo, mat, list, local, colorOf) {
  const im = new THREE.InstancedMesh(geo, mat, list.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const c = new THREE.Color();
  list.forEach((h, i) => {
    e.set(0, h.rot, 0);
    q.setFromEuler(e);
    m.compose(new THREE.Vector3(h.x, 0, h.z), q, new THREE.Vector3(1, 1, 1));
    m.multiply(local(h));
    im.setMatrixAt(i, m);
    if (colorOf) im.setColorAt(i, c.set(colorOf(h)));
  });
  im.instanceMatrix.needsUpdate = true;
  city.add(im);
  return im;
}
const L = () => new THREE.Matrix4();
const bh = (h) => (h.floors === 2 ? 2.2 : 1.25);
inst(new THREE.CircleGeometry(1.75, 14).rotateX(-Math.PI / 2), M({color: '#93A6DA'}), plain, () => L().makeTranslation(0, 0.03, 0));
inst(new THREE.BoxGeometry(1.8, 1, 1.7).translate(0, 0.5, 0), M({roughness: 0.9}), plain, (h) => L().makeScale(1, bh(h), 1), (h) => h.color);
inst(roofGeo, M({roughness: 1}), plain, (h) => L().makeTranslation(0, bh(h), 0), (h) => new THREE.Color(h.kind === 'blue' ? '#1C4CA8' : h.color).multiplyScalar(0.8).getStyle());
inst(snowRoofGeo, M({color: '#EEF3FF', roughness: 0.6}), plain, (h) => L().makeTranslation(0, bh(h), 0));
inst(new THREE.BoxGeometry(0.26, 0.6, 0.26), M({color: '#5A3326'}), plain, (h) => L().makeTranslation(0.5, bh(h) + 0.75, -0.3));
const winGeo = new THREE.PlaneGeometry(0.36, 0.42);
const winMat = B({color: '#FFD27A'});
[-0.52, 0.52].forEach((x) => {
  inst(winGeo, winMat, plain, () => L().makeTranslation(x, 0.72, 0.862));
  inst(winGeo, winMat, plain.filter((h) => h.floors === 2), () => L().makeTranslation(x, 1.72, 0.862));
  inst(winGeo, winMat, plain, () => L().makeRotationY(Math.PI).setPosition(x, 0.72, -0.862));
});
inst(new THREE.PlaneGeometry(0.36, 0.78), M({color: '#2E1A0E'}), plain, () => L().makeTranslation(0, 0.42, 0.862));

/* ---------- особые дома ---------- */
function tall(h, floors, color) {
  const g = new THREE.Group();
  g.position.set(h.x, 0, h.z);
  g.rotation.y = h.rot;
  const fh = 0.95;
  const hh = floors * fh;
  mesh(new THREE.BoxGeometry(1.9, hh, 1.8), M({color, roughness: 0.8}), 0, hh / 2, 0, g);
  for (let k = 0; k < floors; k++) {
    [-0.55, 0, 0.55].forEach((x, j) => mesh(new THREE.PlaneGeometry(0.36, 0.44), B({color: (k * 3 + j + h.id) % 5 === 0 ? '#8C7A55' : '#FFD27A'}), x, 0.55 + k * fh, 0.905, g));
    mesh(new THREE.BoxGeometry(1.96, 0.05, 1.86), M({color: '#C8CED8'}), 0, (k + 1) * fh, 0, g);
  }
  mesh(new THREE.BoxGeometry(2.05, 0.18, 1.95), M({color: '#F4F8FF'}), 0, hh + 0.08, 0, g);
  if (floors >= 10) {
    mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), M({color: '#C8CED8'}), 0, hh + 0.9, 0, g);
    mesh(new THREE.SphereGeometry(0.12, 8, 8), B({color: '#FF4D4D'}), 0, hh + 1.75, 0, g);
  }
  mesh(new THREE.PlaneGeometry(0.44, 0.8), M({color: '#2E1A0E'}), 0, 0.42, 0.91, g);
  city.add(g);
}
function palace(h, color, dome, s = 0.85) {
  const g = new THREE.Group();
  g.position.set(h.x, 0, h.z);
  g.rotation.y = h.rot;
  g.scale.setScalar(s);
  mesh(new THREE.BoxGeometry(2.4, 2.2, 1.8), M({color}), 0, 1.1, 0, g);
  [-1.45, 1.45].forEach((x) => {
    mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.0, 14), M({color}), x, 1.5, 0, g);
    mesh(new THREE.SphereGeometry(0.6, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M({color: dome, metalness: 0.5, roughness: 0.3}), x, 3.0, 0, g);
    mesh(new THREE.ConeGeometry(0.08, 0.5, 6), M({color: '#FFD23F'}), x, 3.85, 0, g);
    [0.9, 1.9].forEach((y) => mesh(new THREE.PlaneGeometry(0.3, 0.42), B({color: '#FFD27A'}), x, y, 0.56, g));
  });
  const cone = mesh(new THREE.ConeGeometry(1.5, 1.0, 4), M({color: dome, metalness: 0.5, roughness: 0.35}), 0, 2.7, 0, g);
  cone.rotation.y = Math.PI / 4;
  [-0.7, 0, 0.7].forEach((x, i) => [0.6, 1.6].forEach((y, j) => mesh(new THREE.PlaneGeometry(0.4, 0.5), B({color: i === 1 && j === 0 ? '#2E1A0E' : '#FFD27A'}), x, y, 0.905, g)));
  city.add(g);
}
function smallHouse(h, color) {
  const g = new THREE.Group();
  g.position.set(h.x, 0, h.z);
  g.rotation.y = h.rot;
  mesh(new THREE.BoxGeometry(1.8, 1.25, 1.7), M({color}), 0, 0.625, 0, g);
  const r = mesh(roofGeo, M({color: new THREE.Color(color).multiplyScalar(0.8)}), 0, 1.25, 0, g);
  void r;
  mesh(snowRoofGeo, M({color: '#EEF3FF'}), 0, 1.25, 0, g);
  [-0.52, 0.52].forEach((x) => mesh(winGeo, winMat, x, 0.72, 0.862, g));
  mesh(new THREE.PlaneGeometry(0.36, 0.78), M({color: '#2E1A0E'}), 0, 0.42, 0.862, g);
  city.add(g);
  return g;
}
function nyTree(parent, x, z, s) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.6, 10), M({color: '#4A2F1B'}), 0, 0.3, 0, g);
  for (let k = 0; k < 4; k++) mesh(new THREE.ConeGeometry(2.2 - k * 0.48, 1.9, 14), M({color: k % 2 ? '#1E6B4E' : '#195C43'}), 0, 1.3 + k * 1.05, 0, g);
  for (let i = 0; i < 40; i++) {
    const t = rnd(i, 51);
    const r = 2.15 * (1 - t * 0.86) + 0.05;
    const a = rnd(i, 52) * Math.PI * 2;
    mesh(new THREE.SphereGeometry(0.1, 6, 6), B({color: GARL[i % 5]}), Math.cos(a) * r, 0.8 + t * 4.2, Math.sin(a) * r, g);
  }
  mesh(new THREE.OctahedronGeometry(0.32), B({color: '#FFD23F'}), 0, 5.75, 0, g);
  parent.add(g);
  return g;
}
HOUSES.filter((h) => h.kind && !['f2', 'blue'].includes(h.kind)).forEach((h) => {
  if (h.kind === 'f3') tall(h, 3, BODY[h.id % BODY.length]);
  else if (h.kind === 'f10') tall(h, 10, '#4F5E7A');
  else if (h.kind === 'palace') palace(h, ['#F3E7C9', '#EBD4E6', '#D7E6F3', '#F2DCC0'][h.id % 4], ['#2D8C6E', '#7A3FB0', '#2D6BD8', '#B8342F'][h.id % 4]);
  else if (h.kind === 'special') palace(h, '#FFC2D9', '#FFD23F', 0.95);
  else if (h.kind === 'shop') {
    const g = smallHouse(h, h.color);
    const aw = mesh(new THREE.BoxGeometry(1.9, 0.06, 0.7), M({color: '#E8384F'}), 0, 1.05, 1.05, g);
    aw.rotation.x = 0.45;
    mesh(new THREE.PlaneGeometry(1.5, 0.38), B({map: textTex('ДҮКӨН', '#B8342F', '#FFFFFF')}), 0, 1.55, 0.9, g);
  } else if (h.kind === 'car') {
    const g = smallHouse(h, h.color);
    const car = new THREE.Group();
    car.position.set(1.9, 0, 0.6);
    mesh(new THREE.BoxGeometry(1.0, 0.4, 2.0), M({color: '#E8384F', metalness: 0.5, roughness: 0.3}), 0, 0.35, 0, car);
    mesh(new THREE.BoxGeometry(0.9, 0.38, 1.1), M({color: '#1B2A55'}), 0, 0.72, -0.1, car);
    [-0.5, 0.5].forEach((x) => [-0.65, 0.65].forEach((z) => {
      const w = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 10), M({color: '#10162E'}), x, 0.18, z, car);
      w.rotation.z = Math.PI / 2;
    }));
    g.add(car);
  } else if (h.kind === 'tree') {
    const g = smallHouse(h, h.color);
    nyTree(g, 1.9, 0.9, 0.3);
  }
});

/* ---------- окружение ---------- */
mesh(new THREE.CircleGeometry(500, 64).rotateX(-Math.PI / 2), M({color: '#6477B4', roughness: 1}), 0, 0, 0, city);
mesh(new THREE.CircleGeometry(7.6, 48).rotateX(-Math.PI / 2), M({color: '#9DB0E2'}), 0, 0.02, 0, city);
for (let R = 12.8; R < MAXR + 2; R += 4.6) mesh(new THREE.RingGeometry(R - 0.6, R + 0.6, 128).rotateX(-Math.PI / 2), M({color: '#485C98'}), 0, 0.025, 0, city);
[0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((a) => {
  const p = mesh(new THREE.PlaneGeometry(2.6, MAXR + 2).rotateX(-Math.PI / 2), M({color: '#485C98'}), Math.sin(a) * (MAXR / 2 + 6), 0.028, Math.cos(a) * (MAXR / 2 + 6), city);
  p.rotation.y = a;
});
mesh(new THREE.PlaneGeometry(4, 76 - MAXR).rotateX(-Math.PI / 2), M({color: '#485C98'}), 0, 0.03, -(MAXR + 76) / 2, city);
mesh(new THREE.CircleGeometry(2.3, 32).rotateX(-Math.PI / 2), M({color: '#9CC4F0', roughness: 0.15, metalness: 0.2}), 3.6, 0.05, 2.6, city);
nyTree(city, -1.2, -0.8, 1);
// боз үй
(() => {
  const g = new THREE.Group();
  g.position.set(-4.3, 0, 2.6);
  mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.1, 24), M({color: '#EDE6D6'}), 0, 0.55, 0, g);
  mesh(new THREE.CylinderGeometry(1.53, 1.53, 0.16, 24), M({color: '#B8342F'}), 0, 1.02, 0, g);
  mesh(new THREE.ConeGeometry(1.62, 1.0, 24), M({color: '#F7FAFF'}), 0, 1.55, 0, g);
  mesh(new THREE.PlaneGeometry(0.5, 0.9), B({color: '#FFB64D'}), 0, 0.5, 1.51, g);
  city.add(g);
})();
// снеговик
[[0.42, 0.4], [0.3, 1.0], [0.21, 1.42]].forEach(([r, y]) => mesh(new THREE.SphereGeometry(r, 14, 14), M({color: '#F7FAFF'}), 0.9, y, 4.6, city));
// айлампа
const wheel = new THREE.Group();
(() => {
  const g = new THREE.Group();
  g.position.set(-6.4, 0, 0.4);
  g.rotation.y = 0.84;
  [-0.55, 0.55].forEach((z, i) => {
    const leg = mesh(new THREE.BoxGeometry(0.16, 3.4, 0.16), M({color: '#5A6078'}), 0, 1.6, z, g);
    leg.rotation.z = i ? 0.32 : -0.32;
  });
  wheel.position.set(0, 3.2, 0);
  mesh(new THREE.TorusGeometry(2.6, 0.07, 8, 48), B({color: '#FFE2A0'}), 0, 0, 0, wheel);
  for (let i = 0; i < 8; i++) {
    const s = mesh(new THREE.BoxGeometry(5.2, 0.05, 0.05), M({color: '#C8CED8'}), 0, 0, 0, wheel);
    s.rotation.z = (i / 8) * Math.PI;
    const a = (i / 8) * Math.PI * 2;
    mesh(new THREE.BoxGeometry(0.55, 0.45, 0.45), M({color: ['#E8384F', '#FFD23F', '#3F7FB5', '#5B9E6B', '#FF7AE0', '#F2A81D', '#4DD2FF', '#B8342F'][i]}), Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0, wheel);
  }
  g.add(wheel);
  city.add(g);
})();

/* ---------- наш сарай + флаг ---------- */
const MAN = [3.0, 0, -4.7];
(() => {
  const g = new THREE.Group();
  g.position.set(...MAN);
  const fw = 4.4;
  const fl = 4;
  mesh(new THREE.BoxGeometry(fw + 0.6, 0.3, 3.6), M({color: '#E8E2D2'}), 0, 0.15, 0, g);
  mesh(new THREE.BoxGeometry(fw, fl, 3.0), M({color: '#F3E7C9', roughness: 0.6}), 0, 0.3 + fl / 2, 0, g);
  for (let r = 0; r < fl; r++) {
    [-1.65, -0.82, 0, 0.82, 1.65].forEach((x, c) => mesh(new THREE.PlaneGeometry(0.5, 0.66), B({color: r === 0 && c === 2 ? '#3A2412' : '#FFE29A'}), x, 0.75 + r, 1.505, g));
    mesh(new THREE.BoxGeometry(fw + 0.04, 0.07, 0.04), M({color: '#D9A62E', metalness: 0.7, roughness: 0.25}), 0, 1.3 + r, 1.52, g);
  }
  [-1.25, -0.42, 0.42, 1.25].forEach((x) => mesh(new THREE.CylinderGeometry(0.13, 0.15, 2.2, 12), M({color: '#FFFFFF'}), x, 1.25, 1.85, g));
  mesh(new THREE.BoxGeometry(3.2, 0.2, 0.9), M({color: '#F4F0E4'}), 0, 2.42, 1.85, g);
  mesh(new THREE.PlaneGeometry(3.0, 0.5), B({map: textTex('bir.okuya.kg', '#1A1F36', '#FFD23F', 768, 128, 70)}), 0, 0.3 + fl + 0.32, 1.52, g);
  const roof = mesh(new THREE.ConeGeometry(3.3, 1.5, 4), M({color: '#E7B12F', metalness: 0.75, roughness: 0.25}), 0, 0.3 + fl + 0.62, 0, g);
  roof.rotation.y = Math.PI / 4;
  const crown = new THREE.Group();
  crown.position.set(0, 0.3 + fl + 1.7, 0);
  mesh(new THREE.CylinderGeometry(0.45, 0.4, 0.3, 10, 1, true), M({color: '#FFD23F', metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide}), 0, 0, 0, crown);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    mesh(new THREE.ConeGeometry(0.1, 0.3, 4), M({color: '#FFD23F', metalness: 0.8, roughness: 0.2}), Math.cos(a) * 0.42, 0.28, Math.sin(a) * 0.42, crown);
  }
  g.add(crown);
  g.userData.crown = crown;
  const pl = new THREE.PointLight('#FFE2A0', 18, 12);
  pl.position.set(0, 2, 4);
  g.add(pl);
  city.add(g);
})();
// флаг Кыргызстана (2023): красное поле, солнце с 40 прямыми лучами, тундук
const flagTex = (() => {
  const w = 600;
  const h = 360;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#E8112D';
  g.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const R = h * 0.36;
  const r = h * 0.17;
  g.fillStyle = '#FFE000';
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const a1 = a - (Math.PI / 40) * 0.62;
    const a2 = a + (Math.PI / 40) * 0.62;
    g.beginPath();
    g.moveTo(cx + Math.cos(a1) * r * 0.95, cy + Math.sin(a1) * r * 0.95);
    g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    g.lineTo(cx + Math.cos(a2) * r * 0.95, cy + Math.sin(a2) * r * 0.95);
    g.closePath();
    g.fill();
  }
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  const tr = r * 0.78;
  g.strokeStyle = '#E8112D';
  g.lineWidth = r * 0.11;
  g.beginPath();
  g.arc(cx, cy, tr, 0, Math.PI * 2);
  g.stroke();
  g.save();
  g.beginPath();
  g.arc(cx, cy, tr, 0, Math.PI * 2);
  g.clip();
  g.lineWidth = r * 0.09;
  [-0.38, 0, 0.38].forEach((o) => {
    g.beginPath();
    g.moveTo(cx + o * tr - tr * 0.06, cy - tr);
    g.quadraticCurveTo(cx + o * tr * 1.25, cy, cx + o * tr - tr * 0.06, cy + tr);
    g.stroke();
    g.beginPath();
    g.moveTo(cx - tr, cy + o * tr - tr * 0.06);
    g.quadraticCurveTo(cx, cy + o * tr * 1.25, cx + tr, cy + o * tr - tr * 0.06);
    g.stroke();
  });
  g.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const flagGeo = new THREE.PlaneGeometry(3.0, 1.8, 24, 8);
const flagBase = Float32Array.from(flagGeo.attributes.position.array);
(() => {
  const g = new THREE.Group();
  g.position.set(6.2, 0, -2.2);
  const hh = 8.4;
  mesh(new THREE.CylinderGeometry(0.45, 0.6, 0.3, 14), M({color: '#C8CED8'}), 0, 0.15, 0, g);
  mesh(new THREE.CylinderGeometry(0.06, 0.09, hh, 10), M({color: '#E4E8F0', metalness: 0.7, roughness: 0.25}), 0, hh / 2, 0, g);
  mesh(new THREE.SphereGeometry(0.13, 10, 10), M({color: '#FFD23F', metalness: 0.6, roughness: 0.3}), 0, hh + 0.08, 0, g);
  const f = mesh(flagGeo, M({map: flagTex, side: THREE.DoubleSide, roughness: 0.8}), -1.55, hh - 1.0, 0, g);
  f.rotation.y = Math.PI;
  const pl = new THREE.PointLight('#FFE9C0', 8, 6);
  pl.position.set(-1.6, hh - 1, 1.6);
  g.add(pl);
  city.add(g);
})();

/* ---------- Окуя Арена ---------- */
const ARENA = [0, 0, -86];
const arenaScr = (() => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 288;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return {c, t};
})();
const arenaBand = M({color: '#7FD8FF'});
(() => {
  const g = new THREE.Group();
  g.position.set(...ARENA);
  const rx = 17;
  const rz = 12;
  const ground = mesh(new THREE.CircleGeometry(rx + 6, 48).rotateX(-Math.PI / 2), M({color: '#5C78BA'}), 0, 0.04, 0, g);
  ground.scale.set(1, 1, rz / rx);
  const wall = mesh(new THREE.CylinderGeometry(rx, rx + 0.8, 7, 64, 1, true), M({color: '#E8ECF4', roughness: 0.5, side: THREE.DoubleSide}), 0, 3.5, 0, g);
  wall.scale.set(1, 1, rz / rx);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(rx + 0.06, rx + 0.4, 1.6, 64, 1, true), arenaBand);
  band.material.side = THREE.DoubleSide;
  band.position.set(0, 4.2, 0);
  band.scale.set(1, 1, rz / rx);
  g.add(band);
  const roof = mesh(new THREE.SphereGeometry(rx + 0.4, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), M({color: '#F4F8FF', roughness: 0.4}), 0, 7, 0, g);
  roof.scale.set(1, 0.28, rz / rx);
  mesh(new THREE.PlaneGeometry(12, 1.5), B({map: textTex('OKUYA ARENA', '#0A1430', '#7FD8FF', 1024, 128, 86)}), 0, 5.6, rz + 0.95, g);
  const scr = new THREE.Group();
  scr.position.set(0, 9.8, rz - 1);
  scr.rotation.x = -0.12;
  mesh(new THREE.BoxGeometry(9.6, 5.6, 0.3), M({color: '#10162E'}), 0, 0, 0, scr);
  mesh(new THREE.PlaneGeometry(9.2, 5.2), B({map: arenaScr.t}), 0, 0, 0.16, scr);
  g.add(scr);
  mesh(new THREE.BoxGeometry(6, 3, 0.4), B({color: '#FFE29A'}), 0, 1.5, rz + 0.7, g);
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
    mesh(new THREE.CylinderGeometry(0.15, 0.25, 14, 8), M({color: '#5A6078'}), sx * (rx + 4), 7, sz * (rz + 3), g);
    mesh(new THREE.BoxGeometry(1.6, 0.9, 0.4), B({color: '#FFF6D8'}), sx * (rx + 4), 14.2, sz * (rz + 3), g);
  }));
  const pl = new THREE.PointLight('#BFE6FF', 40, 30);
  pl.position.set(0, 6, rz + 6);
  g.add(pl);
  city.add(g);
})();
const sortedNames = [...fol].sort((a, b) => a.replace(/[^a-z]/g, '').localeCompare(b.replace(/[^a-z]/g, '')));
function drawArena(t) {
  const g = arenaScr.c.getContext('2d');
  g.fillStyle = '#071029';
  g.fillRect(0, 0, 512, 288);
  g.textAlign = 'center';
  g.fillStyle = '#FFD23F';
  g.font = '800 30px Montserrat, Arial';
  g.fillText('ОКУЯ-ШААР 🏙', 256, 40);
  g.fillStyle = '#FFFFFF';
  g.font = '700 24px Montserrat, Arial';
  const f = t * 30;
  const off = (f * 1.6) % 34;
  const start = Math.floor(f / 21) % sortedNames.length;
  for (let i = 0; i < 8; i++) g.fillText(sortedNames[(start + i) % sortedNames.length], 256, 88 + i * 34 - off);
  arenaScr.t.needsUpdate = true;
}

/* ---------- фонари, лес, горы ---------- */
(() => {
  const pts = [];
  for (let R = 12.8, ri = 0; R < MAXR + 2; R += 4.6, ri++) {
    const n = Math.floor(R * 0.42);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ri + 0.2;
      pts.push([Math.cos(a) * (R + 0.85), Math.sin(a) * (R + 0.85)]);
    }
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    pts.push([Math.cos(a) * 7, Math.sin(a) * 7]);
  }
  const mk = (geo, mat, y) => {
    const im = new THREE.InstancedMesh(geo, mat, pts.length);
    const m = new THREE.Matrix4();
    pts.forEach(([x, z], i) => im.setMatrixAt(i, m.makeTranslation(x, y, z)));
    city.add(im);
  };
  mk(new THREE.CylinderGeometry(0.05, 0.06, 2.0, 6), M({color: '#10162E'}), 1);
  mk(new THREE.SphereGeometry(0.18, 8, 8), B({color: '#FFE2A0'}), 2.08);
  mk(new THREE.CircleGeometry(1.7, 14).rotateX(-Math.PI / 2), B({color: '#FFC56B', transparent: true, opacity: 0.2, depthWrite: false}), 0.06);
  const trees = [];
  for (let i = 0; i < 260; i++) {
    const a = rnd(i, 61) * Math.PI * 2;
    const R = MAXR + 6 + rnd(i, 62) * 34;
    const x = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    if (Math.abs(x) < 26 && z < -MAXR + 4) continue;
    trees.push([x, z, 0.8 + rnd(i, 63) * 1.4]);
  }
  const t1 = new THREE.InstancedMesh(new THREE.ConeGeometry(0.9, 2.2, 7).translate(0, 1.2, 0), M({color: '#1A4A45'}), trees.length);
  const t2 = new THREE.InstancedMesh(new THREE.ConeGeometry(0.62, 1.5, 7).translate(0, 2.3, 0), M({color: '#E4ECFD'}), trees.length);
  const m = new THREE.Matrix4();
  trees.forEach(([x, z, s], i) => {
    m.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    t1.setMatrixAt(i, m);
    t2.setMatrixAt(i, m);
  });
  city.add(t1, t2);
  for (let i = 0; i < 18; i++) {
    const a = Math.PI + (i / 17) * Math.PI;
    const R = 190 + rnd(i, 71) * 50;
    const hh = 55 + rnd(i, 72) * 55;
    const mm = new THREE.MeshStandardMaterial({color: '#34478A', flatShading: true, fog: false});
    mesh(new THREE.ConeGeometry(hh * 0.85, hh, 6), mm, Math.cos(a) * R, hh / 2, Math.sin(a) * R, city);
    mesh(new THREE.ConeGeometry(hh * 0.345, hh * 0.41, 6), new THREE.MeshStandardMaterial({color: '#EAF1FF', flatShading: true, fog: false}), Math.cos(a) * R, hh * 0.8, Math.sin(a) * R, city);
  }
})();

// снег
const snow = (() => {
  const n = 1400;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 220;
    pos[i * 3 + 1] = Math.random() * 80;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 220;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({color: '#FFFFFF', size: 0.35, transparent: true, opacity: 0.85, depthWrite: false}));
  city.add(p);
  return p;
})();

// маркер выбранного дома
const marker = new THREE.Group();
mesh(new THREE.RingGeometry(1.9, 2.3, 40).rotateX(-Math.PI / 2), B({color: '#FFD23F', transparent: true, opacity: 0.9}), 0, 0.08, 0, marker);
const beam = mesh(new THREE.CylinderGeometry(0.35, 1.4, 30, 20, 1, true), B({color: '#FFD23F', transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide}), 0, 15, 0, marker);
marker.visible = false;
city.add(marker);

/* ---------- ники над домами ---------- */
const labelsEl = $('labels');
const pool = [];
const MAXL = 60;
for (let i = 0; i < MAXL; i++) {
  const d = document.createElement('div');
  d.className = 'lb';
  d.style.display = 'none';
  labelsEl.appendChild(d);
  pool.push(d);
}
const v3 = new THREE.Vector3();
let selected = null;
function updateLabels() {
  const w = renderer.domElement.clientWidth;
  const h = renderer.domElement.clientHeight;
  const cand = [];
  for (const hs of HOUSES) {
    const d = camera.position.distanceTo(v3.set(hs.x, 0, hs.z));
    if (d > 32 && hs !== selected) continue;
    v3.set(hs.x, topY(hs), hs.z).project(camera);
    if (v3.z > 1 || v3.z < -1) continue;
    const x = ((v3.x + 1) / 2) * w;
    const y = ((1 - v3.y) / 2) * h;
    if (x < -40 || x > w + 40 || y < 110 || y > h - 40) continue;
    cand.push({hs, x, y, d});
  }
  cand.sort((a, b) => (b.hs === selected) - (a.hs === selected) || a.d - b.d);
  const placed = [];
  let k = 0;
  for (const c of cand) {
    if (k >= MAXL) break;
    const me = c.hs === selected;
    const fs = me ? 17 : Math.max(10, Math.min(14, 260 / c.d));
    const wd = c.hs.name.length * fs * 0.62 + 20;
    const hh = fs * 1.8;
    if (!me && placed.some((p) => Math.abs(p.x - c.x) < (p.w + wd) / 2 && Math.abs(p.y - c.y) < (p.h + hh) / 2)) continue;
    placed.push({x: c.x, y: c.y, w: wd, h: hh});
    const el = pool[k++];
    el.textContent = c.hs.name;
    el.className = 'lb' + (me ? ' me' : c.hs.kind ? ' vip' : '');
    el.style.fontSize = me ? '' : fs + 'px';
    el.style.left = c.x + 'px';
    el.style.top = c.y + 'px';
    el.style.display = 'block';
    el.style.zIndex = me ? 5 : 1;
  }
  for (; k < MAXL; k++) pool[k].style.display = 'none';
}

/* ---------- полёт камеры ---------- */
let fly = null;
function flyCam(pos, tgt, instant) {
  const endPos = new THREE.Vector3(...pos);
  const endTgt = new THREE.Vector3(...tgt);
  if (instant) {
    camera.position.copy(endPos);
    controls.target.copy(endTgt);
    return;
  }
  const midPos = camera.position.clone().lerp(endPos, 0.5);
  midPos.y = Math.max(camera.position.y, endPos.y) + Math.min(30, camera.position.distanceTo(endPos) * 0.35);
  fly = {t0: performance.now(), dur: 2000, p0: camera.position.clone(), p1: midPos, p2: endPos, t0v: controls.target.clone(), t1v: endTgt};
}
function flyTo(h, instant) {
  selected = h;
  const d = Math.hypot(h.x, h.z) || 1;
  const ux = h.x / d;
  const uz = h.z / d;
  const dist = h.kind === 'f10' ? 15 : 8.5;
  marker.position.set(h.x, 0, h.z);
  marker.visible = true;
  flyCam([h.x - ux * dist + uz * 2.5, h.kind === 'f10' ? 11 : 8.5, h.z - uz * dist - ux * 2.5], [h.x, h.kind === 'f10' ? 5 : 1.6, h.z], instant);
}
function stepFly(now) {
  if (!fly) return;
  const k = Math.min(1, (now - fly.t0) / fly.dur);
  const e = ease(k);
  const a = fly.p0.clone().lerp(fly.p1, e);
  const b = fly.p1.clone().lerp(fly.p2, e);
  camera.position.copy(a.lerp(b, e));
  controls.target.copy(fly.t0v.clone().lerp(fly.t1v, e));
  if (k >= 1) fly = null;
}

/* ---------- интерьеры ---------- */
const ROOMS = makeRooms({mesh, M, B, textTex, nyTree, flagTex, rnd, GARL, sortedNames});
const inScene = new THREE.Scene();
const inCam = new THREE.PerspectiveCamera(70, 1, 0.05, 200);
const inControls = new OrbitControls(inCam, canvas);
inControls.enabled = false;
inControls.enableDamping = true;
inControls.enablePan = false;
let inside = null; // {kind, title, rooms:[{name, pos, target}], cur, arena}
let inFly = null;
function enterPlace(kind, h, title) {
  while (inScene.children.length) inScene.remove(inScene.children[0]);
  const plan = ROOMS.plan(kind, h || {});
  const arena = kind === 'arena';
  inScene.background = new THREE.Color(arena ? '#050920' : '#140E07');
  if (!arena) inScene.add(new THREE.AmbientLight('#FFE7C4', 0.5));
  const rooms = plan.map(([name, build], i) => {
    const g = new THREE.Group();
    g.position.x = i * 40;
    inScene.add(g);
    const cam = build(g);
    return {name, pos: new THREE.Vector3(cam.pos[0] + i * 40, cam.pos[1], cam.pos[2]), target: new THREE.Vector3(cam.target[0] + i * 40, cam.target[1], cam.target[2])};
  });
  inside = {kind, title, rooms, cur: 0, arena};
  inControls.minDistance = arena ? 3 : 0.5;
  inControls.maxDistance = arena ? 26 : 4.6;
  inControls.maxPolarAngle = arena ? Math.PI / 2 - 0.05 : Math.PI - 0.1;
  goRoom(0, true);
  controls.enabled = false;
  inControls.enabled = true;
  stopWalk(true);
  $('inName').textContent = title;
  $('inBar').classList.add('show');
  $('top').style.display = 'none';
  $('card').classList.remove('show');
  $('mini').classList.remove('show');
  labelsEl.style.display = 'none';
  const rb = $('rooms');
  rb.innerHTML = '';
  if (rooms.length > 1) {
    rooms.forEach((r, i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (i === 0 ? ' on' : '');
      b.textContent = r.name;
      b.onclick = () => goRoom(i);
      rb.appendChild(b);
    });
    rb.classList.add('show');
  } else rb.classList.remove('show');
}
function goRoom(i, instant) {
  if (!inside) return;
  inside.cur = i;
  const r = inside.rooms[i];
  [...$('rooms').children].forEach((b, k) => b.classList.toggle('on', k === i));
  if (instant) {
    inCam.position.copy(r.pos);
    inControls.target.copy(r.target);
    inControls.update();
    return;
  }
  inFly = {t0: performance.now(), dur: 900, p0: inCam.position.clone(), p1: r.pos.clone(), t0v: inControls.target.clone(), t1v: r.target.clone()};
}
function stepInFly(now) {
  if (!inFly) return;
  const k = Math.min(1, (now - inFly.t0) / inFly.dur);
  const e = ease(k);
  inCam.position.copy(inFly.p0.clone().lerp(inFly.p1, e));
  inControls.target.copy(inFly.t0v.clone().lerp(inFly.t1v, e));
  if (k >= 1) inFly = null;
}
function goOut() {
  inside = null;
  inControls.enabled = false;
  controls.enabled = true;
  $('inBar').classList.remove('show');
  $('rooms').classList.remove('show');
  $('top').style.display = '';
  labelsEl.style.display = '';
  if (cardShown) $('card').classList.add('show');
}

/* ---------- карточка ---------- */
let cardShown = null;
const KIND_TXT = {f2: '2 кабат үй', f3: '3 кабат үй', f10: '10 кабат мунара 🏢', palace: 'Сарай 🏰', special: 'Өзгөчө үй ✨', shop: 'Дүкөн 🛒', car: 'Үй + машина 🚗', blue: 'Көк үй 💙', tree: 'Үй + ёлка 🎄'};
function openCard(o) {
  cardShown = o;
  $('cIc').textContent = o.icon;
  $('cName').textContent = o.title;
  $('cSub').textContent = o.sub;
  $('bIn').style.display = o.enter ? '' : 'none';
  $('bLink').style.display = o.link ? '' : 'none';
  $('bUp').style.display = o.up ? '' : 'none';
  $('card').querySelector('.btns').style.gridTemplateColumns = `repeat(${[o.enter, o.link, o.up].filter(Boolean).length || 1}, 1fr)`;
  $('card').classList.add('show');
  $('hint').style.display = 'none';
}
function openHouseCard(h) {
  const rooms = ROOMS.plan('house', h).length;
  openCard({
    icon: h.kind === 'palace' || h.kind === 'special' ? '🏰' : '🏠',
    title: h.name,
    sub: `${KIND_TXT[h.kind] || (h.floors === 2 ? '2 кабат үй' : 'Үй')} · №${HOUSES.indexOf(h) + 1} · ${rooms} бөлмө`,
    enter: () => enterPlace('house', h, '🏠 ' + h.name),
    link: true,
    up: true,
    house: h,
  });
}
function closeCard() {
  $('card').classList.remove('show');
  $('hint').style.display = walking ? 'none' : '';
  marker.visible = false;
  selected = null;
  cardShown = null;
}
function toast(t) {
  const el = $('toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toast.tm);
  toast.tm = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ---------- места ---------- */
const TOWER = HOUSES.find((h) => h.kind === 'f10');
function goPlace(p) {
  document.querySelectorAll('#places .chip').forEach((c) => c.classList.toggle('on', c.dataset.go === p && (p === 'walk' || p === 'map')));
  if (p === 'map') {
    $('mini').classList.toggle('show');
    document.querySelector('[data-go="map"]').classList.toggle('on', $('mini').classList.contains('show'));
    return;
  }
  if (p === 'walk') return walking ? stopWalk() : startWalk();
  if (walking) stopWalk(true);
  marker.visible = false;
  selected = null;
  if (p === 'palace') {
    flyCam([MAN[0] + 2.4, 5.2, MAN[2] + 13], [MAN[0] + 0.6, 4.2, MAN[2]]);
    openCard({icon: '👑', title: 'bir.okuya.kg сарайы', sub: 'Шаардын башчысы · 4 бөлмө · Кыргыз туусу 🇰🇬', enter: () => enterPlace('palace-main', null, '👑 bir.okuya.kg сарайы')});
  } else if (p === 'arena') {
    flyCam([ARENA[0] + 22, 16, ARENA[2] + 42], [ARENA[0], 6, ARENA[2]]);
    openCard({icon: '🏟', title: 'Окуя Арена', sub: '1000 тургун болсок — бул жерде чоң концерт 🎤', enter: () => enterPlace('arena', null, '🏟 Окуя Арена')});
  } else if (p === 'plaza') {
    flyCam([9, 10, 17], [0, 2, 0]);
    closeCard();
    toast('🎄 Борбор аянт');
  } else if (p === 'wheel') {
    flyCam([-6.4 + 7, 5, 0.4 + 8], [-6.4, 3.2, 0.4]);
    closeCard();
    toast('🎡 Айлампа');
  } else if (p === 'tower' && TOWER) {
    flyTo(TOWER);
    openHouseCard(TOWER);
  } else if (p === 'top') {
    flyCam([0, 95, 120], [0, 0, -6]);
    closeCard();
  }
}
document.querySelectorAll('#places .chip').forEach((c) => (c.onclick = () => goPlace(c.dataset.go)));

/* ---------- прогулка ---------- */
const avatar = new THREE.Group();
(() => {
  const legs = [];
  [-0.12, 0.12].forEach((x) => {
    const l = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.42, 8).translate(0, -0.21, 0), M({color: '#1B2A55'}), x, 0.45, 0, avatar);
    legs.push(l);
  });
  mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.55, 12), M({color: '#E8384F'}), 0, 0.72, 0, avatar);
  mesh(new THREE.SphereGeometry(0.19, 14, 12), M({color: '#F1D2B0'}), 0, 1.15, 0, avatar);
  mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.08, 16), M({color: '#1A1F36'}), 0, 1.28, 0, avatar);
  mesh(new THREE.ConeGeometry(0.17, 0.32, 16), M({color: '#FFFFFF'}), 0, 1.47, 0, avatar);
  mesh(new THREE.SphereGeometry(0.035, 8, 8), M({color: '#1A1F36'}), 0, 1.63, 0, avatar);
  avatar.userData.legs = legs;
  const glow = mesh(new THREE.RingGeometry(0.35, 0.5, 24).rotateX(-Math.PI / 2), B({color: '#FFD23F', transparent: true, opacity: 0.8}), 0, 0.03, 0, avatar);
  void glow;
  avatar.visible = false;
  city.add(avatar);
})();
const COLL = [
  ...HOUSES.map((h) => [h.x, h.z, h.kind === 'palace' || h.kind === 'special' ? 2.0 : 1.35]),
  [MAN[0], MAN[2], 3.1],
  [-1.2, -0.8, 2.2],
  [-4.3, 2.6, 1.6],
  [-6.4, 0.4, 1.2],
  [0.9, 4.6, 0.5],
  [-4.5, -3.5, 1.8],
];
let walking = false;
let running = false;
let yaw = 0;
const joy = {x: 0, y: 0, id: null};
const keys = new Set();
function startWalk() {
  walking = true;
  closeCard();
  const t = controls.target;
  avatar.position.set(t.x, 0, t.z);
  if (Math.hypot(t.x, t.z) < 8.5) avatar.position.set(0, 0, 9.5);
  avatar.visible = true;
  marker.visible = false;
  controls.enabled = false;
  yaw = Math.atan2(camera.position.x - avatar.position.x, camera.position.z - avatar.position.z);
  $('joy').classList.add('show');
  $('walkbar').classList.add('show');
  $('hint').style.display = 'none';
  document.querySelector('[data-go="walk"]').classList.add('on');
  toast('🚶 Шаарды сейилде!');
}
function stopWalk(silent) {
  if (!walking) return;
  walking = false;
  avatar.visible = false;
  controls.enabled = true;
  controls.target.set(avatar.position.x, 1, avatar.position.z);
  $('joy').classList.remove('show');
  $('walkbar').classList.remove('show');
  document.querySelector('[data-go="walk"]').classList.remove('on');
  if (!silent) $('hint').style.display = '';
}
let nearT = 0;
function stepWalk(dt, now) {
  let mx = joy.x;
  let mz = joy.y;
  if (keys.has('arrowup') || keys.has('w')) mz -= 1;
  if (keys.has('arrowdown') || keys.has('s')) mz += 1;
  if (keys.has('arrowleft') || keys.has('a')) mx -= 1;
  if (keys.has('arrowright') || keys.has('d')) mx += 1;
  const len = Math.hypot(mx, mz);
  const p = avatar.position;
  if (len > 0.05) {
    const k = Math.min(1, len);
    mx /= len;
    mz /= len;
    const sp = (running || keys.has('shift') ? 9 : 4.5) * k * dt;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    let nx = p.x + (rx * mx - fx * mz) * sp;
    let nz = p.z + (rz * mx - fz * mz) * sp;
    for (const [cx, cz, r] of COLL) {
      const dx = nx - cx;
      const dz = nz - cz;
      const d = Math.hypot(dx, dz);
      if (d < r + 0.3 && d > 0.0001) {
        nx = cx + (dx / d) * (r + 0.3);
        nz = cz + (dz / d) * (r + 0.3);
      }
    }
    // арена (эллипс)
    const ax = (nx - ARENA[0]) / 18.6;
    const az = (nz - ARENA[2]) / 13.4;
    const ad = Math.hypot(ax, az);
    if (ad < 1) {
      nx = ARENA[0] + (ax / ad) * 18.6;
      nz = ARENA[2] + (az / ad) * 13.4;
    }
    const rr = Math.hypot(nx, nz + 20);
    if (rr > MAXR + 70) {
      nx *= (MAXR + 70) / rr;
    }
    p.x = nx;
    p.z = nz;
    avatar.rotation.y = Math.atan2(rx * mx - fx * mz, rz * mx - fz * mz);
    const sw = Math.sin(now / (running ? 70 : 110)) * 0.6;
    avatar.userData.legs[0].rotation.x = sw;
    avatar.userData.legs[1].rotation.x = -sw;
  } else {
    avatar.userData.legs.forEach((l) => (l.rotation.x *= 0.8));
  }
  const cd = 4.6;
  const want = new THREE.Vector3(p.x + Math.sin(yaw) * cd, 2.6, p.z + Math.cos(yaw) * cd);
  camera.position.lerp(want, Math.min(1, dt * 6));
  controls.target.set(p.x, 1.1, p.z);
  camera.lookAt(controls.target);
  // ближайший дом → карточка
  if (now - nearT > 300) {
    nearT = now;
    let best = null;
    let bd = 3.0;
    for (const h of HOUSES) {
      const d = Math.hypot(h.x - p.x, h.z - p.z);
      if (d < bd) {
        bd = d;
        best = h;
      }
    }
    if (Math.hypot(MAN[0] - p.x, MAN[2] - p.z) < 5.2) {
      if (cardShown?.title !== 'bir.okuya.kg сарайы') openCard({icon: '👑', title: 'bir.okuya.kg сарайы', sub: 'Шаардын башчысы · 4 бөлмө', enter: () => enterPlace('palace-main', null, '👑 bir.okuya.kg сарайы')});
    } else if (Math.hypot((p.x - ARENA[0]) / 18.6, (p.z - ARENA[2]) / 13.4) < 1.25) {
      if (cardShown?.title !== 'Окуя Арена') openCard({icon: '🏟', title: 'Окуя Арена', sub: 'Ичине кирип көр 🎤', enter: () => enterPlace('arena', null, '🏟 Окуя Арена')});
    } else if (best) {
      if (selected !== best) {
        selected = best;
        marker.position.set(best.x, 0, best.z);
        marker.visible = true;
        openHouseCard(best);
      }
    } else if (cardShown) {
      $('card').classList.remove('show');
      cardShown = null;
      selected = null;
      marker.visible = false;
    }
  }
}
// джойстик
const joyEl = $('joy');
const knob = $('knob');
joyEl.addEventListener('pointerdown', (e) => {
  joy.id = e.pointerId;
  joyEl.setPointerCapture(e.pointerId);
  moveJoy(e);
});
joyEl.addEventListener('pointermove', (e) => e.pointerId === joy.id && moveJoy(e));
const endJoy = () => {
  joy.id = null;
  joy.x = 0;
  joy.y = 0;
  knob.style.transform = '';
};
joyEl.addEventListener('pointerup', endJoy);
joyEl.addEventListener('pointercancel', endJoy);
function moveJoy(e) {
  const r = joyEl.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width / 2);
  let dy = e.clientY - (r.top + r.height / 2);
  const max = r.width / 2 - 14;
  const d = Math.hypot(dx, dy);
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
  }
  joy.x = dx / max;
  joy.y = dy / max;
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
}
// поворот камеры перетаскиванием
let dragX = null;
canvas.addEventListener('pointerdown', (e) => {
  if (walking) dragX = e.clientX;
});
window.addEventListener('pointermove', (e) => {
  if (walking && dragX !== null) {
    yaw -= (e.clientX - dragX) * 0.008;
    dragX = e.clientX;
  }
});
window.addEventListener('pointerup', () => (dragX = null));
window.addEventListener('keydown', (e) => {
  if (e.target === q) return;
  keys.add(e.key.toLowerCase());
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
$('bRun').onclick = () => {
  running = !running;
  $('bRun').classList.toggle('blue', running);
  $('bRun').textContent = running ? '🚶 Басуу' : '🏃 Чуркоо';
};
$('bWalkOut').onclick = () => stopWalk();

/* ---------- мини-карта ---------- */
const mini = $('mini');
const mctx = mini.getContext('2d');
const MC = {cx: 0, cz: -12, s: 150 / 96};
const toMap = (x, z) => [150 + (x - MC.cx) * MC.s, 150 + (z - MC.cz) * MC.s];
function drawMini() {
  const g = mctx;
  g.clearRect(0, 0, 300, 300);
  g.save();
  g.beginPath();
  g.arc(150, 150, 148, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = '#0B1438';
  g.fillRect(0, 0, 300, 300);
  g.fillStyle = '#9DB0E2';
  for (const h of HOUSES) {
    const [x, y] = toMap(h.x, h.z);
    g.fillStyle = h.kind ? '#FFD23F' : '#9DB0E2';
    g.fillRect(x - 1, y - 1, 2.2, 2.2);
  }
  const [ax, ay] = toMap(ARENA[0], ARENA[2]);
  g.fillStyle = '#7FD8FF';
  g.beginPath();
  g.ellipse(ax, ay, 17 * MC.s, 12 * MC.s, 0, 0, Math.PI * 2);
  g.fill();
  const [mx, my] = toMap(MAN[0], MAN[2]);
  g.fillStyle = '#FFD23F';
  g.beginPath();
  g.arc(mx, my, 5, 0, Math.PI * 2);
  g.fill();
  const [px, py] = toMap(-1.2, -0.8);
  g.fillStyle = '#5B9E6B';
  g.beginPath();
  g.arc(px, py, 4, 0, Math.PI * 2);
  g.fill();
  if (selected) {
    const [sx, sy] = toMap(selected.x, selected.z);
    g.strokeStyle = '#E8384F';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(sx, sy, 7, 0, Math.PI * 2);
    g.stroke();
  }
  const me = walking ? avatar.position : controls.target;
  const [ux, uy] = toMap(me.x, me.z);
  const dir = walking ? avatar.rotation.y : Math.atan2(controls.target.x - camera.position.x, controls.target.z - camera.position.z);
  g.translate(ux, uy);
  g.rotate(-dir + Math.PI);
  g.fillStyle = '#FFFFFF';
  g.strokeStyle = '#E8384F';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, -11);
  g.lineTo(7, 7);
  g.lineTo(0, 3);
  g.lineTo(-7, 7);
  g.closePath();
  g.fill();
  g.stroke();
  g.restore();
}
mini.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  const r = mini.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 300;
  const y = ((e.clientY - r.top) / r.height) * 300;
  const wx = MC.cx + (x - 150) / MC.s;
  const wz = MC.cz + (y - 150) / MC.s;
  if (walking) {
    avatar.position.set(wx, 0, wz);
    return;
  }
  let best = null;
  let bd = 3;
  for (const h of HOUSES) {
    const d = Math.hypot(h.x - wx, h.z - wz);
    if (d < bd) {
      bd = d;
      best = h;
    }
  }
  if (best) {
    flyTo(best);
    openHouseCard(best);
  } else flyCam([wx + 10, 16, wz + 16], [wx, 0, wz]);
});

/* ---------- поиск ---------- */
const q = $('q');
const sugg = $('sugg');
let sIdx = -1;
let sList = [];
function showSugg() {
  const v = norm(q.value);
  if (!v) {
    sugg.style.display = 'none';
    return;
  }
  sList = fol.filter((n) => n.toLowerCase().includes(v)).sort((a, b) => a.toLowerCase().indexOf(v) - b.toLowerCase().indexOf(v) || a.length - b.length).slice(0, 7);
  sIdx = -1;
  sugg.innerHTML = '';
  if (!sList.length) {
    const d = document.createElement('div');
    d.className = 'none';
    d.textContent = `«${v}» деген ник табылган жок. Ник туура жазылганын текшер же жазылгандан кийин кийинки жаңылоону күт 🔑`;
    sugg.appendChild(d);
  } else {
    sList.forEach((n) => {
      const b = document.createElement('button');
      b.textContent = '🏠 ' + n;
      b.onclick = () => pick(n);
      sugg.appendChild(b);
    });
  }
  sugg.style.display = 'block';
}
function pick(n) {
  const h = BY.get(n.toLowerCase());
  sugg.style.display = 'none';
  q.blur();
  if (!h) {
    $('mNoText').textContent = `«${n}» деген ник шаарда жок.`;
    $('mNo').classList.add('show');
    return;
  }
  q.value = h.name;
  if (inside) goOut();
  if (walking) stopWalk(true);
  flyTo(h);
  openHouseCard(h);
  history.replaceState(null, '', '#' + encodeURIComponent(h.name));
}
q.addEventListener('input', showSugg);
q.addEventListener('focus', showSugg);
q.addEventListener('keydown', (e) => {
  const items = [...sugg.querySelectorAll('button')];
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    sIdx = (sIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(1, items.length);
    items.forEach((b, i) => b.classList.toggle('on', i === sIdx));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const v = norm(q.value);
    if (sIdx >= 0 && sList[sIdx]) pick(sList[sIdx]);
    else if (BY.has(v)) pick(v);
    else if (sList.length === 1) pick(sList[0]);
    else if (v) pick(v);
  }
});
$('go').onclick = () => {
  const v = norm(q.value);
  if (BY.has(v)) pick(v);
  else if (sList[0]) pick(sList[0]);
  else if (v) pick(v);
};
document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.search')) sugg.style.display = 'none';
});
$('cClose').onclick = closeCard;
$('bIn').onclick = () => cardShown?.enter && cardShown.enter();
$('bOut').onclick = goOut;
$('bUp').onclick = () => $('mUp').classList.add('show');
$('mClose').onclick = () => $('mUp').classList.remove('show');
$('mNoClose').onclick = () => $('mNo').classList.remove('show');
$('bLink').onclick = async () => {
  const h = cardShown?.house;
  if (!h) return;
  const url = location.origin + location.pathname + '#' + encodeURIComponent(h.name);
  try {
    if (navigator.share) await navigator.share({title: 'Менин үйүм — Окуя-Шаар', text: `Окуя-Шаардагы менин үйүм 🏠 ${h.name}`, url});
    else {
      await navigator.clipboard.writeText(url);
      toast('Шилтеме көчүрүлдү ✅');
    }
  } catch (_) {
    /* отмена */
  }
};

// клик по дому в городе
const ray = new THREE.Raycaster();
let downAt = null;
canvas.addEventListener('pointerdown', (e) => (downAt = [e.clientX, e.clientY]));
canvas.addEventListener('pointerup', (e) => {
  if (inside || walking || !downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  const r = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const p = new THREE.Vector3();
  if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p)) return;
  if (Math.hypot(p.x - MAN[0], p.z - MAN[2]) < 3.2) return goPlace('palace');
  if (Math.hypot((p.x - ARENA[0]) / 17, (p.z - ARENA[2]) / 12) < 1) return goPlace('arena');
  let best = null;
  let bd = 2.2;
  for (const h of HOUSES) {
    const d = Math.hypot(h.x - p.x, h.z - p.z);
    if (d < bd) {
      bd = d;
      best = h;
    }
  }
  if (best) {
    q.value = best.name;
    flyTo(best);
    openHouseCard(best);
    history.replaceState(null, '', '#' + encodeURIComponent(best.name));
  }
});

/* ---------- цикл ---------- */
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 0.8 ? 60 : 50;
  camera.updateProjectionMatrix();
  inCam.aspect = w / h;
  inCam.fov = w / h < 0.8 ? 82 : 62;
  inCam.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

let lastLabels = 0;
let lastArena = 0;
let lastMini = 0;
let prev = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;
  const t = now / 1000;
  if (inside) {
    stepInFly(now);
    inControls.update();
    if (inside.arena) ROOMS.tickArena(t);
    renderer.render(inScene, inCam);
    return;
  }
  stepFly(now);
  if (walking) stepWalk(dt, now);
  else controls.update();
  wheel.rotation.z = t / 2.3;
  const pos = flagGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = flagBase[i * 3];
    const u = (x + 1.5) / 3.0;
    pos.setZ(i, Math.sin(u * 5.5 - t * 7.5) * 0.22 * u + Math.sin(u * 9 - t * 10) * 0.05 * u);
    pos.setY(i, flagBase[i * 3 + 1] - u * u * 0.12);
  }
  pos.needsUpdate = true;
  arenaBand.color.setHSL(((t / 3) % 1 + 0.55) % 1, 0.7, 0.62);
  if (now - lastArena > 120) {
    drawArena(t);
    lastArena = now;
  }
  const sp = snow.geometry.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    let y = sp.getY(i) - 0.05;
    if (y < 0) y = 80;
    sp.setY(i, y);
  }
  sp.needsUpdate = true;
  snow.position.set(camera.position.x, 0, camera.position.z);
  if (marker.visible) {
    beam.material.opacity = 0.14 + 0.08 * Math.sin(t * 3);
    marker.rotation.y = t;
  }
  renderer.render(city, camera);
  if (now - lastLabels > 60) {
    updateLabels();
    lastLabels = now;
  }
  if (mini.classList.contains('show') && now - lastMini > 150) {
    drawMini();
    lastMini = now;
  }
}

/* ---------- старт ---------- */
$('upd').textContent = UPDATED;
requestAnimationFrame(loop);
setTimeout(() => $('loading').classList.add('hide'), 350);
setTimeout(() => ($('loading').style.display = 'none'), 1000);
const fromHash = decodeURIComponent(location.hash.slice(1));
if (fromHash && BY.has(fromHash.toLowerCase())) setTimeout(() => pick(fromHash), 700);
