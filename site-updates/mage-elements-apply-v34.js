'use strict';
// Presentation-only elemental replacement. Normal mage and combat math stay intact.
const MAGE_ELEMENTS_OLD_V34=new Set(spriteAllAnimations().filter(e=>/^lia:(fire|ice|thunder|earth)$/.test(e.profile)).flatMap(e=>e.frames.map(f=>f.asset)));
function installMageElementsV34(){
 for(const [form,sets] of Object.entries(MAGE_ELEMENTS_V34))MAGE_FORM_FRAMES[form]=sets;
 for(const e of spriteCatalog())if(MAGE_ELEMENTS_V34[e.profile.slice(4)]&&e.profile.startsWith('lia:')){
  const sets=MAGE_ELEMENTS_V34[e.profile.slice(4)];e.frames=sets[e.state]||sets.idle;e.fallback=false;
 }
}
installMageElementsV34();
const mageFormFramesBeforeV34=mageFormFrames;
mageFormFrames=function(state){const form=activeMageForm(),sets=MAGE_ELEMENTS_V34[form];return sets?(sets[state]||sets.idle):mageFormFramesBeforeV34(state)};
const mageChantBeforeV34=heroChantFrames;
heroChantFrames=function(id,state){if(Number(id)===2&&state==='cast'&&heroCasting(2)&&MAGE_ELEMENTS_V34[activeMageForm()])return MAGE_ELEMENTS_V34[activeMageForm()].cast;return mageChantBeforeV34(...arguments)};
const mageGuardBeforeV34=heroGuardFrames;
heroGuardFrames=function(id){if(Number(id)===2&&MAGE_ELEMENTS_V34[activeMageForm()])return [MAGE_ELEMENTS_V34[activeMageForm()].idle[0]];return mageGuardBeforeV34(...arguments)};
const mageHTMLBeforeV34=heroSpriteHTML,mageDownAtV34=new Map();
heroSpriteHTML=function(id,state){
 let html=mageHTMLBeforeV34(...arguments);if(Number(id)!==2||!MAGE_ELEMENTS_V34[activeMageForm()])return html;
 const clock=s.auto?.clock||0;
 if(state==='fallen'){if(!mageDownAtV34.has(activeMageForm()))mageDownAtV34.set(activeMageForm(),clock)}else mageDownAtV34.clear();
 const age=state==='fallen'?clock-mageDownAtV34.get(activeMageForm()):Math.max(0,Date.now()-(sceneMotion?.started??Date.now()));
 html=html.replace('class="hero-poses','class="hero-poses mage-elements-v34').replace('style="--warrior-pose-duration:','style="--mage-age:-'+age+'ms;--warrior-pose-duration:');
 // Saved gameplay clock pauses with the battle; no independent chant timer.
 const cast=state==='cast'&&heroCasting(2);
 if(cast){const index=Math.min(3,Math.floor(Math.max(0,clock-cast.started)/Math.max(1,cast.duration)*4));html=html.replace(/data-sprite-animation="[^"]+"/,'data-sprite-animation="lia:'+activeMageForm()+'/cast" data-sprite-frame="'+index+'"').replace(/class="hero-cel ([^"]+)" style="([^"]*)"/g,(m,c,style)=>'class="hero-cel '+c+'" style="animation:none!important;opacity:'+(style.includes('--frame-index:'+index+';')?'1':'0')+'!important;'+style+'"');}
 return html;
};
const MAGE_ELEMENTS_RETIRED_V34=[...MAGE_ELEMENTS_OLD_V34].filter(asset=>asset&&!spriteAllAnimations().some(e=>e.frames.some(f=>f.asset===asset)));
