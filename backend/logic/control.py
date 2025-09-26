from __future__ import annotations
import asyncio
import logging

log = logging.getLogger(__name__)

class ControlState:
    """Placeholder třída; nahraď vlastní implementací podle potřeby."""
    pass

async def loop(state: ControlState, bus, stop_evt: asyncio.Event):
    """Hlavní smyčka řízení – zatím jen drží proces naživu."""
    log.info("control.loop started")
    try:
        while not stop_evt.is_set():
            await asyncio.sleep(0.5)
    except Exception as e:
        log.exception("control.loop error: %s", e)

async def aclose():
    """Uklízecí hook – volá se při vypínání."""
    try:
        # sem případně úklid zdrojů
        pass
    except Exception as e:
        log.exception("control.aclose error: %s", e)
