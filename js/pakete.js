// Rendert die Paket-Karten aus PACKAGES (data.js) in ein Element mit [data-pakete].
// data-pakete="3" begrenzt die Anzahl, data-base setzt den Pfad zur Wurzel.
// Hängt ab von: data.js, calc.js

(function () {
  document.querySelectorAll('[data-pakete]').forEach(box => {
    const limit = Number(box.dataset.pakete) || PACKAGES.length;
    const base = box.dataset.base || '';
    box.innerHTML = PACKAGES.slice(0, limit).map(pk => {
      const r = buildPackage(pk);
      const thumb = `<div class="pk-thumb" style="grid-template-columns:repeat(${r.cols},auto)" aria-hidden="true">${'<i></i>'.repeat(r.cabinets)}</div>`;
      return `
      <article class="pk ${pk.env}">
        <div class="pk-top"><h3>Paket ${pk.name}</h3><span class="tag ${pk.env}">${r.series.label}</span></div>
        <div class="pk-size">${fmtNum(r.w)} × ${fmtNum(r.h)} m</div>
        ${thumb}
        <p class="muted">${pk.use}</p>
        <dl>
          <dt>Pixelpitch</dt><dd>P${fmtNum(r.pitch)}</dd>
          <dt>Auflösung</dt><dd>${fmtInt(r.pxW)} × ${fmtInt(r.pxH)} px</dd>
          <dt>Cabinets</dt><dd>${r.cabinets} Stück</dd>
          <dt>Aufbau</dt><dd>${r.mount.label}</dd>
          <dt>Flightcases</dt><dd>${pk.cases ? 'dabei' : 'ohne'}</dd>
        </dl>
        <div class="pk-price">
          <div><strong>${fmtEur(r.net)}</strong><small>netto, inkl. Lieferung · ${fmtEur(r.gross)} brutto</small></div>
          <a href="${base}konfigurator.html?${configQuery(pk)}">Ansehen und anpassen</a>
        </div>
      </article>`;
    }).join('');
  });
})();
