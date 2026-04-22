import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "./tado-climate-card.js";
import type { TadoClimateCard } from "./tado-climate-card.js";

const mockHass = {
  states: {
    "climate.bedroom": {
      entity_id: "climate.bedroom",
      state: "heat",
      attributes: {
        friendly_name: "Bedroom",
        current_temperature: 20,
        temperature: 19,
        hvac_action: "heating",
        HA_TERMINATION_TYPE: "TADO_MODE",
        HA_DEFAULT_OVERLAY_TYPE: "TADO_DEFAULT",
      },
    },
  },
  callService: vi.fn(),
};

describe("tado-climate-card", () => {
  let el: TadoClimateCard;

  beforeEach(async () => {
    el = document.createElement("tado-climate-card") as TadoClimateCard;
    (el as any).hass = mockHass;
    el.setConfig({ entity: "climate.bedroom" });
    document.body.appendChild(el);
    await (el as any).updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  describe("tap-to-popup", () => {
    it("fires hass-more-info with correct entityId when ha-card is clicked", async () => {
      let detail: Record<string, unknown> | null = null;
      el.addEventListener("hass-more-info", (e) => {
        detail = (e as CustomEvent).detail;
      });

      const card = el.shadowRoot!.querySelector("ha-card") as HTMLElement;
      card.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));

      expect(detail).toEqual({ entityId: "climate.bedroom" });
    });

    it("does not throw when entity is missing", () => {
      const orphan = document.createElement("tado-climate-card") as TadoClimateCard;
      (orphan as any).hass = { states: {}, callService: vi.fn() };
      orphan.setConfig({ entity: "climate.nonexistent" });
      // Should not throw — guard in handler
      expect(() => (orphan as any)._handleCardClick()).not.toThrow();
    });
  });
});
