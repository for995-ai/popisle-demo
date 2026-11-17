// Paper-cut art: every scene piece is painted on a canvas, then given a white cut edge and paper grain.
// Any piece can be replaced by AI-generated art (see the 素材 tab).
const rnd = (() => {let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647;})();
const mk = (w, h) => {const c = document.createElement('canvas'); c.width = w; c.height = h; return c;};
function grain(ctx, w, h, a = .06) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {if (d[i + 3] === 0) continue; const n = (rnd() - .5) * 255 * a; d[i] += n; d[i + 1] += n; d[i + 2] += n;}
  ctx.putImageData(img, 0, 0);
}
/** Draw art, then give it a white paper edge and fibre grain: the "cut paper" look. */
function paperCut(w, h, draw, edge = 9) {
  const art = mk(w, h); draw(art.getContext('2d'), w, h);
  const out = mk(w, h), o = out.getContext('2d');
  const sil = mk(w, h), s = sil.getContext('2d');
  for (let a = 0; a < 16; a++) s.drawImage(art, Math.cos(a / 16 * Math.PI * 2) * edge, Math.sin(a / 16 * Math.PI * 2) * edge);
  s.globalCompositeOperation = 'source-in'; s.fillStyle = '#fbf6ea'; s.fillRect(0, 0, w, h);
  o.drawImage(sil, 0, 0); o.drawImage(art, 0, 0); grain(o, w, h, .07);
  return out;
}
const poly = (c, pts, fill) => {c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = fill; c.fill();};

