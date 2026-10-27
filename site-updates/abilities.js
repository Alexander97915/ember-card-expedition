'use strict';
// Jobs and charges are serialized with the paused logical battle clock.
const CLASS_SKILLS=[
 ['defense','heavy','shieldbash','siphon','conquest','desperation','soulweapon','execution','cycloneecho','impale','whirlwind','perfectguard','pact','undying','bloodlord'],
 ['quickshot','double','poison','penetrate','aim','rain','phantom','tempo','infinite','eye','toxinburst','elementalarrows','steady','ricochet','venomspread'],
 ['fireball','frostbolt','chain','ignite','skyfire','blackflame','eternalpyre','dragonflame','frostcurse','coldrelease','frostmirror','absolutezero','zerotime','staticcharge','thundercloud','thunderoverload','zeusavatar','resonance','manabarrier','manasiphon','castaccelerate','rockarmor','quakewave','stoneskin','titanarrival','chaincycle','rockwall']
];
CLASS_SKILLS.push(['knightguard','knightslash','knightmend','knightbash','knightvow','knightcounter','knightaegis','knightprayer','knightjudgment','knightavatar','knightrotation','knightreservoir','knightdawnslash','knightredemption','knightresonance','knightcovenant','knightguardian','knighthealer','knightdragon','knightangel','knightremount']);
function registerClassSkills(){
 registerKnightSkills();
 const skill=(name,owner,cost,rarity,icon,desc,extras={})=>({name,owner,cost,rarity,icon,desc,type:'skill',...extras});
 Object.assign(C,{
  chaincycle:skill('雷霆永續',2,2,'epic','ϟ','瞬發；本場閃電鏈消耗改為 0；手牌沒有閃電鏈時生成 1 張。每次手動成功施放閃電鏈後再生成 1 張至手牌（上限 7，滿手不補）；自動重施不補牌；不疊加，戰鬥結束失效',{chainCycle:true,instant:true,school:'thunder'}),
  rockwall:skill('岩壁',2,2,'rare','◆','詠唱 2 秒；岩層 +5（最多 20），全體土 8 傷害。生成 1 座岩壁，抵擋下一次敵方範圍攻擊的全部傷害與命中附帶效果（含多段、坐騎與泰坦）；不擋單體、連鎖或持續傷害。岩壁最多 1 座，保留至本場結束；沿用每實際新增 5 岩層額外自身格擋 +6',{hits:[['earth',8]],earthLayers:5,rockWall:true,school:'earth',area:true,castTime:2000,exactSpellDamage:true,customSpellDesc:true,type:'attack'}),
  rockarmor:skill('岩石護甲',2,1,'uncommon','◈','瞬發；自身格擋 +12、岩層 +4（最多 20）；每層岩層使土元素法術傷害 +5%；每實際新增 5 層岩層，額外自身格擋 +6；岩層保留至本場結束',{block:12,earthLayers:4,instant:true,type:'guard'}),
  quakewave:skill('地震波',2,2,'rare','◆','三重餘震：詠唱 2 秒；首擊全體土 13，之後每秒追加全體土 5，共 2 次（基礎總傷害 23）。有 3 層岩層時只消耗一次，首擊額外暈眩全體 0.8 秒；餘震不追加暈眩。三段共算一次施法、只扣一次費用與資源，沿用首次施法的增傷與鏡像；元素迴響可追擊各段但不再計數',{hits:[['earth',13]],quake:true,quakeAftershocks:true,area:true,castTime:2000,exactSpellDamage:true,customSpellDesc:true,type:'attack'}),
  stoneskin:skill('岩石表皮',2,3,'epic','◈','瞬發；本場進入岩石型態：受到傷害 −40%、無法閃避，普通攻擊不會中斷詠唱；已有泰坦同時獲得減傷，暈眩／凍結仍會中斷',{stoneSkin:true,instant:true}),
  titanarrival:skill('泰坦降臨',2,4,'legendary','◆','詠唱 5 秒；需至少 1 層岩層，完成後消耗全部岩層召喚泰坦；每層 12 HP，重拳土傷害 6＋岩層數／2 秒；全體嘲諷，存活至本場結束；最多 1 隻，新召喚替換舊泰坦',{summonTitan:true,castTime:5000}),
  manabarrier:skill('魔力屏障',2,1,'common','◈','瞬發；全體存活友軍各獲得 12 格擋',{partyBlock:12,instant:true,type:'guard'}),
  manasiphon:skill('魔力汲取',2,1,'uncommon','✦','瞬發；單體無屬性 8 傷害；命中敵人回復 2 能量（上限 5）',{hits:[['none',8]],energyOnHit:2,instant:true,type:'attack'}),
  castaccelerate:skill('詠唱加速',2,1,'common','彡','瞬發；接下來 3 次實際詠唱時間 −50%；每成功完成一次加速詠唱，下一張傷害法術 +20%，最多 3 層（+60%）；瞬發不耗加速次數，輔助不耗增傷；重複施放刷新為 3 次，不影響已開始的詠唱',{castHaste:3,instant:true}),
  defense:skill('防禦姿態',0,1,'common','◈','5 秒減傷 40%、攻速 −20%；護盾 +8；5 秒全體嘲諷，所有敵人的單體攻擊轉向自己',{buff:'stance',duration:5000,block:8,taunt:true,type:'guard'}),
  heavy:skill('破甲重斬',0,1,'common','⚒','下一次普攻基礎傷害 ×250%，附加 2 層流血與破甲 6 秒（後續物理承傷 +10%）；重複施放刷新，不疊加',{charge:'heavy'}),
  siphon:skill('血怒君王',0,1,'uncommon','♥','本場每次敵人受到有效流血跳傷，攻擊力 +2%，最多 20 層（+40%）；滿層每次普攻命中附加 1 層流血；重複施放不重置層數',{warriorPassive:'bloodking'}),
  whirlwind:skill('旋風斬',0,2,'rare','彡','3 秒內每 0.5 秒斬擊所有敵人，共 6 次，各為普攻 100%；首段與末段各附加 1 層流血',{hits:[['slash',4]],job:'whirlwind',type:'attack'}),
  pact:skill('鮮血契約',0,1,'epic','♥','失去 50% 當前生命，向上取整、至少保留 1 HP；本場攻擊力每層 +50%，最多 3 層（+150%），持續至本場結束；每次施放獲得 15 怒氣；戰鬥中存檔保留，下一場清除',{pactPermanent:true}),
  undying:skill('命懸一線',0,2,'legendary','♛','本場所有低血量加成將自身生命視為 1 HP；保留實際生命、受傷與治療正常，不再提供致命保護',{charge:'undying'}),
  quickshot:skill('快速射擊',1,1,'common','彡','本次關卡每次永久增加 20% 普攻攻速，可重複疊加；2 層 +40%、3 層 +60%；與連擊、致命節奏及裝備連動',{permanentQuickshot:true}),
  double:skill('雙重射擊',1,1,'common','➶','接下來 3 次普攻各追加 1 支普通箭；刷新至 3 次',{charge:'double'}),
  penetrate:skill('風裂箭',1,1,'uncommon','➶','下一次普攻首箭貫穿全體，並各附加 100% 攻擊力風傷與 1 層風蝕：受到穿刺傷害 +10%，12 秒；每秒 2 風傷，可疊層，第 2 層起每層風易傷 +5%',{charge:'penetrate'}),
  rain:skill('驟雨連矢',1,2,'rare','➶','蓄力 1 秒後，3 秒內隨機射出 9 箭，每箭 100% 攻擊力；不觸發毒、幻影、連擊、節奏、獵神、元素箭與裝備追擊',{hits:[['pierce',3]],job:'rain',castTime:1000,noOnHit:true,type:'attack'}),
  tempo:skill('致命節奏',1,2,'epic','彡','本場被動：普攻與箭矢卡牌每支實際命中疊 1 層（含分身與追獵箭）；每層攻速 +3%，上限 20，滿層無限箭雨再 +1 箭',{charge:'tempo'}),
  infinite:skill('無限箭雨',1,3,'legendary','➶','詠唱 2 秒；完成後 7.5 秒內普攻額外 +3 箭；6／10 連擊改為 +4／5 箭；致命節奏 20 層再 +1 箭，分身複製所有箭矢',{buff:'infinite',duration:7500,castTime:2000}),
  eye:skill('獵神之眼',1,2,'legendary','◎','詠唱 1 秒；本場每射出 3 支普攻箭矢，額外發射 1 支必定暴擊箭；追加箭不再計數或觸發普攻效果',{charge:'eye',castTime:1000}),
  toxinburst:skill('蝕毒引爆',1,1,'uncommon','☠','引爆目標現有毒素，造成剩餘中毒總傷害，再施加 4 層毒、刷新為 6 秒；原毒素預設全部消耗，瘟疫使徒生效時保留 65% 層數（向下取整）；不暴擊、不觸發普攻效果',{toxinburst:true}),
  elementalarrows:skill('元素箭袋',1,2,'epic','✧','本場每 3 支普攻箭額外射出 1 支隨機火／冰／風箭，100% 攻擊力；火附灼燒 1 層，冰緩速 25%，風附 12 秒風蝕：穿刺增傷 10%、每秒 2 風傷；冰與風蝕第 2 層起每層對應易傷 +5%',{charge:'elementalarrows'}),
  steady:skill('凝神重弓',1,1,'epic','◎','切換重弓模式：開啟時普攻固定初始攻速，每增加 10% 攻速轉為 10% 攻擊力；再次施放關閉、恢復攻速，不消耗已累積的增益，包含快速射擊、連擊、節奏與裝備；減速仍生效',{charge:'steady'}),
  ricochet:skill('迴旋飛矢',1,1,'uncommon','➶','8 秒內普攻向尚未命中的敵人彈射最多 4 次，各為 30% 攻擊力；無新目標即停止，彈射不觸發普攻效果',{buff:'ricochet',duration:8000}),
  venomspread:skill('瘟疫使徒',1,2,'epic','☠','本場被動：毒素上限 20 → 40 層，毒傷 +20%（包含蝕毒引爆）；引爆保留 65% 原層數與毒素儲量（向下取整），再加原有 4 層毒；重施不疊加。施放時瘟疫使者從背後擁抱蒼羽，再化為毒霧消失',{charge:'venomspread'}),
  fireball:skill('火球術',2,1,'common','♨','詠唱 1 秒；單體火 10 傷害，施加 2 層灼燒；4 秒，每層每秒 2 傷害',{hits:[['fire',10]],burnStack:2,castTime:1000,exactSpellDamage:true,school:'fire',customSpellDesc:true,type:'attack'}),
  ignite:skill('引燃',2,1,'uncommon','♨','詠唱 1 秒；完成時消耗目標全部灼燒，每層立即造成火 4 傷害；完成時若為 0 層，改為施加 1 層灼燒、不造成立即傷害',{hits:[['fire',0]],ignite:true,castTime:1000,exactSpellDamage:true,school:'fire',customSpellDesc:true,type:'attack'}),
  skyfire:skill('焚天隕火',2,3,'epic','♨','詠唱 5 秒；消耗全場灼燒，全體火 40 傷害；每消耗 4 層追加 1 顆隕石，每 0.25 秒隨機命中存活敵人，火 12 並施加 1 層灼燒；餘數不產生隕石',{hits:[['fire',40]],skyfire:true,castTime:5000,exactSpellDamage:true,area:true,school:'fire',customSpellDesc:true,type:'attack'}),
  blackflame:skill('黑燄',2,2,'rare','♨','瞬發；對全體敵人釋放黑焰，立即觸發各敵人未來 3 秒內尚未到期的灼燒傷害，不移動原跳傷時間、不消耗層數；所有仍在燃燒的敵人再 +3 層灼燒；提前灼燒不暴擊、不削盾',{hits:[['fire',0]],blackflame:true,area:true,instant:true,school:'fire',type:'attack'}),
  eternalpyre:skill('不滅業火',2,3,'legendary','♨','詠唱 3 秒；本場永續增益：目前與後續敵方灼燒不再自然消失，已有業火時再施放，各燃燒敵人增加目前灼燒層數的 20%（向下取整）再加 3 層；仍可被消耗，下一場重置',{eternalpyre:true,castTime:3000,school:'fire'}),
  dragonflame:skill('龍王業焰',2,3,'legendary','♨','詠唱 4 秒；全體火 24 傷害並施加 10 層灼燒；命中前已在燃燒的敵人獲得 6 秒業焰增殖，每秒 +1 層灼燒並刷新灼燒時間；重複施放刷新，不疊加增殖速度',{hits:[['fire',24]],dragonflame:true,burnStack:10,castTime:4000,exactSpellDamage:true,area:true,school:'fire',customSpellDesc:true,type:'attack'}),
  frostbolt:skill('冰霜箭',2,0,'common','❄','瞬發；單體冰 6 傷害、寒氣 +2，緩速 25%／6 秒；可疊層，第 2 層起每層冰易傷 +5%，減速不疊加',{hits:[['ice',6]],coldGain:2,slow:.25,instant:true,school:'ice',type:'attack'}),
  frostcurse:skill('霜蝕詛咒',2,1,'uncommon','❄','瞬發；單體冰 4、寒氣 +1；目標每種不同的有效負面狀態額外冰傷 +2，同種多層只計一次',{hits:[['ice',4]],coldGain:1,frostcurse:true,instant:true,school:'ice',type:'attack'}),
  coldrelease:skill('寒氣釋放',2,1,'rare','❄','詠唱 2 秒；消耗全部寒氣，對目標射出 1 支冰霜箭；起手寒氣 ≥2 時額外 2 支。每支冰 6、寒氣 +2、減速 25%／6 秒；命中前已緩速的目標凍結 1 秒，首領免疫',{hits:[['ice',6]],coldrelease:true,castTime:2000,exactSpellDamage:true,school:'ice',type:'attack'}),
  frostmirror:skill('霜之鏡',2,2,'rare','❄','詠唱 2 秒；獲得 1 層鏡像，5 秒內下一張傷害法術每層複製一次、傷害 30%；可疊加，鏡像與追加箭不再觸發鏡像。裝備鏡界稜晶杖時：鏡像不再自然到期、複製傷害 45%，每層仍只觸發一次，戰鬥結束清除',{frostmirror:true,castTime:2000,school:'ice'}),
  absolutezero:skill('絕對零點',2,2,'epic','❄','詠唱 1 秒；10 秒內每成功施放一張法師法術，額外發射冰霜箭（冰 6、寒氣 +2、減速）；首次啟動本卡不觸發追加箭，宙斯重施可觸發；鏡像與追加箭不遞迴觸發',{absolutezero:true,castTime:1000,school:'ice'}),
  zerotime:skill('零度時域',2,3,'legendary','❄','詠唱 3 秒；將施放完成當下所有已生效的隊伍卡牌增益延長至本關結束，包含戰士、遊俠、法師與騎士；一次性效果仍會消耗，每場觸發上限不變；不影響未來新增增益、詠唱、定時結算、冷卻或無關敵方異常',{zerotime:true,castTime:3000,school:'ice'}),
  staticcharge:skill('靜電蓄積',2,1,'common','ϟ','瞬發；單體雷 4 傷害，累積 1 層靜電；每層讓下一張傷害法術 +30% 傷害、詠唱 +1 秒，可疊加；本卡不消耗靜電',{hits:[['thunder',4]],staticGain:true,instant:true,school:'thunder'}),
  chain:skill('閃電鏈',2,1,'common','ϟ','瞬發；單體雷 10，額外彈射最多 2 個不同敵人，每次造成首段傷害的 50%，不重複命中',{hits:[['thunder',10]],chain:true,chainLimit:3,bounceRatio:.5,bounceOriginal:true,instant:true,school:'thunder'}),
  thundercloud:skill('雷雲標記',2,2,'rare','ϟ','詠唱 3 秒；單體雷 12 傷害並標記 6 秒；標記敵人受到雷傷害時，額外 1 個存活目標承受 30% 傷害；轉傷不遞迴',{hits:[['thunder',12]],castTime:3000,exactSpellDamage:true,thunderMark:6000,school:'thunder'}),
  thunderoverload:skill('雷光超載',2,2,'epic','ϟ','瞬發；10 秒內所有法術免詠唱（含靜電延長），法術傷害 −25%；不影響已開始的詠唱，重複施放刷新持續時間',{instant:true,overload:true,school:'thunder'}),
  zeusavatar:skill('宙斯化身',2,3,'legendary','ϟ','詠唱 3 秒；本場每成功施放第 2 張法術，免費重複一次，傷害為 40%、輔助效果照常；沿用首次消耗資源的結算，不再扣資源；重複施法不再計數、不消耗能量或靜電，重複使用本卡不重置計數',{castTime:3000,zeus:true,school:'thunder'}),
 });
 registerWarriorSkills();
 registerCriticalGear();if(typeof registerMageGear==='function')registerMageGear();
 // Explicit spell shapes: aimed spells, limited chain, and true area magic.
 const areaSpells=new Set(['skyfire','dragonflame','grand','blizzard','storm','cataclysm','quakewave','rockwall']);
 for(const [key,c]of Object.entries(C))if(c.owner===2&&c.hits?.length){c.area=areaSpells.has(key);if(c.area&&!c.desc.startsWith('全體'))c.desc='全體範圍：'+c.desc;else if(!c.area&&!c.chain)c.desc='單體：'+c.desc}
 C.whirlwind.area=true;
 C.poison.name='毒箭';
 C.aim.desc='8 秒內暴擊率 +25%、暴擊傷害 +40%（150% → 190%）；刺箭逐支判定';
 C.resonance.desc='10 秒內交替使用不同元素時，下一次法術傷害 +40%；強化可跨支援卡保留';
 GEAR.huntCharm.desc='集中瞄準期間額外暴擊率 +10%、暴擊傷害 +50%；刺箭逐支判定';
 BUILDS.find(b=>b.name==='暴擊狙擊').desc='集中瞄準提升暴擊 → 獵神之眼每三箭追加暴擊箭 → 暴擊裝備放大傷害';
 BUILDS.find(b=>b.name==='暴擊狙擊').cards=['aim','eye','penetrate'];
 const links={bloodAxe:['siphon','whirlwind','pact'],thornArmor:['defense','siphon'],bloodCrown:['siphon','pact','undying'],rageCharm:['pact','undying'],windBow:['quickshot','tempo'],moonBow:['volley','rain'],starBow:['volley','rain'],venomBow:['double','infinite','volley','rain'],mirrorBow:['infinite','double','volley','rain'],pursuitBow:['rain','tempo','volley'],huntCharm:['eye','penetrate'],emberStaff:['fireball','ignite','blackflame','skyfire','dragonflame','cataclysm'],echoStaff:['frostmirror','coldrelease','quakewave','fireball','blackflame','skyfire'],crownStaff:['skyfire','dragonflame','cataclysm'],splitStaff:['fireball','ignite','skyfire'],frostArmor:['melt','frostbolt'],stormCharm:['staticcharge','chain','thundercloud'],fusionCharm:['melt','cataclysm']};
 for(const [k,list]of Object.entries(links))GEAR_LINKS[k]=[...new Set([...(GEAR_LINKS[k]||[]),...list])];
 const fireBuild=BUILDS.find(b=>b.name==='燃燒爆破');fireBuild.cards=['fireball','ignite','blackflame','eternalpyre','dragonflame','skyfire'];fireBuild.desc='疊加灼燒 → 黑燄提前跳傷 → 不滅保存／龍焰增殖 → 引燃單體與隕火全場消耗';
 BUILDS.push({owner:0,name:'旋風血刃',cards:['whirlwind','siphon','pact'],gear:['bloodAxe','bloodCrown'],desc:'持續全體斬擊 → 裝備吸血 → 溢出化盾 → 契約提高傷害'},
 {owner:1,name:'極限攻速',cards:['quickshot','tempo','infinite'],gear:['windBow','pursuitBow'],desc:'攻速疊層 → 額外箭矢 → 連擊與追獵連鎖'},
 {owner:2,name:'永恆鏡界',cards:['frostmirror','quakewave','coldrelease'],gear:['echoStaff'],desc:'準備不會自然到期的霜之鏡 → 下一張傷害法術複製 45% → 每層消耗一次，多段沿用同次鏡像'},
 {owner:2,name:'連鎖雷電',cards:['staticcharge','chain','chaincycle','thundercloud','thunderoverload','zeusavatar'],gear:['starStaff','stormCharm'],desc:'疊加靜電 → 雷雲轉傷 → 超載瞬發 → 宙斯免費重施'});
}
function abilityState(id){if(id==null)return {};s.auto.skills??={};return s.auto.skills[id]??={}}
function migrateClassSkills(t){t.skillRevision=1}
function initAbilities(){s.auto.jobs??=[];s.auto.skills??={};for(const p of s.party)abilityState(p.id)}
function prepareSkillHits(c,options={card:c,tactical:true}){if(c.knightExactDamage){c.damageTrace=[];damageTraceStep(c.damageTrace,c.knightStarSpear?'貫星聖槍 · 完整攻擊力 ×130% ×蓄星':'聖槍 · 完整攻擊力 ×160%',c.hits);return c.hits.map(h=>[...h])}if(c.execution)return warriorExecutionHits(c);c.damageTrace=[];damageTraceStep(c.damageTrace,'技能基礎',c.hits||[],c.coldrelease?'消耗 '+c.coldSpent+' 點寒氣，發射 '+c.releaseArrowCount+' 支冰霜箭':c.igniteSpent!=null?'消耗 '+c.igniteSpent+' 層灼燒，每層 ×4':'');const base=(c.hits||[]).map(([a,n])=>[a,c.grandMagic&&s.auto.runes.length===3?n*2:n]);damageTraceStep(c.damageTrace,'大魔法加成',base);let raw=resourceAttackHits(base,c.owner,options);if(c.owner===1)raw=rangerCardHits(c,raw);damageTraceStep(c.damageTrace,'職業資源',raw);const skills=skillAttackHits(raw,c.owner,options);damageTraceStep(c.damageTrace,'技能與元素連動',skills,options.elementAmplifier&&options.elementAmplifier!==1?'元素連動 ×'+journalNumber(options.elementAmplifier)+'，向下取整':'');const final=gearAttackHits(skills,c.owner,c).concat(options.resourceHits||[]);damageTraceStep(c.damageTrace,'裝備與追加段數',final);return final}
function abilityMelt(hits,c,e){const p=s.party[slotOf(c.owner)];if(c.owner!==2||!c.hits?.some(h=>h[0]==='fire'))return hits;
 const frozen=e.status.freezeUntil>s.auto.clock,slowed=Math.max(e.status.slowUntil||0,e.status.chillUntil||0)>s.auto.clock;
 const amp=Math.max(frozen?Math.max(buffActive(p,'melt')?2:1,hasGearEffect(2,'fusion')?1.8:hasGearEffect(2,'deepFreeze')?1.5:1):1,slowed&&hasGearEffect(2,'deepFreeze')?1.2:1);
 if(amp<=1)return hits;if(amp>1)log('冰火連動：火焰法術 ×'+amp+'。');return hits.map(([a,n])=>[a,Math.floor(n*(frozen||a==='fire'?amp:1))]);
}
function impactSkill(c,hits,targets,trackResource=true){let sum=0,actual=0,shieldHits=0,newBreak=false,hitCount=0;const targetHits=[];const state=abilityState(c.owner),leech=0;
 for(let i=0;i<targets.length;i++){const e=targets[i];if(e.hp<=0)continue;withEnemy(e,()=>{const trace=(c.damageTrace||[]).map(t=>({...t,hits:t.hits.map(h=>[...h])}));damageTraceStep(trace,'命中前',hits);let out=hits.map(h=>[...h]);if(c.detonate&&e.status.burnUntil>s.auto.clock){const st=e.status,ticks=Math.max(0,Math.floor((st.burnUntil-(st.burnAt||s.auto.clock))/1000)+1);out[0][1]+=Math.floor(ticks*(st.burnDamage||0)*2*(c.targetSpellAmp||1))}damageTraceStep(trace,'灼燒引爆',out);out=frostHitDamage(c,out,e,i,targets.length);damageTraceStep(trace,'負面狀態加成',out,c.frostcurse?'有效負面狀態 '+debuffKinds(e)+' 種，每種基礎 +2':'');out=abilityMelt(out,c,e);damageTraceStep(trace,'融化增幅',out);if(c.chain)out=out.map(([a,n])=>[a,Math.max(1,Math.floor(n*(c.bounceOriginal?(i===0?1:c.bounceRatio||.5):(c.bounceRatio||.75)**i)))]);if(c.chain)damageTraceStep(trace,'雷電連鎖',out,'第 '+(i+1)+' 名目標，倍率 '+journalNumber(c.bounceOriginal?(i===0?1:c.bounceRatio||.5):(c.bounceRatio||.75)**i)+'，逐段向下取整（最低 1）');if(c.freeEcho)out=out.map(([a,n])=>[a,Math.floor(n)]);if(c.execution&&e.hp/e.max<.3){out=out.map(([a,n])=>[a,n*1.5]);damageTraceStep(trace,'低血處刑 ×1.5',out,'命中前目標生命低於 30%')}if(c.knightStoredLight){const share=Math.floor(c.knightStoredLight/targets.length)+(i<c.knightStoredLight%targets.length?1:0);if(share>0)out.push(['light',share]);damageTraceStep(trace,'聖輝蓄積',out,'蓄光 '+c.knightStoredLight+' 分配給 '+targets.length+' 名敵人，本目標追加光 '+share)}const result=damageEnemy(out,c.owner,{preparedHits:out,skipResource:true,lifesteal:leech,card:c,ignoreStrength:!!c.freeEcho||!!c.execution||!!c.knightExactDamage,trace});if(typeof mageAfterDirectHit==='function')mageAfterDirectHit(c,e,result);if(typeof gearBalanceStormHit==='function')gearBalanceStormHit(c,e,result);if(result.actual)hitCount=Math.max(hitCount,out.filter(h=>h[0]==="pierce").length||out.length);targetHits.push({id:e.id,damage:result.damage,actual:result.actual,shieldHits:result.shieldHits,newBreak:result.newBreak,criticalHits:result.criticalHits});sum+=result.damage;actual+=result.actual;shieldHits+=result.shieldHits;newBreak ||=result.newBreak;mirrorHitCopies(c,result.resolvedHits||out,e);if(c.knightSpear&&result.actual>0){e.status.knightSpearShredUntil=s.auto.clock+5000;knightRecordOathFX(e,'knightslash')}if(c.knightStarSpear&&result.actual>0)knightRecordOathFX(e,'knightresonance');applyStatus(c);if(typeof mageGearAfterHit==='function')mageGearAfterHit(c,e,result);frostHitStatus(c,e);if(c.thunderMark)e.status.thunderMarkUntil=s.auto.clock+c.thunderMark;skillAfterCard(c)})}
 // Blood King is a persistent bleed-driven passive, not a one-hit charge.
 if(!c.noOnHit&&trackResource)resourceAfterHit(c.owner,{card:c,sourceHits:c.hits||[],hitCount},actual);else if(!c.noOnHit&&c.owner===1&&actual)gainRangerTempo(Math.min(3,Math.max(1,hits.length)));
 if(livingEnemies().length!==enemyRoster().length)victory();
 return {damage:sum,shieldHits,newBreak,targetHits};
}
function castClassSkill(i,origin=null){const k=s.hand[i],c=bindFrostCast(bindLightningCast({...C[k],key:k}));if(typeof magePaySpell==='function')magePaySpell(c);s.energy-=c.paidCost??c.cost;s.hand.splice(i,1);s.discard.push(k);
 if(c.castTime){startSpellCasting(c,origin);return}resolveClassSkill(c,origin);
}
function resolveClassSkill(c,origin=null,completedCast=false){
 if(c.warriorExpansion)return resolveWarriorExpansion(c,origin);const k=c.key,p=s.party[slotOf(c.owner)],state=abilityState(c.owner),now=s.auto.clock,enemyId=s.enemy.id;
 if(c.owner===3)prepareKnightSkill(c,p,state);if(typeof mageGearPrepareCast==='function')mageGearPrepareCast(c);if(typeof frontlinePrepare==='function')frontlinePrepare(c);
 if(c.freeEcho)prepareEchoSkill(c);else{prepareEarthSkill(c);prepareFrostSpell(c);prepareFireSpell(c)}
 if(typeof magePreparePassives==='function')magePreparePassives(c);prepareAcceleratedSpell(c);
 if(c.pactPermanent){const old=heroInterval(p.id),lost=Math.max(0,Math.min(p.hp-1,Math.ceil(p.hp*.5)));p.hp-=lost;p.pactStacks=Math.min(3,(p.pactStacks||0)+1);gainRage(15);rescaleHeroAttack(p,old);log('鮮血契約：失去 '+lost+' 生命，本場攻擊力 +'+p.pactStacks*50+'%，持續至本場結束。')}
 // Snapshot attack modifiers once per cast; each target still resolves its own shields and melt.
 // Prepare all three earthquake stages together so consumable amplifiers run once.
 if(c.quakeAftershocks&&!c.freeEcho){const base=typeof mageGearQuakeBase==='function'?mageGearQuakeBase():5;c.hits=[...c.hits,['earth',base],['earth',base]];}
 const preparation={card:c,tactical:true};const beforeAmp=(c.freeEcho?c.echoHits:c.blackflame?[]:c.job==='rain'?resourceAttackHits(c.hits,c.owner,{card:c}):prepareSkillHits(c,preparation));const hits=beforeAmp.map(([a,n])=>[a,c.freeEcho?n:Math.max(1,Math.floor(n*(c.spellAmp||1)*(a==='earth'?(c.earthDamageAmp||1):1)))]);c.damageTrace??=[];damageTraceStep(c.damageTrace,c.freeEcho?'共鳴複製傷害':'增幅前',beforeAmp,c.freeEcho?'原法術各段（含力量） ×0.4，命中時取整，不重加力量':'');damageTraceStep(c.damageTrace,'施法與岩層增幅',hits,'傷害 ×'+journalNumber(c.spellAmp||1)+(hits.some(([a])=>a==='earth')?'；土傷 ×'+journalNumber(c.earthDamageAmp||1):'')+'，逐段向下取整（最低 1）');c.targetSpellAmp=c.freeEcho?(c.targetSpellAmp||1)*.4:(preparation.elementAmplifier||1)*(c.castTime&&!c.exactSpellDamage?1.3:1)*(c.spellAmp||1);if(preparation.resourceStun)c.stun=Math.max(c.stun||0,preparation.resourceStun);let result={damage:0,shieldHits:0,newBreak:false};
 if(c.quakeAftershocks){if(!c.freeEcho){c.quakeAftershockHits=hits.splice(1,2);c.hits=c.hits.slice(0,1)}queueQuakeAftershocks(c);}
 if(c.job&&!(c.job==='meteor'&&completedCast)){let jobs=[];
  if(c.job==='whirlwind')for(let n=1;n<=6;n++)jobs.push({due:now+n*500,hits,bleedStack:n===1||n===6?1:0});
  if(c.job==='rain')for(let n=1;n<=9;n++)jobs.push({due:now+n*1000/3,hits:gearAttackHits(c.hits,c.owner,null),random:true,trackResource:false});
  if(c.job==='meteor')jobs.push({due:now+2000,hits});
  if(c.job==='cataclysm')for(let n=1;n<=9;n++){const attr=['fire','ice','thunder'][Math.floor((n-1)/3)];jobs.push({due:now+n*1000,hits:hits.filter(h=>h[0]===attr),attr})}
  s.auto.jobs.push(...jobs.map(j=>({...j,key:k,owner:c.owner,damageTrace:c.damageTrace,mirrorCount:c.mirrorCount||0,mirrorRatio:frostMirrorRatio(c),freeEcho:!!c.freeEcho,elementEcho:!!c.elementEcho,mageDirectAmp:c.mageDirectAmp||1,spellAmp:c.spellAmp||1,resourceStun:preparation.resourceStun||0})));log(c.name+'：施法完成，等待分段命中。');
 }else if(c.toxinburst){result=rangerToxinBurst(s.enemy)}else if(c.blackflame){result=blackflameImpact(c)}else if(hits.length){const formation=c.chain?[...livingEnemies().filter(e=>e.id===s.enemy.id),...livingEnemies().filter(e=>e.id!==s.enemy.id)]:livingEnemies(),targets=c.area?formation:c.chain?formation.slice(0,c.chainLimit||4):[s.enemy];result=impactSkill(c,hits,targets)}
 if(c.owner===3)knightAfterSkill(c,result);if(c.draw)draw(c.draw);if(c.partyBlock)alive().forEach(j=>s.party[j].block+=c.partyBlock);if(c.heal)healTarget(c.heal,s.party[s.selected]?.hp>0?s.selected:undefined,c.owner);if(c.healSelf)healTarget(c.healSelf,slotOf(c.owner),c.owner);if(c.block||c.extraEarthBlock)p.block+=(c.block||0)+(c.extraEarthBlock||0);if(c.taunt){s.taunt=false;for(const e of livingEnemies())e.target=slotOf(c.owner)}
 if(['elementalarrows','steady','venomspread'].includes(c.charge)){const old=heroInterval(c.owner);state[c.charge]=c.charge==='steady'?!state.steady:true;rescaleResourceAttack(p,old)}
 if(c.warriorPassive){const old=heroInterval(0);if(c.warriorPassive==='soulweapon'&&state.soulweapon){state.soulLeechStacks=(state.soulLeechUntil>now?state.soulLeechStacks||0:0)+1;state.soulLeechUntil=Math.max(state.soulLeechUntil||0,now+8000);}state[c.warriorPassive]=true;rescaleHeroAttack(p,old);}
 if(c.shieldScale&&result.targetHits?.some(h=>h.actual>0)){const gain=state.shieldGrowth||0;p.block+=gain;state.shieldGrowth=gain+2;if(gain)log('護盾打擊：護盾 +'+gain+'；下次 +'+state.shieldGrowth+'。');}
 if(c.charge==='heavy')state.heavy=true;if(c.charge==='double')state.double=3;if(c.charge==='penetrate')state.penetrate=true;
 if(c.charge==='thunder')state.thunder=5;if(c.charge==='tempo'){state.tempo=true;state.tempoStacks??=0}if(c.charge==='eye'){state.eye=true;state.eyeAttacks??=0}if(c.charge==='undying'){const old=heroInterval(p.id);state.undying=true;rescaleHeroAttack(p,old);}
 if(c.castHaste){state.castHasteCharges=c.castHaste;delete state.nextCastReduction;}
 if(c.energyOnHit&&result.targetHits?.length){s.energy=Math.min(5,s.energy+c.energyOnHit);log('魔力汲取：命中敵人，回復 '+c.energyOnHit+' 能量。')}
 if(c.owner===0&&c.hits?.length&&!c.freeEcho)gainRage(10);
 lightningEffects(c);frostEffects(c);fireEffects(c,hits.slice(0,hits.length-(preparation.resourceHits||[]).length));activateMageLegendaryForm(c);if(typeof mageGearAfterSpell==='function')mageGearAfterSpell(c,result);afterMageSpell(c,hits);const bonus=afterFrostSpell(c);if(bonus?.damage){c.extraIce=true;if(!result.damage)c.sceneAttr='ice';result.damage+=bonus.damage;result.shieldHits+=bonus.shieldHits;result.newBreak ||=bonus.newBreak;result.targetHits??=[];for(const hit of bonus.targetHits||[]){const old=result.targetHits.find(x=>x.id===hit.id);if(old){old.damage+=hit.damage;old.actual+=hit.actual;old.criticalHits+=hit.criticalHits}else result.targetHits.push(hit)}}
 completeAcceleratedSpell(c,completedCast);
 applyCardExtras(c,true);const unlocked=c.freeEcho?false:updateBond(c);log(ownerLabel(c)+'使出「'+c.name+'」'+(result.damage?'，'+result.damage+' 傷害':'')+'。');
 if(c.freeEcho&&typeof recordMageSkillReplay==='function'){recordMageSkillReplay(c,result,'zeus');return;}
 if(completedCast&&c.summonTitan&&c.titanSummoned)animateCard(c,result.damage,result.newBreak,unlocked,enemyId,origin,result.targetHits||[]);else if(completedCast)animateAuto({kind:'attack',auto:true,enemyId,owners:[c.owner],cardName:c.name,cardEffect:c,damage:result.damage,targetHits:result.targetHits||[],isBreak:result.newBreak,attr:c.hits?.[0]?.[0]||'fire',support:!result.damage,duration:400});else animateCard(c,result.damage,result.newBreak,unlocked,enemyId,origin,result.targetHits||[]);
}
function tickAbilities(){const now=s.auto.clock,jobs=s.auto.jobs||[],due=jobs.filter(j=>j.due<=now).sort((a,b)=>a.due-b.due);if(!due.length)return false;s.auto.jobs=jobs.filter(j=>j.due>now);
 for(const job of due){if(s.phase!=='battle')break;const base=C[job.key];if(!base)continue;const c={...base,mageGearDelayed:true,damageTrace:job.damageTrace,hits:job.hits,mirrorCount:job.mirrorCount||0,mirrorRatio:job.mirrorRatio,freeEcho:!!job.freeEcho,elementEcho:!!job.elementEcho,mageDirectAmp:job.mageDirectAmp||1,spellAmp:job.spellAmp||1,cycloneEcho:!!job.cycloneEcho};if(job.quakeAftershock){c.quakeAftershock=true;c.name='地震波 · 餘震 '+job.quakeStage+'/2';c.stun=0;delete c.quakeAftershocks;}if(job.cycloneEcho)c.name='旋風共振';if(job.bleedStack&&!job.cycloneEcho)c.bleedStack=job.bleedStack;if(job.fireMeteor){c.fireMeteor=true;delete c.skyfire;c.burnStack=1;if(job.remaining>1)s.auto.jobs.push({...job,remaining:job.remaining-1,due:now+250})}if(job.resourceStun)c.stun=Math.max(c.stun||0,job.resourceStun);if(job.attr==='fire')c.burnStack=2;if(job.attr==='ice'){c.slow=.35;c.freeze=800}if(job.attr==='thunder')c.stun=1000;
  const live=livingEnemies(),targets=job.random&&live.length?[live[Math.floor(Math.random()*live.length)]]:live;if(!targets.length)continue;
  const resolved=job.random&&!job.fireMeteor&&!base.noOnHit?gearAttackHits(skillAttackHits(rangerCardHits(base,job.hits,{comboBonus:job.trackResource!==false}),job.owner,{card:base}),job.owner,null):job.hits;const result=impactSkill(c,resolved,targets,!base.noOnHit&&(job.owner===1||!!job.trackResource));queueWarriorCycloneEcho(job);log(c.name+(job.attr?' · '+ATTR[job.attr].name:'')+'命中 '+targets.length+' 敵人，'+result.damage+' 傷害。');
  if(s.phase==='battle'||job.owner===0&&['reward','win'].includes(s.phase))animateAuto({kind:'attack',auto:true,enemyId:targets[0].id,owners:[job.owner],secondary:job.owner===2,cardEffect:{...c,key:job.key},cardName:c.name,damage:result.damage,targetHits:result.targetHits,isBreak:result.newBreak,attr:job.hits[0]?.[0]||'fire',duration:job.random?120:240});
 }
 if(s.phase!=='battle')s.auto.jobs=[];return true;
}
function abilityBasicHits(p,hits){const state=abilityState(p.id);let out=hits.map(h=>[...h]);
 if(state.heavy){out=out.map(([a,n])=>[a,Math.ceil(n*2.5)]);state.heavy=false}
 if(p.id===1){if(state.double>0){out.push(['pierce',AUTO_BASIC[1].damage]);state.double--}if(buffActive(p,'infinite'))out.push(...Array.from({length:rangerInfiniteArrows()},()=>['pierce',AUTO_BASIC[1].damage]));


 }
 if(p.id===2&&state.thunder>0){out.push(['thunder',4]);state.thunder--}return out;
}
function abilityTags(p){const warrior=p.id===0?warriorTags():'';const state=abilityState(p.id),parts=[],tag=(key,text)=>parts.push([key,text]);if(p.id===3){if(knightTauntActive())tag('knightguard','挑釁 · 減傷 20% · '+buffDurationLabel(state.taunt.until));if(state.knightPath)tag(knightMountCard(state.knightPath)||'knight'+state.knightPath,'路線：'+knightPathName(state.knightPath));const mount=livingKnightMount();if(mount?.kind==='dragon'&&state.knightPath==='dragon'){tag('knightdragon','龍槍／龍息 '+(state.dragonBasics||0)+'/3');tag('knightdragon','龍息 '+(state.dragonBreathStacks||0)+'/5 · 傷害 +'+((state.dragonBreathStacks||0)*10)+'%')}if(mount?.kind==='elephant'){tag('knightreservoir','踐踏 '+(mount.basics||0)+'/3');tag('knightreservoir','巨獸守護 '+(mount.guardHits||0)+'/3'+((state.beastGuardAt||0)>s.auto.clock?' · 冷卻 '+Math.ceil((state.beastGuardAt-s.auto.clock)/1000)+' 秒':''))}if(mount?.kind==='horse')tag('knightremount',!mount.basics?'騎槍衝鋒就緒 · 主擊 150%／嘲諷 2 秒':'騎槍衝鋒 '+((mount.basics-1)%3)+'/3 · 攻速 +15%');if(mount?.tauntHasteUntil>s.auto.clock)tag('knightguard','斑龍攻速 +25% · '+buffDurationLabel(mount.tauntHasteUntil));if(mount?.kind==='rhino')tag('knightrotation','鐵甲衝撞 · 普攻計數 '+(mount.basics||0));if(mount?.kind==='allosaur')tag('knightdawnslash','獵主 '+(mount.huntStacks||0)+'/10 · 攻速 +'+((mount.huntStacks||0)*8)+'%');if(mount?.kind==='griffin')tag('knightavatar',mount.diveReady?'俯衝突擊就緒 · 主擊 150%':'飛行 · 閃避 20%');if(state.knightResonance)tag('knightresonance','聖劍共鳴 '+(state.knightCycle||0)+'/3')}if(abilityState(3).redemption?.[p.id]>s.auto.clock)tag('knightredemption','救贖保命 · '+buffDurationLabel(abilityState(3).redemption[p.id]));else if(abilityState(3).redemptionUsed?.[p.id])tag('knightredemption','救贖已觸發 · 本場已用盡');if(p.id===3&&knightDuelActive())tag('knightvow','榮耀決鬥 · '+buffDurationLabel(state.knightDuel.until));if(p.id===3&&state.knightVengeance)tag('knightcounter',(state.vengeanceStacks>=5?'復仇覺醒':'復仇')+' '+(state.vengeanceStacks||0)+'/5 · 攻擊 +'+((state.vengeanceStacks||0)*8)+'%');if(state.heavy)tag('heavy','破甲重斬就緒 · 流血 2 層');if(state.double)tag('double','雙重箭 '+state.double+' 次');if(state.penetrate)tag('penetrate','風裂就緒');if(state.thunder)tag('charge','附雷 '+state.thunder+' 次');if(state.tempo)tag('tempo','節奏 '+(state.tempoStacks||0)+'/20 · 攻速 +'+((state.tempoStacks||0)*3)+'%');if(state.eye)tag('eye','獵神 '+(state.eyeArrows||0)%3+'/3');if(state.elementalarrows)tag('elementalarrows','元素箭袋 '+(state.elementArrows||0)%3+'/3');if(state.steady)tag('steady','固定攻速 · 攻擊 +'+Math.round((rangerSpeedBonus()-1)*100)+'%');if(state.venomspread)tag('venomspread','瘟疫使徒 · 毒上限 40 · 毒傷 +20% · 引爆留 65%');if(state.undying)tag('undying','命懸一線 · 低血判定 1 HP');if(state.resonanceReady&&buffActive(p,'resonance'))tag('resonance','共鳴強化就緒');if(state.castHasteCharges)tag('castaccelerate','加速 '+state.castHasteCharges+' 次 · 詠唱 −50%');if(state.nextSpellBoost)tag('castaccelerate','下張傷害法術 +'+state.nextSpellBoost*20+'%');return warrior+knightOathTags(p)+parts.map(([key,text])=>`<small class="buff-tag">${skillIconHTML(key)}${text}</small>`).join('')}

