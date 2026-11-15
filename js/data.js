// Zentrale Stammdaten: Firma, Preise, Serien, Zubehör, fertige Pakete.
// ALLE Preise der Website kommen aus dieser Datei (netto, in Euro).
// Preise ändern → nur hier. Kein DOM, keine Logik.

const SITE = {
  name: 'ledwall.at',
  email: 'office@ledwall.at',   // Empfänger der Paket-Anfragen
  // Anfrageformular: Access Key von https://web3forms.com (kostenlos, auf die Empfänger-Adresse ausgestellt).
  // Leer = Anfrage öffnet stattdessen das E-Mail-Programm des Kunden (mailto).
  formKey: '',
  vat: 0.20,                    // österreichische USt
};

// Ein Cabinet ist immer 500 × 500 mm.
const CABINET_M = 0.5;

// px = Pixel je Cabinet-Kante, price = € netto je m² (inkl. Verbindungskabel Cabinet zu Cabinet)
const SERIES = {
  indoor: {
    label: 'Indoor', nits: 1000, ip: 'IP30',
    wMax: 560, wAvg: 190,       // Watt je m² (Spitze / typischer Betrieb)
    kgCab: 7.0,                 // kg je Cabinet
    pitches: [
      { pitch: 1.95, px: 256, price: 1590 },
      { pitch: 2.6,  px: 192, price: 1090 },
      { pitch: 2.97, px: 168, price: 940 },
      { pitch: 3.91, px: 128, price: 740 },
    ],
  },
  outdoor: {
    label: 'Outdoor', nits: 4500, ip: 'IP65',
    wMax: 720, wAvg: 240,
    kgCab: 8.5,
    pitches: [
      { pitch: 2.97, px: 168, price: 1240 },
      { pitch: 3.91, px: 128, price: 940 },
      { pitch: 4.81, px: 104, price: 840 },
    ],
  },
};

// Controller wird nach Gesamtpixelzahl der Wand gewählt.
const CONTROLLERS = [
  { maxPx:  650000, name: 'Controller S (bis 650.000 Pixel)',          price: 390 },
  { maxPx: 1300000, name: 'Controller M (bis 1,3 Mio. Pixel)',         price: 790 },
  { maxPx: 2600000, name: 'Videoprozessor L (bis 2,6 Mio. Pixel)',     price: 1490 },
  { maxPx: 3900000, name: 'Videoprozessor XL (bis 3,9 Mio. Pixel)',    price: 2190 },
  { maxPx: 6500000, name: 'Videoprozessor XXL (bis 6,5 Mio. Pixel)',   price: 2990 },
];

const MOUNTS = {
  hang:  { label: 'Hängend',      desc: 'An Traverse oder Rigging-Punkten', item: 'Hängebügel für Traverse',        perMeterWidth: 69 },
  stack: { label: 'Freistehend',  desc: 'Am Boden, bis 3 m Höhe',           item: 'Ground-Stack-System mit Stützen', perMeterWidth: 210, maxHeight: 3 },
  wall:  { label: 'An der Wand',  desc: 'Fix verschraubt',                  item: 'Wandmontage-Schienen',            perSqm: 85 },
};

const EXTRAS = {
  cabling:  { name: 'Anschluss-Set (Strom- und Datenzuleitung, Verteiler)', price: 140 },
  spares:   { name: 'Ersatzteil-Kit (Module, Netzteil, Receiving Card)',    price: 0 },   // im Paket enthalten
  cases:    { name: 'Flightcase für 8 Cabinets', perCase: 8, price: 320 },
  shipping: { name: 'Lieferung per Spedition in Österreich', base: 150, perSqm: 22 },
  service:  { name: 'Aufbau und Einschulung vor Ort', price: 890 },
};

// Fertige Pakete — Preise werden aus den Tabellen oben berechnet (calc.js).
const PACKAGES = [
  { id: 'messe',     name: 'Messe',      use: 'Messestand, Roadshow, Produktpräsentation',
    env: 'indoor',  pitch: 2.6,  w: 3,   h: 2,   mount: 'stack', cases: true },
  { id: 'buehne',    name: 'Bühne',      use: 'Konzert, Ball, Vereinsfest, Kirche',
    env: 'indoor',  pitch: 3.91, w: 4,   h: 2.5, mount: 'hang',  cases: true },
  { id: 'konferenz', name: 'Konferenz',  use: 'Besprechungsraum, Empfang, Showroom',
    env: 'indoor',  pitch: 1.95, w: 3.5, h: 2,   mount: 'wall',  cases: false },
  { id: 'openair',   name: 'Open Air',   use: 'Public Viewing, Festival, Zeltfest',
    env: 'outdoor', pitch: 3.91, w: 5,   h: 3,   mount: 'hang',  cases: true },
  { id: 'platz',     name: 'Sportplatz', use: 'Anzeigetafel, Vereinsgelände, Werbefläche',
    env: 'outdoor', pitch: 4.81, w: 4,   h: 2.5, mount: 'wall',  cases: false },
  { id: 'kompakt',   name: 'Kompakt',    use: 'DJ, Hochzeit, kleine Bühne',
    env: 'indoor',  pitch: 2.97, w: 2,   h: 1.5, mount: 'stack', cases: true },
];
