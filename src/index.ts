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
// When HA opens a more-info dialog for any climate entity it renders
// <more-info-climate stateObj=... hass=...>.  We intercept that render and,
// if the entity carries Tado attributes, swap in <tado-more-info-climate>.

function isTadoStateObj(stateObj: Record<string, any> | undefined): boolean {
  if (!stateObj?.attributes) return false;
  const a = stateObj.attributes;
  return (
    "HA_DEFAULT_OVERLAY_TYPE" in a ||
    "HA_TERMINATION_TYPE"     in a ||
    "default_overlay_type"    in a    // constant value used by built-in tado integration
  );
}

function patchClass(ctor: any) {
  if (!ctor?.prototype) return;
  if (ctor._tadoPatched) return;
  ctor._tadoPatched = true;

  console.info("[tado-card] patching more-info-climate ✓");

  const proto = ctor.prototype;
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

// ── Strategy 1: intercept customElements.define() before any instance is created ──
// Use Object.defineProperty (immune to non-writable prototype property) in a
// try/catch so a failure here doesn't break the rest of the module.
try {
  const _origDefine = customElements.define.bind(customElements);
  Object.defineProperty(customElements, "define", {
    configurable: true,
    writable: true,
    value: function (
      name: string,
      ctor: CustomElementConstructor,
      opts?: ElementDefinitionOptions
    ) {
      if (name === "more-info-climate") patchClass(ctor);
      return _origDefine(name, ctor, opts);
    },
  });
} catch (e) {
  console.warn("[tado-card] could not override customElements.define:", e);
}

// ── Strategy 2: whenDefined — fires when the element is first registered ──
customElements.whenDefined("more-info-climate").then(() => {
  patchClass(customElements.get("more-info-climate"));
});

// ── Strategy 3: hass-more-info event — fires just before popup opens ──
// If the element was already patched, requestUpdate ensures our render runs.
// If it wasn't (somehow), this gives us one more chance to find and patch it.
window.addEventListener("hass-more-info", () => {
  // Traverse shadow roots to find more-info-climate and force a re-render
  requestAnimationFrame(() => {
    const ctor = customElements.get("more-info-climate") as any;
    if (ctor && !ctor._tadoPatched) patchClass(ctor);

    // Walk shadow roots to reach the live element
    const walk = (root: Document | ShadowRoot): Element | null => {
      for (const el of Array.from(root.querySelectorAll("*"))) {
        if (el.tagName.toLowerCase() === "more-info-climate") return el;
        if ((el as Element & { shadowRoot?: ShadowRoot }).shadowRoot) {
          const found = walk((el as any).shadowRoot!);
          if (found) return found;
        }
      }
      return null;
    };
    const el = walk(document) as any;
    if (el?.requestUpdate) el.requestUpdate();
  });
});
