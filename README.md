# Raspberry Control

Web aplikace pro monitorování a řízení domácího energetického systému pomocí Raspberry Pi.

## Funkce

- 📊 Monitorování spotřeby elektřiny v reálném čase
- 🔌 Ovládání zásuvek a spotřebičů
- 💰 Zobrazení spot cen elektřiny
- 📈 Grafy spotřeby a výroby energie
- 🌡️ Monitoring teploty v místnostech
- 🔄 Real-time data přes MQTT WebSocket
- 📱 Responsivní design pro mobily a tablety

## Technologie

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Komunikace**: MQTT over WebSocket
- **Grafy**: Recharts
- **Ikony**: Lucide React
- **Backend**: REST API + MQTT broker (Mosquitto)

## Lokální vývoj

### Předpoklady

- Node.js 18+ a npm
- MQTT broker (Mosquitto) běžící lokálně nebo na Raspberry Pi

### Instalace

```bash
# Klonování repozitáře
git clone https://github.com/SirRellik/raspberry_control.git
cd raspberry_control

# Instalace závislostí
npm install

# Kopírování konfigurace
cp .env.example .env

# Úprava .env souboru (nastavení MQTT URL)
nano .env
```

### Spuštění

```bash
# Development server s hot reload
npm run dev

# Build pro produkci
npm run build

# Preview produkčního buildu
npm run preview
```

Aplikace poběží na `http://localhost:5173` (dev) nebo `http://localhost:4173` (preview).

## Nasazení na Raspberry Pi

Kompletní dokumentace pro nasazení je v adresáři [deploy/](./deploy/README.md).

### Rychlá instalace

```bash
# Přihlaste se na Raspberry Pi
ssh pi@raspberrypi.local

# Stáhněte a spusťte instalační skript
curl -O https://raw.githubusercontent.com/SirRellik/raspberry_control/main/deploy/install.sh
sudo bash install.sh
```

Instalační skript automaticky:
- Nainstaluje všechny závislosti
- Naklonuje projekt z GitHubu
- Nastaví systemd služby pro automatický start
- Nakonfiguruje MQTT broker
- Nastaví automatické aktualizace z GitHubu

Po instalaci bude aplikace dostupná na `http://IP_RASPBERRY:3000`

### Systemd služby

Po instalaci budou spuštěny následující služby:

- `raspberry-control.service` - Web aplikace (port 3000)
- `raspberry-control-mqtt.service` - MQTT broker (port 1883, 9001)
- `raspberry-control-updater.timer` - Automatická aktualizace každých 30 minut

```bash
# Zobrazení stavu služeb
sudo systemctl status raspberry-control.service
sudo systemctl status raspberry-control-mqtt.service

# Zobrazení logů
journalctl -u raspberry-control.service -f
```

## Konfigurace

### Proměnné prostředí

Vytvořte soubor `.env` v kořenovém adresáři:

```bash
# MQTT WebSocket URL
VITE_MQTT_URL=ws://192.168.1.100:9001

# Prostředí
VITE_ENV=development
```

### API Backend

Backend API musí běžet na portu 8080 a poskytovat následující endpointy:

- `GET /api/status` - Stav systému
- `POST /api/override` - Ruční override spotřebičů
- `GET /api/spot-prices?date=YYYY-MM-DD` - Spot ceny elektřiny

### MQTT Topics

Aplikace očekává následující MQTT témata:

```
home/tele/grid          # Data ze sítě
home/tele/inverter      # Data z měniče
home/tele/temps         # Teploty
home/tele/loads         # Zatížení spotřebičů
home/plan/prices/day/+  # Ceny elektřiny
home/status/+           # Stav zařízení
home/tele/room/+/temp   # Teploty místností
```

## Struktura projektu

```
raspberry_control/
├── src/
│   ├── adapters/           # Data adaptéry (MQTT, WebSocket)
│   ├── components/         # React komponenty
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Stránky aplikace
│   ├── services/           # API služby
│   ├── types/              # TypeScript typy
│   ├── App.tsx             # Hlavní komponenta
│   └── main.tsx            # Entry point
├── deploy/                 # Deployment skripty a služby
│   ├── install.sh          # Instalační skript
│   ├── update-and-deploy.sh # Auto-update skript
│   └── *.service           # Systemd služby
├── public/                 # Statické soubory
├── .env.example            # Příklad konfigurace
└── vite.config.ts          # Vite konfigurace
```

## Vývoj

### Použité adaptéry

Aplikace podporuje dva typy data adaptérů:

1. **MqttWsAdapter** - Připojení přes MQTT WebSocket (produkce)
2. **WebSocketAdapter** - Fallback WebSocket adapter

Přepínání mezi adaptéry v `src/hooks/useDataAdapter.ts`

### Přidání nové komponenty

```bash
# Vytvořte nový soubor v src/components/
touch src/components/NewComponent.tsx
```

### Linting

```bash
npm run lint
```

## Řešení problémů

### MQTT se nepřipojuje

1. Zkontrolujte, zda běží Mosquitto: `sudo systemctl status mosquitto`
2. Ověřte URL v `.env` souboru
3. Zkontrolujte firewall: `sudo ufw allow 9001`

### API nefunguje

1. Zkontrolujte, zda běží backend na portu 8080
2. Zkontrolujte proxy nastavení v `vite.config.ts`
3. V produkci ověřte, že frontend je buildnutý: `npm run build`

### Služba se nespustí na Raspberry Pi

```bash
# Zobrazit detailní logy
journalctl -u raspberry-control.service -n 100 --no-pager

# Zkontrolovat, zda je projekt zbuildovaný
ls -la /opt/raspberry_control/dist/

# Manuální rebuild
cd /opt/raspberry_control
sudo npm install
sudo npm run build
```

## Bezpečnost

Pro produkční nasazení:

1. Nastavte autentizaci pro MQTT broker
2. Použijte HTTPS/WSS s SSL certifikáty
3. Nastavte firewall (ufw)
4. Změňte výchozí hesla
5. Omezte přístup k API

## Přispívání

1. Forkněte repozitář
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commitněte změny (`git commit -m 'Add some AmazingFeature'`)
4. Pushněte do branch (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

## Licence

MIT License - viz [LICENSE](LICENSE) soubor pro detaily.

## Autor

SirRellik - [GitHub](https://github.com/SirRellik)

## Podpora

Pro problémy a návrhy vytvořte [issue](https://github.com/SirRellik/raspberry_control/issues).
