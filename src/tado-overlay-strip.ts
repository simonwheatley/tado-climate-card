import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, HassEntity, TerminationType } from "./types.js";
import { getAppliedOverlay, effectiveTermination, type AppliedOverlay } from "./user-prefs.js";
import { remainingLabel } from "./termination-label.js";

@customElement("tado-overlay-strip")
export class TadoOverlayStrip extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entity!: HassEntity;
  @state() private _marker: AppliedOverlay | null = null;
  private _lastEntityId: string | null = null;

  override updated(changed: Map<string, unknown>) {
    if (changed.has("entity") && this.entity?.entity_id !== this._lastEntityId) {
      this._lastEntityId = this.entity.entity_id;
      this._marker = null;
      const entityId = this.entity.entity_id;
      getAppliedOverlay(this.hass, entityId).then((m) => {
        if (this._lastEntityId === entityId) this._marker = m;
      });
    }
  }

  static styles = css`
    :host { display: block; }

    .strip {
      padding-top: 12px;
      border-top: 1px solid var(--divider-color);
      margin-top: 12px;
    }

    .summary-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--warning-color, #f4b400);
      flex-shrink: 0;
    }

    .remaining {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.84em;
      color: var(--secondary-text-color);
    }

    .resume-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
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

    .resume-btn:hover { filter: brightness(1.1); }

    .resume-btn ha-icon {
      --mdc-icon-size: 15px;
      color: inherit;
    }
  `;

  private get _terminationType(): TerminationType | undefined {
    const raw = this.entity.attributes.HA_TERMINATION_TYPE;
    const ts = this.entity.attributes.HA_TERMINATION_TIMESTAMP;
    return effectiveTermination(raw, ts, this._marker) as TerminationType | undefined;
  }

  private get _isOverrideActive(): boolean {
    const t = this._terminationType;
    return t === "MANUAL" || t === "TIMER" || t === "NEXT_TIME_BLOCK";
  }

  // Stop click from bubbling to the card (which would open the popup)
  // so that Resume Schedule is a direct action.
  //
  // We call `climate.set_hvac_mode: auto` rather than a Tado-specific
  // service: the stock Tado integration maps HVACMode.AUTO to its internal
  // SMART_SCHEDULE, which resets the zone overlay. This keeps the card
  // functional on a vanilla HA install with no integration patching.
  private _resume(e: Event) {
    e.stopPropagation();
    this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "auto" }, {
      entity_id: this.entity.entity_id,
    });
  }

  render() {
    if (!this._isOverrideActive) return nothing;

    const type = this._terminationType!;
    const timestamp = this.entity.attributes.HA_TERMINATION_TIMESTAMP;
    const label = remainingLabel(type, timestamp);

    return html`
      <div class="strip">
        <div class="summary-row">
          <span class="remaining">
            <span class="dot"></span>
            <span>${label}</span>
          </span>
          <button class="resume-btn" @click=${this._resume}>
            <ha-icon .icon=${"mdi:restore"}></ha-icon>
            Resume schedule
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tado-overlay-strip": TadoOverlayStrip;
  }
}
