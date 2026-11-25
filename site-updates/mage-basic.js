'use strict';
// Four-cel authored missiles. Flight rendering never owns gameplay damage/timers.
const MAGE_BASIC_PROFILES={
 normal:{attr:'none',name:'銀紫魔法飛彈',effect:'無屬性魔法傷害'},
 fire:{attr:'fire',name:'龍首烈焰彈',effect:'命中附加 1 層灼燒，沿用既有灼燒時間'},
 ice:{attr:'ice',name:'霜晶槍',effect:'命中緩速 15%／2 秒；不縮短或降低已有緩速'},
 thunder:{attr:'thunder',name:'雷霆三叉槍',effect:'彈射另一名存活敵人，主擊傷害 30%；不遞迴觸發普攻效果'},
 earth:{attr:'earth',name:'金紋岩晶重彈',effect:'每三次有效主擊破甲，目標物理承傷 +10%／3 秒'}
};
const MAGE_BASIC_ASSETS={normal:'assets/mage-basic/normal-flight-v1.webp',fire:'assets/mage-basic/fire-flight-v1.webp',ice:'assets/mage-basic/ice-flight-v1.webp',thunder:'assets/mage-basic/thunder-flight-v1.webp',earth:'assets/mage-basic/earth-flight-v1.webp'};
function mageBasicProfile(){const form=activeMageForm()||'normal';return {form,...MAGE_BASIC_PROFILES[form]}}
function mageBasicAfterImpact(p,payload,result,targetHits){
 if(p.id!==2||!result.actual||!payload.mageBasicForm)return;
 const form=payload.mageBasicForm,e=s.enemy,now=s.auto.clock;
 if(form==='fire'&&e.hp>0)addBurnStacks(e,1,2);
 if(form==='ice'&&e.hp>0)applyStatus({owner:2,slow:.15,slowDuration:Math.max(2000,(e.status.slowUntil||0)-now)});
 if(form==='earth'){
  const state=abilityState(2);state.earthBasicCount=((state.earthBasicCount||0)+1)%3;
  if(state.earthBasicCount===0&&e.hp>0){e.status.mageRockBreakUntil=now+3000;log('岩晶破甲：'+e.name+'物理承傷 +10%，3 秒。')}
 }
 if(form==='thunder'){
  const target=livingEnemies().find(t=>t.id!==e.id);if(!target)return;
  const hit=magePassiveDamage(target,[['thunder',result.damage*.3]],'雷霆普攻彈射',{resolved:true});
  targetHits.push({id:target.id,damage:hit.damage,actual:hit.actual,newBreak:false,criticalHits:0});result.damage+=hit.damage;
  if(typeof recordMageLightningTransfer==='function')recordMageLightningTransfer(e.id,target.id);
 }
}
function mageBasicScene(m){return !!(m?.kind==='attack'&&m.auto&&m.owners?.length===1&&m.owners[0]===2&&!m.cardEffect&&m.mageBasicForm)}
function mageBasicProjectileHTML(m){if(!mageBasicScene(m))return '';const form=MAGE_BASIC_ASSETS[m.mageBasicForm]?m.mageBasicForm:'normal';return '<span class="lia-basic-flight" data-mage-basic="'+form+'" style="--lia-flight-duration:'+(m.duration||400)+'ms;--lia-flight-age:-'+rasterMotionAge()+'ms;--lia-flight-play:'+(combatEffectPaused()?'paused':'running')+'" aria-hidden="true"><span class="lia-basic-sprite" style="background-image:url('+MAGE_BASIC_ASSETS[form]+')"></span></span>'}
function mageBasicGuideHTML(){return '<section class="mage-passive-book"><h3>型態普攻</h3>'+Object.entries(MAGE_BASIC_PROFILES).map(([form,p])=>'<p><b>'+({normal:'普通型態',fire:'火覺醒',ice:'冰覺醒',thunder:'雷覺醒',earth:'土覺醒'}[form])+' · '+p.name+'</b><br>'+p.effect+'</p>').join('')+'</section>'}

let mageBasicArtLoaded=false;
function preloadMageBasicArtwork(){if(mageBasicArtLoaded||typeof Image!=='function'||!inParty(2))return;mageBasicArtLoaded=true;for(const asset of Object.values(MAGE_BASIC_ASSETS)){preloadBattleImage(asset);}}
