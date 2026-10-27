'use strict';
const PRIEST_FORMS=Object.freeze({
 weave:{key:'priestweaver',name:'命織聖女',cost:2,rarity:'epic',icon:'✧',duration:10000,desc:'消耗 3 祈願，變身 10 秒。不同職業出牌各編織 1 根命線（每職業限一次，上限 4）；下一張牧師卡消耗命線，每根治療最低生命比例隊友 4% 最大生命、神諭倒數縮短 0.5 秒。'},
 nun:{key:'priestnun',name:'寂靜修女',cost:2,rarity:'epic',icon:'♧',duration:10000,desc:'消耗 3 祈願，變身 10 秒。每 2 秒不使用牧師卡累積 1 層靜默，上限 3。下一張牧師卡消耗全部靜默，每層費用 −1（最低 0），並使型態提早結束 1 秒。'},
 funeral:{key:'priestfuneral',name:'送葬聖使',cost:2,rarity:'epic',icon:'☾',duration:10000,desc:'消耗 3 祈願，變身 10 秒，光傷轉暗。立即獲得 2 魂火（上限 5），每消耗 1 祈願再 +1。其他牧師卡消耗 1 魂火追擊印記目標 120% 暗傷；低於 30% 生命改為 180%。敵人死亡獲得 1 魂火／祈願，精英或首領各 2。結束每枚剩餘魂火造成 80% 全體暗傷。'}
});
for(const [kind,f]of Object.entries(PRIEST_FORMS)){C[f.key]={key:f.key,name:f.name,cost:f.cost,rarity:f.rarity,icon:f.icon,desc:f.desc,type:'skill',owner:4,priest:true,priestForm:kind,instant:true};if(!CLASS_SKILLS[4].includes(f.key))CLASS_SKILLS[4].push(f.key)}
function priestFormState(){return s?.auto?.skills?.[4]?.form||null}
function priestFormKind(){const f=priestFormState();return priestLive()&&f?.until>priestNow()?f.kind:null}
function priestFuneralTarget(f=priestFormState()){
 if(!f||f.kind!=='funeral')return null;let e=enemyRoster().find(e=>e.id===f.mark&&e.hp>0);
 if(!e){e=livingEnemies().filter(e=>!e.areaPart).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0]||livingEnemies()[0];f.mark=e?.id}return e;
}
function priestHarvest(){
 const f=priestFormState();if(!priestLive()||f?.kind!=='funeral'||f.until<=priestNow())return false;
 let changed=false;for(const e of enemyRoster())if(e.hp<=0&&e.deathHandled&&!e.areaPart&&!f.harvested.includes(e.id)){
  f.harvested.push(e.id);const n=['精英','首領'].includes(e.type)?2:1;f.souls=Math.min(5,f.souls+n);priestGain(n);changed=true;log('送葬收魂 · 魂火 +'+n+'／祈願 +'+n);
 }if(changed)priestFuneralTarget(f);return changed;
}
function priestEndForm(burst=true){
 const st=priestState(),f=st.form;if(!f)return false;delete st.form;
 if(burst&&f.kind==='funeral'&&f.souls>0&&priestLive()&&s.phase==='battle'){
  const souls=Math.min(5,f.souls);for(const e of [...livingEnemies()])priestHit(e,priestPower()*.8*souls,'終焉送行','dark');log('終焉送行 · '+souls+' 枚魂火，全體暗傷');if(enemyRoster().some(e=>e.hp<=0))victory();
 }return true;
}
function priestBeginForm(kind){
 const st=priestState(),now=priestNow();priestEndForm();st.blackUntil=0;st.refunds=0;
 if(s.phase!=='battle')return;st.form={kind,until:now+PRIEST_FORMS[kind].duration,started:now,seen:[],threads:0,quiet:0,quietAt:now+2000,souls:kind==='funeral'?2:0,mark:s.enemy?.id,harvested:enemyRoster().filter(e=>e.hp<=0).map(e=>e.id)};
 log('瑟菲娜變身「'+PRIEST_FORMS[kind].name+'」！');
}
function priestFormAfterCard(c,f){
 if(!f||priestFormState()!==f||!priestLive()||s.phase!=='battle'||c.freeEcho)return;
 if(f.kind==='weave'){
  if(c.priest&&f.threads){const n=f.threads;f.threads=0;for(let i=0;i<n;i++){const target=s.party.filter(p=>p.hp>0).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];priestHeal(target,.04)}const st=priestState();if(st.oracle)st.oracle.due-=n*500;log('命線祝禱 · 消耗 '+n+' 根命線')}
  for(const id of c.owners||[c.owner])if(Number.isInteger(id)&&inParty(id)&&!f.seen.includes(id)){f.seen.push(id);f.threads=Math.min(4,f.threads+1)}
 }
 if(f.kind==='funeral'&&c.priest&&f.souls>0){const e=priestFuneralTarget(f);if(e){f.souls--;const ratio=e.hp/e.max<.3?1.8:1.2;priestHit(e,priestPower()*ratio,'魂火追擊','dark');if(e.hp<=0)victory()}}
}
const PRIEST_FORM_BASE={resolve:priestResolve,dark:priestDark,cost:mageEffectiveCost,pay:magePaySpell,spend:priestSpend,reason:cardUseBlockedReason,cast:castClassSkill,play:play,choose:priestChooseConfess,tick:priestTick,deaths:resolveEnemyDeaths,tags:abilityTags};
priestDark=function(){return PRIEST_FORM_BASE.dark()||priestFormKind()==='funeral'};
mageEffectiveCost=function(c){const f=priestFormKind()==='nun'?priestFormState():null;return Math.max(0,PRIEST_FORM_BASE.cost(c)-(c?.priest?f?.quiet||0:0))};
magePaySpell=function(c){
 const paid=PRIEST_FORM_BASE.pay(c),f=priestFormState();
 if(c.priest&&f?.kind==='nun'&&f.until>priestNow()){
  const n=f.quiet;f.quiet=0;f.quietAt=priestNow()+2000;f.until-=n*1000;
  if(n)log('靜默釋放 · '+n+' 層減費，型態縮短 '+n+' 秒');
 }return paid;
};
priestSpend=function(n){const success=PRIEST_FORM_BASE.spend(n),f=priestFormState();if(success&&priestLive()&&f?.kind==='funeral'&&f.until>priestNow())f.souls=Math.min(5,f.souls+n);return success};
cardUseBlockedReason=function(c){
 let old=PRIEST_FORM_BASE.reason(c);
 if(c?.key==='priestblack'&&priestFormKind()==='funeral'&&old==='黑祭司型態中')old='';
 if(old)return old;if(c?.priestForm){if((priestState().prayer||0)<3)return '需要 3 層祈願';if(priestFormKind()===c.priestForm)return '已在此型態中'}return '';
};
priestResolve=function(c,origin){
 if(c.priestForm){if(!priestSpend(3))return {damage:0,newBreak:false};priestBeginForm(c.priestForm)}
 else if(c.key==='priestblack')priestEndForm();
 const f=priestFormState(),target=c.key==='priestjudgment'&&priestFormKind()==='funeral'?priestFuneralTarget(f):null;
 return target?withEnemy(target,()=>PRIEST_FORM_BASE.resolve(c,origin)):PRIEST_FORM_BASE.resolve(c,origin);
};
// Observe accepted cards when they leave the hand, including the beginning of a
// channeled cast. Delayed echoes/procs never call this entry and cannot farm threads.
let priestFormCastDepth=0,priestFormCastSerial=0;
castClassSkill=function(i,origin){
 const c=C[s.hand[i]],f=priestFormState();priestFormCastDepth++;priestFormCastSerial++;
 try{return PRIEST_FORM_BASE.cast(i,origin)}finally{priestFormCastDepth--;if(c&&!c.priestForm)priestFormAfterCard(c,f)}
};
play=function(i){
 const c=C[s.hand[i]],f=priestFormState(),serial=priestFormCastSerial,choice=!!priestState().confessChoice;
 const accepted=s.phase==='battle'&&!busy&&!s.auto?.paused&&!choice&&!!c&&canUse(c)&&mageEffectiveCost(c)<=s.energy;
 const r=PRIEST_FORM_BASE.play(i);
 // Class skills already passed through castClassSkill. Only ordinary cards need
 // this fallback; an opened/cancelled confession choice is never a card use.
 if(accepted&&c.key!=='priestconfess'&&serial===priestFormCastSerial&&priestFormCastDepth===0)priestFormAfterCard(c,f);
 return r;
};
resolveEnemyDeaths=function(){const r=PRIEST_FORM_BASE.deaths(...arguments);priestHarvest();return r};
priestTick=function(){
 let changed=!!PRIEST_FORM_BASE.tick();if(!s.auto||s.phase!=='battle')return changed;
 const f=priestFormState(),now=priestNow();if(!f)return changed;
 if(!priestLive())return priestEndForm(false)||changed;
 if(f.until<=now)return priestEndForm()||changed;
 if(f.kind==='nun')while(now>=f.quietAt){f.quietAt+=2000;if(f.quiet<3){f.quiet++;changed=true}}
 if(f.kind==='funeral'){changed=priestHarvest()||changed;const before=f.mark;priestFuneralTarget(f);changed=before!==f.mark||changed}
 return changed;
};
abilityTags=function(p){
 let html=PRIEST_FORM_BASE.tags(p);if(p.id!==4)return html;const kind=priestFormKind(),f=priestFormState();if(!kind)return html;
 if(kind==='funeral')html=html.replace(/<small class="buff-tag">☾ 黑祭司[^<]*<\/small>/g,'');
 const extra=kind==='weave'?'命線 '+f.threads+'/4':kind==='nun'?'靜默 '+f.quiet+'/3':'魂火 '+f.souls+'/5';
 return html+'<small class="buff-tag priest-form-tag">'+PRIEST_FORMS[kind].name+' · '+Math.max(0,(f.until-priestNow())/1000).toFixed(1)+'秒 · '+extra+'</small>';
};

const priestFuneralBasicBefore=heroBasic;
heroBasic=function(p){const target=p?.id===4&&priestFormKind()==='funeral'?priestFuneralTarget():null;return target?withEnemy(target,()=>priestFuneralBasicBefore(p)):priestFuneralBasicBefore(p)};
