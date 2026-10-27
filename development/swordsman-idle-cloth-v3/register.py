"""Replace two clipped idle cels with restored native-density art, retaining 0/2."""
from pathlib import Path
from PIL import Image
import numpy as np,json,re,hashlib,copy,shutil
R=Path(__file__).resolve().parents[1];S=R/'source-assets/swordsman-idle-cloth-v3';D=R/'docs/swordsman-idle-cloth-v3';A=R/'dist/assets/swordsman-idle-cloth-v3'
for p in [S,D,A]:p.mkdir(parents=True,exist_ok=True)
p=R/'dist/swordsman-frames-v1.js';frames=json.loads(re.search(r'const SWORDSMAN_IDLE_V1=(.*);',(S/'reference-frames.js').read_text())[1]);entries=[];audit=[]
G=S
specs={1:('idle-1.png',(710,130),1192,(435,555),(865,610)),3:('idle-3.png',(654,132),1156,(382,520),(812,595))}
for i,(name,eye,ground,main,off) in specs.items():
 old=copy.deepcopy(frames[i]);src=S/f'idle-{i}.png';im=Image.open(src).convert('RGBA');tile=Image.new('RGBA',(im.width+32,im.height+32));tile.alpha_composite(im,(16,16));tw,th=tile.size
 # Preserve the previous eye-to-floor height and the horizontal eye/feet relationship.
 height=(old['sourceFootAnchor'][1]-old['eyeAnchor'][1])*old['scale'];scale=height/(ground-eye[1]);footx=eye[0]-(old['anchors']['Head'][0]-209)/scale
 local=lambda q:[q[0]+16,q[1]+16];foot=local((footx,ground));offset=[209-foot[0]*scale,430-foot[1]*scale];world=lambda q:[offset[z]+local(q)[z]*scale for z in range(2)]
 asset=f'assets/swordsman-idle-cloth-v3/idle-{i}.webp';out=R/'dist'/asset;tile.save(out,'WEBP',lossless=True,method=6);a=np.array(tile);b=np.array(Image.open(out).convert('RGBA'));assert np.array_equal(a[:,:,3],b[:,:,3]);assert np.array_equal(a[a[:,:,3]>0],b[a[:,:,3]>0]);assert not np.any(b[:16,:,3]) and not np.any(b[-16:,:,3]) and not np.any(b[:,:16,3]) and not np.any(b[:,-16:,3])
 digest=hashlib.sha256(out.read_bytes()).hexdigest();head=world(eye);center=[209,(head[1]+430)/2]
 f=copy.deepcopy(old);f.update(asset=asset,source=[tw,th],row=[[0,0],[tw,0],[tw,th],[0,th]],column=[[0,0],[tw,0],[tw,th],[0,th]],scale=scale,offset=offset,sourceFootAnchor=foot,sourceBodyAnchor=foot,eyeAnchor=local(eye),headSpan=old['headSpan']*old['scale']/scale,sourcePixelsPerLogicalUnit=1/scale,displayBounds=[*offset,offset[0]+tw*scale,offset[1]+th*scale],bodyBounds=[head[0]-65,head[1]-30,head[0]+65,430],anchors=dict(Feet=[209,430],Head=head,Center=center,HitCenter=center,MainHand=world(main),OffHand=world(off),CastOrigin=world(main),ProjectileOrigin=world(main)),sourcePixelsPreserved=True,nativeDimensionsPreserved=True,sourceDensityCalibration=dict(referenceAsset=old['asset'],referenceSha256=hashlib.sha256((R/'dist'/old['asset']).read_bytes()).hexdigest(),eyeGroundHeight=height,scope='Reviewed eye/ground density reference, not anatomy certification'),bakedWeaponReview=dict(sha256=digest,evidence='docs/swordsman-idle-cloth-v3/registered.png',handedness=old['bakedWeaponReview']['handedness']))
 frames[i]=f;entries.append(dict(id=f'swordsman-idle-cloth-v3-{i}',name=f'Selena restored idle cloth {i}',path='dist/'+asset,kind='sprite',legacy=False,frames=[dict(region=[0,0,tw,th],offset=offset,scale=scale)]));audit.append(dict(frame=i,source=src.name,sourceSha256=hashlib.sha256(src.read_bytes()).hexdigest(),assetSha256=digest,nativeSize=list(im.size),canvasPadding=16,sourcePixelsPreserved=True,reference=old['asset'],referenceHeight=height,height=(ground-eye[1])*scale,eye=list(eye),ground=ground,scale=scale))
p.write_text("'use strict';\nconst SWORDSMAN_IDLE_V1="+json.dumps(frames,separators=(',',':'))+';\n');(S/'pending-admissions.json').write_text(json.dumps(entries,indent=2)+'\n');(D/'registration.json').write_text(json.dumps(audit,indent=2)+'\n')
print('Repaired idle cels 1 and 3, with intact 0/2 retained and matched eye-ground height')
