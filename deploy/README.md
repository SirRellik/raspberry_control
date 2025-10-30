# Raspberry Control - Deployment na Raspberry Pi

Tento adresář obsahuje vše potřebné pro nasazení Raspberry Control aplikace na Raspberry Pi.

## Rychlá instalace

```bash
# 1. Přihlaste se na Raspberry Pi přes SSH
ssh pi@raspberrypi.local

# 2. Stáhněte instalační skript
curl -O https://raw.githubusercontent.com/SirRellik/raspberry_control/main/deploy/install.sh

# 3. Spusťte instalaci
sudo bash install.sh
```

Instalační skript automaticky:
- Nainstaluje všechny závislosti (Node.js, npm, Mosquitto MQTT)
- Naklonuje projekt z GitHubu
- Nastaví systemd služby
- Spustí MQTT broker a web aplikaci

## Ruční instalace

### Předpoklady

```bash
sudo apt-get update
sudo apt-get install -y git nodejs npm mosquitto mosquitto-clients
```

### Instalace projektu

```bash
# Klonování repozitáře
sudo git clone https://github.com/SirRellik/raspberry_control.git /opt/raspberry_control
cd /opt/raspberry_control

# Instalace závislostí
sudo npm install

# Build projektu
sudo npm run build
```

### Konfigurace MQTT

```bash
# Kopírování MQTT konfigurace
sudo cp deploy/mosquitto.conf /etc/mosquitto/conf.d/raspberry-control.conf

# Nastavení práv
sudo mkdir -p /var/log/mosquitto
sudo chown -R mosquitto:mosquitto /var/log/mosquitto

# Restart MQTT
sudo systemctl restart mosquitto
```

### Nastavení systemd služeb

```bash
# Kopírování service souborů
sudo cp deploy/raspberry-control-mqtt.service /etc/systemd/system/
sudo cp deploy/raspberry-control.service /etc/systemd/system/
sudo cp deploy/raspberry-control-updater.service /etc/systemd/system/
sudo cp deploy/raspberry-control-updater.timer /etc/systemd/system/

# Nastavení práv pro deployment skript
sudo chmod +x deploy/update-and-deploy.sh

# Reload systemd
sudo systemctl daemon-reload

# Spuštění a povolení služeb
sudo systemctl enable --now raspberry-control-mqtt.service
sudo systemctl enable --now raspberry-control.service
sudo systemctl enable --now raspberry-control-updater.timer
```

## Přehled služeb

### raspberry-control-mqtt.service
Spouští Mosquitto MQTT broker pro komunikaci mezi backendem a frontendem.
- Port 1883: MQTT protokol
- Port 9001: WebSocket pro web frontend

### raspberry-control.service
Spouští web aplikaci (frontend) na portu 3000.

### raspberry-control-updater.service + .timer
Automaticky stahuje nejnovější verzi z GitHubu každých 30 minut a restartuje aplikaci při změnách.

## Správa služeb

```bash
# Zobrazení stavu
sudo systemctl status raspberry-control.service
sudo systemctl status raspberry-control-mqtt.service

# Restart služby
sudo systemctl restart raspberry-control.service

# Zobrazení logů
journalctl -u raspberry-control.service -f
journalctl -u raspberry-control-mqtt.service -f

# Zastavení auto-updatů
sudo systemctl stop raspberry-control-updater.timer
sudo systemctl disable raspberry-control-updater.timer
```

## Manuální aktualizace

```bash
# Spuštění deployment skriptu
sudo /opt/raspberry_control/deploy/update-and-deploy.sh
```

## Konfigurace

### Proměnné prostředí

Pro změnu konfigurace vytvořte soubor `.env` v kořenovém adresáři projektu:

```bash
# MQTT WebSocket URL
VITE_MQTT_URL=ws://192.168.1.100:9001
```

### Změna portů

Pro změnu portů upravte service soubory:

```bash
sudo nano /etc/systemd/system/raspberry-control.service
# Změňte Environment="PORT=3000" na požadovaný port

sudo systemctl daemon-reload
sudo systemctl restart raspberry-control.service
```

## Testování

```bash
# Test MQTT připojení
mosquitto_sub -h localhost -p 1883 -t "#" -v

# Test WebSocket
# Otevřete v prohlížeči: http://IP_RASPBERRY:3000

# Test API
curl http://localhost:8080/api/status
```

## Řešení problémů

### Služba se nespustí

```bash
# Zkontrolujte logy
journalctl -u raspberry-control.service -n 50 --no-pager

# Zkontrolujte, zda je projekt zbuildovaný
ls -la /opt/raspberry_control/dist/
```

### MQTT se nepřipojuje

```bash
# Zkontrolujte, zda běží Mosquitto
sudo systemctl status mosquitto
sudo systemctl status raspberry-control-mqtt.service

# Zkontrolujte porty
sudo netstat -tlnp | grep 1883
sudo netstat -tlnp | grep 9001

# Test připojení
mosquitto_pub -h localhost -p 1883 -t "test" -m "hello"
```

### Aplikace neukazuje data

```bash
# Zkontrolujte, zda běží backend API (měl by běžet na portu 8080)
curl http://localhost:8080/api/status

# Zkontrolujte MQTT témata
mosquitto_sub -h localhost -p 1883 -t "home/#" -v
```

## Bezpečnost

Pro produkční použití doporučujeme:

1. Nastavit autentizaci pro MQTT broker
2. Použít SSL/TLS certifikáty
3. Nastavit firewall pravidla
4. Změnit výchozí heslo uživatele `pi`

## Struktura souborů

```
deploy/
├── install.sh                          # Instalační skript
├── update-and-deploy.sh                # Skript pro aktualizaci z GitHubu
├── mosquitto.conf                      # MQTT broker konfigurace
├── raspberry-control.service           # Systemd služba pro web aplikaci
├── raspberry-control-mqtt.service      # Systemd služba pro MQTT
├── raspberry-control-updater.service   # Systemd služba pro auto-update
├── raspberry-control-updater.timer     # Timer pro auto-update
└── README.md                           # Tato dokumentace
```

## Síťové porty

- **3000**: Web frontend (Vite preview)
- **8080**: Backend API (musí běžet samostatně)
- **1883**: MQTT broker
- **9001**: MQTT WebSocket

## Podpora

Pro problémy a dotazy vytvořte issue na GitHubu:
https://github.com/SirRellik/raspberry_control/issues
