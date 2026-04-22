"""RED-GREEN test for tado.resume_schedule entity service.

Tests that async_resume_schedule() calls coordinator.reset_zone_overlay(zone_id)
and coordinator.async_request_refresh() — in isolation from a running HA instance.
"""
import sys
import os
import types
import importlib.util
import pytest
from unittest.mock import AsyncMock, MagicMock

# ── Path setup ────────────────────────────────────────────────────────────────

CONFIG_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "config")
)
if CONFIG_DIR not in sys.path:
    sys.path.insert(0, CONFIG_DIR)


# ── Mock objects (must be created before stubs reference them) ────────────────

_hvac_mode = MagicMock()
for _m in ("OFF", "AUTO", "HEAT", "HEAT_COOL", "COOL", "DRY", "FAN_ONLY"):
    setattr(_hvac_mode, _m, _m.lower())

_hvac_action = MagicMock()
for _a in ("HEATING", "COOLING", "IDLE", "OFF", "DRYING", "FAN"):
    setattr(_hvac_action, _a, _a.lower())

_feature = MagicMock()
_feature.TARGET_TEMPERATURE = 1
_feature.PRESET_MODE = 2
_feature.FAN_MODE = 4
_feature.SWING_MODE = 8
_feature.TURN_OFF = 16
_feature.TURN_ON = 32
_feature.__or__ = lambda s, o: s
_feature.__ror__ = lambda s, o: s


# ── Stub factory ──────────────────────────────────────────────────────────────

def _stub(name: str, **attrs):
    mod = sys.modules.get(name)
    if mod is None:
        mod = types.ModuleType(name)
    for k, v in attrs.items():
        setattr(mod, k, v)
    sys.modules[name] = mod
    parts = name.split(".")
    for i in range(1, len(parts)):
        parent = ".".join(parts[:i])
        if parent not in sys.modules:
            sys.modules[parent] = types.ModuleType(parent)
    return mod


# ── homeassistant stubs ───────────────────────────────────────────────────────

_stub("homeassistant")
_stub("homeassistant.core", HomeAssistant=MagicMock(), callback=lambda f: f)
class _ClimateEntity:
    pass

class _TadoZoneEntity:
    pass

_stub("homeassistant.components")
_stub("homeassistant.components.climate",
      ClimateEntity=_ClimateEntity,
      ClimateEntityFeature=_feature,
      HVACAction=_hvac_action,
      HVACMode=_hvac_mode,
      FAN_AUTO="auto",
      PRESET_AWAY="away",
      PRESET_HOME="home",
      SWING_BOTH="both",
      SWING_HORIZONTAL="horizontal",
      SWING_OFF="off",
      SWING_ON="on",
      SWING_VERTICAL="vertical")
_stub("homeassistant.components.climate.const",
      ClimateEntityFeature=_feature,
      HVACAction=_hvac_action,
      HVACMode=_hvac_mode)
_stub("homeassistant.config_entries", ConfigEntry=object)
_stub("homeassistant.const",
      ATTR_TEMPERATURE="temperature",
      PRECISION_TENTHS=0.1,
      UnitOfTemperature=MagicMock(),
      ATTR_NAME="name",
      CONF_USERNAME="username",
      CONF_PASSWORD="password",
      Platform=MagicMock(),
      __version__="2026.4.0")
_stub("homeassistant.exceptions",
      ConfigEntryAuthFailed=Exception,
      ConfigEntryError=Exception)
_stub("homeassistant.helpers")
_stub("homeassistant.helpers.entity_platform",
      async_get_current_platform=MagicMock(),
      EntityPlatform=MagicMock(),
      AddConfigEntryEntitiesCallback=MagicMock())
_stub("homeassistant.helpers.entity", DeviceInfo=dict, Entity=object)
_stub("homeassistant.helpers.device_registry", DeviceInfo=dict)
_stub("homeassistant.helpers.update_coordinator",
      CoordinatorEntity=object,
      DataUpdateCoordinator=object)
_stub("homeassistant.helpers.event", async_track_time_interval=MagicMock())
_stub("homeassistant.helpers.typing",
      ConfigType=MagicMock(),
      VolDictType=dict)
_cv = _stub("homeassistant.helpers.config_validation",
            string=MagicMock(),
            positive_time_period=MagicMock(),
            positive_timedelta=MagicMock(),
            time_period=MagicMock(),
            vol=MagicMock())
setattr(sys.modules["homeassistant.helpers"], "config_validation", _cv)
setattr(sys.modules["homeassistant.helpers"], "entity_platform",
        sys.modules["homeassistant.helpers.entity_platform"])
_stub("homeassistant.util")
_stub("homeassistant.util.unit_conversion", TemperatureConverter=MagicMock())

# ── PyTado stubs ──────────────────────────────────────────────────────────────

_stub("PyTado")
_stub("PyTado.exceptions",
      TadoException=Exception,
      TadoWrongCredentialsException=Exception,
      TadoNotSupportedException=Exception)
_stub("PyTado.interface", Tado=MagicMock())
_stub("PyTado.interface.api", TadoZone=MagicMock())