function abilityJobsHTML(){const jobs=s.auto.jobs||[],keys=[...new Set(jobs.map(j=>j.key))];const notice=s.auto.castNotice?.until>s.auto.clock?`<span class="cast-interrupted" role="status">${s.auto.castNotice.text}</span>`:'';return keys.length||notice?`<div id="skill-queue" class="ability-jobs">${notice}${keys.map(k=>{const list=jobs.filter(j=>j.key===k),ms=Math.max(0,Math.min(...list.map(j=>j.due))-s.auto.clock);return `<span>${skillIconHTML(k)} ${C[k].name} · ${list.reduce((n,j)=>n+(j.remaining||1),0)} 段待發 · ${(ms/1000).toFixed(1)}s</span>`}).join('')}</div>`:''}
function showSkillBook(id=0){modal(`<div class="eyebrow">CLASS SKILLS · ${CLASS_SKILLS.flat().length}</div><h2>職業技能圖鑑</h2><p>選擇職業查看卡牌。戰鬥規則請查閱 <button class="wiki-inline" onclick="showGameEncyclopedia('combat')">遊戲百科 →</button></p><div class="gear-tabs">${HEROES.map((h,i)=>`<button class="${i===id?'active':''}" onclick="showSkillBook(${i})">${h.job}</button>`).join('')}</div><div class="skill-book">${CLASS_SKILLS[id].map(k=>`<article class="rarity-${C[k].rarity}"><span class="skill-book-art">${skillIconHTML(k)}</span><div><h3>${C[k].name} <small>${cardRarity(k)} · ${C[k].cost} 能量${s.deck.includes(k)?' · 已擁有':''}</small></h3><p>${C[k].desc}</p>${cardGearHint(k)}</div></article>`).join('')}</div><button onclick="showBuilds(${id})">技能 × 裝備流派 →</button>`)}

