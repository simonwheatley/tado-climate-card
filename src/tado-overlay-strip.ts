import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { HomeAssistant, HassEntity, TerminationType } from "./types.js";

function remainingLabel(type: TerminationType, timestamp?: string): string {
  switch (type) {
    case "TIMER": {
      if (!timestamp) return "Timed override";
      const ms = new Date(timestamp).getTime() - Date.now();
      if (ms <= 0) return "Expiring";
      const mins = Math.round(ms / 60000);
      if (mins < 60) return `${mins}m remaining`;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m remaining` : `${h}h remaining`;
    }
    case "NEXT_TIME_BLOCK": return "Until next time block";
    case "MANUAL":          return "Until you resume schedule";
    case "TADO_MODE":       return "Zone default";
  }
}

@customElement("tado-overlay-strip")
export class TadoOverlayStrip extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entity!: HassEntity;

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

    .remaining {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.84em;
      color: var(--secondary-text-color);
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--warning-color, #f4b400);
      flex-shrink: 0;
    }

    .duration-text {
      cursor: pointer;
      border-radius: 4px;
      padding: 2px 4px;
    }

    .duration-text:hover { color: var(--primary-color); }

    .pencil-btn {
      background: none;
      border: none;
      padding: 4px 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: var(--secondary-text-color);
      border-radius: 4px;
    }

    .pencil-btn:hover { color: var(--primary-color); }

    .pencil-btn ha-icon {
      --mdc-icon-size: 15px;
      color: inherit;
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
    return this.entity.attributes.HA_TERMINATION_TYPE;
  }

  private get _isOverrideActive(): boolean {
    const t = this._terminationType;
    return t === "MANUAL" || t === "TIMER" || t === "NEXT_TIME_BLOCK";
  }

  private _resume(e: Event) {
    e.stopPropagation();
    this.hass.callService("tado", "resume_schedule", {}, {
      entity_id: this.entity.entity_id,
    });
  }

  private _openPopupInEditMode(e: Event) {
    e.stopPropagation();
    (window as unknown as { __tadoEditOnOpen?: string }).__tadoEditOnOpen =
      this.entity.entity_id;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId: this.entity.entity_id },
    }));
  }

  render() {
    if (!this._isOverrideActive) return nothing;

    const type = this._terminationType!;
    const timestamp = this.entity.attributes.HA_TERMINATION_TIMESTAMP;
    const label = remainingLabel(type, timestamp);

    return html`
      <div class="strip">
        <div class="summary-row">
          <div class="remaining">
            <span class="dot"></span>
            <span class="duration-text" @click=${this._openPopupInEditMode}>${label}</span>
            <button class="pencil-btn" title="Edit duration"
              @click=${this._openPopupInEditMode}>
              <ha-icon .icon=${"mdi:pencil"}></ha-icon>
            </button>
          </div>
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
