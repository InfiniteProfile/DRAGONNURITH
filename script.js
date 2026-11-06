'use strict';
const $ = s => document.querySelector(s);
const M64 = (1n << 64n) - 1n, PAGE = 30, BATCH = 300, FIRST = 360;

/* ---------- Data tables ---------- */
const SP = ['Fire|fire|14|42','Ice|ice|195|220','Crystal|crystal|280|180','Moon|moonlight|250|210','Star|starlight|48|290','Emerald|nature|140|165','Shadow|shadow|265|300','Rainbow|rainbow|320|60','Celestial|celestial|215|275','Ocean|water|200|170','Lightning|lightning|55|190','Golden|sunlight|42|30','Amber|honey|32|50','Coral|tide|8|340','Aurora|aurora|160|290','Mist|mist|190|230','Blossom|petal|330|120','Thunder|storm|235|45','Opal|opal|300|170','Ember|cinder|5|28','Dream|dream|285|320','Sunstone|sunfire|25|55'].map(x => { const a = x.split('|'); return { n: a[0] + ' Dragon Baby', e: a[1], h1: +a[2], h2: +a[3] }; });
const PRE = 'Aeri Bru Cin Dru Ela Fiz Gli Hol Ily Jun Kae Lum Mir Nyx Oli Pip Qui Rhy Sol Tam Umi Vel Wyn Xen Yor Zel Ash Bly Cor Dew Eri Fyn Gem Hex Ivo Juo Kip Lor Mox Nim'.split(' ');
const SUF = 'ra lo ix wyn bit ara eth ium ik lia mon ni os py rin sa thy uu vi zo'.split(' ');
const EPI = 'Starwhisper Moonpaw Glimmertail Embersnout Dewdrop Cloudpuff Sparkscale Wingletop Snugscale Brightclaw Honeyhorn Twinklefin Mistwing Pebblesnoot Fluffscale Gleamtoe Sunnyhorn Dreamtail Frostnib Nightlily'.split(' ');
const PER = 'Curious Playful Sleepy Gentle Mischievous Shy Brave Affectionate Dreamy Cheerful Clumsy Giggly Loyal Adventurous Cuddly Whimsical'.split(' ');
const AB = ['sneezes tiny {e} sparkles','hums {e} lullabies that calm storms','paints glowing {e} trails across the sky','hiccups bursts of {e} light','wraps friends in a warm {e} shimmer','whispers to the {e} spirits of the old forest','blows {e}-tinted bubbles that float for hours','conjures a tiny {e} shield when frightened','sprouts glowing flowers with every {e} yawn','guides lost travelers with a {e} glow','lights up the dark with a {e} giggle','turns puddles into mirrors of {e} stars'];
const HAB = ['a glowing mushroom hollow','the Crystal Caverns of Vael','a moss-covered moon temple','the Whispering Pine Hills','a floating cloud garden','the Starfall Meadow','a warm volcano nursery','the Frostglass Cliffs','a sleepy tide pool','the Lantern Marsh','an enchanted birch grove','the Aurora Ridge','a hidden waterfall cave','the Opal Dunes','a hollow giant oak','the Thunderbloom Plains','a sunlit amber canyon','the Dreamveil Mist','a lakeside reed nest','the Ember Orchard'];
const GEN = ['Girl','Boy','Star-spirit','Moonkin','Cloudling','Egg-sprite'];
const AGE = ['1 day old','2 days old','3 days old','4 days old','5 days old','6 days old','7 days old','9 days old','12 days old','2 weeks old','3 weeks old'];
const INTRO = ['{n} is a {p} {s} who lives in {h}.','Found near {h}, {n} is a {p} {s} with a very big heart.','{n}, a {p} {s}, hatched in {h} and has been giggling ever since.','Everyone in {h} knows {n}, the {p} {s}.'];
const CL = ['Its tiny wings flutter whenever someone says hello.','It falls asleep curled around its favorite shiny pebble.','Every night it counts the stars and always loses count.','It follows the nest-keepers everywhere, squeaking happily.','Its tail wags when it hears music.','It collects glowing feathers and hides them in its nest.','It is still learning to fly, and does not mind falling into soft moss.','It hugs its egg shell like a favorite blanket.','Visitors leave with a warm, sparkly feeling.','It chases fireflies and sometimes catches its own tail instead.','Its first roar sounds exactly like a kitten sneeze.','It dreams of the sky it has not yet seen.'];
const cap = s => s[0].toUpperCase() + s.slice(1);

