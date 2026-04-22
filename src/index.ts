import { html } from "lit";
import "./tado-climate-card.js";
import "./tado-more-info-climate.js";
import "./tado-overlay-strip.js";

// Register card with HA's custom card registry
(window as Window & { customCards?: unknown[] }).customCards =
  (window as Window & { customCards?: unknown[] }).customCards ?? [];
(window as Window & { customCards: unknown[] }).customCards.push({
  type: "tado-climate-card",
  name: "Tado Climate Card",
  description: "Climate card for Tado zones with schedule override controls",
  preview: true,
  documentationURL: "https://github.com/simonwheatley/HA-Tado",
});

// ── Patch more-info-climate to use our UI for Tado entities ──────────────────
//
// When HA opens a more-info dialog for any climate entity, it renders
// <more-info-climate stateObj=... hass=...>. We intercept that render and,
// if the entity carries Tado attributes, swap in <tado-more-info-climate>.

function isTadoStateObj(stateObj: Record<string, any> | undefined): boolean {
  if (!stateObj?.attributes) return false;
  return (
    "HA_DEFAULT_OVERLAY_TYPE" in stateObj.attributes ||
    "HA_TERMINATION_TYPE" in stateObj.attributes
  );
}

function patchMoreInfoClimate() {
  const MoreInfoClimate = customElements.get("more-info-climate") as any;
  if (!MoreInfoClimate) return;

  // Guard against double-patching
  if (MoreInfoClimate._tadoPatched) return;
  MoreInfoClimate._tadoPatched = true;

  const proto = MoreInfoClimate.prototype;
  const origRender = proto.render;

  proto.render = function (this: any) {
    if (isTadoStateObj(this.stateObj)) {
      return html`
        <tado-more-info-climate
          .hass=${this.hass}
          .stateObj=${this.stateObj}
        ></tado-more-info-climate>
      `;
    }
    return origRender.call(this);
  };
}

// more-info-climate is lazy-loaded by HA — wait until it's defined
customElements.whenDefined("more-info-climate").then(patchMoreInfoClimate);
