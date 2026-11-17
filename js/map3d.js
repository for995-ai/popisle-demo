// 3D learning atlas: chunky low-poly islands on a toy ocean. Sail the paper boat (click an island, or arrow keys / WASD)
// and dock at an island to enter its pop-up book. Islands without material are blueprint "ghosts" that rise when generated.
window.Map3D = function (api) {
'use strict';
const $ = id => document.getElementById(id);
const canvas = $('map3d'), wrap = $('scrMap'), labelsEl = $('mapLabels');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0xbfe9ff); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xd8f3ff, 46, 92);
{const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#58b8f5'); g.addColorStop(.55, '#bfe9ff'); g.addColorStop(1, '#e9f9ff'); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t;}
const camera = new THREE.PerspectiveCamera(38, 1, .1, 200);
scene.add(new THREE.HemisphereLight(0xfff8ee, 0x2f7fb8, 1.15));
const sun = new THREE.DirectionalLight(0xffe9c4, 2.3); sun.position.set(9, 18, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 60}); sun.shadow.bias = -.0008; sun.shadow.normalBias = .03; scene.add(sun);

// ---- tiny modelling kit -------------------------------------------------------------------------------------
const mats = {};
const mat = (hex, o) => {const k = hex + JSON.stringify(o || 0); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({color: hex, flatShading: true, roughness: .85}, o || {})));};
const G = {box: (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl: (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s), cone: (r, h, s = 6) => new THREE.ConeGeometry(r, h, s), sph: (r, d = 1) => new THREE.IcosahedronGeometry(r, d)};
function put(parent, geo, color, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(geo, mat(color, o.mat)); m.position.set(x, y, z); if (o.r) m.rotation.set(o.r[0], o.r[1], o.r[2]); if (o.s) Array.isArray(o.s) ? m.scale.set(o.s[0], o.s[1], o.s[2]) : m.scale.setScalar(o.s);
  m.castShadow = !o.noShadow; m.receiveShadow = true; parent.add(m); return m;
}
const grp = (parent, x = 0, y = 0, z = 0, ry = 0) => {const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g;};
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const easeOutBack = x => {const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);};
const clamp01 = x => Math.max(0, Math.min(1, x));

