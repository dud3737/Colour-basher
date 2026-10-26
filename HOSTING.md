# Sharing Colour Basher as a web app

The `web/` folder (also supplied as `ColourBasher-web-vX.Y.Z.zip`) is a complete, installable web app:

| File | What it is |
|---|---|
| `index.html` | The game, plus the tags that make it installable |
| `manifest.webmanifest` | App name, icon, colours, full-screen and portrait settings |
| `sw.js` | Service worker: lets the game work offline after the first visit |
| `icon-*.png`, `apple-touch-icon.png`, `favicon-32.png` | Home-screen and browser icons |

Upload **all** these files together, at the top level of the site. Any host works as long as it uses **https**; all the free ones below do.

---

## Live site

The game is hosted on GitHub Pages at **https://www.colourbasher.co.uk/** (repository `dud3737/Colour-basher`, branch `main`). The old address, https://dud3737.github.io/Colour-basher/, and the bare domain colourbasher.co.uk both redirect there.

**Custom domain set-up (Oct 2026):**
- DNS: `www` CNAME → `dud3737.github.io`; `@` A records → 185.199.108.153, .109.153, .110.153 and .111.153.
- The domain is verified on the GitHub account.
- `tools/build_web.py` writes `web/CNAME` (`www.colourbasher.co.uk`), which sets the custom domain on every deploy. Don't delete it.
- HTTPS is enforced in repo Settings → Pages.
- Saved records and settings are stored per address, so players start fresh on the new domain and need to re-add the home-screen app from it. New builds are pushed with `tools/deploy_github.py`, using a fine-grained token limited to that repository. The whole project (changelog, code-changes, version snapshots and diffs, Android project, tools) is backed up after every build to the **`backup` branch**: https://github.com/dud3737/Colour-basher/tree/backup. On GitHub, switch the branch selector from `main` to `backup` to browse it. Revoke the token at https://github.com/settings/personal-access-tokens when it's no longer needed.

## Option 1: Netlify Drop (easiest, needs a computer)

1. Unzip `ColourBasher-web-vX.Y.Z.zip`.
2. Go to **app.netlify.com/drop** and drag the unzipped folder onto the page.
3. You get a link straight away. Create a free Netlify account when prompted so the site stays live. Without an account, Netlify only keeps it for a short time.
4. Optional: in Site configuration, rename the site so the link becomes e.g. `colour-basher.netlify.app`.

**To update later:** open the site in Netlify → Deploys, then drag the new unzipped folder onto the deploy area.

## Option 2: GitHub Pages (works from a phone)

1. Create a free account at github.com and a new **public** repository, e.g. `colour-basher`.
2. In the repository: **Add file → Upload files**. Select every file from the unzipped web folder, then press **Commit changes**.
3. Go to **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/colour-basher/`.

**To update later:** upload the new files the same way. GitHub replaces files with the same name.

## Option 3: Cloudflare Pages

dash.cloudflare.com → Workers & Pages → Create → Pages → **Upload assets**, then upload the folder. You get a free `*.pages.dev` link.

---

## What players do

- **Android (Chrome):** open the link, tap **⋮ → Install app** (or **Add to Home screen**). The game gets its own icon and opens full screen. Vibration works.
- **iPhone (Safari):** open the link, tap **Share → Add to Home Screen**. Everything works except vibration, which Safari doesn't support. Sound may be muted when the silent switch is on.
- **Any browser:** they can also just play from the link.

After the first visit the game works **offline**. Records and scores are stored on each player's own device.

## How updates reach players

Each build stamps its version into `sw.js`. When you upload a new version, players get it the next time they open or refresh the game while online. A game that's already open refreshes itself once when it's back on the home screen (never mid-level). The version number on the home screen shows which build they're running.

## Building the web folder (for each release)

From the project root:

```
python3 tools/build_web.py      # copies the game into web/ and regenerates manifest + sw.js
python3 tools/make_icons.py     # only if the icon design changes (needs Playwright)
```
