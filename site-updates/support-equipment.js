'use strict';
// Retired setup skills become passive equipment; no new wall-clock timers.
const SUPPORT_EQUIPMENT={
 stoneSkinRobe:{name:'岩膚聖鎧',owner:2,slot:'armor',rarity:'legendary',icon:'◈',stats:{armor:4,maxHp:20},effect:'stoneMantle',ability:'岩石表皮',asset:'assets/ui-icons/skill-stoneskin-v2.webp',desc:'自身與召喚的泰坦受到傷害減少 50%（原技能為 40%），保留閃避能力。普通攻擊不會中斷自身詠唱；暈眩與凍結仍會中斷。穿戴後自動生效，不耗牌或能量；與舊岩石表皮取較高減傷、不重複相乘。'},
 devoutCharm:{name:'虔誠聖印',owner:4,slot:'charm',rarity:'rare',icon:'✦',stats:{maxHp:8},effect:'devoutAura',ability:'虔誠祝福',asset:'assets/gear-painted/springCharm-v1.webp',desc:'牧師存活且穿戴時，全體存活隊友普攻攻速 +20%，包含牧師；倒下或卸下立即失效，復活後恢復；凝神重弓依原規則轉為攻擊力。與舊虔誠祝福取較高效果，不重複疊加。'},
 steelFocusCharm:{name:'鋼心護符',owner:5,slot:'charm',rarity:'rare',icon:'◈',stats:{maxHp:8},effect:'steelFocus',ability:'鋼鐵專注',asset:'assets/gear-painted/jade-v1.webp',desc:'每次開始蓄力斬或天崩斷岳時，自動獲得自身最大生命 25% 的臨時護盾（向上取整）。釋放、中斷或倒下時移除未消耗的臨時護盾，保留其他護盾；與舊鋼鐵專注不重複產盾。'}
};
function registerSupportEquipment(){
 Object.assign(GEAR,SUPPORT_EQUIPMENT);
 Object.assign(GEAR_LINKS,{stoneSkinRobe:['rockarmor','rockwall','titanarrival'],devoutCharm:['priestinfuse','priestseal','priestrescue'],steelFocusCharm:['sel_charge','sel_quake','sel_heavy']});
}
function migrateSupportEquipment(t){
 if(t.supportEquipmentRevision===1)return;
 // Previous retirement versions already replaced the cards, so compensate each
 // matching hero in an existing expedition once rather than guessing card origin.
 if(!t.training&&t.phase!=='recruit'){
  const keys=Object.entries(SUPPORT_EQUIPMENT).filter(([,g])=>t.party?.some(p=>p.id===g.owner)).map(([key])=>key);
  if(keys.length){initEquipment(t);for(const key of keys)if(!t.equipment.bag.some(item=>item.key===key))t.equipment.bag.push({uid:t.equipment.nextId++,key});}
 }
 t.supportEquipmentRevision=1;
}
function devoutAuraActive(){return s?.phase==='battle'&&s.party?.some(p=>p.id===4&&p.hp>0)&&hasGearEffect(4,'devoutAura')}
(()=>{
 const interval=heroInterval;
 heroInterval=function(id){const n=interval(id),p=s.party[slotOf(id)];return n/(p?.hp>0&&devoutAuraActive()&&!buffActive(p,'priestHaste')&&!(id===1&&abilityState(1).steady)?1.2:1)};
 const rangerSpeed=rangerSpeedBonus;
 rangerSpeedBonus=function(){return rangerSpeed()*(devoutAuraActive()?1.2:1)};
 const tags=abilityTags;
 abilityTags=function(p){let html=tags(p);if(p.id===2&&hasGearEffect(2,'stoneMantle'))html+='<small class="buff-tag">岩石表皮 · 自身／泰坦減傷 50% · 可閃避</small>';if(p.hp>0&&devoutAuraActive())html+='<small class="buff-tag">虔誠聖印 · 普攻攻速 +20%</small>';if(p.id===5&&hasGearEffect(5,'steelFocus'))html+='<small class="buff-tag">鋼鐵專注 · 蓄力自動護盾 25%</small>';return html};
})();
