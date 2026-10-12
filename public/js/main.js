/* Home page */
let ALL = [];
let state = { type: 'all', q: '' };

const SOCIAL_LABEL = { github: 'GitHub', linkedin: 'LinkedIn', youtube: 'YouTube', twitter: 'X / Twitter', instagram: 'Instagram', playstore: 'Google Play', assetstore: 'Unity Asset Store', itch: 'itch.io' };
const SOCIAL_ICON = { github: 'github', linkedin: 'linkedin', youtube: 'youtube', twitter: 'twitter', instagram: 'instagram', playstore: 'googleplay', assetstore: 'unity', itch: 'itch' };

function renderProfile(p) {
  setBrand(p);
  document.title = `${p.name} — ${p.role || 'Unity Developer'} | ${p.brand}`;
  $('#heroName').textContent = p.name;
  $('#heroRole').textContent = p.role || 'Unity Developer';
  $('#heroTagline').textContent = p.tagline || '';
  $('#status').classList.toggle('off', !p.available);
  $('#statusText').textContent = p.available ? 'Available for freelance work' : 'Currently busy on projects';

  const stage = $('#avatarStage');
  const el = document.createElement(p.avatar ? 'img' : 'div');
  if (p.avatar) { el.src = p.avatar; el.alt = p.name; } else { el.className = 'avatar-fallback'; el.textContent = (p.name || 'U').charAt(0).toUpperCase(); }
  stage.appendChild(el);

  $('#fYears').textContent = (p.experienceYears || 0) + '+';
  $('#aboutText').innerHTML = (p.about || '').split(/\n{2,}/).map(par => `<p>${esc(par).replace(/\n/g, '<br>')}</p>`).join('');

  const skills = p.skills || [];
  $('#skillsList').innerHTML = skills.map(s => `<span class="skill">${esc(s)}</span>`).join('');
  const words = skills.length ? skills : ['Unity', 'C#'];
  const strip = words.map(s => `<span>${esc(s)}</span>`).join('');
  $('#marquee').innerHTML = strip + strip + strip + strip;

  const contacts = [];
  if (p.email) contacts.push(`<a href="mailto:${esc(p.email)}">${ICONS.mail}${esc(p.email)}</a>`);
  if (p.phone) contacts.push(`<a href="tel:${esc(p.phone.replace(/\s/g, ''))}">${ICONS.phone}${esc(p.phone)}</a>`);
  if (p.location) contacts.push(`<div>${ICONS.pin}${esc(p.location)}</div>`);
  $('#contactList').innerHTML = contacts.join('');

  $('#socials').innerHTML = Object.entries(p.socials || {})
    .filter(([, url]) => url)
    .map(([k, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${SOCIAL_LABEL[k]}" title="${SOCIAL_LABEL[k]}">${ICONS[SOCIAL_ICON[k]]}</a>`)
    .join('');
}

function countUp(el, to) {
  const dur = 900, start = performance.now();
  const step = t => { const k = Math.min(1, (t - start) / dur); el.textContent = fmtNum(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

function renderFeatured() {
  const f = ALL.find(p => p.featured);
  const box = $('#featured');
  if (!f) { box.innerHTML = ''; return; }
  const color = { game: 'var(--c-game)', plugin: 'var(--c-plugin)', asset: 'var(--c-asset)' }[f.type];
  box.innerHTML = `
    <a class="featured reveal in" href="/project/${encodeURIComponent(f.slug)}">
      <div class="featured-media">${f.cover ? `<img src="${esc(f.cover)}" alt="">` : ''}</div>
      <div class="featured-body">
        <span class="featured-label">★ Featured ${esc(TYPE_LABEL[f.type])}</span>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.shortDescription || '')}</p>
        ${(f.tags || []).length ? `<div class="tags">${f.tags.slice(0, 5).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
        <span class="btn" style="align-self:flex-start;border-color:${color};color:${color}">View project ${ICONS.arrow}</span>
      </div>
    </a>`;
}

function renderGrid() {
  const q = state.q.toLowerCase();
  const items = ALL.filter(p =>
    (state.type === 'all' || p.type === state.type) &&
    (!q || [p.title, p.shortDescription, ...(p.tags || []), ...(p.platforms || [])].join(' ').toLowerCase().includes(q))
  );
  const grid = $('#grid');
  if (!items.length) {
    const what = state.type === 'all' ? 'projects' : TYPE_LABEL[state.type].toLowerCase() + 's';
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><b>No ${esc(what)} yet</b>${q ? 'Try a different search.' : 'New work is coming soon — check back!'}</div>`;
    return;
  }
  grid.innerHTML = items.map(projectCard).join('');
}

function setCounts() {
  const c = t => ALL.filter(p => p.type === t).length;
  $('#cAll').textContent = ALL.length;
  $('#cGame').textContent = c('game');
  $('#cPlugin').textContent = c('plugin');
  $('#cAsset').textContent = c('asset');
  $('#fProjects').textContent = ALL.length;
}

async function init() {
  initNav();
  $('#searchIcon').outerHTML = ICONS.search;
  $$('[data-icon]').forEach(el => (el.innerHTML = ICONS[el.dataset.icon]));

  // Tab from URL hash e.g. /#games
  const hashType = { '#games': 'game', '#plugins': 'plugin', '#assets': 'asset' }[location.hash];
  if (hashType) state.type = hashType;

  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    state.type = tab.dataset.type;
    $$('.tab').forEach(t => t.classList.toggle('active', t === tab));
    renderGrid();
  }));
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.type === state.type));
  let tm;
  $('#search').addEventListener('input', e => { clearTimeout(tm); tm = setTimeout(() => { state.q = e.target.value.trim(); renderGrid(); }, 150); });

  $('#contactForm').addEventListener('submit', async e => {
    e.preventDefault();
    const note = $('#formNote'), btn = e.target.querySelector('button');
    btn.disabled = true; note.className = 'form-note'; note.textContent = 'Sending…';
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      note.className = 'form-note ok'; note.textContent = 'Thanks! Your message has been sent.';
      e.target.reset();
    } catch (err) { note.className = 'form-note err'; note.textContent = err.message || 'Something went wrong.'; }
    btn.disabled = false;
  });

  try {
    const [profile, projects, stats] = await Promise.all([api('/api/profile'), api('/api/projects'), api('/api/stats')]);
    renderProfile(profile);
    ALL = projects;
    setCounts(); renderFeatured(); renderGrid();
    countUp($('#sGames'), stats.games); countUp($('#sPlugins'), stats.plugins);
    countUp($('#sAssets'), stats.assets); countUp($('#sDownloads'), stats.downloads);
  } catch (err) {
    $('#grid').innerHTML = `<div class="empty" style="grid-column:1/-1"><b>Could not load projects</b>${esc(err.message)}</div>`;
  }
  initReveal();
}
init();
