# Changelog

All notable changes to Colour Basher, newest first.
Version numbers follow MAJOR.MINOR.PATCH: new features bump MINOR, fixes and tweaks bump PATCH.
The technical detail behind each release is in `CODE-CHANGES.md`.

## [1.8.0] – 2026-10-22

### Added
- **Power-ups**, from level 7 onwards (after the second bonus round). They're hidden inside blocks: bash the block to find one, and it flies into the new **POWER-UPS** bar under the grid.
  - **★ Star power-up:** tap it, and the board glows gold with the hint "Tap any block to blast its colour". The next block you tap blasts every block of that colour, with no penalty even if it isn't the target colour. If you pick a colour other than the target, it's cleared now and the target you were on comes next. Tap ★ again to cancel without using it.
  - **❄ Freeze power-up:** stops shuffles for 15 seconds of play time. The shuffle meter turns icy blue and reads FROZEN, and the bar shows a countdown. Using it during a shuffle warning cancels that shuffle. Using another while frozen adds 15 seconds more.
  - **Finding them:** each level from 7 has a 35% chance of hiding a star and, separately, a 35% chance of hiding a freeze. Finding one scores +100. If a hidden power-up is moved by a shuffle, it stays hidden in the block it moved to.
  - **Keeping them:** you can hold up to 3 of each, shown as a red count badge (greyed out at 0). They carry over between levels and through bonus rounds; the bar is hidden during bonus rounds. Restarting a level returns your power-ups to what you had at its start, just like your score. A new game starts with none.
- Home-screen tips now mention power-ups from level 7.
- Debug menu: **Power-ups** option (0, 1 or 3 of each) for debug starts. The level note says when power-ups can be found.

### Changed
- The board is slightly smaller on short screens, to make room for the power-ups bar. On most phones it's unchanged.

## [1.7.7] – 2026-10-21

### Changed
- The iPhone zoom fixes from 1.7.3–1.7.5 now switch on **only in Safari's engine**. That covers Safari on iPhone and iPad (and other browsers there, which all use Safari's engine).
- **Android Chrome** now handles touches exactly as it did before those fixes, with no extra touch listeners and no change to scrolling in Records or Settings.
- iPhone behaviour is unchanged.

## [1.7.6] – 2026-10-21

### Changed
- The **level intro** ("LEVEL 4 / SHUFFLE EVERY 7s") and **bonus intro** ("BONUS! / BASH ALL 25 IN 10s") now stay on screen for about 2 seconds. Previously they slid past in under 1 second. The intro pops in, holds in the centre, then fades, and the 3-2-1-GO countdown starts straight after.
- **No change to game timings.** The level timer still starts at GO, so level times, bonus time limits and shuffle timing are exactly as before. The only difference is about 1.2 seconds more to read the intro before the countdown.

## [1.7.5] – 2026-10-21

### Fixed
- **Zooming while bashing on iPhone (second attempt).** 1.7.4 didn't stop it on Safari. This version takes a firmer approach:
  - The board now cancels Safari's own touch handling completely, so no tap, double-tap or rapid bashing on the grid can trigger zoom. Taps still bash blocks exactly as before.
  - Quick double-taps anywhere else (background, HUD) are swallowed too; buttons are unaffected.
  - **Safety net:** if Safari still zooms in during a game, the game immediately snaps back to normal size.

## [1.7.4] – 2026-10-21

### Fixed
- **Random zoom while bashing on iPhone.** Tapping blocks quickly could trigger Safari's double-tap zoom, and because 1.7.3 blocks pinching, you couldn't zoom back out. This was caused by 1.7.3: the setting it used to stop zooming isn't fully supported by Safari, and it replaced the one that was stopping double-tap zoom. The changelog for 1.7.3 wrongly said double-tap zoom was blocked.
  - The board now ignores double-tap zoom entirely, while every tap still bashes its block.
  - The rest of the screen is back to the setting Safari supports for blocking double-tap zoom.
  - **Escape hatch:** if the page ever does end up zoomed, pinching is allowed again so you can zoom back out. Pinch-to-zoom-in stays blocked at normal size.

## [1.7.3] – 2026-10-21

