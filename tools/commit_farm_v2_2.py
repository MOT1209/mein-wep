"""Commit farm game v2.2.0"""
import sys, codecs, os, subprocess

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

base = r'C:\Users\aihmo\alle folder von code'
for f in os.listdir(base):
    fpath = os.path.join(base, f)
    if os.path.isdir(fpath) and os.path.isdir(os.path.join(fpath, 'tools')):
        os.chdir(fpath)
        break

files = [
    'games/farm-game/js/world.js',
    'games/farm-game/version.json',
]

subprocess.run(['git', 'add'] + files)
msg = 'Farm Game v2.2.0 - Water shader + Cloud system'
r = subprocess.run(['git', 'commit', '-m', msg], capture_output=True, text=True)
print(r.stdout[-200:] if r.stdout else '')
if r.stderr:
    print(r.stderr[-200:])

r = subprocess.run(['git', 'push'], capture_output=True, text=True, timeout=60)
print(r.stdout[-300:] if r.stdout else '')
if r.stderr:
    print(r.stderr[-300:])
print('Done')
