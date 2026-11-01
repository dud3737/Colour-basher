/* Colour Basher world leaderboard API — Cloudflare Worker + D1.
   Endpoints (JSON):
     GET    /v1/health
     POST   /v1/player            {name}                 -> {name, token}     (join; token = "<id>.<secret>")
     PUT    /v1/player            {name}   [auth]        -> {name}            (rename)
     DELETE /v1/player                     [auth]        -> {deleted:true}    (delete player + all scores)
     POST   /v1/score             {runId, score, level, playMs} [auth] -> {ok, best}
     GET    /v1/leaderboard?period=all|week  [auth optional]  -> {period, week, top[], me}
   Security: the server re-checks everything (the game runs on players' phones and can be tampered with).
   Privacy: stores chosen name, random id, a HASH of the secret token, scores + times. Connection addresses are
   only used as a salted, daily-rotating hash inside short-lived rate-limit keys. */

import { checkName, checkScore, isoWeek } from './rules.js';

const ORIGINS = ['https://www.colourbasher.co.uk', 'https://colourbasher.co.uk'];
const LIMITS = {               // per hashed connection, per window (seconds)
  join:  { n: 5,  win: 3600 },
  write: { n: 40, win: 60 },
  read:  { n: 90, win: 60 },
};
const MAX_BODY = 2048;
export default {
  async fetch(req, env, ctx) {
    const origin = req.headers.get('Origin') || '';
    const devOrigins = (env.DEV_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const allowed = ORIGINS.includes(origin) || devOrigins.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': allowed ? origin : ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const json = (status, data) => new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
    const fail = (status, code, message) => json(status, { error: code, message });

    try {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      const url = new URL(req.url);
      const path = url.pathname.replace(/\/+$/, '');
      if (path === '/v1/health') return json(200, { ok: true, version: env.API_VERSION || '1' });

      // Writes must come from the game's own site (browsers always send Origin on these requests)
      if (req.method !== 'GET' && !allowed) return fail(403, 'origin', 'Not allowed from this site.');

      const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
      const now = Date.now();
      if (Math.random() < 0.02) ctx.waitUntil(env.DB.prepare('DELETE FROM rate WHERE expires < ?').bind(Math.floor(now / 1000)).run());

      if (path === '/v1/leaderboard' && req.method === 'GET') {
        if (await limited(env, 'read', ip)) return fail(429, 'slow_down', 'Too many requests – try again in a minute.');
        const period = url.searchParams.get('period') === 'week' ? 'week' : 'all';
        const week = isoWeek(now);
        const me = await authPlayer(env, req);
        return json(200, await leaderboard(env, period === 'week' ? week : null, me, period, week));
      }

      if (path === '/v1/player' && req.method === 'POST') {
        if (await limited(env, 'join', ip)) return fail(429, 'slow_down', 'Too many new names from here – try again later.');
        const body = await readJson(req); if (!body) return fail(400, 'bad_request', 'Bad request.');
        const v = checkName(body.name); if (v.error) return fail(400, v.error, v.message);
        if (await nameTaken(env, v.key)) return fail(409, 'name_taken', 'That name is taken – try another.');
        const id = crypto.randomUUID();
        const secret = hex(crypto.getRandomValues(new Uint8Array(24)));
        await env.DB.prepare('INSERT INTO players (id, name, name_key, token_hash, created, updated) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, v.name, v.key, await sha256(secret), now, now).run();
        return json(201, { name: v.name, token: `${id}.${secret}` });
      }

      if (path === '/v1/player' && (req.method === 'PUT' || req.method === 'DELETE')) {
        if (await limited(env, 'write', ip)) return fail(429, 'slow_down', 'Too many requests – try again in a minute.');
        const me = await authPlayer(env, req); if (!me) return fail(401, 'auth', 'Please join again.');
        if (req.method === 'DELETE') {
          await env.DB.batch([
            env.DB.prepare('DELETE FROM scores WHERE player_id = ?').bind(me.id),
            env.DB.prepare('DELETE FROM players WHERE id = ?').bind(me.id),
          ]);
          return json(200, { deleted: true });
        }
        const body = await readJson(req); if (!body) return fail(400, 'bad_request', 'Bad request.');
        const v = checkName(body.name); if (v.error) return fail(400, v.error, v.message);
        if (v.key !== me.name_key && await nameTaken(env, v.key)) return fail(409, 'name_taken', 'That name is taken – try another.');
        await env.DB.prepare('UPDATE players SET name = ?, name_key = ?, updated = ? WHERE id = ?').bind(v.name, v.key, now, me.id).run();
        return json(200, { name: v.name });
      }

      if (path === '/v1/score' && req.method === 'POST') {
        if (await limited(env, 'write', ip)) return fail(429, 'slow_down', 'Too many requests – try again in a minute.');
        const me = await authPlayer(env, req); if (!me) return fail(401, 'auth', 'Please join again.');
        const b = await readJson(req); if (!b) return fail(400, 'bad_request', 'Bad request.');
        const c = checkScore(b); if (c.error) return fail(422, c.error, 'Score not accepted.');
        const prev = await env.DB.prepare('SELECT score, level, play_ms FROM scores WHERE player_id = ? AND run_id = ?').bind(me.id, c.runId).first();
        if (prev) {
          // a run only ever moves forward
          if (c.score < prev.score || c.level < prev.level || c.playMs < prev.play_ms) return fail(422, 'run_backwards', 'Score not accepted.');
          await env.DB.prepare('UPDATE scores SET score = ?, level = ?, play_ms = ?, week = ?, updated = ? WHERE player_id = ? AND run_id = ?')
            .bind(c.score, c.level, c.playMs, isoWeek(now), now, me.id, c.runId).run();
        } else {
          await env.DB.prepare('INSERT INTO scores (player_id, run_id, score, level, play_ms, week, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(me.id, c.runId, c.score, c.level, c.playMs, isoWeek(now), now, now).run();
        }
        const best = await env.DB.prepare('SELECT MAX(score) AS best FROM scores WHERE player_id = ?').bind(me.id).first();
        return json(200, { ok: true, best: best ? best.best : c.score });
      }

      return fail(404, 'not_found', 'Not found.');
    } catch (e) {
      return fail(500, 'server', 'Something went wrong – try again later.');
    }
  },
};

/* ---------- data ---------- */
async function leaderboard(env, weekOrNull, me, period, week) {
  const best = `WITH best AS (
      SELECT s.player_id, s.score, s.level, s.created,
             ROW_NUMBER() OVER (PARTITION BY s.player_id ORDER BY s.score DESC, s.created ASC) AS rn
      FROM scores s JOIN players p ON p.id = s.player_id
      WHERE p.hidden = 0 AND (?1 IS NULL OR s.week = ?1))`;
  const top = await env.DB.prepare(`${best}
      SELECT b.player_id, p.name, b.score, b.level FROM best b JOIN players p ON p.id = b.player_id
      WHERE b.rn = 1 ORDER BY b.score DESC, b.created ASC LIMIT 20`).bind(weekOrNull).all();
  const rows = (top.results || []).map((r, i) => ({ rank: i + 1, name: r.name, score: r.score, level: r.level, me: !!(me && r.player_id === me.id) }));
  let mine = null;
  if (me) {
    const row = await env.DB.prepare(`${best} SELECT score, level, created FROM best WHERE rn = 1 AND player_id = ?2`).bind(weekOrNull, me.id).first();
    if (row) {
      const ahead = await env.DB.prepare(`${best} SELECT COUNT(*) AS n FROM best WHERE rn = 1 AND (score > ?2 OR (score = ?2 AND created < ?3))`)
        .bind(weekOrNull, row.score, row.created).first();
      mine = { name: me.name, rank: (ahead ? ahead.n : 0) + 1, score: row.score, level: row.level, hidden: !!me.hidden };
    } else mine = { name: me.name, rank: null, score: null, level: null, hidden: !!me.hidden };
  }
  return { period, week, top: rows, me: mine };
}

async function authPlayer(env, req) {
  const h = req.headers.get('Authorization') || '';
  const m = /^Bearer ([0-9a-f-]{36})\.([0-9a-f]{48})$/.exec(h);
  if (!m) return null;
  const p = await env.DB.prepare('SELECT id, name, name_key, token_hash, hidden FROM players WHERE id = ?').bind(m[1]).first();
  if (!p) return null;
  const a = new TextEncoder().encode(await sha256(m[2])), b = new TextEncoder().encode(p.token_hash);
  if (a.length !== b.length || !crypto.subtle.timingSafeEqual(a, b)) return null;
  return p;
}

async function nameTaken(env, key) {
  return !!(await env.DB.prepare('SELECT 1 FROM players WHERE name_key = ?').bind(key).first());
}

async function limited(env, kind, ip) {
  const L = LIMITS[kind], now = Math.floor(Date.now() / 1000), bucket = Math.floor(now / L.win);
  const day = new Date().toISOString().slice(0, 10);
  const who = (await sha256(`${day}|${ip}|colourbasher-rate`)).slice(0, 24);   // salted + rotates daily
  const row = await env.DB.prepare(
    'INSERT INTO rate (key, count, expires) VALUES (?1, 1, ?2) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count'
  ).bind(`${kind}:${who}:${bucket}`, (bucket + 1) * L.win).first();
  return row && row.count > L.n;
}

/* ---------- helpers ---------- */
async function readJson(req) {
  const len = +(req.headers.get('Content-Length') || 0);
  if (len > MAX_BODY) return null;
  const text = await req.text();
  if (text.length > MAX_BODY) return null;
  try { const v = JSON.parse(text); return v && typeof v === 'object' && !Array.isArray(v) ? v : null; } catch { return null; }
}
async function sha256(s) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))); }
function hex(bytes) { return [...bytes].map(b => b.toString(16).padStart(2, '0')).join(''); }
