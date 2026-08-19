// fallforce · catalogue.test.mjs — the stack catalogue, every rule falsifiable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESS, PERSONAL, SPEC_DATE, CITE_RULE, classify, rank, savings, stackView } from './catalogue.mjs';

test('THE HEADLINE MATH IS DERIVED, NOT TYPED — and lands exactly on the spec', () => {
  // the spec's own pitch: $504/mo shadow stack, $499 bundle, $5,549 saved year one, $29,741 over 5, ~1 month break-even
  const v = stackView(499);
  assert.equal(v.totalRentMo, 504, 'the business categories must SUM to the spec headline — a drifted category price breaks this test');
  assert.equal(v.rentYr, 6048);
  assert.equal(v.saveY1, 5549);
  assert.equal(v.save5y, 29741);
  assert.ok(v.breakEvenDays >= 28 && v.breakEvenDays <= 32, '"pays for itself in ~1 month": ' + v.breakEvenDays + ' days');
  assert.match(v.line, /\$499 once vs \$6,048\/yr rented = \$5,549 saved year one/);
  // the personal stack: ~$58/mo → $696/yr per the spec
  const p = PERSONAL.reduce((s, c) => s + c.rentMo, 0);
  assert.equal(p, 58);
  assert.equal(savings(p, 50).rentYr, 696);
});

test('EVERY SAVINGS NUMBER CARRIES THE CITATION RULE — spec prices are dated, not eternal', () => {
  const s = savings(195, 100);
  assert.equal(s.cite, CITE_RULE);
  assert.match(s.cite, new RegExp(SPEC_DATE));
  assert.match(s.cite, /before this listing goes live/);
});

test('GARBAGE PRICES ARE REFUSED, NEVER FLATTERED', () => {
  assert.match(savings(0, 100).why, /invented number/);
  assert.match(savings(NaN, 100).why, /invented number/);
  assert.match(savings(-5, 100).why, /invented number/);
  assert.match(savings(100, NaN).why, /no real own-once price/);
  assert.equal(savings(100, 0).ok, true, 'a free tool is a real price');
  assert.equal(savings(100, 0).breakEvenDays, 0);
});

test('CLASSIFICATION READS THE REAL ESTATE — the shadow stack finds its shelves', () => {
  assert.equal(classify({ name: 'fallcrm', desc: 'sovereign CRM · contacts deals pipeline' }).category, 'crm');
  assert.equal(classify({ name: 'fallmail', desc: 'email outreach, sovereign' }).category, 'email');
  assert.equal(classify({ name: 'fallinvoice', desc: 'invoicing that adds up' }).category, 'invoicing');
  assert.equal(classify({ name: 'glampos', desc: 'site automation for small stays; booking guard' }).category, 'scheduler',
    'booking beats automation here: more matched terms win');
  assert.equal(classify({ name: 'airgap', desc: 'air-gapped mesh compute' }).category, 'sovereignty');
});

test('WORD BOUNDARIES HOLD — design is not e-sign, and a signed lineage is not a signature product', () => {
  const mage = classify({ name: 'fallmage', desc: 'sovereign Photoshop wedge · design tool' });
  assert.equal(mage.ok, false, 'design must not read as e-sign: ' + JSON.stringify(mage));
  const agora = classify({ name: 'agora', desc: 'signed transfers on a sovereign ledger' });
  assert.notEqual(agora.category, 'esign', '"signed" is not "signing" — boundaries are exact words');
});

test('PRIVATE, ARCHIVED, AND FORKED REPOS ARE REFUSED WITH THE REASON — not silently skipped', () => {
  assert.match(classify({ name: 'x', private: true, desc: 'crm' }).why, /private repo cannot be sold/);
  assert.match(classify({ name: 'x', archived: true, desc: 'crm' }).why, /unmaintained tool is not listed, at any price/);
  assert.match(classify({ name: 'x', fork: true, desc: 'crm' }).why, /not ours to sell/);
});

test('RANK IS A SHORTLIST AND SAYS SO — live first, described second, gate-pass judged elsewhere', () => {
  const r = rank([
    { name: 'dead-crm', desc: 'a crm pipeline with deals and contacts galore', live: false },
    { name: 'live-crm', desc: 'crm', live: true },
    { name: 'bare-crm', desc: 'crm pipeline deals contacts and a long description too', live: true },
  ]);
  assert.equal(r.shortlist.crm[0].name, 'bare-crm', 'live + described beats live + bare');
  assert.equal(r.shortlist.crm[1].name, 'live-crm');
  assert.equal(r.shortlist.crm[2].name, 'dead-crm', 'a dead page ranks last no matter how good the words');
  assert.match(r.why, /Gate-pass is judged at packaging, never here/);
});

