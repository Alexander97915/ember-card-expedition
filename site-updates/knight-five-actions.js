'use strict';
// Presentation-only, driven by the existing pause-aware presentation clock. No damage, resources,
// combat jobs, saved fields, RNG, cooldowns or game rules are changed here.
const KNIGHT_FIVE_KEYS=Object.freeze({knightmend:'chain',knightaegis:'retribution',knightcovenant:'blood',knightresonance:'spear',knightredemption:'seal'});
const KNIGHT_FIVE_TIMING=Object.freeze({
 'chain:cast':{frames:[0,1],duration:650,priority:2},'chain:counter':{frames:[2,3],duration:560,priority:3},
 'retribution:cast':{frames:[0,1],duration:650,priority:2},'retribution:block':{frames:[1,2],duration:460,priority:1},'retribution:release':{frames:[2,3],duration:850,priority:4},
 'blood:cast':{frames:[0,1],duration:650,priority:2},'blood:thrust':{frames:[2,3],duration:650,priority:3},
 'spear:cast':{frames:[0,1,2,3],duration:900,priority:3},
 'seal:cast':{frames:[0,1],duration:650,priority:2},'seal:rescue':{frames:[2,3],duration:850,priority:4}
});
let knightFiveBattle=null,knightFiveMotion=null,knightFiveSerial=0,knightFiveProtected=null;
function knightFiveClock(){return warriorVFXClock()}
function knightFiveHero(){return s?.party?.find(p=>p.id===3)}
function knightFiveSync(){
 if(knightFiveBattle!==s?.auto){knightFiveBattle=s?.auto;knightFiveMotion=null;knightFiveProtected=null}
 const p=knightFiveHero(),now=knightFiveClock();
 if(!p||p.hp<=0||heroControlled(p)||!['battle','reward','win'].includes(s?.phase))knightFiveMotion=null;
 if(knightFiveMotion&&now>=knightFiveMotion.until)knightFiveMotion=null;
 if(knightFiveProtected&&now>=knightFiveProtected.until)knightFiveProtected=null;
 return knightFiveMotion;
}
function knightFiveStart(key,stage='cast'){
 knightFiveSync();const p=knightFiveHero(),spec=KNIGHT_FIVE_TIMING[key+':'+stage],now=knightFiveClock();
 if(!spec||!s?.auto||!p||p.hp<=0||heroControlled(p)||!['battle','reward','win'].includes(s.phase))return;
 if(knightFiveMotion&&knightFiveMotion.priority>spec.priority&&now-knightFiveMotion.born<280)return;
 const duration=reduceMotion()?180:spec.duration;
 knightFiveMotion={id:++knightFiveSerial,key,stage,frames:spec.frames,priority:spec.priority,born:now,until:now+duration,duration,battle:s.auto};
}
function knightFiveFrame(m=knightFiveSync()){
 if(!m)return null;const n=reduceMotion()?m.frames.length-1:Math.min(m.frames.length-1,Math.floor(Math.max(0,knightFiveClock()-m.born)/m.duration*m.frames.length));return m.frames[n];
}
function knightFiveBodyAllowed(){return !knightVisualFrames(3,'idle')&&!(typeof aliciaAscensionState==='function'&&aliciaAscensionState())}
function knightFiveArtHTML(m){
 const index=knightFiveFrame(m),f=KNIGHT_FIVE_FRAMES[m.key][index],v=SPRITE_CONTRACT.heroCanvas;
 return `<span class="hero-poses knight-five-poses" data-sprite-profile="alicia:base" data-sprite-animation="alicia:base/knight-five-${m.key}" data-sprite-frame="${index}" data-knight-five-id="${m.id}" data-knight-five-key="${m.key}" data-knight-five-stage="${m.stage}" data-knight-five-frame="${index}" data-combat-view="${v.join(' ')}" style="--pose-left:${v[0]/418};--pose-width:${v[2]/418};--pose-height:${v[3]/418};--pose-bottom:${(440-v[1]-v[3])/418}">${heroCelHTML(f,3,'knight-five-'+m.key,index)}</span>`;
}
// Add these explicitly authored actions to the existing sprite/anchor catalog.
for(const [key,frames]of Object.entries(KNIGHT_FIVE_FRAMES)){
 const entry={id:'alicia:base/knight-five-'+key,profile:'alicia:base',state:'knight-five-'+key,frames,skill:true};spriteCatalog().push(entry);spriteEntryIndex.set(entry.id,entry);frames.forEach((f,index)=>spriteFrameMap.set(f,{entry,index}));
}
const KNIGHT_FIVE_BASE={sprite:heroSpriteHTML,actor:actorState,hud:updateAutoHUD,card:animateCard,auto:animateAuto,fx:knightRecordOathFX,hit:knightOathAfterEnemyHit,release:knightReleaseRetribution,basic:knightVengeanceAfterBasic,rescue:knightResolveRescue,tags:abilityTags};
heroSpriteHTML=function(id,state,phantom=false,...args){const m=Number(id)===3&&!phantom?knightFiveSync():null;if(!m)return KNIGHT_FIVE_BASE.sprite(id,state,phantom,...args);
 if(knightFiveBodyAllowed())return knightFiveArtHTML(m);
 // Mounted and winged forms keep their correct bodies and existing action cels.
 return KNIGHT_FIVE_BASE.sprite(id,state,phantom,...args).replace('class="hero-poses',`data-knight-five-rider="${m.key}" class="hero-poses knight-five-rider`);
};
actorState=function(p){const m=p.id===3?knightFiveSync():null;return m?(m.stage==='cast'&&m.key!=='spear'?'cast':'attack'):KNIGHT_FIVE_BASE.actor(p)};
animateCard=function(c,...args){const key=c?.owner===3&&KNIGHT_FIVE_KEYS[c.key];if(key)knightFiveStart(key);return KNIGHT_FIVE_BASE.card(c,...args)};
animateAuto=function(m,...args){const c=m?.cardEffect,key=c?.owner===3&&KNIGHT_FIVE_KEYS[c.key];if(key&&!c.freeEcho)knightFiveStart(key);return KNIGHT_FIVE_BASE.auto(m,...args)};
knightRecordOathFX=function(enemy,key){const result=KNIGHT_FIVE_BASE.fx(enemy,key);if(key==='knightmend'&&s?.auto?.skills?.[3]?.chainTransferring)knightFiveStart('chain','counter');return result};
knightOathAfterEnemyHit=function(p,...args){const before=s?.auto?.skills?.[3]?.retribution?.stacks||0,result=KNIGHT_FIVE_BASE.hit(p,...args);if(p.id===3&&(s?.auto?.skills?.[3]?.retribution?.stacks||0)>before)knightFiveStart('retribution','block');return result};
knightReleaseRetribution=function(...args){const release=!!s?.auto?.skills?.[3]?.retribution,result=KNIGHT_FIVE_BASE.release(...args);if(release)knightFiveStart('retribution','release');return result};
knightVengeanceAfterBasic=function(p,...args){const pending=p.id===3&&!!s?.auto?.skills?.[3]?.bloodPact,result=KNIGHT_FIVE_BASE.basic(p,...args);if(pending&&!s?.auto?.skills?.[3]?.bloodPact)knightFiveStart('blood','thrust');return result};
knightResolveRescue=function(p,rescue,...args){const trigger=rescue?.heal>0&&p.hp>0,result=KNIGHT_FIVE_BASE.rescue(p,rescue,...args);if(trigger){knightFiveStart('seal','rescue');knightFiveProtected={id:p.id,until:knightFiveClock()+850}}return result};
abilityTags=function(p){const base=KNIGHT_FIVE_BASE.tags(p);knightFiveSync();let extra='';if(knightFiveProtected?.id===p.id)extra+='<small class="buff-tag knight-five-rescue-tag">✧ 救贖聖印 · 保命觸發</small>';if(p.id===3){const st=s?.auto?.skills?.[3];if(st?.retribution?.until>(s.auto?.clock||0))extra+='<small class="buff-tag knight-five-charge-tag">'+Array.from({length:Math.min(5,st.retribution.stacks||0)},()=>'<i>✧</i>').join('')+'</small>'}return base+extra};
function updateKnightFiveArt(){
 const m=knightFiveSync(),p=knightFiveHero();if(!p)return;const unit=document.querySelector?.('.battle-actor.knight-sprite');if(!unit?.querySelector)return;const art=unit.querySelector('.hero-poses');if(!art?.dataset)return;
 const active=m&&knightFiveBodyAllowed();if(active){const index=knightFiveFrame(m);if(art.dataset.knightFiveId!==String(m.id)||art.dataset.knightFiveFrame!==String(index))art.outerHTML=knightFiveArtHTML(m)}else if(m){if(art.dataset.knightFiveRider!==m.key)art.outerHTML=heroSpriteHTML(3,KNIGHT_FIVE_BASE.actor(p))}else if(art.dataset.knightFiveId||art.dataset.knightFiveRider)art.outerHTML=KNIGHT_FIVE_BASE.sprite(3,KNIGHT_FIVE_BASE.actor(p));
}
updateAutoHUD=function(...args){const result=KNIGHT_FIVE_BASE.hud(...args);updateKnightFiveArt();return result};
