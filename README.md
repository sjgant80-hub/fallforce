# FallForce — Sovereign Sales Platform

**The Salesforce killer that fits on a USB stick.**

One HTML file. Zero servers. Zero subscriptions. Zero data harvesting. A full CRM with an 8-agent AI swarm that runs entirely in your browser. Your pipeline, your data, your machine.

Salesforce charges $300/user/month to hold your own data hostage on their servers. FallForce does everything that matters — pipeline, contacts, forecasting, AI coaching, autopilot — for the cost of an Anthropic API key.

---

## What you get

### Full CRM

| Module | What it does |
|---|---|
| **Dashboard** | KPIs, revenue trends, pipeline funnel, today's tasks, hot contacts, closing deals — one glance |
| **Pipeline** | Drag-and-drop Kanban board. Deals flow through stages. Color-coded by temperature. Weighted forecast |
| **Contacts** | Full profiles with activity timeline, deal associations, notes, company links. CSV import, card view on mobile |
| **Companies** | Account intelligence. Deal rollup per org. Revenue attribution |
| **Activities** | Tasks, calls, meetings. Mini calendar. Overdue/today/upcoming filters |
| **Sequences** | Email cadence automation. Multi-step follow-up chains |
| **Email** | Compose and draft with AI. Inbox sidebar |
| **Goals** | Revenue, deals, calls, win rate targets with progress rings |
| **Reports** | AI-generated sales intelligence. Export to CSV/JSON |
| **Settings** | Org config, data import/export, licence tier, theme |

### 8+1 AI Swarm

This is where FallForce leaves Salesforce in the dust. Eight specialist AI agents + one orchestrator, all running live against your actual CRM data:

| Agent | Role |
|---|---|
| **Omega (Orchestrator)** | Routes queries across agents. Synthesizes cross-domain answers |
| **Alpha (Briefing)** | Morning sales briefing — pipeline snapshot, today's priorities, what moved overnight |
| **Beta (Deal Coach)** | SPIN/Challenger selling tactics for your top deals. Real coaching, not templates |
| **Gamma (Email Drafter)** | Writes personalized outreach using actual contact + deal context from your pipeline |
| **Delta (Risk Detector)** | Flags stale deals, slipping close dates, low-probability pipe. Saves you from surprises |
| **Eta (Next Best Action)** | One recommendation. The single highest-leverage move you should make right now |
| **Zeta (Objection Handler)** | Prepares counter-arguments for common deal blockers |
| **Epsilon (Forecast Analyst)** | Probability-adjusted revenue modeling and trend analysis |

### Autopilot

One button. All eight agents run in sequence. You get a complete daily action plan — briefing, deal coaching, risk alerts, drafted emails, next moves — generated in under 60 seconds. This is what Salesforce Einstein promises and doesn't deliver.

---

## How it's different from Salesforce

| | Salesforce | FallForce |
|---|---|---|
| **Price** | $300/user/month (Enterprise) | Free + your own API key |
| **Data location** | Their servers, their rules | Your browser, your machine |
| **Setup time** | 6-12 months implementation | Open HTML file. Done |
| **AI** | Einstein GPT (limited, extra cost) | 8+1 agent swarm with full CRM context |
| **Customization** | Hire a consultant | Edit the HTML |
| **Offline** | No | Yes (AI features need internet for API) |
| **Data portability** | Good luck exporting | JSON/CSV export in 1 click |
| **Mobile** | Separate app, separate subscription | Same file, responsive — desktop/tablet/phone |
| **Vendor lock-in** | Absolute | Zero. It's one file |
| **Data privacy** | Read their 47-page privacy policy | Your data never leaves your machine |

---

## Quick start

1. Open `index.html` in Chrome, Edge, or Safari
2. Paste your Anthropic API key in the header bar (`sk-ant-api...`)
3. Start adding contacts and deals
4. Hit **Autopilot** for your daily AI action plan

That's it. No npm. No build step. No Docker. No database. No account creation.

### Get an API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account, add credits ($5 lasts weeks of heavy use)
3. Generate an API key
4. Paste it in the FallForce header bar

### Mobile

Open the same file on your phone. The UI switches to mobile layout automatically — bottom nav, card views, touch-friendly modals. Works from a local file, a USB stick, or the GitHub Pages link.

---

## Live demo

**[sjgant80-hub.github.io/fallforce](https://sjgant80-hub.github.io/fallforce/)**

Open it. No signup. No credit card. No 14-day trial. Just the CRM.

---

## Data sovereignty

FallForce stores everything in `localStorage`. Your contacts, deals, pipeline, notes, activity history — all of it lives in your browser on your machine. Nothing is sent anywhere except the Claude API calls you explicitly trigger (and those only send the CRM context needed for that specific agent query).

**Export anytime**: Settings > Export Data > JSON or CSV. Your data. Your format. No vendor lock-in games.

**Import**: Drop a JSON backup or CSV contact list. Instant hydration.

**USB mode**: Copy the HTML file to a USB stick. Open it on any machine. Import your data backup. Full CRM, anywhere, offline-capable.

---

## Features in detail

### Pipeline management
- Drag-and-drop Kanban with customizable stages
- Deal probability tracking with visual progress bars
- Weighted forecast calculation (probability x deal value)
- Temperature indicators: hot, warm, cold, won, lost
- Close date tracking with urgency flags
- Pipeline funnel analysis by stage conversion

### Contact intelligence
- Full profiles: name, email, phone, company, status, notes
- Activity timeline per contact
- Deal association tracking
- Hot/warm/cold status with visual indicators
- CSV bulk import for migration from other CRMs
- Company rollup — see all contacts and deals per account

### Forecasting
- 6-month revenue trend visualization
- Probability-adjusted pipeline forecast
- Won deals MTD tracking
- Win rate targets with progress rings
- Deal velocity analysis

### Responsive design
- **Desktop**: Full sidebar navigation, data tables, Kanban board
- **Tablet**: Condensed sidebar (icon-only), reflowed grids
- **Mobile**: Bottom tab navigation, card views replace tables, swipe-friendly modals
- Light and dark theme with one-click toggle

---

## Tech stack

There is no tech stack. It's one HTML file.

- Vanilla JavaScript — no React, no Vue, no framework
- CSS custom properties for theming
- localStorage for persistence
- Claude API (Anthropic) for AI features
- Google Fonts: Syne, DM Mono, Fraunces
- Zero dependencies. Zero build tools. Zero node_modules

---

## Who this is for

- **Solo founders** who need a CRM but not a Salesforce contract
- **Small sales teams** who want AI-powered pipeline management without enterprise pricing
- **Privacy-conscious** professionals who don't want their client data on someone else's servers
- **Anyone** who's tired of paying $300/month for software that takes 6 months to configure

---

## License

MIT. Use it, fork it, sell it, put it on a USB stick and hand it to your competitors. The code is yours.

---

*Sovereign software. No masters. No subscriptions. No permission needed.*
