import datetime as dt, pytest, respx
from httpx import Response
from backend.logic import planner

@pytest.mark.asyncio
async def test_fetch_prices_ok():
  tmr = (dt.date.today()+dt.timedelta(days=1)).isoformat()
  respx.get(f"https://smartenergyshare.com/api/daily-price-electric-spot?date={tmr}") \
       .mock(return_value=Response(200, json={"prices": list(range(24))}))
  out = await planner.fetch_prices_for_tomorrow()
  assert len(out)==24

@pytest.mark.asyncio
async def test_fetch_weather_ok():
  respx.get("https://api.open-meteo.com/v1/forecast").mock(
    return_value=Response(200, json={"hourly":{"shortwave_radiation":[100]*60,"cloudcover":[50]*60}})
  )
  wx = await planner.fetch_weather()
  assert len(wx["ghi"])==48 and len(wx["cloud"])==48

def test_compute_targets():
  prices = [100]*24
  wx = {"ghi":[0]*24+[400]*24, "cloud":[0]*48}
  t = planner.compute_targets(prices, wx)
  assert t["tuv_target_c"]==60 and "cheap_hours" in t
