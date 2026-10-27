'use strict';
const vm=require('node:vm'),gameSource=require('./game-source.cjs');
module.exports=function visualWorld(initialStored={},transform=source=>source,options={}){
 let now=0,serial=0;const timers=new Map(),elements={},stored={...initialStored};
 const ctx={console,Math:Object.create(Math),Date:class extends Date{static now(){return now}},
  setTimeout(fn,ms){timers.set(++serial,{fn,at:now+ms});return serial},clearTimeout(id){timers.delete(id)},
  matchMedia(){return {matches:true}},localStorage:{getItem:k=>stored[k]||null,setItem(k,v){stored[k]=v}},
  document:{hidden:false,getElementById(k){return elements[k]??={style:{},innerHTML:'',textContent:'',hidden:false,open:false,dataset:{},showModal(){this.open=true}}},querySelector(){return null}}};
 ctx.Math.random=()=>.99;vm.createContext(ctx);vm.runInContext(transform(options.source??gameSource(options.root)),ctx);
 return {ctx,timers,elements,stored,run:code=>vm.runInContext(code,ctx),clock(ms){now=ms}};
};
