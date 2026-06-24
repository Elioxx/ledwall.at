// CLAUDE: Central state for the LED Wand Konfigurator.
//
// `state`       — all user selections; read/written by every other module
// `ALL_STEPS`   — canonical step order for the wizard
// `visibleSteps()` — filters out 'orientation' for indoor installations
// `currentIndex` — which step is currently shown (mutated by navigation.js)
//
// Nothing in this file touches the DOM.

const state = {
  location:        null,    // 'indoor' | 'outdoor'
  purpose:         null,    // 'event' | 'stage' | 'retail' | 'corporate' | 'other'
  distance:        5,       // viewing distance in metres (1–30)
  width:           4,       // wall width in metres (1–15)
  height:          2.5,     // wall height in metres (1–8)
  mountHeight:     0,       // bottom-edge height above floor in metres (0–6)
  orientation:     null,    // compass: 'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw'
  model:           null,    // 'rent' | 'buy'
  days:            3,       // rental days (1–30)
  mountType:       null,    // 'wall' | 'ground' | 'truss' | 'facade'
  structure:       null,    // existing sub-structure: 'yes' | 'no' | 'unsure'
  installLocation: '',
  name:            '',
  company:         '',
  email:           '',
  phone:           '',
};

const ALL_STEPS = [
  'location',
  'purpose',
  'distance',
  'size',
  'mountHeight',
  'orientation',   // only shown when state.location === 'outdoor'
  'model',
  'installation',
  'contact',
];

function visibleSteps() {
  return ALL_STEPS.filter(key => {
    if (key === 'orientation') return state.location === 'outdoor';
    return true;
  });
}

let currentIndex = 0;
