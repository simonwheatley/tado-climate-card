"""Fake Tado integration for development testing."""
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

DOMAIN = "fake_tado"

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True
