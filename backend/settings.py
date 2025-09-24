# ===== MQTT / Topics / Ceny / Geo =====
import os
import json

# Kořen topiců – aby fungovalo to, co už používáš (home/tele/...).
TOPIC_BASE: str = os.getenv("TOPIC_BASE", "home")

# MQTT – volitelně, pokud budeš posílat něco na broker
MQTT_URL: str = os.getenv("MQTT_URL", "mqtt://127.0.0.1:1883")
MQTT_USER: str | None = os.getenv("MQTT_USER") or None
MQTT_PASS: str | None = os.getenv("MQTT_PASS") or None

# URL na denní spot ceny – používá main.py
SES_PRICE_URL: str = os.getenv(
    "SES_PRICE_URL",
    "https://smartenergyshare.com/api/daily-price-electric-spot?date={date}",
)

# Geo souřadnice – pokud je logika (např. plánovač) používá
def _to_float(env_name: str, default: float) -> float:
    try:
        return float(os.getenv(env_name, str(default)))
    except Exception:
        return default

LAT: float = _to_float("LAT", 49.5938)   # Olomouc – můžeš kdykoli změnit
LON: float = _to_float("LON", 17.2509)

# Volitelné: mapování zařízení přes env (když jej část kódu používá)
_SHELLY_DEVICES_RAW = os.getenv("SHELLY_DEVICES", "").strip()
SHELLY_DEVICES = {}
if _SHELLY_DEVICES_RAW:
    try:
        SHELLY_DEVICES = json.loads(_SHELLY_DEVICES_RAW)
    except Exception:
        SHELLY_DEVICES = {}

# ===== Added peers & relays (Shelly / zařízení) =====

def _to_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except Exception:
        return default

# URL peerů (HTTP RPC nebo gateway) – čtou se z ENV, jinak None
PEER_RRCR   = os.getenv("PEER_RRCR")    # např. http://192.168.1.149
PEER_BOILER = os.getenv("PEER_BOILER")  # např. http://192.168.1.149
PEER_KOTEL  = os.getenv("PEER_KOTEL")   # např. http://192.168.1.149
PEER_EV     = os.getenv("PEER_EV")      # pokud máš wallbox/EV řídící endpoint

# ID relé (defaulty bezpečné)
RRCR_RELAY_ID   = _to_int("RRCR_RELAY_ID", 0)
BOILER_RELAY_ID = _to_int("BOILER_RELAY_ID", 1)
KOTEL_RELAY0_ID = _to_int("KOTEL_RELAY0_ID", 0)
KOTEL_RELAY1_ID = _to_int("KOTEL_RELAY1_ID", 1)

# Mapy/konfigurace z JSON ENV (nepovinné)
try:
    ROOMS_MAP = json.loads(os.getenv("ROOMS_MAP", "{}") or "{}")
except Exception:
    ROOMS_MAP = {}
