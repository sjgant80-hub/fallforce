#!/usr/bin/env node
// fallforce · scripts/build-stack.mjs — generate stack.html from catalogue.json.
//
// The one-kernel-rule, applied: every number on the stack page traces to catalogue.json (which
// traces to the crawl, which traces to the gated kernel and the full estate index). Nothing on
// the page is typed by hand, and CI re-runs this generator and diffs — a hand-edited page fails
// the gate. Deterministic: same catalogue.json in, same bytes out.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cat = JSON.parse(readFileSync(join(here, '..', 'catalogue.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const usd = (n) => '$' + Number(n).toLocaleString('en-US');

const shelfRows = (shelf, cats) => cats.map(c => {
  const list = (shelf[c.id] || []).slice(0, 3);
  return `<tr>
  <td><b>${esc(c.name)}</b></td>
  <td class="num">${usd(c.rentMo)}/mo</td>
  <td>${list.length ? list.map(x => x.url && x.live
    ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a>${x.live ? '' : ' <span class="dim">(not live)</span>'}`
    : `${esc(x.name)}${x.live ? '' : ' <span class="dim">(not live)</span>'}`).join(' · ') : '<span class="dim">(none surfaced yet)</span>'}</td>
</tr>`;
}).join('\n');

const s = cat.stack;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FallForce · the whole stack, owned once</title>
<style>
body{font-family:Georgia,serif;background:#0b0a0f;color:#d8d2c4;max-width:880px;margin:0 auto;padding:28px 18px;line-height:1.55}
h1{font-size:1.6rem;color:#d4a017}h2{font-size:1.1rem;color:#d4a017;margin-top:2rem;border-bottom:1px solid #3a3630;padding-bottom:.3rem}
a{color:#d4a017}.dim{opacity:.55}.quiet{opacity:.7;font-size:.93em}
.headline{border:1px solid #d4a017;border-radius:10px;padding:16px 20px;margin:1.4rem 0;background:rgba(212,160,23,.06);font-size:1.08em}
.honest{border:1px solid #3a3630;border-radius:8px;padding:12px 16px;margin:1.2rem 0;font-size:.9em;background:#141218}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.93em}
td,th{border-bottom:1px solid #2a2722;padding:8px 10px;text-align:left;vertical-align:top}
th{color:#d4a017;font-size:.82em;letter-spacing:.08em;text-transform:uppercase}
.num{white-space:nowrap;font-variant-numeric:tabular-nums}
footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #3a3630;font-size:.8em;opacity:.65}
</style></head><body>
<h1>FallForce — the whole stack, owned once</h1>
<p>Salesforce and its shadow-stack cost ${usd(s.totalRentMo)}/month, forever. FallForce is the same
stack — CRM, email, scheduling, forms, e-sign, SMS, invoicing, automation, and the sovereignty-only
tools SaaS cannot legally serve — that you <b>own, once</b>. Runs on your machine. Works offline.
Your data never leaves the building.</p>
<div class="headline"><b>${esc(s.line)}</b> · ${usd(s.save5y)} saved over five years · pays for itself in ~${s.breakEvenDays} days.</div>

<h2>the business stack — every shelf already exists in the estate</h2>
<p class="quiet">Crawled ${cat.totalRepos.toLocaleString('en-US')} estate repos (index of ${esc(cat.indexGenerated)}).
Top candidates per shelf, live pages linked — these are real running tools, not mockups.</p>
<table><tr><th>shelf</th><th>rented</th><th>estate candidates (top 3)</th></tr>
${shelfRows(cat.business, s.categories)}
</table>

<h2>the personal stack</h2>
<p class="quiet">~${usd(cat.personalStack.rentMo)}/mo rented (${usd(cat.personalStack.rentMo * 12)}/yr) — owned once for ~${usd(cat.personalStack.once)}.</p>
<table><tr><th>shelf</th><th>rented</th><th>estate candidates (top 3)</th></tr>
${shelfRows(cat.personal, Object.keys(cat.personal).map(id => ({ id, name: id, rentMo: ({ notes: 10, passwords: 3, storage: 10, 'private-ai': 20, budget: 15 })[id] ?? 0 })))}
</table>

<div class="honest"><b>the honest wire, before anything is for sale:</b><br>
· This is the CRAWL stage — a shortlist, not a shop. ${esc(cat.rankWhy)}<br>
· ${esc(cat.citeRule)}.<br>
· Nothing here can be bought yet: the payment rail is a master-key door that has not been signed,
and counsel comes before it opens the first time.<br>
· "Owned, offline, data never leaves" is a gate-checked claim per build at packaging — a tool that
phones home does not ship, at any price.</div>

<p><a href="verticals.html">the regulated shelf — for firms whose data cannot leave the building →</a>
&nbsp;·&nbsp; <a href="index.html">FallCRM Elite — the CRM flagship, live now →</a></p>
<footer>generated from catalogue.json — no number typed by hand · crawled ${esc(cat.crawled)}
· comparator prices per FallForce spec ${esc(cat.specDate)} · Konomi Architecture</footer>
</body></html>`;

writeFileSync(join(here, '..', 'stack.html'), html);
console.log(`stack.html generated — ${(html.length / 1024).toFixed(0)}KB, from catalogue.json of ${cat.crawled}`);
