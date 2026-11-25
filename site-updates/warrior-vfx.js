'use strict';
// Presentation only: these events never apply damage, statuses or resource gains.
const WARRIOR_SKILL_VFX={
 rageawaken:{pose:'awaken',fx:'rage',place:'ground'},
 ragecleave:{pose:'cleave',fx:'ragecleave',place:'impact',impact:'ragecleave'},
 ragecross:{pose:'cleave',fx:'ragecross',place:'impact',impact:'ragecross'},
 ragefinish:{pose:'cleave',fx:'ragefinish',place:'impact',impact:'ragefinish'},
 defense:{pose:'guard',fx:'parry',place:'guard'},
 heavy:{pose:'empower',fx:'rage',place:'weapon'},
 shieldbash:{pose:'guard',fx:'parry',place:'guard',impact:'parry'},
 siphon:{pose:'empower',fx:'blood',place:'aura'},
 conquest:{pose:'empower',fx:'rage',place:'ground'},
 desperation:{pose:'empower',fx:'rage',place:'aura'},
 soulweapon:{pose:'empower',fx:'soul',place:'weapon'},
 execution:{pose:'cleave',fx:'execution',place:'weapon',impact:'execution'},
 cycloneecho:{pose:'empower',fx:'cyclone',place:'ground'},
 impale:{pose:'empower',fx:'soul',place:'weapon',impact:'soul'},
 whirlwind:{pose:'spin',fx:'cyclone',place:'ground',impact:'cyclone'},
 perfectguard:{pose:'guard',fx:'parry',place:'guard',impact:'parry'},
 pact:{pose:'empower',fx:'blood',place:'contract'},
 undying:{pose:'empower',fx:'will',place:'resolve'},
 bloodlord:{pose:'empower',fx:'blood',place:'lord',impact:'blood'}
};
let warriorVisualBattle=null,warriorVisualEvents=[],warriorVisualSerial=0;
let warriorVisualTime=0,warriorVisualWall=null,warriorVisualWasPaused=false;
// Four dedicated whole-body poses: loaded stance, tucked airborne windup,
// downward drive and braced landing. Each uses the same rigid single axe.
const WARRIOR_EXECUTION_FRAMES=[{"asset":"assets/execution-dunk-v5/pose-0.webp","source":[480,400],"row":{"$r":0},"column":{"$r":0},"scale":0.92,"offset":[-20.080000000000013,90.51999999999998],"sourceFootAnchor":[249,369],"footAnchor":[209,430],"viewBox":{"$r":1},"displayBounds":[-78.64823059541652,28.375206200409977,340.56000000000006,433.68],"bodyBounds":[41.56000000000003,150.32,340.56000000000006,433.68],"headSpan":50,"headSizeRevision":1,"headWorldSize":46,"headSizeConfidence":"measured-source","sourceHeadLandmarks":[[270,94],[264,144]],"sourcePixelsPerLogicalUnit":1.0869565217391304,"spriteSchemaVersion":1,"spriteProfile":"kohaku:single","spriteAnimation":{"$r":2},"spriteFrame":0,"sampling":"nearest","registration":{"$r":3},"executionDunk":true,"executionPhase":"load","anchors":{"Feet":[209,430],"Center":[203.48000000000002,295.68],"Head":[226.48000000000002,206.43999999999997],"MainHand":{"$r":4},"OffHand":[180.48000000000002,201.84],"CastOrigin":{"$r":4},"ProjectileOrigin":{"$r":4},"HitCenter":[203.48000000000002,295.68]},"anchorConfidence":{"Feet":"measured-source-ground-midpoint","Head":{"$r":5},"MainHand":{"$r":6},"OffHand":{"$r":6},"Center":{"$r":7}},"weaponParts":[{"asset":{"$r":8},"source":[714,719],"pivot":[323,358],"worldSize":150,"center":[49.89130434782615,42.717391304347785],"grip":[213,113],"angle":-156.6890649646158,"drawScale":0.22676422567575738,"shaftWorldWidth":6,"mask":[0,0,0,0],"worldBounds":[-78.64823059541652,28.375206200409977,117.50755109528404,225.076172269544]}],"headSizeReference":{"$r":9}},{"asset":"assets/execution-dunk-v5/pose-1.webp","source":[480,400],"row":{"$r":0},"column":{"$r":0},"scale":1.0222222222222221,"offset":[-41.44444444444443,30.31111111111113],"sourceFootAnchor":[245,391],"footAnchor":[209,430],"viewBox":{"$r":1},"displayBounds":[-73.81774694746662,-45.6604721387002,316.3333333333333,405.4666666666667],"bodyBounds":[26.022222222222183,76.31111111111113,316.3333333333333,405.4666666666667],"headSpan":45,"headSizeRevision":1,"headWorldSize":46,"headSizeConfidence":"measured-source","sourceHeadLandmarks":[[274,103],[267,148]],"sourcePixelsPerLogicalUnit":0.9782608695652175,"spriteSchemaVersion":1,"spriteProfile":"kohaku:single","spriteAnimation":{"$r":2},"spriteFrame":1,"sampling":"nearest","registration":{"$r":3},"executionDunk":true,"executionPhase":"coil","airborneFeet":[216,363],"anchors":{"Feet":[209,430],"Center":[242.73333333333335,243.95555555555555],"Head":[234.55555555555554,164.22222222222223],"MainHand":{"$r":10},"OffHand":[176.2888888888889,99.82222222222225],"CastOrigin":{"$r":10},"ProjectileOrigin":{"$r":10},"HitCenter":[242.73333333333335,243.95555555555555]},"anchorConfidence":{"Feet":"authored-airborne-ground-projection","Head":{"$r":5},"MainHand":{"$r":6},"OffHand":{"$r":6},"Center":{"$r":7}},"weaponParts":[{"asset":{"$r":8},"source":[714,719],"pivot":[323,358],"worldSize":150,"center":[66.0869565217391,19.565217391304323],"grip":[204,62],"angle":-162.89727103094762,"drawScale":0.20408780310818167,"shaftWorldWidth":6,"mask":[0,0,0,0],"worldBounds":[-73.81774694746662,-45.6604721387002,112.6649938470365,141.5124910061691]}],"headSizeReference":{"$r":9}},{"asset":"assets/execution-dunk-v5/pose-2.webp","source":[480,400],"row":{"$r":0},"column":{"$r":0},"scale":1.069767441860465,"offset":[-85.18604651162786,57.720930232558146],"sourceFootAnchor":[275,348],"footAnchor":[209,430],"viewBox":{"$r":1},"displayBounds":[-33.83720930232559,104.7906976744186,506.85711139396244,437.99999999999994],"bodyBounds":[-33.83720930232559,104.7906976744186,340.5813953488372,432.13953488372096],"headSpan":43,"headSizeRevision":1,"headWorldSize":46,"headSizeConfidence":"measured-source","sourceHeadLandmarks":[[311,114],[302,157]],"sourcePixelsPerLogicalUnit":0.9347826086956522,"spriteSchemaVersion":1,"spriteProfile":"kohaku:single","spriteAnimation":{"$r":2},"spriteFrame":2,"sampling":"nearest","registration":{"$r":3},"executionDunk":true,"executionPhase":"dive","airborneFeet":[371,347],"anchors":{"Feet":[209,430],"Center":[203.65116279069764,301.62790697674416],"Head":[242.16279069767444,207.4883720930233],"MainHand":{"$r":11},"OffHand":[294.5813953488372,325.1627906976744],"CastOrigin":{"$r":11},"ProjectileOrigin":{"$r":11},"HitCenter":[203.65116279069764,301.62790697674416]},"anchorConfidence":{"Feet":"authored-airborne-ground-projection","Head":{"$r":5},"MainHand":{"$r":6},"OffHand":{"$r":6},"Center":{"$r":7}},"weaponParts":[{"asset":{"$r":8},"source":[714,719],"pivot":[323,358],"worldSize":150,"center":[463.63921798258093,269.9699092080478],"grip":[349,244],"angle":12.76412124480477,"drawScale":0.19501723408115137,"shaftWorldWidth":6,"mask":[0,0,0,0],"worldBounds":[328.4405926582563,258.7966070459756,506.85711139396244,437.99999999999994]}],"headSizeReference":{"$r":9}},{"asset":"assets/execution-dunk-v5/pose-3.webp","source":[480,400],"row":{"$r":0},"column":{"$r":0},"scale":1.069767441860465,"offset":[-85.18604651162786,66.27906976744191],"sourceFootAnchor":[275,340],"footAnchor":[209,430],"viewBox":{"$r":1},"displayBounds":[-11.372093023255815,128.32558139534882,495.9140214646933,438],"bodyBounds":[-11.372093023255815,128.32558139534882,304.2093023255814,431.06976744186045],"headSpan":43,"headSizeRevision":1,"headWorldSize":46,"headSizeConfidence":"measured-source","sourceHeadLandmarks":[[311,107],[303,150]],"sourcePixelsPerLogicalUnit":0.9347826086956522,"spriteSchemaVersion":1,"spriteProfile":"kohaku:single","spriteAnimation":{"$r":2},"spriteFrame":3,"sampling":"nearest","registration":{"$r":3},"executionDunk":true,"executionPhase":"land","anchors":{"Feet":[209,430],"Center":[203.65116279069764,305.906976744186],"Head":[243.23255813953486,209.62790697674416],"MainHand":{"$r":12},"OffHand":[272.1162790697675,341.2093023255814],"CastOrigin":{"$r":12},"ProjectileOrigin":{"$r":12},"HitCenter":[203.65116279069764,305.906976744186]},"anchorConfidence":{"Feet":"measured-source-ground-midpoint","Head":{"$r":5},"MainHand":{"$r":6},"OffHand":{"$r":6},"Center":{"$r":7}},"weaponParts":[{"asset":{"$r":8},"source":[714,719],"pivot":[323,358],"worldSize":150,"center":[458.9022472464797,268.18805534151033],"grip":[329,252],"angle":7.103420377353993,"drawScale":0.19501723408115137,"shaftWorldWidth":6,"mask":[0,0,0,0],"worldBounds":[329.5513395642603,270.73120143556343,495.9140214646933,438]}],"headSizeReference":{"$r":9}}];
{const p=["[[0,0],[480,0],[480,400],[0,400]]","[-450,-600,1400,1170]","\"kohaku:single/execution\"","\"measured-head-and-grips-ground-projection\"","[175.88000000000002,194.47999999999996]","\"measured-source-eye\"","\"measured-source-grip\"","\"authored-torso-center\"","\"assets/warrior-basic-v2/single-rigid-head.webp\"","\"kohaku-idle-walk-measured-v1\"","[167.0888888888889,93.68888888888887]","[288.1627906976744,318.74418604651163]","[266.7674418604651,335.86046511627904]"];const e=v=>{if(!v||typeof v!=="object")return v;if(!Array.isArray(v)&&Object.keys(v).length===1&&Number.isInteger(v.$r))return JSON.parse(p[v.$r]);for(const k of Object.keys(v))v[k]=e(v[k]);return v};e(WARRIOR_EXECUTION_FRAMES)}
WARRIOR_ACTION_FRAMES.single.execution=WARRIOR_EXECUTION_FRAMES;
// One shared presentation clock: anticipation, airborne hold, contact, recovery.
const WARRIOR_EXECUTION_TIMING=Object.freeze({duration:1280,runEnd:240,takeoff:280,apex:420,drop:500,impact:640,hitstop:110,recover:970});
function warriorExecutionCard(c){return c?.owner===0&&!!c.execution}
function warriorExecutionActive(m=sceneMotion){return m?.kind==='attack'&&!m.secondary&&m.warriorSkill?.key==='execution'&&s.party[slotOf(0)]?.hp>0}
// Head replacement is scoped to execution rendering; catalog body/weapon frames stay shared.
const WARRIOR_EXECUTION_HEAD=Object.freeze({asset:'assets/execution-face-v3/head-right.webp',size:153.6,neck:[78,134.4],registrations:{'assets/warrior-basic-v2/single-2-1.webp':[333,130],'assets/warrior-basic-v2/single-2-3.webp':[217,232],'assets/warrior-basic-v2/single-2-4.webp':[173,130]}});
function warriorExecutionHead(f,id,state){if(Number(id)!==0||state!=='attack'||!warriorExecutionActive())return null;const neck=WARRIOR_EXECUTION_HEAD.registrations[f.asset];return neck?{x:neck[0]-78,y:neck[1]-134.4,dx:neck[0]-333,dy:neck[1]-130}:null}
function warriorExecutionHeadHTML(head){return head?`<image class="execution-enemy-facing-head" href="${WARRIOR_EXECUTION_HEAD.asset}" x="${head.x}" y="${head.y}" width="${WARRIOR_EXECUTION_HEAD.size}" height="${WARRIOR_EXECUTION_HEAD.size}" data-look-direction="enemy"/>`:''}
function warriorExecutionPresentation(c){return warriorExecutionCard(c)&&!reduceMotion()?{delay:WARRIOR_EXECUTION_TIMING.impact,clock:'warrior'}:null}
function warriorExecutionTargets(e){return warriorExecutionActive()&&sceneMotion.enemyId===e.id&&sceneMotion.damage>0}
function warriorExecutionPending(e){if(!warriorExecutionActive()||sceneMotion.enemyId!==e.id||reduceMotion())return null;const now=warriorVFXClock();return activeWarriorVFX().find(v=>v.key==='execution'&&v.where==='enemy'&&v.target===e.id&&v.contactSnapshot&&v.born>now)}
function warriorExecutionEnemyView(e){const event=warriorExecutionPending(e);return event?{...e,...event.contactSnapshot}:e}
function warriorExecutionSpriteHTML(){return `<span class="execution-run-pose">${heroSpriteHTML(0,'walk',false,true)}</span><span class="execution-body-lift">${heroSpriteHTML(0,'attack',false,true)}</span><span class="execution-return-pose">${heroSpriteHTML(0,'idle',false,true)}</span>`}
function warriorExecutionFinishHTML(e){const now=warriorVFXClock(),hit=activeWarriorVFX().find(v=>v.key==='execution'&&v.target===e.id&&v.executed&&v.born<=now);return hit?`<strong data-combat-effect-id="finish-${hit.id}" class="warrior-execution-finish ${warriorVFXPaused()?'warrior-vfx-paused':''}" style="--execution-finish-age:-${now-hit.born}ms" aria-hidden="true">處刑</strong>`:''}
if(typeof document.addEventListener==='function')document.addEventListener('visibilitychange',()=>{
 // requestAnimationFrame/HUD updates stop in the background. Capture the
 // transition itself so returning cannot advance through the hidden interval.
 warriorVFXClock();if(!warriorExecutionActive())return;
 sceneMotion.executionPaused=warriorVFXPaused();
 const field=document.querySelector?.('[data-warrior-execution="true"]');field?.style?.setProperty?.('--execution-play',sceneMotion.executionPaused?'paused':'running');
 if(!document.hidden)render();
});
function warriorVFXPaused(){return !!(s?.auto?.paused||document.hidden||$('modal')?.open)}
function warriorVFXClock(){
 const wall=Date.now(),paused=warriorVFXPaused();
 if(warriorVisualBattle!==s?.auto){warriorVisualBattle=s?.auto;warriorVisualEvents=[];warriorVisualTime=0;warriorVisualWall=wall;warriorVisualWasPaused=paused;}
 if(warriorVisualWall!==null&&!paused&&!warriorVisualWasPaused)warriorVisualTime+=Math.max(0,wall-warriorVisualWall);
 warriorVisualWall=wall;warriorVisualWasPaused=paused;return warriorVisualTime;
}
function warriorVFXVisible(){return !!s?.auto&&(s.phase==='battle'||['reward','win'].includes(s.phase)&&(sceneMotion?.owners?.includes(0)||sceneMotion?.kind==='hurt'&&sceneMotion?.hits?.some(h=>h.id===0)))}
function activeWarriorVFX(){
 const now=warriorVFXClock();
 warriorVisualEvents=warriorVisualEvents.filter(e=>e.battle===s.auto&&e.until>now&&warriorVFXVisible());return warriorVisualEvents;
}
function warriorSkillKey(c){
 if(c?.owner!==0)return null;
 if(c.cycloneEcho)return 'cycloneecho';
 const key=cardKeyOf(c)||Object.keys(WARRIOR_SKILL_VFX).find(k=>C[k]?.name===c.name);
 return WARRIOR_SKILL_VFX[key]?key:null;
}
function emitWarriorVFX(key,where='hero',target=null,options={}){
 const def=WARRIOR_SKILL_VFX[key];if(!def||!s?.auto||!['battle','reward','win'].includes(s.phase))return;
 if(where==='hero'&&s.party[slotOf(0)]?.hp<=0)return;
 const now=warriorVFXClock(),delay=options.delay||0,duration=options.duration||650;
 const family=options.family||(where==='enemy'?def.impact:def.fx)||def.fx;
 // Coalesce multi-hit procs and keep busy area attacks bounded.
 const recent=warriorVisualEvents.find(e=>e.key===key&&e.where===where&&e.target===target&&e.family===family&&Math.abs(e.born-(now+delay))<65);
 if(recent){recent.scale=Math.max(recent.scale,options.scale||1);return recent}
 const event={id:++warriorVisualSerial,battle:s.auto,key,family,where,target,born:now+delay,until:now+delay+duration,duration,place:options.place||def.place,scale:options.scale||1,subtle:!!options.subtle};
 warriorVisualEvents.push(event);warriorVisualEvents=warriorVisualEvents.filter(e=>e.until>now).slice(-64);return event;
}
function recordWarriorMotion(m,c=m?.cardEffect){
 if(!m?.owners?.includes(0)||m.secondary||c?.casting)return;
 m.warriorMotionBorn=warriorVFXClock();
 let key=warriorSkillKey(c),pose=key&&WARRIOR_SKILL_VFX[key].pose;
 if(c?.cycloneEcho)pose='spin';
 if(m.warriorHeavy){key='heavy';pose='cleave'}
 if(m.bloodRageTechnique){key='rage'+m.bloodRageTechnique;pose='cleave'}
 if(!key)return;
 if(m.auto&&s.phase!=='battle')m.duration=Math.max(750,m.duration||0);
 m.warriorSkill={key,pose,born:warriorVFXClock(),duration:m.auto?m.duration||400:850,loop:pose==='spin',stationary:pose==='spin'};
 if(key==='execution'){m.duration=WARRIOR_EXECUTION_TIMING.duration;m.warriorSkill.duration=m.duration;m.executionPaused=warriorVFXPaused();}
 // A cast only affects the caster visually; target impacts are recorded by actual hits.
 if(c)emitWarriorVFX(key,'hero',null,key==='execution'?{family:'cut',place:'weapon',delay:reduceMotion()?0:WARRIOR_EXECUTION_TIMING.impact-85,duration:230}:{duration:850});
}
function recordWarriorImpact(e,owner,options,actual,before=null){
 if(owner!==0||actual<=0||!s?.auto||options.bloodRageTechnique||options.bloodRageFinisher)return;
 let key=warriorSkillKey(options.card);
 if(options.bloodlordEcho)key='bloodlord';
 else if(options.bloodRageFinisher||options.bloodRageTechnique)key='execution';
 else if(options.counter)key='perfectguard';
 else if(options.basic&&options.warriorHeavy)key='heavy';
 if(!key||!['heavy','shieldbash','execution','whirlwind','cycloneecho','perfectguard','bloodlord','impale'].includes(key))return;
 const close=['heavy','shieldbash','execution'].includes(key)&&!options.bloodRageFinisher;
 const delay=reduceMotion()?0:key==='execution'?WARRIOR_EXECUTION_TIMING.impact:close?315:0;
 const event=emitWarriorVFX(key,'enemy',e.id,{family:key==='heavy'||options.bloodRageTechnique==='cross'?'cut':undefined,delay,duration:key==='execution'?540:650,place:key==='whirlwind'||key==='cycloneecho'?'ground':'impact'});
 if(key==='execution'&&event){event.executed=e.hp<=0;if(before&&delay)event.contactSnapshot={hp:before.hpBefore,shield:before.shieldBefore,broken:before.brokenBefore};if(!reduceMotion()){emitWarriorVFX(key,'enemy',e.id,{family:'ragecleave',place:'ground',delay,duration:400,scale:.85});emitWarriorVFX(key,'enemy',e.id,{family:'redlightning',place:'impact',delay:delay+45,duration:280,scale:1});}}
}
function recordBloodRageVFX(kind,enemyId){
 const key=kind==='roar'?'rageawaken':'rage'+kind;
 if(!WARRIOR_SKILL_VFX[key])return;
 if(kind==='roar')emitWarriorVFX(key,'hero',null,{duration:1000,scale:1.05});
 else emitWarriorVFX(key,'enemy',enemyId,{duration:850,delay:reduceMotion()?0:315});
}
function warriorAwakenPose(){
 if(!bloodRageActive())return null;
 const event=activeBloodRageEvents().findLast(e=>e.kind==='roar');
 return event?{pose:'awaken',born:event.started,duration:event.life,stationary:true}:null;
}
function recordWarriorBleedVFX(e,actual){if(actual>0)emitWarriorVFX('siphon','enemy',e.id,{family:'blood',place:'bleed',duration:500,subtle:true,scale:.45})}
function recordWarriorSoulVFX(e){emitWarriorVFX('soulweapon','enemy',e.id,{family:'soul',place:'soulrise',duration:850});emitWarriorVFX('soulweapon','hero',null,{duration:850,scale:.8})}
function recordWarriorResonanceVFX(e,actual){if(actual>0)emitWarriorVFX('impale','enemy',e.id,{family:'soul',place:'impale',duration:550,scale:.7})}
function warriorWhirlwindActive(){const p=s.party[slotOf(0)];return s.phase==='battle'&&p?.hp>0&&!heroControlled(p)&&s.auto?.jobs?.some(j=>j.owner===0&&j.key==='whirlwind')}
function warriorActionPose(state,meleeInner=false){
 const p=s.party[slotOf(0)];if(!p||p.hp<=0||['walk','hurt','fallen'].includes(state))return null;
 const m=sceneMotion,owned=m?.owners?.includes(0)&&m.kind==='attack'&&!m.secondary;
 let info=owned?m.warriorSkill:null;
 if(!info&&['idle','attack'].includes(state))info=warriorAwakenPose();
 if(!info&&state==='guard')info={pose:'guard',born:warriorVFXClock()-Math.max(0,Date.now()-(m?.started??Date.now())),duration:600};
 if(!info&&['idle','attack'].includes(state)&&warriorWhirlwindActive())info={pose:'spin',born:0,duration:480,loop:true};
 if(!info||!['idle','attack','cast','guard'].includes(state))return null;
 if(info.key==='execution'&&meleeInner&&state==='idle')return null;
 const form='single';
 const frames=(info.key==='execution'?WARRIOR_EXECUTION_FRAMES:null)||(info.pose==='awaken'&&typeof BLOOD_RAGE_FRAMES!=='undefined'?BLOOD_RAGE_FRAMES[form]:null)||WARRIOR_ACTION_FRAMES[form]?.[info.pose]||(form==='dual'&&info.pose==='guard'?kohakuDualFrames('guard'):form==='dual'&&info.pose==='empower'?KOHAKU_DUAL_FRAMES.idle:null);
 if(!frames?.length)return null;
 const execution=info.key==='execution',duration=execution?WARRIOR_EXECUTION_TIMING.duration:info.loop?480:meleeInner?420:info.duration||850;
 const age=info.loop?(s.auto?.clock||0)%duration:Math.max(0,warriorVFXClock()-info.born-(meleeInner&&!execution?315:0));
 return {...info,frames,action:info.pose,duration,age,execution};
}
function warriorPaintHTML(family,key,age,duration=650,place='impact',scale=1,loop=false,subtle=false){
 const pause=warriorVFXPaused();
 return `<span class="warrior-painted-fx warrior-fx-${family} warrior-place-${place} ${loop?'warrior-fx-loop':''} ${subtle?'warrior-fx-subtle':''} ${pause?'warrior-vfx-paused':''}" data-warrior-fx="${key}" data-warrior-family="${family}" data-authored-frames="4" style="--warrior-fx-duration:${duration}ms;--warrior-fx-age:-${Math.max(0,age)}ms;--warrior-fx-scale:${scale}">${[0,1,2,3].map(i=>`<img class="warrior-fx-cel warrior-fx-cel-${i}" src="assets/warrior-vfx/${family}-${i+1}-v1.webp" width="320" height="320" alt="" draggable="false">`).join('')}</span>`;
}
function warriorHeroContentHTML(p){
 if(p.id!==0||p.hp<=0||!warriorVFXVisible())return '';
 const now=warriorVFXClock(),events=activeWarriorVFX().filter(e=>e.where==='hero'&&e.born<=now);
 let html=events.map(e=>combatEffectIdentity(warriorPaintHTML(e.family,e.key,now-e.born,e.duration,e.place,e.scale,false,e.subtle),e.id)).join('');
 if(s.phase!=='battle')return html;
 const state=abilityState(0),clock=s.auto.clock,active=new Set(events.map(e=>e.key));let persistent=[];
 if(buffActive(p,'bloodlord'))persistent.push(['blood','bloodlord','lord']);
 if(state.soulLeechUntil>clock&&state.soulLeechStacks)persistent.push(['soul','soulweapon','weapon']);
 if(buffActive(p,'perfectguard'))persistent.push(['parry','perfectguard','guard']);
 else if(buffActive(p,'stance'))persistent.push(['parry','defense','ground']);
 if(state.bloodking&&(state.bloodkingStacks||0)>=20)persistent.push(['blood','siphon','ground']);
 for(const [family,key,place]of persistent.filter(a=>!active.has(a[1])).slice(0,2))html+=warriorPaintHTML(family,key,clock%1800,1800,place,.72,true,true);
 return html;
}
function warriorHeroHTML(p){return p.id===0?`<span class="warrior-hero-fx-slot" data-warrior-hero="0" aria-hidden="true">${warriorHeroContentHTML(p)}</span>`:''}
// Active-status loop: bounded droplets follow battle time, with no combat RNG or damage hooks.
function enemyBleedDripsHTML(e){
 if(s.phase!=='battle'||!s.auto||e.hp<=0||!(e.status?.bleedStacks>0)||!(e.status.bleedUntil>s.auto.clock))return '';
 const phase=s.auto.clock%1200,paused=warriorVFXPaused();
 return `<span class="enemy-bleed-drips ${paused?'bleed-drips-paused':''}" data-bleed-enemy="${e.id}" style="--bleed-age:-${phase}ms" aria-hidden="true">${[-13,3,17].map((x,i)=>`<span class="bleed-drip-cycle" style="--bleed-x:${x}px;--bleed-stagger:-${i*400}ms"><span class="bleed-falling-drop" data-authored-frames="4">${[0,1,2,3].map(c=>`<img class="bleed-fall-cel bleed-fall-cel-${c}" src="assets/warrior-vfx/bleedfall-${c+1}-v1.webp" width="256" height="256" alt="" draggable="false">`).join('')}</span><i class="bleed-ground-splash"><img src="assets/warrior-vfx/bleedfall-3-v1.webp" width="256" height="256" alt=""></i></span>`).join('')}</span>`;
}
function warriorEnemyContentHTML(e){
 const now=warriorVFXClock();return activeWarriorVFX().filter(v=>v.where==='enemy'&&v.target===e.id&&v.born<=now).slice(-5).map(v=>combatEffectIdentity(warriorPaintHTML(v.family,v.key,now-v.born,v.duration,v.place,v.scale,false,v.subtle),v.id)).join('')+warriorExecutionFinishHTML(e)+enemyBleedDripsHTML(e);
}
function warriorEnemyHTML(e){return `<span class="warrior-enemy-fx-slot" data-warrior-enemy="${e.id}" aria-hidden="true">${warriorEnemyContentHTML(e)}</span>`}
function warriorVFXTargetsEnemy(id){return activeWarriorVFX().some(e=>e.where==='enemy'&&e.target===id)}
function warriorEffectDOMKey(p,enemy=false){
 const now=warriorVFXClock(),events=activeWarriorVFX().filter(e=>e.born<=now&&(enemy?e.where==='enemy'&&e.target===p?.id:e.where==='hero'));
 const state=s.auto?abilityState(0):{},clock=s.auto?.clock||0;
 return JSON.stringify([warriorVFXVisible(),s.phase,p?.hp>0,events.map(e=>[e.id,e.scale,e.executed]),enemy?!!(p?.status?.bleedStacks>0&&p.status.bleedUntil>clock):[buffActive(p,'bloodlord'),state.soulLeechUntil>clock&&!!state.soulLeechStacks,buffActive(p,'perfectguard'),buffActive(p,'stance'),state.bloodking&&(state.bloodkingStacks||0)>=20]]);
}
function updateWarriorVFX(){
 warriorVFXClock();activeWarriorVFX();
 if(warriorExecutionActive()){
  const paused=warriorVFXPaused(),prior=sceneMotion.executionPaused;sceneMotion.executionPaused=paused;
  if(prior!=null&&prior!==paused)render();
 }
 // One contact render reveals the real HP/hurt/death view at the axe landing.
 // Combat already resolved once; this only releases the temporary view snapshot.
 if(warriorExecutionActive()&&!reduceMotion()&&!sceneMotion.executionContactShown&&warriorMeleeAge()>=WARRIOR_EXECUTION_TIMING.impact){sceneMotion.executionContactShown=true;render();}
 if(typeof document.querySelectorAll!=='function')return;
 for(const node of document.querySelectorAll('[data-warrior-hero]')){const p=s.party[slotOf(0)];setCombatEffectHTML(node,()=>p?warriorHeroContentHTML(p):'',warriorVFXPaused(),warriorEffectDOMKey(p));}
 for(const node of document.querySelectorAll('[data-warrior-enemy]')){const e=enemyRoster().find(e=>String(e.id)===node.dataset.warriorEnemy);setCombatEffectHTML(node,()=>e?warriorEnemyContentHTML(e):'',warriorVFXPaused(),warriorEffectDOMKey(e,true));}
}

