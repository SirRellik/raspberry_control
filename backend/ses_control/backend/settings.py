# settings.py (doplnit na vhodné místo)
import os, json
from typing import Dict, Any

SHELLY_USER: str | None = os.getenv("SHELLY_USER") or None
SHELLY_PASS: str | None = os.getenv("SHELLY_PASS") or None

# Preferované: JSON slovník jméno -> {url, id}
# Příklad:
# SHELLY_DEVICES='{"rrcr":{"url":"http://192.168.1.149","id":0}, "bojler":{"url":"http://192.168.1.150","id":1}}'
_SHELLY_DEVICES_RAW = os.getenv("SHELLY_DEVICES", "").strip()
SHELLY_DEVICES: Dict[str, Dict[str, Any]] = {}
if _SHELLY_DEVICES_RAW:
    try:
        SHELLY_DEVICES = json.loads(_SHELLY_DEVICES_RAW)
    except Exception:
        SHELLY_DEVICES = {}

# Fallback pro 1 zařízení (když nechceš JSON):
SHELLY_DEFAULT_URL: str | None = os.getenv("SHELLY_URL") or None
SHELLY_DEFAULT_ID: int = int(os.getenv("SHELLY_ID", "0"))

if SHELLY_DEFAULT_URL and "default" not in SHELLY_DEVICES:
    SHELLY_DEVICES["default"] = {"url": SHELLY_DEFAULT_URL, "id": SHELLY_DEFAULT_ID}
