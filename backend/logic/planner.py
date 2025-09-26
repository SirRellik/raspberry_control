import httpx, datetime as dt
from settings import TOPIC_BASE, SES_PRICE_URL, LAT, LON
from .mqttbus import MQTTBus

async def fetch_prices_for_tomorrow():
  tmr = dt.date.today() + dt.timedelta(days=1)
  url = f"{SES_PRICE_URL}?date={tmr.isoformat()}"
  async with httpx.AsyncClient(timeout=10.0) as cli:
    r = await cli.get(url); r.raise_for_status()
    body = r.json()
    arr = body.get("prices") or body.get("eur_mwh") or body
    if not isinstance(arr, list) or len(arr) < 24:
      raise ValueError("Nečekaný formát cen z SES API")
    return arr[:24]

async def fetch_weather():
  url = f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&hourly=shortwave_radiation,cloudcover&timezone=Europe%2FPrague"
  async with httpx.AsyncClient(timeout=10.0) as cli:
    r = await cli.get(url); r.raise_for_status()
    b = r.json()
    ghi = b["hourly"].get("shortwave_radiation", [])
    cloud = b["hourly"].get("cloudcover", [])
    return {"ghi": ghi[:48], "cloud": cloud[:48]}

def compute_targets(prices: list[float], wx: dict):
  PRICE_HIGH = 200; CHEAP_PCT = 0.2
  sorted_p = sorted(prices); thr_low = sorted_p[int(len(sorted_p)*CHEAP_PCT)] if prices else 9999
  cheap = [i for i,p in enumerate(prices) if p <= thr_low]
  expensive = [i for i,p in enumerate(prices) if p >= PRICE_HIGH]
  cloud_tmr = wx["cloud"][24:48] if wx["cloud"] else []
  ghi_tmr = wx["ghi"][24:48] if wx["ghi"] else []
  sunny = (sum(cloud_tmr)/max(len(cloud_tmr),1) < 40) or (max(ghi_tmr or [0]) > 300)
  reserve_soc = 35 if sunny else 80
  return {"reserve_soc": reserve_soc, "tuv_target_c": 60, "tuv_deadline": "19:00", "cheap_hours": cheap, "expensive_hours": expensive}

async def publish_plan(bus: MQTTBus, prices, wx, targets):
  day_key = dt.date.today().strftime("%Y%m%d")
  ts = dt.datetime.now().isoformat()
  bus.pub(f"{TOPIC_BASE}/plan/prices/day/{day_key}", {"eur_mwh": prices, "ts": ts}, retain=True)
  bus.pub(f"{TOPIC_BASE}/plan/weather/day/{day_key}", {"ghi": wx["ghi"], "cloud": wx["cloud"], "ts": ts}, retain=True)
  bus.pub(f"{TOPIC_BASE}/plan/targets/day/{day_key}", dict(targets, ts=ts), retain=True)
