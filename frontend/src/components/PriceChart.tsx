import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PriceChartProps {
  data: Array<{hour: number, price_eur: number}>;
  currentPrice: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, currentPrice }) => {
  const [priceData, setPriceData] = useState([]);
  const [showYesterday, setShowYesterday] = useState(false);
  const [yesterdayData, setYesterdayData] = useState([]);
  
  useEffect(() => {
    const fetchYesterday = async () => {
      try {
        const response = await fetch('http://192.168.1.207:8001/api/prices/yesterday');
        const result = await response.json();
        setYesterdayData(result.data || []);
      } catch (error) {
        console.error('Yesterday prices fetch error:', error);
      }
    };
    
    fetchYesterday();
  }, []);
  
  useEffect(() => {
    const currentHour = new Date().getHours();
    const sourceData = showYesterday ? yesterdayData : data;
    
    const hours = Array.from({length: 24}, (_, i) => {
      const price = sourceData.find(p => p.hour === i)?.price_eur || 0;
      const hasData = Boolean(sourceData.find(p => p.hour === i));
      
      return {
        hour: i,
        price: price,
        time: `${i.toString().padStart(2, '0')}h`,
        isCurrent: i === currentHour && !showYesterday,
        hasData: hasData,
        isExpensive: price > 100,
        isCheap: price < 60
      };
    });
    
    setPriceData(hours);
  }, [data, yesterdayData, showYesterday]);

  return (
    <div style={{
      border: '1px solid #4a5568',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#2d3748',
      height: '400px'
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#e2e8f0'
        }}>
          Spot ceny elektřiny - {showYesterday ? 'včera' : 'dnes'}
        </h3>
        <div style={{display: 'flex', gap: '8px'}}>
          <button
            onClick={() => setShowYesterday(false)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: !showYesterday ? '#3b82f6' : '#4a5568',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Dnes
          </button>
          <button
            onClick={() => setShowYesterday(true)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: showYesterday ? '#3b82f6' : '#4a5568',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Včera
          </button>
        </div>
      </div>
      
      <div style={{marginBottom: '16px', fontSize: '14px', color: '#a0aec0'}}>
        {!showYesterday && (
          <>
            Aktuální cena: <span style={{color: '#f6e05e', fontWeight: 'bold'}}>
              {currentPrice.toFixed(2)} €/MWh
            </span>
          </>
        )}
        <span style={{marginLeft: showYesterday ? '0' : '20px', fontSize: '12px'}}>
          {showYesterday ? 'Kompletní data za včerejší den' : 'Data pouze do aktuální hodiny'}
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height="82%">
        <BarChart data={priceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            interval={1}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            label={{ value: '€/MWh', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number, name, props) => [
              props.payload.hasData ? `${value.toFixed(2)} €/MWh` : 'Bez dat', 
              'Cena'
            ]}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151'
            }}
          />
          <Bar dataKey="price" radius={[2, 2, 0, 0]}>
            {priceData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={
                  !entry.hasData ? '#374151' :
                  entry.isCurrent ? '#fbbf24' : 
                  entry.isExpensive ? '#ef4444' : 
                  entry.isCheap ? '#10b981' : '#6366f1'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
