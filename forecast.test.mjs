// forecast.test.mjs — PROOF-OF-PLAY for the number that goes to the board.
import { MAX_DEAL, money, probability, weightedOf, sumMoney, activeDeals, isClosed, forecast, normalizeDeal, cleanImport } from './forecast.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ FAIL ') + m); };

const deal = (value, prob, extra = {}) => ({ id: 'd1', name: 'A deal', value, probability: prob, stage: 'Proposal', ...extra });

console.log('\n=== §1 · ⚑ THE COMMA THAT COST £44,955 ===');
{
  ok(money('45,000') === 45000, '⚑ "45,000" is forty-five thousand — parseInt read it as 45 and the form accepted it');
  ok(money('£45,000') === 45000, 'and so is "£45,000", typed the way it appears on the proposal');
  ok(money('45000.50') === 45000.5, '⚑ the pence survive — parseInt dropped them silently');
  ok(money(' 45,000 ') === 45000, 'and stray spaces do not change an amount');
  ok(money('45000') === 45000 && money(45000) === 45000, 'a plain number, typed or passed');

  ok(money('') === null && money('abc') === null, 'letters and emptiness are not amounts');
  ok(money('-500') === null, 'nor is a negative deal');
  ok(money('1e9') === null, '⚑ nor an exponent — "1e9" is a paste accident, not a figure anybody typed on purpose');
  ok(money(MAX_DEAL + 1) === null, 'and past the sanity limit is somebody pasting an id into a value box');
  ok(money(NaN) === null && money(Infinity) === null && money(null) === null, 'and nothing that is not a number at all');
}

console.log('\n=== §2 · ⚑ ZERO PER CENT IS AN ANSWER ===');
{
  ok(probability(0) === 0,
     '⚑ 0% survives — `parseInt(x) || 50` could not say it, so a dead deal came back at fifty-fifty and propped up the forecast');
  ok(probability('0') === 0, 'typed as text too');
  ok(probability(100) === 100 && probability(65) === 65, 'the ordinary cases still work');
  ok(probability('65%') === 65, 'and a typed % sign is not a mistake');

  ok(probability(500) === null, '⚑ 500% is REFUSED — it forecast £225,000 on a £45,000 deal, more than the deal is worth');
  ok(probability(-1) === null, 'and a negative confidence is not a confidence');
  ok(probability('') === null && probability(null) === null && probability('soon') === null,
     '⚑ an unreadable probability is null, not a silent 50 — the old default hid the fact that nobody understood the input');
  ok(probability('0.65') === 0.65, 'and 0.65 is taken at face value, not turned into 50');
}

console.log('\n=== §3 · ⚑ THE RESTORE THAT MULTIPLIED THE PIPELINE BY 71,000 ===');
{
  // reduce((s, d) => s + d.value, 0) over string values is not addition, it is concatenation.
  const restored = { deals: [deal('45000', 65), deal('18000', 80)] };
  const raw = restored.deals.reduce((s, d) => s + d.value, 0);
  ok(raw === '04500018000', 'the old sum over a restored backup really does produce this');

  const clean = cleanImport(restored);
  ok(clean.deals.every(d => typeof d.value === 'number'), '⚑ the import repairs string values into numbers');
  ok(clean.repaired === 2, 'and says how many it had to repair');
  ok(forecast(clean.deals).pipeline === 63000,
     '⚑ so the pipeline reads £63,000 — the front page was showing £4,500,018,000');

  const bad = cleanImport({ deals: [deal(45000, 65), deal('not money', 50), null, deal(1000, 500)] });
  ok(bad.deals.length === 1, 'a file with junk in it keeps only the deals that are deals');
  ok(bad.rejected.length === 3 && bad.ok === false, '⚑ and NAMES the three it threw out rather than quietly dropping them');
  ok(cleanImport(null).deals.length === 0 && cleanImport({}).ok === true, 'no deals at all is not a failure');
}

