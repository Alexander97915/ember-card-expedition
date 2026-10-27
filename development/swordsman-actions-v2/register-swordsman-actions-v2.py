"""Register selected sword action sheets at native resolution; no redraw or resampling."""
from pathlib import Path
from PIL import Image
from scipy.ndimage import label,distance_transform_edt
import numpy as np,json,hashlib,shutil,re,sys
R=Path(__file__).resolve().parents[1];S=R/'source-assets/swordsman-actions-v2';D=R/'docs/swordsman-actions-v2';A=R/'dist/assets/swordsman-actions-v2'
for p in [S,D,A]:p.mkdir(parents=True,exist_ok=True)
G=Path(sys.argv[1]) if len(sys.argv)>1 else S
# Landmarks are native source coordinates; scale is fixed per sequence, never frame-fitted.
SPECS={
 'attack':('exec-c4952d05-3321-422e-a679-d6eccac4adef.png',.74,[(310,625),(970,625),(360,1198),(1040,1229)],[(425,160),(1040,185),(470,742),(1042,690)]),
 'walk':('exec-b6a0e8dc-8283-4aa8-bd77-cfb9fc51969a.png',.74,[(435,601),(1040,601),(438,1205),(1043,1205)],[(478,100),(1110,100),(478,700),(1110,700)]),
 'guard':('exec-c7204cbf-5a90-49dd-8c0b-b68c9d2a1693.png',.72,[(420,630),(1048,630),(420,1230),(1048,1230)],[(390,116),(1020,131),(390,724),(1020,724)]),
 'hurt':('exec-6ae32095-3f38-416b-b2cf-921c85eaae91.png',.66,[(415,623),(1040,618),(415,1242),(1040,1246)],[(400,62),(1025,65),(400,723),(1040,685)]),
 'cast':('exec-bb4d4483-a85f-481c-be06-84d644e2d685.png',.80,[(370,618),(1000,615),(350,1185),(1035,1185)],[(348,154),(1037,205),(382,818),(1038,750)]),
 'fallen':('exec-a165205b-d5f9-4ac1-9c18-54907da5879c.png',.66,[(440,654),(1040,654),(410,1205),(1040,1205)],[(430,103),(1100,241),(470,853),(1185,1000)])}
