'use strict';
const assert=require('node:assert/strict');const {world}=require('./world.cjs');
let w=world();assert(w.stored['ember-v3']);assert.equal(w.run('saveRecoveryPending'),false);
w.run('newRun([0,3,4]);s.gold=123;save()');const good=w.stored['ember-v3'];
let reload=world({'ember-v3':good});assert.equal(reload.run('s.gold'),123);assert.equal(reload.run('s.phase'),'map');
// Full HTML script order now registers all base priest actions, including run.
assert(w.run("spriteCatalog().some(e=>e.id==='seraphina:base/walk')"));
assert(w.run("PRIEST_FRAMES.walk.every(f=>f.sampling==='nearest'&&Math.abs(f.headSpan*f.scale-54.34)<1e-8&&Math.abs(f.offset[1]+f.sourceFootAnchor[1]*f.scale-430)<1e-8)"));
assert(w.run('typeof priestHUDBefore===\'function\''),'script continues after registration');
for(const ids of [[0,1,2],[3,4,5]]){
 w.run(`newRun(${JSON.stringify(ids)});startBattle('戰鬥',false);clearFX();s.auto.paused=true;save()`);
 for(const id of ids)for(const state of ['idle','walk','attack','cast'])assert(w.run(`heroSpriteHTML(${id},'${state}').length>0`));
 const battle=world({'ember-v3':w.stored['ember-v3']});assert.equal(battle.run('s.phase'),'battle');assert.equal(battle.run('saveRecoveryPending'),false);
}
// A malformed primary never falls through to fresh autosave, even on pagehide.
for(const bad of ['{broken','null','{}',JSON.stringify({version:999,s:{}})]){
 const store={'ember-v3':bad,'ember-v2':'legacy-untouched'};const x=world(store);
 assert.equal(x.run('saveRecoveryPending'),true);assert.equal(store['ember-v3'],bad);assert.equal(x.writes.length,0);
 x.run('save();render();scheduleCombatSave()');x.events.pagehide();
 assert.equal(store['ember-v3'],bad);assert.equal(store['ember-v2'],'legacy-untouched');assert.equal(x.writes.length,0);
 assert(x.elements.board.innerHTML.includes('嘗試恢復最近備份'));
}
// Checkpoint retention keeps three valid snapshots, newest first.
w=world({'ember-v3':good});for(let i=0;i<5;i++){w.advance(31000);w.run(`s.gold=${200+i};save()`)}
const backups=JSON.parse(w.stored['ember-v3-backups']);assert.equal(backups.length,3);assert.deepEqual(backups.map(b=>JSON.parse(b.raw).s.gold),[203,202,201]);
// Corrupt backup entries are skipped; recovery archives the exact damaged input.
const damaged='{damaged-original';const recoveryStore={'ember-v3':damaged,'ember-v3-backups':JSON.stringify([{raw:'bad'},...backups])};
let recovery=world(recoveryStore);assert(recovery.run('tryRecoverExpeditionSave()'));assert.equal(recovery.run('s.gold'),203);assert.equal(JSON.parse(recoveryStore['ember-v3-recovery-source']).primary,damaged);assert.equal(recovery.run('saveRecoveryPending'),false);assert.equal(JSON.parse(recoveryStore['ember-v3']).s.gold,203);
// Missing primary with existing backups is recoverable, never silently restarted.
const missing=world({'ember-v3-backups':JSON.stringify(backups)});assert(missing.run('saveRecoveryPending'));assert(!missing.stored['ember-v3']);assert(missing.run('tryRecoverExpeditionSave()'));
// Battle recovery pauses rather than silently advancing the restored encounter.
w=world();w.run("newRun([3,4,5]);startBattle('戰鬥',false);clearFX();s.auto.paused=false;save()");const battleRaw=w.stored['ember-v3'];
const br=world({'ember-v3':damaged,'ember-v3-backups':JSON.stringify([{raw:battleRaw}])});assert(br.run('tryRecoverExpeditionSave()'));assert(br.run('s.auto.paused'));
// Runtime hydration failure is protected just like a parse failure.
const hydration=world({'ember-v3':battleRaw},{beforeGame:"restoreEncounter=function(){throw Error('fixture hydration failure')}"});assert(hydration.run('saveRecoveryPending'));assert.equal(hydration.stored['ember-v3'],battleRaw);assert.equal(hydration.writes.length,0);
// Legacy-only saves still migrate; a bad v3 can recover v2 only on explicit retry.
const legacy=JSON.parse(good);legacy.version=legacy.s.version=2;const legacyRaw=JSON.stringify(legacy);
const legacyWorld=world({'ember-v2':legacyRaw});assert.equal(legacyWorld.run('saveRecoveryPending'),false);assert.equal(legacyWorld.run('s.gold'),123);assert.equal(legacyWorld.stored['ember-v2'],legacyRaw);
const legacyRecovery=world({'ember-v3':damaged,'ember-v2':legacyRaw});assert(legacyRecovery.run('saveRecoveryPending'));assert.equal(legacyRecovery.stored['ember-v3'],damaged);assert(legacyRecovery.run('tryRecoverExpeditionSave()'));assert.equal(legacyRecovery.run('s.gold'),123);
// Storage/backup failures cannot replace primary, or start a new expedition unprotected.
for(const key of ['ember-v3-recovery-source','ember-v3']){
 const store={'ember-v3':damaged,'ember-v3-backups':JSON.stringify([{raw:good}])};const x=world(store,{failWrite:k=>k===key});assert.equal(x.run('tryRecoverExpeditionSave()'),false);assert.equal(store['ember-v3'],damaged);assert(x.run('saveRecoveryPending'));
}
const noBackup=world({'ember-v3':damaged});assert.equal(noBackup.run('tryRecoverExpeditionSave()'),false);assert.equal(noBackup.stored['ember-v3'],damaged);
assert(noBackup.run('startFreshExpeditionAfterFailure()'));assert.equal(JSON.parse(noBackup.stored['ember-v3-recovery-source']).primary,damaged);assert.equal(JSON.parse(noBackup.stored['ember-v3']).s.phase,'recruit');
const blockedNew=world({'ember-v3':damaged},{failWrite:()=>true});assert.equal(blockedNew.run('startFreshExpeditionAfterFailure()'),false);assert.equal(blockedNew.stored['ember-v3'],damaged);
const denied=world({'ember-v3':good},{failRead:()=>true});assert(denied.run('saveRecoveryPending'));assert.equal(denied.stored['ember-v3'],good);assert.equal(denied.writes.length,0);
const quota=world({'ember-v3':good});quota.options.failWrite=k=>k==='ember-v3-backups';quota.run('s.gold=500;save()');assert.equal(quota.stored['ember-v3'],good);assert.equal(quota.elements.savewarning.hidden,false);
// Training state never replaces the real expedition save.
const training=world({'ember-v3':good});const trainingBefore=training.stored['ember-v3'];training.run('s.training={config:{}};save()');assert.equal(training.stored['ember-v3'],trainingBefore);
console.log('PASS P0: full script initialization, six heroes, priest run size/ground, reload, corruption guards, three backups, recovery, preserved originals, paused battle, denied/quota storage and training isolation');
