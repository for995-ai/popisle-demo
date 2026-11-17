// PopIsle demo engine. Generic: reads LESSONS (lessons.js), paints with art.js, plays voice clips from audio/.
(function () {
'use strict';
const $ = id => document.getElementById(id);
const clamp01 = x => Math.max(0, Math.min(1, x));
const easeIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const easeOutBack = x => {const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);};
const W = 1.6, D = 2.2, RIGHT_X = W / 2;
const CUSTOM = [], ALL = () => LESSONS.concat(CUSTOM), byId = id => ALL().find(l => l.id === id);
const STYLE = 'Paper-cut pop-up book illustration, layered cardstock with visible paper fibre texture and thin white cut edges, flat colors with soft watercolor shading, ONE isolated layer on a transparent background, no text, no border, straight-on front view, centered, high detail';

// ---------------------------------------------------------------------------------------------- saved demo state
let ST = {gen: {}, done: {}, custom: [], rec: {}};
try {Object.assign(ST, JSON.parse(localStorage.getItem('popisle-demo') || '{}'));} catch (e) {}
const save = () => {try {localStorage.setItem('popisle-demo', JSON.stringify(ST));} catch (e) {}};
const justGen = new Set();
ST.custom = (ST.custom || []).filter(spec => {try {CUSTOM.push(Custom.build(spec)); return true;} catch (e) {delete ST.gen[spec.id]; return false;}});
Custom.onArt = () => {if (typeof artCache !== 'undefined') for (const k in artCache) if (k.includes(':art')) delete artCache[k];};
ST.custom.forEach(sp => Custom.prepare(sp));
// hosted page only: ask Claude (lesson analysis) and Claude voice. Both are optional; everything works without them.
let SAMPLE = null, TTS = null, claudeVoice = false;
try {if (window.claude && window.claude.use) {window.claude.use('sample').then(x => {SAMPLE = x; const el = document.getElementById('aiBadge'); if (el && x) el.textContent = 'AI 解析：可用（Claude）'; const e2 = document.getElementById('aiBadge2'); if (e2 && x) e2.textContent = 'AI 已連線（Claude）：可以輸入任何主題。第一次生成會先詢問是否同意使用 AI。';}).catch(() => {}); window.claude.use('tts').then(x => {TTS = x; if (x) document.getElementById('navVoice').style.display = '';}).catch(() => {});}} catch (e) {}

// ---------------------------------------------------------------------------------------------- audio
const AU = (() => {
  let ac = null, master = null, musicG = null, on = true, cur = null, timer = null, cfg = null, next = 0, step = 0, seed = 5, idx = 2, level = .5, ducked = false, readEl = null;
  const ctx = () => {if (!ac) {try {ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.connect(ac.destination); musicG = ac.createGain(); musicG.gain.value = 0; musicG.connect(master);} catch (e) {ac = null;}} return ac;};
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const noise = (dur, f0, f1, gain) => {const a = ctx(); if (!a || !on) return; const n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(f0, a.currentTime); f.frequency.exponentialRampToValueAtTime(f1, a.currentTime + dur); const g = a.createGain(); g.gain.setValueAtTime(gain, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + dur); n.connect(f).connect(g).connect(master); n.start();};
  const tone = (f, dur, gain, when = 0, type = 'sine', dest) => {const a = ctx(); if (!a || !on) return; const o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + when; o.type = type; o.frequency.setValueAtTime(f, t0); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + .015); g.gain.exponentialRampToValueAtTime(.001, t0 + dur); o.connect(g).connect(dest || master); o.start(t0); o.stop(t0 + dur + .05);};
  function note(t, f, tone2, vel) {
    const a = ac, g = a.createGain(), o = a.createOscillator(); let dur = 1.1;
    if (tone2 === 'bell') {o.type = 'sine'; const o2 = a.createOscillator(), g2 = a.createGain(); o2.type = 'sine'; o2.frequency.value = f * 3; g2.gain.setValueAtTime(vel * .25, t); g2.gain.exponentialRampToValueAtTime(.001, t + .5); o2.connect(g2).connect(musicG); o2.start(t); o2.stop(t + .6); dur = 1.4;}
    else if (tone2 === 'reed') {o.type = 'sawtooth'; dur = .9;} else {o.type = 'triangle';}
    o.frequency.value = f; const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = tone2 === 'reed' ? 1100 : 2600;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + (tone2 === 'reed' ? .06 : .01)); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(lp).connect(g).connect(musicG); o.start(t); o.stop(t + dur + .05);
  }
  function tick() {
    if (!ac || !cfg) return; const eighth = 60 / cfg.bpm / 2;
    while (next < ac.currentTime + .35) {
      const s = step % 16, sc = cfg.scale;
      if (s === 0 || s === 8) {note(next, sc[s === 0 ? 0 : 3] / 2, 'pad', .1); note(next, sc[s === 0 ? 0 : 3] / 4, 'pad', .09);}
      if (s % 2 === 0 ? rand() < .8 : rand() < .3) {idx = Math.max(0, Math.min(sc.length - 1, idx + Math.floor(rand() * 5) - 2)); note(next, sc[idx] * (rand() < .15 ? 2 : 1), cfg.tone, .07 + rand() * .05);}
      next += eighth; step++;
    }
  }
  const setMusic = () => {if (musicG && ac) musicG.gain.setTargetAtTime(on ? level * (ducked ? .35 : 1) : 0, ac.currentTime, .25);};
  let lastThunk = 0;
  const api = {
    get on() {return on;},
    unlock() {const a = ctx(); if (a && a.state === 'suspended') a.resume();},
    toggle() {on = !on; setMusic(); if (cur && cur.el) cur.el.muted = !on; if (readEl) readEl.muted = !on; return on;},
    music(c, lv = .5) {if (!ctx()) return; cfg = c; level = lv; seed = 5; step = 0; next = ac.currentTime + .1; if (!timer) timer = setInterval(tick, 120); setMusic();},
    musicLevel(lv) {level = lv; setMusic();},
    musicStop() {cfg = null; if (timer) {clearInterval(timer); timer = null;} if (musicG && ac) musicG.gain.setTargetAtTime(0, ac.currentTime, .2);},
    // voice: resolves when the clip ends. Falls back to the device's zh-TW speech, then to a timer.
    speak(key, text, opts) {
      api.stopVoice();
      return new Promise(res => {
        const me = {res, el: null, synth: false, to: null};
        const done = () => {if (cur !== me) return; cur = null; ducked = false; setMusic(); res();};
        const byTimer = () => {me.to = setTimeout(done, Math.max(1500, (VOICE[key] || text.length * .24) * 1000));};
        const bySynth = () => {try {if (!on) return byTimer(); const u = new SpeechSynthesisUtterance(text.replace(/[「」]/g, '')); u.lang = 'zh-TW'; u.rate = .95; u.onend = done; u.onerror = () => byTimer(); me.synth = true; speechSynthesis.speak(u); me.to = setTimeout(done, Math.max(2500, text.length * 350));} catch (e) {byTimer();}};
        cur = me; ducked = true; setMusic();
        var tryNext; if (opts && opts.tts && on) {me.tts = opts.tts; me.to = setTimeout(done, 40000); opts.tts.speak(text.replace(/[「」]/g, ''), {voice: opts.voice || 'buttery'}).then(done).catch(() => {if (cur !== me) return; me.tts = null; clearTimeout(me.to); opts.noFile ? bySynth() : tryNext();}); return;}
        if (opts && opts.noFile) return bySynth();
        const exts = ['mp3', 'm4a', 'wav']; let ei = 0;
        tryNext = () => {
          if (cur !== me) return; if (ei >= exts.length) {me.el = null; return bySynth();}
          try {const el = new Audio('audio/' + key + '.' + exts[ei++]); me.el = el; el.muted = !on; el.onended = done; el.onerror = tryNext; const p = el.play(); if (p && p.catch) p.catch(e => {if (cur === me && me.el === el && e && e.name === 'NotAllowedError') {me.el = null; bySynth();}});} catch (e) {bySynth();}
        };
        tryNext();
      });
    },
    stopVoice() {if (!cur) return; const c = cur; cur = null; if (c.el) {c.el.onended = c.el.onerror = null; c.el.pause();} if (c.to) clearTimeout(c.to); if (c.synth) try {speechSynthesis.cancel();} catch (e) {} if (c.tts) try {c.tts.stop();} catch (e) {} ducked = false; setMusic();},
    pauseVoice(p) {if (!cur) return; if (cur.tts) {try {p ? cur.tts.pause() : cur.tts.resume();} catch (e) {}} else if (cur.el) {if (p) cur.el.pause(); else {const q = cur.el.play(); if (q && q.catch) q.catch(() => {});}} else if (cur.synth) try {p ? speechSynthesis.pause() : speechSynthesis.resume();} catch (e) {}},
    read(key, onEnd) {if (readEl) {readEl.pause(); readEl = null; return false;} try {readEl = new Audio('audio/' + key + '.mp3'); readEl.muted = !on; readEl.onended = readEl.onerror = () => {readEl = null; onEnd();}; const p = readEl.play(); if (p && p.catch) p.catch(() => {readEl = null; onEnd();}); ducked = true; setMusic(); return true;} catch (e) {return false;}},
    readStop() {if (readEl) {readEl.pause(); readEl = null;} ducked = !!cur; setMusic();},
    sfx: {
      page() {noise(.6, 3000, 600, .22);},
      drum(n = 6) {for (let i = 0; i < n; i++) tone(88, .35, .5, i * .32);},
      thunk() {const n = performance.now(); if (n - lastThunk < 35) return; lastThunk = n; noise(.08, 1800, 500, .16);},
      ok() {tone(880, .25, .14); tone(1320, .3, .11, .12);}, no() {tone(220, .3, .14);},
      rain(sec = 3) {noise(sec, 5000, 2500, .1);},
      chime() {[523, 659, 784, 1047].forEach((f, i) => tone(f, .7, .1, i * .12));},
      whoosh() {noise(.5, 400, 2400, .12);},
    },
  };
  return api;
})();

// ---------------------------------------------------------------------------------------------- art cache
const artCache = {};
function layerCanvas(lesson, L) {
  const key = L.cacheKey || lesson.id + ':' + L.id; if (artCache[key]) return artCache[key];
  const w = 1024, h = Math.round(1024 * L.h / L.w); let c;
  if (L.fog) {
    c = mk(w, h); const x = c.getContext('2d'); drawFog(x, w, h); x.globalCompositeOperation = 'destination-in';
    const gv = x.createLinearGradient(0, 0, 0, h); gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(.35, '#000'); gv.addColorStop(.8, '#000'); gv.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gv; x.fillRect(0, 0, w, h);
    const gh = x.createLinearGradient(0, 0, w, 0); gh.addColorStop(0, 'rgba(0,0,0,0)'); gh.addColorStop(.12, '#000'); gh.addColorStop(.88, '#000'); gh.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gh; x.fillRect(0, 0, w, h);
  } else c = paperCut(w, h, L.draw || painter(L.paint));
  return artCache[key] = c;
}
const thumbs = {};
function thumbFor(lesson) {   // a little standing pop-up for the map island
  if (thumbs[lesson.id]) return thumbs[lesson.id];
  const c = mk(420, 300), x = c.getContext('2d');
  for (const L of lesson.layers) {if (L.fog) continue; const src = layerCanvas(lesson, L), dw = L.w / 1.7 * 420, dh = dw * src.height / src.width, bottom = 296 - (1 - (L.z + 1) / 2) * 40; x.drawImage(src, (420 - dw) / 2, bottom - dh, dw, dh);}
  return thumbs[lesson.id] = c.toDataURL('image/png');
}
const layerThumb = (lesson, L) => {const s = layerCanvas(lesson, L), c = mk(112, 68), x = c.getContext('2d'), k = Math.min(112 / s.width, 68 / s.height); x.drawImage(s, (112 - s.width * k) / 2, (68 - s.height * k) / 2, s.width * k, s.height * k); return c.toDataURL();};

