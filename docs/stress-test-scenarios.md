# ◊ Apex Procurement · Stress-Test Scenarios

**One HTML file. Open in Chrome. No install. No account.**

The tool is shaped around procurement compliance — multi-stakeholder sign-off, audit trail, escalation paths under reviewer pressure. Pre-loaded with 7 RFQs at different stages and 13 pre-existing audit events.

This document is a punch list. Try to break it. Tell me what breaks, what surprises you, what's missing.

---

## What's pre-loaded

| RFQ | Stage | Value | Current state |
|---|---|---:|---|
| Cloud Infrastructure Renewal (3yr) | Bid Review | £485k | Comp + Fin approved, Legal flagged SLA, Proc pending |
| Industrial Robots — Line 4 Retrofit | Suppliers Shortlisted | £1.24m | Comp + Proc both flagged · auto-escalation OPEN |
| Annual Audit Services Contract | Awarded | £78k | All 4 reviewers approved · contract issued |
| PPE Quarterly Replenishment | Delivered | £42k | 3 of 4 approved, Proc pending audit clearance |
| Specialist Consultancy — IT Strategy | Bid Review | £195k | Fin flagged over-budget, others pending |
| Fleet Service Contract (24mo) | Contract Issued | £312k | Legal flagged liability clause · auto-escalation OPEN |
| Translation Services Framework | RFQ Drafted | £58k | Cold · awaiting Proc Lead approval |

**4 reviewer roles**: Compliance · Finance · Legal · Procurement Lead
**8 procurement stages**: RFQ Drafted → Suppliers Shortlisted → Bids Received → Bid Review → Awarded → Contract Issued → Delivered → Audit Cleared
**5 escalation rules** pre-configured (auto-escalate on 2+ flags; £250k+ ageing items; sole-source; single-supplier shortlist; >10% scope divergence)

---

## Scenario 1 · Reviewer disagreement under pressure

Open **Reviewers**. Click the chip for any reviewer on **Cloud Infrastructure Renewal**.
- Each click cycles `pending → approved → flagged → pending`
- Watch the **Escalated** counter at the top — flips the moment 2 reviewers flag the same item
- Then go to **Escalation Tree** — see the new escalation card appear in the active list
- Then **Audit Trail** — every status change is logged with actor + message + timestamp

**Stress test:** Flag and unflag rapidly across multiple items. Does the auto-escalation logic stay consistent? Do you see duplicate escalations? Does the audit log keep order under high churn?

---

## Scenario 2 · The sole-source ambiguity

**Industrial Robots — Line 4 Retrofit** is already showing 2 flags + an open escalation. The escalation reason is "sole-source justification missing".

What's the right next action? Options:
- Force-approve through anyway (use the "approve all" button) — does the system warn? does the audit log distinguish that this WAS escalated before the override?
- Escalate manually with a custom note — does it merge with the existing auto-escalation or duplicate?
- Resolve the existing escalation without addressing the underlying flags — does the audit trail catch the inconsistency?

**Stress test:** What's the cleanest path to resolution? Where does the tool let a reviewer hide intent?

---

## Scenario 3 · The £250k 48-hour rule

The escalation rule says: *"Item value > £250,000 AND any reviewer pending > 48h → auto-escalate to Director."*

Cloud Infrastructure Renewal (£485k) has Proc Lead pending. Fleet Service Contract (£312k) has Compliance pending. Both should fire this rule once the clock ages past 48h.

**Stress test:** The rule is declared but the timer enforcement isn't implemented yet. Where's the cleanest hook to wire it in — a background scan, a deal-update trigger, an explicit "check rules" button? What would you want as the procurement lead?

---

## Scenario 4 · Audit trail under audit

Open **Audit Trail**. Scroll the event feed. Every event has an **anchor** button.

Click anchor on any event → it calls OnlyBrains' BSV anchor endpoint (`/api/fn/exec` type=STATE, ~10 $KONO each). On success the row gets a `tx <hash>` chip and the event becomes immutable on-chain.

**Stress test:**
- What metadata should be in the anchored payload that isn't there yet? Reviewer reasoning? Linked deal hash? Prior event hash for chain integrity?
- The BSV anchor is per-event. Would you prefer batched anchoring (every approved escalation? daily?) or always per-event?
- An auditor 3 years from now needs to verify the trail. What's missing for that to be defensible?

---

## Scenario 5 · The £KONO cost angle

Open the **KCC ledger** (bottom-left badge with the rainbow bars). The tool ships with a 30-day trial Konomi licence, ring-tagged event log, and OnlyBrains $KONO wallet sync.

Every reviewer action, every escalation, every anchor accrues $KONO if you trade your Anthropic tokens for it via `/api/xchg/swap`. Click the "rates" button in the ledger modal to see exchange.

**Stress test:** As a procurement department, what does ring-tagged contribution measurement give you that ordinary activity logs don't? Where does the $KONO economics make sense vs. where does it just add noise?

---

## Scenario 6 · The browser-only constraint

This is one HTML file. Open it on your laptop. Then open the same file (same URL) on another browser/device. They share localStorage only on the same browser — **the data does not sync across devices**.

**Stress test:** What's the right boundary for a sovereign tool that needs multi-user reviewer flows? Export/import JSON? Mesh broadcasts? An optional sync endpoint the gym/firm operates themselves? Where does sovereignty fight you on UX?

---

## Scenario 7 · Workflow extension

The 4 reviewer roles + 5 escalation rules + 8 stages are all in `configs/apex-procurement.json`. Want a 6th reviewer (Risk)? A new stage (Legal Sign-Off)? A new rule? Edit the JSON, rebuild, push, done.

**Stress test:** Where does the config-driven approach show seams? Anything you'd want to configure that you can't yet? Anything you'd want to express in a more structured form than JSON?

---

## What I'd value most

- Edge cases that surface in the FIRST 10 minutes
- Where the tool LIES to you (silent failures, ambiguous state)
- Where the agent recommendation is too thin
- Where the audit trail can be sidestepped
- Where escalation logic produces wrong outcomes

Feed it the workflow that broke for you most recently in client environments. I want to see it fail.

---

**◊·κ=1 · Apex Procurement · prime 149 · forged from FallForce (prime 709) · 30-day Konomi trial active**
