'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const harness="const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');\nconst code=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src=\"([^\"]+)\"/g)].map(m=>fs.readFileSync('dist/'+m[1].split('?')[0],'utf8')).join('\\n');\nfunction world(stored={}){let now=0,id=0,timers=new Map(),elements={};const ctx={console,Math:Object.create(Math),Date:class extends Date{static now(){return now}},setTimeout(fn,ms){timers.set(++id,{fn,at:now+ms});return id},clearTimeout(i){timers.delete(i)},matchMedia(){return {matches:true}},localStorage:{getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}},document:{hidden:false,getElementById(k){return elements[k]??={style:{},innerHTML:'',textContent:'',hidden:false,open:false,dataset:{},showModal(){this.open=true}}},querySelector(selector){if(selector==='.selena-poses')return null;return {close(){if(elements.modal)elements.modal.open=false}}}}};ctx.Math.random=()=>.99;vm.createContext(ctx);vm.runInContext(code,ctx);return {ctx,stored,timers,run(c){return vm.runInContext(c,ctx)},tick(ms){let target=now+ms,guard=0;while(true){let entries=[...timers].filter(([,v])=>v.at<=target).sort((a,b)=>a[1].at-b[1].at);if(!entries.length)break;let [i,t]=entries[0];timers.delete(i);now=t.at;t.fn();if(++guard>100000)throw Error('timer loop')}now=target}}}\n\n" ,scope={require,console};
vm.runInNewContext(harness+'globalThis.makeWorld=world;',scope);
let w=scope.makeWorld(),r=c=>w.run(c);


