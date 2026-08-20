#!/usr/bin/env node
// fallforce · scripts/build-verticals.mjs — generate verticals.html from catalogue.json.
//
// The regulated-vertical shelf: firm buyers, sovereignty as the product. Same one-kernel-rule
// as stack.html — every tool listed traces to the crawl, CI regenerates and diffs, and a
// hand-edited page fails the gate. Deterministic: same catalogue.json in, same bytes out.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cat = JSON.parse(readFileSync(join(here, '..', 'catalogue.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const card = (v) => {
  const tools = (cat.verticals[v.id] || []).slice(0, 4);
  return `
<div class="card">
  <h3>${esc(v.name)}</h3>
  <div class="who">for ${esc(v.who)}</div>
  <p>${esc(v.pitch)}.</p>
  <div class="tools">${tools.length
    ? tools.map(t => t.url && t.live
      ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a>`
      : `<span>${esc(t.name)}${t.live ? '' : ' <i class="dim">(not live)</i>'}</span>`).join(' · ')
    : '<span class="dim">(surfacing)</span>'}</div>
</div>`;
};

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FallForce · the regulated shelf</title>
<style>
body{font-family:Georgia,serif;background:#0b0a0f;color:#d8d2c4;max-width:820px;margin:0 auto;padding:28px 18px;line-height:1.55}
h1{font-size:1.55rem;color:#d4a017}a{color:#d4a017}.dim{opacity:.55}.quiet{opacity:.7;font-size:.93em}
.thesis{border:1px solid #d4a017;border-radius:10px;padding:16px 20px;margin:1.4rem 0;background:rgba(212,160,23,.06)}
.card{border:1px solid #3a3630;border-radius:8px;padding:16px 18px;margin:14px 0;background:#141218}
.card h3{margin:0;font-size:1.08rem;color:#d4a017}
.who{font-size:.82em;letter-spacing:.06em;text-transform:uppercase;opacity:.6;margin:4px 0 8px}
.card p{margin:.4rem 0 .7rem}.tools{font-size:.92em}
.cta{border:1px solid #3a3630;border-radius:8px;padding:14px 18px;margin:1.6rem 0;background:#141218}
.honest{font-size:.88em;opacity:.75;margin-top:1.4rem}
footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #3a3630;font-size:.8em;opacity:.65}
</style></head><body>
<h1>The regulated shelf — where sovereignty is the product</h1>
<div class="thesis">Your regulator expects you to control client data. Your software vendors upload it anyway.
These tools run <b>in the browser, on your machines</b> — case files, AML checks, and client records
that never leave the building, because there is no building they could leave to.</div>
${cat.verticalDefs.map(card).join('\n')}
<div class="cta"><b>Talk to us.</b> Every tool above is live — open it and try it with nothing installed.
Pilots and firm-fit builds are scoped person-to-person:
<a href="https://sjgant80-hub.github.io/ai-nativesolutions/" target="_blank" rel="noopener">AI Native Solutions →</a>
Custom sovereign builds run from £300.</div>
<p class="quiet"><a href="stack.html">the whole owned stack — the FallForce catalogue →</a></p>
<div class="honest">Honest lines: pricing for firm deployments is a conversation, not a checkout — nothing here is
self-serve yet. These tools support your compliance workflow; they are not legal or regulatory advice, and
your compliance obligations remain your own. Shortlisted by the estate crawl of ${cat.totalRepos.toLocaleString('en-US')}
repos (index of ${esc(cat.indexGenerated)}); firm-fit is judged together, on the call.</div>
<footer>generated from catalogue.json — no tool listed by hand · crawled ${esc(cat.crawled)} · Konomi Architecture</footer>
</body></html>`;

writeFileSync(join(here, '..', 'verticals.html'), html);
console.log(`verticals.html generated — ${(html.length / 1024).toFixed(0)}KB, ${cat.verticalDefs.length} shelves`);
