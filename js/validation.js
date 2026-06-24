// CLAUDE: Controls whether the "Weiter" / "Angebot berechnen" button is active.
//
// updateNextEnabled() — reads the current step key + state, sets nextBtn.disabled.
//
// Required per step:
//   location    → state.location must be selected
//   purpose     → state.purpose must be selected
//   orientation → state.orientation must be selected (outdoor only)
//   model       → state.model must be selected
//   contact     → state.name (>1 char) AND valid email format
//   all others  → always enabled (sliders have defaults)
//
// Depends on: state.js (state, currentIndex, visibleSteps), navigation.js (nextBtn)

function updateNextEnabled() {
  const steps = visibleSteps();
  const key   = steps[currentIndex];
  let ok = true;

  if (key === 'location')    ok = !!state.location;
  if (key === 'purpose')     ok = !!state.purpose;
  if (key === 'orientation') ok = !!state.orientation;
  if (key === 'model')       ok = !!state.model;
  if (key === 'contact')     ok = state.name.trim().length > 1 && /\S+@\S+\.\S+/.test(state.email);

  nextBtn.disabled = !ok;
}
