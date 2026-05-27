#!/usr/bin/env node
// ◊·κ FallForce Per-Client Builder
// Usage:
//   node scripts/build-client.js configs/apex-procurement.json
//   KONOMI_PRIVATE_KEY=... node scripts/build-client.js configs/apex-procurement.json  (mints signed trial)

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const MASTER = path.join(ROOT, 'index.html');
const CLIENTS_DIR = path.join(ROOT, 'clients');
const GOV_PANEL = path.join(ROOT, 'scripts', 'governance-panels.html');
const LLM_SHIM = path.join(ROOT, 'scripts', 'llm-cascade.html');

// Open extension primes — fallforce master = 709 (linear)
const PRIME_POOL = [149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277];
const STATE_FILE = path.join(ROOT, 'configs', '.build-state.json');

function loadState() { try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (_) { return { assigned: {} }; } }
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }
function nextPrime(state, slug) {
  if (state.assigned[slug]) return state.assigned[slug];
  const used = new Set(Object.values(state.assigned));
  for (const p of PRIME_POOL) if (!used.has(p)) { state.assigned[slug] = p; return p; }
  throw new Error('Prime pool exhausted');
}

// ─── Konomi signing ─────
function canonicalJSON(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJSON).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJSON(obj[k])).join(',') + '}';
}
function loadPrivKey() {
  const raw = process.env.KONOMI_PRIVATE_KEY;
  if (!raw) return null;
  const seed = Buffer.from(raw, 'base64');
  if (seed.length !== 32) throw new Error('KONOMI_PRIVATE_KEY must be 32-byte base64');
  const prefix = Buffer.from('302e020100300506032b657004220420', 'hex');
  return crypto.createPrivateKey({ key: Buffer.concat([prefix, seed]), format: 'der', type: 'pkcs8' });
}
function mintTrial(toolId, toolPrime, days) {
  const privKey = loadPrivKey();
  if (!privKey) return null;
  const issued = new Date();
  const expires = new Date(issued.getTime() + (days || 30) * 24 * 60 * 60 * 1000);
  const payload = {
    v: 1,
    forge_id: 'fg_ff_' + crypto.randomBytes(6).toString('hex'),
    tool_id: toolId,
    tool_prime: toolPrime,
    tier: 'trial',
    features: ['core', 'mesh_inbound', 'governance', 'audit_anchor'],
    issued: issued.toISOString(),
    expires: expires.toISOString(),
    issuer: 'konomi'
  };
  const sig = crypto.sign(null, Buffer.from(canonicalJSON(payload), 'utf8'), privKey);
  return Buffer.from(JSON.stringify({ payload, sig: sig.toString('base64') })).toString('base64');
}

