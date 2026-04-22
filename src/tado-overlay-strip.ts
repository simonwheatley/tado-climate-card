import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, HassEntity, TerminationType } from "./types.js";

const DURATION_CHIPS: { label: string; minutes?: number; overlay?: "NEXT_TIME_BLOCK" | "MANUAL" }[] = [
  { label: "30m", minutes: 30 },
  { label: "1h",  minutes: 60 },
  { label: "2h",  minutes: 120 },
  { label: "Next block", overlay: "NEXT_TIME_BLOCK" },
  { label: "∞",   overlay: "MANUAL" },
];

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
    case "NEXT_TIME_BLOCK": return "Until next block";
    case "MANUAL":          return "Until you resume schedule";
    case "TADO_MODE":       return "Zone default";
  }
}

@customElement("tado-overlay-strip")
export class TadoOverlayStrip extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) entity!: HassEntity;
  /** When true, hide the pencil and never show duration chips (dashboard card mode). */
  @property({ type: Boolean }) hideEdit = false;

  @state() private _editingDuration = false;

  static styles = css`
    :host { display: block; }

    .strip {
      padding-top: 12px;
      border-top: 1px solid var(--divider-color);
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Summary row ──────────────────────────── */

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    /* ── Duration chips ───────────────────────── */

    .change-until-label {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chip {
      padding: 5px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 0.82em;
      cursor: pointer;
      white-space: nowrap;
    }

    .chip:hover {
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }

    /* ── Resume button ────────────────────────── */

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

  private _resume() {
    this.hass.callService("tado", "resume_schedule", {}, {
      entity_id: this.entity.entity_id,
    });
  }

  private _selectChip(chip: typeof DURATION_CHIPS[number]) {
    const raw = this.entity.attributes.temperature ?? 20;
    const temp = Math.round(Math.min(25, Math.max(5, raw)) / 0.5) * 0.5;
    if (chip.minutes !== undefined) {
      const h = Math.floor(chip.minutes / 60);
      const m = chip.minutes % 60;
      this.hass.callService("tado", "set_climate_timer", {
        time_period: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
        temperature: temp,
      }, { entity_id: this.entity.entity_id });
    } else {
      this.hass.callService("tado", "set_climate_timer", {
        requested_overlay: chip.overlay,
        temperature: temp,
      }, { entity_id: this.entity.entity_id });
    }
    this._editingDuration = false;
  }

  render() {
    if (!this._isOverrideActive) return nothing;

    const type = this._terminationType!;
    const timestamp = this.entity.attributes.HA_TERMINATION_TIMESTAMP;
    const label = remainingLabel(type, timestamp);

    return html`
      <div class="strip">
        ${(!this.hideEdit && this._editingDuration) ? html`
          <div class="change-until-label">Change until</div>
          <div class="chips">
            ${DURATION_CHIPS.map((c) => html`
              <button class="chip" @click=${() => this._selectChip(c)}>${c.label}</button>
            `)}
          </div>
        ` : html`
          <div class="summary-row">
            <div class="remaining">
              <span class="dot"></span>
              <span>${label}</span>
              ${!this.hideEdit ? html`
                <button class="pencil-btn" title="Change duration"
                  @click=${() => { this._editingDuration = true; }}>
                  <ha-icon .icon=${"mdi:pencil"}></ha-icon>
                </button>
              ` : nothing}
            </div>
            <button class="resume-btn" @click=${this._resume}>
              <ha-icon .icon=${"mdi:restore"}></ha-icon>
              Resume schedule
            </button>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tado-overlay-strip": TadoOverlayStrip;
  }
}
