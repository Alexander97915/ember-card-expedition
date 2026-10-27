'use strict';
const SELENA_SKILLS=[["shred", "破甲突刺", 1, "uncommon", "單體140%物傷，降低25%防禦6秒。", "attack"], ["counter", "格劍反擊", 1, "uncommon", "2秒內抵擋下一次直接攻擊80%傷害，反擊220%物傷。", "guard"], ["step", "迅步", 0, "uncommon", "1秒內閃避下一次直接攻擊；4秒內下一張單體攻擊傷害+25%。", "guard"], ["heavy", "重劍架勢", 2, "epic", "本關大劍士型態：普攻速度−30%，技能傷害+40%。", "skill"], ["charge", "蓄力斬", 2, "rare", "蓄力5秒，單體650%物傷；停止普攻，受到傷害−35%。硬控中斷返還1能量。", "attack"], ["sweep", "橫掃重斬", 2, "rare", "全體230%物傷，打斷可中斷施法；大劍士型態降低敵人25%攻速4秒。", "attack"], ["focus", "鋼鐵專注", 1, "uncommon", "下次蓄力獲得25%最大生命的臨時護盾，釋放或中斷後移除剩餘量。", "guard"], ["quake", "天崩斷岳", 3, "legendary", "蓄力5秒，全體450%物傷，主要目標額外250%；期間減傷35%。", "attack"], ["dark", "暗黑覺醒", 2, "epic", "本關暗黑劍士型態：普攻轉暗，暗傷+25%。", "skill"], ["death", "死境解放", 3, "legendary", "需暗黑型態；生命降至1，攻擊力+200%共8秒，前2秒無敵，禁止治療。本場限一次。存活結束回復25%生命，生成歸魂。", "skill"], ["moon", "黑月斷空", 2, "epic", "全體210%暗傷；暗黑型態對低於30%生命敵人增傷50%。", "attack"], ["pursuit", "噬魂追擊", 1, "rare", "單體180%暗傷，擊殺返還1能量；死境期間擊殺延長1秒，最多延長2秒。", "attack"], ["end", "終焉魔劍", 3, "legendary", "單體500%暗傷；自身生命不高於25%時追加150%。", "attack"], ["magic", "魔紋覺醒", 2, "epic", "本關魔劍士型態，預設火附魔。普攻追加35%附魔屬性傷害；攻擊牌對各命中目標附加1魔印。", "skill"], ["fire", "炎紋刻印", 1, "uncommon", "單體140%火傷，附加1魔印，切換火附魔；魔劍士型態共附加2層。", "attack"], ["ice", "霜刃封鎖", 1, "rare", "單體130%冰傷，降低30%移速與攻速4秒，切換冰附魔。", "attack"], ["thunder", "雷刃連鎖", 2, "rare", "主要目標180%雷傷，另最多兩名各100%雷傷；不重複命中，切換雷附魔。", "attack"], ["break", "破印劍", 2, "epic", "單體200%目前附魔屬性傷害，消耗全部魔印，每層追加60%。本牌不補魔印。", "attack"], ["all", "萬象魔劍", 3, "legendary", "全體火冰雷各70%傷害，消耗各目標魔印，每層追加70%目前附魔屬性傷害。本牌不補魔印。", "attack"]];