let warriorArtworkPreloaded=false;
function preloadWarriorArtwork(){
 if(warriorArtworkPreloaded||typeof Image!=='function'||!inParty(0))return;warriorArtworkPreloaded=true;
 const assets=new Set(Object.values(WARRIOR_ACTION_FRAMES.single).flatMap(frames=>frames.map(f=>f.asset)));
 if(typeof WARRIOR_BASIC_ATTACK_FRAMES!=='undefined')for(const form of [WARRIOR_BASIC_ATTACK_FRAMES.single])for(const frames of form)for(const f of frames){assets.add(f.asset);for(const p of f.weaponParts||[])assets.add(p.asset)}
 assets.add('assets/warrior-basic-v2/shaft-texture.webp');assets.add(WARRIOR_EXECUTION_HEAD.asset);for(let i=0;i<4;i++)assets.add('assets/execution-charge-v6/edge-'+i+'.webp');
 if(typeof BLOOD_RAGE_FRAMES!=='undefined')for(const frames of [BLOOD_RAGE_FRAMES.single])for(const f of frames)assets.add(f.asset);
 for(const family of ['redlightning','cut','execution','cyclone','parry','blood','soul','rage','will','ragecleave','ragecross','ragefinish','bleedfall'])for(let i=1;i<=4;i++)assets.add('assets/warrior-vfx/'+family+'-'+i+'-v1.webp');
 for(const asset of assets)preloadBattleImage(asset);
 for(const kind of ['smoke','eye'])for(let frame=0;frame<4;frame++)preloadBattleImage(bloodRagePresenceAsset(kind,frame));
}
