'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const harness="const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');\nconst code=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src=\"([^\"]+)\"/g)].map(m=>fs.readFileSync('dist/'+m[1].split('?')[0],'utf8')).join('\\n');\nfunction world(stored={}){let now=0,id=0,timers=new Map(),elements={};const ctx={console,Math:Object.create(Math),Date:class extends Date{static now(){return now}},setTimeout(fn,ms){timers.set(++id,{fn,at:now+ms});return id},clearTimeout(i){timers.delete(i)},matchMedia(){return {matches:true}},localStorage:{getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}},document:{hidden:false,getElementById(k){return elements[k]??={style:{},innerHTML:'',textContent:'',hidden:false,open:false,dataset:{},showModal(){this.open=true}}},querySelector(selector){if(selector==='.selena-poses')return null;return {close(){if(elements.modal)elements.modal.open=false}}}}};ctx.Math.random=()=>.99;vm.createContext(ctx);vm.runInContext(code,ctx);return {ctx,stored,timers,run(c){return vm.runInContext(c,ctx)},tick(ms){let target=now+ms,guard=0;while(true){let entries=[...timers].filter(([,v])=>v.at<=target).sort((a,b)=>a[1].at-b[1].at);if(!entries.length)break;let [i,t]=entries[0];timers.delete(i);now=t.at;t.fn();if(++guard>100000)throw Error('timer loop')}now=target}}}\n\n" ,scope={require,console};
vm.runInNewContext(harness+'globalThis.makeWorld=world;',scope);
let w=scope.makeWorld(),r=c=>w.run(c);