### Fixed
- **Pinch-zoom on iPhone.** Safari ignores the usual "no zoom" setting, so pinching zoomed into the game. Pinch-zoom and double-tap zoom are now blocked. Normal scrolling (Records, Settings) and multi-finger tapping in bonus rounds still work.
- **Confetti getting stuck on screen.** Pieces of confetti and explosion effects could stay frozen after the animation ended, especially after zooming on iPhone. The effects layer now always wipes the whole screen when it finishes.

## [1.7.2] – 2026-10-21

### Fixed
- **Web app updates now show up straight away.** After a new version went live, refreshing could keep showing the old one for up to 10 minutes, because GitHub Pages lets browsers reuse a saved copy and the offline support accepted it.
  - The game page is now always re-checked with the server, so one refresh shows the new version.
  - A game that's already open updates itself on the home screen: it refreshes once when a newer version arrives.
  - It never refreshes in the middle of a level; it waits until you're back on the home screen.
  - Offline play is unchanged.
- Phones still on 1.7.1 may need two refreshes to pick up this version; after that, one refresh is enough.

## [1.7.1] – 2026-10-21

### Changed
- The **Debug · Testing** tools in Settings are now locked behind a password.
  - Settings shows a 🔒 password box with an UNLOCK button; pressing Enter on the keyboard also works.
  - A wrong or empty entry shakes the box and says "Wrong password" or "Enter the password".
  - Once unlocked, the debug tools stay open until the game is closed or reloaded.
  - The sound switch in Settings isn't locked.

## [1.7.1] – 2026-10-21

### Changed
- The **Debug · Testing** tools in Settings are now locked behind a password. Settings shows a 🔒 password box with an UNLOCK button (Enter also works); the sound switch stays available to everyone.
  - A wrong password shows "Wrong password" with a shake.
  - The correct password reveals the debug tools, and they stay unlocked until the game is closed or reloaded.
  - Only a scrambled (SHA-256) fingerprint of the password is stored in the game, not the password itself.

## [1.7.0] – 2026-10-21

### Added
- **Installable web app.** Colour Basher can now be hosted as a website and shared with a link. See `HOSTING.md`.
  - Players can install it from the browser: "Install app" on Android Chrome, "Add to Home Screen" on iPhone Safari. It then gets its own icon and opens full screen in portrait, with no browser bars.
  - Works **offline** after the first visit.
  - Online players always get the newest version when they open the game.
  - The browser is asked to keep records and scores safe from automatic clean-up.
  - New icons in the same style as the Android launcher icon.
- **Back button in the browser** now behaves like the Android app instead of leaving the page:
  - During play it pauses, and pressing it again while paused resumes.
  - It closes Settings, and steps back from Records or the results screens to the home screen.
  - On the home screen it leaves the game as normal.

### Unchanged
- The Android app and the Claude-hosted page behave as before; the web-app features only switch on when the game runs as a normal website.

## [1.6.0] – 2026-10-21

### Added
- **MOTIVATION** button on the level-complete screen, between Next Level and Quit to Title. Tapping it shows a random inspirational message in big, colourful, bouncing letters, with confetti and a jingle:
  - You are the greatest!
  - You are the best!
  - There is no stopping you!
  - Bash those blocks!
  - Life is a highway!
  - Intensity. Integrity. Intelligence!
  - 🔥🔥 You are 🔥🔥
- The same message never appears twice in a row.
- Under the message: **NEXT LEVEL** (it reads BONUS ROUND! when a bonus round is next) and **BACK TO MENU**.
- The button appears after normal levels only, not on the bonus round results screen.

## [1.5.1] – 2026-10-21

### Changed
- All points now come in multiples of 10, so scores always end in 0.
  - **Level time bonus:** 10 points per *whole* second under 90 s (was rounded to the nearest tenth of a second, which gave totals like 664).
  - **Bonus round time-left bonus:** 100 per second, counted in tenths of a second (10 points per 0.1 s).
  - **Bonus round blocks:** worth 30 points each (was 25, which gave totals like 625).
- Scores already saved in Top scores keep their old values.

## [1.5.0] – 2026-10-21

