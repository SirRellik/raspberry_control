import httpx, os
IH_HOST  = os.getenv("IH_HOST","http://192.168.10.50").rstrip("/")
IH_TOKEN = os.getenv("IH_TOKEN","")
HEAD = {"Authorization": f"Bearer {IH_TOKEN}"} if IH_TOKEN else {}

async def ih_get(path, params=None, timeout=5.0):
  async with httpx.AsyncClient(timeout=timeout) as cli:
    r = await cli.get(f"{IH_HOST}{path}", headers=HEAD, params=params); r.raise_for_status()
    return r.json()

async def ih_post(path, data=None, timeout=5.0):
  async with httpx.AsyncClient(timeout=timeout) as cli:
    r = await cli.post(f"{IH_HOST}{path}", headers=HEAD, json=data or {}); r.raise_for_status()
    return r.json() if r.text else {}

async def trv_set_occupied_setpoint(device_id: str, temp_c: float):
  payload = {"target": device_id, "capability": "occupied_heating_setpoint", "value": round(float(temp_c), 1)}
  return await ih_post("/open-api/device/thing/capability/set", payload)

async def trv_read_state(device_id: str):
  return await ih_get("/open-api/device/thing/status", params={"target": device_id})
