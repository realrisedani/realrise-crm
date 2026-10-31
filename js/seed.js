/* RealRise CRM – Demo-Daten (deterministisch, relativ zu heute) */
window.RR = window.RR || {};
RR.seed = (function () {
  function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = rng(20261031);
  const pick = (arr) => arr[Math.floor(R() * arr.length)];
  const between = (a, b) => Math.round(a + R() * (b - a));
  const DAY = 86400000;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const day = (offset, h = 10, m = 0) => { const d = new Date(now.getTime() + offset * DAY); d.setHours(h, m, 0, 0); return d.getTime(); };

  const team = [
    { id: 'm-dani', name: 'Dani Stengel', ini: 'DS', role: 'Closer', tone: 0, email: 'dani@realrise-agency.com', quota: 300000, me: true },
    { id: 'm-robert', name: 'Robert Weber', ini: 'RW', role: 'Closer', tone: 1, email: 'robert@realrise-agency.com', quota: 240000 },
    { id: 'm-david', name: 'David Lenz', ini: 'DL', role: 'Setter', tone: 2, email: 'david@realrise-agency.com', quota: 120000 },
    { id: 'm-chris', name: 'Chris Berger', ini: 'CB', role: 'Setter', tone: 3, email: 'chris@realrise-agency.com', quota: 120000 },
    { id: 'm-regina', name: 'Regina Wolf', ini: 'RG', role: 'Affiliate', tone: 0, email: 'regina@realrise-agency.com', quota: 72000 },
  ];
  const closers = ['m-dani', 'm-robert'];
  const setters = ['m-david', 'm-chris', 'm-regina'];

  const custRaw = [
    ['Lukas', 'Hofmann', 'Hofmann Immobilien GmbH', 'Geschäftsführer', 'München', 'b2b', ['meta', 'webinar']],
    ['Sarah', 'Kühn', 'Kühn Steuerberatung', 'Inhaberin', 'Hamburg', 'b2b', ['webinar', 'ig']],
    ['Jonas', 'Brandt', 'Brandt Solar & Energie', 'Vertriebsleiter', 'Köln', 'b2b', ['meta']],
    ['Mia', 'Schulz', 'Coaching Mia Schulz', 'Business-Coach', 'Berlin', 'b2c', ['ig', 'wa']],
    ['Felix', 'Wagner', 'Wagner Holzbau', 'Geschäftsführer', 'Stuttgart', 'b2b', ['aff', 'webinar']],
    ['Laura', 'Becker', 'Becker Physiotherapie', 'Praxisinhaberin', 'Leipzig', 'b2b', ['meta', 'wa']],
    ['Tim', 'Neumann', 'Neumann Finanzberatung', 'Finanzberater', 'Frankfurt', 'b2b', ['webinar']],
    ['Anna', 'Krüger', 'Selbstständig', 'Online-Marketing', 'Wien', 'b2c', ['ig']],
    ['Daniel', 'Peters', 'Peters Autohaus', 'Verkaufsleiter', 'Dortmund', 'b2b', ['meta', 'ref']],
    ['Julia', 'Roth', 'Roth Kosmetikstudio', 'Inhaberin', 'Nürnberg', 'b2c', ['ig', 'wa']],
    ['Maximilian', 'Vogel', 'Vogel IT-Systemhaus', 'CEO', 'Düsseldorf', 'b2b', ['webinar', 'aff']],
    ['Sophie', 'Lange', 'Lange Architektur', 'Partnerin', 'Zürich', 'b2b', ['ref']],
    ['Paul', 'Schmitt', 'Schmitt Versicherungsmakler', 'Makler', 'Bremen', 'b2b', ['meta', 'webinar']],
    ['Lena', 'Fischer', 'Fischer Personal Training', 'Trainerin', 'Innsbruck', 'b2c', ['ig']],
    ['Nico', 'Schneider', 'Schneider Dachtechnik', 'Geschäftsführer', 'Hannover', 'b2b', ['meta']],
    ['Emma', 'Weiß', 'Weiß Hochzeitsplanung', 'Inhaberin', 'Salzburg', 'b2c', ['wa', 'ig']],
    ['Leon', 'Richter', 'Richter E-Commerce', 'Gründer', 'Mannheim', 'b2b', ['webinar', 'aff']],
    ['Marie', 'Bauer', 'Bauer Zahnarztpraxis', 'Zahnärztin', 'Graz', 'b2b', ['meta']],
    ['Ben', 'Koch', 'Koch Gastronomie', 'Geschäftsführer', 'Augsburg', 'other', ['ref', 'wa']],
    ['Hannah', 'Meyer', 'Meyer Fotografie', 'Fotografin', 'Freiburg', 'b2c', ['ig', 'webinar']],
    ['Oskar', 'Lindner', 'Lindner Logistik AG', 'Leiter Vertrieb', 'Linz', 'b2b', ['meta', 'webinar']],
    ['Clara', 'Huber', 'Huber Weingut', 'Inhaberin', 'Mainz', 'other', ['ref']],
    ['Elias', 'Zimmermann', 'Zimmermann Elektrotechnik', 'Geschäftsführer', 'Kassel', 'b2b', ['meta', 'aff']],
    ['Nora', 'Schwarz', 'Selbstständig', 'Ernährungsberaterin', 'Bonn', 'b2c', ['ig', 'wa']],
  ];
  const slug = (s) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const customers = custRaw.map((c, i) => {
    const id = slug(c[0] + ' ' + c[1]);
    const ownerId = closers[i % 2];
    return {
      id, first: c[0], last: c[1], company: c[2], role: c[3], city: c[4], segment: c[5], sources: c[6],
      email: (c[0] + '.' + c[1]).toLowerCase().replace(/ü/g, 'ue').replace(/ö/g, 'oe').replace(/ä/g, 'ae').replace(/ß/g, 'ss') + '@' + slug(c[2].split(' ')[0]) + '.de',
      phone: '+49 1' + between(50, 79) + ' ' + between(1000000, 9999999),
      health: between(45, 96), ownerId, setterId: setters[i % 3], favourite: i < 2,
      lastContactAt: day(-between(0, 12), between(9, 17), pick([0, 30])), createdAt: day(-between(10, 320)),
    };
  });

  const products = [
    ['Phase 1 · RealRise Academy', 3000, 3000], ['Phase 2 · Done-with-you', 8000, 12000], ['Phase 3 · 1:1 Umsetzung', 18000, 24000],
    ['Upgrade Phase 1 → 2', 6000, 9000], ['Team-Lizenz, 3 Plätze', 7500, 7500], ['Workshop KI im Sales', 2500, 4500], ['Reseller-Setup', 15000, 15000],
  ];
  const stages = ['lead', 'meeting', 'offer', 'closing'];
  const stageMix = { lead: 14, meeting: 12, offer: 10, closing: 8 };
  const deals = []; let dn = 1;
  const addDeal = (o) => deals.push(Object.assign({ id: 'd' + (dn++), notes: '', teamIds: [] }, o));
  const notesPool = ['Will erst nach dem Webinar entscheiden.', 'Budget im Q4 freigegeben, Partner muss zustimmen.', 'Hat bereits Claude-Account, braucht Setup-Hilfe.', 'Ratenzahlung über 12 Monate gewünscht.', 'Vergleicht noch mit einer Agentur-Lösung.', 'Wartet auf Freigabe vom Steuerberater.', ''];
  stages.forEach((st) => {
    for (let i = 0; i < stageMix[st]; i++) {
      const c = pick(customers); const p = pick(products);
      const amount = Math.round(between(p[1], p[2]) / 100) * 100;
      const ownerId = c.ownerId; const setter = c.setterId;
      addDeal({ title: p[0], customerId: c.id, amount, stage: st, status: 'open', closeDate: day(between(2, 70)), ownerId, teamIds: [ownerId, setter], notes: pick(notesPool), createdAt: day(-between(3, 60)) });
    }
  });
  // Gewonnene Deals der letzten 12 Monate (Verlauf mit Trend nach oben)
  const monthWon = [3, 3, 3, 4, 3, 4, 4, 5, 4, 5, 6, 6];
  monthWon.forEach((n, mi) => {
    for (let i = 0; i < n; i++) {
      const c = pick(customers); const p = pick(products);
      const amount = Math.round(between(p[1], p[2]) / 100) * 100;
      const off = -(11 - mi) * 30 - between(0, 27);
      const wonAt = day(Math.min(off, -1), between(9, 18));
      addDeal({ title: p[0], customerId: c.id, amount, stage: 'closing', status: 'won', closeDate: wonAt, wonAt, ownerId: c.ownerId, teamIds: [c.ownerId, c.setterId], createdAt: wonAt - between(14, 60) * DAY });
    }
  });
  for (let i = 0; i < 12; i++) {
    const c = pick(customers); const p = pick(products); const lostAt = day(-between(5, 300));
    addDeal({ title: p[0], customerId: c.id, amount: Math.round(between(p[1], p[2]) / 100) * 100, stage: pick(['meeting', 'offer']), status: 'lost', closeDate: lostAt, lostAt, ownerId: c.ownerId, teamIds: [c.ownerId, c.setterId], createdAt: lostAt - between(10, 50) * DAY, notes: 'Grund: ' + pick(['Budget', 'Timing', 'Kein Entscheider', 'Agentur gewählt']) });
  }

  const taskTitles = {
    call: ['Follow-up Call', 'Setter-Call', 'Rückruf vereinbart', 'Nachfassen Angebot', 'Discovery Call'],
    meeting: ['Erstgespräch', 'Setup-Call', 'Strategie-Session', 'Pipeline-Review', 'Live-Session Mo'],
    task: ['Angebot senden', 'Vertrag nachfassen', 'Rate 2 prüfen', 'Testimonial anfragen', 'Onboarding-Zugang anlegen', 'Account-Plan aktualisieren'],
    email: ['Webinar-Erinnerung schicken', 'Zugangsmail senden', 'Angebot per Mail', 'Nachfass-Mail nach Webinar'],
  };
  const tasks = []; let tn = 1;
  for (let off = -21; off <= 21; off++) {
    const n = off === 0 ? 4 : between(0, 3);
    for (let i = 0; i < n; i++) {
      const kind = pick(['call', 'meeting', 'task', 'email', 'call', 'meeting']);
      const c = R() < 0.85 ? pick(customers) : null;
      const owner = c ? (R() < 0.5 ? c.ownerId : c.setterId) : pick(team).id;
      const h = between(9, 17), m = pick([0, 30]);
      let done = false;
      if (off < 0) done = R() < 0.82; else if (off === 0) done = i === 0 && R() < 0.5;
      tasks.push({ id: 't' + (tn++), title: pick(taskTitles[kind]), customerId: c ? c.id : null, at: day(off, h, m), kind, ownerId: owner, done });
    }
  }
  // Webinar jeden Mittwoch 19:00
  for (let off = -21; off <= 21; off++) { const d = new Date(now.getTime() + off * DAY); if (d.getDay() === 3) tasks.push({ id: 't' + (tn++), title: 'Live-Webinar', customerId: null, at: day(off, 19, 0), kind: 'meeting', ownerId: 'm-dani', done: off < 0 }); }

  // Rechnungen aus gewonnenen Deals
  const invoices = []; let inNo = 101;
  const won = deals.filter((d) => d.status === 'won').sort((a, b) => a.wonAt - b.wonAt);
  won.forEach((d, i) => {
    const issuedAt = d.wonAt + 1 * DAY; const dueAt = issuedAt + 14 * DAY;
    const age = (now.getTime() - issuedAt) / DAY;
    let status = 'paid', paidAt = issuedAt + between(2, 12) * DAY;
    if (age < 3) { status = 'draft'; paidAt = null; }
    else if (age < 14) { status = R() < 0.6 ? 'due' : 'paid'; if (status === 'due') paidAt = null; }
    else if (age < 60 && R() < 0.3) { status = 'overdue'; paidAt = null; }
    const rate = d.amount >= 8000 && R() < 0.5;
    invoices.push({ id: 'i' + (i + 1), number: 'RR-2026-' + String(inNo++).padStart(4, '0'), customerId: d.customerId, dealId: d.id, issuedAt: status === 'draft' ? null : issuedAt, dueAt, amount: rate ? Math.round(d.amount / 12 / 10) * 10 : d.amount, status, paidAt, terms: '14 Tage', lines: [{ desc: d.title + (rate ? ' · Rate 1/12' : ''), qty: 1, amount: rate ? Math.round(d.amount / 12 / 10) * 10 : d.amount }] });
  });
  // 3 Entwürfe heute
  customers.slice(0, 3).forEach((c, i) => invoices.push({ id: 'i' + (invoices.length + 1), number: 'RR-2026-' + String(inNo++).padStart(4, '0'), customerId: c.id, dealId: null, issuedAt: null, dueAt: day(14), amount: [3000, 990, 7500][i], status: 'draft', paidAt: null, terms: '14 Tage', lines: [{ desc: ['Phase 1 · RealRise Academy', 'Rate 2/12 · Phase 2', 'Team-Lizenz, 3 Plätze'][i], qty: 1, amount: [3000, 990, 7500][i] }] }));

  // Onboarding-Projekte
  const stepSets = [
    ['Zugang ablefy + Community', 'Setup-Call gebucht', 'Claude-Code-Setup', 'Live-Session 1 besucht', '2-von-4-Verifizierung', 'Erstes Ergebnis dokumentiert'],
    ['Kick-off-Call', 'Zugang Community', 'Claude-Code-Setup', 'Erster Funnel live', 'Review-Session', 'Übergabe'],
  ];
  const projects = [];
  won.slice(-10).forEach((d, i) => {
    const steps = stepSets[i % 2].map((t) => ({ title: t, done: false }));
    const doneN = [1, 2, 1, 4, 3, 4, 5, 0, 6, 6][i];
    steps.forEach((s, k) => { s.done = k < doneN; });
    const status = doneN === 0 ? 'planning' : doneN >= steps.length ? 'done' : doneN >= steps.length - 1 ? 'review' : 'progress';
    projects.push({ id: 'p' + (i + 1), name: d.title.replace(/ ·.*/, '') + ' Onboarding', customerId: d.customerId, status, dueAt: day([7, 8, 20, 27, 29, 39, 41, 50, -16, -13][i]), deliveredAt: status === 'done' ? day([-16, -13][i - 8] || -10) : null, steps, teamIds: [d.ownerId, 'm-robert', pick(setters)].filter((v, k, a) => a.indexOf(v) === k) });
  });

  const activity = [
    { who: 'm-dani', text: 'hat <b>Phase 2 · Done-with-you</b> nach Closing verschoben', cid: customers[0].id, kind: 'stage', ago: 6 },
    { who: 'm-david', text: 'hat das überarbeitete Angebot gesendet', cid: customers[1].id, kind: 'email', ago: 53 },
    { who: 'm-dani', text: 'hat einen 24-Min-Call protokolliert', cid: customers[9].id, kind: 'call', ago: 120 },
    { who: 'm-robert', text: 'hat Rechnung RR-2026-0118 als bezahlt markiert', cid: customers[3].id, kind: 'invoice', ago: 150 },
    { who: 'm-chris', text: 'hat <b>Setup-Call</b> erledigt', cid: customers[4].id, kind: 'task', ago: 190 },
    { who: 'm-robert', text: 'hat <b>Phase 1 · RealRise Academy</b> gewonnen', cid: customers[5].id, kind: 'won', ago: 240 },
    { who: 'm-david', text: 'hat eine Notiz zum Budget hinterlegt', cid: customers[12].id, kind: 'note', ago: 300 },
    { who: 'm-regina', text: 'hat einen neuen Affiliate-Lead eingetragen', cid: customers[16].id, kind: 'stage', ago: 380 },
  ].map((a, i) => ({ id: 'a' + (i + 1), actorId: a.who, text: a.text, customerId: a.cid, kind: a.kind, at: Date.now() - a.ago * 60000 }));

  const notifications = [
    { id: 'n1', text: customers[0].first + ' ' + customers[0].last + ' hat dein Angebot zweimal geöffnet', href: '#/customers/' + customers[0].id, at: Date.now() - 23 * 60000, read: false },
    { id: 'n2', text: 'Rechnung für ' + customers[3].company + ' ist überfällig', href: '#/finance', at: Date.now() - 3 * 3600000, read: false },
    { id: 'n3', text: customers[9].company + ' ist nach Angebot gewandert', href: '#/pipeline', at: Date.now() - 26 * 3600000, read: false },
  ];

  return function build() {
    return {
      v: 1, team, customers, deals, tasks, invoices, projects, activity, notifications,
      settings: { theme: 'dark', accent: 'coral', weekStart: 'mon', alerts: { deals: true, tasks: true, invoices: false, digest: true }, pipelineView: 'board', customersView: 'grid' },
    };
  };
})();
