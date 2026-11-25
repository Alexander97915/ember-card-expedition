'use strict';
const assert=require('node:assert/strict');
const {world}=require('../p0-save-recovery/world.cjs');
function battle(){const w=world();w.run("newRun([5,0,4]);startBattle('戰鬥',false);clearFX();s.auto.paused=false;busy=false");return w}
let w=battle();
const anchors=w.run('JSON.stringify(s.auto.space)');
assert.deepEqual(JSON.parse(w.run('JSON.stringify(s.party.map(p=>battleSpacePosition(p).x))')),[365,240,115]);
w.run('for(let tick=0;tick<30;tick++){advanceAuto(200);clearFX()}');
assert.equal(w.run('JSON.stringify(s.auto.space)'),anchors,'ticks and attacks leave the formation in place');
w.run('s.auto.space={revision:1,heroes:{5:{x:552,y:37,moving:true}},enemies:{}};initBattleSpace()');
assert.equal(w.run('JSON.stringify(s.auto.space)'),anchors,'restore old wandering positions to the fixed formation');
// Charge immobilizes the caster without starving other ready heroes or enemies.
w=battle();w.run("selState().charge={key:'sel_charge',started:0,due:5000,shield:0};s.auto.heroAt[5]=0;s.auto.heroAt[0]=1;s.auto.heroAt[4]=2;for(const e of enemyRoster())e.nextAttack=999999;globalThis.picked=[];heroBasic=p=>picked.push(p.id);nextReadyEnemy=()=>null");
w.run('advanceAuto(100)');assert.equal(w.run('picked[0]'),0,'charging sword does not starve party');
// Frozen enemies cannot attack even when their cooldown is already due.
w=battle();w.run('enemyAttackDue=()=>0;for(const e of livingEnemies()){e.broken=false;e.status.stunUntil=0;e.status.freezeUntil=1000}');
assert.equal(w.run('nextReadyEnemy()'),undefined,'freeze blocks ordinary attack');
w.run('s.auto.clock=1000');assert(w.run('!!nextReadyEnemy()'),'freeze expiry permits attack');
w.run('for(const e of livingEnemies())e.status.stunUntil=2000');assert.equal(w.run('nextReadyEnemy()'),undefined);
// Charge completion and control interruption retain their existing behavior.
w=battle();w.run("selState().charge={key:'sel_charge',started:0,due:100,shield:0,enemyId:s.enemy.id};s.auto.clock=100;tickAbilities()");assert.equal(w.run('!!selState().charge'),false);
w=battle();w.run("selState().charge={key:'sel_charge',started:0,due:5000,shield:0};selHero().monsterStatus={stunUntil:1000};tickAbilities()");assert.equal(w.run('!!selState().charge'),false);
console.log('PASS P1: fixed formation, old formation recovery, charge scheduling/completion/interruption, freeze/stun expiry');
