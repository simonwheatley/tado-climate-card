import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, HassEntity, TerminationType } from "./types.js";
import { sliderColor } from "./slider-color.js";
import { radiatorIconProps } from "./heating-color.js";

const STEP = 0.5;
const SLIDER_MIN = 0; // 0 = Off
const MIN_TEMP = 5;
const MAX_TEMP = 25;

type DurationKey = "TIMER_30" | "TIMER_60" | "TIMER_120" | "NEXT_TIME_BLOCK" | "MANUAL";

interface DurationOption {
  key: DurationKey;
  label: string;
  summary: string;
  minutes?: number;
  overlay?: "NEXT_TIME_BLOCK" | "MANUAL";
}

const DURATIONS: DurationOption[] = [
  { key: "TIMER_30",        label: "30m",             summary: "For 30 minutes",              minutes: 30 },
  { key: "TIMER_60",        label: "1h",              summary: "For 1 hour",                  minutes: 60 },
  { key: "TIMER_120",       label: "2h",              summary: "For 2 hours",                 minutes: 120 },
  { key: "NEXT_TIME_BLOCK", label: "Next time block", summary: "Until next time block",       overlay: "NEXT_TIME_BLOCK" },
  { key: "MANUAL",          label: "∞",               summary: "Until you resume schedule",   overlay: "MANUAL" },
];

// Persists across popup opens within the session
let _lastUsedDuration: DurationKey | null = null;

function terminationToKey(type: TerminationType): DurationKey | null {
  if (type === "NEXT_TIME_BLOCK") return "NEXT_TIME_BLOCK";
  if (type === "MANUAL") return "MANUAL";
  if (type === "TIMER") return _lastUsedDuration ?? "TIMER_60";
  return null;
}

function isTadoEntity(entity: HassEntity): boolean {
  return (
    "HA_DEFAULT_OVERLAY_TYPE" in entity.attributes ||
    "HA_TERMINATION_TYPE" in entity.attributes
  );
}

function displayValue(value: number): string {
  return value < MIN_TEMP ? "Off" : `${value.toFixed(1)}°`;
}

