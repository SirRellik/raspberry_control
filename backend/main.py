from __future__ import annotations
from datetime import date
from typing import Any, Dict
import os

import httpx
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

APP_NAME = "SES Control"
APP_VER = "0.1.0"

# ENV – přichází z docker-compose.yml
MQTT_URL = os.getenv("MQTT_URL", "")
MQTT_USER = os.getenv("MQTT_USER", "")
MQTT_PASS = os.getenv("MQTT_PASS", "")
TOPIC_BASE = os.getenv("TOPIC_BASE", "home")
SES_PRICE_URL = os.getenv("SES_PRICE_URL", "https://smartenergyshare.com/api/daily-price-electric-spot?date={date}")

from logic.shelly import boiler_set  # po načtení ENV

app = FastAPI(title=APP_NAME, version=APP_VER)

# CORS – povolíme vše v LAN
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health() -> Dict[str, Any]:
    return {"ok": True, "app": APP_NAME, "version": APP_VER}

# Legacy pro frontend
@app.get("/api/status")
async def status() -> Dict[str, Any]:
    routes = [r.path for r in app.router.routes]
    return {"ok": True, "app": APP_NAME, "version": APP_VER, "routes": routes}

@app.post("/api/override")
async def override(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    out: Dict[str, Any] = {"ok": True}
    if "boiler_on" in payload:
        res = await boiler_set(bool(payload.get("boiler_on")))
        out["boiler_result"] = res
    return out

# Nové i legacy endpointy
@app.post("/api/boiler")
async def api_boiler(payload: Dict[str, Any] = Body(...)):
    on = bool(payload.get("on"))
    return await boiler_set(on)

@app.get("/api/prices/today")
async def prices_today():
    url = SES_PRICE_URL.format(date=date.today().isoformat())
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()

@app.get("/api/prices/{day}")
async def prices_day(day: str):
    url = SES_PRICE_URL.format(date=day)
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()