# ── tado sub-module stubs (climate.py relative imports) ───────────────────────

_stub("custom_components")
_stub("custom_components.tado")
_stub("custom_components.tado.const",
      CONST_EXCLUSIVE_OVERLAY_GROUP="exclusive",
      CONST_FAN_AUTO="AUTO",
      CONST_FAN_OFF="OFF",
      CONST_MODE_AUTO="AUTO",
      CONST_MODE_COOL="COOL",
      CONST_MODE_HEAT="HEAT",
      CONST_MODE_OFF="OFF",
      CONST_MODE_SMART_SCHEDULE="SMART_SCHEDULE",
      CONST_OVERLAY_MANUAL="MANUAL",
      CONST_OVERLAY_TADO_OPTIONS=["MANUAL", "NEXT_TIME_BLOCK", "TADO_DEFAULT"],
      DOMAIN="tado",
      HA_TERMINATION_DURATION="HA_TERMINATION_DURATION",
      HA_TERMINATION_TYPE="HA_TERMINATION_TYPE",
      HA_TO_TADO_FAN_MODE_MAP={},
      HA_TO_TADO_FAN_MODE_MAP_LEGACY={},
      HA_TO_TADO_HVAC_MODE_MAP={},
      ORDERED_KNOWN_TADO_MODES=[],
      PRESET_AUTO="auto",
      SUPPORT_PRESET_AUTO=MagicMock(),
      SUPPORT_PRESET_MANUAL=MagicMock(),
      TADO_DEFAULT_MAX_TEMP=25,
      TADO_DEFAULT_MIN_TEMP=5,
      TADO_FANLEVEL_SETTING="fanLevel",
      TADO_FANSPEED_SETTING="fanSpeed",
      TADO_HORIZONTAL_SWING_SETTING="horizontalSwing",
      TADO_HVAC_ACTION_TO_HA_HVAC_ACTION={},
      TADO_MODES_WITH_NO_TEMP_SETTING=[],
      TADO_SWING_OFF="OFF",
      TADO_SWING_ON="ON",
      TADO_SWING_SETTING="swing",
      TADO_TO_HA_FAN_MODE_MAP={},
      TADO_TO_HA_FAN_MODE_MAP_LEGACY={},
      TADO_TO_HA_HVAC_MODE_MAP={},
      TADO_TO_HA_OFFSET_MAP={},
      TADO_TO_HA_SWING_MODE_MAP={},
      TADO_VERTICAL_SWING_SETTING="verticalSwing",
      TEMP_OFFSET="temperatureOffset",
      SERVICE_CLIMATE_TIMER="set_climate_timer",
      SERVICE_TEMP_OFFSET="set_climate_temperature_offset",
      CLIMATE_TIMER_SCHEMA=MagicMock(),
      CLIMATE_TEMP_OFFSET_SCHEMA=MagicMock(),
      TYPE_HEATING="HEATING",
      TYPE_AIR_CONDITIONING="AIR_CONDITIONING")
_stub("custom_components.tado.coordinator",
      TadoDataUpdateCoordinator=object,
      TadoConfigEntry=object)
_stub("custom_components.tado.entity", TadoZoneEntity=_TadoZoneEntity)
_stub("custom_components.tado.helper",
      decide_overlay_mode=MagicMock(),
      decide_duration=MagicMock(),
      generate_supported_fanmodes=MagicMock())

# ── Load climate.py directly (bypasses package __init__) ─────────────────────

CLIMATE_PY = os.path.abspath(
    os.path.join(os.path.dirname(__file__),
                 "..", "config", "custom_components", "tado", "climate.py")
)
_spec = importlib.util.spec_from_file_location(
    "custom_components.tado.climate",
    CLIMATE_PY,
    submodule_search_locations=[],
)
_climate_mod = importlib.util.module_from_spec(_spec)
_climate_mod.__package__ = "custom_components.tado"
sys.modules["custom_components.tado.climate"] = _climate_mod
_spec.loader.exec_module(_climate_mod)  # type: ignore[union-attr]

TadoClimate = _climate_mod.TadoClimate


# ── Helper ────────────────────────────────────────────────────────────────────

def build_entity(zone_id: int = 1):
    coordinator = MagicMock()
    coordinator.home_id = 42
    coordinator.async_request_refresh = AsyncMock()
    coordinator.reset_zone_overlay = AsyncMock()

    entity = TadoClimate.__new__(TadoClimate)
    entity._tado = coordinator
    entity.zone_id = zone_id
    entity.coordinator = coordinator
    return entity, coordinator


# ── Tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_resume_schedule_resets_overlay():
    """async_resume_schedule must call coordinator.reset_zone_overlay(zone_id)."""
    entity, coordinator = build_entity(zone_id=3)

    await entity.async_resume_schedule()

    coordinator.reset_zone_overlay.assert_awaited_once_with(3)


@pytest.mark.asyncio
async def test_resume_schedule_triggers_refresh():
    """async_resume_schedule must request a coordinator data refresh."""
    entity, coordinator = build_entity(zone_id=3)

    await entity.async_resume_schedule()

    coordinator.async_request_refresh.assert_awaited_once()
