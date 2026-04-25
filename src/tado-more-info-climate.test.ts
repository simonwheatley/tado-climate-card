import { describe, it, expect, vi, afterEach } from "vitest";
import "./tado-more-info-climate.js";
import type { TadoMoreInfoClimate } from "./tado-more-info-climate.js";

const stockEntity = {
  entity_id: "climate.utility",
  state: "auto",
  attributes: {
    friendly_name: "Utility",
    current_temperature: 16.8,
    temperature: 16.5,
    hvac_action: "idle",
    hvac_modes: ["off", "auto", "heat"],
    // Lowercase upstream attribute — this is what stock HA exposes
    default_overlay_type: "MANUAL",
    default_overlay_seconds: null,
  },
};

const extrasEntity = {
  ...stockEntity,
  attributes: {
    ...stockEntity.attributes,
    HA_TERMINATION_TYPE: "TADO_MODE",
  },
};

const elements: HTMLElement[] = [];

afterEach(() => {
  elements.forEach((e) => e.remove());
  elements.length = 0;
});

function makePopup(entity: typeof stockEntity): TadoMoreInfoClimate {
  const popup = document.createElement("tado-more-info-climate") as TadoMoreInfoClimate;
  (popup as any).hass = {
    states: { [entity.entity_id]: entity },
    callService: vi.fn(),
    connection: { sendMessagePromise: vi.fn().mockResolvedValue({ value: null }) },
  };
  (popup as any).stateObj = entity;
  document.body.appendChild(popup);
  elements.push(popup);
  return popup;
}

describe("tado-more-info-climate", () => {
  describe("stock-HA support (no extras)", () => {
    it("renders the slider on stock-HA Tado entity (no HA_* attributes)", async () => {
      const popup = makePopup(stockEntity);
      await (popup as any).updateComplete;

      const slider = popup.shadowRoot!.querySelector("ha-control-slider");
      expect(slider).not.toBeNull();
    });

    it("renders an extras-required banner instead of duration controls", async () => {
      const popup = makePopup(stockEntity);
      await (popup as any).updateComplete;

      const banner = popup.shadowRoot!.querySelector(".extras-required");
      expect(banner).not.toBeNull();
      expect(banner!.textContent).toMatch(/Tado Integration Extras/i);
    });

    it("does NOT render the duration section when extras are missing", async () => {
      const popup = makePopup(stockEntity);
      await (popup as any).updateComplete;

      const durationSection = popup.shadowRoot!.querySelector(".duration-section");
      expect(durationSection).toBeNull();
    });
  });

  describe("with extras installed", () => {
    it("renders the slider", async () => {
      const popup = makePopup(extrasEntity);
      await (popup as any).updateComplete;

      const slider = popup.shadowRoot!.querySelector("ha-control-slider");
      expect(slider).not.toBeNull();
    });

    it("does NOT render the extras-required banner", async () => {
      const popup = makePopup(extrasEntity);
      await (popup as any).updateComplete;

      const banner = popup.shadowRoot!.querySelector(".extras-required");
      expect(banner).toBeNull();
    });
  });
});