// Extra arrows are built once, then copied once by phantom. No recursion.
function rangerInfiniteArrows(){const combo=classResource(1)?.combo||0,tempo=abilityState(1);return 3+(combo>=10?2:combo>=6?1:0)+(tempo.tempo&&(tempo.tempoStacks||0)>=20?1:0)}
function rangerPhantomRatio(){const mirror=hasGearEffect(1,'mirror'),combo=classResource(1)?.combo||0;return combo>=10?(mirror?.9:.75):(mirror?.75:.5)}
function gainRangerTempo(n){const p=s.party[slotOf(1)],state=abilityState(1);if(!p||p.hp<=0||!state.tempo)return;const old=heroInterval(1);state.tempoStacks=Math.min(20,(state.tempoStacks||0)+Math.max(0,n));rescaleResourceAttack(p,old)}

// One expansion per real arrow action. Pursuit is appended later and never recurses.
function rangerCardHits(c,hits,options={}){const p=s.party[slotOf(c.owner)];if(c.owner!==1||!p||p.hp<=0||!hits.some(h=>h[0]==='pierce'))return hits.map(h=>[...h]);const base=options.comboBonus===false?hits:resourceBasicHits(p,hits);return skillBasicHits(p,gearBasicHits(p,base,{card:true}))}

// Ranger proc arrows are resolved once, with no basic-hit, gear or resource recursion.
function rangerSpeedBonus(){const p=s.party[slotOf(1)];return Math.max(1,(buffActive(p,'haste')?1.7:1)*quickshotSpeed(p)*gearSpeed(1)*skillSpeed(p)*resourceSpeed(p))}
function rangerAttackPower(){return AUTO_BASIC[1].damage+gearBonus(1,'attack')}
function rangerMergeHit(result,targets,e,hit){result.damage+=hit.damage;result.shieldHits+=hit.shieldHits;result.newBreak ||=hit.newBreak;result.criticalHits=(result.criticalHits||0)+(hit.criticalHits||0);const old=targets.find(t=>t.id===e.id);if(old){old.damage+=hit.damage;old.criticalHits=(old.criticalHits||0)+(hit.criticalHits||0);old.newBreak ||=hit.newBreak}else targets.push({id:e.id,damage:hit.damage,criticalHits:hit.criticalHits,newBreak:hit.newBreak})}
function rangerProcArrow(e,attr,ratio,result,targets,extra={}){if(!e||e.hp<=0)return;withEnemy(e,()=>{const hits=[[attr,rangerAttackPower()*ratio]],hit=damageEnemy(hits,1,{preparedHits:hits,skipResource:true,noOnHit:true,...extra});rangerMergeHit(result,targets,e,hit)})}
function rangerAfterBasic(arrows,enemyId,result,targets,ricochetFlight=null){const state=abilityState(1),p=s.party[slotOf(1)],target=()=>livingEnemies().find(e=>e.id===enemyId)||livingEnemies()[0];
 if(state.eye){const old=state.eyeArrows||0;state.eyeArrows=old+arrows;for(let i=0;i<Math.floor(state.eyeArrows/3)-Math.floor(old/3);i++)rangerProcArrow(target(),'pierce',1,result,targets,{guaranteedCrit:true,vfxKey:'eye',label:'獵神暴擊箭'})}
 if(state.elementalarrows){const old=state.elementArrows||0;state.elementArrows=old+arrows;for(let i=0;i<Math.floor(state.elementArrows/3)-Math.floor(old/3);i++){const e=target();if(!e)break;const attr=['fire','ice','wind'][Math.floor(Math.random()*3)];rangerProcArrow(e,attr,1,result,targets,{vfxKey:'elementalarrows',vfxAttr:attr,label:'元素箭袋'});withEnemy(e,()=>{if(attr==='fire')addBurnStacks(e,1,1);if(attr==='ice')applyStatus({owner:1,slow:.25});if(attr==='wind')applyWindErosion(e)})}}
 if(ricochetFlight){ricochetFlight.arrows=arrows;ricochetFlight.targets=livingEnemies().filter(e=>e.id!==enemyId).slice(0,4).map(e=>e.id)}
}
function rangerPoisonTicks(st){return st.poisonUntil>=s.auto.clock&&st.poisonAt!=null?Math.max(0,Math.floor((st.poisonUntil-Math.max(s.auto.clock,st.poisonAt))/1000)+1):0}
function rangerPoisonDamage(raw){return Math.max(0,Math.floor(raw*(abilityState(1).venomspread?1.2:1)+1e-9))}
function rangerPoisonRemaining(e){const st=e.status,ticks=rangerPoisonTicks(st);let reserve=st.poisonUntil>=s.auto.clock?st.poisonReserve||0:0,total=0;for(let remaining=ticks;remaining>0;remaining--){const share=Math.floor(reserve/remaining);reserve-=share;total+=rangerPoisonDamage((st.poisonStacks||0)+share)}return total}
function rangerPoisonReserveTick(st){const ticks=Math.max(1,Math.floor((st.poisonUntil-(st.poisonAt-1000))/1000)+1),amount=Math.floor((st.poisonReserve||0)/ticks);st.poisonReserve=Math.max(0,(st.poisonReserve||0)-amount);return amount}
function rangerPoisonPulse(e,amount,label){const before=e.hp,n=applyEnemyLifeDamage(e,amount);countBattleStat('damage',n,1);if(n>0&&typeof recordRangerPoisonVFX==='function')recordRangerPoisonVFX(e,label);recordPeriodicDamage(e,1,label,amount,amount,n,before,false,'毒素剩餘傷害；不暴擊、不觸發普攻效果');return {damage:n,actual:n,shieldHits:0,newBreak:false,criticalHits:0}}
function rangerToxinBurst(e){const amount=rangerPoisonRemaining(e),st=e.status,active=st.poisonUntil>=s.auto.clock,original=active?st.poisonStacks||0:0,keep=!!abilityState(1).venomspread;
 st.poisonStacks=keep?Math.floor(original*.65):0;st.poisonReserve=keep&&active?Math.floor((st.poisonReserve||0)*.65):0;if(!st.poisonStacks&&!st.poisonReserve){st.poisonUntil=0;st.poisonAt=0}delete st.toxinBurstDeath;delete st.poisonDeathBudget;
 const hit=rangerPoisonPulse(e,amount,'蝕毒引爆');if(e.hp>0){withEnemy(e,()=>addPoison(4));if(!amount&&typeof recordRangerPoisonVFX==='function')recordRangerPoisonVFX(e,'蝕毒引爆');log('蝕毒引爆：原 '+original+' 層'+(keep?'，保留 '+Math.floor(original*.65)+' 層':'，消耗原毒素')+'，再施加 4 層，現為 '+st.poisonStacks+' / '+rangerPoisonCap()+' 層。')}
 const result={...hit,targetHits:[{id:e.id,damage:hit.damage,actual:hit.actual,criticalHits:0,newBreak:false}]};if(e.hp===0)victory();return result}
