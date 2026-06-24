// CLAUDE: Slider and text-input event handlers.
//
// Handles:
//   updateDist()    — distance slider → state.distance, readout text, re-renders grid
//   updateMountH()  — mount-height slider → state.mountHeight, readout text
//   updateSize()    — width/height sliders → state.width/height, area display, re-renders grid
//   days slider     — inline, → state.days, readout text
//   contact fields  — inpName/inpCompany/inpEmail/inpPhone/inpLocation → state fields
//
// updateDist() and updateSize() are called from main.js on init to set initial readouts.
// updateMountH() is also called from main.js on init.
//
// Depends on: state.js, validation.js (updateNextEnabled), preview.js (renderGrid)

// ── Distance ────────────────────────────────────────────────────────────────
const distSlider  = document.getElementById('distSlider');
const distReadout = document.getElementById('distReadout');
const distCaption = document.getElementById('distCaption');

function distCaptionText(v) {
  if (v <= 2)  return 'Sehr nah — z.B. Schaufenster, Empfangstresen';
  if (v <= 5)  return 'Normaler Messestand-Abstand';
  if (v <= 10) return 'Konferenzraum, kleine Bühne';
  if (v <= 20) return 'Konzertbühne, größerer Saal';
  return 'Große Distanz — Stadion, Platz, Fassade';
}

function updateDist() {
  const v = parseInt(distSlider.value);
  state.distance = v;
  distReadout.innerHTML = v + '<small>Meter</small>';
  distCaption.textContent = distCaptionText(v);
  renderGrid();
}

distSlider.addEventListener('input', updateDist);

// ── Mount height ─────────────────────────────────────────────────────────────
const mountHSlider  = document.getElementById('mountHSlider');
const mountHReadout = document.getElementById('mountHReadout');
const mountHCaption = document.getElementById('mountHCaption');

function mountCaptionText(v) {
  if (v <= 0)   return 'Direkt auf dem Boden stehend';
  if (v <= 1.5) return 'Auf Sockel oder Podest';
  if (v <= 3)   return 'Über Kopfhöhe, z.B. an Fassade';
  return 'Hoch montiert, z.B. Giebel oder Dach';
}

function updateMountH() {
  const v = parseFloat(mountHSlider.value);
  state.mountHeight = v;
  mountHReadout.innerHTML = v.toFixed(2).replace('.00', '.0').replace('.', ',') + '<small>Meter</small>';
  mountHCaption.textContent = mountCaptionText(v);
}

mountHSlider.addEventListener('input', updateMountH);

// ── Size (width + height) ────────────────────────────────────────────────────
const widthSlider  = document.getElementById('widthSlider');
const heightSlider = document.getElementById('heightSlider');
const widthVal     = document.getElementById('widthVal');
const heightVal    = document.getElementById('heightVal');
const areaVal      = document.getElementById('areaVal');

function updateSize() {
  state.width  = parseFloat(widthSlider.value);
  state.height = parseFloat(heightSlider.value);
  widthVal.textContent = state.width.toFixed(1) + ' m';
  heightVal.textContent = state.height.toFixed(1) + ' m';
  areaVal.textContent  = (state.width * state.height).toFixed(1) + ' m²';
  renderGrid();
}

widthSlider.addEventListener('input', updateSize);
heightSlider.addEventListener('input', updateSize);

// ── Rental days ──────────────────────────────────────────────────────────────
const daysSlider  = document.getElementById('daysSlider');
const daysReadout = document.getElementById('daysReadout');

daysSlider.addEventListener('input', () => {
  state.days = parseInt(daysSlider.value);
  daysReadout.innerHTML = state.days + '<small>Tage</small>';
});

// ── Contact + install-location fields ────────────────────────────────────────
const fieldMap = {
  inpName:     'name',
  inpCompany:  'company',
  inpEmail:    'email',
  inpPhone:    'phone',
  inpLocation: 'installLocation',
};

Object.keys(fieldMap).forEach(id => {
  document.getElementById(id).addEventListener('input', e => {
    state[fieldMap[id]] = e.target.value;
    updateNextEnabled();
  });
});
