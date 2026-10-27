'use strict';
// Legacy registration is preserved. No frame is fitted to its own silhouette.
let spriteCatalogCache=null;
const spriteFrameMap=new WeakMap(),spritePreparedFrames=new WeakMap();
const spriteCustomProfiles=new Map(),spriteDOMFrameCache=new WeakMap(),spriteDOMArtCache=new WeakMap(),spriteEnemySpecCache=new Map(),spriteEntryIndex=new Map();
function spriteProfile(key){
 if(!key)return undefined;
 if(spriteCustomProfiles.has(key))return spriteCustomProfiles.get(key);
 if(key.startsWith('lia:')&&!SPRITE_CONTRACT.profiles[key])return {...SPRITE_CONTRACT.profiles['lia:base'],label:'莉亞 · '+key.split(':')[1]};
 return SPRITE_CONTRACT.profiles[key];
}
function spriteAnchors(profile){
 const b=profile.body,feet=profile.canvas?profile.legacyFeet:SPRITE_CONTRACT.feet,c=[(b[0]+b[2])/2,(b[1]+b[3])/2];
 return {Feet:[...feet],Center:c,Head:[...profile.head],MainHand:[...profile.main],OffHand:[...profile.off],CastOrigin:[...profile.main],ProjectileOrigin:[...profile.main],HitCenter:c};
}
function spriteCatalog(){
 if(spriteCatalogCache)return spriteCatalogCache;
 const catalog=[];
 const add=(profile,state,frames,extra={})=>{
  if(!frames?.length)return;
  const entry={id:profile+'/'+state,profile,state,frames,...extra};catalog.push(entry);spriteEntryIndex.set(entry.id,entry);
  frames.forEach((f,i)=>{if(!spriteFrameMap.has(f))spriteFrameMap.set(f,{entry,index:i})});
 };
 const states=['idle','attack','walk','cast','hurt','fallen'];
 for(const [id,key] of ['kohaku:single','sou:base','lia:base','alicia:base'].entries()){
  if(!HERO_FRAME_LAYOUT[id])continue;
  for(const state of states)add(key,state,id===1&&state==='idle'?souIdleFrames():HERO_FRAME_LAYOUT[id][state]||HERO_FRAME_LAYOUT[id].idle,{fallback:!HERO_FRAME_LAYOUT[id][state]});
 }
 if(HERO_FRAME_LAYOUT[3]?.guard)add('alicia:base','guard',HERO_FRAME_LAYOUT[3].guard);
 for(const state of states)add('kohaku:dual',state,state==='walk'?KOHAKU_DUAL_RUN_FRAMES:KOHAKU_DUAL_FRAMES[state]||(state==='hurt'||state==='fallen'||state==='cast'?[KOHAKU_DUAL_FRAMES.idle[0]]:KOHAKU_DUAL_FRAMES.idle));
 for(const [form,actions] of Object.entries(typeof WARRIOR_ACTION_FRAMES==='undefined'?{}:WARRIOR_ACTION_FRAMES))for(const [state,frames] of Object.entries(actions))add('kohaku:'+form,state,frames,{skill:true});
 for(const [form,sets]of Object.entries(typeof WARRIOR_BASIC_ATTACK_FRAMES==='undefined'?{}:WARRIOR_BASIC_ATTACK_FRAMES))sets.forEach((frames,i)=>add('kohaku:'+form,'basic-'+i,frames,{skill:true}));
 for(const [form,frames]of Object.entries(typeof BLOOD_RAGE_FRAMES==='undefined'?{}:BLOOD_RAGE_FRAMES))add('kohaku:'+form,'bloodrage',frames,{skill:true});
 if(typeof SOU_BASIC_ATTACK_FRAMES!=='undefined')SOU_BASIC_ATTACK_FRAMES.forEach((frames,i)=>add('sou:base','basic-'+i,frames));
 if(typeof SOU_CHANT_FRAMES!=='undefined')add('sou:base','chant',SOU_CHANT_FRAMES);add('lia:base','chant',LIA_CHANT_FRAMES);
 for(const state of ['idle','attack','walk','hurt','fallen'])add('sou:phantom',state,state==='idle'?souIdleFrames():HERO_FRAME_LAYOUT[1][state]||HERO_FRAME_LAYOUT[1].idle,{instanceOnly:true});
 for(const [form,sets]of Object.entries(MAGE_FORM_FRAMES))for(const state of states)add('lia:'+form,state,sets[state]||(state==='attack'||state==='cast'?sets.attack:sets.idle),{fallback:!sets[state]});
 for(const [form,sets]of Object.entries(typeof KNIGHT_MOUNT_FRAMES==='undefined'?{}:KNIGHT_MOUNT_FRAMES))for(const state of [...states,'guard'])add('alicia:'+form,state,sets[state]||sets.idle,{fallback:!sets[state]});
 if(typeof ALICIA_ASCENSION_FRAMES!=='undefined')add('alicia:base','ascension',ALICIA_ASCENSION_FRAMES);
 spriteCatalogCache=catalog;return catalog;
}
function spriteFrameContext(f){spriteCatalog();return spriteFrameMap.get(f)}
// Only explicitly measured animation references override the legacy shared density.
function spriteHeadTarget(f){return SPRITE_CONTRACT.headSize.measuredTargets?.[f.spriteAnimation]||SPRITE_CONTRACT.headSize.target}
const spriteHeadSizeCache=new WeakMap();
function spriteNormalizeHeadSize(f){
 if(f.headSizeRevision===1)return f;
 if(spriteHeadSizeCache.has(f))return spriteHeadSizeCache.get(f);
 // Head length excludes hair, ears, horns and halos. Legacy artwork retains
 // its shared reference density until anatomical landmarks are registered.
 const measured=f.riderHeadSpan||f.headSpan;
 const original=measured?measured*f.scale:(f.riderHeadWorldSize||f.headWorldSize||SPRITE_CONTRACT.headSize.legacyReference);
 const target=spriteHeadTarget(f),factor=target/original,feet=f.footAnchor||SPRITE_CONTRACT.feet;
 const point=p=>p.map((n,i)=>feet[i]+(n-feet[i])*factor);
 const bounds=b=>b?.map((n,i)=>feet[i%2]+(n-feet[i%2])*factor);
 const frame={...f,viewBox:SPRITE_CONTRACT.heroCanvas,scale:f.scale*factor,offset:point(f.offset),displayBounds:bounds(f.displayBounds),bodyBounds:bounds(f.bodyBounds),
  anchors:f.anchors&&Object.fromEntries(Object.entries(f.anchors).map(([key,p])=>[key,point(p)])),
  headSizeRevision:1,headSizeConfidence:measured?'measured-source':'legacy-reference',headWorldSize:target};
 if(f.riderHeadWorldSize)frame.riderHeadWorldSize=target;
 if(f.riderWorldAnchor)frame.riderWorldAnchor=point(f.riderWorldAnchor);
 if(f.riderEyeWorldAnchor)frame.riderEyeWorldAnchor=point(f.riderEyeWorldAnchor);
 if(f.sourcePixelsPerLogicalUnit)frame.sourcePixelsPerLogicalUnit=1/frame.scale;
 if(f.weaponParts)frame.weaponParts=f.weaponParts.map(p=>({...p,worldBounds:bounds(p.worldBounds)}));
 spriteHeadSizeCache.set(f,frame);return frame;
}
function spriteFrame(f){
 if(f.spriteSchemaVersion===1)return spriteNormalizeHeadSize(f);
 if(spritePreparedFrames.has(f))return spriteNormalizeHeadSize(spritePreparedFrames.get(f));
 const meta=spriteFrameContext(f);if(!meta)return f;
 const {entry}=meta,p=spriteProfile(entry.profile),from=f.footAnchor||(entry.state==='walk'?[209,430]:p.legacyFeet),feet=p.canvas?p.legacyFeet:SPRITE_CONTRACT.feet;
 const multiplier=(SPRITE_CONTRACT.overrides[entry.id]||SPRITE_CONTRACT.overrides[entry.profile])?.scale||1;
 const offset=f.offset.map((v,i)=>feet[i]+(v-from[i])*multiplier),scale=f.scale*multiplier;
 const bounds=(f.displayBounds||f.bounds?.map((n,i)=>n*f.scale+f.offset[i%2]))?.map((v,i)=>feet[i%2]+(v-from[i%2])*multiplier);
 const anchors=spriteAnchors(p);
 // Profile anchors are logical body landmarks; only authored hand grips follow the pose.
 for(const [name,v]of Object.entries(anchors))anchors[name]=v.map((n,i)=>feet[i]+(n-feet[i])*multiplier);
 if(f.eyeAnchor)anchors.Head=f.eyeAnchor.map((n,i)=>offset[i]+n*scale);
 if(f.riderEyeAnchor)anchors.Head=f.riderEyeAnchor.map((n,i)=>offset[i]+n*scale);
 if(f.anchors)for(const [name,point]of Object.entries(f.anchors))anchors[name]=point.map((n,i)=>feet[i]+(n-from[i])*multiplier);
 if(f.bladeTrailPoints?.length){
  for(const [i,point]of f.bladeTrailPoints.entries())anchors[i?'OffHand':'MainHand']=point.grip.map((n,j)=>offset[j]+n*scale);
  anchors.CastOrigin=[...anchors.MainHand];anchors.ProjectileOrigin=[...anchors.MainHand];
 }
 if(f.weaponParts?.length){
  anchors.MainHand=f.weaponParts[0].grip.map((n,i)=>offset[i]+n*scale);
  if(f.weaponParts[1])anchors.OffHand=f.weaponParts[1].grip.map((n,i)=>offset[i]+n*scale);
  anchors.CastOrigin=[...anchors.MainHand];anchors.ProjectileOrigin=[...anchors.MainHand];
 }
 const frame={...f,offset,scale,displayBounds:bounds,viewBox:SPRITE_CONTRACT.heroCanvas,footAnchor:[...feet],anchors,
  bodyBounds:p.body.map((v,i)=>feet[i%2]+(v-feet[i%2])*multiplier),
  spriteSchemaVersion:1,spriteProfile:entry.profile,spriteAnimation:entry.id,spriteFrame:meta.index,
  sampling:SPRITE_CONTRACT.sampling,registration:'legacy-authored-transform',anchorConfidence:{Feet:f.sourceFootAnchor?'measured-source':f.footAnchor?'authored-logical':'legacy-profile',Head:f.eyeAnchor||f.riderEyeAnchor?'measured-source':'profile-estimate',MainHand:f.weaponParts?.length||f.bladeTrailPoints?.length?'measured-source':'profile-estimate',OffHand:f.weaponParts?.length>1?'measured-source':'profile-estimate'}};
 spritePreparedFrames.set(f,frame);return spriteNormalizeHeadSize(frame);
}
function spritePoseAttributes(frames){const f=spriteFrame(frames[0]);return `data-sprite-profile="${f.spriteProfile||''}" data-sprite-animation="${f.spriteAnimation||''}"`}
function spriteUnitFrame(unit,art){
 spriteCatalog();const key=art?.dataset?.spriteAnimation,entry=spriteEntryIndex.get(key);
 if(!entry)return null;
 const n=entry.frames.length,clock=typeof s!=='undefined'?s.auto?.clock||0:0;
 // A held body frame keeps effect geometry stable; a measured animated grip can be sampled.
 let index=art?.dataset?.spriteFrame!=null?Math.max(0,Math.min(n-1,Number(art.dataset.spriteFrame)||0)):entry.state==='walk'?Math.floor(clock/120)%n:0;
 if(typeof getComputedStyle==='function'&&typeof art.querySelectorAll==='function'){
  const stamp=Date.now(),prior=spriteDOMFrameCache.get(art);
  if(prior?.stamp===stamp)index=prior.index;
  else {const cels=[...art.querySelectorAll('.hero-cel')],active=cels.findIndex(c=>Number(getComputedStyle(c).opacity)>.5);if(active>=0){const mapped=art.dataset?.spriteFrameMap?.split(',').map(Number)[active];index=Math.max(0,Math.min(n-1,Number.isFinite(mapped)?mapped:active));}spriteDOMFrameCache.set(art,{stamp,index});}
 }
 return spriteFrame(entry.frames[index]);
}
function spriteUnitArt(unit,hero){
 if(!hero)return unit?.querySelector?.('.enemy-art');
 const stamp=Date.now(),prior=unit&&spriteDOMArtCache.get(unit);if(prior?.stamp===stamp)return prior.art;
 const all=unit?.querySelectorAll?.('.hero-poses');
 if(!all?.length||typeof getComputedStyle!=='function')return unit?.querySelector?.('.hero-poses');
 // Do not follow the invisible approach pose while Kohaku's strike pose is active.
 const art=[...all].find(art=>{
  for(let node=art;node&&node!==unit;node=node.parentElement){const style=getComputedStyle(node);if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)return false;}
  return true;
 })||all[0];spriteDOMArtCache.set(unit,{stamp,art});return art;
}
function spriteUnitAnchor(unit,name,root,hero=unit?.dataset?.hero!=null,artOverride=null){
 if(!SPRITE_CONTRACT.anchors.includes(name))throw Error('Unknown Sprite anchor: '+name);
 const art=artOverride||spriteUnitArt(unit,hero),rect=art?.getBoundingClientRect?.();if(!rect?.width||!rect.height)return null;
 let frame,canvas,anchors,body;
 if(hero){frame=spriteUnitFrame(unit,art);if(!frame)return null;canvas=frame.viewBox;anchors=frame.anchors;body=frame.bodyBounds;}
 else {const enemy=enemyRoster().find(e=>e.id===Number(unit.dataset?.enemyId));if(!enemy)return null;const spec=spriteEnemySpec(enemy);canvas=spec.canvas;anchors=spec.anchors;body=spec.body;}
 const pt=spriteProjectPoint(anchors[name],rect,canvas),b=combatMapBounds(rect,body,canvas),local=spriteClientToLocal(pt,root),center=combatPointIn(b,root);
 return {...local,width:center.width,height:center.height,unitHeight:center.height,footY:spriteClientToLocal(spriteProjectPoint(anchors.Feet,rect,canvas),root).y};
}
function spriteUnitBodyBounds(unit,hero){
 const art=spriteUnitArt(unit,hero),rect=art?.getBoundingClientRect?.();if(!rect?.width||!rect.height)return null;
 if(hero){const f=spriteUnitFrame(unit,art);return f?combatMapBounds(rect,f.bodyBounds,f.viewBox):null;}
 const enemy=enemyRoster().find(e=>e.id===Number(unit.dataset?.enemyId));if(!enemy)return null;
 const spec=spriteEnemySpec(enemy);return combatMapBounds(rect,spec.body,spec.canvas);
}
function spriteEnemySpec(enemy){
 const def=enemyAppearance(enemy),cacheKey=[def.key,def.asset,enemy.areaBossId,enemy.finalBossId,enemy.trainingDummy].join(':');if(spriteEnemySpecCache.has(cacheKey))return spriteEnemySpecCache.get(cacheKey);
 const frames=enemy.finalBossId?finalBossAllFrames(enemy):enemy.areaBossId?areaBossAllFrames(enemy):def.frames||[],boxes=frames.map(f=>f.bounds?.map((v,i)=>v*f.scale+f.offset[i%2])).filter(Boolean);
 const b=boxes.length?[Math.min(...boxes.map(x=>x[0])),Math.min(...boxes.map(x=>x[1])),Math.max(...boxes.map(x=>x[2])),650]:[70,90,630,650];
 const x=350,h=650-b[1],body=[x-(b[2]-b[0])*.35,b[1],x+(b[2]-b[0])*.35,650],center=[x,b[1]+h*.48];
 const spec={id:def.key,canvas:SPRITE_CONTRACT.enemyCanvas,body,artBounds:b,anchors:{Feet:[x,650],Center:center,Head:[x,b[1]],MainHand:[x+60,b[1]+h*.45],OffHand:[x-60,b[1]+h*.45],CastOrigin:[x-60,b[1]+h*.45],ProjectileOrigin:[x-60,b[1]+h*.45],HitCenter:center},anchorConfidence:'art-envelope-estimate',scale:typeof bossBattleZoom==='function'?bossBattleZoom(enemy):1,scaleAppliedBy:'enemy-art-layout-only'};
 if(def.registration){spec.body=def.registration.body;spec.anchors=def.registration.anchors;spec.anchorConfidence=def.registration.anchorConfidence;}
 spriteEnemySpecCache.set(cacheKey,spec);return spec;
}
function spriteEnemyAnimations(){
 const entries=[],add=(key,def)=>{
  if(!def?.asset)return;
  const states=def.animationMap||{idle:[0,1],attack:[2,3,4,5],hurt:[Math.min(6,(def.frames?.length||1)-1)],death:[Math.min(7,(def.frames?.length||1)-1)]};
  for(const [state,indices]of Object.entries(states))entries.push({id:'enemy:'+key+'/'+state,profile:'enemy:'+key,state,type:'enemy',definition:def,indices:def.vector?[0]:indices,frames:(def.vector?[0]:indices).map(i=>def.frames?.[i]||ENEMY_FRAME_LAYOUT[def.key]?.[i]||{scale:1,offset:[0,0],bounds:[70,90,630,650]}),canvas:SPRITE_CONTRACT.enemyCanvas});
 };
 for(const [key,def]of Object.entries(MONSTER_ARTWORK))add(key,def);
 add('trainingDummy',TRAINING_DUMMY_ART);
 for(const [id,variants]of Object.entries(AREA_BOSS_VISUAL_ART))for(const [variant,def]of Object.entries(variants))add(id+':'+variant,def);
 for(const [id,def]of Object.entries(AREA_PART_VISUAL_ART))add('part:'+id,def);
 for(const [id,art]of Object.entries(FINAL_BOSS_ART))art.phases.forEach((def,i)=>add(id+':phase'+(i+1),def));
 for(const [state,assets]of Object.entries(TITAN_FRAME_ASSETS))entries.push({id:'titan/'+state,profile:'titan',state,type:'summon',canvas:[0,0,700,700],frames:assets.map(asset=>({asset,source:[700,700],scale:1,offset:[0,0],bounds:[110,35,590,650]}))});
 return entries;
}
function spriteAllAnimations(){return [...spriteCatalog(),...spriteEnemyAnimations()]}
function registerSpriteProfile(key,profile){
 if(spriteProfile(key))throw Error('Duplicate Sprite profile: '+key);
 for(const name of ['body','head','main','off','legacyFeet'])if(!profile[name]?.every(Number.isFinite))throw Error('Profile requires explicit '+name);
 spriteCustomProfiles.set(key,Object.freeze({...profile}));return key;
}
// New animations must supply explicit transforms, all landmarks, and nearest sampling.
function registerSpriteAnimation(entry){
 if(!entry?.profile||!entry.state||!entry.frames?.length)throw Error('Sprite registration requires profile, state and frames');
 if(!spriteProfile(entry.profile))throw Error('Unknown Sprite profile: '+entry.profile);
 for(const frame of entry.frames){
  if(frame.spriteSchemaVersion!==1||frame.sampling!=='nearest'||!frame.viewBox||!frame.offset||!frame.source||!frame.asset)throw Error('New Sprite frames require contract v1, explicit canvas/transform/source and nearest sampling');
  for(const name of SPRITE_CONTRACT.anchors)if(!frame.anchors?.[name]?.every(Number.isFinite))throw Error('New Sprite frame missing '+name);
  if(!Number.isFinite(frame.sourcePixelsPerLogicalUnit)||frame.sourcePixelsPerLogicalUnit<=0)throw Error('New Sprite frame requires sourcePixelsPerLogicalUnit');
 }
 const catalog=spriteCatalog(),id=entry.profile+'/'+entry.state;
 if(catalog.some(e=>e.id===id))throw Error('Duplicate Sprite animation: '+id);
 const registered={...entry,id,frames:entry.frames.map((f,i)=>({...f,bodyBounds:f.bodyBounds||spriteProfile(entry.profile).body,spriteProfile:entry.profile,spriteAnimation:id,spriteFrame:i}))};catalog.push(registered);spriteEntryIndex.set(id,registered);return id;
}
function spriteEffectConfig(key){const c=typeof C!=='undefined'?C[key]:null;return SPRITE_CONTRACT.effects[key]||(c?.owner===1?SPRITE_CONTRACT.effects.arrow:c?.owner===2?SPRITE_CONTRACT.effects.fireball:SPRITE_CONTRACT.effects.generic)}
function spriteEffectPoint(unit,root,effect,role='target',artOverride=null){const config=spriteEffectConfig(effect),p=spriteUnitAnchor(unit,config[role],root,unit?.dataset?.hero!=null,artOverride);return p?{...p,x:p.x+(config.offset?.[0]||0),y:p.y+(config.offset?.[1]||0)}:null}
function spriteHeadlessPoint(token){const p=SPRITE_CONTRACT.headlessFallback,i=Math.max(0,enemyRoster().findIndex(e=>'enemy-'+e.id===token));return token==='hero-1'?{x:p.hero[0],y:p.hero[1]}:{x:p.enemy[0]+i*p.step[0],y:p.enemy[1]+i%2*p.step[1]}}
function spriteAnimationFindings(entry){
 const issues=[],emit=(severity,type,index,detail)=>issues.push({severity,actor:entry.profile,animation:entry.state,frame:index+1,type,detail});
 let lastHead=null;
 entry.frames.forEach((raw,index)=>{
  const f=spriteFrame(raw),v=f.viewBox||SPRITE_CONTRACT.heroCanvas,b=f.displayBounds;
  if(!raw.asset||!raw.source?.every(n=>Number.isFinite(n)&&n>0))emit('error','invalid-source',index,'asset/source required');
  if(!Number.isFinite(f.scale)||f.scale<=0||!f.offset?.every(Number.isFinite))emit('error','invalid-transform',index,'positive camera scale and finite offset required');
  if(b&&(b[0]<v[0]-.5||b[1]<v[1]-.5||b[2]>v[0]+v[2]+.5||b[3]>v[1]+v[3]+.5))emit('error','outside-logical-canvas',index,JSON.stringify(b));
  for(const name of SPRITE_CONTRACT.anchors){const p=f.anchors?.[name];if(p?.length!==2||!p.every(Number.isFinite))emit('error','missing-anchor',index,name);else if(p[0]<v[0]||p[0]>v[0]+v[2]||p[1]<v[1]||p[1]>v[1]+v[3])emit('error','anchor-outside-canvas',index,name);}
  if(raw.sourceFootAnchor&&f.offset?.every(Number.isFinite)&&Number.isFinite(f.scale)){
   const projected=raw.sourceFootAnchor.map((n,i)=>f.offset[i]+n*f.scale);
   if(Math.hypot(...projected.map((n,i)=>n-SPRITE_CONTRACT.feet[i]))>.6)emit('error','source-foot-transform-drift',index,JSON.stringify(projected));
  }
  if(f.anchors&&Math.hypot(...f.anchors.Feet.map((n,i)=>n-SPRITE_CONTRACT.feet[i]))>.5)emit('error','feet-anchor-drift',index,JSON.stringify(f.anchors.Feet));
  if(f.sampling!=='nearest')emit('error','non-nearest-sampling',index,f.sampling);
  if(raw.headSpan){const size=raw.headSpan*f.scale;if(lastHead&&Math.abs(size/lastHead-1)>.08)emit('warning','head-size-jump',index,`${lastHead.toFixed(2)} → ${size.toFixed(2)}`);lastHead=size;}
  if(raw.weaponParts)for(const p of raw.weaponParts){const target=p.worldSize,actual=p.drawScale*f.scale*Math.max(...p.source),override=raw.spriteSchemaVersion===1?1:(SPRITE_CONTRACT.overrides[entry.id]||SPRITE_CONTRACT.overrides[entry.profile])?.scale||1;if(target&&Math.abs(actual-target*override)>.1)emit('error','weapon-size-drift',index,`${actual.toFixed(2)} / ${target*override}`);}
  const mountedEquipment=(raw.qualityRevision===41?{'seraphina:base':['angel-staff-and-free-hand','anatomical-left-staff','anatomical-right-free-or-support'],'seraphina:dark':['twin-floating-lanterns-free-hands','anatomical-left-free','anatomical-right-free']}:raw.qualityRevision===34?{
   'lia:fire':['elemental-staff-left-free-or-support-right','anatomical-left-staff','anatomical-right-free-or-support'],
   'lia:ice':['elemental-staff-left-free-or-support-right','anatomical-left-staff','anatomical-right-free-or-support'],
   'lia:thunder':['elemental-staff-left-free-or-support-right','anatomical-left-staff','anatomical-right-free-or-support'],
   'lia:earth':['elemental-staff-left-free-or-support-right','anatomical-left-staff','anatomical-right-free-or-support']
  }:[33,36].includes(raw.qualityRevision)?{
   'lia:base':['slender-curled-wand-left-free-right','anatomical-left-wand','anatomical-right-free']
  }:[31,32].includes(raw.qualityRevision)?{
   'alicia:angel':['holy-sword-free-hand-no-shield','anatomical-right-sword','anatomical-left-free-hand'],
   'alicia:base':['holy-sword-free-hand-no-shield','anatomical-right-sword','anatomical-left-free-hand']
  }:raw.qualityRevision===30?{
   'alicia:horse':['sword-and-reins','anatomical-right-sword','anatomical-left-reins'],
   'alicia:rhino':['sword-and-reins','anatomical-right-sword','anatomical-left-reins'],
   'alicia:allosaur':['sword-and-shield','anatomical-right-sword','anatomical-left-shield'],
   'alicia:griffin':['lance-and-reins','anatomical-right-lance','anatomical-left-reins'],
   'alicia:elephant':['command-scepter-and-reins','anatomical-right-scepter','anatomical-left-reins'],
   'alicia:dragon':['lance-and-reins','anatomical-right-lance','anatomical-left-reins']
  }:{
   'selena:base':['single-straight-sword-free-hand','anatomical-right-sword','anatomical-left-free-hand'],
   'seraphina:base':['angel-staff-and-free-hand','anatomical-left-staff','anatomical-right-free-or-support'],
   'kohaku:single':['two-handed-single-axe','anatomical-right-axe','anatomical-left-axe'],
   'sou:phantom':['bow-and-string','anatomical-right-string','anatomical-left-bow'],
   'sou:base':['bow-and-string','anatomical-right-string','anatomical-left-bow'],
   'alicia:horse':['sword-and-reins','anatomical-right-sword','anatomical-left-reins'],
   'alicia:rhino':['tower-shield-only','anatomical-right-reins','anatomical-left-shield'],
   'alicia:griffin':['lance-and-reins','anatomical-right-lance','anatomical-left-reins'],
   'alicia:elephant':['command-scepter-and-reins','anatomical-right-scepter','anatomical-left-reins'],
   'alicia:dragon':['lance-and-shield','anatomical-right-lance','anatomical-left-shield']
  })[entry.profile];
  const reviewedMounted=mountedEquipment&&raw.equipment===mountedEquipment[0]&&raw.bakedWeaponReview?.handedness?.MainHand===mountedEquipment[1]&&raw.bakedWeaponReview?.handedness?.OffHand===mountedEquipment[2];
  const reviewedBaked=raw.bakedWeaponReview?.sha256&&raw.bakedWeaponReview?.evidence&&(reviewedMounted||(raw.bakedWeaponReview?.handedness?.MainHand==='anatomical-right-sword'||entry.state==='ascension'&&raw.animationRevision===16&&raw.bakedWeaponReview?.handedness?.MainHand==='anatomical-right-catch')&&raw.bakedWeaponReview?.handedness?.OffHand==='anatomical-left-shield')&&raw.anchors?.MainHand&&raw.anchors?.OffHand;
  if(!raw.headSpan||!raw.weaponParts?.length&&!reviewedBaked)emit('warning','unmeasured-anatomy-or-baked-weapon',index,'Legacy baked art: dimensions and handedness need visual/source-landmark review; no automatic fitting performed.');
  if(Object.values(f.anchorConfidence||{}).some(x=>x==='profile-estimate'||x==='legacy-profile'))emit('warning','estimated-anchor',index,JSON.stringify(f.anchorConfidence));
 });
 const calibratedHeadSize=entry.frames.every(f=>f.headSpan&&Math.abs(f.headSpan*f.scale-spriteHeadTarget({...f,spriteAnimation:entry.id}))<.1);
 if(!calibratedHeadSize&&entry.frames.some(f=>Math.abs(f.scale-entry.frames[0].scale)>1e-5))emit('warning','legacy-camera-scale-varies',0,'Existing measured transforms retained. Body/source pixel calibration is needed before changing scales.');
 if(entry.fallback)emit('warning','held-pose-fallback',0,'This state reuses an approved pose; no dedicated animation exists.');
 return issues;
}
