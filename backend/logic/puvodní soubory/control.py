import asyncio, time
from datetime import datetime
from settings import (TOPIC_BASE, GRID_LIMIT_KW, PEER_RRCR, PEER_BOILER, PEER_EV, PEER_KOTEL,
                        HOME_TYPE, EVENING_COMFORT_H, DAY_BASE_TEMP, EVENING_TEMP,
                        COTTAGE_WEEKDAY_TEMP, COTTAGE_WEEKEND_DAY_TEMP, COTTAGE_WEEKEND_EVENING_TEMP,
                        PUMP_MIN_HOLD_S, ROOMS_MAP)
from .shelly import rrcr_set, rrcr_bump, boiler_set, ev_set_mode, ev_force_off, kotel_stage
from .ihost import trv_set_occupied_setpoint

class ControlState:
  def __init__(self):
    self.p_grid = 0.0; self.p_pv = 0.0; self.t_tuv = None
    self.plan = {"tuv_target_c":60, "tuv_deadline":"19:00", "cheap_hours":[], "expensive_hours":[], "reserve_soc":35}
    self.last_action = 0; self.min_hold_s = 600
    self.rooms = {}    # {room:{t,last_motion_ts,window_open,target}}
    self.presence = {"mode":"auto","wifi_users":[],"geo_home":False,"home":True}
    self.last_pump_change = 0; self.pump_on = False

  def update_from_mqtt(self, topic, payload):
    if topic.endswith("/tele/grid"):      self.p_grid = float(payload.get("p_grid",0))
    elif topic.endswith("/tele/inverter"): self.p_pv = float(payload.get("p_pv",0))
    elif topic.endswith("/tele/temps"):    self.t_tuv = float(payload.get("t_tuv", self.t_tuv or 0))
    elif "/plan/targets/" in topic:        self.plan.update(payload)
    elif "/tele/room/" in topic:
      parts = topic.split("/"); room = parts[3]
      r = self.rooms.setdefault(room, {"t":None,"last_motion_ts":0,"window_open":False,"target":None})
      if topic.endswith("/motion") and payload.get("active"): r["last_motion_ts"] = time.time()
      elif topic.endswith("/temp") and "t" in payload:        r["t"] = float(payload["t"])
      elif topic.endswith("/contact") and "open" in payload:  r["window_open"] = bool(payload["open"])
    elif topic.endswith("/presence/wifi"): self.presence["wifi_users"] = payload.get("users",[])
    elif topic.endswith("/presence/geo"):  self.presence["geo_home"] = bool(payload.get("home",False))

  def is_home(self, _now): 
    m = self.presence.get("mode","auto")
    if m=="home": return True
    if m in ("away","vacation"): return False
    return bool(self.presence.get("geo_home") or self.presence.get("wifi_users"))

  def room_occupied(self, room, now_ts, hold_min=20):
    r = self.rooms.get(room, {})
    return (now_ts - r.get("last_motion_ts",0)) <= hold_min*60

  def window_open(self, room): return bool(self.rooms.get(room,{}).get("window_open",False))

def desired_temp_for(HOME_TYPE, home, h, dow):
  if HOME_TYPE == "house":
    return DAY_BASE_TEMP if not home else (EVENING_TEMP if h >= EVENING_COMFORT_H else DAY_BASE_TEMP)
  else:
    if dow in (4,5,6): return COTTAGE_WEEKEND_EVENING_TEMP if h >= 17 else COTTAGE_WEEKEND_DAY_TEMP
    return COTTAGE_WEEKDAY_TEMP

async def loop(state: ControlState, bus, stop_evt: asyncio.Event):
  if PEER_EV:
    try:
# await ev_set_mode(PEER_EV, "pv-only", state.plan.get("cheap_hours"))
    except Exception as e:
      bus.pub(f"{TOPIC_BASE}/intent/error", {"msg": f"EV set_mode failed: {e}"})
  if PEER_RRCR:
    try:
# await rrcr_set(PEER_RRCR, 0)
    except Exception as e:
      bus.pub(f"{TOPIC_BASE}/intent/error", {"msg": f"RRCR set failed: {e}"})
  while not stop_evt.is_set():
    now = time.time(); dt = datetime.now(); h, dow = dt.hour, dt.weekday()
    home = state.is_home(now)

    # TRV per room
    for room, meta in ROOMS_MAP.items():
      base = desired_temp_for(HOME_TYPE, home, h, dow)
      if state.window_open(room): target = max(15.0, base-3.0); reason="window"
      else:
        occ = state.room_occupied(room, now, hold_min=state.plan.get("motion_hold_min",20))
        target = base + (1.0 if occ else 0.0); reason=("occupied" if occ else ("home" if home else "away"))
      prev = state.rooms.setdefault(room,{}).get("target")
      if (prev is None) or (abs(prev-target)>=0.5):
        state.rooms[room]["target"]=target
        bus.pub(f"{TOPIC_BASE}/intent/hvac/{room}", {"target": round(target,1), "reason":reason, "ts":time.time()})
        dev = meta.get("trv_device_id")
        if dev:
          try: await trv_set_occupied_setpoint(dev, target)
          except Exception as e: bus.pub(f"{TOPIC_BASE}/intent/error", {"msg": f"TRV set failed {room}: {e}"})

    # Pumpa radiátorů + discharge AKU (šetřit, když nikdo není doma)
    need_heat = any(((state.rooms.get(r,{}).get("target",0)) - (state.rooms.get(r,{}).get("t") or 99)) > 0.3 for r in ROOMS_MAP.keys())
    should_on = home and need_heat
    if (should_on != state.pump_on) and (now - state.last_pump_change > PUMP_MIN_HOLD_S):
      state.pump_on = should_on; state.last_pump_change = now
      bus.pub(f"{TOPIC_BASE}/cmd/pump/rad", {"on": should_on})
      bus.pub(f"{TOPIC_BASE}/cmd/tank/discharge", {"enable": should_on})

    # Bezpečnost a drahé hodiny
    if state.p_grid > GRID_LIMIT_KW*0.95 and (now-state.last_action)>state.min_hold_s:
      await ev_force_off(PEER_EV, 30); await kotel_stage(PEER_KOTEL, 0); await rrcr_bump(PEER_RRCR)
      state.last_action = now; bus.pub(f"{TOPIC_BASE}/intent/rrcr", {"level":"bump","reason":"grid_limit","ts":time.time()})
    if h in state.plan.get("expensive_hours",[]) and (now-state.last_action)>state.min_hold_s:
      await ev_force_off(PEER_EV, 60); await kotel_stage(PEER_KOTEL, 0)
      state.last_action = now; bus.pub(f"{TOPIC_BASE}/intent/ev", {"enable":False,"reason":"expensive","ts":time.time()})

    await asyncio.sleep(5)
