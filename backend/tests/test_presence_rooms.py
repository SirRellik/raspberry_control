import asyncio, time, pytest
from backend.logic import control
from backend.settings import ROOMS_MAP

class DummyBus: 
  def __init__(self): self.out=[]
  def pub(self, t, o, retain=False): self.out.append((t,o,retain))

@pytest.mark.asyncio
async def test_room_target_and_pump(monkeypatch):
  ROOMS_MAP.clear(); ROOMS_MAP.update({"obyvak":{"trv_device_id":"trv-001"}})
  st = control.ControlState()
  st.presence = {"mode":"home","wifi_users":["richard"],"geo_home":True}
  st.update_from_mqtt("home/tele/room/obyvak/temp", {"t": 19.0})
  st.rooms["obyvak"]["target"] = 21.0
  monkeypatch.setattr(control, "trv_set_occupied_setpoint", lambda *a,**k: None)
  bus = DummyBus(); stop = asyncio.Event()
  task = asyncio.create_task(control.loop(st, bus, stop))
  await asyncio.sleep(0.2); stop.set(); await asyncio.sleep(0.05)
  assert any(k=="home/cmd/pump/rad" for k,_,__ in bus.out)
