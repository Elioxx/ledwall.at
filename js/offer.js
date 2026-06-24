// CLAUDE: Computes and renders the result/offer screen.
//
// computeOffer() — called by navigation.js when the user reaches the result step.
//   1. Reads state (distance → pitch, area, outdoor flag)
//   2. Applies mountFactor based on mountType, mountHeight, and structure
//   3. Calculates total price (rent or buy)
//   4. Updates DOM: #offerPrice, #offerSub, #specList, #resultHeadline
//
// Mounting cost factors:
//   truss        +12%  (hanging rig more complex)
//   facade/roof  +18%  (structural attachment)
//   height > 3m  +8%   (access equipment)
//   existing sub-structure present  -6%
//   no sub-structure at all         +5%
//
// Depends on: state.js, pricing.js (pitchForDistance, pricePerSqmBuy, pricePerSqmRentDay, pitchLabel)

function computeOffer() {
  const pitch   = pitchForDistance(state.distance);
  const area    = state.width * state.height;
  const outdoor = state.location === 'outdoor';

  // — Mounting complexity factor —
  let mountFactor = 1.0;
  if (state.mountType === 'truss')  mountFactor = 1.12;
  if (state.mountType === 'facade') mountFactor = 1.18;
  if (state.mountHeight > 3)        mountFactor += 0.08;
  if (state.structure  === 'yes')   mountFactor -= 0.06;
  if (state.structure  === 'no')    mountFactor += 0.05;

  let priceValue, sub;

  if (state.model === 'rent') {
    const perSqmDay = pricePerSqmRentDay(pitch, outdoor);
    const logistics = (1200 + area * 65) * mountFactor; // Anlieferung, Aufbau, Abbau, Technik
    const total     = perSqmDay * area * state.days + logistics;
    priceValue = Math.round(total / 50) * 50;
    sub = `für ${state.days} Tag${state.days > 1 ? 'e' : ''} · inkl. Technik & Auf-/Abbau (geschätzt)`;
  } else {
    const perSqm = pricePerSqmBuy(pitch, outdoor);
    const total  = (perSqm * area + 3500) * mountFactor; // Steuerung, Verarbeitung, Montage-Basis
    priceValue = Math.round(total / 100) * 100;
    sub = 'einmalig · inkl. Modulen, Steuerung & Montage (geschätzt)';
  }

  document.getElementById('offerPrice').innerHTML = priceValue.toLocaleString('de-DE') + ' €';
  document.getElementById('offerSub').textContent = sub;

  // — Label maps —
  const purposeLabels = {
    event: 'Event / Messe', stage: 'Bühne / Konzert',
    retail: 'Laden / Werbung', corporate: 'Empfang / Büro', other: 'Sonderprojekt',
  };
  const orientationLabels = {
    n: 'Norden', ne: 'Nordosten', e: 'Osten', se: 'Südosten',
    s: 'Süden', sw: 'Südwesten', w: 'Westen', nw: 'Nordwesten',
  };
  const mountTypeLabels = {
    wall: 'An Wand', ground: 'Freistehend / Boden',
    truss: 'Hängend / Traverse', facade: 'Fassade / Dach',
  };
  const structureLabels = {
    yes: 'Ja, vorhanden', no: 'Nein, noch nicht', unsure: 'Unklar — prüfen wir',
  };

  // — Spec table —
  const specs = [
    ['Einsatzort',               state.location === 'outdoor' ? 'Außen' : 'Innen'],
    ['Einsatzzweck',             purposeLabels[state.purpose] || '–'],
    ['Wandgröße',                `${state.width.toFixed(1)} × ${state.height.toFixed(1)} m (${(state.width * state.height).toFixed(1)} m²)`],
    ['Montagehöhe (Unterkante)', state.mountHeight.toFixed(2).replace('.00', '.0').replace('.', ',') + ' m'],
    ['Betrachtungsabstand',      `ab ${state.distance} m`],
    ['Empfohlene Auflösungsdichte', pitchLabel(pitch) + ' (automatisch ermittelt)'],
  ];
  if (outdoor && state.orientation) {
    specs.push(['Ausrichtung', orientationLabels[state.orientation] || '–']);
  }
  specs.push(['Montageart',                  mountTypeLabels[state.mountType] || '–']);
  specs.push(['Unterkonstruktion vorhanden', structureLabels[state.structure] || '–']);
  if (state.installLocation.trim()) {
    specs.push(['Aufbauort', state.installLocation.trim()]);
  }
  specs.push(['Modell', state.model === 'rent'
    ? `Miete, ${state.days} Tage`
    : 'Kauf / Festinstallation']);

  document.getElementById('specList').innerHTML = specs
    .map(([k, v]) => `<div class="spec-row"><div class="k">${k}</div><div class="v">${v}</div></div>`)
    .join('');

  document.getElementById('resultHeadline').textContent =
    `Hallo ${state.name.split(' ')[0] || ''}, hier ist Ihre Einschätzung`;
}
