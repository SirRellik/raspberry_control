import React, { useState, useEffect } from 'react';

function App() {
  const [mqttData, setMqttData] = useState<Record<string, any>>({});
  const [spotPrices, setSpotPrices] = useState<any[]>([]);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  // Načti spot ceny přes tvůj backend místo přímého volání
  useEffect(() => {
    const loadSpotPrices = async () => {
      try {
        // Zkus nejdříve tvůj backend
        const response = await fetch('http://192.168.1.207:8080/api/prices/today');
        if (response.ok) {
          const data = await response.json();
          console.log('Spot prices from backend:', data);
          setSpotPrices(data.data || []);
          setApiConnected(true);
        } else {
          throw new Error('Backend nedostupný');
        }
      } catch (error) {
        console.error('Spot prices error:', error);
        setApiConnected(false);
        // Fallback mock data
        const mockPrices = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          price_eur: 80 + Math.sin(hour * 0.3) * 20 + Math.random() * 10
        }));
        setSpotPrices(mockPrices);
      }
    };
    loadSpotPrices();
  }, []);

  // Simulace MQTT dat (zatím bez připojení)
  useEffect(() => {
    // Mock MQTT data pro test zobrazení
    const mockData = {
      'shellypro1pm-ec6260828c90/status': { switch0: { apower: 1250, voltage: 230, output: true }},
      'shellypro2-2cbcbb9e7908/status': { switch1: { apower: 850, voltage: 240, output: false }},
      'home/tele/grid': { power: 1200, voltage: 230 }
    };
    
    setTimeout(() => {
      setMqttData(mockData);
      setMqttConnected(true);
      console.log('Mock MQTT data loaded');
    }, 2000);
  }, []);

  const shelly1 = mqttData['shellypro1pm-ec6260828c90/status']?.switch0 || {};
  const shelly2 = mqttData['shellypro2-2cbcbb9e7908/status']?.switch1 || {};
  const grid = mqttData['home/tele/grid'] || {};

  const Card = ({ title, value, unit, status }: any) => (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid #374151',
      color: '#f9fafb'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#d1d5db' }}>{title}</h3>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>
        {value} <span style={{ fontSize: '1rem', color: '#9ca3af' }}>{unit}</span>
      </div>
      {status && (
        <div style={{ fontSize: '0.8rem', color: status === 'on' ? '#10b981' : '#6b7280', marginTop: '5px' }}>
          {status === 'on' ? 'ZAPNUTO' : 'VYPNUTO'}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#f9fafb' }}>
      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#1f2937', 
        borderBottom: '1px solid #374151',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>SES Control Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            backgroundColor: apiConnected ? '#059669' : '#dc2626',
            color: 'white',
            fontSize: '12px'
          }}>
            API: {apiConnected ? 'OK' : 'CHYBA'}
          </div>
          <div style={{ 
            padding: '4px 12px', 
            borderRadius: '20px', 
            backgroundColor: mqttConnected ? '#059669' : '#dc2626',
            color: 'white',
            fontSize: '12px'
          }}>
            MQTT: {mqttConnected ? 'OK' : 'CHYBA'}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <Card 
            title="Shelly 1PM" 
            value={(shelly1.apower || 0).toFixed(1)} 
            unit="W" 
            status={shelly1.output ? 'on' : 'off'}
          />
          <Card 
            title="Shelly Pro2" 
            value={(shelly2.apower || 0).toFixed(1)} 
            unit="W" 
            status={shelly2.output ? 'on' : 'off'}
          />
          <Card 
            title="Grid Power" 
            value={(grid.power || 0).toFixed(1)} 
            unit="W" 
          />
          <Card 
            title="MQTT Topics" 
            value={Object.keys(mqttData).length} 
            unit="témat" 
          />
        </div>

        {spotPrices.length > 0 && (
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #374151'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Spot ceny elektřiny - dnes</h3>
            <p style={{ marginBottom: '15px' }}>
              Aktuální cena: <strong>{spotPrices[new Date().getHours()]?.price_eur?.toFixed(2)} €/MWh</strong>
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
                  <div style={{ color: '#60a5fa', fontWeight: 'bold' }}>
                    {price.price_eur?.toFixed(1)}€
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