// ---------------------------------------------------------------------------------------------- page textures
const PW = 1024, PH = 1408;
function pageBase(c) {c.fillStyle = '#f1e3c3'; c.fillRect(0, 0, PW, PH); const g = c.createRadialGradient(PW / 2, PH / 2, PH * .3, PW / 2, PH / 2, PH * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,80,30,.22)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH); grain(c, PW, PH, .05);
  c.strokeStyle = 'rgba(150,40,30,.55)'; c.lineWidth = 3; c.strokeRect(60, 60, PW - 120, PH - 120);}
function vtext(c, text, x0, y0, colW, rows, size, color = '#2a2018') {
  let col = 0, row = 0; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = color;
  for (const ch of text) {if (ch === '\n') {col++; row = 0; continue;} c.fillText(ch, x0 - col * colW, y0 + row * size * 1.14); if (++row >= rows) {row = 0; col++;}}
}
function pageTex(lesson, kind) {
  const cv = mk(PW, PH), c = cv.getContext('2d'); pageBase(c);
  const foot = t => {c.font = '600 22px "IBM Plex Mono", monospace'; c.fillStyle = 'rgba(80,60,40,.6)'; c.textAlign = 'center'; c.fillText(t, PW / 2, PH - 84);};
  const F = (w, s) => `${w} ${s}px "Noto Serif TC", "PMingLiU", serif`;
  if (kind === 'title') {
    foot('— 序 —'); const n = lesson.title.length, size = n > 4 ? 100 : 120;
    c.font = F(900, size); vtext(c, lesson.title, PW / 2 + 60, 300, 140, 6, size);
    c.font = F(600, 44); vtext(c, '序幕．故事預告', PW / 2 - 130, 330, 60, 9, 44);
    c.fillStyle = lesson.accent; c.fillRect(PW / 2 - 175, 1030, 90, 90); c.fillStyle = '#f1e3c3'; c.font = F(900, 40); c.textAlign = 'center'; c.fillText(lesson.subject[0], PW / 2 - 130, 1062); c.fillText(lesson.subject[1], PW / 2 - 130, 1104);
  } else if (kind === 'blank') {
    foot('— 序 —'); for (let i = 0; i < 6; i++) {c.strokeStyle = `rgba(120,90,50,${.05 + rnd() * .05})`; c.lineWidth = 8; c.beginPath(); const y = 900 + i * 70; c.moveTo(100, y); c.bezierCurveTo(300, y - 30, 700, y + 30, PW - 100, y); c.stroke();}
  } else if (kind === 'readL') {
    foot('— ' + lesson.lessonNo + ' —');
    c.font = F(900, 124); vtext(c, lesson.title, PW - 190, 230, 140, 8, 124);
    c.font = F(600, 40); vtext(c, '本頁重點', PW - 330, 220, 50, 6, 40, 'rgba(80,60,40,.75)');
    c.font = F(900, 76); lesson.keyTerms.forEach((k, i) => {const x = PW - 440 - i * 100; vtext(c, k, x, 250, 70, 8, 76, '#b2382a'); c.fillStyle = '#b2382a'; c.beginPath(); c.arc(x, 180, 8, 0, 7); c.fill();});
    c.font = '500 28px "Noto Sans TC", sans-serif'; c.fillStyle = 'rgba(80,60,40,.7)'; c.textAlign = 'center'; c.fillText('完整課文在右側面板，點金色字詞看場景變化', PW / 2, PH - 150);
  } else {   // the stage the pop-up stands on
    foot('— ' + lesson.lessonNo + ' —');
    const col = lesson.stage === 'river' ? [60, 110, 160] : lesson.stage === 'grass' ? [70, 150, 110] : [190, 130, 60];
    for (let i = 0; i < 14; i++) {c.strokeStyle = `rgba(${col},${.08 + rnd() * .12})`; c.lineWidth = 6 + rnd() * 18; c.beginPath(); const y = 200 + i * 75; c.moveTo(80, y); c.bezierCurveTo(300, y - 40, 600, y + 40, PW - 80, y - 10); c.stroke();}
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ---------------------------------------------------------------------------------------------- three.js scene
const canvas = $('gl'), stageEl = $('stage');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
const hemi = new THREE.HemisphereLight(0xdde6ff, 0x1a2550, 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 2.2); sun.position.set(-2.2, 4.2, 3.2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left: -2.6, right: 2.6, top: 2.6, bottom: -2.6, near: .5, far: 12}); sun.shadow.bias = -.0006; sun.shadow.normalBias = .01; scene.add(sun);
const lantern = new THREE.PointLight(0xffb45a, 0, 2.2, 2); lantern.position.set(.8, .55, .5); scene.add(lantern);
const catcher = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({opacity: .35})); catcher.rotation.x = -Math.PI / 2; catcher.position.y = -.07; catcher.receiveShadow = true; scene.add(catcher);
const book = new THREE.Group(); scene.add(book);
const coverMat = new THREE.MeshStandardMaterial({color: 0x7a2a22, roughness: .8});
const cover = new THREE.Mesh(new THREE.BoxGeometry(2 * W + .16, .05, D + .14), coverMat); cover.position.y = -.045; cover.castShadow = cover.receiveShadow = true; book.add(cover);
const blockMat = new THREE.MeshStandardMaterial({color: 0xeadcbc, roughness: .95});
for (const s of [-1, 1]) {const b = new THREE.Mesh(new THREE.BoxGeometry(W - .02, .04, D - .02), blockMat); b.position.set(s * W / 2, -.02, 0); b.receiveShadow = true; book.add(b);}
const flat = x => {const m = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({roughness: .92})); m.rotation.x = -Math.PI / 2; m.position.set(x, .001, 0); m.receiveShadow = true; book.add(m); return m;};
const leftBase = flat(-W / 2), rightBase = flat(W / 2);
const SEG = 40, leafGeo = new THREE.PlaneGeometry(W, D, SEG, 1); leafGeo.rotateX(-Math.PI / 2); leafGeo.translate(W / 2, 0, 0);
const leafU = Float32Array.from({length: leafGeo.attributes.position.count}, (_, i) => leafGeo.attributes.position.getX(i));
const leafFront = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({roughness: .92, side: THREE.FrontSide})), leafBack = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({roughness: .92, side: THREE.BackSide}));
leafFront.castShadow = leafBack.castShadow = leafFront.receiveShadow = leafBack.receiveShadow = true; book.add(leafFront, leafBack);
function setLeaf(theta) {const pos = leafGeo.attributes.position, bend = .55 * Math.sin(theta); for (let i = 0; i < pos.count; i++) {const u = leafU[i], phi = theta + bend * (u / W) * (1 - u / W * .35); pos.setX(i, Math.cos(phi) * u); pos.setY(i, Math.sin(phi) * u + .006);} pos.needsUpdate = true; leafGeo.computeVertexNormals(); leafGeo.computeBoundingSphere();}
const arrowGeo = (() => {const g = new THREE.CylinderGeometry(.0035, .0035, .13, 5); g.rotateZ(Math.PI / 2); const head = new THREE.ConeGeometry(.009, .03, 6); head.rotateZ(-Math.PI / 2); head.translate(.078, 0, 0); const m = new THREE.BufferGeometry(), pos = [], nor = []; [g, head].map(x => x.toNonIndexed()).forEach(p => {pos.push(...p.attributes.position.array); nor.push(...p.attributes.normal.array);}); m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return m;})();
const arrowMat = new THREE.MeshStandardMaterial({color: 0x3a2a1c, roughness: .7});
const spriteTex = {}; const spriteMap = k => spriteTex[k] || (spriteTex[k] = Object.assign(new THREE.CanvasTexture(spriteCanvas(k)), {colorSpace: THREE.SRGBColorSpace}));

// ---------------------------------------------------------------------------------------------- lesson runtime
const READ_LOOK = [.98, .3, 0];
const CAMS = {wide: {look: [.12, .3, 0], dist: 6.3, yaw: -.08, pitch: .62}, stage: {look: [.7, .36, 0], dist: 4.7, yaw: -.05, pitch: .5}, push: {look: [.8, .34, .1], dist: 3.7, yaw: .07, pitch: .42}};
const S = {mode: 'idle', playing: true, theta: 0, turnT: -1, turnDir: 1, pop: 0, popTarget: 0, popManual: null, night: 0, fogBoost: 0, speaker: null, guess: '', narrow: false, fit: 1,
  user: {yaw: -.08, pitch: .62, dist: 6.3}, camT: CAMS.wide, cam: {look: new THREE.Vector3(.12, .3, 0), dist: 6.3, yaw: -.08, pitch: .62}, emote: null, shown: 0};
let R = null, runId = 0, T = 0, active = false;
const TURN_DUR = 1.5;

