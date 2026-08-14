// forecast.mjs — the number the sales director takes to the board.
//
// ⚑ THE PENCE WERE DROPPED ON EVERY DEAL. saveDeal() read the value with parseInt, and
// parseInt('45000.50') is 45000 — fifty pence gone, silently, on every deal anybody types exactly.
//
// A note on the comma, because the obvious version of this claim is wrong and worth writing down:
// parseInt('45,000') is 45, but the form's field is type="number", and a number input hands back an
// empty string for "45,000" rather than the text. So in THAT form the comma produced "value
// required", not a £45 deal. It still matters here — money() is also what the import and any
// text-sourced value go through, and those have no such field in front of them.
//
// ⚑ ZERO PER CENT WAS UNSAYABLE. probability was read through a fallback to 50 whenever the parsed
// figure was falsy, and 0 is falsy — so a deal you have marked dead comes back at fifty-fifty and
// props up the forecast. The same fallback turns a typed 0.65 (meaning 65%) into 50 rather than
// telling anybody it did not understand.
//
// ⚑ AND NOTHING BOUNDED IT ABOVE. A mistyped 500 forecasts £225,000 on a £45,000 deal — more than
// the deal is worth, which is not a forecast, it is a wrong answer with a currency symbol on it.
//
// ⚑ THE WORST ONE IS THE RESTORE. importData() runs deepMerge over a parsed JSON file with no
// checking at all, and the totals are built with `reduce((s, d) => s + d.value, 0)`. Restore a backup
// whose values are strings — hand-edited, or exported by anything else — and `+` stops being addition
// and becomes concatenation: a £63,000 pipeline displays as £4,500,018,000. It does not throw, it
// does not warn, and it is off by five orders of magnitude on the front page.
//
// Pure: no storage, no DOM. Money is summed in pence so a long pipeline cannot drift.

export const MAX_DEAL = 1e12;   // beyond this, somebody has pasted an id into a value field

/**
 * A money figure, as a number of pounds rounded to the penny — or null if it is not one.
 *
 * Accepts what people actually type: "£45,000", "45000.50", " 45,000 ". Rejects what nobody means:
 * empty, letters, negatives, and figures past MAX_DEAL.
 */
export function money(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 && value <= MAX_DEAL ? round2(value) : null;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[£$€,\s]/g, '');
  if (cleaned === '' || !/^\d+(\.\d+)?$/.test(cleaned)) return null;   // no exponents, no minus, no junk
  const n = Number(cleaned);
  return Number.isFinite(n) && n <= MAX_DEAL ? round2(n) : null;
}

/**
 * A percentage from 0 to 100 inclusive, or null.
 *
 * ⚑ 0 IS AN ANSWER, not a missing value. It is the difference between "this deal is dead" and "nobody
 * has said", and the old `|| 50` could not tell them apart.
 */
export function probability(value) {
  const raw = typeof value === 'string' ? value.replace(/[%\s]/g, '') : value;
  const n = Number(raw);
  if (raw === '' || raw === null || raw === undefined || !Number.isFinite(n)) return null;
  if (n < 0 || n > 100) return null;                                    // 500% is not a confidence
  return round2(n);
}

/** What one deal is worth to the forecast, or null if the deal cannot be weighed. */
export function weightedOf(deal) {
  const v = money(deal && deal.value);
  const p = probability(deal && deal.probability);
  if (v === null || p === null) return null;
  return round2(v * p / 100);
}

/**
 * Add money without drift and without concatenation.
 *
 * ⚑ Summed in pence, as integers. Pounds are binary fractions that do not add up: a few hundred deals
 * of £0.10 land a penny out, and a forecast that disagrees with the sum of its own rows is a forecast
 * nobody trusts again.
 */
export function sumMoney(values) {
  const list = Array.isArray(values) ? values : [];
  let pence = 0;
  for (const v of list) {
    const m = money(v);
    if (m === null) continue;
    pence += Math.round(m * 100);
  }
  return round2(pence / 100);
}

/** Deals still in play. Won and lost are history, not pipeline. */
export function activeDeals(deals) {
  const list = Array.isArray(deals) ? deals : [];
  return list.filter(d => d && typeof d === 'object' && !isClosed(d));
}