function rangerPoisonCap(){return abilityState(1).venomspread?40:20}
function quickshotStacks(p){const count=p?.permanentQuickshot;return count===true?1:Number.isFinite(count)?Math.max(0,Math.floor(count)):0}
function quickshotSpeed(p){return 1+Math.max(quickshotStacks(p),buffActive(p,'quickshot')?1:0)*.2}
function applyWindErosion(e){if(!e||e.hp<=0)return;const st=e.status,now=s.auto.clock,active=st.windErosionUntil>now;st.windErosionStacks=active?Math.max(1,st.windErosionStacks||1)+1:1;if(!active||st.windErosionAt==null)st.windErosionAt=now+1000;st.windErosionOwner=1;st.windErosionUntil=now+12000}
function tickWindErosion(e){const st=e.status,now=s.auto.clock;if(!(st.windErosionUntil>0))return false;let changed=false;if(st.windErosionAt==null)st.windErosionAt=now+1000;
 if(st.windErosionAt<=now&&st.windErosionAt<=st.windErosionUntil){st.windErosionAt+=1000;const amp=1+Math.max(0,(st.windErosionStacks||1)-1)*.05,raw=2*amp,hp=e.hp,total=Math.floor(raw*(e.broken?1.5:1)),actual=applyEnemyLifeDamage(e,total);countBattleStat('damage',actual,st.windErosionOwner??1);recordPeriodicDamage(e,st.windErosionOwner??1,'風蝕持續傷害',raw,total,actual,hp,e.broken,'基礎 2 風傷 × 風易傷 '+journalNumber(amp)+'；不暴擊、不削盾、不觸發普攻效果');changed=true}
 if(st.windErosionUntil<=now){delete st.windErosionUntil;delete st.windErosionStacks;delete st.windErosionAt;delete st.windErosionOwner;changed=true}return changed}