function drawSky(c, w, h) {
  c.beginPath(); c.moveTo(20, h); c.lineTo(20, 140);
  for (let x = 20; x <= w - 20; x += 120) c.quadraticCurveTo(x + 60, 60 + (x % 240 ? 10 : 40), x + 120, 140);
  c.lineTo(w - 20, h); c.closePath();
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#16224f'); g.addColorStop(.7, '#2f437f'); g.addColorStop(1, '#4b5e9b');
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  for (let i = 0; i < 70; i++) {c.fillStyle = `rgba(255,244,210,${.4 + rnd() * .6})`; c.beginPath(); c.arc(rnd() * w, 120 + rnd() * h * .45, 1.5 + rnd() * 3, 0, 7); c.fill();}
  const mg = c.createRadialGradient(760, 230, 40, 760, 230, 200); mg.addColorStop(0, 'rgba(255,240,190,.55)'); mg.addColorStop(1, 'rgba(255,240,190,0)');
  c.fillStyle = mg; c.fillRect(500, 0, 520, 480);
  c.fillStyle = '#f6e7b0'; c.beginPath(); c.arc(760, 230, 74, 0, 7); c.fill();
  c.fillStyle = '#2b3d77'; c.beginPath(); c.arc(792, 208, 66, 0, 7); c.fill();
  c.fillStyle = 'rgba(210,220,255,.35)'; c.beginPath(); c.ellipse(640, 270, 170, 18, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(860, 300, 130, 14, 0, 0, 7); c.fill();
  poly(c, [[0, h], [0, 560], [120, 470], [210, 520], [330, 420], [470, 540], [560, 480], [700, 560], [820, 470], [930, 530], [1024, 480], [1024, h]], '#24346b');
  poly(c, [[0, h], [0, 640], [160, 580], [300, 650], [420, 600], [560, 670], [700, 610], [860, 660], [1024, 600], [1024, h]], '#1b2856');
  c.restore();
}
function drawCamp(c, w, h) {
  const wl = h - 70;
  c.fillStyle = '#2d5a8a'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, wl);
  for (let x = 0; x <= w; x += 64) c.quadraticCurveTo(x + 32, wl - 14, x + 64, wl); c.lineTo(w, h); c.closePath(); c.fill();
  // tents
  [[300, 250], [420, 230], [560, 240], [680, 250]].forEach(([x, y]) => {poly(c, [[x - 70, wl - 120], [x, y], [x + 70, wl - 120]], '#d9c7a0'); poly(c, [[x - 12, wl - 120], [x, y + 30], [x + 12, wl - 120]], '#a8946c');});
  // palisade
  for (let x = 40; x < w - 40; x += 34) {const top = wl - 150 - (x % 68 ? 0 : 14); poly(c, [[x, wl + 10], [x, top + 18], [x + 14, top], [x + 28, top + 18], [x + 28, wl + 10]], x % 68 ? '#6b4a2f' : '#7c5738');}
  c.fillStyle = '#4e3421'; c.fillRect(30, wl - 110, w - 60, 14); c.fillRect(30, wl - 50, w - 60, 14);
  // towers
  for (const tx of [170, 850]) {
    c.fillStyle = '#5a3c25'; c.fillRect(tx - 60, 150, 14, wl - 140); c.fillRect(tx + 46, 150, 14, wl - 140);
    c.strokeStyle = '#5a3c25'; c.lineWidth = 10; c.beginPath(); c.moveTo(tx - 54, 200); c.lineTo(tx + 52, wl - 40); c.moveTo(tx + 52, 200); c.lineTo(tx - 54, wl - 40); c.stroke();
    c.fillStyle = '#7c5738'; c.fillRect(tx - 80, 140, 160, 26);
    poly(c, [[tx - 95, 100], [tx, 40], [tx + 95, 100]], '#3e2a1b');
    c.fillStyle = '#2b2233'; for (const ax of [-40, 0, 40]) {c.beginPath(); c.arc(tx + ax, 112, 11, 0, 7); c.fill(); c.fillRect(tx + ax - 9, 120, 18, 22);}
    c.strokeStyle = '#2b2233'; c.lineWidth = 4; c.beginPath(); c.arc(tx + 52, 124, 18, -1.2, 1.2); c.stroke();
    // flag
    c.fillStyle = '#4e3421'; c.fillRect(tx - 3, -2, 6, 60);
    poly(c, [[tx + 3, 4], [tx + 78, 14], [tx + 70, 34], [tx + 78, 54], [tx + 3, 52]], '#c8402f');
    c.fillStyle = '#1b1012'; c.font = '900 34px "Noto Serif TC", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('曹', tx + 36, 30);
  }
  // torches
  for (const x of [80, 330, 510, 700, 960]) {c.fillStyle = '#4e3421'; c.fillRect(x - 3, wl - 190, 6, 50); const g = c.createRadialGradient(x, wl - 196, 2, x, wl - 196, 34); g.addColorStop(0, '#ffe7a0'); g.addColorStop(.4, '#ff9b3d'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(x - 40, wl - 236, 80, 80);}
  // archers behind the wall
  c.fillStyle = '#2b2233';
  for (let x = 90; x < w - 80; x += 58) {if (Math.abs(x - 170) < 80 || Math.abs(x - 850) < 80) continue; c.beginPath(); c.arc(x, wl - 168, 10, 0, 7); c.fill(); c.fillRect(x - 8, wl - 160, 16, 14);}
}
function drawBoats(c, w, h) {
  for (const [bx, big] of [[190, 0], [512, 1], [834, 0]]) {
    const hw = 150, deck = h - 120;
    // canopy (blue-green cloth)
    c.fillStyle = '#3f7f7a'; c.beginPath(); c.moveTo(bx - hw + 20, deck - 150); c.quadraticCurveTo(bx, deck - 190, bx + hw - 20, deck - 150); c.lineTo(bx + hw - 20, deck - 130); c.quadraticCurveTo(bx, deck - 168, bx - hw + 20, deck - 130); c.fill();
    c.fillStyle = '#4e3421'; c.fillRect(bx - hw + 24, deck - 140, 8, 140); c.fillRect(bx + hw - 32, deck - 140, 8, 140);
    // straw men
    for (let k = 0; k < 7; k++) {
      const sx = bx - hw + 46 + k * 35, sy = deck - 8;
      c.fillStyle = k % 2 ? '#d8bf7a' : '#cdb06a';
      c.beginPath(); c.ellipse(sx, sy - 54, 16, 46, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(sx, sy - 106, 13, 0, 7); c.fill();
      c.strokeStyle = '#a88b4a'; c.lineWidth = 3; for (let j = 0; j < 4; j++) {c.beginPath(); c.moveTo(sx - 12, sy - 80 + j * 16); c.lineTo(sx + 12, sy - 76 + j * 16); c.stroke();}
    }
    if (big) {
      // drum + drummer, and Zhuge Liang with his feather fan
      c.fillStyle = '#4e3421'; c.fillRect(bx - 40, deck - 30, 8, 30); c.fillRect(bx + 12, deck - 30, 8, 30);
      c.fillStyle = '#9b2f22'; c.fillRect(bx - 44, deck - 84, 68, 56); c.fillStyle = '#f0d9a8'; c.beginPath(); c.ellipse(bx - 10, deck - 84, 34, 10, 0, 0, 7); c.fill();
      c.strokeStyle = '#e8c46a'; c.lineWidth = 4; c.beginPath(); c.moveTo(bx - 44, deck - 56); c.lineTo(bx + 24, deck - 56); c.stroke();
      c.strokeStyle = '#4e3421'; c.lineWidth = 6; c.beginPath(); c.moveTo(bx + 30, deck - 120); c.lineTo(bx + 4, deck - 92); c.stroke();
      c.fillStyle = '#fbf6ea'; c.beginPath(); c.moveTo(bx + 60, deck); c.lineTo(bx + 72, deck - 80); c.lineTo(bx + 98, deck - 80); c.lineTo(bx + 110, deck); c.fill();
      c.beginPath(); c.arc(bx + 85, deck - 96, 14, 0, 7); c.fillStyle = '#f2d2b0'; c.fill();
      c.fillStyle = '#2b2233'; c.fillRect(bx + 74, deck - 116, 22, 8);
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(bx + 118, deck - 86, 12, 22, -.5, 0, 7); c.fill();
    }
    // cabin with lantern
    c.fillStyle = '#7a5236'; c.fillRect(bx + (big ? -110 : 40), deck - 70, 60, 70);
    poly(c, [[bx + (big ? -118 : 32), deck - 70], [bx + (big ? -80 : 70), deck - 100], [bx + (big ? -42 : 108), deck - 70]], '#4e3421');
    const lx = bx + (big ? -80 : 70), g = c.createRadialGradient(lx, deck - 40, 2, lx, deck - 40, 26); g.addColorStop(0, '#fff2b0'); g.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = g; c.fillRect(lx - 30, deck - 70, 60, 60);
    // hull
    c.fillStyle = '#5a3b26'; c.beginPath(); c.moveTo(bx - hw - 20, deck - 10); c.quadraticCurveTo(bx, deck + 4, bx + hw + 20, deck - 10);
    c.quadraticCurveTo(bx + hw, h - 30, bx + hw - 40, h - 26); c.lineTo(bx - hw + 40, h - 26); c.quadraticCurveTo(bx - hw, h - 30, bx - hw - 20, deck - 10); c.fill();
    c.fillStyle = '#7c5738'; c.fillRect(bx - hw + 10, deck + 12, 2 * hw - 20, 10);
  }
}
function drawWaves(c, w, h) {
  for (const [y, col, amp] of [[40, '#4a8fc8', 28], [80, '#2f6fa8', 30]]) {
    c.fillStyle = col; c.beginPath(); c.moveTo(0, h);
    for (let x = 0; x <= w; x += 85) {c.lineTo(x, y + 20); c.quadraticCurveTo(x + 20, y - amp, x + 55, y); c.quadraticCurveTo(x + 70, y + 12, x + 85, y + 20);}
    c.lineTo(w, h); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 5;
    for (let x = 0; x <= w; x += 85) {c.beginPath(); c.moveTo(x + 14, y + 6); c.quadraticCurveTo(x + 24, y - amp * .7, x + 52, y + 2); c.stroke();}
  }
}
function drawFog(c, w, h) {
  for (let i = 0; i < 26; i++) {
    const x = rnd() * w, y = h * (.35 + rnd() * .4), r = 60 + rnd() * 120;
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(235,240,255,.55)'); g.addColorStop(1, 'rgba(235,240,255,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    // tile seamlessly
    if (x < r) c.fillRect(x - r + w, y - r, r * 2, r * 2); if (x > w - r) c.fillRect(x - r - w, y - r, r * 2, r * 2);
  }
}
// --- teaser (story preview) art: paper puppets and backdrops -----------------------------------------------
function figure(c, w, h, o) {
  const cx = w / 2, sk = '#f2d2b0';
  // sleeves behind
  c.fillStyle = o.robe2; c.beginPath(); c.ellipse(cx - 78, h * .55, 40, 95, .25, 0, 7); c.fill(); c.beginPath(); c.ellipse(cx + 78, h * .55, 40, 95, -.25, 0, 7); c.fill();
  // robe
  c.fillStyle = o.robe; c.beginPath(); c.moveTo(cx - 52, h * .36); c.lineTo(cx + 52, h * .36); c.quadraticCurveTo(cx + 70, h * .7, cx + 98, h * .97); c.lineTo(cx - 98, h * .97); c.quadraticCurveTo(cx - 70, h * .7, cx - 52, h * .36); c.fill();
  c.fillStyle = o.trim; c.beginPath(); c.moveTo(cx - 14, h * .36); c.lineTo(cx + 14, h * .36); c.lineTo(cx + 22, h * .97); c.lineTo(cx - 22, h * .97); c.fill();
  c.fillStyle = o.belt || '#2b2233'; c.fillRect(cx - 58, h * .52, 116, 14);
  // collar
  c.fillStyle = o.trim; poly(c, [[cx - 40, h * .35], [cx, h * .45], [cx + 40, h * .35], [cx + 28, h * .33], [cx, h * .4], [cx - 28, h * .33]], o.trim);
  // head
  c.fillStyle = sk; c.beginPath(); c.arc(cx, h * .25, 40, 0, 7); c.fill();
  c.fillStyle = '#2b2233'; c.beginPath(); c.arc(cx - 14, h * .25, 4.5, 0, 7); c.arc(cx + 14, h * .25, 4.5, 0, 7); c.fill();
  c.strokeStyle = '#2b2233'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 22, h * .225); c.lineTo(cx - 8, h * .22); c.moveTo(cx + 8, h * .22); c.lineTo(cx + 22, h * .225); c.stroke();
  c.fillStyle = '#e59a8a'; c.beginPath(); c.ellipse(cx - 24, h * .275, 7, 4, 0, 0, 7); c.ellipse(cx + 24, h * .275, 7, 4, 0, 0, 7); c.fill();
  if (o.beard) {c.fillStyle = '#2b2233'; c.beginPath(); c.moveTo(cx - 16, h * .3); c.quadraticCurveTo(cx, h * .37, cx + 16, h * .3); c.quadraticCurveTo(cx, h * .33, cx - 16, h * .3); c.fill(); c.fillRect(cx - 12, h * .287, 24, 4);}
  else {c.strokeStyle = '#8a4a3a'; c.lineWidth = 3; c.beginPath(); c.arc(cx, h * .28, 9, .3, 2.8); c.stroke();}
  // hats
  if (o.hat === 'crown') {
    c.fillStyle = '#2b2233'; c.beginPath(); c.arc(cx, h * .21, 41, Math.PI, 0); c.fill();
    c.fillStyle = '#e8c46a'; poly(c, [[cx - 22, h * .15], [cx - 14, h * .1], [cx, h * .14], [cx + 14, h * .1], [cx + 22, h * .15]], '#e8c46a');
    c.strokeStyle = '#c8402f'; c.lineWidth = 8; c.beginPath(); c.moveTo(cx + 18, h * .1); c.quadraticCurveTo(cx + 70, h * .02, cx + 66, h * .16); c.stroke();
  } else if (o.hat === 'scarf') {
    c.fillStyle = '#2f4a7a'; c.beginPath(); c.arc(cx, h * .215, 42, Math.PI * 1.02, -.02); c.fill(); c.fillRect(cx - 10, h * .12, 20, 18);
    c.beginPath(); c.moveTo(cx + 34, h * .22); c.quadraticCurveTo(cx + 62, h * .27, cx + 52, h * .34); c.lineTo(cx + 42, h * .33); c.quadraticCurveTo(cx + 48, h * .27, cx + 28, h * .24); c.fill();
  } else if (o.hat === 'official') {
    c.fillStyle = '#2b2233'; c.beginPath(); c.arc(cx, h * .21, 42, Math.PI, 0); c.fill(); c.fillRect(cx - 30, h * .12, 60, 22);
    c.fillRect(cx - 86, h * .17, 50, 8); c.fillRect(cx + 36, h * .17, 50, 8);
  }
  // hands + props
  c.fillStyle = sk; c.beginPath(); c.arc(cx + 58, h * .6, 13, 0, 7); c.arc(cx - 58, h * .6, 13, 0, 7); c.fill();
  if (o.fan) {c.fillStyle = '#4e3421'; c.fillRect(cx + 54, h * .5, 7, 60); c.fillStyle = '#fbf6ea'; c.beginPath(); c.ellipse(cx + 58, h * .44, 34, 52, .2, 0, 7); c.fill(); c.strokeStyle = '#c9c1ad'; c.lineWidth = 2; for (let i = -2; i <= 2; i++) {c.beginPath(); c.moveTo(cx + 58, h * .51); c.lineTo(cx + 58 + i * 14, h * .37); c.stroke();}}
  if (o.sword) {c.fillStyle = '#e8c46a'; c.fillRect(cx - 104, h * .5, 26, 8); c.fillStyle = '#4e3421'; c.fillRect(cx - 96, h * .52, 10, 150);}
  if (o.scroll) {c.fillStyle = '#f0dfb8'; c.fillRect(cx - 80, h * .56, 46, 20); c.fillStyle = '#9b6a3a'; c.fillRect(cx - 84, h * .555, 6, 26); c.fillRect(cx - 36, h * .555, 6, 26);}
}
const figZhou = (c, w, h) => figure(c, w, h, {robe: '#b8342a', robe2: '#93261e', trim: '#e8c46a', hat: 'crown', sword: true});
const figKong = (c, w, h) => figure(c, w, h, {robe: '#f4f1e6', robe2: '#ddd6c2', trim: '#3f6fa8', hat: 'scarf', fan: true, beard: true, belt: '#3f6fa8'});
const figLu = (c, w, h) => figure(c, w, h, {robe: '#3f6fa8', robe2: '#2f5584', trim: '#e9dcc0', hat: 'official', beard: true, scroll: true});
function drawTent(c, w, h) {
  c.beginPath(); c.moveTo(20, h); c.lineTo(20, 120);
  for (let x = 20; x <= w - 20; x += 140) c.quadraticCurveTo(x + 70, 50, x + 140, 120);
  c.lineTo(w - 20, h); c.closePath();
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a1f1a'); g.addColorStop(1, '#8a3328'); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  for (let x = 40; x < w; x += 120) {c.fillStyle = 'rgba(255,200,150,.08)'; c.beginPath(); c.moveTo(x, 100); c.quadraticCurveTo(x + 40, h * .5, x + 10, h); c.lineTo(x + 60, h); c.quadraticCurveTo(x + 80, h * .5, x + 50, 100); c.fill();}
  c.fillStyle = '#e8c46a'; c.fillRect(w / 2 - 70, 150, 140, 260); poly(c, [[w / 2 - 70, 410], [w / 2, 450], [w / 2 + 70, 410]], '#e8c46a');
  c.fillStyle = '#7a2a22'; c.font = '900 110px "Noto Serif TC", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('吳', w / 2, 280);
  for (const x of [170, w - 170]) {const lg = c.createRadialGradient(x, 300, 4, x, 300, 90); lg.addColorStop(0, 'rgba(255,230,160,.9)'); lg.addColorStop(1, 'rgba(255,180,90,0)'); c.fillStyle = lg; c.fillRect(x - 90, 210, 180, 180); c.fillStyle = '#e0644f'; c.beginPath(); c.ellipse(x, 300, 30, 40, 0, 0, 7); c.fill(); c.fillStyle = '#2b2233'; c.fillRect(x - 3, 230, 6, 32);}
  c.fillStyle = '#3e1a15'; c.fillRect(0, h - 90, w, 90);
  c.restore();
}
function drawTable(c, w, h) {
  c.fillStyle = '#6b4a2f'; c.fillRect(60, 70, w - 120, 46); c.fillStyle = '#4e3421'; c.fillRect(100, 116, 30, h - 120); c.fillRect(w - 130, 116, 30, h - 120); c.fillRect(60, 110, w - 120, 14);
  // map scroll
  c.fillStyle = '#f0dfb8'; c.fillRect(300, 40, 280, 34); c.fillStyle = '#9b6a3a'; c.fillRect(292, 34, 12, 46); c.fillRect(576, 34, 12, 46);
  c.strokeStyle = '#7aa0c8'; c.lineWidth = 4; c.beginPath(); c.moveTo(320, 60); c.bezierCurveTo(380, 44, 460, 70, 560, 52); c.stroke();
  // candle
  c.fillStyle = '#fbf6ea'; c.fillRect(680, 10, 26, 62); const g = c.createRadialGradient(693, 0, 2, 693, 0, 40); g.addColorStop(0, '#fff2b0'); g.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = g; c.fillRect(650, -40, 90, 80);
  // a nearly empty quiver: "軍中缺箭"
  c.save(); c.translate(820, 72); c.rotate(.12); c.fillStyle = '#9b2f22'; c.fillRect(-24, -96, 48, 96); c.strokeStyle = '#3a2a1c'; c.lineWidth = 5; c.beginPath(); c.moveTo(-6, -96); c.lineTo(-10, -150); c.moveTo(8, -96); c.lineTo(12, -140); c.stroke(); c.restore();
}
function drawBank(c, w, h) {
  c.beginPath(); c.moveTo(20, h); c.lineTo(20, 110);
  for (let x = 20; x <= w - 20; x += 120) c.quadraticCurveTo(x + 60, 40, x + 120, 110);
  c.lineTo(w - 20, h); c.closePath();
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fd2f2'); g.addColorStop(.6, '#e6f4fb'); g.addColorStop(1, '#f4ecd6'); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  c.fillStyle = '#ffe9a6'; c.beginPath(); c.arc(820, 190, 60, 0, 7); c.fill();
  poly(c, [[0, h], [0, 400], [180, 300], [330, 390], [520, 290], [700, 380], [880, 300], [1024, 360], [1024, h]], '#a9cfa0');
  poly(c, [[0, h], [0, 470], [200, 420], [420, 480], [640, 430], [860, 480], [1024, 450], [1024, h]], '#88bb83');
  c.fillStyle = '#6ea7d6'; c.fillRect(0, h - 150, w, 150); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 5; for (let x = 40; x < w; x += 140) {c.beginPath(); c.moveTo(x, h - 100); c.quadraticCurveTo(x + 30, h - 120, x + 60, h - 100); c.stroke();}
  // willow
  c.fillStyle = '#5a3c25'; c.fillRect(110, 220, 26, h - 360);
  c.strokeStyle = '#6cb36f'; c.lineWidth = 6; for (let i = 0; i < 18; i++) {const x = 40 + i * 10; c.beginPath(); c.moveTo(123, 230); c.quadraticCurveTo(x, 260, x - 10 + (i % 3) * 8, 360 + (i % 4) * 30); c.stroke();}
  c.restore();
}

// ============================== 自然：水循環 ==============================
function scallopTop(c, w, h, top = 110, step = 120) {
  c.beginPath(); c.moveTo(20, h); c.lineTo(20, top);
  for (let x = 20; x <= w - 20; x += step) c.quadraticCurveTo(x + step / 2, top - 70, x + step, top);
  c.lineTo(w - 20, h); c.closePath();
}
function drawDaySky(c, w, h) {
  scallopTop(c, w, h);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5fb4f0'); g.addColorStop(.7, '#bfe6fb'); g.addColorStop(1, '#eaf7ff'); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  c.save(); c.translate(800, 230);
  for (let i = 0; i < 12; i++) {c.rotate(Math.PI / 6); c.fillStyle = '#ffd866'; c.beginPath(); c.moveTo(-14, -96); c.lineTo(0, -150); c.lineTo(14, -96); c.fill();}
  c.fillStyle = '#ffe58a'; c.beginPath(); c.arc(0, 0, 84, 0, 7); c.fill();
  c.fillStyle = '#b8742a'; c.beginPath(); c.arc(-28, -10, 7, 0, 7); c.arc(28, -10, 7, 0, 7); c.fill();
  c.strokeStyle = '#b8742a'; c.lineWidth = 6; c.beginPath(); c.arc(0, 8, 30, .25, Math.PI - .25); c.stroke();
  c.fillStyle = 'rgba(255,140,120,.5)'; c.beginPath(); c.ellipse(-48, 16, 14, 8, 0, 0, 7); c.ellipse(48, 16, 14, 8, 0, 0, 7); c.fill();
  c.restore();
  c.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y, s] of [[200, 260, 1], [470, 190, .7]]) {c.beginPath(); c.ellipse(x, y, 90 * s, 30 * s, 0, 0, 7); c.ellipse(x - 40 * s, y - 22 * s, 46 * s, 30 * s, 0, 0, 7); c.ellipse(x + 30 * s, y - 30 * s, 54 * s, 36 * s, 0, 0, 7); c.fill();}
  poly(c, [[0, h], [0, 620], [160, 540], [300, 610], [480, 520], [640, 600], [820, 530], [1024, 610], [1024, h]], '#bfe3c0');
  c.restore();
}
function drawMountain(c, w, h) {
  poly(c, [[30, h], [330, 90], [430, 200], [520, 120], [760, h]], '#6fae7a');
  poly(c, [[330, 90], [270, 180], [315, 165], [345, 205], [385, 170], [412, 196], [430, 200]], '#ffffff');
  poly(c, [[520, 120], [478, 178], [512, 170], [540, 200], [566, 176]], '#ffffff');
  poly(c, [[430, 200], [470, 330], [420, h], [760, h], [520, 120]], '#5b9a69');
  poly(c, [[600, h], [820, 250], [1000, h]], '#86c28f');
  // river from the snow line down to the bottom right
  c.strokeStyle = '#7fc4ee'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(372, 200); c.bezierCurveTo(330, 300, 470, 330, 430, 430); c.bezierCurveTo(400, 520, 600, 520, 700, h - 10); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 5; c.beginPath(); c.moveTo(376, 230); c.bezierCurveTo(350, 300, 470, 340, 440, 420); c.stroke();
  for (const [x, y, s] of [[150, h - 20, 1], [230, h - 10, .8], [860, h - 14, 1], [930, h - 8, .7], [560, h - 60, .7]]) {c.fillStyle = '#5a3c25'; c.fillRect(x - 5 * s, y - 40 * s, 10 * s, 40 * s); poly(c, [[x - 34 * s, y - 34 * s], [x, y - 120 * s], [x + 34 * s, y - 34 * s]], '#3f8656'); poly(c, [[x - 26 * s, y - 70 * s], [x, y - 140 * s], [x + 26 * s, y - 70 * s]], '#4a9a63');}
}
function drawCloudStalk(c, w, h) {
  // two clouds held up by thin paper struts, like a real pop-up
  for (const [cx, cy, s] of [[330, 150, 1.15], [720, 190, .9]]) {
    c.fillStyle = '#e9e2cf'; c.fillRect(cx - 9, cy + 20, 18, h - cy - 20);
    c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(cx, cy + 30 * s, 190 * s, 62 * s, 0, 0, 7); c.ellipse(cx - 90 * s, cy - 10 * s, 86 * s, 66 * s, 0, 0, 7); c.ellipse(cx + 10 * s, cy - 44 * s, 104 * s, 84 * s, 0, 0, 7); c.ellipse(cx + 104 * s, cy - 4 * s, 80 * s, 60 * s, 0, 0, 7); c.fill();
    c.fillStyle = '#dfe9f5'; c.beginPath(); c.ellipse(cx + 10 * s, cy + 52 * s, 150 * s, 26 * s, 0, 0, 7); c.fill();
    c.fillStyle = '#5a6c8a'; c.beginPath(); c.arc(cx - 34 * s, cy + 2 * s, 7 * s, 0, 7); c.arc(cx + 34 * s, cy + 2 * s, 7 * s, 0, 7); c.fill();
    c.strokeStyle = '#5a6c8a'; c.lineWidth = 5 * s; c.beginPath(); c.arc(cx, cy + 14 * s, 16 * s, .3, Math.PI - .3); c.stroke();
    c.fillStyle = 'rgba(255,150,150,.55)'; c.beginPath(); c.ellipse(cx - 58 * s, cy + 18 * s, 13 * s, 8 * s, 0, 0, 7); c.ellipse(cx + 58 * s, cy + 18 * s, 13 * s, 8 * s, 0, 0, 7); c.fill();
  }
}
function drawLand(c, w, h) {
  c.fillStyle = '#8fce86'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, 120); c.bezierCurveTo(200, 40, 420, 150, 620, 90); c.bezierCurveTo(800, 40, 940, 110, w, 80); c.lineTo(w, h); c.fill();
  c.fillStyle = '#7fc4ee'; c.beginPath(); c.moveTo(250, 80); c.bezierCurveTo(330, 150, 520, 150, 640, 200); c.bezierCurveTo(780, 250, 900, 230, w, 250); c.lineTo(w, h); c.lineTo(700, h); c.bezierCurveTo(600, 280, 380, 250, 200, 90); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 5; for (const x of [420, 600, 800]) {c.beginPath(); c.moveTo(x, 190 + (x - 420) * .12); c.quadraticCurveTo(x + 30, 176 + (x - 420) * .12, x + 60, 192 + (x - 420) * .12); c.stroke();}
  // house + trees + flowers
  c.fillStyle = '#fbf0d8'; c.fillRect(90, 130, 110, 90); poly(c, [[74, 136], [145, 70], [216, 136]], '#d9604c'); c.fillStyle = '#8a5a3a'; c.fillRect(132, 170, 30, 50); c.fillStyle = '#9fd8f5'; c.fillRect(102, 150, 24, 24);
  for (const [x, y, s] of [[30, 230, .9], [250, 250, .7], [880, 150, 1], [960, 170, .8], [760, 120, .7]]) {c.fillStyle = '#5a3c25'; c.fillRect(x - 5 * s, y - 36 * s, 10 * s, 36 * s); c.fillStyle = '#3f9a5c'; c.beginPath(); c.arc(x, y - 66 * s, 38 * s, 0, 7); c.fill(); c.fillStyle = '#56b371'; c.beginPath(); c.arc(x - 12 * s, y - 76 * s, 20 * s, 0, 7); c.fill();}
  for (let i = 0; i < 14; i++) {const x = 20 + rnd() * 240, y = 250 + rnd() * 60; c.fillStyle = ['#ffd1e0', '#fff2a8', '#ffffff'][i % 3]; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();}
}
function figDrop(c, w, h) {
  const cx = w / 2;
  c.fillStyle = '#58b6ee'; c.beginPath(); c.moveTo(cx, h * .08); c.bezierCurveTo(cx + 30, h * .3, cx + 96, h * .48, cx + 96, h * .66); c.arc(cx, h * .66, 96, 0, Math.PI); c.bezierCurveTo(cx - 96, h * .48, cx - 30, h * .3, cx, h * .08); c.fill();
  c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(cx - 44, h * .52, 14, 32, .5, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(cx - 30, h * .64, 21, 0, 7); c.arc(cx + 30, h * .64, 21, 0, 7); c.fill();
  c.fillStyle = '#1f3f66'; c.beginPath(); c.arc(cx - 26, h * .65, 11, 0, 7); c.arc(cx + 34, h * .65, 11, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(cx - 22, h * .635, 4, 0, 7); c.arc(cx + 38, h * .635, 4, 0, 7); c.fill();
  c.fillStyle = '#1f3f66'; c.beginPath(); c.arc(cx + 2, h * .74, 17, 0, Math.PI); c.fill(); c.fillStyle = '#ff8a9a'; c.beginPath(); c.arc(cx + 2, h * .775, 9, 0, Math.PI); c.fill();
  c.fillStyle = 'rgba(255,140,160,.6)'; c.beginPath(); c.ellipse(cx - 62, h * .73, 13, 8, 0, 0, 7); c.ellipse(cx + 66, h * .73, 13, 8, 0, 0, 7); c.fill();
  c.strokeStyle = '#3f9ad8'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - 92, h * .7); c.lineTo(cx - 118, h * .58); c.moveTo(cx + 92, h * .7); c.lineTo(cx + 118, h * .56); c.stroke();
}
function drawSeaBack(c, w, h) {
  scallopTop(c, w, h, 100, 128);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7cc8f5'); g.addColorStop(.55, '#d9f1fd'); g.addColorStop(.56, '#3f8fd0'); g.addColorStop(1, '#2a6fb0'); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  c.fillStyle = '#ffe58a'; c.beginPath(); c.arc(240, 250, 80, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,229,138,.35)'; c.beginPath(); c.arc(240, 250, 130, 0, 7); c.fill();
  c.fillStyle = '#e9d9a8'; c.beginPath(); c.ellipse(820, h * .6, 150, 26, 0, 0, 7); c.fill(); c.fillStyle = '#5a3c25'; c.fillRect(812, h * .6 - 130, 14, 120);
  c.strokeStyle = '#3f9a5c'; c.lineWidth = 16; c.lineCap = 'round'; for (const a of [-2.6, -2.1, -1.2, -.6]) {c.beginPath(); c.moveTo(819, h * .6 - 128); c.quadraticCurveTo(819 + Math.cos(a) * 60, h * .6 - 128 + Math.sin(a) * 70, 819 + Math.cos(a) * 110, h * .6 - 128 + Math.sin(a) * 40); c.stroke();}
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 5; for (let i = 0; i < 9; i++) {const x = 60 + i * 110, y = h * .66 + (i % 3) * 60; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 26, y - 16, x + 52, y); c.stroke();}
  c.restore();
}

