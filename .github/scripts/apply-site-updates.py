"""Apply checksum-bound runtime updates over the pinned, verified release."""
from pathlib import Path,PurePosixPath
import hashlib,json,re,shutil
root=Path.cwd();manifest_path=root/'site-updates-manifest.json'
if not manifest_path.exists():
 print('No site updates selected');raise SystemExit(0)
manifest=json.loads(manifest_path.read_text());base=json.loads((root/'deployment.json').read_text())
assert manifest['baseRelease']==base['release'] and manifest['baseSha256']==base['sha256'],'Update base mismatch'
source=root/'site-updates';site=root/'site';seen=set();pending=[]
for entry in manifest['files']:
 name=entry['path'];rel=PurePosixPath(name)
 assert not rel.is_absolute() and '..' not in rel.parts and rel.as_posix()==name and name not in seen,'Unsafe/duplicate update path'
 seen.add(name);src=source/name;dest=site/name
 assert src.is_file() and not src.is_symlink() and src.resolve().is_relative_to(source.resolve()),'Invalid update source'
 data=src.read_bytes();assert len(data)==entry['bytes'] and hashlib.sha256(data).hexdigest()==entry['sha256'],'Update checksum mismatch: '+name
 assert dest.resolve().is_relative_to(site.resolve()),'Unsafe destination'
 pending.append((src,dest))
for src,dest in pending:
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
for name in manifest.get('removedFiles',[]):
 rel=PurePosixPath(name)
 assert not rel.is_absolute() and '..' not in rel.parts and rel.as_posix()==name and name not in seen,'Unsafe removal path'
 dest=site/name
 assert dest.resolve().is_relative_to(site.resolve()),'Unsafe removal destination'
 if dest.exists():
  assert dest.is_file() and not dest.is_symlink(),'Invalid retired file'
  dest.unlink()
bundle=manifest.get('stylesheetBundle')
if bundle:
 def stylesheet_path(name):
  assert re.fullmatch(r'[a-z0-9-]+\.css',name), 'Stylesheets must share the site root'
  return site/name
 sources=bundle['sources'];target=stylesheet_path(bundle['path'])
 assert len(sources)==len(set(sources)) and target.name not in sources and target.name not in seen, 'Invalid stylesheet order or destination'
 css=[]
 for name in sources:
  content=stylesheet_path(name).read_bytes()
  assert not re.search(rb'@(?:import|charset|namespace)\b',content,re.I), 'Stylesheet requires standalone loading: '+name
  css.append(content)
 payload=b'\n'.join(css)
 assert len(payload)==bundle['bytes'] and hashlib.sha256(payload).hexdigest()==bundle['sha256'], 'Stylesheet bundle checksum mismatch'
 target.write_bytes(payload)
files=[p for p in site.rglob('*') if p.is_file()]
assert len(files)==manifest['siteFileCount'],'Updated file count mismatch'
assert sum(p.stat().st_size for p in files)==manifest['siteBytes'],'Updated site size mismatch'
assert manifest['siteBytes']<1024*1024*1024,'Pages output exceeds 1 GiB'
print('Verified',len(pending),'updates;',len(files),'site files; seven swordswoman actions')
