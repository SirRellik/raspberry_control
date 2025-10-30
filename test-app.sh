#!/bin/bash

# Test script pro kontrolu základní funkčnosti aplikace
echo "🧪 Testování aplikace raspberry_control"
echo "========================================"
echo ""

# Kontrola node_modules
echo "1. Kontrola závislostí..."
if [ ! -d "node_modules" ]; then
    echo "   ❌ node_modules neexistuje, instaluji závislosti..."
    npm install
else
    echo "   ✅ node_modules existuje"
fi
echo ""

# Kontrola .env
echo "2. Kontrola konfigurace..."
if [ ! -f ".env" ]; then
    echo "   ⚠️  .env soubor neexistuje, vytvářím z .env.example..."
    cp .env.example .env
    echo "   ✅ .env soubor vytvořen"
else
    echo "   ✅ .env soubor existuje"
fi
echo ""

# Test build
echo "3. Test build procesu..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Build úspěšný - aplikace se kompiluje bez chyb"
else
    echo "   ❌ Build selhal - zkontroluj TypeScript chyby"
    npm run build
    exit 1
fi
echo ""

# Kontrola klíčových souborů
echo "4. Kontrola klíčových souborů..."
files=(
    "src/App.tsx"
    "src/hooks/useDataAdapter.ts"
    "src/adapters/WebSocketAdapter.ts"
    "src/adapters/MqttWsAdapter.ts"
    "src/pages/Overview.tsx"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - CHYBÍ!"
        all_exist=false
    fi
done
echo ""

# Souhrn
echo "========================================"
echo "📊 Souhrn testů:"
echo ""
if [ "$all_exist" = true ]; then
    echo "✅ Všechny testy prošly!"
    echo ""
    echo "🚀 Aplikace je připravena k použití."
    echo ""
    echo "Pro spuštění vývojového serveru zadej:"
    echo "   npm run dev"
    echo ""
    echo "Pro otevření aplikace:"
    echo "   http://localhost:5173"
    echo ""
    echo "Pro podrobný návod na testování viz TESTING.md"
else
    echo "❌ Některé testy selhaly - zkontroluj chybějící soubory"
    exit 1
fi
