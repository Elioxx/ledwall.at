// Gemeinsamer Seitenrahmen: Kopfzeile + Fußzeile für alle Seiten.
// Einbinden mit <script src="…/js/site.js" data-base="../"></script> (data-base = Pfad zur Wurzel).
// Hängt ab von: data.js

(function () {
  const base = document.currentScript.dataset.base || '';
  const here = location.pathname;
  const nav = [
    ['pakete.html', 'Pakete'],
    ['konfigurator.html', 'Konfigurator'],
    ['rechner.html', 'Rechner'],
    ['ratgeber/index.html', 'Ratgeber'],
  ];
  const isActive = href => here.endsWith('/' + href) || (href.startsWith('ratgeber/') && here.includes('/ratgeber/'));

  const header = document.createElement('header');
  header.className = 'site-head';
  header.innerHTML = `
    <a class="skip" href="#inhalt">Zum Inhalt springen</a>
    <div class="wrap head-row">
      <a class="logo" href="${base}index.html" aria-label="${SITE.name} Startseite">
        <span class="logo-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>ledwall<b>.at</b></span>
      </a>
      <nav aria-label="Hauptnavigation">
        ${nav.map(([h, l]) => `<a href="${base}${h}"${isActive(h) ? ' aria-current="page"' : ''}>${l}</a>`).join('')}
      </nav>
    </div>`;
  document.body.prepend(header);

  const footer = document.createElement('footer');
  footer.className = 'site-foot';
  footer.innerHTML = `
    <div class="wrap foot-grid">
      <div>
        <div class="logo"><span>ledwall<b>.at</b></span></div>
        <p>LED-Wände als aufbaufertiges Komplettpaket. Beratung, Rechnung und Gewährleistung aus Österreich.</p>
      </div>
      <div>
        <h2>Kaufen</h2>
        <a href="${base}pakete.html">Fertige Pakete</a>
        <a href="${base}konfigurator.html">Eigene Wand konfigurieren</a>
        <a href="mailto:${SITE.email}">${SITE.email}</a>
      </div>
      <div>
        <h2>Wissen</h2>
        <a href="${base}rechner.html">LED-Wand-Rechner</a>
        <a href="${base}ratgeber/index.html">Ratgeber</a>
        <a href="${base}ratgeber/led-wand-kosten.html">Was kostet eine LED-Wand?</a>
      </div>
      <div>
        <h2>Rechtliches</h2>
        <a href="${base}impressum.html">Impressum</a>
        <a href="${base}datenschutz.html">Datenschutz</a>
      </div>
    </div>
    <div class="wrap foot-note">Alle Preise in Euro, netto zuzüglich 20 % USt.</div>`;
  document.body.append(footer);
})();
