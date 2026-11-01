/* Pure validation rules for the leaderboard API (no I/O) — kept separate so they can be unit-tested. */
const RESERVED = ['admin', 'administrator', 'moderator', 'mod', 'colourbasher', 'colorbasher', 'dreamback', 'official', 'system', 'support', 'staff'];
/* Name filter. Long, unambiguous words are blocked anywhere in a name; short ones only as whole words
   (so "Classic" or "Scunthorpe"-style names aren't caught). Extend as needed; moderators can also hide players. */
const BLOCK_ANYWHERE = ['fuck', 'shit', 'cunt', 'bitch', 'bastard', 'wank', 'twat', 'pussy', 'slut', 'whore',
  'nigg', 'fagg', 'retard', 'rapist', 'nazi', 'hitler', 'porn', 'penis', 'vagina', 'bollock', 'arsehole', 'asshole', 'bellend', 'tosser', 'spastic', 'paedo', 'pedo'];
const BLOCK_WORDS = ['ass', 'arse', 'fag', 'cum', 'sex', 'tit', 'tits', 'piss', 'kkk', 'jizz', 'spaz', 'dick', 'dicks', 'cock', 'cocks', 'prick', 'pricks'];

export function checkName(raw) {
  if (typeof raw !== 'string') return { error: 'name_invalid', message: 'Please enter a name.' };
  const name = raw.normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (name.length < 3 || name.length > 14) return { error: 'name_length', message: 'Names need 3 to 14 characters.' };
  if (!/^[A-Za-z0-9 _-]+$/.test(name)) return { error: 'name_chars', message: 'Use letters, numbers, spaces, - or _ only.' };
  if (!/[A-Za-z]/.test(name)) return { error: 'name_chars', message: 'Names need at least one letter.' };
  const key = name.toLowerCase().replace(/[ _-]+/g, '');
  const flat = key.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/[^a-z]/g, '');
  const words = name.toLowerCase().replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').split(/[ _-]+|(?<=[a-z])(?=[0-9])|(?<=[0-9])(?=[a-z])/);
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
export const MIN_MS_PER_LEVEL = 4000;   // 64 deliberate taps + countdown-free play time can't be faster than this

export function checkScore(b) {
  const runId = b.runId, score = b.score, level = b.level, playMs = b.playMs;
  if (typeof runId !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(runId)) return { error: 'bad_run' };
  if (!Number.isInteger(level) || level < 1 || level > 999) return { error: 'bad_level' };
  if (!Number.isInteger(score) || score < 0 || score % 10 !== 0) return { error: 'bad_score' };
  if (score > maxScore(level)) return { error: 'too_high' };
  if (!Number.isInteger(playMs) || playMs < level * MIN_MS_PER_LEVEL || playMs > 6 * 3600 * 1000) return { error: 'bad_time' };
  return { runId, score, level, playMs };
}

export function isoWeek(ms) {   // ISO-8601 week (UTC), e.g. "2026-W44"
  const d = new Date(ms); const day = (d.getUTCDay() + 6) % 7;
  const th = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day + 3));
  const y = th.getUTCFullYear(), jan4 = new Date(Date.UTC(y, 0, 4));
  const w = 1 + Math.round(((th - jan4) / 864e5 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}