### Added
- Points system.
  - **During a level:** 10 points per block, with a combo multiplier: ×2 from a 5-hit combo, ×3 from 10, ×4 from 15 upwards. +100 for each colour cleared, 20 per block destroyed by a COLOUR BLAST, and +100 for finding a hidden heart (only when it actually gives you a life). Wrong taps don't cost points.
  - **On clearing a level:** time bonus (10 points for every second under 90 s), lives bonus (200 per heart left) and level bonus (250 × level number).
  - **Bonus rounds:** 25 per block. Clearing the whole grid adds a 500 clear bonus plus 100 per second left.
  - The score runs across the whole game. Restarting a level after Game Over (or from Pause) puts your score back to what it was at the start of that level, and the Game Over screen says so.
- Scoreboard in the top right: the timer box now shows TIME and SCORE together. The score ticks up as you earn points, and a small white "+N" appears just below the scoreboard (never on the blocks). The BASH!/ドカン!/combo pop-ups are unchanged.
- Points breakdown on the win and bonus screens, with each line appearing in turn and the total counting up. "NEW HIGH!" shows the first time a game passes your previous best score.
- Records now has two tabs: **Fastest times** and **Top scores** (top 20 games, with the level reached and date). CLEAR clears the tab you're looking at.
- The home screen shows your high score next to your best time.
- Debug runs score points for testing but are never saved.

## [1.4.1] – 2026-10-21

### Changed
- Hidden bonus lives are no longer wasted at max lives. Bashing a hidden-heart block while you have 5 lives no longer plays a pointless "+1 LIFE" animation. The heart quietly moves to another block that's still on the board, so you can collect it once you've dropped below 5. It only disappears if no blocks are left to move to.
- Debug menu: new **Lives** option (3, 4 or 5) to set the starting lives for debug levels and bonus rounds.

## [1.4.0] – 2026-10-21

### Added
- Settings menu: a ⚙️ button at the top left of the home screen. It has a sound on/off switch and a **Debug · Testing** section:
  - **Level select:** choose any level from 1 to 50 (−5, −1, +1 and +5 buttons). A note shows that level's shuffle speed, how many blocks move, and whether a bonus round follows it. Then tap PLAY LEVEL.
  - **Bonus round select:** pick 5×5, 6×6 or 7×7 and play it straight away (the button shows the time limit).
  - From a debug start, the game carries on normally: Next Level, the bonus rounds every third level, and so on.
- Debug runs are clearly marked:
  - An orange DEBUG tag sits under the level box.
  - The win and bonus screens show "DEBUG RUN – NOT SAVED".
  - Nothing from a debug run goes into Records or the saved bonus results.
- Starting a normal New Game switches debug mode off.
- On Android, the back button closes the settings menu.

## [1.3.3] – 2026-10-21

### Changed
- 7×7 bonus rounds (the 3rd bonus onwards, after levels 9, 12…) now give 15 seconds instead of 10. The 5×5 and 6×6 bonus rounds stay at 10 seconds. The intro ("BASH ALL 49 IN 15s"), countdown timer and pause screen all use the new time.

## [1.3.2] – 2026-10-21

### Fixed
- Fixed a crash in the explosion effects ("IndexSizeError: … radius provided is negative"). It could happen in browsers or embedded views (such as the Claude app) whose animation frame times lag slightly behind the tap. Explosions now never run backwards, and shockwave rings and flashes can't get a negative size.

## [1.3.1] – 2026-10-21

### Changed
- Bonus rounds are now easier and ramp up: fewer, bigger blocks on the same size board.
  - 1st bonus (after level 3): 5×5, 25 blocks.
  - 2nd bonus (after level 6): 6×6, 36 blocks.
  - 3rd bonus onwards (after levels 9, 12…): 7×7, 49 blocks.
  - Still 10 seconds. (Previously every bonus round was 8×8 with 64 blocks.)
- The bonus intro, result ("bashed X / 25" etc.) and "So close!" threshold (within 5 blocks) now follow the grid size.
- Block bevels and shadows scale with block size, so bigger blocks keep the same look.

## [1.3.0] – 2026-10-21

### Added
- Bonus round after every third level (after levels 3, 6, 9 and so on). It isn't part of the level numbering: level 3 is followed by the bonus round, then level 4.
  - The grid is all one random colour: 64 blocks to bash in 10 seconds.
  - The timer counts down from 10.0 and is labelled TIME LEFT. It turns red and pulses for the last 3 seconds, with a tick each second.
  - The level box shows BONUS ★, the board has a pulsing gold glow, and the colour-order chips and shuffle meter are hidden.
  - Intro banner: "BONUS! / BASH ALL 64 IN 10s".
  - No shuffles, stars or hidden hearts, and every tap is correct, so you can't lose hearts.
  - Clearing all 64 shows "PERFECT!" with the time left over. Running out of time shows "TIME UP!" with how many you bashed (for example 44 / 64).
  - One attempt only: there's no restart option during the bonus round. Pausing is allowed and stops the clock.
  - Your hearts carry through the bonus round into the next level unchanged.
