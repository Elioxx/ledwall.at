// Konfigurator: Formular → cfg → buildPackage() → Vorschau, Preis, Packliste, Anfrage.
// URL-Parameter (env, pitch, w, h, mount, cases) füllen das Formular vor (Links von den Paket-Karten).
// Hängt ab von: data.js, calc.js, ledwall.js

(function () {
  const $ = id => document.getElementById(id);
  const cfg = { env: 'indoor', pitch: 2.97, w: 4, h: 2, mount: 'hang', cases: true, service: false };
  let distance = 3;
  let pitchManual = false;   // true, sobald der Nutzer selbst einen Pitch wählt
  let wall = null;
  const HUMAN_M = 1.7;

  // — Vorbelegung aus URL —
  const q = new URLSearchParams(location.search);
  if (SERIES[q.get('env')]) cfg.env = q.get('env');
  if (q.get('w')) cfg.w = snapSize(Math.min(12, Number(q.get('w')) || 4));
  if (q.get('h')) cfg.h = snapSize(Math.min(6, Number(q.get('h')) || 2));
  if (MOUNTS[q.get('mount')]) cfg.mount = q.get('mount');
  if (q.has('cases')) cfg.cases = q.get('cases') === '1';
  if (q.get('pitch') && pitchInfo(cfg.env, q.get('pitch'))) {
    cfg.pitch = Number(q.get('pitch'));
    pitchManual = true;
    distance = Math.max(1, Math.round(cfg.pitch * 2) / 2);
  } else {
    cfg.pitch = recommendPitch(cfg.env, distance);
  }

  // — Formular mit Startwerten füllen —
  document.querySelector(`input[name=env][value=${cfg.env}]`).checked = true;
  $('dist').value = distance; $('w').value = cfg.w; $('h').value = cfg.h;
  $('cases').checked = cfg.cases;
  $('serviceHint').textContent = `Wir bauen die Wand gemeinsam mit dir auf und erklären die Bedienung. ${fmtEur(EXTRAS.service.price)} netto.`;

  $('mountChoice').insertAdjacentHTML('beforeend', Object.entries(MOUNTS).map(([key, m]) =>
    `<label><input type="radio" name="mount" value="${key}"${key === cfg.mount ? ' checked' : ''}><span><b>${m.label}</b><small>${m.desc}</small></span></label>`
  ).join(''));

  function renderPitchChoice() {
    const rec = recommendPitch(cfg.env, distance);
    const box = $('pitchChoice');
    box.querySelectorAll('label').forEach(l => l.remove());
    box.insertAdjacentHTML('beforeend', SERIES[cfg.env].pitches.map(p =>
      `<label><input type="radio" name="pitch" value="${p.pitch}"${p.pitch === cfg.pitch ? ' checked' : ''}>
        <span><b>P${fmtNum(p.pitch)}</b><small>ab ${fmtNum(p.pitch, 1)} m Abstand · ${fmtEur(p.price)}/m²</small>${p.pitch === rec ? '<em>Empfohlen für deinen Abstand</em>' : ''}</span></label>`
    ).join(''));
    const hint = $('pitchHint');
    if (cfg.pitch > distance + 0.1) {
      hint.textContent = `Bei ${fmtNum(distance)} m Abstand sind mit P${fmtNum(cfg.pitch)} einzelne Bildpunkte erkennbar. Für ein geschlossenes Bild eignet sich P${fmtNum(rec)}.`;
    } else if (cfg.pitch < rec) {
      hint.textContent = `P${fmtNum(cfg.pitch)} ist feiner als für ${fmtNum(distance)} m nötig. Das Bild wird schärfer, mit P${fmtNum(rec)} sparst du aber Geld.`;
    } else {
      hint.textContent = 'Je kleiner die Zahl, desto dichter sitzen die LEDs und desto näher kann man herangehen.';
    }
  }

  function renderPreview(r) {
    const stage = $('pvStage');
    const cs = getComputedStyle(stage);
    const availH = stage.clientHeight - parseFloat(cs.paddingTop);
    const gap = parseFloat(cs.columnGap) || 12;
    const availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const humanRatio = 318 / 1118;
    // Maßstab: Wand + Figur müssen in Höhe und Breite passen
    const scale = Math.min(
      availH / Math.max(r.h, HUMAN_M),
      (availW - gap) / (r.w + HUMAN_M * humanRatio)
    );
    $('pvWall').style.width = Math.floor(r.w * scale) + 'px';
    $('pvHuman').style.height = Math.floor(HUMAN_M * scale) + 'px';
    $('pvHuman').style.width = Math.floor(HUMAN_M * scale * humanRatio) + 'px';
    const opts = { cols: r.cols, rows: r.rows, seams: true };
    if (wall) wall.update(opts); else wall = mountLedWall($('pvCanvas'), opts);
    $('pvSize').textContent = `${fmtNum(r.w)} × ${fmtNum(r.h)} m · ${r.cabinets} Cabinets · P${fmtNum(r.pitch)}`;
  }

  function renderSummary(r) {
    $('sumPrice').textContent = fmtEur(r.net);
    $('barPrice').textContent = fmtEur(r.net);
    $('sumGross').textContent = `${fmtEur(r.gross)} inkl. 20 % USt.`;
    $('sumFacts').innerHTML = [
      ['Fläche', `${fmtNum(r.area)} m²`],
      ['Diagonale', `${fmtInt(r.diagonalInch)} Zoll`],
      ['Auflösung', `${fmtInt(r.pxW)} × ${fmtInt(r.pxH)}`],
      ['Format', ratioLabel(r.w, r.h)],
      ['Gewicht', `${fmtInt(r.weight)} kg`],
      ['Strom max.', `${fmtNum(r.powerMax / 1000, 1)} kW`],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  }

  function renderSlip(r) {
    $('slipTitle').textContent = `LED-Wand ${fmtNum(r.w)} × ${fmtNum(r.h)} m, ${r.series.label} P${fmtNum(r.pitch)}`;
    $('slipMeta').textContent = `${fmtInt(r.pxW)} × ${fmtInt(r.pxH)} Pixel · ${fmtInt(r.weight)} kg`;
    $('slipBody').innerHTML = r.items.map(i =>
      `<tr><td>${i.qty}<span class="unit"> ${i.unit}</span></td><td>${i.name}<small>${i.note}</small></td><td>${i.price ? fmtEur(i.price) : 'inklusive'}</td></tr>`
    ).join('');
    $('slipFoot').innerHTML = `
      <tr><td></td><td>Summe netto</td><td>${fmtEur(r.net)}</td></tr>
      <tr><td></td><td>zuzüglich 20 % USt.</td><td>${fmtEur(r.vat)}</td></tr>
      <tr><td></td><td>Summe brutto</td><td>${fmtEur(r.gross)}</td></tr>`;
    $('warnings').innerHTML = r.warnings.map(w => `<p class="warn">${w}</p>`).join('');
  }

  function render() {
    const r = buildPackage(cfg);
    $('distOut').textContent = fmtNum(distance) + ' m';
    $('wOut').textContent = fmtNum(cfg.w) + ' m';
    $('hOut').textContent = fmtNum(cfg.h) + ' m';
    renderPitchChoice();
    renderPreview(r);
    renderSummary(r);
    renderSlip(r);
    return r;
  }

  // — Ereignisse —
  const form = $('kfForm');
  form.addEventListener('input', e => {
    const t = e.target;
    if (t.name === 'env') {
      cfg.env = t.value;
      pitchManual = false;
      cfg.pitch = recommendPitch(cfg.env, distance);
    } else if (t.id === 'dist') {
      distance = Number(t.value);
      if (!pitchManual) cfg.pitch = recommendPitch(cfg.env, distance);
    } else if (t.name === 'pitch') {
      cfg.pitch = Number(t.value);
      pitchManual = cfg.pitch !== recommendPitch(cfg.env, distance);
    } else if (t.id === 'w') cfg.w = Number(t.value);
    else if (t.id === 'h') cfg.h = Number(t.value);
    else if (t.name === 'mount') cfg.mount = t.value;
    else if (t.id === 'cases') cfg.cases = t.checked;
    else if (t.id === 'service') cfg.service = t.checked;
    else return;   // Kontaktfelder lösen kein Neuzeichnen aus
    const keepFocus = t.name === 'pitch' ? t.value : null;
    render();
    if (keepFocus) { const el = form.querySelector(`input[name=pitch][value="${keepFocus}"]`); if (el) el.focus(); }
  });

  $('printBtn').addEventListener('click', () => window.print());
  $('linkBtn').addEventListener('click', async () => {
    const url = location.origin + location.pathname + '?' + configQuery(cfg);
    const btn = $('linkBtn');
    try { await navigator.clipboard.writeText(url); btn.textContent = 'Link kopiert'; }
    catch { prompt('Link zu dieser Wand:', url); }
    setTimeout(() => { btn.textContent = 'Link zu dieser Wand kopieren'; }, 2500);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const err = $('formError');
    const name = $('fName').value.trim(), email = $('fEmail').value.trim();
    if (!name || !$('fEmail').checkValidity() || !email) {
      err.textContent = 'Bitte gib deinen Namen und eine gültige E-Mail-Adresse an, damit wir dir das Angebot schicken können.';
      err.hidden = false;
      (name ? $('fEmail') : $('fName')).focus();
      return;
    }
    err.hidden = true;
    const r = buildPackage(cfg);
    const lines = [
      `Anfrage: LED-Wand ${fmtNum(r.w)} × ${fmtNum(r.h)} m, ${r.series.label} P${fmtNum(r.pitch)}`,
      '',
      'Packliste',
      ...r.items.map(i => `- ${i.qty} ${i.unit} ${i.name}: ${i.price ? fmtEur(i.price) : 'inklusive'}`),
      '',
      `Summe netto: ${fmtEur(r.net)}`,
      `Summe brutto: ${fmtEur(r.gross)}`,
      '',
      `Name: ${name}`,
      `Firma/Verein: ${$('fCompany').value.trim() || '-'}`,
      `E-Mail: ${email}`,
      `Telefon: ${$('fPhone').value.trim() || '-'}`,
      `Lieferort: ${$('fPlace').value.trim() || '-'}`,
      `Anmerkung: ${$('fMsg').value.trim() || '-'}`,
      '',
      `Konfiguration: ${location.origin + location.pathname}?${configQuery(cfg)}`,
    ];
    const subject = `Anfrage LED-Wand ${fmtNum(r.w)} × ${fmtNum(r.h)} m P${fmtNum(r.pitch)}`;
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    $('formNote').textContent = `Dein E-Mail-Programm sollte sich jetzt öffnen. Falls nicht, schreib uns direkt an ${SITE.email}.`;
  });

  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(render, 150); });
  render();
})();
