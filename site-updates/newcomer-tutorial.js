'use strict';
// Capture first-visit eligibility before game.js creates its first autosave.
const NEWCOMER_TUTORIAL_KEY='ember-newcomer-tutorial';
const newcomerVisit=(()=>{
 try{
  const raw=localStorage.getItem(NEWCOMER_TUTORIAL_KEY);
  let record=null;try{record=JSON.parse(raw)}catch{}
  return {available:true,record,returning:!!(localStorage.getItem('ember-v3')||localStorage.getItem('ember-v2'))};
 }catch{return {available:false,record:null,returning:true}}
})();
let newcomerSession=null;
const NEWCOMER_STEPS=[
 {title:'歡迎來到燼塔',label:'出發之前',icon:'✦',body:'帶領三名冒險者，在遠征中收集卡牌、裝備與力量，一起走向塔頂。',tip:'約 2 分鐘 · 隨時可跳過，之後可從「遠征選單 → 設定 → 重看新手教學」再次開啟，也能從遊戲百科開始。'},
 {title:'組成你的三人小隊',label:'01 · 小隊與路線',icon:'⚔',body:'從可招募職業中選擇三人。點選已選角色可移除，再選其他角色；系統依職業定位自動安排前、中、後排，與點選順序無關。確認小隊後，從地圖上的可選節點繼續遠征。',tip:'戰士與騎士擅長前排，遊俠與法師提供輸出。每個職業開局隨機獲得 3 張牌，每職業最多帶 5 張出戰牌。'},
 {title:'普攻自動，出牌由你決定',label:'02 · 戰鬥節奏',icon:'Ⅱ',body:'隊員和敵人會自動攻擊。你負責挑選時機施放傷害、防禦、治療與強化卡牌。點「暫停戰鬥」可先觀察戰況，繼續後再出牌。',tip:'開啟遠征選單、牌組或玩法說明時，戰鬥時間也會停止。倒下的角色無法行動，三人全倒才會失敗。'},
 {title:'試著打出一張卡牌',label:'03 · 能量與手牌',icon:'ϟ',body:'卡牌左上角標示能量費用。點選手牌即可施放，也能拖向敵人；先點選敵人可切換攻擊目標。手機長按卡牌可查看詳情。',tip:'開戰有 3 能量、5 張手牌；每 3 秒回復 1 能量（最多 5），每 4 秒抽 1 張（最多 7）。以下為獨立示範，點一下卡牌試試。'},
 {title:'命中弱點，打出失衡',label:'04 · 弱點與護盾',icon:'◆',body:'敵人旁的圖示是已發現的弱點，「？」代表尚未揭露。用相符屬性命中，每段可削減 1 點護盾；護盾歸零後，敵人會進入失衡。',tip:'失衡持續 3 秒，敵人受到的傷害提高為 1.5 倍。留意屬性圖示，讓多段攻擊與高傷害卡牌接力。'},
 {title:'把獎勵變成你的流派',label:'05 · 戰後成長',icon:'❖',body:'勝利後可免費選一張卡牌，也可跳過。該職業未滿 5 張時會加入出戰牌組，滿額則放入備用收藏。從「牌組」調整搭配，從「裝備」管理戰利品。',tip:'留意事件、商店與營火節點。營火可補給；卡牌與裝備效果互相搭配，比單看稀有度更有用。'},
 {title:'準備好，向塔頂出發',label:'教學完成',icon:'✧',body:'先選小隊、看清敵人弱點，再用卡牌支援自動戰鬥。遇到不熟悉的技能，隨時打開選單查閱圖鑑與遊戲百科。',tip:'進度會在這個瀏覽器自動儲存。需要複習時，打開「遠征選單 → 設定 → 重看新手教學」。'}
];
function writeNewcomerRecord(status,step=0){
 const record={version:1,status,step};
 newcomerVisit.record=record;
 try{localStorage.setItem(NEWCOMER_TUTORIAL_KEY,JSON.stringify(record))}catch{}
}
function initNewcomerTutorial(){
 if(typeof saveRecoveryPending!=='undefined'&&saveRecoveryPending)return;
 if(!newcomerVisit.available)return;
 const record=newcomerVisit.record;
 if(record?.status==='active'){startNewcomerTutorial(false,record.step);return}
 if(record)return;
 if(newcomerVisit.returning){writeNewcomerRecord('existing');return}
 startNewcomerTutorial(false);
}
function startNewcomerTutorial(manual=true,step=0){
 if(newcomerSession)return;
 const index=Number.isInteger(step)?Math.max(0,Math.min(NEWCOMER_STEPS.length-1,step)):0;
 newcomerSession={manual,step:index,played:false,weakness:null,focusBefore:document.activeElement};
 if(!manual)writeNewcomerRecord('active',index);
 renderNewcomerTutorial();
}
function newcomerDemoHTML(){
 const played=newcomerSession.played;
 return `<div class="tutorial-practice" aria-label="獨立出牌練習"><div class="tutorial-demo-top"><span>能量 <b>${played?'2':'3'} / 5</b></span><small>練習場景</small></div><div class="tutorial-dummy ${played?'tutorial-dummy-hit':''}"><span aria-hidden="true">◆</span><div><b>練習魔像</b><small>弱點：斬 · 護盾 ${played?'0 · 失衡！':'1'}</small></div></div><button class="tutorial-demo-card" onclick="playNewcomerDemo()" ${played?'disabled':''}><span class="tutorial-card-cost">1</span><b>示範斬擊</b><small>${played?'已施放 · 消耗 1 能量':'斬屬性攻擊 · 點我出牌'}</small></button><p class="tutorial-demo-result" role="status">${played?'成功！能量 3 → 2，命中弱點，護盾 1 → 0。':'點選上方卡牌，觀察能量與敵人護盾。此練習不會消耗遠征中的資源。'}</p>${played?'<button class="tutorial-demo-reset" onclick="resetNewcomerDemo()">再試一次</button>':''}</div>`;
}
function renderNewcomerTutorial(){
 const t=newcomerSession;if(!t)return;
 const step=NEWCOMER_STEPS[t.step],last=t.step===NEWCOMER_STEPS.length-1;
 modal(`<article class="newcomer-tutorial" aria-labelledby="tutorial-title"><div class="tutorial-heading"><span class="eyebrow">EMBER SPIRE · 新手教學</span><span>${t.step+1} / ${NEWCOMER_STEPS.length}</span></div><div class="tutorial-progress" role="progressbar" aria-label="教學進度" aria-valuemin="1" aria-valuemax="${NEWCOMER_STEPS.length}" aria-valuenow="${t.step+1}">${NEWCOMER_STEPS.map((_,i)=>`<span class="${i<=t.step?'filled':''}" aria-hidden="true"></span>`).join('')}</div><div class="tutorial-emblem" aria-hidden="true">${step.icon}</div><small class="tutorial-label">${step.label}</small><h2 id="tutorial-title" tabindex="-1">${step.title}</h2><p class="tutorial-body">${step.body}</p>${t.step===3?newcomerDemoHTML():''}${t.step===1?'<div class="tutorial-roles"><span>琥珀 · 戰士</span><span>蒼羽 · 遊俠</span><span>莉亞 · 法師</span><span>艾莉希亞 · 騎士</span></div>':''}${t.step===4?newcomerWeaknessHTML():''}<p class="tutorial-tip">${step.tip}</p>${last?'<button onclick="finishNewcomerToEncyclopedia()">開啟遊戲百科 · 繼續查閱 →</button>':''}<div class="tutorial-actions"><button onclick="moveNewcomerTutorial(-1)" ${t.step===0?'disabled':''}>上一步</button><button class="primary" onclick="${last?'finishNewcomerTutorial(\'completed\')':'moveNewcomerTutorial(1)'}">${last?'完成 · 返回遠征':'下一步 →'}</button></div><button class="tutorial-skip" onclick="finishNewcomerTutorial('skipped')">${t.manual?'結束重看':'跳過教學'}</button></article>`);
 const dialog=$('modal');
 if(dialog.classList)dialog.classList.add('tutorial-dialog');
 if(dialog.setAttribute)dialog.setAttribute('aria-label','燼塔新手教學');
 const close=dialog.querySelector?.('.dialog-close');if(close)close.hidden=true;
 $('tutorial-title')?.focus?.();
}
function playNewcomerDemo(){if(!newcomerSession||newcomerSession.step!==3||newcomerSession.played)return;newcomerSession.played=true;renderNewcomerTutorial()}
function resetNewcomerDemo(){if(!newcomerSession||newcomerSession.step!==3)return;newcomerSession.played=false;renderNewcomerTutorial()}
function moveNewcomerTutorial(delta){
 const t=newcomerSession;if(!t||![-1,1].includes(delta))return;
 t.step=Math.max(0,Math.min(NEWCOMER_STEPS.length-1,t.step+delta));
 if(!t.manual)writeNewcomerRecord('active',t.step);
 renderNewcomerTutorial();
}
function finishNewcomerTutorial(status='skipped',alreadyClosed=false){
 const t=newcomerSession;if(!t)return;
 if(!t.manual)writeNewcomerRecord(status==='completed'?'completed':'skipped',t.step);
 newcomerSession=null;
 const dialog=$('modal');
 if(dialog.classList)dialog.classList.remove('tutorial-dialog');
 if(dialog.setAttribute)dialog.setAttribute('aria-label','遠征選單與詳細資訊');
 const close=dialog.querySelector?.('.dialog-close');if(close)close.hidden=false;
 if(!alreadyClosed)dialog.close?.();
 if(t.manual&&!alreadyClosed)showGameSettings();
 else t.focusBefore?.focus?.();
}
function showGameSettings(){
 modal('<div class="expedition-menu"><div class="eyebrow">EMBER SPIRE · SETTINGS</div><h2>設定</h2><section class="menu-group"><h3>教學與指南</h3><p>新手教學只會在首次加入時自動顯示，之後可隨時在此重看。</p><div class="expedition-menu-grid"><button onclick="startNewcomerTutorial(true)"><b>重看新手教學</b><small>小隊、出牌練習、弱點與戰後成長</small><span aria-hidden="true">›</span></button><button onclick="help()"><b>遊戲百科</b><small>分類查閱、搜尋玩法與職業規則</small><span aria-hidden="true">›</span></button></div></section><section class="menu-group"><h3>進度儲存</h3><p>遊戲會在目前的瀏覽器自動儲存遠征進度。</p></section><button onclick="showMobileBattleMenu()">← 返回遠征選單</button></div>');
}
if(typeof document.addEventListener==='function')document.addEventListener('DOMContentLoaded',()=>{
 const dialog=$('modal');
 dialog?.addEventListener('close',()=>finishNewcomerTutorial('skipped',true));
 dialog?.addEventListener('cancel',event=>{if(newcomerSession){event.preventDefault();finishNewcomerTutorial('skipped')}});
 initNewcomerTutorial();
},{once:true});

