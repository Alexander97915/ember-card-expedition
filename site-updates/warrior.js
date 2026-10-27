'use strict';
// Battle passives use the saved clock; only soulAttack survives encounters; pactStacks end with the battle.
const WARRIOR_ICONS={
 conquest:{color:'#ffbd67',path:'M4 24 8 11 14 17 20 5 25 15 29 11 26 27H6Z'},
 desperation:{color:'#ec6682',path:'m18 2-5 11H6l7 6-2 11 13-17h-8Z'},
 soulweapon:{color:'#b3a0ee',path:'M14 2h5v14l7 5-5 7-4-6-5 6-6-7 8-5Z'},
 execution:{color:'#ed7c75',path:'M6 2h3v28H6Zm17 0h3v28h-3ZM10 5h12v12l-12 6ZM3 27h26v3H3Z'},
 cycloneecho:{color:'#a5d3ce',path:'M27 10C22-1 5 3 4 15c-2 12 19 17 23 5M23 10C16 3 7 12 10 20c4 8 14 2 11-4-2-5-8-3-7 1'},
 impale:{color:'#e9b18d',path:'m6 2 6 9-4 1 8 17-7-13-4 2Zm14 0 9 7-4 2 2 17-6-15-4 1Z'}
};
function warriorIconHTML(key,extra=''){if(!WARRIOR_ICONS[key])return '';return `<img class="ui-icon skill-icon ${extra}" src="assets/ui-icons/skill-${key}-v2.webp" width="256" height="256" alt="" aria-hidden="true" decoding="async">`}

