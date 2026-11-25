'use strict';
const PARTY_IDLE_BEFORE_V29=new Set(spriteAllAnimations().flatMap(e=>(e.frames||[]).flatMap(f=>[f.asset,...(f.weaponParts||[]).map(p=>p.asset)])));
for(const [id,key]of [[0,'war'],[1,'bow'],[3,'knight']])HERO_FRAME_LAYOUT[id].idle=PARTY_IDLE_V29[key];
KOHAKU_FRAMES.idle=PARTY_IDLE_V29.war;
souIdleFrames=()=>PARTY_IDLE_V29.bow;
for(const e of spriteCatalog())if(e.state==='idle'){
 if(e.profile==='kohaku:single')e.frames=PARTY_IDLE_V29.war;
 else if(e.profile==='sou:base'||e.profile==='sou:phantom')e.frames=PARTY_IDLE_V29.bow;
 else if(e.profile==='alicia:base')e.frames=PARTY_IDLE_V29.knight;
}
const partyIdleHTMLBaseV29=heroSpriteHTML;
heroSpriteHTML=function(id,state){let html=partyIdleHTMLBaseV29(...arguments);if(state==='idle'&&[0,1,3].includes(Number(id))&&html.includes('data-sprite-animation="'+({0:'kohaku:single',1:'sou:base',3:'alicia:base'}[id])+'/idle"'))html=html.replace('class="hero-poses','class="hero-poses party-idle-v29');return html};
const PARTY_IDLE_RETIRED_V29=[...PARTY_IDLE_BEFORE_V29].filter(asset=>asset&&!spriteAllAnimations().some(e=>e.frames?.some(f=>f.asset===asset||f.weaponParts?.some(p=>p.asset===asset))));
const partyIdlePreloadBaseV29=preloadHeroArtwork;
preloadHeroArtwork=function(){partyIdlePreloadBaseV29();if(typeof Image!=='function')return;for(const [id,key]of [[0,'war'],[1,'bow'],[3,'knight']])if(inParty(id))for(const f of PARTY_IDLE_V29[key]){preloadBattleImage(f.asset);}};