function registerKnightSkills(){
 const card=(name,cost,rarity,desc,extra={})=>({name,owner:3,cost,rarity,desc,icon:'✧',type:'skill',...extra});
 Object.assign(C,{
 knightguard:card('挑釁',1,'common','瞬發；全體敵人嘲諷 3 秒（Boss 1.5 秒），普攻與未開始施放的單體技能優先攻擊艾莉；不影響全體、固定目標及已開始的技能。自身 3 秒減傷 20%；承受攻擊誓約 +1、格擋再 +1；受擊與格擋資源各每秒最多 2 次。重施只刷新時間，不重置特殊反擊次數',{knightTaunt:true,instant:true,type:'guard'}),
 knightslash:card('聖槍投擲',1,'common','瞬發；單體 160% 攻擊力穿刺傷害；防禦降低 15%／5 秒。有 2 誓約且另有敵人時，自動消耗 2 層穿透額外 1 名敵人（同倍率）',{hits:[['pierce',0]],knightSpear:true,instant:true,type:'attack'}),
 knightmend:card('神聖鎖鏈',1,'uncommon','鎖定選定敵人 6 秒；該敵人對隊友的 25% 傷害轉由艾莉西亞承受（仍依減傷、格擋與坐騎順序）。每次成功轉移反擊 40% 攻擊力物傷，每秒最多一次；反擊不遞迴',{knightChain:true,instant:true}),
 knightbash:card('壁壘盾擊',2,'uncommon','單體打 8＋自身格擋 50% 傷害（額外最多 20）；暈眩 1 秒，不消耗格擋；滿 5 誓約時消耗 5 層，改為全體盾反並為全隊格擋 +6',{hits:[['blunt',8]],stun:1000,knightShieldBash:true,type:'attack'}),
 knightvow:card('榮耀決鬥',1,'uncommon','瞬發；嘲諷選定單體 5 秒，期間艾莉西亞對該敵人傷害 +25%；成功格擋該目標攻擊時立即以 100% 攻擊力反擊。重施刷新，與復仇反擊同一命中合併一次',{knightDuel:true,instant:true,type:'guard'}),
 knightcounter:card('復仇誓約',2,'rare','本場自身、隊友或坐騎承受敵方直接攻擊獲得 1 復仇，上限 5 層，每層攻擊力 +8%。滿層持續復仇覺醒：普攻追加 80% 物理斬擊；承受敵方直接攻擊時反擊攻擊者 100% 物理傷害，全隊共用每秒最多一次。反擊不觸發坐騎普攻；重施不重置層數與冷卻',{knightVengeance:true}),
 knightaegis:card('天罰蓄勢',2,'epic','蓄勢 8 秒，每次成功格擋 +1 層，上限 5；結束時全體 100% 攻擊力物傷，每層 +30%（最高 250%）；重施刷新時間、保留層數，全體反擊不觸發反擊或普攻被動',{knightRetribution:true,type:'guard'}),
 knightprayer:card('黎明祈願',2,'epic','治療全體存活友軍 10 HP，各獲得 6 格擋',{knightPartyHeal:10,partyBlock:6}),
 knightjudgment:card('誓約裁決',3,'epic','消耗全部誓約；全體光 14 傷害，每層再 +4；消耗 5 層時，每實際命中 1 名敵人全體格擋 +4，最多 +12',{hits:[['light',14]],area:true,knightJudgment:true,type:'attack'}),
 knightavatar:card('獅鷲聖翔',3,'epic','召喚 25 HP 獅鷲；騎乘時閃避敵方攻擊 20%，每次普攻命中釋放全體風 4 風刃；成功閃避儲存一次俯衝，下次普攻主擊為攻擊力 150%，最多儲存 1 次。同種重施治療 12；與其他路線互相替換',{knightPath:'griffin',knightMount:'griffin'}),
 knightrotation:card('鐵犀衝城',2,'rare','召喚 30 HP 鐵犀；每次普攻追加刺 6，額外削盾 1（不需弱點）；命中附加 6 秒破甲，物理承傷 +10%；普攻衝撞成功擊破護盾，立即誓約 +2、普攻計數歸零。同種重施治療 12；與其他路線互相替換',{knightPath:'rhino',knightMount:'rhino'}),
 knightreservoir:card('戰象降臨',2,'uncommon','召喚 35 HP 戰象；每 3 次普攻命中造成全體打 8 傷害，敵人傷害 −20%／4 秒；巨獸守護：實際承受 3 次攻擊，為當前生命最低的存活隊友提供自身最大生命 10% 格擋（向上取整），每 6 秒最多一次。同種坐騎重施治療 12，保留計數；與其他路線互相替換',{knightPath:'elephant',knightMount:'elephant'}),
 knightdawnslash:card('斑龍獵主',3,'epic','召喚 24 HP 斑龍；普攻追加斬 4 撕咬並附加 1 層流血（6 秒）；命中流血敵人攻速 +8%，最多 10 層（+80%），坐騎離場清除。同種重施治療 12，保留層數；與其他路線互相替換',{knightPath:'allosaur',knightMount:'allosaur'}),
 knightredemption:card('救贖聖印',1,'uncommon','選定友軍獲得 8 秒救贖；騎士存活時，擋下一次致命傷，保留 1 HP 並治療 12；每人每場最多觸發一次，重複施放刷新未觸發的印記',{knightRedemption:true}),
 knightresonance:card('貫星聖槍',2,'epic','全體 130% 攻擊力穿刺傷害；每實際命中 1 名敵人，使下一次貫星聖槍傷害 +10%，最多 5 層（+50%）；當次全體使用同倍率，施放後重新累積',{hits:[['pierce',0]],area:true,knightStarSpear:true,type:'attack'}),
 knightcovenant:card('鮮血聖契',1,'rare','消耗 20% 當前生命（向下取整、至少保留 1 HP）；下次普攻追加消耗量 150% 光傷，上限 250% 攻擊力。該次普攻擊殺返還消耗生命 50%（向下取整）；重施替換待發效果，不疊加',{knightBloodPact:true}),
 knightguardian:card('不屈誓約',2,'epic','本場切換守護路線：受到傷害 −20%，普攻命中自身格擋 +3；施放時自身格擋 +10；與其他路線互相替換',{knightPath:'guardian',block:10}),
 knighthealer:card('聖癒誓約',2,'epic','本場治療路線：治療卡 +30%（向上取整），普攻命中治療最低血量友軍 3；騎士造成的溢出治療轉等量格擋，每次最多 8；與其他路線互相替換',{knightPath:'healer'}),
 knightdragon:card('蒼穹龍誓',3,'legendary','型態：召喚 32 生命飛龍，騎乘攻速 +20%；普攻追加 40% 攻擊力火傷。每 3 次普攻發動龍槍突刺（單體 80% 攻擊力穿刺傷害）與龍焰吐息（全體 150% 攻擊力火傷、灼燒 2 層）。每次龍息命中一名敵人，後續龍息傷害 +10%，最多 5 層（+50%）；當次龍息全體使用同一增傷倍率。已有存活飛龍時治療 18，保留計數與增傷；飛龍倒下或切換路線清除強化',{knightPath:'dragon',knightDragon:true}),
 knightangel:card('天翼加冕',4,'legendary','本場切換天使路線並下馬：普攻追加光 8，命中治療最低血量友軍 4；施放時全體治療 10、格擋 +12；與其他路線互相替換',{knightPath:'angel',knightPartyHeal:10,partyBlock:12}),
 knightremount:card('銀鬃衝鋒',1,'uncommon','召喚 24 生命銀鬃戰馬，騎乘攻速 +15%；上馬後下一次普攻及其後每 3 次普攻，主擊改為 150% 物理傷害並嘲諷目標 2 秒（不額外追加一擊）。已騎戰馬時重施回復坐騎最大生命 50%，保留衝鋒計數、攻速不疊加；其他坐騎會被替換，天使型態解除',{knightHorse:true})
 });
 BUILDS.push(
 {owner:3,name:'戰象盾反',cards:['knightaegis','knightreservoir','knightcounter'],gear:['oathSword'],desc:'戰象壓低敵傷 → 格擋蓄勢 → 復仇覺醒'},
 {owner:3,name:'猛獸衝鋒',cards:['knightresonance','knightrotation','knightdawnslash'],gear:['crownSword'],desc:'鐵犀破盾／斑龍撕咬擇一路線 → 貫星聖槍蓄星'},
 {owner:3,name:'不屈誓約',cards:['knightguardian','knightaegis','knightcounter'],gear:['oathSword'],desc:'守護路線減傷 → 蓄勢反擊 → 復仇覺醒'},
 {owner:3,name:'聖癒誓約',cards:['knighthealer','knightredemption','knightprayer'],gear:['oathSword'],desc:'普攻持續治療 → 強化聖療 → 救贖保住低血隊友'},
 {owner:3,name:'龍騎士',cards:['knightdragon','knightresonance','knightcounter'],gear:['crownSword'],desc:'飛龍普攻附火 → 每三次全體龍息 → 貫星聖槍'},
 {owner:3,name:'天翼加冕',cards:['knightangel','knightresonance','knightcovenant'],gear:['crownSword'],desc:'下馬展翼持續治療 → 貫星聖槍 → 鮮血聖契'},
 {owner:3,name:'救贖守護',cards:['knightredemption','knightprayer','knightcovenant'],gear:['oathSword'],desc:'預先留下救贖 → 致命傷保命治療 → 血契強化普攻'}
 );
 GEAR_LINKS.oathSword=['knightreservoir','knightcounter','knightredemption'];
 GEAR_LINKS.crownSword=['knightresonance','knightdawnslash','knightcovenant'];
}
function gainKnightOath(n){const p=s.party[slotOf(3)];if(!p||p.hp<=0||abilityState(3).reactiveDepth)return;const r=classResource(3);if(knightAttackEvent){n=Math.min(n,Math.max(0,2-knightAttackEvent.oath));knightAttackEvent.oath+=n}r.oath=Math.min(5,(r.oath||0)+n)}
function prepareKnightSkill(c,p,state){prepareKnightMechanic(c,p,state);if(c.oathGain)gainKnightOath(c.oathGain);if(c.knightShieldBash){c.hits=[['blunt',8+Math.min(20,Math.floor(p.block*.5))]];if(classResource(3).oath>=5){classResource(3).oath-=5;if(typeof gearBalanceOathSpent==='function')gearBalanceOathSpent(5,c);c.area=true;c.partyBlock=6;c.knightEmpoweredBash=true;log('誓約強化盾擊：範圍盾反，全隊格擋 +6。')}}if(c.knightTaunt)knightApplyTaunt();if(c.knightJudgment){const r=classResource(3);c.knightOathSpent=r.oath||0;c.hits=[['light',14+4*c.knightOathSpent]];r.oath=0;if(typeof gearBalanceOathSpent==='function')gearBalanceOathSpent(c.knightOathSpent,c)}prepareKnightOathCard(c,p,state);knightPreparePath(c,p,state);if(c.knightPartyHeal)for(const slot of alive())healTarget(c.knightPartyHeal,slot,3)}
function knightBasicHits(p,hits){const out=hits.map(h=>[...h]),r=classResource(3),state=abilityState(3);if(state.knightPath==='angel')out.push(['light',8]);const kind=livingKnightMount()?.kind;if(kind==='rhino')out.push(['pierce',6]);if(kind==='allosaur')out.push(['slash',4]);return out}
function knightAfterHurt(p,actual,blocked){
 if(p.id!==3||p.hp<=0||actual+blocked<=0)return;const state=abilityState(3);if(state.reactiveDepth)return;
 const active=knightTauntActive(),now=s.auto.clock;
 if(blocked>0&&knightOathWindow('guardHits'))gainKnightOath(2+(active?1:0));
 if(active&&knightOathWindow('tauntHits'))gainKnightOath(1);
 const mount=livingKnightMount();if(blocked>0&&mount?.kind==='rhino')knightReactiveDamage(s.enemy,'blunt',Math.min(12,Math.ceil(blocked*.5)),'鐵犀鐵甲反彈');
 if(active&&mount?.kind==='dragon'){const t=state.taunt;t.dragonHits=Math.min(3,(t.dragonHits||0)+1);if(t.dragonHits>=3&&!t.dragonUsed){t.dragonUsed=true;knightDragonBreath({damage:0,shieldHits:0,newBreak:false},[],knightAttackPower());}}
}