function paperMesh(tex, w, h, fog, order) {
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0);
  const mat = fog ? new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, opacity: .8}) : new THREE.MeshStandardMaterial({map: tex, emissiveMap: tex, emissive: 0x000000, alphaTest: .5, side: THREE.DoubleSide, roughness: .9});
  const mesh = new THREE.Mesh(geo, mat);
  if (!fog) {mesh.castShadow = mesh.receiveShadow = true; mesh.customDepthMaterial = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: .5});} else mesh.renderOrder = 10 + order;
  return mesh;
}
function mountLayers(defs) {
  const lesson = R.lesson, g = R.layerGroup; for (const f of R.flights) f.m.parent && f.m.parent.remove(f.m); R.flights.length = 0;
  while (g.children.length) {const ch = g.children[0]; g.remove(ch); ch.traverse(o => {if (o.material) {if (o.material.map) o.material.map.dispose(); o.material.dispose();} if (o.geometry && o.geometry !== arrowGeo) o.geometry.dispose();});}
  R.L = {}; R.original = {};
  defs.forEach((L, k) => {
    const tex = new THREE.CanvasTexture(layerCanvas(lesson, L)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const mesh = paperMesh(tex, L.w, L.h, L.fog, k), hinge = new THREE.Group(), holder = new THREE.Group();
    hinge.position.set(L.x ?? RIGHT_X, .003 + (defs.length - k) * .0025, L.z); hinge.add(mesh); holder.add(hinge); g.add(holder);
    R.L[L.id] = {def: L, k, mesh, hinge, holder, tex, glow: 0, shake: 0, rel: 1};
  });
}
function buildLesson(lesson) {
  if (R) {clearFx(); book.remove(R.group); R.group.traverse(o => {if (o.material) {if (o.material.map && !Object.values(spriteTex).includes(o.material.map)) o.material.map.dispose(); o.material.dispose();} if (o.geometry && o.geometry !== arrowGeo) o.geometry.dispose();});}
  const group = new THREE.Group(); book.add(group);
  R = {lesson, group, L: {}, C: {}, scenes: {}, V: {}, timers: [], flights: [], parts: [], arrows: 0, original: {}};
  coverMat.color.setHex(lesson.cover);
  R.tex = {title: pageTex(lesson, 'title'), blank: pageTex(lesson, 'blank'), readL: pageTex(lesson, 'readL'), stage: pageTex(lesson, 'stage')};
  leftBase.material.map = R.tex.title; rightBase.material.map = R.tex.blank; leafFront.material.map = R.tex.blank;
  const back = R.tex.readL; back.wrapS = THREE.RepeatWrapping; back.repeat.x = -1; back.offset.x = 1; leafBack.material.map = back;
  [leftBase, rightBase, leafFront, leafBack].forEach(m => m.material.needsUpdate = true);
  R.layerGroup = new THREE.Group(); group.add(R.layerGroup); mountLayers(lesson.paged ? lesson.pages[0].layers : lesson.layers); R.page = 0;
  for (const [name, defs] of Object.entries(lesson.teaser.scenes)) {
    const sc = R.scenes[name] = {p: 0, target: 0, objs: []};
    defs.forEach((d, k) => {
      const cw = d.who ? 256 : 1024, ch = Math.round(cw * d.h / d.w);
      const tex = new THREE.CanvasTexture(paperCut(cw, ch, painter(d.paint), d.who ? 6 : 9)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const mesh = paperMesh(tex, d.w, d.h, false, k), hinge = new THREE.Group(), holder = new THREE.Group(); mesh.visible = false;
      hinge.position.set(d.x ?? RIGHT_X, .004 + (defs.length - k) * .0025 + (d.y || 0), d.z); hinge.add(mesh); holder.add(hinge); group.add(holder);
      const o = {def: d, mesh, hinge, holder, enter: 0}; sc.objs.push(o); if (d.who) R.C[name + ':' + d.who] = o;
    });
  }
  lesson.init && lesson.init(ctx);
}
const ctx = {
  S, sfx: AU.sfx,
  get L() {return R.L;}, get C() {return R.C;}, get V() {return R.V;},
  after(sec, fn) {const r = R; r.timers.push({t: sec, fn: () => {if (R === r) fn();}});},
  release(id) {R.L[id].held = false;},
  banner(text) {const b = $('banner'); b.textContent = text; b.classList.add('show'); AU.sfx.chime(); setTimeout(() => b.classList.remove('show'), 2600);},
  emit(kind, o) {
    const r = R, n = o.n || 10;
    for (let i = 0; i < n; i++) ctx.after((o.stagger || 0) * i / n, () => {
      const m = new THREE.SpriteMaterial({map: spriteMap(kind), transparent: true, depthWrite: false, opacity: 0}), s = new THREE.Sprite(m), b = o.box, rr = Math.random;
      s.position.set(b[0] + rr() * (b[1] - b[0]), b[2] + rr() * (b[3] - b[2]), b[4] + rr() * (b[5] - b[4])); const sz = (o.size || .08) * (.7 + rr() * .6); s.scale.set(sz, sz, 1); s.renderOrder = 30; r.group.add(s);
      r.parts.push({s, v: [o.v[0] + (rr() - .5) * .08, o.v[1] * (.8 + rr() * .4), o.v[2] + (rr() - .5) * .05], g: o.g || 0, life: (o.life || 2) * (.8 + rr() * .4), age: 0});
    });
  },
  volley({from, to, n, delay = 0, targets}) {
    const A = R.L[from], B = R.L[to]; if (R.lesson.counter) $('counterBox').style.display = 'block';
    A.mesh.updateWorldMatrix(true, false); B.mesh.updateWorldMatrix(true, false);
    for (let i = 0; i < n; i++) {
      const [sx, sy] = targets[Math.floor(Math.random() * targets.length)];
      const local = new THREE.Vector3(sx * B.def.w + (Math.random() - .5) * .03, sy * B.def.h + Math.random() * .14, .004);
      const start = A.mesh.localToWorld(new THREE.Vector3((Math.random() - .5) * A.def.w * .8, A.def.h * (.5 + Math.random() * .3), .02));
      const m = new THREE.Mesh(arrowGeo, arrowMat); m.castShadow = true; m.visible = false; scene.add(m);
      R.flights.push({m, from: start, local, to: B, t: -(delay + i * (1.3 / n)), dur: .5 + Math.random() * .15, stuck: false});
    }
  },
};
function clearFx() {
  if (!R) return; for (const f of R.flights) f.m.parent && f.m.parent.remove(f.m); R.flights.length = 0; R.arrows = 0; $('count').dataset.v = 0; $('count').textContent = '0'; $('counterBox').style.display = 'none';
  for (const p of R.parts) {R.group.remove(p.s); p.s.material.dispose();} R.parts.length = 0; R.timers.length = 0;
  for (const o of Object.values(R.L)) {o.glow = o.shake = 0; o.mesh.scale.set(1, o.mesh.scale.y, 1); o.hinge.rotation.y = 0; if (o.mesh.material.color) o.mesh.material.color.setRGB(1, 1, 1);}
  S.night = 0; S.fogBoost = 0; R.V = {}; R.lesson.init && R.lesson.init(ctx);
}
const wait = sec => new Promise(res => ctx.after(sec, res));

function updateScene(dt) {
  const P = S.popManual ?? S.pop, n = Math.max(2, Object.keys(R.L).length);
  for (const o of Object.values(R.L)) {
    const L = o.def; o.rel += ((o.held ? 0 : 1) - o.rel) * Math.min(1, dt * (o.held ? 20 : 1.6));
    const p = Math.min(clamp01((P - (o.k / (n - 1)) * .45) / .55), o.rel < .999 ? clamp01(o.rel * 1.2) : 1), a = p <= 0 ? 0 : p >= 1 ? 1 : easeOutBack(p);
    o.hinge.rotation.x = Math.PI / 2 * (1 - a); o.mesh.visible = p > .001; o.p = p;
    o.holder.position.set(0, 0, 0); o.mesh.rotation.z = 0;
    if (L.fog) {o.holder.position.x = Math.sin(T * (L.z < 0 ? .35 : -.5)) * .06; o.mesh.material.opacity = Math.min(1, (L.z < 0 ? .7 : .55) + S.fogBoost * .45) * clamp01(p * 1.5); o.mesh.scale.y = 1 + S.fogBoost * .6;}
  }
  for (const sc of Object.values(R.scenes)) {
    const d = sc.target - sc.p; sc.p += Math.sign(d) * Math.min(Math.abs(d), dt / (d > 0 ? 1.1 : .75)); const m = Math.max(1, sc.objs.length - 1);
    sc.objs.forEach((o, k) => {
      const p = clamp01((sc.p - (k / m) * .4) / .6); o.hinge.rotation.x = Math.PI / 2 * (1 - (p <= 0 ? 0 : p >= 1 ? 1 : easeOutBack(p))); o.mesh.visible = p > .001;
      o.holder.position.set(0, 0, 0); o.mesh.rotation.z = 0;
      if (o.def.who) {
        o.enter += ((sc.p > .55 ? 1 : 0) - o.enter) * Math.min(1, dt * 2.6); if (o.enter < .03) o.mesh.visible = false; o.holder.position.x = (o.def.from - o.def.x) * (1 - easeIO(clamp01(o.enter)));
        if (S.speaker === o.def.who && S.playing) {o.holder.position.y = Math.abs(Math.sin(T * 9)) * .03; o.mesh.rotation.z = Math.sin(T * 9) * .035;}
      }
    });
  }
}
function applyFx(dt) {
  for (const o of Object.values(R.L)) {
    o.glow = Math.max(0, o.glow - dt * .5); o.shake = Math.max(0, o.shake - dt * .8);
    if (o.mesh.material.emissive) o.mesh.material.emissive.setRGB(.42 * o.glow, .34 * o.glow, .16 * o.glow);
    o.holder.position.x += Math.sin(T * 60) * .006 * o.shake;
  }
  for (const f of R.flights) {
    if (f.stuck) continue; f.t += dt; if (f.t < 0) continue;
    const to = f.to.mesh.localToWorld(f.local.clone()), k = Math.min(1, f.t / f.dur), k2 = Math.min(1, k + .02);
    const p = new THREE.Vector3().lerpVectors(f.from, to, k); p.y += Math.sin(Math.PI * k) * .35; const q = new THREE.Vector3().lerpVectors(f.from, to, k2); q.y += Math.sin(Math.PI * k2) * .35;
    f.m.visible = true; f.m.position.copy(p); const dir = q.sub(p).normalize(); if (dir.lengthSq() > 0) f.m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    if (k >= 1) {f.stuck = true; AU.sfx.thunk(); f.to.mesh.attach(f.m); R.arrows++;}
  }
  for (let i = R.parts.length - 1; i >= 0; i--) {
    const p = R.parts[i]; p.age += dt; p.v[1] += p.g * dt; p.s.position.x += p.v[0] * dt; p.s.position.y += p.v[1] * dt; p.s.position.z += p.v[2] * dt;
    p.s.material.opacity = Math.sin(Math.PI * clamp01(p.age / p.life)) * .95;
    if (p.age >= p.life || p.s.position.y < .01) {R.group.remove(p.s); p.s.material.dispose(); R.parts.splice(i, 1);}
  }
  if (R.lesson.counter) {const tgt = Math.round(R.arrows * R.lesson.counter.per), el = $('count'), cur = +el.dataset.v || 0; if (cur !== tgt) {const nv = cur + Math.ceil((tgt - cur) * .2); el.dataset.v = nv; el.textContent = nv.toLocaleString();}}
}
function resize() {const r = stageEl.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); S.narrow = camera.aspect < 1; S.fit = S.narrow ? Math.min(1.9, .75 / camera.aspect) : 1;}
addEventListener('resize', resize);
let drag = null;
canvas.addEventListener('pointerdown', e => {if (S.mode !== 'read') return; drag = {x: e.clientX, y: e.clientY, yaw: S.user.yaw, pitch: S.user.pitch}; try {canvas.setPointerCapture(e.pointerId);} catch (err) {}});
canvas.addEventListener('pointermove', e => {if (!drag) return; S.user.yaw = Math.max(-.7, Math.min(.7, drag.yaw - (e.clientX - drag.x) * .005)); S.user.pitch = Math.max(.25, Math.min(1.1, drag.pitch + (e.clientY - drag.y) * .004));});
canvas.addEventListener('pointerup', e => {const d = drag; drag = null; if (d && R && R.masked && BQ.isOpen && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 7) pickMarker(e);});
if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(stageEl);
const appEl = document.querySelector('#scrLesson .app');
function setReading(on) {appEl.classList.toggle('reading', on); $('leafPage').classList.remove('exam'); if (on) {const lp = $('leafPage'); lp.style.animation = 'none'; void lp.offsetWidth; lp.style.animation = '';} resize();}
canvas.addEventListener('wheel', e => {if (S.mode !== 'read') return; e.preventDefault(); S.user.dist = Math.max(3.4, Math.min(7, S.user.dist + e.deltaY * .002));}, {passive: false});

// ---------------------------------------------------------------------------------------------- questions on the book page
// The question sits on the left page, right under the text. Page questions, "find it on the picture" questions,
// sample-lesson questions and the final test all use it, so reading and answering happen on one screen.
const BQ = (() => {
  const el = $('bookQ'); let cur = null, token = 0, pickFn = null;
  const api = {
    get token() {return token;}, get active() {return !!cur;}, get cur() {return cur;}, get isOpen() {return !!cur && el.classList.contains('open');},
    hide() {if (cur && cur.onClose) cur.onClose(); cur = null; pickFn = null; token++; el.classList.remove('show', 'open'); el.innerHTML = ''; stageEl.classList.remove('point');},
    expand() {if (!cur || el.classList.contains('open')) return; el.classList.add('open'); if (cur.onOpen) cur.onOpen(); el.scrollTop = 0; if (matchMedia('(max-width: 900px)').matches) el.scrollIntoView({behavior: 'smooth', block: 'nearest'});},
    collapse(text, ok) {if (!cur) return; el.classList.remove('open'); const p = el.querySelector('.bq-pill'); if (text) p.textContent = text; p.classList.toggle('ok', !!ok);},
    /** o: {tag, step: [index, total], stem, note, opts, row, pill, open, body, pick(k, card), onOpen, onClose, ready(card)} */
    ask(o) {
      if (cur && cur.onClose) cur.onClose(); cur = o; const my = ++token, [si, sn] = o.step || [0, 0];
      el.innerHTML = `<button class="bq-pill">✎ ${esc(o.pill || '回答問題')}</button><div class="bq-card"><div class="bq-head"><span class="bq-tag mono">${esc(o.tag)}</span><span class="bq-dots">${Array.from({length: sn}, (_, k) => `<i class="${k < si ? 'done' : k === si ? 'on' : ''}"></i>`).join('')}</span></div>
        <div class="bq-stem">${esc(o.stem)}</div>${o.note ? `<div class="bq-note">${esc(o.note)}</div>` : ''}<div class="${o.row ? 'bq-row' : ''}">${o.opts.map((t, k) => `<button class="bq-opt" data-k="${k}"><b>${'ABCDEF'[k] || k + 1}</b><span>${esc(t)}</span></button>`).join('')}</div><div class="bq-body">${o.body || ''}</div><div class="bq-fb"></div><button class="primary bq-next" style="display:none"></button></div>`;
      const opts = [...el.querySelectorAll('.bq-opt')], fb = el.querySelector('.bq-fb'), next = el.querySelector('.bq-next'); let locked = false;
      const card = {mark: (k, cls) => opts[k] && opts[k].classList.add(cls), lock: () => {locked = true; opts.forEach(b => b.disabled = true);}, fb: (t, ok) => {fb.textContent = t; fb.className = 'bq-fb' + (ok ? ' ok' : ''); el.scrollTop = el.scrollHeight;},
        next: (label, fn) => {next.textContent = label; next.style.display = ''; next.onclick = () => {if (my === token) fn();}; el.scrollTop = el.scrollHeight;}, el};
      pickFn = k => {if (!locked && my === token && opts[k]) o.pick(k, card);};
      opts.forEach(b => b.onclick = () => pickFn(+b.dataset.k));
      el.querySelector('.bq-pill').onclick = () => {if (!el.querySelector('.bq-pill').classList.contains('ok')) api.expand();};
      el.classList.remove('open'); el.classList.add('show'); if (o.ready) o.ready(card); if (o.open) api.expand(); return my;
    },
    /** answer by index (keyboard, or a tap on a marker of the pop-up picture) */
    key(n) {if (!api.isOpen || !pickFn) return false; const b = el.querySelectorAll('.bq-opt')[n]; if (b && !b.disabled) {pickFn(n); return true;} return false;},
  };
  addEventListener('keydown', e => {if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))) return; const n = '123456'.indexOf(e.key); if (n >= 0 && api.key(n)) e.preventDefault();});
  return api;
})();
// swap the texture of a standing layer (used to hide the labels of an illustration behind lettered markers)
function swapLayerTex(o, canvasEl) {
  const tex = new THREE.CanvasTexture(canvasEl); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; const m = o.mesh.material; if (m.map && m.map !== R.original[o.def.id]) m.map.dispose();
  m.map = tex; if (m.emissiveMap) m.emissiveMap = tex; m.needsUpdate = true; o.tex = tex; if (o.mesh.customDepthMaterial) {o.mesh.customDepthMaterial.map = tex; o.mesh.customDepthMaterial.needsUpdate = true;}
}
function maskArt(on) {
  const pg = R && R.lesson.paged && R.lesson.pages[R.page], o = R && R.L.mid; if (!pg || !pg.point || !o || !o.def.art) return; R.masked = on; stageEl.classList.toggle('point', on);
  swapLayerTex(o, layerCanvas(R.lesson, on ? {...o.def, draw: Custom.artPainter(pg.point.masked, pg.point.emoji), cacheKey: o.def.cacheKey + ':mask'} : o.def)); if (on) o.glow = 1;
}
// where a point of the illustration (in its 480 x 300 drawing units) sits on the layer, as texture coordinates
function artUV(o, x, y) {const cw = o.tex.image.width, ch = o.tex.image.height, k = Math.min((cw - 40) / 960, (ch - 30) / 600), ox = (cw - 960 * k) / 2, oy = ch - 600 * k - 8; return [(ox + x / 480 * 960 * k) / cw, 1 - (oy + y / 300 * 600 * k) / ch];}
const ray = new THREE.Raycaster();
function pickMarker(e) {
  const pg = R.lesson.pages[R.page], o = R.L.mid, r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const hit = ray.intersectObject(o.mesh, false)[0]; if (!hit || !hit.uv) return; let best = -1, bd = .085;
  pg.point.labels.forEach((l, i) => {const [u, v] = artUV(o, l.cx, l.cy), d = Math.hypot((u - hit.uv.x) * (o.def.w / o.def.h), v - hit.uv.y); if (d < bd) {bd = d; best = i;}});
  if (best >= 0) BQ.key(best);
}
let last = performance.now(), stageRect = null;
addEventListener('resize', () => {stageRect = null;});
function frame(now) {
  requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now; if (!active || !R) return; T += dt;
  const frozen = S.mode === 'teaser' && !S.playing;
  if (!frozen) for (let i = R.timers.length - 1; i >= 0; i--) {const tm = R.timers[i]; tm.t -= dt; if (tm.t <= 0) {R.timers.splice(i, 1); tm.fn();}}
  if (S.fold) {S.fold.t += dt; S.popManual = Math.max(0, 1 - S.fold.t / .45); if (S.fold.t >= .55) {const f = S.fold; S.fold = null; f.fn();}}
  if (S.mode === 'read') {
    leafFront.visible = leafBack.visible = true;
    if (S.turnT >= 0) {S.turnT += dt; const k = clamp01(S.turnT / TURN_DUR); S.theta = (S.turnDir > 0 ? easeIO(k) : 1 - easeIO(k)) * Math.PI; if (k >= 1) {S.turnT = -1; $('btnTurn').textContent = S.theta > 1.5 ? '← 回到上一頁' : '翻到課文頁 →';}}
    setLeaf(S.theta); const target = clamp01((S.theta / Math.PI - .55) / .45); S.pop += target > S.pop ? Math.min(target - S.pop, dt / .9) : -Math.min(S.pop - target, dt / .4);
  } else {leafFront.visible = leafBack.visible = false; if (!frozen) {const d = S.popTarget - S.pop; S.pop += Math.sign(d) * Math.min(Math.abs(d), dt / (d > 0 ? 1.2 : .7));}}
  S.fogBoost = Math.max(0, S.fogBoost - dt * .3);
  lantern.intensity = .45 * (S.popManual ?? S.pop) * (1 + .15 * Math.sin(T * 9)); hemi.intensity = 1.1 - .35 * S.night; sun.intensity = 2.2 - .9 * S.night;
  updateScene(frozen ? 0 : dt); R.lesson.tick && R.lesson.tick(ctx, T, frozen ? 0 : dt); applyFx(frozen ? 0 : dt);
  // camera: cinematic targets during the preview, user-controlled while reading
  const tgt = S.mode === 'read' ? {look: READ_LOOK, dist: S.user.dist, yaw: S.user.yaw, pitch: S.user.pitch} : S.camT, k = 1 - Math.exp(-dt * (S.mode === 'read' ? 6 : 1.9)), c = S.cam;
  c.look.lerp(new THREE.Vector3(S.narrow ? Math.max(.62, tgt.look[0]) : tgt.look[0], tgt.look[1] + (S.narrow ? .08 : 0), tgt.look[2]), k); c.dist += (tgt.dist - c.dist) * k; c.yaw += (tgt.yaw - c.yaw) * k; c.pitch += (tgt.pitch - c.pitch) * k;
  const yaw = c.yaw + Math.sin(T * .25) * .03, d = c.dist * S.fit;
  camera.position.set(c.look.x + Math.sin(yaw) * Math.cos(c.pitch) * d, c.look.y + Math.sin(c.pitch) * d, c.look.z + Math.cos(yaw) * Math.cos(c.pitch) * d); camera.lookAt(c.look);
  if (S.emote) {const o = S.emote, v = new THREE.Vector3(o.def.x + o.holder.position.x, o.def.h * .92 + (o.def.y || 0) + o.holder.position.y, o.def.z).project(camera), r = stageEl.getBoundingClientRect(), el = $('emote'); el.style.left = ((v.x + 1) / 2 * r.width) + 'px'; el.style.top = ((1 - v.y) / 2 * r.height) + 'px';}
  renderer.render(scene, camera);
}

