import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://192.168.1.207:8001';

const dashboardAPI = {
  getData: () => fetch(`${API_BASE_URL}/api/dashboard/data`).then(r => r.json()),
  getCurrentPower: () => fetch(`${API_BASE_URL}/api/power/current`).then(r => r.json()),
  getPrices: (day) => fetch(`${API_BASE_URL}/api/prices/${day || 'today'}`).then(r => r.json()),
  getYesterdayPrices: () => fetch(`${API_BASE_URL}/api/prices/yesterday`).then(r => r.json())
};

// Komponenta pro pokročilý graf výkonu s historií
const PowerChart = () => {
  const [powerData, setPowerData] = useState([]);
  const [currentValues, setCurrentValues] = useState({grid: 0, pv: 0, consumption: 0});
  const [historyMode, setHistoryMode] = useState('realtime');

  useEffect(() => {
    const fetchPowerData = async () => {
      try {
        const current = await dashboardAPI.getCurrentPower();
        setCurrentValues({
          grid: current.grid || 0,
          pv: current.pv || 0,
          consumption: current.consumption || 0
        });

        if (historyMode === 'realtime') {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit', second: '2-digit'});

          setPowerData(prev => {
            const newData = [...prev, {
              time: timeStr,
              grid: current.grid || 0,
              pv: current.pv || 0,
              consumption: current.consumption || 0,
              timestamp: Date.now()
            }];
            return newData.slice(-60); // Posledních 60 hodnot (5 minut)
          });
        }

      } catch (error) {
        console.error('Power fetch error:', error);
      }
    };

    // Simulace hodinových dat
    const generateHourlyData = () => {
      const data = [];
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = time.getHours();
        
        // Simulace PV profilu
        const pvFactor = hour >= 6 && hour <= 18 ? 
          Math.max(0, -0.3 * Math.pow(hour - 12, 2) + 3.5) / 3.5 : 0;
        const pv = Math.abs(currentValues.pv) * pvFactor * (0.8 + Math.random() * 0.4);
        
        // Simulace spotřeby
        const consumptionFactor = [7,8,18,19,20].includes(hour) ? 1.4 : 
                                 [9,10,11,16,17,21].includes(hour) ? 1.1 : 0.8;
        const consumption = Math.max(0.5, Math.abs(currentValues.consumption) * consumptionFactor * (0.9 + Math.random() * 0.2));
        
        const grid = consumption - pv;
        
        data.push({
          time: time.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'}),
          grid: grid,
          pv: pv,
          consumption: consumption,
          timestamp: time.getTime()
        });
      }
      return data;
    };

    if (historyMode === 'hour') {
      setPowerData(generateHourlyData());
    } else if (historyMode === 'realtime') {
      fetchPowerData();
      const interval = setInterval(fetchPowerData, 5000);
      return () => clearInterval(interval);
    }
  }, [historyMode, currentValues]);

  const maxValue = Math.max(...powerData.map(d => Math.max(Math.abs(d.grid), d.pv, d.consumption)), 1);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Výkon - Historie a Real-time</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setHistoryMode('realtime')}
            className={`px-3 py-1 text-sm rounded ${historyMode === 'realtime' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
          >
            Live (5s)
          </button>
          <button
            onClick={() => setHistoryMode('hour')}
            className={`px-3 py-1 text-sm rounded ${historyMode === 'hour' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
          >
            24h
          </button>
        </div>
      </div>
      
      {/* Aktuální hodnoty */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-400">Síť</div>
          <div className={`text-2xl font-bold ${currentValues.grid < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(currentValues.grid * 1000).toFixed(0)}W
          </div>
          <div className="text-xs text-gray-500">
            {currentValues.grid < 0 ? 'Dodávka' : 'Odběr'}
          </div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-400">PV Výroba</div>
          <div className="text-2xl font-bold text-green-400">
            {(currentValues.pv * 1000).toFixed(0)}W
          </div>
          <div className="text-xs text-gray-500">Fotovoltaika</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-400">Spotřeba</div>
          <div className="text-2xl font-bold text-blue-400">
            {(currentValues.consumption * 1000).toFixed(0)}W
          </div>
          <div className="text-xs text-gray-500">Celková</div>
        </div>
      </div>

      {/* Graf SVG */}
      {powerData.length > 0 && (
        <div className="relative bg-gray-900 rounded p-4">
          <svg width="100%" height="300" viewBox="0 0 600 300" className="w-full">
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => {
              const y = (i + 1) * 50;
              const value = (maxValue * (5 - i) / 5).toFixed(1);
              return (
                <g key={i}>
                  <line x1="40" y1={y} x2="580" y2={y} stroke="#374151" strokeWidth="1" strokeDasharray="2,2"/>
                  <text x="5" y={y + 4} fill="#9CA3AF" fontSize="10">{value}kW</text>
                </g>
              );
            })}
            
            {/* Síť */}
            <polyline
              fill="none"
              stroke={currentValues.grid < 0 ? "#10b981" : "#ef4444"}
              strokeWidth="2"
              points={powerData.map((d, i) => 
                `${40 + (i * 540 / powerData.length)},${250 - ((Math.abs(d.grid) / maxValue) * 200)}`
              ).join(' ')}
            />
            
            {/* PV */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
              points={powerData.map((d, i) => 
                `${40 + (i * 540 / powerData.length)},${250 - ((d.pv / maxValue) * 200)}`
              ).join(' ')}
            />
            
            {/* Spotřeba */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={powerData.map((d, i) => 
                `${40 + (i * 540 / powerData.length)},${250 - ((d.consumption / maxValue) * 200)}`
              ).join(' ')}
            />
            
            {/* Časové popisky */}
            {powerData.map((d, i) => {
              if (i % Math.ceil(powerData.length / 8) === 0) {
                const x = 40 + (i * 540 / powerData.length);
                return (
                  <text key={i} x={x} y="275" fill="#9CA3AF" fontSize="10" textAnchor="middle">
                    {d.time}
                  </text>
                );
              }
              return null;
            })}
          </svg>
          
          {/* Legenda */}
          <div className="flex justify-center gap-6 text-xs mt-4">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-0.5 ${currentValues.grid < 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-300">Síť ({currentValues.grid < 0 ? 'dodávka' : 'odběr'})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500" style={{backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0, #10b981 3px, transparent 3px, transparent 6px)'}}></div>
              <span className="text-gray-300">PV výroba</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-gray-300">Spotřeba</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Pokročilá komponenta pro spot ceny s heat mapou
const PriceChart = ({ data, currentPrice }) => {
  const [showYesterday, setShowYesterday] = useState(false);
  const [yesterdayData, setYesterdayData] = useState([]);
  const [viewMode, setViewMode] = useState('chart');
  
  useEffect(() => {
    const fetchYesterday = async () => {
      try {
        const result = await dashboardAPI.getYesterdayPrices();
        setYesterdayData(result.data || []);
      } catch (error) {
        console.error('Yesterday prices error:', error);
      }
    };
    fetchYesterday();
  }, []);

  const currentHour = new Date().getHours();
  const sourceData = showYesterday ? yesterdayData : data;
  
  const priceData = Array.from({length: 24}, (_, i) => {
    const price = sourceData.find(p => p.hour === i)?.price_eur || 0;
    const hasData = Boolean(sourceData.find(p => p.hour === i));
    
    return {
      hour: i,
      price: price,
      time: `${i.toString().padStart(2, '0')}:00`,
      isCurrent: i === currentHour && !showYesterday,
      hasData: hasData || showYesterday,
      isExpensive: price > 100,
      isCheap: price < 50
    };
  });

  const maxPrice = Math.max(...priceData.map(p => p.price));
  const minPrice = Math.min(...priceData.filter(p => p.hasData).map(p => p.price));

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Spot ceny elektřiny - {showYesterday ? 'včera' : 'dnes'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-2 py-1 text-xs rounded ${viewMode === 'chart' ? 'bg-purple-600' : 'bg-gray-600'} text-white`}
          >
            Graf
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-2 py-1 text-xs rounded ${viewMode === 'heatmap' ? 'bg-purple-600' : 'bg-gray-600'} text-white`}
          >
            Mapa
          </button>
          <button
            onClick={() => setShowYesterday(false)}
            className={`px-3 py-1 text-sm rounded ${!showYesterday ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
          >
            Dnes
          </button>
          <button
            onClick={() => setShowYesterday(true)}
            className={`px-3 py-1 text-sm rounded ${showYesterday ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
          >
            Včera
          </button>
        </div>
      </div>
      
      {/* Statistiky */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-center text-xs">
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Aktuální</div>
          <div className="text-yellow-400 font-bold">{currentPrice.toFixed(1)}</div>
          <div className="text-gray-500">€/MWh</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Maximum</div>
          <div className="text-red-400 font-bold">{maxPrice.toFixed(1)}</div>
          <div className="text-gray-500">€/MWh</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Minimum</div>
          <div className="text-green-400 font-bold">{minPrice.toFixed(1)}</div>
          <div className="text-gray-500">€/MWh</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Průměr</div>
          <div className="text-blue-400 font-bold">
            {(priceData.filter(p => p.hasData).reduce((a, b) => a + b.price, 0) / priceData.filter(p => p.hasData).length).toFixed(1)}
          </div>
          <div className="text-gray-500">€/MWh</div>
        </div>
      </div>

      {viewMode === 'chart' ? (
        // Sloupcový graf
        <div className="h-64 relative bg-gray-900 rounded p-4">
          <svg width="100%" height="100%" viewBox="0 0 600 240">
            {priceData.map((h, index) => {
              const x = 25 + (index * 23);
              const barHeight = h.hasData ? (h.price / maxPrice) * 180 : 0;
              const y = 200 - barHeight;
              
              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width="20"
                    height={barHeight}
                    fill={
                      !h.hasData ? '#374151' :
                      h.isCurrent ? '#fbbf24' : 
                      h.isExpensive ? '#ef4444' : 
                      h.isCheap ? '#10b981' : '#3b82f6'
                    }
                    stroke={h.isCurrent ? '#fff' : 'none'}
                    strokeWidth={h.isCurrent ? 2 : 0}
                  />
                  <text
                    x={x + 10}
                    y="215"
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize="8"
                  >
                    {h.hour}h
                  </text>
                  {h.hasData && (
                    <text
                      x={x + 10}
                      y={y - 5}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="8"
                    >
                      {h.price.toFixed(0)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        // Heat mapa
        <div className="grid grid-cols-12 gap-1 h-64">
          {priceData.map((h, index) => (
            <div key={index} className="relative">
              <div 
                className={`h-full rounded flex items-center justify-center text-white text-xs font-bold relative ${
                  !h.hasData ? 'bg-gray-700' :
                  h.isCurrent ? 'bg-yellow-500' : 
                  h.isExpensive ? 'bg-red-500' : 
                  h.isCheap ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{
                  opacity: h.hasData ? 0.6 + (h.price / maxPrice) * 0.4 : 0.3
                }}
                title={`${h.time}: ${h.price.toFixed(1)} €/MWh`}
              >
                <div className="text-center">
                  <div className="text-xs">{h.hour}h</div>
                  <div className="text-xs font-bold">
                    {h.hasData ? h.price.toFixed(0) : '?'}
                  </div>
                </div>
                {h.isCurrent && (
                  <div className="absolute inset-0 border-2 border-white rounded animate-pulse"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Legenda */}
      <div className="flex justify-center gap-4 text-xs mt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-300">Levné (&lt;50€)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-300">Střední (50-100€)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-300">Drahé (&gt;100€)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-300">Aktuální</span>
        </div>
      </div>
    </div>
  );
};

// Hlavní App komponenta
const App = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardAPI.getData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError('Chyba načítání dat');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Načítání dashboardu...</div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl text-red-500">{error || 'Chyba načítání dat'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">SES Control Dashboard</h1>
            <p className="text-gray-400 text-sm">Real-time monitoring a správa energie</p>
          </div>
          <div className="flex space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm ${
              dashboardData.system.rpc_connected ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {dashboardData.system.rpc_connected ? 'RPC OK' : 'RPC ERROR'}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-blue-600">
              Online: {dashboardData.system.devices_online}/2
            </span>
          </div>
        </div>

        {/* Device Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold mb-1 text-gray-300">Pata domu</h3>
            <div className="text-2xl font-bold text-blue-400">
              {dashboardData.devices.pata_domu.power.toFixed(1)} W
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{dashboardData.devices.pata_domu.status.toUpperCase()}</span>
              <span>{dashboardData.devices.pata_domu.ip}</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold mb-1 text-gray-300">FVE výroba</h3>
            <div className="text-2xl font-bold text-green-400">
              {dashboardData.devices.fve_mereni.power.toFixed(1)} W
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{dashboardData.devices.fve_mereni.status.toUpperCase()}</span>
              <span>{dashboardData.devices.fve_mereni.ip}</span>
            </div>
          </div>

          <div className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
            dashboardData.power.grid < 0 ? 'border-green-500' : 'border-red-500'
          }`}>
            <h3 className="text-sm font-semibold mb-1 text-gray-300">Grid Power</h3>
            <div className={`text-2xl font-bold ${
              dashboardData.power.grid < 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {dashboardData.devices.grid_power.power.toFixed(1)} W
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{dashboardData.devices.grid_power.flow.toUpperCase()}</span>
              <span>Ze sítě/do sítě</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold mb-1 text-gray-300">Spotřeba</h3>
            <div className="text-2xl font-bold text-purple-400">
              {dashboardData.devices.house_consumption.power.toFixed(1)} W
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>VYPOČTENO</span>
              <span>
                {dashboardData.power.consumption > 0 ? 
                  Math.min(100, (dashboardData.power.pv / dashboardData.power.consumption * 100)).toFixed(0) : 0}% FVE
              </span>
            </div>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <PowerChart />
          <PriceChart 
            data={dashboardData.prices.hourly || []} 
            currentPrice={dashboardData.prices.current || 85.0} 
          />
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-white">Energetická bilance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">PV výroba:</span>
                <span className="text-green-400 font-semibold">
                  {(dashboardData.power.pv * 1000).toFixed(0)} W
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Spotřeba domu:</span>
                <span className="text-blue-400 font-semibold">
                  {(dashboardData.power.consumption * 1000).toFixed(0)} W
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tok ze/do sítě:</span>
                <span className={`font-semibold ${dashboardData.power.grid < 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(dashboardData.power.grid * 1000).toFixed(0)} W
                </span>
              </div>
              <hr className="border-gray-600"/>
              <div className="flex justify-between">
                <span className="text-gray-400">Soběstačnost:</span>
                <span className="text-yellow-400 font-semibold">
                  {dashboardData.power.consumption > 0 ? 
                    Math.min(100, (dashboardData.power.pv / dashboardData.power.consumption * 100)).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>
<div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-white">Stav systému</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">RPC komunikace:</span>
                <span className={dashboardData.system.rpc_connected ? 'text-green-400' : 'text-red-400'}>
                  {dashboardData.system.rpc_connected ? 'Aktivní' : 'Neaktivní'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Zařízení online:</span>
                <span className="text-white">{dashboardData.system.devices_online}/2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Poslední update:</span>
                <span className="text-white">
                  {new Date(dashboardData.timestamp * 1000).toLocaleTimeString('cs-CZ')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-white">Dnešní úspory</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Prodáno do sítě:</span>
                <span className="text-green-400 font-semibold">
                  {dashboardData.power.grid < 0 ? 
                    `${(Math.abs(dashboardData.power.grid) * 24 * dashboardData.prices.current / 1000).toFixed(2)} Kč` : 
                    '0 Kč'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ušetřeno spotřebou:</span>
                <span className="text-blue-400 font-semibold">
                  {((dashboardData.power.pv * 24 * dashboardData.prices.current) / 1000).toFixed(2)} Kč
                </span>
              </div>
              <hr className="border-gray-600"/>
              <div className="flex justify-between">
                <span className="text-gray-400">Celková úspora:</span>
                <span className="text-yellow-400 font-semibold">
                  {(((Math.abs(dashboardData.power.grid) + dashboardData.power.pv) * 24 * dashboardData.prices.current) / 1000).toFixed(2)} Kč
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
