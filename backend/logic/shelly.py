from __future__ import annotations
import logging, os
from typing import Any, Dict, Optional
import httpx

PEER_BOILER = os.getenv("PEER_BOILER", "")
BOILER_RELAY_ID = int(os.getenv("BOILER_RELAY_ID", "1"))

log = logging.getLogger(__name__)

async def _rpc_call(base_url: str, method: str, params: Optional[Dict[str, Any]] = None, timeout: float = 5.0) -> Dict[str, Any]:
    if not base_url:
        raise RuntimeError("Shelly base_url is not configured")
    url = f"{base_url.rstrip('/')}/rpc/{method}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.get(url, params=params or {})
        r.raise_for_status()
        try:
            return r.json()
        except Exception:
            return {"status_code": r.status_code, "text": r.text}

async def boiler_set(on: bool) -> Dict[str, Any]:
    """
    Přepne boiler přes Shelly RPC Switch.Set
    Env: PEER_BOILER (např. http://192.168.1.149), BOILER_RELAY_ID (default 1)
    """
    if not PEER_BOILER:
        raise RuntimeError("PEER_BOILER není nastaven (např. http://192.168.1.149)")
    params = {"id": BOILER_RELAY_ID, "on": "true" if on else "false"}
    log.info("Shelly Switch.Set %s -> %s", PEER_BOILER, params)
    return await _rpc_call(PEER_BOILER, "Switch.Set", params)