// ---------------------------------------------------------------------------------------------- preview (teaser) engine
function showSub(who, text) {
  const box = $('sub'); box.classList.remove('show'); if (!who) return; void box.offsetWidth;
  box.classList.add('show'); box.classList.toggle('narr', who === '旁白'); $('subWho').textContent = who; $('subWho').style.background = R.lesson.who[who] || '#8a7d6a'; $('subLine').textContent = who === '旁白' ? text : `「${text}」`;
}
function showEmote(o, ch) {const el = $('emote'); S.emote = o; el.textContent = ch; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); const r = R; ctx.after(1.7, () => {if (R === r && S.emote === o) {el.classList.remove('show'); S.emote = null;}});}
function showStamp(t) {const el = $('stamp'); el.textContent = t; el.classList.add('show'); AU.sfx.whoosh(); ctx.after(1.7, () => el.classList.remove('show'));}
function camFor(b) {if (b.cam) return CAMS[b.cam]; const o = R.C[b.scene + ':' + b.who]; if (!o) return CAMS.stage; const d = o.def; return {look: [d.x * .7 + RIGHT_X * .3, .34 + (d.y || 0), d.z], dist: 3.4, yaw: d.x < RIGHT_X ? .16 : -.16, pitch: .4};}
function setStep(i) {for (let k = 0; k < 5; k++) {const b = $('st' + k); b.classList.toggle('on', k === i); b.classList.toggle('done', k < i);} S.shown = Math.max(S.shown, i); $('st3').disabled = S.shown < 3; $('st4').disabled = S.shown < 3;}
function hideOverlays() {BQ.hide(); $('leafPage').classList.remove('exam'); ['predict', 'reveal', 'doneCard'].forEach(id => $(id).classList.remove('show')); ['bigq', 'veil', 'stamp', 'emote', 'banner'].forEach(id => $(id).classList.remove('show')); S.emote = null; showSub(null);}
function controls(teaser) {$('teaserControls').style.display = teaser ? '' : 'none'; $('readControls').style.display = teaser ? 'none' : '';}

