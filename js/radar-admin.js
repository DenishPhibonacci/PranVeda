/* =========================================================
   Job Radar — admin section.
   Data lives in a PRIVATE repo (default "job-radar"):
     config.json  search profile + Telegram settings
     jobs.json    results written by the GitHub Action (radar.mjs)
     status.json  your saved / applied / hidden jobs
   ========================================================= */
const RADAR_REPO_DEFAULT = 'job-radar';
const RADAR_VERSION = 1;
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'Singapore', 'United Arab Emirates', 'France',
  'Poland', 'Spain', 'Italy', 'Switzerland', 'New Zealand', 'Austria', 'Belgium', 'Ireland', 'Sweden', 'Japan', 'Saudi Arabia', 'Qatar', 'Brazil', 'Mexico', 'South Africa'];
const ADZUNA_COUNTRIES = new Set(['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'Singapore', 'France', 'Poland',
  'Spain', 'Italy', 'Switzerland', 'New Zealand', 'Austria', 'Belgium', 'Brazil', 'Mexico', 'South Africa']);
const INDEED = { India: 'in.indeed.com', 'United States': 'www.indeed.com', 'United Kingdom': 'uk.indeed.com', Canada: 'ca.indeed.com', Australia: 'au.indeed.com',
  Germany: 'de.indeed.com', Netherlands: 'nl.indeed.com', Singapore: 'sg.indeed.com', 'United Arab Emirates': 'ae.indeed.com', France: 'fr.indeed.com',
  Ireland: 'ie.indeed.com', Poland: 'pl.indeed.com', Spain: 'es.indeed.com', Italy: 'it.indeed.com', 'New Zealand': 'nz.indeed.com', Japan: 'jp.indeed.com' };

let RADAR = null;
const RS = { cfg: null, jobs: null, status: null, exists: { config: false, script: false }, error: '' };

async function radarClient() {
  const name = CFG.radarRepo || RADAR_REPO_DEFAULT;
  if (RADAR && RADAR.repo === name && RADAR.token === GH.token) return RADAR;
  const c = new GitHubRepo({ owner: CFG.owner, repo: name, token: GH.token, api: CFG.api, branch: 'main' });
  const info = await c.getRepo();
  c.branch = info.default_branch || 'main';
  c.isPrivate = !!info.private;
  RADAR = c;
  return c;
}
async function readOr(path, fallback) {
  try { return await RADAR.readJson(path); } catch (e) { if (e.status === 404) return fallback; throw e; }
}
function defaultRadarConfig() {
  const p = DATA.profile || {};
  const role = (p.role || 'Unity Developer').replace(/^(sr\.?|senior)\s+/i, '');
  return {
    keywords: [...new Set(['Unity Developer', role, 'Unity Game Developer', 'Game Developer'])].slice(0, 4),
    skills: (p.skills || ['Unity', 'C#']).filter(s => s.length < 30).slice(0, 14).concat(['Unity']).filter((v, i, a) => a.indexOf(v) === i),
    exclude: ['intern', 'internship', 'trainee', 'fresher'],
    locations: [{ city: (p.location || 'Ahmedabad').split(',')[0].trim(), country: 'India' }],
    types: ['fulltime', 'remote', 'contract'],
    maxDays: 14, minScore: 35,
    adzuna: { appId: '', appKey: '' },
    telegram: { enabled: false, botToken: '', chatId: '', minScore: 55, maxPerRun: 8, adminUrl: '' }
  };
}
async function loadRadar() {
  RS.error = '';
  await radarClient();
  const [cfg, jobs, status] = await Promise.all([readOr('config.json', null), readOr('jobs.json', null), readOr('status.json', null)]);
  RS.exists.config = !!cfg;
  RS.exists.script = await RADAR.readText('radar.mjs').then(() => true, () => false);
  RS.cfg = { ...defaultRadarConfig(), ...(cfg || {}) };
  RS.cfg.telegram = { ...defaultRadarConfig().telegram, ...((cfg && cfg.telegram) || {}) };
  RS.cfg.adzuna = { ...defaultRadarConfig().adzuna, ...((cfg && cfg.adzuna) || {}) };
  RS.jobs = jobs || { jobs: [], lastRun: null };
  RS.status = { saved: [], applied: {}, hidden: [], ...(status || {}) };
}

