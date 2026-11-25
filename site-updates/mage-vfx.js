'use strict';
// Warm only effects reachable from this expedition's equipped cards.
function preloadMageDeckEffects(){
 if(!inParty(2))return;
 for(const key of new Set(s.deck)){
  if(C[key]?.owner!==2)continue;
  const school=MAGE_SCHOOL_VFX[key];
  if(school)preloadBattleImage(`assets/mage-vfx/${school.atlas}-atlas-v1.webp`);
  if(['frostbolt','coldrelease','frostmirror'].includes(key))preloadBattleImage('assets/mage-vfx/frost-atlas-v1.webp');
  if(['fireball','ignite','blackflame','skyfire'].includes(key))preloadBattleImage(`assets/mage-vfx/${key}-v1.webp`);
  if(key==='dragonflame'){
   for(let part=1;part<=4;part++)preloadBattleImage(`assets/mage-vfx/dragon-black-part${part}-v3.webp`);
   preloadBattleImage('assets/mage-vfx/dragon-breath-v2.webp');
   preloadBattleImage('assets/mage-vfx/dragon-black-fire-v1.webp');
  }
  if(key==='zeusavatar')for(let frame=0;frame<4;frame++)preloadBattleImage(`assets/mage-vfx/zeus-crown-laurel-v1-${frame}.webp`);
 }
}
// Visual snapshots only; damage, costs and status timers remain in the spell modules.
function mageVFXConfig(c){
 if(!c||c.owner!==2||c.casting)return null;
 const key=c.key,schoolDef=typeof MAGE_SCHOOL_VFX==='object'?MAGE_SCHOOL_VFX[key]:null;
 const fireDuration={fireball:900,ignite:1100,blackflame:1200,skyfire:1400}[key];
 if(!['frostbolt','coldrelease','frostmirror','dragonflame'].includes(key)&&!fireDuration&&!c.mirrorCount&&!schoolDef)return null;
 return {key,schoolFX:!!schoolDef,echo:!!c.freeEcho,arrows:key==='coldrelease'?(c.releaseArrowCount||1):key==='frostbolt'?1:0,mirrors:c.mirrorCount||0,fire:!!fireDuration,meteor:!!c.fireMeteor,emptyIgnite:!!c.emptyIgnite,duration:c.fireMeteor?750:schoolDef?.duration||fireDuration|| (key==='dragonflame'?3200:key==='coldrelease'?1200:key==='frostbolt'?650:800)};
}
let mageFireVisualEvents=[];
function mageFireCel(key,index){return `<i class="mage-fire-cel" style="background-image:url('assets/mage-vfx/${key}-v1.webp');background-position:${index%2*100}% ${Math.floor(index/2)*100}%" aria-hidden="true"></i>`}
function mageFireLocalHTML(key,mode='sequence',duration=1000,age=0,paused=false){
 const phases=mode==='meteor'||mode==='opening'?[1,2,3]:mode==='burst'||mode==='hit'?[2,3]:mode==='empty'?[0,3]:[0,1,2,3];
 return `<span class="mage-fire-local fire-${key} fire-mode-${mode} ${paused?'fire-vfx-paused':''}" style="--fire-duration:${duration}ms;--fire-age:-${age}ms" aria-hidden="true">${phases.map(n=>`<span class="mage-fire-phase fire-phase-${n}">${mageFireCel(key,n)}</span>`).join('')}</span>`;
}
function activeMageFireEvents(){mageFireVisualEvents=mageFireVisualEvents.filter(x=>x.battle===s.auto&&x.until>s.auto.clock);return mageFireVisualEvents}
function recordMageFireVFX(m){
 const v=m?.mageVFX;if(v?.key!=='skyfire'||s.phase!=='battle')return;
 const ids=(m.targetHits?.length?m.targetHits.map(h=>h.id):[m.enemyId]).filter(id=>id!=null),duration=v.meteor?750:1100;
 const primary=ids.includes(m.enemyId)?m.enemyId:ids[0];for(const id of ids){const mode=v.meteor?'meteor':id===primary?'opening':'burst',life=mode==='opening'?1400:duration;mageFireVisualEvents.push({battle:s.auto,id,mode,born:s.auto.clock,until:s.auto.clock+life,duration:life})}
 activeMageFireEvents();mageFireVisualEvents=mageFireVisualEvents.slice(-48);
}
function mageFireEventTargetsEnemy(id){return s.phase==='battle'&&activeMageFireEvents().some(x=>x.id===id)}
function mageFireEventsHTML(e){if(s.phase!=='battle')return '';return activeMageFireEvents().filter(x=>x.id===e.id).map(x=>mageFireLocalHTML('skyfire',x.mode,x.duration,s.auto.clock-x.born,s.auto.paused||document.hidden)).join('')}
function mageCel(index,extra='',dragon=false){
 if(dragon){
  const f=DRAGON_CEL_LAYOUT[index],id='dragon-clip-'+index,points=f.clip.map(p=>p.join(',')).join(' ');
  return `<svg class="mage-cel dragon-cel ${extra}" viewBox="0 0 1000 750" data-dragon-part="${f.part}" data-dragon-cel="${f.cell}" aria-hidden="true"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><polygon points="${points}"/></clipPath></defs><g transform="translate(${f.offset.join(' ')}) scale(${f.scale})"><image href="assets/mage-vfx/dragon-black-part${f.part}-v3.webp" width="${f.source[0]}" height="${f.source[1]}" clip-path="url(#${id})"/></g></svg>`;
 }
 const row=Math.floor(index/4),col=index%4;return `<i class="mage-cel ${extra}" style="background-position:${col*100/3}% ${row*100/2}%" aria-hidden="true"></i>`;
}
function mageDragonFramesHTML(breath=false){return Array.from({length:16},(_,i)=>`<span class="${breath?'breath':'dragon'}-frame ${breath?'breath':'dragon'}-frame-${i}"${breath?` style="--beam-origin-x:${DRAGON_BEAM_LAYOUT[i][0]};--flame-origin-y:${DRAGON_BEAM_LAYOUT[i][1]}"`:''}>${breath?`<i class="dragon-breath-cel" style="background-position:${i%4*100/3}% ${Math.floor(i/4)*100/3}%"></i>`:mageCel(i,'',true)}</span>`).join('')}
function mageBlackFlameHTML(extra=''){
 return `<span class="dragon-black-flame ${extra}" aria-hidden="true">${Array.from({length:4},(_,i)=>`<i class="dragon-black-fire-cel black-fire-cel-${i}" style="background-position:${i%2*100}% ${Math.floor(i/2)*100}%"></i>`).join('')}</span>`;
}
function mageDragonGroundPlacement(casterHeight,groundY,fieldHeight){
 const size=Math.max(1,Math.min(420,Math.max(230,casterHeight*2.3),(groundY-12)/.71,(fieldHeight-24)/.75));
 return {size,height:size*.75,top:groundY-size*.71};
}
function mageDragonForegroundHTML(){
 const anchors=[10,11,12].map(i=>DRAGON_CEL_LAYOUT[i].anchor);
 const style=anchors.map((a,i)=>`--mouth-${i}-x:${a[0]};--mouth-${i}-y:${a[1]}`).join(';');
 return `<span class="dragon-foreground" style="${style}" data-layer="foreground"><span class="dragon-black-burn">${mageBlackFlameHTML('black-burn-tail')}${mageBlackFlameHTML('black-burn-claws')}${mageBlackFlameHTML('black-burn-chest')}</span><span class="dragon-mouth-anchor"><span class="mage-dragon-breath" data-frames="16">${mageDragonFramesHTML(true)}</span><span class="dragon-sparks">${Array.from({length:18},(_,i)=>`<i class="dragon-spark" style="--spark-x:${.12+i/22};--spark-y:${(i%5-2)*16}px;--spark-phase:${i%4*35}ms">${rasterFXHTML('ember',{duration:600,age:i*35})}</i>`).join('')}</span><span class="dragon-heatwave">${[0,1,2].map(i=>`<i>${rasterFXHTML('heatwave',{duration:650,age:i*160})}</i>`).join('')}</span><span class="dragon-local-smoke">${[0,1,2].map(i=>`<i>${rasterFXHTML('smoke',{duration:1200,age:i*300})}</i>`).join('')}</span></span></span>`;
}
let mageDragonResidues=[],mageDragonResidueWall=null;
function recordMageDragonVFX(m){
 if(m?.mageVFX?.key!=='dragonflame'||s.phase!=='battle')return;
 const born=Date.now()+m.mageVFX.duration*13/16;
 m.dragonResidue={battle:s.auto,born,until:born+6000,left:35,width:50,top:70};
 mageDragonResidues.push(m.dragonResidue);mageDragonResidues=mageDragonResidues.filter(e=>e.battle===s.auto).slice(-6);mageDragonResidueWall=Date.now();
}
function mageDragonScorchHTML(){
 const now=Date.now();mageDragonResidues=mageDragonResidues.filter(e=>e.battle===s.auto&&e.until>now&&s.phase==='battle');
 return mageDragonResidues.filter(e=>e.born<=now).map(e=>`<i class="dragon-scorch ${s.auto.paused||document.hidden?'vfx-paused':''}" data-duration="6000" style="left:${e.left}%;width:${e.width}%;top:${e.top}%;--scorch-age:-${now-e.born}ms">${rasterFXHTML('scorch',{loop:false,duration:6000,age:now-e.born})}</i>`).join('');
}
function updateMageDragonResidue(){
 const now=Date.now(),delta=mageDragonResidueWall!=null?Math.max(0,now-mageDragonResidueWall):0;mageDragonResidueWall=now;
 if(s?.auto?.paused||document.hidden)for(const e of mageDragonResidues){e.born+=delta;e.until+=delta}
 const layer=document.querySelector?.('.dragon-scorch-layer');if(layer){const visible=mageDragonResidues.filter(e=>e.battle===s.auto&&e.born<=now&&e.until>now&&s.phase==='battle'),key=visible.map(e=>e.born+':'+e.until).join('|');if(layer._residueKey!==key){layer.innerHTML=mageDragonScorchHTML();layer._residueKey=key}layer.classList?.toggle?.('vfx-paused',!!(s.auto?.paused||document.hidden))}
}
function mageDragonLightingHTML(m=sceneMotion){
 const v=m?.mageVFX;if(v?.key!=='dragonflame')return '';
 const elapsed=Math.max(0,Date.now()-m.started);
 return `<div class="dragon-scene-lighting" style="--vfx-elapsed:-${elapsed}ms;--vfx-duration:${v.duration}ms" aria-hidden="true"><i class="dragon-scene-shade"></i><i class="dragon-ground-glow">${rasterFXHTML('heatwave',{duration:1800,age:elapsed%1800})}</i><i class="dragon-scene-firelight">${rasterFXHTML('ember',{duration:1200,age:elapsed%1200})}</i></div>`;
}
function mageMirrorHTML(p){
 if(p.id!==2||p.hp<=0||s.phase!=='battle')return '';
 const count=(s.auto?.frost?.mirrors||[]).filter(x=>x.until>s.auto.clock).length;
 if(!count)return '';
 const appearing=sceneMotion?.mageVFX?.key==='frostmirror';
 return `<span class="mage-mirror ${appearing?'mirror-appearing':''} ${s.auto.paused||document.hidden?'vfx-paused':''}" style="--mirror-phase:-${s.auto.clock%2400/1000}s" data-mirror-count="${count}" aria-hidden="true">${mageCel(10)}${mageCel(11,'mirror-shimmer')}</span>`;
}
function mageEnemyVFXHTML(e,m=sceneMotion){
 const v=m?.mageVFX,active=m?.enemyId===e.id||m?.targetHits?.some(h=>h.id===e.id);
 const frozen=e.status?.freezeUntil>s.auto.clock&&enemyFieldRank(e)!=='首領'&&!e.bossPattern;
 if(!v||!active)return frozen?'<span class="mage-target-vfx"><span class="mage-ice-prison ice-prison-held">'+rasterFXHTML('freeze',{duration:1600})+'</span></span>':'';
 const elapsed=Math.max(0,Date.now()-m.started);
 const style=`--vfx-elapsed:-${elapsed}ms;--vfx-duration:${v.duration}ms`;
 if(v.fire){
  if(v.key==='skyfire')return s.phase==='battle'&&!m.replaySource?'':mageFireLocalHTML('skyfire',v.meteor?'meteor':e.id===m.enemyId?'opening':'burst',v.duration,elapsed);
  return mageFireLocalHTML(v.key,v.emptyIgnite?'empty':v.key==='fireball'?'hit':'sequence',v.duration,elapsed);
 }
 if(v.key==='dragonflame')return `<span class="mage-target-vfx dragon-impact" style="${style}">${mageBlackFlameHTML('black-burn-target')}</span>`;
 if(!v.arrows)return '';
 return `<span class="mage-target-vfx ${v.key==='coldrelease'?'cold-release-impact':'frost-arrow-impact'}" style="${style}">${[4,5,6,7].map((n,i)=>`<span class="ice-burst-stage stage-${i}">${mageCel(n)}</span>`).join('')}${frozen&&v.key==='coldrelease'?'<span class="mage-ice-prison">'+rasterFXHTML('freeze',{duration:1600})+'</span>':''}</span>`;
}
function mageBattleVFXHTML(m=sceneMotion){
 const v=m?.mageVFX;if(!v)return '';
 const elapsed=Math.max(0,Date.now()-m.started),arrows=Array.from({length:v.arrows},(_,i)=>`<span class="mage-arrow-flight" style="--arrow-index:${i};--arrow-delay:${v.key==='coldrelease'?440+i*140:0}ms">${mageCel(2)}</span>`).join('');
 const copies=''; // Copies replay the original skill, rather than a generic ice arrow.
 const dragon=v.key==='dragonflame'?`<span class="mage-dragon-summon" data-frames="16">${mageDragonFramesHTML()}${mageDragonForegroundHTML()}</span>`:'';
 const fireball=v.key==='fireball'?`<span class="mage-fireball-launch">${mageFireCel('fireball',0)}</span><span class="mage-fireball-flight">${mageFireCel('fireball',1)}</span>`:'';
 return `<div class="mage-battle-vfx" data-skill="${v.key}" data-arrows="${v.arrows}" data-copies="${v.mirrors}" style="--vfx-elapsed:-${elapsed}ms;--vfx-duration:${v.duration}ms" aria-hidden="true">${arrows}${copies}${dragon}${fireball}</div>`;
}
function syncMageVFXLayout(m=sceneMotion,replayLayer=null){
 if(typeof document.querySelectorAll!=='function')return;
 const field=document.querySelector('.battlefield');if(!field)return;
 syncFrostImpactLayout(field,field.getBoundingClientRect().width/field.offsetWidth||1);
 const layer=replayLayer||field.querySelector('.mage-battle-vfx');if(!layer)return;
 const caster=field.querySelector('[data-hero="2"] .sprite-stage'),enemy=[...field.querySelectorAll('[data-enemy-id]')].find(e=>Number(e.dataset.enemyId)===m?.enemyId)?.querySelector('.enemy-sprite-target');
 if(!caster||!enemy)return;
 const f=field.getBoundingClientRect(),a=combatVisualBounds(caster.parentElement,true)||caster.getBoundingClientRect(),b=combatVisualBounds(enemy.closest?.('[data-enemy-id]'),false)||(enemy.querySelector('.enemy-art')||enemy).getBoundingClientRect(),scale=f.width/field.offsetWidth||1;
 const source=spriteEffectPoint(caster.parentElement,field,m?.mageVFX?.key||'fireball','source')||combatPointIn(a,field,.68,.42),target=spriteEffectPoint(enemy.closest?.('[data-enemy-id]'),field,'generic','target')||combatPointIn(b,field);
 layer.style.setProperty('--caster-x',source.x+'px');layer.style.setProperty('--caster-y',source.y+'px');
 layer.style.setProperty('--target-x',target.x+'px');layer.style.setProperty('--target-y',target.y+'px');
 // Actor wrapper remains still while the sprite-stage performs casting motions.
 const groundY=combatPointIn(a,field,.5,1).y;
 const {size,height,top}=mageDragonGroundPlacement(source.height,groundY,field.offsetHeight);
 const left=Math.max(12,source.x-size*.45);
 const lighting=replayLayer?.parentElement?.querySelector('.dragon-scene-lighting')||field.querySelector('.dragon-scene-lighting');lighting?.style.setProperty('--dragon-ground-y',groundY+'px');
 const mouthX=left+size*DRAGON_CEL_LAYOUT[10].anchor[0],mouthY=top+height*DRAGON_CEL_LAYOUT[10].anchor[1];
 // Long flame is outside the dragon's cropped cel. Feather only empty outer margins.
 const farthest=Math.max(...[...field.querySelectorAll('.enemy-sprite-target')].map(el=>(el.getBoundingClientRect().right-f.left)/scale));
 const available=Math.max(80,Math.min(f.width/scale-16,farthest)-mouthX),breathWidth=available/.78;
 layer.style.setProperty('--dragon-size',size+'px');layer.style.setProperty('--dragon-left',left+'px');layer.style.setProperty('--dragon-top',top+'px');
 layer.style.setProperty('--dragon-mouth-x',mouthX+'px');layer.style.setProperty('--dragon-mouth-y',mouthY+'px');layer.style.setProperty('--dragon-breath-width',breathWidth+'px');
 layer.style.setProperty('--dragon-breath-height',Math.min(200,height*.58)+'px');
 const residue=m?.dragonResidue;if(residue){
  residue.left=mouthX/field.offsetWidth*100;residue.width=Math.max(5,(farthest-mouthX)/field.offsetWidth*100);
  residue.top=Math.min(90,groundY/field.offsetHeight*100);
 }
}