function newcomerWeaknessHTML(){
 const choice=newcomerSession.weakness,hit=choice==='ice';
 return `<div class="tutorial-practice"><h3>練習：選一張卡打破護盾</h3><p>練習魔像 · 弱點：冰 · 護盾 ${hit?'0 · 失衡！':'1'}</p><div class="tutorial-weakness-choices"><button onclick="chooseNewcomerWeakness('fire')" aria-pressed="${choice==='fire'}">火焰攻擊</button><button onclick="chooseNewcomerWeakness('ice')" aria-pressed="${hit}">冰霜攻擊</button></div><p class="tutorial-demo-result" role="status">${hit?'正確！冰命中弱點，護盾 1 → 0。接下來 3 秒受到傷害 ×1.5。':choice?'火不是這個敵人的弱點。一般傷害仍會造成，但這次不削弱點護盾，再試試冰霜攻擊。':'兩張都能攻擊，哪一張能削減弱點護盾？'}</p><small>獨立示範，不影響遠征進度。</small></div>`;
}
function chooseNewcomerWeakness(attribute){if(!newcomerSession||newcomerSession.step!==4||!['fire','ice'].includes(attribute))return;newcomerSession.weakness=attribute;renderNewcomerTutorial()}
function finishNewcomerToEncyclopedia(){finishNewcomerTutorial('completed');showGameEncyclopedia()}