const VOICES = ['buttery', 'airy', 'glassy', 'rounded'];
function voiceOpts(L, who) {const useTts = TTS && (claudeVoice || L.custom); if (useTts) return {tts: TTS, voice: VOICES[Math.max(0, Object.keys(L.who).indexOf(who)) % 4], noFile: !!L.custom}; return L.custom ? {noFile: true} : null;}
async function startTeaser() {
  const my = ++runId, L = R.lesson, beats = L.teaser.beats; AU.stopVoice(); AU.readStop(); hideOverlays(); clearFx(); resetQuiz();
  S.mode = 'teaser'; S.playing = true; S.theta = 0; S.turnT = -1; S.pop = 0; S.popTarget = 0; S.popManual = null; S.speaker = null; S.camT = CAMS.wide;
  for (const sc of Object.values(R.scenes)) {sc.p = 0; sc.target = 0; sc.objs.forEach(o => o.enter = 0);}
  for (const id of L.hold || []) {R.L[id].held = true; R.L[id].rel = 0;}
  leftBase.material.map = R.tex.title; rightBase.material.map = R.tex.blank; leftBase.material.needsUpdate = rightBase.material.needsUpdate = true;
  controls(true); $('btnPlay').textContent = '⏸ 暫停'; stageEl.classList.add('cine'); setReading(false); $('hint').style.opacity = 0; $('pageTag').textContent = '序幕'; $('prog').style.width = '0'; setStep(0);
  AU.music(L.music, .5);
  await wait(.7); if (my !== runId) return;
  let cur = null;
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    if (b.scene !== cur) {
      AU.sfx.page(); if (cur) {R.scenes[cur].target = 0; if (cur === 'read') S.popTarget = 0; S.camT = CAMS.stage; showSub(null); await wait(.8); if (my !== runId) return;}
      R.scenes[b.scene].target = 1; if (b.scene === 'read') S.popTarget = 1; cur = b.scene; await wait(1.25); if (my !== runId) return;
    }
    S.camT = camFor(b); if (b.fx) L.tfx[b.fx](ctx);
    S.speaker = b.who; showSub(b.who, b.text); const eo = R.C[b.scene + ':' + (b.emoteOn || b.who)]; if (b.emote && eo) showEmote(eo, b.emote); if (b.pop) showStamp(b.pop);
    $('prog').style.width = ((i + 1) / (beats.length + 1) * 100) + '%';
    await AU.speak(L.id + '/b' + i, b.text, voiceOpts(L, b.who)); if (my !== runId) return;
    S.speaker = null; await wait(.4); if (my !== runId) return;
  }
  showSub(null); S.camT = CAMS.stage; $('veil').classList.add('show'); $('bigq').textContent = L.teaser.hook; $('bigq').classList.add('show'); $('prog').style.width = '100%';
  await AU.speak(L.id + '/hook', L.teaser.hook, voiceOpts(L, '旁白')); if (my !== runId) return; await wait(.9); if (my !== runId) return;
  showPredict();
}
function showPredict() {
  if (!R.lesson.predict.opts.length) {pick = 'other'; $('guessText').style.display = 'block';}
  runId++; AU.stopVoice(); S.mode = 'predict'; S.speaker = null; showSub(null); $('bigq').classList.remove('show'); $('veil').classList.add('show'); stageEl.classList.remove('cine'); setReading(false); AU.musicLevel(.3);
  $('predict').classList.add('show'); $('teaserControls').style.display = 'none'; $('prog').style.width = '0'; setStep(1);
}
function enterRead() {
  runId++; AU.stopVoice(); hideOverlays(); clearFx(); stageEl.classList.remove('cine'); AU.music(R.lesson.music, .22);
  for (const sc of Object.values(R.scenes)) {sc.p = 0; sc.target = 0;} for (const o of Object.values(R.L)) {o.held = false; o.rel = 1;}
  S.mode = 'read'; S.pop = 0; S.popTarget = 0; S.theta = 0; S.turnT = -1; S.speaker = null; setLeaf(0);
  rightBase.material.map = R.tex.stage; rightBase.material.needsUpdate = true; controls(false); $('prog').style.width = '0';
  setReading(true); S.user.dist = Math.min(S.user.dist, 4.7); $('hint').style.opacity = 1; $('pageTag').textContent = R.lesson.pageName; $('leafNo').textContent = R.lesson.pageName; tab('text'); setStep(2);
  const r = R; setTimeout(() => {if (R === r && S.mode === 'read' && S.theta < .01) turn(1);}, 700);
  if (R.lesson.paged) {S.fold = null; if (R.page !== 0) mountLayers(R.lesson.pages[0].layers); showPage(0);}
  else if ((R.qi || 0) < R.lesson.quiz.length) askQuiz(R.qi || 0);
}
// sample lessons: the questions come one after another on the book; a right answer plays its scene on the stage
function askQuiz(i) {
  const L = R.lesson, q = L.quiz[i], r = R, n = L.quiz.length; R.qi = i;
  BQ.ask({tag: q.tag, step: [i, n], stem: q.stem, opts: q.opts, pill: i ? `下一題（${i + 1}/${n}）` : `讀完課文了嗎？點這裡回答問題（1/${n}）`, open: i > 0,
    pick(k, card) {
      if (S.theta < 3 && S.turnT < 0) turn(1); rec.tries++;
      if (k === q.ans) {card.mark(k, 'right'); card.lock(); AU.sfx.ok(); record(`提問 ${i + 1} 答對`); R.qi = i + 1; q.run(ctx); BQ.collapse('✓ ' + q.ok, true); const tk = BQ.token;
        ctx.after(q.wait || 5, () => {if (R !== r || BQ.token !== tk) return; L.quiz[i + 1] ? askQuiz(i + 1) : showReveal();});}
      else {card.mark(k, 'wrong'); card.fb(q.hints[k] || '再想想看，回到課文找線索。'); AU.sfx.no(); record(`提問 ${i + 1} 選了「${q.opts[k]}」`);}
    }});
}
// ---- multi-page storybooks (teacher-uploaded lessons): one scene, one tidy passage and one question per page
function renderText(segs) {
  const cl = $('classic'); cl.innerHTML = '';
  for (const [kind, t, key] of segs) {const el = document.createElement('span'); el.textContent = t; if (kind === 'hs') {el.className = 'hs'; el.tabIndex = 0; el.onclick = () => gloss(key, el); el.onkeydown = e => {if (e.key === 'Enter') gloss(key, el);};} else if (kind === 'sp') el.className = 'sp'; cl.appendChild(el);}
}
function showPage(i) {
  const L = R.lesson, pg = L.pages[i], N = L.pages.length; R.page = i; L.keyTerms = pg.keyTerms; L.text = pg.text;
  $('pageTag').textContent = `第 ${i + 1} / ${N} 頁　${pg.title}`; renderText(pg.text); $('pageDots').innerHTML = L.pages.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join(''); $('pageDots').style.display = '';
  $('leafNo').textContent = `第 ${i + 1} / ${N} 頁　${pg.title}`; R.masked = false; $('pageArt').classList.remove('big'); $('btnArt').style.display = pg.art ? '' : 'none'; if (pg.art) {$('pageArtImg').src = Custom.svgUrl(pg.art.svg); $('pageArtCap').textContent = '圖：' + pg.art.name + '（點一下關閉）';}
  $('btnPlain').style.display = pg.plain ? '' : 'none'; $('plain').style.display = 'none'; $('plain').textContent = pg.plain; $('btnPlain').textContent = '顯示白話翻譯';
  $('gloss').className = 'gloss empty'; $('gloss').innerHTML = '<div class="w">　</div><div class="d">點金色字詞，看解釋和立體書的變化。</div>';
  R.tex.readL = pageTex(L, 'readL'); const back = R.tex.readL; back.wrapS = THREE.RepeatWrapping; back.repeat.x = -1; back.offset.x = 1; leafBack.material.map = back; leafBack.material.needsUpdate = true;
  const q = pg.q, r0 = R, goNext = () => {BQ.hide(); if (i === N - 1) return showReveal(); const r = R; runId++; AU.stopVoice(); showSub(null); AU.sfx.page(); S.fold = {t: 0, fn: () => {if (R !== r) return; AU.stopVoice(); showSub(null); clearFx(); mountLayers(L.pages[i + 1].layers); S.popManual = null; S.pop = 0; S.theta = 0; S.turnT = -1; setLeaf(0); showPage(i + 1); turn(1);}};};
  const askMC = open => BQ.ask({tag: q.tag, step: [i, N], stem: q.stem, opts: q.opts, pill: '讀完這一頁了嗎？點這裡回答問題', open,
    pick(k, card) {
      rec.tries++;
      if (k === q.ans) {card.mark(k, 'right'); card.lock(); card.fb(q.ok, true); AU.sfx.ok(); record(`第 ${i + 1} 頁的提問答對`); q.run(ctx); card.next(i === N - 1 ? '看揭曉 →' : '翻到下一頁 →', goNext);}
      else {card.mark(k, 'wrong'); card.fb(q.hints[k]); AU.sfx.no(); record(`第 ${i + 1} 頁選了「${q.opts[k]}」`);}
    }});
  // pages with a labelled illustration start with "find it on the pop-up": the labels turn into lettered markers
  const pt = pg.point, target = pt && pt.labels[pt.ans].name;
  const qTok = !pt ? askMC(false) : BQ.ask({tag: `第 ${i + 1} 頁 · 找一找`, step: [i, N], stem: `在右邊的立體書上，點出「${target}」。`, note: '圖上的名稱變成字母了。直接點圖上的字母，或按下面的按鈕。', opts: pt.labels.map(() => ''), row: true, pill: '讀完這一頁了嗎？先到立體書上找一找',
    onOpen: () => maskArt(true), onClose: () => {if (R === r0 && R.masked) maskArt(false);},
    pick(k, card) {
      rec.tries++;
      if (k === pt.ans) {card.mark(k, 'right'); card.lock(); maskArt(false); card.fb(`答對了！這就是「${target}」。圖上的名稱都回來了，再看一眼它們的位置。`, true); AU.sfx.ok(); record(`第 ${i + 1} 頁在圖上找到「${target}」`); const o = R.L.mid; if (o) o.glow = 1; card.next('接著想一想 →', () => askMC(true));}
      else {card.mark(k, 'wrong'); card.fb(`${'ABCDEF'[k]} 是「${pt.labels[k].name}」，不是「${target}」。回課文找線索，再找一次。`); AU.sfx.no(); record(`第 ${i + 1} 頁找「${target}」時點了「${pt.labels[k].name}」`);}
    }});
  $('textWrap').scrollTop = 0;
  const my = ++runId, r = R; ctx.after(i === 0 ? 3.2 : 2.4, async () => {for (const line of pg.narration) {if (my !== runId || R !== r) return; S.speaker = '旁白'; showSub('旁白', line); await AU.speak(L.id + '/p' + i, line, voiceOpts(L, '旁白')); if (my !== runId || R !== r) return; S.speaker = null; await wait(.3);} if (my === runId && R === r) {showSub(null); if (BQ.token === qTok) BQ.expand();}});
}
function turn(dir) {S.turnT = 0; S.turnDir = dir; AU.sfx.page();}

