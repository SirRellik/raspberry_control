#!/bin/bash

# Deployment skript pro Raspberry Control
# Tento skript automaticky stáhne nejnovější verzi z GitHubu a deployuje projekt

set -e  # Ukončit při chybě

PROJECT_DIR="/opt/raspberry_control"
LOG_FILE="/var/log/raspberry-control-deploy.log"
BRANCH="main"

# Funkce pro logování
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Začátek deployment procesu ==="

# Kontrola, zda adresář existuje
if [ ! -d "$PROJECT_DIR" ]; then
    log "CHYBA: Adresář $PROJECT_DIR neexistuje!"
    exit 1
fi

# Přejít do projektového adresáře
cd "$PROJECT_DIR"

# Uložit aktuální branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Aktuální branch: $CURRENT_BRANCH"

# Stáhnout nejnovější změny
log "Stahuji nejnovější změny z GitHubu..."
git fetch origin

# Zkontrolovat, zda jsou dostupné změny
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Projekt je již aktuální, žádné změny k nasazení."
    exit 0
fi

log "Nalezeny nové změny, pokračuji v deployment..."

# Stáhnout a sloučit změny
log "Provádím git pull..."
git pull origin "$CURRENT_BRANCH"

# Nainstalovat závislosti
log "Instaluji npm závislosti..."
npm install --production=false

# Buildnout projekt
log "Builduji projekt..."
npm run build

# Vyčistit staré logy (uchovávat pouze posledních 30 dní)
find /var/log -name "raspberry-control-*.log" -type f -mtime +30 -delete 2>/dev/null || true

log "=== Deployment dokončen úspěšně ==="

# Pokud běží systemd služba, restartovat ji
if systemctl is-active --quiet raspberry-control.service; then
    log "Restartuji raspberry-control službu..."
    systemctl restart raspberry-control.service
    log "Služba restartována"
fi

exit 0