/* ---------- Deterministic profile generation (BigInt IDs) ---------- */
function mix(n) {
  let z = (n + 0x9E3779B97F4A7C15n) & M64;
  z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & M64;
  z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & M64;
  return z ^ (z >> 31n);
}
function prof(n) { // n: BigInt >= 1
  let h = mix(n);
  const pk = k => { const b = BigInt(k), v = Number(h % b); h /= b; return v; };
  const blk = n / 16000n, m = Number((n % 16000n) * 7919n % 16000n); // bijective inside each 16000 block
  let name = PRE[m % 40] + SUF[((m / 40) | 0) % 20] + ' ' + EPI[(m / 800) | 0];
  if (blk > 0n) name += ' ' + (blk + 1n);
  const sp = SP[pk(SP.length)], per = PER[pk(PER.length)], hab = HAB[pk(HAB.length)], age = AGE[pk(AGE.length)], gen = GEN[pk(GEN.length)];
  const ab = cap(AB[pk(AB.length)].replace('{e}', sp.e)), r = pk(100);
  const rar = r < 45 ? 'Common' : r < 70 ? 'Uncommon' : r < 86 ? 'Rare' : r < 95 ? 'Epic' : r < 99 ? 'Legendary' : 'Mythic';
  const sc = pk(8), wing = pk(2), mark = pk(3), sleep = pk(4) == 0 || per == 'Sleepy';
  const bio = INTRO[pk(INTRO.length)].replace('{n}', name).replace('{p}', per.toLowerCase()).replace('{s}', sp.n).replace('{h}', hab) + ' ' + name.split(' ')[0] + ' ' + ab.charAt(0).toLowerCase() + ab.slice(1) + '. ' + CL[pk(CL.length)];
  const id = 'DN-' + n.toString().padStart(6, '0');
  return { id, name, sp: sp.n, el: cap(sp.e), per, ab, hab, age, gen, rar, bio,
    a: { h1: sp.h1, h2: sp.h2, sc, wing, mark, sleep, seed: Number(mix(n + 777n) & 0xFFFFFFFFn) },
    s: (id + ' ' + name + ' ' + sp.n + ' ' + sp.e + ' ' + per + ' ' + ab + ' ' + gen + ' ' + hab + ' ' + rar + ' ' + age).toLowerCase() };
}
const byId = id => prof(BigInt(id.slice(3)));

