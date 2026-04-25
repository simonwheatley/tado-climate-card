// Per-user, cross-device preference storage backed by HA's
// `frontend/{get,set}_user_data` WebSocket API.
//
// HA persists this blob server-side, scoped to the logged-in user, so it
// follows them across devices and browsers. We cache the loaded blob in
// module memory and do single-flight loads to avoid duplicate round-trips.

import type { HomeAssistant } from "./types.js";

const STORAGE_KEY = "tado_card";

export type AppliedOverlayType = "NEXT_TIME_BLOCK" | "MANUAL";

export interface AppliedOverlay {
  type: AppliedOverlayType;
  /** The HA_TERMINATION_TIMESTAMP value at the moment we applied this override.
   *  Used as a fingerprint to detect whether the entity's current overlay is
   *  still the one we set (vs. having been replaced from another source). */
  terminationTimestamp: string | null;
}

interface PrefsBlob {
  /** entity_id → DurationKey (e.g. "TIMER_60", "NEXT_TIME_BLOCK", "MANUAL") */
  durations?: Record<string, string>;
  /** entity_id → marker for the last overlay we applied that the integration
   *  doesn't faithfully report back (specifically, NEXT_TIME_BLOCK is reported
   *  as TIMER by the Tado API). */
  appliedOverlays?: Record<string, AppliedOverlay>;
}

let _cache: PrefsBlob | null = null;
let _loadPromise: Promise<PrefsBlob> | null = null;

async function load(hass: HomeAssistant): Promise<PrefsBlob> {
  if (_cache) return _cache;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    try {
      const result = await hass.connection.sendMessagePromise<{ value: PrefsBlob | null }>({
        type: "frontend/get_user_data",
        key: STORAGE_KEY,
      });
      _cache = result?.value ?? {};
    } catch (e) {
      console.warn("[tado-card] failed to load user prefs:", e);
      _cache = {};
    }
    return _cache!;
  })();

  return _loadPromise;
}

async function save(hass: HomeAssistant): Promise<void> {
  if (!_cache) return;
  try {
    await hass.connection.sendMessagePromise({
      type: "frontend/set_user_data",
      key: STORAGE_KEY,
      value: _cache,
    });
  } catch (e) {
    console.warn("[tado-card] failed to save user prefs:", e);
  }
}

// ── Duration preference (per entity) ─────────────────────────────────────

export async function getDurationPref(
  hass: HomeAssistant,
  entityId: string,
): Promise<string | null> {
  const blob = await load(hass);
  return blob.durations?.[entityId] ?? null;
}

export async function setDurationPref(
  hass: HomeAssistant,
  entityId: string,
  key: string,
): Promise<void> {
  const blob = await load(hass);
  blob.durations = { ...(blob.durations ?? {}), [entityId]: key };
  await save(hass);
}

// ── Applied overlay marker (per entity) ──────────────────────────────────

export async function getAppliedOverlay(
  hass: HomeAssistant,
  entityId: string,
): Promise<AppliedOverlay | null> {
  const blob = await load(hass);
  return blob.appliedOverlays?.[entityId] ?? null;
}

export async function setAppliedOverlay(
  hass: HomeAssistant,
  entityId: string,
  marker: AppliedOverlay,
): Promise<void> {
  const blob = await load(hass);
  blob.appliedOverlays = { ...(blob.appliedOverlays ?? {}), [entityId]: marker };
  await save(hass);
}

/**
 * Effective termination type for display.
 * Substitutes a stored marker for `NEXT_TIME_BLOCK` if its timestamp matches
 * the entity's current `HA_TERMINATION_TIMESTAMP` — a Tado API quirk: the
 * integration reports a NEXT_TIME_BLOCK overlay as `TIMER` with a calculated
 * end time, so without this we couldn't render "Until next time block" once
 * the popup is closed and re-opened.
 */
export function effectiveTermination(
  rawType: string | null | undefined,
  rawTimestamp: string | undefined,
  marker: AppliedOverlay | null,
): string | null | undefined {
  if (
    rawType === "TIMER" &&
    marker &&
    marker.type === "NEXT_TIME_BLOCK" &&
    marker.terminationTimestamp === (rawTimestamp ?? null)
  ) {
    return "NEXT_TIME_BLOCK";
  }
  return rawType;
}
