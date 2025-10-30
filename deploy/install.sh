#!/bin/bash

# Instalační skript pro Raspberry Control na Raspberry Pi
# Tento skript nastaví vše potřebné pro běh aplikace

set -e  # Ukončit při chybě

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Konfigurace
PROJECT_DIR="/opt/raspberry_control"
DEPLOY_DIR="$PROJECT_DIR/deploy"
SERVICE_DIR="/etc/systemd/system"
LOG_DIR="/var/log"
MQTT_CONF_DIR="/etc/mosquitto/conf.d"
GITHUB_REPO="https://github.com/SirRellik/raspberry_control.git"
BRANCH="main"

# Funkce pro logování
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Kontrola, zda běží jako root
if [ "$EUID" -ne 0 ]; then
    log_error "Tento skript musí být spuštěn jako root (sudo)"
    exit 1
fi

log_info "=== Instalace Raspberry Control ==="

# 1. Aktualizace systému
log_info "Aktualizace systému..."
apt-get update -qq

# 2. Instalace závislostí
log_info "Instalace systémových závislostí..."
apt-get install -y -qq \
    git \
    nodejs \
    npm \
    mosquitto \
    mosquitto-clients \
    curl \
    nano

# 3. Kontrola/vytvoření projektového adresáře
if [ -d "$PROJECT_DIR" ]; then
    log_warn "Adresář $PROJECT_DIR již existuje"
    read -p "Chcete přepsat existující instalaci? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Zálohuji existující instalaci..."
        mv "$PROJECT_DIR" "${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    else
        log_info "Aktualizuji existující instalaci..."
        cd "$PROJECT_DIR"
        git fetch origin
        git pull origin "$BRANCH"
        npm install
        npm run build
        log_info "Projekt aktualizován"
        SKIP_CLONE=true
    fi
fi

# 4. Klonování repozitáře (pokud je třeba)
if [ "$SKIP_CLONE" != "true" ]; then
    log_info "Klonuji repozitář z GitHubu..."
    git clone "$GITHUB_REPO" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git checkout "$BRANCH"
fi

cd "$PROJECT_DIR"

# 5. Instalace Node.js závislostí
log_info "Instaluji Node.js závislosti..."
npm install

# 6. Build projektu
log_info "Builduji projekt..."
npm run build

# 7. Konfigurace Mosquitto MQTT
log_info "Konfiguruji Mosquitto MQTT broker..."
mkdir -p "$MQTT_CONF_DIR"

if [ -f "$DEPLOY_DIR/mosquitto.conf" ]; then
    cp "$DEPLOY_DIR/mosquitto.conf" "$MQTT_CONF_DIR/raspberry-control.conf"
    log_info "Mosquitto konfigurace nainstalována"
else
    log_warn "Soubor mosquitto.conf nenalezen, používám výchozí konfiguraci"
fi

# Nastavení práv pro mosquitto
mkdir -p /var/log/mosquitto
mkdir -p /var/lib/mosquitto
chown -R mosquitto:mosquitto /var/log/mosquitto
chown -R mosquitto:mosquitto /var/lib/mosquitto

# 8. Instalace systemd služeb
log_info "Instaluji systemd služby..."

# MQTT služba
if [ -f "$DEPLOY_DIR/raspberry-control-mqtt.service" ]; then
    cp "$DEPLOY_DIR/raspberry-control-mqtt.service" "$SERVICE_DIR/"
    log_info "MQTT služba nainstalována"
fi

# Web aplikace služba
if [ -f "$DEPLOY_DIR/raspberry-control.service" ]; then
    cp "$DEPLOY_DIR/raspberry-control.service" "$SERVICE_DIR/"
    log_info "Web aplikace služba nainstalována"
fi

# Auto-updater služba
if [ -f "$DEPLOY_DIR/raspberry-control-updater.service" ]; then
    cp "$DEPLOY_DIR/raspberry-control-updater.service" "$SERVICE_DIR/"
    log_info "Auto-updater služba nainstalována"
fi

# Auto-updater timer
if [ -f "$DEPLOY_DIR/raspberry-control-updater.timer" ]; then
    cp "$DEPLOY_DIR/raspberry-control-updater.timer" "$SERVICE_DIR/"
    log_info "Auto-updater timer nainstalován"
fi

# Nastavení práv pro deployment skript
if [ -f "$DEPLOY_DIR/update-and-deploy.sh" ]; then
    chmod +x "$DEPLOY_DIR/update-and-deploy.sh"
fi

# 9. Vytvoření log souborů
log_info "Vytváření log souborů..."
touch "$LOG_DIR/raspberry-control-deploy.log"
chmod 644 "$LOG_DIR/raspberry-control-deploy.log"

# 10. Reload systemd
log_info "Reload systemd daemon..."
systemctl daemon-reload

# 11. Spuštění služeb
log_info "Spouštím služby..."

# MQTT
systemctl enable raspberry-control-mqtt.service
systemctl start raspberry-control-mqtt.service

# Web aplikace
systemctl enable raspberry-control.service
systemctl start raspberry-control.service

# Auto-updater timer
systemctl enable raspberry-control-updater.timer
systemctl start raspberry-control-updater.timer

# 12. Kontrola stavu služeb
log_info "Kontrola stavu služeb..."
sleep 3

echo ""
log_info "=== Stav služeb ==="
systemctl status raspberry-control-mqtt.service --no-pager -l || true
systemctl status raspberry-control.service --no-pager -l || true
systemctl status raspberry-control-updater.timer --no-pager -l || true

# 13. Zobrazení IP adresy
echo ""
log_info "=== Síťové informace ==="
IP_ADDR=$(hostname -I | awk '{print $1}')
log_info "IP adresa Raspberry Pi: $IP_ADDR"
log_info "Web aplikace: http://$IP_ADDR:3000"
log_info "MQTT WebSocket: ws://$IP_ADDR:9001"
log_info "MQTT Broker: mqtt://$IP_ADDR:1883"

echo ""
log_info "=== Instalace dokončena úspěšně! ==="
log_info "Pro zobrazení logů použijte:"
log_info "  journalctl -u raspberry-control.service -f"
log_info "  journalctl -u raspberry-control-mqtt.service -f"
log_info "  tail -f $LOG_DIR/raspberry-control-deploy.log"

echo ""
log_info "Pro ruční aktualizaci projektu spusťte:"
log_info "  $DEPLOY_DIR/update-and-deploy.sh"

exit 0
