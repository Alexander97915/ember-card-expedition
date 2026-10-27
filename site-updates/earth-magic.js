'use strict';
// Earth resources and summon timers use the saved, paused logical battle clock.
const EARTH_LAYER_LIMIT=20;
function earthState(){return s.auto.earth??={layers:0,stoneSkin:false,titan:null}}
function livingTitan(){const t=s.auto?.earth?.titan;return s.phase==='battle'&&t?.hp>0?t:null}
function mageStoneSkin(p){return p?.id===2&&(hasGearEffect(2,'stoneMantle')||!!s.auto?.earth?.stoneSkin)}
function mageStoneMitigation(p){return p?.id===2&&hasGearEffect(2,'stoneMantle')?.5:mageStoneSkin(p)?.6:1}
function titanStoneMitigation(t){return hasGearEffect(2,'stoneMantle')?.5:t.stoneSkin?.6:1}
function heroCanDodge(p){return p?.id===2&&hasGearEffect(2,'stoneMantle')||!mageStoneSkin(p)}
function earthSkillAllowed(c){return !c.summonTitan||(s.auto?.earth?.layers||0)>0}
function gainEarthLayers(c){
 const earth=earthState(),before=earth.layers,added=Math.min(c.earthLayers||0,EARTH_LAYER_LIMIT-before);
 earth.armorProgress??=before%5;const progress=earth.armorProgress+added;
 c.extraEarthBlock=Math.floor(progress/5)*6;earth.armorProgress=progress%5;earth.layers=before+added;
}
function prepareEarthSkill(c){const earth=earthState();if(c.rockWall){earth.rockWall=true;log('岩壁成形：抵擋下一次敵方範圍攻擊，最多 1 座。')}if(c.earthLayers)gainEarthLayers(c);
 if(c.owner===2&&((c.hits||[]).some(([attr])=>attr==='earth')||c.summonTitan))c.earthDamageAmp=1+earth.layers*.05;
 if(c.quake&&earth.layers>=3){earth.layers-=3;c.stun=800;log('地震波消耗 3 層岩層，全體暈眩 0.8 秒。')}
 if(c.stoneSkin){earth.stoneSkin=true;if(livingTitan())earth.titan.stoneSkin=true;log('岩石型態：受到傷害 −40%，無法閃避；持續本場戰鬥。')}
 if(c.summonTitan){const layers=earth.layers;if(!layers)return;earth.layers=0;c.titanSummoned=true;earth.titan={hp:layers*12,max:layers*12,layers,attack:Math.floor((6+layers)*(c.spellAmp||1)),nextAttack:s.auto.clock+2000,stoneSkin:mageStoneSkin(s.party[slotOf(2)])};log('融合 '+layers+' 層岩層，召喚 '+layers*12+' HP 泰坦！');for(const e of livingEnemies())withEnemy(e,()=>planEnemy())}
}
// Jobs carry the resolved spell snapshot, not a new cast. No payment, counter,
// layer consumption, Zeus cadence or extra frost-arrow activation occurs here.
function queueQuakeAftershocks(c){
 if(s.phase!=='battle'||!c.quakeAftershockHits?.length)return;
 const now=s.auto.clock;
 for(let i=0;i<2;i++){
  const base=c.quakeAftershockHits[i];if(!base)continue;
  const hits=[[base[0],c.freeEcho?(base[1]+s.strength)*.4:base[1]]];
  s.auto.jobs.push({key:c.key,owner:2,due:now+(i+1)*1000,hits,quakeAftershock:true,quakeStage:i+1,freeEcho:!!c.freeEcho,elementEcho:!!c.elementEcho,mageDirectAmp:c.mageDirectAmp||1,mirrorCount:c.freeEcho?0:c.mirrorCount||0,mirrorRatio:frostMirrorRatio(c),spellAmp:c.spellAmp||1,damageTrace:[{label:c.freeEcho?'宙斯 · 餘震快照':'三重餘震 · 施法快照',hits:hits.map(h=>[...h]),note:'餘震 '+(i+1)+'/2；基礎土 5，沿用本次施法的岩層、靜電與增傷；不重複消耗資源'}]});
 }
}
function hurtTitan(amount){amount*=knightEnemyAttackFactor();const t=livingTitan();if(!t)return 0;const damage=Math.ceil(amount*titanStoneMitigation(t)),actual=Math.min(t.hp,damage);t.hp=Math.max(0,t.hp-damage);recordBattleJournal({kind:'taken',title:(s.enemy?.name||'敵方')+' → 泰坦',amount:actual,total:damage,steps:[{label:'岩石減傷',value:amount+' × '+titanStoneMitigation(t)+' → 向上取整 = '+damage},{label:'實際扣血',value:'min('+journalNumber(t.hp+actual)+', '+damage+') = '+actual,note:'泰坦剩餘 HP '+t.hp}]});log('泰坦承受 '+actual+' 傷害。');if(!t.hp){titanDeathVisual={titan:t,started:Date.now()};log('泰坦崩解，敵人恢復選擇隊伍目標。');for(const e of livingEnemies())withEnemy(e,()=>planEnemy())}return actual}
function tickTitan(){const t=livingTitan();if(!t||t.nextAttack>s.auto.clock||!livingEnemies().length)return false;t.nextAttack=s.auto.clock+2000;const target=livingEnemies().find(e=>e.id===s.targetEnemyId)||livingEnemies()[0];let result;
 withEnemy(target,()=>{result=damageEnemy([['earth',t.attack]],2,{preparedHits:[['earth',t.attack]],skipResource:true,noCrit:true,label:'泰坦重拳'});});
 log('泰坦重拳：'+result.damage+' 土傷害。');if(target.hp<=0)victory();if(s.phase==='battle')animateAuto({kind:'titanAttack',auto:true,enemyId:target.id,cardName:'泰坦重拳 · '+result.damage+' 土傷害',damage:result.damage,duration:350});return true;
}
function enemyTargetName(e){return e.target==='titan'&&livingTitan()?'泰坦':HEROES[s.party[e.target]?.id??0].name}
function earthHUDHTML(){const a=s.auto?.earth;if(s.phase!=='battle'||!a)return '';const t=livingTitan();return `<div class="earth-resource-panel"><span>${skillIconHTML('rockarmor')}岩層 <b>${a.layers} / ${EARTH_LAYER_LIMIT}</b></span>${a.rockWall?`<span>${skillIconHTML('rockwall')}岩壁 · 範圍防護 1 次</span>`:''}${mageStoneSkin(s.party[slotOf(2)])?`<span>${skillIconHTML('stoneskin')}${hasGearEffect(2,'stoneMantle')?'岩石表皮 · 減傷 50% · 可閃避':'岩石型態 · 減傷 40% · 無法閃避'}</span>`:''}${t?`<span>${skillIconHTML('titanarrival')}泰坦 <b>${t.hp} / ${t.max} HP</b> · 全體嘲諷${titanStoneMitigation(t)<1?' · 減傷 '+Math.round((1-titanStoneMitigation(t))*100)+'%':''} · 重拳 ${t.attack}／2 秒</span>`:''}</div>`}
// Four separately generated sheets, split into native-resolution aligned cels.
const TITAN_FRAME_ASSETS=Object.fromEntries(['summon','idle','attack','collapse'].map(state=>[state,Array.from({length:4},(_,i)=>'assets/titan-animation/'+state+'-'+(i+1)+'-v5.webp')]));
let titanFramesPreloaded=false,titanDeathVisual=null;
function preloadTitanFrames(){if(titanFramesPreloaded||typeof Image!=='function')return;titanFramesPreloaded=true;for(const src of Object.values(TITAN_FRAME_ASSETS).flat()){const image=new Image();image.src=src}}
function titanVisualState(){
 if(s.phase!=='battle')return null;const t=s.auto?.earth?.titan;if(!t)return null;
 if(t.hp<=0)return titanDeathVisual?.titan===t&&Date.now()-titanDeathVisual.started<500&&['titanHurt','hurt'].includes(sceneMotion?.kind)?{titan:t,state:'collapse',started:titanDeathVisual.started}:null;
 return {titan:t,state:sceneMotion?.titanSummon?'summon':sceneMotion?.kind==='titanAttack'?'attack':'idle',started:sceneMotion?.started||0};
}
function titanFieldHTML(visual=titanVisualState()){
 if(!visual)return '';const {titan:t,state,started}=visual,duration=state==='summon'?1800:state==='attack'||state==='collapse'?350:2400,elapsed=state==='idle'?Date.now()%duration:Math.max(0,Date.now()-started),paused=state==='idle'&&(s.auto.paused||document.hidden),reduced=reduceMotion();
 const frames=TITAN_FRAME_ASSETS[state].map((src,i)=>'<img class="titan-cel" src="'+src+'" alt="" width="700" height="700" decoding="async" style="--frame-index:'+i+'">').join('');
 return '<aside class="earth-titan-field titan-animated titan-full titan-'+state+(paused?' titan-paused':'')+(reduced?' titan-reduced':'')+'" data-titan-state="'+state+'" aria-label="泰坦，生命 '+t.hp+'/'+t.max+'，'+(state==='collapse'?'崩解':'全體嘲諷')+'" style="--titan-duration:'+duration+'ms;--titan-delay:-'+elapsed+'ms"><div class="titan-full-viewport" aria-hidden="true"><span class="titan-ground-shadow"></span>'+frames+(t.stoneSkin&&t.hp>0&&typeof mageSchoolPaintHTML==='function'?'<span class="titan-stone-overlay" data-titan-stone-skin="true">'+mageSchoolPaintHTML('stoneskin','loop',1600,s.auto.clock%1600,'school-on-titan')+'</span>':'')+'</div><div class="titan-label"><b>'+ (state==='collapse'?'泰坦崩解':'泰坦 · '+t.hp+'/'+t.max)+'</b>'+healthGaugeHTML('titan',t.hp,t.max)+'<small>'+ (state==='collapse'?'岩層散落':'全體嘲諷'+(t.stoneSkin?' · 岩石表皮':''))+'</small></div></aside>';
}