function baseGeo(R) {
  const pts = [[.01, -1.7], [R * .5, -1.6], [R * .86, -.8], [R * 1.05, -.14], [R * 1.02, .08], [R * .92, .2], [R * .62, .3], [.01, .34]].map(p => new THREE.Vector2(p[0], p[1]));
  const g = new THREE.LatheGeometry(pts, 16), pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {const x = pos.getX(i), z = pos.getZ(i), a = Math.atan2(z, x), k = 1 + .08 * Math.sin(a * 3 + R) + .05 * Math.sin(a * 5 + 1.3); pos.setX(i, x * k); pos.setZ(i, z * k);}
  return g;
}
function colorBase(g, top, rim) {
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {const y = pos.getY(i); c.set(y < -1.2 ? 0x5f4733 : y < -.5 ? 0x7a5c40 : y < -.1 ? 0xa98258 : y < .15 ? rim : top); if (y >= .15 && i % 3 === 0) c.offsetHSL(0, .03, -.035); col.set([c.r, c.g, c.b], i * 3);}
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
const tree = (p, x, z, s = 1) => {const g = grp(p, x, .3, z); put(g, G.cyl(.07 * s, .09 * s, .4 * s, 6), 0x7a5a3a, 0, .2 * s, 0); put(g, G.sph(.36 * s), 0x4fae62, 0, .62 * s, 0); put(g, G.sph(.24 * s), 0x66c477, .12 * s, .86 * s, .05); return g;};
const pine = (p, x, z, s = 1) => {const g = grp(p, x, .3, z); put(g, G.cyl(.06 * s, .08 * s, .3 * s, 6), 0x7a5a3a, 0, .15 * s, 0); put(g, G.cone(.36 * s, .6 * s, 6), 0x3f8f5a, 0, .55 * s, 0); put(g, G.cone(.27 * s, .5 * s, 6), 0x4aa367, 0, .9 * s, 0); return g;};
const rock = (p, x, y, z, s) => put(p, new THREE.DodecahedronGeometry(s, 0), 0x8d949c, x, y, z, {r: [rnd() * 3, rnd() * 3, 0], s: [1, .7, 1]});
function palm(p, x, z, s = 1) {
  const g = grp(p, x, .3, z, rnd() * 6); put(g, G.cyl(.06 * s, .1 * s, 1.1 * s, 6), 0xb08a5a, .08 * s, .55 * s, 0, {r: [0, 0, -.14]});
  for (let i = 0; i < 6; i++) {const l = grp(g, .16 * s, 1.1 * s, 0, i * Math.PI / 3); put(l, G.cone(.13 * s, .8 * s, 4), i % 2 ? 0x3f9a5c : 0x56b371, .3 * s, -.06 * s, 0, {r: [0, 0, -1.95], s: [1, 1, .45]});}
  return g;
}

// ---- island themes --------------------------------------------------------------------------------------------
const THEMES = {
  boat(g, anim) {   // 國文：三國水岸
    put(g, G.cyl(1.3, 1.42, .22, 8), 0xe9dcc0, -.5, .42, -.5);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(g, G.cyl(.09, .09, 1.1, 6), 0xc8402f, -.5 + a * .72, 1.06, -.5 + b * .72);
    put(g, G.box(2.3, .09, 2.3), 0xe8c46a, -.5, 1.64, -.5); put(g, G.cone(1.62, .72, 4), 0x2f5d6b, -.5, 2.03, -.5, {r: [0, Math.PI / 4, 0]});
    put(g, G.box(1.1, .07, 1.1), 0xe8c46a, -.5, 2.42, -.5); put(g, G.cone(.82, .5, 4), 0x2f5d6b, -.5, 2.7, -.5, {r: [0, Math.PI / 4, 0]}); put(g, G.sph(.13), 0xe8c46a, -.5, 3.02, -.5);
    put(g, G.cyl(.34, .34, .38, 10), 0xb8342a, -.5, .72, -.5); put(g, G.cyl(.29, .29, .03, 10), 0xf3e6c8, -.5, .92, -.5);
    put(g, G.cyl(.04, .05, 1.9, 6), 0x6b4a2f, 1.5, 1.25, -1.3); const flag = put(g, G.box(.8, .46, .04), 0xd2402f, 1.92, 1.92, -1.3); anim.push(t => {flag.rotation.y = Math.sin(t * 3) * .25; flag.position.z = -1.3 + Math.sin(t * 3) * .08;});
    for (let i = 0; i < 7; i++) {const x = -2 + rnd() * .9, z = .9 + rnd() * 1.1, h = 1.1 + rnd() * .9; put(g, G.cyl(.045, .06, h, 5), 0x6cc06a, x, .3 + h / 2, z, {r: [0, 0, (rnd() - .5) * .2]}); put(g, G.cone(.24, .55, 5), 0x4fa85a, x, .3 + h + .12, z);}
    for (const [x, z] of [[.95, .7], [1.75, -.1]]) {put(g, G.cyl(.035, .035, .9, 5), 0x6b4a2f, x, .75, z); put(g, G.sph(.17), 0xe85a45, x, 1.3, z, {mat: {emissive: 0xe85a45, emissiveIntensity: .5}});}
    const b = grp(g, 1.25, .02, 2.75, .5); put(b, G.box(.62, .26, 1.5), 0x6b4a2f, 0, .16, 0); put(b, G.cone(.36, .55, 4), 0x6b4a2f, 0, .16, 1, {r: [Math.PI / 2, Math.PI / 4, 0], s: [1, 1, .55]}); put(b, G.cone(.36, .55, 4), 0x6b4a2f, 0, .16, -1, {r: [-Math.PI / 2, Math.PI / 4, 0], s: [1, 1, .55]});
    for (let i = 0; i < 4; i++) {put(b, G.cyl(.1, .13, .42, 6), 0xdcc27a, (i % 2 ? .16 : -.16), .5, -.5 + i * .33); put(b, G.sph(.1), 0xdcc27a, (i % 2 ? .16 : -.16), .8, -.5 + i * .33);}
    for (let i = 0; i < 5; i++) put(b, G.cyl(.012, .012, .5, 4), 0x3a2a1c, -.25 + rnd() * .5, .7, -.5 + rnd(), {r: [rnd() * .6, 0, .9 + rnd() * .5]});
    anim.push(t => {b.position.y = .02 + Math.sin(t * 1.7) * .05; b.rotation.z = Math.sin(t * 1.3) * .05;});
    tree(g, 1.9, 1.3, .9); tree(g, -2.1, -1.4, 1.1); rock(g, .2, .42, 1.9, .28);
  },
  water(g, anim) {   // 自然：高山、雲、河
    put(g, G.cone(1.75, 2.7, 7), 0x6fae7a, -.5, 1.65, -.7); put(g, G.cone(.63, .98, 7), 0xffffff, -.5, 2.52, -.7); put(g, G.cone(1.15, 1.7, 6), 0x86c28f, 1, 1.15, -1.2); put(g, G.cone(.4, .6, 6), 0xffffff, 1, 1.71, -1.2);
    const curve = new THREE.CatmullRomCurve3([[-.35, 1.5, .25], [-.1, .8, .8], [.55, .42, 1.3], [.25, .36, 2.1], [.8, .2, 3.1]].map(p => new THREE.Vector3(p[0], p[1], p[2])));
    put(g, new THREE.TubeGeometry(curve, 16, .17, 5), 0x4fb6ee, 0, 0, 0, {mat: {roughness: .3}, noShadow: true});
    pine(g, -2, .4, 1.1); pine(g, -1.6, 1.3, .9); pine(g, 1.9, .3, 1); pine(g, 2.2, -.7, .8); pine(g, -.9, 1.9, .8); tree(g, 1.5, 1.9, .8);
    put(g, G.box(.62, .46, .52), 0xfbf0d8, 1.55, .55, .9); put(g, G.cone(.56, .4, 4), 0xd9604c, 1.55, .98, .9, {r: [0, Math.PI / 4, 0]});
    for (let i = 0; i < 8; i++) put(g, G.sph(.07), [0xffd1e0, 0xfff2a8, 0xffffff][i % 3], -1.4 + rnd() * 1.2, .36, 2 + rnd() * .8, {noShadow: true});
    const c = grp(g, .5, 3.9, .3); for (const [x, y, z, r] of [[0, 0, 0, .55], [.55, -.06, .1, .4], [-.5, -.08, 0, .42], [.1, .26, -.1, .38]]) put(c, G.sph(r), 0xffffff, x, y, z);
    const drops = []; for (let i = 0; i < 7; i++) drops.push(put(g, G.sph(.07), 0x4fb6ee, 0, 0, 0, {noShadow: true}));
    anim.push(t => {c.position.x = .5 + Math.sin(t * .4) * .7; c.position.y = 3.9 + Math.sin(t * 1.1) * .1; drops.forEach((d, i) => {const k = (t * .7 + i / 7) % 1; d.position.set(c.position.x - .5 + (i * .37) % 1, c.position.y - .4 - k * 2.4, .3 + ((i * .61) % 1 - .5) * .5); d.scale.setScalar(1 - k * .5);});});
    const s = grp(g, -2.4, 4.6, -1.6); put(s, G.sph(.5), 0xffd84a, 0, 0, 0, {mat: {emissive: 0xffc93a, emissiveIntensity: .6}, noShadow: true}); for (let i = 0; i < 8; i++) {const a = i * Math.PI / 4; put(s, G.cone(.1, .3, 4), 0xffd84a, Math.cos(a) * .75, Math.sin(a) * .75, 0, {r: [0, 0, a - Math.PI / 2], noShadow: true, mat: {emissive: 0xffc93a, emissiveIntensity: .6}});}
    anim.push(t => {s.rotation.z = t * .4;});
  },
  silk(g, anim) {   // 社會：絲路
    for (const [x, z, sx] of [[-1.6, .8, 1.3], [1.3, -1.5, 1.1], [.2, 2, 1.2]]) put(g, G.sph(1), 0xe2b06c, x, .2, z, {s: [sx, .34, .9]});
    put(g, G.box(2.3, .9, .5), 0x9a948c, -.7, .78, -1.3); for (let i = 0; i < 6; i++) put(g, G.box(.22, .18, .52), 0x857f77, -1.7 + i * .4, 1.32, -1.3);
    put(g, G.box(.5, .62, .54), 0x3a2a22, -.7, .62, -1.3); put(g, G.box(1.25, .5, .62), 0xc8402f, -.7, 1.66, -1.3); put(g, G.cone(1.1, .48, 4), 0x3e3a44, -.7, 2.15, -1.3, {r: [0, Math.PI / 4, 0], s: [1, 1, .62]});
    put(g, G.cyl(.035, .035, 1, 5), 0x6b4a2f, .35, 2, -1.3); const flag = put(g, G.box(.5, .3, .04), 0xd2402f, .62, 2.34, -1.3); anim.push(t => {flag.rotation.y = Math.sin(t * 3.2) * .25;});
    put(g, G.cyl(.62, .62, .05, 12), 0x4fb6ee, 1.6, .33, 1.1, {mat: {roughness: .3}, noShadow: true}); palm(g, 2.2, 1.4, 1.1); palm(g, 1.2, 1.8, .9); palm(g, 2.2, .5, .8);
    put(g, G.cone(.6, .75, 6), 0xf3e2b8, 1.7, .68, -.5); put(g, G.cone(.2, .26, 6), 0xd98a3a, 1.7, 1.12, -.5);
    const camel = (color, ph) => {
      const c = grp(g, 0, .3, 0); put(c, G.box(.3, .32, .72), 0xc9945a, 0, .62, 0); put(c, G.sph(.17), 0xc9945a, 0, .86, .18); put(c, G.sph(.17), 0xc9945a, 0, .86, -.18);
      const legs = [[.1, .25], [-.1, .25], [.1, -.25], [-.1, -.25]].map(([x, z]) => put(c, G.box(.07, .46, .07), 0xb07f48, x, .26, z));
      put(c, G.box(.1, .42, .1), 0xc9945a, 0, .86, .44, {r: [.5, 0, 0]}); put(c, G.box(.14, .14, .24), 0xc9945a, 0, 1.06, .6); put(c, G.box(.36, .14, .22), color, 0, .9, 0);
      anim.push(t => {const a = t * .28 + ph; c.position.set(-.3 + Math.cos(a) * 1.05, .3 + Math.abs(Math.sin(t * 5 + ph)) * .03, .7 + Math.sin(a) * .75); c.rotation.y = -a; legs.forEach((l, i) => l.rotation.x = Math.sin(t * 5 + ph + (i % 3 ? 0 : Math.PI)) * .4);});
    };
    camel(0xd9485a, 0); camel(0x4a8fd0, .7); camel(0xe8c46a, 1.4); rock(g, -2.2, .4, -.3, .3);
  },
  custom(g, anim, lesson) {
    const b = grp(g, -.2, .34, -.3, .25); put(b, G.box(2.5, .16, 1.7), 0xb8342a, 0, .08, 0);
    const L = put(b, G.box(1.15, .1, 1.55), 0xfffaf0, -.6, .26, 0, {r: [0, 0, .12]}), R = put(b, G.box(1.15, .1, 1.55), 0xfffaf0, .6, .26, 0, {r: [0, 0, -.12]}); void L; void R;
    for (let i = 0; i < 4; i++) {put(b, G.box(.8, .02, .08), 0x9fb0d6, -.6, .34 + (.07 - i * .0), -.5 + i * .3, {r: [0, 0, .12], noShadow: true}); put(b, G.box(.8, .02, .08), 0x9fb0d6, .6, .34, -.5 + i * .3, {r: [0, 0, -.12], noShadow: true});}
    const pop = grp(b, 0, .3, -.1); put(pop, G.cone(.5, .9, 5), 0x6fae7a, -.5, .5, -.2); put(pop, G.cone(.35, .6, 5), 0x86c28f, .1, .36, -.3); put(pop, G.sph(.26), 0xffd84a, .7, .9, -.2, {mat: {emissive: 0xffc93a, emissiveIntensity: .5}}); anim.push(t => {pop.scale.y = 1 + Math.sin(t * 1.4) * .05;});
    put(b, G.box(.16, .5, .04), 0xe8c46a, 1.0, .1, .86);
    const p = grp(g, 1.7, .34, 1.2, -.6); put(p, G.cyl(.11, .11, 1.5, 6), 0xffcf4a, 0, .12, 0, {r: [0, 0, Math.PI / 2]}); put(p, G.cone(.11, .28, 6), 0xf2d2b0, .89, .12, 0, {r: [0, 0, -Math.PI / 2]}); put(p, G.cyl(.115, .115, .2, 6), 0xff8fa0, -.85, .12, 0, {r: [0, 0, Math.PI / 2]});
    [[0x4a8fd0, 0], [0x6fd3a0, .22], [0xe8c46a, .44]].forEach(([c, y], i) => put(g, G.box(.9, .2, .65), c, -1.9, .44 + y, 1.3, {r: [0, i * .25, 0]}));
    tree(g, 2.1, -1, 1); tree(g, -2.2, -.9, .9); rock(g, .9, .42, 2.1, .25);
  },
  math(g, anim) {   // 規劃中：可以動手摺的幾何
    const a = put(g, G.box(1.1, 1.1, 1.1), 0xffffff, -1, 1.2, 0), b = put(g, G.cone(.7, 1.3, 4), 0xffffff, .9, 1.2, -.7), c = put(g, G.sph(.6), 0xffffff, .8, 1.1, 1.1), d = put(g, new THREE.TorusGeometry(.5, .16, 6, 12), 0xffffff, -.3, 2.5, -.8);
    anim.push(t => {a.rotation.y = t * .5; b.rotation.y = -t * .6; c.rotation.x = t * .4; d.rotation.x = t * .7; d.rotation.y = t * .3;});
  },
  english(g, anim) {   // 規劃中：字母積木與對話泡泡
    const a = put(g, G.box(.9, .9, .9), 0xffffff, -.7, .85, .2), b = put(g, G.box(.9, .9, .9), 0xffffff, .4, .85, -.1, {r: [0, .4, 0]}), c = put(g, G.box(.9, .9, .9), 0xffffff, -.15, 1.76, .05, {r: [0, -.3, 0]});
    const d = put(g, G.sph(.55), 0xffffff, 1.5, 2.3, .3, {s: [1.3, 1, 1]}); anim.push(t => {c.rotation.y = -.3 + Math.sin(t) * .3; d.position.y = 2.3 + Math.sin(t * 1.5) * .12; void a; void b;});
  },
};

// ---- world -----------------------------------------------------------------------------------------------------
const WATER = new THREE.PlaneGeometry(120, 120, 60, 60); WATER.rotateX(-Math.PI / 2);
const waterBase = Float32Array.from(WATER.attributes.position.array);
const water = new THREE.Mesh(WATER, new THREE.MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: .28, metalness: .08})); water.receiveShadow = true; scene.add(water);
const R0 = 3.2;
const DEF = [{id: 'boat', x: -9.5, z: 1.5, top: 0x8fce86, rim: 0xecd9a6}, {id: 'water', x: 0, z: -7, top: 0x86cf9c, rim: 0xecd9a6}, {id: 'silk', x: 9.5, z: 1, top: 0xecc686, rim: 0xf5e2b4}, {id: 'english', x: 5.2, z: 9.5, top: 0xbcd0ea, rim: 0xd6e2f2}, {id: 'math', x: -5.2, z: 9.5, top: 0xbcd0ea, rim: 0xd6e2f2}];
const ghostMat = new THREE.MeshBasicMaterial({color: 0xd8f1ff, transparent: true, opacity: .34, depthWrite: false}), ghostLine = new THREE.LineBasicMaterial({color: 0xffffff, transparent: true, opacity: .8}), wireMat = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true, transparent: true, opacity: .75});
const SLOTS = [{x: 13.5, z: -8.5}, {x: 0, z: 2.2}, {x: -13.5, z: -8.5}];
const SUBJ_TOP = {'國文': 0xf0b8a8, '自然': 0x9fdcc0, '社會': 0xf0d49a}, islands = [];
function paintWater() {
  const pos = WATER.attributes.position, col = new Float32Array(pos.count * 3), deep = new THREE.Color(0x0f5fae), mid = new THREE.Color(0x1b8fd6), shallow = new THREE.Color(0x45cfd8), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {const x = waterBase[i * 3], z = waterBase[i * 3 + 2]; let d = 99; for (const q of islands) d = Math.min(d, Math.hypot(q.d.x - x, q.d.z - z) - R0); const k = clamp01(d / 2.4), far = clamp01((Math.hypot(x, z - 2) - 18) / 26); c.copy(shallow).lerp(mid, Math.min(1, k * 1.6)).lerp(deep, far * .9 + clamp01((d - 3) / 9) * .35); col.set([c.r, c.g, c.b], i * 3);}
  WATER.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
function makeIsland(d, lesson, plan) {
  const root = grp(scene, d.x, 0, d.z), anim = [], theme = THEMES[d.id] || THEMES.custom;
  const geo = baseGeo(R0), ghost = new THREE.Group(); ghost.add(new THREE.Mesh(geo, ghostMat)); ghost.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 12), ghostLine)); root.add(ghost);
  const real = new THREE.Group(); root.add(real);
  if (lesson) {const base = new THREE.Mesh(colorBase(geo.clone(), d.top, d.rim), new THREE.MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: .9})); base.castShadow = base.receiveShadow = true; real.add(base); theme(real, anim, lesson);
    const pier = grp(real, .2, 0, R0 * .98); for (let k = 0; k < 5; k++) put(pier, G.box(.9, .07, .22), k % 2 ? 0xb98a5a : 0xa87a4c, 0, .2, k * .26); for (const [px, pz] of [[-.42, .1], [.42, .1], [-.42, 1.1], [.42, 1.1]]) put(pier, G.cyl(.06, .06, .7, 6), 0x7a5a3a, px, .05, pz); put(pier, G.sph(.1), 0xffd84a, .42, .5, 1.1, {mat: {emissive: 0xffc93a, emissiveIntensity: .9}});}
  else {theme(ghost, anim); ghost.traverse(o => {if (o.isMesh && o.material !== ghostMat) {o.material = wireMat; o.castShadow = false;}});}
  const foam = new THREE.Mesh(new THREE.RingGeometry(R0 * 1.02, R0 * 1.22, 28), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: .55, depthWrite: false})); foam.rotation.x = -Math.PI / 2; foam.position.y = .06; root.add(foam);
  const hit = new THREE.Mesh(G.cyl(R0 * 1.15, R0 * 1.15, 6, 12), new THREE.MeshBasicMaterial({visible: false})); hit.position.y = 2; hit.userData.id = d.id; root.add(hit);
  const flag = grp(real, -1.9, .3, 2.1); put(flag, G.cyl(.04, .04, 1.5, 5), 0xffffff, 0, .75, 0); put(flag, G.box(.6, .36, .04), 0x4fd38a, .32, 1.3, 0); flag.visible = false;
  const el = document.createElement('div'); el.className = 'mlabel'; labelsEl.appendChild(el); el.onclick = () => sailTo(isl);
  const isl = {d, lesson, plan, root, ghost, real, anim, foam, hit, flag, el, k: 0, rising: null, alive: false, name: lesson && lesson.custom ? lesson.title + '島' : (lesson || plan).subject + '島'};
  real.visible = false; islands.push(isl); return isl;
}
DEF.forEach(d => makeIsland(d, api.lessons().find(l => l.id === d.id), api.PLANNED.find(p => p.id === d.id)));
function ensureCustom() {let added = false; for (const l of api.lessons()) if (l.custom && !islands.some(i => i.d.id === l.id)) {const n = islands.filter(i => i.lesson && i.lesson.custom).length; if (n >= SLOTS.length) break; makeIsland({id: l.id, x: SLOTS[n].x, z: SLOTS[n].z, top: SUBJ_TOP[l.subject] || 0xd9c8f0, rim: 0xf3e6c8}, l, null); added = true;} if (added) paintWater();}
ensureCustom(); paintWater();
// dotted sea route between the islands
const dots = []; for (let i = 0; i < DEF.length; i++) {const a = DEF[i], b = DEF[(i + 1) % DEF.length], mx = (a.x + b.x) / 2 * .8, mz = (a.z + b.z) / 2 * .8; for (let k = 1; k < 10; k++) {const t = k / 10, x = (1 - t) * (1 - t) * a.x + 2 * t * (1 - t) * mx + t * t * b.x, z = (1 - t) * (1 - t) * a.z + 2 * t * (1 - t) * mz + t * t * b.z; if (DEF.every(q => Math.hypot(q.x - x, q.z - z) > R0 + .9)) dots.push(put(scene, G.sph(.11, 0), 0xffffff, x, .1, z, {noShadow: true}));}}
for (let i = 0; i < 10; i++) {const a = rnd() * 6.28, r = 14 + rnd() * 9, x = Math.cos(a) * r, z = Math.sin(a) * r * .8 + 2; if (DEF.every(q => Math.hypot(q.x - x, q.z - z) > R0 + 2)) rock(scene, x, .1, z, .35 + rnd() * .5);}
const buoys = [[-3, 3], [4, -1.5], [-12, 8], [12, 8], [0, 13]].map(([x, z]) => {const g = grp(scene, x, 0, z); put(g, G.cyl(.22, .3, .4, 8), 0xe85a45, 0, .15, 0); put(g, G.cyl(.16, .22, .2, 8), 0xffffff, 0, .45, 0); put(g, G.sph(.1), 0xffd84a, 0, .66, 0, {mat: {emissive: 0xffd84a, emissiveIntensity: .8}}); return g;});
{const l = grp(scene, -19, 0, 9); put(l, new THREE.DodecahedronGeometry(1.5, 0), 0x8d949c, 0, .1, 0, {s: [1.2, .5, 1]}); put(l, G.cyl(.34, .46, 1), 0xffffff, 0, 1.1, 0); put(l, G.cyl(.3, .34, .5), 0xe85a45, 0, 1.85, 0); put(l, G.cyl(.26, .3, .5), 0xffffff, 0, 2.35, 0); put(l, G.cyl(.34, .34, .3), 0x2b3a55, 0, 2.75, 0); put(l, G.sph(.2), 0xffe27a, 0, 2.78, 0, {mat: {emissive: 0xffe27a, emissiveIntensity: 1.2}}); put(l, G.cone(.4, .4, 8), 0xe85a45, 0, 3.1, 0);
  const m = grp(scene, 19, 0, 10); put(m, new THREE.DodecahedronGeometry(1.2, 0), 0xe9d6a0, 0, .05, 0, {s: [1.3, .4, 1]}); palm(m, 0, 0, 1.2); palm(m, .5, .4, .8);}
