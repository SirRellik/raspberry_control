#!/bin/bash
# 🚀 Raspberry Control Dashboard - Upgrade na v2.0
# Copy & Paste skript pro přímou aplikaci změn
# Zachovává původní soubory, pouze je vylepšuje

echo "🏠 Raspberry Control Dashboard - Upgrade v2.0"
echo "=============================================="
echo "✨ Snížení aktualizací na 5s, vylepšený layout"
echo ""

# Automatická detekce projektového adresáře
PROJECT_DIRS=(
    "/var/www/html"
    "/usr/share/nginx/html" 
    "/home/pi/raspberry_control"
    "/opt/raspberry_control"
    "$(pwd)"
)

PROJECT_DIR=""
for dir in "${PROJECT_DIRS[@]}"; do
    if [[ -d "$dir" ]] && [[ -f "$dir/index.html" || $(find "$dir" -name "*.html" 2>/dev/null | head -1) ]]; then
        PROJECT_DIR="$dir"
        echo "✅ Nalezen projekt: $PROJECT_DIR"
        break
    fi
done

if [[ -z "$PROJECT_DIR" ]]; then
    echo "❌ Projekt nenalezen automaticky!"
    echo "📁 Zadejte cestu k vašemu projektu:"
    read -p "Cesta: " PROJECT_DIR
    if [[ ! -d "$PROJECT_DIR" ]]; then
        echo "❌ Adresář neexistuje: $PROJECT_DIR"
        exit 1
    fi
fi

# Backup
BACKUP_DIR="$PROJECT_DIR/backup_upgrade_$(date +%Y%m%d_%H%M%S)"
echo "💾 Vytvářím backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r "$PROJECT_DIR"/* "$BACKUP_DIR/" 2>/dev/null
echo "✅ Backup vytvořen"

# Najít soubory
HTML_FILE=$(find "$PROJECT_DIR" -maxdepth 2 -name "*.html" | head -1)
JS_FILE=$(find "$PROJECT_DIR" -maxdepth 2 -name "*.js" | grep -v node_modules | head -1)
CSS_FILE=$(find "$PROJECT_DIR" -maxdepth 2 -name "*.css" | head -1)

echo ""
echo "📁 Nalezené soubory:"
echo "   HTML: ${HTML_FILE:-'nenalezen'}"
echo "   JS:   ${JS_FILE:-'nenalezen'}"  
echo "   CSS:  ${CSS_FILE:-'nenalezen'}"
echo ""

# ========================================
# 1. UPGRADE CSS - přidání na konec
# ========================================
if [[ -n "$CSS_FILE" ]]; then
    echo "🎨 Upgraduji CSS..."
    cat >> "$CSS_FILE" << 'CSSEOF'

/* === RASPBERRY CONTROL V2.0 UPGRADE === */
/* Energetické boxy vedle sebe */
.energy-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

/* Spotové ceny v samostatných boxech */
.prices-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.price-box {
    background-color: #16213e;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    border-top: 3px solid;
}

