// Reine Rechenfunktionen: Pitch-Empfehlung, Paket-Zusammenstellung, Formatierung.
// Kein DOM. Hängt ab von: data.js

function snapSize(m) {
  return Math.max(CABINET_M, Math.round(m / CABINET_M) * CABINET_M);
}

function pitchInfo(env, pitch) {
  const list = SERIES[env].pitches;
  return list.find(p => p.pitch === Number(pitch)) || null;
}

// Faustregel: Mindestabstand in Metern ≈ Pixelpitch in Millimetern.
// Empfohlen wird der gröbste (günstigste) Pitch, der bei diesem Abstand noch geschlossen wirkt.
function recommendPitch(env, distanceM) {
  const list = SERIES[env].pitches;
  const fitting = list.filter(p => p.pitch <= distanceM + 0.1);
  return (fitting.length ? fitting[fitting.length - 1] : list[0]).pitch;
}

function pickController(totalPx) {
  return CONTROLLERS.find(c => totalPx <= c.maxPx) || null;
}

// cfg: { env, pitch, w, h, mount, cases, service }
function buildPackage(cfg) {
  const series = SERIES[cfg.env];
  const p = pitchInfo(cfg.env, cfg.pitch) || series.pitches[0];
  const w = snapSize(cfg.w), h = snapSize(cfg.h);
  const cols = Math.round(w / CABINET_M), rows = Math.round(h / CABINET_M);
  const cabinets = cols * rows;
  const area = w * h;
  const pxW = cols * p.px, pxH = rows * p.px;
  const totalPx = pxW * pxH;
  const mount = MOUNTS[cfg.mount] || MOUNTS.hang;
  const warnings = [];
  const items = [];

  items.push({
    qty: cabinets, unit: 'Stk.',
    name: `LED-Cabinet 500 × 500 mm, ${series.label} P${fmtNum(p.pitch)}`,
    note: `${fmtNum(area)} m² · ${p.px} × ${p.px} Pixel je Cabinet · ${series.nits} cd/m² · ${series.ip}`,
    price: Math.round(area * p.price),
  });

  const ctrl = pickController(totalPx);
  if (ctrl) {
    items.push({ qty: 1, unit: 'Stk.', name: ctrl.name, note: 'HDMI-Eingang, fertig vorkonfiguriert für diese Wand', price: ctrl.price });
  } else {
    warnings.push('Diese Wand hat mehr als 6,5 Mio. Pixel. Die Steuerung planen wir individuell – der Preis unten enthält noch keinen Videoprozessor.');
  }

  let mountPrice;
  if (mount.perSqm) mountPrice = Math.round(area * mount.perSqm);
  else mountPrice = Math.round(w * mount.perMeterWidth);
  items.push({ qty: 1, unit: 'Set', name: mount.item, note: `passend für ${fmtNum(w)} m Breite`, price: mountPrice });
  if (mount.maxHeight && h > mount.maxHeight) {
    warnings.push(`Freistehend liefern wir bis ${mount.maxHeight} m Höhe. Für ${fmtNum(h)} m bitte hängend oder an der Wand montieren.`);
  }

  items.push({ qty: 1, unit: 'Set', name: EXTRAS.cabling.name, note: 'Verbindungskabel zwischen den Cabinets sind dabei', price: EXTRAS.cabling.price });
  items.push({ qty: 1, unit: 'Set', name: EXTRAS.spares.name, note: 'im Paket enthalten', price: EXTRAS.spares.price });

  if (cfg.cases) {
    const n = Math.ceil(cabinets / EXTRAS.cases.perCase);
    items.push({ qty: n, unit: 'Stk.', name: EXTRAS.cases.name, note: 'mit Rollen, stapelbar', price: n * EXTRAS.cases.price });
  }
  if (cfg.service) {
    items.push({ qty: 1, unit: 'Psch.', name: EXTRAS.service.name, note: 'ein Termin, österreichweit', price: EXTRAS.service.price });
  }
  items.push({
    qty: 1, unit: 'Psch.', name: EXTRAS.shipping.name, note: 'frei Bordsteinkante',
    price: Math.round(EXTRAS.shipping.base + area * EXTRAS.shipping.perSqm),
  });

  const net = items.reduce((s, i) => s + i.price, 0);
  const powerMax = area * series.wMax;
  return {
    env: cfg.env, series, pitch: p.pitch, w, h, cols, rows, cabinets, area,
    pxW, pxH, totalPx, pxPerCab: p.px, mountKey: cfg.mount, mount,
    items, warnings,
    net, vat: Math.round(net * SITE.vat), gross: Math.round(net * (1 + SITE.vat)),
    powerMax, powerAvg: area * series.wAvg,
    circuits: Math.ceil(powerMax / 3000),      // 16-A-Stromkreise mit Reserve
    weight: cabinets * series.kgCab,
    minDistance: p.pitch,
    diagonalInch: Math.sqrt(w * w + h * h) / 0.0254,
  };
}

function configQuery(cfg) {
  const q = new URLSearchParams({
    env: cfg.env, pitch: cfg.pitch, w: cfg.w, h: cfg.h, mount: cfg.mount,
    cases: cfg.cases ? 1 : 0,
  });
  return q.toString();
}

// — Formatierung —
function fmtEur(n) { return Math.round(n).toLocaleString('de-DE') + ' €'; }
function fmtNum(n, digits) {
  return Number(n).toLocaleString('de-DE', { maximumFractionDigits: digits === undefined ? 2 : digits });
}
function fmtInt(n) { return Math.round(n).toLocaleString('de-DE'); }
function ratioLabel(w, h) {
  const r = w / h;
  const known = [[16, 9], [4, 3], [21, 9], [1, 1], [3, 2], [2, 1], [3, 1], [9, 16], [5, 4], [8, 3], [5, 3], [7, 4]];
  for (const [a, b] of known) if (Math.abs(r - a / b) < 0.02) return `${a}:${b}`;
  return fmtNum(r, 2) + ':1';
}
