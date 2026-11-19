// Интерьеры Окуя-Шаара: комнаты дома, дворец bir.okuya.kg, Окуя Арена.
// Каждая комната — отдельная группа, разнесённая по X; камера перелетает между ними.
import * as THREE from 'three';

export function makeRooms(ctx) {
  const {mesh, M, B, textTex, nyTree, flagTex, rnd, GARL, sortedNames} = ctx;

  /* ---------- текстуры ---------- */
  const shyrdak = (c1, c2) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 340;
    const g = c.getContext('2d');
    g.fillStyle = c1;
    g.fillRect(0, 0, 512, 340);
    g.strokeStyle = c2;
    g.lineWidth = 14;
    g.strokeRect(18, 18, 476, 304);
    g.fillStyle = c2;
    const horn = (x, y, s) => {
      g.beginPath();
      g.moveTo(x, y + s);
      g.bezierCurveTo(x - s * 1.2, y + s * 0.2, x - s * 0.9, y - s, x - s * 0.15, y - s * 0.35);
      g.bezierCurveTo(x - s * 0.5, y + s * 0.1, x - s * 0.2, y + s * 0.5, x, y + s * 0.55);
      g.bezierCurveTo(x + s * 0.2, y + s * 0.5, x + s * 0.5, y + s * 0.1, x + s * 0.15, y - s * 0.35);
      g.bezierCurveTo(x + s * 0.9, y - s, x + s * 1.2, y + s * 0.2, x, y + s);
      g.fill();
    };
    horn(256, 150, 70);
    [[110, 110], [402, 110], [110, 250], [402, 250]].forEach(([x, y]) => horn(x, y, 34));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const windowTex = (day) => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#060B24');
    gr.addColorStop(1, '#2B4A8C');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = 'rgba(255,255,255,' + (0.4 + rnd(i + day, 9) * 0.6) + ')';
      g.fillRect(rnd(i + day, 1) * 256, rnd(i + day, 2) * 130, 2, 2);
    }
    g.fillStyle = '#EAF1FF';
    g.beginPath();
    g.moveTo(0, 170);
    g.lineTo(60, 110);
    g.lineTo(110, 160);
    g.lineTo(170, 95);
    g.lineTo(256, 165);
    g.lineTo(256, 190);
    g.lineTo(0, 190);
    g.fill();
    g.fillStyle = '#7E98D6';
    g.fillRect(0, 190, 256, 66);
    for (let i = 0; i < 14; i++) {
      const x = i * 19 + rnd(i, 3) * 6;
      g.fillStyle = '#3A2416';
      g.fillRect(x, 176, 15, 18);
      g.fillStyle = '#FFD27A';
      g.fillRect(x + 4, 181, 6, 6);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const poster = (title, sub, bg, fg) => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 360;
    const g = c.getContext('2d');
    g.fillStyle = bg;
    g.fillRect(0, 0, 256, 360);
    g.fillStyle = fg;
    g.textAlign = 'center';
    g.font = '900 40px Montserrat, Arial';
    title.split('\n').forEach((l, i) => g.fillText(l, 128, 140 + i * 46));
    g.font = '700 22px Montserrat, Arial';
    g.fillText(sub, 128, 300);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  /* ---------- коробка комнаты ---------- */
  function box(g, o) {
    const {W = 5, D = 4.4, H = 2.8, wall = '#E9D7B8', floor = '#8A5A33', win = true, winSide = 'back', light = '#FFD9A0', lamp = 7} = o;
    mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), M({color: floor, roughness: 0.8}), 0, 0, 0, g);
    mesh(new THREE.PlaneGeometry(W, D).rotateX(Math.PI / 2), M({color: '#F4EDE0'}), 0, H, 0, g);
    const wm = M({color: wall, roughness: 0.9});
    const wl = (w, x, z, ry) => {
      const m = mesh(new THREE.PlaneGeometry(w, H), wm, x, H / 2, z, g);
      m.rotation.y = ry;
    };
    wl(W, 0, -D / 2, 0);
    wl(W, 0, D / 2, Math.PI);
    wl(D, -W / 2, 0, Math.PI / 2);
    wl(D, W / 2, 0, -Math.PI / 2);
    mesh(new THREE.BoxGeometry(W, 0.12, 0.02), M({color: '#B8342F'}), 0, 0.06, -D / 2 + 0.01, g);
    if (win) {
      const wx = winSide === 'back' ? -0.9 : 0;
      mesh(new THREE.PlaneGeometry(1.4, 1.1), B({map: windowTex(Math.floor(rnd(W * 10 + D, 3) * 50))}), wx, 1.6, -D / 2 + 0.02, g);
      mesh(new THREE.BoxGeometry(1.5, 0.06, 0.08), M({color: '#F4F0E4'}), wx, 1.02, -D / 2 + 0.05, g);
      mesh(new THREE.BoxGeometry(0.05, 1.1, 0.04), M({color: '#F4F0E4'}), wx, 1.6, -D / 2 + 0.04, g);
    }
    const pl = new THREE.PointLight(light, lamp, 12);
    pl.position.set(0, H - 0.7, 0);
    g.add(pl);
    mesh(new THREE.SphereGeometry(0.12, 12, 10), B({color: '#FFF2C0'}), 0, H - 0.15, 0, g);
    return {W, D, H};
  }
  const plaque = (g, text, x, y, z, ry = 0, w = 1.5) => {
    const m = mesh(new THREE.PlaneGeometry(w, w * 0.24), B({map: textTex(text, '#1A1F36', '#FFD23F', 768, 180, 80)}), x, y, z, g);
    m.rotation.y = ry;
    return m;
  };
  const rug = (g, c1, c2, w = 2.6, d = 1.7, x = 0, z = 0.2) => mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), M({map: shyrdak(c1, c2)}), x, 0.01, z, g);
  const tableTea = (g, x, z) => {
    const t = new THREE.Group();
    t.position.set(x, 0, z);
    mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 24), M({color: '#7A4A28'}), 0, 0.32, 0, t);
    [0, 1, 2, 3].forEach((i) => mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), M({color: '#5A3326'}), Math.cos(i * 1.57 + 0.78) * 0.4, 0.15, Math.sin(i * 1.57 + 0.78) * 0.4, t));
    mesh(new THREE.SphereGeometry(0.13, 14, 10), M({color: '#F4F4F4'}), 0, 0.44, 0, t);
    [0, 1, 2, 3].forEach((i) => mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.05, 12), M({color: '#3F7FB5'}), Math.cos(i * 1.57) * 0.35, 0.37, Math.sin(i * 1.57) * 0.35, t));
    mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16), M({color: '#D9A062'}), 0.18, 0.37, -0.15, t);
    g.add(t);
  };
  const toshok = (g, x, z, ry, color) => {
    const m = mesh(new THREE.BoxGeometry(0.6, 0.12, 1.6), M({color}), x, 0.06, z, g);
    m.rotation.y = ry;
  };

  /* ---------- комнаты дома ---------- */
  const R = {
    living(g, h, rich) {
      box(g, {wall: rich ? '#F3E3C2' : ['#E9D7B8', '#D9E4EE', '#E8D4D4', '#DCE8D6'][h.id % 4]});
      rug(g, rich ? '#7A1E1E' : '#B8342F', rich ? '#E7B12F' : '#F4E3BD');
      tableTea(g, 0, 0.3);
      toshok(g, -1.25, 0.3, 0, '#B8342F');
      toshok(g, 1.25, 0.3, 0, '#3F7FB5');
      plaque(g, h.name, 1.1, 2.15, -2.18);
      // телевизор
      mesh(new THREE.BoxGeometry(1.3, 0.75, 0.06), M({color: '#10162E'}), 1.15, 1.25, -2.15, g);
      mesh(new THREE.PlaneGeometry(1.2, 0.66), B({map: poster('ОКУЯ-\nШААР', 'bir.okuya.kg', '#1A2A66', '#FFD23F')}), 1.15, 1.25, -2.11, g);
      mesh(new THREE.BoxGeometry(1.5, 0.45, 0.4), M({color: '#7A4A28'}), 1.15, 0.23, -1.95, g);
      nyTree(g, -1.95, -1.65, 0.27);
      const fl = mesh(new THREE.PlaneGeometry(0.6, 0.36), M({map: flagTex}), 2.0, 1.6, 2.18, g);
      fl.rotation.y = Math.PI;
      if (rich) {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          mesh(new THREE.SphereGeometry(0.06, 8, 8), B({color: '#FFF2C0'}), Math.cos(a) * 0.35, 2.4, Math.sin(a) * 0.35, g);
        }
        mesh(new THREE.TorusGeometry(0.35, 0.025, 8, 30).rotateX(Math.PI / 2), M({color: '#E7B12F', metalness: 0.8, roughness: 0.2}), 0, 2.4, 0, g);
      }
      return {pos: [2.05, 1.75, 1.95], target: [-0.5, 0.95, -0.6]};
    },
    kitchen(g, h) {
      box(g, {wall: '#F2EEE4', floor: '#C9B79A'});
      // столешница + плита + холодильник
      mesh(new THREE.BoxGeometry(2.8, 0.9, 0.6), M({color: '#F4F4F4'}), -0.6, 0.45, -1.9, g);
      mesh(new THREE.BoxGeometry(2.8, 0.05, 0.62), M({color: '#7A4A28'}), -0.6, 0.92, -1.9, g);
      mesh(new THREE.BoxGeometry(0.6, 1.9, 0.6), M({color: '#E4E8F0', metalness: 0.3, roughness: 0.4}), 1.6, 0.95, -1.9, g);
      [-1.5, -1.1].forEach((x) => mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), B({color: '#FF6A2A'}), x, 0.96, -1.85, g));
      // казан
      mesh(new THREE.SphereGeometry(0.25, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M({color: '#2A2A30', metalness: 0.6}), -1.3, 1.2, -1.85, g);
      // самоор
      const sm = new THREE.Group();
      sm.position.set(0.3, 0.95, -1.9);
      mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 16), M({color: '#D9A62E', metalness: 0.8, roughness: 0.2}), 0, 0.21, 0, sm);
      mesh(new THREE.ConeGeometry(0.12, 0.18, 16), M({color: '#D9A62E', metalness: 0.8, roughness: 0.2}), 0, 0.5, 0, sm);
      g.add(sm);
      // стол + нан
      mesh(new THREE.BoxGeometry(1.4, 0.06, 0.9), M({color: '#7A4A28'}), 0, 0.75, 0.6, g);
      [[-0.6, 0.25], [0.6, 0.25], [-0.6, 0.95], [0.6, 0.95]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(0.06, 0.75, 0.06), M({color: '#5A3326'}), x, 0.37, z, g));
      [-0.3, 0.3].forEach((x) => mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20), M({color: '#D9A062'}), x, 0.81, 0.6, g));
      mesh(new THREE.SphereGeometry(0.1, 10, 8), M({color: '#E8384F'}), 0, 0.85, 0.75, g);
      [-0.95, 0.95].forEach((x) => {
        mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), M({color: '#8A5630'}), x, 0.45, 0.6, g);
        mesh(new THREE.BoxGeometry(0.45, 0.5, 0.05), M({color: '#8A5630'}), x + (x > 0 ? 0.2 : -0.2), 0.7, 0.6, g).rotation.y = Math.PI / 2;
      });
      plaque(g, 'Ашкана', -1.4, 2.2, 2.18, Math.PI, 1.2);
      return {pos: [1.9, 1.8, 1.9], target: [-0.6, 0.9, -1.0]};
    },
    bedroom(g, h, rich) {
      box(g, {wall: rich ? '#EBD4E6' : '#DCE4F2', floor: '#9A6A43'});
      rug(g, '#2D6BD8', '#F4E3BD', 2.0, 1.4, 0.3, 0.6);
      mesh(new THREE.BoxGeometry(1.6, 0.45, 2.0), M({color: '#F4F0E4'}), -1.4, 0.23, -0.9, g);
      mesh(new THREE.BoxGeometry(1.6, 0.14, 1.5), M({color: rich ? '#7A3FB0' : '#5B9E6B'}), -1.4, 0.52, -0.65, g);
      mesh(new THREE.BoxGeometry(1.4, 0.18, 0.4), M({color: '#FFFFFF'}), -1.4, 0.55, -1.7, g);
      mesh(new THREE.BoxGeometry(1.7, 1.0, 0.1), M({color: '#7A4A28'}), -1.4, 0.8, -1.93, g);
      // шкаф
      mesh(new THREE.BoxGeometry(1.2, 2.1, 0.55), M({color: '#8A5630'}), 1.8, 1.05, -1.9, g);
      mesh(new THREE.BoxGeometry(0.02, 1.9, 0.02), M({color: '#3A2412'}), 1.8, 1.05, -1.62, g);
      // тумбочка + ночник
      mesh(new THREE.BoxGeometry(0.45, 0.5, 0.4), M({color: '#7A4A28'}), -0.35, 0.25, -1.85, g);
      mesh(new THREE.SphereGeometry(0.1, 10, 8), B({color: '#FFE29A'}), -0.35, 0.62, -1.85, g);
      plaque(g, h.name, 0.6, 2.15, -2.18, 0, 1.3);
      return {pos: [2.0, 1.7, 1.9], target: [-0.8, 0.7, -0.9]};
    },
    kids(g, h) {
      box(g, {wall: '#FFE9A8', floor: '#B58A5C'});
      mesh(new THREE.BoxGeometry(1.3, 0.06, 0.6), M({color: '#F4F4F4'}), 1.2, 0.75, -1.9, g);
      mesh(new THREE.BoxGeometry(0.7, 0.45, 0.04), M({color: '#10162E'}), 1.2, 1.05, -2.05, g);
      mesh(new THREE.PlaneGeometry(0.64, 0.4), B({map: poster('КОМПЬЮТЕР', '', '#2D6BD8', '#FFFFFF')}), 1.2, 1.05, -2.02, g);
      mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), M({color: '#E8384F'}), 1.2, 0.45, -1.35, g);
      [[-1.2, '#E8384F'], [0, '#3F7FB5'], [1.2, '#5B9E6B']].forEach(([x, c], i) => {
        mesh(new THREE.PlaneGeometry(0.6, 0.84), B({map: poster(['КӨК\nБӨРҮ', 'ЖУГУУ', '13-\nБӨЛМӨ'][i], 'bir.okuya.kg', c, '#FFFFFF')}), x, 1.8, 2.18, g).rotation.y = Math.PI;
      });
      // мяч, игрушки
      mesh(new THREE.SphereGeometry(0.2, 16, 12), M({color: '#FF7AE0'}), -0.4, 0.2, 0.4, g);
      mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), M({color: '#FFD23F'}), 0.2, 0.15, 0.9, g);
      mesh(new THREE.BoxGeometry(1.0, 0.35, 1.8), M({color: '#3F7FB5'}), -1.8, 0.18, -0.8, g);
      return {pos: [-1.9, 1.7, -1.7], target: [0.6, 1.1, 0.9]};
    },
    terrace(g, h) {
      mesh(new THREE.PlaneGeometry(5, 4).rotateX(-Math.PI / 2), M({color: '#C8CED8'}), 0, 0, 0, g);
      for (let i = -2; i <= 2; i++) mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), M({color: '#F4F8FF'}), i, 0.45, -1.95, g);
      mesh(new THREE.BoxGeometry(5, 0.06, 0.06), M({color: '#F4F8FF'}), 0, 0.92, -1.95, g);
      // вид на город — большое «окно»
      const v = mesh(new THREE.PlaneGeometry(14, 7), B({map: windowTex(h.id + 77)}), 0, 2.6, -5, g);
      void v;
      mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), M({color: '#7A4A28'}), 1.4, 0.23, 0.6, g);
      mesh(new THREE.SphereGeometry(0.4, 14, 12), M({color: '#F7FAFF'}), -1.4, 0.4, 0.6, g);
      mesh(new THREE.SphereGeometry(0.28, 14, 12), M({color: '#F7FAFF'}), -1.4, 0.95, 0.6, g);
      plaque(g, h.name, 0, 0.5, 1.95, Math.PI, 1.6);
      const pl = new THREE.PointLight('#BFD3FF', 6, 12);
      pl.position.set(0, 3, 1);
      g.add(pl);
      return {pos: [0.3, 1.7, 1.9], target: [0, 1.2, -3]};
    },
    shop(g, h) {
      box(g, {wall: '#F4E3BD', floor: '#C9B79A'});
      for (let r = 0; r < 3; r++) {
        mesh(new THREE.BoxGeometry(3.6, 0.05, 0.4), M({color: '#7A4A28'}), 0, 0.5 + r * 0.55, -2.0, g);
        for (let i = 0; i < 12; i++) mesh(new THREE.BoxGeometry(0.2, 0.26, 0.18), M({color: GARL[(i + r) % 5]}), -1.65 + i * 0.3, 0.66 + r * 0.55, -2.0, g);
      }
      mesh(new THREE.BoxGeometry(2.0, 1.0, 0.6), M({color: '#B8342F'}), 0.6, 0.5, 0.6, g);
      mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), M({color: '#10162E'}), 0.9, 1.15, 0.6, g);
      plaque(g, 'ДҮКӨН · ' + h.name, 0, 2.3, 2.18, Math.PI, 2.2);
      return {pos: [1.9, 1.8, 1.9], target: [-0.3, 0.9, -1.2]};
    },
  };

  /* ---------- дворец bir.okuya.kg ---------- */
  const P = {
    hall(g) {
      box(g, {W: 9, D: 7, H: 4.2, wall: '#F3E7C9', floor: '#E8DCC2', win: false, lamp: 22});
      mesh(new THREE.PlaneGeometry(2.2, 6.4).rotateX(-Math.PI / 2), M({color: '#B8342F'}), 0, 0.01, 0, g);
      [-3.4, -1.7, 1.7, 3.4].forEach((x) => [-2.6, 2.6].forEach((z) => mesh(new THREE.CylinderGeometry(0.2, 0.24, 4.2, 14), M({color: '#FFFFFF'}), x, 2.1, z, g)));
      // люстра
      mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 40).rotateX(Math.PI / 2), M({color: '#E7B12F', metalness: 0.8, roughness: 0.2}), 0, 3.4, 0, g);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        mesh(new THREE.SphereGeometry(0.08, 8, 8), B({color: '#FFF2C0'}), Math.cos(a) * 0.9, 3.4, Math.sin(a) * 0.9, g);
      }
      // флаг на стене + герб-надпись
      mesh(new THREE.PlaneGeometry(2.4, 1.44), M({map: flagTex}), 0, 2.6, -3.48, g);
      plaque(g, 'bir.okuya.kg', 0, 1.3, -3.48, 0, 3.2);
      // трон-кресло
      mesh(new THREE.BoxGeometry(1.0, 0.5, 0.8), M({color: '#7A1E1E'}), 0, 0.25, -2.6, g);
      mesh(new THREE.BoxGeometry(1.0, 1.3, 0.15), M({color: '#D9A62E', metalness: 0.7, roughness: 0.3}), 0, 0.9, -3.0, g);
      nyTree(g, -3.6, -2.6, 0.45);
      nyTree(g, 3.6, -2.6, 0.45);
      return {pos: [0, 1.8, 3.2], target: [0, 1.8, -3]};
    },
    studio(g) {
      box(g, {W: 6, D: 5, H: 3.2, wall: '#1A1F36', floor: '#2A2F46', win: false, light: '#BFD3FF', lamp: 6});
      // стол с мониторами — ролики сериала
      mesh(new THREE.BoxGeometry(3.2, 0.06, 0.9), M({color: '#F4F4F4'}), 0, 0.8, -1.7, g);
      [['ОКУЯ-\nАЙЫЛ', '1-серия', '#2B4A8C'], ['КАР\nБАСТЫ', '3-серия', '#E8384F'], ['ОКУЯ-\nШААР', '4-серия', '#D9A62E']].forEach(([t, s, c], i) => {
        const x = -1.1 + i * 1.1;
        mesh(new THREE.BoxGeometry(0.95, 0.6, 0.04), M({color: '#10162E'}), x, 1.25, -2.0, g);
        mesh(new THREE.PlaneGeometry(0.88, 0.54), B({map: poster(t, s, c, '#FFFFFF')}), x, 1.25, -1.97, g);
      });
      // кольцевая лампа + штатив с телефоном
      mesh(new THREE.TorusGeometry(0.35, 0.04, 8, 30), B({color: '#FFFFFF'}), 1.9, 1.6, -0.6, g);
      mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 6), M({color: '#5A6078'}), 1.9, 0.8, -0.6, g);
      mesh(new THREE.BoxGeometry(0.16, 0.3, 0.02), M({color: '#10162E'}), 1.9, 1.6, -0.6, g);
      // кресло
      mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), M({color: '#E8384F'}), 0, 0.5, -1.0, g);
      mesh(new THREE.BoxGeometry(0.6, 0.7, 0.08), M({color: '#E8384F'}), 0, 0.85, -0.72, g);
      // неон
      mesh(new THREE.PlaneGeometry(2.6, 0.6), B({map: textTex('СТУДИЯ', '#1A1F36', '#7FD8FF', 768, 180, 110)}), 0, 2.5, -2.48, g);
      return {pos: [1.8, 1.9, 2.1], target: [-0.3, 1.0, -1.6]};
    },
    wall(g) {
      box(g, {W: 9, D: 5, H: 4, wall: '#0B1438', floor: '#1A2A66', win: false, light: '#FFE2A0', lamp: 14});
      // стена со всеми никами
      const c = document.createElement('canvas');
      c.width = 2048;
      c.height = 900;
      const x = c.getContext('2d');
      x.fillStyle = '#0B1438';
      x.fillRect(0, 0, 2048, 900);
      x.fillStyle = '#FFD23F';
      x.font = '900 64px Montserrat, Arial';
      x.textAlign = 'center';
      x.fillText('ОКУЯ-ШААРДЫН ТУРГУНДАРЫ 💛', 1024, 80);
      x.font = '700 11px Montserrat, Arial';
      x.textAlign = 'left';
      const cols = 14;
      const per = Math.ceil(sortedNames.length / cols);
      sortedNames.forEach((n, i) => {
        const col = Math.floor(i / per);
        const row = i % per;
        x.fillStyle = i % 7 === 0 ? '#FFD23F' : '#FFFFFF';
        x.fillText(n, 16 + col * 146, 120 + row * 11.6);
      });
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      mesh(new THREE.PlaneGeometry(8.6, 3.78), B({map: t}), 0, 2.0, -2.47, g);
      return {pos: [0, 1.9, 2.0], target: [0, 1.9, -2.5]};
    },
    terrace(g) {
      return R.terrace(g, {id: 900, name: 'bir.okuya.kg'});
    },
  };

  /* ---------- Окуя Арена изнутри ---------- */
  const scr = (() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 288;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return {c, t};
  })();
  const beams = [];
  function arena(g) {
    g.add(new THREE.AmbientLight('#6C80C0', 0.6));
    const rx = 15;
    const rz = 10;
    const fl = mesh(new THREE.CircleGeometry(rx, 48).rotateX(-Math.PI / 2), M({color: '#9CC4F0', roughness: 0.2, metalness: 0.2}), 0, 0, 0, g);
    fl.scale.set(1, 1, rz / rx);
    // трибуны рядами
    const seat = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    const seats = [];
    for (let r = 0; r < 9; r++) {
      const k = 1.08 + r * 0.075;
      const n = Math.floor(90 + r * 10);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        if (Math.abs(Math.sin(a)) < 0.35 && Math.cos(a) < 0) continue; // место сцены
        seats.push([Math.cos(a) * rx * k, 0.3 + r * 0.55, Math.sin(a) * rz * k, i + r * 7]);
      }
    }
    const im = new THREE.InstancedMesh(seat, M({roughness: 0.8}), seats.length);
    const m4 = new THREE.Matrix4();
    const col = new THREE.Color();
    seats.forEach(([x, y, z, s], i) => {
      im.setMatrixAt(i, m4.makeTranslation(x, y, z));
      im.setColorAt(i, col.set(rnd(s, 5) > 0.5 ? GARL[s % 5] : '#2D3A6B'));
    });
    g.add(im);
    // сцена
    mesh(new THREE.BoxGeometry(6, 1.0, 4), M({color: '#1A1F36'}), -rx + 3.5, 0.5, 0, g);
    mesh(new THREE.BoxGeometry(0.3, 6, 6), M({color: '#10162E'}), -rx + 1.3, 3, 0, g);
    const sc = mesh(new THREE.PlaneGeometry(5.6, 3.15), B({map: scr.t}), -rx + 1.5, 3.6, 0, g);
    sc.rotation.y = Math.PI / 2;
    // прожекторы
    for (let i = 0; i < 6; i++) {
      const b = mesh(new THREE.CylinderGeometry(0.1, 1.6, 14, 12, 1, true), B({color: GARL[i % 5], transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide}), -rx + 3.5 + (i - 2.5) * 0.6, 8, -2 + (i % 2) * 4, g);
      beams.push(b);
    }
    const pl = new THREE.PointLight('#BFE6FF', 40, 40);
    pl.position.set(0, 10, 0);
    g.add(pl);
    // купол
    const roof = mesh(new THREE.SphereGeometry(rx * 1.8, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), M({color: '#0B1438', side: THREE.BackSide}), 0, 0, 0, g);
    roof.scale.set(1, 0.6, rz / rx);
    plaque(g, 'OKUYA ARENA', 0, 0.02, 0, 0, 6).rotation.x = -Math.PI / 2;
    return {pos: [9, 6.5, 8], target: [-8, 2.5, 0]};
  }
  function tickArena(t) {
    const g = scr.c.getContext('2d');
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
    scr.t.needsUpdate = true;
    beams.forEach((b, i) => {
      b.rotation.z = Math.sin(t * 0.8 + i) * 0.45;
      b.rotation.x = Math.cos(t * 0.6 + i * 1.3) * 0.3;
    });
  }

  /** Список комнат для места: [{name, build(group) → {pos,target}}] */
  function plan(kind, h) {
    if (kind === 'palace-main') return [['🏛 Чоң зал', P.hall], ['🎬 Студия', P.studio], ['💛 Тургундар', P.wall], ['🌃 Терраса', P.terrace]];
    if (kind === 'arena') return [['🏟 Арена', arena]];
    const rich = h.kind === 'palace' || h.kind === 'special';
    const list = [];
    if (h.kind === 'shop') list.push(['🛒 Дүкөн', (g) => R.shop(g, h)]);
    list.push(['🛋 Конок бөлмө', (g) => R.living(g, h, rich)]);
    list.push(['🍲 Ашкана', (g) => R.kitchen(g, h)]);
    list.push(['🛏 Уктоочу', (g) => R.bedroom(g, h, rich)]);
    if (h.floors >= 2 || rich) list.push(['🎮 2-кабат', (g) => R.kids(g, h)]);
    if (h.floors >= 3 || rich) list.push(['🌃 Терраса', (g) => R.terrace(g, h)]);
    return list;
  }
  return {plan, tickArena};
}