// ============================== 社會：張騫通西域與絲路 ==============================
function drawPalace(c, w, h) {
  scallopTop(c, w, h, 120, 140);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a1512'); g.addColorStop(1, '#7a2a20'); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  // gold screen with a cloud pattern and the character 漢
  c.fillStyle = '#d9a441'; c.fillRect(w / 2 - 230, 170, 460, 420); c.fillStyle = '#e8c46a'; c.fillRect(w / 2 - 210, 190, 420, 380);
  c.strokeStyle = '#c08a2c'; c.lineWidth = 6; for (let i = 0; i < 5; i++) {const y = 230 + i * 70; c.beginPath(); c.moveTo(w / 2 - 190, y); c.bezierCurveTo(w / 2 - 100, y - 30, w / 2 - 40, y + 30, w / 2 + 40, y); c.bezierCurveTo(w / 2 + 100, y - 30, w / 2 + 150, y + 20, w / 2 + 190, y); c.stroke();}
  c.fillStyle = '#7a1f18'; c.font = '900 190px "Noto Serif TC", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('漢', w / 2, 380);
  for (const x of [110, w - 110]) {c.fillStyle = '#b8342a'; c.fillRect(x - 34, 120, 68, h); c.fillStyle = '#e8c46a'; c.fillRect(x - 44, 150, 88, 22); c.fillRect(x - 44, h - 130, 88, 22);}
  for (const x of [270, w - 270]) {const lg = c.createRadialGradient(x, 250, 4, x, 250, 80); lg.addColorStop(0, 'rgba(255,230,160,.9)'); lg.addColorStop(1, 'rgba(255,180,90,0)'); c.fillStyle = lg; c.fillRect(x - 80, 170, 160, 160); c.fillStyle = '#e0644f'; c.fillRect(x - 20, 220, 40, 60); c.fillStyle = '#e8c46a'; c.fillRect(x - 24, 212, 48, 10); c.fillRect(x - 24, 278, 48, 10);}
  c.fillStyle = '#2a0f0d'; c.fillRect(0, h - 90, w, 90);
  c.restore();
}
function drawThrone(c, w, h) {
  // steps + low table with bamboo slips
  c.fillStyle = '#5a1a14'; c.fillRect(40, h - 60, w - 80, 60); c.fillStyle = '#7a2a20'; c.fillRect(120, h - 120, w - 240, 60);
  c.fillStyle = '#e8c46a'; c.fillRect(40, h - 66, w - 80, 8); c.fillRect(120, h - 126, w - 240, 8);
  c.fillStyle = '#c9b27a'; for (let i = 0; i < 7; i++) c.fillRect(w / 2 - 70 + i * 20, h - 160, 16, 40);
  c.strokeStyle = '#8a5a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(w / 2 - 70, h - 148); c.lineTo(w / 2 + 66, h - 148); c.moveTo(w / 2 - 70, h - 132); c.lineTo(w / 2 + 66, h - 132); c.stroke();
}
function figEmperor(c, w, h) {
  figure(c, w, h, {robe: '#2b2233', robe2: '#1d1826', trim: '#c8402f', beard: true, belt: '#e8c46a'});
  const cx = w / 2;
  c.fillStyle = '#2b2233'; c.beginPath(); c.arc(cx, h * .21, 42, Math.PI, 0); c.fill(); c.fillRect(cx - 22, h * .1, 44, 26);
  c.fillRect(cx - 70, h * .085, 140, 12);
  c.fillStyle = '#e8c46a'; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {c.beginPath(); c.arc(cx - 58 + i * 8, h * .115 + j * 12, 3.4, 0, 7); c.arc(cx + 26 + i * 8, h * .115 + j * 12, 3.4, 0, 7); c.fill();}
  c.fillStyle = '#e8c46a'; c.beginPath(); c.arc(cx, h * .7, 16, 0, 7); c.fill();
}
function figZhang(c, w, h) {
  figure(c, w, h, {robe: '#9a6a3a', robe2: '#7c5230', trim: '#f0dfb8', hat: 'scarf', beard: true, belt: '#5a3c25'});
  const cx = w / 2;   // the envoy's staff (節) with three tassels
  c.fillStyle = '#5a3c25'; c.fillRect(cx + 54, h * .1, 8, h * .86);
  for (let i = 0; i < 3; i++) {c.fillStyle = '#c8402f'; c.beginPath(); c.ellipse(cx + 58, h * .15 + i * 46, 17, 20, 0, 0, 7); c.fill(); c.fillStyle = '#e8c46a'; c.fillRect(cx + 46, h * .15 + i * 46 - 24, 24, 6);}
}
function drawDesertSky(c, w, h) {
  scallopTop(c, w, h, 110, 128);
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f08a4b'); g.addColorStop(.5, '#f9c56b'); g.addColorStop(1, '#fde9b8'); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  c.fillStyle = 'rgba(255,245,200,.5)'; c.beginPath(); c.arc(700, 330, 150, 0, 7); c.fill(); c.fillStyle = '#fff3c0'; c.beginPath(); c.arc(700, 330, 92, 0, 7); c.fill();
  // far snow mountains (天山) and mesas
  poly(c, [[0, h], [0, 520], [120, 430], [220, 500], [360, 400], [470, 490], [600, 440], [760, 510], [900, 430], [1024, 500], [1024, h]], '#c98a6a');
  poly(c, [[360, 400], [330, 432], [352, 428], [366, 446], [384, 430], [398, 438]], '#fff5e6'); poly(c, [[120, 430], [98, 452], [118, 450], [134, 462], [146, 452]], '#fff5e6'); poly(c, [[900, 430], [876, 454], [898, 450], [912, 464], [928, 452]], '#fff5e6');
  poly(c, [[0, h], [0, 600], [200, 560], [420, 610], [640, 570], [860, 620], [1024, 580], [1024, h]], '#e0a060');
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 6; c.beginPath(); c.moveTo(150, 250); c.quadraticCurveTo(260, 230, 380, 250); c.moveTo(820, 210); c.quadraticCurveTo(900, 196, 980, 214); c.stroke();
  c.restore();
}
function drawGate(c, w, h) {
  // 長安 city gate on the left, an oasis town of the Western Regions on the right
  const base = h - 20;
  c.fillStyle = '#8f8a84'; c.fillRect(20, base - 190, 400, 190);
  c.fillStyle = '#7b766f'; for (let x = 20; x < 420; x += 50) c.fillRect(x, base - 214, 30, 26);
  c.fillStyle = '#3a2a22'; c.beginPath(); c.moveTo(170, base); c.lineTo(170, base - 90); c.arc(220, base - 90, 50, Math.PI, 0); c.lineTo(270, base); c.fill();
  c.fillStyle = '#b8342a'; c.fillRect(120, base - 300, 200, 90);
  poly(c, [[80, base - 296], [220, base - 370], [360, base - 296], [330, base - 286], [110, base - 286]], '#3e3a44');
  c.fillStyle = '#e8c46a'; c.fillRect(186, base - 270, 68, 44); c.fillStyle = '#3a1512'; c.font = '900 30px "Noto Serif TC", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('長安', 220, base - 247);
  c.fillStyle = '#5a3c25'; c.fillRect(380, base - 330, 7, 120); poly(c, [[387, base - 328], [450, base - 318], [442, base - 300], [450, base - 282], [387, base - 284]], '#c8402f');
  // oasis town
  for (const [x, wd, ht] of [[700, 110, 110], [800, 90, 150], [880, 120, 90]]) {c.fillStyle = '#e3b074'; c.fillRect(x, base - ht, wd, ht); c.fillStyle = '#c98f55'; c.fillRect(x + wd * .35, base - 46, wd * .3, 46);}
  c.fillStyle = '#6ec0b0'; c.beginPath(); c.arc(845, base - 150, 46, Math.PI, 0); c.fill(); c.fillStyle = '#e8c46a'; c.fillRect(842, base - 214, 6, 22);
  for (const x of [660, 1000]) {c.fillStyle = '#7a5a3a'; c.fillRect(x - 5, base - 130, 10, 130); c.strokeStyle = '#3f9a5c'; c.lineWidth = 12; c.lineCap = 'round'; for (const a of [-2.7, -2.1, -1.1, -.5]) {c.beginPath(); c.moveTo(x, base - 128); c.quadraticCurveTo(x + Math.cos(a) * 40, base - 128 + Math.sin(a) * 50, x + Math.cos(a) * 74, base - 128 + Math.sin(a) * 22); c.stroke();}}
}
function drawCaravan(c, w, h) {
  const g = h - 24;
  const camel = (x, s, load) => {
    c.save(); c.translate(x, g); c.scale(-s, s);     // facing left = heading west
    c.fillStyle = '#c98f55';
    for (const lx of [-58, -34, 30, 54]) c.fillRect(lx, -74, 13, 74);
    c.beginPath(); c.ellipse(0, -100, 84, 40, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(-28, -138, 30, 32, 0, 0, 7); c.ellipse(26, -138, 30, 32, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(64, -110); c.quadraticCurveTo(100, -130, 96, -190); c.lineTo(118, -190); c.quadraticCurveTo(124, -110, 78, -84); c.fill();
    c.beginPath(); c.ellipse(118, -196, 30, 18, -.2, 0, 7); c.fill();
    c.fillStyle = '#2b2233'; c.beginPath(); c.arc(124, -202, 4, 0, 7); c.fill();
    c.fillStyle = '#a8743f'; c.beginPath(); c.moveTo(-82, -104); c.quadraticCurveTo(-104, -80, -96, -50); c.lineTo(-90, -52); c.quadraticCurveTo(-94, -80, -76, -96); c.fill();
    // load: silk bolts / chests
    c.fillStyle = load; c.fillRect(-46, -168, 92, 44); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-46, -156, 92, 6); c.fillRect(-46, -140, 92, 6);
    c.fillStyle = '#7a2a22'; c.fillRect(-52, -128, 104, 12);
    c.restore();
  };
  camel(250, 1, '#d9485a'); camel(540, 1.05, '#4a8fd0'); camel(830, .95, '#e8c46a');
  // the envoy leading on foot, holding the staff
  c.fillStyle = '#9a6a3a'; c.beginPath(); c.moveTo(70, g); c.lineTo(84, g - 100); c.lineTo(122, g - 100); c.lineTo(136, g); c.fill();
  c.fillStyle = '#f2d2b0'; c.beginPath(); c.arc(103, g - 122, 20, 0, 7); c.fill(); c.fillStyle = '#2f4a7a'; c.beginPath(); c.arc(103, g - 128, 21, Math.PI, 0); c.fill();
  c.fillStyle = '#5a3c25'; c.fillRect(56, g - 190, 7, 190); c.fillStyle = '#c8402f'; for (let i = 0; i < 3; i++) {c.beginPath(); c.ellipse(59, g - 176 + i * 26, 11, 12, 0, 0, 7); c.fill();}
}
function drawDunes(c, w, h) {
  c.fillStyle = '#e9b06a'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, 90); c.bezierCurveTo(160, 20, 300, 120, 470, 70); c.bezierCurveTo(640, 20, 800, 110, w, 50); c.lineTo(w, h); c.fill();
  c.fillStyle = '#d99a52'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, 150); c.bezierCurveTo(220, 90, 380, 190, 600, 130); c.bezierCurveTo(780, 90, 900, 160, w, 120); c.lineTo(w, h); c.fill();
  c.strokeStyle = 'rgba(255,240,200,.6)'; c.lineWidth = 4; for (let i = 0; i < 7; i++) {const x = 40 + i * 140, y = 120 + (i % 2) * 40; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 40, y - 14, x + 86, y); c.stroke();}
}
function drawChains(c, w, h) {   // 匈奴 tent where the envoy is held
  poly(c, [[60, h - 10], [w / 2, 60], [w - 60, h - 10]], '#8a6a4a'); poly(c, [[w / 2 - 60, h - 10], [w / 2, 150], [w / 2 + 60, h - 10]], '#3a2a22');
  c.strokeStyle = '#5a3c25'; c.lineWidth = 8; for (const x of [200, 330, w - 330, w - 200]) {c.beginPath(); c.moveTo(w / 2, 62); c.lineTo(x, h - 10); c.stroke();}
  c.fillStyle = '#5a3c25'; c.fillRect(w / 2 - 4, 10, 8, 60); poly(c, [[w / 2 + 4, 12], [w / 2 + 70, 24], [w / 2 + 4, 40]], '#2b2233');
}

