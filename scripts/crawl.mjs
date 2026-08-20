#!/usr/bin/env node
// fallforce · scripts/crawl.mjs — THE ESTATE CRAWL, the FallForce spec's first task.
//
// Reads the full estate index (never a curated subset), classifies every repo into the stack
// categories through the gated kernel, ranks the shortlists, and writes catalogue.json — the
// one source the page section is generated from. Numbers on the page trace HERE, not to hands.
//
//   node scripts/crawl.mjs [path-to-estate-index.json]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUSINESS, PERSONAL, VERTICALS, SPEC_DATE, CITE_RULE, classify, rank, stackView } from '../catalogue.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const INDEX = process.argv[2] || 'C:/Users/sjgan/.claude/projects/C--Users-sjgan--claude/memory/estate-index.json';
const idx = JSON.parse(readFileSync(INDEX, 'utf8'));
if (!Array.isArray(idx.nodes) || idx.nodes.length < 100) {
  console.error('STOP: the estate index looks wrong (' + (idx.nodes?.length ?? 'no') + ' nodes) — regenerate it first.');
  process.exit(1);
}

const business = rank(idx.nodes, BUSINESS);
const personal = rank(idx.nodes, PERSONAL);
const verticals = rank(idx.nodes, VERTICALS);
const refused = { private: 0, archived: 0, fork: 0, unclaimed: 0 };
for (const n of idx.nodes) {
  const c = classify(n, [...BUSINESS, ...PERSONAL]);
  if (c.ok) continue;
  if (/private/.test(c.why)) refused.private += 1;
  else if (/archived/.test(c.why)) refused.archived += 1;
  else if (/fork/.test(c.why)) refused.fork += 1;
  else refused.unclaimed += 1;
}

const out = {
  kind: 'fallforce-catalogue',
  crawled: new Date().toISOString(),
  indexGenerated: idx.generated || '(unknown)',
  totalRepos: idx.nodes.length,
  specDate: SPEC_DATE,
  citeRule: CITE_RULE,
  stack: stackView(499),
  personalStack: { rentMo: PERSONAL.reduce((s, c) => s + c.rentMo, 0), once: 50 },
  business: business.shortlist,
  personal: personal.shortlist,
  verticals: verticals.shortlist,
  verticalDefs: VERTICALS.map(v => ({ id: v.id, name: v.name, who: v.who, pitch: v.pitch })),
  rankWhy: business.why,
  refused,
};
writeFileSync(join(here, '..', 'catalogue.json'), JSON.stringify(out, null, 1));

console.log(`crawled ${idx.nodes.length} repos (index of ${out.indexGenerated}) — spec prices ${SPEC_DATE}`);
console.log(`refused: ${refused.private} private (cannot be sold) · ${refused.archived} archived · ${refused.fork} forks · ${refused.unclaimed} unclaimed by any shelf\n`);
for (const [label, shelf] of [['BUSINESS', business.shortlist], ['PERSONAL', personal.shortlist]]) {
  console.log(`── ${label} ──`);
  for (const cat of (label === 'BUSINESS' ? BUSINESS : PERSONAL)) {
    const list = shelf[cat.id] || [];
    const top = list.slice(0, 3).map(x => x.name + (x.live ? ' (live)' : '')).join(', ');
    console.log(`  ${cat.id.padEnd(12)} ${String(list.length).padStart(3)} candidate(s) · vs $${cat.rentMo}/mo — ${top || '(none found)'}`);
  }
}
console.log(`\nstack headline (derived): ${out.stack.line} · break-even ~${out.stack.breakEvenDays} days`);
console.log('shortlist only — gate-pass is judged at packaging (§5.2), and NOTHING is for sale until the rail door is signed, counsel first.');
