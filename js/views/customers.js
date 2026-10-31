/* View: Kunden (Verzeichnis + Profil) */
window.RR = window.RR || {}; RR.views = RR.views || {};
RR.views.customers = (function () {
  let q = '', segment = 'all', sortBy = 'lastContactAt', calOffset = 0, funnelMode = 'weighted';
  const view = () => RR.store.state.settings.customersView || 'grid';
  const SORTS = { name: 'Name', open: 'Offene Pipeline', lastContactAt: 'Zuletzt kontaktiert', health: 'Health' };

  function list() { const st = RR.store; const m = q.trim().toLowerCase(); const open = (c) => st.sum(st.kpi.customerOpen(c.id), (d) => d.amount); return st.state.customers.filter((c) => (segment === 'all' || c.segment === segment) && (!m || (c.first + ' ' + c.last + ' ' + c.company + ' ' + c.city).toLowerCase().includes(m))).sort((a, b) => sortBy === 'name' ? a.last.localeCompare(b.last) : sortBy === 'open' ? open(b) - open(a) : sortBy === 'health' ? b.health - a.health : b.lastContactAt - a.lastContactAt); }

  function render(root, params) { if (params && params.id) return profile(root, params.id); directory(root); }

  function directory(root) {
    const ui = RR.ui, st = RR.store, k = st.kpi; const cs = list(); const all = st.state.customers;
    const stats = ui.stat('users', '<b>' + all.length + '</b>', 'Kunden im Buch', ui.badge('+' + k.newCustomers(7).length + ' diese Woche', 'sky'), 0) + ui.stat('phone', '<b>' + k.contacted7d().length + '</b>', 'Kontaktiert in den letzten 7 Tagen', ui.badge(Math.round((k.contacted7d().length / all.length) * 100) + ' %', 'plain'), 1) + ui.stat('chart', '<b data-count="' + k.openPipeline() + '" data-fmt="money">' + ui.money(k.openPipeline()) + '</b>', 'Offene Pipeline im Buch', '', 2);
    const toolbar = '<div class="toolbar"><div class="search">' + ui.icon('search') + '<input type="search" placeholder="Name, Firma, Stadt…" value="' + ui.esc(q) + '" data-q></div><div class="chips">' + [['all', 'Alle'], ['b2b', 'B2B'], ['b2c', 'B2C'], ['other', 'Anderes']].map((s) => '<button type="button" class="chip chip--txt" aria-pressed="' + (segment === s[0]) + '" data-seg="' + s[0] + '">' + s[1] + '</button>').join('') + '</div><span class="toolbar__spacer"></span><button type="button" class="chip chip--txt" data-sort aria-haspopup="menu">' + ui.icon('filter') + ' ' + SORTS[sortBy] + '</button>' + ui.seg('view', [['grid', 'Karten'], ['table', 'Tabelle']], view()) + ui.ibtn('download', 'Kunden als CSV', 'data-act="export"') + '<button type="button" class="btn" data-new>' + ui.icon('plus') + 'Neuer Kunde</button></div>';
    const open = (c) => st.sum(k.customerOpen(c.id), (d) => d.amount);
    const healthTone = (h) => h >= 75 ? 'lime' : h >= 55 ? 'sky' : 'coral';
    let body;
    if (view() === 'grid') body = '<div class="pc-grid">' + cs.map((c, i) => '<article class="card pc" style="--i:' + i + '"><div class="pc__top">' + ui.avCust(c, 'lg') + '<button type="button" class="ibtn ibtn--sm star ' + (c.favourite ? 'is-on' : '') + '" data-fav="' + c.id + '" aria-label="' + (c.favourite ? 'Aus Favoriten entfernen' : 'Zu Favoriten') + '" aria-pressed="' + c.favourite + '">' + ui.icon('star') + '</button></div><a class="pc__name" href="#/customers/' + c.id + '">' + ui.esc(c.first + ' ' + c.last) + '</a><div class="pc__role">' + ui.esc(c.role + ' · ' + c.company) + '</div><div class="well pc__meta"><div><small>Offene Pipeline</small><b class="num">' + ui.money(open(c)) + '</b></div><div><small>Letzter Kontakt</small><b>' + ui.rel(c.lastContactAt) + '</b></div></div><div class="pc__health">' + ui.meter(c.health / 100, healthTone(c.health)) + '<b class="num">' + c.health + '</b></div><div class="pc__foot">' + ui.status(st.SEGMENTS[c.segment], c.segment === 'b2b' ? 'ink' : c.segment === 'b2c' ? 'sky' : 'plain') + '<div class="pc__acts">' + ui.ibtn('mail', 'E-Mail an ' + c.first, 'data-mail="' + c.id + '"', 'ibtn--sm') + ui.ibtn('phone', c.first + ' anrufen', 'data-call="' + c.id + '"', 'ibtn--sm') + '</div></div></article>').join('') + '</div>';
    else body = '<section class="card" style="--i:0"><div class="table-wrap"><table class="table"><thead><tr><th>Kunde</th><th>Firma</th><th>Segment</th><th class="r">Offene Pipeline</th><th>Health</th><th>Letzter Kontakt</th><th>Closer</th><th></th></tr></thead><tbody>' + cs.map((c, i) => '<tr class="is-link" data-open="' + c.id + '" style="--i:' + i + '"><td><div class="cell-person">' + ui.avCust(c) + '<div><b>' + ui.esc(c.first + ' ' + c.last) + '</b><small>' + ui.esc(c.role) + '</small></div></div></td><td><b>' + ui.esc(c.company) + '</b><small style="display:block" class="muted">' + ui.esc(c.city) + '</small></td><td>' + ui.esc(st.SEGMENTS[c.segment]) + '</td><td class="r num">' + ui.money(open(c)) + '</td><td><div style="display:flex;align-items:center;gap:8px;min-width:110px">' + ui.meter(c.health / 100, healthTone(c.health)) + '<span class="num">' + c.health + '</span></div></td><td>' + ui.rel(c.lastContactAt) + '</td><td><div class="cell-person">' + ui.av(c.ownerId, 'sm') + '<span>' + ui.esc(st.member(c.ownerId).name.split(' ')[0]) + '</span></div></td><td class="r"><button type="button" class="ibtn ibtn--sm star ' + (c.favourite ? 'is-on' : '') + '" data-fav="' + c.id + '" aria-label="Favorit">' + ui.icon('star') + '</button></td></tr>').join('') + '</tbody></table></div></section>';
    root.innerHTML = ui.head(ui.title('Kunden Verzeichnis'), stats) + toolbar + '<p class="fin-count">' + cs.length + ' Kunden</p>' + body + (cs.length ? '' : ui.empty('Keine Kunden gefunden', 'Suche oder Segment anpassen.'));
    bindDirectory(root);
  }
  function bindDirectory(root) {
    const ui = RR.ui, st = RR.store, app = RR.app;
    const inp = root.querySelector('[data-q]'); let tmr; inp.oninput = () => { q = inp.value; clearTimeout(tmr); tmr = setTimeout(() => { app.render(); const i = root.querySelector('[data-q]'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 180); };
    root.onclick = (e) => { const t = e.target;
      const sg = t.closest('[data-seg]'); if (sg) { segment = sg.dataset.seg; app.render(); return; }
      if (t.closest('[data-sort]')) { ui.menu(t.closest('[data-sort]'), Object.entries(SORTS).map(([k, v]) => ({ label: v, checked: sortBy === k, onClick: () => { sortBy = k; app.render(); } }))); return; }
      const s = t.closest('.seg__btn'); if (s) { st.actions.setSettings({ customersView: s.dataset.val }); return; }
      if (t.closest('[data-new]')) { app.forms.newCustomer(); return; }
      const f = t.closest('[data-fav]'); if (f) { const on = st.actions.toggleFav(f.dataset.fav); ui.toast(on ? 'Zu Favoriten hinzugefügt' : 'Aus Favoriten entfernt', { icon: 'star' }); return; }
      const m = t.closest('[data-mail]'); if (m) { app.forms.compose({ customerId: m.dataset.mail }); return; }
      const c = t.closest('[data-call]'); if (c) { app.forms.logCall({ customerId: c.dataset.call }); return; }
      if (t.closest('a')) return;
      const row = t.closest('[data-open]'); if (row) app.go('#/customers/' + row.dataset.open);
    };
  }

  // ---------- Profil ----------
  function profile(root, id) {
    const ui = RR.ui, st = RR.store, k = st.kpi, app = RR.app; const c = st.customer(id); if (!c) { app.go('#/customers'); return; }
    const won = k.customerWon(id), open = k.customerOpen(id); const wonSum = st.sum(won, (d) => d.amount), openSum = st.sum(open, (d) => d.amount), weighted = st.sum(open, (d) => d.amount * st.stage(d.stage).p);
    const tasks = st.state.tasks.filter((t) => t.customerId === id); const up = tasks.filter((t) => !t.done && t.at > Date.now() && t.at < Date.now() + 30 * ui.DAY); const todayN = tasks.filter((t) => ui.isToday(t.at)).length;
    const stats = ui.stat('trophy', '<b data-count="' + wonSum + '" data-fmt="money">' + ui.money(wonSum) + '</b>', 'Gewonnen aus ' + won.length + ' Deals', ui.badge('+' + ui.short(st.sum(won.filter((d) => Date.now() - d.wonAt < 30 * ui.DAY), (d) => d.amount)) + ' Monat', 'sky'), 0) + ui.stat('chart', '<b data-count="' + openSum + '" data-fmt="money">' + ui.money(openSum) + '</b>', 'Offen über ' + open.length + ' Deals', ui.badge(ui.short(weighted) + ' gewichtet', 'lime'), 1) + ui.stat('calendar', '<b>' + up.length + '</b>', 'Aufgaben in den nächsten 30 Tagen', todayN ? ui.badge('+' + todayN + ' heute', 'coral') : '', 2);
    const hist = st.state.deals.filter((d) => d.customerId === id).sort((a, b) => (b.status === 'open') - (a.status === 'open') || (b.wonAt || b.closeDate) - (a.wonAt || a.closeDate));
    const healthTone = c.health >= 75 ? 'lime' : c.health >= 55 ? 'sky' : 'coral';
    const srcIcon = { meta: 'M', webinar: 'W', ig: 'IG', wa: 'WA', aff: 'AF', ref: 'E' };
    // Funnel
    const fun = st.STAGES.map((s) => { const ds = open.filter((d) => d.stage === s.id); return { s, n: ds.length, v: st.sum(ds, (d) => d.amount * (funnelMode === 'weighted' ? s.p : 1)) }; }); const funTotal = st.sum(fun, (f) => f.v);
    root.innerHTML = ui.head('<a class="ibtn head__back" href="#/customers" aria-label="Zurück zum Verzeichnis">' + ui.icon('chevronLeft') + '</a>' + ui.title('Kunden Profil'), stats) + '<div class="grid">' +
      '<section class="card cx-hist" style="--i:0">' + ui.cardHead('Deal-Historie', open.length + ' offen · ' + won.length + ' gewonnen', ui.ibtn('plus', 'Neuer Deal', 'data-new-deal')) + (hist.length ? '<div class="cx-hist__scroll">' + hist.map((d) => ui.dealTile(d, { cls: 'tile--mini' })).join('') + '</div>' : ui.empty('Noch keine Deals', 'Lege den ersten Deal an.')) + '</section>' +
      '<section class="card cx-prof" style="--i:1"><div class="cx-prof__tools"><button type="button" class="ibtn ibtn--sm star ' + (c.favourite ? 'is-on' : '') + '" data-fav aria-label="Favorit">' + ui.icon('star') + '</button>' + ui.ibtn('share', 'Link kopieren', 'data-copy', 'ibtn--sm') + '</div><div class="cx-prof__tools2">' + ui.ibtn('more', 'Mehr', 'data-more', 'ibtn--sm') + '</div>' +
      '<div class="ring" role="img" aria-label="Health ' + c.health + '"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="ring__track" cx="100" cy="100" r="92"/><circle class="ring__arc ring__arc--' + healthTone + '" cx="100" cy="100" r="92" stroke-dasharray="578" stroke-dashoffset="578" data-off="' + (578 * (1 - c.health / 100)).toFixed(0) + '"/></svg><div class="ring__mid">' + ui.avCust(c, 'xl') + '</div><span class="cx-prof__health num">' + c.health + '</span></div>' +
      '<div class="cx-prof__name">' + ui.esc(c.first + ' ' + c.last) + '</div><div class="cx-prof__role">' + ui.esc(c.role + ', ' + c.company) + '</div><div class="cx-prof__tags">' + ui.status(st.SEGMENTS[c.segment], 'ink') + ui.status(c.city, 'plain') + '</div>' +
      '<div class="cx-prof__acts">' + ui.ibtn('pencil', 'Bearbeiten', 'data-edit') + ui.ibtn('mail', 'E-Mail', 'data-mail') + ui.ibtn('phone', 'Anrufen', 'data-call') + ui.ibtn('plus', 'Neuer Deal', 'data-new-deal') + ui.ibtn('calendarPlus', 'Termin planen', 'data-meeting') + '<a class="ibtn" href="#/schedule" aria-label="Team-Kalender">' + ui.icon('calendar') + '</a></div>' +
      '<div class="well" style="margin-top:18px;width:100%;text-align:left;display:flex;gap:10px;align-items:center">' + ui.av(c.ownerId, 'sm') + '<span style="flex:1"><small class="muted" style="display:block;font-size:11.5px">Closer · Setter</small><b style="font-size:13px">' + ui.esc(st.member(c.ownerId).name) + ' · ' + ui.esc(st.member(c.setterId).name.split(' ')[0]) + '</b></span></div></section>' +
      '<section class="card cx-sched" style="--i:2">' + ui.cardHead('Aufgaben-Kalender', '', ui.ibtn('calendarPlus', 'Aufgabe anlegen', 'data-new-task', 'ibtn--sm')) + miniCal(c) + '</section>' +
      '<section class="card cx-fun" style="--i:3">' + ui.cardHead('Stage-Funnel', '', ui.seg('fun', [['weighted', 'Gewichtet'], ['total', 'Gesamt']], funnelMode, 'seg--sm')) + '<div class="sum"><span class="big num" style="font-size:30px">' + ui.money(funTotal) + '</span><span class="muted">in der Pipeline</span></div><div class="fun">' + fun.map((f, i) => '<button type="button" class="fun__row" style="width:' + (100 - i * 9) + '%" data-fun="' + f.s.id + '"><span><i class="dot dot--' + f.s.tone + '"></i>' + f.s.name + ' · ' + f.n + '</span><b class="num">' + ui.money(f.v) + '</b></button>').join('') + '</div></section>' +
      '<section class="card cx-det" style="--i:4">' + ui.cardHead('Details', '', ui.ibtn('pencil', 'Alle Details bearbeiten', 'data-edit', 'ibtn--sm')) + '<div>' +
      detRow('user', 'Vorname', c.first, ui.ibtn('pencil', 'Vorname bearbeiten', 'data-edit-field="first"', 'ibtn--sm')) + detRow('user', 'Nachname', c.last, ui.ibtn('pencil', 'Nachname bearbeiten', 'data-edit-field="last"', 'ibtn--sm')) + detRow('building', 'Firma', c.company, ui.ibtn('pencil', 'Firma bearbeiten', 'data-edit-field="company"', 'ibtn--sm')) + detRow('mail', 'E-Mail', c.email, ui.ibtn('copy', 'E-Mail kopieren', 'data-copy-mail', 'ibtn--sm')) + detRow('phone', 'Telefon', c.phone, ui.ibtn('phone', 'Anrufen', 'data-call', 'ibtn--sm')) +
      '<div class="det__row">' + ui.icon('hash') + '<div><span class="det__label">Quellen</span><div class="det__srcs">' + c.sources.map((s) => '<span title="' + st.SOURCES[s] + '">' + srcIcon[s] + '</span>').join('') + '</div></div>' + ui.ibtn('pencil', 'Quellen bearbeiten', 'data-edit-sources', 'ibtn--sm') + '</div>' +
      detRow('clock', 'Zuletzt kontaktiert · ' + ui.rel(c.lastContactAt), ui.dateF(c.lastContactAt) + ' um ' + ui.time(c.lastContactAt), ui.ibtn('phone', 'Anruf protokollieren', 'data-call', 'ibtn--sm')) + '</div></section></div>';
    bindProfile(root, c);
  }
  const detRow = (ico, label, val, tool) => '<div class="det__row">' + RR.ui.icon(ico) + '<div><span class="det__label">' + RR.ui.esc(label) + '</span><span class="det__val">' + RR.ui.esc(val || '—') + '</span></div>' + tool + '</div>';
  function miniCal(c) {
    const ui = RR.ui, st = RR.store; const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + calOffset); const y = base.getFullYear(), m = base.getMonth(); const first = (new Date(y, m, 1).getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate();
    const tasks = st.state.tasks.filter((t) => t.customerId === c.id);
    let cells = ''; for (let i = 0; i < first; i++) cells += '<span class="day day--pad"></span>';
    for (let d = 1; d <= days; d++) { const ts = new Date(y, m, d).getTime(); const ds = tasks.filter((t) => ui.startOfDay(t.at) === ts); const tone = ds[0] ? (ds[0].kind === 'call' ? 'coral' : ds[0].kind === 'task' ? 'lime' : 'sky') : ''; cells += '<button type="button" class="day ' + (ds.length ? 'has-tasks day--' + tone : '') + ' ' + (ui.isToday(ts) ? 'is-today' : '') + '" data-day="' + ts + '" aria-label="' + new Date(ts).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + (ds.length ? ', ' + ds.length + ' Aufgaben' : '') + '">' + d + (ds[0] ? ui.av(ds[0].ownerId, 'xs') : '') + '</button>'; }
    return '<div class="cal"><div class="cal__nav">' + ui.ibtn('chevronLeft', 'Vormonat', 'data-cal="-1"', 'ibtn--sm') + '<span class="cal__month">' + base.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) + '</span><span style="display:flex;gap:4px">' + (calOffset ? ui.ibtn('refresh', 'Zu diesem Monat', 'data-cal="0"', 'ibtn--sm') : '') + ui.ibtn('chevronRight', 'Folgemonat', 'data-cal="1"', 'ibtn--sm') + '</span></div><div class="cal__dow">' + ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => '<span>' + d + '</span>').join('') + '</div><div class="cal__grid">' + cells + '</div></div>';
  }
  function bindProfile(root, c) {
    const ui = RR.ui, st = RR.store, app = RR.app;
    root.onclick = (e) => { const t = e.target;
      const cal = t.closest('[data-cal]'); if (cal) { calOffset = cal.dataset.cal === '0' ? 0 : calOffset + (+cal.dataset.cal); app.render(); return; }
      const day = t.closest('[data-day]'); if (day) { const ts = +day.dataset.day; const ds = st.state.tasks.filter((x) => x.customerId === c.id && ui.startOfDay(x.at) === ts); const items = ds.map((x) => ({ label: ui.time(x.at) + ' · ' + x.title + (x.done ? ' ✓' : ''), icon: ui.kindIcon[x.kind], onClick: () => st.actions.toggleTask(x.id) })); items.push(ds.length ? '-' : null, { label: 'Aufgabe an diesem Tag', icon: 'plus', onClick: () => app.forms.newTask({ customerId: c.id, at: ts + 10 * 3600000 }) }); ui.menu(day, items.filter(Boolean)); return; }
      const sg = t.closest('.seg__btn'); if (sg) { funnelMode = sg.dataset.val; app.render(); return; }
      const fn = t.closest('[data-fun]'); if (fn) { const d = st.kpi.customerOpen(c.id).find((x) => x.stage === fn.dataset.fun); if (d) app.go('#/pipeline/' + d.id); else ui.toast('Keine Deals in dieser Stage'); return; }
      const dm = t.closest('[data-deal-menu]'); if (dm) { app.forms.dealMenu(dm, dm.dataset.dealMenu); return; }
      if (t.closest('[data-new-deal]')) { app.forms.newDeal({ customerId: c.id }); return; }
      if (t.closest('[data-new-task]')) { app.forms.newTask({ customerId: c.id }); return; }
      if (t.closest('[data-meeting]')) { app.forms.newTask({ customerId: c.id, kind: 'meeting' }); return; }
      if (t.closest('[data-mail]')) { app.forms.compose({ customerId: c.id }); return; }
      if (t.closest('[data-call]')) { app.forms.logCall({ customerId: c.id }); return; }
      if (t.closest('[data-fav]')) { const on = st.actions.toggleFav(c.id); ui.toast(on ? 'Zu Favoriten hinzugefügt' : 'Aus Favoriten entfernt', { icon: 'star' }); return; }
      if (t.closest('[data-copy]')) { ui.copy(location.href); return; }
      if (t.closest('[data-copy-mail]')) { navigator.clipboard && navigator.clipboard.writeText(c.email).then(() => ui.toast('E-Mail kopiert', { icon: 'copy' })).catch(() => ui.toast(c.email)); return; }
      if (t.closest('[data-more]')) { ui.menu(t.closest('[data-more]'), [{ label: 'Onboarding anlegen', icon: 'folder', onClick: () => app.forms.newProject({ customerId: c.id }) }, { label: 'Rechnung anlegen', icon: 'hash', onClick: () => app.forms.newInvoice({ customerId: c.id }) }, { label: 'Als kontaktiert markieren', icon: 'clock', onClick: () => { st.actions.touchCustomer(c.id); ui.toast('Kontakt aktualisiert'); } }], { align: 'right' }); return; }
      const ef = t.closest('[data-edit-field]'); if (ef) { editFields(c, [ef.dataset.editField]); return; }
      if (t.closest('[data-edit]')) { editFields(c, ['first', 'last', 'company', 'role', 'email', 'phone', 'city', 'segment', 'health', 'ownerId']); return; }
      if (t.closest('[data-edit-sources]')) { editSources(c); return; }
    };
  }
  function editFields(c, keys) {
    const ui = RR.ui, st = RR.store; const L = { first: 'Vorname', last: 'Nachname', company: 'Firma', role: 'Rolle', email: 'E-Mail', phone: 'Telefon', city: 'Stadt', segment: 'Segment', health: 'Health (0–100)', ownerId: 'Closer' };
    const f = keys.map((k) => k === 'segment' ? ui.field(L[k], '<select name="segment">' + Object.entries(st.SEGMENTS).map(([a, b]) => '<option value="' + a + '" ' + (a === c.segment ? 'selected' : '') + '>' + b + '</option>').join('') + '</select>') : k === 'ownerId' ? ui.field(L[k], '<select name="ownerId">' + ui.memberOptions(c.ownerId) + '</select>') : k === 'health' ? ui.field(L[k], '<input name="health" type="number" min="0" max="100" value="' + c.health + '">') : ui.field(L[k], '<input name="' + k + '" value="' + ui.esc(c[k] || '') + '">', keys.length === 1)).join('');
    ui.formModal(keys.length === 1 ? L[keys[0]] + ' bearbeiten' : 'Kunde bearbeiten', '', f, 'Speichern', (d) => { if (d.health != null) d.health = Math.max(0, Math.min(100, +d.health)); st.actions.updateCustomer(c.id, d); ui.toast('Gespeichert'); });
  }
  function editSources(c) { const ui = RR.ui, st = RR.store; ui.formModal('Quellen', 'Über welche Kanäle kam der Kontakt?', '<div class="field field--wide"><div class="chips">' + Object.entries(st.SOURCES).map(([k, v]) => '<label class="chip chip--txt" style="cursor:pointer"><input type="checkbox" name="src" value="' + k + '" ' + (c.sources.includes(k) ? 'checked' : '') + ' style="width:16px;height:16px;min-height:0;padding:0;margin-right:6px">' + v + '</label>').join('') + '</div></div>', 'Speichern', (d, form) => { st.actions.updateCustomer(c.id, { sources: [...form.querySelectorAll('input[name=src]:checked')].map((i) => i.value) }); }); }
  return { render };
})();
