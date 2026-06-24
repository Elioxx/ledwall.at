// CLAUDE: Initialization entry point. Must be the LAST script loaded (see index.html).
//
// Wires up the two navigation buttons and the restart button,
// then fires initial renders so sliders show correct readouts on page load.
//
// Load order dependency:
//   state.js → pricing.js → navigation.js → validation.js →
//   selectors.js → sliders.js → preview.js → offer.js → main.js  ← here

nextBtn.addEventListener('click', goNext);
backBtn.addEventListener('click', goBack);
document.getElementById('restartBtn').addEventListener('click', () => location.reload());

// Initial renders (sliders have default values that need to be reflected in UI)
updateDist();
updateSize();
updateMountH();

// Show step 0
showCurrent();