function registerSwordsmanSkills(){
 HEROES.push({name:'瑟琳娜',job:'劍士',role:'前排劍士',className:'swordsman',position:300,max:45,sub:'蓄力重劍・暗黑死境・火冰雷魔劍',attrs:['slash','dark','fire','ice','thunder'],starter:[],gift:'sel_charge'});
 CLASS_SKILLS[5]=SELENA_SKILLS.map(r=>'sel_'+r[0]);
 for(const [key,name,cost,rarity,desc,type]of SELENA_SKILLS)C['sel_'+key]={key:'sel_'+key,name,cost,rarity,desc,type,owner:5,selena:true,instant:true,icon:type==='attack'?'⚔':'✦'};
 C.sel_return=SELENA_RETURN;
 AUTO_BASIC[5]={name:'緋棘劍擊',attr:'slash',damage:4,interval:3000};HERO_FRAME_LAYOUT[5]=Object.fromEntries(Object.keys(SWORDSMAN_ACTION_LABELS).map(k=>[k,swordsmanFrames(k)]));
}
function selNow(){return s?.auto?.clock||0}
function selState(){return s?.auto?abilityState(5):{}}
function selHero(){return s?.party?.find(p=>p.id===5)}
function selDeath(){return (selState().deathUntil||0)>selNow()}
function selPower(){return (AUTO_BASIC[5].damage+(s.strength||0)+gearBonus(5,'attack'))*(selDeath()?3:1)}
function selForm(){return selState().form||'base'}
function selMark(e,n){e.status.selMark={count:Math.min(3,selMarks(e)+n),until:selNow()+8000}}
function selMarks(e){return e.status?.selMark?.until>selNow()?e.status.selMark.count:0}
function selCleanReturn(){for(const key of ['hand','draw','discard'])if(s[key])s[key]=s[key].filter(k=>k!=='sel_return')}
function selEndDeath(){const st=selState(),p=selHero();delete st.deathUntil;delete st.safeUntil;selCleanReturn();if(p?.hp>0)healTarget(Math.ceil(p.max*.25),slotOf(5),5)}
function selCancelCharge(refund=true){const st=selState(),p=selHero();if(!st.charge)return;if(p&&st.charge.shield){p.block=Math.max(0,p.block-st.charge.shield)}delete st.charge;if(refund)s.energy=Math.min(5,s.energy+1)}
function selHit(e,ratio,attr,c,extra={}){
 if(!e||e.hp<=0)return {damage:0,actual:0};const st=selState();let mult=c&&selForm()==='heavy'?1.4:1;if(c&&st.stepAmpUntil>selNow()&&!['sweep','quake','moon','all','thunder'].includes(c.key.slice(4)))mult*=1.25;
 const n=selPower()*ratio*mult;return withEnemy(e,()=>damageEnemy([[attr,n]],5,{preparedHits:[[attr,n]],ignoreStrength:true,skipResource:true,noOnHit:true,selena:true,card:c,label:c?.name||'灰誓追斬',...extra}));
}
function selResolve(c,origin){
 const st=selState(),p=selHero(),now=selNow(),k=c.key.slice(4);let sum=0;const hits=[];
 const hit=(e,ratio,attr)=>{const r=selHit(e,ratio,attr,c);sum+=r.damage;hits.push({id:e.id,...r});return r};
 if(['heavy','dark','magic'].includes(k)){selCancelCharge();if(selDeath())selEndDeath();st.form=k;if(k==='magic')st.element='fire';}
 else if(k==='death'){p.hp=1;st.deathUsed=true;st.deathUntil=now+8000;st.safeUntil=now+2000;st.extended=0;selCleanReturn();if(s.hand.length>=7)s.discard.push('sel_return');else s.hand.push('sel_return');}
 else if(k==='return')selEndDeath();
 else if(k==='counter')st.counterUntil=now+2000;
 else if(k==='step'){st.stepUntil=now+1000;st.stepAmpUntil=now+4000}
 else if(k==='focus')st.focus=true;
 else if(['charge','quake'].includes(k)&&!c.selComplete){const shield=st.focus||hasGearEffect(5,'steelFocus')?Math.ceil(p.max*.25):0;delete st.focus;p.block+=shield;st.charge={key:c.key,started:now,due:now+5000,enemyId:s.enemy.id,shield};}
 else {
  if(['fire','ice','thunder'].includes(k))st.element=k;
  const targets=['sweep','quake','moon','all'].includes(k)?[...livingEnemies()]:k==='thunder'?[s.enemy,...livingEnemies().filter(e=>e.id!==s.enemy.id)].slice(0,3):[s.enemy];
  for(const [i,e]of targets.entries()){
   const marks=selMarks(e),element=st.element||'fire';
   if(k==='all'){delete e.status.selMark;for(const a of ['fire','ice','thunder'])hit(e,.7,a);if(marks)hit(e,.7*marks,element)}
   else{const ratio={shred:1.4,charge:6.5,sweep:2.3,quake:4.5+(e.id===c.selTarget?2.5:0),moon:2.1*(selForm()==='dark'&&e.hp/e.max<.3?1.5:1),pursuit:1.8,end:5+(p.hp/p.max<=.25?1.5:0),fire:1.4,ice:1.3,thunder:i?1:1.8,break:2+marks*.6}[k];const attr=['moon','pursuit','end'].includes(k)?'dark':['fire','ice','thunder'].includes(k)?k:k==='break'?element:'slash';if(k==='break')delete e.status.selMark;if(ratio)hit(e,ratio,attr);}
   if(k==='shred')e.status.selShredUntil=now+6000;
   if(k==='ice'||k==='sweep'&&selForm()==='heavy'){e.status.slow=k==='ice'?.3:.25;e.status.slowUntil=now+4000;if(k==='ice'){e.status.selMoveUntil=now+4000;}}
   if(k==='sweep'&&e.interruptible!==false){e.status.stunUntil=Math.max(e.status.stunUntil||0,now+100);if(e.areaBossId&&typeof interruptBoss==='function')withEnemy(e,()=>interruptBoss(e));}
   if(e.hp>0&&!['break','all'].includes(k)){if(k==='fire')selMark(e,1);if(selForm()==='magic')selMark(e,1)}
   if(k==='pursuit'&&e.hp<=0){s.energy=Math.min(5,s.energy+1);if(selDeath()&&(st.extended||0)<2){st.deathUntil+=1000;st.extended=(st.extended||0)+1}}
  }
  if(hits.length&&!['sweep','quake','moon','all','thunder'].includes(k))delete st.stepAmpUntil;
 }
 log('瑟琳娜 · '+c.name+(sum?'：'+sum+' 傷害':''));if(enemyRoster().some(e=>e.hp===0))victory();animateAuto({kind:'attack',owners:[5],support:c.type!=='attack',cardName:c.name,cardEffect:c,damage:sum,targetHits:hits,enemyId:s.enemy.id,attr:st.element||'slash'});
}

const SELENA_RETURN={key:'sel_return',name:'歸魂',cost:0,rarity:'rare',desc:'提前結束死境爆發並回復25%最大生命，保留暗黑型態；臨時生成，不進牌池。',type:'skill',owner:5,selena:true,instant:true,icon:'☾'};
