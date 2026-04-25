import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, HassEntity, TadoCardConfig } from "./types.js";
import { sliderColor } from "./slider-color.js";
import { radiatorIconProps } from "./heating-color.js";
import { setAppliedOverlay } from "./user-prefs.js";
import "./tado-overlay-strip.js";

const STEP = 0.5;
const SLIDER_MIN = 0;   // 0 = Off
const MIN_TEMP = 5;
const MAX_TEMP = 25;

@customElement("tado-climate-card")
export class TadoClimateCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: TadoCardConfig;
  @state() private _liveValue: number | null = null;
  /** When set, the next entity update with a fresh termination timestamp
   *  will be persisted as our NEXT_TIME_BLOCK marker. */
  private _pendingMark = false;
  private _preApplyTimestamp: string | undefined;

  static styles = css`
    :host {
      display: block;
    }

    ha-card {
      padding: 16px;
      cursor: pointer;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    ha-icon {
      --mdc-icon-size: 22px;
      flex-shrink: 0;
    }

    .name {
      font-size: 1em;
      font-weight: 500;
      color: var(--primary-text-color);
      flex: 1;
    }

    .temp-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 14px;
      padding-left: 32px;
    }

    .inside-now {
      font-size: 0.82em;
      color: var(--secondary-text-color);
    }

    .target-temp-label {
      font-size: 1.6em;
      font-weight: 300;
      color: var(--primary-text-color);
      line-height: 1.1;
    }

    .slider-row {
      padding: 8px 0;
    }

    ha-control-slider {
      display: block;
      width: 100%;
      --control-slider-thickness: 42px;
      --control-slider-background-opacity: 0.15;
    }

  `;

  setConfig(config: TadoCardConfig) {
    if (!config.entity) throw new Error("entity is required");
    this._config = config;
  }

  getCardSize() { return 3; }

  /**
   * Called by the Lovelace card picker. Returns a sensible default config
   * pre-filled with the first Tado climate entity we can find, plus the
   * `name` field exposed (set to its friendly_name) so users can see it
   * exists and easily override it.
   */
  static getStubConfig(hass: HomeAssistant): Partial<TadoCardConfig> {
    const tadoEntity = Object.values(hass?.states ?? {}).find(
      (s) => s.entity_id.startsWith("climate.") && (
        "HA_TERMINATION_TYPE" in s.attributes ||
        "HA_DEFAULT_OVERLAY_TYPE" in s.attributes
      )
    );
    return {
      entity: tadoEntity?.entity_id ?? "climate.YOUR_TADO_ZONE",
      name: (tadoEntity?.attributes.friendly_name as string) ?? "Living room",
    };
  }

  private get _entity(): HassEntity | undefined {
    return this.hass?.states[this._config?.entity];
  }

  private _handleCardClick() {
    if (!this._entity) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId: this._entity.entity_id },
    }));
  }

  private _onSliderMoved(e: CustomEvent<{ value?: number }>) {
    if (e.detail.value !== undefined) this._liveValue = e.detail.value;
  }

  private _applySliderValue(raw: number) {
    const entity = this._entity!;
    if (raw === 0) {
      // Off — note: climate.set_hvac_mode has no termination param, so the
      // resulting overlay duration is whatever the Tado zone default is.
      // Forcing MANUAL on Off would need an integration-side change.
      this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "off" }, { entity_id: entity.entity_id });
    } else {
      // Snap anything dragged into the dead zone (0–5) up to MIN_TEMP.
      // Dashboard temp changes always use NEXT_TIME_BLOCK, regardless of
      // any stored per-entity preference (preference only applies to
      // explicit chip picks in the popup).
      const temp = Math.round(Math.min(MAX_TEMP, Math.max(MIN_TEMP, raw)) / STEP) * STEP;
      this.hass.callService("tado", "set_climate_timer", {
        requested_overlay: "NEXT_TIME_BLOCK",
        temperature: temp,
      }, { entity_id: entity.entity_id });
      // Mark so we can render "Until next time block" later (the API reports
      // NEXT_TIME_BLOCK as TIMER). Captured in updated() once the entity
      // reflects the new overlay.
      this._pendingMark = true;
      this._preApplyTimestamp = entity.attributes.HA_TERMINATION_TIMESTAMP;
    }
  }

  private _onSliderChanged(e: CustomEvent<{ value: number }>) {
    const raw = e.detail.value;
    // Optimistic: keep _liveValue at the committed (snapped) value so the
    // label updates immediately. It is cleared in updated() once the entity
    // state catches up with what we just sent.
    const snapped = raw === 0
      ? 0
      : Math.round(Math.min(MAX_TEMP, Math.max(MIN_TEMP, raw)) / STEP) * STEP;
    this._liveValue = snapped;
    this._applySliderValue(raw);
  }

  override updated(_changed: Map<string, unknown>) {
    const entity = this._entity;
    if (!entity) return;

    // Persist a NEXT_TIME_BLOCK marker once the entity reflects the new
    // overlay. The Tado API reports NEXT_TIME_BLOCK as TIMER, so we record
    // the new timestamp as a fingerprint to recognise it on later reads.
    if (this._pendingMark) {
      const newTs = entity.attributes.HA_TERMINATION_TIMESTAMP;
      const rawType = entity.attributes.HA_TERMINATION_TYPE;
      if (rawType === "TIMER" && newTs && newTs !== this._preApplyTimestamp) {
        setAppliedOverlay(this.hass, entity.entity_id, {
          type: "NEXT_TIME_BLOCK",
          terminationTimestamp: newTs,
        });
        this._pendingMark = false;
        this._preApplyTimestamp = undefined;
      }
    }

    if (this._liveValue === null) return;
    const entityVal = entity.state === "off"
      ? 0
      : (entity.attributes.temperature ?? 20);
    if (Math.abs(entityVal - this._liveValue) < 0.01) {
      this._liveValue = null;
    }
  }

  render() {
    const entity = this._entity;
    if (!entity) {
      // Friendly placeholder when the stub's default entity is still in place
      // (i.e. user has no Tado zones, or hasn't picked one yet). Otherwise
      // surface a real "not found" message — this catches typos.
      const isPlaceholder = this._config?.entity === "climate.YOUR_TADO_ZONE";
      const message = isPlaceholder
        ? "Set the entity field to one of your Tado climate zones."
        : `Entity not found: ${this._config?.entity}`;
      return html`
        <ha-card>
          <div style="padding:16px;color:var(--secondary-text-color);font-size:0.9em">
            <div style="font-weight:500;color:var(--primary-text-color);margin-bottom:4px">
              Tado Climate Card
            </div>
            ${message}
          </div>
        </ha-card>
      `;
    }

    const name = this._config.name ?? entity.attributes.friendly_name;
    const currentTemp = entity.attributes.current_temperature;
    const isOff = entity.state === "off";
    const targetTemp = entity.attributes.temperature ?? 20;
    const entityValue = isOff ? 0 : targetTemp;
    const sliderValue = this._liveValue ?? entityValue;
    const colorValue = sliderValue;
    const { icon, color: iconColor } = radiatorIconProps(this.hass, entity);

    return html`
      <ha-card @click=${this._handleCardClick}>
        <div class="header">
          <ha-icon
            .icon=${icon}
            style="color:${iconColor}"
          ></ha-icon>
          <span class="name">${name}</span>
        </div>

        <div class="temp-info">
          <span class="inside-now">Inside now ${currentTemp?.toFixed(1) ?? "--"}°</span>
          <span class="target-temp-label">${sliderValue < 5 ? "Off" : `${sliderValue.toFixed(1)}°`}</span>
        </div>

        <div class="slider-row" @click=${(e: Event) => e.stopPropagation()}>
          <ha-control-slider
            .value=${sliderValue}
            .min=${SLIDER_MIN}
            .max=${MAX_TEMP}
            .step=${STEP}
            mode="start"
            .showHandle=${true}
            tooltipMode="never"
            label="Target temperature"
            style="--control-slider-color:${sliderColor(colorValue)};--control-slider-background:${sliderColor(colorValue)}"
            @slider-moved=${this._onSliderMoved}
            @value-changed=${this._onSliderChanged}
          ></ha-control-slider>
        </div>

        <tado-overlay-strip
          .hass=${this.hass}
          .entity=${entity}
        ></tado-overlay-strip>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tado-climate-card": TadoClimateCard;
  }
}