/* ---------- Artwork: unique inline SVG per dragon ---------- */
function art(p) {
  const a = p.a, h1 = a.h1, h2 = a.h2, sc = a.sc; let r = a.seed;
  const R = () => (r = (Math.imul(r, 1664525) + 1013904223) >>> 0) / 4294967296;
  const c1 = `hsl(${h1},85%,62%)`, c2 = `hsl(${h2},90%,68%)`, dk = `hsl(${h1},55%,16%)`, gl = `hsl(${h2},100%,75%)`;
  let s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 160'><defs><radialGradient id='g' cx='50%' cy='35%' r='80%'><stop offset='0' stop-color='hsl(${h1},50%,26%)'/><stop offset='1' stop-color='#070516'/></radialGradient></defs><rect width='200' height='160' fill='url(#g)'/>`;
  for (let i = 0; i < 16; i++) s += `<circle cx='${R() * 200 | 0}' cy='${R() * 110 | 0}' r='${(R() * 1.3 + .4).toFixed(1)}' fill='#fff' opacity='${(R() * .6 + .3).toFixed(2)}'/>`;
  if (sc == 1) s += `<g fill='${gl}' opacity='.55'><path d='M52,150L64,112L78,150Z'/><path d='M118,150L136,100L156,150Z'/><path d='M86,150L98,128L112,150Z' opacity='.7'/></g>`;
  if (sc == 2) for (let i = 0; i < 6; i++) { const x = 14 + R() * 172 | 0, y = 14 + R() * 70 | 0; s += `<path d='M${x},${y - 6}L${x + 1.6},${y - 1.6}L${x + 6},${y}L${x + 1.6},${y + 1.6}L${x},${y + 6}L${x - 1.6},${y + 1.6}L${x - 6},${y}L${x - 1.6},${y - 1.6}Z' fill='${gl}'/>`; }
  if (sc == 4) { s += `<g fill='hsl(150,60%,15%)'><path d='M14,150L34,70L54,150Z'/><path d='M150,150L170,58L190,150Z'/><path d='M130,150L146,92L162,150Z'/></g>`; for (let i = 0; i < 5; i++) s += `<circle cx='${R() * 200 | 0}' cy='${60 + R() * 80 | 0}' r='1.8' fill='#ffec8a'/>`; }
  if (sc == 6) s += `<circle cx='162' cy='30' r='14' fill='${gl}' opacity='.35'/>`;
  if (sc == 7) s += `<circle cx='100' cy='100' r='62' fill='none' stroke='${gl}' stroke-width='2' opacity='.45'/>`;
  if (sc == 0) s += `<ellipse cx='100' cy='116' rx='46' ry='42' fill='hsl(${h2},40%,30%)'/>`;
  else s += `<ellipse cx='100' cy='152' rx='58' ry='7' fill='#000' opacity='.3'/>`;
  const wing = m => `<path d='M${100 - m * 22},106Q${100 - m * 68},62 ${100 - m * 52},46Q${100 - m * 44},78 ${100 - m * 26},92Z' fill='${c2}' opacity='.85'/>`;
  if (a.wing || sc == 3) s += wing(1) + wing(-1);
  s += `<path d='M122,128Q158,132 160,108Q150,118 132,116Z' fill='${c1}'/><ellipse cx='100' cy='122' rx='29' ry='25' fill='${c1}'/><ellipse cx='100' cy='128' rx='17' ry='17' fill='hsl(${h1},90%,85%)'/><ellipse cx='84' cy='146' rx='10' ry='5' fill='${c1}'/><ellipse cx='116' cy='146' rx='10' ry='5' fill='${c1}'/>`;
  if (a.mark == 1) s += `<path d='M73,112h9M72,120h9M119,112h9M119,120h9' stroke='${gl}' stroke-width='3' stroke-linecap='round' opacity='.8'/>`;
  s += `<path d='M80,62L74,40L92,56ZM120,62L126,40L108,56Z' fill='${c2}'/><circle cx='100' cy='80' r='27' fill='${c1}'/><ellipse cx='100' cy='91' rx='11' ry='8' fill='hsl(${h1},80%,74%)'/><circle cx='96' cy='90' r='1.2' fill='${dk}'/><circle cx='104' cy='90' r='1.2' fill='${dk}'/><path d='M94,96Q100,101 106,96' stroke='${dk}' stroke-width='1.6' fill='none' stroke-linecap='round'/><circle cx='80' cy='92' r='4.5' fill='#ff9ec4' opacity='.5'/><circle cx='120' cy='92' r='4.5' fill='#ff9ec4' opacity='.5'/>`;
  if (a.sleep) s += `<path d='M82,78Q88,84 94,78M106,78Q112,84 118,78' stroke='${dk}' stroke-width='2.5' fill='none' stroke-linecap='round'/>`;
  else for (const x of [88, 112]) s += `<circle cx='${x}' cy='78' r='${sc == 6 ? 10 : 8}' fill='${gl}' opacity='.35'/><circle cx='${x}' cy='78' r='6' fill='#fff'/><circle cx='${x}' cy='78' r='3.8' fill='${gl}'/><circle cx='${x}' cy='78' r='2' fill='${dk}'/><circle cx='${x + 1.5}' cy='76' r='1' fill='#fff'/>`;
  if (a.mark == 0) s += `<g fill='${gl}'><circle cx='100' cy='63' r='2'/><circle cx='93' cy='66' r='1.6'/><circle cx='107' cy='66' r='1.6'/></g>`;
  if (a.mark == 2) s += `<path d='M92,66L100,72L108,66' stroke='${gl}' stroke-width='2.2' fill='none' stroke-linecap='round'/>`;
  if (sc == 0) s += `<path d='M54,116l11.5,-12l11.5,12l11.5,-12l11.5,12l11.5,-12l11.5,12l11.5,-12l11.5,12A46 42 0 0 1 54 116Z' fill='hsl(${h2},45%,52%)'/><circle cx='80' cy='134' r='3' fill='${gl}' opacity='.6'/><circle cx='118' cy='140' r='2.5' fill='${gl}' opacity='.6'/>`;
  if (sc == 5) s += `<g fill='#fff' opacity='.88'><ellipse cx='60' cy='146' rx='32' ry='13'/><ellipse cx='110' cy='152' rx='38' ry='12'/><ellipse cx='150' cy='144' rx='28' ry='12'/></g>`;
  return 'data:image/svg+xml,' + encodeURIComponent(s + '</svg>');
}