// ---------------------------------------------------------------------------------------------- lesson UI
const tab = name => {document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x.dataset.tab === name)); document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + name));};
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => tab(b.dataset.tab));
let rec = {log: [], tries: 0, seen: new Set(), score: null};
function record(s) {rec.log.push(s); $('log').innerHTML = '學習紀錄（之後會進老師後台）：<br>' + rec.log.slice(-6).map((x, i) => `${rec.log.length - Math.min(6, rec.log.length) + i + 1}. ${x}`).join('<br>');}
function resetQuiz() {
  const L = R.lesson; rec = {log: [], tries: 0, seen: new Set(), score: null}; $('log').textContent = '學習紀錄（之後會進老師後台）：尚無紀錄'; S.guess = ''; S.shown = 0;
  $('pageDots').style.display = 'none';
  $('quizBox').innerHTML = '<div class="notice">提問和測驗都直接出現在立體書上。這裡是你這一課的學習紀錄。</div>'; R.qi = 0; R.ex = null;
  if (L.paged) {if (R.page !== 0) {mountLayers(L.pages[0].layers); R.page = 0;} L.text = L.pages[0].text; L.keyTerms = L.pages[0].keyTerms; renderText(L.text);}
  $('examBox').innerHTML = ''; $('examLock').style.display = '';
  document.querySelectorAll('.hs').forEach(x => x.classList.remove('on', 'seen')); $('gloss').className = 'gloss empty'; $('gloss').innerHTML = '<div class="w">　</div><div class="d">點金色字詞，看解釋和立體書的變化。</div>';
  document.querySelectorAll('#predOpts .opt').forEach(x => x.classList.remove('pick')); $('guessText').value = ''; $('guessText').style.display = 'none'; $('btnGuess').disabled = true; pick = null;
}
let pick = null;
function fillLesson(L) {
  $('tagK').textContent = `${L.subjectEn} · ${L.subject} / ${L.lessonNo}`; $('tagT').textContent = `〈${L.title}〉`;
  $('counterK').textContent = L.counter ? L.counter.label : ''; $('src').textContent = L.source;
  $('btnArt').style.display = 'none'; $('goals').innerHTML = (L.goals || []).map(g => `<li>${g}</li>`).join(''); $('goalBox').style.display = L.goals && L.goals.length ? '' : 'none';
  $('btnPlain').style.display = L.plain ? '' : 'none'; $('plain').style.display = 'none'; $('plain').textContent = L.plain || ''; $('btnPlain').textContent = '顯示白話翻譯';
  const cl = $('classic'); cl.innerHTML = '';
  for (const [kind, s, key] of L.text) {const el = document.createElement('span'); el.textContent = s; if (kind === 'hs') {el.className = 'hs'; el.tabIndex = 0; el.onclick = () => gloss(key, el); el.onkeydown = e => {if (e.key === 'Enter') gloss(key, el);};} else if (kind === 'sp') el.className = 'sp'; cl.appendChild(el);}
  $('predQ').textContent = L.predict.q;
  $('predOpts').innerHTML = L.predict.opts.map(o => `<button class="opt" data-g="${o.replace(/"/g, '&quot;')}">${o}</button>`).join('') + (L.predict.opts.length ? '<button class="opt" data-g="other">我有別的想法……</button>' : '');
  document.querySelectorAll('#predOpts .opt').forEach(b => b.onclick = () => {document.querySelectorAll('#predOpts .opt').forEach(x => x.classList.toggle('pick', x === b)); pick = b.dataset.g; $('guessText').style.display = pick === 'other' ? 'block' : 'none'; $('btnGuess').disabled = pick === 'other' && !$('guessText').value.trim(); if (pick === 'other') $('guessText').focus();});
  $('revT').textContent = L.reveal.title; $('revB').textContent = L.reveal.body; $('revQ').innerHTML = L.reveal.quote;
  $('stylePrompt').textContent = STYLE;
  $('layers').innerHTML = '';
  for (const Ld of (L.paged ? L.pages[0].layers : L.layers)) {
    const div = document.createElement('div'); div.className = 'layer';
    div.innerHTML = `<div class="row"><img alt="" src="${layerThumb(L, Ld)}"><span class="name">${Ld.name}</span><button class="up">上傳</button><button class="rs">還原</button><input type="file" accept="image/png,image/webp,image/jpeg"></div><details><summary>生圖提示詞・建議尺寸 2048×${Math.round(2048 * Ld.h / Ld.w)}</summary><pre>${STYLE}.\n\nSubject: ${Ld.prompt}</pre><button class="cp">複製提示詞</button></details>`;
    const inp = div.querySelector('input'); div.querySelector('.up').onclick = () => inp.click(); div.querySelector('.rs').onclick = () => replaceLayer(Ld.id, null);
    div.querySelector('.cp').onclick = e => copy(`${STYLE}.\n\nSubject: ${Ld.prompt}`, e.currentTarget); inp.onchange = () => {if (inp.files[0]) replaceLayer(Ld.id, inp.files[0]);};
    $('layers').appendChild(div);
  }
}
const copy = (txt, btn) => {const o = btn.textContent, ok = () => {btn.textContent = '已複製'; setTimeout(() => btn.textContent = o, 1200);}; try {navigator.clipboard.writeText(txt).then(ok).catch(() => {btn.textContent = '請手動選取複製';});} catch (e) {btn.textContent = '請手動選取複製';}};
$('copyStyle').onclick = e => copy(STYLE, e.currentTarget);
function gloss(key, el) {
  const L = R.lesson; if (S.mode !== 'read') enterRead(); else if (S.theta < 3) turn(1);
  document.querySelectorAll('.hs').forEach(x => x.classList.toggle('on', x === el)); el.classList.add('seen'); rec.seen.add(key);
  const [w, d, f] = L.gloss[key], g = $('gloss'); g.classList.remove('empty'); g.innerHTML = `<div class="w">${w}</div><div class="d">${d}</div><div class="fx">▸ 場景：${f}</div>`;
  const run = () => L.fx[key] && L.fx[key](ctx); if (S.pop < .9) ctx.after(2.4, run); else run(); record(`點了「${w}」`);
}
function replaceLayer(id, file) {
  const o = R.L[id]; if (!R.original[id]) R.original[id] = o.mesh.material.map;
  const apply = (tex, aspect) => {tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; o.mesh.material.map = tex; if (o.mesh.material.emissiveMap) o.mesh.material.emissiveMap = tex; o.mesh.material.needsUpdate = true; o.tex = tex; if (o.mesh.customDepthMaterial) {o.mesh.customDepthMaterial.map = tex; o.mesh.customDepthMaterial.needsUpdate = true;} o.mesh.scale.y = (o.def.w * aspect) / o.def.h;};
  if (!file) return apply(R.original[id], o.def.h / o.def.w);
  const img = new Image(); img.onload = () => {
    let src;
    if (o.def.fog) {const c = mk(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height); let opaque = true; for (let i = 3; i < d.data.length; i += 400) if (d.data[i] < 250) {opaque = false; break;} if (opaque) {for (let i = 0; i < d.data.length; i += 4) {d.data[i + 3] = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3; d.data[i] = d.data[i + 1] = d.data[i + 2] = 240;} x.putImageData(d, 0, 0);} src = c;}
    else {const w = Math.min(2048, img.width), h = Math.round(img.height * w / img.width); src = paperCut(w, h, c => c.drawImage(img, 0, 0, w, h), Math.round(9 * w / 1024));}
    const tex = new THREE.CanvasTexture(src); apply(tex, img.height / img.width); if (S.mode !== 'read') enterRead(); record(`圖層「${o.def.name}」換上 AI 圖`);
  }; img.src = URL.createObjectURL(file);
}
function showReveal() {
  const L = R.lesson, g = S.guess, hit = g && new RegExp(L.predict.hit).test(g);
  $('mine').innerHTML = g ? `你在預告後猜：<b>「${g.replace(/</g, '&lt;')}」</b><br>${hit ? L.predict.hitMsg : L.predict.missMsg}` : '你跳過了猜測。下次先猜一個，讀起來會更有感覺！';
  AU.stopVoice(); showSub(null); $('revSum').innerHTML = (L.reveal.summary || []).map(x => `<li>${x}</li>`).join(''); $('revSumBox').style.display = L.reveal.summary && L.reveal.summary.length ? '' : 'none'; $('revQ').style.display = L.reveal.quote ? '' : 'none';
  BQ.hide(); $('reveal').classList.add('show'); setStep(3); AU.sfx.chime();
}
// the final test, one question at a time on the book; the open question comes last
function startExam() {
  const L = R.lesson, n = L.exam.length; $('reveal').classList.remove('show'); if (S.mode !== 'read') enterRead(); AU.stopVoice(); showSub(null); runId++;
  if (!R.ex) R.ex = {i: 0, right: 0, open: ''}; const ex = R.ex; if (R.masked) maskArt(false); $('leafPage').classList.add('exam'); tab('text');
  const finish = () => {
    const right = ex.right; rec.score = right; ST.done[L.id] = {score: right, total: n, at: Date.now()};
    ST.rec[L.id] = {guess: S.guess, hit: !!(S.guess && new RegExp(L.predict.hit).test(S.guess)), tries: rec.tries, seen: [...rec.seen].map(k => L.gloss[k][0]), score: right, total: n, open: ex.open.slice(0, 200)}; save(); setStep(4); BQ.hide(); R.ex = null; $('leafPage').classList.remove('exam');
    $('doneT').textContent = `你走完了〈${L.title}〉！`; $('dScore').textContent = `${right}/${n}`; $('dTries').textContent = rec.tries; $('dTerms').textContent = `${rec.seen.size}/${Object.keys(L.gloss).length}`;
    $('doneB').innerHTML = `這些數據會送到老師後台：預測內容、每題嘗試次數、點過哪些字詞、各層次測驗的對錯${ex.open ? '，以及你的開放題回答' : ''}。老師可以看出全班卡在哪一層。`;
    $('doneCard').classList.add('show'); AU.sfx.chime();
  };
  const askOpen = () => BQ.ask({tag: `測驗 ${n + 1} · 啟發（開放題）`, step: [n, n + 1], stem: L.open, opts: [], open: true, pill: '最後一題',
    body: `<textarea id="openAns" placeholder="先寫下你的想法，再看參考答案"></textarea>${L.model ? '<button class="bq-sub" id="btnModel" disabled>寫好了，對照參考答案</button>' : ''}`,
    ready(card) {const ta = $('openAns'); ta.oninput = () => {ex.open = ta.value.trim(); if (L.model) $('btnModel').disabled = ex.open.length < 4;};
      if (L.model) $('btnModel').onclick = () => {card.fb('參考答案：' + L.model + '　自我檢查：我有寫出原因嗎？我有用到課文裡的詞嗎？', true); record('對照了開放題的參考答案');};
      card.next('完成測驗', finish);}});
  const ask = i => {ex.i = i; if (i >= n) return askOpen(); const q = L.exam[i];
    BQ.ask({tag: `測驗 ${i + 1} · ${q.tag}`, step: [i, n + 1], stem: q.q, opts: q.opts, open: true, pill: `測驗第 ${i + 1} 題`,
      pick(k, card) {const ok = k === q.ans; card.lock(); card.mark(k, ok ? 'right' : 'wrong'); if (!ok) card.mark(q.ans, 'right'); if (ok) ex.right++; card.fb((ok ? '答對了。' : '這題答錯了。') + q.why, ok); ok ? AU.sfx.ok() : AU.sfx.no();
        record(`測驗 ${i + 1}（${q.tag}）${ok ? '答對' : '答錯'}`); ex.i = i + 1; card.next(i < n - 1 ? '下一題 →' : '最後一題：寫下你的想法 →', () => ask(i + 1));}});};
  ask(ex.i);
}
$('guessText').oninput = () => {$('btnGuess').disabled = !$('guessText').value.trim();};
$('btnGuess').onclick = () => {S.guess = pick === 'other' ? $('guessText').value.trim() : pick; enterRead(); record(`預測：「${S.guess}」`);};
$('btnPlay').onclick = () => {S.playing = !S.playing; AU.pauseVoice(!S.playing); $('btnPlay').textContent = S.playing ? '⏸ 暫停' : '▶ 播放';};
$('btnTeaserReplay').onclick = startTeaser; $('btnSkip').onclick = showPredict;
$('st0').onclick = startTeaser; $('st1').onclick = () => {if (S.mode !== 'read') showPredict();}; $('st2').onclick = () => {if (S.mode !== 'read') enterRead();};
$('st3').onclick = () => {if (S.mode !== 'read') enterRead(); showReveal();}; $('st4').onclick = startExam;
$('btnRevealClose').onclick = () => $('reveal').classList.remove('show'); $('btnToExam').onclick = startExam;
$('btnStay').onclick = () => $('doneCard').classList.remove('show'); $('btnBackMap').onclick = () => show('map');
$('btnPlain').onclick = () => {const on = $('plain').style.display === 'none'; $('plain').style.display = on ? '' : 'none'; $('btnPlain').textContent = on ? '隱藏白話翻譯' : '顯示白話翻譯'; if (on) record('打開了白話翻譯');};
let fontK = 0; const setFont = d => {fontK = Math.max(-1, Math.min(3, fontK + d)); $('classic').style.fontSize = (19.5 + fontK * 2) + 'px';}; $('fontUp').onclick = () => setFont(1); $('fontDown').onclick = () => setFont(-1);
$('btnTurn').onclick = () => {if (S.turnT >= 0) return; turn(S.theta < .01 ? 1 : -1);};
$('btnReplay').onclick = () => {S.theta = 0; S.pop = 0; S.turnT = -1; setLeaf(0); setTimeout(() => turn(1), 250);};
$('btnRead').onclick = () => {const b = $('btnRead'); if (R.lesson.custom || (TTS && claudeVoice)) {if (b.dataset.on) {AU.stopVoice(); delete b.dataset.on; b.textContent = '🔈 朗讀課文'; return;} b.dataset.on = 1; b.textContent = '⏹ 停止朗讀'; AU.speak(R.lesson.id + '/read', R.lesson.text.filter(x => x[0] !== 'sp').map(x => x[1]).join('').slice(0, 1900), voiceOpts(R.lesson, '旁白') || {noFile: true}).then(() => {delete b.dataset.on; b.textContent = '🔈 朗讀課文';}); return;} const on = AU.read(R.lesson.id + '/read', () => {b.textContent = '🔈 朗讀課文'; AU.readStop();}); b.textContent = on ? '⏹ 停止朗讀' : '🔈 朗讀課文'; if (!on) AU.readStop();};

async function openLesson(id) {
  const sp0 = ST.custom.find(x => x.id === id); if (sp0) await Custom.prepare(sp0);
  const L = byId(id); show('lesson'); resize(); buildLesson(L); fillLesson(L); S.cam.look.set(.12, .3, 0); S.cam.dist = 6.6; S.user = {yaw: -.08, pitch: .62, dist: 6.3}; startTeaser();
}

// ---------------------------------------------------------------------------------------------- screens
const SCR = {start: 'scrStart', upload: 'scrUpload', map: 'scrMap', lesson: 'scrLesson', dash: 'scrDash'};
function show(name) {
  if (name !== 'lesson' && active) {runId++; AU.stopVoice(); AU.readStop(); AU.musicStop(); $('btnRead').textContent = '🔈 朗讀課文';}
  if (name !== 'map') map3d.leave(); if (name !== 'map' && name !== 'lesson') AU.musicStop();
  active = name === 'lesson'; for (const [k, id] of Object.entries(SCR)) $(id).classList.toggle('on', k === name);
  $('navUpload').classList.toggle('on', name === 'upload'); $('navMap').classList.toggle('on', name === 'map' || name === 'lesson');
  $('navDash').classList.toggle('on', name === 'dash'); if (name === 'map') renderMap(); if (name === 'upload') initUpload(); if (name === 'dash') renderDash();
}
$('navHome').onclick = () => show('start'); $('navUpload').onclick = () => {AU.unlock(); show('upload');}; $('navMap').onclick = () => {AU.unlock(); show('map');};
$('navSound').onclick = e => {e.currentTarget.textContent = AU.toggle() ? '🔊' : '🔇';};
$('navReset').onclick = () => {ST = {gen: {}, done: {}, custom: [], rec: {}}; save(); try {location.reload();} catch (e) {show('start');}};
$('navDash').onclick = () => {AU.unlock(); show('dash');};
$('navVoice').onclick = e => {claudeVoice = !claudeVoice; e.currentTarget.textContent = claudeVoice ? '語音：Claude' : '語音：內建';};
$('goTeacher').onclick = () => {AU.unlock(); show('upload');};
const genAll = () => {for (const l of LESSONS) if (!ST.gen[l.id]) {ST.gen[l.id] = true; justGen.add(l.id);} save();};
$('goStudent').onclick = () => {AU.unlock(); genAll(); show('map');}; $('mapAll').onclick = () => {genAll(); renderMap();}; $('mapUpload').onclick = () => show('upload');

