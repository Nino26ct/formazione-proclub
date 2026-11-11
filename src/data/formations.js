// I 29 moduli della modalità Club di FC 27.
// Coordinate in percentuale: x 0 = fascia sinistra, 100 = fascia destra;
// y 0 = porta avversaria (in alto), 100 = nostra porta (in basso).
// L'ordine degli slot è sempre: portiere, difesa (da sinistra a destra),
// centrocampo, attacco. Cambiando modulo, lo slot N tiene nome e numero.

const GK = [['POR', 50, 92]]
const D3 = [['DC', 27, 77], ['DC', 50, 79], ['DC', 73, 77]]
const D4 = [['TS', 12, 71], ['DC', 37, 78], ['DC', 63, 78], ['TD', 88, 71]]
const D5 = [['TS', 8, 66], ['DC', 29, 77], ['DC', 50, 79], ['DC', 71, 77], ['TD', 92, 66]]

const ATT1 = [['ATT', 50, 16]]
const ATT2 = [['ATT', 36, 18], ['ATT', 64, 18]]
const TRIDENTE = [['AS', 15, 23], ['ATT', 50, 16], ['AD', 85, 23]]
const MID4_FLAT = [['ES', 12, 49], ['CC', 37, 53], ['CC', 63, 53], ['ED', 88, 49]]
const CDC2 = [['CDC', 36, 62], ['CDC', 64, 62]]

const f = (id, group, back, rest) => ({
  id,
  group,
  slots: [...GK, ...back, ...rest].map(([role, x, y]) => ({ role, x, y })),
})

export const FORMATIONS = [
  // Difesa a 3
  f('3-1-4-2', 'Difesa a 3', D3, [['CDC', 50, 63], ['ES', 10, 47], ['CC', 36, 50], ['CC', 64, 50], ['ED', 90, 47], ...ATT2]),
  f('3-4-1-2', 'Difesa a 3', D3, [['ES', 10, 52], ['CC', 36, 56], ['CC', 64, 56], ['ED', 90, 52], ['COC', 50, 37], ...ATT2]),
  f('3-4-2-1', 'Difesa a 3', D3, [['ES', 10, 52], ['CC', 36, 56], ['CC', 64, 56], ['ED', 90, 52], ['COC', 32, 34], ['COC', 68, 34], ...ATT1]),
  f('3-4-3 Flat', 'Difesa a 3', D3, [['ES', 10, 52], ['CC', 36, 56], ['CC', 64, 56], ['ED', 90, 52], ...TRIDENTE]),
  f('3-5-2', 'Difesa a 3', D3, [...CDC2, ['ES', 10, 47], ['ED', 90, 47], ['COC', 50, 38], ...ATT2]),

  // Difesa a 4
  f('4-1-2-1-2 Narrow', 'Difesa a 4', D4, [['CDC', 50, 63], ['CC', 30, 50], ['CC', 70, 50], ['COC', 50, 36], ...ATT2]),
  f('4-1-2-1-2 Wide', 'Difesa a 4', D4, [['CDC', 50, 63], ['ES', 14, 47], ['ED', 86, 47], ['COC', 50, 36], ...ATT2]),
  f('4-1-3-2', 'Difesa a 4', D4, [['CDC', 50, 63], ['ES', 14, 47], ['CC', 50, 48], ['ED', 86, 47], ...ATT2]),
  f('4-1-4-1', 'Difesa a 4', D4, [['CDC', 50, 63], ['ES', 13, 45], ['CC', 36, 48], ['CC', 64, 48], ['ED', 87, 45], ...ATT1]),
  f('4-2-1-3', 'Difesa a 4', D4, [...CDC2, ['COC', 50, 40], ...TRIDENTE]),
  f('4-2-2-2', 'Difesa a 4', D4, [...CDC2, ['COC', 24, 38], ['COC', 76, 38], ...ATT2]),
  f('4-2-3-1 Narrow', 'Difesa a 4', D4, [...CDC2, ['COC', 25, 38], ['COC', 50, 36], ['COC', 75, 38], ...ATT1]),
  f('4-2-3-1 Wide', 'Difesa a 4', D4, [...CDC2, ['ES', 14, 38], ['COC', 50, 38], ['ED', 86, 38], ...ATT1]),
  f('4-2-4', 'Difesa a 4', D4, [['CC', 36, 55], ['CC', 64, 55], ['AS', 12, 25], ['ATT', 37, 18], ['ATT', 63, 18], ['AD', 88, 25]]),
  f('4-3-1-2', 'Difesa a 4', D4, [['CC', 25, 53], ['CC', 50, 56], ['CC', 75, 53], ['COC', 50, 37], ...ATT2]),
  f('4-3-2-1', 'Difesa a 4', D4, [['CC', 25, 53], ['CC', 50, 56], ['CC', 75, 53], ['COC', 32, 34], ['COC', 68, 34], ...ATT1]),
  f('4-3-3 Attack', 'Difesa a 4', D4, [['CC', 32, 55], ['CC', 68, 55], ['COC', 50, 39], ...TRIDENTE]),
  f('4-3-3 Defend', 'Difesa a 4', D4, [...CDC2, ['CC', 50, 48], ...TRIDENTE]),
  f('4-3-3 Flat', 'Difesa a 4', D4, [['CC', 25, 52], ['CC', 50, 54], ['CC', 75, 52], ...TRIDENTE]),
  f('4-3-3 Holding', 'Difesa a 4', D4, [['CDC', 50, 63], ['CC', 31, 50], ['CC', 69, 50], ...TRIDENTE]),
  f('4-4-1-1 Midfield', 'Difesa a 4', D4, [...MID4_FLAT, ['COC', 50, 34], ...ATT1]),
  f('4-4-2 Flat', 'Difesa a 4', D4, [...MID4_FLAT, ...ATT2]),
  f('4-4-2 Holding', 'Difesa a 4', D4, [...CDC2, ['ES', 13, 46], ['ED', 87, 46], ...ATT2]),
  f('4-5-1 Attack', 'Difesa a 4', D4, [['ES', 13, 46], ['CC', 50, 57], ['ED', 87, 46], ['COC', 32, 36], ['COC', 68, 36], ...ATT1]),
  f('4-5-1 Flat', 'Difesa a 4', D4, [['ES', 11, 46], ['CC', 30, 52], ['CC', 50, 55], ['CC', 70, 52], ['ED', 89, 46], ...ATT1]),

  // Difesa a 5
  f('5-2-1-2', 'Difesa a 5', D5, [['CC', 35, 55], ['CC', 65, 55], ['COC', 50, 38], ...ATT2]),
  f('5-2-3', 'Difesa a 5', D5, [['CC', 35, 55], ['CC', 65, 55], ['AS', 18, 25], ['ATT', 50, 17], ['AD', 82, 25]]),
  f('5-3-2 Holding', 'Difesa a 5', D5, [['CDC', 50, 60], ['CC', 29, 50], ['CC', 71, 50], ...ATT2]),
  f('5-4-1 Flat', 'Difesa a 5', D5, [['ES', 12, 47], ['CC', 37, 52], ['CC', 63, 52], ['ED', 88, 47], ...ATT1]),
]

export const FORMATION_GROUPS = ['Difesa a 3', 'Difesa a 4', 'Difesa a 5']

export const getFormation = (id) => FORMATIONS.find((x) => x.id === id) ?? FORMATIONS.find((x) => x.id === '4-3-3 Holding')
