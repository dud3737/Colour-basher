"""Pushes the web app (web/) to GitHub Pages as ONE commit, uploading only files that changed.
Usage:  GITHUB_TOKEN=... python3 tools/deploy_github.py [--dry-run]
The token is read from the environment only - never commit it to the project.
Repo: dud3737/Colour-basher (branch main) -> https://www.colourbasher.co.uk/ (custom domain via web/CNAME)"""
import base64, hashlib, json, os, pathlib, re, sys, time, urllib.request
OWNER, REPO, BRANCH = 'dud3737', 'Colour-basher', 'main'
API = f'https://api.github.com/repos/{OWNER}/{REPO}'
root = pathlib.Path(__file__).resolve().parent.parent
token = os.environ.get('GITHUB_TOKEN') or sys.exit('Set GITHUB_TOKEN first.')
def call(method, url, body=None):
    req = urllib.request.Request(url if url.startswith('http') else API + url, method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r: return json.loads(r.read() or b'{}')
def git_sha(data): return hashlib.sha1(b'blob %d\0' % len(data) + data).hexdigest()
web = root / 'web'
version = re.search(r"const VERSION='([\d.]+)'", (web / 'index.html').read_text(encoding='utf-8')).group(1)
local = {p.relative_to(web).as_posix(): p.read_bytes() for p in sorted(web.rglob('*')) if p.is_file()}   # includes music/
head = call('GET', f'/git/ref/heads/{BRANCH}')['object']['sha']
base_tree = call('GET', f'/git/commits/{head}')['tree']['sha']
remote = {e['path']: e['sha'] for e in call('GET', f'/git/trees/{base_tree}?recursive=1')['tree'] if e['type'] == 'blob'}
changed = [n for n, d in local.items() if remote.get(n) != git_sha(d)]
print(f'v{version}: {len(changed)} changed file(s):', ', '.join(changed) or 'none')
if not changed or '--dry-run' in sys.argv: sys.exit(0)
tree = [{'path': n, 'mode': '100644', 'type': 'blob',
         'sha': call('POST', '/git/blobs', {'content': base64.b64encode(local[n]).decode(), 'encoding': 'base64'})['sha']} for n in changed]
new_tree = call('POST', '/git/trees', {'base_tree': base_tree, 'tree': tree})['sha']
commit = call('POST', '/git/commits', {'message': f'Deploy Colour Basher v{version}', 'tree': new_tree, 'parents': [head]})['sha']
call('PATCH', f'/git/refs/heads/{BRANCH}', {'sha': commit})
print('Pushed commit', commit[:7], '- waiting for GitHub Pages to build...')
for _ in range(40):
    time.sleep(6)
    b = call('GET', '/pages/builds/latest')
    if b.get('commit') == commit and b.get('status') in ('built', 'errored'):
        print('Pages build:', b['status']); break
else: print('Pages build still running - check again shortly.')
