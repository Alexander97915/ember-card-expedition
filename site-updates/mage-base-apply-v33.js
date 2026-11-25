'use strict';
// Normal-form presentation only; elemental forms and spell resolution stay intact.
const MAGE_BASE_BEFORE_V33=new Set(spriteAllAnimations().filter(e=>e.profile==='lia:base').flatMap(e=>e.frames.map(f=>f.asset)));
for(const state of ['idle','attack','cast'])HERO_FRAME_LAYOUT[2][state]=MAGE_BASE_V33[state];
LIA_CHANT_FRAMES.splice(0,LIA_CHANT_FRAMES.length,...MAGE_BASE_V33.cast.map((f,i)=>({...f,spriteAnimation:'lia:base/chant',spriteFrame:i})));
// No new run/reaction artwork has been approved: keep the new identity with idle fallbacks.
for(const state of ['walk','guard','hurt','fallen'])HERO_FRAME_LAYOUT[2][state]=(state==='walk'?MAGE_BASE_V33.idle:[MAGE_BASE_V33.idle[0]]).map((f,i)=>({...f,spriteAnimation:'lia:base/'+state,spriteFrame:i,authoredState:'idle',fallback:true}));
for(const e of spriteCatalog())if(e.profile==='lia:base')e.frames=e.state==='chant'?LIA_CHANT_FRAMES:HERO_FRAME_LAYOUT[2][e.state]||MAGE_BASE_V33.idle;
if(!spriteEntryIndex.has('lia:base/guard'))registerSpriteAnimation({profile:'lia:base',state:'guard',frames:HERO_FRAME_LAYOUT[2].guard});
const mageSpriteFramesBeforeV33=spriteFrames;
spriteFrames=function(id,state){if(Number(id)===2&&!activeMageForm())return state==='cast'&&heroCasting(2)?LIA_CHANT_FRAMES:HERO_FRAME_LAYOUT[2][state]||MAGE_BASE_V33.idle;return mageSpriteFramesBeforeV33(...arguments)};
const mageGuardBeforeV33=heroGuardFrames;
heroGuardFrames=function(id){if(Number(id)===2&&!activeMageForm())return HERO_FRAME_LAYOUT[2].guard;return mageGuardBeforeV33(...arguments)};
const mageSpriteBeforeV33=heroSpriteHTML;
heroSpriteHTML=function(id,state){let html=mageSpriteBeforeV33(...arguments);if(Number(id)===2&&html.includes('data-sprite-profile="lia:base"'))html=html.replace('class="hero-poses','class="hero-poses mage-base-v33');return html};
const magePreloadBeforeV33=preloadHeroArtwork;
preloadHeroArtwork=function(){magePreloadBeforeV33();if(typeof Image!=='function'||!inParty(2))return;for(const fs of Object.values(MAGE_BASE_V33))for(const f of fs){preloadBattleImage(f.asset);}};
const MAGE_BASE_RETIRED_V33=[...MAGE_BASE_BEFORE_V33].filter(a=>a&&!spriteAllAnimations().some(e=>e.frames.some(f=>f.asset===a)));