// soft round sprites for particles
function spriteCanvas(kind) {
  const c = mk(64, 64), x = c.getContext('2d');
  if (kind === 'vapor') {const g = x.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);}
  else if (kind === 'drop') {x.fillStyle = '#4aa8ea'; x.beginPath(); x.moveTo(32, 4); x.bezierCurveTo(40, 22, 52, 32, 52, 42); x.arc(32, 42, 20, 0, Math.PI); x.bezierCurveTo(12, 32, 24, 22, 32, 4); x.fill(); x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.ellipse(24, 40, 4, 8, .4, 0, 7); x.fill();}
  else if (kind === 'spark') {x.fillStyle = '#ffe58a'; x.beginPath(); for (let i = 0; i < 8; i++) {const a = i * Math.PI / 4, r = i % 2 ? 9 : 30; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r);} x.fill();}
  else if (kind === 'dust') {const g = x.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(233,190,120,.9)'); g.addColorStop(1, 'rgba(233,190,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);}
  else if (kind === 'salt') {x.fillStyle = '#fff'; x.strokeStyle = '#9fb8d0'; x.lineWidth = 4; x.beginPath(); x.rect(16, 16, 32, 32); x.fill(); x.stroke();}
  return c;
}

var PAINTERS = {figZhou, figKong, figLu};
function painter(name) {const f = window[name] || PAINTERS[name]; if (!f) throw new Error('unknown painter ' + name); return f;}