function registerWarriorSkills(){
 registerWarriorExpansion();
 GEAR.soulAxe={name:'噬魂戰斧',slot:'weapon',owner:0,rarity:'epic',icon:'⚒',stats:{attack:3},effect:'soulHarvest',ability:'噬魂',asset:'assets/ui-icons/skill-soulweapon-v2.webp',desc:'普攻吸血 10%。琥珀傷害敵人後 5 秒內敵人死亡，本次遠征累積攻擊力 +1，每場最多 +10；召喚怪、分裂幼體及訓練假人不提供收益。累積值保留至遠征結束；卸下暫停加成與收集，重新裝備恢復。'};
 GEAR_LINKS.soulAxe=['heavy','whirlwind','execution'];
 const passive=(name,cost,rarity,desc,key)=>({name,owner:0,cost,rarity,icon:'⚒',desc,type:'skill',warriorPassive:key});
 Object.assign(C,{
 conquest:passive('征服狂熱',1,'uncommon','本場被動：普攻每段命中疊 1 層，每層攻擊力 +3%、攻速 +2%，最多 10 層；滿層普攻追加 40% 普攻傷害斬擊；停攻 4 秒後每秒衰退 1 層','conquest'),
 desperation:passive('瀕死狂化',1,'uncommon','本場被動：每失去 10% 生命，普攻攻速 +8%；生命低於 30% 時物理傷害 +20%；參與擊殺獲得減傷 25%／2 秒，不疊加','desperation'),
 execution:{name:'處刑斷頭台',owner:0,cost:2,rarity:'legendary',icon:'⚒',type:'attack',execution:true,hits:[['slash',10]],desc:'單體造成完整普攻 250% 斬傷，目標每層有效流血再增加 30% 普攻傷害（不消耗流血）；命中前目標生命低於 30% 時傷害 ×1.5；完整普攻含噬魂、裝備與攻擊加成，不計狂熱追加或重斬蓄力；本卡直接擊殺時，返還 2 能量（最多 5），並獲得本場攻擊力 +2；血怒期間處刑成功另回復 20 怒氣'},
 cycloneecho:passive('旋風共振',2,'epic','本場每段原始旋風斬有 25% 機率追加 1 道 50% 傷害旋風；血之領主期間改為追加 2 道；追加旋風不再共振、不施加流血','cycloneecho'),
 impale:passive('穿刺殘響',2,'epic','本場物理命中留下穿刺印記，儲存該段結算傷害的 20%（至少 1）；後續每段物理命中引爆 1 枚並留下新印記，最多 5 枚、6 秒；殘響不暴擊、不吸血、不遞迴','impale')
 });
 for(const list of Object.values(GEAR_LINKS))for(let i=0;i<list.length;i++)if(list[i]==='berserk')list[i]='desperation';
 for(const build of BUILDS)build.cards=build.cards.map(k=>k==='berserk'?'desperation':k);
 const low=BUILDS.find(b=>b.name==='低血狂戰');if(low){low.cards=['desperation','pact','siphon'];low.desc='契約降低生命 → 瀕死提高攻速 → 吸血與擊殺減傷續戰'}
 BUILDS.push({owner:0,name:'征服戰斧',cards:['conquest','impale'],gear:['executionAxe','keenCharm'],desc:'單斧持續命中 → 疊滿狂熱 → 穿刺殘響追加傷害'},
 {owner:0,name:'流血處刑',cards:['heavy','whirlwind','execution'],gear:['soulAxe','breakerAxe','bloodAxe'],desc:'重斬破甲與旋風鋪流血 → 斷頭台斬殺返能 → 噬魂累積遠征攻擊力'});
 const spin=BUILDS.find(b=>b.name==='旋風血刃');if(spin){spin.cards=['whirlwind','cycloneecho','bloodlord'];spin.desc='原始旋風觸發共振 → 血之領主增加追加旋風 → 裝備吸血化盾'}
 GEAR_LINKS.rageCharm=['desperation','pact','undying'];
}
// Convert old owned cards once; a weapon goes to the bag without replacing worn gear.
function migrateSoulweaponEquipment(t){
 if(t.soulweaponEquipmentRevision===1)return;
 const p=t.party?.find(p=>p.id===0),st=t.auto?.skills?.[0];
 const owned=['deck','collection','hand','draw','discard'].some(key=>t[key]?.includes('soulweapon'))||st?.soulweapon||(p?.soulAttack||0)>0;
 if(owned&&!t.training){initEquipment(t);const q=t.equipment;if(!q.bag.some(item=>item.key==='soulAxe'))q.bag.push({uid:q.nextId++,key:'soulAxe'});}
 if(st){delete st.soulweapon;delete st.soulLeechStacks;delete st.soulLeechUntil;}
 t.soulweaponEquipmentRevision=1;
}
function migrateWarriorCards(t){
 migrateWarriorDurations(t);
 migrateWarriorExpansion(t);
 retireWarriorDualAxes(t);
 const pactOwner=t.party?.find(p=>p.id===0);if(pactOwner?.pactStacks!=null)pactOwner.pactStacks=Math.max(0,Math.min(3,Math.floor(pactOwner.pactStacks)||0));
 if(t.warriorRevision===2)return;
 for(const field of ['deck','collection','hand','draw','discard','rewards'])if(Array.isArray(t[field]))t[field]=t[field].map(k=>k==='berserk'?'desperation':k);
 if(t.auto&&t.party){const p=t.party.find(p=>p.id===0);if(p?.buffs?.berserk>t.auto.clock){t.auto.skills??={};t.auto.skills[0]??={};t.auto.skills[0].desperation=true;}if(p?.buffs)delete p.buffs.berserk;}
 const p=t.party?.find(p=>p.id===0),st=t.auto?.skills?.[0];if(st?.siphon){st.bloodking=true;delete st.siphon;}if(st?.undyingUsed&&p?.buffs)delete p.buffs.invulnerable;if(st)delete st.undyingUsed;if(p?.buffs)delete p.buffs.pact;t.warriorRevision=2;
}
function retireWarriorDualAxes(t){
 for(const field of ['deck','collection','hand','draw','discard','rewards'])if(Array.isArray(t[field]))t[field]=t[field].filter(k=>k!=='dualaxes');
 if(Array.isArray(t.shop))t.shop=t.shop.filter(item=>(typeof item==='string'?item:item?.key)!=='dualaxes');
 if(t.training?.config?.cards)t.training.config.cards=t.training.config.cards.filter(k=>k!=='dualaxes');
 const state=t.auto?.skills?.[0];
 if(state){
  if(state.dualaxes&&Number.isFinite(t.auto.heroAt?.[0]))t.auto.heroAt[0]=(t.auto.clock||0)+Math.max(0,t.auto.heroAt[0]-(t.auto.clock||0))/.7;
  delete state.dualaxes;delete state.singleaxePower;
 }
 if(Array.isArray(t.auto?.jobs))t.auto.jobs=t.auto.jobs.filter(j=>j.key!=='dualaxes');
 t.warriorFormRevision=3;
}
function warriorSpeed(p){const st=abilityState(0);let value=1;if(st.conquest)value*=1+(st.conquestStacks||0)*.02;if(st.desperation)value*=1+Math.min(9,Math.floor((1-warriorEffectiveHP(p)/p.max)*10+1e-8))*(hasGearEffect(0,'rageSpeed')?.12:.08);return value}
function warriorAttackValue(id,attr,value){if(id!==0||!['slash','pierce','blunt'].includes(attr))return value;const p=s.party[slotOf(0)],st=abilityState(0);return Math.floor((value+(hasGearEffect(0,'soulHarvest')?p.soulAttack||0:0)+(st.executionAttack||0))*(1+Math.min(3,p.pactStacks||0)*.5+(st.conquestStacks||0)*.03+(st.bloodkingStacks||0)*.02)*(st.desperation&&warriorEffectiveHP(p)/p.max<.3?1.2:1)*(bloodRageActive()?1.2:1))}
// Transform special attacks before applying strength and conquest follow-up hits.
function warriorBasicHits(hits,technique=null){return technique?bloodRageTechniqueHits(hits,technique):hits}
function warriorFinalBasicHits(hits,options){
 const st=abilityState(0),strength=options.ignoreStrength?0:s.strength;
 const full=hits.map(([a,n])=>[a,n+strength]);
 const reference=options.bloodRageTechnique?warriorAttackValue(0,'slash',AUTO_BASIC[0].damage+gearBonus(0,'attack'))+strength:full.find(h=>h[0]==='slash')?.[1]||0;
 let out=full;
 if(warriorInstinctActive()&&!options.noOnHit)out=out.map(([a,n])=>[a,n*(1+(st.instinctStacks||0)*.12)]);
 if(st.conquest&&(st.conquestStacks||0)>=10)out.push(['slash',Math.floor(reference*.4)]);
 options.ignoreStrength=true;
 return out;
}

