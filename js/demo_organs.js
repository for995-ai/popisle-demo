// A finished example of the "只給主題" flow (topic: 人體的器官認識), so the demo also works without an AI connection.
// It has the same shape as what Custom.fromTopic + Custom.drawArt return: lesson text written from the curriculum scope,
// and one labelled paper-cut SVG per page.
var DEMO_ORGANS = (function () {
const O = 'stroke="#3b2f2a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"', T = 'font-size="21" font-weight="700" font-family="sans-serif" fill="#3b2f2a"', LN = 'stroke="#3b2f2a" stroke-width="2"';
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="960" height="600">${body}</svg>`;
const heart = (cx, cy, k, fill) => `<path d="M${cx} ${cy + 30 * k} C${cx - 48 * k} ${cy} ${cx - 30 * k} ${cy - 36 * k} ${cx} ${cy - 12 * k} C${cx + 30 * k} ${cy - 36 * k} ${cx + 48 * k} ${cy} ${cx} ${cy + 30 * k}Z" fill="${fill}" ${O}/>`;
const cell = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd9a8" ${O}/><circle cx="${x + r * .15}" cy="${y - r * .1}" r="${r * .32}" fill="#e07a5f"/>`;
const arrow = x => `<path d="M${x - 9} 130 h14 m-6 -7 l7 7 l-7 7" fill="none" ${O}/>`;
const A1 = svg(`
<g>${cell(52, 130, 30)}</g>
<g>${cell(128, 116, 14)}${cell(156, 116, 14)}${cell(142, 140, 14)}${cell(170, 140, 14)}${cell(128, 164, 14)}${cell(156, 164, 14)}</g>
${heart(246, 132, 1.15, '#e5604e')}
<g><path d="M338 98 C300 110 300 170 338 176" fill="none" stroke="#3b2f2a" stroke-width="11" stroke-linecap="round"/><path d="M338 98 C300 110 300 170 338 176" fill="none" stroke="#7fa8d9" stroke-width="6" stroke-linecap="round"/><path d="M338 98 C376 110 376 170 338 176" fill="none" stroke="#3b2f2a" stroke-width="11" stroke-linecap="round"/><path d="M338 98 C376 110 376 170 338 176" fill="none" stroke="#e5604e" stroke-width="6" stroke-linecap="round"/>${heart(338, 136, .6, '#e5604e')}</g>
<g><circle cx="432" cy="88" r="17" fill="#ffd9a8" ${O}/><rect x="410" y="110" width="44" height="52" rx="10" fill="#7fb8a4" ${O}/><rect x="414" y="158" width="15" height="38" rx="6" fill="#5b7fa6" ${O}/><rect x="435" y="158" width="15" height="38" rx="6" fill="#5b7fa6" ${O}/></g>
${arrow(98)}${arrow(202)}${arrow(292)}${arrow(388)}
<text x="52" y="226" text-anchor="middle" ${T}>細胞</text><text x="149" y="226" text-anchor="middle" ${T}>組織</text><text x="246" y="226" text-anchor="middle" ${T}>器官</text><text x="338" y="226" text-anchor="middle" ${T}>器官系統</text><text x="432" y="226" text-anchor="middle" ${T}>個體</text>
<path d="M30 250 H450" stroke="#c9744a" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10"/>
<text x="240" y="280" text-anchor="middle" ${T}>由小到大　一層一層組成</text>`);
const tube = (d, col, w) => `<path d="${d}" fill="none" stroke="#3b2f2a" stroke-width="${w + 6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const A2 = svg(`
${tube('M240 18 V92', '#f4a6a0', 12)}
<path d="M150 92 C185 76 226 84 238 102 C234 132 200 142 160 134 C140 126 138 102 150 92Z" fill="#a8563f" ${O}/>
<path d="M246 88 C292 78 316 110 300 142 C288 166 250 162 240 142 C234 124 238 100 246 88Z" fill="#f08a7a" ${O}/>
${tube('M184 268 V178 H296 V268', '#e2b07a', 20)}
${tube('M244 160 C204 186 284 188 216 206 C284 210 204 228 262 236 C230 244 238 256 240 266', '#f7c3ad', 11)}
<line x1="300" y1="44" x2="250" y2="50" ${LN}/><text x="304" y="50" ${T}>食道</text>
<line x1="112" y1="104" x2="152" y2="110" ${LN}/><text x="62" y="112" ${T}>肝臟</text>
<line x1="340" y1="116" x2="304" y2="120" ${LN}/><text x="344" y="122" ${T}>胃</text>
<line x1="112" y1="214" x2="216" y2="210" ${LN}/><text x="62" y="222" ${T}>小腸</text>
<line x1="344" y1="214" x2="308" y2="216" ${LN}/><text x="348" y="220" ${T}>大腸</text>`);
const A3 = svg(`
${tube('M388 192 C356 276 120 286 98 204 C90 160 118 118 152 112', '#7fa8d9', 11)}
${tube('M206 108 C232 36 352 36 388 110', '#e5604e', 11)}
<g fill="none" stroke="#a66fa0" stroke-width="4" stroke-linecap="round"><path d="M388 110 C360 135 360 165 388 192"/><path d="M388 110 C388 140 388 160 388 192"/><path d="M388 110 C416 135 416 165 388 192"/><path d="M366 150 H410"/></g>
<path d="M180 222 C96 168 112 82 180 116Z" fill="#7fa8d9" ${O}/><path d="M180 222 C264 168 248 82 180 116Z" fill="#e5604e" ${O}/>
<path d="M124 150 H236" fill="none" ${O}/>
<line x1="70" y1="126" x2="150" y2="134" ${LN}/><text x="18" y="134" ${T}>心房</text>
<line x1="70" y1="182" x2="156" y2="178" ${LN}/><text x="18" y="190" ${T}>心室</text>
<line x1="300" y1="30" x2="294" y2="50" ${LN}/><text x="304" y="26" ${T}>動脈</text>
<line x1="424" y1="206" x2="402" y2="184" ${LN}/><text x="408" y="228" ${T}>微血管</text>
<line x1="300" y1="290" x2="290" y2="268" ${LN}/><text x="306" y="294" ${T}>靜脈</text>`);
const A4 = svg(`
<path d="M225 96 C170 84 130 140 136 216 C142 242 215 236 225 214Z" fill="#f6a8b4" ${O}/><path d="M255 96 C310 84 350 140 344 216 C338 242 265 236 255 214Z" fill="#f6a8b4" ${O}/>
${tube('M240 16 V92', '#cfe3f2', 14)}<g stroke="#3b2f2a" stroke-width="2"><path d="M231 34 h18 M231 52 h18 M231 70 h18"/></g>
${tube('M240 92 L196 130', '#cfe3f2', 8)}${tube('M240 92 L284 130', '#cfe3f2', 8)}
${tube('M112 262 Q240 222 368 262', '#c9744a', 8)}
<line x1="338" y1="140" x2="392" y2="110" ${LN} stroke-dasharray="4 4"/>
<circle cx="424" cy="88" r="42" fill="#fff8ec" ${O}/><circle cx="412" cy="80" r="14" fill="#f6a8b4" ${O}/><circle cx="436" cy="82" r="13" fill="#f6a8b4" ${O}/><circle cx="424" cy="102" r="13" fill="#f6a8b4" ${O}/><path d="M392 108 C410 126 440 126 456 106" fill="none" stroke="#e5604e" stroke-width="5" stroke-linecap="round"/>
<line x1="178" y1="40" x2="230" y2="46" ${LN}/><text x="128" y="48" ${T}>氣管</text>
<line x1="88" y1="104" x2="200" y2="124" ${LN}/><text x="18" y="110" ${T}>支氣管</text>
<line x1="84" y1="188" x2="140" y2="186" ${LN}/><text x="56" y="196" ${T}>肺</text>
<line x1="84" y1="270" x2="124" y2="258" ${LN}/><text x="36" y="282" ${T}>橫膈</text>
<text x="424" y="152" text-anchor="middle" ${T}>肺泡</text>`);
const sc = (back, mid, front) => ({sky: 'indoor', ground: 'floor', back, mid, front});
return {
  by: 'ai', origin: 'topic', title: '人體的器官', subject: '自然', text: '',
  goals: ['能依序說出動物體的組成層次，並舉出例子', '能說出消化、循環、呼吸系統的主要器官和功能', '能用器官系統解釋生活中的身體現象'],
  intro: ['你的身體裡，住著三十幾兆個小小的細胞。', '它們各有工作，卻能一起讓你跑步、吃飯、呼吸。', '這麼多細胞，是怎麼分工合作的？翻開這本書看看。'],
  hook: '一顆心臟，是由一種細胞組成的嗎？它為什麼不能自己完成運送血液的工作？',
  predict: {q: '你覺得心臟算是下面哪一個層次？', opts: ['器官：由好幾種組織組成', '組織：由一種細胞組成', '器官系統：自己就能完成運輸'], hit: '器官'},
  pages: [
    {title: '身體的層次', text: '身體像一所學校。細胞是學生，形態和功能相似的細胞聚在一起，組成組織，像一個班級。幾種不同的組織合作，形成器官，例如心臟、胃。功能相關的器官再組成器官系統，共同完成一件大事。許多器官系統合起來，就是一個完整的個體。', plain: '',
      terms: [{w: '組織', d: '形態、功能相似的細胞聚集在一起，例如肌肉組織。'}, {w: '器官', d: '由幾種不同的組織組成，有特定的功能，例如心臟、胃、肺。'}, {w: '器官系統', d: '幾個功能相關的器官一起工作，例如消化系統。植物沒有這一層。'}],
      narration: ['一個細胞做不了大事，可是很多細胞排好隊，就不一樣了。', '細胞、組織、器官、器官系統，最後才是你。'],
      art: {name: '組成層次', desc: '由左到右排列：細胞、組織、器官（心臟）、器官系統、個體，中間用箭頭相連，下方標示名稱。', svg: A1}, scene: sc(['🏫'], ['🧍', '🫀'], ['🔬']),
      q: {stem: '依照由小到大的順序，動物體的組成層次是？', opts: ['細胞→器官→組織→器官系統→個體', '細胞→組織→器官→器官系統→個體', '組織→細胞→器官→個體→器官系統', '細胞→組織→器官系統→器官→個體'], ans: 1, ok: '答對了！細胞組成組織，組織組成器官，器官組成器官系統，最後才是個體。', hint: '回到課文的比喻：學生、班級……誰包含誰？器官和組織哪一個比較大？'}},
    {title: '消化系統', text: '食物從口進入，經過食道、胃、小腸、大腸，這條長長的通道叫做消化管。小腸是消化和吸收養分的主要場所，大腸則吸收剩下的水分。肝臟和胰臟屬於消化腺，食物不會經過它們；肝臟分泌的膽汁會送進小腸，幫忙處理脂質。', plain: '',
      terms: [{w: '消化管', d: '食物實際走過的通道：口、咽、食道、胃、小腸、大腸、肛門。'}, {w: '小腸', d: '人體最長的消化管，大部分的養分在這裡消化完成並被吸收。'}, {w: '消化腺', d: '分泌消化液的器官，例如唾腺、肝臟、胰臟。食物不會經過肝臟和胰臟。'}],
      narration: ['一口飯吞下去，要走一趟好幾公尺長的旅程。', '走到小腸，養分才真正進到身體裡。'],
      art: {name: '消化系統', desc: '人體消化系統正面圖：食道、胃、肝臟、小腸、大腸，各自標示名稱。', svg: A2}, scene: sc(['🍚'], ['🍙', '🥛'], ['🥢']),
      q: {stem: '吃下去的飯，「不會」經過下面哪一個器官？', opts: ['胃', '小腸', '肝臟', '大腸'], ans: 2, ok: '沒錯！肝臟是消化腺，只負責分泌膽汁，食物不會經過它。', hint: '課文把器官分成兩類：食物走過的「消化管」，和分泌消化液的「消化腺」。找找看誰屬於後者。'}},
    {title: '循環系統', text: '養分和氧氣要送到全身，靠的是循環系統，它由心臟、血管和血液組成。心臟像幫浦，不停收縮，把血液推出去。動脈把血液帶離心臟，靜脈把血液帶回心臟。兩者之間是微血管，管壁只有一層細胞，血液和細胞就在這裡交換物質。', plain: '',
      terms: [{w: '動脈', d: '把血液帶離心臟的血管，管壁厚、有彈性，摸得到脈搏。'}, {w: '靜脈', d: '把血液帶回心臟的血管。'}, {w: '微血管', d: '連接小動脈和小靜脈，管壁只有一層細胞，是物質交換的地方。'}],
      narration: ['咚、咚、咚。你的心臟一天要跳十萬次左右。', '血液出發、交貨、再回來，一圈又一圈。'],
      art: {name: '循環系統', desc: '心臟（標出心房、心室），動脈從心臟出發，連到微血管網，再由靜脈回到心臟。', svg: A3}, scene: sc(['🚚'], ['🫀', '🩸'], ['📦']),
      q: {stem: '血液和身體細胞交換養分、氧氣的地方是？', opts: ['動脈', '靜脈', '心臟', '微血管'], ans: 3, ok: '答對了！微血管的管壁只有一層細胞，物質才能通過。', hint: '想一想：要讓養分「穿過」管壁，管壁應該厚還是薄？課文說哪一種血管只有一層細胞？'}},
    {title: '呼吸系統', text: '空氣從鼻子進入，經過氣管、支氣管，到達肺。肺由許多小小的肺泡組成，肺泡外面包著微血管，氧氣在這裡進入血液，二氧化碳則離開血液。肺本身沒有肌肉，不會自己動。吸氣時，橫膈下降、肋骨上舉，胸腔變大，空氣才被吸進來。', plain: '',
      terms: [{w: '肺泡', d: '肺裡面的小氣囊，壁很薄，是氧氣和二氧化碳交換的地方。'}, {w: '橫膈', d: '胸腔和腹腔之間的一片肌肉。它下降時胸腔變大，就會吸氣。'}],
      narration: ['深深吸一口氣，是誰在出力？答案不是肺。', '是下面那片叫做橫膈的肌肉，把空氣「拉」進來。'],
      art: {name: '呼吸系統', desc: '氣管、支氣管、左右兩片肺、下方的橫膈；右上角放大圖畫出肺泡和包在外面的微血管。', svg: A4}, scene: sc(['🌬️'], ['🫁', '🎈'], ['🍃']),
      q: {stem: '吸氣的時候，身體發生了什麼事？', opts: ['肺的肌肉收縮，把空氣吸進來', '橫膈下降、肋骨上舉，胸腔變大', '橫膈上升，把肺往上推', '氣管擴張，把空氣壓進肺裡'], ans: 1, ok: '答對了！肺沒有肌肉，是橫膈和肋骨的運動讓胸腔變大，空氣才進來。', hint: '課文有一句很關鍵：肺本身有沒有肌肉？那麼出力的是誰？'}},
  ],
  exam: [
    {tag: '字詞', q: '下列哪一個屬於「器官」這個層次？', opts: ['紅血球', '肌肉組織', '胃', '消化系統'], ans: 2, why: '胃由好幾種組織組成，是器官。紅血球是細胞，消化系統是器官系統。'},
    {tag: '因果', q: '如果一個人的小腸被切除了一大段，最直接的影響是什麼？', opts: ['不能呼吸', '養分的吸收變差', '血液無法流回心臟', '食物無法吞嚥'], ans: 1, why: '小腸是消化和吸收養分的主要場所，變短之後吸收面積變小。'},
    {tag: '遷移', q: '跑完操場，你會心跳加快、呼吸變喘。最合理的解釋是？', opts: ['心臟和肺累了，需要休息', '肌肉細胞需要更多氧氣，循環和呼吸系統一起加快運送', '跑步讓胃停止消化，所以會喘', '只是因為緊張，和器官系統無關'], ans: 1, why: '運動時細胞需要更多氧氣和養分。呼吸系統加快換氣，循環系統加快運送，這是器官系統之間的合作。'}],
  open: '挑一件你每天都會做的事（例如吃早餐、爬樓梯），說說看有哪些器官系統在合作？', model: '吃早餐：消化系統把食物分解、吸收養分；循環系統把養分送到全身；呼吸系統提供細胞利用養分時需要的氧氣。',
  reveal: {title: '心臟是器官，不是單一細胞', body: '心臟由肌肉、神經等好幾種組織組成，所以它是器官。但光有心臟還不夠，要加上血管和血液，才是能完成運輸工作的循環系統。', summary: ['層次：細胞→組織→器官→器官系統→個體', '消化管是食物走的路；小腸負責主要的消化和吸收', '微血管和肺泡壁都很薄，是交換物質的地方']},
};
})();
