// CLAUDE: Price calculation logic. Pure functions — no DOM, no state side-effects.
//
// pitchForDistance(d)          → recommended pixel pitch (mm) for viewing distance d (m)
// pricePerSqmBuy(pitch, outdoor) → EUR/m² for purchase
// pricePerSqmRentDay(pitch, outdoor) → EUR/m²/day for rental
// pitchLabel(pitch)            → display string, e.g. "P2.9"
//
// Mounting cost factors are applied in offer.js, not here.

function pitchForDistance(d) {
  if (d <= 2)  return 1.9;
  if (d <= 5)  return 2.9;
  if (d <= 8)  return 3.9;
  if (d <= 12) return 4.8;
  if (d <= 20) return 6.2;
  return 9.5;
}

function pricePerSqmBuy(pitch, outdoor) {
  let base;
  if      (pitch <= 2.0) base = 4500;
  else if (pitch <= 3.0) base = 2800;
  else if (pitch <= 4.0) base = 1900;
  else if (pitch <= 5.0) base = 1400;
  else if (pitch <= 6.5) base = 1050;
  else                   base = 780;
  if (outdoor) base *= 1.55; // outdoor panels: weatherproof + high-brightness premium
  return base;
}

function pricePerSqmRentDay(pitch, outdoor) {
  let base;
  if      (pitch <= 2.0) base = 280;
  else if (pitch <= 3.0) base = 195;
  else if (pitch <= 4.0) base = 140;
  else if (pitch <= 5.0) base = 105;
  else if (pitch <= 6.5) base = 80;
  else                   base = 60;
  if (outdoor) base *= 1.40; // outdoor: weather protection, higher brightness HW
  return base;
}

function pitchLabel(pitch) {
  return 'P' + pitch.toFixed(1).replace('.0', '');
}