/* ---------- writing to the private repo ---------- */
async function radarCommit(message, files, quiet = false) {
  if (!quiet) loading(true, 'Saving', 1, 'job-radar');
  try {
    await RADAR.commit(message, files.map(f => ({ path: f.path, base64: textToBase64(typeof f.content === 'string' ? f.content : JSON.stringify(f.content, null, 2) + '\n') })));
    if (!quiet) { loading(false); toast('Saved ✓'); }
  } catch (err) { loading(false); toast(err.message, 'err'); throw err; }
}
let statusTimer = null;
function saveStatusSoon() {
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => radarCommit('Job radar: update my job list', [{ path: 'status.json', content: RS.status }], true).catch(() => {}), 1500);
}
async function dispatchRadar(mode = 'search') {
  await RADAR.req('POST', '/actions/workflows/radar.yml/dispatches', { ref: RADAR.branch, inputs: { mode } });
}
async function latestRun() {
  const d = await RADAR.req('GET', `/actions/workflows/radar.yml/runs?per_page=1&t=${Date.now()}`);
  return d && d.workflow_runs && d.workflow_runs[0];
}
async function waitForRun(startedAt, onTick) {
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 6000));
    const run = await latestRun().catch(() => null);
    if (run && new Date(run.created_at).getTime() >= startedAt - 15000) {
      onTick && onTick(run);
      if (run.status === 'completed') return run;
    }
  }
  return null;
}

/* ---------- helpers ---------- */
const ago = iso => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!isFinite(s)) return '';
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm ago';
  if (s < 86400) return Math.round(s / 3600) + 'h ago';
  return Math.round(s / 86400) + 'd ago';
};
const enc = encodeURIComponent;
const slugPart = s => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function quickLinks(cfg) {
  const kw = cfg.keywords[0] || 'Unity Developer';
  const out = [];
  (cfg.locations.length ? cfg.locations : [{ city: '', country: 'India' }]).forEach(l => {
    const place = [l.city, l.country].filter(Boolean).join(', ');
    const label = l.city || l.country;
    const links = [
      ['LinkedIn', `https://www.linkedin.com/jobs/search/?keywords=${enc(kw)}&location=${enc(place)}&f_TPR=r604800`],
      INDEED[l.country] && ['Indeed', `https://${INDEED[l.country]}/jobs?q=${enc(kw)}&l=${enc(l.city || '')}&fromage=14`],
      l.country === 'India' && ['Naukri', `https://www.naukri.com/${slugPart(kw)}-jobs${l.city ? '-in-' + slugPart(l.city) : ''}`],
      l.country === 'India' && ['Foundit', `https://www.foundit.in/srp/results?query=${enc(kw)}&locations=${enc(l.city || '')}`],
      l.country === 'India' && ['Instahyre', `https://www.instahyre.com/search-jobs/?q=${enc(kw)}`],
      ['Glassdoor', `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${enc(kw + ' ' + label)}`]
    ].filter(Boolean);
    out.push({ title: `📍 ${place}`, links });
  });
  if (cfg.types.includes('remote')) out.push({ title: '🌍 Remote', links: [
    ['LinkedIn Remote', `https://www.linkedin.com/jobs/search/?keywords=${enc(kw)}&f_WT=2&f_TPR=r604800`],
    ['Remote OK', `https://remoteok.com/remote-${slugPart(kw.split(' ')[0])}-jobs`],
    ['Wellfound', `https://wellfound.com/jobs?q=${enc(kw)}`],
    ['Hitmarker (games)', `https://hitmarker.net/jobs?keywords=${enc(kw)}`]
  ] });
  if (cfg.types.includes('contract')) out.push({ title: '💼 Freelance', links: [
    ['Upwork', `https://www.upwork.com/nx/search/jobs/?q=${enc(kw)}`],
    ['Freelancer', `https://www.freelancer.com/jobs/?keyword=${enc(kw)}`],
    ['Fiverr (buyers)', `https://www.fiverr.com/search/gigs?query=${enc('unity game')}`]
  ] });
  return out;
}

/* =========================================================
   View
   ========================================================= */
