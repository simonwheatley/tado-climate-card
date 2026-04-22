import { describe, it, expect, vi, afterEach } from "vitest";
import "./tado-overlay-strip.js";
import type { TadoOverlayStrip } from "./tado-overlay-strip.js";

function makeEntity(type: string, timestamp?: string) {
  return {
    entity_id: "climate.bedroom",
    state: "heat",
    attributes: {
      temperature: 19,
      HA_TERMINATION_TYPE: type,
      ...(timestamp ? { HA_TERMINATION_TIMESTAMP: timestamp } : {}),
    },
  };
}

async function mountStrip(type: string, timestamp?: string): Promise<TadoOverlayStrip> {
  const el = document.createElement("tado-overlay-strip") as TadoOverlayStrip;
  (el as any).hass = { callService: vi.fn() };
  (el as any).entity = makeEntity(type, timestamp);
  document.body.appendChild(el);
  await (el as any).updateComplete;
  return el;
}

const elements: TadoOverlayStrip[] = [];
afterEach(() => { elements.forEach((e) => e.remove()); elements.length = 0; });

describe("tado-overlay-strip — label rendering", () => {
  it("shows 'Until you resume schedule' for MANUAL override", async () => {
    const el = await mountStrip("MANUAL");
    elements.push(el);
    expect(el.shadowRoot!.textContent).toContain("Until you resume schedule");
  });

  it("shows 'Until next block' for NEXT_TIME_BLOCK override", async () => {
    const el = await mountStrip("NEXT_TIME_BLOCK");
    elements.push(el);
    expect(el.shadowRoot!.textContent).toContain("Until next block");
  });

  it("shows time remaining for a TIMER override", async () => {
    const future = new Date(Date.now() + 90 * 60 * 1000).toISOString(); // 90 minutes from now
    const el = await mountStrip("TIMER", future);
    elements.push(el);
    const text = el.shadowRoot!.textContent ?? "";
    // Should show something like "1h 30m remaining"
    expect(text).toMatch(/remaining/);
  });

  it("renders nothing when no override is active (TADO_MODE)", async () => {
    const el = await mountStrip("TADO_MODE");
    elements.push(el);
    expect(el.shadowRoot!.querySelector(".strip")).toBeNull();
  });
});

describe("tado-overlay-strip — resume button", () => {
  it("resume button calls tado.resume_schedule", async () => {
    const callService = vi.fn();
    const el = document.createElement("tado-overlay-strip") as TadoOverlayStrip;
    (el as any).hass = { callService };
    (el as any).entity = makeEntity("MANUAL");
    document.body.appendChild(el);
    elements.push(el);
    await (el as any).updateComplete;

    (el.shadowRoot!.querySelector(".resume-btn") as HTMLElement).click();

    expect(callService).toHaveBeenCalledWith(
      "tado", "resume_schedule", {}, { entity_id: "climate.bedroom" }
    );
  });
});
