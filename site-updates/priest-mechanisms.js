'use strict';
// Decisions and deadlines live in battle state, so pause and resume are exact.
function priestPendingCast(e){if(e?.areaBossState?.pending)return e.areaBossState.pending;if(e?.rosterPending)return e.rosterPending;if(e?.regionTelegraph)return e.regionTelegraph;if(e?.charging){if(e.priestChargeStop?.count!==e.attackCount)e.priestChargeStop={count:e.attackCount};return e.priestChargeStop}return null}
function priestStill(e){
 const cast=priestPendingCast(e),now=priestNow();if(!cast||cast.priestStillUsed)return false;
 cast.priestStillUsed=true;if(Number.isFinite(cast.due))cast.due+=2000;
 setEnemyAttackDue(enemyAttackDue(e)+2000,e);
 // Shift both expiration and periodic ticks; existing negative effects do not tick during the stop.
 for(const key of Object.keys(e.status||{}))if(/^(burn|poison|bleed|freeze|stun|chill|slow|windErosion|warriorSlam|priestResist|thunderMark|knightSpearShred)/.test(key)&&/(Until|At)$/.test(key)&&Number.isFinite(e.status[key])&&e.status[key]>=now)e.status[key]+=2000;
 if(e.status.priestSeal?.until>now)e.status.priestSeal.until+=2000;
 e.status.priestStillUntil=now+2000;log(e.name+'的施法與既有負面狀態計時暫停 2 秒。');return true;
}
function priestRing(){
 const st=priestState(),bell=st.bells;if(!bell)return false;delete st.bells;
 const e=enemyRoster().find(e=>e.id===bell.enemyId&&e.hp>0);if(e&&bell.owners.length){priestHit(e,priestPower()*.8*bell.owners.length,'末日鐘聲',bell.attr);log('末日鐘聲 · '+bell.owners.length+' 聲引爆！');if(e.hp<=0)victory()}return true;
}
function priestRecordCard(c){
 const bell=priestState().bells;if(!bell||c.freeEcho)return;
 const owners=c.owners||[c.owner];for(const id of owners)if(Number.isInteger(id)&&inParty(id)&&!bell.owners.includes(id))bell.owners.push(id);
 if(bell.owners.length>=3)priestRing();
}
const priestMechanismResolveBefore=priestResolve;
priestResolve=function(c,origin){
 const st=priestState(),now=priestNow();if(st.silence){delete st.silence;log('使用牧師卡，無聲彌撒提前取消。')}
 switch(c.key){
 case 'priestconfess':{
  const i=st.confessIndex;delete st.confessIndex;
  if(Number.isInteger(i)&&i>=0&&i<s.hand.length){const [key]=s.hand.splice(i,1);s.discard.push(key);const played=s.discard.lastIndexOf(c.key);if(played>=0)s.discard.splice(played,1);priestGain(2);if(C[key]?.priest)draw(1);log('告解：棄掉「'+C[key].name+'」，本張告解本場移除。')}
  break;
 }
 case 'prieststill':priestStill(s.enemy);break;
 case 'priestsilence':st.silence={due:now+4000};break;
 case 'priestbells':st.bells={enemyId:s.enemy.id,due:now+8000,owners:[],attr:priestAttr()};break;
 }
 return priestMechanismResolveBefore(c,origin);
};
const priestMechanismReasonBefore=cardUseBlockedReason;
cardUseBlockedReason=function(c){
 const old=priestMechanismReasonBefore(c);if(old||!c?.priest)return old;
 if(c.key==='priestconfess'&&s.hand.length<2)return '需要另一張手牌可棄掉';
 if(c.key==='prieststill'){const cast=priestPendingCast(s.enemy);if(!cast)return '目標目前沒有施法';if(cast.priestStillUsed)return '本次施法已暫停過'}
 return '';
};
function priestCancelConfess(){if(s.auto){delete priestState().confessChoice;render()}}
function priestChooseConfess(i){
 const st=priestState(),choice=st.confessChoice;if(!choice||!Number.isInteger(i)||i<0||i>=s.hand.length||i===choice.index)return;
 if(s.hand[choice.index]!=='priestconfess'){priestCancelConfess();return}
 delete st.confessChoice;
 if(cardUseBlockedReason(C.priestconfess)||mageEffectiveCost(C.priestconfess)>s.energy){render();return}
 st.confessIndex=i>choice.index?i-1:i;
 try{priestMechanismPlayBefore(choice.index)}finally{delete st.confessIndex}
 priestRecordCard(C.priestconfess);
}
const priestMechanismPlayBefore=play;
play=function(i){
 if(s.phase!=='battle'||busy||s.auto?.paused)return;
 const st=priestState();if(st.confessChoice){priestChooseConfess(i);return}
 const c=C[s.hand[i]];if(!c||!canUse(c)||mageEffectiveCost(c)>s.energy)return;
 if(c.key==='priestconfess'){st.confessChoice={index:i};render();return}
 const priorBell=st.bells;priestMechanismPlayBefore(i);
 if(priestLive()&&s.phase==='battle'&&st.bells===priorBell)priestRecordCard(c);
};
const priestMechanismBlockedBefore=autoBlocked;
autoBlocked=function(){return priestMechanismBlockedBefore()||!!(s.auto&&priestState().confessChoice)};
const priestMechanismHandBefore=handPanelHTML;
handPanelHTML=function(){
 if(!s.auto?.skills?.[4]?.confessChoice)return priestMechanismHandBefore();
 const chosen=priestState().confessChoice.index;
 return '<div class="hand-toolbar"><h2>告解：選擇要棄掉的手牌</h2><p>選擇期間戰鬥暫停；棄掉牧師卡額外抽 1 張。</p><button onclick="priestCancelConfess()">取消</button></div><div class="cards hand-cards" aria-label="告解棄牌選擇">'+s.hand.map((key,i)=>card(key,'priestChooseConfess('+i+')',i===chosen)).join('')+'</div>';
};
const priestMechanismTickBefore=priestTick;
priestTick=function(){
 let changed=!!priestMechanismTickBefore();if(!s.auto||s.phase!=='battle')return changed;
 const st=priestState(),now=priestNow();
 if(st.silence&&(!priestLive()||now>=st.silence.due)){const success=priestLive();delete st.silence;if(success){draw(2);priestGain(2);log('無聲彌撒完成：抽 2 張牌，祈願 +2。')}changed=true}
 if(st.bells&&(now>=st.bells.due||!enemyRoster().some(e=>e.id===st.bells.enemyId&&e.hp>0)))changed=priestRing()||changed;
 return changed;
};
const priestMechanismTagsBefore=abilityTags;
abilityTags=function(p){let html=priestMechanismTagsBefore(p);if(p.id!==4||!s.auto)return html;const st=priestState(),now=priestNow();if(st.silence)html+='<small class="buff-tag">無聲彌撒 '+Math.max(0,(st.silence.due-now)/1000).toFixed(1)+'秒</small>';if(st.bells)html+='<small class="buff-tag">末日鐘聲 '+st.bells.owners.length+'/3 · '+Math.max(0,(st.bells.due-now)/1000).toFixed(1)+'秒</small>';return html};