async function viewJobs(main, tab = 'list') {
  main.innerHTML = header('// Quest board', 'Job Radar', 'Finds jobs that match your profile every 6 hours and pings you on Telegram',
    `<a class="btn" href="#jobs/settings">${ico('gear')} Search profile</a>`) +
    `<div class="seg radar-tabs" id="rtabs">
      <button data-t="list">${ico('radar', 14)} Jobs</button><button data-t="settings">Search profile</button>
      <button data-t="telegram">Telegram</button><button data-t="setup">Setup</button></div>
    <div id="rbody"><div class="panel"><div class="hint">Loading radar…</div></div></div>`;
  $$('#rtabs button').forEach(b => { b.classList.toggle('active', b.dataset.t === tab); b.onclick = () => (location.hash = 'jobs/' + b.dataset.t); });
  const body = $('#rbody');
  try { await loadRadar(); }
  catch (err) {
    RS.error = err.status === 404
      ? `Private repo "${CFG.owner}/${CFG.radarRepo || RADAR_REPO_DEFAULT}" not found, or your access key can't see it yet.`
      : err.message;
    markTab('setup'); return radarSetup(body);
  }
  if (!RS.exists.script && tab === 'list') { markTab('setup'); return radarSetup(body); }
  ({ list: radarList, settings: radarSettings, telegram: radarTelegram, setup: radarSetup }[tab] || radarList)(body);
}

function markTab(t) { $$('#rtabs button').forEach(b => b.classList.toggle('active', b.dataset.t === t)); }

