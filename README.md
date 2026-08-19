# FallForce — the whole stack, owned once

**LIVE — the stack catalogue: https://sjgant80-hub.github.io/fallforce/stack.html**
**LIVE — FallCRM Elite (the CRM shelf's flagship): https://sjgant80-hub.github.io/fallforce/**

FallForce is the Salesforce-killer: CRM, email, scheduling, forms, e-sign, SMS, invoicing,
automation, and the sovereignty-only tools SaaS cannot legally serve — the whole shadow-stack you
**own once** instead of renting forever. The savings math is derived by a witness-gated kernel
(`catalogue.mjs`), the catalogue is crawled from the full estate index, and nothing is for sale
until the payment-rail door is signed by the master key — counsel first.

> **FACE**: One HTML file. Zero servers. Zero subscriptions. A full CRM with an 8+1 AI swarm that runs in your browser. Your pipeline, your data, your machine.

---

## TEMPLATE

### What you get

A sovereign sales platform — pipeline management, contact intelligence, forecasting, AI coaching, and autopilot — for the cost of an Anthropic API key.

### Full CRM

| Module | What it does |
|---|---|
| **Dashboard** | KPIs, revenue trends, pipeline funnel, today's tasks, hot contacts, closing deals |
| **Pipeline** | Drag-and-drop Kanban board. Deals flow through stages. Weighted forecast |
| **Contacts** | Full profiles with activity timeline, deal associations, notes, company links. CSV import |
| **Companies** | Account intelligence. Deal rollup per org. Revenue attribution |
| **Activities** | Tasks, calls, meetings. Mini calendar. Overdue/today/upcoming filters |
| **Sequences** | Email cadence automation. Multi-step follow-up chains |
| **Email** | Compose and draft with AI. Inbox sidebar |
| **Goals** | Revenue, deals, calls, win rate targets with progress rings |
| **Reports** | AI-generated sales intelligence. Export to CSV/JSON |
| **Settings** | Org config, data import/export, licence tier, theme |

### 8+1 AI Swarm (MACCubeFACE)

Eight specialist agents + one orchestrator, all running live against your actual CRM data:

| Agent | Icon | Role |
|---|---|---|
| **Omega (Orchestrator)** | Ω | Routes queries across agents. Synthesizes cross-domain answers |
| **Alpha (Briefing)** | α | Morning sales briefing — pipeline snapshot, priorities, overnight changes |
| **Beta (Deal Coach)** | β | SPIN/Challenger selling tactics for your top deals |
| **Gamma (Email Drafter)** | γ | Personalized outreach using actual contact + deal context |
| **Delta (Risk Detector)** | δ | Flags stale deals, slipping close dates, low-probability pipe |
| **Epsilon (Forecaster)** | ε | Probability-adjusted revenue modeling and trend analysis |
| **Zeta (Objection Handler)** | ζ | Counter-arguments for common deal blockers |
| **Eta (Next Best Action)** | η | The single highest-leverage move you should make right now |
| **Theta (Pipeline Analyst)** | θ | Deep pipeline composition, velocity, and conversion analysis |

### Autopilot

One button. All agents run in sequence. Complete daily action plan — briefing, deal coaching, risk alerts, drafted emails, next moves — in under 60 seconds.

---

## TAG

### Why sovereign software

Salesforce charges $300/user/month to hold your data hostage. FallForce does everything that matters for the cost of an API key.

| | Salesforce | FallForce |
|---|---|---|
| **Price** | $300/user/month (Enterprise) | Free + your own API key |
| **Data location** | Their servers, their rules | Your browser, your machine |
| **Setup time** | 6-12 months implementation | Open HTML file. Done |
| **AI** | Einstein GPT (limited, extra cost) | 8+1 agent swarm with full CRM context |
| **Customization** | Hire a consultant | Edit the HTML |
| **Offline** | No | Yes (AI features need internet for API) |
| **Data portability** | Good luck exporting | JSON/CSV export in 1 click |
| **Mobile** | Separate app, separate subscription | Same file, responsive |
| **Vendor lock-in** | Absolute | Zero. It's one file |
| **Data privacy** | 47-page privacy policy | Your data never leaves your machine |

No npm. No build step. No Docker. No database. No account creation.

---

## LIVE

**[sjgant80-hub.github.io/fallforce](https://sjgant80-hub.github.io/fallforce/)**

Open it. No signup. No credit card. No 14-day trial. Just the CRM.

---

## ARCHITECTURE

### 7 Layers (Seed v16.3)

```
Layer 0: DATA      — localStorage persistence, JSON/CSV export, interop namespace
Layer 1: LOGIC     — CRM engine, pipeline math, forecast models
Layer 2: SWARM     — 8+1 MACCubeFACE agents (Ω + α-θ)
Layer 3: AUTOPILOT — sequential agent orchestration, daily action plans
Layer 4: RENDER    — vanilla JS DOM, responsive layout, card/table views
Layer 5: INTERACT  — drag-drop Kanban, swipe nav, touch targets, keyboard
Layer 6: SKIN      — CSS custom properties, light/dark theme, ai-nativesolutions aesthetic
```

### Konomi Constants

```javascript
const PHI    = 1.618033988749895;
const KAPPA  = 0.618033988749895;
const SPINE  = [2,3,5,7,11,13,17];
const FOLD   = 510510;
const BLOOM_LABELS = ['ground','signal','gate','heart','voice','mirror','watcher'];
const LIFECYCLE = ['●','〜','┃','♡','△','◐','◯'];
```

### Bloom Ring Colours (CSS vars)

```css
--r0: #660044;  /* ground  · 2  */
--r1: #00AAFF;  /* signal  · 3  */
--r2: #FFAA00;  /* gate    · 5  */
--r3: #FF4444;  /* heart   · 7  */
--r4: #44AA44;  /* voice   · 11 */
--r5: #AA44FF;  /* mirror  · 13 */
--r6: #FFFFFF;  /* watcher · 17 */
--phi: 1.618;
--kappa: 0.618;
```

### Interop Namespace

All Fall Suite tools share data via `BroadcastChannel` and `localStorage` under the `fall_` prefix:

| Key | Purpose |
|---|---|
| `fall_shared_contacts` | Cross-tool contact sync |
| `fall_shared_company` | Company context sharing |
| `fall_shared_bloom` | Bloom state propagation |
| `fall_shared_settings` | Shared preferences |

Channels: `fall-signal`, `fall-data`, `fall-bloom`

### Export Format (v16.3)

```json
{
  "tool": "fallforce",
  "version": "3.0",
  "seed": "16.3",
  "exported": "ISO-8601",
  "bloom": [0,0,0,0,0,0,0],
  "data": { ... }
}
```

---

## BUILD

### Quick start

1. Open `index.html` in Chrome, Edge, or Safari
2. Paste your Anthropic API key in the header bar (`sk-ant-api...`)
3. Start adding contacts and deals
4. Hit **Autopilot** for your daily AI action plan

### Get an API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account, add credits ($5 lasts weeks of heavy use)
3. Generate an API key
4. Paste it in the FallForce header bar

### Modify

It's one HTML file. Open it in any editor.

- CSS custom properties in `:root` for theming (including bloom ring colours)
- `SWARM_AGENTS` array to add/modify AI agents
- `DB` object schema for data model changes
- `KONOMI CONSTANTS` section for seed parameters
- `INTEROP NAMESPACE` section for cross-tool communication

### Tech stack

There is no tech stack. It's one HTML file.

- Vanilla JavaScript — no React, no Vue, no framework
- CSS custom properties for theming
- localStorage for persistence
- Claude API (Anthropic) for AI features
- Zero dependencies. Zero build tools. Zero node_modules

---

## Who this is for

- **Solo founders** who need a CRM but not a Salesforce contract
- **Small sales teams** who want AI-powered pipeline management without enterprise pricing
- **Privacy-conscious** professionals who don't want client data on someone else's servers
- **Anyone** tired of paying $300/month for software that takes 6 months to configure

---

## License

MIT. Use it, fork it, sell it, put it on a USB stick and hand it to your competitors. The code is yours.

---

*◊·κ=1 · Sovereign software. No masters. No subscriptions. No permission needed.*
