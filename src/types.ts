export type HvacAction = "heating" | "cooling" | "idle" | "off";
export type HvacMode = "heat" | "cool" | "auto" | "off" | "heat_cool" | "fan_only" | "dry";
export type PresetMode = "home" | "away" | "auto" | "none" | "boost" | "sleep";

// null = following smart schedule (no active overlay)
export type TerminationType = "MANUAL" | "TIMER" | "NEXT_TIME_BLOCK" | "TADO_MODE" | null;

export interface TadoClimateAttributes {
  current_temperature: number;
  temperature: number;
  hvac_action: HvacAction;
  hvac_modes: HvacMode[];
  preset_mode: PresetMode;
  preset_modes: PresetMode[];
  friendly_name: string;
  // Tado overlay attributes
  HA_TERMINATION_TYPE?: TerminationType;
  HA_TERMINATION_DURATION?: number;
  HA_TERMINATION_TIMESTAMP?: string;
  // Tado default overlay config
  HA_DEFAULT_OVERLAY_TYPE?: TerminationType;
  HA_DEFAULT_OVERLAY_DURATION?: number;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: TadoClimateAttributes & Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: { id: string; parent_id: string | null; user_id: string | null };
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: { entity_id?: string | string[] }
  ): Promise<void>;
  formatEntityState(entity: HassEntity): string;
  formatEntityAttributeValue(entity: HassEntity, attribute: string): string;
  locale: { language: string };
}

export interface TadoCardConfig {
  type: string;
  entity: string;
  name?: string;
  show_current_as_primary?: boolean;
}

// ── HA frontend web component type stubs ─────────────────────────────────────
declare global {
  interface HTMLElementTagNameMap {
    "ha-control-slider": HTMLElement & {
      value: number;
      min: number;
      max: number;
      step: number;
      vertical: boolean;
      disabled: boolean;
      inverted: boolean;
      mode: "start" | "end" | "cursor";
      showHandle: boolean;
      label: string;
      unit: string;
      tooltipMode: "never" | "always" | "interaction";
    };
    "ha-icon": HTMLElement & {
      icon: string;
    };
  }
}
