'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const harness="const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');\nconst code=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src=\"([^\"]+)\"/g)].map(m=>fs.readFileSync('dist/'+m[1].split('?')[0],'utf8')).join('\\n');\nfunction world(stored={}){let now=0,id=0,timers=new Map(),elements={};const ctx={console,Math:Object.create(Math),Date:class extends Date{static now(){return now}},setTimeout(fn,ms){timers.set(++id,{fn,at:now+ms});return id},clearTimeout(i){timers.delete(i)},matchMedia(){return {matches:true}},localStorage:{getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}},document:{hidden:false,getElementById(k){return elements[k]??={style:{},innerHTML:'',textContent:'',hidden:false,open:false,dataset:{},showModal(){this.open=true}}},querySelector(selector){if(selector==='.selena-poses')return null;return {close(){if(elements.modal)elements.modal.open=false}}}}};ctx.Math.random=()=>.99;vm.createContext(ctx);vm.runInContext(code,ctx);return {ctx,stored,timers,run(c){return vm.runInContext(c,ctx)},tick(ms){let target=now+ms,guard=0;while(true){let entries=[...timers].filter(([,v])=>v.at<=target).sort((a,b)=>a[1].at-b[1].at);if(!entries.length)break;let [i,t]=entries[0];timers.delete(i);now=t.at;t.fn();if(++guard>100000)throw Error('timer loop')}now=target}}}\n\n" ,scope={require,console};
vm.runInNewContext(harness+'globalThis.makeWorld=world;',scope);
let w=scope.makeWorld(),r=c=>w.run(c);



const boot=()=>{w=scope.makeWorld();r=c=>w.run(c);r("newRun([3,0,4]);startBattle('戰鬥',false);clearFX();s.auto.paused=false;$(\"modal\").open=false;s.enemy.hp=s.enemy.max=100000;s.party.forEach(p=>p.hp=p.max=1000);priestState().prayer=8;matchMedia=()=>({matches:false});");};
boot();assert(r('PRIEST_SPEC.every(row=>row.length===7)'));assert.equal(r('C.priestbells.desc.includes("標記")'),true);
for(const kind of ['weave','nun','funeral']){boot();r(`s.hand=[PRIEST_FORMS.${kind}.key];s.energy=5;play(0);clearFX()`);assert.equal(r('priestFormKind()'),kind);assert.equal(r('priestState().prayer'),6);assert(r("heroSpriteHTML(4,'idle').includes('data-priest-form=\""+kind+"\"')"));r('priestEndForm(false)');assert(!r("heroSpriteHTML(4,'idle').includes('priest-form-poses')"));}
boot();r("priestBeginForm('nun');s.auto.clock+=6000;priestTick()");assert.equal(r('priestFormState().quiet'),3);assert.equal(r('mageEffectiveCost(C.priestoracle)'),0);r('s.hand=["priestoracle"];s.energy=5;play(0);clearFX()');assert.equal(r('s.energy'),5);assert.equal(r('priestFormState().quiet'),0);
boot();r("priestBeginForm('weave');priestFormAfterCard({owner:0},priestFormState())");
assert(r('priestFormState().threads<=1'));
r("const ff=priestFormState();ff.threads=3;s.party[0].hp=100;priestFormAfterCard(C.priestheal,ff)");assert(r('s.party[0].hp>100'));
boot();r("priestBeginForm('funeral');priestSpend(1)");assert.equal(r('priestFormState().souls'),3);const hp=r('s.enemy.hp');r('priestFormAfterCard(C.priestoracle,priestFormState())');assert.equal(r('priestFormState().souls'),2);assert(r('s.enemy.hp')<hp);r('priestEndForm()');assert.equal(r('priestFormKind()'),null);assert(r('s.enemy.hp<'+hp));
boot();r("priestBeginForm('nun');s.party[slotOf(4)].hp=0;priestTick()");assert.equal(r('priestFormKind()'),null);
console.log('PASS priest form cards, prayer costs, visual restoration, silent discounts, weave healing, soul spending and death cleanup');