const boot=()=>{r("newRun([3,0,4]);startBattle('戰鬥',false);clearFX();s.auto.paused=false;$(\"modal\").open=false;s.enemy.hp=s.enemy.max=100000;s.party.forEach(p=>p.hp=p.max=1000);matchMedia=()=>({matches:false});");};
const play=key=>r(`resolveClassSkill({...C.${key},key:'${key}'});`);
boot();for(const key of ['knightmend','knightaegis','knightcovenant','knightresonance','knightredemption']){play(key);assert.equal(r('knightFiveMotion.key'),r(`KNIGHT_FIVE_KEYS.${key}`));assert.equal(r('knightFiveMotion.stage'),'cast');assert(r("heroSpriteHTML(3,'cast').includes('knight-five-poses')"));r('clearFX();knightFiveMotion=null');}
// The first pose is visible during the ordinary busy card presentation, and the
// clock continues independently of paused simulation, but respects user pause.
boot();play('knightresonance');assert(r('busy'));const logical=r('s.auto.clock');assert.equal(r('knightFiveFrame()'),0);w.tick(250);assert.equal(r('s.auto.clock'),logical);assert.equal(r('knightFiveFrame()'),1);r('toggleAuto()');const pose=r('knightFiveFrame()'),at=r('knightFiveClock()');w.tick(250);assert.equal(r('knightFiveFrame()'),pose);assert.equal(r('knightFiveClock()'),at);r('toggleAuto()');w.tick(500);assert(r('knightFiveFrame()>=2'));r('clearFX();knightFiveMotion=null');
// Chain: real transfer procs use counter frames; no extra damage is caused by art.
boot();play('knightmend');r('clearFX();knightFiveMotion=null');r('hurtByMonster(s.party.find(p=>p.id===0),40)');assert.equal(r('knightFiveMotion.stage'),'counter');assert.equal(r('knightFiveMotion.key'),'chain');
// Retribution: only an actual stack increase plays the block pose; release waits
// for the existing combat handler and uses its unchanged damage/stack formula.
boot();play('knightaegis');r('clearFX();knightFiveMotion=null;s.party[slotOf(3)].block=100;hurtByMonster(s.party[slotOf(3)],20)');assert.equal(r('knightFiveMotion.stage'),'block');assert.equal(r('abilityState(3).retribution.stacks'),1);r('knightReleaseRetribution()');assert.equal(r('knightFiveMotion.stage'),'release');assert(r('!abilityState(3).retribution'));
// Blood pact: spending life is still the cast; thrust occurs only after the
// pending rider hit is consumed by the original basic-hit handler.
boot();play('knightcovenant');assert.equal(r('s.party[slotOf(3)].hp'),800);r('clearFX();knightFiveMotion=null;knightVengeanceAfterBasic(s.party[slotOf(3)],{actual:1},[])');assert.equal(r('knightFiveMotion.stage'),'thrust');assert(r('!abilityState(3).bloodPact'));
// Redemption: small sigil on cast, shield/barrier artwork only on actual rescue.
boot();play('knightredemption');assert(r("!KNIGHT_FIVE_TIMING['seal:cast'].frames.includes(3)"));r('clearFX();knightFiveMotion=null;const friend=s.party[1];abilityState(3).redemption={[friend.id]:s.auto.clock+8000};const rescue=knightProtectLethal(friend,friend.hp+20);friend.hp=1;knightResolveRescue(friend,rescue)');assert.equal(r('knightFiveMotion.stage'),'rescue');assert.equal(r('s.party[1].hp'),13);assert(r('abilityTags(s.party[1]).includes("保命觸發")'));
// Mounted/angel presentation never replaces rider or wings with a foot model.
boot();r("knightSummonMount('horse');knightFiveStart('spear')");assert(r("!heroSpriteHTML(3,'attack').includes('knight-five-poses')"));assert(r("heroSpriteHTML(3,'attack').includes('knight-five-rider')"));r("s.party[slotOf(3)].mount=null;abilityState(3).knightPath='angel';knightFiveMotion=null;knightFiveStart('seal')");assert(r("!heroSpriteHTML(3,'cast').includes('knight-five-poses')"));
// Art is transient and deterministic; it does not mutate any serialized state.
boot();const before=r('JSON.stringify(s)');r("knightFiveStart('spear');heroSpriteHTML(3,'attack');actorState(s.party[slotOf(3)]);knightFiveFrame();updateKnightFiveArt()");assert.equal(r('JSON.stringify(s)'),before);r('s.party[slotOf(3)].hp=0');assert.equal(r('knightFiveSync()'),null);boot();assert.equal(r('knightFiveSync()'),null);
assert(r('Object.values(KNIGHT_FIVE_FRAMES).every(fs=>fs.length===4&&fs.every(f=>f.footAnchor[0]===209&&f.footAnchor[1]===430&&f.headSizeRevision===1))'));

// Compare serialized combat results with the adapter excluded from the same
// executable delivery. Presentation must never alter damage, resources or flags.
const legacyScope={require,console};vm.runInNewContext(harness.replace('.map(m=>fs.readFileSync',".filter(m=>!m[1].startsWith('knight-five-actions.js')).map(m=>fs.readFileSync")+'globalThis.makeWorld=world;',legacyScope);
const flow=`newRun([3,0,4]);startBattle('戰鬥',false);clearFX();s.enemy.hp=s.enemy.max=100000;s.party.forEach(p=>p.hp=p.max=1000);s.selected=1;
for(const key of ['knightmend','knightaegis','knightcovenant','knightresonance','knightredemption']){resolveClassSkill({...C[key],key});clearFX()}
s.party[slotOf(3)].block=100;hurtByMonster(s.party[slotOf(3)],20);hurtByMonster(s.party.find(p=>p.id===0),40);knightReleaseRetribution();knightVengeanceAfterBasic(s.party[slotOf(3)],{actual:1},[]);JSON.stringify({s,messages});`;
const a=scope.makeWorld(),b=legacyScope.makeWorld();assert.equal(a.run(flow),b.run(flow),'combat outcome with and without presentation adapter is identical');
console.log('PASS knight five cast/proc hooks, logical rules unchanged, busy presentation, pause, chain transfer, retribution block/release, pact followup, redemption-only barrier, mounted/angel fallback, death/reset and no save mutations');