export function isClosed(deal) {
  const s = deal && typeof deal.stage === 'string' ? deal.stage.trim().toLowerCase() : '';
  return s === 'closed won' || s === 'closed lost';
}

/**
 * ⚑ THE FRONT-PAGE NUMBERS, AND WHAT THEY COULD NOT COUNT.
 *
 * Returns the totals AND `unusable` — the deals that could not be weighed. A total that silently
 * leaves deals out is the same lie in the other direction: the old code turned one of them into NaN
 * and printed "£NaN", or worse, concatenated and printed a number a thousand times too big.
 */
export function forecast(deals) {
  const active = activeDeals(deals);
  const won = (Array.isArray(deals) ? deals : []).filter(d => d && typeof d === 'object'
    && typeof d.stage === 'string' && d.stage.trim().toLowerCase() === 'closed won');

  const unusable = [];
  const weights = [];
  for (const d of active) {
    const w = weightedOf(d);
    if (w === null) unusable.push({ id: d.id ?? null, name: d.name ?? '', why: whyUnusable(d) });
    else weights.push(w);
  }

  return {
    pipeline: sumMoney(active.map(d => d.value)),
    weighted: sumMoney(weights),
    won: sumMoney(won.map(d => d.value)),
    activeCount: active.length,
    wonCount: won.length,
    unusable,                                  // named, so they can be fixed rather than guessed at
    complete: unusable.length === 0,
  };
}

function whyUnusable(deal) {
  if (money(deal && deal.value) === null) return 'the value is not a usable amount';
  return 'the probability is not a percentage between 0 and 100';
}

/**
 * What a deal form should produce. Returns the deal or the reasons it is not one — every reason at
 * once, because being told about one fault at a time is four round trips instead of one.
 */
export function normalizeDeal(input) {
  const d = (input && typeof input === 'object') ? input : {};
  const problems = [];

  const name = typeof d.name === 'string' ? d.name.trim() : '';
  if (!name) problems.push('a deal needs a name');

  const value = money(d.value);
  if (value === null) problems.push('the value is not an amount — "45,000" and "£45,000" are fine, letters are not');
  else if (value === 0) problems.push('a deal worth nothing is not a deal');

  // Absent is not the same as wrong. No probability given means the default; a bad one is refused.
  const hasProb = d.probability !== undefined && d.probability !== null && d.probability !== '';
  const prob = hasProb ? probability(d.probability) : 50;
  if (hasProb && prob === null) problems.push('the probability must be a percentage between 0 and 100');

  if (problems.length) return { ok: false, problems, deal: null };
  return { ok: true, problems: [], deal: { ...d, name, value, probability: prob } };
}

/**
 * ⚑ WHAT A RESTORED BACKUP IS ALLOWED TO PUT IN. importData() merged a parsed file straight into the
 * database. This is the check that was never there — it repairs what it can and names what it cannot,
 * rather than letting a string into a column that gets added up.
 */
export function cleanImport(data) {
  const deals = (data && Array.isArray(data.deals)) ? data.deals : [];
  const kept = [];
  const rejected = [];
  let repaired = 0;

  for (const d of deals) {
    if (!d || typeof d !== 'object') { rejected.push({ id: null, why: 'not a deal' }); continue; }
    const v = money(d.value);
    const p = d.probability === undefined || d.probability === null || d.probability === ''
      ? 50 : probability(d.probability);
    if (v === null || p === null) {
      // The deal itself is enough to explain the refusal: whyUnusable blames the value first, and the
      // only way to reach here with a usable value is a probability that really is wrong. An earlier
      // version rebuilt a stand-in object to ask with — the gate showed it could be rebuilt either way
      // without changing a single answer, which is a sure sign it was doing nothing.
      rejected.push({ id: d.id ?? null, name: d.name ?? '', why: whyUnusable(d) });
      continue;
    }
    if (typeof d.value !== 'number' || typeof d.probability !== 'number') repaired++;
    kept.push({ ...d, value: v, probability: p });
  }

  return { deals: kept, rejected, repaired, ok: rejected.length === 0 };
}

/** Pounds, to the penny, without float dust. */
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export default {
  MAX_DEAL, money, probability, weightedOf, sumMoney, activeDeals, isClosed,
  forecast, normalizeDeal, cleanImport,
};