// Knight mechanics are serialized with abilityState and use the battle's logical clock.
function prepareKnightMechanic(c,p,state){



 if(c.knightRedemption){const slot=s.party[s.selected]?.hp>0?s.selected:alive().sort((a,b)=>s.party[a].hp/s.party[a].max-s.party[b].hp/s.party[b].max)[0];if(slot!=null){state.redemption??={};state.redemption[s.party[slot].id]=Math.max(state.redemption[s.party[slot].id]||0,s.auto.clock+8000);log(HEROES[s.party[slot].id].name+'獲得救贖聖印。')}}

}
function knightAfterBasic(){const state=abilityState(3);knightPathAfterBasic(state);


}


const KNIGHT_CARD_LINES={knightrotation:['接下來 3 次普攻命中','最低血量隊員格擋 +6'],knightreservoir:['格擋蓄光 50% · 上限 30','保留至下張傷害卡追加光傷'],knightdawnslash:['消耗誓約 → 增加段數與每段傷害','滿層 7×9 · BREAK 回能 1'],knightredemption:['8 秒內擋下致命傷 → 1 HP＋治療 12','每人每場限觸發一次'],knightresonance:['每第 3 次普攻命中','額外誓約 +2 · 全體格擋 +3'],knightcovenant:['耗盡自身格擋 → 全體護盾','格擋轉移、治療自身 · 詳見圖鑑']};

function knightPathName(path){return {guardian:'不屈誓約',healer:'聖癒誓約',dragon:'蒼穹龍誓',angel:'天翼加冕',elephant:'戰象降臨',rhino:'鐵犀衝城',allosaur:'斑龍獵主',griffin:'獅鷲聖翔',horse:'銀鬃衝鋒'}[path]||'誓約騎士'}
function livingKnightMount(){const p=s?.party?.[slotOf(3)];return p?.hp>0&&p.mount?.hp>0?p.mount:null}
function initKnightMounts(fresh=false){const state=abilityState(3);knightMigrateOathState(state);delete state.knightRotation;delete state.knightReservoir;delete state.knightLight;const rider=s.party[slotOf(3)];if(rider?.buffs)delete rider.buffs.knightAvatar;const p=s.party[slotOf(3)];if(!p)return;if(p.mount?.kind==='horse'&&p.mount.horseRevision!==1){p.mount.max=24;p.mount.hp=Math.min(24,p.mount.hp);p.mount.basics=0;p.mount.horseRevision=1;delete p.mount.tauntStrike;}if(p.mount?.kind==='dragon'&&p.mount.dragonRevision!==2){p.mount.max=32;p.mount.hp=Math.min(32,p.mount.hp);p.mount.dragonRevision=2;}if(fresh||!s.auto.knightMountRevision){p.mount=null;s.auto.knightMountRevision=2}}
function knightSummonMount(kind='horse'){const p=s.party[slotOf(3)];if(!p||p.hp<=0)return;const old=heroInterval(3),max=KNIGHT_MOUNTS[kind]?.hp||32;p.mount={kind,hp:max,max,basics:0,huntStacks:0};if(kind==='horse')p.mount.horseRevision=1;if(kind==='dragon'){p.mount.dragonRevision=2;abilityState(3).dragonBasics=0;abilityState(3).dragonBreathStacks=0;}rescaleHeroAttack(p,old);log('艾莉希亞騎上'+knightMountName(kind)+'，坐騎生命 '+max+'。')}
function knightHealMount(n){const m=livingKnightMount();if(!m)return;const gain=Math.min(n,m.max-m.hp);m.hp+=gain;if(gain){countBattleStat('healing',gain,3);recordBattleJournal({kind:'healing',title:'坐騎治療',amount:gain,steps:[{label:'坐騎生命',value:m.hp+' / '+m.max}]})}}
function knightPreparePath(c,p,state){
 if(c.knightPath){if(state.knightPath!==c.knightPath&&p.mount){p.mount.basics=0;p.mount.huntStacks=0;p.mount.guardHits=0;delete p.mount.diveReady}if(typeof recordAliciaAscension==='function')recordAliciaAscension(c);state.knightPath=c.knightPath;if(KNIGHT_MOUNTS[p.mount?.kind]?.card&&!c.knightMount){const old=heroInterval(3);p.mount.hp=0;rescaleHeroAttack(p,old)}if(c.knightPath==='angel'&&livingKnightMount()){const old=heroInterval(3);p.mount.hp=0;rescaleHeroAttack(p,old)}if(c.knightPath!=='dragon'){state.dragonBasics=0;state.dragonBreathStacks=0;}}
 if(c.knightMount){if(livingKnightMount()?.kind===c.knightMount)knightHealMount(12);else knightSummonMount(c.knightMount)}
 if(c.knightDragon){if(livingKnightMount()?.kind==='dragon')knightHealMount(18);else knightSummonMount('dragon')}
 if(c.knightHorse){if(livingKnightMount()?.kind==='horse')knightHealMount(Math.ceil(livingKnightMount().max*.5));else{if(!['guardian','healer'].includes(state.knightPath))delete state.knightPath;state.dragonBasics=0;state.dragonBreathStacks=0;knightSummonMount('horse')}}
 if(state.knightPath==='healer'){for(const key of ['heal','healSelf','knightPartyHeal'])if(c[key])c[key]=Math.ceil(c[key]*1.3)}
}
function knightPathAfterBasic(state){const p=s.party[slotOf(3)];if(!p||p.hp<=0)return;
 if(state.knightPath==='guardian')p.block+=3;
 if(state.knightPath==='healer'||state.knightPath==='angel')healTarget(state.knightPath==='angel'?4:3,undefined,3);

}
function knightMountAbsorb(p,damage){const m=p.id===3?livingKnightMount():null;if(!m||damage<=0)return 0;const old=heroInterval(3),n=Math.min(m.hp,damage);m.hp-=n;if(!m.hp){m.basics=0;m.huntStacks=0;delete m.diveReady;if(m.kind==='dragon'){abilityState(3).dragonBasics=0;abilityState(3).dragonBreathStacks=0;}rescaleHeroAttack(p,old);log(knightMountName(m.kind)+'倒下，艾莉希亞下馬繼續戰鬥。')}return n}
function knightMountHUD(p){if(p.id!==3||s.phase!=='battle')return '';const m=livingKnightMount();if(!m)return '';return `<span class="knight-mount-hud ${m?'mount-'+m.kind:'mount-dismounted'}" aria-label="${m?knightMountName(m.kind)+'生命 '+m.hp+' / '+m.max:'已下馬'}"><b>${m?knightMountName(m.kind):'步戰'} <small>${m?m.hp+' / '+m.max:'坐騎已離場'}</small></b>${m?`<span class="knight-mount-meter" role="meter" aria-label="坐騎生命" aria-valuemin="0" aria-valuemax="${m.max}" aria-valuenow="${m.hp}"><i style="width:${m.hp/m.max*100}%"></i></span>`:''}</span>`}
function knightVisualMount(){const p=s?.party?.[slotOf(3)];return s.phase==='battle'&&p?.mount?.hp>0?p.mount:null}
function knightVisualFrames(id,state){if(id!==3||typeof KNIGHT_MOUNT_FRAMES==='undefined'||s.phase!=='battle')return null;const path=abilityState(3).knightPath,m=knightVisualMount(),key=path==='angel'?'angel':m?.kind;if(!key)return null;const f=KNIGHT_MOUNT_FRAMES[key]||KNIGHT_MOUNT_FRAMES[key==='griffin'?'dragon':'horse'];if(!f)return null;return f[state]||f.idle}
Object.assign(KNIGHT_CARD_LINES,{knightguardian:['守護型態 · 本場減傷 20%','普攻格擋 +3 · 施放格擋 +10'],knighthealer:['治療卡 +30% · 普攻治療 3','溢出治療 → 格擋，每次最多 8'],knightdragon:['飛龍生命 32 · 攻速 +20% · 附火 40%','每三擊龍槍 80%／龍息 150%＋灼燒 2 · 龍息增傷上限 50%'],knightangel:['天使型態 · 下馬展翼','普攻附光、治療 · 全隊救援'],knightremount:['戰馬生命 24 · 攻速 +15%','首次及每 3 擊：主擊 150% · 嘲諷 2 秒','重施回復坐騎 50% · 不消耗誓約']});

function knightAfterSkill(c,result){if(c.knightStarSpear)abilityState(3).starSpearStacks=Math.min(5,(result.targetHits||[]).filter(h=>h.actual>0).length);

 if(c.knightJudgment&&c.knightOathSpent===5){const count=(result.targetHits||[]).filter(h=>h.actual>0).length,gain=Math.min(12,count*4);if(gain){for(const slot of alive())s.party[slot].block+=gain;log('滿誓約裁決：命中 '+count+' 名敵人，全體格擋 +'+gain+'。')}}
}
function knightProtectLethal(p,damage){
 const owner=s.party[slotOf(3)];if(!owner||owner.hp<=0||p.hp<=0||damage<p.hp)return {damage,heal:0};
 const state=abilityState(3);if(!(state.redemption?.[p.id]>s.auto.clock)||state.redemptionUsed?.[p.id])return {damage,heal:0};
 delete state.redemption[p.id];state.redemptionUsed??={};state.redemptionUsed[p.id]=true;
 return {damage:Math.max(0,p.hp-1),heal:state.knightPath==='healer'?16:12};
}
function knightResolveRescue(p,rescue){if(!rescue.heal||p.hp<=0)return;healTarget(rescue.heal,slotOf(p.id),3);log('救贖聖印擋下致命傷：'+HEROES[p.id].name+'保留 1 HP，治療 '+rescue.heal+'。')}
function knightOverhealShield(p,n,source){if(source!==3||!s.auto||!inParty(3)||s.party[slotOf(3)].hp<=0||abilityState(3).knightPath!=='healer'||n<=0)return;const gain=Math.min(8,n);p.block+=gain;log('聖癒誓約：'+HEROES[p.id].name+'溢出治療轉為 '+gain+' 格擋。')}
Object.assign(KNIGHT_CARD_LINES,{knightjudgment:['消耗誓約 → 全體光 14＋每層 4','滿層命中敵人 → 全體格擋，最多 12']});