console.log('\n=== §4 · adding money up ===');
{
  ok(sumMoney([1000, 2000, 500]) === 3500, 'plain addition');
  ok(sumMoney(['45,000', '18,000']) === 63000, '⚑ and strings ADD rather than concatenate');
  ok(sumMoney([100, 'junk', 200]) === 300, 'garbage in the middle is skipped, not turned into NaN');

  const tenPence = new Array(300).fill(0.1);
  ok(sumMoney(tenPence) === 30, '⚑ three hundred lots of 10p is exactly £30 — added as pounds it lands a penny out');
  ok(sumMoney([0.1, 0.2]) === 0.3, 'and the classic 0.1 + 0.2 comes to 0.3, not 0.30000000000000004');
  ok(sumMoney([]) === 0 && sumMoney(null) === 0, 'nothing sums to nothing, never NaN');
}

console.log('\n=== §5 · what one deal is worth ===');
{
  ok(weightedOf(deal(45000, 65)) === 29250, 'a £45,000 deal at 65% is worth £29,250');
  ok(weightedOf(deal(45000, 0)) === 0, '⚑ and a dead deal is worth nothing — not half of £45,000');
  ok(weightedOf(deal(45000, 100)) === 45000, 'a certainty is worth its full value');
  ok(weightedOf(deal('45,000', '65%')) === 29250, 'typed the way a person types it');
  ok(weightedOf(deal(45000, 500)) === null && weightedOf(deal('junk', 50)) === null, 'and a deal that cannot be weighed says so');
  ok(weightedOf(null) === null, 'nothing is not a deal');
}

console.log('\n=== §6 · ⚑ THE TOTALS SAY WHAT THEY COULD NOT COUNT ===');
{
  const deals = [
    deal(45000, 65, { id: 'a' }),
    deal(18000, 80, { id: 'b' }),
    deal(12000, 100, { id: 'c', stage: 'Closed Won' }),
    deal(9000, 50, { id: 'd', stage: 'Closed Lost' }),
    deal('oops', 50, { id: 'e', name: 'Broken deal' }),
  ];
  const f = forecast(deals);
  ok(f.pipeline === 63000, 'closed deals are not pipeline');
  ok(f.weighted === 43650, 'the weighted forecast is the sum of what each deal is worth');
  ok(f.won === 12000 && f.wonCount === 1, 'and won is counted on its own');

  ok(f.complete === false && f.unusable.length === 1,
     '⚑ ONE DEAL THAT CANNOT BE WEIGHED IS REPORTED — the old code turned it into NaN and printed "£NaN"');
  ok(f.unusable[0].id === 'e' && /value/.test(f.unusable[0].why), 'named, with the reason, so it can be fixed');
  ok(Number.isFinite(f.weighted), '⚑ and one bad deal never NaNs the whole total');

  ok(forecast([deal(45000, 65)]).complete === true, 'a clean pipeline says so');
  ok(forecast(null).pipeline === 0 && forecast(null).complete === true, 'no deals is zero, not an error');
  ok(isClosed({ stage: 'CLOSED WON' }) === true, 'the stage is matched however it is capitalised');
  ok(isClosed({ stage: 'Proposal' }) === false && isClosed({}) === false, 'and an open deal is open');
  ok(activeDeals([null, 'x', deal(1, 1)]).length === 1, 'garbage rows are not deals');
}

console.log('\n=== §7 · the form, saying everything at once ===');
{
  const r = normalizeDeal({ name: ' Big One ', value: '45,000', probability: '65%' });
  ok(r.ok === true && r.deal.value === 45000 && r.deal.probability === 65, 'a good deal comes back clean');
  ok(r.deal.name === 'Big One', 'and trimmed');

  const bad = normalizeDeal({ name: '', value: 'abc', probability: 500 });
  ok(bad.ok === false && bad.problems.length === 3,
     '⚑ all three faults reported at once — one at a time is three trips back to the form');
  ok(bad.deal === null, 'and nothing half-built is handed back');

  ok(normalizeDeal({ name: 'x', value: 1000 }).deal.probability === 50, 'no probability given means the default');
  ok(normalizeDeal({ name: 'x', value: 1000, probability: 0 }).deal.probability === 0,
     '⚑ but a probability of 0 GIVEN is kept — that is the whole bug');
  ok(normalizeDeal({ name: 'x', value: 0 }).ok === false, 'a deal worth nothing is refused');
  ok(normalizeDeal(null).ok === false, 'and nothing is not a deal');
}

