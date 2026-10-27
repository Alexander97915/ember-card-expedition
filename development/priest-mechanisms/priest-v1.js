'use strict';
// Priest state is serialized in auto.skills[4]; all deadlines use battle time.
const PRIEST_SPEC=[
 ['priestconfess','告解',0,'uncommon','✥','選擇棄掉另一張手牌，祈願 +2；棄牧師卡再抽 1 張。本卡本場使用後移除。另獲得施放牧師卡的祈願。','skill'],
 ['prieststill','聖言：止',1,'rare','◷','暫停單體當前施法倒數與既有負面狀態計時 2 秒；每次施法限一次。不取消招式。','skill'],
 ['priestsilence','無聲彌撒',1,'epic','✧','4 秒內不使用其他牧師卡，完成時抽 2 張、祈願 +2；提前使用牧師卡則取消，其他職業可照常出牌。','skill'],
 ['priestbells','末日鐘聲',2,'epic','標記單體 8 秒；每使用一張其他卡，依不同職業累積鐘響，每職業一次。每聲造成 80% 光傷，三聲立即引爆。','attack'],
 ['priestjudgment','聖光裁決',1,'common','✧','單體 150% 光傷；祈願 ≥2 時消耗 2 層，使其光抗降低 15%／6 秒。','attack'],
 ['priestheal','癒合禱言',1,'common','♥','指定存活隊友回復最大生命 15%；祈願 ≥2 時消耗 2 層，改為 23%。','heal'],
 ['priestbless','虔誠祝福',1,'common','✦','指定隊友攻速 +20%，持續 6 秒。','skill'],
 ['priestinfuse','聖光灌注',1,'uncommon','✧','全隊普攻追加牧師攻擊力 25% 光傷／6 秒；每人每秒最多 2 次。黑祭司期間轉暗傷。','skill'],
 ['priestseal','光之聖印',1,'uncommon','◎','標記單體 8 秒，每 3 次光傷命中引爆 100% 光傷，最短間隔 1 秒。黑祭司期間光暗皆計數，引爆暗傷。','skill'],
 ['priestcleanse','淨化之手',1,'uncommon','✥','移除指定隊友最多 2 種可淨化異常，每種額外祈願 +1；無異常時抽 1 張。','skill'],
 ['priestfaith','堅定信仰',1,'uncommon','◈','指定隊友減傷 20%、免疫打斷／6 秒；祈願 ≥2 時消耗 2 層，擴及全隊。','guard'],
 ['priestinsight','啟示',1,'rare','✦','抽 1 張；下一張其他卡費用 −1，最低 0，不疊加。','skill'],
 ['priestecho','祝禱迴響',2,'rare','✧','指定隊友下一張至少 1 基礎費用的直接傷害卡，1 秒後追加 60% 傷害；不複製其他效果。','skill'],
 ['priestsanctuary','聖域降臨',2,'rare','◈','全隊減傷 20%，新施加異常的持續時間減半，持續 6 秒。','guard'],
 ['priestreprieve','命運緩刑',2,'rare','◷','指定隊友 4 秒內承受的傷害，在格擋後將 40% 延後分 4 秒承受；消耗 3 祈願可免除一半延後傷害。','guard'],
 ['priestoracle','神諭倒數',2,'epic','✧','全體敵人 5 秒倒數，每張其他牧師卡縮短 1 秒；歸零造成 240% 光傷並打斷可中斷施法。','attack'],
 ['priestauthority','天使授權',2,'epic','♛','消耗 3 祈願；接下來 3 張隊伍白／綠卡：傷害 +40%，或增益時間 +50%，每張只套用一項。','skill'],
 ['priestrescue','魂歸聖堂',3,'epic','✥','優先復活倒下隊友至 30% 生命並無敵 2 秒；無人倒下時指定隊友獲得 12 秒致命保護。救命成功全場限一次。','heal'],
 ['priestblack','黑祭司',2,'epic','☾','消耗 3 祈願與 8% 當前生命，8 秒內牧師光傷轉暗傷；接下來 2 張實付 ≥1 能量的其他牧師卡，各返還 1 能量。切換為黑祭司造型。','skill'],
 ['priestgospel','福音降臨',3,'legendary','♛','8 秒內祈願獲取加倍；每次消耗祈願，每層追擊最低生命敵人 60% 光傷，單次最多計算 3 層。','skill']
];
function registerPriest(){
 registerSpriteProfile('seraphina:base',{body:[150,25,280,430],head:[209,35],main:[285,190],off:[180,210],legacyFeet:[209,430]});
 HEROES.push({name:'瑟菲娜',job:'牧師',role:'後排牧師',className:'priest',position:900,max:34,sub:'光屬附傷・祈願祝福・復活・黑祭司回能',attrs:['light','dark'],starter:[],gift:'priestoracle'});
 CLASS_SKILLS.push(PRIEST_SPEC.map(r=>r[0]));
 for(const [key,name,cost,rarity,icon,desc,type] of PRIEST_SPEC)C[key]={key,name,cost,rarity,icon,desc,type,owner:4,priest:true,instant:true};
 AUTO_BASIC.push({name:'聖光彈',attr:'light',damage:4,interval:3600});HERO_FRAME_LAYOUT.push(PRIEST_FRAMES);
}
function priestState(){return abilityState(4)}
function priestNow(){return s.auto?.clock||0}
function priestLive(){return inParty(4)&&s.party[slotOf(4)]?.hp>0}
function priestDark(){return priestLive()&&priestState().blackUntil>priestNow()}
function priestAttr(){return priestDark()?'dark':'light'}
function priestPower(){return AUTO_BASIC[4].damage}
function priestGain(n=1){const st=priestState();st.prayer=Math.min(6,(st.prayer||0)+n*(st.gospelUntil>priestNow()?2:1))}
function priestSpend(n){const st=priestState();if((st.prayer||0)<n)return false;st.prayer-=n;if(st.gospelUntil>priestNow()){const e=livingEnemies().sort((a,b)=>a.hp-b.hp)[0];if(e)priestHit(e,priestPower()*.6*Math.min(3,n),'福音降臨')}return true}
function priestHit(e,n,label,attr=priestAttr(),card=null){
 if(!e||e.hp<=0)return null;return withEnemy(e,()=>damageEnemy([[attr,n]],4,{preparedHits:[[attr,n]],skipResource:true,noOnHit:true,noCrit:true,ignoreStrength:true,priestSecondary:!card,card,label}));
}
function priestTarget(dead=false){return dead?s.party.find(p=>p.hp<=0):s.party[s.selected]?.hp>0?s.party[s.selected]:s.party.find(p=>p.hp>0)}
function priestSet(p,key,ms){p.buffs??={};p.buffs[key]=priestNow()+ms}
function priestHeal(p,ratio){if(p?.hp>0)healTarget(Math.ceil(p.max*ratio),slotOf(p.id),4)}
function priestRescue(p){const st=priestState();p.hp=Math.max(1,Math.ceil(p.max*.3));p.block=0;p.monsterStatus={};p.buffs??={};priestSet(p,'invulnerable',2000);s.auto.heroAt[p.id]=priestNow()+heroInterval(p.id);st.rescueUsed=true;for(const q of s.party)delete q.priestAnchor;for(const name of ['hand','draw','discard'])if(s[name])s[name]=s[name].filter(k=>k!=='priestrescue');log(HEROES[p.id].name+'受到魂歸聖堂庇護！')}
function priestResolve(c,origin){
 const st=priestState(),now=priestNow(),target=priestTarget(),k=c.key;let result={damage:0,newBreak:false};
 const duration=n=>Math.round(n*(c.priestDuration||1));
 switch(k){
 case 'priestjudgment':{const amp=priestSpend(2);const e=s.enemy;const out=priestHit(e,priestPower()*1.5,c.name,priestAttr(),c);if(out)result=out;if(amp&&e.hp>0){e.status.priestResistUntil=now+6000;e.status.priestResistAttr=priestAttr()}break}
 case 'priestheal':priestHeal(target,priestSpend(2)?.23:.15);break;
 case 'priestbless':priestSet(target,'priestHaste',duration(6000));break;
 case 'priestinfuse':st.infuseUntil=now+duration(6000);break;
 case 'priestseal':s.enemy.status.priestSeal={until:now+8000,count:0,next:0};break;
 case 'priestcleanse':{const keys=['freezeUntil','stunUntil','chillUntil','burnUntil','poisonUntil','slowUntil'];let count=0;for(const key of keys)if(target.monsterStatus?.[key]>now&&count<2){delete target.monsterStatus[key];count++}if(count)priestGain(count);else draw(1);break}
 case 'priestfaith':{const team=priestSpend(2)?s.party.filter(p=>p.hp>0):[target];for(const p of team)priestSet(p,'priestFaith',duration(6000));break}
 case 'priestinsight':draw(1);st.discount=true;break;
 case 'priestecho':st.echo={owner:target.id};break;
 case 'priestsanctuary':for(const p of s.party)if(p.hp>0)priestSet(p,'priestSanctuary',duration(6000));break;
 case 'priestreprieve':target.priestDelay={until:now+duration(4000),amount:0,forgive:priestSpend(3),next:now+duration(4000)+1000,ticks:0};break;
 case 'priestoracle':st.oracle={due:now+5000,attr:priestAttr(),power:priestPower()*2.4*(c.priestDamage||1)};break;
 case 'priestauthority':priestSpend(3);st.authority=3;break;
 case 'priestrescue':{const dead=priestTarget(true);if(dead)priestRescue(dead);else target.priestAnchor=now+duration(12000);break}
 case 'priestblack':priestSpend(3);{const p=s.party[slotOf(4)];p.hp=Math.max(1,p.hp-Math.ceil(p.hp*.08))}st.blackUntil=now+8000;st.refunds=2;break;
 case 'priestgospel':st.gospelUntil=now+8000;break;
 }
 if(st.oracle&&k!=='priestoracle')st.oracle.due-=1000;
 if(k!=='priestblack'&&st.blackUntil>now&&st.refunds>0&&c.paidCost>=1){s.energy=Math.min(5,s.energy+1);st.refunds--}
 priestGain();log('瑟菲娜使出「'+c.name+'」 · 祈願 '+st.prayer+'/6');
 if(enemyRoster().some(e=>e.hp===0))victory();animateCard(c,result.damage||0,result.newBreak||false,false,s.enemy.id,origin,[],0);return result;
}
function priestTick(){
 if(!s.auto)return;const st=priestState(),now=priestNow();
 if(st.oracle&&st.oracle.due<=now){const o=st.oracle;delete st.oracle;for(const e of [...livingEnemies()]){priestHit(e,o.power,'神諭倒數',o.attr);if(e.hp>0)withEnemy(e,()=>interruptBoss(e))}}
 for(const job of (st.echoJobs||[]).filter(j=>j.due<=now)){const e=enemyRoster().find(e=>e.id===job.enemyId);if(e?.hp>0)withEnemy(e,()=>damageEnemy(job.hits,job.owner,{preparedHits:job.hits,skipResource:true,noOnHit:true,noCrit:true,ignoreStrength:true,priestSecondary:true,label:'祝禱迴響'}))}st.echoJobs=(st.echoJobs||[]).filter(j=>j.due>now);
 for(const p of s.party){const d=p.priestDelay;if(!d||now<d.next)continue;while(d.ticks<4&&now>=d.next){const n=d.amount/(4-d.ticks);d.amount-=n;d.ticks++;d.next+=1000;if(p.hp>0)hurtByMonster(p,n,false,'緩刑結算')}if(d.ticks>=4)delete p.priestDelay}
 if(enemyRoster().some(e=>e.hp===0))victory();
}
function priestMitigation(p){return (buffActive(p,'priestFaith')?.8:1)*(buffActive(p,'priestSanctuary')?.8:1)}
function priestDeferredDamage(p,n,label){const d=p.priestDelay;if(d&&d.until>priestNow()&&label!=='緩刑結算'){d.amount+=n*.4*(d.forgive?.5:1);return n*.6}return n}
function priestProtectLethal(p,n){return priestLive()&&!priestState().rescueUsed&&p.priestAnchor>priestNow()&&p.hp>0&&n>=p.hp?{damage:p.hp-1,priest:true}:null}
