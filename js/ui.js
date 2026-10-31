/* RealRise CRM – UI-Helfer: Formatierung, Icons, Komponenten, Charts, Overlays */
window.RR = window.RR || {};
RR.ui = (function () {
  const S = () => RR.store;
  const DAY = 86400000;

  // ---------- Formatierung ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n || 0));
  const short = (n) => { n = Math.round(n || 0); if (Math.abs(n) >= 1e6) return (n / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' Mio. €'; if (Math.abs(n) >= 1000) return (n / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + 'k €'; return n + ' €'; };
  const pct = (p, d = 0) => (Math.round((p || 0) * 100 * Math.pow(10, d)) / Math.pow(10, d)).toLocaleString('de-DE') + ' %';
  const dateS = (ts) => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  const dateL = (ts) => new Date(ts).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  const dateF = (ts) => new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = (ts) => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const isoDate = (ts) => { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const isoTime = (ts) => { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const rel = (ts) => { const m = Math.round((Date.now() - ts) / 60000); if (m < 1) return 'gerade eben'; if (m < 60) return 'vor ' + m + ' Min.'; const h = Math.round(m / 60); if (h < 24) return 'vor ' + h + ' Std.'; const d = Math.round(h / 24); if (d < 7) return 'vor ' + d + ' T.'; return dateS(ts); };
  const inDays = (ts) => { const d = Math.ceil((ts - Date.now()) / DAY); if (d < 0) return Math.abs(d) + ' T. überfällig'; if (d === 0) return 'heute'; if (d === 1) return 'morgen'; return 'in ' + d + ' T.'; };
  const startOfDay = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const isToday = (ts) => startOfDay(ts) === startOfDay(Date.now());

  // ---------- Icons (Lucide-ähnlich, 24er Raster) ----------
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    phone: '<path d="M6 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2"/>',
    send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/>',
    upload: '<path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    download: '<path d="M12 4v12m0 0-4-4m4 4 4-4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    more: '<circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    inbox: '<path d="M4 13h4l2 3h4l2-3h4"/><path d="M6 5h12l2 8v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
    trophy: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0zM8 6.5H4.5a3 3 0 0 0 3.5 4M16 6.5h3.5a3 3 0 0 1-3.5 4M12 13.5v3.5M8.5 20h7l-.5-3h-6z"/>',
    chart: '<path d="M4.5 19.5h15"/><path d="M7.5 16v-4.5M12 16V7.5M16.5 16v-6.5"/>',
    pie: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4.5-5.8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    pencil: '<path d="m4 20 4.5-1L19 8.5a2.1 2.1 0 0 0-3-3L5.5 16z"/><path d="m13.5 7 3 3"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
    arrowUpRight: '<path d="M7 17 17 7M9 7h8v8"/>',
    chevronLeft: '<path d="m14 6-6 6 6 6"/>',
    chevronRight: '<path d="m10 6 6 6-6 6"/>',
    chevronDown: '<path d="m6 10 6 6 6-6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    folder: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    flag: '<path d="M5 21V4h11l-1.5 4L16 12H5"/>',
    zap: '<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
    briefcase: '<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V5h6v2.5M3.5 13h17"/>',
    mapPin: '<path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11z"/><circle cx="12" cy="10" r="2"/>',
    building: '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/>',
    hash: '<path d="M9 4 7 20M17 4l-2 16M4 9h17M3 15h17"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    calendarPlus: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M8 3v4M16 3v4M12 13v4M10 15h4"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-3.5M4 13a8 8 0 0 0 14.5 3.5M4 5v4h4M20 19v-4h-4"/>',
    keyboard: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
    sunLogo: '<circle cx="12" cy="13" r="4"/><path d="M12 4v2M5.6 7.6l1.4 1.4M3 13h2M18.4 7.6 17 9M19 13h2M4 20h16"/>',
    board: '<rect x="3.5" y="4.5" width="5" height="15" rx="1.5"/><rect x="9.5" y="4.5" width="5" height="10" rx="1.5"/><rect x="15.5" y="4.5" width="5" height="13" rx="1.5"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    note: '<path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"/><path d="M9 12h6M9 16h6"/>',
    move: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    whatsapp: '<path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.9L3.5 20.5l4.2-1.1A8.5 8.5 0 1 0 12 3.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r=".8" fill="currentColor"/>',
  };
  const icon = (name, cls = '') => '<svg class="ico ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.hash) + '</svg>';
  const kindIcon = { call: 'phone', meeting: 'users', task: 'check', email: 'mail' };
  const actIcon = { stage: 'move', email: 'mail', call: 'phone', invoice: 'hash', task: 'check', won: 'trophy', note: 'note', lost: 'x' };

  // ---------- Kleine Komponenten ----------
  const av = (m, size = 'sm', extra = '') => { if (typeof m === 'string') m = S().member(m); if (!m) return ''; return '<span class="av av--' + size + ' av--t' + (m.tone || 0) + ' ' + extra + '" title="' + esc(m.name) + '">' + esc(m.ini) + '</span>'; };
  const avCust = (c, size = 'sm') => '<span class="av av--' + size + ' av--t' + (Math.abs(hash(c.id)) % 4) + '" title="' + esc(c.first + ' ' + c.last) + '">' + esc(c.first[0] + c.last[0]) + '</span>';
  const avStack = (ids, size = 'xs') => '<span class="av-stack">' + ids.slice(0, 3).map((id) => av(id, size)).join('') + '</span>';
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  const badge = (txt, tone = 'plain') => '<span class="badge badge--' + tone + '">' + txt + '</span>';
  const status = (txt, tone) => '<span class="status status--' + tone + '">' + esc(txt) + '</span>';
  const stageStatus = (st) => { const s = S().stage(st); return status(s.name, s.tone); };
  const meter = (p, tone = '') => '<div class="meter"><div class="meter__fill ' + (tone ? 'meter__fill--' + tone : '') + '" data-w="' + Math.max(0, Math.min(100, Math.round(p * 100))) + '"></div></div>';
  const deltaBadge = (cur, prev) => { if (!prev) return cur ? badge('neu', 'lime') : ''; const d = (cur - prev) / prev; return badge((d >= 0 ? '+' : '−') + Math.abs(Math.round(d * 100)) + ' % vs. Vormonat', d >= 0 ? 'lime' : 'coral'); };
  const ibtn = (name, label, attrs = '', cls = '') => '<button type="button" class="ibtn ' + cls + '" aria-label="' + esc(label) + '" title="' + esc(label) + '" ' + attrs + '>' + icon(name) + '</button>';
  const seg = (name, opts, cur, cls = '') => '<div class="seg ' + cls + '" data-seg="' + name + '">' + opts.map((o) => '<button type="button" class="seg__btn" data-val="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + esc(o[1]) + '</button>').join('') + '<span class="seg__pill"></span></div>';
  const chipMember = (m, pressed, attrs = '') => '<button type="button" class="chip" aria-pressed="' + !!pressed + '" ' + attrs + '>' + av(m, 'sm') + esc(m.name.split(' ')[0]) + '</button>';
  const stat = (ico, value, label, extra = '', i = 0) => '<div class="stat" style="--i:' + i + '"><span class="stat__ico">' + icon(ico) + '</span><div class="stat__body"><dd class="stat__value">' + value + (extra ? ' ' + extra : '') + '</dd><dt class="stat__label">' + esc(label) + '</dt></div></div>';
  const addDays = (ts, n) => { const d = new Date(ts); d.setDate(d.getDate() + n); return d.getTime(); };
  const title = (two) => { const words = two.includes(' | ') ? two.split(' | ') : two.split(' '); let i = 0; return '<h1 class="head__title" aria-label="' + esc(two) + '">' + words.map((w, wi) => '<span class="word" aria-hidden="true">' + [...w].map((ch) => '<span class="ch" style="--i:' + (i++) + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</span>').join('') + '</span>' + (wi < words.length - 1 ? '<br>' : '')).join('') + '</h1>'; };
  const head = (two, stats, actions = '') => '<header class="head"><div class="head__lead">' + two + '</div><dl class="head__stats">' + stats + '</dl>' + (actions ? '<div class="head__actions">' + actions + '</div>' : '') + '</header>';
  const cardHead = (t, sub = '', tools = '') => '<header class="card__head"><div><h2 class="card__title">' + esc(t) + '</h2>' + (sub ? '<div class="card__sub">' + sub + '</div>' : '') + '</div><div class="card__tools">' + tools + '</div></header>';
  const empty = (t, s = '') => '<div class="empty"><div class="empty__title">' + esc(t) + '</div>' + esc(s) + '</div>';
  const dealTile = (d, opts = {}) => { const st = S().stage(d.stage); const c = S().customer(d.customerId); const won = d.status === 'won'; return '<article class="tile tile--' + (won ? 'plain' : st.tone) + ' is-lift ' + (won ? 'is-won' : '') + ' ' + (opts.cls || '') + '" data-deal="' + d.id + '"><div class="tile__top"><span>' + (won ? '✓ Gewonnen · ' + dateS(d.wonAt) : 'Abschluss ' + dateS(d.closeDate)) + '</span>' + ibtn('more', 'Aktionen für ' + d.title, 'data-deal-menu="' + d.id + '"', 'ibtn--sm') + '</div><h3 class="tile__title"><a href="#/pipeline/' + d.id + '">' + esc(d.title) + '</a></h3><p class="tile__co">' + esc(c ? c.company : '') + '</p><div class="tile__foot"><div><b class="tile__amt num">' + money(d.amount) + '</b><small>' + esc(st.name) + ' · ' + Math.round(st.p * 100) + ' %</small></div>' + avStack(d.teamIds) + '</div></article>'; };
  const custOptions = (sel, allowNone) => (allowNone ? '<option value="">Intern — kein Kunde</option>' : '') + S().state.customers.slice().sort((a, b) => a.first.localeCompare(b.first)).map((c) => '<option value="' + c.id + '" ' + (c.id === sel ? 'selected' : '') + '>' + esc(c.first + ' ' + c.last + ' · ' + c.company) + '</option>').join('');
  const memberOptions = (sel) => S().state.team.map((m) => '<option value="' + m.id + '" ' + (m.id === sel ? 'selected' : '') + '>' + esc(m.name) + '</option>').join('');
  const field = (label, inner, wide) => '<label class="field ' + (wide ? 'field--wide' : '') + '"><span class="field__label">' + esc(label) + '</span>' + inner + '</label>';

  // ---------- Charts ----------
  function smoothPath(pts) { if (pts.length < 2) return ''; let d = 'M' + pts[0][0] + ',' + pts[0][1]; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1); } return d; }
  function lineChart(o) {
    const W = 722, H = 236, L = 44, R = 10, T = 14, B = 26;
    const labels = o.labels; const series = o.series; const n = labels.length;
    let max = Math.max(1, ...series.flatMap((s) => s.values.filter((v) => v != null)), o.target || 0); max = niceMax(max);
    const x = (i) => L + (i * (W - L - R)) / Math.max(1, n - 1); const y = (v) => T + (H - T - B) * (1 - v / max);
    const ticks = [0, max / 2, max];
    const gid = 'g' + Math.random().toString(36).slice(2, 7);
    let svg = '<svg class="chart__svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.label || '') + '"><defs>' + series.map((s, i) => '<linearGradient id="' + gid + i + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--' + (s.color || 'coral') + ')" stop-opacity=".22"/><stop offset="1" stop-color="var(--' + (s.color || 'coral') + ')" stop-opacity="0"/></linearGradient>').join('') + '</defs>';
    svg += '<g class="chart__grid">' + ticks.map((t) => '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text x="' + (L - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + (o.fmt || short)(t) + '</text>').join('') + '</g>';
    svg += '<g class="chart__plot">';
    if (o.target) svg += '<path class="chart__line chart__line--ink is-dashed" d="M' + L + ',' + y(o.target) + ' L' + (W - R) + ',' + y(o.target) + '"/>';
    series.forEach((s, i) => { const pts = s.values.map((v, k) => v == null ? null : [x(k), y(v)]).filter(Boolean); const d = smoothPath(pts); if (!pts.length) return; if (s.area !== false) svg += '<path class="chart__area" fill="url(#' + gid + i + ')" d="' + d + ' L' + pts[pts.length - 1][0] + ',' + y(0) + ' L' + pts[0][0] + ',' + y(0) + 'Z"/>'; svg += '<path class="chart__line chart__line--' + (s.color || 'coral') + ' ' + (s.dashed ? 'is-dashed' : 'draw') + '" d="' + d + '"/>'; });
    svg += '</g><g class="chart__x">' + labels.map((l, i) => '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(l) + '</text>').join('') + '</g>';
    svg += '<line class="chart__cross" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '"/>' + series.map(() => '<circle class="chart__dot" r="4" cx="0" cy="0"/>').join('') + '</svg><div class="chart__tip"></div>';
    const wrap = document.createElement('div'); wrap.className = 'chart'; wrap.innerHTML = svg;
    const svgEl = wrap.querySelector('svg'); const cross = wrap.querySelector('.chart__cross'); const dots = wrap.querySelectorAll('.chart__dot'); const tip = wrap.querySelector('.chart__tip');
    svgEl.addEventListener('pointermove', (e) => { const r = svgEl.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; let i = Math.round(((px - L) / (W - L - R)) * (n - 1)); i = Math.max(0, Math.min(n - 1, i)); wrap.classList.add('is-hover'); cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); series.forEach((s, k) => { const v = s.values[i]; if (v == null) { dots[k].style.opacity = 0; return; } dots[k].style.opacity = 1; dots[k].setAttribute('cx', x(i)); dots[k].setAttribute('cy', y(v)); }); tip.style.left = (x(i) / W) * 100 + '%'; tip.innerHTML = '<b>' + esc(labels[i]) + '</b>' + series.map((s) => esc(s.name) + ': ' + (o.fmt || money)(s.values[i] || 0)).join('<br>') + (o.target ? '<br>Ziel: ' + (o.fmt || money)(o.target) : ''); });
    svgEl.addEventListener('pointerleave', () => wrap.classList.remove('is-hover'));
    return wrap;
  }
  function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; const n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10; return n * p; }
  const ringHTML = (p, label, cls = '', tone = '') => { const r = 84, C = 2 * Math.PI * r; return '<div class="ring ' + cls + '" role="img" aria-label="' + esc(Math.round(p * 100) + ' % ' + (label || '')) + '"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="ring__track" cx="100" cy="100" r="' + r + '"/><circle class="ring__arc ' + (tone ? 'ring__arc--' + tone : '') + '" cx="100" cy="100" r="' + r + '" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" data-off="' + (C * (1 - Math.max(0, Math.min(1, p)))).toFixed(1) + '"/></svg><div class="ring__mid"><b class="num">' + Math.round(p * 100) + ' %</b>' + (label ? '<span>' + esc(label) + '</span>' : '') + '</div></div>'; };
  const bars = (rows, tone, fmt) => { const max = Math.max(1, ...rows.map((r) => r.value)); return '<div class="bars" style="grid-template-columns:repeat(' + rows.length + ',1fr)">' + rows.map((r, i) => '<div class="bars__col" title="' + esc(r.label + ': ' + (fmt ? fmt(r.value) : r.value)) + '"><div class="bars__fill ' + (i === rows.length - 1 ? 'bars__fill--' + tone : '') + '" data-h="' + Math.round((r.value / max) * 100) + '"></div></div>').join('') + '</div><div class="bars__labels" style="grid-template-columns:repeat(' + rows.length + ',1fr)">' + rows.map((r, i) => '<span class="' + (i === rows.length - 1 ? 'is-now' : '') + '">' + esc(r.label) + '</span>').join('') + '</div>'; };
  const stackCols = (rows, keys) => { const max = Math.max(1, ...rows.map((r) => keys.reduce((a, k) => a + r[k.key], 0))); return '<div class="stack" style="grid-template-columns:repeat(' + rows.length + ',1fr)">' + rows.map((r) => '<div class="stack__col" title="' + esc(r.label + ': ' + money(keys.reduce((a, k) => a + r[k.key], 0))) + '">' + keys.map((k) => '<div class="stack__piece stack__piece--' + k.tone + '" data-h="' + Math.round((r[k.key] / max) * 100) + '"></div>').join('') + '</div>').join('') + '</div><div class="bars__labels" style="grid-template-columns:repeat(' + rows.length + ',1fr)">' + rows.map((r, i) => '<span class="' + (i === rows.length - 1 ? 'is-now' : '') + '">' + esc(r.label) + '</span>').join('') + '</div>'; };
  const donut = (parts, mid, sub) => { const r = 60, C = 2 * Math.PI * r; const total = Math.max(1, parts.reduce((a, p) => a + p.value, 0)); let acc = 0; return '<div class="donut"><svg viewBox="0 0 150 150" aria-hidden="true">' + parts.map((p) => { const len = (p.value / total) * C; const s = '<circle cx="75" cy="75" r="' + r + '" stroke="' + p.color + '" stroke-dasharray="' + Math.max(0, len - 3) + ' ' + (C - Math.max(0, len - 3)) + '" stroke-dashoffset="' + (-acc) + '"/>'; acc += len; return s; }).join('') + '</svg><div class="donut__mid"><b>' + mid + '</b><span>' + esc(sub) + '</span></div></div>'; };
  const spark = (vals, cls = '') => { const W = 64, H = 22, max = Math.max(1, ...vals); const pts = vals.map((v, i) => [2 + (i * (W - 4)) / (vals.length - 1), H - 2 - (v / max) * (H - 4)]); return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path class="' + cls + '" d="' + smoothPath(pts) + '"/></svg>'; };
  function animateIn(root) {
    requestAnimationFrame(() => {
      root.querySelectorAll('.meter__fill[data-w]').forEach((el) => (el.style.width = el.dataset.w + '%'));
      root.querySelectorAll('.bars__fill[data-h],.stack__piece[data-h]').forEach((el) => (el.style.height = el.dataset.h + '%'));
      root.querySelectorAll('.ring__arc[data-off]').forEach((el) => (el.style.strokeDashoffset = el.dataset.off));
      root.querySelectorAll('.fin-age i[data-h]').forEach((el) => (el.style.height = el.dataset.h + '%'));
      root.querySelectorAll('.seg').forEach(positionSegPill);
      root.querySelectorAll('[data-count]').forEach(countUp);
    });
  }
  function countUp(el) { const target = parseFloat(el.dataset.count); const fmt = el.dataset.fmt; const f = fmt === 'money' ? money : fmt === 'short' ? short : fmt === 'pct' ? (v) => Math.round(v) + ' %' : (v) => Math.round(v).toLocaleString('de-DE'); const t0 = performance.now(), dur = 900; const step = (t) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = f(target * e); if (k < 1) requestAnimationFrame(step); }; if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = f(target); return; } requestAnimationFrame(step); }
  function positionSegPill(segEl) { const on = segEl.querySelector('.seg__btn[aria-pressed="true"]'); const pill = segEl.querySelector('.seg__pill'); if (!on || !pill) return; pill.style.left = on.offsetLeft + 'px'; pill.style.width = on.offsetWidth + 'px'; }

  // ---------- Overlays ----------
  let popEl = null, popAnchor = null;
  function closePop() { if (popEl) { popEl.remove(); popEl = null; } if (popAnchor) { popAnchor.setAttribute('aria-expanded', 'false'); popAnchor = null; } }
  function popover(anchor, html, opts = {}) {
    if (popAnchor === anchor) { closePop(); return null; }
    closePop();
    const el = document.createElement('div'); el.className = 'pop ' + (opts.cls || ''); el.setAttribute('role', opts.role || 'dialog'); el.innerHTML = html; document.body.appendChild(el);
    popEl = el; popAnchor = anchor; anchor.setAttribute('aria-expanded', 'true');
    const r = anchor.getBoundingClientRect(); const w = el.offsetWidth, h = el.offsetHeight; const vw = innerWidth, vh = innerHeight;
    let left = opts.align === 'right' ? r.right - w : r.left; let top = r.bottom + 8;
    if (opts.side === 'right') { left = r.right + 12; top = r.top; }
    if (left + w > vw - 12) left = vw - w - 12; if (left < 12) left = 12; if (top + h > vh - 12) top = Math.max(12, r.top - h - 8); if (top < 12) top = 12;
    el.style.left = left + 'px'; el.style.top = top + 'px';
    setTimeout(() => { document.addEventListener('pointerdown', onDocDown, { capture: true }); }, 0);
    return el;
  }
  function onDocDown(e) { if (popEl && !popEl.contains(e.target) && e.target !== popAnchor && !popAnchor.contains(e.target)) { closePop(); document.removeEventListener('pointerdown', onDocDown, { capture: true }); } }
  function menu(anchor, items, opts = {}) {
    const html = items.map((it) => it === '-' ? '<div class="menu__sep"></div>' : '<button type="button" class="menu__item ' + (it.danger ? 'is-danger' : '') + '" data-i="' + items.indexOf(it) + '">' + (it.icon ? icon(it.icon) : '') + '<span>' + esc(it.label) + '</span>' + (it.checked ? '<span class="menu__check">' + icon('check') + '</span>' : '') + '</button>').join('');
    const el = popover(anchor, html, Object.assign({ cls: 'pop--menu', role: 'menu' }, opts)); if (!el) return;
    el.addEventListener('click', (e) => { const b = e.target.closest('.menu__item'); if (!b) return; const it = items[+b.dataset.i]; closePop(); it.onClick && it.onClick(); });
    const first = el.querySelector('.menu__item'); first && first.focus();
  }
  function modal(html, opts = {}) {
    closePop(); const dlg = document.getElementById('modal'); dlg.innerHTML = '<form class="modal__inner" method="dialog" novalidate>' + html + '</form>'; dlg.showModal();
    const form = dlg.querySelector('form');
    form.addEventListener('submit', (e) => { e.preventDefault(); if (opts.onSubmit) { const data = Object.fromEntries(new FormData(form).entries()); const ok = opts.onSubmit(data, form); if (ok === false) return; } dlg.close(); });
    dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
    const f = form.querySelector('input,select,textarea'); f && setTimeout(() => f.focus(), 50);
    return dlg;
  }
  function formModal(title, sub, fieldsHtml, submitLabel, onSubmit) {
    return modal('<div class="mform__head"><div><div class="mform__title">' + esc(title) + '</div>' + (sub ? '<div class="mform__sub">' + esc(sub) + '</div>' : '') + '</div>' + ibtn('x', 'Schließen', 'data-close', 'mform__close') + '</div><div class="mform__grid">' + fieldsHtml + '</div><div class="mform__foot"><button type="button" class="btn btn--ghost" data-close>Abbrechen</button><button type="submit" class="btn">' + esc(submitLabel) + '</button></div>', { onSubmit });
  }
  function drawer(html, opts = {}) {
    closePop(); const dlg = document.getElementById('drawer'); dlg.innerHTML = '<div class="drawer__inner">' + html + '</div>'; if (!dlg.open) dlg.showModal();
    dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
    dlg.onclose = () => { if (opts.onClose) opts.onClose(); };
    return dlg;
  }
  function closeDrawer() { const dlg = document.getElementById('drawer'); if (dlg.open) dlg.close(); }
  let toastT = null;
  function toast(msg, opts = {}) { const el = document.getElementById('toast'); el.innerHTML = '<span class="toast__ico">' + icon(opts.icon || 'check') + '</span><span class="toast__msg">' + esc(msg) + '</span>' + (opts.undo ? '<button type="button" class="toast__undo">Rückgängig</button>' : ''); el.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('is-on'), opts.ms || 4000); const u = el.querySelector('.toast__undo'); if (u) u.onclick = () => { el.classList.remove('is-on'); opts.undo(); }; }
  function confirmModal(title, text, label, onOk) { modal('<div class="mform__head"><div><div class="mform__title">' + esc(title) + '</div><div class="mform__sub">' + esc(text) + '</div></div>' + ibtn('x', 'Schließen', 'data-close', 'mform__close') + '</div><div class="mform__foot"><button type="button" class="btn btn--ghost" data-close>Abbrechen</button><button type="submit" class="btn btn--danger">' + esc(label) + '</button></div>', { onSubmit: onOk }); }
  function download(name, text, type = 'text/plain') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  const csv = (rows) => rows.map((r) => r.map((v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(';')).join('\n');
  async function copy(text) { try { await navigator.clipboard.writeText(text); toast('Link kopiert', { icon: 'link' }); } catch (e) { toast('Zwischenablage nicht erreichbar', { icon: 'x' }); } }

  return { esc, money, short, pct, dateS, dateL, dateF, time, isoDate, isoTime, rel, inDays, startOfDay, isToday, addDays, DAY, icon, kindIcon, actIcon, av, avCust, avStack, badge, status, stageStatus, meter, deltaBadge, ibtn, seg, chipMember, stat, title, head, cardHead, empty, dealTile, custOptions, memberOptions, field, lineChart, ringHTML, bars, stackCols, donut, spark, animateIn, positionSegPill, popover, menu, closePop, modal, formModal, drawer, closeDrawer, toast, confirmModal, download, csv, copy, hash };
})();
