'use strict';
const PARTY_SPECIAL_BEFORE_V28=new Set(spriteAllAnimations().flatMap(e=>(e.frames||[]).flatMap(f=>[f.asset,...(f.weaponParts||[]).map(p=>p.asset)])));
function partySpecialFrames(name,state){return PARTY_SPECIAL_V28[name].map((f,i)=>({...f,spriteAnimation:f.spriteProfile+'/'+state,spriteFrame:i,...(state.startsWith('eight-')?{warriorEight:true}: {})}));}
const PARTY_SPECIAL_WARRIOR_MAP={warrior_earthshatter:'war-earthshatter',warrior_afterimage:'war-afterimage',warrior_slaughter:'war-slaughter',warrior_slam:'war-slam',warrior_brand:'war-brand',warrior_soulguard:'war-soulguard',warrior_instinct:'war-instinct',warrior_eternal:'war-eternal'};
for(const [key,name]of Object.entries(PARTY_SPECIAL_WARRIOR_MAP))WARRIOR_EIGHT_FRAMES[key]=partySpecialFrames(name,'eight-'+key);
WARRIOR_EIGHT_FRAMES.charge=[0,0,1,1].map((n,i)=>({...PARTY_SPECIAL_V28['war-earthshatter'][n],spriteAnimation:'kohaku:single/eight-charge',spriteFrame:i,warriorEight:true}));
WARRIOR_EXECUTION_FRAMES.splice(0,WARRIOR_EXECUTION_FRAMES.length,...partySpecialFrames('war-execution','execution'));
WARRIOR_ACTION_FRAMES.single.execution=WARRIOR_EXECUTION_FRAMES;
WARRIOR_ACTION_FRAMES.single.empower=partySpecialFrames('war-soulguard','empower');
WARRIOR_ACTION_FRAMES.single.cleave=partySpecialFrames('war-afterimage','cleave');
WARRIOR_ACTION_FRAMES.single.spin=partySpecialFrames('war-slaughter','spin');
BLOOD_RAGE_FRAMES.single=partySpecialFrames('war-eternal','bloodrage');
HERO_FRAME_LAYOUT[0].cast=partySpecialFrames('war-instinct','cast');KOHAKU_FRAMES.cast=HERO_FRAME_LAYOUT[0].cast;
for(const e of spriteCatalog())if(e.profile==='kohaku:single'){
 if(e.state.startsWith('eight-'))e.frames=WARRIOR_EIGHT_FRAMES[e.state.slice(6)]||WARRIOR_EIGHT_FRAMES.charge;
 else if(e.state==='execution')e.frames=WARRIOR_EXECUTION_FRAMES;
 else if(e.state==='bloodrage')e.frames=BLOOD_RAGE_FRAMES.single;
 else if(e.state==='cast'||e.state==='refit-focus')e.frames=HERO_FRAME_LAYOUT[0].cast;
 else if(WARRIOR_ACTION_FRAMES.single[e.state])e.frames=WARRIOR_ACTION_FRAMES.single[e.state];
}
// One shared native-resolution blade, one size, a rigid rotation around its neck.
const partySpecialRigidBase=warriorRigidWeaponHTML,partySpecialMaskBase=warriorWeaponMaskHTML;
warriorRigidWeaponHTML=function(f){if(f.qualityRevision!==28||!f.weaponParts?.length)return partySpecialRigidBase(f);return f.weaponParts.map(p=>`<path d="M${p.grip.join(' ')} L${p.center.join(' ')}" stroke="#32202b" stroke-width="${p.shaftWorldWidth/f.scale}" stroke-linecap="round"/>`).join('')};
const partySpecialCelBase=heroCelHTML;
heroCelHTML=function(f,id,state,index){let html=partySpecialCelBase(...arguments);if(f.qualityRevision!==28||!f.weaponParts?.length)return html;const head=f.weaponParts.map(p=>`<g data-v28-rigid-axe="true" data-axe-size="${p.worldSize}" transform="translate(${p.center.join(' ')}) rotate(${p.angle}) scale(${p.drawScale})"><image href="${p.asset}" x="${-p.pivot[0]}" y="${-p.pivot[1]}" width="${p.source[0]}" height="${p.source[1]}"/></g>`).join('');return html.replace('</g></svg>',head+'</g></svg>')};
warriorWeaponMaskHTML=function(f,id,head){if(f.qualityRevision!==28||!f.weaponParts?.length)return partySpecialMaskBase(f,id,head);return `<mask id="${id}" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="${f.source[0]}" height="${f.source[1]}"><rect width="${f.source[0]}" height="${f.source[1]}" fill="white"/>${f.weaponParts.map(p=>`<image href="${p.maskAsset}" width="${f.source[0]}" height="${f.source[1]}"/>`).join('')}${[f.anchors.MainHand,f.anchors.OffHand].map(q=>`<circle cx="${(q[0]-f.offset[0])/f.scale}" cy="${(q[1]-f.offset[1])/f.scale}" r="14" fill="white"/>`).join('')}</mask>`};
const PARTY_RANGER_SPECIAL_MAP={quickshot:'bow-volley',double:'bow-volley',rain:'bow-rain',aim:'bow-finisher',penetrate:'bow-finisher',steady:'bow-finisher'};
const partyRangerMotionBorn=new WeakMap(),partyRangerMotionCard=new WeakMap();
const partyRangerRecordBase=recordRangerCastVFX;recordRangerCastVFX=function(c){partyRangerRecordBase(c);if(c?.owner===1&&!c.casting&&sceneMotion?.kind==='attack'&&sceneMotion.cardName===c.name)partyRangerMotionCard.set(sceneMotion,c)};
function partyRangerSpecialCurrent(state){
 const p=s?.party?.find(p=>p.id===1),m=sceneMotion,c=m?.cardEffect||partyRangerMotionCard.get(m),key=c?.key||cardKeyOf(c);
 if(!p||p.hp<=0||s.phase!=='battle'||heroControlled(p)||heroCasting(1)||actorIncomingHit(p)||['walk','guard','hurt','fallen'].includes(state)||m?.kind!=='attack'||c?.owner!==1||!PARTY_RANGER_SPECIAL_MAP[key])return null;
 const now=warriorVFXClock(),duration=m.duration||850;
 if(!partyRangerMotionBorn.has(m))partyRangerMotionBorn.set(m,now-Math.max(0,Date.now()-(m.started??Date.now())));
 const age=Math.max(0,now-partyRangerMotionBorn.get(m));if(age>=duration)return null;
 return {key,frames:partySpecialFrames(PARTY_RANGER_SPECIAL_MAP[key],'skill-'+key),age,duration};
}
const partyRangerVolleyFramesV28=partySpecialFrames('bow-volley','skill-volley');
const partyRangerBasicBase=rangerBasicAttackFrames;
rangerBasicAttackFrames=function(){return rangerVolleyActive()?partyRangerVolleyFramesV28:partyRangerBasicBase()};
const partyRangerSpriteBase=heroSpriteHTML;
heroSpriteHTML=function(id,state,phantom=false,meleeInner=false){const m=Number(id)===1&&!phantom?partyRangerSpecialCurrent(state):null;if(!m)return partyRangerSpriteBase(...arguments);const v=SPRITE_CONTRACT.heroCanvas;return `<span ${spritePoseAttributes(m.frames)} data-v28-ranger-skill="${m.key}" data-combat-view="${v.join(' ')}" class="hero-poses poses-attack party-ranger-special-poses" style="--v28-duration:${m.duration}ms;--v28-age:-${m.age}ms;--v28-play:${rangerVFXPaused()?'paused':'running'};--pose-left:${v[0]/418};--pose-width:${v[2]/418};--pose-height:${v[3]/418};--pose-bottom:${(440-v[1]-v[3])/418}">${m.frames.map((f,i)=>heroCelHTML(f,id,'attack',i)).join('')}</span>`};
for(const [name,state]of [['bow-volley','skill-volley'],['bow-rain','skill-rain'],['bow-finisher','skill-finisher']])registerSpriteAnimation({profile:'sou:base',state,frames:partySpecialFrames(name,state)});
const PARTY_SPECIAL_RETIRED_V28=[...PARTY_SPECIAL_BEFORE_V28].filter(asset=>asset&&!spriteAllAnimations().some(e=>e.frames?.some(f=>f.asset===asset||f.weaponParts?.some(p=>p.asset===asset))));
for(const [key,name]of Object.entries(PARTY_RANGER_SPECIAL_MAP)){
 const state='skill-'+key,frames=partySpecialFrames(name,state),id='sou:base/'+state;
 if(spriteEntryIndex.has(id))spriteEntryIndex.get(id).frames=frames;else registerSpriteAnimation({profile:'sou:base',state,frames});
}
const partySpecialHeroPreloadBase=preloadHeroArtwork,partySpecialPreloaded=new Set();
preloadHeroArtwork=function(){partySpecialHeroPreloadBase();if(typeof Image!=='function')return;for(const [name,frames]of Object.entries(PARTY_SPECIAL_V28)){if(!inParty(name.startsWith('war-')?0:1))continue;for(const f of frames)for(const asset of [f.asset,...(f.weaponParts||[]).flatMap(p=>[p.asset,p.maskAsset])])if(asset&&!partySpecialPreloaded.has(asset)){partySpecialPreloaded.add(asset);preloadBattleImage(asset);}}};