/* ---------- Favorites ---------- */
let favs = new Set();
try { favs = new Set(JSON.parse(localStorage.getItem('dn_favs') || '[]')); } catch (e) {}
const saveFavs = () => { try { localStorage.setItem('dn_favs', JSON.stringify([...favs])); } catch (e) {} };
const favLabel = on => on ? '♥ Saved' : '♡ Save';

/* ---------- Cards ---------- */
function card(p) {
  const on = favs.has(p.id);
  return `<article class="card"><img class="art" data-a="view" data-id="${p.id}" src="${art(p)}" alt="${p.name}, ${p.sp}" loading="lazy" decoding="async"><div class="b"><div class="top"><h3>${p.name}</h3><span class="rar r-${p.rar}">${p.rar}</span></div><p class="sp">${p.sp} · ${p.age}</p><div class="chips"><span>${p.el}</span><span>${p.per}</span><span>${p.gen}</span></div><p class="ab">✨ ${p.ab}</p><p class="bio">${p.bio}</p><p class="id">${p.id}</p><div class="act"><button type="button" data-a="view" data-id="${p.id}">View</button><button type="button" data-a="fav" data-id="${p.id}" aria-pressed="${on}">${favLabel(on)}</button><button type="button" data-a="copy" data-id="${p.id}">Copy</button></div></div></article>`;
}

/* ---------- Infinite feed ---------- */
const feed = $('#feed'), res = $('#res'), G = [];
let nextN = 1n, cur = 0;
const cols = Math.max(1, Math.floor(innerWidth / 265)), EST = Math.ceil(PAGE / cols) * 450;

const io = new IntersectionObserver(es => {
  for (const e of es) {
    const p = e.target;
    if (e.isIntersecting) { draw(p); cur = Math.max(cur, +p.dataset.p); }
    else undraw(p);
  }
  ensure();
}, { rootMargin: '150% 0px' });

function draw(p) {
  if (p.dataset.r) return;
  const i = +p.dataset.p;
  p.innerHTML = G.slice(i * PAGE, i * PAGE + PAGE).map(card).join('');
  p.style.height = ''; p.dataset.r = '1';
}
function undraw(p) {
  if (!p.dataset.r || feed.hidden) return;
  const h = p.offsetHeight;
  if (h > 0) p.style.height = h + 'px';
  p.innerHTML = ''; p.dataset.r = '';
}
function addBatch(count) {
  const start = G.length;
  for (let i = 0; i < count; i++) G.push(prof(nextN++));
  for (let i = start / PAGE; i < G.length / PAGE; i++) {
    const d = document.createElement('section');
    d.className = 'page'; d.dataset.p = i; d.style.height = EST + 'px';
    feed.appendChild(d); io.observe(d);
  }
}
function ensure() { // keep at least ~200 profiles ahead of the reader; appends only, never moves scroll
  try { while (G.length - (cur + 1) * PAGE <= 200) addBatch(BATCH); }
  catch (e) { setTimeout(ensure, 500); }
}

addBatch(FIRST);
draw(feed.children[0]); draw(feed.children[1]);
setInterval(ensure, 2000);