function titanSizeForHeroHeight(height){const p=SPRITE_CONTRACT.summons.titan;return height*p.heightRatio*p.canvasHeight/p.bodyHeight}
function syncTitanLayout(){
 if(typeof document.querySelectorAll!=='function')return;
 const field=document.querySelector('.battlefield'),titan=field?.querySelector('.earth-titan-field.titan-full'),poses=field?.querySelector('[data-hero="2"] .hero-poses');
 if(!titan||!poses)return;
 const unit=poses.closest?.('[data-hero]'),body=unit&&spriteUnitAnchor(unit,'Center',field,true),feet=unit&&spriteUnitAnchor(unit,'Feet',field,true);
 if(body&&feet){
  titan.style.setProperty('--titan-size',titanSizeForHeroHeight(body.height)+'px');
  titan.style.setProperty('--titan-anchor-x',feet.x+SPRITE_CONTRACT.summons.titan.offset[0]+'px');
  titan.style.setProperty('--titan-anchor-bottom',(field.offsetHeight-feet.y)+'px');return;
 }
 const frames=mageFormFrames('idle')||HERO_FRAME_LAYOUT[2].idle;
 const tops=frames.map(f=>f.displayBounds?.[1]??((f.bounds?.[1]??0)*f.scale+f.offset[1])),bottoms=frames.map(f=>f.displayBounds?.[3]??((f.bounds?.[3]??f.source[1])*f.scale+f.offset[1]));
 const visibleHeight=poses.offsetHeight*(Math.max(...bottoms)-Math.min(...tops))/HERO_SPRITE_VIEWBOX[3];
 if(visibleHeight>0)titan.style.setProperty('--titan-size',titanSizeForHeroHeight(visibleHeight)+'px');
}
if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener('resize',syncTitanLayout);

// Consume at the area-action boundary: one charge protects every ally and every
// hit in that action before shields, redirection, retaliation or ailments run.
function consumeMageRockWall(label){if(s.phase!=='battle'||!s.auto?.earth?.rockWall||!alive().length)return false;s.auto.earth.rockWall=false;s.auto.specialReactionHits=[];if(typeof mageGearWallBlocked==='function')mageGearWallBlocked();log('岩壁抵擋「'+label+'」：全隊免受本次範圍傷害，岩壁崩解。');recordBattleJournal({kind:'taken',title:'岩壁 · '+label,amount:0,steps:[{label:'岩壁抵擋',value:'本次範圍攻擊全部傷害 → 0',note:'消耗 1 座岩壁；護盾、坐騎、泰坦與生命不受損，也不觸發受擊效果'}]});return true}
function mageRockWallHTML(){return s.phase==='battle'&&s.auto?.earth?.rockWall?'<aside class="mage-rock-wall" aria-label="岩壁：可抵擋一次敵方範圍攻擊">'+(typeof mageSchoolPaintHTML==='function'?mageSchoolPaintHTML('rockwall','loop',2400,s.auto.clock%2400,'rock-wall-art'):'')+'<small>岩壁 · 範圍防護 1 次</small></aside>':''}
