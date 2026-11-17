// Curriculum index: what the 108 課綱 (自然科學領域, 國中階段 Ⅳ) asks for, and in which semester the three
// publishers (康軒、南一、翰林) place it. Used by the "只給主題" flow: the topic is looked up here first, and the
// matching scope is handed to the AI so the lesson it writes stays inside what the grade actually teaches.
// Compiled from the curriculum guideline and schools' published course plans; scope text is our own summary.
// A real product would replace this table with a live search service on the server.
var Curri = (function () {
'use strict';
const ALLPUB = '康軒、南一、翰林三個版本';
const INDEX = [
  {id: 'level', subject: '自然', grade: '七上', unit: '細胞與生物體的組成層次', human: 1, keys: ['細胞', '組織', '器官', '器官系統', '組成層次', '個體', '顯微鏡'],
    codes: ['Da-Ⅳ-2 細胞是組成生物體的基本單位', 'Da-Ⅳ-3 多細胞個體具有細胞、組織、器官、器官系統等組成層次'],
    scope: '細胞是生物體的基本單位。動物體的層次：細胞→組織→器官→器官系統→個體；植物體沒有器官系統這一層。'},
  {id: 'digest', subject: '自然', grade: '七上', unit: '養分與消化系統', human: 1, keys: ['消化', '養分', '酵素', '胃', '小腸', '大腸', '肝', '胰', '食道', '口腔', '吸收'],
    codes: ['Db-Ⅳ-1 動物體（以人體為例）經由攝食、消化、吸收獲得所需的養分'],
    scope: '消化管依序是口、咽、食道、胃、小腸、大腸、肛門；消化腺有唾腺、胃腺、肝臟、胰臟、腸腺。小腸是消化與吸收養分的主要場所，大腸吸收剩餘的水分。肝臟分泌膽汁，膽汁不含消化酵素，能乳化脂質。食物不會經過肝臟和胰臟。'},
  {id: 'circ', subject: '自然', grade: '七上', unit: '運輸作用與循環系統', human: 1, keys: ['循環', '心臟', '血管', '血液', '動脈', '靜脈', '微血管', '心跳', '脈搏', '運輸', '淋巴'],
    codes: ['Db-Ⅳ-2 動物體（以人體為例）的循環系統能將體內的物質運輸至各細胞處，並進行物質交換'],
    scope: '循環系統由心臟、血管、血液組成。心臟有兩個心房、兩個心室。動脈把血液帶離心臟，靜脈把血液帶回心臟，微血管的管壁只有一層細胞，是物質交換的地方。可以用心跳、心音、脈搏了解循環的運作。'},
  {id: 'nerve', subject: '自然', grade: '七上', unit: '協調作用：神經系統', human: 1, keys: ['神經', '腦', '大腦', '小腦', '腦幹', '脊髓', '反射', '受器', '感覺', '協調'],
    codes: ['Dc-Ⅳ-1 人體的神經系統能察覺環境的變動並產生反應'],
    scope: '受器接受刺激，經神經傳到腦或脊髓，再傳到動器產生反應。大腦管意識與思考，小腦管平衡，腦幹管心跳與呼吸。反射不經過大腦判斷，反應快，可以保護身體。'},
  {id: 'endo', subject: '自然', grade: '七上', unit: '協調作用：內分泌系統', human: 1, keys: ['內分泌', '激素', '荷爾蒙', '腺體', '胰島素', '甲狀腺', '腦垂腺', '腎上腺', '血糖'],
    codes: ['Dc-Ⅳ-2 人體的內分泌系統能調節代謝作用，維持體內物質的恆定'],
    scope: '內分泌腺分泌激素，由血液運送，作用比神經慢但持久。例如胰島素使血糖下降，升糖素使血糖上升。'},
  {id: 'breath', subject: '自然', grade: '七上', unit: '恆定性：呼吸系統', human: 1, keys: ['呼吸', '肺', '肺泡', '氣管', '支氣管', '橫膈', '氣體交換', '氧氣', '二氧化碳'],
    codes: ['Db-Ⅳ-3 動物體（以人體為例）藉由呼吸系統與外界交換氣體'],
    scope: '空氣經鼻、咽、喉、氣管、支氣管進入肺。肺由許多肺泡組成，肺泡外面包著微血管，在這裡交換氧氣和二氧化碳。肺沒有肌肉，靠橫膈和肋間肌帶動胸腔的大小變化來呼吸：吸氣時橫膈下降、肋骨上舉。'},
  {id: 'excrete', subject: '自然', grade: '七上', unit: '恆定性：排泄與體內環境', human: 1, keys: ['排泄', '腎', '腎臟', '膀胱', '尿', '輸尿管', '恆定', '體溫', '水分', '汗'],
    codes: ['Dc-Ⅳ-4 人體會藉由各系統的協調，使體內所含的物質以及各種狀態維持在一定範圍內', 'Dc-Ⅳ-5 生物體能覺察外界環境變化、採取適當的反應以使體內環境維持恆定'],
    scope: '腎臟過濾血液形成尿液，經輸尿管到膀胱暫存，再由尿道排出。排泄是排除代謝廢物，排便（排遺）不算排泄。人體也會調節體溫、水分和血糖，維持恆定。'},
  {id: 'defend', subject: '自然', grade: '七上', unit: '人體的防禦', human: 1, keys: ['免疫', '防禦', '皮膚', '白血球', '淋巴', '抗體', '疫苗', '發炎'],
    codes: ['Dc-Ⅳ-3 皮膚是人體的第一道防禦系統，能阻止外來物；淋巴系統則可進一步產生免疫作用'],
    scope: '皮膚和黏膜是第一道防線，白血球可以吞噬病原體，淋巴系統可以產生專一性的免疫作用。'},
  {id: 'repro', subject: '自然', grade: '七下', unit: '生殖：人類的生殖系統', human: 1, keys: ['生殖', '睪丸', '卵巢', '子宮', '受精', '精子', '卵', '胚胎', '青春期', '細胞分裂', '減數分裂', '無性生殖', '有性生殖'],
    codes: ['Db-Ⅳ-4 生殖系統（以人體為例）能產生配子進行有性生殖，並且有分泌激素的功能', 'Ga-Ⅳ-1 生物的生殖可分為有性生殖與無性生殖'],
    scope: '細胞分裂與減數分裂；無性生殖與有性生殖。男性的睪丸產生精子，女性的卵巢產生卵，受精在輸卵管，胚胎在子宮內發育。'},
  {id: 'gene', subject: '自然', grade: '七下', unit: '遺傳', keys: ['遺傳', '基因', '染色體', 'DNA', '顯性', '隱性', '孟德爾', '血型', '性狀', '突變'],
    codes: ['Ga-Ⅳ 主題：生殖與遺傳'], scope: '性狀由基因控制，基因位於染色體上。孟德爾的遺傳法則、顯性與隱性、人類的血型與性別遺傳、突變與遺傳諮詢。'},
  {id: 'evo', subject: '自然', grade: '七下', unit: '演化與生物的分類', keys: ['演化', '化石', '天擇', '達爾文', '分類', '界門綱目科屬種', '學名', '原核', '真菌', '植物界', '動物界', '脊椎動物', '節肢動物'],
    codes: ['Gb-Ⅳ 主題：演化', 'Gc-Ⅳ 主題：生物多樣性'], scope: '化石是演化的證據，天擇說解釋生物的演化。生物分類的階層、學名，以及五界的代表生物。'},
  {id: 'eco', subject: '自然', grade: '七下', unit: '生態系與環境保育', keys: ['生態', '食物鏈', '食物網', '族群', '群集', '生產者', '消費者', '分解者', '能量', '碳循環', '保育', '生物多樣性', '外來種'],
    codes: ['Bd-Ⅳ-1 生態系中的能量來源是太陽，能量會經由食物鏈在不同生物間流轉', 'Lb-Ⅳ 主題：生物與環境的交互作用'],
    scope: '族群與群集、生物間的互動關係、食物鏈與能量流動、物質循環、各種生態系，以及人類活動對環境的影響與保育。'},
  {id: 'plant', subject: '自然', grade: '七上', unit: '植物的構造與光合作用', keys: ['光合作用', '葉綠體', '葉', '氣孔', '維管束', '根', '莖', '蒸散', '植物'],
    codes: ['Bc-Ⅳ-3 植物利用葉綠體進行光合作用，將二氧化碳和水轉變成醣類養分', 'Db-Ⅳ-6 植物體根、莖、葉、花、果實內的維管束具有運輸功能'],
    scope: '植物在葉綠體進行光合作用，把二氧化碳和水變成葡萄糖和氧氣。維管束的木質部運水、韌皮部運養分；氣孔是氣體進出和蒸散的門戶。'},
];
const GRADES = ['七上', '七下', '八上', '八下', '九上', '九下'];
const GNAME = {'七上': '國一上學期', '七下': '國一下學期', '八上': '國二上學期', '八下': '國二下學期', '九上': '國三上學期', '九下': '國三下學期'};
/** Look a topic up. Returns the matching units, split into "this semester" and "other semesters", plus a plain-language finding for the teacher. */
function lookup(topic, grade, subject) {
  const t = String(topic || ''), broad = /人體|身體/.test(t) && /器官|系統|構造|認識/.test(t) || /^(人體)?器官(系統)?(認識|介紹)?$/.test(t.trim());
  let hits = INDEX.filter(e => e.subject === subject).map(e => ({e, score: e.keys.reduce((s, k) => s + (t.includes(k) ? k.length : 0), 0) + (t.includes(e.unit.slice(0, 2)) ? 1 : 0)})).filter(x => x.score > 0 && !(broad && !x.e.human)).sort((a, b) => b.score - a.score).map(x => x.e);
  if (broad) hits = INDEX.filter(e => e.human);
  const narrow = hits.filter(e => !broad || e.id !== 'level'), same = hits.filter(e => e.grade === grade), other = hits.filter(e => e.grade !== grade);
  let finding;
  if (!hits.length) finding = `內建的課綱索引裡沒有找到「${t}」（目前只收錄國中七年級自然）。AI 會依它對 108 課綱的了解來編寫，請老師發布前核對範圍。`;
  else if (broad) finding = `「人體的器官」在 ${ALLPUB}都分散在好幾個單元：消化、循環、神經、內分泌、呼吸、排泄排在${GNAME['七上']}（第一冊），${GNAME['七下']}教的是生殖系統。${grade === '七下' ? '所以這份自編教材會當成「七上器官系統的統整複習」，挑最核心的幾個系統來寫。' : ''}`;
  else if (same.length && !other.length) finding = `找到了：${ALLPUB}都把這個主題排在${GNAME[grade]}。`;
  else if (!same.length) finding = `注意：${ALLPUB}把這個主題排在${[...new Set(other.map(e => GNAME[e.grade]))].join('、')}，不在${GNAME[grade]}。教材會依課綱的範圍編寫，可以當成${GRADES.indexOf(grade) > GRADES.indexOf(other[0].grade) ? '複習' : '預習'}教材。`;
  else finding = `這個主題橫跨兩個學期：${GNAME[grade]}有「${same.map(e => e.unit).join('、')}」，其他學期有「${other.map(e => e.unit).join('、')}」。`;
  return {topic: t, grade, subject, broad, hits: hits.slice(0, broad ? 9 : 4), finding, narrowCount: narrow.length};
}
/** The scope block handed to the AI. */
const brief = r => r.hits.length ? r.hits.map(e => `【${e.grade}｜${e.unit}】課綱學習內容：${e.codes.join('；')}。這個年級教到的範圍：${e.scope}`).join('\n') : '（索引沒有資料，請依你對臺灣 108 課綱國中階段的了解，自行界定這個年級的範圍，不要超出國中程度。）';
return {INDEX, GRADES, GNAME, lookup, brief};
})();
