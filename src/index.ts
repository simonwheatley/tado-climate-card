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
  documentationURL: "https://github.com/your-repo/tado-climate-card",
});