// Snapshot a complete ordinary strike once, before target vulnerability or criticals.
function warriorExecutionHits(c){
 const base=[['slash',AUTO_BASIC[0].damage]],options={basic:true,noOnHit:true};
 const skills=skillAttackHits(base,0,options),full=gearAttackHits(skills,0,null).map(([a,n])=>[a,n+s.strength]);
 const bleed=s.enemy.status.bleedUntil>s.auto.clock?s.enemy.status.bleedStacks||0:0;
 const out=full.map(([a,n])=>[a,n*(25+3*bleed)/10]);
 c.damageTrace=[];
 damageTraceStep(c.damageTrace,'完整普攻（含力量）',full,'攻擊與裝備加成計算一次；不含狂熱追加與蓄力');
 damageTraceStep(c.damageTrace,'斷頭台與流血倍率',out,'250% ＋ '+bleed+' 層流血 ×30%；保留流血');
 return out;
}

function warriorAfterDamage(e,owner,options,hits,actual){
 if(owner!==0||!actual||options.bloodlordEcho)return;const now=s.auto.clock,st=abilityState(0),p=s.party[slotOf(0)];e.warriorHitAt=now;if(options.bloodRageFinisher)return;
 if(options.card?.execution&&e.hp<=0)e.warriorExecuted=true;
 const physical=hits.filter(([a,n])=>n>0&&['slash','pierce','blunt'].includes(a));
 if(options.basic&&!options.noOnHit&&physical.length&&e.hp>0){const bleed=1+(st.bloodking&&(st.bloodkingStacks||0)>=20?1:0);if(bleed)addBleedStacks(e,bleed,0)}
 if(options.basic&&st.conquest&&physical.length){const old=heroInterval(0),wasFull=(st.conquestStacks||0)>=10;st.conquestStacks=Math.min(10,(st.conquestStacks||0)+physical.length);st.conquestDecayAt=Math.max(st.conquestDecayAt||0,now+4000);rescaleHeroAttack(p,old);if(!wasFull&&st.conquestStacks===10&&typeof emitWarriorVFX==='function')emitWarriorVFX('conquest','hero',null,{duration:900});}
 if(st.impale&&physical.length&&e.hp>0){const status=e.status;if(!(status.impaleUntil>now))status.impaleMarks=[];status.impaleMarks??=[];
  for(const [attr,damage]of physical){if(e.hp<=0)break;const stored=status.impaleMarks.shift();if(stored){const before=e.hp,n=applyEnemyLifeDamage(e,stored);countBattleStat('damage',n,0);recordPeriodicDamage(e,0,'穿刺殘響',stored,stored,n,before,false,'先前物理命中儲存的 20% 傷害；不再次計算暴擊或失衡');if(typeof recordWarriorResonanceVFX==='function')recordWarriorResonanceVFX(e,n);}
   if(e.hp>0)status.impaleMarks.push(Math.max(1,Math.floor(damage*incomingElementMultiplier(e,attr)*(e.broken?1.5:1)*.2)));}
  status.impaleMarks=status.impaleMarks.slice(-5);status.impaleUntil=now+6000;
 }
}
function warriorEnemyDeath(e){warriorBrandDeath(e);const involved=e.warriorHitAt!=null&&s.auto.clock-e.warriorHitAt<=5000,executed=!!e.warriorExecuted;delete e.warriorHitAt;delete e.warriorExecuted;const p=s.party[slotOf(0)];if(!p||p.hp<=0||s.training||e.trainingDummy)return;const st=abilityState(0);
 if(!involved)return;
 if(hasGearEffect(0,'soulHarvest')&&!e.warriorNoSoul&&(st.soulsThisBattle||0)<10){p.soulAttack=(p.soulAttack||0)+1;st.soulsThisBattle=(st.soulsThisBattle||0)+1;if(typeof recordWarriorSoulVFX==='function')recordWarriorSoulVFX(e);log('噬魂武器：本次遠征攻擊力 +'+p.soulAttack+'。');}
 if(executed){restoreBloodRage(20);st.executionAttack=(st.executionAttack||0)+2;s.energy=Math.min(5,s.energy+2);log('處刑成功：返還 2 能量，本場攻擊力 +'+st.executionAttack+'。');}
 if(st.desperation)applyBuff(p,'desperationGuard',2000);
}
function queueWarriorCycloneEcho(job){if(job.key!=='whirlwind'||job.cycloneEcho||!abilityState(0).cycloneecho||s.phase!=='battle'||Math.random()>=.25)return;const count=buffActive(s.party[slotOf(0)],'bloodlord')?2:1;for(let i=0;i<count;i++)s.auto.jobs.push({...job,due:s.auto.clock+180*(i+1),bleedStack:0,cycloneEcho:true,hits:job.hits.map(([a,n])=>[a,Math.max(1,Math.floor(n*.5))])});}
function tickWarrior(){tickWarriorExpansion();const st=abilityState(0),now=s.auto.clock;let changed=false;if(st.soulLeechStacks&&!(st.soulLeechUntil>now)){delete st.soulLeechStacks;delete st.soulLeechUntil;changed=true;}if(st.conquestStacks>0&&now>=(st.conquestDecayAt??Infinity)){const old=heroInterval(0),steps=Math.min(st.conquestStacks,1+Math.floor((now-st.conquestDecayAt)/1000));st.conquestStacks-=steps;st.conquestDecayAt+=steps*1000;rescaleHeroAttack(s.party[slotOf(0)],old);changed=true;}for(const e of livingEnemies())if(e.status.impaleMarks?.length&&e.status.impaleUntil<=now){delete e.status.impaleMarks;delete e.status.impaleUntil;changed=true;}return changed;}
function warriorTags(){const st=abilityState(0),p=s.party[slotOf(0)],parts=[],tag=(key,label)=>parts.push('<small class="buff-tag">'+warriorIconHTML(key)+label+'</small>');if(st.conquest)tag('conquest','狂熱 '+(st.conquestStacks||0)+'/10'+((st.conquestStacks||0)>=10?' · 追加斬擊':''));if(st.desperation)tag('desperation','瀕死狂化'+(warriorEffectiveHP(p)/p.max<.3?' · 物傷 +20%':''));if(buffActive(p,'desperationGuard'))tag('desperation','擊殺減傷 25% · '+buffDurationLabel(p.buffs.desperationGuard));if(hasGearEffect(0,'soulHarvest'))tag('soulweapon','噬魂戰斧 · 普攻吸血 10% · 攻擊 +'+(p.soulAttack||0)+' · 本場 '+(st.soulsThisBattle||0)+'/10');parts.push('<small class="buff-tag">單斧 · 普攻流血 +1</small>');if(st.cycloneecho)tag('cycloneecho','旋風共振 · 25%');if(st.impale)tag('impale','穿刺殘響 · 儲傷 20%');if(st.executionAttack)tag('execution','處刑攻擊 +'+st.executionAttack);if(st.bloodking)parts.push('<small class="buff-tag">'+skillIconHTML('siphon')+'血怒君王 '+(st.bloodkingStacks||0)+'/20 · 攻擊 +'+(st.bloodkingStacks||0)*2+'%'+((st.bloodkingStacks||0)>=20?' · 普攻流血 +1 層':'')+'</small>');if(st.soulLeechStacks&&st.soulLeechUntil>s.auto.clock)tag('soulweapon','普攻吸血 +'+st.soulLeechStacks*10+'% · '+(st.soulLeechUntil===PERMANENT_BUFF_TIME?'本關永久':Math.ceil((st.soulLeechUntil-s.auto.clock)/1000)+' 秒'));if(st.shieldGrowth)parts.push('<small class="buff-tag">'+skillIconHTML('shieldbash')+'下次護盾打擊：護盾 +'+st.shieldGrowth+'</small>');if(p.pactStacks)parts.push('<small class="buff-tag">'+skillIconHTML('pact')+'本場契約 · 攻擊 +'+Math.min(3,p.pactStacks)*50+'% · 本場結束清除</small>');return parts.join('');}

