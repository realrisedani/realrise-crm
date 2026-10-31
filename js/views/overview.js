/* View: Übersicht */
window.RR = window.RR || {}; RR.views = RR.views || {};
RR.views.overview = (function () {
  let range = 12, quotaWho = null, rankBy = 'revenue';
  function render(root) {
    const ui = RR.ui, st = RR.store, k = st.kpi, me = st.me();
    const wonM = k.wonInMonth(0), wonPrev = k.wonInMonth(1);
    const stats = ui.stat('trophy', '<b data-count="' + wonM + '" data-fmt="money">' + ui.money(wonM) + '</b>', 'Gewonnen diesen Monat', ui.deltaBadge(wonM, wonPrev), 0)
      + ui.stat('chart', '<b data-count="' + k.openPipeline() + '" data-fmt="money">' + ui.money(k.openPipeline()) + '</b>', 'Offene Pipeline', '', 1)
      + ui.stat('pie', '<b data-count="' + Math.round(k.winRate() * 100) + '" data-fmt="pct">' + ui.pct(k.winRate()) + '</b>', 'Win-Rate, abgeschlossene Deals', '', 2);
    const months = k.monthlyWon(range); const total = st.sum(months, (m) => m.value); const target = Math.round(st.sum(st.state.team.filter((m) => m.role === 'Closer'), (m) => m.quota) / 12); const atTarget = months.filter((m) => m.value >= target).length;
    const q = k.teamQuotaQ(quotaWho); const mix = k.stageMix(); const mixTotal = st.sum(mix, (m) => m.value);
    const rank = k.leaderboard(rankBy); const today = k.tasksToday(); const doneN = today.filter((t) => t.done).length; const up = k.upcoming(3);
    root.innerHTML = ui.head(ui.title('Sales Übersicht'), stats) + '<div class="grid">' +
      // Revenue
      '<section class="card ov-rev" style="--i:0">' + ui.cardHead('Umsatz', '', ui.seg('range', [[6, '6M'], [12, '12M']], range, 'seg--sm') + ui.ibtn('more', 'Umsatz-Optionen', 'data-menu="rev"') + '<a class="ibtn" href="#/growth" aria-label="Growth öffnen">' + ui.icon('arrowUpRight') + '</a>') +
      '<div class="sum"><span class="big num" data-count="' + total + '" data-fmt="money">' + ui.money(total) + '</span><span class="muted">gewonnen in ' + range + ' Monaten · <b>' + atTarget + '</b> von ' + range + ' über Ziel</span></div>' +
      '<div class="legend"><span><i style="background:var(--coral)"></i>Gewonnener Umsatz</span><span><span class="dash"></span>Monatsziel · ' + ui.short(target) + '</span></div><div data-chart="rev"></div></section>' +
      // Hot deals
      '<section class="card ov-hot" style="--i:1">' + ui.cardHead('Heiße Deals', 'nach gewichtetem Wert', ui.ibtn('plus', 'Neuer Deal', 'data-new-deal') + '<a class="ibtn" href="#/pipeline" aria-label="Pipeline öffnen">' + ui.icon('arrowUpRight') + '</a>') + '<div class="ov-hot__grid">' + k.hotDeals(6).map((d) => ui.dealTile(d, { cls: 'tile--mini' })).join('') + '</div></section>' +
      // Quota
      '<section class="card ov-quota card--accent" style="--i:2">' + ui.cardHead('Team-Quote', quotaWho ? ui.esc(st.member(quotaWho).name) : 'Ganzes Team', ui.ibtn('more', 'Wessen Quote', 'data-menu="quota"')) + ui.ringHTML(q.pct, 'der Q-Quote') + '<div class="kv" style="margin-top:12px"><div><small>Gewonnen</small><b class="num">' + ui.short(q.won) + '</b></div><div><small>Quote</small><b class="num">' + ui.short(q.quota) + '</b></div><div><small>Tage übrig</small><b class="num">' + q.daysLeft + '</b></div></div><div class="well ov-quota__pace">' + (q.won >= q.quota ? 'Quote erreicht 🎉' : 'Braucht <b>' + ui.short(q.perDay) + '</b> pro Tag bis Quartalsende') + '</div></section>' +
      // Stage mix
      '<section class="card ov-mix" style="--i:3">' + ui.cardHead('Stage-Mix', '', '<a class="ibtn" href="#/pipeline" aria-label="Pipeline öffnen">' + ui.icon('arrowUpRight') + '</a>') + '<div class="sum"><span class="big num">' + ui.money(mixTotal) + '</span><span class="muted">offen über ' + k.openDeals().length + ' Deals</span></div><div class="ov-mix__bar">' + mix.map((m) => '<div class="ov-mix__seg" style="flex:' + Math.max(m.value, 1) + ';background:var(--' + (m.stage.tone === 'ink' ? 'text' : m.stage.tone) + ')" title="' + m.stage.name + '"></div>').join('') + '</div><ul>' + mix.map((m) => '<li><i class="dot dot--' + m.stage.tone + '"></i><span>' + m.stage.name + '</span><b class="num">' + m.count + '</b><span class="num r">' + ui.short(m.value) + '</span><span class="num r">' + Math.round((m.value / (mixTotal || 1)) * 100) + ' %</span></li>').join('') + '</ul></section>' +
      // Leaderboard
      '<section class="card ov-team" style="--i:4">' + ui.cardHead('Team-Ranking', rankBy === 'deals' ? 'Deals diesen Monat' : 'Gewonnen diesen Monat', ui.ibtn('more', 'Ranking-Optionen', 'data-menu="rank"') + '<a class="ibtn" href="#/settings/team" aria-label="Team öffnen">' + ui.icon('arrowUpRight') + '</a>') + '<ul class="ov-rank">' + rank.map((r, i) => '<li><span class="ov-rank__n">' + (i + 1) + '</span>' + ui.av(r.m, 'md') + '<div class="ov-rank__body"><b>' + ui.esc(r.m.name) + '</b>' + ui.meter(Math.min(1, r.pct), i === 0 ? 'coral' : '') + '<small>' + Math.round(r.pct * 100) + ' % der Monatsquote · ' + r.count + ' Deal' + (r.count === 1 ? '' : 's') + '</small></div><span class="ov-rank__val num">' + (rankBy === 'deals' ? r.count : ui.money(r.value)) + '</span></li>').join('') + '</ul></section>' +
      // Today
      '<section class="card ov-today" style="--i:5">' + ui.cardHead('Heute', '', '<button type="button" class="btn btn--sm" data-new-task>' + ui.icon('plus') + 'Hinzufügen</button>') + '<div class="ov-today__prog"><span>' + doneN + ' von ' + today.length + ' erledigt</span>' + ui.meter(today.length ? doneN / today.length : 0, 'lime') + '</div><div>' + (today.length ? today.map((t) => '<div class="row-task ' + (t.done ? 'is-done' : '') + '"><button type="button" class="check" role="checkbox" aria-checked="' + t.done + '" data-task-toggle="' + t.id + '" aria-label="' + ui.esc(t.title) + ' erledigt">' + ui.icon('check') + '</button><div class="row-task__body"><b>' + ui.esc(t.title) + '</b><small>' + ui.time(t.at) + ' · ' + ui.esc(t.customerId ? st.customer(t.customerId).company : 'Intern') + '</small></div><span class="kind" title="' + st.KINDS[t.kind] + '">' + ui.icon(ui.kindIcon[t.kind]) + '</span>' + ui.av(t.ownerId, 'sm') + '</div>').join('') : ui.empty('Heute nichts geplant', 'Zeit für Follow-ups.')) + '</div><div class="ov-next"><div class="ov-next__head"><span>Demnächst</span><a class="btn btn--ghost btn--sm" href="#/schedule">Kalender öffnen</a></div><ul>' + up.map((t) => '<li><span class="ov-next__when">' + new Date(t.at).toLocaleDateString('de-DE', { weekday: 'short' }) + '<b>' + new Date(t.at).getDate() + '</b></span><div><b>' + ui.esc(t.title) + '</b><small>' + ui.time(t.at) + ' · ' + ui.esc(t.customerId ? st.customer(t.customerId).company : 'Intern') + '</small></div></li>').join('') + '</ul></div></section>' +
      // Activity
      '<section class="card ov-act" style="--i:6">' + ui.cardHead('Letzte Aktivität', '', ui.ibtn('inbox', 'Alle Aktivitäten', 'data-act="activity"')) + '<ul class="feed">' + st.state.activity.slice(0, 6).map((a) => { const m = st.member(a.actorId); const c = st.customer(a.customerId); return '<li class="feed__item">' + ui.av(m, 'sm') + '<p><b>' + ui.esc(m ? m.name.split(' ')[0] : '') + '</b> ' + a.text + (c ? ' · <a href="#/customers/' + c.id + '">' + ui.esc(c.company) + '</a>' : '') + '<small>' + ui.rel(a.at) + '</small></p><span class="feed__ico">' + ui.icon(ui.actIcon[a.kind] || 'note') + '</span></li>'; }).join('') + '</ul></section>' +
      '</div>';
    root.querySelector('[data-chart="rev"]').appendChild(ui.lineChart({ labels: months.map((m) => m.label), series: [{ name: 'Gewonnen', values: months.map((m) => m.value), color: 'coral' }], target, label: 'Gewonnener Umsatz pro Monat gegen das Monatsziel' }));
    bind(root);
  }
  function bind(root) {
    const ui = RR.ui, st = RR.store, app = RR.app;
    root.onclick = (e) => {
      const t = e.target;
      const segBtn = t.closest('.seg__btn'); if (segBtn) { range = +segBtn.dataset.val; app.render(); return; }
      const m = t.closest('[data-menu]'); if (m) {
        if (m.dataset.menu === 'rev') ui.menu(m, [{ label: range + ' Monate als CSV', icon: 'download', onClick: () => { const rows = [['Monat', 'Gewonnen']]; st.kpi.monthlyWon(range).forEach((x) => rows.push([x.label, x.value])); ui.download('umsatz.csv', ui.csv(rows), 'text/csv'); } }, { label: 'Growth-Report öffnen', icon: 'arrowUpRight', onClick: () => app.go('#/growth') }], { align: 'right' });
        if (m.dataset.menu === 'quota') ui.menu(m, [{ label: 'Ganzes Team', checked: !quotaWho, onClick: () => { quotaWho = null; app.render(); } }].concat(st.state.team.filter((x) => x.role === 'Closer').map((x) => ({ label: x.name + (x.me ? ' (ich)' : ''), checked: quotaWho === x.id, onClick: () => { quotaWho = x.id; app.render(); } }))), { align: 'right' });
        if (m.dataset.menu === 'rank') ui.menu(m, [{ label: 'Nach Umsatz', checked: rankBy === 'revenue', onClick: () => { rankBy = 'revenue'; app.render(); } }, { label: 'Nach Deals', checked: rankBy === 'deals', onClick: () => { rankBy = 'deals'; app.render(); } }, '-', { label: 'Ranking als CSV', icon: 'download', onClick: () => { const rows = [['Rang', 'Name', 'Gewonnen', 'Deals']]; st.kpi.leaderboard(rankBy).forEach((r, i) => rows.push([i + 1, r.m.name, r.value, r.count])); ui.download('ranking.csv', ui.csv(rows), 'text/csv'); } }], { align: 'right' });
        return;
      }
      const dm = t.closest('[data-deal-menu]'); if (dm) { app.forms.dealMenu(dm, dm.dataset.dealMenu); return; }
      if (t.closest('[data-new-deal]')) { app.forms.newDeal(); return; }
      if (t.closest('[data-new-task]')) { app.forms.newTask({ at: Date.now() + 3600000 }); return; }
      const tt = t.closest('[data-task-toggle]'); if (tt) { st.actions.toggleTask(tt.dataset.taskToggle); return; }
    };
  }
  return { render };
})();
