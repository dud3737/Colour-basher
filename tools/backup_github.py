"""Backs up the WHOLE project (changelog, code-changes, snapshots, diffs, Android project, web app, tools)
to the `backup` branch of dud3737/Colour-basher as ONE commit. Run after every build.
It never touches `main`, so the live site only changes when tools/deploy_github.py is run.
Usage:  GITHUB_TOKEN=... python3 tools/backup_github.py
View:   https://github.com/dud3737/Colour-basher/tree/backup"""
import base64, hashlib, json, os, pathlib, re, sys, urllib.request, urllib.error
OWNER, REPO, BRANCH = 'dud3737', 'Colour-basher', 'backup'
API = f'https://api.github.com/repos/{OWNER}/{REPO}'
SKIP_DIRS = {'.gradle', 'build', '.idea', '__pycache__'}
root = pathlib.Path(__file__).resolve().parent.parent
token = os.environ.get('GITHUB_TOKEN') or sys.exit('Set GITHUB_TOKEN first.')
def call(method, url, body=None):
    req = urllib.request.Request(API + url, method=method, data=None if body is None else json.dumps(body).encode(),
        headers={'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r: return json.loads(r.read() or b'{}')
def git_sha(d): return hashlib.sha1(b'blob %d\0' % len(d) + d).hexdigest()
files = {}
for p in sorted(root.rglob('*')):
    rel = p.relative_to(root)
    if p.is_file() and not (set(rel.parts[:-1]) & SKIP_DIRS) and rel.name != 'local.properties':
        files[rel.as_posix()] = p.read_bytes()
version = re.search(r"const VERSION='([\d.]+)'", files['app/src/main/assets/index.html'].decode()).group(1)
try:
    head = call('GET', f'/git/ref/heads/{BRANCH}')['object']['sha']
    base_tree = call('GET', f'/git/commits/{head}')['tree']['sha']
    remote = {e['path']: e['sha'] for e in call('GET', f'/git/trees/{base_tree}?recursive=1')['tree'] if e['type'] == 'blob'}
except urllib.error.HTTPError as e:
    if e.code != 404: raise
    head = base_tree = None; remote = {}
changed = [n for n, d in files.items() if remote.get(n) != git_sha(d)]
print(f'Backup of v{version}: {len(changed)} changed file(s) of {len(files)}')
if not changed: sys.exit(0)
tree = [{'path': n, 'mode': '100755' if n == 'gradlew' else '100644', 'type': 'blob',
         'sha': call('POST', '/git/blobs', {'content': base64.b64encode(files[n]).decode(), 'encoding': 'base64'})['sha']} for n in changed]
new_tree = call('POST', '/git/trees', ({'base_tree': base_tree} if base_tree else {}) | {'tree': tree})['sha']
commit = call('POST', '/git/commits', {'message': f'Backup: Colour Basher v{version}', 'tree': new_tree, 'parents': [head] if head else []})['sha']
if head: call('PATCH', f'/git/refs/heads/{BRANCH}', {'sha': commit})
else: call('POST', '/git/refs', {'ref': f'refs/heads/{BRANCH}', 'sha': commit})
print('Backed up as commit', commit[:7], f'-> https://github.com/{OWNER}/{REPO}/tree/{BRANCH}')