/* ---------- Search & favorites view ---------- */
const q = $('#q'), favBtn = $('#favBtn'), dlg = $('#dlg');
let favMode = false, timer = 0;

function refresh() {
  const t = q.value.trim().toLowerCase();
  if (!t && !favMode) { feed.hidden = false; res.hidden = true; res.innerHTML = ''; return; }
  feed.hidden = true; res.hidden = false;
  const out = [], seen = new Set(), terms = t.split(/\s+/).filter(Boolean);
  const add = p => { if (!seen.has(p.id) && out.length < 120) { seen.add(p.id); out.push(p); } };
  const idm = /^(?:dn[-\s]?|#)?(\d+)$/.exec(t);
  if (idm && !favMode) { const n = BigInt(idm[1]); if (n > 0n) add(prof(n)); }
  if (favMode) { for (const id of favs) { const p = byId(id); if (terms.every(x => p.s.includes(x))) add(p); } }
  else for (let i = 0; i < G.length && out.length < 120; i++) if (terms.every(x => G[i].s.includes(x))) add(G[i]);
  res.innerHTML = out.length ? out.map(card).join('') : `<p class="msg">${favMode ? 'No favorites yet. Tap ♡ Save on any dragon.' : 'No dragons match. Try a name, species, element or an ID like DN-000042.'}</p>`;
}
q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(refresh, 100); });
favBtn.addEventListener('click', () => { favMode = !favMode; favBtn.setAttribute('aria-pressed', favMode); refresh(); });

/* ---------- Actions ---------- */
const toastEl = $('#toast'); let tt = 0;
function toast(m) { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 1800); }

function toggleFav(id) {
  favs.has(id) ? favs.delete(id) : favs.add(id);
  saveFavs();
  const on = favs.has(id);
  document.querySelectorAll('[data-a=fav]').forEach(b => { if (b.dataset.id === id) { b.setAttribute('aria-pressed', on); b.textContent = favLabel(on); } });
  $('#favN').textContent = favs.size;
  if (favMode) refresh();
}
async function copy(id) {
  const p = byId(id);
  const t = `${p.name} (${p.id})\n${p.sp} · ${p.age} · ${p.gen}\nElement: ${p.el}\nPersonality: ${p.per}\nAbility: ${p.ab}\nHabitat: ${p.hab}\nRarity: ${p.rar}\n${p.bio}`;
  let ok = false;
  try { await navigator.clipboard.writeText(t); ok = true; }
  catch (e) {
    try { const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e2) {}
  }
  toast(ok ? 'Profile copied' : 'Copy failed. Your browser blocked clipboard access.');
}
function openP(id) {
  const p = byId(id), on = favs.has(id);
  dlg.innerHTML = `<img class="art" src="${art(p)}" alt="${p.name}, ${p.sp}"><div class="b"><div class="top"><h2>${p.name}</h2><span class="rar r-${p.rar}">${p.rar}</span></div><p class="sp">${p.sp}</p><dl><div><dt>Age</dt><dd>${p.age}</dd></div><div><dt>Identity</dt><dd>${p.gen}</dd></div><div><dt>Element</dt><dd>${p.el}</dd></div><div><dt>Personality</dt><dd>${p.per}</dd></div><div><dt>Ability</dt><dd>${p.ab}</dd></div><div><dt>Habitat</dt><dd>${cap(p.hab)}</dd></div></dl><p class="bio">${p.bio}</p><p class="id">${p.id}</p><div class="act"><button type="button" data-a="fav" data-id="${p.id}" aria-pressed="${on}">${favLabel(on)}</button><button type="button" data-a="copy" data-id="${p.id}">Copy</button><button type="button" data-a="close">Close</button></div></div>`;
  dlg.showModal();
}
document.addEventListener('click', e => {
  if (e.target === dlg) return dlg.close();
  const b = e.target.closest('[data-a]'); if (!b) return;
  const a = b.dataset.a, id = b.dataset.id;
  if (a === 'view') openP(id); else if (a === 'fav') toggleFav(id); else if (a === 'copy') copy(id); else if (a === 'close') dlg.close();
});
$('#favN').textContent = favs.size;
