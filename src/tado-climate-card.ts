import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, HassEntity, TadoCardConfig } from "./types.js";
import { sliderColor } from "./slider-color.js";
import { radiatorIconProps } from "./heating-color.js";
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
      // Off position
      this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "off" }, { entity_id: entity.entity_id });
    } else {
      // Snap anything dragged into the dead zone (0–5) up to MIN_TEMP
      const temp = Math.round(Math.min(MAX_TEMP, Math.max(MIN_TEMP, raw)) / STEP) * STEP;
      this.hass.callService("climate", "set_temperature", { temperature: temp }, { entity_id: entity.entity_id });
      if (entity.state === "off") {
        this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "heat" }, { entity_id: entity.entity_id });
      }
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
    if (this._liveValue === null) return;
    const entity = this._entity;
    if (!entity) return;
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
      return html`<ha-card><div style="padding:16px;color:var(--error-color)">Entity not found: ${this._config?.entity}</div></ha-card>`;
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

        <div @click=${(e: Event) => e.stopPropagation()}>
          <tado-overlay-strip
            .hass=${this.hass}
            .entity=${entity}
          ></tado-overlay-strip>
        </div>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tado-climate-card": TadoClimateCard;
  }
}
