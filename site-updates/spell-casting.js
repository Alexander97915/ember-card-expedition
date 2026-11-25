'use strict';
// Casting uses the saved logical battle clock; card payment happens at acceptance.
const SPELL_CAST_SECONDS={spark:1,ice:1,thunder:2,light:1,drain:1,inferno:3,grand:4,meteor:4,blizzard:4,storm:4,fireball:1,frostbolt:1,chain:2,detonate:3,nova:2,meteorfall:5,cataclysm:5,quakewave:2,thundercloud:3};
function registerSpellCasting(){for(const [key,c] of Object.entries(C)){
 if(c.owner!==2||!c.hits?.length||c.instant||c.coldrelease||c.customSpellDesc)continue;
 c.castTime=(SPELL_CAST_SECONDS[key]||2)*1000;c.preCastDesc=c.desc;c.preCastHits=c.hits.map(h=>[...h]);c.hits=c.hits.map(([a,n])=>[a,c.exactSpellDamage?n:Math.ceil(n*1.3)]);
 const shape=c.area?'全體範圍':c.chain?'連鎖最多 '+(c.chainLimit||3)+' 名敵人，彈射傷害為首段的 '+Math.round((c.bounceRatio||.5)*100)+'%':'單體';
 const effects=[];if(c.burnStack)effects.push('附加 '+c.burnStack+' 層燃燒，持續 4 秒');if(c.burn)effects.push('燃燒 4 秒，每秒 '+c.burn);if(c.slow)effects.push('敵攻速 −'+Math.round(c.slow*100)+'%，持續 '+(c.slowDuration||6000)/1000+' 秒');if(c.freeze)effects.push('凍結 '+c.freeze/1000+' 秒');if(c.stun)effects.push('暈眩 '+c.stun/1000+' 秒');if(c.detonate)effects.push('引爆目標全部燃燒，造成剩餘燃燒傷害的 260%（含詠唱加成）');if(c.heal)effects.push('療癒對象恢復 '+c.heal+' 生命');if(c.healSelf)effects.push('自身恢復 '+c.healSelf+' 生命');if(c.block)effects.push('自身護甲 +'+c.block);if(c.partyBlock)effects.push('全隊護甲 +'+c.partyBlock);if(c.grandMagic)effects.push('三符文時直接傷害翻倍，消耗符文');
 let damage=c.hits.map(([a,n])=>ATTR[a].name+' '+n).join(' ＋ ');
 if(c.thunderMark)effects.push('標記目標 6 秒，雷傷害轉移 30% 至額外目標，不遞迴');
 if(c.quake)effects.push('可消耗 3 層岩層，額外全體暈眩 0.8 秒');
 if(c.job==='cataclysm'){damage='依序火、冰、雷各 3 秒，每秒 '+c.hits[0][1];effects.push('火附 2 層燃燒、冰凍結 0.8 秒並減速 35%、雷暈眩 1 秒')}
 c.desc='詠唱 '+c.castTime/1000+' 秒；'+shape+'：'+damage+' 傷害'+(c.exactSpellDamage?'':'（直接傷害 +30% 已計入）')+(effects.length?'；'+effects.join('；'):'')+'；暈眩／凍結會中斷詠唱';
 }
}
function heroControlled(p){const st=p?.monsterStatus||{},now=s.auto?.clock||0;return st.freezeUntil>now||st.stunUntil>now}
// Each owner has a separate saved cast. The scalar remains a legacy display alias.
function spellCasts(){if(!s.auto)return {};if(!s.auto.castings){s.auto.castings={};if(s.auto.casting)s.auto.castings[s.auto.casting.owner]=s.auto.casting;}return s.auto.castings}
function heroCasting(id){return spellCasts()[id]||null}
function syncCastingAlias(){const cast=Object.values(spellCasts())[0];if(cast)s.auto.casting=cast;else delete s.auto.casting}
function heroCastVisual(id){return s.auto?.castVisuals?.[id]||(s.auto?.castVisual?.owner===id?s.auto.castVisual:null)}
function setCastVisual(cast,kind){const visual={owner:cast.owner,school:chantSchool(cast),kind,started:s.auto.clock,until:s.auto.clock+550};(s.auto.castVisuals??={})[cast.owner]=visual;s.auto.castVisual=visual}
function spellInputBlocked(c){return (c.owners||[c.owner]).some(id=>heroControlled(s.party[slotOf(id)])||!!(c.castTime&&heroCasting(id)))}
function startSpellCasting(c,origin){if(heroCasting(c.owner))return false;if(c.summonTitan)preloadTitanFrames();if(c.rarity==='legendary'&&!c.freeEcho&&!c.frostProc)preloadMageForm(MAGE_LEGENDARY_FORMS[c.key]);const p=s.party[slotOf(c.owner)],state=abilityState(c.owner),accelerated=(state.castHasteCharges||0)>0,duration=Math.max(100,c.warriorExpansion?c.castTime:c.castTime*(buffActive(p,'chant')?.7:1)*(accelerated?.5:1));if(accelerated){state.castHasteCharges--;c.acceleratedCast=true;}delete state.nextCastReduction;spellCasts()[c.owner]={key:c.key,owner:c.owner,enemyId:s.enemy.id,started:s.auto.clock,due:s.auto.clock+duration,duration,spell:c};if(c.owner===2&&typeof mageUpdateCast==='function'){const cast=spellCasts()[c.owner];cast.mageLastSpeed=mageCastSpeed(2);mageUpdateCast(cast)}syncCastingAlias();
 log(HEROES[p.id].name+'開始詠唱「'+c.name+'」：'+(spellCasts()[c.owner].duration/1000).toFixed(1)+' 秒。');
 animateCard({...c,hits:undefined,casting:true},0,false,false,s.enemy.id,origin);
}
function interruptSpellCasting(reason='控制技能',owner=s.auto?.casting?.owner){const cast=heroCasting(owner);if(!cast)return false;setCastVisual(cast,'interrupted');delete spellCasts()[owner];syncCastingAlias();log(HEROES[cast.owner].name+'的「'+C[cast.key].name+'」詠唱被'+reason+'打斷！');s.auto.castNotice={text:'詠唱中斷 · '+C[cast.key].name,until:s.auto.clock+2500};return true}
function tickSpellCasting(){let changed=false;for(const cast of Object.values(spellCasts())){const p=s.party[slotOf(cast.owner)];
 if(s.phase!=='battle'){s.auto.castings={};syncCastingAlias();return true}
 if(!p||p.hp<=0||heroControlled(p)){interruptSpellCasting(p?.hp<=0?'倒下':p?.monsterStatus?.freezeUntil>s.auto.clock?'凍結':'暈眩',cast.owner);changed=true;continue}
 if(typeof mageUpdateCast==='function')mageUpdateCast(cast);if(cast.due>s.auto.clock)continue;
 setCastVisual(cast,'released');delete spellCasts()[cast.owner];syncCastingAlias();changed=true;const target=livingEnemies().find(e=>e.id===cast.enemyId)||livingEnemies()[0];if(!target)continue;
 withEnemy(target,()=>resolveClassSkill({...(cast.spell||C[cast.key]),key:cast.key},null,true));
 }return changed;
}
function castingHUDHTML(){return Object.values(spellCasts()).map(cast=>castingHUDFor(cast)).join('')}
function castingHUDFor(cast){const remaining=Math.max(0,cast.due-s.auto.clock),progress=Math.min(100,Math.max(0,100*(s.auto.clock-cast.started)/cast.duration));
 return `<div class="spell-cast-hud" role="status" aria-label="${HEROES[cast.owner].name}正在${cast.key==='rain'?'蓄力':'詠唱'}${C[cast.key].name}，剩餘 ${(remaining/1000).toFixed(1)} 秒"><b>${skillIconHTML(cast.key)} ${cast.key==='rain'?'蓄力':'詠唱'} · ${C[cast.key].name}</b><span class="spell-cast-progress" role="progressbar" aria-label="詠唱進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}"><i style="width:${progress}%"></i></span><small>${(remaining/1000).toFixed(1)} 秒 · 控制可打斷</small></div>`;
}
function chantSchool(cast){const c=cast.spell||C[cast.key]||{};return c.school||(c.summonTitan||c.earthLayers||c.stoneSkin?'earth':c.hits?.[0]?.[0])||'arcane'}
function castingAuraHTML(p){
 const cast=heroCasting(p.id),tail=heroCastVisual(p.id),now=s.auto?.clock||0,active=!!cast;
 if(p.hp<=0||s.phase!=='battle'||!active&&!(tail?.owner===p.id&&tail.until>now))return '';
 const school=active?chantSchool(cast):tail.school,colors={fire:'#ff8561',ice:'#8bdeff',thunder:'#d2acff',earth:'#d5bd7a',arcane:'#b8b2ff',light:'#ffe8ab'},color=colors[school]||colors.arcane;
 const elapsed=Math.max(0,now-(active?cast.started:tail.started)),progress=active?Math.min(1,elapsed/cast.duration):1,kind=active?'charging':tail.kind;
 return `<span class="chant-aura chant-${kind}" style="--chant-color:${color};--chant-power:${(.3+progress*.7).toFixed(3)};--chant-charge:${(.75+progress*.25).toFixed(3)};--chant-elapsed:-${elapsed/1000}s;--chant-phase:-${elapsed/1000%2.4}s;--chant-play:${s.auto.paused?'paused':'running'}" aria-hidden="true"><span class="chant-floor">${rasterFXHTML('chant',{duration:2400,age:elapsed%2400})}</span><span class="chant-halo">${rasterFXHTML('chant',{duration:2400,age:elapsed%2400})}</span></span>`;
}


function prepareAcceleratedSpell(c){
 if(!mageSpell(c)||c.freeEcho)return;
 const state=abilityState(c.owner);
 if(state.nextSpellBoost&&((c.hits||[]).some(([,n])=>n>0)||c.blackflame)){
  c.spellAmp=(c.spellAmp||1)*(1+state.nextSpellBoost*.2);
  c.castBoostSpent=state.nextSpellBoost;state.nextSpellBoost=0;
 }
}
function completeAcceleratedSpell(c,completed){
 if(!completed||!c.acceleratedCast||c.freeEcho||c.frostProc||s.phase!=='battle')return;
 const state=abilityState(c.owner);state.nextSpellBoost=Math.min(3,(state.nextSpellBoost||0)+1);
}
function migrateMageSupport(t){
 if(t.mageSupportRevision===1)return;
 const state=t.auto?.skills?.[2];if(state?.nextCastReduction){state.castHasteCharges=3;delete state.nextCastReduction;}
 for(const p of t.party||[])if(p.buffs)delete p.buffs.melt;
 if(t.cardShop?.keys)t.cardShop.keys=t.cardShop.keys.filter(k=>k!=='melt'&&k!=='cataclysm');
 t.mageSupportRevision=1;
}
