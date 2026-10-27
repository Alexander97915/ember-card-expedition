'use strict';
// Save recovery is initialized before game.js; no storage writes happen on load failure.
const SAVE_BACKUP_KEY='ember-v3-backups';
const SAVE_RECOVERY_KEY='ember-v3-recovery-source';
let saveRecoveryPending=false,saveLoadInProgress=false,saveRecoveryMessage='';
let lastGoodSaveRaw=null,lastBackupAt=-Infinity,lastBackupStage=null;
function decodeExpeditionSave(raw,legacy=false){
 if(typeof raw!=='string')return null;
 try{
  let value=JSON.parse(raw);
  if(legacy)value=migrateV2(value);
  value=migrateCampaign(migrateRoster(value));
  return validSave(value)?value:null;
 }catch{return null}
}
function saveBackupRecords(){
 try{const records=JSON.parse(localStorage.getItem(SAVE_BACKUP_KEY)||'[]');return Array.isArray(records)?records.filter(x=>x&&typeof x.raw==='string').slice(0,3):[]}catch{return []}
}
function writeProtectedSave(raw){
 // Refuse to persist an invalid snapshot, even if serialization succeeded.
 if(!validSave(JSON.parse(raw)))throw Error('Invalid save snapshot');
 const previous=lastGoodSaveRaw||localStorage.getItem('ember-v3');
 const stage=s.phase+':'+s.floor,now=Date.now();
 if(previous&&previous!==raw&&(stage!==lastBackupStage||now-lastBackupAt>=30000)&&decodeExpeditionSave(previous)){
  const records=saveBackupRecords().filter(x=>x.raw!==previous&&decodeExpeditionSave(x.raw));
  // Backup must succeed before replacing the primary save.
  localStorage.setItem(SAVE_BACKUP_KEY,JSON.stringify([{raw:previous,savedAt:now},...records].slice(0,3)));
  lastBackupAt=now;lastBackupStage=stage;
 }
 localStorage.setItem('ember-v3',raw);lastGoodSaveRaw=raw;
}
function installExpeditionSave(value,recovered=false){
 s=value.s;
 messages=Array.isArray(value.messages)?value.messages.map(t=>typeof t==='string'?t.replaceAll('雷恩','琥珀').replaceAll('弧光斬','斷鋼斧'):String(t)):[];
 restoreEncounter(s);migrateAutoCards(s);
 if(s.phase==='battle'){prepareAuto();if(recovered)s.auto.paused=true;animateWalk()}else render();
}
function showSaveRecovery(){
 const board=$('board');if(!board)return;
 $('combat-workspace').dataset.mode='rest';$('hand-panel').hidden=true;
 $('progress').textContent='存檔保護模式';$('savewarning').hidden=true;
 board.innerHTML='<section class="save-recovery" role="alert"><div class="eyebrow">EMBER SPIRE</div><h2>進度暫時無法讀取</h2><p>原存檔仍保留在這個瀏覽器，自動儲存已暫停，避免覆蓋你的遠征。</p><p role="status">'+saveRecoveryMessage+'</p><button class="primary" onclick="tryRecoverExpeditionSave()">嘗試恢復最近備份</button> <button onclick="location.reload()">重新嘗試讀檔</button><p><button onclick="confirmFreshExpeditionAfterFailure()">保留原檔並開始新遠征</button></p></section>';
}
function enterSaveRecovery(message='可以先嘗試恢復備份，或重新整理後再讀取。'){
 saveRecoveryPending=true;saveLoadInProgress=false;saveRecoveryMessage=message;
 // A safe in-memory roster lets later UI adapters initialize; render/save remain gated.
 newRun();showSaveRecovery();
}
function preserveFailedSave(){
 const primary=localStorage.getItem('ember-v3'),legacy=localStorage.getItem('ember-v2');
 const source=JSON.stringify({primary,legacy,savedAt:Date.now()});
 localStorage.setItem(SAVE_RECOVERY_KEY,source);
 if(localStorage.getItem(SAVE_RECOVERY_KEY)!==source)throw Error('Unable to preserve original save');
}
function tryRecoverExpeditionSave(){
 if(!saveRecoveryPending)return false;
 let candidates;
 try{candidates=[...saveBackupRecords().map(x=>({raw:x.raw})),{raw:localStorage.getItem('ember-v2'),legacy:true}]}catch{saveRecoveryMessage='目前無法存取瀏覽器儲存空間，原檔未更動。請稍後再試。';showSaveRecovery();return false}
 for(const candidate of candidates){
  const value=decodeExpeditionSave(candidate.raw,candidate.legacy);if(!value)continue;
  saveLoadInProgress=true;
  try{
   // Keep both damaged and legacy input bytes before committing a recovered snapshot.
   preserveFailedSave();
   saveRecoveryPending=false;installExpeditionSave(value,true);
   const raw=JSON.stringify({version:3,s,messages});
   if(!validSave(JSON.parse(raw)))throw Error('Recovery invalid');
   localStorage.setItem('ember-v3',raw);lastGoodSaveRaw=raw;
   saveLoadInProgress=false;saveRecoveryMessage='';$('savewarning').hidden=true;
   modal('<h2>已恢復遠征進度</h2><p>已載入最近可用的備份，原本無法讀取的資料也已另外保留。若正在戰鬥，請確認狀態後再按繼續。</p>');return true;
  }catch{saveRecoveryPending=true;saveLoadInProgress=false;clearFX();}
 }
 enterSaveRecovery('目前沒有能成功恢復的備份，或瀏覽器無法寫入。原存檔未被新遠征覆蓋。');return false;
}
function confirmFreshExpeditionAfterFailure(){
 if(!saveRecoveryPending)return;
 modal('<h2>保留原檔並重新開始？</h2><p>會先另外保存目前無法讀取的原檔，再建立新遠征。只有成功保留原檔後才會繼續。</p><button class="primary" onclick="startFreshExpeditionAfterFailure()">保留原檔並重新開始</button>');
}
function startFreshExpeditionAfterFailure(){
 if(!saveRecoveryPending)return false;
 try{preserveFailedSave()}catch{saveRecoveryMessage='無法另外保存原檔，因此未開始新遠征。請先確認瀏覽器儲存空間。';showSaveRecovery();return false}
 saveRecoveryPending=false;lastGoodSaveRaw=null;saveLoadInProgress=false;
 $('modal').close?.();newRun();return true;
}
function bootSavedGame(){
 saveLoadInProgress=true;
 try{
  const raw=localStorage.getItem('ember-v3'),legacy=localStorage.getItem('ember-v2');
  if(raw!==null){
   const value=decodeExpeditionSave(raw);if(!value){enterSaveRecovery();return}
   installExpeditionSave(value);lastGoodSaveRaw=raw;
  }else if(legacy!==null){
   const value=decodeExpeditionSave(legacy,true);if(!value){enterSaveRecovery();return}
   installExpeditionSave(value);
  }else if(saveBackupRecords().length){enterSaveRecovery('主要存檔未找到，偵測到保留的備份。請嘗試恢復。');return}
  else newRun();
  saveLoadInProgress=false;save();
 }catch{enterSaveRecovery()}
}
