#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
//  trial-sign-server.mjs · local Konomi trial signer for forge.html
//  Runs on YOUR laptop. Holds the master key. Signs 14-day trial envelopes.
//  forge.html calls localhost:9991 during in-meeting builds.
//
//  Setup (one-time):
//    $env:KONOMI_PRIVATE_KEY = "<your 32-byte base64 seed>"
//
//  Run (before every client meeting):
//    node scripts/trial-sign-server.mjs
//
//  Stays running. Forge calls it on every BUILD click. Stop with Ctrl+C.
//
//  Security: server binds 127.0.0.1 only. Never expose to public internet.
//  ◊·κ=1 · prime 23 · GymOS production trial path
// ═══════════════════════════════════════════════════════════════════

import http from 'node:http';
import crypto from 'node:crypto';

const PORT = parseInt(process.env.TRIAL_SIGN_PORT || '9991', 10);
const PRIV_RAW = process.env.KONOMI_PRIVATE_KEY;

if (!PRIV_RAW) {
  console.error('✗ KONOMI_PRIVATE_KEY env var not set');
  console.error('  In PowerShell:  $env:KONOMI_PRIVATE_KEY = "<32-byte base64 seed>"');
  console.error('  Then re-run.');
  process.exit(1);
}

const seed = Buffer.from(PRIV_RAW, 'base64');
if (seed.length !== 32) {
  console.error('✗ KONOMI_PRIVATE_KEY must decode to 32 bytes (got ' + seed.length + ')');
  process.exit(1);
}
const PKCS8_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex');
const PRIV_KEY = crypto.createPrivateKey({
  key: Buffer.concat([PKCS8_PREFIX, seed]),
  format: 'der',
  type: 'pkcs8',
});

function canonicalJSON(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJSON).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJSON(obj[k])).join(',') + '}';
}

function mintTrial({ tool_id, tool_prime, gym_name, days }) {
  const issued = new Date();
  const expires = new Date(issued.getTime() + (days || 14) * 24 * 60 * 60 * 1000);
  const payload = {
    v: 1,
    forge_id: 'fg_gym_' + crypto.randomBytes(6).toString('hex'),
    tool_id,
    tool_prime,
    tier: 'trial',
    features: ['core', 'mesh_inbound', 'onboarding_console', 'cascade_inference', 'audit_chain'],
    gym_name,
    issued: issued.toISOString(),
    expires: expires.toISOString(),
    issuer: 'konomi',
  };
  const sig = crypto.sign(null, Buffer.from(canonicalJSON(payload), 'utf8'), PRIV_KEY);
  return Buffer.from(JSON.stringify({ payload, sig: sig.toString('base64') })).toString('base64');
}

const server = http.createServer((req, res) => {
  // CORS for browser-side forge
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, service: 'konomi-trial-signer', ready: true }));
  }

  if (url.pathname === '/sign-trial' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { tool_id, tool_prime, gym_name, days } = JSON.parse(body);
        if (!tool_id || !tool_prime) throw new Error('tool_id and tool_prime required');
        const envelope = mintTrial({ tool_id, tool_prime, gym_name, days: days || 14 });
        const issued = new Date().toISOString();
        const expires = new Date(Date.now() + (days || 14) * 86400000).toISOString();
        console.log(`◊ signed ${days || 14}d trial · ${gym_name || tool_id} · prime ${tool_prime}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, envelope, tool_id, tool_prime, gym_name, issued, expires, days: days || 14 }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'not found · POST /sign-trial or GET /health' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('◊·κ=1 · trial-sign-server LIVE on http://127.0.0.1:' + PORT);
  console.log('  endpoints:');
  console.log('    GET  /health      → confirms server is up');
  console.log('    POST /sign-trial  → { tool_id, tool_prime, gym_name, days } → signed envelope');
  console.log('  forge.html will call this automatically while the BUILD flow runs.');
  console.log('  key stays on this machine. Never sent over network.');
  console.log('  Ctrl+C to stop.');
});