function knightCardTypeName(path){return {guardian:'守護型態',healer:'治療型態',dragon:'龍騎型態',angel:'天使型態',elephant:'戰象坐騎',rhino:'鐵犀坐騎',allosaur:'斑龍坐騎',griffin:'獅鷲坐騎'}[path]||''}

let knightArtworkPreloaded=false;
function preloadKnightArtwork(){if(knightArtworkPreloaded||typeof Image!=='function'||!inParty(3))return;knightArtworkPreloaded=true;const forms=[HERO_FRAME_LAYOUT[3],...(typeof KNIGHT_MOUNT_FRAMES==='undefined'?[]:Object.values(KNIGHT_MOUNT_FRAMES))],assets=new Set();for(const form of forms)for(const frames of Object.values(form))for(const f of frames)assets.add(f.asset);for(const src of assets){const img=new Image();img.decoding='async';img.src=src}}

// Four mount cards share the established two-health-bar lifecycle.
const KNIGHT_MOUNTS={horse:{name:'銀鬃戰馬',hp:24},dragon:{name:'飛龍',hp:32},elephant:{name:'戰象',hp:35,card:'knightreservoir'},rhino:{name:'鐵犀',hp:30,card:'knightrotation'},allosaur:{name:'斑龍',hp:24,card:'knightdawnslash'},griffin:{name:'獅鷲',hp:25,card:'knightavatar'}};
function knightMountName(kind){return KNIGHT_MOUNTS[kind]?.name||'坐騎'}
function knightMountCard(kind){return KNIGHT_MOUNTS[kind]?.card}
function knightMountSpeed(){const m=livingKnightMount();return m?(m.kind==='dragon'&&abilityState(3).knightPath==='dragon'?1.2:1.15*(m.kind==='allosaur'?1+(m.huntStacks||0)*.08:1))*(m.tauntHasteUntil>s.auto.clock?1.25:1):1}
function knightEnemyAttackFactor(){return s.enemy?.status?.weakenUntil>s.auto.clock ? .8 : 1}
function knightEvade(p){return p.id===3&&p.hp>0&&livingKnightMount()?.kind==='griffin'&&Math.random()<.2}
function knightRhinoBreak(e,owner,options){if(owner!==3||!options.basic||livingKnightMount()?.kind!=='rhino'||e.broken||e.shield<=0)return 0;const before=e.shield;e.shield=Math.max(0,e.shield-1);if(!e.shield){e.broken=true;interruptBoss(e);e.status.breakUntil=s.auto.clock+3000;delayEnemyAttack(e.status.breakUntil+600);gearOnBreak();log('鐵犀衝鋒：BREAK！')}return before-e.shield}
function knightMountAfterImpact(p,result,targets){if(p.id!==3)return;const m=livingKnightMount();if(!m)return;if(m.kind==='rhino'){m.basics=(m.basics||0)+1;if(result.newBreak){gainKnightOath(2);m.basics=0;setGearProc(3,'basicCount',0);log('鐵甲衝撞破盾：誓約 +2，普攻計數歸零。')}}if(m.kind==='dragon'&&abilityState(3).knightPath==='dragon'){knightDragonAfterImpact(p,result,targets);return}if(result.actual<=0)return;const target=s.enemy;
 if(m.kind==='rhino'&&target.hp>0)target.status.warriorShredUntil=Math.max(target.status.warriorShredUntil||0,s.auto.clock+6000);
 if(m.kind==='allosaur'){const wasBleeding=target.status.bleedUntil>s.auto.clock;if(target.hp>0)addBleedStacks(target,1,3);if(wasBleeding){const old=heroInterval(3);m.huntStacks=Math.min(10,(m.huntStacks||0)+1);rescaleHeroAttack(p,old)}}
 let attr,amount,label;if(m.kind==='elephant'){m.basics=(m.basics||0)+1;if(m.basics>=3){m.basics=0;attr='blunt';amount=8;label='戰象踐踏'}}if(m.kind==='griffin'){attr='wind';amount=4;label='獅鷲風刃'}
 if(!attr)return;for(const e of [...livingEnemies()])withEnemy(e,()=>{const hit=damageEnemy([[attr,amount]],3,{preparedHits:[[attr,amount]],skipResource:true,noOnHit:true,noCrit:true,ignoreStrength:true,label});rangerMergeHit(result,targets,e,hit);if(m.kind==='elephant'&&e.hp>0)e.status.weakenUntil=Math.max(e.status.weakenUntil||0,s.auto.clock+4000)});log(label+'：全體'+amount+'傷害'+(m.kind==='elephant'?'，敵傷 −20%／4 秒':'')+'。');
}
Object.assign(KNIGHT_CARD_LINES,{knightreservoir:['戰象生命 35 · 每 3 次普攻全體打 8','敵傷 −20%／4 秒 · 同種重施治療 12'],knightrotation:['鐵犀生命 30 · 普攻追加刺 6／削盾 1','破甲 6 秒 · 物理承傷 +10%'],knightdawnslash:['斑龍生命 24 · 普攻斬 4＋流血 1／6 秒','命中流血目標攻速 +8% · 上限 +80%'],knightavatar:['獅鷲生命 25 · 閃避 20%','每次普攻命中釋放全體風 4']});

function knightMountAfterHurt(p,m,actual){
 if(p.id!==3||p.hp<=0||m?.kind!=='elephant'||actual<=0)return;
 const state=abilityState(3),now=s.auto.clock;m.guardHits=Math.min(3,(m.guardHits||0)+1);
 if(m.guardHits<3||now<(state.beastGuardAt||0))return;
 const slot=alive().filter(i=>s.party[i].id!==3).sort((a,b)=>s.party[a].hp-s.party[b].hp||a-b)[0];if(slot==null)return;
 const gain=Math.ceil(p.max*.1);s.party[slot].block+=gain;m.guardHits=0;state.beastGuardAt=now+6000;
 log('巨獸守護：'+HEROES[s.party[slot].id].name+'格擋 +'+gain+'。');recordBattleJournal({kind:'event',title:'巨獸守護',amount:gain,steps:[{label:'護盾量',value:p.max+' × 10% → 向上取整 = '+gain},{label:'守護對象',value:HEROES[s.party[slot].id].name},{label:'觸發冷卻',value:'6 秒'}]});
}
function knightStoreDive(p){const m=p.id===3?livingKnightMount():null;if(m?.kind==='griffin')m.diveReady=true}
function knightConsumeDive(p){const m=p.id===3?livingKnightMount():null;if(m?.kind!=='griffin'||!m.diveReady)return false;delete m.diveReady;return true}
Object.assign(KNIGHT_CARD_LINES,{knightreservoir:['戰象生命 35 · 三擊踐踏降敵傷','承受三擊 → 最低生命隊友護盾 10% · 冷卻 6 秒'],knightrotation:['鐵犀生命 30 · 普攻破甲削盾','破盾 → 誓約 +2、普攻計數歸零'],knightavatar:['獅鷲生命 25 · 閃避 20%／全體風刃','閃避 → 下次主擊 150% · 最多儲存一次']});

function knightAttackPower(){return Math.max(0,AUTO_BASIC[3].damage+gearBonus(3,'attack')+(s.strength||0))*knightVengeanceMultiplier()}
function knightDragonAfterImpact(p,result,targets){
 const state=abilityState(3),power=knightAttackPower(),primary=s.enemy;
 const hit=(enemy,attr,ratio,label)=>{if(!enemy||enemy.hp<=0)return null;return withEnemy(enemy,()=>{const hits=[[attr,power*ratio]],out=damageEnemy(hits,3,{preparedHits:hits,skipResource:true,noOnHit:true,noCrit:true,ignoreStrength:true,label});rangerMergeHit(result,targets,enemy,out);return out})};
 hit(primary,'fire',.4,'蒼穹龍誓 · 普攻附火');state.dragonBasics=(state.dragonBasics||0)+1;if(state.dragonBasics<3)return;state.dragonBasics=0;
 hit(primary.hp>0?primary:livingEnemies()[0],'pierce',.8,'龍槍突刺');
 knightDragonBreath(result,targets,power);
}
function knightDragonBreath(result,targets,power=knightAttackPower()){const state=abilityState(3);if(livingKnightMount()?.kind!=='dragon'||state.knightPath!=='dragon')return;const hit=(enemy,attr,ratio,label)=>knightReactiveDamage(enemy,attr,power*ratio,label,result,targets);const stacks=Math.min(5,state.dragonBreathStacks||0),ratio=1.5*(1+stacks*.1)*(hasGearEffect(3,'dragonLance')?1.3:1);let landed=0;
 for(const enemy of [...livingEnemies()]){const out=hit(enemy,'fire',ratio,'龍焰吐息');if(out?.actual>0){landed++;addBurnStacks(enemy,2,3)}}
 state.dragonBreathStacks=Math.min(5,stacks+landed);log('全體龍焰吐息 '+Math.round(ratio*100)+'%＋灼燒 2 層；龍息增傷 '+state.dragonBreathStacks*10+'%。');
}

// Timed taunt shares the logical battle clock; refreshing never replenishes proc budgets.
function knightTauntActive(){return !!s?.auto&&s.party[slotOf(3)]?.hp>0&&(abilityState(3).taunt?.until||0)>s.auto.clock}
function knightCanRedirect(enemy,skill={}){return !enemy.areaPart&&enemy.fixedTarget==null&&enemy.fixedTargetId==null&&!enemy.tauntImmune&&(skill.fixedTarget==null||skill.fixedTarget===false)&&skill.fixedTargetId==null&&!skill.targetLocked&&!skill.unredirectable&&!['all','self','analyzed','marked','fixed'].includes(skill.target)}
function knightTauntTarget(enemy,skill={}){return knightTauntStatusUntil(enemy)>s.auto.clock&&knightCanRedirect(enemy,skill)?slotOf(3):null}
function knightBasicTarget(enemy){if(enemy.aoe)return;const slot=knightTauntTarget(enemy);if(slot!=null)enemy.target=slot;else if(enemy.fixedTargetId!=null){const i=slotOf(enemy.fixedTargetId);if(s.party[i]?.hp>0)enemy.target=i}else if(Number.isInteger(enemy.fixedTarget)&&s.party[enemy.fixedTarget]?.hp>0)enemy.target=enemy.fixedTarget;}
function knightSkillTargetsTitan(enemy,skill){return !!livingTitan()&&knightTauntTarget(enemy,skill)==null}
function knightApplyTaunt(){
 const state=abilityState(3),now=s.auto.clock;if(state.taunt&&state.taunt.until<=now)knightFinishTaunt();
 if(!state.taunt)state.taunt={griffinUsed:false,dragonUsed:false,dragonHits:0};state.taunt.until=Math.max(state.taunt.until||0,now+3000);
 for(const enemy of livingEnemies()){if(enemy.areaPart||enemy.tauntImmune)continue;enemy.status.knightTauntUntil=state.taunt.until===PERMANENT_BUFF_TIME?PERMANENT_BUFF_TIME:now+(enemy.type==='首領'||enemy.areaBossId||enemy.finalBossId||['AREA_BOSS','FINAL_BOSS','SECRET_BOSS'].includes(enemy.tier)?1500:3000);withEnemy(enemy,()=>planEnemy())}
 log('挑釁：全體敵人嘲諷 3 秒，Boss 1.5 秒。');
}
function knightFinishTaunt(){const state=abilityState(3);if(!state.taunt)return;delete state.taunt;const p=s.party[slotOf(3)],m=livingKnightMount();if(p?.hp>0&&m){if(m.kind==='allosaur'){const old=heroInterval(3);m.tauntHasteUntil=Math.max(m.tauntHasteUntil||0,s.auto.clock+3000);rescaleHeroAttack(p,old)}}}
function knightTickTaunt(){if(!inParty(3))return false;const state=abilityState(3),now=s.auto.clock;let changed=knightTickDuel();if(knightTickOathCards())changed=true;if(state.taunt&&(state.taunt.until<=now||s.party[slotOf(3)]?.hp<=0)){knightFinishTaunt();changed=true}for(const enemy of enemyRoster()){if(enemy.status?.horseTauntUntil&&(enemy.status.horseTauntUntil<=now||s.party[slotOf(3)]?.hp<=0)){delete enemy.status.horseTauntUntil;knightReplan(enemy);changed=true}if(enemy.status?.knightTauntUntil&&(enemy.status.knightTauntUntil<=now||!knightTauntActive())){delete enemy.status.knightTauntUntil;if(enemy.hp>0)withEnemy(enemy,()=>planEnemy());changed=true}}return changed}
function knightTauntMitigation(p){return p.id===3&&knightTauntActive() ? (livingKnightMount()?.kind==='elephant'?.7:.8) : 1}
function knightOathWindow(key){const state=abilityState(3),now=s.auto.clock;const hits=(state[key]||[]).filter(t=>now-t<1000);state[key]=hits;if(hits.length>=2)return false;hits.push(now);return true}
function knightReactiveDamage(enemy,attr,amount,label,result=null,targets=[]){if(!enemy||enemy.hp<=0)return null;const state=abilityState(3);state.reactiveDepth=(state.reactiveDepth||0)+1;try{return withEnemy(enemy,()=>{const hits=[[attr,amount]],out=damageEnemy(hits,3,{preparedHits:hits,skipResource:true,noOnHit:true,noCrit:true,ignoreStrength:true,knightReactive:true,label});if(result)rangerMergeHit(result,targets,enemy,out);log(label+'：'+out.damage+' 傷害。');return out})}finally{state.reactiveDepth--;}}
function knightAfterEvade(p){if(p.id!==3||!knightTauntActive())return;const state=abilityState(3);if(state.reactiveDepth||state.taunt.griffinUsed)return;state.taunt.griffinUsed=true;knightConsumeDive(p);knightReactiveDamage(s.enemy,'pierce',knightAttackPower()*1.5,'獅鷲俯衝反擊');}
function knightConsumeHorseStrike(p){const mount=p.id===3?livingKnightMount():null;if(mount?.kind!=='horse'||p.hp<=0||s.phase!=='battle'||s.enemy?.hp<=0)return false;mount.basics=(mount.basics||0)+1;return (mount.basics-1)%3===0}
function knightHorseTaunt(enemy){if(!enemy||enemy.hp<=0||enemy.areaPart||enemy.tauntImmune||s.party[slotOf(3)]?.hp<=0)return;enemy.status.horseTauntUntil=Math.max(enemy.status.horseTauntUntil||0,s.auto.clock+2000);knightReplan(enemy)}
Object.assign(KNIGHT_CARD_LINES,{knightguard:['全體嘲諷 3 秒 · Boss 1.5 秒','減傷 20% · 受擊／格擋累積誓約'],knightbash:['盾擊 · 滿 5 誓約消耗強化','全體盾反 · 全隊格擋 +6']});