test('THE CATEGORY TABLES ARE FROZEN — a price cannot drift at runtime', () => {
  assert.throws(() => { BUSINESS.push({ id: 'x' }); });
  assert.throws(() => { BUSINESS[0].rentMo = 999; });
  assert.throws(() => { BUSINESS[0].words.push('everything'); });
  assert.throws(() => { PERSONAL[0].rentMo = 0; });
});

// ─── round two: the gate found eight gaps — each dies here ───

test('DESCRIBED MEANS MORE THAN TWENTY CHARACTERS, STRICTLY — twenty exactly is bare', () => {
  const twenty = 'crm pipeline deals x';           // exactly 20
  const twentyone = 'crm pipeline deals xy';       // 21
  assert.equal(twenty.length, 20); assert.equal(twentyone.length, 21);
  const r = rank([
    { name: 'a-bare', desc: twenty, live: true },      // higher score, bare
    { name: 'b-described', desc: twentyone, live: true },
  ]);
  assert.equal(r.shortlist.crm[0].name, 'b-described', 'a 20-char blurb does not count as described');
});

test('LIVE MEANS STRICTLY TRUE — a truthy string is not a live page', () => {
  const r = rank([
    { name: 'claims-live', desc: 'crm pipeline deals contacts, richly described', live: 'yes' },
    { name: 'is-live', desc: 'crm', live: true },
  ]);
  assert.equal(r.shortlist.crm[0].name, 'is-live', 'live: "yes" is a claim, not a page');
});

test('THE URL RIDES WHEN IT IS A STRING AND DIES TO NULL WHEN IT IS NOT', () => {
  const r = rank([
    { name: 'with-url', desc: 'crm', live: true, url: 'https://example.test/crm' },
    { name: 'junk-url', desc: 'crm', live: false, url: 42 },
  ]);
  assert.equal(r.shortlist.crm[0].url, 'https://example.test/crm');
  assert.strictEqual(r.shortlist.crm[1].url, null);
});

test('A FUNCTION IS NOT AN ESTATE NODE — even one named fallcrm', () => {
  const impostor = function fallcrm() {};
  const c = classify(impostor);
  assert.equal(c.ok, false, 'a function has a .name, and it still must not classify: ' + JSON.stringify(c));
  assert.match(c.why, /not an estate node/);
});

test('THE TWENTY-CHARACTER FLOOR HOLDS FROM BOTH SIDES OF THE COMPARATOR — input order must not matter', () => {
  const bareStrong = { name: 'bare-strong', desc: 'crm pipeline deals x', live: true };        // 20 chars, 3 terms
  const describedWeak = { name: 'described-weak', desc: 'crm — a lovely thing.', live: true }; // 21 chars, 1 term
  assert.equal(bareStrong.desc.length, 20); assert.equal(describedWeak.desc.length, 21);
  const one = rank([bareStrong, describedWeak]).shortlist.crm.map(x => x.name);
  const two = rank([describedWeak, bareStrong]).shortlist.crm.map(x => x.name);
  assert.deepEqual(one, ['described-weak', 'bare-strong'], 'described beats a stronger score');
  assert.deepEqual(two, one, 'the same items in the other input order land the same way');
});

test('WHEN LIVE AND DESCRIBED TIE, THE SCORE ALONE DECIDES — never the name', () => {
  const r = rank([
    { name: 'a-weak', desc: 'crm — described at length, one term only', live: true },
    { name: 'z-strong', desc: 'crm pipeline deals contacts described too', live: true },
  ]);
  assert.deepEqual(r.shortlist.crm.map(x => x.name), ['z-strong', 'a-weak'],
    'the stronger match wins even though its name sorts last');
});

test('FUZZ: total on garbage', () => {
  classify(null); classify(7); classify({}); classify({ name: 'x' }, 'not-a-list');
  rank(null); rank('x'); rank([null, 7, {}]);
  savings(); savings('a', 'b'); stackView(); stackView(null, []);
  assert.equal(stackView(null, []).totalRentMo, 0);
  assert.ok(true);
});
