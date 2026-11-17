// Lesson data. Everything a lesson needs is described here: this is the shape the AI pipeline would output
// (after a teacher confirms it). The engine in app.js is generic and only reads this data.
// Painters are referenced by name (see art.js). Page width = 1.6, the pop-up stands on the right page (centre x = 0.8).
var LESSONS = [
// =====================================================================================================
{
  id: 'boat', subject: '國文', subjectEn: 'CHINESE', lessonNo: '第一課', title: '草船借箭', pageName: '第 3 頁　霧夜逼近曹營',
  cover: 0x7a2a22, accent: '#e0644f', stage: 'river', island: {ground: '#9cc98f', shore: '#e6d7a8'},
  source: '節錄自《三國演義》第四十六回。正式版本請以課本選文為準。',
  material: '草船借箭（節錄）\n\n是夜大霧漫天，長江之中，霧氣更甚，對面不相見。孔明促舟前進，果然是好大霧！……當夜五更時候，船已近曹操水寨。孔明教把船隻頭西尾東，一帶擺開，就船上擂鼓吶喊。……曹操傳令曰：「重霧迷江，彼軍忽至，必有埋伏，切不可輕動。可撥水軍弓弩手亂箭射之。」',
  outline: ['周瑜刁難：十日造十萬枝箭', '向魯肅借船，紮滿草人', '霧夜逼近曹營 ★', '曹軍放箭，草人受箭', '掉轉船身，兩面受箭', '回營交箭，周瑜嘆服'],
  cast: ['孔明', '周瑜', '魯肅', '曹操'], places: ['東吳營帳', '長江', '曹營水寨'],
  music: {scale: [293.7, 349.2, 392, 440, 523.3, 587.3], bpm: 76, tone: 'pluck'},
  counter: {label: '受箭 · ARROWS', per: 100000 / 120},
  layers: [
    {id: 'sky', name: '夜空遠山（背板）', paint: 'drawSky', z: -0.95, w: 1.56, h: 1.2, prompt: 'night sky backdrop over the Yangtze River: crescent moon behind thin clouds, scattered stars, two ranges of distant misty mountains, scalloped cloud-shaped top edge'},
    {id: 'camp', name: '曹營水寨', paint: 'drawCamp', z: -0.55, w: 1.5, h: 0.72, prompt: 'Cao Cao\'s river fortress, Three Kingdoms era: wooden palisade standing in the water, two watchtowers with archers, blank red banners, tents and torches'},
    {id: 'fogBack', name: '後層江霧', fog: true, z: -0.25, w: 1.7, h: 0.45, prompt: 'soft white drifting river fog band, wispy semi-transparent edges, long horizontal strip'},
    {id: 'boats', name: '草船隊', paint: 'drawBoats', z: 0.15, w: 1.45, h: 0.52, prompt: 'three Han-dynasty wooden boats in a row seen from the side, lined with straw-man dummies under blue-green cloth canopies, a lantern cabin, a war drum, Zhuge Liang in a white robe with a feather fan'},
    {id: 'waves', name: '前景浪花', paint: 'drawWaves', z: 0.55, w: 1.62, h: 0.26, prompt: 'foreground river waves, stylized scalloped crests in two blues with white foam lines, long horizontal strip'},
    {id: 'fogFront', name: '前層薄霧', fog: true, z: 0.8, w: 1.75, h: 0.3, prompt: 'very thin low-lying white mist, long horizontal strip'},
  ],
  who: {'旁白': '#8a7d6a', '周瑜': '#b8342a', '孔明': '#3f6fa8', '魯肅': '#2f5584'},
  teaser: {
    scenes: {
      A: [{paint: 'drawTent', z: -.9, w: 1.5, h: 1.05}, {paint: 'figZhou', who: '周瑜', z: .05, w: .36, h: .72, x: .42, from: -.35}, {paint: 'figKong', who: '孔明', z: .1, w: .36, h: .72, x: 1.18, from: 1.95}, {paint: 'drawTable', z: .5, w: .95, h: .28}],
      B: [{paint: 'drawBank', z: -.9, w: 1.56, h: 1.0}, {paint: 'drawBoats', z: -.2, w: 1.25, h: .45}, {paint: 'figKong', who: '孔明', z: .3, w: .34, h: .68, x: .3, from: -.35}, {paint: 'figLu', who: '魯肅', z: .32, w: .34, h: .68, x: 1.3, from: 1.95}, {paint: 'drawWaves', z: .62, w: 1.62, h: .24}],
      read: [],
    },
    beats: [
      {scene: 'A', who: '旁白', text: '赤壁之戰前夕，東吳大都督周瑜，想找機會為難孔明。', cam: 'stage'},
      {scene: 'A', who: '周瑜', mood: 'proud', text: '軍中缺箭。十天之內，你能造出十萬枝箭嗎？', pop: '十萬枝箭？', emote: '哼'},
      {scene: 'A', who: '孔明', mood: 'confident', text: '不用十天。三天，就交給你十萬枝箭！', pop: '三天！', emote: '！'},
      {scene: 'A', who: '旁白', mood: 'sly', text: '周瑜心裡暗笑：三天？根本不可能。', cam: 'stage', emoteOn: '周瑜', emote: '…'},
      {scene: 'B', who: '孔明', text: '子敬，借我二十艘船。每艘船的兩邊，紮上一千多個草人。', pop: '草人？'},
      {scene: 'B', who: '魯肅', mood: 'worried', text: '不造箭，卻要草人……他到底想做什麼？', emote: '？'},
      {scene: 'B', who: '旁白', text: '第一天、第二天，孔明都沒有動靜。', cam: 'stage'},
      {scene: 'read', who: '旁白', text: '第三天夜裡，江上起了大霧，孔明悄悄出發。', cam: 'stage', fx: 'fog'},
      {scene: 'read', who: '魯肅', mood: 'alarm', text: '船隊直直開向曹營？這太危險了！', cam: 'push', fx: 'camp'},
      {scene: 'read', who: '孔明', mood: 'calm', text: '別擔心，我們在船上喝酒就好。', cam: 'push'},
    ],
    hook: '孔明沒有造箭。三天之內，他要怎麼交出十萬枝箭？',
  },
  hold: ['camp'],
  tfx: {
    fog(c) {c.S.fogBoost = 1.3; c.S.night = 1;},
    camp(c) {c.release('camp'); c.after(.9, () => {c.L.camp.glow = 1.4; c.L.camp.shake = .6; c.sfx.drum(2);});},
  },
  keyTerms: ['是夜', '五更', '水寨', '擂鼓吶喊', '重霧迷江', '亂箭射之'],
  text: [['hs', '是夜', 'night'], ['t', '大霧漫天，長江之中，霧氣更甚，'], ['hs', '對面不相見', 'fogmax'], ['t', '。孔明促舟前進，果然是好大霧！'], ['sp', '……'],
    ['t', '當夜'], ['hs', '五更', 'dawn'], ['t', '時候，船已近曹操'], ['hs', '水寨', 'camp'], ['t', '。孔明教把船隻'], ['hs', '頭西尾東，一帶擺開', 'line'],
    ['t', '，就船上'], ['hs', '擂鼓吶喊', 'drum'], ['t', '。'], ['sp', '……'],
    ['t', '曹操傳令曰：「'], ['hs', '重霧迷江', 'fog'], ['t', '，彼軍忽至，'], ['hs', '必有埋伏，切不可輕動', 'ambush'], ['t', '。可撥水軍弓弩手'], ['hs', '亂箭射之', 'aim'], ['t', '。」']],
  gloss: {
    night: ['是夜', '這一天的夜裡。「是」是「這」的意思。', '燈光轉暗，進入夜晚'],
    fogmax: ['對面不相見', '霧濃到面對面都看不見彼此。', '霧氣湧到最濃'],
    dawn: ['五更', '古代把一夜分成五更，五更大約是凌晨三點到五點，天快亮之前。', '夜色最深的時刻'],
    camp: ['水寨', '建在水上的軍營，用木柵圍起來。', '曹營水寨亮起'],
    line: ['頭西尾東，一帶擺開', '船頭朝西、船尾朝東，排成一長列，讓船的側面對著曹營。', '船隊排成一列'],
    drum: ['擂鼓吶喊', '用力擊鼓、大聲喊叫，假裝要進攻。', '擂鼓聲響起'],
    fog: ['重霧迷江', '濃霧籠罩整個江面，讓人迷失方向。', '霧氣變濃'],
    ambush: ['必有埋伏，切不可輕動', '一定有伏兵，千萬不可以輕易出動。這句話顯示曹操多疑、謹慎的個性。', '曹營一陣騷動'],
    aim: ['亂箭射之', '用密集的箭射向他們。「之」指孔明的船隊。', '弓箭手就位'],
  },
  fx: {
    night(c) {c.S.night = 1;}, fogmax(c) {c.S.fogBoost = 1.4;}, fog(c) {c.S.fogBoost = 1;}, dawn(c) {c.S.night = 1; c.L.sky.glow = .8;},
    camp(c) {c.L.camp.glow = 1.6;}, line(c) {c.V.line = 0;}, drum(c) {c.V.drum = 2; c.sfx.drum(6);}, ambush(c) {c.L.camp.shake = 1.5;},
    aim(c) {c.L.camp.glow = 1; c.L.camp.shake = .6;},
  },
  init(c) {c.V.line = 1; c.V.drum = 0; c.V.flip = 0; c.V.flipT = -1;
    c.V.straw = []; for (const bx of [190, 512, 834]) for (let k = 0; k < 7; k++) c.V.straw.push([(bx - 104 + k * 35) / 1024 - .5, 1 - 230 / 367]);},
  tick(c, t, dt) {
    const V = c.V, b = c.L.boats;
    V.line = Math.min(1, V.line + dt * .8); V.drum = Math.max(0, V.drum - dt * .9);
    if (V.flipT >= 0) {V.flipT += dt; const k = Math.min(1, V.flipT / 1.2); V.flip = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; if (k >= 1) V.flipT = -1;}
    b.holder.position.y = Math.sin(t * 1.6) * .008; b.holder.position.z = (1 - V.line) * .12;
    b.mesh.rotation.z = Math.sin(t * 1.3) * .012 + Math.sin(t * 40) * .01 * V.drum; b.hinge.rotation.y = V.flip * Math.PI;
    c.L.waves.holder.position.x = Math.sin(t * .9) * .02;
  },
  predict: {q: '你覺得孔明的計謀是什麼？', opts: ['想辦法從敵人曹操那裡「借」箭', '連夜叫工匠趕工造箭', '派人偷偷潛入曹營偷箭'], hit: '借',
    hitMsg: '✓ 猜中方向了！現在你也知道：計謀成功靠的是<b>大霧</b>和<b>曹操多疑</b>。', missMsg: '和你想的不一樣吧？回到課文，找出讓計謀成功的兩個條件。'},
  quiz: [
    {tag: 'Q1 · 情節判斷', stem: '孔明為什麼一定要選在「大霧」的夜晚靠近曹營？', opts: ['夜裡霧氣涼爽，士兵比較不累', '曹軍看不清虛實，怕有埋伏不敢出戰，只會放箭', '霧可以讓船跑得比較快', '孔明想趁亂燒掉曹營'], ans: 1,
      ok: '答對了！霧中曹操看不清虛實，又怕有埋伏，只敢放箭——正好送箭給孔明。看，箭來了！',
      hints: ['霧夜涼不涼和計謀無關。想想看：曹操在霧裡看得見孔明的船嗎？', '', '船速沒有變快。關鍵在「看不見」這件事。', '孔明這次沒有要放火。他需要的是箭。'],
      run(c) {c.S.fogBoost = 1.2; c.V.drum = 2; c.sfx.drum(6); c.after(.9, () => {c.L.camp.shake = 1; c.volley({from: 'camp', to: 'boats', n: 60, delay: .3, targets: c.V.straw});});}},
    {tag: 'Q2 · 因果推理', stem: '船的一面已經插滿了箭。孔明接下來怎麼做，才能借到「十萬枝」？', opts: ['立刻開船回營', '把船掉頭，「頭東尾西」，讓另一面也受箭', '派士兵下船去撿地上的箭', '停止擂鼓，安靜等待天亮'], ans: 1,
      ok: '沒錯！「頭東尾西」掉轉船身，讓另一面也插滿箭，二十艘船共借到十萬餘枝。',
      hints: ['只有一面受箭還不夠十萬枝。', '', '下船撿箭太危險，也會被識破。', '停止擂鼓，曹軍就不會繼續放箭了。'],
      run(c) {c.V.flipT = 0; c.after(1.3, () => c.volley({from: 'camp', to: 'boats', n: 60, delay: .2, targets: c.V.straw})); c.after(3.6, () => c.banner('謝丞相箭！'));}, wait: 6.4},
  ],
  reveal: {title: '原來是「草船借箭」！', body: '孔明算準了三件事：江上會起大霧、曹操生性多疑不敢出戰、曹軍只會放箭。他讓曹操把箭「送」到草人身上，一共借到十萬餘枝。', quote: '孔明令各船上軍士齊聲叫曰：<br>「謝丞相箭！」'},
  exam: [
    {tag: '字詞', q: '「是夜大霧漫天」的「是」，意思最接近下列哪一個？', opts: ['對、正確', '這', '有', '於是'], ans: 1, why: '「是夜」＝這一夜。文言文中「是」常當指示代詞「這」。'},
    {tag: '因果', q: '如果那天晚上江上「沒有起霧」，計謀最可能在哪一步失敗？', opts: ['船隊無法出發', '曹軍看得清楚船上只有草人，會直接出兵', '草人會被風吹走', '魯肅不肯借船'], ans: 1, why: '計謀成立的條件是「曹軍看不清虛實」。沒有霧，曹操就不必只用箭應付。'},
    {tag: '遷移', q: '班上園遊會只剩三天，卻缺少裝飾材料。哪一種做法最像孔明的思考方式？', opts: ['熬夜自己從頭做', '直接放棄裝飾', '觀察手邊有什麼現成條件，向隔壁快收攤的社團借用道具', '請老師延後園遊會'], ans: 2, why: '孔明沒有硬拚「造箭」，而是看清條件（霧、曹操多疑），借用對方的資源。'},
  ],
  open: '這個故事裡，你覺得孔明最厲害的地方是什麼？用一兩句話寫下來。',
  model: '孔明最厲害的不是膽子大，而是事先看清條件：會起霧、曹操多疑。他把對手的弱點變成自己的資源。',
  goals: ['讀懂「是夜」「五更」「水寨」等文言字詞', '說出孔明計謀成功的兩個條件：大霧、曹操多疑', '能把「借用現有條件解決問題」用在生活情境'],
  plain: '這天夜裡，漫天大霧，長江上的霧氣更濃，面對面都看不見人。孔明催促船隻前進，果然是一場好大的霧！……到了五更天，船已經靠近曹操的水寨。孔明下令把船頭朝西、船尾朝東，排成一長列，然後在船上擂鼓吶喊。……曹操傳下命令說：「濃霧籠罩江面，敵軍忽然到來，一定有埋伏，千萬不可以輕易出動。調水軍的弓弩手，用亂箭射他們。」',
},
// =====================================================================================================
{
  id: 'water', subject: '自然', subjectEn: 'SCIENCE', lessonNo: '第三單元', title: '水的循環', pageName: '第 2 頁　水往哪裡去',
  cover: 0x2f6f8a, accent: '#3f9ad8', stage: 'grass', island: {ground: '#8fd0c0', shore: '#d8eef0'},
  source: '示範用原創課文，依國中小自然「水循環」概念撰寫。',
  material: '水的循環\n\n太陽照射海洋、湖泊和河流，水吸收熱能後蒸發成看不見的水蒸氣，升到空中；溶在水裡的鹽分則留在原地。水蒸氣上升到高空，遇冷凝結成小水滴或冰晶，聚集成雲。當雲中的水滴越聚越大、空氣托不住時，就以雨或雪的形式落下，稱為降水。落到地面的水，一部分沿著地表流入河川，稱為逕流；一部分滲入地下成為地下水，最後大多回到海洋。水就這樣不斷循環。',
  outline: ['地球上的水在哪裡', '蒸發、凝結、降水、逕流 ★', '水循環與天氣', '珍惜水資源'],
  cast: ['小水滴「滴滴」', '太陽', '雲'], places: ['海洋', '高空', '高山', '河川'],
  music: {scale: [392, 440, 523.3, 587.3, 659.3, 784], bpm: 96, tone: 'bell'},
  layers: [
    {id: 'sky', name: '天空與太陽（背板）', paint: 'drawDaySky', z: -0.95, w: 1.56, h: 1.15, prompt: 'bright daytime sky backdrop with a friendly smiling sun, a few small clouds, pale distant hills, scalloped top edge'},
    {id: 'mountain', name: '高山與溪流', paint: 'drawMountain', z: -0.6, w: 1.3, h: 0.75, prompt: 'green mountain with a snow cap, a blue stream running down from the snow line, pine trees at the foot'},
    {id: 'cloud', name: '雲（紙柱撐起）', paint: 'drawCloudStalk', z: -0.2, w: 1.3, h: 1.0, prompt: 'two fluffy white clouds with gentle faces, each held up by a thin paper strut, like a pop-up book mechanism'},
    {id: 'land', name: '陸地與河川', paint: 'drawLand', z: 0.2, w: 1.5, h: 0.42, prompt: 'green field with a river flowing to the right, a small red-roofed house, round trees, tiny flowers'},
    {id: 'waves', name: '海洋', paint: 'drawWaves', z: 0.6, w: 1.62, h: 0.26, prompt: 'foreground sea waves, stylized scalloped crests in two blues with white foam lines, long horizontal strip'},
  ],
  who: {'旁白': '#8a7d6a', '滴滴': '#3f9ad8'},
  teaser: {
    scenes: {
      A: [{paint: 'drawSeaBack', z: -.9, w: 1.56, h: 1.05}, {paint: 'figDrop', who: '滴滴', z: .15, w: .34, h: .44, x: .8, from: -.3}, {paint: 'drawWaves', z: .55, w: 1.62, h: .26}],
      read: [{paint: 'figDrop', who: '滴滴', z: 0, w: .2, h: .26, x: .57, y: .5, from: .57}],
    },
    beats: [
      {scene: 'A', who: '旁白', text: '海水喝起來鹹鹹的。可是從天上落下來的雨水，卻一點也不鹹。', cam: 'stage'},
      {scene: 'A', who: '滴滴', mood: 'happy', text: '嗨！我是小水滴，滴滴。我住在大海裡，身邊都是鹹鹹的鹽。', emote: '♪'},
      {scene: 'A', who: '旁白', text: '太陽出來了，海面越來越溫暖。', cam: 'stage', fx: 'warm'},
      {scene: 'A', who: '滴滴', mood: 'excited', text: '哇，我變得好輕……我飛起來了！', emote: '！', pop: '飛起來了！', fx: 'fly'},
      {scene: 'read', who: '旁白', text: '滴滴越飛越高。高空中，又冷又安靜。', cam: 'stage'},
      {scene: 'read', who: '滴滴', mood: 'cold', text: '好冷呀！大家快靠過來，抱在一起！', emote: '冷', cam: 'push'},
      {scene: 'read', who: '旁白', text: '好多小水滴聚在一起，變成了一朵雲。雲越來越重，越來越重……', cam: 'push', fx: 'heavy'},
    ],
    hook: '滴滴就要變成雨，回到地面了。可是，海裡的鹽去哪裡了？為什麼雨水不是鹹的？',
  },
  tfx: {
    warm(c) {c.emit('spark', {n: 10, box: [.2, 1.4, .5, .9, -.5, -.3], v: [0, -.05, 0], life: 1.6, size: .07});},
    fly(c) {c.V.fly = 1; c.emit('vapor', {n: 26, box: [.3, 1.3, .08, .2, .2, .6], v: [0, .32, -.12], life: 2.6, size: .1, stagger: 2});
      c.emit('salt', {n: 10, box: [.4, 1.2, .1, .16, .45, .6], v: [0, .3, 0], g: -1.2, life: 1.5, size: .05, stagger: 1.5});},
    heavy(c) {c.V.dark = 1; c.L.cloud.shake = .5;},
  },
  keyTerms: ['蒸發', '凝結', '降水', '逕流', '地下水'],
  text: [['t', '太陽照射海洋、湖泊和河流，水吸收熱能後'], ['hs', '蒸發', 'evap'], ['t', '成看不見的'], ['hs', '水蒸氣', 'vapor'], ['t', '，升到空中；溶在水裡的'], ['hs', '鹽分則留在原地', 'salt'],
    ['t', '。水蒸氣上升到高空，遇冷'], ['hs', '凝結', 'cond'], ['t', '成小水滴或冰晶，聚集成'], ['hs', '雲', 'cloud'], ['t', '。當雲中的水滴越聚越大、空氣托不住時，就以雨或雪的形式落下，稱為'], ['hs', '降水', 'rain'],
    ['t', '。落到地面的水，一部分沿著地表流入河川，稱為'], ['hs', '逕流', 'runoff'], ['t', '；一部分滲入地下成為'], ['hs', '地下水', 'ground'], ['t', '，最後大多回到海洋。水就這樣不斷循環。']],
  gloss: {
    evap: ['蒸發', '液態的水吸收熱能，變成氣態水蒸氣的過程。溫度越高、風越大，蒸發越快。', '海面的水變成水氣往上升'],
    vapor: ['水蒸氣', '氣態的水，無色無味，眼睛看不見。我們看到的「白煙」其實是小水滴。', '水氣飄向高空'],
    salt: ['鹽分則留在原地', '蒸發時只有水分子離開，鹽不會跟著變成氣體，所以留在海裡。', '白色的鹽粒跳一下，又落回海面'],
    cond: ['凝結', '氣態的水蒸氣遇冷，變回液態小水滴的過程。', '雲變大、變厚'],
    cloud: ['雲', '由無數小水滴或冰晶聚集而成，飄浮在空中。', '雲朵亮起來'],
    rain: ['降水', '雲裡的水以雨、雪、冰雹等形式落到地面，都稱為降水。', '下雨了'],
    runoff: ['逕流', '雨水落地後，沿著地表往低處流，匯入溪流與河川。', '溪流與河川亮起來'],
    ground: ['地下水', '滲入土壤和岩石縫隙中的水，是重要的水資源。', '水滲進陸地'],
  },
  fx: {
    evap(c) {c.emit('vapor', {n: 30, box: [.1, 1.5, .08, .2, .45, .7], v: [0, .3, -.22], life: 2.6, size: .1, stagger: 2.2});},
    vapor(c) {c.emit('vapor', {n: 18, box: [.3, 1.3, .3, .6, 0, .4], v: [0, .22, -.15], life: 2.2, size: .09, stagger: 1.5});},
    salt(c) {c.emit('vapor', {n: 14, box: [.2, 1.4, .08, .2, .45, .7], v: [0, .3, -.2], life: 2.4, size: .09, stagger: 1.5}); c.emit('salt', {n: 16, box: [.2, 1.4, .1, .16, .5, .68], v: [0, .34, 0], g: -1.3, life: 1.4, size: .05, stagger: 1.6});},
    cond(c) {c.V.dark = 1; c.L.cloud.glow = .4; c.V.puff = 1;}, cloud(c) {c.L.cloud.glow = 1.2;},
    rain(c) {c.V.dark = 1; c.emit('drop', {n: 70, box: [.3, 1.3, .62, .74, -.25, .05], v: [0, -.75, 0], life: .95, size: .05, stagger: 3}); c.sfx.rain(3);},
    runoff(c) {c.L.mountain.glow = 1; c.L.land.glow = 1.2; c.emit('drop', {n: 18, box: [.9, 1.5, .2, .34, .22, .26], v: [.25, -.03, .1], life: 1.3, size: .045, stagger: 1.4});},
    ground(c) {c.L.land.glow = .8; c.emit('drop', {n: 14, box: [.2, .8, .2, .3, .22, .26], v: [0, -.12, 0], life: 1.2, size: .04, stagger: 1.2});},
  },
  init(c) {c.V.fly = 0; c.V.flyK = 0; c.V.dark = 0; c.V.darkK = 0; c.V.puff = 0;},
  tick(c, t, dt) {
    const V = c.V;
    V.flyK += ((V.fly ? 1 : 0) - V.flyK) * Math.min(1, dt * 1.2); V.dark = Math.max(0, V.dark - dt * .12); V.darkK += (Math.min(1, V.dark * 3) - V.darkK) * Math.min(1, dt * 2); V.puff = Math.max(0, V.puff - dt * .7);
    const cl = c.L.cloud; cl.holder.position.x = Math.sin(t * .5) * .03; cl.mesh.material.color.setRGB(1 - .32 * V.darkK, 1 - .3 * V.darkK, 1 - .22 * V.darkK); cl.mesh.scale.x = 1 + V.puff * .06;
    c.L.waves.holder.position.x = Math.sin(t * .9) * .02;
    const d = c.C['A:滴滴']; if (d) {d.holder.position.y += V.flyK * .75 + Math.sin(t * 2.2) * .012; d.mesh.rotation.z += Math.sin(t * 1.7) * .05;}
    const d2 = c.C['read:滴滴']; if (d2) {d2.holder.position.y += Math.sin(t * 2) * .02; d2.holder.position.x += Math.sin(t * .5) * .03;}
  },
  predict: {q: '你覺得海裡的鹽去哪裡了？', opts: ['鹽留在海裡，只有水變成水蒸氣飛上天', '鹽跟著飛上天，在雲裡被風吹散了', '鹽在高空結成冰，先掉下來了'], hit: '留',
    hitMsg: '✓ 猜對了！蒸發時只有水離開，<b>鹽留在海裡</b>。', missMsg: '和你想的不一樣吧？回到課文，找找「蒸發」的時候鹽發生了什麼事。'},
  quiz: [
    {tag: 'Q1 · 概念理解', stem: '海水蒸發時，溶在水裡的鹽分會怎麼樣？', opts: ['跟著水蒸氣一起升到空中', '留在海裡，只有水變成水蒸氣', '被太陽曬到消失', '沉到海底變成石頭'], ans: 1,
      ok: '答對了！蒸發時只有水分子離開，鹽留在原地。看，水氣上升，鹽粒落回海面。',
      hints: ['鹽不會變成氣體。回課文找「鹽分」那一句。', '', '物質不會憑空消失喔。', '鹽還是溶在海水裡，沒有變成石頭。'],
      run(c) {c.emit('vapor', {n: 40, box: [.1, 1.5, .08, .2, .45, .7], v: [0, .3, -.22], life: 2.6, size: .1, stagger: 2.5}); c.emit('salt', {n: 20, box: [.2, 1.4, .1, .16, .5, .68], v: [0, .36, 0], g: -1.3, life: 1.4, size: .05, stagger: 2});}},
    {tag: 'Q2 · 因果推理', stem: '雲裡的小水滴，什麼時候會變成雨落下來？', opts: ['太陽下山的時候', '風停下來的時候', '水滴越聚越大，空氣托不住的時候', '雲飄到海面上的時候'], ans: 2,
      ok: '沒錯！水滴越聚越大、越來越重，空氣托不住就落下來，這就是「降水」。下雨了！',
      hints: ['白天也會下雨喔。', '下雨和有沒有風沒有直接關係。', '', '雲在哪裡都可能下雨，關鍵是水滴的大小。'],
      run(c) {c.V.dark = 1; c.L.cloud.shake = .6; c.after(.6, () => {c.emit('drop', {n: 110, box: [.3, 1.3, .62, .74, -.25, .05], v: [0, -.75, 0], life: .95, size: .05, stagger: 4}); c.sfx.rain(4);}); c.after(2.6, () => {c.L.land.glow = 1; c.L.mountain.glow = .8; c.banner('雨水不鹹！');});}, wait: 5.6},
  ],
  reveal: {title: '鹽，一直留在海裡！', body: '太陽讓海水蒸發，飛上天的只有水；鹽不會變成氣體，所以留在海裡。水蒸氣遇冷凝結成雲，再變成雨落下——雨水當然不鹹。', quote: '「水蒸發，鹽留下。」<br>曬鹽，用的就是這個道理。'},
  exam: [
    {tag: '名詞', q: '「水蒸氣遇冷變回小水滴」的過程，稱為什麼？', opts: ['蒸發', '凝結', '降水', '逕流'], ans: 1, why: '氣態變液態是「凝結」；液態變氣態才是「蒸發」。'},
    {tag: '因果', q: '下列哪一個順序，正確描述了一滴海水回到海洋的旅程？', opts: ['凝結 → 蒸發 → 逕流 → 降水', '蒸發 → 凝結 → 降水 → 逕流', '降水 → 蒸發 → 凝結 → 逕流', '蒸發 → 降水 → 凝結 → 逕流'], ans: 1, why: '先蒸發成水蒸氣，遇冷凝結成雲，降水落地，再經逕流回到海洋。'},
    {tag: '遷移', q: '夏天從冰箱拿出冰飲料，杯子外面很快出現小水珠。這些水珠是從哪裡來的？', opts: ['杯子裡的飲料滲出來', '空氣中的水蒸氣遇到冰冷的杯子，凝結成小水滴', '冰塊融化後跑到杯子外面', '杯子本身會出水'], ans: 1, why: '和雲的形成一樣：水蒸氣遇冷凝結。杯壁就像冰冷的高空。'},
  ],
  open: '如果有一天太陽的熱能變弱了，水循環可能會有什麼改變？寫下你的推測。',
  model: '太陽熱能變弱，蒸發會變慢，空中的水蒸氣變少，雲和降水也會減少，整個水循環會慢下來。',
  goals: ['說出蒸發、凝結、降水、逕流四個過程的意思和順序', '解釋為什麼海水是鹹的、雨水卻不鹹', '用「遇冷凝結」解釋生活中的現象'],
},
// =====================================================================================================
{
  id: 'silk', subject: '社會', subjectEn: 'HISTORY', lessonNo: '第二章', title: '張騫通西域', pageName: '第 4 頁　絲路的開通',
  cover: 0x8a5a2a, accent: '#d98a3a', stage: 'sand', island: {ground: '#ecc98a', shore: '#f5e6c0'},
  source: '示範用原創課文，依國中歷史「漢代與西域的交流」內容撰寫。',
  material: '張騫通西域\n\n漢武帝時，為了聯合大月氏夾擊匈奴，派張騫出使西域。張騫途中被匈奴扣留十多年，脫身後繼續西行，雖然沒有達成結盟的目的，卻帶回西域各國的地理、物產與風俗等第一手資料。司馬遷稱讚他「鑿空」西域。此後，漢朝與西域往來日益頻繁，中國的絲綢經由這條路線運往西方，西域的葡萄、苜蓿、石榴等物產也傳入中國，後人把這條東西交通要道稱為絲路。',
  outline: ['漢朝與匈奴的衝突', '漢武帝派張騫出使', '被扣十年，不忘使命', '絲路的開通與交流 ★', '東西文化的相遇'],
  cast: ['張騫', '漢武帝', '匈奴', '大月氏'], places: ['長安', '匈奴', '西域'],
  music: {scale: [293.7, 329.6, 370, 440, 493.9, 587.3], bpm: 84, tone: 'reed'},
  layers: [
    {id: 'sky', name: '大漠夕照（背板）', paint: 'drawDesertSky', z: -0.95, w: 1.56, h: 1.1, prompt: 'desert sunset backdrop: warm orange sky, large pale sun, distant snow-capped Tianshan mountains and mesas, scalloped top edge'},
    {id: 'gate', name: '長安城門與西域綠洲', paint: 'drawGate', z: -0.5, w: 1.5, h: 0.62, prompt: 'Han-dynasty Chang\'an city gate with grey brick wall and red gate tower on the left, an oasis town with adobe houses, a teal dome and palm trees on the right'},
    {id: 'caravan', name: '駱駝商隊', paint: 'drawCaravan', z: 0.1, w: 1.2, h: 0.33, prompt: 'camel caravan walking left in a row, three camels loaded with red, blue and gold silk bolts, led by a Han envoy on foot holding a staff with red tassels'},
    {id: 'dunes', name: '前景沙丘', paint: 'drawDunes', z: 0.55, w: 1.62, h: 0.26, prompt: 'foreground sand dunes in two warm sand tones with light wind ripple lines, long horizontal strip'},
  ],
  who: {'旁白': '#8a7d6a', '漢武帝': '#2b2233', '張騫': '#9a6a3a'},
  teaser: {
    scenes: {
      A: [{paint: 'drawPalace', z: -.9, w: 1.5, h: 1.05}, {paint: 'figEmperor', who: '漢武帝', z: 0, w: .38, h: .76, x: .45, from: -.35}, {paint: 'figZhang', who: '張騫', z: .2, w: .34, h: .68, x: 1.18, from: 1.95}, {paint: 'drawThrone', z: .5, w: 1.3, h: .22}],
      B: [{paint: 'drawDesertSky', z: -.9, w: 1.56, h: 1.05}, {paint: 'drawChains', z: -.3, w: 1.1, h: .62}, {paint: 'figZhang', who: '張騫', z: .2, w: .34, h: .68, x: .8, from: 1.95}, {paint: 'drawDunes', z: .55, w: 1.62, h: .26}],
      read: [],
    },
    beats: [
      {scene: 'A', who: '旁白', text: '兩千多年前的漢朝，北方的匈奴時常南下侵擾。', cam: 'stage'},
      {scene: 'A', who: '漢武帝', mood: 'grave', text: '誰願意出使西域，聯合大月氏，一起夾擊匈奴？', pop: '出使西域'},
      {scene: 'A', who: '張騫', mood: 'firm', text: '臣張騫，願意前往！', emote: '！'},
      {scene: 'read', who: '旁白', text: '西元前一三九年，張騫帶著一百多人，從長安出發，一路向西。', cam: 'stage', fx: 'march'},
      {scene: 'B', who: '旁白', mood: 'grave', text: '沒想到才走到半路，就被匈奴抓住，一關就是十年。', cam: 'stage', pop: '十年', fx: 'dust'},
      {scene: 'B', who: '張騫', mood: 'firm', text: '我沒有忘記自己的使命。一定要找機會逃出去！', emote: '！'},
      {scene: 'read', who: '旁白', mood: 'grave', text: '十三年後，張騫終於回到長安。出發時的一百多人，只剩下兩個人。而且，大月氏並沒有答應結盟。', cam: 'push', fx: 'back'},
    ],
    hook: '任務失敗了。張騫為什麼反而成為名留青史的大功臣？',
  },
  tfx: {
    march(c) {c.V.target = .15;}, back(c) {c.V.target = -.1; c.S.night = .6;},
    dust(c) {c.emit('dust', {n: 30, box: [.1, 1.5, .05, .4, .3, .7], v: [.3, .05, 0], life: 2, size: .16, stagger: 2});},
  },
  keyTerms: ['匈奴', '西域', '鑿空', '絲綢', '絲路'],
  text: [['t', '漢武帝時，為了聯合'], ['hs', '大月氏', 'yuezhi'], ['t', '夾擊'], ['hs', '匈奴', 'xiongnu'], ['t', '，派張騫出使'], ['hs', '西域', 'west'],
    ['t', '。張騫途中被匈奴扣留十多年，脫身後繼續西行，雖然沒有達成結盟的目的，卻帶回西域各國的地理、物產與風俗等'], ['hs', '第一手資料', 'info'], ['t', '。司馬遷稱讚他「'], ['hs', '鑿空', 'open'], ['t', '」西域。此後，漢朝與西域往來日益頻繁，中國的'],
    ['hs', '絲綢', 'silk'], ['t', '經由這條路線運往西方，西域的'], ['hs', '葡萄、苜蓿、石榴', 'goods'], ['t', '等物產也傳入中國，後人把這條東西交通要道稱為'], ['hs', '絲路', 'road'], ['t', '。']],
  gloss: {
    yuezhi: ['大月氏', '原本住在河西走廊一帶的民族，被匈奴擊敗後西遷到中亞。漢朝想和他們結盟。', '西方的綠洲亮起'],
    xiongnu: ['匈奴', '活躍於北方草原的游牧民族，擅長騎射，是漢朝最大的外患。', '風沙大作'],
    west: ['西域', '漢代對玉門關、陽關以西地區的稱呼，大約是今日的新疆與中亞一帶。', '遠方的雪山與綠洲亮起'],
    info: ['第一手資料', '親自觀察、蒐集到的資訊。張騫帶回的見聞，讓漢朝第一次真正認識西域。', '長安城亮起'],
    open: ['鑿空', '「鑿」是開鑿，「空」是孔道。意思是開通了原本不通的道路。', '道路上灑下金光'],
    silk: ['絲綢', '用蠶絲織成的布料，輕柔有光澤，是當時西方最想要的中國商品。', '商隊載著絲綢向西出發'],
    goods: ['葡萄、苜蓿、石榴', '從西域傳入中國的作物。名字裡有「胡」字的東西（如胡桃），多半也是這樣傳入的。', '商隊從西域返回'],
    road: ['絲路', '連接中國與中亞、西亞，遠達歐洲的陸上貿易路線，因絲綢貿易而得名。', '整條路線亮起'],
  },
  fx: {
    yuezhi(c) {c.L.gate.glow = 1;}, xiongnu(c) {c.L.dunes.shake = 1.2; c.emit('dust', {n: 34, box: [.1, 1.5, .05, .45, .2, .7], v: [.35, .05, 0], life: 2, size: .16, stagger: 1.5});},
    west(c) {c.L.sky.glow = 1; c.L.gate.glow = .8;}, info(c) {c.L.gate.glow = 1.3;},
    open(c) {c.emit('spark', {n: 26, box: [.1, 1.5, .1, .5, .1, .5], v: [0, -.08, 0], life: 1.8, size: .07, stagger: 1.5});},
    silk(c) {c.V.target = .15;}, goods(c) {c.V.target = -.1;},
    road(c) {c.L.gate.glow = 1; c.L.sky.glow = .8; c.emit('spark', {n: 30, box: [.1, 1.5, .08, .3, .1, .4], v: [0, .1, 0], life: 1.8, size: .06, stagger: 1.5});},
  },
  init(c) {c.V.x = -.1; c.V.target = -.1; c.V.dir = -1;},
  tick(c, t, dt) {
    const V = c.V, cv = c.L.caravan, d = V.target - V.x, step = Math.sign(d) * Math.min(Math.abs(d), dt * .09);
    V.x += step; const moving = Math.abs(d) > .002;
    cv.holder.position.x = V.x; cv.holder.position.y = moving ? Math.abs(Math.sin(t * 7)) * .012 : 0; cv.mesh.rotation.z = moving ? Math.sin(t * 7) * .012 : 0;
    if (moving) V.dir = step > 0 ? -1 : 1; cv.mesh.scale.x = V.dir;
  },
  predict: {q: '你覺得張騫為什麼成為大功臣？', opts: ['他帶回西域的第一手見聞，打開了通往西方的路', '他在回程的路上打敗了匈奴', '他從西域帶回了大量的黃金'], hit: '見聞|路|資料|交流',
    hitMsg: '✓ 猜中了！他帶回的<b>見聞</b>，比一紙盟約更有價值。', missMsg: '和你想的不一樣吧？回到課文，看看張騫「帶回了什麼」。'},
  quiz: [
    {tag: 'Q1 · 史實理解', stem: '漢武帝派張騫出使西域，原本的目的是什麼？', opts: ['把絲綢賣到西方賺錢', '聯合大月氏，一起夾擊匈奴', '到西域尋找葡萄和石榴', '和匈奴簽訂和約'], ans: 1,
      ok: '答對了！原本是軍事目的：聯合大月氏對付匈奴。貿易是後來才發展出來的。',
      hints: ['絲綢貿易是路開通「之後」的事。', '', '這些作物是後來才傳入的。', '漢武帝想對抗匈奴，不是議和。'],
      run(c) {c.L.gate.glow = 1.2; c.V.target = .02;}},
    {tag: 'Q2 · 歷史解釋', stem: '張騫沒有完成結盟，為什麼司馬遷仍稱讚他「鑿空」西域？', opts: ['因為他在西域挖了一條隧道', '因為他帶回西域的第一手資料，開啟了漢朝與西域的往來', '因為他活著回來', '因為他消滅了匈奴'], ans: 1,
      ok: '沒錯！他帶回的地理、物產與風俗資訊，讓東西方開始往來，後來發展成絲路。',
      hints: ['「鑿空」是比喻，不是真的挖隧道。', '', '活著回來很不容易，但這不是「鑿空」的意思。', '匈奴的威脅是之後才逐漸解除的。'],
      run(c) {c.V.target = .15; c.emit('spark', {n: 40, box: [.1, 1.5, .08, .5, .1, .5], v: [0, .08, 0], life: 2, size: .07, stagger: 2.5}); c.after(2.6, () => {c.V.target = -.08; c.banner('絲路開通！');});}, wait: 5.6},
  ],
  reveal: {title: '他帶回了一條「路」', body: '張騫沒有帶回盟約，卻帶回西域各國的地理、物產與風俗。漢朝第一次看清西方的世界，使者與商隊接連上路，絲綢西去，葡萄、石榴東來。', quote: '司馬遷在《史記》中稱他：<br>「鑿空」西域。'},
  exam: [
    {tag: '名詞', q: '「鑿空西域」的「鑿空」，意思是什麼？', opts: ['把西域搬空', '開通原本不通的道路', '在沙漠裡鑿井取水', '打敗西域各國'], ans: 1, why: '「鑿」是開鑿，「空」是孔道，比喻開通道路。'},
    {tag: '因果', q: '絲路開通後，下列哪一項是「從西域傳入中國」的？', opts: ['絲綢', '葡萄', '造紙術', '茶葉'], ans: 1, why: '葡萄、苜蓿、石榴由西域傳入；絲綢則是由中國運往西方。'},
    {tag: '遷移', q: '下列哪一件現代的事，作用最像當年的絲路？', opts: ['學校的圍牆', '連接各國的貨運航線與網路，讓商品和文化互相流通', '城市裡的紅綠燈', '家裡的保險箱'], ans: 1, why: '絲路的核心作用是「連結與交流」：商品、作物、文化沿著路線往來。'},
  ],
  open: '張騫的任務失敗了，卻留下更大的貢獻。這個故事給你什麼啟發？',
  model: '原本的目標沒達成，不代表努力沒有價值。張騫一路上的見聞，後來反而比結盟更重要：過程中的收穫也可能成為成果。',
  goals: ['說出張騫出使西域的原本目的與結果', '解釋「鑿空」的意思，以及絲路開通後東西方交流了什麼', '能分辨「目的」和「影響」是兩件不同的事'],
},
];
// Subjects that are planned next: how they would be presented.
var PLANNED = [
  {id: 'math', subject: '數學', subjectEn: 'MATH', title: '可以動手摺的立體書',
    body: '數學不適合「說故事」，適合「動手操作」。規劃的呈現方式：<br>・<b>幾何</b>：把展開圖摺成立體、把畢氏定理的三個正方形拼給你看。<br>・<b>代數</b>：用天平紙雕，兩邊同時拿走積木，看等式怎麼保持平衡。<br>・<b>流程</b>：先丟一個生活謎題 → 動手操作紙雕 → 自己說出規則 → 練習題。'},
  {id: 'english', subject: '英文', subjectEn: 'ENGLISH', title: '可以對話的情境立體書',
    body: '英文的重點是「聽和說」。規劃的呈現方式：<br>・<b>情境場景</b>：市場、機場、教室的立體場景，點物件聽單字和例句。<br>・<b>角色對話</b>：紙偶用課文對話演一次，再換學生跟讀、錄音比對。<br>・<b>流程</b>：先看情境對話 → 猜意思 → 讀課文、點單字 → 角色扮演 → 聽力與句型測驗。'},
];
if (typeof module !== 'undefined') module.exports = {LESSONS, PLANNED};