'use strict';
// All new knight cards retain existing IDs. Event budgets are transient; timers
// and persistent progress live in auto.skills[3] and use the logical clock.
let knightAttackEvent=null;
function withKnightAttackEvent(fn){if(knightAttackEvent)return fn();knightAttackEvent={oath:0,vengeance:false};try{return fn()}finally{knightAttackEvent=null}}
function knightMigrateOathState(state){if(state.knightCounter){state.knightVengeance=true;state.vengeanceStacks??=0}delete state.knightCounter;delete state.knightResonance;delete state.knightCycle;state.vengeanceStacks=Math.min(5,Math.max(0,state.vengeanceStacks||0))}
function knightVengeanceMultiplier(){const state=abilityState(3);return 1+(state.knightVengeance?Math.min(5,state.vengeanceStacks||0)*.08:0)}
function knightDuelActive(enemy=null){if(!inParty(3)||s.party[slotOf(3)]?.hp<=0)return false;const duel=abilityState(3).knightDuel;return !!duel&&duel.until>s.auto.clock&&(!enemy||duel.targetId===enemy.id)}
function knightDuelMultiplier(enemy,owner){return owner===3&&knightDuelActive(enemy)?1.25:1}
function knightTauntStatusUntil(enemy){if(!inParty(3)||s.party[slotOf(3)]?.hp<=0)return 0;return Math.max(enemy.status?.horseTauntUntil||0,knightTauntActive()?enemy.status?.knightTauntUntil||0:0,knightDuelActive(enemy)?abilityState(3).knightDuel.until:0)}
function knightReplan(enemy){if(enemy?.hp>0)withEnemy(enemy,()=>planEnemy())}
function knightTickDuel(){const state=abilityState(3),d=state.knightDuel;if(!d||knightDuelActive())return false;delete state.knightDuel;knightReplan(enemyRoster().find(e=>e.id===d.targetId));return true}
function prepareKnightOathCard(c,p,state){const now=s.auto.clock;
 if(c.knightDuel){const previous=state.knightDuel?.targetId;state.knightDuel={targetId:s.enemy.id,until:Math.max(state.knightDuel?.until||0,now+5000)};knightReplan(enemyRoster().find(e=>e.id===previous));knightReplan(s.enemy);knightRecordOathFX(s.enemy,'knightvow')}
 if(c.knightVengeance){state.knightVengeance=true;state.vengeanceStacks??=0}
 if(c.knightSpear){c.knightExactDamage=true;c.hits=[['pierce',knightAttackPower()*1.6]];if(classResource(3).oath>=2&&livingEnemies().some(e=>e.id!==s.enemy.id)){classResource(3).oath-=2;if(typeof gearBalanceOathSpent==='function')gearBalanceOathSpent(2,c);c.chain=true;c.chainLimit=2;c.bounceRatio=1;c.bounceOriginal=true}}
 if(c.knightChain){state.sacredChain={targetId:s.enemy.id,until:Math.max(state.sacredChain?.until||0,now+6000),counterAt:state.sacredChain?.counterAt||0};knightRecordOathFX(s.enemy,'knightmend')}
 if(c.knightRetribution){if((state.retribution?.releaseAt??state.retribution?.until)<=now)knightReleaseRetribution();state.retribution={until:Math.max(state.retribution?.until||0,now+8000),releaseAt:now+8000,stacks:state.retribution?.stacks||0}}
 if(c.knightBloodPact){const spent=Math.min(p.hp-1,Math.floor(p.hp*.2));if(spent>0){p.hp-=spent;state.bloodPact={spent};log('鮮血聖契：消耗 '+spent+' 生命，強化下一次普攻。')}}
 if(c.knightStarSpear){const stacks=Math.min(5,state.starSpearStacks||0);c.knightExactDamage=true;c.hits=[['pierce',knightAttackPower()*1.3*(1+stacks*.1)]];state.starSpearStacks=0;}
}
function knightOathAfterEnemyHit(p,actual,blocked,label){if(!inParty(3)||s.party[slotOf(3)]?.hp<=0||actual+blocked<=0)return;const state=abilityState(3),now=s.auto.clock;if(state.reactiveDepth||/反擊|反彈/.test(label))return;
 if(state.knightVengeance&&!knightAttackEvent?.vengeance){state.vengeanceStacks=Math.min(5,(state.vengeanceStacks||0)+1);if(knightAttackEvent)knightAttackEvent.vengeance=true}
 if(p.id===3&&blocked>0&&state.retribution?.until>now)state.retribution.stacks=Math.min(5,state.retribution.stacks+1);
 const enemy=s.enemy,duel=p.id===3&&blocked>0&&knightDuelActive(enemy),revenge=state.knightVengeance&&state.vengeanceStacks>=5&&now>=(state.vengeanceCounterAt||0);
 if(duel||revenge){if(revenge)state.vengeanceCounterAt=now+1000;knightRecordOathFX(enemy,duel?'knightvow':'knightcounter');knightReactiveDamage(enemy,'slash',knightAttackPower(),duel?'榮耀決鬥反擊':'復仇覺醒反擊')}
}
function hurtByMonster(p,amount,stance=true,label='攻擊'){return withKnightAttackEvent(()=>{
 const state=abilityState(3),chain=state.sacredChain,eligible=p.id!==3&&p.hp>0&&s.party[slotOf(3)]?.hp>0&&chain?.until>s.auto.clock&&chain.targetId===s.enemy?.id&&!buffActive(p,'invulnerable')&&!state.chainTransferring&&!state.reactiveDepth&&!/反擊|反彈/.test(label),transfer=eligible?amount*.25:0;
 const hit=hurtByMonsterCore(p,amount-transfer,stance,label);
 if(transfer>0&&!hit.evaded){state.chainTransferring=true;try{const rider=s.party[slotOf(3)],taken=hurtByMonsterCore(rider,transfer,stance,'神聖鎖鏈轉移');hit.transferred=taken.actual+taken.blocked;if(taken.actual+taken.blocked>0&&s.auto.clock>=(chain.counterAt||0)&&rider.hp>0){chain.counterAt=s.auto.clock+1000;knightRecordOathFX(s.enemy,'knightmend');knightReactiveDamage(s.enemy,'slash',knightAttackPower()*.4,'神聖鎖鏈反擊')}}finally{delete state.chainTransferring}}
 return hit;
})}
function resolveHeroBasicImpact(p,payload,flight=null){return withKnightAttackEvent(()=>resolveHeroBasicImpactCore(p,payload,flight))}
function areaBossDealHits(enemy,skill){return withKnightAttackEvent(()=>areaBossDealHitsCore(enemy,skill))}
function enemyBasic(){return withKnightAttackEvent(()=>enemyBasicCore())}
function knightVengeanceAfterBasic(p,result,targets){if(p.id!==3||p.hp<=0||result.actual<=0)return;const state=abilityState(3),enemy=s.enemy;
 if(state.bloodPact){const pact=state.bloodPact;delete state.bloodPact;const aliveBefore=enemy.hp>0;if(aliveBefore){knightRecordOathFX(enemy,'knightcovenant');knightReactiveDamage(enemy,'light',Math.min(pact.spent*1.5,knightAttackPower()*2.5),'鮮血聖契追加',result,targets)}if(enemy.hp<=0)healTarget(Math.floor(pact.spent*.5),slotOf(3),3)}
 if(state.knightVengeance&&state.vengeanceStacks>=5&&enemy.hp>0){knightRecordOathFX(enemy,'knightcounter');knightReactiveDamage(enemy,'slash',knightAttackPower()*.8,'復仇覺醒追加斬擊',result,targets)}
}
function knightReleaseRetribution(){const state=abilityState(3),charge=state.retribution;if(!charge)return;delete state.retribution;if(s.party[slotOf(3)]?.hp<=0)return;const power=knightAttackPower()*(1+.3*Math.min(5,charge.stacks));for(const e of [...livingEnemies()]){knightRecordOathFX(e,'knightaegis');knightReactiveDamage(e,'slash',power,'天罰蓄勢全體反擊')}if(enemyRoster().some(e=>e.hp===0))victory()}
function knightTickOathCards(){const state=abilityState(3),now=s.auto.clock;let changed=false;if((state.retribution?.releaseAt??state.retribution?.until)<=now){knightReleaseRetribution();changed=true}if(state.sacredChain?.until<=now){delete state.sacredChain;changed=true}return changed}
function knightOathTags(p){if(p.id!==3)return '';const state=abilityState(3),now=s.auto.clock,items=[];
 if(state.sacredChain?.until>now)items.push(['knightmend','神聖鎖鏈 · '+buffDurationLabel(state.sacredChain.until)]);
 if(state.retribution?.until>now)items.push(['knightaegis','天罰 '+state.retribution.stacks+'/5 · '+Math.max(0,Math.ceil(((state.retribution.releaseAt??state.retribution.until)-now)/1000))+' 秒後釋放']);
 if(state.bloodPact)items.push(['knightcovenant','鮮血聖契就緒 · 消耗 '+state.bloodPact.spent+' 生命']);
 if(state.starSpearStacks)items.push(['knightresonance','貫星聖槍 +'+Math.min(5,state.starSpearStacks)*10+'%']);
 return items.map(([key,text])=>`<small class="buff-tag knight-oath-tag">${skillIconHTML(key)}${text}</small>`).join('');
}
function knightRecordOathFX(enemy,key){if(enemy)enemy.knightOathFX={key,at:s.auto.clock}}
function knightOathEnemyHTML(enemy){const fx=enemy.knightOathFX,age=s.auto.clock-(fx?.at??-1000);if(!fx||age<0||age>=700)return '';const paused=s.auto.paused||document.hidden||(typeof reduceMotion==='function'&&reduceMotion());return `<span class="knight-oath-impact ${fx.key==='knightslash'||fx.key==='knightresonance'?'knight-oath-lance':''}" style="--oath-age:-${age}ms;--oath-play:${paused?'paused':'running'}" aria-hidden="true">${skillIconHTML(fx.key,'knight-oath-art')}</span>`}
Object.assign(KNIGHT_CARD_LINES,{
 knightvow:['單體嘲諷 5 秒 · 對其傷害 +25%','格擋決鬥目標 → 立即反擊'],
 knightcounter:['全隊受擊累積復仇 · 5 層攻擊 +40%','覺醒普攻追加 80% · 反擊 100%／秒'],
 knightslash:['單體穿刺 160% · 防禦 −15%／5 秒','有 2 誓約 → 自動穿透額外一敵'],
 knightmend:['鎖定敵人 6 秒 · 轉移隊友承傷 25%','艾莉承接 → 反擊 40%／每秒最多一次'],
 knightaegis:['蓄勢 8 秒 · 每次格擋 +1／上限 5','結束全體物傷 100%＋每層 30%'],
 knightcovenant:['消耗當前生命 20% · 強化下次普攻','追加光傷＝消耗 150% · 擊殺返還 50%'],
 knightresonance:['全體穿刺 130% · 次次施放蓄星','每命中一敵，下次傷害 +10%／上限 50%']
});
