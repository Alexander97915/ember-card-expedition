'use strict';
// Each actor keeps its formation coordinates for the entire encounter.
const BATTLE_SPACE_REVISION=2;
const HERO_BATTLE_SLOTS=[[365,68],[240,110],[115,25]];
const ENEMY_BATTLE_SLOTS=[
 [680,68],[815,22],[880,114],[748,116],[895,65],[695,22],[812,67],[898,126],[765,22]
];
function battleSpaceActive(){return s?.phase==='battle'&&!!s.auto&&!sceneMotion?.travel}
function initBattleSpace(fresh=false){
 if(!s?.auto)return null;
 let space=s.auto.space;
 if(fresh||space?.revision!==BATTLE_SPACE_REVISION)space=s.auto.space={revision:BATTLE_SPACE_REVISION,heroes:{},enemies:{}};
 s.party.forEach((hero,slot)=>{
  const [x,y]=HERO_BATTLE_SLOTS[slot];space.heroes[hero.id]??={x,y};
 });
 enemyRoster().filter(e=>!e.areaPart).forEach((enemy,slot)=>{
  const [x,y]=ENEMY_BATTLE_SLOTS[slot%ENEMY_BATTLE_SLOTS.length];space.enemies[enemy.id]??={x,y};
 });
 return space;
}
function battleSpacePosition(unit,enemy=false){
 if(!s?.auto||!unit)return null;
 const id=enemy&&unit.areaPart?unit.areaOwnerId:unit.id;
 const side=enemy?'enemies':'heroes';
 return s.auto.space?.[side]?.[id]??initBattleSpace()?.[side][id]??null;
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
const depthSquadHTML=battleSquadHTML;
battleSquadHTML=function(){const html=depthSquadHTML();return battleSpaceActive()?battleSpaceDecorate(html):html};
const depthFormationHTML=enemyFormationHTML;
enemyFormationHTML=function(){const html=depthFormationHTML();return battleSpaceActive()?battleSpaceDecorate(html,true):html};
const depthBattleHTML=battleHTML;
battleHTML=function(){return depthBattleHTML(...arguments).replace('class="battlefield ','data-battle-depth="true" class="battlefield ')};
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
 const field=document.querySelector('[data-battle-depth="true"]');if(!field)return;
 let dock=field.querySelector('.depth-hud-dock');
 if(!dock){dock=document.createElement('div');dock.className='depth-hud-dock';dock.setAttribute('aria-label','隊伍與敵人戰鬥資訊');field.appendChild(dock)}
 for(const enemy of [false,true]){
  const nodes=field.querySelectorAll(enemy?'.field-enemy[data-enemy-id]':'.battle-actor[data-hero]');
  for(const node of nodes){
   const id=Number(enemy?node.dataset.enemyId:node.dataset.hero),unit=enemy?enemyRoster().find(e=>e.id===id):s.party.find(p=>p.id===id);if(!unit)continue;
   const p=battleSpacePosition(unit,enemy);if(!p)continue;
   node.style.setProperty('--depth-floor-lift',battleSpaceFloorLift(p.y).toFixed(3)+'px');node.style.setProperty('--depth-ground-fraction',(.62+p.y*.0022).toFixed(5));node.style.setProperty('--unit-x',(p.x/10).toFixed(3)+'%');node.style.setProperty('--unit-y',(38+p.y*.12).toFixed(3)+'%');node.style.setProperty('--unit-z',Math.round(100+p.y));
   const key=(enemy?'enemy-':'hero-')+id,selector=enemy?':scope > .enemy-label':':scope > .actor-hud',hud=node.querySelector(selector);
   if(hud){const old=dock.querySelector('[data-depth-hud="'+key+'"]');if(old)old.remove();hud.dataset.depthHud=key;hud.style.order=enemy?10+enemyRoster().indexOf(unit):s.party.indexOf(unit);hud.style.setProperty('--hud-span',enemy?Math.max(1,Math.floor(12/Math.max(1,enemyRoster().filter(e=>!e.areaPart&&e.hp>0).length))):4);dock.appendChild(hud);}
  }
 }
 for(const hud of dock.querySelectorAll('[data-depth-hud]')){const key=hud.dataset.depthHud,[side,id]=key.split('-');if(side==='enemy'&&!field.querySelector('.field-enemy[data-enemy-id="'+id+'"]'))hud.remove()}
 syncEnemySizeLayout(field);
}

// A paused save must receive the new presentation without waiting for a tick.
if(s?.phase==='battle'){initBattleSpace();render()}