// Retired form accessors remain inert for old integrations and archived artwork.
function kohakuDualActive(){return false}
function kohakuDualFrames(state){return null}

// Approach / strike / return is presentation only; the target and damage stay fixed.
function kohakuMeleeActive(m=sceneMotion){return !reduceMotion()&&m?.kind==='attack'&&!m.support&&!m.secondary&&!m.warriorSkill?.stationary&&!(typeof warriorAwakenPose==='function'&&warriorAwakenPose()&&!m.warriorSkill)&&m.owners?.includes(0)}
function kohakuMeleeSpriteHTML(){
 if(typeof warriorExecutionActive==='function'&&warriorExecutionActive())return warriorExecutionSpriteHTML();
 const frames=HERO_FRAME_LAYOUT[0].walk,v=SPRITE_CONTRACT.heroCanvas;
 const run=`<span class="hero-poses poses-walk" ${spritePoseAttributes(frames)} data-combat-view="${v.join(' ')}" style="--walk-delay:0s;--walk-phase:0s;--pose-left:${v[0]/418};--pose-width:${v[2]/418};--pose-height:${v[3]/418};--pose-bottom:${(440-v[1]-v[3])/418}">${frames.map((f,i)=>heroCelHTML(f,'kohaku-run','walk',i)).join('')}</span>`;
 return `<span class="kohaku-run-phase">${run}</span><span class="kohaku-strike-phase">${heroSpriteHTML(0,'attack',false,true)}</span><span class="kohaku-rest-phase">${heroSpriteHTML(0,'idle',false,true)}</span>`;
}
function kohakuApproachOffset(heroFoot,enemyBounds,scale=1){
 if(!Number.isFinite(scale)||scale<=0)scale=1;
 const gap=Math.max(22,Math.min(64,enemyBounds.height*.18))/scale;
 return {x:Math.max(0,(enemyBounds.left-heroFoot.x)/scale-gap),y:(enemyBounds.bottom-heroFoot.y)/scale};
}
function syncKohakuMeleeLayout(){
 if(!kohakuMeleeActive()||typeof document.querySelector!=='function')return;
 const actor=document.querySelector('.kohaku-sprite[data-melee-advance="true"]'),stage=actor?.querySelector?.('.sprite-stage');
 const target=document.querySelector(`[data-enemy-id="${sceneMotion.enemyId}"]`),enemy=target&&combatVisualBounds(target,false);
 const rect=actor?.getBoundingClientRect?.();if(!rect||!stage||!enemy||!actor.offsetWidth)return;
 const scale=rect.width/actor.offsetWidth||1,foot={x:rect.left+(stage.offsetLeft+stage.offsetWidth/2)*scale,y:rect.top+(stage.offsetTop+stage.offsetHeight-4)*scale};
 const delta=kohakuApproachOffset(foot,enemy,scale);
 stage.style.setProperty('--melee-x',delta.x+'px');stage.style.setProperty('--melee-y',delta.y+'px');
 syncKohakuScrapeLayout(actor,stage,foot,delta,scale);
}

