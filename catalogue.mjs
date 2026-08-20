// fallforce · catalogue.mjs — the FallForce stack catalogue: classify, rank, and the savings
// math that IS the pitch.
//
// FallForce is the whole owned stack — CRM, email, scheduling, forms, e-sign, SMS, invoicing,
// automation, and the sovereignty-only tools SaaS can't legally serve — owned once instead of
// rented forever. This kernel does three jobs, all pure and total:
//
//   classify(node)  — which stack category (if any) claims an estate repo. Word-boundary
//                     matching only ('design' is not e-sign); private, archived, and forked
//                     repos are REFUSED with the reason — a private repo cannot be sold.
//   rank(nodes)     — order candidates inside a category. This is a SHORTLIST rank (live page,
//                     described, name relevance) and says so: gate-pass is judged at packaging,
//                     never here. A shortlist that claims to be a quality gate would be a lie.
//   savings(...)    — own-once vs rent-forever, to the dollar. The comparator prices are the
//                     spec's (dated below) and every output carries the citation rule: pull and
//                     cite the CURRENT market price before any listing goes live. An inflated
//                     savings number kills trust; a real one sells itself.
//
// Honest wire, held in code: nothing here is for sale until the payment rail exists, the rail
// is a master-key door, and counsel comes before it opens the first time.

export const SPEC_DATE = '2026-08';
export const CITE_RULE = `comparator prices per FallForce spec ${SPEC_DATE} — pull and cite the current market price before this listing goes live`;

const C = (id, name, rentMo, words) => ({ id, name, rentMo, words });

export const BUSINESS = Object.freeze([
  C('crm', 'CRM — contacts, deals, pipeline', 195, ['crm', 'pipeline', 'deals', 'sales platform', 'contacts']),
  C('email', 'email & outreach', 60, ['email', 'outreach', 'mailer', 'newsletter', 'mailing']),
  C('scheduler', 'scheduling & booking', 30, ['scheduler', 'scheduling', 'booking', 'bookings', 'calendar', 'appointment', 'appointments']),
  C('forms', 'forms & intake', 25, ['forms', 'form builder', 'intake', 'survey', 'surveys']),
  C('esign', 'e-sign & documents', 30, ['esign', 'e-sign', 'signature', 'signatures', 'signing', 'sign-off']),
  C('sms', 'SMS & messaging', 25, ['sms', 'messaging', 'text message', 'texting']),
  C('invoicing', 'invoicing & payments-prep', 20, ['invoice', 'invoices', 'invoicing', 'billing', 'quotes', 'quoting']),
  C('automation', 'automation & workflow', 20, ['automation', 'workflow', 'workflows', 'automate', 'orchestration']),
  C('sovereignty', 'the sovereignty-only shelf — local doc-analysis & private AI, for the data SaaS cannot legally hold', 99,
    ['doc-analyzer', 'document analysis', 'private ai', 'local llm', 'on-device', 'offline ai', 'air-gapped', 'airgap']),
]);

export const PERSONAL = Object.freeze([
  C('notes', 'notes & knowledge', 10, ['notes', 'knowledge base', 'zettelkasten', 'second brain']),
  C('passwords', 'password keeping', 3, ['password', 'passwords', 'credential', 'credentials', 'vault']),
  C('storage', 'local storage & sync', 10, ['file storage', 'file sync', 'content-addressed', 'backup', 'backups']),
  C('private-ai', 'a private AI assistant', 20, ['private ai', 'local llm', 'webllm', 'byok', 'offline ai']),
  C('budget', 'budget & money tracking', 15, ['budget', 'budgeting', 'expense', 'expenses', 'spending', 'accounting']),
]);

// THE VERTICAL SHELF — regulated-firm tools where sovereignty IS the product: the buyer is a
// FIRM with a legal reason to keep client data in-house, and the sale is five emails, not an
// audience. No rent comparator here — B2B pricing is a conversation, and the page says so.
const V = (id, name, who, words, pitch) => ({ id, name, who, words, pitch });
export const VERTICALS = Object.freeze([
  V('claims-firms', 'UK claims firms', 'CMCs and solicitor claims practices (PI/RTA/EL/PL/clinical)',
    ['claims', 'cmc'],
    'case management, claims document generation, and firm-side accounting with client escrow — on your machines, not a vendor’s'),
  V('accountancy', 'accountancy practices', 'multi-partner accountancy and bookkeeping firms',
    ['accountancy', 'accounting practice', 'aml', 'cdd'],
    'practice tooling and AML/CDD client onboarding that never uploads a client record anywhere'),
  V('insurance-brokers', 'FCA-regulated insurance brokers', 'brokerages under IDD conduct rules',
    ['insurance broker', 'insurance brokers', 'idd', 'toba'],
    'IDD-shaped onboarding and the TOBA / demands-and-needs paper trail, generated in-house'),
  V('lettings', 'estate & letting agents', 'lettings and estate agencies',
    ['letting agent', 'letting agents', 'lettings'],
    'client onboarding that keeps tenant and landlord data inside the agency'),
  V('adviser-firms', 'financial adviser firms', 'multi-adviser, multi-firm advice practices',
    ['adviser', 'advisers'],
    'multi-client adviser tooling with UK tax rules built in — client files stay in the practice'),
]);

