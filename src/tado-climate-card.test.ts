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

  describe("integration-extras detection", () => {
    /** Helper: stock-HA Tado entity (no HA_* attributes). */
    const stockEntity = {
      entity_id: "climate.utility",
      state: "auto",
      attributes: {
        friendly_name: "Utility",
        current_temperature: 16.8,
        temperature: 16.5,
        hvac_action: "idle",
        // Lowercase upstream attribute — present, but not the extras
        default_overlay_type: "MANUAL",
        default_overlay_seconds: null,
      },
    };

    /** Helper: extras-installed Tado entity (HA_TERMINATION_TYPE present). */
    const extrasEntity = {
      ...stockEntity,
      attributes: {
        ...stockEntity.attributes,
        HA_TERMINATION_TYPE: "TADO_MODE",
      },
    };

    function makeCard(entity: typeof stockEntity): TadoClimateCard {
      const card = document.createElement("tado-climate-card") as TadoClimateCard;
      (card as any).hass = {
        states: { [entity.entity_id]: entity },
        callService: vi.fn(),
      };
      card.setConfig({ entity: entity.entity_id });
      document.body.appendChild(card);
      return card;
    }

    it("renders an extras-required banner when HA_TERMINATION_TYPE is missing", async () => {
      const card = makeCard(stockEntity);
      await (card as any).updateComplete;

      const banner = card.shadowRoot!.querySelector(".extras-required");
      expect(banner).not.toBeNull();
      expect(banner!.textContent).toMatch(/Tado Integration Extras/i);

      card.remove();
    });

    it("includes a HACS deep link to install the extras", async () => {
      const card = makeCard(stockEntity);
      await (card as any).updateComplete;

      const link = card.shadowRoot!.querySelector(".extras-required a") as HTMLAnchorElement;
      expect(link).not.toBeNull();
      expect(link.href).toContain("hacs");
      expect(link.href).toContain("tado-integration-extras");
    });

    it("does NOT render the banner when HA_TERMINATION_TYPE is present", async () => {
      const card = makeCard(extrasEntity);
      await (card as any).updateComplete;

      const banner = card.shadowRoot!.querySelector(".extras-required");
      expect(banner).toBeNull();

      card.remove();
    });
  });
});