const gulls = [0, 1, 2].map(i => {const g = grp(scene); const l = put(g, G.box(.55, .03, .16), 0xffffff, -.27, 0, 0), r = put(g, G.box(.55, .03, .16), 0xffffff, .27, 0, 0); return {g, l, r, ph: i * 2.1, rad: 6 + i * 3, h: 6.5 + i * .7};});

// the paper boat (bow toward +z)
const boat = grp(scene, -4, 0, -1.5);
{const b = boat; put(b, G.box(.56, .24, 1.1), 0xfffaf0, 0, .14, 0); put(b, G.cone(.34, .52, 4), 0xfffaf0, 0, .14, .78, {r: [Math.PI / 2, Math.PI / 4, 0], s: [1, 1, .5]}); put(b, G.cone(.34, .52, 4), 0xfffaf0, 0, .14, -.78, {r: [-Math.PI / 2, Math.PI / 4, 0], s: [1, 1, .5]});
  put(b, G.box(.58, .07, 1.12), 0xe85a45, 0, .2, 0); put(b, G.cone(.36, .7, 4), 0xffffff, 0, .6, 0, {r: [0, Math.PI / 4, 0], s: [.7, 1, 1.5]}); put(b, G.cyl(.02, .02, .5, 4), 0x6b4a2f, 0, 1.1, 0); put(b, G.box(.03, .16, .26), 0xe8c46a, 0, 1.26, -.13);}
