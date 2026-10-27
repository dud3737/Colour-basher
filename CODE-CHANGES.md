# Code changes by version

The technical record behind `CHANGELOG.md`.

- **Game code:** `app/src/main/assets/index.html` (identical to the standalone `colour-basher.html`).
- **Android wrapper:** `app/src/main/java/com/colourbasher/game/MainActivity.java` and `app/build.gradle.kts`.
- **Snapshots:** from 1.2.1 onwards, each release's full game file is kept in `versions/`.
- **Diffs:** exact line-by-line diffs between releases are in `versions/diffs/`.

Releases before 1.2.1 weren't snapshotted separately, so their entries below list every changed function, style and setting rather than exact diffs.

## Release checklist (every build)

1. Bump `VERSION` near the top of the script in `index.html`, then run `python3 tools/make_fonts.py <game file>`. This re-embeds the font subsets, picking up any new characters (always safe to run).
2. Bump `versionName` to match and increase `versionCode` by 1 in `app/build.gradle.kts`.
3. Test in a headless browser. Use Settings → Debug to jump straight to the affected level or bonus round and set the starting lives. Play through normally from level 1 when the change affects progression (level → bonus → level) or lives carried between levels. Compare against the previous version when fixing a bug.
4. Add an entry to `CHANGELOG.md` (player-facing) and to this file (technical, including what was tested).
5. Save the new game file as `versions/colour-basher-X.Y.Z.html`.
6. Generate the diff:
   `diff -u versions/colour-basher-OLD.html versions/colour-basher-NEW.html > versions/diffs/OLD-to-NEW.diff`
7. Copy the game file to `app/src/main/assets/index.html`, then run `python3 tools/build_web.py` to rebuild the web app in `web/`. Rebuild the Android APK if needed.
8. **Back up (every build):** `GITHUB_TOKEN=<token> python3 tools/backup_github.py` saves the whole project (changelog, code-changes, snapshots, diffs, Android project, web app, tools) to the `backup` branch of `dud3737/Colour-basher` as one commit. It never touches the live site.
9. **Deploy (only when Jamie says so):** `GITHUB_TOKEN=<token> python3 tools/deploy_github.py` pushes the changed `web/` files as one commit to `main` and waits for the GitHub Pages build. Check that https://www.colourbasher.co.uk/ shows the new version. The token is never stored in the project.
10. **Hand over** `CHANGELOG.md` and `CODE-CHANGES.md`, and update the published Claude page. The versioned HTML, `ColourBasher-android-vX.Y.Z.zip` and `ColourBasher-web-vX.Y.Z.zip` are only made on request.

---

## 2.0.6 – 2026-10-27 (BETA)

Exact diff: `versions/diffs/2.0.5-to-2.0.6.diff`