.price-box.aktualni { border-top-color: #4ecdc4; }
.price-box.maximum { border-top-color: #ff6b6b; }
.price-box.minimum { border-top-color: #96ceb4; }
.price-box.prumer { border-top-color: #feca57; }

.price-box h4 {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #888;
    text-transform: uppercase;
}

.price-value {
    font-size: 1.4rem;
    font-weight: bold;
    margin: 5px 0;
}

.price-box.aktualni .price-value { color: #4ecdc4; }
.price-box.maximum .price-value { color: #ff6b6b; }
.price-box.minimum .price-value { color: #96ceb4; }
.price-box.prumer .price-value { color: #feca57; }

.price-unit {
    font-size: 0.8rem;
    color: #888;
}

/* Responzivní design */
@media (max-width: 768px) {
    .energy-section {
        grid-template-columns: 1fr;
    }
    .prices-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .prices-grid {
        grid-template-columns: 1fr;
    }
}
/* === KONEC V2.0 UPGRADE === */
CSSEOF
    echo "✅ CSS upgrade dokončen"
else
    echo "⚠️  CSS soubor nenalezen - vytvářím nový"
    CSS_FILE="$PROJECT_DIR/dashboard-v2.css"
    cat > "$CSS_FILE" << 'NEWCSS'
/* Raspberry Control v2.0 CSS */
.energy-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.prices-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.price-box {
    background-color: #16213e;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    border-top: 3px solid;
}

.price-box.aktualni { border-top-color: #4ecdc4; }
.price-box.maximum { border-top-color: #ff6b6b; }
.price-box.minimum { border-top-color: #96ceb4; }
.price-box.prumer { border-top-color: #feca57; }

.price-box h4 {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #888;
    text-transform: uppercase;
}

.price-value {
    font-size: 1.4rem;
    font-weight: bold;
    margin: 5px 0;
}

.price-box.aktualni .price-value { color: #4ecdc4; }
.price-box.maximum .price-value { color: #ff6b6b; }
.price-box.minimum .price-value { color: #96ceb4; }
.price-box.prumer .price-value { color: #feca57; }

.price-unit {
    font-size: 0.8rem;
    color: #888;
}

@media (max-width: 768px) {
    .energy-section {
        grid-template-columns: 1fr;
    }
    .prices-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .prices-grid {
        grid-template-columns: 1fr;
    }
}
NEWCSS
    echo "✅ Nový CSS soubor vytvořen: $CSS_FILE"
fi

# ========================================
# 2. UPGRADE JAVASCRIPT - změna intervalu
# ========================================
if [[ -n "$JS_FILE" ]]; then
    echo "📜 Upgraduji JavaScript..."
    
    # Backup JS
    cp "$JS_FILE" "$JS_FILE.backup"
    
    # Změna intervalu z 1000ms na 5000ms
    sed -i 's/setInterval([^,]*,[ ]*1000)/setInterval(\1, 5000)/g' "$JS_FILE"
    sed -i 's/UPDATE_INTERVAL[ ]*=[ ]*1000/UPDATE_INTERVAL = 5000/g' "$JS_FILE"
    sed -i 's/interval:[ ]*1000/interval: 5000/g' "$JS_FILE"
    sed -i 's/setTimeout([^,]*,[ ]*1000)/setTimeout(\1, 5000)/g' "$JS_FILE"
    
    # Přidání vylepšené funkce pro spotové ceny
    cat >> "$JS_FILE" << 'JSEOF'

// === RASPBERRY CONTROL V2.0 UPGRADE ===
// Vylepšená funkce pro načítání spotových cen
function updateSpotPricesV2() {
    fetch('/api/spot-prices')
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Aktualizace jednotlivých hodnot
                const aktualni = document.getElementById('aktualniCena');
                const maximum = document.getElementById('maximumCena');
                const minimum = document.getElementById('minimumCena');
                const prumer = document.getElementById('prumerCena');
                
                if (aktualni) aktualni.textContent = data.current || data.aktualni || '85.0';
                if (maximum) maximum.textContent = data.maximum || data.max || '0.0';
                if (minimum) minimum.textContent = data.minimum !== 'Infinity' ? data.minimum || data.min || 'N/A' : 'N/A';
                if (prumer) prumer.textContent = data.average !== 'NaN' ? data.average || data.avg || 'N/A' : 'N/A';
            }
        })
        .catch(error => {
            console.warn('Chyba při načítání spotových cen:', error);
            // Zobrazit chybové hodnoty
            const elements = ['aktualniCena', 'maximumCena', 'minimumCena', 'prumerCena'];
            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = 'Chyba';
            });
        });
}

// Automatické nahrazení původní funkce (pokud existuje)
if (typeof updateSpotPrices !== 'undefined') {
    console.log('✅ Nahrazuji původní updateSpotPrices funkcí v2.0');
    updateSpotPrices = updateSpotPricesV2;
}

console.log('✅ Dashboard upgrade v2.0 načten - interval: 5 sekund');
// === KONEC V2.0 UPGRADE ===
JSEOF
    echo "✅ JavaScript upgrade dokončen"
else
    echo "⚠️  JavaScript soubor nenalezen - vytvářím nový"
    JS_FILE="$PROJECT_DIR/dashboard-v2.js"
    cat > "$JS_FILE" << 'NEWJS'
// Raspberry Control Dashboard v2.0
const UPDATE_INTERVAL = 5000; // 5 sekund

function updateData() {
    updateEnergyData();
    updateSpotPricesV2();
    updateLastUpdate();
}

function updateSpotPricesV2() {
    fetch('/api/spot-prices')
        .then(response => response.json())
        .then(data => {
            if (data) {
                const aktualni = document.getElementById('aktualniCena');
                const maximum = document.getElementById('maximumCena');
                const minimum = document.getElementById('minimumCena');
                const prumer = document.getElementById('prumerCena');
                
                if (aktualni) aktualni.textContent = data.current || '85.0';
                if (maximum) maximum.textContent = data.maximum || '0.0';
                if (minimum) minimum.textContent = data.minimum !== 'Infinity' ? data.minimum : 'N/A';
                if (prumer) prumer.textContent = data.average !== 'NaN' ? data.average : 'N/A';
            }
        })
        .catch(error => console.warn('Chyba při načítání spotových cen:', error));
}

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('cs-CZ');
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = timeString;
    }
}

// Spuštění po načtení stránky
document.addEventListener('DOMContentLoaded', function() {
    updateData();
    setInterval(updateData, UPDATE_INTERVAL);
    console.log('✅ Dashboard v2.0 spuštěn s intervalem 5 sekund');
});
NEWJS
    echo "✅ Nový JavaScript soubor vytvořen: $JS_FILE"
fi

# ========================================
# 3. HTML INSTRUKCE (nechceme přepsat)
# ========================================
echo ""
echo "📄 HTML ÚPRAVY - MANUÁLNÍ KROKY:"
echo "=================================="
echo ""
echo "Pro dokončení upgradu upravte váš HTML soubor:"
echo "📝 Soubor: $HTML_FILE"
echo ""
echo "🔧 KROK 1: Zabalte energetické sekce"
echo "   Najděte sekce s 'Pata domu', 'FVE výroba', 'Grid Power', 'Spotřeba'"
echo "   Zabalte je do: <section class=\"energy-section\">...</section>"
echo ""
echo "🔧 KROK 2: Rozdělte spotové ceny do boxů"
echo "   Nahraďte současnou sekci spotových cen touto strukturou:"
echo ""
cat << 'HTMLEOF'
<section class="prices-section">
    <h2>Spot ceny elektřiny - dnes</h2>
    <div class="prices-grid">
        <div class="price-box aktualni">
            <h4>Aktuální</h4>
            <div class="price-value" id="aktualniCena">85.0</div>
            <div class="price-unit">€/MWh</div>
        </div>
        <div class="price-box maximum">
            <h4>Maximum</h4>
            <div class="price-value" id="maximumCena">0.0</div>
            <div class="price-unit">€/MWh</div>
        </div>
        <div class="price-box minimum">
            <h4>Minimum</h4>
            <div class="price-value" id="minimumCena">Infinity</div>
            <div class="price-unit">€/MWh</div>
        </div>
        <div class="price-box prumer">
            <h4>Průměr</h4>
            <div class="price-value" id="prumerCena">NaN</div>
            <div class="price-unit">€/MWh</div>
        </div>
    </div>
</section>
HTMLEOF
echo ""
echo "🔧 KROK 3: Připojte nové CSS (pokud bylo vytvořeno)"
if [[ "$CSS_FILE" == *"dashboard-v2.css" ]]; then
    echo "   Přidejte do <head> sekce HTML:"
    echo "   <link rel=\"stylesheet\" href=\"dashboard-v2.css\">"
fi
echo ""
echo "🔧 KROK 4: Připojte nový JS (pokud byl vytvořen)"
if [[ "$JS_FILE" == *"dashboard-v2.js" ]]; then
    echo "   Přidejte před </body>:"
    echo "   <script src=\"dashboard-v2.js\"></script>"
fi

# ========================================
# 4. RESTART SLUŽEB
# ========================================
echo ""
echo "🔄 RESTART SLUŽEB"
echo "=================="

# Detekce a restart webového serveru
if systemctl is-active --quiet nginx; then
    echo "🔄 Restartuji Nginx..."
    sudo systemctl restart nginx
    echo "✅ Nginx restartován"
elif systemctl is-active --quiet apache2; then
    echo "🔄 Restartuji Apache..."
    sudo systemctl restart apache2  
    echo "✅ Apache restartován"
else
    echo "⚠️  Webový server nenalezen - restartujte ručně"
fi

# Restart Python backend (pokud existuje)
if systemctl list-units --full -all | grep -Fq "raspberry-control.service"; then
    echo "🔄 Restartuji Python backend..."
    sudo systemctl restart raspberry-control
    echo "✅ Backend restartován"
fi

# ========================================
# 5. VÝSLEDKY A OVĚŘENÍ
# ========================================
echo ""
echo "🎉 UPGRADE DOKONČEN!"
echo "===================="
echo ""
echo "📊 Aplikované změny:"
echo "   ✅ CSS: Grid layout a spotové ceny ($([[ -f "$CSS_FILE" ]] && echo "✓" || echo "⚠"))"
echo "   ✅ JS: 5s interval a vylepšení ($([[ -f "$JS_FILE" ]] && echo "✓" || echo "⚠"))"
echo "   ⚠️  HTML: Manuální úpravy potřebné"
echo ""
echo "📁 Backup uložen: $BACKUP_DIR"
echo "🌐 Dashboard: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "🔍 OVĚŘENÍ:"
echo "   1. Otevřete dashboard v prohlížeči"
echo "   2. Stiskněte F12 → Console"
echo "   3. Hledejte: '✅ Dashboard v2.0' nebo '5 sekund'"
echo "   4. Energetické boxy by měly být vedle sebe (desktop)"
echo ""
echo "🛠️  Pro editaci HTML:"
echo "   sudo nano $HTML_FILE"
echo ""
echo "🔙 Pro obnovení (v případě problémů):"
echo "   cp -r $BACKUP_DIR/* $PROJECT_DIR/"
echo ""
echo "✨ Úspěšný upgrade na v2.0! Méně requestů, lepší layout! 🚀"