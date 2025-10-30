# 🧪 Návod na testování aplikace

## Rychlý start

### 1. Spuštění vývojového serveru

```bash
npm run dev
```

Po spuštění otevři v prohlížeči: **http://localhost:5173**

### 2. Co kontrolovat

#### ✅ V prohlížeči:

1. **Header aplikace** - měl by se zobrazit "SES Control Dashboard"
2. **WebSocket status** - v pravém horním rohu by mělo být:
   - 🟢 "WebSocket Připojeno" (zelené) - pokud backend běží
   - 🔴 "WebSocket Odpojeno" (červené) - pokud backend neběží

3. **Navigační menu** - měly by se zobrazit záložky:
   - Přehled
   - Ovládání
   - Místnosti
   - Log / Telemetrie
   - Zásuvky

4. **Stránka Přehled** - měla by zobrazovat:
   - 3 karty: Grid, Fotovoltaika, TUV
   - Graf výkonu (posledních 24h)
   - Graf cen elektřiny

#### 🔍 V Developer Console (F12):

Otevři konzoli v prohlížeči (F12) a sleduj:

1. **Úspěšné připojení**:
   ```
   Using Backend WebSocket adapter
   WebSocket connected to backend: ws://localhost:8080/ws
   ```

   NEBO (pokud používáš MQTT):
   ```
   Using MQTT WebSocket adapter
   Connecting to MQTT WebSocket: ws://localhost:9001
   MQTT WebSocket connected
   ```

2. **Chybové hlášky** - NEMĚLY by se objevovat:
   - ❌ "Maximum update depth exceeded"
   - ❌ Nekonečné opakování stejných zpráv
   - ❌ Warnings o re-renderování

3. **Data v konzoli**:
   - Měly by se zobrazovat příchozí zprávy z WebSocket/MQTT
   - Log by měl obsahovat aktualizace dat

## 🔧 Testování s backendem

### Pokud máš backend na Raspberry Pi:

1. **Ujisti se, že backend běží** na portu 8080
2. **Nastav správnou URL** v `vite.config.ts` (již nastaveno na localhost:8080)
3. Spusť frontend: `npm run dev`

### Pokud nemáš backend:

Aplikace se stále zobrazí, ale:
- WebSocket status bude "Odpojeno" (červené)
- Data budou zobrazovat defaultní hodnoty (0 nebo mock data)
- To je v pořádku pro testování UI!

## 🎯 Test jednotlivých funkcí

### Test 1: Základní zobrazení
- [ ] Aplikace se načte bez chyb
- [ ] Všechny stránky se zobrazují (Přehled, Ovládání, Místnosti, Log, Zásuvky)
- [ ] Navigace mezi stránkami funguje

### Test 2: WebSocket připojení
- [ ] Status indikátor se zobrazuje
- [ ] Pokud backend běží, status je "Připojeno"
- [ ] V konzoli se zobrazují zprávy o připojení

### Test 3: Zobrazení dat
- [ ] Karty na stránce Přehled zobrazují hodnoty
- [ ] Grafy se renderují (i když s mock daty)
- [ ] Stránka Místnosti zobrazuje seznam místností (pokud jsou data z backendu)
- [ ] Stránka Zásuvky zobrazuje tabulku (pokud jsou data z backendu)

### Test 4: Log / Telemetrie
- [ ] Přejdi na záložku "Log / Telemetrie"
- [ ] Měly by se zobrazovat příchozí MQTT/WebSocket zprávy
- [ ] Každá zpráva má timestamp a topic

### Test 5: Ovládání
- [ ] Všechny ovládací panely se zobrazují (Boiler, EV, RRCR, Kotel, Přítomnost)
- [ ] Formuláře jsou funkční
- [ ] Tlačítka jsou klikatelná

## 🐛 Známé problémy a jejich řešení

### "Maximum update depth exceeded"
✅ **OPRAVENO** - Pokud se tato chyba objeví, oprava nebyla správně aplikována.

### WebSocket se nepřipojuje
- Zkontroluj, že backend běží na portu 8080
- Zkontroluj v konzoli přesnou URL WebSocket připojení
- Zkontroluj, že `.env` má správné nastavení

### Žádná data se nezobrazují
- To je normální, pokud backend neběží
- Aplikace by měla zobrazovat defaultní/mock hodnoty
- Zkontroluj v konzoli, jestli přicházejí data z WebSocket

## 📊 Konfigurace

### Přepnutí mezi Backend WebSocket a MQTT:

Edituj soubor `.env`:

```env
# Pro backend WebSocket (doporučeno):
VITE_USE_MQTT=false

# Pro přímé MQTT připojení:
VITE_USE_MQTT=true
VITE_MQTT_URL=ws://localhost:9001
```

Po změně restartuj dev server (`Ctrl+C` a znovu `npm run dev`).

## ✨ Úspěšný test znamená:

1. ✅ Aplikace se načte bez chyb
2. ✅ Všechny stránky jsou dostupné
3. ✅ Žádné nekonečné smyčky v konzoli
4. ✅ WebSocket status se zobrazuje
5. ✅ Data se zobrazují (i když mock)
6. ✅ Grafy se renderují

---

**Poznámka**: Pokud nemáš spuštěný backend, je normální, že WebSocket bude "Odpojeno" a data budou defaultní. Hlavní je, že aplikace se zobrazí a nepadá! 🎉
