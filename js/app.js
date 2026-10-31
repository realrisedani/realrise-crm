/* RealRise CRM – App-Shell: Router, Header, Dock, globale Aktionen, Formulare */
window.RR = window.RR || {};
RR.views = RR.views || {};
RR.app = (function () {
  const U = () => RR.ui; const S = () => RR.store;
  const TITLES = { overview: 'Übersicht', pipeline: 'Pipeline', customers: 'Kunden', schedule: 'Kalender', finance: 'Finanzen', growth: 'Growth', projects: 'Onboarding', settings: 'Einstellungen' };
  let current = { view: null, params: {} };

  // ---------- Router ----------
  function parse() { const h = location.hash.replace(/^#\/?/, ''); const [view, ...rest] = h.split('/'); return { view: TITLES[view] ? view : 'overview', params: { id: rest[0] || null, sub: rest[1] || null, raw: rest } }; }
  function route() {
    const r = parse(); const changed = r.view !== current.view;
    const sections = document.querySelectorAll('section.view');
    if (changed) { sections.forEach((s) => { s.hidden = s.dataset.view !== r.view; if (s.hidden) { s.innerHTML = ''; delete s.dataset.entered; } }); window.scrollTo({ top: 0 }); U().closePop(); }
    current = r; render();
    document.title = TITLES[r.view] + ' · RealRise CRM';
    document.querySelectorAll('.tab').forEach((t) => { if (t.dataset.route === r.view) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    document.querySelectorAll('.dock__btn[data-route]').forEach((b) => { if (b.dataset.route === r.view) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    requestAnimationFrame(positionTabPill);
    if (!r.params.id && document.getElementById('drawer').open && !(r.view === 'settings')) U().closeDrawer();
  }
  function render() {
    const root = document.querySelector('section.view[data-view="' + current.view + '"]'); const v = RR.views[current.view]; if (!root || !v) return;
    const y = window.scrollY; const entered = !!root.dataset.entered;
    v.render(root, current.params); U().animateIn(root);
    if (entered) window.scrollTo({ top: y });
    setTimeout(() => { root.dataset.entered = '1'; }, 900);
  }
  function positionTabPill() { const track = document.querySelector('.tabs__track'); const on = track.querySelector('.tab[aria-current="page"]'); const pill = track.querySelector('.tabs__pill'); if (!on) { pill.style.width = '0px'; return; } pill.style.left = on.offsetLeft + 'px'; pill.style.width = on.offsetWidth + 'px'; if (innerWidth <= 760) on.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }
  const go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };

  // ---------- Theme ----------
  function applyTheme() { const s = S().state.settings; let t = s.theme; if (t === 'system') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; document.documentElement.dataset.theme = t; document.documentElement.dataset.accent = s.accent || 'lime'; const b = document.querySelector('.dock__theme'); if (b) b.setAttribute('aria-label', t === 'dark' ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln'); }
  function toggleTheme() { const cur = document.documentElement.dataset.theme; S().actions.setSettings({ theme: cur === 'dark' ? 'light' : 'dark' }); }
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => applyTheme());

  // ---------- Header & Dock ----------
  function buildChrome() {
    const ui = U();
    document.querySelector('.brand__mark').innerHTML = ui.icon('sunLogo');
    document.getElementById('top-tools').innerHTML = ui.ibtn('inbox', 'Aktivität', 'data-act="activity"', 'ibtn--glass magnetic') + ui.ibtn('bell', 'Benachrichtigungen', 'data-act="notifs" aria-haspopup="dialog"', 'ibtn--glass magnetic') + '<button type="button" class="me magnetic" data-act="account" aria-label="Konto-Menü" aria-haspopup="menu"><span class="me__ini">' + ui.esc(S().me().ini) + '</span></button>';
    const dock = [['search', 'search', 'Suche', '⌘K'], ['new', 'plus', 'Neu anlegen', 'N'], ['favs', 'star', 'Favoriten'], ['today', 'calendar', 'Heute'], ['call', 'phone', 'Anruf protokollieren'], ['compose', 'send', 'E-Mail schreiben'], ['share', 'share', 'Link kopieren'], ['export', 'upload', 'Kunden als CSV']];
    document.getElementById('dock').innerHTML = dock.map((d) => '<button type="button" class="dock__btn" data-act="' + d[0] + '" aria-label="' + d[2] + '" ' + (['new'].includes(d[0]) ? 'aria-haspopup="menu"' : ['favs', 'today'].includes(d[0]) ? 'aria-haspopup="dialog"' : '') + '>' + ui.icon(d[1]) + '<span class="dock__tip">' + d[2] + (d[3] ? '<kbd>' + d[3] + '</kbd>' : '') + '</span></button>').join('') +
      '<button type="button" class="dock__btn dock__more" data-act="more" aria-label="Mehr Aktionen" aria-haspopup="menu">' + ui.icon('more') + '</button><span class="dock__sep" aria-hidden="true"></span>' +
      '<a class="dock__btn" href="#/settings" data-route="settings" aria-label="Einstellungen">' + ui.icon('settings') + '<span class="dock__tip">Einstellungen</span></a>' +
      '<button type="button" class="dock__btn dock__theme" data-act="theme" aria-label="Design wechseln">' + ui.icon('sun', 'ico--sun') + ui.icon('moon', 'ico--moon') + '<span class="dock__tip">Design</span></button>';
    document.body.addEventListener('click', onAction);
    document.querySelectorAll('.magnetic').forEach((el) => { el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.18 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.18 + 'px)'; }); el.addEventListener('pointerleave', () => (el.style.transform = '')); });
    updateBell();
  }
  function updateBell() { const b = document.querySelector('[data-act="notifs"]'); if (!b) return; const n = S().state.notifications.filter((x) => !x.read).length; b.querySelector('.dot-badge') && b.querySelector('.dot-badge').remove(); if (n) b.insertAdjacentHTML('beforeend', '<span class="dot-badge"></span>'); b.setAttribute('aria-label', 'Benachrichtigungen' + (n ? ', ' + n + ' ungelesen' : '')); }

  function onAction(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act; const ui = U(); const st = S();
    switch (act) {
      case 'search': openFinder(); break;
      case 'new': ui.menu(b, [{ label: 'Neue Aufgabe', icon: 'calendarPlus', onClick: () => forms.newTask() }, { label: 'Neuer Deal', icon: 'briefcase', onClick: () => forms.newDeal() }, { label: 'Neuer Kunde', icon: 'user', onClick: () => forms.newCustomer() }, { label: 'Neue Rechnung', icon: 'hash', onClick: () => forms.newInvoice() }, { label: 'Neues Onboarding', icon: 'folder', onClick: () => forms.newProject() }], { side: innerWidth > 760 ? 'right' : undefined }); break;
      case 'favs': { const favs = st.state.customers.filter((c) => c.favourite); ui.popover(b, '<div class="menu__head">Favoriten</div><div class="pop__list">' + (favs.length ? favs.map((c) => '<a class="pop__row" href="#/customers/' + c.id + '">' + ui.avCust(c) + '<span><b>' + ui.esc(c.first + ' ' + c.last) + '</b><small>' + ui.esc(c.company) + '</small></span></a>').join('') : ui.empty('Noch keine Favoriten', 'Stern auf einer Kundenkarte setzen.')) + '</div>', { side: innerWidth > 760 ? 'right' : undefined }); break; }
      case 'today': { const ts = st.kpi.tasksToday(); const el = ui.popover(b, '<div class="menu__head">Heute <small>' + ui.dateL(Date.now()) + '</small></div><div class="pop__list">' + (ts.length ? ts.map((t) => '<div class="pop__row"><button type="button" class="check" role="checkbox" aria-checked="' + t.done + '" data-task-toggle="' + t.id + '">' + ui.icon('check') + '</button><span><b>' + ui.esc(t.title) + '</b><small>' + ui.time(t.at) + (t.customerId ? ' · ' + ui.esc(st.customer(t.customerId).company) : '') + '</small></span></div>').join('') : ui.empty('Nichts geplant', 'Heute ist frei.')) + '</div><div class="pop__foot"><a class="btn btn--ghost btn--sm" href="#/schedule">Kalender öffnen</a><button type="button" class="btn btn--sm" data-act="newtask-today">' + ui.icon('plus') + 'Hinzufügen</button></div>', { side: innerWidth > 760 ? 'right' : undefined }); if (el) el.addEventListener('click', (ev) => { const c = ev.target.closest('[data-task-toggle]'); if (c) { st.actions.toggleTask(c.dataset.taskToggle); c.setAttribute('aria-checked', st.task(c.dataset.taskToggle).done); } }); break; }
      case 'newtask-today': ui.closePop(); forms.newTask({ at: Date.now() }); break;
      case 'call': forms.logCall(); break;
      case 'compose': forms.compose(); break;
      case 'share': ui.copy(location.href); break;
      case 'export': exportCustomers(); break;
      case 'more': ui.menu(b, [{ label: 'Favoriten', icon: 'star', onClick: () => document.querySelector('[data-act="favs"]').click() }, { label: 'Anruf protokollieren', icon: 'phone', onClick: () => forms.logCall() }, { label: 'Link kopieren', icon: 'share', onClick: () => ui.copy(location.href) }, { label: 'Kunden als CSV', icon: 'upload', onClick: exportCustomers }]); break;
      case 'theme': toggleTheme(); break;
      case 'activity': openActivity(); break;
      case 'notifs': { const ns = st.state.notifications; const el = ui.popover(b, '<div class="menu__head">Benachrichtigungen <button type="button" class="btn btn--ghost btn--sm" data-act="notifs-read">Alle gelesen</button></div><div class="pop__list">' + (ns.length ? ns.slice(0, 6).map((n) => '<a class="pop__row ' + (n.read ? '' : 'is-unread') + '" href="' + n.href + '"><span><b>' + ui.esc(n.text) + '</b><small>' + ui.rel(n.at) + '</small></span></a>').join('') : ui.empty('Alles ruhig')) + '</div>', { cls: 'pop--wide', align: 'right' }); if (el) el.addEventListener('click', (ev) => { if (ev.target.closest('a')) { st.actions.markNotifsRead(); ui.closePop(); } }); break; }
      case 'notifs-read': st.actions.markNotifsRead(); ui.closePop(); ui.toast('Alle Benachrichtigungen gelesen'); break;
      case 'account': { const s = st.state.settings; ui.menu(b, [{ label: 'Einstellungen', icon: 'settings', onClick: () => go('#/settings') }, { label: 'Tastaturkürzel', icon: 'keyboard', onClick: openShortcuts }, '-', { label: 'Hell', icon: 'sun', checked: s.theme === 'light', onClick: () => st.actions.setSettings({ theme: 'light' }) }, { label: 'Dunkel', icon: 'moon', checked: s.theme === 'dark', onClick: () => st.actions.setSettings({ theme: 'dark' }) }, { label: 'Wie System', icon: 'settings', checked: s.theme === 'system', onClick: () => st.actions.setSettings({ theme: 'system' }) }, '-', { label: 'Demo-Daten zurücksetzen', icon: 'refresh', danger: true, onClick: () => ui.confirmModal('Demo-Daten zurücksetzen?', 'Alle Kunden, Deals, Aufgaben und Rechnungen werden auf den Startzustand gesetzt. Das lässt sich nicht rückgängig machen.', 'Zurücksetzen', () => { st.reset(); ui.toast('Demo-Daten zurückgesetzt', { icon: 'refresh' }); }) }], { align: 'right' }); break; }
      default: break;
    }
  }
  function exportCustomers() { const ui = U(); const rows = [['Vorname', 'Nachname', 'Firma', 'Rolle', 'E-Mail', 'Telefon', 'Stadt', 'Segment', 'Health', 'Owner', 'Offene Pipeline']]; S().state.customers.forEach((c) => rows.push([c.first, c.last, c.company, c.role, c.email, c.phone, c.city, S().SEGMENTS[c.segment], c.health, S().member(c.ownerId).name, S().sum(S().kpi.customerOpen(c.id), (d) => d.amount)])); ui.download('kunden.csv', ui.csv(rows), 'text/csv'); ui.toast('Kunden-Export gestartet', { icon: 'download' }); }

  // ---------- Drawers: Aktivität, Shortcuts ----------
  function openActivity() { const ui = U(); const st = S(); ui.drawer('<div class="drawer__top"><div><div class="drawer__title">Aktivität</div><div class="drawer__crumb">Alles, was das Team gemacht hat, neueste zuerst.</div></div>' + ui.ibtn('x', 'Schließen', 'data-close', 'drawer__close') + '</div><ul class="feed">' + st.state.activity.map((a) => { const m = st.member(a.actorId); const c = st.customer(a.customerId); return '<li class="feed__item">' + ui.av(m, 'sm') + '<p><b>' + ui.esc(m ? m.name.split(' ')[0] : '') + '</b> ' + a.text + (c ? ' · <a href="#/customers/' + c.id + '">' + ui.esc(c.company) + '</a>' : '') + '<small>' + ui.rel(a.at) + '</small></p><span class="feed__ico">' + ui.icon(ui.actIcon[a.kind] || 'note') + '</span></li>'; }).join('') + '</ul>'); }
  function openShortcuts() { const ui = U(); const rows = [['Suche', '<kbd>⌘ K</kbd> oder <kbd>/</kbd>'], ['Neu anlegen…', '<kbd>N</kbd>'], ['Neue Aufgabe', '<kbd>T</kbd>'], ['Zur Seite', '<kbd>G</kbd> dann <kbd>Ü</kbd> / <kbd>P</kbd> / <kbd>K</kbd> / <kbd>C</kbd> / <kbd>F</kbd> / <kbd>R</kbd> / <kbd>O</kbd>'], ['Design wechseln', '<kbd>D</kbd>'], ['Schließen', '<kbd>Esc</kbd>'], ['Diese Liste', '<kbd>?</kbd>'], ['Pipeline-Karte', '<kbd>Enter</kbd> öffnen · <kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd> Stage wechseln']]; ui.drawer('<div class="drawer__top"><div class="drawer__title">Tastaturkürzel</div>' + ui.ibtn('x', 'Schließen', 'data-close', 'drawer__close') + '</div>' + rows.map((r) => '<div class="det__row" style="grid-template-columns:1fr auto"><span>' + r[0] + '</span><span>' + r[1] + '</span></div>').join('')); }

  // ---------- Finder (⌘K) ----------
  function openFinder() {
    const ui = U(); const st = S(); const dlg = document.getElementById('finder');
    dlg.innerHTML = '<div class="finder__bar">' + ui.icon('search') + '<input type="text" placeholder="Kunden, Deals, Seiten suchen…" aria-label="Suche"><kbd>esc</kbd></div><div class="finder__list" role="listbox"></div>';
    const input = dlg.querySelector('input'); const list = dlg.querySelector('.finder__list'); let items = []; let sel = 0;
    const pages = Object.keys(TITLES).map((k) => ({ group: 'Seiten', title: TITLES[k], sub: 'Seite öffnen', href: '#/' + k, ico: 'arrowUpRight' }));
    const build = (q) => {
      q = q.trim().toLowerCase(); items = [];
      if (!q) { items = pages.slice(0, 4).concat(st.state.customers.slice().sort((a, b) => b.lastContactAt - a.lastContactAt).slice(0, 5).map((c) => ({ group: 'Kunden', title: c.first + ' ' + c.last, sub: c.role + ' · ' + c.company, href: '#/customers/' + c.id, av: c }))); }
      else {
        const m = (s) => s.toLowerCase().includes(q);
        pages.filter((p) => m(p.title)).forEach((p) => items.push(p));
        st.state.customers.filter((c) => m(c.first + ' ' + c.last + ' ' + c.company + ' ' + c.city + ' ' + c.role)).slice(0, 6).forEach((c) => items.push({ group: 'Kunden', title: c.first + ' ' + c.last, sub: c.role + ' · ' + c.company, href: '#/customers/' + c.id, av: c }));
        st.state.deals.filter((d) => d.status === 'open' && m(d.title + ' ' + (st.customer(d.customerId) || {}).company)).slice(0, 6).forEach((d) => items.push({ group: 'Deals', title: d.title, sub: st.customer(d.customerId).company + ' · ' + st.stage(d.stage).name, href: '#/pipeline/' + d.id, ico: 'trophy' }));
        st.state.projects.filter((p) => m(p.name + ' ' + st.customer(p.customerId).company)).slice(0, 4).forEach((p) => items.push({ group: 'Onboarding', title: p.name, sub: st.customer(p.customerId).company, href: '#/projects/' + p.id, ico: 'folder' }));
        st.state.invoices.filter((i) => m(i.number + ' ' + st.customer(i.customerId).company)).slice(0, 4).forEach((i) => items.push({ group: 'Rechnungen', title: i.number, sub: st.customer(i.customerId).company + ' · ' + ui.money(i.amount), href: '#/finance/' + i.id, ico: 'hash' }));
      }
      sel = 0; let g = ''; list.innerHTML = items.length ? items.map((it, i) => { const head = it.group !== g ? '<div class="finder__group">' + it.group + '</div>' : ''; g = it.group; return head + '<button type="button" class="finder__opt ' + (i === sel ? 'is-sel' : '') + '" data-i="' + i + '">' + (it.av ? ui.avCust(it.av, 'md') : '<span class="finder__ico">' + ui.icon(it.ico) + '</span>') + '<span><b>' + ui.esc(it.title) + '</b><small>' + ui.esc(it.sub) + '</small></span><span class="go">' + ui.icon('chevronRight') + '</span></button>'; }).join('') : ui.empty('Keine Treffer', 'Anders schreiben oder kürzer suchen.');
    };
    const choose = (i) => { const it = items[i]; if (!it) return; dlg.close(); go(it.href); };
    input.addEventListener('input', () => build(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); } else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); } else if (e.key === 'Enter') { e.preventDefault(); choose(sel); return; } else return; list.querySelectorAll('.finder__opt').forEach((b, i) => b.classList.toggle('is-sel', i === sel)); const on = list.querySelector('.is-sel'); on && on.scrollIntoView({ block: 'nearest' }); });
    list.addEventListener('click', (e) => { const b = e.target.closest('.finder__opt'); if (b) choose(+b.dataset.i); });
    build(''); dlg.showModal(); input.focus();
  }

  // ---------- Formulare (global) ----------
  const forms = {
    newDeal(pre = {}) { const ui = U(); const st = S(); ui.formModal('Neuer Deal', 'Startet in der Pipeline in der gewählten Stage.', ui.field('Deal-Name', '<input name="title" required placeholder="Phase 1 · RealRise Academy" value="' + ui.esc(pre.title || '') + '">', true) + ui.field('Kunde', '<select name="customerId">' + ui.custOptions(pre.customerId) + '</select>', true) + ui.field('Wert (EUR)', '<input name="amount" type="number" min="0" step="100" placeholder="3000" required value="' + (pre.amount || '') + '">') + ui.field('Stage', '<select name="stage">' + st.STAGES.map((s) => '<option value="' + s.id + '" ' + (s.id === pre.stage ? 'selected' : '') + '>' + s.name + '</option>').join('') + '</select>') + ui.field('Erwarteter Abschluss', '<input name="closeDate" type="date" value="' + ui.isoDate(pre.closeDate || Date.now() + 21 * ui.DAY) + '">') + ui.field('Owner', '<select name="ownerId">' + ui.memberOptions(pre.ownerId || st.me().id) + '</select>'), 'Deal anlegen', (d) => { if (!d.title || !d.amount) return false; const deal = st.actions.addDeal({ title: d.title, customerId: d.customerId, amount: +d.amount, stage: d.stage, closeDate: new Date(d.closeDate).getTime(), ownerId: d.ownerId, teamIds: [d.ownerId] }); ui.toast('Deal angelegt'); if (pre.goto !== false) go('#/pipeline/' + deal.id); }); },
    newCustomer() { const ui = U(); const st = S(); ui.formModal('Neuer Kunde', '', ui.field('Vorname', '<input name="first" required>') + ui.field('Nachname', '<input name="last" required>') + ui.field('Firma', '<input name="company" required>') + ui.field('Rolle', '<input name="role" placeholder="Geschäftsführer">') + ui.field('E-Mail', '<input name="email" type="email">') + ui.field('Telefon', '<input name="phone" type="tel">') + ui.field('Segment', '<select name="segment">' + Object.entries(st.SEGMENTS).map(([k, v]) => '<option value="' + k + '">' + v + '</option>').join('') + '</select>') + ui.field('Stadt', '<input name="city">') + ui.field('Quelle', '<select name="source">' + Object.entries(st.SOURCES).map(([k, v]) => '<option value="' + k + '">' + v + '</option>').join('') + '</select>') + ui.field('Closer', '<select name="ownerId">' + ui.memberOptions(st.me().id) + '</select>'), 'Kunde anlegen', (d) => { if (!d.first || !d.last || !d.company) return false; const c = st.actions.addCustomer({ first: d.first, last: d.last, company: d.company, role: d.role, email: d.email, phone: d.phone, segment: d.segment, city: d.city, sources: [d.source], ownerId: d.ownerId }); ui.toast('Kunde angelegt'); go('#/customers/' + c.id); }); },
    newTask(pre = {}) { const ui = U(); const st = S(); const at = pre.at || Date.now() + 3600000; ui.formModal('Neue Aufgabe', 'Erscheint im Kalender und beim Kunden.', ui.field('Titel', '<input name="title" required placeholder="Angebot nachfassen">', true) + ui.field('Kunde', '<select name="customerId">' + ui.custOptions(pre.customerId, true) + '</select>', true) + ui.field('Datum', '<input name="date" type="date" value="' + ui.isoDate(at) + '">') + ui.field('Uhrzeit', '<input name="time" type="time" value="' + (pre.time || ui.isoTime(at)) + '">') + ui.field('Typ', '<select name="kind">' + Object.entries(st.KINDS).map(([k, v]) => '<option value="' + k + '" ' + (k === pre.kind ? 'selected' : '') + '>' + v + '</option>').join('') + '</select>') + ui.field('Owner', '<select name="ownerId">' + ui.memberOptions(pre.ownerId || st.me().id) + '</select>'), 'Aufgabe anlegen', (d) => { if (!d.title) return false; st.actions.addTask({ title: d.title, customerId: d.customerId || null, at: new Date(d.date + 'T' + (d.time || '10:00')).getTime(), kind: d.kind, ownerId: d.ownerId }); ui.toast('Aufgabe angelegt'); }); },
    newInvoice(pre = {}) { const ui = U(); const st = S(); ui.formModal('Neue Rechnung', 'Wird als Entwurf angelegt, danach senden.', ui.field('Kunde', '<select name="customerId">' + ui.custOptions(pre.customerId) + '</select>', true) + ui.field('Leistung', '<input name="desc" required placeholder="Phase 1 · RealRise Academy" value="' + ui.esc(pre.desc || '') + '">', true) + ui.field('Betrag (EUR)', '<input name="amount" type="number" min="0" step="10" required value="' + (pre.amount || '') + '">') + ui.field('Fällig in', '<select name="terms"><option value="14">14 Tage</option><option value="7">7 Tage</option><option value="30">30 Tage</option></select>'), 'Entwurf anlegen', (d) => { if (!d.amount) return false; const i = st.actions.addInvoice({ customerId: d.customerId, dealId: pre.dealId || null, amount: +d.amount, desc: d.desc, terms: d.terms + ' Tage', dueAt: Date.now() + (+d.terms) * ui.DAY }); ui.toast('Rechnungsentwurf angelegt'); go('#/finance/' + i.id); }); },
    newProject(pre = {}) { const ui = U(); const st = S(); ui.formModal('Neues Onboarding', 'Checkliste wird mit den 6 Standard-Schritten vorbelegt.', ui.field('Name', '<input name="name" required placeholder="Phase 1 Onboarding">', true) + ui.field('Kunde', '<select name="customerId">' + ui.custOptions(pre.customerId) + '</select>', true) + ui.field('Fällig am', '<input name="dueAt" type="date" value="' + ui.isoDate(Date.now() + 30 * ui.DAY) + '">') + ui.field('Verantwortlich', '<select name="ownerId">' + ui.memberOptions(st.me().id) + '</select>'), 'Onboarding anlegen', (d) => { if (!d.name) return false; const p = st.actions.addProject({ name: d.name, customerId: d.customerId, dueAt: new Date(d.dueAt).getTime(), teamIds: [d.ownerId] }); ui.toast('Onboarding angelegt'); go('#/projects/' + p.id); }); },
    logCall(pre = {}) { const ui = U(); const st = S(); ui.formModal('Anruf protokollieren', '', ui.field('Kunde', '<select name="customerId">' + ui.custOptions(pre.customerId) + '</select>', true) + ui.field('Dauer (Min.)', '<input name="minutes" type="number" min="1" value="15">') + ui.field('Ergebnis', '<select name="outcome"><option>Erreicht</option><option>Mailbox</option><option>Nicht erreicht</option><option>Termin vereinbart</option></select>') + ui.field('Notizen', '<textarea name="notes" placeholder="Was wurde vereinbart?"></textarea>', true), 'Anruf speichern', (d) => { st.actions.logCall({ customerId: d.customerId, minutes: +d.minutes, outcome: d.outcome, notes: d.notes }); ui.toast('Anruf protokolliert', { icon: 'phone' }); }); },
    compose(pre = {}) { const ui = U(); const st = S(); ui.formModal('Neue E-Mail', 'Wird beim Kunden in der Timeline protokolliert.', ui.field('An', '<select name="customerId">' + ui.custOptions(pre.customerId) + '</select>', true) + ui.field('Betreff', '<input name="subject" required placeholder="Nachfassen zu unserem Gespräch">', true) + ui.field('Nachricht', '<textarea name="body" rows="6"></textarea>', true), 'Senden', (d) => { if (!d.subject) return false; st.actions.logEmail({ customerId: d.customerId, subject: d.subject }); ui.toast('E-Mail gesendet', { icon: 'send' }); }); },
    dealMenu(anchor, id) { const ui = U(); const st = S(); const d = st.deal(id); if (!d) return; const items = [{ label: 'Öffnen', icon: 'arrowUpRight', onClick: () => go('#/pipeline/' + id) }, '-']; st.STAGES.forEach((s) => { if (s.id !== d.stage || d.status !== 'open') items.push({ label: 'Nach ' + s.name, icon: 'move', onClick: () => { st.actions.moveDeal(id, s.id); ui.toast('Nach ' + s.name + ' verschoben', { undo: () => st.undo() }); } }); }); items.push('-', { label: 'Als gewonnen markieren', icon: 'trophy', onClick: () => { st.actions.winDeal(id); ui.toast('Deal gewonnen', { icon: 'trophy', undo: () => st.undo() }); } }, { label: 'Als verloren markieren', icon: 'x', onClick: () => { st.actions.loseDeal(id); ui.toast('Als verloren markiert', { undo: () => st.undo() }); } }, '-', { label: 'Löschen', icon: 'trash', danger: true, onClick: () => ui.confirmModal('Deal löschen?', d.title + ' wird dauerhaft entfernt.', 'Löschen', () => { st.actions.deleteDeal(id); ui.toast('Deal gelöscht', { undo: () => st.undo() }); }) }); ui.menu(anchor, items, { align: 'right' }); },
  };

  // ---------- Tastatur ----------
  let gPending = false;
  function onKey(e) {
    const tag = (e.target.tagName || '').toLowerCase(); const typing = ['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openFinder(); return; }
    if (typing) return;
    if (document.querySelector('dialog[open]')) { return; }
    const k = e.key.toLowerCase();
    if (gPending) { gPending = false; const map = { ü: 'overview', u: 'overview', p: 'pipeline', k: 'customers', c: 'schedule', f: 'finance', r: 'growth', o: 'projects', e: 'settings' }; if (map[k]) { e.preventDefault(); go('#/' + map[k]); } return; }
    if (k === '/') { e.preventDefault(); openFinder(); } else if (k === 'n') { e.preventDefault(); document.querySelector('[data-act="new"]').click(); } else if (k === 't') { e.preventDefault(); forms.newTask(); } else if (k === 'g') { gPending = true; setTimeout(() => (gPending = false), 1200); } else if (k === '?') { openShortcuts(); } else if (k === 'd') { toggleTheme(); }
  }

  // ---------- Start ----------
  function start() {
    S().load(); applyTheme(); buildChrome();
    window.addEventListener('hashchange', route); window.addEventListener('resize', () => { positionTabPill(); document.querySelectorAll('.seg').forEach(U().positionSegPill); });
    document.addEventListener('keydown', onKey);
    S().on((what) => { applyTheme(); updateBell(); const meEl = document.querySelector('.me__ini'); if (meEl) meEl.textContent = S().me().ini; if (what === 'reset') { document.querySelectorAll('section.view').forEach((s) => delete s.dataset.entered); } render(); });
    if (!location.hash) location.hash = '#/overview'; else route();
    document.fonts && document.fonts.ready.then(positionTabPill);
    // Parallax auf dem Backdrop
    const bd = document.querySelector('.backdrop'); if (bd && !matchMedia('(prefers-reduced-motion: reduce)').matches) { window.addEventListener('pointermove', (e) => { const x = (e.clientX / innerWidth - 0.5) * 1.2, y = (e.clientY / innerHeight - 0.5) * 1.2; bd.style.transform = 'translate3d(' + x + '%,' + y + '%,0) scale(1.05)'; }, { passive: true }); }
  }
  return { start, go, route, render, forms, openFinder, openActivity, openShortcuts, TITLES };
})();
