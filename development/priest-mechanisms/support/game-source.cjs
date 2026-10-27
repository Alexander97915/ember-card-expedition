'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function gameSource(root=process.cwd()){
 return [...fs.readFileSync(path.join(root,'dist/index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)]
  .map(m=>fs.readFileSync(path.join(root,'dist',m[1].split('?')[0]),'utf8')).join('\n');
};