HANDS={
'attack':([(155,165),(1090,335),(565,945),(904,930)],[(550,315),(1050,250),(270,850),(1120,930)]),
'walk':([(260,280),(870,280),(260,890),(870,890)],[(570,215),(1180,215),(570,820),(1180,820)]),
'guard':([(350,250),(1005,265),(350,880),(1000,960)],[(530,215),(1040,205),(530,882),(1100,920)]),
'hurt':([(255,315),(870,315),(230,980),(890,960)],[(460,310),(1120,190),(450,850),(1120,960)]),
'cast':([(385,255),(850,330),(510,860),(955,995)],[(460,200),(1150,335),(220,855),(1150,980)]),
'fallen':([(270,355),(1000,360),(270,995),(1050,1115)],[(485,375),(1110,430),(550,1100),(1210,1100)])}
HEAD_SPAN=dict(attack=65,walk=65,guard=68,hurt=70,cast=60,fallen=70)
framesByState={};entries=[];audit=[]
for state,(filename,scale,feet,eyes) in SPECS.items():
 src=S/(state+'.png');
 if not src.exists():shutil.copy2(G/filename,src)
 a=np.array(Image.open(src).convert('RGBA'));h,w=a.shape[:2]
 labs,_=label(a[:,:,3]>120);sizes=np.bincount(labs.ravel());ids=list(np.argsort(sizes[1:])[-4:]+1);assert min(sizes[k] for k in ids)>50000
 ids.sort(key=lambda k:(np.median(np.where(labs==k)[0])>h/2,np.median(np.where(labs==k)[1])))
 _,near=distance_transform_edt(~np.isin(labs,ids),return_indices=True);owner=labs[tuple(near)]
 soft,_=label(a[:,:,3]>5)
 for sid in np.unique(soft):
  if not sid:continue
  region=soft==sid;members=[k for k in np.unique(labs[region]) if k in ids]
  if len(members)==1:owner[region]=members[0]
 frames=[]
 for i,k in enumerate(ids):
  rgba=a.copy();rgba[:,:,3]=np.where(owner==k,a[:,:,3],0);im=Image.fromarray(rgba);box=im.getchannel('A').getbbox();im=im.crop(box);tile=Image.new('RGBA',(im.width+32,im.height+32));tile.alpha_composite(im,(16,16));tw,th=tile.size
  asset=f'assets/swordsman-actions-v2/{state}-{i}.webp';out=R/'dist'/asset;tile.save(out,'WEBP',lossless=True,method=6)
  b=np.array(Image.open(out).convert('RGBA'));t=np.array(tile);assert np.array_equal(t[:,:,3],b[:,:,3]);assert np.array_equal(t[t[:,:,3]>0],b[t[:,:,3]>0])
  local=lambda p:[p[0]-box[0]+16,p[1]-box[1]+16];foot=local(feet[i]);offset=[209-foot[0]*scale,430-foot[1]*scale];world=lambda p:[offset[j]+local(p)[j]*scale for j in range(2)];head=world(eyes[i]);center=[209,(head[1]+430)/2]
  f=dict(asset=asset,source=[tw,th],row=[[0,0],[tw,0],[tw,th],[0,th]],column=[[0,0],[tw,0],[tw,th],[0,th]],scale=scale,offset=offset,sourceFootAnchor=foot,footAnchor=[209,430],eyeAnchor=local(eyes[i]),viewBox=[-450,-600,1400,1170],spriteSchemaVersion=1,sampling='nearest',spriteProfile='selena:base',spriteAnimation='selena:base/'+state,spriteFrame=i,sourcePixelsPerLogicalUnit=1/scale,sourcePixelsPreserved=True,nativeDimensionsPreserved=True,displayBounds=[*offset,offset[0]+tw*scale,offset[1]+th*scale],bodyBounds=[head[0]-70,head[1]-35,head[0]+70,430],anchors=dict(Feet=[209,430],Head=head,Center=center,HitCenter=center,MainHand=[160,240],OffHand=[270,240],CastOrigin=[300,220],ProjectileOrigin=[300,220]))
  f.update(headSpan=HEAD_SPAN[state],equipment='single-straight-sword-free-hand',anchorConfidence={key:'reviewed-source' for key in ['Feet','Head','MainHand','OffHand']},bakedWeaponReview=dict(sha256=hashlib.sha256(out.read_bytes()).hexdigest(),evidence=f'docs/swordsman-actions-v2/{state}-registered.png',handedness=dict(MainHand='anatomical-right-sword',OffHand='anatomical-left-free-hand')))
  f['anchors'].update(MainHand=world(HANDS[state][0][i]),OffHand=world(HANDS[state][1][i]),CastOrigin=world(HANDS[state][0][i]),ProjectileOrigin=world(HANDS[state][0][i]))
  frames.append(f);entries.append(dict(id=f'swordsman-v2-{state}-{i}',name=f'Selena {state} {i}',path='dist/'+asset,kind='sprite',legacy=False,frames=[dict(region=[0,0,tw,th],scale=scale,offset=offset)]));audit.append(dict(state=state,frame=i,box=box,scale=scale,nativeFoot=feet[i],sha256=hashlib.sha256(out.read_bytes()).hexdigest(),nativeVisibleRGBAPreserved=True))
 framesByState[state]=frames
(R/'dist/swordsman-actions-v2.js').write_text("'use strict';\nconst SWORDSMAN_ACTIONS_V2="+json.dumps(framesByState,separators=(',',':'))+';\n')
(S/'pending-admissions.json').write_text(json.dumps(entries,indent=2)+'\n');(D/'registration.json').write_text(json.dumps(audit,indent=2)+'\n')
print('Registered 24 native lossless action cels in six states')

p=R/'dist/swordsman-frames-v1.js';idle=json.loads(re.search(r'const SWORDSMAN_IDLE_V1=(.*);',p.read_text())[1])
for f in idle:
 f.update(equipment='single-straight-sword-free-hand',anchorConfidence={key:'reviewed-source' for key in ['Feet','Head','MainHand','OffHand']},bakedWeaponReview=dict(sha256=hashlib.sha256((R/'dist'/f['asset']).read_bytes()).hexdigest(),evidence='docs/swordsman-actions-v2/idle-registered.png',handedness=dict(MainHand='anatomical-right-sword',OffHand='anatomical-left-free-hand')))
p.write_text("'use strict';\nconst SWORDSMAN_IDLE_V1="+json.dumps(idle,separators=(',',':'))+';\n')
