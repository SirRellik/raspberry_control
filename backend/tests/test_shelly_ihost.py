import pytest, respx
from httpx import Response
from backend.logic import shelly, ihost

@pytest.mark.asyncio
async def test_rrcr_set():
  respx.get("http://192.168.10.23/rpc/Script.Eval").mock(return_value=Response(200, json={}))
  await shelly.rrcr_set("http://192.168.10.23", 2)

@pytest.mark.asyncio
async def test_ihost_trv_set():
  respx.post("http://192.168.10.50/open-api/device/thing/capability/set").mock(return_value=Response(200, json={}))
  await ihost.trv_set_occupied_setpoint("trv-001", 21.5)