function kohakuDragActive(){return kohakuMeleeActive()&&kohakuDualActive()}
function kohakuScrapeHTML(){
 if(!kohakuDragActive())return '';
 const age=Math.max(0,Date.now()-(sceneMotion?.started??Date.now()));
 return `<div class="kohaku-ground-scrape" data-scrape-target="${sceneMotion.enemyId}" style="--scrape-age:-${age}ms" aria-hidden="true">${[0,1].map(i=>`<span class="axe-ground-track track-${i}"><i class="axe-ground-groove">${rasterFXHTML('axetrack',{loop:false,duration:1050,age})}</i><span class="axe-scrape-contact"><i class="axe-scrape-dust">${rasterFXHTML('scrapedust',{duration:400,age:age%400})}</i>${Array.from({length:5},(_,j)=>`<i class="axe-scrape-spark" style="--spark-index:${j}">${rasterFXHTML('ember',{duration:280,age:(age+j*35)%280})}</i>`).join('')}</span></span>`).join('')}</div>`;
}
function syncKohakuScrapeLayout(actor,stage,foot,delta,scale){
 if(!kohakuDragActive())return;
 const field=document.querySelector('.battlefield'),layer=field?.querySelector?.('.kohaku-ground-scrape');if(!layer||!field.offsetWidth)return;
 const rect=field.getBoundingClientRect(),fieldScale=rect.width/field.offsetWidth||1,pose=stage.querySelector?.('.hero-poses'),poseSize=typeof getComputedStyle==='function'?parseFloat(getComputedStyle(pose||stage).getPropertyValue('--pose-size'))||stage.offsetHeight:stage.offsetHeight,anchor=KOHAKU_DUAL_RUN_FRAMES.reduce((n,f)=>n+f.dragAnchor[0],0)/KOHAKU_DUAL_RUN_FRAMES.length,trailBack=(208-anchor)*poseSize/418;
 const x=(foot.x-rect.left)/fieldScale-trailBack,y=(foot.y-rect.top)/fieldScale;
 const dx=delta.x*scale/fieldScale,dy=delta.y*scale/fieldScale,length=Math.hypot(dx,dy);
 layer.style.setProperty('--scrape-x',x+'px');layer.style.setProperty('--scrape-y',y+'px');layer.style.setProperty('--scrape-length',length+'px');layer.style.setProperty('--scrape-angle',Math.atan2(dy,dx)*180/Math.PI+'deg');
}

// A virtual HP is used only by low-life bonuses; actual HP still owns survival/healing.
function warriorEffectiveHP(p){return p?.hp>0&&p.id===0&&s?.auto?.skills?.[0]?.undying?1:p?.hp||0}
function warriorBasicLeech(id,options){return id===0&&options.basic&&!options.skipLeech&&hasGearEffect(0,'soulHarvest')?.1:0}
function warriorBleedGrowth(){const p=s.party[slotOf(0)],st=abilityState(0);if(p?.hp>0&&st.bloodking){const before=st.bloodkingStacks||0;st.bloodkingStacks=Math.min(20,before+1);if(before<20&&st.bloodkingStacks===20&&typeof emitWarriorVFX==='function')emitWarriorVFX('siphon','hero',null,{place:'lord',duration:1000})}}
function queueBloodlordSlash(id,n){if(id!==0||n<=0||!buffActive(s.party[slotOf(0)],'bloodlord'))return;s.auto.bloodlordSlashes??=[];s.auto.bloodlordSlashes.push({enemyId:s.enemy.id,amount:n})}
function flushBloodlordSlashes(){
 const queued=s.auto.bloodlordSlashes||[];if(!queued.length)return;s.auto.bloodlordSlashes=[];
 for(const hit of queued){const e=enemyRoster().find(e=>e.id===hit.enemyId);if(!e||e.hp<=0)continue;withEnemy(e,()=>damageEnemy([['slash',hit.amount]],0,{preparedHits:[['slash',hit.amount]],skipResource:true,skipLeech:true,noCrit:true,noOnHit:true,ignoreStrength:true,bloodlordEcho:true,label:'血之領主 · 吸血斬擊'}));}
}