function frostImpactSize(width,height){return Math.max(40,Math.min(76,Math.min(width,height)*.48))}
function syncFrostImpactLayout(field,scale){
 for(const impact of field.querySelectorAll('.frost-arrow-impact,.cold-release-impact')){
  const target=impact.closest('.enemy-sprite-target'),art=target?.querySelector('.enemy-art');if(!target||!art)continue;
  const a=combatVisualBounds(target.closest?.('[data-enemy-id]'),false)||art.getBoundingClientRect(),p=spriteUnitAnchor(target.closest?.('[data-enemy-id]'),'HitCenter',target,false)||combatPointIn(a,target,.5,.43,scale);
  impact.style.setProperty('--ice-impact-x',p.x+'px');
  impact.style.setProperty('--ice-impact-y',p.y+'px');
  impact.style.setProperty('--ice-impact-size',frostImpactSize(p.width,p.height)+'px');
 }
}

// Cosmetic replay snapshots never execute a spell or hold the battle input lock.
const MAGE_REPLAY_GAP=250;
function mageReplayDelay(duration,count=1){return (duration+MAGE_REPLAY_GAP)*count}
let mageSkillReplays=[],mageReplaySerial=0,mageReplayWall=null;
function activeMageSkillReplays(){
 const now=Date.now(),delta=mageReplayWall==null?0:Math.max(0,now-mageReplayWall);mageReplayWall=now;
 if(s?.auto?.paused||document.hidden||document.getElementById?.('modal')?.open)for(const e of mageSkillReplays){e.born+=delta;e.until+=delta;e.motion.started+=delta}
 mageSkillReplays=mageSkillReplays.filter(e=>e.battle===s?.auto&&e.until>now&&(s.phase==='battle'||['reward','win'].includes(s.phase)&&sceneMotion?.kind==='attack'));
 return mageSkillReplays;
}
function rememberMageMirrorHit(c,enemy,hit,index){
 c.replayMirrorHits??=[];c.replayMirrorHits[index]??=[];
 c.replayMirrorHits[index].push({id:enemy.id,damage:hit.damage,actual:hit.actual,criticalHits:0,newBreak:hit.newBreak});
}
function recordMageSkillReplay(c,result,source,index=0){
 if(!s?.auto||s.phase!=='battle')return;
 const v= mageVFXConfig({...c,mirrorCount:0})||(c.summonTitan?{key:'titanarrival',duration:1800}:null);if(!v)return;
 activeMageSkillReplays();
 const born=Date.now()+(c.replayDelay??mageReplayDelay(v.duration,index+1)),targets=(result.targetHits||[]).map(h=>({...h}));
 const motion={kind:'attack',started:born,enemyId:targets[0]?.id??s.enemy?.id,targetHits:targets,owners:[2],damage:result.damage||0,attr:c.sceneAttr||c.hits?.[0]?.[0]||'light',mageVFX:{...v,mirrors:0,echo:true},replaySource:source,support:!result.damage};
 mageSkillReplays.push({id:++mageReplaySerial,battle:s.auto,born,until:born+v.duration,source,motion,activated:false});
}
function recordMageMirrorReplays(c,m){
 if(c.freeEcho||!c.replayMirrorHits||c.mirrorReplaysRecorded)return;c.mirrorReplaysRecorded=true;
 c.replayMirrorHits.forEach((hits,i)=>{if(hits?.length)recordMageSkillReplay({...c,replayDelay:mageReplayDelay(m.mageVFX?.duration||m.duration||800,i+1)},{damage:hits.reduce((n,h)=>n+h.damage,0),targetHits:hits},'mirror',i)});
}
function readyMageSkillReplays(){return activeMageSkillReplays().filter(e=>e.born<=Date.now())}
function mageReplayTargetsEnemy(id){return activeMageSkillReplays().some(e=>e.motion.targetHits.some(h=>h.id===id))}
function mageReplayPauseClass(){return s.auto?.paused||document.hidden||document.getElementById?.('modal')?.open?'mage-replay-paused':''}
function mageReplayEnemyContent(e){return readyMageSkillReplays().filter(r=>r.motion.targetHits.some(h=>h.id===e.id)).map(r=>`<span class="mage-replay-target ${mageReplayPauseClass()}" data-replay-source="${r.source}">${mageEnemyVFXHTML(e,r.motion)}</span>`).join('')}
function mageReplayEnemyHTML(e){return `<span class="mage-replay-enemy-slot" data-replay-enemy="${e.id}" aria-hidden="true">${mageReplayEnemyContent(e)}</span>`}
function mageReplayHeroContent(p){
 if(p.id!==2)return '';
 return readyMageSkillReplays().filter(r=>r.motion.mageVFX.key==='frostmirror').map(r=>`<span class="mage-mirror mirror-appearing mage-replay-mirror ${mageReplayPauseClass()}" style="--mirror-phase:-${(Date.now()-r.born)/1000}s" data-replay-source="${r.source}">${mageCel(10)}${mageCel(11,'mirror-shimmer')}</span>`).join('');
}
function mageReplayHeroHTML(p){return `<span class="mage-replay-hero-slot" data-replay-hero="${p.id}" aria-hidden="true">${mageReplayHeroContent(p)}</span>`}
function mageReplayFieldContent(){
 return readyMageSkillReplays().map(e=>{
  const m=e.motion,titan=m.mageVFX.key==='titanarrival'&&livingTitan()?titanFieldHTML({titan:livingTitan(),state:'summon',started:e.born}):'';
  return `<span class="mage-replay-event ${mageReplayPauseClass()} ${titan?'mage-replay-titan':''}" data-replay-event="${e.id}" data-replay-source="${e.source}">${mageBattleVFXHTML(m)}${mageDragonLightingHTML(m)}${titan}</span>`;
 }).join('');
}
function mageReplayFieldHTML(){return `<div class="mage-replay-field-slot" aria-hidden="true">${mageReplayFieldContent()}</div>`}
function updateMageSkillReplays(){
 for(const e of readyMageSkillReplays())if(!e.activated){e.activated=true;if(e.motion.mageVFX.schoolFX)recordMageSchoolVFX(e.motion);if(e.motion.mageVFX.key==='dragonflame')recordMageDragonVFX(e.motion)}
 if(typeof document.querySelectorAll!=='function')return;
 const replace=(el,html)=>{if(el.innerHTML!==html)el.innerHTML=html};
 for(const el of document.querySelectorAll('[data-replay-enemy]')){const enemy=enemyRoster().find(e=>e.id===Number(el.dataset.replayEnemy));if(enemy)replace(el,mageReplayEnemyContent(enemy))}
 for(const el of document.querySelectorAll('[data-replay-hero]')){const p=s.party.find(p=>p.id===Number(el.dataset.replayHero));if(p)replace(el,mageReplayHeroContent(p))}
 const field=document.querySelector('.mage-replay-field-slot');if(field)replace(field,mageReplayFieldContent());
 for(const el of document.querySelectorAll('[data-replay-event]')){const e=mageSkillReplays.find(e=>e.id===Number(el.dataset.replayEvent));if(e)syncMageVFXLayout(e.motion,el.querySelector('.mage-battle-vfx'))}
 const actual=document.querySelector('.battlefield > .earth-titan-field.titan-full');for(const titan of document.querySelectorAll('.mage-replay-titan .earth-titan-field')){const size=actual?.style?.getPropertyValue('--titan-size');if(size)titan.style.setProperty('--titan-size',size)}
}
