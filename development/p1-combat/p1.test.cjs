'use strict';
const assert=require('node:assert/strict');
const {world}=require('../p0-save-recovery/world.cjs');
function battle(){const w=world();w.run("newRun([5,0,4]);startBattle('戰鬥',false);clearFX();s.auto.paused=false;busy=false");return w}
let w=battle();
assert.equal(w.run('battleSpaceRange({id:5})'),60,'swordswoman uses melee reach');
assert.deepEqual(JSON.parse(w.run('JSON.stringify([0,1,2,3,4].map(id=>battleSpaceRange({id})))')),[60,290,330,32,345]);
w.run('s.auto.space.heroes[5]={x:300,y:68,lane:68,moving:false};for(const e of enemyRoster())s.auto.space.enemies[e.id]={x:650,y:68,lane:68,moving:false}');
assert.equal(w.run('battleSpaceInRange(selHero())'),false,'no ranged melee attack');
w.run('tickBattleSpace(200)');assert(w.run('s.auto.space.heroes[5].x>300'),'approaches enemy');
// Charge immobilizes the caster without starving other ready heroes or enemies.
w=battle();w.run("selState().charge={key:'sel_charge',started:0,due:5000,shield:0};s.auto.heroAt[5]=0;s.auto.heroAt[0]=1;s.auto.heroAt[4]=2;for(const e of enemyRoster())e.nextAttack=999999;globalThis.picked=[];heroBasic=p=>picked.push(p.id);nextReadyEnemy=()=>null;battleSpaceInRange=()=>true");
w.run('advanceAuto(100)');assert.equal(w.run('picked[0]'),0,'charging sword does not starve party');
w=battle();w.run("selState().charge={key:'sel_charge',started:0,due:5000,shield:0};s.auto.space.heroes[5]={x:100,y:68,lane:68,moving:true}");
const x=w.run('s.auto.space.heroes[5].x');w.run('tickBattleSpace(200)');assert.equal(w.run('s.auto.space.heroes[5].x'),x,'no sliding while charging');assert.equal(w.run('battleSpaceMoving(selHero())'),false);
w.run('selCancelCharge(false);tickBattleSpace(200)');assert(w.run('s.auto.space.heroes[5].x')>x,'movement resumes');
// Frozen enemies cannot attack even when their cooldown is already due.
w=battle();w.run('battleSpaceInRange=()=>true;enemyAttackDue=()=>0;for(const e of livingEnemies()){e.broken=false;e.status.stunUntil=0;e.status.freezeUntil=1000}');
assert.equal(w.run('nextReadyEnemy()'),undefined,'freeze blocks ordinary attack');
w.run('s.auto.clock=1000');assert(w.run('!!nextReadyEnemy()'),'freeze expiry permits attack');
w.run('for(const e of livingEnemies())e.status.stunUntil=2000');assert.equal(w.run('nextReadyEnemy()'),undefined);
// Charge completion and control interruption retain their existing behavior.
w=battle();w.run("selState().charge={key:'sel_charge',started:0,due:100,shield:0,enemyId:s.enemy.id};s.auto.clock=100;tickAbilities()");assert.equal(w.run('!!selState().charge'),false);
w=battle();w.run("selState().charge={key:'sel_charge',started:0,due:5000,shield:0};selHero().monsterStatus={stunUntil:1000};tickAbilities()");assert.equal(w.run('!!selState().charge'),false);
console.log('PASS P1: melee range, approach, charge scheduling/movement/completion/interruption, freeze/stun expiry');