/* ---------- Jobs list ---------- */
function radarList(body) {
  const cfg = RS.cfg, data = RS.jobs, st = RS.status;
  const lastSeen = Number(store.get('pv_jobs_seen') || 0);
  store.set('pv_jobs_seen', String(Date.now()));
  const run = data.lastRun;
  const errs = run && run.errors ? Object.entries(run.errors) : [];
  const countries = [...new Set((data.jobs || []).map(j => j.country).filter(Boolean))].sort();
  const f = { q: '', view: 'all', type: 'any', country: 'any', sort: 'score' };

  body.innerHTML = `
    <div class="panel radar-status">
      <div class="rs-left">
        <span class="rs-dot ${run ? 'ok' : ''}"></span>
        <div><b>${run ? `Last scan ${ago(run.at)}` : 'No scan yet'}</b>
          <small>${run ? `${run.found} matching jobs · ${run.new} new · ${Object.entries(run.counts || {}).map(([k, v]) => `${k} ${v}`).join(' · ')}` : 'Click "Scan now" to run the first search'}</small></div>
      </div>
      <div class="rs-right">
        ${cfg.telegram.enabled ? '<span class="chip game">Telegram ON</span>' : '<a class="chip draft" href="#jobs/telegram">Telegram OFF</a>'}
        <button class="btn btn-primary" id="scanBtn">${ico('radar')} Scan now</button>
      </div>
      ${errs.length ? `<div class="rs-errs">${errs.map(([k, v]) => `<span>⚠ <b>${esc(k)}</b>: ${esc(v)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="toolbar">
      <input type="text" id="jq" placeholder="Search title, company, skill…">
      <div class="seg" id="jview">
        <button class="active" data-v="all">All</button><button data-v="new">New</button><button data-v="saved">⭐ Saved</button><button data-v="applied">✓ Applied</button><button data-v="hidden">Hidden</button>
      </div>
      <select id="jtype"><option value="any">Any type</option><option value="full-time">Full-time</option><option value="remote">Remote</option><option value="contract">Contract / freelance</option></select>
      <select id="jcountry"><option value="any">Any country</option>${countries.map(c => `<option>${esc(c)}</option>`).join('')}<option value="__remote">Remote only</option></select>
      <select id="jsort"><option value="score">Best match</option><option value="date">Newest</option></select>
    </div>
    <div id="jlist" class="job-list"></div>
    <div class="panel" style="margin-top:18px">
      <h2>Search on job sites</h2>
      <p class="hint" style="margin:-8px 0 14px">LinkedIn, Naukri and Indeed don't allow automatic reading — these open a ready-made search with your role and location.</p>
      ${quickLinks(cfg).map(g => `<div class="ql"><b>${esc(g.title)}</b><div>${g.links.map(([n, u]) => `<a class="btn btn-sm" href="${esc(u)}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join('')}</div></div>`).join('')}
    </div>`;

  const isNew = j => new Date(j.firstSeen || j.posted).getTime() > lastSeen && lastSeen > 0;
  const render = () => {
    const q = f.q.toLowerCase();
    let items = (data.jobs || []).filter(j => {
      const hidden = st.hidden.includes(j.id);
      if (f.view === 'hidden') return hidden;
      if (hidden) return false;
      if (f.view === 'saved' && !st.saved.includes(j.id)) return false;
      if (f.view === 'applied' && !st.applied[j.id]) return false;
      if (f.view === 'new' && !isNew(j)) return false;
      if (f.type === 'remote' && !j.remote) return false;
      if (f.type === 'contract' && !['contract', 'freelance'].includes(j.type)) return false;
      if (f.type === 'full-time' && (j.type !== 'full-time' || j.remote)) return false;
      if (f.country === '__remote' && !j.remote) return false;
      if (f.country !== 'any' && f.country !== '__remote' && j.country !== f.country) return false;
      if (q && !`${j.title} ${j.company} ${j.location} ${(j.matched || []).join(' ')}`.toLowerCase().includes(q)) return false;
      return true;
    });
    items.sort(f.sort === 'date' ? (a, b) => String(b.posted).localeCompare(String(a.posted)) : (a, b) => b.score - a.score || String(b.posted).localeCompare(String(a.posted)));
    $('#jlist').innerHTML = items.length ? items.map(j => {
      const saved = st.saved.includes(j.id), applied = st.applied[j.id];
      return `<article class="job${isNew(j) ? ' is-new' : ''}${applied ? ' is-applied' : ''}" data-id="${esc(j.id)}">
        <div class="score" style="--p:${j.score}"><b>${j.score}</b><small>% match</small></div>
        <div class="job-main">
          <div class="job-top"><h3>${esc(j.title)}</h3>${isNew(j) ? '<span class="chip star">NEW</span>' : ''}${applied ? `<span class="chip game">Applied ${esc(new Date(applied).toLocaleDateString())}</span>` : ''}</div>
          <div class="job-co"><b>${esc(j.company || 'Company')}</b> · ${esc(j.location || '')} · ${esc(ago(j.posted))}</div>
          <div class="job-tags">
            <span class="chip ${j.type === 'full-time' ? 'app' : 'asset'}">${esc(j.type)}</span>${j.remote ? '<span class="chip website">Remote</span>' : ''}
            ${j.salary ? `<span class="chip draft">💰 ${esc(j.salary)}</span>` : ''}<span class="src">via ${esc(j.source)}</span>
          </div>
          ${j.summary ? `<p class="job-sum">${esc(j.summary)}</p>` : ''}
          ${(j.matched || []).length ? `<div class="job-skills">${j.matched.map(s => `<span>✓ ${esc(s)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="job-acts">
          <a class="btn btn-primary btn-sm" href="${esc(j.url)}" target="_blank" rel="noopener">Open ↗</a>
          <button class="btn btn-sm" data-a="save" title="Save">${saved ? '★ Saved' : '☆ Save'}</button>
          <button class="btn btn-sm" data-a="applied">${applied ? '↺ Not applied' : '✓ Applied'}</button>
          <button class="btn btn-sm btn-danger" data-a="hide">${st.hidden.includes(j.id) ? 'Unhide' : 'Hide'}</button>
        </div>
      </article>`;
    }).join('') : `<div class="empty"><b>${(data.jobs || []).length ? 'No jobs match these filters' : 'No jobs yet'}</b>${(data.jobs || []).length ? 'Try "All" or another filter.' : 'Run a scan, or widen your search profile (more keywords, more locations, lower minimum match).'}</div>`;
  };
  render();
  $('#jq').oninput = e => { f.q = e.target.value.trim(); render(); };
  $('#jview').onclick = e => { const b = e.target.closest('button'); if (!b) return; f.view = b.dataset.v; $$('#jview button').forEach(x => x.classList.toggle('active', x === b)); render(); };
  $('#jtype').onchange = e => { f.type = e.target.value; render(); };
  $('#jcountry').onchange = e => { f.country = e.target.value; render(); };
  $('#jsort').onchange = e => { f.sort = e.target.value; render(); };
  $('#jlist').onclick = e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const id = b.closest('.job').dataset.id;
    if (b.dataset.a === 'save') st.saved = st.saved.includes(id) ? st.saved.filter(x => x !== id) : [...st.saved, id];
    if (b.dataset.a === 'applied') { if (st.applied[id]) delete st.applied[id]; else st.applied[id] = new Date().toISOString(); }
    if (b.dataset.a === 'hide') st.hidden = st.hidden.includes(id) ? st.hidden.filter(x => x !== id) : [...st.hidden, id];
    render(); saveStatusSoon();
  };
  $('#scanBtn').onclick = async e => {
    const btn = e.currentTarget; btn.disabled = true; btn.lastChild.textContent = ' Scanning…';
    const started = Date.now();
    try {
      await dispatchRadar('search');
      toast('Scan started — takes about 1 minute');
      const r = await waitForRun(started, run => (btn.lastChild.textContent = run.status === 'completed' ? ' Done' : ' Scanning…'));
      if (r && r.conclusion !== 'success') toast(`Scan ${r.conclusion || 'did not finish'} — open the job-radar repo → Actions for details`, 'err');
      else if (r) { await new Promise(res => setTimeout(res, 3000)); await loadRadar(); toast(`Scan complete — ${RS.jobs.lastRun ? RS.jobs.lastRun.new : 0} new jobs`); radarList(body); return; }
      else toast('Scan is taking long — refresh in a minute', 'err');
    } catch (err) { toast(err.status === 403 ? 'Your access key needs "Actions: Read and write" for the job-radar repo (see Setup).' : err.message, 'err'); }
    btn.disabled = false; btn.lastChild.textContent = ' Scan now';
  };
}

/* ---------- Search profile ---------- */
function radarSettings(body) {
  const c = JSON.parse(JSON.stringify(RS.cfg));
  const locs = c.locations;
  body.innerHTML = `
  <form id="rsf">
    <div class="panel">
      <h2>What job</h2>
      <div class="field"><label>Job titles / keywords</label><input type="text" name="keywords" value="${esc(c.keywords.join(', '))}"><small>Comma separated. The first one is used for quick links. Example: Unity Developer, Game Developer, Unity 3D Developer</small></div>
      <div class="field"><label>Your skills (used to calculate the match %)</label><input type="text" name="skills" value="${esc(c.skills.join(', '))}"></div>
      <div class="field"><label>Skip jobs with these words in the title</label><input type="text" name="exclude" value="${esc(c.exclude.join(', '))}"><small>Example: intern, trainee, fresher, junior</small></div>
      <div class="field" style="margin:0"><span class="label">Job type</span>
        <div class="checks">
          <label><input type="checkbox" name="types" value="fulltime" ${c.types.includes('fulltime') ? 'checked' : ''}> Full-time (office / hybrid)</label>
          <label><input type="checkbox" name="types" value="remote" ${c.types.includes('remote') ? 'checked' : ''}> Remote</label>
          <label><input type="checkbox" name="types" value="contract" ${c.types.includes('contract') ? 'checked' : ''}> Freelance / contract</label>
        </div></div>
    </div>
    <div class="panel">
      <h2>Where <button type="button" class="btn btn-sm" id="addLoc">${ico('plus', 14)} Add city / country</button></h2>
      <p class="hint" style="margin:-8px 0 14px">Leave city empty to search the whole country. Automatic search covers Adzuna countries (India, US, UK, Canada, Australia, Germany, Singapore and more); others get quick-search links.</p>
      <div class="rep-list" id="locList"></div>
    </div>
    <div class="panel">
      <h2>Filters</h2>
      <div class="grid-2">
        <div class="field"><label>Only jobs posted in the last</label><select name="maxDays">${[3, 7, 14, 30].map(d => `<option value="${d}" ${Number(c.maxDays) === d ? 'selected' : ''}>${d} days</option>`).join('')}</select></div>
        <div class="field"><label>Minimum match: <b id="msv">${c.minScore}%</b></label><input type="range" name="minScore" min="10" max="90" step="5" value="${c.minScore}" oninput="document.getElementById('msv').textContent=this.value+'%'"></div>
      </div>
    </div>
    <div class="panel">
      <h2>Adzuna (India + 18 countries, by city)</h2>
      <p class="hint" style="margin:-8px 0 14px">Free key: <a href="https://developer.adzuna.com/signup" target="_blank" rel="noopener" style="color:var(--cyan)">developer.adzuna.com/signup</a> → after login open <b>Dashboard → API Access Details</b> and copy both values. Remote job sources (Remotive, Remote OK, Himalayas, Arbeitnow) work without a key.</p>
      <div class="grid-2">
        <div class="field"><label>App ID</label><input type="text" name="appId" value="${esc(c.adzuna.appId)}" autocomplete="off"></div>
        <div class="field"><label>App Key</label><input type="password" name="appKey" value="${esc(c.adzuna.appKey)}" autocomplete="off"></div>
      </div>
    </div>
    <div class="save-bar"><button class="btn btn-primary" type="submit">${ico('save')} Save search profile</button></div>
  </form>`;
  const addLoc = repeater($('#locList'), locs, [
    { k: 'city', label: 'City (optional)', ph: 'Ahmedabad' },
    { k: 'country', label: 'Country', type: 'select', options: COUNTRIES.map(x => [x, x + (ADZUNA_COUNTRIES.has(x) ? '' : ' (links only)')]) }
  ], { city: '', country: 'India' }, () => (dirty = true));
  $('#addLoc').onclick = () => addLoc();
  $('#rsf').addEventListener('input', () => (dirty = true));
  $('#rsf').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const next = {
      ...RS.cfg,
      keywords: list(fd.get('keywords')), skills: list(fd.get('skills')), exclude: list(fd.get('exclude')).map(x => x.toLowerCase()),
      types: fd.getAll('types'), locations: locs.filter(l => l.country).map(l => ({ city: (l.city || '').trim(), country: l.country })),
      maxDays: Number(fd.get('maxDays')) || 14, minScore: Number(fd.get('minScore')) || 35,
      adzuna: { appId: String(fd.get('appId') || '').trim(), appKey: String(fd.get('appKey') || '').trim() }, version: RADAR_VERSION
    };
    if (!next.keywords.length) return toast('Add at least one job title / keyword', 'err');
    if (!next.types.length) return toast('Choose at least one job type', 'err');
    try { await radarCommit('Job radar: update search profile', [{ path: 'config.json', content: next }]); RS.cfg = next; dirty = false; toast('Next scan will use these settings — or click Scan now'); } catch (_) {}
  });
}

/* ---------- Telegram ---------- */
function radarTelegram(body) {
  const t = RS.cfg.telegram;
  body.innerHTML = `
  <form id="tgf">
    <div class="panel">
      <h2>Get new jobs on your phone</h2>
      <ol class="steps">
        <li>Open <a href="https://t.me/BotFather" target="_blank" rel="noopener" style="color:var(--cyan)"><b>@BotFather</b></a> in Telegram → send <code>/newbot</code> → give it a name (e.g. <i>Denish Job Radar</i>) and a username ending in <code>bot</code>.</li>
        <li>BotFather replies with a <b>token</b> like <code>123456:ABC-…</code>. Paste it below.</li>
        <li>Open your new bot in Telegram and press <b>Start</b> (send any message).</li>
        <li>Click <b>Find my chat ID</b>, then <b>Save</b>, then <b>Send test message</b>.</li>
      </ol>
    </div>
    <div class="panel">
      <h2>Settings</h2>
      <label class="toggle"><span><b>Send Telegram notifications</b><small>Only for new jobs above the minimum match</small></span><span class="switch"><input type="checkbox" name="enabled" ${t.enabled ? 'checked' : ''}><span></span></span></label>
      <div class="grid-2" style="margin-top:10px">
        <div class="field"><label>Bot token</label><input type="password" name="botToken" value="${esc(t.botToken)}" autocomplete="off" placeholder="123456789:AA…"></div>
        <div class="field"><label>Chat ID</label><div style="display:flex;gap:8px"><input type="text" name="chatId" value="${esc(t.chatId)}" placeholder="e.g. 987654321"><button type="button" class="btn btn-sm" id="findChat">Find my chat ID</button></div>
          <small id="chatHint"></small></div>
        <div class="field"><label>Notify when match is at least: <b id="nmv">${t.minScore}%</b></label><input type="range" name="minScore" min="20" max="95" step="5" value="${t.minScore}" oninput="document.getElementById('nmv').textContent=this.value+'%'"></div>
        <div class="field"><label>Max jobs per message</label><select name="maxPerRun">${[3, 5, 8, 12, 20].map(n => `<option ${Number(t.maxPerRun) === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      </div>
      <p class="hint">The bot token is stored only in your <b>private</b> job-radar repo.</p>
    </div>
    <div class="save-bar"><button type="button" class="btn" id="tgTest">Send test message</button><button class="btn btn-primary" type="submit">${ico('save')} Save</button></div>
  </form>`;
  const form = $('#tgf');
  const collect = () => {
    const fd = new FormData(form);
    return { ...RS.cfg.telegram, enabled: form.enabled.checked, botToken: String(fd.get('botToken') || '').trim(), chatId: String(fd.get('chatId') || '').trim(),
      minScore: Number(fd.get('minScore')) || 55, maxPerRun: Number(fd.get('maxPerRun')) || 8, adminUrl: location.origin + location.pathname + '#jobs' };
  };
  const persist = async () => { const next = { ...RS.cfg, telegram: collect() }; await radarCommit('Job radar: update Telegram settings', [{ path: 'config.json', content: next }]); RS.cfg = next; dirty = false; };
  form.addEventListener('input', () => (dirty = true));
  form.addEventListener('submit', async e => { e.preventDefault(); try { await persist(); } catch (_) {} });
  $('#findChat').onclick = async () => {
    const token = form.botToken.value.trim();
    if (!token) return toast('Paste the bot token first', 'err');
    const url = `https://api.telegram.org/bot${token}/getUpdates`;
    try {
      const d = await (await fetch(url)).json();
      const ids = (d.result || []).map(u => (u.message || u.my_chat_member || u.channel_post || {}).chat).filter(Boolean);
      if (!d.ok) throw new Error(d.description || 'Invalid token');
      if (!ids.length) { $('#chatHint').textContent = 'No messages yet — open your bot in Telegram, press Start, then try again.'; return; }
      form.chatId.value = ids[ids.length - 1].id; dirty = true;
      $('#chatHint').textContent = `Found chat: ${ids[ids.length - 1].first_name || ids[ids.length - 1].title || ''} ✓`;
    } catch (err) {
      if (err instanceof TypeError) { // browser blocked the request — show the page instead
        window.open(url, '_blank', 'noopener');
        $('#chatHint').innerHTML = 'A new tab opened. Find <code>"chat":{"id":<b>123456789</b></code> and paste that number here.';
      } else toast(err.message, 'err');
    }
  };
  $('#tgTest').onclick = async () => {
    const t2 = collect();
    if (!t2.botToken || !t2.chatId) return toast('Fill bot token and chat ID first', 'err');
    try {
      await persist();
      const started = Date.now();
      await dispatchRadar('telegram-test');
      toast('Sending test message via GitHub — check Telegram in about 1 minute');
      const r = await waitForRun(started);
      if (r && r.conclusion === 'success') toast('Test message sent ✓ — check Telegram');
      else if (r) toast('Test failed — check the bot token / chat ID (details: job-radar repo → Actions)', 'err');
    } catch (err) { toast(err.status === 403 ? 'Your access key needs "Actions: Read and write" for the job-radar repo.' : err.message, 'err'); }
  };
}

/* ---------- Setup / install ---------- */
function radarSetup(body) {
  const repoName = CFG.radarRepo || RADAR_REPO_DEFAULT;
  const ok = !RS.error && RADAR;
  body.innerHTML = `
    ${RS.error ? `<div class="banner">${esc(RS.error)}</div>` : ''}
    ${ok && !RADAR.isPrivate ? `<div class="banner">⚠ "${esc(repoName)}" is PUBLIC — anyone could see your job search. Make it private: repo → Settings → Danger zone → Change visibility.</div>` : ''}
    <div class="panel">
      <h2>One-time setup (5 minutes)</h2>
      <ol class="steps">
        <li><b>Create a private repo</b> named <code>${esc(repoName)}</code>: <a href="https://github.com/new?name=${enc(repoName)}&visibility=private&description=${enc('My private job radar')}" target="_blank" rel="noopener" style="color:var(--cyan)">open GitHub → New repository</a>.
          Choose <b>Private</b> and tick <b>Add a README file</b>, then <b>Create repository</b>. ${ok ? '<span class="chip game">Found ✓</span>' : ''}</li>
        <li><b>Give your access key access to it:</b> <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener" style="color:var(--cyan)">GitHub → Settings → Developer settings → Fine-grained tokens</a> → open your token → <b>Edit</b>.
          Under <i>Repository access</i> also select <code>${esc(repoName)}</code>. Under <i>Repository permissions</i> set
          <b>Contents: Read and write</b>, <b>Workflows: Read and write</b> and <b>Actions: Read and write</b> → <b>Update</b>. (Same key, nothing to paste again.)</li>
        <li><b>Install the radar</b> with the button below. ${RS.exists.script ? '<span class="chip game">Installed ✓</span>' : ''}</li>
        <li>Fill <a href="#jobs/settings" style="color:var(--cyan)">Search profile</a> (add the free Adzuna key for India/city search) and <a href="#jobs/telegram" style="color:var(--cyan)">Telegram</a>, then click <b>Scan now</b>.</li>
      </ol>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
        <button class="btn btn-primary" id="installBtn" ${ok ? '' : 'disabled'}>${ico('upload')} ${RS.exists.script ? 'Update radar' : 'Install radar'}</button>
        <button class="btn" id="recheck">↻ Check again</button>
      </div>
    </div>
    <div class="panel">
      <h2>Private repo name</h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
        <div class="field" style="margin:0;flex:1;min-width:200px"><label>Repository</label><input type="text" id="rrepo" value="${esc(repoName)}"></div>
        <button class="btn" id="saveRepo">Use this repo</button>
      </div>
    </div>
    <div class="panel">
      <h2>How it works</h2>
      <ul class="steps">
        <li>GitHub Actions in your private repo runs the radar <b>every 6 hours</b> (free: private repos get 2,000 minutes/month; this uses about 120).</li>
        <li>It searches Adzuna (by city & country) and Remotive, Remote OK, Himalayas, Arbeitnow (remote/international), scores every job against your skills, and saves <code>jobs.json</code>.</li>
        <li>New jobs above your minimum match are sent to Telegram. Your saved / applied / hidden list is stored in <code>status.json</code>.</li>
        <li>LinkedIn, Naukri and Indeed can't be read automatically (they don't allow it) — the Jobs tab gives you one-click searches for them.</li>
      </ul>
    </div>`;
  $('#recheck').onclick = () => viewJobs($('#main'), 'setup');
  $('#saveRepo').onclick = () => { CFG.radarRepo = $('#rrepo').value.trim() || RADAR_REPO_DEFAULT; store.set('pv_cfg', JSON.stringify(CFG)); RADAR = null; viewJobs($('#main'), 'setup'); };
  $('#installBtn').onclick = async () => {
    try {
      loading(true, 'Installing', .3, 'Downloading radar files');
      const [script, wf] = await Promise.all(['radar/radar.mjs', 'radar/radar.yml'].map(p => fetch(p + '?v=' + Date.now(), { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('Could not load ' + p); return r.text(); })));
      const files = [
        { path: 'radar.mjs', content: script },
        { path: '.github/workflows/radar.yml', content: wf },
        { path: 'README.md', content: `# Job Radar (private)\n\nManaged from the portfolio admin panel (Job Radar).\n\n- \`config.json\` – search profile & Telegram settings\n- \`jobs.json\` – results (updated every 6 hours by GitHub Actions)\n- \`status.json\` – saved / applied / hidden jobs\n\nKeep this repository **private**.\n` }
      ];
      if (!RS.exists.config) files.push({ path: 'config.json', content: { ...RS.cfg, version: RADAR_VERSION } });
      files.push({ path: 'status.json', content: RS.status });
      await radarCommit(RS.exists.script ? 'Job radar: update' : 'Job radar: install', files);
      toast('Radar installed ✓ — now fill Search profile and Telegram');
      location.hash = 'jobs/settings';
    } catch (err) {
      loading(false);
      toast(/workflow/i.test(err.raw || err.message) || err.status === 404
        ? 'GitHub refused to add the workflow file — give your access key "Workflows: Read and write" for the job-radar repo (step 2).'
        : err.message, 'err');
    }
  };
}

/* Sidebar badge with the number of new jobs (quiet, ignores errors) */
async function radarPeek() {
  try {
    await radarClient();
    const jobs = await readOr('jobs.json', null);
    const status = await readOr('status.json', { hidden: [] });
    const seen = Number(store.get('pv_jobs_seen') || 0);
    const n = jobs && seen ? jobs.jobs.filter(j => new Date(j.firstSeen || j.posted).getTime() > seen && !(status.hidden || []).includes(j.id)).length : 0;
    const pill = $('#jobsPill'); if (pill) { pill.hidden = !n; pill.textContent = n; }
  } catch (_) {}
}
