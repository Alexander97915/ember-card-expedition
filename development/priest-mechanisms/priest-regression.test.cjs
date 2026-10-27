'use strict';
const assert=require('node:assert/strict'),make=require('./support/visual-world.cjs');
const w=make(),r=c=>w.run(c);
function setup(){r('newRun([3,0,4]);startBattle("戰鬥",false);clearFX();s.enemy.hp=s.enemy.max=100000;s.enemy.weak=[];s.enemy.shield=0;s.enemy.status={};s.selected=1')}
function cast(k){r(`s.energy=5;s.hand=[${JSON.stringify(k)}];play(0);clearFX()`)}
setup();assert.equal(r('HEROES[4].job'),'牧師');assert.equal(r('JSON.stringify(s.picks)'),'[3,0,4]');assert.equal(r('CLASS_SKILLS[4].length'),19);
for(const k of r("CLASS_SKILLS[4].filter(k=>!['priestconfess','prieststill'].includes(k))")){setup();r('priestState().prayer=6;s.party[1].hp=20');cast(k);assert(r('s.discard.includes('+JSON.stringify(k)+')'),k);assert(r('Number.isFinite(s.energy)'));}
setup();cast('priestheal');assert.equal(r('priestState().prayer'),1);r('s.party[1].hp=1;priestState().prayer=2');cast('priestheal');assert.equal(r('s.party[1].hp'),14);assert.equal(r('priestState().prayer'),1);
setup();r('priestState().prayer=2');cast('priestblack');assert.equal(r('s.hand.length'),1);assert.equal(r('s.energy'),5);r('priestState().prayer=3');cast('priestblack');assert(r('priestDark()'));assert.equal(r('s.party[2].hp'),31);cast('priestinfuse');assert.equal(r('s.energy'),5);assert.equal(r('priestState().refunds'),1);assert(r('skillBasicHits(s.party[1],[["slash",4]]).some(h=>h[0]==="dark")'));cast('priestheal');assert.equal(r('priestState().refunds'),0);r('s.auto.clock=8001');assert(!r('priestDark()'));
setup();cast('priestinsight');assert.equal(r('mageEffectiveCost(C.heavy)'),0);r('s.energy=0;s.hand=["heavy"];play(0);clearFX()');assert.equal(r('s.hand.length'),0);assert(!r('priestState().discount'));
setup();cast('priestrescue');r('hurtByMonster(s.party[1],1000);clearFX()');assert.equal(r('s.party[1].hp'),17);assert(r('priestState().rescueUsed'));cast('priestrescue');assert.equal(r('s.hand.length'),1);
setup();r('s.party[1].hp=0');cast('priestrescue');assert.equal(r('s.party[1].hp'),17);assert(r('buffActive(s.party[1],"invulnerable")'));
setup();cast('priestrescue');r('s.auto.clock=12001;hurtByMonster(s.party[1],1000)');assert.equal(r('s.party[1].hp'),0);assert(!r('priestState().rescueUsed'));
setup();cast('priestoracle');assert.equal(r('priestState().oracle.due'),5000);cast('priestheal');assert.equal(r('priestState().oracle.due'),4000);r('s.auto.clock=4000;priestTick()');assert(!r('priestState().oracle'));assert(r('s.enemy.hp<100000'));
setup();cast('priestecho');cast('heavy');assert.equal(r('priestState().echo.owner'),0,'non-damage buff does not consume echo');r('s.selected=2');cast('priestecho');cast('priestjudgment');assert.equal(r('priestState().echoJobs.length'),1);r('s.auto.clock=1000;priestTick()');assert.equal(r('priestState().echoJobs.length'),0);
setup();cast('priestreprieve');r('hurtByMonster(s.party[1],10)');assert.equal(r('s.party[1].hp'),49);assert.equal(r('s.party[1].priestDelay.amount'),4);r('s.auto.clock=8000;priestTick()');assert.equal(r('s.party[1].hp'),45);
setup();r('priestState().prayer=4');cast('priestblack');r('save()');const resume=make({...w.stored});assert.equal(resume.run('priestState().prayer'),2);assert(resume.run('priestDark()'));resume.run('s.phase="map";startBattle("戰鬥",false);clearFX()');assert(!resume.run('priestDark()'));
for(const state of ['idle','walk','attack','cast','hurt','fallen'])assert(r(`heroSpriteHTML(4,"${state}").includes('assets/priest-v1/')||heroSpriteHTML(4,"${state}").includes('assets/priest-v2/')||heroSpriteHTML(4,"${state}").includes('assets/priest-complete-v41/')`));
console.log('PASS priest: roster, 19 cards, prayer, dark conversion/refund bounds, discount, resurrection/prevention/expiry, oracle, echoes, delayed damage, save/load and battle reset');