- The win screen's button reads "BONUS ROUND!" when a bonus round is next.
- Each bonus result is saved on the device, ready for the rewards to come. Bonus rounds don't appear in Records.

## [1.2.2] – 2026-10-20

### Fixed
- The "colour cleared / NEXT" message could disappear early if a shuffle happened around the same time:
  - If a shuffle fired just after you cleared a colour, "SHUFFLE!" replaced the message straight away.
  - If you cleared a colour just after a shuffle, the shuffle's leftover timer wiped the message after about half a second.
  - The message now always stays up for its full time.

### Changed
- While the colour-cleared message is showing, a shuffle no longer covers it with "SHUFFLE!". The shuffle meter's label flashes yellow instead, and it now flashes on every shuffle.

## [1.2.1] – 2026-10-20

### Changed
- Redesigned the "colour cleared" message so the next colour is what you read first:
  - The colour you just cleared now appears as a small pill with a tick ("✓ ORANGE CLEARED") in that colour.
  - "NEXT" plus the next colour's name, large and in that colour, is now the main element.
- The message now pops into the centre of the board, holds for about a second and fades out. Previously it slid across the board and could be cut off mid-move.
- A dark, slightly see-through panel sits behind the message so it stands out against the blocks.

## [1.2.0] – 2026-10-20

### Added
- Version number shown at the bottom of the title screen.
- Hidden bonus lives. Some levels hide a heart inside one block, revealed only when that block is bashed. Bashing it gives +1 life and the heart flies up to the hearts bar.
  - Chance per level starts at 50% and rises 5% per level, up to 80%.
  - You can hold up to 5 lives.
  - Extra lives carry into the next level; if you finish with fewer than 3, you start the next level with 3.
- Star power-up. On about 60% of levels one block shows a glowing star instead of a face. Bash it when its colour is the target and every remaining block of that colour explodes in a chain reaction ("COLOUR BLAST!"). Tapping it out of turn still costs a heart.
- Tips box on the title screen explaining the star block and hidden hearts.

### Changed
- The hearts bar grows to show up to 5 hearts, using smaller icons above 3.
- The win screen and Records screen show bonus hearts.
- Shuffles now carry hidden hearts and stars along with the blocks that move.

## [1.1.0] – 2026-10-14

### Added
- Levels get progressively harder through shuffles, starting at level 2:
  - Shuffle interval: 10 s at level 2, then 8, 7, 6, 5, 4.5, 4 and 3.5 s, reaching 3 s from level 12.
  - Share of blocks moved: 40% at level 2, rising 15% per level, so every block moves from level 6.
- Shuffle meter under the grid that fills up towards the next shuffle.
- Shuffle warning in the last 0.9 s: the blocks about to move jitter, the meter flashes red and a warning beep plays.
- Level intro at the start of each level showing "LEVEL n" and the shuffle speed.
- Shuffle speed shown on the pause screen.

### Changed
- The 3-2-1 countdown now starts just after the level intro.
- Taps are ignored during the brief (~0.4 s) shuffle animation so you can't hit a block mid-move.

## [1.0.0] – 2026-10-14

First release.

- Title screen with New Game, Records, best time and sound toggle.
- 8×8 grid filled at random from seven colours (blue, red, green, yellow, orange, purple, pink), with every colour guaranteed to appear.
- Target colour shown above the grid with a count of blocks left, plus a row of chips showing the colour order.
- Timer (top right) that counts up from "GO!".
- Three hearts. Bashing the wrong colour costs one; losing all three means Game Over, with the option to restart the same grid.
- Explosion effects, combo counter, screen shake, synthesised sound effects and vibration.
- "YOU WIN" screen with your time; each win is saved to Records (top 20 shown).
- Level counter with a new random grid each level.
- Pause button that blurs the board, plus auto-pause when you leave the app.
- Light and dark mode.
- Android app wrapper: full screen, back-button support, vibration.