const P = {x: -4, z: -1.5, h: Math.PI * .5, v: 0, target: null, keys: {}, docked: null};
const wake = Array.from({length: 16}, () => {const m = put(scene, G.sph(.16, 0), 0xffffff, 0, -5, 0, {noShadow: true, mat: {transparent: true, opacity: .8}}); m.material = m.material.clone(); return {m, life: 0};}); let wakeT = 0, wakeI = 0;
const splash = [];

// ---- interaction ------------------------------------------------------------------------------------------------
function sailTo(isl) {const dx = P.x - isl.d.x, dz = P.z - isl.d.z, d = Math.hypot(dx, dz) || 1; P.target = {x: isl.d.x + dx / d * (R0 + 1.25), z: isl.d.z + dz / d * (R0 + 1.25), isl}; if (d < R0 + 1.6 && P.docked === isl) primary(); else api.sfx.whoosh();}
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
canvas.addEventListener('pointerdown', e => {down = {x: e.clientX, y: e.clientY};});
canvas.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return; const r = canvas.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, camera);
  const h = ray.intersectObjects(islands.map(i => i.hit))[0]; if (h) return sailTo(islands.find(i => i.d.id === h.object.userData.id));
  const o = ray.ray.origin, dir = ray.ray.direction; if (dir.y < -.01) {const t = -o.y / dir.y; P.target = {x: Math.max(-20, Math.min(20, o.x + dir.x * t)), z: Math.max(-16, Math.min(18, o.z + dir.z * t))};}
});
const KEYMAP = {ArrowUp: 'f', KeyW: 'f', ArrowDown: 'b', KeyS: 'b', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r'};
addEventListener('keydown', e => {if (!active || /TEXTAREA|INPUT/.test(document.activeElement.tagName)) return; if (KEYMAP[e.code]) {P.keys[KEYMAP[e.code]] = true; P.target = null; e.preventDefault();} if ((e.code === 'Enter' || e.code === 'Space') && P.docked && document.activeElement.tagName !== 'BUTTON') {primary(); e.preventDefault();}});
addEventListener('keyup', e => {if (KEYMAP[e.code]) P.keys[KEYMAP[e.code]] = false;});
function primary() {const i = P.docked; if (!i) return; if (i.plan) api.plan(i.plan); else if (i.alive) api.open(i.d.id); else api.upload(i.d.id);}
$('dockGo').onclick = primary;
function showDock(i) {
  const box = $('dock'); if (!i) {box.classList.remove('show'); return;}
  const st = api.state(), done = st.done[i.d.id];
  $('dockK').textContent = i.plan ? `${i.plan.subjectEn} ISLAND · 規劃中` : `${i.lesson.subjectEn} ISLAND · ${i.lesson.lessonNo}`;
  $('dockT').textContent = i.plan ? `${i.name}：${i.plan.title}` : i.alive ? `${i.name}〈${i.lesson.title}〉` : `${i.name}：還沒有教材`;
  $('dockB').textContent = i.plan ? '這座島還在藍圖階段，可以先看呈現方式的構想。' : i.alive ? (done ? `已完成，測驗 ${done.score}/${done.total}。可以再走一次。` : '預告 → 猜一猜 → 讀課文 → 揭曉 → 測驗，大約 6 分鐘。') : '等老師上傳教材，這座島就會從海面長出來。';
  $('dockGo').textContent = i.plan ? '看構想' : i.alive ? '進入立體書 →' : '去上傳教材'; $('dockReview').style.display = done && i.alive ? '' : 'none'; $('dockReview').onclick = () => api.review(i.d.id);
  box.classList.add('show');
}

// ---- state sync + loop -------------------------------------------------------------------------------------------
function sync(animate) {
  const st = api.state(); let n = 0, delay = .5;
  ensureCustom();
  for (const i of islands) {
    if (!i.lesson) {i.el.innerHTML = `<b>${i.name}</b><span>規劃中</span>`; i.el.className = 'mlabel plan'; continue;}
    const gen = !!st.gen[i.d.id]; if (gen) n++;
    if (gen && !i.alive) {i.alive = true; if (animate && api.justGen.has(i.d.id)) {i.rising = -delay; delay += .9; i.k = 0;} else {i.k = 1; i.rising = null;}}
    if (!gen) {i.alive = false; i.k = 0; i.rising = null;}
    const done = st.done[i.d.id]; i.flag.visible = !!done;
    i.el.innerHTML = gen ? `<b>${i.name}</b><span>${i.lesson.custom ? i.lesson.subject + '・老師自編' : i.lesson.title}${done ? `　✓ ${done.score}/${done.total}` : ''}</span>` : `<b>${i.name}</b><span>尚未上傳教材</span>`; i.el.className = 'mlabel' + (gen ? ' alive' : '') + (done ? ' done' : '');
  }
  api.justGen.clear(); $('mapCount').textContent = `已生成 ${n} / ${api.lessons().length} 座島`; showDock(P.docked); return n;
}
function resize() {const r = wrap.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();}
addEventListener('resize', () => active && resize());
let active = false, last = 0, T = 0; const camT = new THREE.Vector3(0, 0, 2), v3 = new THREE.Vector3();
function frame(now) {
  if (!active) return; requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000 || .016); last = now; T += dt;
  // water
  const pos = WATER.attributes.position; for (let i = 0; i < pos.count; i++) {const x = waterBase[i * 3], z = waterBase[i * 3 + 2]; pos.setY(i, Math.sin(x * .55 + T * 1.2) * .1 + Math.cos(z * .6 + T * .9) * .1);} pos.needsUpdate = true; WATER.computeVertexNormals();
  // boat: free steering, or auto-sail to the clicked spot
  const K = P.keys;
  if (P.target) {const dx = P.target.x - P.x, dz = P.target.z - P.z, d = Math.hypot(dx, dz); if (d < .3) {P.target = null; P.v *= .5;} else {let dh = Math.atan2(dx, dz) - P.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); P.h += Math.sign(dh) * Math.min(Math.abs(dh), dt * 4.5); P.v += (Math.min(7, d * 2.2 + 1) * Math.max(.15, Math.cos(dh)) - P.v) * Math.min(1, dt * 4);}}
  else {const acc = (K.f ? 1 : 0) - (K.b ? .6 : 0); P.v += (acc * 7 - P.v) * Math.min(1, dt * (acc ? 2.5 : 1.8)); const turn = (K.l ? 1 : 0) - (K.r ? 1 : 0); P.h += turn * dt * 2.6 * (P.v < -.2 ? -1 : 1);}
  P.x += Math.sin(P.h) * P.v * dt; P.z += Math.cos(P.h) * P.v * dt; P.x = Math.max(-22, Math.min(22, P.x)); P.z = Math.max(-18, Math.min(19, P.z));
  let near = null, nd = 1e9;
  for (const i of islands) {const dx = P.x - i.d.x, dz = P.z - i.d.z, d = Math.hypot(dx, dz) || .01, min = R0 + .95; if (d < min) {P.x = i.d.x + dx / d * min; P.z = i.d.z + dz / d * min; P.v *= .9;} if (d < nd) {nd = d; near = i;}}
  const dock = nd < R0 + 2 ? near : null; if (dock !== P.docked) {P.docked = dock; showDock(dock); if (dock) api.sfx.ok();}
  boat.position.set(P.x, .05 + Math.sin(T * 2.2) * .05, P.z); boat.rotation.set(Math.sin(T * 1.7) * .04 - P.v * .012, P.h, Math.sin(T * 1.3) * .05);
  wakeT -= dt; if (Math.abs(P.v) > .8 && wakeT <= 0) {wakeT = .09; const w = wake[wakeI++ % wake.length]; w.life = 1; w.m.position.set(P.x - Math.sin(P.h) * .8 + (Math.random() - .5) * .3, .08, P.z - Math.cos(P.h) * .8 + (Math.random() - .5) * .3);}
  for (const w of wake) {if (w.life > 0) {w.life -= dt * 1.1; w.m.scale.set(1 + (1 - w.life) * 1.6, .25, 1 + (1 - w.life) * 1.6); w.m.material.opacity = Math.max(0, w.life) * .8;} else w.m.position.y = -5;}
  // islands
  for (const i of islands) {
    if (i.rising !== null) {
      const before = i.rising; i.rising += dt;
      if (before < 0 && i.rising >= 0) {api.sfx.chime(); for (let q = 0; q < 14; q++) {const a = q / 14 * 6.28, m = put(scene, G.sph(.2, 0), 0xffffff, i.d.x + Math.cos(a) * R0, .2, i.d.z + Math.sin(a) * R0, {noShadow: true}); splash.push({m, vx: Math.cos(a) * 3, vz: Math.sin(a) * 3, vy: 5 + Math.random() * 2, life: 1});}}
      if (i.rising >= 0) i.k = clamp01(i.rising / 1.3); if (i.k >= 1) i.rising = null;
    }
    const e = i.alive ? (i.k >= 1 ? 1 : easeOutBack(i.k)) : 0; i.real.visible = i.alive && i.k > 0; i.real.position.y = -2.6 * (1 - e); i.real.scale.setScalar(.55 + .45 * e); if (i.lesson) i.ghost.visible = e < .95;
    i.root.position.y = Math.sin(T * .9 + i.d.x) * .05; i.foam.scale.setScalar(1 + Math.sin(T * 1.6 + i.d.z) * .03); i.foam.material.opacity = .4 + Math.sin(T * 1.6 + i.d.z) * .15;
    if (!i.lesson || !i.alive) i.ghost.rotation.y = 0; for (const f of i.anim) f(T, dt);
    v3.set(i.d.x, 0, i.d.z + R0 + .9).project(camera); const r = canvas.getBoundingClientRect(); i.el.style.transform = `translate(-50%, 0) translate(${(v3.x + 1) / 2 * r.width}px, ${(1 - v3.y) / 2 * r.height}px)`; i.el.classList.toggle('near', P.docked === i);
  }
  for (let s = splash.length - 1; s >= 0; s--) {const p = splash[s]; p.life -= dt; p.vy -= 12 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; if (p.life <= 0 || p.m.position.y < -.3) {scene.remove(p.m); splash.splice(s, 1);}}
  dots.forEach((d, k) => d.position.y = .1 + Math.sin(T * 1.5 + k) * .05); buoys.forEach((b, k) => {b.position.y = Math.sin(T * 1.8 + k * 2) * .08; b.rotation.z = Math.sin(T * 1.2 + k) * .12;});
  gulls.forEach(g => {const a = T * .35 + g.ph; g.g.position.set(Math.cos(a) * g.rad, g.h, Math.sin(a) * g.rad * .7); g.g.rotation.y = -a; const f = Math.sin(T * 7 + g.ph) * .5; g.l.rotation.z = f; g.r.rotation.z = -f;});
  // camera follows the boat loosely so the whole archipelago stays in view
  const narrow = camera.aspect < 1, fit = narrow ? Math.min(2, 1.05 / camera.aspect) : 1; camT.lerp(v3.set(P.x * (narrow ? .9 : .35), 0, P.z * (narrow ? .9 : .3) + 1.6), 1 - Math.exp(-dt * 2.5));
  camera.position.set(camT.x, 27 * fit, camT.z + 21 * fit); camera.lookAt(camT.x, 0, camT.z + 1);
  renderer.render(scene, camera);
}
return {
  enter() {const was = active; active = true; resize(); sync(true); if (!was) {last = performance.now(); requestAnimationFrame(frame);}},
  leave() {active = false; P.keys = {};}, sync: () => sync(true), get P() {return P;}, islands,
};
};
