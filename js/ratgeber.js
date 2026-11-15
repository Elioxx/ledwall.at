// Füllt Tabellen in Ratgeber-Artikeln mit den aktuellen Werten aus data.js,
// damit Artikel und Konfigurator nie unterschiedliche Preise zeigen.
//   <tbody data-price-rows>    Preis je m² für alle Serien und Pitches
//   <tbody data-example-rows>  Packliste der Beispielwand 4 × 2 m
//   <tbody data-series-rows>   Vergleich Indoor/Outdoor
// Hängt ab von: data.js, calc.js

(function () {
  const price = document.querySelector('[data-price-rows]');
  if (price) {
    price.innerHTML = Object.entries(SERIES).flatMap(([env, s]) => s.pitches.map(p => {
      const r = buildPackage({ env, pitch: p.pitch, w: 4, h: 2, mount: 'hang', cases: false });
      return `<tr><td>${s.label}</td><td>P${fmtNum(p.pitch)}</td><td>${fmtEur(p.price)}</td><td>${fmtEur(r.net)} komplett</td></tr>`;
    })).join('');
  }

  const example = document.querySelector('[data-example-rows]');
  if (example) {
    const r = buildPackage({ env: 'indoor', pitch: 2.97, w: 4, h: 2, mount: 'hang', cases: true });
    example.innerHTML = r.items.map(i =>
      `<tr><td>${i.qty} ${i.unit} ${i.name}</td><td>${i.price ? fmtEur(i.price) : 'inklusive'}</td></tr>`
    ).join('') + `<tr><td><b>Summe netto</b></td><td><b>${fmtEur(r.net)}</b></td></tr>
      <tr><td>Summe inkl. 20 % USt.</td><td>${fmtEur(r.gross)}</td></tr>`;
  }

  const series = document.querySelector('[data-series-rows]');
  if (series) {
    const i = SERIES.indoor, o = SERIES.outdoor;
    const row = (k, a, b) => `<tr><td>${k}</td><td>${a}</td><td>${b}</td></tr>`;
    series.innerHTML = [
      row('Helligkeit', `${fmtInt(i.nits)} cd/m²`, `${fmtInt(o.nits)} cd/m²`),
      row('Schutzart', i.ip, o.ip),
      row('Gewicht je Cabinet', `${fmtNum(i.kgCab, 1)} kg`, `${fmtNum(o.kgCab, 1)} kg`),
      row('Leistung je m², Spitze', `${i.wMax} W`, `${o.wMax} W`),
      row('Leistung je m², Schnitt', `${i.wAvg} W`, `${o.wAvg} W`),
      row('Pixelpitch', i.pitches.map(p => 'P' + fmtNum(p.pitch)).join(', '), o.pitches.map(p => 'P' + fmtNum(p.pitch)).join(', ')),
      row('Preis je m²', `ab ${fmtEur(Math.min(...i.pitches.map(p => p.price)))}`, `ab ${fmtEur(Math.min(...o.pitches.map(p => p.price)))}`),
    ].join('');
  }
})();
