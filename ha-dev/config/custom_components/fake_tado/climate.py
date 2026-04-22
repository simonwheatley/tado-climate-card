"""Fake Tado climate entities for development."""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Any

from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

DOMAIN = "fake_tado"

# Three zones representing different override states
FAKE_ZONES = [
    {
        "name": "Bedroom",
        "unique_id": "fake_tado_bedroom",
        "current_temp": 21.3,
        "target_temp": 19.5,
        "hvac_action": HVACAction.HEATING,
        # No override — following schedule
        "termination_type": None,
        "termination_timestamp": None,
        "default_overlay_type": "TADO_MODE",
    },
    {
        "name": "Living Room",
        "unique_id": "fake_tado_living_room",
        "current_temp": 19.8,
        "target_temp": 22.0,
        "hvac_action": HVACAction.HEATING,
        # Timer override — expires in ~2 hours
        "termination_type": "TIMER",
        "termination_timestamp": (
            datetime.now(timezone.utc) + timedelta(hours=2)
        ).isoformat(),
        "default_overlay_type": "TADO_MODE",
    },
    {
        "name": "Kitchen",
        "unique_id": "fake_tado_kitchen",
        "current_temp": 18.1,
        "target_temp": 20.0,
        "hvac_action": HVACAction.IDLE,
        # Override until next schedule block
        "termination_type": "NEXT_TIME_BLOCK",
        "termination_timestamp": None,
        "default_overlay_type": "TADO_MODE",
    },
]


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    async_add_entities(
        [FakeTadoClimate(zone) for zone in FAKE_ZONES],
        update_before_add=True,
    )


class FakeTadoClimate(ClimateEntity):
    """A fake Tado climate entity with overlay attributes."""

    _attr_hvac_modes = [HVACMode.HEAT, HVACMode.OFF]
    _attr_supported_features = (
        ClimateEntityFeature.TARGET_TEMPERATURE
        | ClimateEntityFeature.PRESET_MODE
    )
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_preset_modes = ["home", "away", "auto"]
    _attr_preset_mode = "home"
    _attr_min_temp = 5.0
    _attr_max_temp = 25.0
    _attr_target_temperature_step = 0.5
    _attr_hvac_mode = HVACMode.HEAT

    def __init__(self, zone: dict) -> None:
        self._zone = zone
        self._attr_name = zone["name"]
        self._attr_unique_id = zone["unique_id"]
        self._attr_current_temperature = zone["current_temp"]
        self._attr_target_temperature = zone["target_temp"]
        self._attr_hvac_action = zone["hvac_action"]
        self._termination_type = zone["termination_type"]
        self._termination_timestamp = zone["termination_timestamp"]
        self._default_overlay_type = zone["default_overlay_type"]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        attrs: dict[str, Any] = {
            "HA_DEFAULT_OVERLAY_TYPE": self._default_overlay_type,
        }
        if self._termination_type:
            attrs["HA_TERMINATION_TYPE"] = self._termination_type
        if self._termination_timestamp:
            attrs["HA_TERMINATION_TIMESTAMP"] = self._termination_timestamp
        return attrs

    async def async_set_temperature(self, **kwargs: Any) -> None:
        if temp := kwargs.get("temperature"):
            self._attr_target_temperature = temp
            self.async_write_ha_state()

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        self._attr_hvac_mode = hvac_mode
        if hvac_mode == HVACMode.OFF:
            self._attr_hvac_action = HVACAction.OFF
        else:
            self._attr_hvac_action = self._zone["hvac_action"]
        self.async_write_ha_state()

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        self._attr_preset_mode = preset_mode
        self.async_write_ha_state()
