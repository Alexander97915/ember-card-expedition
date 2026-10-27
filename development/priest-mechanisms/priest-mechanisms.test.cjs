'use strict';
const assert=require('node:assert/strict'),make=require('./support/visual-world.cjs');
const w=make(),r=c=>w.run(c);
function setup(){r('newRun([3,0,4]);startBattle("戰鬥",false);clearFX();s.enemy.hp=s.enemy.max=100000;s.enemy.weak=[];s.enemy.shield=0;s.enemy.status={};s.selected=1')}
function cast(k){r(`s.energy=5;s.hand=[${JSON.stringify(k)}];play(0);clearFX()`)}
setup();r('s.hand=["priestconfess","priestinfuse"];s.draw=["heavy"];s.discard=[];play(0)');assert(r('priestState().confessChoice'));assert(r('autoBlocked()'));assert(r('handPanelHTML().includes("priestChooseConfess(1)" )'));r('priestChooseConfess(1);clearFX()');assert.equal(r('priestState().prayer'),3);assert.equal(r('s.hand[0]'),'heavy');assert(!r('s.discard.includes("priestconfess")'));assert(r('s.discard.includes("priestinfuse")'));
setup();r('s.hand=["heavy","priestconfess","priestheal"];play(1);priestCancelConfess()');assert.equal(r('s.hand.length'),3);assert.equal(r('priestState().prayer||0'),0);r('play(1);priestChooseConfess(0);clearFX()');assert.equal(r('s.hand[0]'),'priestheal');assert.equal(r('priestState().prayer'),3);
setup();cast('priestconfess');assert.equal(r('s.hand.length'),1);
setup();r('s.enemy.rosterPending={name:"test",due:3000};setEnemyAttackDue(3000,s.enemy);s.enemy.status={poisonUntil:5000,poisonAt:1000}');cast('prieststill');assert.equal(r('s.enemy.rosterPending.due'),5000);assert.equal(r('s.enemy.status.poisonUntil'),7000);assert.equal(r('s.enemy.status.poisonAt'),3000);cast('prieststill');assert.equal(r('s.hand.length'),1);r('s.enemy.rosterPending={name:"new",due:6000}');cast('prieststill');assert.equal(r('s.enemy.rosterPending.due'),8000);
setup();cast('priestsilence');r('s.draw=["heavy","heavy"];s.auto.clock=3999;priestTick()');assert(r('priestState().silence'));cast('heavy');r('s.auto.clock=4000;priestTick()');assert(!r('priestState().silence'));assert.equal(r('priestState().prayer'),3);assert.equal(r('s.hand.length'),2);
setup();cast('priestsilence');cast('priestinfuse');assert(!r('priestState().silence'));r('s.auto.clock=5000;priestTick()');assert.equal(r('priestState().prayer'),2);
setup();cast('priestbells');cast('heavy');cast('heavy');assert.equal(r('priestState().bells.owners.length'),1);cast('priestinfuse');assert.equal(r('priestState().bells.owners.length'),2);cast('knightguard');assert(!r('priestState().bells'));assert(r('s.enemy.hp<100000'));
setup();cast('priestbells');cast('heavy');r('s.auto.clock=8000;priestTick()');assert(!r('priestState().bells'));assert(r('s.enemy.hp<100000'));
setup();cast('priestsilence');r('save()');const resumed=make({...w.stored});assert.equal(resumed.run('priestState().silence.due'),4000);resumed.run('s.phase="map";startBattle("戰鬥",false);clearFX()');assert(!resumed.run('priestState().silence'));
console.log('PASS four priest mechanisms: choice/cancel/exhaust, per-cast stop and DoT clocks, silence success/cancellation, distinct classes/timeout, save and reset');
