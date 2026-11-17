// Teacher-uploaded material -> a multi-page pop-up storybook.
// Two analysers produce the same "spec" (plain JSON, saved in the browser):
//   Custom.fromAI    asks Claude to organise the material into pages: tidy text, key terms, a scene, narration, a question
//   Custom.fromRules works offline: sentence split, key-term candidates, keyword -> emoji scenes, cloze questions
// Custom.build(spec) turns a spec into a lesson the engine can play. Every page's scene is a backdrop + paper-cut emoji props.
var Custom = (function () {
'use strict';
const STOP = /[的了是在和與及也就都而但或這那其有為以於上下中後前很更最把被讓對從到會能可要不沒一個們你我他她它之者所並且則如因此時來去]/;
const sentences = t => t.replace(/[【】]/g, '').split(/(?<=[。！？!?；\n])/).map(x => x.trim()).filter(x => x.length > 1);
const EMO = [[/太陽|陽光|日照|熱能/, '☀️'], [/水|雨|河|溪/, '💧'], [/海|洋/, '🌊'], [/雲/, '☁️'], [/山/, '⛰️'], [/植物|葉|草/, '🌱'], [/樹|森林/, '🌳'], [/花/, '🌸'], [/動物|獸/, '🦌'], [/魚/, '🐟'], [/鳥/, '🐦'], [/昆蟲|蟲/, '🐛'], [/地球|世界|全球/, '🌍'], [/月/, '🌙'], [/星|宇宙|太空/, '⭐'], [/火|燃燒/, '🔥'], [/風|空氣|氣體|氧/, '🍃'], [/電|能源/, '⚡'], [/細胞|顯微|實驗/, '🔬'], [/船|舟/, '⛵'], [/城|都|宮/, '🏯'], [/王|帝|皇/, '👑'], [/軍|戰|兵/, '⚔️'], [/馬/, '🐎'], [/商|貿易|錢|經濟/, '💰'], [/路|交通/, '🛤️'], [/書|文|詩|讀/, '📖'], [/人|民|者/, '🧑'], [/家|屋|房/, '🏠'], [/農|田|稻|米/, '🌾'], [/食|糖|養分/, '🍎'], [/冰|雪|冷/, '❄️'], [/時間|年代|世紀/, '⏳']];
const emojisFor = (t, n) => {const out = []; for (const [re, e] of EMO) if (re.test(t) && !out.includes(e)) out.push(e); return out.slice(0, n);};
const skyOf = t => /夜|月|星/.test(t) ? 'night' : /太空|宇宙|行星/.test(t) ? 'space' : /海|洋/.test(t) ? 'sea' : /沙漠|西域|夕/.test(t) ? 'sunset' : /宮|朝廷|帝|王/.test(t) ? 'palace' : /森林|樹/.test(t) ? 'forest' : /教室|實驗|家/.test(t) ? 'indoor' : 'day';
const groundOf = t => /海|河|江|湖|水/.test(t) ? 'water' : /沙|漠/.test(t) ? 'sand' : /雪|冰/.test(t) ? 'snow' : /宮|室|屋/.test(t) ? 'floor' : 'grass';
const subjOf = t => /曰|之乎|矣|焉|吾|汝|詩|詞|作者/.test(t) ? '國文' : /朝|帝|條約|殖民|戰爭|革命|西元|世紀|貿易|文化/.test(t) ? '社會' : '自然';

function candidates(text) {
  const marked = [...text.matchAll(/【(.{1,8}?)】/g)].map(m => m[1]); if (marked.length >= 3) return [...new Set(marked)].slice(0, 10);
  const clean = text.replace(/[【】]/g, ''), count = {};
  for (const run of clean.split(/[^一-鿿]+/)) for (let n = 4; n >= 2; n--) for (let i = 0; i + n <= run.length; i++) {const w = run.slice(i, i + n); if (STOP.test(w)) continue; count[w] = (count[w] || 0) + 1;}
  let list = Object.entries(count).filter(([, c]) => c >= 2).sort((a, b) => b[1] * b[0].length - a[1] * a[0].length).map(x => x[0]);
  list = list.filter((w, i) => !list.slice(0, i).some(o => o.includes(w) || w.includes(o)));
  return [...new Set([...marked, ...list])].slice(0, 10);
}
function cloze(sent, term, pool) {
  const opts = [term, ...pool.filter(x => x !== term)].slice(0, 4), order = opts.map((o, i) => [o, (i * 7 + term.length * 3) % 4]).sort((a, b) => a[1] - b[1]).map(x => x[0]), stem = '課文填空：「' + sent.replace(term, '＿＿＿') + '」空格裡應該是？';
  return {stem, q: stem, opts: order, ans: order.indexOf(term), ok: '答對了！原句是：「' + sent + '」', hint: '回到這一頁的課文，找找這一句原本怎麼寫。', why: '原句是：「' + sent + '」'};
}
function fromRules(text, title) {
  const ss = sentences(text), terms = candidates(text), clean = text.replace(/[【】]/g, '');
  if (ss.length < 2) throw new Error('教材太短，至少需要兩句。');
  if (terms.length < 2) throw new Error('找不到重點詞。請用【】把 2 個以上的重點詞標起來，例如【光合作用】。');
  const nPages = Math.max(2, Math.min(5, Math.round(ss.length / 2))), per = Math.ceil(ss.length / nPages), pages = [], used = new Set();
  for (let i = 0; i < ss.length; i += per) {
    const txt = ss.slice(i, i + per).join(''), mine = terms.filter(w => txt.includes(w)), fresh = mine.find(w => !used.has(w)) || mine[0], em = emojisFor(txt, 5);
    if (fresh) used.add(fresh); const sent = fresh ? ss.slice(i, i + per).find(x => x.includes(fresh)) : '';
    pages.push({title: (mine[0] || '第 ' + (pages.length + 1) + ' 段').slice(0, 8), text: txt, terms: mine.slice(0, 4).map(w => ({w, d: '這個詞在課文裡是這樣用的：「' + (ss.find(x => x.includes(w)) || '') + '」'})), narration: [ss[i]],
      scene: {sky: skyOf(txt), ground: groundOf(txt), back: em.slice(3, 5), mid: em.slice(0, 3).length ? em.slice(0, 3) : ['📖', '✏️'], front: []}, q: fresh ? cloze(sent, fresh, terms) : null});
  }
  const withQ = pages.filter(p => p.q); if (!withQ.length) throw new Error('沒辦法自動出題。請用【】標出重點詞。');
  for (const p of pages) if (!p.q) p.q = withQ[0].q;
  const t = title || ss[0].slice(0, 8), ex = terms.map(w => ({w, s: ss.find(x => x.includes(w))})).filter(x => x.s).slice(-3).map(x => Object.assign(cloze(x.s, x.w, terms), {tag: '填空'}));
  return {by: 'rule', title: t, subject: subjOf(clean), text: clean, goals: ['讀完能說出這一課的重點詞：' + terms.slice(0, 3).join('、'), '能用自己的話說出課文的大意'], intro: ['今天要讀的是，' + t + '。', '這本書一共有 ' + pages.length + ' 頁。每讀完一頁，回答一個問題，就能翻到下一頁。'],
    hook: '讀之前先猜猜看：這一課最想告訴你的是什麼？', predict: {q: '看到課名，你猜這一課在講什麼？', opts: [], hit: terms.slice(0, 4).join('|')}, pages, exam: ex, open: '用自己的話，寫下這一課最重要的一件事。', model: '可以從這句出發：「' + ss[0] + '」再補上你覺得最重要的重點詞。',
    reveal: {title: '你讀完了〈' + t + '〉', body: '回想一下，你一開始的猜測和課文一樣嗎？', summary: pages.map(p => p.text.split(/[，。；]/)[0])}};
}
const SCHEMA = `JSON 欄位：
{"title": 課名(10字內), "subject": "國文"|"自然"|"社會",
 "goals": [2~3 條學習目標，每條 28 字內],
 "intro": [2~3 句開場旁白，像故事預告，引起好奇，不說出答案，每句 36 字內],
 "hook": 留下懸念的問題(40字內),
 "predict": {"q": 請學生猜測的問題, "opts": [3 個選項，第 1 個最接近正解], "hit": 判斷猜中的關鍵詞(1~3 個，用 | 分隔)},
 "pages": [PAGES 頁，每頁 {"title": 這一頁的小標(8字內), "text": 課文(60~130字), "plain": 白話翻譯(只有古文才需要，否則空字串), "terms": [1~3 個 {"w": 重點詞, "d": 40字內的白話解釋}],
   "narration": [1~2 句說故事的旁白，把這一頁的內容演出來，每句 36 字內],
   "art": {"name": 這一頁插圖的名稱(8字內), "desc": 給插畫家的說明：要畫什麼、主要形狀與相對位置、要標示哪 2~5 個名稱（名稱必須出現在這一頁的課文裡）, 70字內},
   "scene": {"sky": "day"|"night"|"sunset"|"sea"|"space"|"forest"|"indoor"|"palace", "ground": "grass"|"sand"|"water"|"floor"|"snow", "back": [1~2 個當遠景的 emoji], "mid": [2~3 個代表這一頁的 emoji（插圖畫不出來時的備用）], "front": [0~2 個當前景小物的 emoji]},
   "q": {"stem": 這一頁的理解題, "opts": [4 個選項], "ans": 正解索引(0~3，請讓各題的正解位置不要都一樣), "ok": 答對的回饋(說明為什麼), "hint": 答錯的提示(引導回課文，不直接給答案)}}],
 "exam": [3 題 {"tag": "字詞"|"因果"|"遷移", "q": 題目, "opts": [4 個選項], "ans": 索引, "why": 解析}]，第 3 題必須是生活情境的遷移題,
 "open": 一題開放式的啟發題, "model": 參考答案(70字內),
 "reveal": {"title": 揭曉標題(14字內), "body": 回答 hook 的說明(90字內), "summary": [3 條這一課的重點整理，每條 30 字內]}}`;
const HEAD = `只輸出一個 JSON 物件，不要任何其他文字、不要 markdown 符號。全部使用臺灣的繁體中文與臺灣課本的用語，語氣適合國中學生。

設計原則（依學習科學）：
- 先用故事和懸念引起好奇，再讀課文；每一頁只講一個重點；每頁結尾用一個問題讓學生回想；最後用生活情境檢查能不能活用。
- 提問的錯誤選項要用學生常見的迷思概念，不要用一看就錯的選項。
- 重點詞 terms 的 w 必須逐字出現在同一頁的 text 裡。`;
const PROMPT = (title, text, hasImage) => `你是台灣國中小的教材設計師，要把老師上傳的教材，改編成一本「立體故事書互動課程」。${HEAD}
- 「text」是你整理過的課文：忠於教材內容，不可加入教材沒有的事實；刪掉贅字、把句子整理清楚。古文請保留原文句子，並在 plain 欄位附白話翻譯。

${SCHEMA.replace('PAGES', '3~5')}

${title ? '老師給的課名：' + title + '\n' : ''}${hasImage ? '教材在附上的圖片裡，請先讀出圖片中的課文內容再設計。' : ''}${text ? '教材原文：\n"""\n' + text + '\n"""' : ''}`;
const TOPIC_PROMPT = (q, brief, extra) => `你是台灣國中的教材設計師。老師沒有現成的教材，只給了一個主題，請你「自編」一課教材，做成一本「立體故事書互動課程」。${HEAD}
- 「text」是你自己寫的課文：內容必須正確，並且只寫下面「課綱查詢結果」列出的範圍，不可超出這個年級的程度，也不要寫成條列，要寫成學生讀得懂的短文，可以用生活中的例子或比喻開頭。
- 不可照抄任何出版社課本的句子；用你自己的話寫。
- 如果查詢結果涵蓋很多單元，請挑最核心的 4 個重點，各寫一頁，由整體到局部安排順序。

${SCHEMA.replace('PAGES', '4')}

老師的需求：${q.grade ? Curri.GNAME[q.grade] + '，' : ''}${q.subject}科，自編教材。主題：「${q.topic}」
查詢到的排課情形：${q.finding}
課綱查詢結果（教材範圍以此為準）：
${brief}${extra ? '\n老師的補充說明：' + extra : ''}`;
const S = x => String(x == null ? '' : x), arr = (x, n) => (Array.isArray(x) ? x : []).slice(0, n), okQ = q => q && Array.isArray(q.opts) && q.opts.length >= 2 && q.ans >= 0 && q.ans < q.opts.length;
function normalise(raw, fb) {
  const a = raw.indexOf('{'), b = raw.lastIndexOf('}'); if (a < 0 || b < 0) throw new Error('AI 沒有回傳可用的結果');
  const j = JSON.parse(raw.slice(a, b + 1));
  const pages = arr(j.pages, 6).filter(p => p && p.text && okQ(p.q)).map(p => ({title: S(p.title).slice(0, 10), text: S(p.text), plain: S(p.plain), terms: arr(p.terms, 4).filter(t => t && t.w && S(p.text).includes(t.w)).map(t => ({w: S(t.w), d: S(t.d)})), narration: arr(p.narration, 2).map(S).filter(Boolean),
    art: p.art && p.art.desc ? {name: S(p.art.name || p.title).slice(0, 10), desc: S(p.art.desc).slice(0, 160), svg: ''} : null,
    scene: {sky: SKIES[(p.scene || {}).sky] ? p.scene.sky : 'day', ground: GROUNDS[(p.scene || {}).ground] ? p.scene.ground : 'grass', back: arr((p.scene || {}).back, 2).map(S), mid: arr((p.scene || {}).mid, 3).map(S), front: arr((p.scene || {}).front, 2).map(S)},
    q: {stem: S(p.q.stem), opts: p.q.opts.map(S), ans: p.q.ans, ok: S(p.q.ok || '答對了！'), hint: S(p.q.hint || '回到這一頁的課文再找找線索。')}}));
  const exam = arr(j.exam, 4).filter(okQ).map(q => ({tag: S(q.tag || '理解'), q: S(q.q), opts: q.opts.map(S), ans: q.ans, why: S(q.why)}));
  if (pages.length < 2 || !exam.length) throw new Error('AI 的結果不完整');
  for (const p of pages) {if (!p.scene.mid.length) p.scene.mid = ['📖']; if (!p.narration.length) p.narration = [p.text.split(/[。！？]/)[0] + '。'];}
  return {by: 'ai', title: S(j.title || fb.title || '新的一課').slice(0, 12), subject: ['國文', '自然', '社會'].includes(j.subject) ? j.subject : fb.subject, text: fb.text || pages.map(p => p.text).join('\n'), goals: arr(j.goals, 3).map(S), intro: arr(j.intro, 3).map(S).filter(Boolean), hook: S(j.hook || '這一課想告訴我們什麼？'),
    predict: {q: S((j.predict || {}).q || '你猜答案是什麼？'), opts: arr((j.predict || {}).opts, 3).map(S), hit: S((j.predict || {}).hit || '')}, pages, exam, open: S(j.open || '這一課給你什麼啟發？'), model: S(j.model),
    reveal: {title: S((j.reveal || {}).title || '答案揭曉'), body: S((j.reveal || {}).body), summary: arr((j.reveal || {}).summary, 4).map(S)}};
}
const progress = cb => ({text: t}) => {if (cb && t) cb((t.match(/"narration"/g) || []).length);};
async function fromAI(sample, text, title, images, onProgress) {
  const clean = (text || '').replace(/[【】]/g, '').slice(0, 3000), opts = {modelTier: 'default', cache: false, onText: progress(onProgress)};
  if (images && images.length) opts.images = images;
  const res = await sample(PROMPT(title, clean, !!(images && images.length)), opts), spec = normalise(res.text || '', {title, subject: subjOf(clean), text: clean});
  spec.origin = 'material'; return spec;
}
/** Topic only: the curriculum lookup result (Curri.lookup) sets the scope, the AI writes the lesson itself. */
async function fromTopic(sample, found, extra, onProgress) {
  const res = await sample(TOPIC_PROMPT(found, Curri.brief(found), extra), {modelTier: 'default', cache: false, onText: progress(onProgress)}), spec = normalise(res.text || '', {title: found.topic.slice(0, 12), subject: found.subject, text: ''});
  spec.origin = 'topic'; spec.subject = found.subject; spec.curri = curriOf(found); return spec;
}
const curriOf = f => ({topic: f.topic, grade: f.grade, finding: f.finding, units: f.hits.map(e => ({grade: e.grade, unit: e.unit, codes: e.codes.map(c => c.split(' ')[0])}))});

// ---- illustrations: the AI draws one labelled paper-cut SVG per page; we clean it, rasterise it, and stand it up as the main layer
const ART = {}, hash = str => {let h = 5381; for (let i = 0; i < str.length; i++) h = (h * 33 ^ str.charCodeAt(i)) >>> 0; return h.toString(36);};
const ART_PROMPT = (spec, p) => `你是教科書插畫家。請為臺灣國中的課程畫一張「剪紙繪本風格」的教學插圖，輸出一段 SVG 程式碼。
課名：${spec.title}　這一頁：${p.title}
要畫的內容：${p.art.desc}
這一頁的課文（插圖必須和課文一致，構造的形狀與相對位置要正確，不可畫出課文沒提到的構造）：${p.text}

規格：
- 只輸出 <svg>…</svg>，不要任何說明文字。根元素寫 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300">。
- 背景透明：不要畫滿版的底色或外框。
- 扁平色塊、圓潤的造型；每個形狀加深色描邊（stroke="#3b2f2a" stroke-width="3" stroke-linejoin="round"）；全圖 4~7 個顏色，溫暖的繪本配色。
- 主體要大、放在畫面中央，一眼就看得出是什麼。
- 用 2~5 個繁體中文標示構造名稱：<text font-size="21" font-weight="700" font-family="sans-serif" fill="#3b2f2a">名稱</text>，並用一條細線（stroke-width="2"）從文字指到構造。標示放在主體外側的空白處，彼此不可重疊；每個中文字約佔 21 單位寬，整段文字不可超出 0~480、0~300 的範圍。
- 只能使用 g、path、circle、ellipse、rect、line、polyline、polygon、text 這些元素；不可使用 script、image、foreignObject、filter、style、連結。
- 總長度 6000 字元以內。`;
function cleanSvg(raw) {
  const a = raw.indexOf('<svg'), b = raw.lastIndexOf('</svg>'); if (a < 0 || b < 0) return '';
  const doc = new DOMParser().parseFromString(raw.slice(a, b + 6), 'image/svg+xml'), root = doc.documentElement; if (!root || root.nodeName !== 'svg' || doc.querySelector('parsererror')) return '';
  const OK = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'lineargradient', 'radialgradient', 'stop', 'title']);
  [...root.querySelectorAll('*')].forEach(el => {if (!OK.has(el.nodeName.toLowerCase())) {el.remove(); return;} [...el.attributes].forEach(at => {const n = at.name.toLowerCase(), v = at.value; if (n.startsWith('on') || n === 'style' || (/href$/.test(n) && !v.startsWith('#')) || /url\(\s*['"]?(?!#)/i.test(v) || /javascript:/i.test(v)) el.removeAttribute(at.name);});});
  [...root.attributes].forEach(at => {if (at.name.toLowerCase().startsWith('on') || at.name === 'style') root.removeAttribute(at.name);});
  if (!root.getAttribute('viewBox')) root.setAttribute('viewBox', '0 0 480 300'); root.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); root.setAttribute('width', '960'); root.setAttribute('height', '600');
  const out = new XMLSerializer().serializeToString(root); return out.length > 14000 || !root.querySelector('path,circle,ellipse,rect,polygon,polyline') ? '' : out;
}
const svgUrl = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
/** Rasterise one SVG into a canvas the paper-cut painter can use. Resolves false if the browser will not let us read it back. */
function raster(svg) {
  const key = hash(svg); if (ART[key]) return Promise.resolve(true);
  return new Promise(res => {const im = new Image(); im.onload = () => {try {const c = document.createElement('canvas'); c.width = 960; c.height = 600; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 960, 600); x.getImageData(0, 0, 1, 1); ART[key] = c; res(true);} catch (e) {res(false);}}; im.onerror = () => res(false); im.src = svgUrl(svg);});
}
/** Make sure every illustration of a spec is rasterised (call before the lesson is built or opened). */
function prepare(spec) {return Promise.all((spec.pages || []).filter(p => p.art && p.art.svg).map(p => raster(p.art.svg).then(() => {const pt = pointOf(p.art.svg); return pt && raster(pt.masked);}))).then(() => {if (api.onArt) api.onArt(spec); return spec;});}
/** Ask the AI for one illustration per page. Pages run side by side; a page whose drawing fails keeps its emoji scene. */
async function drawArt(sample, spec, onProgress) {
  let done = 0; const todo = spec.pages.filter(p => p.art && p.art.desc && !p.art.svg);
  await Promise.all(todo.map(async p => {
    try {const r = await sample(ART_PROMPT(spec, p), {modelTier: 'default', cache: false}), svg = cleanSvg(r.text || ''); if (svg && await raster(svg)) p.art.svg = svg;} catch (e) {if (e && (e.code === 'not_granted' || e.code === 'rate_limited')) p.art.err = e.code;}
    if (onProgress) onProgress(++done, todo.length);
  }));
  return spec.pages.filter(p => p.art && p.art.svg).length;
}
// "Find it on the picture": every short label of an illustration becomes a lettered marker; the student has to find the named structure.
const POINT = {};
function pointOf(svg) {
  const key = hash(svg); if (key in POINT) return POINT[key];
  let out = null;
  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml'), NS = 'http://www.w3.org/2000/svg', labels = [];
    for (const t of [...doc.querySelectorAll('text')]) {
      const name = (t.textContent || '').trim(), x = parseFloat(t.getAttribute('x')), y = parseFloat(t.getAttribute('y')); if (!name || name.length > 6 || isNaN(x) || isNaN(y) || labels.length >= 6 || labels.some(l => l.name === name)) continue;
      let par = t.parentNode, moved = false; while (par && par.nodeName !== 'svg') {if (par.getAttribute && par.getAttribute('transform')) moved = true; par = par.parentNode;} if (moved || t.getAttribute('transform')) continue;
      const fs = parseFloat(t.getAttribute('font-size')) || 18, w = name.length * fs, an = t.getAttribute('text-anchor'), cx = an === 'middle' ? x : an === 'end' ? x - w / 2 : x + w / 2, cy = y - fs * .36, g = doc.createElementNS(NS, 'g'), c = doc.createElementNS(NS, 'circle'), tx = doc.createElementNS(NS, 'text');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', 15); c.setAttribute('fill', '#fff3c9'); c.setAttribute('stroke', '#3b2f2a'); c.setAttribute('stroke-width', 3);
      tx.setAttribute('x', cx); tx.setAttribute('y', cy + 6.5); tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('font-size', 18); tx.setAttribute('font-weight', 700); tx.setAttribute('font-family', 'sans-serif'); tx.setAttribute('fill', '#3b2f2a'); tx.textContent = 'ABCDEF'[labels.length];
      g.appendChild(c); g.appendChild(tx); t.parentNode.replaceChild(g, t); labels.push({name, cx, cy});
    }
    if (labels.length >= 3) out = {labels, masked: new XMLSerializer().serializeToString(doc.documentElement)};
  } catch (e) {}
  return POINT[key] = out;
}
const artPainter = (svg, emoji) => (c, w, h) => {const im = ART[hash(svg)]; if (!im) return emojiPainter(emoji, .9)(c, w, h); const k = Math.min((w - 40) / im.width, (h - 30) / im.height); c.drawImage(im, (w - im.width * k) / 2, h - im.height * k - 8, im.width * k, im.height * k);};
const TH = {'國文': 'boat', '自然': 'water', '社會': 'silk'};
function build(spec) {
  if (!spec.pages || !spec.pages.length) throw new Error('old spec');
  const base = LESSONS.find(l => l.id === (TH[spec.subject] || 'water')), gloss = {}, fx = {};
  const pages = spec.pages.map((p, pi) => {
    const sc = p.scene, defs = [{id: 'sky', name: '背景', paint: SKIES[sc.sky] || 'drawDaySky', z: -.95, w: 1.56, h: 1.1, key: sc.sky}];
    const hasArt = p.art && p.art.svg;
    if (!hasArt && sc.back && sc.back.length) defs.push({id: 'back', name: '遠景 ' + sc.back.join(''), draw: emojiPainter(sc.back, .8), z: -.5, w: 1.4, h: .62, key: 'b' + sc.back.join('')});
    if (hasArt) defs.push({id: 'mid', name: '插圖 ' + p.art.name, draw: artPainter(p.art.svg, sc.mid), z: .02, w: 1.5, h: .94, key: 'art' + hash(p.art.svg), art: true});
    else defs.push({id: 'mid', name: '主角 ' + sc.mid.join(''), draw: emojiPainter(sc.mid, .9), z: .0, w: 1.3, h: .46, key: 'm' + sc.mid.join('')});
    if (sc.front && sc.front.length) defs.push({id: 'front', name: '前景 ' + sc.front.join(''), draw: emojiPainter(sc.front, .9), z: .34, w: 1.1, h: .26, key: 'f' + sc.front.join('')});
    defs.push({id: 'ground', name: '地面', paint: GROUNDS[sc.ground] || 'drawGrassStrip', z: .6, w: 1.62, h: .24, key: sc.ground});
    defs.forEach(d => {d.cacheKey = 'c:' + d.id + ':' + d.key + ':' + d.w + 'x' + d.h; d.prompt = d.art ? p.art.desc : 'paper-cut illustration for: ' + p.title;});
    const segs = [], text = p.text, marks = p.terms.map((t, i) => ({i, w: t.w, at: text.indexOf(t.w)})).filter(m => m.at >= 0).sort((a, b) => a.at - b.at), glowIds = defs.filter(d => d.draw).map(d => d.id); let pos = 0;
    for (const m of marks) {if (m.at < pos) continue; if (m.at > pos) segs.push(['t', text.slice(pos, m.at)]); const k = 'p' + pi + 'k' + m.i; segs.push(['hs', m.w, k]); pos = m.at + m.w.length;
      gloss[k] = [m.w, p.terms[m.i].d, '紙雕亮起來']; const id = glowIds[m.i % Math.max(1, glowIds.length)] || 'sky'; fx[k] = c => {if (c.L[id]) {c.L[id].glow = 1.4; c.L[id].shake = .3;} c.emit('spark', {n: 14, box: [.2, 1.4, .15, .7, -.3, .5], v: [0, .1, 0], life: 1.6, size: .06, stagger: 1});};}
    if (pos < text.length) segs.push(['t', text.slice(pos)]);
    const last = pi === spec.pages.length - 1, run = c => {Object.values(c.L).forEach((o, i) => c.after(i * .2, () => {o.glow = 1.2;})); c.emit('spark', {n: 36, box: [.1, 1.5, .1, .8, -.4, .5], v: [0, .12, 0], life: 2, size: .07, stagger: 2}); if (last) c.after(1, () => c.banner('讀完了！'));};
    const pt = hasArt ? pointOf(p.art.svg) : null; let point = null;
    if (pt) {let ans = pt.labels.findIndex(l => (p.terms || []).some(t => t.w === l.name)); if (ans < 0) ans = pt.labels.findIndex(l => p.text.includes(l.name)); if (ans < 0) ans = parseInt(hash(p.text), 36) % pt.labels.length; point = {labels: pt.labels, masked: pt.masked, ans, emoji: sc.mid};}
    return {title: p.title, point, art: hasArt ? {name: p.art.name, svg: p.art.svg} : null, layers: defs, text: segs, plain: p.plain || '', narration: p.narration, keyTerms: p.terms.map(t => t.w.slice(0, 6)), emojis: [...(sc.back || []), ...sc.mid, ...(sc.front || [])].join(' '),
      q: {tag: `第 ${pi + 1} 頁 · 讀完想一想`, stem: p.q.stem, opts: p.q.opts, ans: p.q.ans, ok: p.q.ok, hints: p.q.opts.map(() => p.q.hint), run, wait: 3}};
  });
  return {id: spec.id, custom: true, paged: true, by: spec.by, subject: spec.subject, subjectEn: 'TEACHER', lessonNo: spec.origin === 'topic' ? 'AI 自編' : '老師自編', curri: spec.curri || null, title: spec.title, pageName: '第 1 頁', cover: base.cover, accent: base.accent, stage: base.stage, island: base.island,
    source: spec.origin === 'topic' ? '老師只給主題，教材由 AI 對照 108 課綱的範圍自編' + (spec.curri && spec.curri.units.length ? '（' + spec.curri.units.slice(0, 4).map(u => u.grade + ' ' + u.unit).join('、') + '）' : '') + '，插圖由 AI 繪製，發布前經老師確認。' : spec.by === 'ai' ? '課文、提問與解釋由 AI 依老師上傳的教材整理，發布前經老師確認。' : '課文是老師上傳的原文；提問由規則自動產生（課文填空）。', material: spec.text, outline: pages.map(p => p.title), music: base.music, who: {'旁白': '#8a7d6a'},
    layers: pages[0].layers, pages, teaser: {scenes: {read: []}, beats: spec.intro.map((t, i) => ({scene: 'read', who: '旁白', text: t, cam: i % 2 ? 'push' : 'stage'})), hook: spec.hook},
    keyTerms: pages[0].keyTerms, text: pages[0].text, gloss, fx, goals: spec.goals,
    init(c) {}, tick(c, t) {const m = c.L.mid, f = c.L.front, b = c.L.back, g = c.L.ground; if (m) {m.holder.position.y = Math.abs(Math.sin(t * 1.8)) * .014; m.mesh.rotation.z = Math.sin(t * 1.2) * .02;} if (f) f.mesh.rotation.z = Math.sin(t * 1.6 + 1) * .03; if (b) b.holder.position.x = Math.sin(t * .4) * .015; if (g) g.holder.position.x = Math.sin(t * .9) * .02;},
    predict: {q: spec.predict.q, opts: spec.predict.opts, hit: spec.predict.hit || pages[0].keyTerms[0] || spec.title, hitMsg: '✓ 你的猜測和課文的方向一致！', missMsg: '和你想的不太一樣？比較一下你的猜測和課文的說法。'},
    quiz: pages.map(p => p.q), reveal: {title: spec.reveal.title, body: spec.reveal.body, quote: '', summary: spec.reveal.summary || []}, exam: spec.exam.map(q => ({tag: q.tag, q: q.q || q.stem, opts: q.opts, ans: q.ans, why: q.why})), open: spec.open, model: spec.model};
}
const api = {artPainter, fromRules, fromAI, fromTopic, drawArt, prepare, build, sentences, svgUrl, curriOf, cleanSvg, onArt: null};
return api;
})();