@customElement("tado-more-info-climate")
export class TadoMoreInfoClimate extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) stateObj!: HassEntity;

  /** Live drag value — updated every frame by slider-moved */
  @state() private _pendingValue: number | null = null;
  /** Which duration is currently committed (from entity or user selection) */
  @state() private _selectedDuration: DurationKey | null = null;
  /** True when pencil was tapped — show chips instead of summary */
  @state() private _editingDuration = false;

  private _lastEntityId: string | null = null;

  // Re-initialise state whenever a different entity opens in the popup
  override updated(changed: Map<string, unknown>) {
    if (changed.has("stateObj") && this.stateObj) {
      if (this.stateObj.entity_id !== this._lastEntityId) {
        this._lastEntityId = this.stateObj.entity_id;
        this._pendingValue = null;
        this._editingDuration = false;

        // Pre-load existing override into committed state
        const type = this.stateObj.attributes.HA_TERMINATION_TYPE;
        if (type && type !== "TADO_MODE") {
          this._selectedDuration = terminationToKey(type);
        } else {
          this._selectedDuration = null;
        }

      }
    }
  }

  static styles = css`
    :host {
      display: block;
      padding: 0 24px 24px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    ha-icon {
      --mdc-icon-size: 24px;
      flex-shrink: 0;
    }

    .name {
      font-size: 1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .temp-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 20px;
      padding-left: 34px;
    }

    .inside-now {
      font-size: 0.82em;
      color: var(--secondary-text-color);
    }

    .target-temp-label {
      font-size: 2.2em;
      font-weight: 300;
      color: var(--primary-text-color);
      line-height: 1.1;
    }

    .slider-wrap {
      display: flex;
      justify-content: center;
      padding: 8px 0 16px;
    }

    ha-control-slider {
      height: 220px;
      --control-slider-thickness: 60px;
      --control-slider-background-opacity: 0.15;
    }

    /* ── Duration section ─────────────────────────────────── */

    .duration-section {
      padding-top: 14px;
      border-top: 1px solid var(--divider-color);
    }

    .change-until-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .change-until-label {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }

    .close-btn {
      background: none;
      border: none;
      padding: 2px 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: var(--secondary-text-color);
      border-radius: 4px;
    }

    .close-btn:hover {
      color: var(--primary-text-color);
      background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    }

    .close-btn ha-icon {
      --mdc-icon-size: 18px;
      color: inherit;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chip {
      padding: 5px 14px;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 0.82em;
      cursor: pointer;
      white-space: nowrap;
      transition: border-color 0.15s, background 0.15s;
    }

    .chip:hover {
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }

    /* ── Committed row (timer + pencil + resume in one line) ─ */

    .duration-committed-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .duration-edit-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: none;
      border: none;
      padding: 4px 6px;
      cursor: pointer;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 500;
      color: var(--primary-text-color);
      font-family: inherit;
    }

    .duration-edit-btn:hover {
      color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
    }

    .duration-edit-btn ha-icon {
      --mdc-icon-size: 16px;
      color: inherit;
    }

    .resume-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border: none;
      border-radius: 16px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      font-size: 0.82em;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      margin-left: auto;
    }

    .resume-btn:hover {
      filter: brightness(1.1);
    }

    .resume-btn ha-icon {
      --mdc-icon-size: 15px;
      color: inherit;
    }
  `;

  // ── Helpers ───────────────────────────────────────────────

  private _applyDuration(option: DurationOption, temp: number) {
    if (option.minutes !== undefined) {
      const h = Math.floor(option.minutes / 60);
      const m = option.minutes % 60;
      this.hass.callService("tado", "set_climate_timer", {
        time_period: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
        temperature: temp,
      }, { entity_id: this.stateObj.entity_id });
    } else {
      this.hass.callService("tado", "set_climate_timer", {
        requested_overlay: option.overlay,
        temperature: temp,
      }, { entity_id: this.stateObj.entity_id });
    }
  }

  // ── Event handlers ────────────────────────────────────────

  private _onSliderMoved(e: CustomEvent<{ value?: number }>) {
    if (e.detail.value !== undefined) this._pendingValue = e.detail.value;
  }

  private _onSliderChanged(e: CustomEvent<{ value: number }>) {
    const value = e.detail.value;
    this._pendingValue = value;

    if (value === 0) {
      // Turning off — call off service and show duration chips
      this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "off" }, {
        entity_id: this.stateObj.entity_id,
      });
      this._selectedDuration = null;
      this._editingDuration = true;
    } else {
      // Immediately apply with last-used duration, or default to NEXT_TIME_BLOCK
      const snap = Math.round(Math.min(MAX_TEMP, Math.max(MIN_TEMP, value)) / STEP) * STEP;
      this._pendingValue = snap;
      const durationKey: DurationKey =
        _lastUsedDuration ?? this._selectedDuration ?? "NEXT_TIME_BLOCK";
      const opt = DURATIONS.find((d) => d.key === durationKey)!;
      this._applyDuration(opt, snap);
      this._selectedDuration = durationKey;
      // Keep chips visible so user can change duration if the auto-applied
      // one wasn't what they wanted.
      this._editingDuration = true;

      // Turn heat on if currently off
      if (this.stateObj.state === "off") {
        this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "heat" }, {
          entity_id: this.stateObj.entity_id,
        });
      }
    }
  }

  private _selectDuration(option: DurationOption) {
    _lastUsedDuration = option.key;
    this._selectedDuration = option.key;
    this._editingDuration = false;

    const temp = Math.round(
      Math.min(MAX_TEMP, Math.max(MIN_TEMP,
        this._pendingValue ?? this.stateObj.attributes.temperature ?? 20))
      / STEP
    ) * STEP;

    this._applyDuration(option, temp);
  }

  private _resume() {
    this.hass.callService("tado", "resume_schedule", {}, {
      entity_id: this.stateObj.entity_id,
    });
    this._selectedDuration = null;
    this._editingDuration = false;
    this._pendingValue = null;
  }

  // ── Duration section renderer ─────────────────────────────

  private _renderDurationSection() {
    // Chip picker — no resume button shown
    if (this._editingDuration) {
      return html`
        <div class="duration-section">
          <div class="change-until-header">
            <span class="change-until-label">Change until</span>
            <button class="close-btn" title="Close"
              @click=${() => { this._editingDuration = false; }}>
              <ha-icon .icon=${"mdi:close"}></ha-icon>
            </button>
          </div>
          <div class="chips">
            ${DURATIONS.map((opt) => html`
              <button class="chip" @click=${() => this._selectDuration(opt)}>
                ${opt.label}
              </button>
            `)}
          </div>
        </div>
      `;
    }

    // Committed — single row: timer text · pencil · resume
    if (this._selectedDuration) {
      const selected = DURATIONS.find((d) => d.key === this._selectedDuration)!;
      return html`
        <div class="duration-section">
          <div class="duration-committed-row">
            <button class="duration-edit-btn" title="Edit duration"
              @click=${() => { this._editingDuration = true; }}>
              <span>${selected.summary}</span>
              <ha-icon .icon=${"mdi:pencil"}></ha-icon>
            </button>
            <button class="resume-btn" @click=${this._resume}>
              <ha-icon .icon=${"mdi:restore"}></ha-icon>
              Resume schedule
            </button>
          </div>
        </div>
      `;
    }

    return nothing;
  }

  // ── Render ────────────────────────────────────────────────

  render() {
    const entity = this.stateObj;
    if (!entity || !isTadoEntity(entity)) return nothing;

    const currentTemp = entity.attributes.current_temperature;
    const isOff = entity.state === "off";
    const targetTemp = entity.attributes.temperature ?? 20;
    const liveValue = this._pendingValue ?? (isOff ? 0 : targetTemp);
    const { icon, color: iconColor } = radiatorIconProps(this.hass, entity);

    return html`
      <div class="header">
        <ha-icon
          .icon=${icon}
          style="color:${iconColor}"
        ></ha-icon>
        <span class="name">${entity.attributes.friendly_name}</span>
      </div>

      <div class="temp-info">
        <span class="inside-now">Inside now ${currentTemp?.toFixed(1) ?? "--"}°</span>
        <span class="target-temp-label">${displayValue(liveValue)}</span>
      </div>

      <div class="slider-wrap">
        <ha-control-slider
          .value=${liveValue}
          .min=${SLIDER_MIN}
          .max=${MAX_TEMP}
          .step=${STEP}
          .vertical=${true}
          mode="start"
          .showHandle=${true}
          tooltipMode="never"
          label="Target temperature"
          style="--control-slider-color:${sliderColor(liveValue)};--control-slider-background:${sliderColor(liveValue)}"
          @slider-moved=${this._onSliderMoved}
          @value-changed=${this._onSliderChanged}
        ></ha-control-slider>
      </div>

      ${this._renderDurationSection()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tado-more-info-climate": TadoMoreInfoClimate;
  }
}
