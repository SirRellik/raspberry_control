import React, { useMemo } from 'react';
import { DeviceCard } from '../components/DeviceCard';
import { PowerChart } from '../components/PowerChart';
import { PriceChart } from '../components/PriceChart';
import { ApiStatus, ChartDataPoint } from '../types';

interface OverviewProps {
  apiStatus: ApiStatus | null;
  wsData: any;
}

export const Overview: React.FC<OverviewProps> = ({ apiStatus, wsData }) => {
  // Udržuj historii posledních 24 hodin (max 1440 bodů, 1/min)
  const chartData = useMemo((): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    // Generuj mock data pro demonstraci (dokud nemáme historii z backendu)
    for (let i = 1439; i >= 0; i--) {
      const time = new Date(now);
      time.setMinutes(time.getMinutes() - i);
      
      data.push({
        time: time.toLocaleTimeString('cs-CZ', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        pv: Math.max(0, Math.sin((time.getHours() - 6) * Math.PI / 12) * 5 + Math.random() * 1),
        grid: -1 + Math.random() * 3
      });
    }
    
    // TODO: V budoucnu zde implementovat skutečnou historii z wsData
    // Například udržovat buffer posledních hodnot z home/tele/grid a home/tele/inverter
    
    return data;
  }, [wsData]);

  const currentValues = {
    // Prioritně používáme data z WebSocket (MQTT telemetrie)
    grid_kw: wsData['home/tele/grid']?.p_grid || wsData.bootstrap?.grid_kw || apiStatus?.grid_kw || 0,
    pv_kw: wsData['home/tele/inverter']?.p_pv || wsData.bootstrap?.pv_kw || apiStatus?.pv_kw || 0,
    tuv_c: wsData['home/tele/temps']?.t_tuv || wsData.bootstrap?.tuv_c || apiStatus?.tuv_c || 0
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#374151'
      }}>
        Přehled
      </h2>
      
      {/* Current Values Cards */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <DeviceCard
          title="Grid"
          value={currentValues.grid_kw.toFixed(2)}
          unit="kW"
          status={currentValues.grid_kw > 0 ? 'warning' : 'normal'}
        />
        <DeviceCard
          title="Fotovoltaika"
          value={currentValues.pv_kw.toFixed(2)}
          unit="kW"
          status="normal"
        />
        <DeviceCard
          title="TUV"
          value={currentValues.tuv_c.toFixed(1)}
          unit="°C"
          status={currentValues.tuv_c < 50 ? 'warning' : 'normal'}
        />
      </div>
      
      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '24px'
      }}>
        <PowerChart data={chartData} />
        <PriceChart wsData={wsData} />
      </div>
    </div>
  );
};