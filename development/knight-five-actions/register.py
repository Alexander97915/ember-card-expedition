from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,numpy as np
from scipy import ndimage
import os
REPO=Path(__file__).resolve().parents[2]; ROOT=REPO.parent; SOURCES=Path(os.environ.get('KNIGHT_ACTION_SOURCES',str(ROOT/'generated_images'))); QA=REPO/'development/knight-five-actions/qa';QA.mkdir(parents=True,exist_ok=True)
OUT=REPO/'site-updates/assets/knight-five-actions-v1';OUT.mkdir(parents=True,exist_ok=True)
SHEETS={
'chain':'exec-ca1a8d3e-78d6-436e-84dd-7263ad89a1fb.png',
'retribution':'exec-79b5c66b-dfae-4082-b50a-e6c8dc4305d3.png',
'blood':'exec-96c51889-8dd3-4fd3-88bb-70eaa5c0ed82.png',
'spear':'exec-e2ff6821-cc54-4a33-b426-57d2032a260a.png',
'seal':'exec-52dde630-2c5e-4806-a36b-c84c14e9f793.png'}
for key,name in SHEETS.items():
 im=Image.open(SOURCES/name).convert('RGBA');w,h=im.size
 for i in range(4):
  x0=w*(i%2)//2;y0=h*(i//2)//2;x1=w*(i%2+1)//2;y1=h*(i//2+1)//2
  cel=im.crop((x0,y0,x1,y1));a=np.asarray(cel).copy();rgb=a[:,:,:3].astype(int);alpha=a[:,:,3]
  # Inspect opaque face-color components solely to review landmarks; no image synthesis.
  skin=(rgb[:,:,0]>140)&(rgb[:,:,0]-rgb[:,:,1]>10)&(rgb[:,:,1]-rgb[:,:,2]<36)&(rgb[:,:,1]-rgb[:,:,2]>-8)&(rgb[:,:,0]-rgb[:,:,2]>18)&(alpha>180)
  skin[int(cel.height*.43):]=False
  labels,n=ndimage.label(skin);objs=ndimage.find_objects(labels);cs=[]
  for j,obj in enumerate(objs):
   if obj is None:continue
   count=int((labels[obj]==j+1).sum())
   if count>70:cs.append((count,(obj[1].start,obj[0].start,obj[1].stop,obj[0].stop)))
  print(key,i,cel.size,sorted(cs,reverse=True)[:5])
# Sources stay untouched. Extract authored cels, respecting connected silhouettes
# that extend beyond the nominal quadrant (not a uniform 2x2 rectangle cut).
SHEETS.update({'blood':'exec-96c51889-8dd3-4fd3-88bb-70eaa5c0ed82.png','spear':'exec-e2ff6821-cc54-4a33-b426-57d2032a260a.png','seal':'exec-52dde630-2c5e-4806-a36b-c84c14e9f793.png'})
EYES={
 'chain':[(382,116),(897,156),(393,721),(926,734)],
 'retribution':[(421,186),(985,190),(389,731),(995,789)],
 'blood':[(507,93),(1212,100),(562,642),(1169,658)],
 'spear':[(435,106),(1131,110),(414,613),(1096,627)],
 'seal':[(424,84),(1082,82),(401,591),(1108,607)]}
FEET={
 'chain':[(350,599),(900,609),(350,1181),(930,1181)],
 'retribution':[(350,592),(960,601),(350,1177),(970,1190)],
 'blood':[(510,551),(1230,557),(475,984),(1110,991)],
 'spear':[(400,495),(1190,497),(380,977),(1120,977)],
 'seal':[(440,507),(1110,507),(430,1003),(1100,1002)]}
