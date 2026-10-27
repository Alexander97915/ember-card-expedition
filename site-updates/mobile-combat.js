'use strict';
const MOBILE_COMBAT_QUERY='(pointer:coarse), (max-width:700px), (max-width:1000px) and (max-height:500px)';
function mobileCombatLayout(){return typeof matchMedia==='function'&&matchMedia(MOBILE_COMBAT_QUERY).matches}
function updateMobileCombat(){
 const status=$('mobile-battle-status');if(status)status.textContent=s.training?'訓練場':`第 ${currentStage().chapter+1} 章 · ${s.floor+1} 層`;
 if(typeof syncCombatEffectLayout==='function')syncCombatEffectLayout();
}
function showMobileBattleMenu(){
 const battle=s.phase==='battle';
 const groups=[{name:'小隊整備',items:[['showDeck()','牌組調整',battle?'下場戰鬥生效':'挑選出戰與備用卡'],['showEquipment()','裝備管理','武器、防具與流派'],['showMobileBattleInfo()','戰況與日誌','隊伍、輸出與傷害計算']]},
 {name:'圖鑑與指南',items:[['showSkillBook()','職業技能','瀏覽各職業技能與流派'],['showBestiary()','怪物圖鑑','弱點、能力與遭遇紀錄'],['showGearCodex()','裝備圖鑑','全部裝備、能力與搭配卡牌'],['help()','遊戲百科','搜尋玩法、入門教學與戰鬥規則']]},
 {name:'設定',items:[['showGameSettings()','設定','重看新手教學與玩法指南']]},
 {name:'探索與練習',items:[['showExpeditionMetrics()','時間與效能','遠征統計與裝置取樣'],['showTrainingSetup()','訓練場','自由測試卡牌與裝備'],['showCharacterArt()','角色立繪','查看冒險者立繪'],['showSpriteVisualLab()','視覺測試室','逐格檢視角色、錨點與尺寸']] }];
 modal('<div class="expedition-menu"><div class="eyebrow">EMBER SPIRE · EXPEDITION</div><h2>遠征選單</h2><p class="menu-context">'+journalEscape($('progress').textContent)+(battle?' · 選單開啟時暫停戰鬥':'')+'</p>'+groups.map(g=>'<section class="menu-group"><h3>'+g.name+'</h3><div class="expedition-menu-grid">'+g.items.map(([action,title,desc])=>'<button onclick="'+action+'"><b>'+title+'</b><small>'+desc+'</small><span aria-hidden="true">›</span></button>').join('')+'</div></section>').join('')+'<div class="menu-footer"><span>進度自動儲存</span><button class="menu-restart" onclick="restart()">'+(s.training?'離開訓練場':'開始新遠征')+'</button></div></div>');
}
function showMobileBattleInfo(){
 const stats=battleStatsHTML(),journal=(s.battleJournal?.entries||[]).slice(-20).reverse();
 modal('<h2>戰況與隊伍</h2><p>'+journalEscape($('progress').textContent)+'</p>'+stats+
 '<div class="mobile-party-info">'+renderParty()+'</div><h3>最近戰鬥紀錄</h3>'+
 (journal.length?journal.map(battleJournalEntryHTML).join(''):'<p>目前沒有戰鬥紀錄。</p>'));
}
function showMobileCardInfo(key){
 const c=C[key];if(!c)return;
 modal('<div class="mobile-card-inspect">'+card(key,"document.querySelector('dialog').close()",false)+
 '<div><h2>'+journalEscape(c.name)+'</h2><p>'+journalEscape(c.desc)+'</p><p>'+journalEscape(ownerLabel(c))+' · '+c.cost+' 能量</p>'+
 '<p>'+journalEscape(handCardState(key)||'可出牌；關閉後點選卡牌或拖向敵人。')+'</p></div></div>');
}
// Long press opens readable details. Movement cancels inspection and keeps drag casting.
if(typeof document.addEventListener==='function'){
 let press=null,ignoreClickUntil=0;
 const cancel=()=>{if(press)clearTimeout(press.timer);press=null};
 document.addEventListener('pointerdown',e=>{
  if(!mobileCombatLayout()||s.phase!=='battle'||e.button!==0)return;
  const el=e.target.closest?.('[data-hand-index]');if(!el)return;
  const key=s.hand[Number(el.dataset.handIndex)];if(!C[key])return;
  cancel();press={id:e.pointerId,key,x:e.clientX,y:e.clientY,opened:false};
  press.timer=setTimeout(()=>{if(!press||s.phase!=='battle'||!s.hand.includes(key))return;press.opened=true;ignoreClickUntil=Date.now()+700;showMobileCardInfo(key)},450);
 },true);
 document.addEventListener('pointermove',e=>{if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10)cancel()},true);
 document.addEventListener('pointerup',()=>{if(press?.opened)ignoreClickUntil=Date.now()+500;cancel()},true);
 document.addEventListener('pointercancel',cancel,true);
 document.addEventListener('click',e=>{if(Date.now()<ignoreClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
 if(typeof window!=='undefined')window.addEventListener('resize',cancel);
}
