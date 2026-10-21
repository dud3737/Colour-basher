# Code changes by version

The technical record behind `CHANGELOG.md`.

- **Game code:** `app/src/main/assets/index.html` (identical to the standalone `colour-basher.html`).
- **Android wrapper:** `app/src/main/java/com/colourbasher/game/MainActivity.java` and `app/build.gradle.kts`.
- **Snapshots:** from 1.2.1 onwards, each release's full game file is kept in `versions/`.
- **Diffs:** exact line-by-line diffs between releases are in `versions/diffs/`.

Releases before 1.2.1 weren't snapshotted separately, so their entries below list every changed function, style and setting rather than exact diffs.

## Release checklist (every build)

1. Bump `VERSION` near the top of the script in `index.html`.
2. Bump `versionName` to match and increase `versionCode` by 1 in `app/build.gradle.kts`.
3. Test in a headless browser. Use Settings → Debug to jump straight to the affected level or bonus round and set the starting lives. Play through normally from level 1 when the change affects progression (level → bonus → level) or lives carried between levels. Compare against the previous version when fixing a bug.
4. Add an entry to `CHANGELOG.md` (player-facing) and to this file (technical, including what was tested).
5. Save the new game file as `versions/colour-basher-X.Y.Z.html`.
6. Generate the diff:
   `diff -u versions/colour-basher-OLD.html versions/colour-basher-NEW.html > versions/diffs/OLD-to-NEW.diff`
7. Copy the game file to `app/src/main/assets/index.html`, then run `python3 tools/build_web.py` to rebuild the web app in `web/`. Rebuild the Android APK if needed.
8. **Back up (every build):** `GITHUB_TOKEN=<token> python3 tools/backup_github.py` saves the whole project (changelog, code-changes, snapshots, diffs, Android project, web app, tools) to the `backup` branch of `dud3737/Colour-basher` as one commit. It never touches the live site.
9. **Deploy (only when Jamie says so):** `GITHUB_TOKEN=<token> python3 tools/deploy_github.py` pushes the changed `web/` files as one commit to `main` and waits for the GitHub Pages build. Check that https://dud3737.github.io/Colour-basher/ shows the new version. The token is never stored in the project.
10. **Hand over** `CHANGELOG.md` and `CODE-CHANGES.md`, and update the published Claude page. The versioned HTML, `ColourBasher-android-vX.Y.Z.zip` and `ColourBasher-web-vX.Y.Z.zip` are only made on request.

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