| Area | Where | Change |
|---|---|---|
| Assets | `music/*.mp3` | Loudness-matched to **−18 LUFS** (EBU R128 integrated loudness). Made from the original uploads (51, Basher and Roswell at 320 kbps; Koto from the artist's edit with the same 2.6 s head trim and 0.5 s end fade) as `volume=<gain>dB, alimiter=limit=0.891 (−1 dBFS) : attack 5 ms : release 50 ms`, then 128 kbps CBR, 44.1 kHz, metadata stripped. Pure gain, no compression; the limiter only catches stray peaks. |
| JS | `Music.tracks` | Cache-busting versions bumped: `51?v=2`, `basher?v=2`, `koto?v=3`, `roswell?v=2`. |
| Tools | `tools/make_fonts.py` | `TTFont(..., recalcTimestamp=False)`, so the embedded fonts are byte-identical on every run. Previously a fresh timestamp changed the font data each time, which made diffs noisy. The font data was re-embedded once in this release; the character set is unchanged (117). |
| JS | `VERSION` | `'2.0.5'` → `'2.0.6'` |
| Android | `app/build.gradle.kts` | `versionCode` 33 → 34, `versionName` "2.0.5-beta" → "2.0.6-beta". |

**Loudness measurements:**

| Track | Before | Gain | Samples limited | After | True peak |
|---|---|---|---|---|---|
| 51 | −13.11 LUFS | −5.33 dB | 0% | −18.44 LUFS | −5.0 dBTP |
| Basher | −23.33 LUFS | +4.90 dB | 0.001% | −18.44 LUFS | −0.7 dBTP |
| Roswell | −21.68 LUFS | +3.22 dB | 0.26% | −18.51 LUFS | −0.6 dBTP |
| Koto | −15.02 LUFS | −3.40 dB | 0.003% | −18.42 LUFS | −3.5 dBTP |

The spread between tracks went from **10.2 LU to 0.09 LU**. Durations are unchanged, and dynamic range (LRA) is unchanged within 0.1 LU, confirming no compression. The 0.4 LU offset from −18 comes from the MP3 encoder and applies equally to all four tracks.

**Tested** in a headless browser (web build, served locally): the game loaded all four new addresses, fully buffered with the expected durations (96.7 s, 151.6 s, 103.0 s, 162.0 s), and with no policy violations.

---

## 2.0.5 – 2026-10-27 (BETA)

Exact diff: `versions/diffs/2.0.4-to-2.0.5.diff`

| Area | Where | Change |
|---|---|---|
| Assets | `music/koto.mp3` | Replaced with the artist's shorter edit (`Koto (2).mp3`, 1:45.6, 128 kbps). Source analysis: 2.6 s of digital silence at the start; it ends at about −41 dBFS with no fade or trailing silence. The new file is `ffmpeg -ss 2.60`, with `afade=out` over the final 0.5 s (anti-click safety), then 128 kbps CBR, 44.1 kHz, metadata stripped. Result: 103.0 s, 1.6 MB, loudness −15.3 dBFS. (An earlier, unreleased cut of the previous upload, ending at 106 s with a 2 s fade, was superseded before going live.) |
| JS | `Music.tracks` | `music/koto.mp3` → `music/koto.mp3?v=2`, which forces a fresh download past browser caches. Bump the `?v=` number whenever a track file is replaced. |
| JS | `VERSION` | `'2.0.4'` → `'2.0.5'` |
| Android | `app/build.gradle.kts` | `versionCode` 32 → 33, `versionName` "2.0.4-beta" → "2.0.5-beta". |

**Tested** in a headless browser (web build, served locally): the game loaded `music/koto.mp3?v=2` with duration 103.0 s, fully buffered, with no policy violations. The new file measured −34 dB in the first half-second (straight into the music) and about −40 dB to −46 dB across the last 3 seconds. Those last 3 seconds are faded out by the game's crossfade anyway.

Loudness of the four tracks, for reference: 51 −12.1, Koto −15.3, Roswell −20.1 and Basher −23.9 dBFS. Basher is noticeably quieter than 51; levelling them out would be a separate change.

---

## 2.0.4 – 2026-10-26 (BETA)

Exact diff: `versions/diffs/2.0.3-to-2.0.4.diff`

| Area | Where | Change |
|---|---|---|
| HTML | `.tips` (home screen) | Fourth line: `<b style="color:#e0399f">✨ Clear a level</b> – tap MOTIVATION for an inspiring message!` (pink to match the Motivation button). |
| CSS | Font block | Re-run of `tools/make_fonts.py` (117 characters, adding ✨; the emoji itself still shows in the phone's emoji font). |
| JS | `VERSION` | `'2.0.3'` → `'2.0.4'` |
| Android | `app/build.gradle.kts` | `versionCode` 31 → 32, `versionName` "2.0.3-beta" → "2.0.4-beta". |

**Tested** in a headless browser: the new line shows as the last tip, and the taller tips box still clears the version label with the logo fully on screen at 390×780, 375×667 (iPhone SE size) and 360×640.

---

## 2.0.3 – 2026-10-26 (BETA)

Exact diff: `versions/diffs/2.0.2-to-2.0.3.diff` (large, because it contains the embedded font data)

| Area | Where | Change |
|---|---|---|
| HTML | `<head>` | Removed the Google Fonts `preconnect` and stylesheet links. |
| CSS | `/*FONTS:BEGIN*/ … /*FONTS:END*/` | Two `@font-face` rules with WOFF2 subsets as `data:` URIs: Dela Gothic One 400 (12.6 KB) and M PLUS Rounded 1c 800 (11.1 KB), each covering 116 characters. The family names are unchanged, so no other CSS changed. Copyright and licence notices are kept in the CSS comment and in the fonts' name records. |
| Tools | `tools/make_fonts.py` | **New.** Subsets `tools/fonts/*.ttf` to printable ASCII plus every non-ASCII character in the game file (emoji excluded), then writes or replaces the block between the markers. Re-run whenever text with new characters is added (now step 1 of the checklist). |
| Tools | `tools/fonts/` | **New.** Source TTFs (from google/fonts on GitHub) and `FONTS-LICENSE.txt` (SIL OFL 1.1; no Reserved Font Names, so subsetting is permitted). |
| Web | `tools/build_web.py` → `web/index.html` | **New** Content-Security-Policy meta tag (web build only; the Claude viewer and Android WebView set their own rules): `default-src 'self'`, `script-src 'self' 'sha256-<hash of the single inline script>'` (computed at build time, so a changed or injected script won't run), `style-src 'self' 'unsafe-inline'` (inline style attributes), `font-src 'self' data:`, `img-src 'self' data:`, `media-src 'self'`, `connect-src 'self'`, `worker-src 'self'`, `manifest-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`. The build fails if the page ever has more than one inline script. |
| JS | `VERSION` | `'2.0.2'` → `'2.0.3'` |
| Android | `app/build.gradle.kts` | `versionCode` 30 → 31, `versionName` "2.0.2-beta" → "2.0.3-beta". |

**Tested** in a headless browser with the web build served locally:
- **Fonts:** both embedded fonts reported `loaded`, in the web build and in the standalone file (Claude page / Android).
- **Full session:** unlocking debug, playing and clearing a level, Motivation, Records, music playing (`media-src`), service worker active, and an offline reload, with **zero policy violations** and **no requests to any other website**.
- **Negative test:** a deliberately injected script from cdn.jsdelivr.net was **blocked** by the policy.

Side note: earlier test screenshots used fallback fonts, because the test environment couldn't reach Google Fonts. From 2.0.3 they show the real fonts.

---

## 2.0.2 – 2026-10-26 (BETA)

Exact diff: `versions/diffs/2.0.1-to-2.0.2.diff`

**Cause (iPhone):** WebKit only lets an `<audio>` element start playing if that element was first played during a tap. Up to 2.0.1, every track change created a brand-new `Audio` element from a timer (`timeupdate`), not a tap. iOS refused to play it, so the music stopped until the next tap restarted it. Tearing down the old element (`removeAttribute('src')` + `load()`) while a new one was blocked could also interrupt the shared audio session, which is likely why sound effects dropped out briefly too.

| Area | Where | Change |
|---|---|---|
| JS | `Music` (rewritten player) | **Two persistent decks** (`Music.decks`), created once in `setup()` and wired through Web Audio once. Track changes swap which deck plays, and the faded-out deck is paused and reloaded with the track after next. No elements are created or destroyed after start-up. |
| JS | `Music.ensure()` | **New**, runs inside every tap (`kick` / `prime`). Creates the decks, gives each a track, and **unlocks** the idle deck by calling `play()` during the tap, then pausing it. Later timer-driven track changes are then allowed on iOS. |
| JS | `Music.setup()` | Adds an `AudioContext` `statechange` watcher: if the engine leaves "running" while the page is visible (an iOS interruption), it calls `resume()`. |
| JS | `timeupdate` / `ended` handlers | Only change tracks while music is on. If a track ends while music is off, it's paused and a fresh track is loaded for later. |
| JS | `Music.suspend()`, `setVol()`, `tick()` | Work on the decks. Suspend pauses both decks and resets a deck that was fading out. |
| JS | `VERSION` | `'2.0.1'` → `'2.0.2'` |
| Android | `app/build.gradle.kts` | `versionCode` 29 → 30, `versionName` "2.0.1-beta" → "2.0.2-beta". |

**Tested** in a headless browser with 9-second test clips (a track change every ~6 s):
- **iPhone rule simulated:** `play()` rejects for any element not first played inside a tap.
  - **2.0.1:** the first track change was blocked and music was **silent for 26 of 36** half-second samples, reproducing the bug.
  - **2.0.2:** **0 blocked, 0 silent** over 18 s, with all four tracks crossfading in turn and only 2 audio elements ever created.
- **Web Audio path** (http, as on the live site) with the iPhone rule: still playing after 16 s, nothing blocked.
- **Music OFF/ON** pressed at 3 s, 5 s and mid-crossfade (6.5 s): everything went quiet (a crossfade finished its fade-out first), no track change happened while off, and ON was audible for 8 s in all three cases.
- **Regression:** crossfades, the volume slider, and pause-on-hide with resume on tap all still worked.

Real iPhone confirmation is still needed: the simulation reproduces WebKit's play rule, but not the audio-session behaviour.

---

## 2.0.1 – 2026-10-26 (BETA)

Exact diff: `versions/diffs/2.0.0-to-2.0.1.diff`

| Area | Where | Change |
|---|---|---|
| JS | `Music.allowed` | **New** flag: false until the first game starts. `kick()` (called on every tap) only starts music once it's allowed; it still resumes music that was suspended. |
| JS | `Music.prime()` | **New.** Called from the New Game tap and the debug PLAY LEVEL / PLAY BONUS taps. Sets `allowed`, then, if music is on and nothing is playing, creates the first track and calls `play()` at level 0 inside the tap, which satisfies the browsers' autoplay rules. Sets `primed`. |
| JS | `Music.go()` | **New.** Called by `countdown()` when "3" appears (`INTRO_MS + 100` after the tap). If primed, fades the track in over 1.5 s. |
| JS | `Music.play()` | Fades to 0 instead of 1 while primed, so a track change during priming stays silent. |
| JS | `Music.make()` | Calls `apply(p)` straight away, so every new player starts at level 0. Previously, on the `file://` path (Android), `audio.volume` defaulted to 1 until the first fade tick. |
| JS | `VERSION` | `'2.0.0'` → `'2.0.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 28 → 29, `versionName` "2.0.0-beta" → "2.0.1-beta". |

**Tested** in a headless browser on the `file://` path, with a frame-by-frame probe:
- **Home-screen taps:** opening Settings, toggling Music, opening Records and tapping 🔊 created **0** audio players.
- **New Game:** created one track playing at volume 0.
- **Timeline:** "3" at 2.25 s, the fade starting at 2.30 s and reaching 0.24 (of the 25% default) by 3.70 s, then GO at 4.20 s.
- **Afterwards:** quitting to the home screen kept the music playing; a second New Game didn't restart it.
- **Regression check (9 s test clips):** crossfades, shuffle order with no back-to-back repeat, the volume slider, ON/OFF, and pausing when hidden with resume on the next tap all still worked.

---

## 2.0.0 – 2026-10-26 (BETA)

Exact diff: `versions/diffs/1.9.1-to-2.0.0.diff`

| Area | Where | Change |
|---|---|---|
| JS | `buildTitle()` | The subtitle is now in a `.kanarow` with a `.beta` badge beside it. Putting it inline, rather than over the logo, avoids clashing with the 🔊 button on short screens. |
| CSS | `.kanarow`, `.beta`, `@keyframes betabob` | Pink tilted BETA sticker with a gentle bob. |
| HTML | Home menu | **New** `<a id="supportBtn" class="btn pink support" href="https://ko-fi.com/dreamback37" target="_blank" rel="noopener noreferrer">` with the game's heart icon (white). |
| CSS | `a.btn`, `.btn.support` | Lets a link use the button style (flex-centred, no underline); support button slightly smaller. |
| JS | `MOTIVATION` | +5 messages (13 in total). |
| Android | `MainActivity.java` | `shouldOverrideUrlLoading`: http(s) links now open in the phone's browser via `Intent.ACTION_VIEW`, and the WebView still never navigates away. Previously every link was blocked. |
| JS | `VERSION` | `'1.9.1'` → `'2.0.0'` |
| Android | `app/build.gradle.kts` | `versionCode` 27 → 28, `versionName` "1.9.1" → "2.0.0-beta". |

**Tested** in a headless browser:
- **Home screen:** at 390×780 and a small 360×640, the BETA badge was visible and the logo, menu and version label all fitted on screen without overlapping. A first attempt that placed the badge on the logo collided with the 🔊 button on the small screen, so it was moved beside the subtitle.
- **Support link:** points to https://ko-fi.com/dreamback37 with `target="_blank"` and `rel="noopener noreferrer"`. Tapping it opened a new tab and left the game tab in place. The test environment can't reach Ko-fi itself, so the page didn't load there.
- **Messages:** 200 Motivation rolls showed all 13 messages, including all 5 new ones.

---

## Hosting – 2026-10-26 (no new game version)

| Area | Where | Change |
|---|---|---|
| Hosting | Custom domain | The live site moved to **https://www.colourbasher.co.uk/**. DNS: `www` CNAME → `dud3737.github.io`, plus `@` A records to GitHub Pages' four IPs, so the bare domain redirects to www. GitHub reported the certificate as `approved`. |
| Tools | `tools/build_web.py` | Writes `web/CNAME` containing `www.colourbasher.co.uk`. For branch-published Pages sites this file sets the custom domain; it was used because the deploy token has Contents permission but not Pages. |
| Docs | `HOSTING.md`, checklist, `deploy_github.py` docstring | Live URL updated. |

Note: the game code needed no changes, because all paths (manifest, service worker, music, icons) are relative.

---

## 1.9.1 – 2026-10-26

Exact diff: `versions/diffs/1.9.0-to-1.9.1.diff`

| Area | Where | Change |
|---|---|---|
| JS | `Music.vol` default | `store.get('cb_musicVol', .6)` → `.25`. A stored `cb_musicVol` still wins. Placeholder labels changed from 60% to 25%. |
| HTML | Pause overlay | Removed the `#soundBtn2` icon button. Added a "Sound effects" row (`#pauseSound`, ON/OFF) after the volume row and before `#resumeBtn`. |
| JS | `syncSound()` + sound listeners | The home 🔊 (`#soundBtn`) shows the emoji; `#setSound` and `#pauseSound` show ON/OFF. All three toggle the same `Snd.muted` / `cb_muted`. |
| JS | `VERSION` | `'1.9.0'` → `'1.9.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 26 → 27, `versionName` "1.9.0" → "1.9.1". |

**Tested** in a headless browser:
- **Fresh player:** Settings showed 25%, and the music bus gain was 0.25 once playing.
- **Pause panel order:** title, info, Music, Volume, Sound effects, Resume.
- **Sound effects toggle in Pause:** pause showed OFF, Settings showed OFF, the home icon showed 🔇, and `cb_muted` was saved as true.

---

## 1.9.0 – 2026-10-26

Exact diff (game file): `versions/diffs/1.8.2-to-1.9.0.diff`

| Area | Where | Change |
|---|---|---|
| Assets | `app/src/main/assets/music/` | **New.** `51.mp3`, `basher.mp3`, `koto.mp3` and `roswell.mp3`, re-encoded from the supplied 320 kbps files to 128 kbps CBR, 44.1 kHz stereo, metadata stripped (23 MB → 8.8 MB). Lengths: 1:37, 2:32, 2:45 and 2:42. This is the single source; `tools/build_web.py` copies it to `web/music/`. |
| JS | `Music` | **New** player. Shuffled queue (each track once per round, no back-to-back repeat). Two `<audio>` players overlap for a 3 s crossfade, triggered by `timeupdate` when 3 s remain, with `ended` and `error` as fallbacks. Fades run on a 50 ms ticker over per-player levels. On http(s) each player goes through `createMediaElementSource → GainNode → music bus GainNode`, because iOS ignores `audio.volume`. On `file://` (Android WebView) it uses `audio.volume = level × volume`. Methods: `kick()` (start or resume, called from `Snd.init()` on every tap, since autoplay needs a gesture), `suspend()`, `setOn()` and `setVol()`. Settings are saved in `localStorage` as `cb_music` (default on) and `cb_musicVol` (default 0.6). `avail` is false inside an iframe (Claude's viewer), where the files don't exist. |
| JS | `Snd.init()` | Calls `Music.kick()`. |
| JS | `window.cbPause` / `visibilitychange` | Also `Music.suspend()`; the next tap resumes. |
| JS | `syncMusicUI()` | **New.** Syncs the Pause and Settings controls. Hides the `.musicrow` rows and shows `#musicNote` when music isn't available. |
| HTML | Pause overlay | Music ON/OFF `#pauseMusic`, volume `#pauseMusicVol` / `#pauseMusicVolV`. |
| HTML | Settings | "Sound" → "Sound effects". Music ON/OFF `#setMusic`, volume `#setMusicVol` / `#setMusicVolV`, `#musicNote`, and a credits block. |
| CSS | `.vol`, `.volv`, `.credits`, `.credh`, `[hidden]` rules | Slider (pink accent), percentage label, credits styling. |
| Web | `sw.js` (via `build_web.py`) | Requests under `/music/` bypass the service worker. Audio uses range requests, which return 206 responses the cache can't store; music needs a connection. |
| Tools | `tools/build_web.py` | Copies `assets/music` → `web/music`. |
| Tools | `tools/deploy_github.py` | Deploys sub-folders too (recursive file list and remote tree). |
| JS | `VERSION` | `'1.8.2'` → `'1.9.0'` |
| Android | `app/build.gradle.kts` | `versionCode` 25 → 26, `versionName` "1.8.2" → "1.9.0". |

**Tested** in a headless browser:
- **Test clips:** a copy of the site with 9-second versions of the tracks, run both as `file://` (Android-style, element volume) and over http (web-style, Web Audio).
- **No autoplay:** no audio before the first tap. After New Game, a track faded in to 0.6.
- **Crossfade:** 6 half-second samples showed two tracks playing at once with volumes crossing (e.g. 0.28 / 0.32).
- **Shuffle:** all 4 tracks played once per round in a random order, on both paths.
- **Controls:** the volume slider at 20% set the element volume to 0.2. Music OFF faded out then paused; ON resumed at the chosen volume.
- **Hidden app:** simulating the app being hidden paused both the game and the music, and the next tap resumed.
- **Full-length track (http):** played with duration 164.9 s, and the slider at 30% set a Web Audio gain to 0.3. Settings matched the pause controls.
- **Claude-style iframe:** music rows hidden, the note shown, credits visible, and no music requested.
- **No page errors** throughout.

---

## 1.8.2 – 2026-10-22

Exact diff: `versions/diffs/1.8.1-to-1.8.2.diff`

> **Hidden cheat.** This is deliberately not in `CHANGELOG.md`.

| Area | Where | Change |
|---|---|---|
| JS | `MOTIVATION` | Added "The power is in your hands⚡" (8 messages). |
| JS | `showMotivation()` | Any ⚡ in a message is wrapped in `<b class="zap">`. Resets `G.zapUsed`. |
| JS | `#motivMsg` click listener | **Cheat:** tapping `.zap` adds one random power-up (`star` or `freeze`, chosen only from types below `PU_MAX`), once per showing of the message. Shows a "★ +1" / "❄ +1" pop-up above the overlay (z-index 80), a spin and a jingle. It counts towards the next level's inventory, which includes the restart snapshot, and works before level 7 too; the power-up then waits in the inventory. |
| CSS | `.zap`, `.zap.used`, `@keyframes zapspin` | Tap target and spin feedback. No visual hint that it's tappable. |
| JS | `VERSION` | `'1.8.1'` → `'1.8.2'` |
| Android | `app/build.gradle.kts` | `versionCode` 24 → 25, `versionName` "1.8.1" → "1.8.2". |

**Tested** in a headless browser: debug level 7, cleared, then Motivation shown until the new message appeared. The new message rendered with one `.zap` element, and the other messages had none. Tapping ⚡ three times added exactly **one** power-up in two separate runs ([0,0] → [1,0], and [1,1] → [1,2]), visible in level 8's power-ups bar.

---

## 1.8.1 – 2026-10-22

Exact diff: `versions/diffs/1.8.0-to-1.8.1.diff`

**Cause of the always-moving star icon:** the slot icon used the class name `star`, which already belongs to the star *block* face (`.star { position: absolute; inset: 19%; animation: twinkle … infinite }`). So the icon picked up the endless twinkle, and an absolute position as well.

| Area | Where | Change |
|---|---|---|
| HTML/CSS | Star slot icon | Class `star` → `pstar` (`.pui.pstar`), so it no longer inherits the block star's animation or positioning. |
| CSS | `.pu:not(:disabled) .pui.pstar svg` | Twinkle only while the slot is enabled, i.e. the player holds at least one star. |
| JS | `FREEZE_MS` | 15000 → 10000. The aria-label and comment were updated to match. |
| JS | `VERSION` | `'1.8.0'` → `'1.8.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 23 → 24, `versionName` "1.8.0" → "1.8.1". |

**Tested** in a headless browser with debug starts at level 7:
- **0 stars:** icon animation `none`, position `static`, slot disabled.
- **1 star:** icon animation `twinkle`.
- **After using it:** animation `none` again.
- **Freeze:** the hint read "Shuffles frozen – 10s", and the first shuffle warning came 10.4 s after freezing (level 7 normally warns every 4.5 s).

---

## 1.8.0 – 2026-10-22

Exact diff: `versions/diffs/1.7.7-to-1.8.0.diff`

| Area | Where | Change |
|---|---|---|
| JS | Constants | `PU_FROM = 2 × BONUS_EVERY + 1` (7), `PU_MAX = 3`, `PU_CHANCE = 0.35`, `FREEZE_MS = 15000`. |
| JS | `genItems()` | From `PU_FROM`, independently places hidden `'puStar'` and `'puFreeze'` items (35% each) in cells with no other item. They move with blocks on shuffle (existing item swap). |
| JS | `smash()` | Hidden power-up → `gainPU()`. Applies to taps and COLOUR BLAST chains. |
| JS | `gainPU(k, x, y)` | **New.** +1 up to 3 (always +100 score), pop-up text, the slot icon flies to the bar, then a bounce. |
| JS | `puActive()`, `renderPU()` | **New.** The bar shows when not in a bonus round and level ≥ 7. Shows counts, disables empty slots (freeze also when the level has no shuffles), shows the armed state and the hint text. |
| JS | `useStar()`, `starBlast(cell, x, y)` | **New.** First tap arms (`G.armed`); a second tap cancels. While armed, `tap()` calls `starBlast()`, which moves the chosen colour to `G.order[G.ti]` (so the old target is next), then runs `colourBlast()`. Chain scoring, `colourCleared()` and pause deferral behave as with the star block. |
| JS | `useFreeze()` | **New.** Sets `G.freezeEnd` (game time) and `G.frozenLeft` (time left to the next shuffle, minimum 1.5 s), cancelling any active warning. Stacks by +15 s. |
| JS | `tickShuffle()` | While frozen: holds `nextShuf = e + frozenLeft`, adds the `.frozen` style, sets the label to FROZEN, refreshes the hint each second, and skips warnings and shuffles. Frozen time is game time, so pausing pauses the freeze too. |
| JS | `tap()` | Armed star check before the colour test. The word/combo pop-up only shows for blocks with no item. |
| JS | State | `G.inv {star, freeze}`: reset in `newGame()`, saved per level as `G.invStart` (a restart restores it), set from `DBG.pu` for debug starts. `startLevel()` and `startBonus()` reset `armed` and the freeze. |
| HTML/CSS | `#pus` bar | **New** row under the shuffle meter: label, `#puStar` and `#puFreeze` slot buttons with count badges, `#puHint`. Styles `.pus`, `.pu`, `.pui`, `.puhint`, `.pu.armed`, `#game.armed .board` (gold glow), `.shuf.frozen`. |
| CSS | `#game --bw` | Board height allowance 260 → 310 px (230 → 280 on short screens) for the new row. |
| JS | `Snd.freeze()` | **New** icy chime. |
| HTML/JS | Debug | **New** Power-ups selector `#puSeg` (`DBG.pu`). `lvDesc()` notes "Power-ups can be found." |
| HTML | Tips | Third line about power-ups. |
| JS | `VERSION` | `'1.7.7'` → `'1.8.0'` |
| Android | `app/build.gradle.kts` | `versionCode` 22 → 23, `versionName` "1.7.7" → "1.8.0". |

**Tested** in a headless browser using the debug menu:
- **Bar:** visible at level 7 with the debug-granted 3/3; hidden at level 6 and in a 7×7 bonus round.
- **Star:** arming showed the gold board and hint, and tapping ★ again cancelled with nothing spent. Blasting a non-target colour (11 blocks) left 0 of it, kept RED as the target, cost no hearts, marked 1 chip done and used 1 star.
- **Freeze:** shuffle warnings were 3 in 9 s normally, **0 during 14 s frozen** (label FROZEN, hint counting down from 15 s), then 2 in the next 6 s.
- **Rollback:** after using one of each, losing all hearts and restarting, the inventory was back to 3/3.
- **Finding:** six full level-7 runs found 4 power-ups (expected about 4.2), and they carried into level 8.

---

## 1.7.7 – 2026-10-21

Exact diff: `versions/diffs/1.7.6-to-1.7.7.diff`

| Area | Where | Change |
|---|---|---|
| JS | `ZOOM_GUARD` | **New** flag: `'ongesturestart' in window`, which is true only in WebKit (Safari on iPhone, iPad and Mac, plus every browser on iOS). Sets the class `zg` on `<html>`. |
| JS | Zoom guards | Everything added in 1.7.3–1.7.5 (gesture-event blocks, document two-finger `touchmove`, document `touchend` double-tap guard, board `touchstart` cancel, `visualViewport` snap-back) now sits inside `if (ZOOM_GUARD) { … }`. Removed a leftover comment from 1.7.4. |
| CSS | `.zg #game`, `.zg .stage`, `.zg .stage *` | `touch-action: none` now applies only under `zg`. `.stage` is back to plain `position: relative`. |
| JS | `VERSION` | `'1.7.6'` → `'1.7.7'` |
| Android | `app/build.gradle.kts` | `versionCode` 21 → 22, `versionName` "1.7.6" → "1.7.7". |

Unchanged on all browsers: the 1.7.3 effects-canvas fix and the body's `touch-action: manipulation`.

**Tested** in a headless Chromium emulating a touch phone, listing the actual event listeners through Chrome DevTools:
- **Android Chrome, 1.7.2 (before the iPhone fixes):** no guard class, touch-action `manipulation` / `auto`, no touch listeners on the document or board.
- **Android Chrome, 1.7.7:** identical to 1.7.2. Rapid real taps all bashed.
- **Simulated Safari** (`ongesturestart` present), 1.7.7: guard class on, blocks `touch-action: none`, all guards attached (`gesture*`, `touchmove` and `touchend` on the document, `touchstart` on the board). Rapid taps all bashed.

---

## 1.7.6 – 2026-10-21

Exact diff: `versions/diffs/1.7.5-to-1.7.6.diff`

| Area | Where | Change |
|---|---|---|
| JS | `INTRO_MS` | **New** constant (2200 ms): how long the intro banner stays up. |
| JS | `countdown()` | Intro banner shown for `INTRO_MS` (was 1000 ms) with the new `hold` class. 3-2-1-GO now starts at `INTRO_MS + 100` (was 1100 ms), at the same 650 ms spacing. `begin()`, and with it `startTimer()`, still runs at GO. |
| CSS | `.banner span.hold`, `@keyframes introHold` | Pop-in, hold, fade over `--hold` (set to `INTRO_MS`), replacing the 0.95 s `sweep` slide for intros only. Shuffle and other banners still sweep. |
| JS | `VERSION` | `'1.7.5'` → `'1.7.6'` |
| Android | `app/build.gradle.kts` | `versionCode` 20 → 21, `versionName` "1.7.5" → "1.7.6". |

**Acceptance criterion: game timings unchanged.** Tested in a headless browser with a frame-by-frame probe, comparing 1.7.5 and 1.7.6 on debug level 2:
- **Intro readable:** about 0.82 s on 1.7.5, about 1.93 s on 1.7.6.
- **Countdown:** "3" appeared at 1.06 s → 2.27 s, and GO at 3.02 s → 4.24 s.
- **Timer:** started at GO on both versions.
- **First shuffle warning:** 9.09 s after GO on 1.7.5 and 9.08 s on 1.7.6, i.e. identical.

Also checked:
- **Pausing during the intro:** the timer stayed at 0.0, and resuming replayed the intro and countdown.
- **Level timing:** the level-clear time was measured from GO.
- **Mid-level pause:** resuming still uses the quick 3-2-1 with no intro.
- **Bonus round:** the intro also holds about 1.9 s, and the 10 s timer starts at GO.

---

## 1.7.5 – 2026-10-21

Exact diff: `versions/diffs/1.7.4-to-1.7.5.diff`

**Context:** the user reported that 1.7.4 still zoomed in on Safari while bashing. CSS `touch-action` and a `touchend`-only guard evidently aren't enough there, so this version stops Safari's default touch behaviour at the source and adds a recovery path.

| Area | Where | Change |
|---|---|---|
| JS | `touchstart` on `#stage` | `preventDefault()` (non-passive) on every board touch, which cancels all native gestures on the grid (double-tap zoom, smart zoom, callouts). Bashing is unaffected because it runs on `pointerdown`, which still fires. |
| JS | Document `touchend` guard | Replaces the board-only guard from 1.7.4: a second `touchend` within 350 ms is cancelled anywhere except on buttons, inputs and links (so their clicks still work). |
| JS | `visualViewport` `resize` safety net | If the scale goes above 1 during a game, the viewport tag is briefly rewritten (`maximum-scale=1` → `1.0`) and restored after 80 ms. Re-applying the tag makes Safari reset the zoom. |
| CSS | `#game` | `touch-action: none` for the whole game screen (it needs no scrolling). |
| JS | `VERSION` | `'1.7.4'` → `'1.7.5'` |
| Android | `app/build.gradle.kts` | `versionCode` 19 → 20, `versionName` "1.7.4" → "1.7.5". |

**Tested** in a headless Chromium emulating a touch phone; no Safari engine is available, so the user's iPhone is the real test:
- **Board touches:** a board `touchstart` is cancelled.
- **Taps still bash:** five real touch taps 90 ms apart bashed five blocks.
- **Buttons:** pause and resume worked with quick taps.
- **Safety net:** forcing `visualViewport.scale` to 2.4 mid-game rewrote the viewport tag, which was restored afterwards.

---

## 1.7.4 – 2026-10-21

Exact diff: `versions/diffs/1.7.3-to-1.7.4.diff`

**Cause (regression from 1.7.3):** 1.7.3 changed the body's `touch-action` from `manipulation` to `pan-x pan-y`. iOS Safari's support for `pan-x pan-y` is incomplete, and `manipulation` was what disabled double-tap-to-zoom there. Quick repeated taps while bashing were read as a double-tap and zoomed in. With pinch blocked by the 1.7.3 gesture handlers, the player couldn't zoom back out.

| Area | Where | Change |
|---|---|---|
| CSS | `body` | `touch-action` back to `manipulation` (blocks double-tap zoom in Safari). |
| CSS | `.stage`, `.stage *` | `touch-action: none` on the board, which needs no scrolling or zooming. |
| JS | `touchend` on `#stage` | A second `touchend` within 350 ms is cancelled, a belt-and-braces block on iOS double-tap zoom. Blocks are bashed on `pointerdown`, so every tap still counts. |
| JS | `zoomed()` + gesture/two-finger `touchmove` guards | Pinch is only blocked while `visualViewport.scale` is about 1. If the page is somehow zoomed, pinch is allowed so the player can zoom back out. |
| JS | `VERSION` | `'1.7.3'` → `'1.7.4'` |
| Android | `app/build.gradle.kts` | `versionCode` 18 → 19, `versionName` "1.7.3" → "1.7.4". |

**Tested** in a headless Chromium emulating a touch phone; no WebKit/Safari engine is available, so the real check is on an iPhone:
- **Settings:** body `touch-action` is `manipulation`, blocks are `none`.
- **Rapid taps:** six real touch taps 120 ms apart bashed all six blocks.
- **Double-tap blocking:** of two quick `touchend`s on the board, the first passed and the second was cancelled.
- **Pinch:** blocked at normal zoom, but allowed when the viewport scale was forced to 2.5.
- **Buttons:** quick taps on pause, resume and pause all responded.

---

## 1.7.3 – 2026-10-21

Exact diff: `versions/diffs/1.7.2-to-1.7.3.diff`

**Causes:**
- **Zoom:** iOS Safari ignores `user-scalable=no` / `maximum-scale` in the viewport tag, and the body's `touch-action: manipulation` still allows pinch-zoom.
- **Stuck confetti:** `FX.step()` cleared the canvas with `clearRect(0, 0, innerWidth, innerHeight)`. On iOS, `innerWidth` / `innerHeight` shrink to the zoomed visual viewport (with no `resize` event), so only part of the full-size canvas was wiped and the rest of the last frame stayed frozen.

| Area | Where | Change |
|---|---|---|
| CSS | `body` | `touch-action: manipulation` → `pan-x pan-y`, which allows scrolling but not pinch or double-tap zoom. |
| JS | Document listeners | `gesturestart`, `gesturechange` and `gestureend` (Safari-only pinch events) are cancelled, and two-finger `touchmove` is cancelled (non-passive). Single-finger moves and all `pointerdown` taps are unaffected. |
| JS | `FX.resize()` | Sizes the canvas from the layout viewport (`document.documentElement.clientWidth/Height`) and stores it as `FX.W` / `FX.H`. |
| JS | `FX.clear()` | **New.** Resets the transform and clears the full canvas bitmap (`cv.width × cv.height`). Used every frame and when the animation ends. |
| JS | `FX.confetti()` | Spawns across `FX.W` / `FX.H` instead of `innerWidth` / `innerHeight`. |
| JS | `VERSION` | `'1.7.2'` → `'1.7.3'` |
| Android | `app/build.gradle.kts` | `versionCode` 17 → 18, `versionName` "1.7.2" → "1.7.3". |

**Tested** in a headless Chromium emulating a touch phone; no WebKit/Safari engine is available in the test environment, so the final check is on a real iPhone:
- **Stuck confetti reproduced:** won a level, then mid-confetti made `innerWidth` / `innerHeight` report a zoomed viewport (180 × 360) without a resize, as iOS does. On 1.7.2, 907,362 confetti pixels stayed frozen; on 1.7.3, 0.
- **Zoom blocked:** the body's touch-action is `pan-x pan-y`, and synthetic `gesturestart` and two-finger `touchmove` events are cancelled.
- **Scrolling intact:** one-finger `touchmove` is not cancelled.

---

## 1.7.2 – 2026-10-21

Exact diff (game file): `versions/diffs/1.7.1-to-1.7.2.diff`

**Cause:** GitHub Pages serves pages with `Cache-Control: max-age=600`. The service worker's network-first `fetch(r)` used the browser's HTTP cache, so for up to 10 minutes after a deploy it could get the old `index.html` back without asking GitHub.

| Area | Where | Change |
|---|---|---|
| Web | `sw.js` (via `tools/build_web.py`) | Page requests are fetched with `cache: 'no-cache'`, so the browser always revalidates with GitHub (a quick 304 if unchanged). `VERSION` is now a constant in the worker. On activate, it posts `{type: 'cb-version', v}` to open pages. |
| JS | SW registration | Registers with `updateViaCache: 'none'` and calls `update()` on load, so a new `sw.js` is noticed promptly. |
| JS | `message` listener, `swReload()`, `BT.pendingReload` / `BT.reloading` | If the worker reports a version different from the page's `VERSION`: refresh at once when on the home screen, otherwise set `pendingReload`. Refreshes at most once. |
| JS | `showScreen()` | Returning to the home screen performs any pending refresh, so it never refreshes mid-level. |
| JS | `VERSION` | `'1.7.1'` → `'1.7.2'` |
| Android | `app/build.gradle.kts` | `versionCode` 16 → 17, `versionName` "1.7.1" → "1.7.2". |

**Tested** in a headless browser against a local server sending GitHub's `max-age=600` header, with new versions "deployed" by editing the served files:
- **One refresh is enough:** deploy plus a single refresh showed the new version, with no extra reload.
- **Open page updates itself:** a page left on the home screen refreshed itself once when a newer version arrived.
- **Never mid-level:** a deploy during a level caused no reload; quitting to the home screen then refreshed to the new version.
- **Offline:** an offline reload still worked.

---

## 1.7.1 – 2026-10-21

Exact diff: `versions/diffs/1.7.0-to-1.7.1.diff`

| Area | Where | Change |
|---|---|---|
| HTML | Settings | New `#dbgLock` box: password input `#dbgPass`, `#dbgUnlock` button and `#dbgMsg` message. The debug section is now `#dbgBox`, hidden by default. |
| CSS | `.dbglock`, `.lockrow`, `.lockrow input`, `.lockrow input.bad`, `[hidden]` rules | Lock box styling (16 px input, so phones don't zoom in) and a shake on a wrong entry. |
| JS | `DBG_HASH` | **New.** SHA-256 hash of the password. **The password itself is not stored anywhere in the code or these docs.** |
| JS | `sha256(str)` | **New.** Small built-in SHA-256, so it works everywhere (including `file://` in the Android app) without relying on `crypto.subtle`. Checked against Node's crypto on 9 inputs, including empty, 55/56/64/200-byte and Unicode strings. |
| JS | `tryUnlock()`, `dbgOpen` | Compares the hash of the entry. Correct: hides the lock and shows the debug tools until reload. Wrong: message, shake, hurt sound and vibration. The Enter key also submits. |
| JS | Settings button | Clears the box and message each time Settings opens; shows the lock or the tools depending on `dbgOpen`. |
| JS | `VERSION` | `'1.7.0'` → `'1.7.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 15 → 16, `versionName` "1.7.0" → "1.7.1". |

**Security note:** this keeps casual players out of the debug tools. It isn't real security, because everything runs on the player's device and someone technical could edit the page. Storing only the hash means the password can't be read from the code, though a weak password could still be guessed.

**Tested** in a headless browser:
- Settings opened with the debug tools hidden.
- Empty, wrong-case and missing-character entries were rejected with the right message.
- The correct password unlocked the tools via the Enter key.
- The tools stayed unlocked after closing and reopening Settings, and a debug level started normally.
- After a reload, the tools were locked again.
- The password does not appear in the game file.

---

## 1.7.1 – 2026-10-21

Exact diff: `versions/diffs/1.7.0-to-1.7.1.diff`

| Area | Where | Change |
|---|---|---|
| HTML | Settings | **New** `#dbgLock` panel: password field `#dbgPass`, `#dbgUnlock` button and `#dbgMsg` message. The existing debug panel is now `#dbgBox` and starts `hidden`. |
| CSS | `.dbglock`, `.lockrow`, `.dbg[hidden]` | Lock panel styling (16px input text so iPhones don't zoom in); shake on a wrong password (`.bad`, reuses `ouch`); the input allows text selection. |
| JS | `DBG_HASH`, `sha256()` | The password is compared by SHA-256 hash, so the plain password never appears in the code (including the public GitHub repo). `sha256()` is built in, so it also works in the Android WebView and Claude's viewer. |
| JS | `tryUnlock()`, `dbgOpen` | Correct password → reveal `#dbgBox` and set `dbgOpen` for the session (not saved, so it relocks on reload). Wrong or empty → message, shake, buzz. |
| JS | Settings button | Clears the field and message, and shows the lock or the debug tools depending on `dbgOpen`. |
| JS | `contextmenu` handler | Long-press menus are still blocked, except inside inputs, so paste works in the password box. |
| JS | `VERSION` | `'1.7.0'` → `'1.7.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 15 → 16, `versionName` "1.7.0" → "1.7.1". |

The password itself is deliberately not written in any project file.

**Tested** in a headless browser:
- **Locked by default:** Settings showed the lock and hid the debug tools.
- **Rejected:** an empty submit, a wrong case (`suitcase1!`), a missing `!`, a trailing space and an unrelated word were all refused.
- **Accepted:** the correct password with Enter unlocked the tools. They stayed unlocked after closing and reopening Settings, and PLAY LEVEL started a debug run.
- **Relocks:** after a reload the tools were locked again.
- **Hash:** the built-in SHA-256 was checked against Python's `hashlib` on six test strings, including Unicode and emoji.

---

## Tooling – 2026-10-21 (no new game version)

| Area | Where | Change |
|---|---|---|
| Tools | `tools/deploy_github.py` | **New.** Pushes the changed `web/` files to `main` (GitHub Pages) as one commit and waits for the build. Only run on request. |
| Tools | `tools/backup_github.py` | **New.** Backs up the whole project to the `backup` branch as one commit, uploading only files that changed. Run every build. |
| Docs | Release checklist | New steps 8 (back up) and 9 (deploy on request). Step 10: hand over the changelog and code-changes only, with zips and HTML on request. |
| Docs | `HOSTING.md` | Live-site and backup details. |

---

## 1.7.0 – 2026-10-21

Exact diff (game file): `versions/diffs/1.6.0-to-1.7.0.diff`

| Area | Where | Change |
|---|---|---|
| JS | `WEBAPP` | **New** flag: true only when running as a normal top-level web page (not inside the Android app's WebView, which has `AndroidBridge`, and not inside Claude's viewer iframe). |
| JS | `syncTrap()` + `popstate` listener, `BT` state | **New.** Browser back-button handling. While away from the plain home screen (in game, records, or settings open) one history entry is pushed. Pressing back runs the same `cbBack()` the Android app uses (pause, resume, close settings, step back to home) and re-arms. Returning home through the in-game buttons removes the entry (`history.back()` with a skip flag), so one back press on the home screen leaves the site. |
| JS | `showScreen()`, `showOv()` | Call `syncTrap()`. |
| JS | Init | When `WEBAPP` and on https or localhost: registers `sw.js` and calls `navigator.storage.persist()`. |
| JS | `VERSION` | `'1.6.0'` → `'1.7.0'` |
| Web | `web/` folder | **New.** `index.html` (game plus manifest, icon and Apple web-app head tags), `manifest.webmanifest` (fullscreen, portrait, theme `#140d3a`, any and maskable icons), `sw.js` (versioned cache `colour-basher-X.Y.Z`; network-first for the page, falling back to cache offline; cache-first for icons and fonts; deletes old caches on activate), and PNG icons. |
| Tools | `tools/build_web.py` | **New.** Builds `web/` from the game file and stamps `VERSION` into `sw.js`. Run every release. |
| Tools | `tools/make_icons.py` | **New.** Renders the PNG icons from the Android icon design with Playwright. Only needed if the icon changes. |
| Docs | `HOSTING.md` | **New.** Hosting on Netlify Drop, GitHub Pages or Cloudflare Pages; player install steps; how updates reach players. |
| Docs | `README.md`, release checklist | Mention the web app; checklist steps 7 and 8 now cover building and handing over the web zip. |
| Android | `app/build.gradle.kts` | `versionCode` 14 → 15, `versionName` "1.6.0" → "1.7.0". |

**Tested** in a headless browser with `web/` served on localhost:
- **Install files:** the manifest loaded (fullscreen, 3 icons), all icons returned 200, the service worker took control, and the cache was `colour-basher-1.7.0`.
- **Offline:** switched the browser offline and reloaded; the game still loaded (v1.7.0) and a level played normally.
- **Back button:** back during play paused the game and stayed on the page; back again resumed. Back with Settings open closed it. After quitting to the home screen through the menu, a single back left the site.
- **Unchanged builds:** the plain `file://` build (as the Android app loads it) ran with no errors.

---

## 1.6.0 – 2026-10-21

Exact diff: `versions/diffs/1.5.1-to-1.6.0.diff`

| Area | Where | Change |
|---|---|---|
| HTML | Win overlay | New `#motivBtn` (pink) between `#nextBtn` and `#winQuit`. |
| HTML | `#ovMotiv` overlay | **New.** `#motivMsg`, `#motivNext` and `#motivQuit`. |
| CSS | `.btn.pink`, `.motiv`, `.motiv span`, `@keyframes mpop` | Pink button. Message words pop in one by one in palette colours with an outline, and the whole message bobs. |
| JS | `MOTIVATION` | **New** list of 7 messages. |
| JS | `showMotivation()` | **New.** Picks a random message (never the last one shown), colours each word, copies the Next button's label (NEXT LEVEL / BONUS ROUND!), and shows the overlay with jingle, confetti and vibration. |
| JS | Wiring | MOTIVATION → `showMotivation()`. BACK TO MENU → `toTitle()`. NEXT LEVEL → triggers `#nextBtn`, so it follows exactly the same path (including bonus rounds and hearts carried over). |
| JS | `showOv()` | Includes `ovMotiv`. |
| JS | `win()`, `bonusEnd()` | Show the button after levels; hide it on bonus results. |
| JS | `VERSION` | `'1.5.1'` → `'1.6.0'` |
| Android | `app/build.gradle.kts` | `versionCode` 13 → 14, `versionName` "1.5.1" → "1.6.0". |

**Tested** in a headless browser:
- **Debug level 3:** the win screen showed BONUS ROUND! / MOTIVATION / QUIT TO TITLE. The message screen's Next button read BONUS ROUND! and led into the 5×5 bonus round.
- **Message variety:** 41 messages in a row covered all 7, with no repeats back to back.
- **Bonus results:** no Motivation button.
- **Level 4:** Motivation → BACK TO MENU returned to the home screen.

---

## 1.5.1 – 2026-10-21

Exact diff: `versions/diffs/1.5.0-to-1.5.1.diff`

| Area | Where | Change |
|---|---|---|
| JS | `win()` | Time bonus `max(0, round((90 − s) × 10))` → `max(0, floor(90 − s)) × 10`. |
| JS | `bonusEnd()` | Time-left bonus `round(msLeft / 10)` → `floor(msLeft / 100) × 10`. Blocks row `n × 25` → `n × 30`. |
| JS | `tap()` | Bonus round block points 25 → 30. |
| JS | `VERSION` | `'1.5.0'` → `'1.5.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 12 → 13, `versionName` "1.5.0" → "1.5.1". |

All other point sources (10 × combo multiplier, 20, 100, 200 × hearts, 250 × level, 500) were already multiples of 10.

**Tested** in a headless browser, checking every breakdown line and the scoreboard were multiples of 10:
- A normal playthrough of levels 1–3 and the 5×5 bonus round.
- Debug bonus rounds: a deliberately slow 5×5 that timed out partway (21 blocks, 630), a cleared 6×6 and a cleared 7×7.

---

## 1.5.0 – 2026-10-21

Exact diff: `versions/diffs/1.4.1-to-1.5.0.diff`

| Area | Where | Change |
|---|---|---|
| HTML | Timer box | Now a scoreboard (`.timebox.sb`): TIME row, SCORE row (`#score`) and a `#plusN` "+N" indicator. |
| HTML | Win overlay | `#winTally` breakdown under the big time. |
| HTML | Records | `#recSeg` tabs (FASTEST TIMES / TOP SCORES). Panel and header given ids `recPanel` and `recHead`. |
| CSS | `--score` | **New** token: amber `#c96f00` in light mode, `#ffd400` in dark mode. |
| CSS | `.timebox.sb`, `.sbrow`, `.plusN` + `@keyframes plusN` | Scoreboard layout. White outlined "+N" fades in and out just below the scoreboard. |
| CSS | `.tally`, `.trow`, `.trow.tot`, `.trow em` + `@keyframes trow` | Breakdown rows appear one by one; NEW HIGH! tag. |
| CSS | `.recpanel.sc` | 4-column layout for Top scores. |
| CSS | `.ov .panel` | `max-height: 100%; overflow-y: auto` so taller win screens scroll on small phones. |
| CSS | `.timebox.hot #time` | Was `.timebox.hot b`; now only the time turns red in bonus rounds, not the score. |
| JS | `comboMult(c)` | **New.** 1 / 2 / 3 / 4 at combo < 5 / 5+ / 10+ / 15+. |
| JS | `addScore(n)` | **New.** Adds to `G.score` and shows "+N", adding up rapid gains within 700 ms. |
| JS | `bankScore()` | **New.** One `cb_scores` entry per game (`G.runId`), updated after every level or bonus round. Keeps the top 20, skips debug runs, and returns true the first time this game passes the best of other games. |
| JS | `setTally()`, `countUp()` | **New.** Builds the breakdown rows and counts up the total (eased; rAF time clamped). |
| JS | `tap()` | +`10 × comboMult(combo)` per correct block, or 25 in a bonus round. |
| JS | `colourBlast()` | +20 per chain-blasted block. |
| JS | `gainHeart()` | +100 only when a life is actually gained. |
| JS | `colourCleared()` | +100 per colour (not in bonus rounds). |
| JS | `win()` | Time bonus `max(0, round((90 − s) × 10))`, lives bonus `hearts × 200`, level bonus `level × 250`. Banks the score and shows the tally. |
| JS | `bonusEnd()` | Clear bonus 500 plus `round(msLeft / 10)` (100 per second left). Banks the score and shows the tally. |
| JS | `newGame()`, debug buttons | Reset `G.score = 0` and set a new `G.runId`. |
| JS | `startLevel()` | A fresh level stores `G.levelStartScore`; a restart restores it (rollback). Syncs the scoreboard. `startBonus()` also syncs it. |
| JS | `gameOver()`, `pause()` | Game Over text names the score you'll restart with; pause info shows points. |
| JS | Main loop | Scoreboard counts up towards `G.score`. |
| JS | `updateBest()` | Home screen shows "Best time … · High score …". |
| JS | `renderRecords()` | Now switches between the new `renderTimes()` (the old function, renamed) and `renderScores()`. CLEAR clears the tab you're on. |
| JS | `VERSION` | `'1.4.1'` → `'1.5.0'` |
| Android | `app/build.gradle.kts` | `versionCode` 11 → 12, `versionName` "1.4.1" → "1.5.0". |

**Tested** in a headless browser:
- **Normal playthrough** (levels 1–4 plus the 5×5 bonus round): five quick taps scored 60 (4 × 10 + 1 × 20), confirming the ×2 multiplier kicks in at the 5th hit. Every tally added up: the previous score plus the rows equalled the total, which matched the scoreboard. Example level 1: play 2,360 + time 833 + lives 600 + level 250 = 4,043, with NEW HIGH! shown. Bonus round: 625 for blocks, then 500 + 746 added at the end.
- **Records:** the game produced a single Top scores entry, updated each level, and the home screen showed the high score.
- **Rollback (debug, level 5, 3 lives):** earned 80 points, lost all hearts, and Game Over said the score would go back to 0. After the restart the scoreboard read 0.
- **Debug runs:** nothing was saved to Top scores.

---

## 1.4.1 – 2026-10-21

Exact diff: `versions/diffs/1.4.0-to-1.4.1.diff`

| Area | Where | Change |
|---|---|---|
| JS | `moveHeart(from)` | **New.** Clears the bashed cell's hidden heart and gives it to a random block that's still alive and has no item. If none are left, the heart is dropped. |
| JS | `smash()` | Hidden heart: calls `gainHeart()` only when `G.hearts < MAX_LIVES`, otherwise `moveHeart()`. Covers normal taps and COLOUR BLAST chains (chain blocks are already marked dead, so the heart can't move onto them). |
| HTML/JS | Debug menu | **New** Lives selector `#livesSeg` (3/4/5), stored in `DBG.lives` and used by PLAY LEVEL and PLAY BONUS instead of a fixed 3. |
| Docs | Release checklist | Added step 3 (testing, including use of the debug menu). |
| JS | `VERSION` | `'1.4.0'` → `'1.4.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 10 → 11, `versionName` "1.4.0" → "1.4.1". |

**Tested:** a headless browser ran 8 debug runs of level 7 (80% hidden-heart chance) starting with 5 lives. Each bashed about 28 blocks, made one deliberate wrong tap, then cleared the level. No heart animation fired in any run while at 5 lives. In 6 of 8 runs "+1 LIFE!" fired after dropping to 4, which matches the 80% chance and shows the heart had waited rather than being lost.

---

## 1.4.0 – 2026-10-21

Exact diff: `versions/diffs/1.3.3-to-1.4.0.diff`

| Area | Where | Change |
|---|---|---|
| HTML | Title screen | ⚙️ `#setBtn` at the top left. |
| HTML | `#ovSettings` overlay | **New.** Sound toggle (`#setSound`). Debug section: level stepper (`#lvDown5`, `#lvDown`, `#lvVal`, `#lvUp`, `#lvUp5`), `#lvInfo`, `#dbgLevel`, bonus size selector `#bonusSeg` (`data-l` = level the bonus follows: 3, 6, 9) and `#dbgBonus`. |
| CSS | `.settings`, `.setpanel`, `.setrow`, `.dbg*`, `.stepper`, `.seg`, `.lvinfo` | Settings panel styling (scrolls if the screen is short). |
| CSS | `#game.debug .lvl::after` | Orange DEBUG tag under the level box. |
| JS | `DBG` | **New** state `{lv, bonusAfter}` for the selector. |
| JS | `setDebug(on)` | **New.** Sets `G.debug` and the `#game.debug` class. |
| JS | `lvDesc(l)`, `renderDbg()`, `stepLv(d)` | **New.** Selector UI: level clamped to 1–50, description built from `shuffleSecs()`, `bonusSize()` and `bonusTime()`. |
| JS | Debug buttons | PLAY LEVEL: `setDebug(true)`, `G.level = n`, 3 hearts, `startLevel(true)`. PLAY BONUS: `setDebug(true)`, `G.level = 3/6/9`, 3 hearts, `startBonus()`. |
| JS | `newGame()` | Calls `setDebug(false)`. |
| JS | `win()` | Skips `cb_records` write when `G.debug`. Badge "DEBUG RUN – NOT SAVED". |
| JS | `bonusEnd()` | Skips `cb_bonus` write when `G.debug`. Same badge. |
| JS | `showOv()` | Includes `ovSettings`. |
| JS | `syncSound()` and sound buttons | Settings sound button shows ON/OFF and toggles like the others. |
| JS | `window.cbBack()` | Closes settings first (Android back button). |
| JS | `VERSION` | `'1.3.3'` → `'1.4.0'` |
| Android | `app/build.gradle.kts` | `versionCode` 9 → 10, `versionName` "1.3.3" → "1.4.0". |

**Tested:** in a headless browser, picked level 9 in settings: the note read "Shuffle every 3.5s, moving 100% of blocks. Bonus round (7×7) after this level." Played it with the DEBUG tag showing, and the win screen read "DEBUG RUN – NOT SAVED" with Records still empty. The 7×7 bonus followed (49 blocks, 15 s) and wasn't saved. The direct 6×6 bonus button gave 36 blocks, and New Game cleared debug mode.

---

## 1.3.3 – 2026-10-21

Exact diff: `versions/diffs/1.3.2-to-1.3.3.diff`

| Area | Where | Change |
|---|---|---|
| JS | `bonusTime(size)` | **New.** 15000 ms for a 7×7 grid, otherwise `BONUS_MS` (10000). |
| JS | `G.bonusMs` | **New** state, set in `startBonus()` from `bonusTime(G.size)`. |
| JS | `startBonus()`, `bonusEnd()`, `countdown()`, `pause()`, main loop | All uses of `BONUS_MS` replaced with `G.bonusMs` (starting display, time left, intro text, pause info, countdown, red "hot" timer and time-up check). |
| JS | `VERSION` | `'1.3.2'` → `'1.3.3'` |
| Android | `app/build.gradle.kts` | `versionCode` 8 → 9, `versionName` "1.3.2" → "1.3.3". |

**Tested:** a headless browser played to level 10. The bonus timers started at 10 s (5×5), 10 s (6×6) and 15 s (7×7). A deliberately slow 7×7 run timed out at 15 s with 38 / 49 bashed.

---

## 1.3.2 – 2026-10-21

Exact diff: `versions/diffs/1.3.1-to-1.3.2.diff`

**Cause:** `FX.add()` stamps `this.last = performance.now()` when the first particle is added. `FX.step(t)` then used the `requestAnimationFrame` timestamp `t`, which is the frame's start time and can be earlier than the tap. That made `dt` negative, so particle ages went below zero and the ring's eased radius `r0 + (r1 − r0) × e` went negative. `ctx.arc()` throws on a negative radius.

| Area | Where | Change |
|---|---|---|
| JS | `FX.step()` | `dt` clamped to ≥ 0 (`Math.max(0, …)`). `this.last = Math.max(t, this.last)` so time never steps backwards. |
| JS | `FX.step()`: ring and flash drawing | Radius passed to `ctx.arc()` wrapped in `Math.max(0, …)` as a second safety net. |
| JS | `VERSION` | `'1.3.1'` → `'1.3.2'` |
| Android | `app/build.gradle.kts` | `versionCode` 7 → 8, `versionName` "1.3.1" → "1.3.2". |

**Tested:** a headless browser had its frame timestamps forced 60 ms behind real time. Bashing a full colour threw the same error on 1.3.1 and no errors on 1.3.2.

---

## 1.3.1 – 2026-10-21

Exact diff: `versions/diffs/1.3.0-to-1.3.1.diff`

| Area | Where | Change |
|---|---|---|
| JS | `bonusSize(level)` | **New.** `min(7, 4 + floor(level / 3))`: 5 after level 3, 6 after level 6, 7 from level 9 on. |
| JS | `G.size` | **New** state: grid columns/rows. `startLevel()` sets 8 (`N`); `startBonus()` sets `bonusSize(G.level)` and builds `size²` blocks. |
| JS | `renderGrid()` | Sets `grid-template-columns/rows: repeat(size, 1fr)` inline and `--bs = 8 / size` (bevel scale). Row/column vars now use the current size, plus a new `--dr` (rows from the bottom) for the drop-in animation. |
| JS | `bonusEnd()` | Result shows `n / G.cells.length`. "So close!" when within 5 blocks (was within 8 of 64). |
| JS | `countdown()` | Bonus intro shows `BASH ALL ${size²} IN 10s`. |
| CSS | `.block`, `.block.power` | Box-shadow sizes multiplied by `var(--bs, 1)` so bevels scale with block size. |
| CSS | `.block.drop` | Delay uses `--dr` instead of the hard-wired `7 − --r`, so any grid size drops bottom row first. |
| JS | `VERSION` | `'1.3.0'` → `'1.3.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 6 → 7, `versionName` "1.3.0" → "1.3.1". |

**Tested:** a headless browser played through level 10. The bonus grids were 25, 36 and 49 blocks after levels 3, 6 and 9, all cleared (PERFECT!), and each following level went back to 64 blocks.

---

## 1.3.0 – 2026-10-21

Exact diff: `versions/diffs/1.2.2-to-1.3.0.diff`

| Area | Where | Change |
|---|---|---|
| JS | Constants | Added `BONUS_EVERY = 3` and `BONUS_MS = 10000`. `VERSION` `'1.2.2'` → `'1.3.0'`. |
| JS | `setMode(b)` | **New.** Sets `G.bonus`, toggles the `#game.bonus` class, swaps the LEVEL/BONUS and TIME/TIME LEFT labels, and hides RESTART LEVEL during the bonus round. |
| JS | `startBonus()` | **New.** Builds an all-one-colour grid (random colour, `G.order = [c]`, no items), turns shuffles off, shows ★ in the level box and 10.0 on the timer, then runs `countdown()`. |
| JS | `bonusEnd(cleared)` | **New.** Stops the clock and saves `{after, n, all, left, d}` to `localStorage` `cb_bonus` (last 50, for future rewards). Then reuses the win overlay: PERFECT! with time left, or TIME UP! with bashed / 64. |
| JS | `startLevel()` | Calls `setMode(false)`. |
| JS | `countdown()` | Bonus intro banner: "BONUS! / BASH ALL 64 IN 10s". |
| JS | `win()` | Hands off to `bonusEnd(true)` when in a bonus round. Labels the Next button "BONUS ROUND!" when `level % 3 === 0`. Bonus results are never written to `cb_records`. |
| JS | Next button | After levels 3, 6, 9… goes to `startBonus()`. After a bonus round, goes to the next numbered level. Extra hearts carry through. |
| JS | `pause()` | Bonus pause info: "Bonus round · Xs left". |
| JS | Main loop | During a bonus round, shows the remaining time, toggles `.timebox.hot` under 3 s, ticks once per second for the last 3, and calls `bonusEnd(false)` at 0. Shuffle ticking only runs outside the bonus round. |
| JS | `Snd.timeup()` | **New.** Time-up buzzer. |
| HTML | Timebox, level box | Labels given ids `timeLbl` and `lvlLbl` so they can switch text. |
| CSS | `#game.bonus …`, `@keyframes bglow`, `.timebox.hot`, `@keyframes hot` | Bonus styling: chips hidden, gold ★, glowing gold board border, red pulsing timer. |
| Android | `app/build.gradle.kts` | `versionCode` 5 → 6, `versionName` "1.2.2" → "1.3.0". |

**Tested:** a headless browser played levels 1–3 and confirmed the button read "BONUS ROUND!". It cleared the bonus round (PERFECT!, 4.67 s left) in one run and timed out (TIME UP!, 44 / 64) in another. Both continued to level 4, Records kept only the 3 level times, and the bonus results were saved.

---

## 1.2.2 – 2026-10-20

Exact diff: `versions/diffs/1.2.1-to-1.2.2.diff`

**Cause:** all banner messages share one `#banner` element, and each queued its own "clear the banner" timer without checking whether its message was still the one showing. So `doShuffle()` overwrote the colour-cleared message, and its 950 ms clear-out timer could wipe a newer message.

| Area | Where | Change |
|---|---|---|
| JS | `showBanner(html, ms, kind)` | **New.** Shows a banner message. Each call takes a token (`bannerTok`); its clear-out timer only fires if that token is still current, so an older timer can't wipe a newer message. Records `G.bannerKind`. |
| JS | `clearBanner()` | **New.** Clears the banner and invalidates any pending timers. Used by `pause()`. |
| JS | `countdown()`, `colourCleared()` | Use `showBanner()` (kinds `'intro'` and `'clear'`) instead of writing `#banner` directly. |
| JS | `doShuffle()` | Flashes the meter label every shuffle (`restart($('shuf'),'go')`), and only shows "SHUFFLE!" when no colour-cleared message is up. |
| JS | `pause()` | `$('banner').innerHTML=''` replaced with `clearBanner()`. |
| CSS | `.shuf.go span`, `@keyframes sgo` | Yellow flash of the SHUFFLE meter label. |
| JS | `VERSION` | `'1.2.1'` → `'1.2.2'` |
| Android | `app/build.gradle.kts` | `versionCode` 4 → 5, `versionName` "1.2.1" → "1.2.2" |

**Tested:** a headless browser cleared a colour 0.1 s before a shuffle, and 0.5 s after one. In both cases the message stayed up for its full 1.15 s. On 1.2.1 it was replaced or wiped.

---

## 1.2.1 – 2026-10-20

Exact diff: `versions/diffs/1.2.0-to-1.2.1.diff`

| Area | Where | Change |
|---|---|---|
| CSS | `.clearmsg`, `.cpill`, `.nlbl`, `.nname` | New styles for the redesigned message: dark see-through panel, pill coloured by `--pc`, NEXT label and large colour name (sized from board width `--bw`). |
| CSS | `@keyframes cpop` | New pop-in / hold / fade animation (1.15 s). This replaces the sliding `sweep` animation for this message; `sweep` is still used by other banners. |
| JS | `colourCleared()` | Banner markup replaced: tick pill in the cleared colour, NEXT label and next colour name. Clear-out timeout changed from 1000 ms to 1150 ms. |
| JS | `VERSION` | `'1.2.0'` → `'1.2.1'` |
| Android | `app/build.gradle.kts` | `versionCode` 3 → 4, `versionName` "1.2.0" → "1.2.1" |

## 1.2.0 – 2026-10-20

| Area | Where | Change |
|---|---|---|
| HTML | Title screen | Added a tips box under the menu and a `#ver` version label at the bottom. |
| HTML | Body | Added a `#flash` overlay (white flash for COLOUR BLAST). |
| CSS | `.ver`, `.tips` | Styles for the version label and tips box. |
| CSS | `.block.power`, `.star`, `@keyframes twinkle` | Star block: white ring and glow, twinkling star that replaces the eyes. |
| CSS | `.flyheart`, `.heart.gain`, `@keyframes hgain`, `.hearts.many` | Flying bonus heart, gain bounce, smaller hearts when more than 3 are shown. |
| CSS | `.rechead, .recrow`, `.recrow .h .heart` | Records columns changed to `40px 1fr 48px 78px 70px`; record heart icons shrunk from 16 px to 14 px so 5 fit. |
| JS | Constants | Added `VERSION = '1.2.0'`, `MAX_LIVES = 5`, and `EYES` / `STAR` block-face markup. |
| JS | `Snd.life()`, `Snd.blast()` | New sounds for gaining a life and for COLOUR BLAST. |
| JS | `genItems(level)` | **New.** Places items on a fresh grid: a hidden `'heart'` with chance `min(0.8, 0.45 + 0.05 × level)` and a `'power'` star with chance 0.6, never in the same cell. |
| JS | `setLook(o)` | **New.** Applies a block's colour variables plus its star or eyes. |
| JS | `smash(cell,x,y,w,pitch)` | **New.** Shared bash logic: explosion and sound, and collects a hidden heart if present. |
| JS | `colourBlast(sx,sy,target)` | **New.** Chain-explodes all remaining blocks of the target colour, nearest first, 60 ms apart. Sets `G.chain`, which blocks taps, shuffles and pausing. Calls `colourCleared()` when done. |
| JS | `gainHeart(x,y)` | **New.** +1 life immediately (cap 5), "+1 LIFE!" / "MAX LIVES!" pop-up, heart flies to the hearts bar. |
| JS | `newGame()` | Sets `G.startHearts = 3`. |
| JS | `startLevel()` | Generates `G.items` with each fresh grid (a restart keeps the same items). Hearts start at `G.startHearts`; resets `G.chain` and `G.pauseAfterChain`. |
| JS | `renderGrid()` | Each cell object now has an `item`; its appearance is set via `setLook()`. |
| JS | `renderHearts(breakIdx, gainIdx)` | Shows `max(3, hearts)` hearts and supports a gain animation. |
| JS | `tap()` | Uses `smash()`; a star triggers `colourBlast()`; no word pop-up when a heart is revealed; ignored while `G.chain`. |
| JS | `win()`, `renderRecords()` | Heart rows show up to 5. |
| JS | `tickShuffle()` | Skips while a chain is running. |
| JS | `doShuffle()` | Items move with the blocks (`items` array alongside `cols`); appearance updated via `setLook()`. |
| JS | `pause()` | Deferred during a chain via `G.pauseAfterChain`. |
| JS | Next Level button | Carries extra lives: `G.startHearts = max(3, G.hearts)`. |
| JS | Init | Writes `'v' + VERSION` into `#ver`. |
| Android | `app/build.gradle.kts` | `versionCode` 1 → 3 (2 skipped because 1.1.0 wasn't bumped), `versionName` "1.0" → "1.2.0". |
| Android | `README.md` | Added a Versioning section. |

## 1.1.0 – 2026-10-14

| Area | Where | Change |
|---|---|---|
| HTML | Game screen | Added the shuffle meter row below the board (`#shuf`, `#shufFill`). |
| CSS | `.block.jitter`, `@keyframes jitter` | Pre-shuffle warning wobble. |
| CSS | `.shuf`, `.shuf .track`, `.shuf .fill`, `.shuf.warn`, `@keyframes warn` | Shuffle meter, with a red flash during the warning. |
| JS | `Snd.warn()`, `Snd.shuffle()` | Warning beeps and shuffle whoosh. |
| JS | `shuffleSecs(l)` | **New.** Interval per level: 0 at level 1; 10, 8, 7, 6, 5, 4.5, 4, 3.5, 3.5, 3.5 s for levels 2–11; 3 s from level 12. |
| JS | `shuffleArr(a)` | **New.** Fisher–Yates shuffle helper. |
| JS | `tickShuffle(e)` | **New.** Called every frame with the elapsed game time. Updates the meter, starts the warning 900 ms before a shuffle (choosing `min(1, 0.4 + 0.15 × (level − 2))` of the live blocks), then runs `doShuffle()`. |
| JS | `doShuffle()` | **New.** Swaps colours among the chosen blocks, animates each block from its old position (Web Animations API, 460 ms), and blocks taps for 420 ms. |
| JS | `stopWarn()` | **New.** Clears the jitter and the meter warning. |
| JS | `startLevel()` | Sets up the shuffle schedule (`shufMs`, `nextShuf`, `warned`, `pool`, `shuffling`) and resets the meter. |
| JS | `countdown()` | Adds the "LEVEL n / SHUFFLE EVERY Xs" intro; the 3-2-1 now starts at 1100 ms instead of 550 ms. |
| JS | `tap()` | Ignored while `G.shuffling`; removes `jitter` when a block is bashed or hit wrongly. |
| JS | `gameOver()`, `win()` | Call `stopWarn()`. |
| JS | `pause()` | Pause info includes the shuffle interval. |
| JS | Main loop | Calls `tickShuffle()` when the level has shuffles. Shuffle timing runs on game time, so it is pause-safe. |
| Android | `assets/index.html` | Updated. `versionCode` was not bumped (oversight, corrected in 1.2.0). |

## 1.0.0 – 2026-10-14

Initial build.

- **Files:** `index.html` (game) plus a Java `MainActivity` WebView wrapper, with no third-party dependencies. Builds with AGP 8.13 / Gradle 8.13, `compileSdk` / `targetSdk` 37, `minSdk` 26.
- **Game structure:**
  - `COLOURS`: palette with base, light and dark shades.
  - `Snd`: Web Audio synth.
  - `FX`: canvas particle effects.
  - `G`: game state.
  - Screens: title, game and records. Overlays: pause, game over and win.
- **Storage:** `localStorage` keys `cb_records` (top 50 kept, 20 shown) and `cb_muted`.
- **Android hooks:**
  - `window.cbBack()` for the back button.
  - `window.cbPause()` for auto-pause.
  - `window.AndroidBridge.vibrate(ms)` for haptics.
- **Pre-release fixes:** title font reduced to 13.5vw; particle layer raised above the overlays (z-index 75); overlay titles prevented from wrapping.