console.log('\n=== §8 · pure under garbage ===');
{
  const junk = [null, undefined, '', 0, [], {}, NaN, 'x', [null], [{}], { deals: 'no' }, { value: {} }, -1, Infinity];
  let threw = null;
  for (const j of junk) {
    try {
      money(j); probability(j); weightedOf(j); sumMoney(j); activeDeals(j); isClosed(j);
      forecast(j); normalizeDeal(j); cleanImport(j);
    } catch (e) { threw = `${JSON.stringify(j)} → ${e.message}`; }
  }
  ok(threw === null, 'no input throws' + (threw ? ' — ' + threw : ''));
  ok(Number.isFinite(forecast([{}, null, 'x']).weighted), '⚑ and a database of rubbish still produces a number, never NaN');
}

console.log('\n=== §9 · the edges, and every reason said correctly ===');
{
  ok(money(0) === 0,
     '⚑ zero pounds parses as zero — refusing it would drop every dead deal out of a total instead of counting it as nothing');
  ok(money(MAX_DEAL) === MAX_DEAL && money(String(MAX_DEAL)) === MAX_DEAL, 'the sanity limit itself is allowed, typed or passed');
  ok(money('1' + '0'.repeat(20)) === null,
     '⚑ a twenty-one digit figure is refused — it is all digits, so only the size check stands between it and the pipeline total');

  // ⚑ Every "why" was checked for length and never for content, so all of them saying the same wrong
  // thing would have passed. A reason nobody reads is not a reason.
  const badProb = forecast([deal(45000, 500, { id: 'p' })]);
  ok(/probability/.test(badProb.unusable[0].why),
     '⚑ a good value with a bad probability blames the PROBABILITY — not "the value is not usable", which would send somebody to fix the wrong field');
  ok(/value/.test(forecast([deal('oops', 65, { id: 'v' })]).unusable[0].why), 'and a bad value blames the value');

  const rej = cleanImport({ deals: [deal(45000, 500), deal('oops', 65)] });
  ok(/probability/.test(rej.rejected[0].why) && /value/.test(rej.rejected[1].why),
     'the import gives each rejected deal its own reason too');
}

console.log('\n=== §10 · what an import is allowed to assume ===');
{
  ok(cleanImport({ deals: [{ id: 'x', name: 'n', value: 45000 }] }).deals[0].probability === 50,
     '⚑ a deal with NO probability is kept at the default — throwing it out would lose a real deal over a missing optional field');
  ok(cleanImport({ deals: [{ id: 'x', name: 'n', value: 45000, probability: null }] }).deals.length === 1,
     'and an explicitly empty one is the same case, not a rejection');
  ok(cleanImport({ deals: [{ id: 'x', name: 'n', value: 45000, probability: '' }] }).deals.length === 1, 'nor an empty string');
  ok(cleanImport({ deals: [deal(45000, 500)] }).deals.length === 0, 'but a probability that is WRONG is still refused');

  ok(cleanImport({ deals: [deal(45000, '65')] }).repaired === 1,
     '⚑ a string PROBABILITY counts as a repair too — counting only string values would under-report what the file got wrong');
  ok(cleanImport({ deals: [deal(45000, 65)] }).repaired === 0, 'and a clean file needed no repairs');
}

console.log(`\n${fail === 0 ? '✓ ALL PASS' : '✗ FAILURES'} — ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
