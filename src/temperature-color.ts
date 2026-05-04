/**
 * Single source of truth for "what colour represents this temperature".
 * Used by:
 *  - the slider track + handle (in card and popup)
 *  - the compact card's full-saturation background
 *
 * Off  (0)       → grey
 * Cool (5–18.5)  → teal → green  (linear interpolation)
 * Warm (19–25)   → amber → deep-orange (linear interpolation)
 * Gap  (18.5–19) → snaps to green / amber at midpoint
 *
 * Colour values from Material Design / HA tile card palette:
 * https://www.home-assistant.io/dashboards/tile/#available-colors
 */

type RGB = [number, number, number];

const C = {
  grey:       [158, 158, 158] as RGB,
  teal:       [  0, 150, 136] as RGB,
  green:      [ 76, 175,  80] as RGB,
  amber:      [255, 193,   7] as RGB,  // #ffc107 — was yellow #ffeb3b
  deepOrange: [255,  87,  34] as RGB,
} as const;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * clamp(t, 0, 1));
}

function rgb(c: RGB): string {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function lerpRgb(c1: RGB, c2: RGB, t: number): string {
  return `rgb(${lerp(c1[0], c2[0], t)}, ${lerp(c1[1], c2[1], t)}, ${lerp(c1[2], c2[2], t)})`;
}

/**
 * Returns the CSS `rgb(…)` colour for a given temperature value (°C).
 *   0        → grey   (off)
 *   5–18.5   → teal → green
 *   18.5–19  → green / amber (snaps at midpoint 18.75)
 *   19–25    → amber → deep-orange
 */
export function temperatureColor(value: number): string {
  if (value < 5) return rgb(C.grey);   // Off zone: 0 → 4.5 all grey
  if (value <= 18.5) return lerpRgb(C.teal, C.green, (value - 5) / (18.5 - 5));
  if (value < 18.75) return rgb(C.green);
  if (value < 19) return rgb(C.amber);
  return lerpRgb(C.amber, C.deepOrange, (value - 19) / (25 - 19));
}
