import React, { useState, useEffect } from 'react';

interface OverviewProps {
  apiStatus: any;
  wsData: Record<string, any>;
}

const Card: React.FC<{title: string, value: string, unit: string, status?: string}> = 
  ({title, value, unit, status = 'normal'}) => (
  <div style={{
    backgroundColor: '#1f2937',
    borderRadius: '8px', 
    padding: '20px',
    border: '1px solid #374151',
    color: '#f9fafb'
  }}>
    <h3 style={{margin: '0 0 10px 0', color: '#d1d5db'}}>{title}</h3>
    <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa'}}>
      {value}
      <span style={{fontSize: '1rem', color: '#9ca3af', marginLeft: '0.5rem'}}>
        {unit}
      </span>
    </div>
    {status && status !== 'normal' && (
      <div style={{fontSize: '0.8rem', color: status === 'on' ? '#10b981' : '#6b7280', marginTop: '5px'}}>
        {status === 'on' ? 'ZAPNUTO' : status === 'off' ? 'VYPNUTO' : 'OK'}
      </div>
    )}
  </div>
);

const Overview: React.FC<OverviewProps> = ({ wsData }) => {
  const [spotPrices, setSpotPrices] = useState<any[]>([]);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const response = await fetch('https://smartenergyshare.com/api/daily-price-electric-spot?date=2025-09-23');
        const data = await response.json();
        console.log('Spot prices načteny:', data.length, 'hodin');
        setSpotPrices(data.slice(0, 24));
      } catch (error) {
        console.error('Chyba při načítání spot cen:', error);
      }
    };
    loadPrices();
  }, []);

  // MQTT debug
  console.log('=== MQTT Data Debug ===');
  console.log('Témata:', Object.keys(wsData));
  Object.keys(wsData).forEach(topic => {
    console.log(`Topic: ${topic}`, wsData[topic]);
  });

  // Bezpečná extrakce dat
  const getShelly1Data = () => {
    try {
      const shelly1 = wsData['shellypro1pm-ec6260828c90/status'] || {};
      const switch0 = shelly1.switch0 || {};
      return {
        power: Number(switch0.apower) || 0,
        voltage: Number(switch0.voltage) || 0,
        isOn: Boolean(switch0.output)
      };
    } catch (error) {
      console.error('Chyba při čtení Shelly1 dat:', error);
      return { power: 0, voltage: 0, isOn: false };
    }
  };

  const getShelly2Data = () => {
    try {
      const shelly2 = wsData['shellypro2-2cbcbb9e7908/status'] || {};
      const switch1 = shelly2.switch1 || {};
      return {
        power: Number(switch1.apower) || 0,
        voltage: Number(switch1.voltage) || 0,
        isOn: Boolean(switch1.output)
      };
    } catch (error) {
      console.error('Chyba při čtení Shelly2 dat:', error);
      return { power: 0, voltage: 0, isOn: false };
    }
  };

  const getGridData = () => {
    try {
      const grid = wsData['home/tele/grid'] || {};
      return {
        power: Number(grid.power) || 0,
        voltage: Number(grid.voltage) || 0
      };
    } catch (error) {
      console.error('Chyba při čtení Grid dat:', error);
      return { power: 0, voltage: 0 };
    }
  };

  const shelly1 = getShelly1Data();
  const shelly2 = getShelly2Data();
  const grid = getGridData();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <Card 
          title="Shelly 1PM" 
          value={shelly1.power.toFixed(1)} 
          unit="W" 
          status={shelly1.isOn ? 'on' : 'off'}
        />
        <Card 
          title="Shelly Pro2" 
          value={shelly2.power.toFixed(1)} 
          unit="W" 
          status={shelly2.isOn ? 'on' : 'off'}
        />
        <Card 
          title="Grid Power" 
          value={grid.power.toFixed(1)} 
          unit="W" 
        />
        <Card 
          title="MQTT Topics" 
          value={Object.keys(wsData).length.toString()} 
          unit="témat" 
        />
      </div>

      {spotPrices.length > 0 && (
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #374151',
          color: '#f9fafb'
        }}>
          <h3 style={{margin: '0 0 15px 0'}}>Spot ceny elektřiny - dnes</h3>
          <p style={{marginBottom: '15px'}}>
            Aktuální cena: <strong>{spotPrices[new Date().getHours()]?.price_eur?.toFixed(2) || '--'} €/MWh</strong>
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '5px'
          }}>
            {spotPrices.slice(0, 12).map((price, hour) => (
              <div key={hour} style={{
                padding: '5px',
                backgroundColor: hour === new Date().getHours() ? '#374151' : '#111827',
                borderRadius: '4px',
                border: '1px solid #4b5563',
                fontSize: '11px',
                textAlign: 'center'
              }}>
                <div>{hour.toString().padStart(2, '0')}h</div>
                <div style={{color: '#60a5fa', fontWeight: 'bold'}}>
                  {price.price_eur?.toFixed(1) || '--'}€
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug panel */}
      <div style={{
        marginTop: '20px',
        backgroundColor: '#374151',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#d1d5db'
      }}>
        <strong>Debug:</strong><br/>
        MQTT témata: {Object.keys(wsData).length}<br/>
        Shelly1: {shelly1.power}W {shelly1.isOn ? 'ON' : 'OFF'}<br/>
        Shelly2: {shelly2.power}W {shelly2.isOn ? 'ON' : 'OFF'}<br/>
        Grid: {grid.power}W<br/>
        Spot ceny: {spotPrices.length > 0 ? 'Načteno' : 'Načítání...'}
      </div>
    </div>
  );
};

export default Overview;
