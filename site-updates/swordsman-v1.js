'use strict';
// Art actions are integrated independently of an unapproved combat kit.
const SWORDSMAN_ACTION_LABELS={idle:'待機',attack:'普攻',walk:'跑步',guard:'格擋',hurt:'受擊',cast:'技能動作',fallen:'倒下'};
function swordsmanFrames(state='idle'){return state==='idle'?SWORDSMAN_IDLE_V1:SWORDSMAN_ACTIONS_V2[state]||SWORDSMAN_IDLE_V1}
function swordsmanRecruitPreviewHTML(){return `<button class="recruit-card swordsman-preview-card" onclick="showSwordsmanPreview()" aria-label="查看瑟琳娜劍士全部動作"><div class="swordsman-card-art"><img src="assets/swordsman-v1/idle-0.webp" alt="銀髮劍士瑟琳娜，單側暮牙頭骨肩甲" loading="lazy"></div><span class="recruit-number">動作預覽</span><div class="recruit-info"><small>劍士 · 灰誓之劍</small><h3>瑟琳娜</h3><p>七組動作 · 28 幀</p></div></button>`}
function swordsmanPreviewFrameHTML(f,i){return `<svg class="swordsman-action-cel" data-frame="${i}" viewBox="-210 -100 950 680" aria-hidden="true"><image href="${f.asset}" x="${f.offset[0]}" y="${f.offset[1]}" width="${f.source[0]*f.scale}" height="${f.source[1]*f.scale}"/></svg>`}
function showSwordsmanPreview(state='idle',frame=null){
 if(!Object.hasOwn(SWORDSMAN_ACTION_LABELS,state))state='idle';if(!Number.isInteger(frame)||frame<0||frame>3)frame=null;
 const frames=swordsmanFrames(state),label=SWORDSMAN_ACTION_LABELS[state],loop=state==='idle'||state==='walk',duration=state==='idle'?1600:state==='walk'?720:state==='fallen'?1600:1000;
 modal(`<section class="swordsman-gallery"><div class="eyebrow">EMBER SPIRE · SWORDSMAN</div><h2>瑟琳娜 · 灰誓之劍</h2><nav class="swordsman-action-tabs" aria-label="劍士動作">${Object.entries(SWORDSMAN_ACTION_LABELS).map(([key,name])=>`<button onclick="showSwordsmanPreview('${key}')" aria-pressed="${state===key}">${name}</button>`).join('')}</nav><p>${label} · 面向右側敵人${loop?' · 循環播放':' · 播放後停在末幀'}</p><div class="swordsman-preview-stage" data-state="${state}" data-motion="${loop?'loop':'once'}" ${frame!==null?`data-selected-frame="${frame}"`:''} style="--swordsman-duration:${duration}ms" role="img" aria-label="瑟琳娜${label}四幀動作，朝向右側敵人"><span class="swordsman-floor" aria-hidden="true"></span>${frames.map(swordsmanPreviewFrameHTML).join('')}</div><div class="swordsman-frame-controls" aria-label="逐幀查看"><button onclick="showSwordsmanPreview('${state}')" aria-pressed="${frame===null}">重新播放</button>${[0,1,2,3].map(i=>`<button onclick="showSwordsmanPreview('${state}',${i})" aria-label="查看第 ${i+1} 幀" aria-pressed="${frame===i}">${i+1}</button>`).join('')}</div><small>動作素材已加入；技能效果尚未設定，目前可預覽全部動作。</small></section>`);
}
function registerSwordsmanAnimations(){
 registerSpriteProfile('selena:base',{body:[140,10,280,430],head:[209,50],main:[160,240],off:[270,240],legacyFeet:[209,430]});
 for(const state of Object.keys(SWORDSMAN_ACTION_LABELS))registerSpriteAnimation({profile:'selena:base',state,frames:swordsmanFrames(state)});
}
