import React, { useMemo } from 'react';
import { DeviceCard } from '../components/DeviceCard';
import { PowerChart } from '../components/PowerChart';
import { PriceChart } from '../components/PriceChart';
import { ApiStatus } from '../types';

interface OverviewProps {
  apiStatus: ApiStatus | null;
  wsData: any;
}

export const Overview: React.FC<OverviewProps> = ({ apiStatus, wsData }) => {
  // Generate mock chart data for demonstration
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(time.getHours() - i);
      
      data.push({
        time: time.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
        pv: Math.max(0, Math.sin((time.getHours() - 6) * Math.PI / 12) * 5 + Math.random() * 2),
        grid: -2 + Math.random() * 4
      });
    }
    
    return data;
  }, []);

  const currentValues = {
    grid_kw: wsData['grid_kw'] || apiStatus?.grid_kw || 0,
    pv_kw: wsData['pv_kw'] || apiStatus?.pv_kw || 0,
    tuv_c: wsData['tuv_c'] || apiStatus?.tuv_c || 0
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
        <PriceChart />
      </div>
    </div>
  );
};