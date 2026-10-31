/* RealRise CRM – Store: Zustand, Persistenz, Mutationen, KPIs */
window.RR = window.RR || {};
RR.store = (function () {
  const KEY = 'rr-crm:v1';
  const DAY = 86400000;
  const listeners = new Set();
  let state = null;
  let undoSnap = null;

  const STAGES = [
    { id: 'lead', name: 'Lead', tone: 'sky', p: 0.1 },
    { id: 'meeting', name: 'Erstgespräch', tone: 'lime', p: 0.35 },
    { id: 'offer', name: 'Angebot', tone: 'coral', p: 0.6 },
    { id: 'closing', name: 'Closing', tone: 'ink', p: 0.9 },
  ];
  const SEGMENTS = { b2b: 'B2B', b2c: 'B2C', other: 'Anderes' };
  const SOURCES = { meta: 'Meta Ads', webinar: 'Webinar', ig: 'Instagram', wa: 'WhatsApp', aff: 'Affiliate', ref: 'Empfehlung' };
  const KINDS = { call: 'Call', meeting: 'Termin', task: 'Aufgabe', email: 'E-Mail' };
  const PSTATUS = { planning: 'Geplant', progress: 'Läuft', review: 'Review', done: 'Fertig' };
  const ISTATUS = { draft: 'Entwurf', due: 'Offen', overdue: 'Überfällig', paid: 'Bezahlt' };

  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { state = JSON.parse(raw); if (state && state.v === 1) return state; } } catch (e) { /* ignore */ }
    state = RR.seed(); save(); return state;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  function reset() { state = RR.seed(); save(); emit('reset'); }
  function on(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function emit(what) { save(); listeners.forEach((fn) => fn(what)); }
  function snapshot() { undoSnap = JSON.stringify(state); }
  function undo() { if (!undoSnap) return false; state = JSON.parse(undoSnap); undoSnap = null; emit('undo'); return true; }
  function mutate(fn, what) { snapshot(); const r = fn(state); refreshInvoiceStatus(); emit(what || 'change'); return r; }
  const uid = (p) => p + Math.random().toString(36).slice(2, 8);

  // Lookups
  const member = (id) => state.team.find((m) => m.id === id);
  const customer = (id) => state.customers.find((c) => c.id === id);
  const deal = (id) => state.deals.find((d) => d.id === id);
  const task = (id) => state.tasks.find((t) => t.id === id);
  const invoice = (id) => state.invoices.find((i) => i.id === id);
  const project = (id) => state.projects.find((p) => p.id === id);
  const stage = (id) => STAGES.find((s) => s.id === id);
  const me = () => state.team.find((m) => m.me) || state.team[0];

  function refreshInvoiceStatus() {
    const now = Date.now();
    state.invoices.forEach((i) => { if (i.status === 'due' && i.dueAt < now) i.status = 'overdue'; if (i.status === 'overdue' && i.dueAt >= now) i.status = 'due'; });
  }

  function addActivity(actorId, text, customerId, kind) {
    state.activity.unshift({ id: uid('a'), actorId, text, customerId, kind, at: Date.now() });
    state.activity = state.activity.slice(0, 60);
  }
  function addNotif(text, href) { state.notifications.unshift({ id: uid('n'), text, href, at: Date.now(), read: false }); state.notifications = state.notifications.slice(0, 20); }
  const custName = (id) => { const c = customer(id); return c ? c.company : '—'; };

  // ---- Mutationen ----
  const actions = {
    addDeal(o) { return mutate((s) => { const d = Object.assign({ id: uid('d'), status: 'open', notes: '', teamIds: [o.ownerId], createdAt: Date.now() }, o); s.deals.unshift(d); addActivity(me().id, 'hat <b>' + d.title + '</b> angelegt', d.customerId, 'stage'); return d; }); },
    updateDeal(id, patch) { return mutate(() => Object.assign(deal(id), patch)); },
    moveDeal(id, stageId) { return mutate(() => { const d = deal(id); d.stage = stageId; d.status = 'open'; addActivity(me().id, 'hat <b>' + d.title + '</b> nach ' + stage(stageId).name + ' verschoben', d.customerId, 'stage'); }); },
    winDeal(id) { return mutate(() => { const d = deal(id); d.status = 'won'; d.stage = 'closing'; d.wonAt = Date.now(); d.closeDate = d.wonAt; addActivity(me().id, 'hat <b>' + d.title + '</b> gewonnen', d.customerId, 'won'); addNotif(custName(d.customerId) + ' ist Kunde geworden', '#/pipeline/' + id); }); },
    loseDeal(id) { return mutate(() => { const d = deal(id); d.status = 'lost'; d.lostAt = Date.now(); addActivity(me().id, 'hat <b>' + d.title + '</b> als verloren markiert', d.customerId, 'lost'); }); },
    deleteDeal(id) { return mutate((s) => { s.deals = s.deals.filter((d) => d.id !== id); }); },
    toggleDealMember(id, mid) { return mutate(() => { const d = deal(id); const i = d.teamIds.indexOf(mid); if (i >= 0) d.teamIds.splice(i, 1); else d.teamIds.push(mid); }); },

    addCustomer(o) { return mutate((s) => { const id = (o.first + '-' + o.last).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 5); const c = Object.assign({ id, health: 60, sources: [], favourite: false, ownerId: me().id, setterId: 'm-david', lastContactAt: Date.now(), createdAt: Date.now() }, o); s.customers.unshift(c); addActivity(me().id, 'hat <b>' + c.company + '</b> als Kunde angelegt', c.id, 'stage'); return c; }); },
    updateCustomer(id, patch) { return mutate(() => Object.assign(customer(id), patch)); },
    toggleFav(id) { return mutate(() => { const c = customer(id); c.favourite = !c.favourite; return c.favourite; }); },
    touchCustomer(id) { return mutate(() => { customer(id).lastContactAt = Date.now(); }); },

    addTask(o) { return mutate((s) => { const t = Object.assign({ id: uid('t'), done: false }, o); s.tasks.push(t); return t; }); },
    toggleTask(id) { return mutate(() => { const t = task(id); t.done = !t.done; if (t.done) addActivity(t.ownerId, 'hat <b>' + t.title + '</b> erledigt', t.customerId, 'task'); }); },
    moveTask(id, at) { return mutate(() => { task(id).at = at; }); },
    deleteTask(id) { return mutate((s) => { s.tasks = s.tasks.filter((t) => t.id !== id); }); },

    addInvoice(o) { return mutate((s) => { const n = 'RR-2026-' + String(100 + s.invoices.length + 1).padStart(4, '0'); const i = Object.assign({ id: uid('i'), number: n, issuedAt: null, dueAt: Date.now() + 14 * DAY, status: 'draft', paidAt: null, terms: '14 Tage', lines: [{ desc: o.desc || 'Leistung', qty: 1, amount: o.amount }] }, o); s.invoices.unshift(i); return i; }); },
    sendInvoice(id) { return mutate(() => { const i = invoice(id); i.status = 'due'; i.issuedAt = Date.now(); i.dueAt = Date.now() + 14 * DAY; addActivity(me().id, 'hat Rechnung ' + i.number + ' gesendet', i.customerId, 'invoice'); }); },
    payInvoice(id) { return mutate(() => { const i = invoice(id); i.status = 'paid'; i.paidAt = Date.now(); if (!i.issuedAt) i.issuedAt = Date.now(); addActivity(me().id, 'hat Rechnung ' + i.number + ' als bezahlt markiert', i.customerId, 'invoice'); }); },
    deleteInvoice(id) { return mutate((s) => { s.invoices = s.invoices.filter((i) => i.id !== id); }); },

    addProject(o) { return mutate((s) => { const p = Object.assign({ id: uid('p'), status: 'planning', steps: ['Zugang ablefy + Community', 'Setup-Call gebucht', 'Claude-Code-Setup', 'Live-Session 1 besucht', '2-von-4-Verifizierung', 'Erstes Ergebnis dokumentiert'].map((t) => ({ title: t, done: false })), teamIds: [me().id], deliveredAt: null }, o); s.projects.unshift(p); return p; }); },
    updateProject(id, patch) { return mutate(() => { const p = project(id); Object.assign(p, patch); if (patch.status === 'done' && !p.deliveredAt) p.deliveredAt = Date.now(); if (patch.status && patch.status !== 'done') p.deliveredAt = null; }); },
    toggleStep(id, idx) { return mutate(() => { const p = project(id); p.steps[idx].done = !p.steps[idx].done; const all = p.steps.every((x) => x.done); if (all) { p.status = 'done'; p.deliveredAt = Date.now(); } else if (p.status === 'done') p.status = 'progress'; else if (p.status === 'planning' && p.steps.some((x) => x.done)) p.status = 'progress'; }); },
    addStep(id, title) { return mutate(() => { project(id).steps.push({ title, done: false }); }); },
    removeStep(id, idx) { return mutate(() => { project(id).steps.splice(idx, 1); }); },
    toggleProjectMember(id, mid) { return mutate(() => { const p = project(id); const i = p.teamIds.indexOf(mid); if (i >= 0) p.teamIds.splice(i, 1); else p.teamIds.push(mid); }); },
    deleteProject(id) { return mutate((s) => { s.projects = s.projects.filter((p) => p.id !== id); }); },

    logCall(o) { return mutate(() => { const c = customer(o.customerId); c.lastContactAt = Date.now(); addActivity(me().id, 'hat einen ' + o.minutes + '-Min-Call protokolliert (' + o.outcome + ')' + (o.notes ? ' · ' + o.notes : ''), c.id, 'call'); }); },
    logEmail(o) { return mutate(() => { const c = customer(o.customerId); c.lastContactAt = Date.now(); addActivity(me().id, 'hat eine E-Mail gesendet: <b>' + o.subject + '</b>', c.id, 'email'); }); },
    markNotifsRead() { return mutate((s) => { s.notifications.forEach((n) => (n.read = true)); }); },
    setSettings(patch) { return mutate((s) => Object.assign(s.settings, patch), 'settings'); },
    updateMe(patch) { return mutate(() => Object.assign(me(), patch)); },
  };

  // ---- KPIs ----
  const sum = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : x), 0);
  const monthKey = (ts) => { const d = new Date(ts); return d.getFullYear() * 12 + d.getMonth(); };
  const nowKey = () => monthKey(Date.now());
  const quarterStart = () => { const d = new Date(); return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1).getTime(); };
  const quarterEnd = () => { const d = new Date(); return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + 3, 1).getTime(); };

  const kpi = {
    openDeals: () => state.deals.filter((d) => d.status === 'open'),
    wonDeals: () => state.deals.filter((d) => d.status === 'won'),
    lostDeals: () => state.deals.filter((d) => d.status === 'lost'),
    openPipeline: () => sum(kpi.openDeals(), (d) => d.amount),
    weighted: () => sum(kpi.openDeals(), (d) => d.amount * stage(d.stage).p),
    wonInMonth: (offset = 0, ownerId) => sum(kpi.wonDeals().filter((d) => monthKey(d.wonAt) === nowKey() - offset && (!ownerId || d.ownerId === ownerId)), (d) => d.amount),
    wonCountInMonth: (offset = 0, ownerId) => kpi.wonDeals().filter((d) => monthKey(d.wonAt) === nowKey() - offset && (!ownerId || d.ownerId === ownerId)).length,
    winRate: (months = 12) => { const from = Date.now() - months * 30 * DAY; const w = kpi.wonDeals().filter((d) => d.wonAt >= from).length; const l = kpi.lostDeals().filter((d) => d.lostAt >= from).length; return w + l ? w / (w + l) : 0; },
    closingThisMonth: () => kpi.openDeals().filter((d) => monthKey(d.closeDate) === nowKey()),
    hotDeals: (n = 6) => kpi.openDeals().slice().sort((a, b) => b.amount * stage(b.stage).p - a.amount * stage(a.stage).p).slice(0, n),
    monthlyWon: (months = 12, ownerId) => { const out = []; for (let i = months - 1; i >= 0; i--) { const k = nowKey() - i; const d = new Date(Math.floor(k / 12), k % 12, 1); out.push({ key: k, label: d.toLocaleString('de-DE', { month: 'short' }), value: sum(kpi.wonDeals().filter((x) => monthKey(x.wonAt) === k && (!ownerId || x.ownerId === ownerId)), (x) => x.amount) }); } return out; },
    teamQuotaQ: (ownerId) => { const members = ownerId ? [member(ownerId)] : state.team.filter((m) => m.role === 'Closer'); const quota = sum(members, (m) => m.quota / 4); const won = sum(kpi.wonDeals().filter((d) => d.wonAt >= quarterStart() && (!ownerId || d.ownerId === ownerId)), (d) => d.amount); const daysLeft = Math.max(1, Math.ceil((quarterEnd() - Date.now()) / DAY)); return { quota, won, pct: quota ? won / quota : 0, daysLeft, perDay: Math.max(0, quota - won) / daysLeft }; },
    stageMix: () => STAGES.map((s) => { const ds = kpi.openDeals().filter((d) => d.stage === s.id); return { stage: s, count: ds.length, value: sum(ds, (d) => d.amount) }; }),
    leaderboard: (by = 'revenue') => state.team.map((m) => { const ds = kpi.wonDeals().filter((d) => d.ownerId === m.id && monthKey(d.wonAt) === nowKey()); return { m, value: sum(ds, (d) => d.amount), count: ds.length, pct: (sum(ds, (d) => d.amount)) / (m.quota / 12) }; }).sort((a, b) => by === 'deals' ? b.count - a.count : b.value - a.value),
    tasksOn: (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); const a = d.getTime(), b = a + DAY; return state.tasks.filter((t) => t.at >= a && t.at < b).sort((x, y) => x.at - y.at); },
    tasksToday: () => kpi.tasksOn(Date.now()),
    upcoming: (n = 3) => { const end = new Date(); end.setHours(23, 59, 59, 999); return state.tasks.filter((t) => t.at > end.getTime() && !t.done).sort((a, b) => a.at - b.at).slice(0, n); },
    overdue: () => { const start = new Date(); start.setHours(0, 0, 0, 0); return state.tasks.filter((t) => t.at < start.getTime() && !t.done).sort((a, b) => b.at - a.at); },
    tasksThisWeek: () => { const d = new Date(); d.setHours(0, 0, 0, 0); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); const a = d.getTime(); d.setDate(d.getDate() + 7); const b = d.getTime(); return state.tasks.filter((t) => t.at >= a && t.at < b); },
    customerOpen: (cid) => kpi.openDeals().filter((d) => d.customerId === cid),
    customerWon: (cid) => kpi.wonDeals().filter((d) => d.customerId === cid),
    contacted7d: () => state.customers.filter((c) => Date.now() - c.lastContactAt < 7 * DAY),
    newCustomers: (days) => state.customers.filter((c) => Date.now() - c.createdAt < days * DAY),
    collected: (offset = 0) => sum(state.invoices.filter((i) => i.status === 'paid' && monthKey(i.paidAt) === nowKey() - offset), (i) => i.amount),
    invoiced: (offset = 0) => sum(state.invoices.filter((i) => i.issuedAt && monthKey(i.issuedAt) === nowKey() - offset), (i) => i.amount),
    outstanding: () => sum(state.invoices.filter((i) => i.status === 'due'), (i) => i.amount),
    overdueInv: () => state.invoices.filter((i) => i.status === 'overdue'),
    aging: () => { const b = [{ l: '0–30', n: 0, v: 0 }, { l: '31–60', n: 0, v: 0 }, { l: '61–90', n: 0, v: 0 }, { l: '90+', n: 0, v: 0 }]; state.invoices.filter((i) => i.status === 'due' || i.status === 'overdue').forEach((i) => { const age = (Date.now() - (i.issuedAt || Date.now())) / DAY; const k = age <= 30 ? 0 : age <= 60 ? 1 : age <= 90 ? 2 : 3; b[k].n++; b[k].v += i.amount; }); return b; },
    agingBucket: (i) => { const age = (Date.now() - (i.issuedAt || Date.now())) / DAY; return age <= 30 ? 0 : age <= 60 ? 1 : age <= 90 ? 2 : 3; },
    revenueBySegment: (months) => { const from = nowKey() - months + 1; const out = []; for (let k = from; k <= nowKey(); k++) { const d = new Date(Math.floor(k / 12), k % 12, 1); const row = { label: d.toLocaleString('de-DE', { month: 'short' }), b2b: 0, b2c: 0, other: 0 }; kpi.wonDeals().filter((x) => monthKey(x.wonAt) === k).forEach((x) => { const c = customer(x.customerId); row[c ? c.segment : 'other'] += x.amount; }); out.push(row); } return out; },
    sourceCounts: (months) => { const from = Date.now() - months * 30 * DAY; const cs = state.customers.filter((c) => c.createdAt >= from); const counts = {}; Object.keys(SOURCES).forEach((k) => (counts[k] = 0)); cs.forEach((c) => c.sources.forEach((s) => counts[s]++)); return { total: cs.length, counts }; },
    newPerMonth: (months) => { const out = []; for (let i = months - 1; i >= 0; i--) { const k = nowKey() - i; const d = new Date(Math.floor(k / 12), k % 12, 1); out.push({ label: d.toLocaleString('de-DE', { month: 'short' }), value: state.customers.filter((c) => monthKey(c.createdAt) === k).length }); } return out; },
    winRatePerMonth: (months) => { const out = []; for (let i = months - 1; i >= 0; i--) { const k = nowKey() - i; const w = kpi.wonDeals().filter((d) => monthKey(d.wonAt) === k).length; const l = kpi.lostDeals().filter((d) => monthKey(d.lostAt) === k).length; const d = new Date(Math.floor(k / 12), k % 12, 1); out.push({ label: d.toLocaleString('de-DE', { month: 'short' }), value: w + l ? w / (w + l) : null }); } return out; },
    topCustomers: (months, n = 8) => { const from = Date.now() - months * 30 * DAY; const map = {}; kpi.wonDeals().filter((d) => d.wonAt >= from).forEach((d) => { map[d.customerId] = map[d.customerId] || { c: customer(d.customerId), deals: 0, revenue: 0, trend: [0, 0, 0, 0, 0, 0] }; map[d.customerId].deals++; map[d.customerId].revenue += d.amount; const idx = 5 - Math.min(5, Math.floor((Date.now() - d.wonAt) / (30 * DAY))); map[d.customerId].trend[idx] += d.amount; }); return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, n); },
    repPerf: (months) => { const from = Date.now() - months * 30 * DAY; return state.team.map((m) => { const w = kpi.wonDeals().filter((d) => d.ownerId === m.id && d.wonAt >= from); const l = kpi.lostDeals().filter((d) => d.ownerId === m.id && d.lostAt >= from).length; const won = sum(w, (d) => d.amount); return { m, won, deals: w.length, rate: w.length + l ? w.length / (w.length + l) : null, pct: won / (m.quota * months / 12) }; }).sort((a, b) => b.won - a.won); },
    avgDeal: (months) => { const from = Date.now() - months * 30 * DAY; const w = kpi.wonDeals().filter((d) => d.wonAt >= from); return w.length ? sum(w, (d) => d.amount) / w.length : 0; },
    avgCycle: (months) => { const from = Date.now() - months * 30 * DAY; const w = kpi.wonDeals().filter((d) => d.wonAt >= from); return w.length ? sum(w, (d) => (d.wonAt - d.createdAt) / DAY) / w.length : 0; },
    projectPct: (p) => p.steps.length ? p.steps.filter((s) => s.done).length / p.steps.length : 0,
    storageKB: () => Math.round((localStorage.getItem(KEY) || '').length / 1024),
  };

  return { KEY, STAGES, SEGMENTS, SOURCES, KINDS, PSTATUS, ISTATUS, load, save, reset, on, undo, emit, get state() { return state; }, member, customer, deal, task, invoice, project, stage, me, actions, kpi, sum };
})();