// Upgrade active saves once; future reloads keep the same paused logical expiry.
function migrateWarriorDurations(t){
 if(t.warriorDurationRevision===1)return;
 const p=t.party?.find(p=>p.id===0),st=t.auto?.skills?.[0];
 if(p&&t.phase!=='battle')delete p.pactStacks;
 if(st?.soulLeechStacks&&st.soulLeechUntil==null){
  if(t.phase==='battle')st.soulLeechUntil=(t.auto.clock||0)+8000;
  else delete st.soulLeechStacks;
 }
 t.warriorDurationRevision=1;
}

// Eight additive cards. All persistent fields use the serialized battle clock.
// Placeholder icons are existing assets; no artwork, VFX or layout is introduced.
const WARRIOR_EXPANSION={
 warrior_slam:{name:'震地猛擊',rarity:'common',cost:1,ratio:.9,area:true,attr:'blunt',placeholder:'heavy',lines:['全體物傷 90% · 打斷可中斷施法','攻速 −20%／4 秒'],desc:'對全體造成 90% 物理傷害，打斷可中斷施法，攻速降低 20%／4 秒。'},
 warrior_slaughter:{name:'血腥屠戮',rarity:'uncommon',cost:2,ratio:1.5,area:true,placeholder:'whirlwind',lines:['全體物傷 150%','起手每名流血敵人追加 50% · 最多 3 次'],desc:'全體 150% 物理傷害；施放開始時每名流血敵人追加一次 50% 全體斬擊，最多 3 次。'},
 warrior_soulguard:{name:'不屈戰魂',rarity:'uncommon',cost:1,placeholder:'undying',lines:['8 秒內致命傷保留 1 HP · 每場限一次','回復最大生命 20% · 怒氣 +30'],desc:'8 秒內受到致命傷害時保留 1 HP，回復最大生命 20% 並獲得 30 怒氣；每場最多觸發一次，重施只刷新時間。'},
 warrior_afterimage:{name:'殘影連斬',rarity:'uncommon',cost:2,ratio:.65,placeholder:'heavy',lines:['單體物傷 65% ×4','每次原斬暴擊追加 35% · 最多 4 次'],desc:'單體斬擊 4 次，每次 65% 物理傷害；每次原始斬擊暴擊追加一次 35% 物理傷害，最多 4 次，追加不能再次追加；本次施放各段保留小數餘額結算，不逐段遺失傷害。'},
 warrior_brand:{name:'鮮血烙印',rarity:'rare',cost:2,placeholder:'siphon',lines:['標記 12 秒 · 流血傷害 +40%','死亡傳染 50% 流血 · 傳染層不再傳染'],desc:'標記單體 12 秒，流血傷害 +40%；重施只刷新。目標死亡時將 50% 有效流血層數（向下取整）傳染給其他存活敵人；傳染層不再傳染，不超過原流血上限。'},
 warrior_instinct:{name:'狂戰本能',rarity:'epic',cost:2,placeholder:'berserk',lines:['10 秒 · 普攻命中疊後續普攻傷害 +12%','最多 8 層 · 普攻暴擊刷新時間'],desc:'持續 10 秒，每次普攻命中使後續普攻傷害 +12%，最多 8 層；普攻暴擊刷新為 10 秒。重施只刷新時間，不重置有效層數。'},
 warrior_earthshatter:{name:'天崩地裂',rarity:'legendary',cost:3,ratio:3.5,area:true,attr:'blunt',castTime:1500,placeholder:'heavy',lines:['蓄力 1.5 秒 · 全體物傷 350%～700%','成功出手消耗全部怒氣 · 每 10 怒氣 +35%'],desc:'蓄力 1.5 秒，全體 350% 物理傷害；成功出手消耗全部怒氣，每滿 10 怒氣增加 35% 傷害倍率，最高 700%；被中斷不扣怒氣。'},
 warrior_eternal:{name:'永恆狂怒',rarity:'legendary',cost:3,placeholder:'bloodlord',lines:['12 秒怒氣不衰減 · 普攻命中額外 +5 怒氣','滿怒消耗 50 → 全體 200% · 每秒限一次'],desc:'12 秒內怒氣不自然衰減，普攻命中額外 +5 怒氣；達 100 消耗 50，自動全體 200% 物理傷害，每秒最多一次。自動斬擊不產生怒氣、不觸發自身；期間滿怒優先觸發本卡。'}
};
function registerWarriorExpansion(){
 for(const [key,def] of Object.entries(WARRIOR_EXPANSION)){
  if(C[key]||CLASS_SKILLS.flat().includes(key))throw Error('Duplicate warrior card ID: '+key);
  const {placeholder,lines,...data}=def;
  C[key]={...data,rarityName:({common:'普通',uncommon:'優良',rare:'精良',epic:'史詩',legendary:'傳奇'})[def.rarity],owner:0,icon:'⚒',type:def.ratio?'attack':'skill',warriorExpansion:true,...(def.ratio?{hits:[[def.attr||'slash',AUTO_BASIC[0].damage*def.ratio]]}:{})};
  CLASS_SKILLS[0].push(key);
 }
}
function warriorExpansionPower(){
 const hits=gearAttackHits(skillAttackHits([['slash',AUTO_BASIC[0].damage]],0,{basic:true,noOnHit:true}),0,null);
 return Math.max(0,(hits.find(h=>h[0]==='slash')?.[1]||0)+(s.strength||0));
}
function warriorInstinctActive(){return s.phase==='battle'&&s.party[slotOf(0)]?.hp>0&&abilityState(0).instinctUntil>s.auto.clock}
function warriorEternalActive(){return s.phase==='battle'&&s.party[slotOf(0)]?.hp>0&&abilityState(0).eternalUntil>s.auto.clock}
function warriorExpansionHit(c,e,amount,extra={}){
 if(s.phase!=='battle'||s.party[slotOf(0)]?.hp<=0||e.hp<=0)return null;
 return withEnemy(e,()=>damageEnemy([[c.attr||'slash',amount]],0,{preparedHits:[[c.attr||'slash',amount]],ignoreStrength:true,skipResource:true,noOnHit:true,card:c,label:c.name,...extra}));
}
function warriorMergeExpansionHit(result,e,hit){
 if(!hit)return;result.damage+=hit.damage;result.shieldHits+=hit.shieldHits;result.newBreak ||=hit.newBreak;
 const old=result.targetHits.find(t=>t.id===e.id);
 if(old){old.damage+=hit.damage;old.actual+=hit.actual;old.criticalHits+=hit.criticalHits;old.newBreak ||=hit.newBreak;old.shieldHits+=hit.shieldHits}
 else result.targetHits.push({id:e.id,damage:hit.damage,actual:hit.actual,criticalHits:hit.criticalHits,newBreak:hit.newBreak,shieldHits:hit.shieldHits});
}
function resolveWarriorExpansion(c,origin=null){
 const p=s.party[slotOf(0)];if(s.phase!=='battle'||!p||p.hp<=0)return;
 const state=abilityState(0),now=s.auto.clock,key=c.key,enemy=s.enemy,enemyId=enemy.id;
 const result={damage:0,shieldHits:0,newBreak:false,targetHits:[]};
 // Snapshot bleeding before ANY hit, retaliation or death can change the roster.
 const repeats=key==='warrior_slaughter'?Math.min(3,livingEnemies().filter(e=>e.status.bleedUntil>now&&e.status.bleedStacks>0).length):0;
 if(key==='warrior_soulguard'){if(!state.soulguardUsed)state.soulguardUntil=Math.max(state.soulguardUntil||0,now+8000);}
 else if(key==='warrior_brand')enemy.status.warriorBrandUntil=now+12000;
 else if(key==='warrior_instinct'){if(!warriorInstinctActive())state.instinctStacks=0;state.instinctUntil=Math.max(state.instinctUntil||0,now+10000);}
 else if(key==='warrior_eternal'){state.eternalUntil=Math.max(state.eternalUntil||0,now+12000);warriorTryEternalSlash(result);}
 else{
  const power=warriorExpansionPower();let ratio=c.ratio;
  if(key==='warrior_earthshatter'){
   const resource=classResource(0),rage=Math.max(0,Math.min(100,resource.rage||0));
   ratio=Math.min(7,3.5+Math.floor(rage/10)*.35);resource.rage=0;
  }
  const targets=c.area?[...livingEnemies()]:[enemy];
  if(key==='warrior_afterimage'){
   const damageRemainder={value:0};
   for(let i=0;i<4;i++){
    const hit=warriorExpansionHit(c,enemy,power*.65,{damageRemainder});warriorMergeExpansionHit(result,enemy,hit);
    if(hit?.criticalHits&&enemy.hp>0)warriorMergeExpansionHit(result,enemy,warriorExpansionHit(c,enemy,power*.35,{warriorFollowup:true,damageRemainder}));
   }
  }else for(let i=0;i<=repeats;i++)for(const target of targets){
   warriorMergeExpansionHit(result,target,warriorExpansionHit(c,target,power*(i? .5:ratio),{warriorFollowup:i>0}));
   if(key==='warrior_slam'&&target.hp>0)withEnemy(target,()=>{
    const before=enemyInterval();target.status.warriorSlamUntil=now+4000;
    setEnemyAttackDue(now+Math.max(0,enemyAttackDue()-now)*enemyInterval()/before);
    warriorInterruptCast(target);
   });
  }
  if(key!=='warrior_earthshatter'&&result.targetHits.length)gainRage(10);
 }
 applyCardExtras(c,true);const unlocked=updateBond(c);
 log('琥珀使出「'+c.name+'」'+(result.damage?'，'+result.damage+' 傷害':'')+'。');
 victory();animateCard(c,result.damage,result.newBreak,unlocked,enemyId,origin,result.targetHits);
 return result;
}
function warriorInterruptCast(enemy){
 const pending=enemy.rosterPending||enemy.areaBossState?.pending||enemy.regionTelegraph||{};
 if(enemy.interruptible===false||enemy.uninterruptible||pending.interruptible===false||pending.uninterruptible)return false;
 return interruptBoss(enemy);
}
function warriorExpansionAfterHit(owner,options,actual,critical){
 if(owner!==0||!options.basic||options.noOnHit||actual<=0)return;
 const state=abilityState(0);
 if(warriorInstinctActive()){state.instinctStacks=Math.min(8,(state.instinctStacks||0)+1);if(critical.count)state.instinctUntil=Math.max(state.instinctUntil||0,s.auto.clock+10000);}
 if(warriorEternalActive())gainRage(5);
}
function warriorTryEternalSlash(result=null){
 if(!warriorEternalActive())return false;
 const state=abilityState(0),rage=classResource(0),now=s.auto.clock;
 if(state.eternalResolving||rage.rage<100||now<(state.eternalNextAt||0))return false;
 rage.rage-=50;state.eternalNextAt=now+1000;state.eternalResolving=true;
 try{
  const c={...C.warrior_eternal,key:'warrior_eternal',attr:'slash'},power=warriorExpansionPower();
  for(const e of [...livingEnemies()]){const hit=warriorExpansionHit(c,e,power*2,{warriorEternalSlash:true,warriorFollowup:true});if(result)warriorMergeExpansionHit(result,e,hit);}
  log('永恆狂怒：消耗 50 怒氣，觸發 200% 全體斬擊。');
 }finally{delete state.eternalResolving;}
 return true;
}
function warriorProtectLethal(p,damage){
 if(p.id!==0||p.hp<=0||damage<p.hp||s.phase!=='battle')return null;
 const state=abilityState(0);if(state.soulguardUsed||!(state.soulguardUntil>s.auto.clock))return null;
 state.soulguardUsed=true;delete state.soulguardUntil;
 return {damage:Math.max(0,p.hp-1),heal:Math.ceil(p.max*.2),warrior:true};
}
function warriorResolveRescue(p,rescue){healTarget(rescue.heal,slotOf(0),0);gainRage(30);log('不屈戰魂：保留 1 HP、回復最大生命 20%，怒氣 +30；本場免死已用盡。');}
function warriorBrandMultiplier(enemy,at=s.auto.clock){return enemy.status.warriorBrandUntil>at?1.4:1}
function warriorBrandDeath(enemy){
 const st=enemy.status,now=s.auto.clock;
 const transferable=st.warriorBrandUntil>now&&st.bleedUntil>now?Math.floor(Math.max(0,(st.bleedStacks||0)-(st.warriorSpreadBleed||0))*.5):0;
 delete st.warriorBrandUntil;delete st.warriorSlamUntil;delete st.warriorSpreadBleed;
 if(!transferable)return;
 for(const e of livingEnemies()){
  const before=e.status.bleedUntil>now?e.status.bleedStacks||0:0;
  addBleedStacks(e,transferable,st.bleedOwner??0);
  e.status.warriorSpreadBleed=(e.status.warriorSpreadBleed||0)+(e.status.bleedStacks-before);
 }
}
function clearWarriorExpansion(clearEnemies=true){
 const state=s.auto?.skills?.[0];if(state)for(const key of ['soulguardUntil','instinctUntil','instinctStacks','eternalUntil','eternalNextAt','eternalResolving'])delete state[key];
 if(clearEnemies)for(const e of enemyRoster())for(const key of ['warriorBrandUntil','warriorSlamUntil','warriorSpreadBleed'])delete e.status?.[key];
}
function tickWarriorExpansion(){
 const state=abilityState(0),now=s.auto.clock,p=s.party[slotOf(0)];
 if(s.phase!=='battle'){clearWarriorExpansion();return}
 if(!p||p.hp<=0)clearWarriorExpansion(false);
 if(state.soulguardUntil<=now)delete state.soulguardUntil;
 if(state.instinctUntil<=now){delete state.instinctUntil;delete state.instinctStacks;}
 if(state.eternalUntil<=now){delete state.eternalUntil;delete state.eternalNextAt;}
 for(const e of livingEnemies()){
  if(e.status.warriorBrandUntil<=now)delete e.status.warriorBrandUntil;
  if(e.status.warriorSlamUntil<=now)withEnemy(e,()=>{
   e.status.warriorSlamUntil=now+1;const before=enemyInterval();delete e.status.warriorSlamUntil;
   setEnemyAttackDue(now+Math.max(0,enemyAttackDue()-now)*enemyInterval()/before);
  });
 }
 if(warriorTryEternalSlash())victory();
}

// Old saves have no expansion state. Reloads preserve logical deadlines and the
// spent per-battle rescue; map/dead saves discard only transient expansion data.
function migrateWarriorExpansion(t){
 const state=t.auto?.skills?.[0];if(!state)return;
 if(state.instinctStacks!=null)state.instinctStacks=Math.max(0,Math.min(8,Math.floor(state.instinctStacks||0)));
 delete state.eternalResolving;
 if(t.phase!=='battle'||!(t.party?.find(p=>p.id===0)?.hp>0))
  for(const key of ['soulguardUntil','instinctUntil','instinctStacks','eternalUntil','eternalNextAt'])delete state[key];
 if(t.phase!=='battle')for(const e of t.enemies||[t.enemy].filter(Boolean))
  for(const key of ['warriorBrandUntil','warriorSlamUntil','warriorSpreadBleed'])delete e.status?.[key];
}