// ---- upload + analysis
let upSubj = 'boat', upBusy = false, upMode = 'topic';
const STEPS = {mat: ['讀取教材', '切分頁面', 'AI 整理課文、分頁、出題', 'AI 繪製插圖、組裝紙雕場景', '產生預告、提問與測驗'], topic: ['讀取老師的需求', '查詢課綱範圍與各版本的排課', 'AI 編寫課文、分頁、出題', 'AI 繪製每一頁的插圖', '組裝立體書：預告、提問、測驗']};
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const artThumbs = sp => `<div class="thumbs">${sp.pages.map(pg => pg.art && pg.art.svg ? `<img class="artth" alt="${esc(pg.art.name)}" title="${esc(pg.art.name)}" src="${Custom.svgUrl(pg.art.svg)}">` : `<span class="tagc" style="font-size:18px">${[...(pg.scene.back || []), ...pg.scene.mid, ...(pg.scene.front || [])].join(' ')}</span>`).join('')}</div>`;
function setMode(m) {if (upBusy) return; upMode = m; document.querySelectorAll('#modeChips button').forEach(b => b.classList.toggle('on', b.dataset.m === m)); $('paneTopic').style.display = m === 'topic' ? '' : 'none'; $('paneMat').style.display = m === 'mat' ? '' : 'none'; $('confirmBox').style.display = 'none'; pending = null; initUpload();}
document.querySelectorAll('#modeChips button').forEach(b => b.onclick = () => setMode(b.dataset.m));
$('goalBox').querySelector('.gk').onclick = () => $('goalBox').classList.toggle('mini');
$('pageArt').onclick = () => $('pageArt').classList.remove('big'); $('btnArt').onclick = () => $('pageArt').classList.add('big');
$('tpGrade').innerHTML = Curri.GRADES.map(g => `<option value="${g}">${Curri.GNAME[g]}（${g}）</option>`).join('');
const tpFill = () => {$('tpGrade').value = '七下'; $('tpSubj').value = '自然'; $('tpTopic').value = '人體的器官認識'; $('tpInfo').textContent = '';}; $('tpExample').onclick = tpFill; tpFill();
function initUpload() {
  $('subjChips').innerHTML = LESSONS.map(l => `<button data-id="${l.id}" class="${l.id === upSubj ? 'on' : ''}">${l.subject}・${l.title}${ST.gen[l.id] ? ' ✓' : ''}</button>`).join('');
  document.querySelectorAll('#subjChips button').forEach(b => b.onclick = () => {if (upBusy) return; upSubj = b.dataset.id; $('material').value = byId(upSubj).material; initUpload();});
  if (!$('material').value) $('material').value = byId(upSubj).material; matInfo();
  if (!upBusy) {$('genSteps').innerHTML = STEPS[upMode].map((t, i) => `<li><span class="dot">${i + 1}</span><div><div class="t">${t}</div><div class="r"></div></div></li>`).join(''); $('btnToMap').style.display = 'none'; $('genLead').textContent = '按下「生成立體書」後，這裡會顯示每一步的結果。';}
}
const isSample = () => !upImage && $('material').value.replace(/\s/g, '') === byId(upSubj).material.replace(/\s/g, '');
const matInfo = () => {$('matInfo').textContent = `${$('material').value.replace(/\s/g, '').length} 字 · ${isSample() ? '範例教材' : '自訂教材（會整理成多頁立體書）'}`;};
$('material').oninput = matInfo; $('btnFile').onclick = () => $('fileIn').click();
let upImage = null;
const loadScript = src => new Promise((res, rej) => {const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = rej; document.head.appendChild(el);});
$('fileIn').onchange = async () => {
  const f = $('fileIn').files[0]; if (!f) return; upImage = null; $('upTitle').value = $('upTitle').value || f.name.replace(/\.[^.]+$/, '').slice(0, 12);
  try {
    if (/^image\//.test(f.type)) {if (!SAMPLE) {$('matInfo').textContent = '圖片教材需要線上版的 AI 才能讀取。'; return;} upImage = f; $('material').value = `（已附上圖片：${f.name}。AI 會讀出圖片裡的課文再整理。也可以在這裡補充說明。）`;}
    else if (/\.docx$/i.test(f.name)) {if (!window.mammoth) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'); const r = await window.mammoth.extractRawText({arrayBuffer: await f.arrayBuffer()}); $('material').value = r.value.trim().slice(0, 6000);}
    else $('material').value = (await f.text()).slice(0, 6000);
  } catch (e) {$('matInfo').textContent = '這個檔案讀不出來，請改貼文字或用 .txt / .docx。'; return;}
  matInfo(); $('fileIn').value = '';
};
$('btnGen').onclick = async () => {
  if (upBusy) return; const text = $('material').value.trim(); if (!text) return; AU.unlock(); upBusy = true; $('btnGen').disabled = true; initUploadSteps();
  const L = byId(upSubj), sample = isSample(), li = [...document.querySelectorAll('#genSteps li')], sleep = ms => new Promise(r => setTimeout(r, ms));
  const stepDo = async (i, html, ms = 900) => {li[i].classList.add('act'); await sleep(ms); li[i].classList.remove('act'); li[i].classList.add('fin'); li[i].querySelector('.dot').textContent = '✓'; li[i].querySelector('.r').innerHTML = html; AU.sfx.ok();};
  $('genLead').textContent = sample ? `正在把〈${L.title}〉變成立體書……` : '正在處理你貼上的教材……';
  await stepDo(0, `${text.replace(/\s/g, '').length} 字　·　科目：${L.subject}`, 600);
  if (sample) {
    await stepDo(1, L.outline.map(o => `<span class="tagc${o.includes('★') ? ' star' : ''}">${o.replace(' ★', '')}</span>`).join('') + '<br>金色＝示範版做好的那一頁');
    await stepDo(2, [...L.cast, ...L.places].map(o => `<span class="tagc">${o}</span>`).join('') + '<br>' + L.keyTerms.map(o => `<span class="tagc">${o}</span>`).join(''));
    await stepDo(3, `<div class="thumbs">${L.layers.map(x => `<img alt="${x.name}" title="${x.name}" src="${layerThumb(L, x)}">`).join('')}</div>${L.layers.length} 層紙雕，由後到前排好深度`, 1300);
    await stepDo(4, `預告 ${L.teaser.beats.length} 句對話（含配音）　·　互動提問 ${L.quiz.length} 題　·　測驗 ${L.exam.length + 1} 題`);
    if (!ST.gen[L.id]) {ST.gen[L.id] = true; justGen.add(L.id); save();} else justGen.add(L.id);
    $('genLead').textContent = `〈${L.title}〉生成完成。老師確認後發布，學生就能在海圖上看到。`; $('btnToMap').style.display = '';
  } else {
    if (CUSTOM.length >= 3) {$('genLead').textContent = '示範版最多放 3 座自編島。按右上角「重置」可以清空再試。'; upBusy = false; $('btnGen').disabled = false; return;}
    const ss = Custom.sentences(upImage ? '圖片教材。由 AI 讀取。' : text); await stepDo(1, ss.slice(0, 8).map((p, i) => `<span class="tagc">第 ${i + 1} 句：${p.slice(0, 10).replace(/</g, '&lt;')}…</span>`).join('') + (ss.length > 8 ? `<span class="tagc">…共 ${ss.length} 句</span>` : ''));
    let spec = null, note = '';
    li[2].classList.add('act');
    const img = upImage ? [upImage] : null, body = upImage ? text.replace(/（已附上圖片[^）]*）/, '').trim() : text;
    if (SAMPLE) {try {li[2].querySelector('.r').textContent = 'AI 正在讀教材、整理課文……（大約需要半分鐘）'; spec = await Custom.fromAI(SAMPLE, body, $('upTitle').value.trim(), img, n => {li[2].querySelector('.r').textContent = `AI 正在寫第 ${n + 1} 頁……`;}); note = '由 AI（Claude）整理課文、分頁、出題';} catch (e) {note = 'AI 解析沒有成功（' + String(e && (e.message || e.code) || '').slice(0, 30) + '），改用離線規則';}}
    if (!spec) {try {if (upImage) throw new Error('圖片教材需要 AI 才能讀取，這次沒有成功。請改貼文字。'); spec = Custom.fromRules(body, $('upTitle').value.trim()); note = note || '離線規則解析（原文分頁、重點詞、課文填空）。線上版會由 AI 整理課文並出題。';} catch (e) {li[2].classList.remove('act'); li[2].querySelector('.r').textContent = e.message; $('genLead').textContent = '這份教材還不能生成，請依提示調整後再試。'; upBusy = false; $('btnGen').disabled = false; return;}}
    await stepDo(2, spec.pages.map((pg, i) => `<span class="tagc">第 ${i + 1} 頁 ${pg.title}</span>`).join('') + `<br>${note}`, 300);
    li[3].classList.add('act'); let nArt = 0;
    if (SAMPLE && spec.by === 'ai') {li[3].querySelector('.r').textContent = 'AI 正在畫每一頁的插圖……（大約需要一分鐘）'; nArt = await Custom.drawArt(SAMPLE, spec, (d, t) => {li[3].querySelector('.r').textContent = `AI 正在畫插圖……已完成 ${d} / ${t} 張`;});}
    await Custom.prepare(spec);
    await stepDo(3, artThumbs(spec) + (nArt ? `AI 畫了 ${nArt} 張插圖；` : '') + '每一頁的場景：背景＋紙雕物件', 500);
    await stepDo(4, `開場旁白 ${spec.intro.length} 句　·　每頁 1 題，共 ${spec.pages.length} 題　·　測驗 ${spec.exam.length + 1} 題　·　重點整理 ${(spec.reveal.summary || []).length} 條`);
    pending = spec; $('genLead').textContent = '解析完成。請老師確認內容，再發布到海圖。'; showConfirm();
  }
  upBusy = false; $('btnGen').disabled = false;
};
$('btnTopic').onclick = async () => {
  if (upBusy) return; const topic = $('tpTopic').value.trim(), grade = $('tpGrade').value, subject = $('tpSubj').value, extra = $('tpExtra').value.trim();
  if (!topic) {$('tpInfo').textContent = '請先填主題。'; return;}
  if (CUSTOM.length >= 3) {$('tpInfo').textContent = '示範版最多放 3 座自編島。按右上角「重置」可以清空再試。'; return;}
  AU.unlock(); upBusy = true; $('btnTopic').disabled = true; $('tpInfo').textContent = ''; initUploadSteps();
  const li = [...document.querySelectorAll('#genSteps li')], sleep = ms => new Promise(r => setTimeout(r, ms)), note = (i, t) => {li[i].querySelector('.r').textContent = t;};
  const stepDo = async (i, html, ms = 900) => {li[i].classList.add('act'); await sleep(ms); li[i].classList.remove('act'); li[i].classList.add('fin'); li[i].querySelector('.dot').textContent = '✓'; li[i].querySelector('.r').innerHTML = html; AU.sfx.ok();};
  const stop = msg => {li.forEach(l => l.classList.remove('act')); $('genLead').textContent = msg; upBusy = false; $('btnTopic').disabled = false;};
  $('genLead').textContent = `正在為「${topic}」查課綱、編教材……`;
  await stepDo(0, `${Curri.GNAME[grade]}　·　${subject}　·　主題：${esc(topic)}${extra ? '<br>補充：' + esc(extra) : ''}`, 500);
  const found = Curri.lookup(topic, grade, subject);
  await stepDo(1, found.hits.map(e => `<span class="tagc${e.grade === grade ? ' star' : ''}">${e.grade}｜${e.unit}</span>`).join('') + (found.hits.length ? '<br>金色＝這個學期的單元<br>' : '') + esc(found.finding) + (found.hits.length ? `<br><span style="color:var(--mute)">課綱學習內容：${found.hits.flatMap(e => e.codes.map(c => c.split(' ')[0])).slice(0, 10).join('、')}</span>` : ''), 1200);
  let spec = null, why = ''; li[2].classList.add('act');
  if (SAMPLE) {try {note(2, 'AI 正在依課綱範圍編寫課文……（大約需要半分鐘到一分鐘）'); spec = await Custom.fromTopic(SAMPLE, found, extra, n => note(2, `AI 正在寫第 ${n + 1} 頁……`)); why = '由 AI（Claude）依查到的課綱範圍編寫，沒有照抄課本';} catch (e) {why = 'AI 編寫沒有成功（' + String(e && (e.code || e.message) || '').slice(0, 30) + '）';}}
  if (!spec) {
    if (subject === '自然' && found.hits.some(e => e.human)) {spec = JSON.parse(JSON.stringify(DEMO_ORGANS)); spec.curri = Custom.curriOf(found); why = (why ? why + '。' : '') + '這次沒有用到 AI，載入預先做好的範例〈人體的器官〉；它的格式和線上版 AI 生成的結果相同。';}
    else return stop((why ? why + '。' : '') + '只給主題的自編功能需要線上版的 AI。離線時可以試範例主題「人體的器官認識」，或改用「上傳現成教材」。');
  }
  await stepDo(2, spec.pages.map((pg, i) => `<span class="tagc">第 ${i + 1} 頁 ${esc(pg.title)}</span>`).join('') + `<br>${why}`, 300);
  li[3].classList.add('act'); const had = spec.pages.filter(pg => pg.art && pg.art.svg).length; let nArt = had;
  if (SAMPLE && spec.pages.some(pg => pg.art && !pg.art.svg)) {note(3, 'AI 正在畫每一頁的插圖……（大約需要一分鐘）'); nArt = await Custom.drawArt(SAMPLE, spec, (d, t) => note(3, `AI 正在畫插圖……已完成 ${d} / ${t} 張`));}
  await Custom.prepare(spec);
  await stepDo(3, artThumbs(spec) + (nArt ? `${nArt} 張有標示的教學插圖，會變成每一頁立起來的紙雕` : '這次插圖沒有畫成功，先用符號紙雕代替'), 600);
  await stepDo(4, `開場旁白 ${spec.intro.length} 句　·　每頁 1 題，共 ${spec.pages.length} 題　·　測驗 ${spec.exam.length + 1} 題　·　重點整理 ${(spec.reveal.summary || []).length} 條`);
  pending = spec; $('genLead').textContent = '生成完成。請老師核對內容，再發布到海圖。'; showConfirm(); upBusy = false; $('btnTopic').disabled = false;
};
function initUploadSteps() {$('confirmBox').style.display = 'none'; document.querySelectorAll('#genSteps li').forEach((l, i) => {l.className = ''; l.querySelector('.dot').textContent = i + 1; l.querySelector('.r').innerHTML = '';}); $('btnToMap').style.display = 'none';}
$('btnToMap').onclick = () => show('map');
let pending = null;
function showConfirm() {
  const sp = pending, box = $('confirmBox'); box.style.display = '';
  box.innerHTML = `<h2 style="margin-top:0">老師確認</h2><div class="sub2">可以改課名、拿掉不要的頁。確認後才會出現在學生的海圖上。</div>${sp.curri ? `<div class="pv curbox"><b style="color:var(--gold)">課綱對照</b>　${esc(sp.curri.finding)}${sp.curri.units.length ? '<br>' + sp.curri.units.map(u => `<span class="tagc">${u.grade}｜${u.unit}　${u.codes.join(' ')}</span>`).join('') : ''}</div>` : ''}
    <label class="fl">課名<input id="cfTitle" maxlength="12" value="${sp.title.replace(/"/g, '&quot;')}"></label>
    <div class="fl">懸念提問</div><div class="pv">${sp.hook}</div>
    <div class="fl">這本書的 ${sp.pages.length} 頁（點 ✕ 可以拿掉一頁，至少留 2 頁）</div><div id="cfPages">${sp.pages.map((pg, i) => `<div class="pv pgc" data-i="${i}">${pg.art && pg.art.svg ? `<img alt="" src="${Custom.svgUrl(pg.art.svg)}">` : ''}<b>第 ${i + 1} 頁　${pg.title}</b>　<span style="font-size:18px">${[...(pg.scene.back || []), ...pg.scene.mid].join(' ')}</span><button class="tbtn" style="float:right;padding:2px 9px">✕</button><br>${pg.text.replace(/</g, '&lt;')}<br><span style="color:var(--gold)">提問：</span>${pg.q.stem.replace(/</g, '&lt;')}</div>`).join('')}</div>
    <div class="fl">測驗</div><div class="pv">${sp.exam.map((q, i) => `${i + 1}. （${q.tag}）${(q.q || q.stem).slice(0, 50)}`).join('<br>')}</div>
    <div class="uprow"><span class="grow">${sp.origin === 'topic' ? 'AI 自編的課文和插圖，請老師核對正確性再發布。' : sp.by === 'ai' ? 'AI 整理的內容請老師看過再發布。' : '離線版用原文分頁、課文填空出題。'}</span><button class="primary" id="cfPublish">發布到海圖 →</button></div>`;
  const off = new Set(); box.querySelectorAll('.pgc .tbtn').forEach(b => b.onclick = () => {const el = b.parentElement, i = +el.dataset.i; if (off.has(i)) off.delete(i); else if (sp.pages.length - off.size > 2) off.add(i); el.style.opacity = off.has(i) ? .35 : 1;});
  $('cfPublish').onclick = async () => {
    sp.title = $('cfTitle').value.trim() || sp.title; sp.pages = sp.pages.filter((t, i) => !off.has(i)); sp.id = 'c' + Date.now().toString(36);
    if (sp.by === 'rule') {sp.reveal.title = `你讀完了〈${sp.title}〉`; sp.intro[0] = `今天要讀的是，${sp.title}。`; sp.intro[1] = `這本書一共有 ${sp.pages.length} 頁。每讀完一頁，回答一個問題，就能翻到下一頁。`;}
    await Custom.prepare(sp); ST.custom.push(sp); CUSTOM.push(Custom.build(sp)); ST.gen[sp.id] = true; justGen.add(sp.id); save(); pending = null; upImage = null; box.style.display = 'none'; $('material').value = ''; $('upTitle').value = ''; show('map');
  };
  box.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

// ---- teacher dashboard (class numbers are simulated; this device's own record is real)
function renderDash() {
  const list = ALL().filter(l => ST.gen[l.id]), hash = str => {let h = 7; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 9973; return h;}, N = 28;
  const bar = (label, pct, tone) => `<div class="brow"><span>${label}</span><div class="btrack"><div class="bfill ${tone || ''}" style="width:${Math.round(pct)}%"></div></div><b>${Math.round(pct)}%</b></div>`;
  $('dashBody').innerHTML = list.length ? list.map(L => {
    const h = hash(L.id + L.title), doneN = 16 + h % 11, hit = 30 + h % 45, qs = L.quiz.map((q, i) => ({name: `提問 ${i + 1}`, err: 12 + (h * (i + 3)) % 38})).concat(L.exam.map((q, i) => ({name: `測驗・${q.tag}`, err: 10 + (h * (i + 7)) % 55})));
    const worst = qs.slice().sort((a, b) => b.err - a.err)[0], terms = Object.values(L.gloss).map((g, i) => ({w: g[0], c: 20 + (h * (i + 2)) % 75})).sort((a, b) => b.c - a.c).slice(0, 4), me = ST.rec[L.id];
    return `<div class="box dcard"><div class="dhead"><div><div class="k mono">${L.subject} · ${L.lessonNo}</div><h2>〈${L.title}〉</h2></div><div class="dnum"><b>${doneN}/${N}</b>完成</div><div class="dnum"><b>${hit}%</b>預測猜中</div></div>
      <div class="dgrid"><div><h3>各題答錯比例</h3>${qs.map(q => bar(q.name, q.err, q === worst ? 'bad' : '')).join('')}</div><div><h3>最多人點開的字詞</h3>${terms.map(t => bar(t.w, t.c, 'ok')).join('')}</div></div>
      <div class="dtip">教學建議：「${worst.name}」答錯比例最高（${worst.err}%），下一堂課可以先帶全班回到課文對應的段落；最多人點開的字詞是「${terms[0].w}」，可以多花一分鐘解釋。</div>
      ${me ? `<div class="dme">這台裝置的真實紀錄：預測「${(me.guess || '（跳過）').replace(/</g, '&lt;')}」${me.hit ? '（猜中方向）' : ''}　·　提問嘗試 ${me.tries} 次　·　點了 ${me.seen.length} 個字詞　·　測驗 ${me.score}/${me.total}${me.open ? `<br>開放題回答：「${me.open.replace(/</g, '&lt;')}」` : ''}</div>` : '<div class="dme">這台裝置還沒有人完成這一課。</div>'}</div>`;
  }).join('') : '<div class="box">還沒有已發布的課程。先到「老師上傳」生成一課。</div>';
}

// ---- spaced review: one retrieval question for a finished island
function review(id) {
  const L = byId(id), q = L.exam[Math.floor(Math.random() * L.exam.length)], box = $('reviewCard');
  $('rvK').textContent = `複習 · ${L.subject}〈${L.title}〉`; $('rvQ').textContent = q.q; $('rvF').textContent = ''; $('rvF').className = 'fb';
  $('rvOpts').innerHTML = q.opts.map((o, k) => `<button class="opt" data-k="${k}">${o}</button>`).join('');
  $('rvOpts').querySelectorAll('.opt').forEach(b => b.onclick = () => {if (box.dataset.done) return; box.dataset.done = 1; const ok = +b.dataset.k === q.ans; b.classList.add(ok ? 'right' : 'wrong'); if (!ok) $('rvOpts').querySelectorAll('.opt')[q.ans].classList.add('right'); $('rvF').className = 'fb' + (ok ? ' ok' : ''); $('rvF').textContent = (ok ? '還記得！' : '忘記了沒關係，再看一次：') + q.why; ok ? AU.sfx.ok() : AU.sfx.no();});
  delete box.dataset.done; box.classList.add('show');
}
$('rvClose').onclick = () => $('reviewCard').classList.remove('show');

// ---- map (3D atlas, see map3d.js)
const MAP_MUSIC = {scale: [392, 440, 523.3, 587.3, 659.3, 784], bpm: 108, tone: 'bell'};
const map3d = Map3D({lessons: ALL, PLANNED, state: () => ST, justGen, sfx: AU.sfx, review, open: id => openLesson(id),
  upload: id => {upSubj = id; $('material').value = ''; show('upload');},
  plan: P => {$('planK').textContent = `${P.subjectEn} · 規劃中`; $('planT').textContent = `${P.subject}島：${P.title}`; $('planB').innerHTML = P.body; $('planCard').classList.add('show');}});
function renderMap() {const n = map3d.enter(); AU.music(MAP_MUSIC, .28);
  $('mapNote').textContent = LESSONS.some(l => ST.gen[l.id]) ? '點島嶼，紙船就會開過去；也可以用方向鍵或 WASD 自己開。靠岸後按「進入立體書」。' : '海圖上的島都還是藍圖。請老師先上傳教材，或按右上角「載入三課範例」。';}
$('planClose').onclick = () => $('planCard').classList.remove('show');

// ---------------------------------------------------------------------------------------------- boot
document.addEventListener('pointerdown', () => AU.unlock(), {once: true});
requestAnimationFrame(frame);
setTimeout(() => LESSONS.forEach(thumbFor), 400);
window.__demo = {BQ, markerXY: i => {const pg = R.lesson.pages[R.page], o = R.L.mid, l = pg.point.labels[i], [u, v] = artUV(o, l.cx, l.cy), p = new THREE.Vector3((u - .5) * o.def.w, v * o.def.h, 0); o.mesh.localToWorld(p); p.project(camera); const r = canvas.getBoundingClientRect(); return [r.left + (p.x + 1) / 2 * r.width, r.top + (1 - p.y) / 2 * r.height];}, map3d, S, show, openLesson, genAll, get R() {return R;}, showPredict, enterRead, showReveal};
})();
