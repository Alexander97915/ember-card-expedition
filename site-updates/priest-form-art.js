'use strict';
for(const kind of Object.keys(PRIEST_FORMS)){
 const profile='seraphina:'+kind;registerSpriteProfile(profile,{...spriteProfile('seraphina:base'),label:'瑟菲娜 · '+PRIEST_FORMS[kind].name});
 for(const state of ['idle','cast'])registerSpriteAnimation({profile,state,frames:PRIEST_FORM_FRAMES[kind+(state==='cast'?'Cast':'Idle')]});
}
let priestFormMotion=null,priestFormVisualBattle=null;
function priestFormArtSync(){
 if(priestFormVisualBattle!==s?.auto){priestFormVisualBattle=s?.auto;priestFormMotion=null}
 const kind=priestFormKind(),now=warriorVFXClock();
 if(!kind||priestFormMotion&&(priestFormMotion.kind!==kind||now>=priestFormMotion.until))priestFormMotion=null;
 return {kind,now,motion:priestFormMotion};
}
function priestFormCastArt(){
 const {kind,now}=priestFormArtSync();if(!kind)return;
 priestFormMotion={kind,born:now,until:now+1000,duration:1000};
}
function priestFormArtFrame(state='idle'){
 const v=priestFormArtSync();if(!v.kind)return null;
 const cast=!!v.motion&&!['hurt','fallen','guard'].includes(state),key=v.kind+(cast?'Cast':'Idle'),frames=spriteEntryIndex.get('seraphina:'+v.kind+'/'+(cast?'cast':'idle')).frames;
 const age=cast?v.now-v.motion.born:priestNow(),index=reduceMotion()?(cast?2:0):['hurt','fallen','guard'].includes(state)?0:cast?Math.min(3,Math.floor(age/250)):Math.floor(age/240)%4;
 return {kind:v.kind,key,index,frame:frames[index],state:cast?'cast':state};
}
function priestFormSpriteHTML(state='idle'){
 const pose=priestFormArtFrame(state);if(!pose)return '';const f=pose.frame,v=f.viewBox;
 return `<span class="hero-poses priest-form-poses poses-${pose.state} single-pose" data-priest-form="${pose.kind}" data-priest-form-key="${pose.key}" data-sprite-profile="${f.spriteProfile}" data-sprite-animation="${f.spriteAnimation}" data-sprite-frame="${pose.index}" data-combat-view="${v.join(' ')}" style="--pose-left:${v[0]/418};--pose-width:${v[2]/418};--pose-height:${v[3]/418};--pose-bottom:${(440-v[1]-v[3])/418}">${heroCelHTML(f,4,pose.state,pose.index)}</span>`;
}
const PRIEST_FORM_ART_BASE={sprite:heroSpriteHTML,frames:spriteFrames,card:animateCard,auto:animateAuto,hud:updateAutoHUD,preload:preloadHeroArtwork};
heroSpriteHTML=function(id,state,...args){return Number(id)===4&&priestFormKind()?priestFormSpriteHTML(state):PRIEST_FORM_ART_BASE.sprite(id,state,...args)};
spriteFrames=function(id,state){const kind=Number(id)===4&&priestFormKind();return kind?PRIEST_FORM_FRAMES[kind+(['attack','cast'].includes(state)?'Cast':'Idle')]:PRIEST_FORM_ART_BASE.frames(...arguments)};
animateCard=function(c,...args){if(c?.owner===4)priestFormCastArt();return PRIEST_FORM_ART_BASE.card(c,...args)};
animateAuto=function(m,...args){if(m?.owners?.includes(4)&&m.kind==='attack')priestFormCastArt();return PRIEST_FORM_ART_BASE.auto(m,...args)};
updateAutoHUD=function(...args){
 const r=PRIEST_FORM_ART_BASE.hud(...args);if(typeof document.querySelector!=='function')return r;
 const unit=document.querySelector('.battle-actor[data-hero="4"]');if(!unit?.querySelector)return r;
 const art=unit.querySelector('.hero-poses'),kind=priestFormKind();if(!art?.dataset)return r;
 if(kind){const state=actorState(s.party[slotOf(4)]),pose=priestFormArtFrame(state);if(art.dataset.priestForm!==kind||art.dataset.priestFormKey!==pose.key||art.dataset.spriteFrame!==String(pose.index))art.outerHTML=priestFormSpriteHTML(state)}
 else if(art.dataset.priestForm)art.outerHTML=PRIEST_FORM_ART_BASE.sprite(4,actorState(s.party[slotOf(4)]));
 return r;
};
const priestFormPreloaded=new Set();
preloadHeroArtwork=function(){PRIEST_FORM_ART_BASE.preload();if(typeof Image!=='function'||!inParty(4))return;for(const frames of Object.values(PRIEST_FORM_FRAMES))for(const f of frames)if(!priestFormPreloaded.has(f.asset)){priestFormPreloaded.add(f.asset);const img=new Image();img.decoding='async';img.src=f.asset}};