for (const list of [BUSINESS, PERSONAL, VERTICALS]) for (const c of list) { Object.freeze(c.words); Object.freeze(c); }

const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? v : null;

/** Every word matches on its own boundaries, so 'design' never reads as e-sign. */
const hits = (hay, words) => words.filter(w =>
  new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&') + '($|[^a-z0-9])', 'i').test(hay)).length;

/**
 * Which category claims this estate node — or the reason none can. Refusals speak:
 * a private repo cannot be sold, an archived one is not maintained, a fork is not ours to sell.
 */
export function classify(node, categories) {
  const n = obj(node);
  if (!n || typeof n.name !== 'string') return { ok: false, why: 'not an estate node' };
  if (n.private === true) return { ok: false, why: `${n.name} is private — a private repo cannot be sold` };
  if (n.archived === true) return { ok: false, why: `${n.name} is archived — an unmaintained tool is not listed, at any price` };
  if (n.fork === true) return { ok: false, why: `${n.name} is a fork — not ours to sell` };
  const cats = Array.isArray(categories) ? categories : BUSINESS;
  const hay = [n.name, n.desc || '', ...(Array.isArray(n.topics) ? n.topics : [])].join(' ');
  let best = null, bestScore = 0;
  for (const c of cats) {
    const score = hits(hay, c.words);
    if (score > bestScore) { best = c; bestScore = score; }
  }
  if (!best) return { ok: false, why: `no stack category claims ${n.name}` };
  return { ok: true, category: best.id, score: bestScore, why: `${n.name} reads as ${best.id} (${bestScore} term(s) matched)` };
}

/**
 * Shortlist order inside a category: live page first, then described, then match strength,
 * then name. The rank output SAYS what it is — gate-pass is judged at packaging, not here.
 */
export function rank(nodes, categories) {
  const out = {};
  for (const n of Array.isArray(nodes) ? nodes : []) {
    const c = classify(n, categories);
    if (!c.ok) continue;
    (out[c.category] = out[c.category] || []).push({
      name: n.name, live: n.live === true, desc: typeof n.desc === 'string' ? n.desc : '',
      score: c.score, url: typeof n.url === 'string' ? n.url : null,
    });
  }
  for (const list of Object.values(out)) {
    list.sort((a, b) => (b.live - a.live) || ((b.desc.length > 20) - (a.desc.length > 20)) || (b.score - a.score) || a.name.localeCompare(b.name));
  }
  return { shortlist: out, why: 'shortlist rank only — live + described + term relevance. Gate-pass is judged at packaging, never here.' };
}

/** Own-once vs rent-forever, to the dollar. Garbage in → refused, never a flattering number. */
export function savings(rentMo, oncePrice) {
  if (!Number.isFinite(rentMo) || rentMo <= 0) return { ok: false, why: 'no real rent price — a savings claim without a comparator is an invented number' };
  if (!Number.isFinite(oncePrice) || oncePrice < 0) return { ok: false, why: 'no real own-once price' };
  const rentYr = rentMo * 12;
  return {
    ok: true,
    rentMo, rentYr, once: oncePrice,
    saveY1: rentYr - oncePrice,
    save5y: rentYr * 5 - oncePrice,
    breakEvenDays: oncePrice === 0 ? 0 : Math.ceil(oncePrice / (rentMo / 30)),
    cite: CITE_RULE,
    line: `$${oncePrice} once vs $${rentYr.toLocaleString('en-US')}/yr rented = $${(rentYr - oncePrice).toLocaleString('en-US')} saved year one`,
  };
}

/** The whole business stack as one bundle: the spec's own headline math, derived not typed. */
export function stackView(oncePrice, categories) {
  const cats = Array.isArray(categories) ? categories : BUSINESS;
  const rentMo = cats.reduce((s, c) => s + c.rentMo, 0);
  return { categories: cats.map(c => ({ id: c.id, name: c.name, rentMo: c.rentMo })), totalRentMo: rentMo, ...savings(rentMo, oncePrice) };
}

export default classify;
