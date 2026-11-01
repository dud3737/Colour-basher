"""Deploys the leaderboard API: pushes server/ + the deploy workflow to the `server` branch as ONE commit;
GitHub Actions then runs the unit tests, applies database migrations, deploys to Cloudflare and smoke-tests it.
Only run on request. Usage: GITHUB_TOKEN=... python3 tools/deploy_server.py
Waits for the run and prints each step's result plus the live API address."""
import base64, json, os, pathlib, sys, time, urllib.request, urllib.error
OWNER, REPO, BRANCH = 'dud3737', 'Colour-basher', 'server'
API = f'https://api.github.com/repos/{OWNER}/{REPO}'
root = pathlib.Path(__file__).resolve().parent.parent
token = os.environ.get('GITHUB_TOKEN') or sys.exit('Set GITHUB_TOKEN first.')
def call(method, url, body=None, auth=True):
    h = {'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json'}
    if auth: h['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url if url.startswith('http') else API + url, method=method, data=None if body is None else json.dumps(body).encode(), headers=h)
    with urllib.request.urlopen(req) as r: return json.loads(r.read() or b'{}')
files = {p.relative_to(root).as_posix(): p.read_bytes() for p in sorted((root / 'server').rglob('*')) if p.is_file() and '.wrangler' not in p.parts and 'node_modules' not in p.parts}
files['.github/workflows/deploy-api.yml'] = (root / '.github/workflows/deploy-api.yml').read_bytes()
tree = [{'path': n, 'mode': '100644', 'type': 'blob', 'sha': call('POST', '/git/blobs', {'content': base64.b64encode(d).decode(), 'encoding': 'base64'})['sha']} for n, d in files.items()]
new_tree = call('POST', '/git/trees', {'tree': tree})['sha']          # full snapshot (no base) = branch holds exactly these files
try: head = call('GET', f'/git/ref/heads/{BRANCH}')['object']['sha']
except urllib.error.HTTPError: head = None
if head and call('GET', f'/git/commits/{head}')['tree']['sha'] == new_tree: sys.exit('Server unchanged - nothing to deploy.')
commit = call('POST', '/git/commits', {'message': 'Deploy leaderboard API', 'tree': new_tree, 'parents': [head] if head else []})['sha']
if head: call('PATCH', f'/git/refs/heads/{BRANCH}', {'sha': commit, 'force': True})
else: call('POST', '/git/refs', {'ref': f'refs/heads/{BRANCH}', 'sha': commit})
print('Pushed', commit[:7], f'({len(files)} files) - waiting for GitHub Actions...')
run = None
for _ in range(90):
    time.sleep(6)
    runs = call('GET', f'{API}/actions/runs?branch={BRANCH}&per_page=5').get('workflow_runs', [])
    run = next((r for r in runs if r['head_sha'] == commit), None)
    if run and run['status'] == 'completed': break
if not run: sys.exit('No workflow run found yet - check the Actions tab.')
jobs = call('GET', f"{API}/actions/runs/{run['id']}/jobs")['jobs']
for j in jobs:
    for s in j['steps']: print(f"  {'OK  ' if s['conclusion'] == 'success' else s['conclusion'] or s['status']:8} {s['name']}")
st = {s['context']: s['description'] for s in call('GET', f'/commits/{commit}/statuses')}
print('Result:', run['conclusion'], '| API:', st.get('leaderboard-api', '(not published)'), '| smoke tests:', st.get('smoke-tests', '-'))
