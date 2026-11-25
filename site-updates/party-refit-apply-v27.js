const PARTY_REFIT_OLD_ASSETS=new Set(spriteAllAnimations().flatMap(e=>(e.frames||[]).flatMap(f=>[f.asset,...(f.weaponParts||[]).map(p=>p.asset)])));
function partyRefitFrames(name,profile,state){return PARTY_REFIT_V27[name].map((f,i)=>({...f,spriteProfile:profile,spriteAnimation:profile+'/'+state,spriteFrame:i}));}
const partyWar=state=>partyRefitFrames('war-'+({attack:'attack-a',walk:'walk',guard:'guard',hurt:'hurt',fallen:'fallen',cast:'cast',idle:'idle'}[state]||'attack-b'),'kohaku:single',state);
const partyBow=state=>partyRefitFrames('bow-'+({attack:'attack-a',walk:'walk',guard:'guard',hurt:'hurt',fallen:'fallen',idle:'idle'}[state]||'attack-b'),'sou:base',state);
for(const state of ['idle','walk','attack','cast','guard','hurt','fallen']){HERO_FRAME_LAYOUT[0][state]=partyWar(state);if(state!=='cast')HERO_FRAME_LAYOUT[1][state]=partyBow(state);}
HERO_FRAME_LAYOUT[1].cast=SOU_CHANT_FRAMES.map((f,i)=>({...f,rangerChant:false,spriteProfile:'sou:base',spriteAnimation:'sou:base/cast',spriteFrame:i}));
Object.assign(KOHAKU_FRAMES,HERO_FRAME_LAYOUT[0]);souIdleFrames=()=>HERO_FRAME_LAYOUT[1].idle;
SOU_BASIC_ATTACK_FRAMES.splice(0,SOU_BASIC_ATTACK_FRAMES.length,partyBow('attack'),partyRefitFrames('bow-attack-b','sou:base','basic-1'),partyBow('attack'));
WARRIOR_BASIC_ATTACK_FRAMES.single=[partyWar('attack'),partyRefitFrames('war-attack-b','kohaku:single','basic-1')];
for(const key of Object.keys(WARRIOR_ACTION_FRAMES.single))WARRIOR_ACTION_FRAMES.single[key]=key==='guard'?partyWar('guard'):['awaken','empower'].includes(key)?partyWar('cast'):partyRefitFrames(key==='cleave'||key==='spin'?'war-attack-a':'war-attack-b','kohaku:single',key);
BLOOD_RAGE_FRAMES.single=partyWar('cast');WARRIOR_EXECUTION_FRAMES.splice(0,WARRIOR_EXECUTION_FRAMES.length,...partyRefitFrames('war-attack-b','kohaku:single','execution'));KOHAKU_HOMERUN_FRAMES.splice(0,KOHAKU_HOMERUN_FRAMES.length,...partyRefitFrames('war-attack-a','kohaku:single','basic-0'));
for(const key of Object.keys(WARRIOR_EIGHT_FRAMES))WARRIOR_EIGHT_FRAMES[key]=partyRefitFrames(key==='charge'||key.includes('soul')||key.includes('instinct')?'war-cast':key.includes('afterimage')||key.includes('slaughter')?'war-attack-a':'war-attack-b','kohaku:single',key==='charge'?'eight-charge':'eight-'+key);
for(const entry of spriteCatalog()){
 if(entry.profile==='kohaku:single'){const st=entry.state;entry.frames=st.startsWith('eight-')?(WARRIOR_EIGHT_FRAMES[st.slice(6)]||partyWar('cast')):st.startsWith('basic-')?WARRIOR_BASIC_ATTACK_FRAMES.single[Number(st.slice(6))%2]:st==='bloodrage'?BLOOD_RAGE_FRAMES.single:HERO_FRAME_LAYOUT[0][st]||WARRIOR_ACTION_FRAMES.single[st]||partyWar('cast');}
 else if(entry.profile==='sou:base'||entry.profile==='sou:phantom'){if(entry.state!=='chant')entry.frames=entry.state.startsWith('basic-')?SOU_BASIC_ATTACK_FRAMES[Number(entry.state.slice(6))%3]:HERO_FRAME_LAYOUT[1][entry.state]||HERO_FRAME_LAYOUT[1].idle;}
}
if(!spriteEntryIndex.has('sou:base/guard'))registerSpriteAnimation({profile:'sou:base',state:'guard',frames:HERO_FRAME_LAYOUT[1].guard});
for(const [profile,state,name]of [['kohaku:single','refit-heavy','war-attack-b'],['kohaku:single','refit-focus','war-cast'],['sou:base','refit-high','bow-attack-b']])registerSpriteAnimation({profile,state,frames:partyRefitFrames(name,profile,state)});
const PARTY_REFIT_RETIRED_ASSETS=[...PARTY_REFIT_OLD_ASSETS].filter(asset=>asset&&!spriteAllAnimations().some(e=>e.frames?.some(f=>f.asset===asset||f.weaponParts?.some(p=>p.asset===asset))));
const partyRefitGuardBase=heroGuardFrames;heroGuardFrames=function(id){if(id===0)return HERO_FRAME_LAYOUT[0].guard;if(id===1)return HERO_FRAME_LAYOUT[1].guard;return partyRefitGuardBase(id)};

// Native four-cel reactions use their drawn crouch/fall, with no legacy rotation.
const partyRefitSpriteBase=heroSpriteHTML,partyRefitDownAt=new Map();
heroSpriteHTML=function(id,state){
 let html=partyRefitSpriteBase(...arguments);
 if(id!==0&&id!==1)return html;
 if(state==='fallen'){if(!partyRefitDownAt.has(id))partyRefitDownAt.set(id,Date.now());}
 else partyRefitDownAt.delete(id);
 const age=state==='fallen'?Math.max(0,Date.now()-partyRefitDownAt.get(id)):Math.max(0,Date.now()-(sceneMotion?.started??Date.now()));
 return html.replace('class="hero-poses','class="hero-poses party-refit-poses').replace('style="--warrior-pose-duration:','style="--refit-age:-'+age+'ms;--warrior-pose-duration:');
};
// Refresh restored saves after all presentation registries have been replaced.
if(typeof window!=='undefined'&&typeof window.addEventListener==='function')window.addEventListener('DOMContentLoaded',()=>render(),{once:true});
