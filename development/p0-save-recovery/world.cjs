'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function world(stored={},options={}){
 const root=options.root||process.env.EMBER_TEST_DIST||'dist';let now=0,id=0;const timers=new Map(),elements={},events={},writes=[];
 const element=k=>elements[k]??={style:{},innerHTML:'',textContent:'',hidden:false,open:false,dataset:{},showModal(){this.open=true},close(){this.open=false}};
 const ctx={console,Math:Object.create(Math),Date:class extends Date{static now(){return now}},setTimeout(fn,ms){timers.set(++id,{fn,at:now+ms});return id},clearTimeout(i){timers.delete(i)},matchMedia(){return {matches:true}},addEventListener(k,fn){events[k]=fn},localStorage:{getItem(k){if(options.failRead?.(k))throw Error('storage denied');return stored[k]??null},setItem(k,v){if(options.failWrite?.(k))throw Error('quota exceeded');stored[k]=v;writes.push(k)}},document:{hidden:false,getElementById:element,querySelector(selector){if(selector==='.selena-poses')return null;return {close(){element('modal').close()}}}}};
 ctx.Math.random=()=>.99;vm.createContext(ctx);
 const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
 for(const file of files){if(file==='game.js'&&options.beforeGame)vm.runInContext(options.beforeGame,ctx);vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});}
 return {ctx,stored,options,writes,elements,events,run(c){return vm.runInContext(c,ctx)},advance(ms){now+=ms}};
}
module.exports={world};
