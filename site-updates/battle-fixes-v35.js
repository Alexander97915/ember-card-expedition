'use strict';
// Replace the actual render tables, including reactions and skill casts.
const KNIGHT_BEFORE_V35=new Set(Object.values(HERO_FRAME_LAYOUT[3]).flatMap(fs=>fs.map(f=>f.asset)));
for(const state of ['walk','attack','guard','cast','hurt','fallen'])HERO_FRAME_LAYOUT[3][state]=KNIGHT_ACTIONS_V35[state];
for(const e of spriteCatalog())if(e.profile==='alicia:base'&&HERO_FRAME_LAYOUT[3][e.state])e.frames=HERO_FRAME_LAYOUT[3][e.state];
const knightGuardBeforeV35=heroGuardFrames;
heroGuardFrames=function(id){if(Number(id)===3&&!knightVisualFrames(3,'guard'))return KNIGHT_ACTIONS_V35.guard;return knightGuardBeforeV35(...arguments)};
const knightHTMLBeforeV35=heroSpriteHTML,knightFallenAtV35=new Map();
heroSpriteHTML=function(id,state){let html=knightHTMLBeforeV35(...arguments);
 if(Number(id)!==3||!html.includes('data-sprite-profile="alicia:base"'))return html;
 if(state==='fallen'){if(!knightFallenAtV35.has(id))knightFallenAtV35.set(id,Date.now())}else knightFallenAtV35.delete(id);
 const started=state==='fallen'?knightFallenAtV35.get(id):sceneMotion?.started??Date.now(),age=Math.max(0,Date.now()-started);
 return html.replace('class="hero-poses','class="hero-poses knight-actions-v35').replace('style="--warrior-pose-duration:','style="--reaction-age:-'+age+'ms;--warrior-pose-duration:');
};
const knightPreloadBeforeV35=preloadHeroArtwork;
preloadHeroArtwork=function(){knightPreloadBeforeV35();if(typeof Image!=='function'||!inParty(3))return;for(const fs of Object.values(KNIGHT_ACTIONS_V35))for(const f of fs){preloadBattleImage(f.asset);}};
const KNIGHT_RETIRED_V35=[...KNIGHT_BEFORE_V35].filter(a=>a&&!spriteAllAnimations().some(e=>e.frames.some(f=>f.asset===a)));
// A fixed density correction for an entire source family. Never fit a crouching
// cel or its weapon silhouette separately. Keep all authored ground/grip points.
const balancedFramesV35=new WeakSet();
function balanceFrameFamilyV35(value){if(!value||typeof value!=='object'||balancedFramesV35.has(value))return;balancedFramesV35.add(value);
 if(value.asset&&value.anchors&&Number.isFinite(value.scale)){
  const a=value.asset,factor=/party-refit-v27\/bow-attack-/.test(a)?.85:/party-refit-v27\/war-(?:walk|guard)-/.test(a)?.76:/sou-chant-v26\//.test(a)?.90:1;
  if(factor!==1){const ground=value.anchors.Feet||[209,430],point=p=>p.map((v,i)=>ground[i]+(v-ground[i])*factor),bounds=b=>[...point(b.slice(0,2)),...point(b.slice(2,4))];
   value.offset=point(value.offset);value.scale*=factor;value.sourcePixelsPerLogicalUnit=1/value.scale;
   for(const key of ['displayBounds','bodyBounds'])if(value[key])value[key]=bounds(value[key]);
   for(const key of Object.keys(value.anchors))value.anchors[key]=point(value.anchors[key]);
   value.headWorldSize*=factor;value.densityCorrectionV35=factor;
  }return;
 }
 for(const item of Object.values(value))balanceFrameFamilyV35(item);
}
for(const root of [HERO_FRAME_LAYOUT,KOHAKU_FRAMES,PARTY_REFIT_V27,SOU_CHANT_FRAMES,SOU_BASIC_ATTACK_FRAMES,WARRIOR_BASIC_ATTACK_FRAMES,WARRIOR_ACTION_FRAMES,BLOOD_RAGE_FRAMES,WARRIOR_EIGHT_FRAMES,spriteCatalog()])balanceFrameFamilyV35(root);
