// LED-Wand-Rechner: Pitch-Empfehlung, Auflösung, Gewicht, Strom, Stromkosten.
// Hängt ab von: data.js, calc.js

(function () {
  const $ = id => document.getElementById(id);
  const form = $('rcForm');
  let pitchAuto = true;   // Pitch folgt dem Abstand, bis der Nutzer selbst wählt

  function env() { return form.querySelector('input[name=env]:checked').value; }

  function fillPitchSelect(selected) {
    const rec = recommendPitch(env(), Number($('rcDist').value));
    $('rcPitch').innerHTML = SERIES[env()].pitches.map(p =>
      `<option value="${p.pitch}"${p.pitch === selected ? ' selected' : ''}>P${fmtNum(p.pitch)}${p.pitch === rec ? ' (empfohlen)' : ''}</option>`
    ).join('');
  }

  function render() {
    const e = env();
    const dist = Number($('rcDist').value);
    const rec = recommendPitch(e, dist);
    let pitch = Number($('rcPitch').value);
    if (pitchAuto || !pitchInfo(e, pitch)) pitch = rec;
    fillPitchSelect(pitch);

    const cfg = { env: e, pitch, w: Number($('rcW').value), h: Number($('rcH').value), mount: 'hang', cases: false };
    const r = buildPackage(cfg);
    const hours = Math.max(0, Math.min(24, Number($('rcHours').value) || 0));
    const kwhPrice = Math.max(0, Number($('rcKwh').value) || 0);
    const kwhYear = r.powerAvg / 1000 * hours * 365;

    $('rcDistOut').textContent = fmtNum(dist) + ' m';
    $('rcWOut').textContent = fmtNum(r.w) + ' m';
    $('rcHOut').textContent = fmtNum(r.h) + ' m';
    $('rcDistLabel').textContent = fmtNum(dist) + ' m';

    const hd = r.pxW >= 3840 && r.pxH >= 2160 ? 'reicht für 4K' : r.pxW >= 1920 && r.pxH >= 1080 ? 'reicht für Full HD' : 'unter Full HD';
    $('rcRes').innerHTML = [
      ['Auflösung', `${fmtInt(r.pxW)} × ${fmtInt(r.pxH)}`, `${fmtNum(r.totalPx / 1e6, 2)} Mio. Pixel, ${hd}`],
      ['Fläche und Format', `${fmtNum(r.area)} m²`, `${ratioLabel(r.w, r.h)} · ${fmtInt(r.diagonalInch)} Zoll Diagonale`],
      ['Cabinets', `${r.cabinets} Stück`, `${r.cols} breit × ${r.rows} hoch`],
      ['Gewicht', `${fmtInt(r.weight)} kg`, 'nur Cabinets'],
      ['Leistung', `${fmtNum(r.powerMax / 1000, 1)} kW Spitze`, `${fmtNum(r.powerAvg / 1000, 1)} kW im Schnitt`],
      ['Anschluss', `${r.circuits} × 16 A`, r.circuits > 2 ? 'besser CEE-Starkstrom mit Verteiler' : 'normale Schuko-Stromkreise'],
      ['Stromverbrauch', `${fmtInt(kwhYear)} kWh`, `pro Jahr bei ${fmtNum(hours)} h täglich`],
      ['Stromkosten', `${fmtEur(kwhYear * kwhPrice)}`, `pro Jahr, ${fmtEur(kwhYear * kwhPrice / 12)} im Monat`],
      ['Helligkeit', `${fmtInt(r.series.nits)} cd/m²`, `${r.series.label}, Schutzart ${r.series.ip}`],
    ].map(([k, v, s]) => `<div class="res"><span>${k}</span><b>${v}</b><small>${s}</small></div>`).join('');

    $('rcPitchRows').innerHTML = SERIES[e].pitches.map(p => {
      const cls = p.pitch === rec ? 'best' : p.pitch > dist + 0.1 ? 'tooclose' : '';
      return `<tr class="${cls}"><td>P${fmtNum(p.pitch)}</td><td>${fmtNum(p.pitch, 1)} m</td><td>${fmtNum(p.pitch * 2, 1)} m</td>
        <td>${fmtInt(r.cols * p.px)} × ${fmtInt(r.rows * p.px)}</td><td>${fmtEur(p.price)}</td></tr>`;
    }).join('');

    $('rcPkPrice').textContent = `${fmtNum(r.w)} × ${fmtNum(r.h)} m in P${fmtNum(r.pitch)}, hängend, komplett mit Controller und Lieferung: ${fmtEur(r.net)} netto.`;
    $('rcToKf').href = 'konfigurator.html?' + configQuery(cfg);
  }

  form.addEventListener('input', e => {
    if (e.target.id === 'rcPitch') pitchAuto = false;
    if (e.target.id === 'rcDist' || e.target.name === 'env') pitchAuto = true;
    render();
  });
  form.addEventListener('submit', e => e.preventDefault());
  fillPitchSelect(recommendPitch('indoor', 4));
  render();
})();
