'use strict';
// Logical world coordinates are independent of viewport, sprite size and animation.
const BATTLE_SPACE_REVISION=1;
function battleSpaceActive(){return s?.phase==='battle'&&!!s.auto&&!sceneMotion?.travel}
function battleSpaceEnemy(e){return e?.areaPart?enemyRoster().find(x=>x.id===e.areaOwnerId)||e:e}
function battleSpaceRadius(unit,enemy=false){return enemy?Math.max(65,Math.min(145,(typeof enemySizeProfile==='function'?enemySizeProfile(unit).ratio:1)*65)):unit.id===3&&typeof knightVisualMount==='function'&&knightVisualMount()?95:75}
function battleSpaceRange(unit,enemy=false){if(!enemy)return [60,290,330,32,345,60][unit.id]??290;const motion=enemyAppearance(unit).motion||'';return /ranged|magic|cast|projectile/.test(motion)||/Archer|Mage|Shaman|Priest/i.test(unit.kind||'')?285:38}
function initBattleSpace(fresh=false){
 if(!s?.auto)return null;
 let space=s.auto.space;
 if(fresh||space?.revision!==BATTLE_SPACE_REVISION)space=s.auto.space={revision:BATTLE_SPACE_REVISION,heroes:{},enemies:{}};
 space.heroes??={};space.enemies??={};
 const valid=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=35&&p.x<=965&&p.y>=10&&p.y<=135&&Number.isFinite(p.lane);
 s.party.forEach((p,i)=>{if(!valid(space.heroes[p.id]))space.heroes[p.id]={x:330-i*60,y:[68,110,25][i%3],lane:[68,110,25][i%3],moving:!s.training};});
 enemyRoster().filter(e=>!e.areaPart).forEach((e,i)=>{if(!valid(space.enemies[e.id]))space.enemies[e.id]={x:Math.min(880,740+(i%3)*45+Math.floor(i/3)*80),y:[68,22,114][i%3],lane:[68,22,114][i%3],moving:!e.trainingDummy};});
 return space;
}
function battleSpacePosition(unit,enemy=false){const a=initBattleSpace();if(!a)return null;return (enemy?a.enemies:a.heroes)[(enemy?battleSpaceEnemy(unit):unit)?.id]||null}
function battleSpaceDistance(a,b){return Math.hypot(a.x-b.x,(a.y-b.y)*.85)}
function battleSpaceTarget(unit,enemy=false){
 if(enemy){if(unit.target==='titan')return null;return s.party[unit.target]?.hp>0?s.party[unit.target]:s.party.find(p=>p.hp>0)}
 return livingEnemies().find(e=>e.id===s.targetEnemyId)||livingEnemies()[0];
}
function battleSpaceInRange(unit,enemy=false){
 if(!battleSpaceActive()||s.training)return true;
 const target=battleSpaceTarget(unit,enemy);if(!target)return enemy&&unit.target==='titan';
 const a=battleSpacePosition(unit,enemy),b=battleSpacePosition(target,!enemy);if(!a||!b)return true;
 return battleSpaceDistance(a,b)<=battleSpaceRange(unit,enemy)+battleSpaceRadius(unit,enemy)+battleSpaceRadius(target,!enemy)+2;
}
function battleSpaceMoving(unit,enemy=false){return battleSpaceActive()&&!!battleSpacePosition(unit,enemy)?.moving}
function tickBattleSpace(dt){
 if(!battleSpaceActive())return false;initBattleSpace();let changed=false;
 const enemies=enemyRoster().filter(e=>!e.areaPart&&e.hp>0);
 for(const e of enemies)withEnemy(e,()=>planEnemy());
 for(const enemy of [false,true]){
  const units=enemy?enemies:s.party;
  for(const unit of units){
   const p=battleSpacePosition(unit,enemy),target=battleSpaceTarget(unit,enemy);if(!p)continue;
   const was=p.moving;p.moving=false;
   const locked=unit.hp<=0||(enemy?(unit.trainingDummy||unit.broken||Math.max(unit.status?.stunUntil||0,unit.status?.freezeUntil||0)>s.auto.clock||unit.charging):(heroControlled(unit)||heroCasting(unit.id)||(unit.id===5&&typeof selState==='function'&&selState().charge)));
   if(!locked&&target){
    const q=battleSpacePosition(target,!enemy);if(q){
     const reach=battleSpaceRange(unit,enemy)+battleSpaceRadius(unit,enemy)+battleSpaceRadius(target,!enemy);
     const out=battleSpaceDistance(p,q)>reach-4;
     if(out){
      const y=Math.max(10,Math.min(135,q.y*.25+p.lane*.75));
      const horizontal=Math.sqrt(Math.max(1,(reach-9)**2-((y-q.y)*.85)**2));
      const x=Math.max(45,Math.min(955,q.x+(enemy?1:-1)*horizontal));
      let dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy),step=Math.min(d,(enemy?105:145)*dt/1000);
      if(d>.8){p.x+=dx/d*step;p.y+=dy/d*step;p.moving=step>.05;}
     }
    }
   }
   if(was!==p.moving)changed=true;
  }
  // Soft spacing within each side; avoid pushing units past their targets.
  const live=units.filter(u=>u.hp>0);
  for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){
   const a=battleSpacePosition(live[i],enemy),b=battleSpacePosition(live[j],enemy);if(!a||!b)continue;
   const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=enemy?37:42;
   if(d<min){const n=Math.min((min-d)*.5,dt*.018),sign=dy?Math.sign(dy):j%2?1:-1;a.y=Math.max(10,Math.min(135,a.y-sign*n));b.y=Math.max(10,Math.min(135,b.y+sign*n));}
  }
 }
 return changed;
}
// All lanes stay within the lower ground strip, independent of screen height.
function battleSpaceFloorLift(y){return Math.max(0,Math.min(60,(135-y)*.48))}
function battleSpaceStyle(unit,enemy=false){const p=battleSpacePosition(unit,enemy);return p?`--depth-floor-lift:${battleSpaceFloorLift(p.y).toFixed(3)}px;--depth-ground-fraction:${(.62+p.y*.0022).toFixed(5)};--unit-x:${(p.x/10).toFixed(3)}%;--unit-y:${(38+p.y*.12).toFixed(3)}%;--unit-z:${Math.round(100+p.y)};`:''}
function battleSpaceDecorate(html,enemy=false){
 return html.replace(enemy?/(data-enemy-id="(\d+)"[^>]*?style=")/g:/(data-hero="(\d+)"[^>]*?style=")/g,(all,prefix,id)=>{
  const unit=enemy?enemyRoster().find(e=>e.id===Number(id)):s.party.find(p=>p.id===Number(id));return prefix+(unit?battleSpaceStyle(unit,enemy):'');
 });
}
const depthPrepareAuto=prepareAuto;
prepareAuto=function(fresh=false){const result=depthPrepareAuto(...arguments);initBattleSpace(fresh);return result};
const depthActorState=actorState;
actorState=function(p){const state=depthActorState(p);return state==='idle'&&battleSpaceMoving(p)?'walk':state};
const depthEnemyState=enemyVisualState;
enemyVisualState=function(e){const state=depthEnemyState(e);return state==='idle'&&battleSpaceMoving(e,true)?'walk':state};
const depthEnemyFrames=enemySpriteFrames;
enemySpriteFrames=function(state,def){return state==='walk'?(def?.animationMap?.walk||def?.animationMap?.run||depthEnemyFrames('idle',def)):depthEnemyFrames(...arguments)};
const depthSquadHTML=battleSquadHTML;
battleSquadHTML=function(){const html=depthSquadHTML();return battleSpaceActive()?battleSpaceDecorate(html):html};
const depthFormationHTML=enemyFormationHTML;
enemyFormationHTML=function(){const html=depthFormationHTML();return battleSpaceActive()?battleSpaceDecorate(html,true):html};
const depthBattleHTML=battleHTML;
battleHTML=function(){return depthBattleHTML(...arguments).replace('class="battlefield ','data-battle-depth="true" class="battlefield ')};
const depthActionGauge=actorActionGaugeState;
actorActionGaugeState=function(p){const gauge=depthActionGauge(p);return gauge.mode==='attack'&&battleSpaceMoving(p)?{...gauge,label:'接敵中 · 進入射程後攻擊'}:gauge};
const depthAutoHUD=updateAutoHUD;
updateAutoHUD=function(){depthAutoHUD(...arguments);syncBattleSpaceDOM()};
const depthRender=render;
render=function(){const out=depthRender(...arguments);syncBattleSpaceDOM();return out};
// Preserve existing anatomical sizing with one fixed canvas for each encounter.
const depthSizeLayout=syncEnemySizeLayout;
syncEnemySizeLayout=function(field){
 if(!field?.matches?.('[data-battle-depth="true"]'))return depthSizeLayout(...arguments);
 const ref=enemyPlayerReferenceHeight(field);if(!ref)return;
 for(const unit of field.querySelectorAll('.field-enemy[data-enemy-id]')){
  const e=enemyRoster().find(e=>e.id===Number(unit.dataset.enemyId)),art=unit.querySelector('.enemy-art');if(!e||!art)continue;
  const metrics=enemySizeMetrics(e),profile=enemySizeProfile(e),rect=field.getBoundingClientRect();
  const canvas=Math.min(ref*profile.ratio*700/Math.max(1,metrics.height),rect.height*.76*700/Math.max(1,650-metrics.envelope[1]),rect.width*(profile.category==='boss'?.42:.22)*700/Math.max(1,metrics.envelope[2]-metrics.envelope[0]));
  art.style.setProperty('--normalized-enemy-canvas',canvas.toFixed(2)+'px');unit.style.setProperty('--depth-enemy-height',(canvas*(650-metrics.body[1])/700).toFixed(2)+'px');
  unit.dataset.sizeClass=profile.category;unit.dataset.sizeRatio=profile.ratio.toFixed(3);
 }
};
function syncBattleSpaceDOM(){
 if(!battleSpaceActive()||typeof document.querySelectorAll!=='function')return;
 const field=document.querySelector('[data-battle-depth="true"]');if(!field)return;field.dataset.spacePaused=String(!!(s.auto.paused||document.hidden||$('modal')?.open));
 let dock=field.querySelector('.depth-hud-dock');
 if(!dock){dock=document.createElement('div');dock.className='depth-hud-dock';dock.setAttribute('aria-label','隊伍與敵人戰鬥資訊');field.appendChild(dock)}
 for(const enemy of [false,true]){
  const nodes=field.querySelectorAll(enemy?'.field-enemy[data-enemy-id]':'.battle-actor[data-hero]');
  for(const node of nodes){
   const id=Number(enemy?node.dataset.enemyId:node.dataset.hero),unit=enemy?enemyRoster().find(e=>e.id===id):s.party.find(p=>p.id===id);if(!unit)continue;
   const p=battleSpacePosition(unit,enemy);if(!p)continue;
   node.style.setProperty('--depth-floor-lift',battleSpaceFloorLift(p.y).toFixed(3)+'px');node.style.setProperty('--depth-ground-fraction',(.62+p.y*.0022).toFixed(5));node.style.setProperty('--unit-x',(p.x/10).toFixed(3)+'%');node.style.setProperty('--unit-y',(38+p.y*.12).toFixed(3)+'%');node.style.setProperty('--unit-z',Math.round(100+p.y));node.dataset.moving=String(p.moving);
   const key=(enemy?'enemy-':'hero-')+id,selector=enemy?':scope > .enemy-label':':scope > .actor-hud',hud=node.querySelector(selector);
   if(hud){const old=dock.querySelector('[data-depth-hud="'+key+'"]');if(old)old.remove();hud.dataset.depthHud=key;hud.style.order=enemy?10+enemyRoster().indexOf(unit):s.party.indexOf(unit);hud.style.setProperty('--hud-span',enemy?Math.max(1,Math.floor(12/Math.max(1,enemyRoster().filter(e=>!e.areaPart&&e.hp>0).length))):4);dock.appendChild(hud);}
  }
 }
 for(const hud of dock.querySelectorAll('[data-depth-hud]')){const key=hud.dataset.depthHud,[side,id]=key.split('-');if(side==='enemy'&&!field.querySelector('.field-enemy[data-enemy-id="'+id+'"]'))hud.remove()}
 syncEnemySizeLayout(field);
}

// A paused save must receive the new presentation without waiting for a tick.
if(s?.phase==='battle'){initBattleSpace();render()}
