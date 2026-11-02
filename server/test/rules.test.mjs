// Unit tests for the leaderboard rules (run in CI before every deploy): node test/rules.test.mjs
import assert from 'node:assert/strict';
import { checkName, checkScore, maxScore, isoWeek, ukDay, msToUkMidnight, checkDailyFinish } from '../src/rules.js';
const ok = n => assert.ok(!checkName(n).error, `expected "${n}" to be allowed`);
const no = n => assert.ok(checkName(n).error, `expected "${n}" to be rejected`);
['Jamie', 'BlockBasher99', 'Classic', 'Sassy Sue', 'Bass Player', 'Glasshouse', 'Cocktail', 'Hancock', 'Peacock', 'Jamie_D'].forEach(ok);
['ab', 'A very long name here', '<script>', '12345', 'Dreamback', 'admin', 'F u c k', 'Fuuck', 'sh1t', 'ass hat', 'n1gg4'].forEach(no);
// racist / hate terms (whole words, camelCase, leetspeak, stretched, number codes)
['Paki', 'PakiBoy', 'p4ki', 'Coon', 'Chink99', 'Sp1c', 'Wog', 'Kike', 'J4p', 'Negro', 'Honky', 'Gyppo', 'Golliwog', 'Raghead', 'Wetback', 'Darkie',
 'Sieg Heil', 'WhitePower', 'KKK', 'Gamer1488', 'Niiigga', 'Tranny'].forEach(no);
// innocent names that contain those letters must still be allowed
['Pakistan', 'Raccoon', 'Tycoon', 'Cocoon', 'Montenegro', 'Spicy Sam', 'Spice Girl', 'Japan', 'Wogan', 'Nigeria', 'Kraken', 'Sambora', 'Dagobert', 'Woppy', 'Jasper', 'Japonica', 'Player88'].forEach(ok);
assert.equal(checkName('  Spaced   Out  ').name, 'Spaced Out');
assert.equal(maxScore(3), 25500);
assert.ok(!checkScore({ runId: 'abcdef12-1', score: 16150, level: 3, playMs: 61000 }).error);
assert.equal(checkScore({ runId: 'abcdef12-1', score: 4045, level: 1, playMs: 30000 }).error, 'bad_score');
assert.equal(checkScore({ runId: 'abcdef12-1', score: 999990, level: 2, playMs: 60000 }).error, 'too_high');
assert.equal(checkScore({ runId: 'abcdef12-1', score: 5000, level: 3, playMs: 5000 }).error, 'bad_time');
assert.equal(checkScore({ runId: "x'; drop", score: 10, level: 1, playMs: 9000 }).error, 'bad_run');
assert.equal(isoWeek(Date.UTC(2026, 10, 1)), '2026-W44');
assert.equal(isoWeek(Date.UTC(2024, 11, 30)), '2025-W01');
// level times (fastest-level board)
assert.deepEqual(checkScore({ runId: 'abcdef12-1', score: 9000, level: 2, playMs: 70000, levelTimes: [{ level: 1, ms: 31000 }, { level: 2, ms: 38000 }] }).times, [{ level: 1, ms: 31000 }, { level: 2, ms: 38000 }]);
assert.equal(checkScore({ runId: 'abcdef12-1', score: 9000, level: 2, playMs: 70000, levelTimes: [{ level: 3, ms: 31000 }] }).error, 'bad_level_times');   // level not reached
assert.equal(checkScore({ runId: 'abcdef12-1', score: 9000, level: 2, playMs: 70000, levelTimes: [{ level: 1, ms: 2500 }] }).error, 'bad_level_times');    // impossibly fast
assert.equal(checkScore({ runId: 'abcdef12-1', score: 9000, level: 2, playMs: 70000, levelTimes: [{ level: 1, ms: 90000 }] }).error, 'bad_level_times');   // longer than the whole game
assert.equal(checkScore({ runId: 'abcdef12-1', score: 9000, level: 2, playMs: 70000, levelTimes: 'x' }).error, 'bad_level_times');
assert.deepEqual(checkScore({ runId: 'abcdef12-1', score: 9000, level: 2, playMs: 70000 }).times, []);
// Grid of the Day
assert.equal(ukDay(Date.UTC(2026, 10, 1, 23, 30)), '2026-11-01');            // GMT
assert.equal(ukDay(Date.UTC(2026, 6, 1, 23, 30)), '2026-07-02');             // BST: 00:30 UK time
assert.equal(Math.round(msToUkMidnight(Date.UTC(2026, 6, 1, 22, 30)) / 60000), 30);
const att = { started: 1_000_000 };
assert.deepEqual(checkDailyFinish({ ms: 21000, wrong: 1 }, att, 1_000_000 + 30000), { ms: 21000, wrong: 1 });
assert.equal(checkDailyFinish({ ms: 5000, wrong: 0 }, att, 1_000_000 + 30000).error, 'too_fast');
assert.equal(checkDailyFinish({ ms: 15000, wrong: 2 }, att, 1_000_000 + 30000).error, 'too_fast');          // only 5 s of real play once penalties are taken off
assert.equal(checkDailyFinish({ ms: 60000, wrong: 0 }, att, 1_000_000 + 20000).error, 'time_mismatch');   // claims more time than had passed
assert.equal(checkDailyFinish({ ms: 20000, wrong: -1 }, att, 1_000_000 + 30000).error, 'bad_wrong');
// "yesterday" as the server computes it, across clock changes (UK: 29 Mar 2026 = 23 h, 25 Oct 2026 = 25 h)
for (const t of [Date.UTC(2026, 10, 2, 0, 30), Date.UTC(2026, 10, 2, 23, 59), Date.UTC(2026, 2, 29, 0, 30), Date.UTC(2026, 2, 29, 22, 59), Date.UTC(2026, 9, 25, 0, 30), Date.UTC(2026, 9, 25, 23, 30)]) {
  const y = ukDay(t + msToUkMidnight(t) - 27 * 3600 * 1000), today = ukDay(t);
  const exp = new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10) - 1)).toISOString().slice(0, 10);
  assert.equal(y, exp, `yesterday of ${today}`);
}
console.log('rules: all tests passed');