function slugify(s) { return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32); }
function esc(s) { return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ─── Main build ─────
function buildClient(configPath) {
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!cfg.client_name) throw new Error('config missing client_name');
  const slug = cfg.slug || slugify(cfg.client_name);
  const state = loadState();
  const prime = cfg.prime || nextPrime(state, slug);
  if (!cfg.prime) saveState(state);

  let html = fs.readFileSync(MASTER, 'utf8');

  // 1) Title + meta
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(cfg.client_name)} · ${esc(cfg.product_name || 'FallForce')}</title>`);
  if (cfg.tagline) {
    if (/<meta name="description"[^>]*>/i.test(html)) {
      html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${esc(cfg.tagline)}">`);
    } else {
      html = html.replace('</head>', `<meta name="description" content="${esc(cfg.tagline)}">\n</head>`);
    }
  }

  // 2) NODE identity override
  const nodeBlock = `
  window.NODE = {
    id: '${slug}',
    name: ${JSON.stringify(cfg.client_name)},
    prime: ${prime},
    layers: 7,
    built: '${new Date().toISOString().slice(0,10)}',
    branded_by: 'fallforce',
    master_prime: 709,
    workflow: ${JSON.stringify(cfg.workflow || 'crm')}
  };`;
  if (/window\.NODE\s*=\s*\{[\s\S]*?\};/.test(html)) {
    html = html.replace(/window\.NODE\s*=\s*\{[\s\S]*?\};/, nodeBlock);
  } else {
    // Inject before mesh shim
    html = html.replace(/<!-- ◊·κ FALLMESH SHIM/, `<script>${nodeBlock}</script>\n<!-- ◊·κ FALLMESH SHIM`);
  }

  // 3) Brand colour overrides
  if (cfg.brand) {
    const tokens = [];
    if (cfg.brand.accent)        tokens.push(`--accent: ${cfg.brand.accent};`);
    if (cfg.brand.accent_dim)    tokens.push(`--accent-dim: ${cfg.brand.accent_dim};`);
    if (tokens.length) {
      html = html.replace('</style>', `\n/* per-client brand override · ${cfg.client_name} */\n:root { ${tokens.join(' ')} }\n</style>`);
    }
  }

  // 4) Nav logo (sidebar top brand)
  if (cfg.client_logo_text) {
    // FallForce uses different structure; safest replacement is inside <h1> or first occurrence of FC text
    html = html.replace(/FallCRM<\/strong>/g, esc(cfg.client_logo_text) + '</strong>');
    html = html.replace(/>FC<\/(\w+)>/g, '>' + esc((cfg.client_logo_text || '').slice(0,2).toUpperCase()) + '</$1>');
  }

  // 5) Product name override (replace FallForce / FallCRM Elite mentions)
  if (cfg.product_name) {
    html = html.replace(/FallCRM Elite/g, cfg.product_name);
    html = html.replace(/FallForce/g, cfg.product_name);
  }

  // 6) Pipeline stages override (procurement: RFQ → Awarded → Audit Cleared)
  if (cfg.pipeline_stages && Array.isArray(cfg.pipeline_stages)) {
    const stagesJSON = JSON.stringify(cfg.pipeline_stages);
    // Replace the master's stages array
    html = html.replace(/stages:\s*\[[^\]]+\]/, `stages: ${stagesJSON}`);
  }

  // 6b) Patch master to expose DB + showPage + render fns on window (overlay needs them)
  html = html.replace(/\bconst DB = \{/, 'var DB = window.DB = {');
  // Use var so bare showPage() calls elsewhere still work, AND expose on window
  html = html.replace(/\bfunction showPage\(/, 'var showPage = window.showPage = function showPage(');
  // Expose render functions so the gov overlay can trigger re-render after seed override
  ['renderDashboard','renderPipeline','renderContacts','renderActivities','renderPipelineFunnel'].forEach(function(fn){
    var re = new RegExp('\\bfunction ' + fn + '\\(', 'g');
    html = html.replace(re, 'window.' + fn + ' = function ' + fn + '(');
  });

  // 7) Seed governance data — reviewers, escalation rules, deals (RFQs), audit baseline
  // We override DB.deals + DB.settings.stages via GOV_SEED at runtime (more reliable than regex replace)
  const govSeed = {
    reviewers: cfg.reviewers || [],
    escalation_rules: cfg.escalation_rules || [],
    audit_log: (cfg.audit_log || []).map(e => Object.assign({ id: 'ev_seed_' + crypto.randomBytes(3).toString('hex'), ts: Date.now() - Math.floor(Math.random() * 86400000 * 7) }, e)),
    escalations: cfg.escalations || [],
    signoffs: cfg.signoffs || {},
    seed_deals: cfg.seed_deals || null,
    pipeline_stages: cfg.pipeline_stages || null
  };

  // 8) Inject governance overlay (panels + JS + nav items) + GOV_SEED
  const govPanel = fs.readFileSync(GOV_PANEL, 'utf8');
  const seedScript = `<script>window.GOV_SEED = ${JSON.stringify(govSeed)};</script>`;
  // Expose DB + showPage to window so the overlay can hook in (master uses const)
  const exposeScript = `<script>
(function exposeMaster(){
  function tryExpose(){
    try {
      if (typeof DB !== 'undefined' && !window.DB) window.DB = DB;
      if (typeof showPage === 'function' && !window.showPage) window.showPage = showPage;
      if (window.DB && window.showPage) return;
    } catch(_){}
    setTimeout(tryExpose, 30);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryExpose, { once:true });
  else tryExpose();
})();
</script>`;
  // Add body class
  if (cfg.workflow === 'procurement' || cfg.workflow === 'governance') {
    html = html.replace(/<body([^>]*)>/, '<body$1 class="workflow-governance">');
  }
  // Expose + seed + LLM cascade go before </body>
  const llmShim = fs.readFileSync(LLM_SHIM, 'utf8');
  html = html.replace('</body>', exposeScript + '\n' + seedScript + '\n' + llmShim + '\n</body>');
  // Governance panels (the <div class="page"> elements) must live INSIDE <main> alongside the master's pages
  if (/<\/main>/.test(html)) {
    html = html.replace('</main>', govPanel + '\n</main>');
  } else {
    html = html.replace('</body>', govPanel + '\n</body>');
  }

  // 9) Konomi visibility flag
  if (cfg.konomi_visible === false) {
    const hideCss = `\n/* client build: hide Konomi/KCC badges */\n#kcc-badge,#konomi-badge{display:none !important;}\n`;
    html = html.replace('</style>', hideCss + '</style>');
  }

  // 10) Trial licence — auto-activate on boot
  const trialEnv = mintTrial(slug, prime, cfg.trial_days || 30);
  if (trialEnv) {
    const licenceSeed = `
<script>
(function preActivate(){
  function ap(){
    try {
      var k = 'konomi_licence_' + ${JSON.stringify(slug)};
      if (localStorage.getItem(k)) return;
      localStorage.setItem(k, ${JSON.stringify(trialEnv)});
    } catch(_){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ap, { once:true });
  else ap();
})();
</script>`;
    html = html.replace('</body>', licenceSeed + '\n</body>');
  }

  // 11) Manifest comment
  const manifest = `<!--
  ◊·κ=1 · per-client FallForce build
  client:   ${cfg.client_name}
  slug:     ${slug}
  prime:    ${prime}
  workflow: ${cfg.workflow || 'crm'}
  master:   sjgant80-hub/fallforce (prime 709)
  built:    ${new Date().toISOString()}
  trial:    ${trialEnv ? 'signed (' + (cfg.trial_days||30) + ' days)' : 'unsigned'}
-->\n`;
  html = manifest + html;

  // 12) Write
  if (!fs.existsSync(CLIENTS_DIR)) fs.mkdirSync(CLIENTS_DIR, { recursive: true });
  const outPath = path.join(CLIENTS_DIR, slug + '.html');
  fs.writeFileSync(outPath, html);

  return {
    slug, prime, client_name: cfg.client_name, workflow: cfg.workflow,
    out: outPath,
    size_kb: Math.round(html.length / 1024),
    trial_signed: !!trialEnv,
    url_pages: 'https://sjgant80-hub.github.io/fallforce/clients/' + slug + '.html'
  };
}

// ─── CLI ─────
if (require.main === module) {
  const cfgPath = process.argv[2];
  if (!cfgPath) {
    console.error('Usage: node scripts/build-client.js configs/<client>.json');
    process.exit(1);
  }
  try {
    const r = buildClient(path.resolve(cfgPath));
    console.log('◊·κ CLIENT BUILD');
    console.log('═'.repeat(60));
    console.log('client:    ' + r.client_name);
    console.log('slug:      ' + r.slug);
    console.log('prime:     ' + r.prime);
    console.log('workflow:  ' + r.workflow);
    console.log('size:      ' + r.size_kb + ' KB');
    console.log('trial:     ' + (r.trial_signed ? '✓ signed' : '✗ unsigned'));
    console.log('output:    ' + r.out);
    console.log('live URL:  ' + r.url_pages);
    console.log('═'.repeat(60));
  } catch (e) {
    console.error('build failed:', e.message);
    process.exit(1);
  }
}

module.exports = { buildClient };
