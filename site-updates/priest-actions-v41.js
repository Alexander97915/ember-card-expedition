'use strict';
// Both visual forms share gameplay stats, world ground and animation contracts.
registerSpriteProfile('seraphina:dark',{...spriteProfile('seraphina:base'),label:'瑟菲娜 · 黑祭司'});
for(const [state,frames]of Object.entries(PRIEST_DARK_FRAMES))registerSpriteAnimation({profile:'seraphina:dark',state,frames});
function priestVisualFramesV41(state){const sets=s.auto&&priestDark()?PRIEST_DARK_FRAMES:PRIEST_FRAMES;return sets[state]||sets.idle}
const priestFramesBeforeV41=spriteFrames;
spriteFrames=function(id,state){return Number(id)===4?priestVisualFramesV41(state):priestFramesBeforeV41(...arguments)};
const priestHTMLBeforeV41=heroSpriteHTML;
let priestPoseClockV41=null;
heroSpriteHTML=function(id,state){
 if(Number(id)!==4)return priestHTMLBeforeV41(...arguments);
 const frames=priestVisualFramesV41(state),v=frames[0].viewBox,form=frames[0].spriteProfile,token=state+':'+form+':'+(sceneMotion?.started||0),now=priestNow();
 if(!priestPoseClockV41||priestPoseClockV41.token!==token||now<priestPoseClockV41.at)priestPoseClockV41={token,at:now};
 const age=Math.max(0,now-priestPoseClockV41.at),duration=state==='fallen'?1000:state==='hurt'||state==='guard'?320:state==='walk'?800:800;
 return `<span ${spritePoseAttributes(frames)} data-combat-view="${v.join(' ')}" class="hero-poses priest-actions-v41 poses-${state}" style="--priest-action-duration:${duration}ms;--priest-action-age:-${age}ms;--action-frames:${frames.length};--pose-left:${v[0]/418};--pose-width:${v[2]/418};--pose-height:${v[3]/418};--pose-bottom:${(440-v[1]-v[3])/418}">${frames.map((f,i)=>heroCelHTML(f,4,state,i)).join('')}</span>`;
};
const priestPreloadBeforeV41=preloadHeroArtwork,priestPreloadedV41=new Set();
preloadHeroArtwork=function(){priestPreloadBeforeV41();if(typeof Image!=='function'||!inParty(4))return;for(const sets of [PRIEST_FRAMES,PRIEST_DARK_FRAMES])for(const frames of Object.values(sets))for(const f of frames)if(!priestPreloadedV41.has(f.asset)){priestPreloadedV41.add(f.asset);preloadBattleImage(f.asset);}};
// Refresh as soon as the 8-second gameplay timer changes the visible form.
const priestTickBeforeV41=priestTick;let priestVisibleDarkV41=false;
priestTick=function(){const result=priestTickBeforeV41(...arguments),active=priestDark(),changed=active!==priestVisibleDarkV41;priestVisibleDarkV41=active;return !!result||changed};

// Reviewed native density references also cover the two authored idle sheets.
const priestHeadTargetBeforeV41=spriteHeadTarget;
spriteHeadTarget=function(f){return f.qualityRevision===41&&f.bakedWeaponReview&&f.headSizeRevision===1?f.headWorldSize:priestHeadTargetBeforeV41(f)};
