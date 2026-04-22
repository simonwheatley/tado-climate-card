import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, HassEntity, TadoCardConfig } from "./types.js";
import { sliderColor } from "./slider-color.js";
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
      color: var(--state-climate-heat-color, #e45e65);
      flex-shrink: 0;
    }

    ha-icon.idle {
      color: var(--disabled-color, #9da0a2);
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
    this._liveValue = null; // snap back to entity-driven value
    this._applySliderValue(e.detail.value);
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
    const sliderValue = isOff ? 0 : targetTemp;
    const colorValue = this._liveValue ?? sliderValue;
    const isHeating = entity.attributes.hvac_action === "heating";
    const icon = isHeating ? "mdi:radiator" : "mdi:radiator-disabled";

    return html`
      <ha-card @click=${this._handleCardClick}>
        <div class="header">
          <ha-icon
            .icon=${icon}
            class=${isHeating ? "" : "idle"}
          ></ha-icon>
          <span class="name">${name}</span>
        </div>

        <div class="temp-info">
          <span class="inside-now">Inside now ${currentTemp?.toFixed(1) ?? "--"}°</span>
          <span class="target-temp-label">${colorValue < 5 ? "Off" : `${targetTemp.toFixed(1)}°`}</span>
        </div>

        <div class="slider-row">
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
          .hideEdit=${true}
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