const close=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const setup=()=>r(`newRun([2,4,5]);startBattle('戰鬥',false);clearFX();s.auto.paused=false;`);
setup();assert(r('!s.equipment.bag.some(g=>Object.hasOwn(SUPPORT_EQUIPMENT,g.key))'),'new runs do not get free conversion gear');
for(const [key,id]of [['stoneSkinRobe',2],['devoutCharm',4],['steelFocusCharm',5]]){assert(r(`GEAR['${key}'].owner===${id}`));assert(r(`eligibleGearPool().includes('${key}')`));assert(r(`gearCard({key:'${key}'}).includes(GEAR['${key}'].ability)`));assert(r(`sanitizeTrainingConfig({roster:[2,4,5],gear:{${id}:{${key==='stoneSkinRobe'?'armor':'charm'}:'${key}'}}}).gear[${id}].${key==='stoneSkinRobe'?'armor':'charm'}==='${key}'`));}
// Saves updated by the first retirement no longer contain original IDs: compensate
// each applicable existing expedition once, including after a battle reload.
r('delete s.supportEquipmentRevision;save()');w=scope.makeWorld({...w.stored});r=c=>w.run(c);
assert.equal(r('s.phase'),'battle');for(const key of Object.keys({stoneSkinRobe:1,devoutCharm:1,steelFocusCharm:1}))assert.equal(r(`s.equipment.bag.filter(g=>g.key==='${key}').length`),1);
r('initFixedDeck(s);initFixedDeck(s)');assert.equal(r('s.equipment.bag.filter(g=>Object.hasOwn(SUPPORT_EQUIPMENT,g.key)).length'),3);
assert(r('!hasGearEffect(2,"stoneMantle")&&!hasGearEffect(4,"devoutAura")&&!hasGearEffect(5,"steelFocus")'),'no autoequip');
const equip=(key,id,slot)=>r(`s.equipment.loadout[${id}].${slot}=s.equipment.bag.find(g=>g.key==='${key}').uid;syncGearHp()`);
equip('stoneSkinRobe',2,'armor');assert.equal(r('mageStoneMitigation(s.party[slotOf(2)])'),.5);assert(r('heroCanDodge(s.party[slotOf(2)])'));
r('earthState().stoneSkin=true');assert.equal(r('mageStoneMitigation(s.party[slotOf(2)])'),.5,'does not multiply legacy reduction');
assert.equal(r('hurtByMonsterCore(s.party[slotOf(2)],20).actual'),6,'20 damage halves to 10 then armor subtracts 4');
r('earthState().titan={hp:100,max:100,stoneSkin:true}');assert.equal(r('hurtTitan(20)'),10);assert.equal(r('livingTitan().hp'),90);
r("startSpellCasting({...C.quakewave,key:'quakewave'});tickSpellCasting()");assert(r('!!heroCasting(2)'));r("hurtByMonsterCore(s.party[slotOf(2)],2);tickSpellCasting()");assert(r('!!heroCasting(2)'),'ordinary damage does not interrupt');r('s.party[slotOf(2)].monsterStatus.stunUntil=s.auto.clock+1000;tickSpellCasting()');assert(r('!heroCasting(2)'),'hard control still interrupts');
r('s.party[slotOf(2)].monsterStatus={};s.equipment.loadout[2].armor=null');assert.equal(r('mageStoneMitigation(s.party[slotOf(2)])'),.6);assert(!r('heroCanDodge(s.party[slotOf(2)])'),'legacy stance keeps its original dodge restriction');
// Aura activates from equipment, includes the priest and drops immediately on death.
const base=r('s.party.map(p=>heroInterval(p.id))');equip('devoutCharm',4,'charm');for(let i=0;i<3;i++)close(r(`heroInterval(s.party[${i}].id)`),base[i]/1.2);
r("s.party[0].buffs.priestHaste=s.auto.clock+6000");close(r('heroInterval(s.party[0].id)'),base[0]/1.2);r('delete s.party[0].buffs.priestHaste;syncHeroAttackSpeeds();s.party[slotOf(4)].hp=0;syncHeroAttackSpeeds()');for(let i=0;i<3;i++)close(r(`heroInterval(s.party[${i}].id)`),base[i]);r('s.party[slotOf(4)].hp=10');for(let i=0;i<3;i++)close(r(`heroInterval(s.party[${i}].id)`),base[i]/1.2);
// Existing shield lifecycle tracks consumed temporary shield separately.
equip('steelFocusCharm',5,'charm');r('s.party[slotOf(5)].block=7;selResolve(C.sel_charge)');const shield=r('Math.ceil(s.party[slotOf(5)].max*.25)');assert.equal(r('selState().charge.shield'),shield);assert.equal(r('s.party[slotOf(5)].block'),7+shield);r('selCancelCharge(false)');assert.equal(r('s.party[slotOf(5)].block'),7);
r('selState().focus=true;selResolve(C.sel_quake)');assert.equal(r('selState().charge.shield'),shield,'legacy focus does not double shield');r('selCancelCharge(false);selResolve(C.sel_charge);globalThis.focusHit=hurtByMonster(s.party[slotOf(5)],3)');assert.equal(r('selState().charge.shield'),shield-r('focusHit.blocked'));r('selCancelCharge(false)');assert.equal(r('s.party[slotOf(5)].block'),7,'other shield remains intact');
r('s.equipment.loadout[5].charm=null;selResolve(C.sel_charge)');assert.equal(r('selState().charge.shield'),0);r('selCancelCharge(false)');
r('save()');w=scope.makeWorld({...w.stored});r=c=>w.run(c);assert.equal(r('s.equipment.bag.filter(g=>Object.hasOwn(SUPPORT_EQUIPMENT,g.key)).length'),3);assert(r('hasGearEffect(4,"devoutAura")'));
r("newRun([1,2,4]);startBattle('戰鬥',false);clearFX();abilityState(1).steady=true");const steadyInterval=r('heroInterval(1)'),steadyPower=r('rangerSpeedBonus()');r("const blessing=addGear('devoutCharm');s.equipment.loadout[4].charm=blessing.uid");close(r('heroInterval(1)'),steadyInterval);close(r('rangerSpeedBonus()'),steadyPower*1.2);
console.log('PASS three equipment registrations/pools/training, legacy compensation idempotence, no autoequip, actual mage/Titan damage, dodge, cast control, aura/nonstack/death/revival, focus shield cleanup and persistence');
