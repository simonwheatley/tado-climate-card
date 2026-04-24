import type { HomeAssistant, HassEntity } from "./types.js";

/** Interpolate between two hex colours (0 = a, 1 = b). */
function lerpHex(a: string, b: string, t: number): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

const YELLOW      = "#fdd835"; //  0 %
const AMBER       = "#ffa000"; // 50 %
const DEEP_ORANGE = "#f4511e"; // 100 %
const GRAY        = "#9da0a2";

/**
 * Try to read the heating-demand sensor for a climate entity.
 * Tado integration creates sensor.<zone>_heating (0–100 %).
 */
function heatingPct(hass: HomeAssistant, entity: HassEntity): number | null {
  const sensorId = entity.entity_id.replace("climate.", "sensor.") + "_heating";
  const sensor = hass.states[sensorId];
  if (!sensor || sensor.state === "unavailable" || sensor.state === "unknown") return null;
  const v = parseFloat(sensor.state);
  return isNaN(v) ? null : v;
}

/**
 * Returns { icon, color } for the radiator icon.
 *
 * Off   → radiator-disabled, gray
 * On    → radiator, yellow→amber→deep-orange based on heating % (0–100)
 *          falls back to amber when sensor unavailable and actively heating,
 *          or yellow when idle.
 */
export function radiatorIconProps(
  hass: HomeAssistant,
  entity: HassEntity
): { icon: string; color: string } {
  if (entity.state === "off") {
    return { icon: "mdi:radiator-disabled", color: GRAY };
  }

  const pct = heatingPct(hass, entity);
  let color: string;

  if (pct !== null) {
    const t = Math.max(0, Math.min(100, pct)) / 100;
    color = t <= 0.5
      ? lerpHex(YELLOW, AMBER, t * 2)
      : lerpHex(AMBER, DEEP_ORANGE, (t - 0.5) * 2);
  } else {
    // Fallback: amber when actively heating, yellow when idle
    color = entity.attributes.hvac_action === "heating" ? AMBER : YELLOW;
  }

  return { icon: "mdi:radiator", color };
}
