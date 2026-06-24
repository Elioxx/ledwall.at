// CLAUDE: Option card (radio-style) selection logic.
//
// wireSingleSelect(containerId, stateKey)
//   Makes all .opt cards inside the container act like radio buttons.
//   Writes the clicked card's data-value to state[stateKey].
//   Side effects:
//     • optLocation change → re-renders live grid (colour shifts indoor↔outdoor)
//     • optModel change    → shows/hides the rental-days slider (#rentDaysWrap)
//
// Depends on: state.js, validation.js (updateNextEnabled), preview.js (renderGrid)

function wireSingleSelect(containerId, stateKey) {
  const container = document.getElementById(containerId);
  container.querySelectorAll('.opt').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state[stateKey] = opt.dataset.value;
      updateNextEnabled();

      if (containerId === 'optLocation') renderGrid();
      if (containerId === 'optModel') {
        document.getElementById('rentDaysWrap').style.display =
          state.model === 'rent' ? 'block' : 'none';
      }
    });
  });
}

wireSingleSelect('optLocation',   'location');
wireSingleSelect('optPurpose',    'purpose');
wireSingleSelect('optModel',      'model');
wireSingleSelect('optOrientation','orientation');
wireSingleSelect('optMountType',  'mountType');
wireSingleSelect('optStructure',  'structure');