// ============================== AI-composed scenes: a backdrop + paper-cut emoji props ==============================
function drawSpaceSky(c, w, h) {
  scallopTop(c, w, h); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1030'); g.addColorStop(1, '#2a2a6a'); c.fillStyle = g; c.fill(); c.save(); c.clip();
  for (let i = 0; i < 110; i++) {c.fillStyle = `rgba(255,255,255,${.3 + rnd() * .7})`; c.beginPath(); c.arc(rnd() * w, rnd() * h, 1 + rnd() * 3, 0, 7); c.fill();}
  c.fillStyle = '#7a8cff'; c.beginPath(); c.arc(790, 250, 90, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 10; c.beginPath(); c.ellipse(790, 250, 150, 34, -.3, 0, 7); c.stroke(); c.restore();
}
function drawForestSky(c, w, h) {
  scallopTop(c, w, h); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#bfe8c8'); g.addColorStop(1, '#eaf7dc'); c.fillStyle = g; c.fill(); c.save(); c.clip();
  for (let i = 0; i < 9; i++) {const x = 40 + i * 120 + rnd() * 30, s = .8 + rnd() * .6; c.fillStyle = '#7a5a3a'; c.fillRect(x - 12 * s, h - 330 * s, 24 * s, 330 * s); c.fillStyle = i % 2 ? '#4f9a62' : '#63b074'; c.beginPath(); c.arc(x, h - 360 * s, 110 * s, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(x - 30 * s, h - 400 * s, 50 * s, 0, 7); c.fill();}
  c.fillStyle = 'rgba(255,255,220,.35)'; for (let i = 0; i < 5; i++) {c.beginPath(); c.moveTo(200 + i * 160, 0); c.lineTo(260 + i * 160, 0); c.lineTo(160 + i * 160, h); c.lineTo(60 + i * 160, h); c.fill();} c.restore();
}
function drawRoom(c, w, h) {
  scallopTop(c, w, h, 120, 140); c.fillStyle = '#f4e3c4'; c.fill(); c.save(); c.clip();
  for (let x = 0; x < w; x += 90) {c.fillStyle = 'rgba(210,170,110,.18)'; c.fillRect(x, 0, 45, h);}
  c.fillStyle = '#bfe6ff'; c.fillRect(120, 200, 260, 250); c.strokeStyle = '#a8743f'; c.lineWidth = 16; c.strokeRect(120, 200, 260, 250); c.beginPath(); c.moveTo(250, 200); c.lineTo(250, 450); c.moveTo(120, 325); c.lineTo(380, 325); c.stroke();
  c.fillStyle = '#3f6a56'; c.fillRect(520, 190, 400, 240); c.strokeStyle = '#a8743f'; c.lineWidth = 16; c.strokeRect(520, 190, 400, 240); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(560, 250); c.lineTo(760, 250); c.moveTo(560, 300); c.lineTo(860, 300); c.moveTo(560, 350); c.lineTo(700, 350); c.stroke();
  c.fillStyle = '#c99a62'; c.fillRect(0, h - 110, w, 110); c.restore();
}
function drawGrassStrip(c, w, h) {
  c.fillStyle = '#6fbf73'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, 70); for (let x = 0; x <= w; x += 40) {c.lineTo(x + 12, 30 + (x % 80 ? 0 : 18)); c.lineTo(x + 24, 72); c.lineTo(x + 40, 60);} c.lineTo(w, h); c.fill();
  c.fillStyle = '#58a862'; c.fillRect(0, 110, w, h); for (let i = 0; i < 16; i++) {c.fillStyle = ['#ffd1e0', '#fff2a8', '#ffffff'][i % 3]; c.beginPath(); c.arc(30 + i * 64, 100 + (i % 3) * 14, 8, 0, 7); c.fill();}
}
function drawFloorStrip(c, w, h) {c.fillStyle = '#b98a5a'; c.fillRect(0, 40, w, h); c.fillStyle = '#d9b07a'; c.fillRect(0, 40, w, 22); c.strokeStyle = 'rgba(90,60,37,.4)'; c.lineWidth = 4; for (let x = 60; x < w; x += 150) {c.beginPath(); c.moveTo(x, 62); c.lineTo(x - 20, h); c.stroke();}}
function drawSnowStrip(c, w, h) {c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, 80); c.bezierCurveTo(200, 20, 400, 110, 600, 60); c.bezierCurveTo(780, 20, 900, 90, w, 50); c.lineTo(w, h); c.fill(); c.fillStyle = '#dcecf8'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, 130); c.bezierCurveTo(300, 90, 600, 160, w, 110); c.lineTo(w, h); c.fill();}
var SKIES = {day: 'drawDaySky', night: 'drawSky', sunset: 'drawDesertSky', sea: 'drawSeaBack', space: 'drawSpaceSky', forest: 'drawForestSky', indoor: 'drawRoom', palace: 'drawPalace'};
var GROUNDS = {grass: 'drawGrassStrip', sand: 'drawDunes', water: 'drawWaves', floor: 'drawFloorStrip', snow: 'drawSnowStrip'};
/** Painter that stands a row of emoji up as paper cut-outs. size: fraction of the layer height. */
function emojiPainter(list, size) {
  return (c, w, h) => {
    const n = Math.max(1, list.length), px = Math.min(h * size, w / n * .82); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `${px}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    list.forEach((e, i) => {const x = w * (i + .5) / n + (i % 2 ? 1 : -1) * w * .01, y = h - px * .58 - (i % 2 ? h * .04 : 0); c.fillText(e, x, y);});
  };
}
