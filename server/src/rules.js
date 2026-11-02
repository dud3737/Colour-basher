/* Pure validation rules for the leaderboard API (no I/O) — kept separate so they can be unit-tested. */
const RESERVED = ['admin', 'administrator', 'moderator', 'mod', 'colourbasher', 'colorbasher', 'dreamback', 'official', 'system', 'support', 'staff'];
/* Name filter. Long, unambiguous words are blocked anywhere in a name; short ones only as whole words
   (so "Classic" or "Scunthorpe"-style names aren't caught). Extend as needed; moderators can also hide players. */
const BLOCK_ANYWHERE = ['fuck', 'shit', 'cunt', 'bitch', 'bastard', 'wank', 'twat', 'pussy', 'slut', 'whore',
  'nigg', 'fagg', 'retard', 'rapist', 'nazi', 'hitler', 'porn', 'penis', 'vagina', 'bollock', 'arsehole', 'asshole', 'bellend', 'tosser', 'spastic', 'paedo', 'pedo',
  // racist / hate terms that don't appear inside ordinary words
  'niga', 'darkie', 'darky', 'golliwog', 'wetback', 'raghead', 'towelhead', 'jigaboo', 'redskin', 'chinaman', 'zipperhead', 'slanteye',
  'siegheil', 'whitepower', 'whitepride', 'kukluxklan', 'heilhit', 'gaschamber', 'killjews', 'killblacks', 'killmuslims'];
const BLOCK_WORDS = ['ass', 'arse', 'fag', 'cum', 'sex', 'tit', 'tits', 'piss', 'kkk', 'jizz', 'spaz', 'dick', 'dicks', 'cock', 'cocks', 'prick', 'pricks',
  // racist / hate terms that are only blocked as whole words, because they appear inside innocent words or places
  // (e.g. Pakistan, raccoon, tycoon, Montenegro, spicy, Japan, Wogan)
  'paki', 'pakis', 'coon', 'coons', 'negro', 'negros', 'chink', 'chinks', 'gook', 'gooks', 'spic', 'spick', 'spics', 'kike', 'kikes', 'wog', 'wogs',
  'jap', 'japs', 'sambo', 'gyppo', 'gypo', 'pikey', 'pikeys', 'honky', 'kraut', 'yid', 'yids', 'wop', 'wops', 'dago', 'beaner', 'beaners', 'tranny', 'nignog'];

export function checkName(raw) {
  if (typeof raw !== 'string') return { error: 'name_invalid', message: 'Please enter a name.' };
  const name = raw.normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (name.length < 3 || name.length > 14) return { error: 'name_length', message: 'Names need 3 to 14 characters.' };
  if (!/^[A-Za-z0-9 _-]+$/.test(name)) return { error: 'name_chars', message: 'Use letters, numbers, spaces, - or _ only.' };
  if (!/[A-Za-z]/.test(name)) return { error: 'name_chars', message: 'Names need at least one letter.' };
  const key = name.toLowerCase().replace(/[ _-]+/g, '');
  const flat = key.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/[^a-z]/g, '');
  if (/(^|[^0-9])(1488|14 88)([^0-9]|$)/.test(name)) return { error: 'name_not_allowed', message: "That name isn't allowed – try another." };   // white-supremacist code
  const words = name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').split(/[ _-]+|(?<=[a-z])(?=[0-9])|(?<=[0-9])(?=[a-z])/);
  const squashed = flat.replace(/(.)\1+/g, '$1');   // catches stretched spellings like "fuuuck"
  if (BLOCK_ANYWHERE.some(w => flat.includes(w) || squashed.includes(w)) || words.some(w => BLOCK_WORDS.includes(w.replace(/[^a-z]/g, '')))) {
    return { error: 'name_not_allowed', message: "That name isn't allowed – try another." };
  }
  if (RESERVED.includes(flat)) return { error: 'name_not_allowed', message: "That name isn't allowed – try another." };
  return { name, key };
}

/* Generous upper bound for a whole game's score after `level` levels (incl. bonus rounds), from the points rules:
   a level is at most ~2,560 (64 blocks × 10 × ×4 combo) + 700 colours + power-ups/hearts + 900 time + 1,000 lives
   + 250 × level, and a bonus round at most ~3,500. Anything above this is not humanly possible. */
export const maxScore = level => 8000 * level + 125 * level * (level + 1);
export const MIN_MS_PER_LEVEL = 4000;
/* Fastest single level: with a star block plus up to 3 star power-ups (level 7+) a few colours can go in one tap each,
   but the rest still need ~30 deliberate taps, so nothing under 3 s is humanly possible. */
export const MIN_LEVEL_MS = 3000;   // 64 deliberate taps + countdown-free play time can't be faster than this

export function checkScore(b) {
  const runId = b.runId, score = b.score, level = b.level, playMs = b.playMs;
  if (typeof runId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(runId)) return { error: 'bad_run' };
  if (!Number.isInteger(level) || level < 1 || level > 999) return { error: 'bad_level' };
  if (!Number.isInteger(score) || score < 0 || score % 10 !== 0) return { error: 'bad_score' };
  if (score > maxScore(level)) return { error: 'too_high' };
  if (!Number.isInteger(playMs) || playMs < level * MIN_MS_PER_LEVEL || playMs > 6 * 3600 * 1000) return { error: 'bad_time' };
  // optional: times of individual completed levels in this game (fastest-level board)
  const times = [];
  if (b.levelTimes !== undefined) {
    if (!Array.isArray(b.levelTimes) || b.levelTimes.length > 60) return { error: 'bad_level_times' };
    for (const t of b.levelTimes) {
      if (!t || !Number.isInteger(t.level) || !Number.isInteger(t.ms)) return { error: 'bad_level_times' };
      if (t.level < 1 || t.level > level) return { error: 'bad_level_times' };                       // can't have finished a level you haven't reached
      if (t.ms < MIN_LEVEL_MS || t.ms > 30 * 60 * 1000 || t.ms > playMs) return { error: 'bad_level_times' };
      times.push({ level: t.level, ms: t.ms });
    }
  }
  return { runId, score, level, playMs, times };
}

export function isoWeek(ms) {   // ISO-8601 week (UTC), e.g. "2026-W44"
  const d = new Date(ms); const day = (d.getUTCDay() + 6) % 7;
  const th = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day + 3));
  const y = th.getUTCFullYear(), jan4 = new Date(Date.UTC(y, 0, 4));
  const w = 1 + Math.round(((th - jan4) / 864e5 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}