DENSITY={'chain':.80,'retribution':.80,'blood':.84,'spear':.84,'seal':.88}
registration={};frames={};qa=[]
for key,name in SHEETS.items():
 im=Image.open(SOURCES/name).convert('RGBA');a=np.array(im);alpha=a[:,:,3];labels,n=ndimage.label(alpha>100);sizes=np.bincount(labels.ravel());large=set(np.where(sizes>50000)[0]);large.discard(0);h,w=alpha.shape
 frames[key]=[];registration[key]={'source':name,'sourceSha256':hashlib.sha256((SOURCES/name).read_bytes()).hexdigest(),'sequenceScale':DENSITY[key],'frames':[]}
 for i,(eye,feet) in enumerate(zip(EYES[key],FEET[key])):
  ex,ey=eye;patch=labels[max(0,ey-20):ey+20,max(0,ex-25):ex+25];hist=np.bincount(patch.ravel(),minlength=n+1);hist[0]=0;main=int(hist.argmax());mask=labels==main
  # Two sequences have continuous effect trails linking the bottom cels; split
  # only this joined region between the independently authored body silhouettes.
  if key in ['chain','spear'] and i>=2:
   split=639 if key=='chain' else 735;xx=np.arange(w)[None,:];mask &= xx<split if i==2 else xx>=split
  # Keep detached sparks belonging to this action; never admit another body.
  left=0 if i%2==0 else w//2;right=w//2 if i%2==0 else w;top=0 if i<2 else h//2;bottom=h//2 if i<2 else h
  small=(~np.isin(labels,list(large)))&(labels>0);region=np.zeros_like(mask);region[top:bottom,left:right]=True;mask |= small&region
  # Preserve antialiasing adjacent to the accepted foreground component.
  mask=ndimage.binary_dilation(mask,iterations=2)&(alpha>8)
  yy,xx=np.where(mask);box=(max(0,int(xx.min())-8),max(0,int(yy.min())-8),min(w,int(xx.max())+9),min(h,int(yy.max())+9));x0,y0,x1,y1=box
  part=a[y0:y1,x0:x1].copy();part[:,:,3]=np.where(mask[y0:y1,x0:x1],part[:,:,3],0);part[:,:,3][part[:,:,3]>=245]=255
  # RGB under zero alpha is irrelevant; clear it to improve lossless-alpha coding.
  part[:,:,:3][part[:,:,3]==0]=0
  cel=Image.fromarray(part);file=OUT/(key+'-'+str(i)+'.webp');cel.save(file,'WEBP',quality=94,method=6,exact=True)
  scale=DENSITY[key];sf=[feet[0]-x0,feet[1]-y0];se=[ex-x0,ey-y0];offset=[209-sf[0]*scale,430-sf[1]*scale];cw,ch=cel.size
  anchors={'Feet':[209,430],'Head':[offset[0]+se[0]*scale,offset[1]+se[1]*scale],'Center':[209,250],'HitCenter':[209,250],'MainHand':[260,220],'OffHand':[295,240],'CastOrigin':[300,200],'ProjectileOrigin':[300,200]}
  f={'asset':'assets/knight-five-actions-v1/'+file.name,'source':[cw,ch],'row':[[0,0],[cw,0],[cw,ch],[0,ch]],'column':[[0,0],[cw,0],[cw,ch],[0,ch]],'offset':offset,'scale':scale,'viewBox':[-450,-600,1400,1170],'footAnchor':[209,430],'bodyAnchor':[209,430],'sourceFootAnchor':sf,'eyeAnchor':se,'anchors':anchors,'bodyBounds':[129,15,289,430],'displayBounds':[offset[0],offset[1],offset[0]+cw*scale,offset[1]+ch*scale],'spriteSchemaVersion':1,'headSizeRevision':1,'spriteProfile':'alicia:base','spriteAnimation':'alicia:base/knight-five-'+key,'spriteFrame':i,'sourcePixelsPreserved':True,'registration':'authored-cel-source-density-and-ground','sampling':'smooth','handedness':{'MainHand':'anatomical-right-sword','OffHand':'anatomical-left-shield'},'equipment':'sword-and-shield','anchorConfidence':{'Feet':'reviewed-source-ground','Head':'reviewed-source-eye','MainHand':'authored-effect-region','OffHand':'authored-effect-region'}}
  frames[key].append(f);registration[key]['frames'].append({'path':f['asset'],'crop':list(box),'sourceFeet':list(feet),'sourceEye':list(eye),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'alphaRange':list(cel.getchannel('A').getextrema())});qa.append((key,i,cel,f))
(REPO/'site-updates/knight-five-frames.js').write_text("'use strict';\nconst KNIGHT_FIVE_FRAMES="+json.dumps(frames,separators=(',',':'))+';\n')
(REPO/'development/knight-five-actions/registration.json').write_text(json.dumps(registration,indent=2)+'\n')
# Independent rendered contact review on the same logical ground, not delivery art.
review=Image.new('RGB',(1400,1400),'#263848');d=ImageDraw.Draw(review)
for j,(key,i,cel,f) in enumerate(qa):
 col=i;row=list(SHEETS).index(key);scale=f['scale']*.46;res=cel.resize((round(cel.width*scale),round(cel.height*scale)),Image.Resampling.LANCZOS);x=col*350+175-round(f['sourceFootAnchor'][0]*scale);y=row*280+255-round(f['sourceFootAnchor'][1]*scale);review.paste(res,(x,y),res);d.line((col*350,row*280+255,col*350+350,row*280+255),fill='#78a4aa');d.text((col*350+8,row*280+6),key+' '+str(i),fill='white')
review.save(QA/'knight-five-contact.jpg')
print('Registered',len(qa),'cels;',sum(Path(OUT/e['path'].split('/')[-1]).stat().st_size for k in registration.values() for e in k['frames']),'bytes')
# The sheet's counter cape crossed the neighboring cel. Use the separately
# extracted, fully padded approved counter pose instead of cropping its cloth.
solo=SOURCES/'exec-d3386c8a-17ee-40fe-9c91-3330255fa871.png'
arr=np.array(Image.open(solo).convert('RGBA'));arr[:,:,3][arr[:,:,3]<=8]=0;arr[:,:,3][arr[:,:,3]>=245]=255;arr[:,:,:3][arr[:,:,3]==0]=0
cel=Image.fromarray(arr);file=OUT/'chain-3.webp';cel.save(file,'WEBP',quality=94,method=6,exact=True)
f=frames['chain'][3];scale=.43;feet=[860,990];eye=[855,140];offset=[209-feet[0]*scale,430-feet[1]*scale];cw,ch=cel.size
f.update(source=[cw,ch],row=[[0,0],[cw,0],[cw,ch],[0,ch]],column=[[0,0],[cw,0],[cw,ch],[0,ch]],scale=scale,offset=offset,sourceFootAnchor=feet,eyeAnchor=eye,displayBounds=[offset[0],offset[1],offset[0]+cw*scale,offset[1]+ch*scale]);f['anchors']['Head']=[offset[0]+eye[0]*scale,offset[1]+eye[1]*scale];f['registration']='separately-extracted-complete-counter-source-density-and-ground'
registration['chain']['frames'][3].update(source=solo.name,sourceSha256=hashlib.sha256(solo.read_bytes()).hexdigest(),crop=[0,0,cw,ch],sourceFeet=feet,sourceEye=eye,scale=scale,bytes=file.stat().st_size,sha256=hashlib.sha256(file.read_bytes()).hexdigest(),alphaRange=list(cel.getchannel('A').getextrema()))
(REPO/'site-updates/knight-five-frames.js').write_text("'use strict';\nconst KNIGHT_FIVE_FRAMES="+json.dumps(frames,separators=(',',':'))+';\n')
(REPO/'development/knight-five-actions/registration.json').write_text(json.dumps(registration,indent=2)+'\n')
