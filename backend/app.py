from __future__ import annotations
from datetime import date
import httpx
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

from settings import SES_PRICE_URL
from logic.shelly import boiler_set

app = FastAPI(title="SES Control", version="0.1")

# CORS – aby frontend na :3000 mohl volat backend na :8080
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/api/boiler")
async def api_boiler(payload: dict = Body(...)):
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
async def prices_by_day(day: date):
    url = SES_PRICE_URL.format(date=day.isoformat())
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()
